import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter, ownerQuery } from "./middleware";
import { findDeliveryZoneById } from "./queries/deliveryZones";
import { findWarehouseById } from "./queries/warehouse";
import {
  calculateShippingForOrder,
  createShippingMethod,
  deleteShippingMethod,
  findShippingMethodById,
  findShippingMethods,
  getShippingStats,
  updateShippingMethod,
} from "./queries/shipping";

const shippingStatusSchema = z.enum(["active", "inactive"]);
const deliveryEstimateSchema = z.enum([
  "same_day",
  "next_day",
  "within_2_days",
  "within_3_5_days",
]);
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("").transform(() => undefined));

const shippingInputSchema = z.object({
  warehouseId: z.number().int().positive().optional(),
  deliveryZoneId: z.number().int().positive().optional(),
  name: z.string().trim().min(2, "Shipping method name is required.").max(255),
  code: optionalText(80),
  description: optionalText(2000),
  charge: z.number().min(0).default(0),
  freeShippingThreshold: z.number().min(0).optional(),
  deliveryEstimate: deliveryEstimateSchema.default("next_day"),
  status: shippingStatusSchema.default("active"),
  isDefault: z.boolean().default(false),
});

const shippingUpdateSchema = shippingInputSchema.partial().extend({
  id: z.number().int().positive(),
});

function requireCompanyId(companyId?: number | null) {
  if (!companyId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Your account is not linked to a business.",
    });
  }
  return companyId;
}

async function validateReferences(companyId: number, input: { warehouseId?: number; deliveryZoneId?: number }) {
  if (input.warehouseId) {
    const warehouse = await findWarehouseById(companyId, input.warehouseId);
    if (!warehouse || warehouse.status !== "active") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Select an active warehouse." });
    }
  }
  if (input.deliveryZoneId) {
    const zone = await findDeliveryZoneById(companyId, input.deliveryZoneId);
    if (!zone || !zone.isActive) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Select an active delivery zone." });
    }
  }
}

async function assertMethod(companyId: number, id: number) {
  const method = await findShippingMethodById(companyId, id);
  if (!method) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Shipping method not found." });
  }
  return method;
}

export const shippingRouter = createRouter({
  list: ownerQuery
    .input(
      z
        .object({
          search: z.string().trim().optional(),
          status: shippingStatusSchema.optional(),
          warehouseId: z.number().int().positive().optional(),
          deliveryZoneId: z.number().int().positive().optional(),
        })
        .optional(),
    )
    .query(({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      return findShippingMethods(companyId, input);
    }),

  calculate: ownerQuery
    .input(
      z.object({
        subtotal: z.number().min(0),
        state: z.string().trim().max(100).optional(),
        shippingMethodId: z.number().int().positive().optional(),
      }),
    )
    .query(({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      return calculateShippingForOrder({ companyId, ...input });
    }),

  create: ownerQuery.input(shippingInputSchema).mutation(async ({ ctx, input }) => {
    const companyId = requireCompanyId(ctx.user.companyId);
    await validateReferences(companyId, input);
    return createShippingMethod({
      companyId,
      warehouseId: input.warehouseId,
      deliveryZoneId: input.deliveryZoneId,
      name: input.name,
      code: input.code,
      description: input.description,
      charge: input.charge.toFixed(2),
      freeShippingThreshold: input.freeShippingThreshold?.toFixed(2),
      deliveryEstimate: input.deliveryEstimate,
      status: input.status,
      isDefault: input.isDefault,
    });
  }),

  update: ownerQuery.input(shippingUpdateSchema).mutation(async ({ ctx, input }) => {
    const companyId = requireCompanyId(ctx.user.companyId);
    await assertMethod(companyId, input.id);
    await validateReferences(companyId, input);
    const { id, charge, freeShippingThreshold, ...data } = input;
    return updateShippingMethod(companyId, id, {
      ...data,
      charge: charge !== undefined ? charge.toFixed(2) : undefined,
      freeShippingThreshold:
        freeShippingThreshold !== undefined ? freeShippingThreshold.toFixed(2) : undefined,
    });
  }),

  delete: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      await assertMethod(companyId, input.id);
      return deleteShippingMethod(companyId, input.id);
    }),

  stats: ownerQuery.query(({ ctx }) => {
    const companyId = requireCompanyId(ctx.user.companyId);
    return getShippingStats(companyId);
  }),
});
