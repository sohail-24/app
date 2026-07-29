import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter, ownerQuery } from "./middleware";
import { findWarehouseById } from "./queries/warehouse";
import {
  createDeliveryZone,
  deleteDeliveryZone,
  findDeliveryZoneById,
  findDeliveryZoneForState,
  findDeliveryZoneForStateAnyStatus,
  findDeliveryZonesByCompany,
  getDeliveryZoneStats,
  normalizeState,
  updateDeliveryZone,
} from "./queries/deliveryZones";

const deliveryEstimateSchema = z.enum([
  "same_day",
  "next_day",
  "within_2_days",
  "within_3_5_days",
]);

const deliveryZoneInputSchema = z.object({
  warehouseId: z.number().int().positive().optional(),
  state: z.string().trim().min(2, "State is required.").max(100),
  deliveryEstimate: deliveryEstimateSchema.default("next_day"),
  deliveryFee: z.number().min(0).default(0),
  minimumOrderAmount: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

const deliveryZoneUpdateSchema = deliveryZoneInputSchema.partial().extend({
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

async function validateWarehouse(companyId: number, warehouseId?: number) {
  if (!warehouseId) return;
  const warehouse = await findWarehouseById(companyId, warehouseId);
  if (!warehouse || warehouse.status !== "active") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Select an active warehouse for this state.",
    });
  }
}

async function assertZone(companyId: number, id: number) {
  const zone = await findDeliveryZoneById(companyId, id);
  if (!zone) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Delivery zone not found." });
  }
  return zone;
}

async function assertStateAvailable(companyId: number, state?: string, excludeId?: number) {
  if (!state) return;
  const duplicate = await findDeliveryZoneForStateAnyStatus(companyId, state);
  if (duplicate && duplicate.id !== excludeId) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `${normalizeState(state)} already has a delivery zone.`,
    });
  }
}

export const deliveryZoneRouter = createRouter({
  list: ownerQuery
    .input(
      z
        .object({
          search: z.string().trim().optional(),
          isActive: z.boolean().optional(),
          warehouseId: z.number().int().positive().optional(),
        })
        .optional(),
    )
    .query(({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      return findDeliveryZonesByCompany(companyId, input);
    }),

  detail: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      return assertZone(companyId, input.id);
    }),

  availability: ownerQuery
    .input(z.object({ state: z.string().trim().min(2).max(100) }))
    .query(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      const zone = await findDeliveryZoneForState(companyId, input.state);
      return {
        available: !!zone,
        zone,
      };
    }),

  create: ownerQuery.input(deliveryZoneInputSchema).mutation(async ({ ctx, input }) => {
    const companyId = requireCompanyId(ctx.user.companyId);
    await validateWarehouse(companyId, input.warehouseId);
    await assertStateAvailable(companyId, input.state);
    const state = normalizeState(input.state);
    return createDeliveryZone({
      companyId,
      warehouseId: input.warehouseId,
      name: state,
      state,
      deliveryEstimate: input.deliveryEstimate,
      deliveryFee: input.deliveryFee.toFixed(2),
      minimumOrderAmount: input.minimumOrderAmount.toFixed(2),
      isActive: input.isActive,
    });
  }),

  update: ownerQuery.input(deliveryZoneUpdateSchema).mutation(async ({ ctx, input }) => {
    const companyId = requireCompanyId(ctx.user.companyId);
    const existing = await assertZone(companyId, input.id);
    await validateWarehouse(companyId, input.warehouseId);
    await assertStateAvailable(companyId, input.state, input.id);
    const { id, deliveryFee, minimumOrderAmount, state, ...data } = input;
    const normalizedState = state ? normalizeState(state) : undefined;
    return updateDeliveryZone(id, {
      ...data,
      state: normalizedState,
      name: normalizedState ?? existing.name,
      deliveryFee: deliveryFee !== undefined ? deliveryFee.toFixed(2) : undefined,
      minimumOrderAmount: minimumOrderAmount !== undefined ? minimumOrderAmount.toFixed(2) : undefined,
    });
  }),

  delete: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      await assertZone(companyId, input.id);
      return deleteDeliveryZone(input.id);
    }),

  stats: ownerQuery.query(({ ctx }) => {
    const companyId = requireCompanyId(ctx.user.companyId);
    return getDeliveryZoneStats(companyId);
  }),
});
