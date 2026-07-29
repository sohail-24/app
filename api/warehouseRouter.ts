import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, ownerQuery } from "./middleware";
import {
  archiveWarehouse,
  assignInventoryToWarehouse,
  createWarehouseForCompany,
  dispatchWarehouseStock,
  findWarehouseByCompany,
  findWarehouseById,
  findWarehouseMovements,
  findWarehousesByCompany,
  findWarehouseStock,
  getWarehouseStats,
  receiveWarehouseStock,
  updateWarehouseForCompany,
  upsertWarehouseForCompany,
} from "./queries/warehouse";

const warehouseStatusSchema = z.enum(["active", "inactive"]);
const warehouseInputSchema = z.object({
  name: z.string().trim().min(1, "Warehouse name is required.").max(255),
  code: z.string().trim().max(80).optional().or(z.literal("").transform(() => undefined)),
  description: z.string().trim().max(2000).optional().or(z.literal("").transform(() => undefined)),
  address: z.string().trim().min(1, "Warehouse address is required.").max(2000),
  city: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  state: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  postalCode: z.string().trim().max(20).optional().or(z.literal("").transform(() => undefined)),
  country: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  capacityUnits: z.number().int().min(0).default(0),
  usedCapacityUnits: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false),
  contactPerson: z.string().trim().max(255).optional().or(z.literal("").transform(() => undefined)),
  contactNumber: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  status: warehouseStatusSchema.default("active"),
});
const warehouseUpdateSchema = warehouseInputSchema.partial().extend({
  id: z.number().int().positive(),
});

const stockStatusSchema = z.enum(["in_stock", "low_stock", "out_of_stock"]);

function requireCompanyId(user: { companyId?: number | null }) {
  if (!user.companyId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Your account is not linked to a business.",
    });
  }
  return user.companyId;
}

export const warehouseRouter = createRouter({
  list: ownerQuery
    .input(
      z
        .object({
          search: z.string().trim().optional(),
          status: warehouseStatusSchema.optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user);
      return findWarehousesByCompany({
        companyId,
        search: input?.search,
        status: input?.status,
      });
    }),

  get: ownerQuery.query(async ({ ctx }) => {
    const companyId = requireCompanyId(ctx.user);
    const warehouse = await findWarehouseByCompany(companyId);
    if (!warehouse) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Warehouse information has not been configured.",
      });
    }
    return warehouse;
  }),

  byId: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user);
      const warehouse = await findWarehouseById(companyId, input.id);
      if (!warehouse) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Warehouse not found.",
        });
      }
      return warehouse;
    }),

  create: ownerQuery.input(warehouseInputSchema).mutation(async ({ ctx, input }) => {
    const companyId = requireCompanyId(ctx.user);
    if (input.usedCapacityUnits > input.capacityUnits && input.capacityUnits > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Used capacity cannot exceed total capacity.",
      });
    }
    return createWarehouseForCompany(companyId, input);
  }),

  update: ownerQuery.input(warehouseInputSchema).mutation(async ({ ctx, input }) => {
    const companyId = requireCompanyId(ctx.user);
    return upsertWarehouseForCompany(companyId, input);
  }),

  updateById: ownerQuery.input(warehouseUpdateSchema).mutation(async ({ ctx, input }) => {
    const companyId = requireCompanyId(ctx.user);
    const existing = await findWarehouseById(companyId, input.id);
    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Warehouse not found." });
    }
    const capacityUnits = input.capacityUnits ?? existing.capacityUnits;
    const usedCapacityUnits = input.usedCapacityUnits ?? existing.usedCapacityUnits;
    if (usedCapacityUnits > capacityUnits && capacityUnits > 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Used capacity cannot exceed total capacity.",
      });
    }
    const { id, ...data } = input;
    return updateWarehouseForCompany(companyId, id, data);
  }),

  delete: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user);
      const existing = await findWarehouseById(companyId, input.id);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Warehouse not found." });
      }
      return archiveWarehouse(companyId, input.id);
    }),

  assignStock: ownerQuery
    .input(
      z.object({
        inventoryId: z.number().int().positive(),
        warehouseId: z.number().int().positive(),
        warehouseLocation: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user);
      return assignInventoryToWarehouse({ companyId, ...input });
    }),

  stock: ownerQuery
    .input(
      z
        .object({
          search: z.string().trim().optional(),
          status: stockStatusSchema.optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user);
      return findWarehouseStock({
        companyId,
        search: input?.search,
        status: input?.status,
      });
    }),

  receive: ownerQuery
    .input(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive("Quantity must be greater than zero."),
        supplierName: z.string().trim().max(255).optional().or(z.literal("").transform(() => undefined)),
        reference: z.string().trim().max(120).optional().or(z.literal("").transform(() => undefined)),
        notes: z.string().trim().max(2000).optional().or(z.literal("").transform(() => undefined)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user);
      return receiveWarehouseStock({
        companyId,
        performedByUserId: ctx.user.id,
        ...input,
      });
    }),

  dispatch: ownerQuery
    .input(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive("Quantity must be greater than zero."),
        orderId: z.number().int().positive().optional(),
        notes: z.string().trim().max(2000).optional().or(z.literal("").transform(() => undefined)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user);
      return dispatchWarehouseStock({
        companyId,
        performedByUserId: ctx.user.id,
        ...input,
      });
    }),

  movements: ownerQuery
    .input(
      z
        .object({
          type: z.enum(["receive", "dispatch"]).optional(),
          search: z.string().trim().optional(),
          limit: z.number().int().positive().max(200).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user);
      return findWarehouseMovements({
        companyId,
        type: input?.type,
        search: input?.search,
        limit: input?.limit,
      });
    }),

  stats: ownerQuery.query(async ({ ctx }) => {
    const companyId = requireCompanyId(ctx.user);
    return getWarehouseStats(companyId);
  }),
});
