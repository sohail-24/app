import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { companies, users, type User } from "@db/schema";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { findCompanyBySlug } from "./queries/companies";
import {
  findUserByEmail,
  findUserById,
  findUserByMobileNumber,
  updateLastSignIn,
  updateUserRefreshTokenHash,
} from "./queries/users";
import { env } from "./lib/env";
import { hashSecret, verifySecret } from "./auth/password";
import { normalizeIndianMobileNumber } from "./auth/mobile";
import { otpProvider } from "./auth/otp-provider";
import {
  createOtpVerification,
  generateOtpCode,
  verifyOtpCode,
} from "./auth/otp-store";
import {
  authenticateRequest,
  clearSessionCookies,
  issueSessionCookies,
} from "./auth/session";

const businessTypeSchema = z.enum(["buyer", "supplier", "both"]);

const mobileNumberSchema = z
  .string()
  .min(10)
  .transform((value, ctx) => {
    try {
      return normalizeIndianMobileNumber(value);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message:
          error instanceof Error ? error.message : "Invalid mobile number.",
      });
      return z.NEVER;
    }
  });

function publicUser(user: User) {
  const {
    passwordHash: _passwordHash,
    refreshTokenHash: _refreshTokenHash,
    ...safeUser
  } = user;
  return safeUser;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "business"
  );
}

async function createCompany(input: {
  name: string;
  type: "buyer" | "supplier" | "both";
  email?: string;
  phone?: string;
}) {
  const baseSlug = slugify(input.name);
  let slug = baseSlug;
  let attempt = 1;

  while (await findCompanyBySlug(slug)) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const result = await getDb()
    .insert(companies)
    .values({
      name: input.name,
      slug,
      type: input.type,
      email: input.email,
      phone: input.phone,
      isVerified: false,
      isActive: true,
    })
    .$returningId();

  return result[0].id;
}

async function createUser(input: {
  unionId: string;
  authProvider: "local" | "mobile";
  name: string;
  mobileNumber: string;
  email?: string;
  password?: string;
  companyId?: number;
  mobileVerified?: boolean;
}) {
  const email = input.email?.toLowerCase();
  const role =
    email && email === env.ownerEmail.toLowerCase() ? "admin" : "user";

  const result = await getDb()
    .insert(users)
    .values({
      unionId: input.unionId,
      authProvider: input.authProvider,
      name: input.name,
      email,
      passwordHash: input.password
        ? await hashSecret(input.password)
        : undefined,
      role,
      companyId: input.companyId,
      phone: input.mobileNumber,
      mobileVerifiedAt: input.mobileVerified ? new Date() : undefined,
      emailVerifiedAt: email ? new Date() : undefined,
      isActive: true,
      lastSignInAt: new Date(),
    })
    .$returningId();

  const user = await findUserById(result[0].id);
  if (!user) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create user",
    });
  }

  return user;
}

async function signInUser(
  user: User,
  requestHeaders: Headers,
  responseHeaders: Headers,
) {
  await updateLastSignIn(user.id);
  await issueSessionCookies(user, requestHeaders, responseHeaders);

  const refreshed = await findUserById(user.id);
  return publicUser(refreshed ?? user);
}

export const authRouter = createRouter({
  me: publicQuery.query((opts) =>
    opts.ctx.user ? publicUser(opts.ctx.user) : null,
  ),

  register: publicQuery
    .input(
      z.object({
        businessName: z.string().trim().min(2),
        ownerName: z.string().trim().min(2),
        mobileNumber: mobileNumberSchema,
        email: z
          .string()
          .trim()
          .email()
          .transform((value) => value.toLowerCase())
          .optional()
          .or(z.literal("").transform(() => undefined)),
        password: z.string().min(5),
        businessType: businessTypeSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingMobile = await findUserByMobileNumber(input.mobileNumber);
      if (existingMobile) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this mobile number already exists.",
        });
      }

      if (input.email && (await findUserByEmail(input.email))) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists.",
        });
      }

      const companyId = await createCompany({
        name: input.businessName,
        type: input.businessType,
        email: input.email,
        phone: input.mobileNumber,
      });

      const user = await createUser({
        unionId: `local:${input.email ?? input.mobileNumber}`,
        authProvider: "local",
        name: input.ownerName,
        mobileNumber: input.mobileNumber,
        email: input.email,
        password: input.password,
        companyId,
        mobileVerified: false,
      });

      return {
        user: await signInUser(user, ctx.req.headers, ctx.resHeaders),
      };
    }),

  loginEmail: publicQuery
    .input(
      z.object({
        email: z.string().trim().email().transform((value) => value.toLowerCase()),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await findUserByEmail(input.email);
      if (!user?.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      const valid = await verifySecret(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      return {
        user: await signInUser(user, ctx.req.headers, ctx.resHeaders),
      };
    }),

  requestMobileOtp: publicQuery
    .input(z.object({ mobileNumber: mobileNumberSchema }))
    .mutation(async ({ input }) => {
      const code = generateOtpCode(env.isProduction ? undefined : env.mockOtpCode);
      await createOtpVerification(input.mobileNumber, code);
      await otpProvider.sendOtp({ mobileNumber: input.mobileNumber, code });

      return {
        success: true,
        expiresInSeconds: 300,
        devCode: env.isProduction ? undefined : code,
      };
    }),

  verifyMobileOtp: publicQuery
    .input(
      z.object({
        mobileNumber: mobileNumberSchema,
        otp: z.string().regex(/^\d{6}$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const verified = await verifyOtpCode(input.mobileNumber, input.otp);
      if (!verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired OTP.",
        });
      }

      let user = await findUserByMobileNumber(input.mobileNumber);
      if (!user) {
        const companyId = await createCompany({
          name: `FreshFlow Buyer ${input.mobileNumber.slice(-4)}`,
          type: "buyer",
          phone: input.mobileNumber,
        });
        user = await createUser({
          unionId: `mobile:${input.mobileNumber}`,
          authProvider: "mobile",
          name: `Buyer ${input.mobileNumber.slice(-4)}`,
          mobileNumber: input.mobileNumber,
          companyId,
          mobileVerified: true,
        });
      }

      return {
        user: await signInUser(user, ctx.req.headers, ctx.resHeaders),
      };
    }),

  refresh: publicQuery.mutation(async ({ ctx }) => {
    const user = await authenticateRequest(ctx.req.headers, ctx.resHeaders);
    return { user: publicUser(user) };
  }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    if (ctx.user) {
      await updateUserRefreshTokenHash(ctx.user.id, null);
    }
    clearSessionCookies(ctx.req.headers, ctx.resHeaders);
    return { success: true };
  }),
});
