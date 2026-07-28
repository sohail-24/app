import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { normalizeIndianMobileNumber } from "./auth/mobile";
import { hashSecret, verifySecret } from "./auth/password";
import {
  findUserById,
  updateUserAvatar,
  updateUserPasswordHash,
  updateUserProfile,
} from "./queries/users";
import type { User } from "@db/schema";

const genderSchema = z.enum(["male", "female", "other", "prefer_not_to_say"]);
const themePreferenceSchema = z.enum(["system", "light", "dark"]);
const maxAvatarBytes = 2 * 1024 * 1024;
const avatarDataUrlSchema = z
  .string()
  .regex(/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/, "Upload a PNG, JPEG, or WebP image.");

function publicProfile(user: User) {
  const { passwordHash: _passwordHash, refreshTokenHash: _refreshTokenHash, ...safeUser } = user;
  return safeUser;
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

function avatarBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.ceil((base64.length * 3) / 4);
}

export const profileRouter = createRouter({
  current: authedQuery.query(async ({ ctx }) => {
    const user = await findUserById(ctx.user.id);
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found." });
    }
    return publicProfile(user);
  }),

  update: authedQuery
    .input(
      z.object({
        name: z.string().trim().min(1, "Full name is required.").max(255).optional(),
        phone: z.string().trim().optional().nullable(),
        dateOfBirth: z.string().optional().nullable(),
        gender: genderSchema.optional().nullable(),
        addressLine1: z.string().trim().max(255).optional().nullable(),
        city: z.string().trim().max(100).optional().nullable(),
        state: z.string().trim().max(100).optional().nullable(),
        country: z.string().trim().max(100).optional().nullable(),
        postalCode: z.string().trim().max(20).optional().nullable(),
        themePreference: themePreferenceSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const phone = input.phone ? normalizeIndianMobileNumber(input.phone) : input.phone;
      const updated = await updateUserProfile(ctx.user.id, {
        name: input.name,
        phone,
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

  uploadAvatar: authedQuery
    .input(z.object({ avatar: avatarDataUrlSchema }))
    .mutation(async ({ ctx, input }) => {
      if (avatarBytes(input.avatar) > maxAvatarBytes) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Avatar file is too large.",
        });
      }

      const updated = await updateUserAvatar(ctx.user.id, input.avatar);
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found." });
      }
      return publicProfile(updated);
    }),

  deleteAvatar: authedQuery.mutation(async ({ ctx }) => {
    const updated = await updateUserAvatar(ctx.user.id, null);
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
