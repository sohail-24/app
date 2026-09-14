import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { readdir } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { createRouter, authedQuery } from "./middleware";
import { normalizeIndianMobileNumber } from "./auth/mobile";
import { hashSecret, verifySecret } from "./auth/password";
import {
  findUserById,
  findUserByEmail,
  updateUserPasswordHash,
  updateUserProfile,
} from "./queries/users";
import type { User } from "@db/schema";

const genderSchema = z.enum(["male", "female", "other", "prefer_not_to_say"]);
const themePreferenceSchema = z.enum(["system", "light", "dark"]);
const avatarPathSchema = z
  .string()
  .regex(/^\/avatars\/[A-Za-z0-9][A-Za-z0-9._-]*\.(png|jpe?g|webp|gif|svg)$/i, "Choose a valid avatar.");
const publicAvatarsDirectories = [
  resolve(process.cwd(), "public/avatars"),
  resolve(process.cwd(), "dist/public/avatars"),
];
const avatarExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);

function publicProfile(user: User) {
  const { passwordHash: _passwordHash, refreshTokenHash: _refreshTokenHash, ...safeUser } = user;
  return {
    ...safeUser,
    avatar: avatarPathSchema.safeParse(user.avatar).success ? user.avatar : null,
  };
}

function parseOptionalDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Enter a valid date of birth." });
  }
  if (date > new Date()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Date of birth cannot be in the future." });
  }
  return date;
}

async function listAvatarPaths() {
  for (const directory of publicAvatarsDirectories) {
    try {
      const entries = await readdir(directory, { withFileTypes: true });
      return entries
        .filter((entry) => entry.isFile() && avatarExtensions.has(extname(entry.name).toLowerCase()))
        .map((entry) => `/avatars/${entry.name}`)
        .sort((first, second) => first.localeCompare(second));
    } catch {
      // Try the next location so both Vite development and production builds work.
    }
  }
  return [];
}

export const profileRouter = createRouter({
  current: authedQuery.query(async ({ ctx }) => {
    const user = await findUserById(ctx.user.id);
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found." });
    }
    return publicProfile(user);
  }),

  avatars: authedQuery.query(() => listAvatarPaths()),

  update: authedQuery
    .input(
      z.object({
        name: z.string().trim().min(1, "Full name is required.").max(255).optional(),
        email: z.string().trim().email("Enter a valid email.").transform((value) => value.toLowerCase()).optional().nullable(),
        phone: z.string().trim().optional().nullable(),
        dateOfBirth: z.string().optional().nullable(),
        gender: genderSchema.optional().nullable(),
        addressLine1: z.string().trim().max(255).optional().nullable(),
        city: z.string().trim().max(100).optional().nullable(),
        state: z.string().trim().max(100).optional().nullable(),
        country: z.string().trim().max(100).optional().nullable(),
        postalCode: z.string().trim().max(20).optional().nullable(),
        themePreference: themePreferenceSchema.optional(),
        avatar: avatarPathSchema.optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await findUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found." });
      }

      if (input.email !== undefined && user.email !== null) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Email cannot be changed once it is set." });
      }

      if (input.email) {
        const existingUser = await findUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
        }
      }

      if (input.avatar) {
        const availableAvatars = await listAvatarPaths();
        if (!availableAvatars.includes(input.avatar)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Choose an available avatar." });
        }
      }

      const phone = input.phone ? normalizeIndianMobileNumber(input.phone) : input.phone;
      const updated = await updateUserProfile(ctx.user.id, {
        name: input.name,
        email: input.email,
        phone,
        avatar: input.avatar,
        dateOfBirth: input.dateOfBirth === undefined ? undefined : parseOptionalDate(input.dateOfBirth),
        gender: input.gender,
        addressLine1: input.addressLine1,
        city: input.city,
        state: input.state,
        country: input.country,
        postalCode: input.postalCode,
        themePreference: input.themePreference,
      });

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found." });
      }
      return publicProfile(updated);
    }),

  changePassword: authedQuery
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required."),
        newPassword: z.string().min(5, "Password must be at least 5 characters."),
        confirmPassword: z.string().min(1, "Confirm password is required."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.newPassword !== input.confirmPassword) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Password confirmation does not match." });
      }

      const user = await findUserById(ctx.user.id);
      if (!user?.passwordHash || !(await verifySecret(input.currentPassword, user.passwordHash))) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect." });
      }

      await updateUserPasswordHash(ctx.user.id, await hashSecret(input.newPassword));
      return { success: true };
    }),
});
