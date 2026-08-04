import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import { normalizeIndianMobileNumber } from "./auth/mobile";
import {
  findAddressesByUserId,
  createAddress,
  updateAddress,
  deleteAddress,
  setAddressAsDefault,
} from "./queries/addresses";

const addressSchema = z.object({
  fullName: z.string().min(1, "Full Name is required").max(255),
  mobileNumber: z.string().min(10, "Mobile number is required").max(50),
  addressLine1: z.string().trim().min(10, "Please enter a complete street address (minimum 10 characters).").max(300),
  addressLine2: z.string().max(255).optional().nullable(),
  landmark: z.string().max(255).optional().nullable(),
  areaLocality: z.string().max(255).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().max(100).default("India"),
  addressType: z.enum(["home", "work", "other"]).default("home"),
  isDefault: z.boolean().default(false),
});

export const addressRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    return findAddressesByUserId(ctx.user.id);
  }),

  create: authedQuery
    .input(addressSchema)
    .mutation(async ({ ctx, input }) => {
      const mobileNumber = normalizeIndianMobileNumber(input.mobileNumber);
      return createAddress({
        ...input,
        userId: ctx.user.id,
        mobileNumber,
        addressLine2: input.addressLine2 || null,
        landmark: input.landmark || null,
        areaLocality: input.areaLocality || null,
      });
    }),

  update: authedQuery
    .input(z.object({ id: z.number().int().positive() }).merge(addressSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const mobileNumber = normalizeIndianMobileNumber(data.mobileNumber);

      const updated = await updateAddress(id, ctx.user.id, {
        ...data,
        mobileNumber,
        addressLine2: data.addressLine2 || null,
        landmark: data.landmark || null,
        areaLocality: data.areaLocality || null,
      });

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Address not found." });
      }

      return updated;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await deleteAddress(input.id, ctx.user.id);
      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Address not found." });
      }
      return deleted;
    }),

  setDefault: authedQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const updated = await setAddressAsDefault(input.id, ctx.user.id);
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Address not found." });
      }
      return updated;
    }),
});
