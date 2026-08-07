import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, ownerQuery } from "./middleware";
import {
  findAllInventory,
  findInventoryById,
  findInventoryByProduct,
  findInventoryBySupplier,
  updateInventory,
  getInventoryStats,
  deleteInventoryRecord,
} from "./queries/inventory";
import { findCompanyById } from "./queries/companies";

const inventoryStatusSchema = z.enum(["in_stock", "low_stock", "out_of_stock"]);
type InventoryStatus = z.infer<typeof inventoryStatusSchema>;

function calculateInventoryStatus(
  quantityAvailable: number,
  reorderLevel: number,
): InventoryStatus {
  if (quantityAvailable <= 0) return "out_of_stock";
  if (quantityAvailable <= reorderLevel) return "low_stock";
  return "in_stock";
}

function calculateAvailableStock(quantityOnHand: number, quantityReserved: number) {
  return Math.max(quantityOnHand - quantityReserved, 0);
}

async function getRequiredInventoryRecord(id: number) {
  const record = await findInventoryById(id);
  if (!record) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Inventory record not found.",
    });
  }
  return record;
}

function parseExpiryDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Expiry date is invalid.",
    });
  }
  return date;
}

async function assertSupplierCompany(supplierId?: number) {
  if (!supplierId) return;
  const company = await findCompanyById(supplierId);
  if (!company || !company.isActive || !["supplier", "both"].includes(company.type)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Select an active supplier company.",
    });
  }
}

function cleanText(value?: string) {
  return value?.trim() || undefined;
}

export const inventoryRouter = createRouter({
  list: ownerQuery
    .input(
      z
        .object({
          supplierId: z.number().optional(),
          status: inventoryStatusSchema.optional(),
          productId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return findAllInventory(input ?? {});
    }),

  byId: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      return getRequiredInventoryRecord(input.id);
    }),

  byProduct: ownerQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      return findInventoryByProduct(input.productId);
    }),

  bySupplier: ownerQuery
    .input(z.object({ supplierId: z.number() }))
    .query(async ({ input }) => {
      return findInventoryBySupplier(input.supplierId);
    }),

  update: ownerQuery
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          supplierId: z.number().int().positive().optional(),
          sellingPrice: z.number().positive().optional(),
          purchasePrice: z.number().positive().optional(),
          wholesalePrice: z.number().positive().optional(),
          quantityOnHand: z.number().int().min(0).optional(),
          quantityReserved: z.number().int().min(0).optional(),
          quantityAvailable: z.number().int().min(0).optional(),
          reorderLevel: z.number().int().min(0).optional(),
          reorderQuantity: z.number().int().min(0).optional(),
          warehouseLocation: z.string().optional(),
          batchNumber: z.string().optional(),
          expiryDate: z.string().optional(),
          notes: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await getRequiredInventoryRecord(input.id);
      await assertSupplierCompany(input.data.supplierId);
      const quantityReserved =
        input.data.quantityReserved ?? existing.quantityReserved;
      const quantityOnHand =
        input.data.quantityAvailable !== undefined && input.data.quantityOnHand === undefined
          ? quantityReserved + input.data.quantityAvailable
          : input.data.quantityOnHand ?? existing.quantityOnHand;
      const reorderLevel = input.data.reorderLevel ?? existing.reorderLevel;
      const quantityAvailable = calculateAvailableStock(
        quantityOnHand,
        quantityReserved,
      );

      if (quantityOnHand < 0 || quantityReserved < 0 || reorderLevel < 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Inventory quantities cannot be negative.",
        });
      }
      if (quantityReserved > quantityOnHand) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reserved stock cannot exceed current stock.",
        });
      }

      const updateData = {
        ...input.data,
        isActive: input.data.isActive,
        supplierId: input.data.supplierId,
        quantityOnHand,
        quantityReserved,
        quantityAvailable,
        reorderLevel,
        warehouseLocation: cleanText(input.data.warehouseLocation),
        batchNumber: cleanText(input.data.batchNumber),
        expiryDate: parseExpiryDate(input.data.expiryDate),
        notes: cleanText(input.data.notes),
        status: calculateInventoryStatus(quantityAvailable, reorderLevel),
      };

      const pricing = {
        unitPrice: input.data.sellingPrice,
        compareAtPrice: input.data.purchasePrice,
        wholesalePrice: input.data.wholesalePrice,
      };
      await updateInventory(input.id, updateData, pricing);
      return { success: true };
    }),

  updateStock: ownerQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        quantityOnHand: z.number().int().min(0),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await getRequiredInventoryRecord(input.id);
      if (existing.quantityReserved > input.quantityOnHand) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current stock cannot be lower than reserved stock.",
        });
      }

      await updateInventory(input.id, {
        quantityOnHand: input.quantityOnHand,
        quantityAvailable: calculateAvailableStock(
          input.quantityOnHand,
          existing.quantityReserved,
        ),
        status: calculateInventoryStatus(
          calculateAvailableStock(input.quantityOnHand, existing.quantityReserved),
          existing.reorderLevel,
        ),
        lastCountedAt: new Date(),
      });
      return { success: true };
    }),

  adjustStock: ownerQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        adjustmentType: z.enum(["add", "remove"]),
        quantity: z.number().int().positive(),
        reason: z.string().trim().max(500).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await getRequiredInventoryRecord(input.id);
      const quantityOnHand =
        input.adjustmentType === "add"
          ? existing.quantityOnHand + input.quantity
          : existing.quantityOnHand - input.quantity;

      if (quantityOnHand < 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Stock adjustment cannot make inventory negative.",
        });
      }
      if (existing.quantityReserved > quantityOnHand) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current stock cannot be lower than reserved stock.",
        });
      }

      const quantityAvailable = calculateAvailableStock(
        quantityOnHand,
        existing.quantityReserved,
      );
      await updateInventory(input.id, {
        quantityOnHand,
        quantityAvailable,
        status: calculateInventoryStatus(quantityAvailable, existing.reorderLevel),
        lastCountedAt: new Date(),
        notes: input.reason ?? existing.notes ?? undefined,
      });
      return { success: true };
    }),

  stockIn: ownerQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        quantity: z.number().int().positive(),
        warehouseLocation: z.string().trim().max(100).optional(),
        batchNumber: z.string().trim().max(100).optional(),
        notes: z.string().trim().max(500).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await getRequiredInventoryRecord(input.id);
      const quantityOnHand = existing.quantityOnHand + input.quantity;
      const quantityAvailable = calculateAvailableStock(
        quantityOnHand,
        existing.quantityReserved,
      );
      await updateInventory(input.id, {
        quantityOnHand,
        quantityAvailable,
        warehouseLocation: input.warehouseLocation || existing.warehouseLocation || undefined,
        batchNumber: input.batchNumber || existing.batchNumber || undefined,
        receivedDate: new Date(),
        lastCountedAt: new Date(),
        notes: input.notes || existing.notes || undefined,
        status: calculateInventoryStatus(quantityAvailable, existing.reorderLevel),
      });
      return { success: true };
    }),

  stockOut: ownerQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        quantity: z.number().int().positive(),
        notes: z.string().trim().max(500).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await getRequiredInventoryRecord(input.id);
      const quantityOnHand = existing.quantityOnHand - input.quantity;
      if (quantityOnHand < 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Stock out cannot make inventory negative.",
        });
      }
      if (existing.quantityReserved > quantityOnHand) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current stock cannot be lower than reserved stock.",
        });
      }
      const quantityAvailable = calculateAvailableStock(
        quantityOnHand,
        existing.quantityReserved,
      );
      await updateInventory(input.id, {
        quantityOnHand,
        quantityAvailable,
        lastCountedAt: new Date(),
        notes: input.notes || existing.notes || undefined,
        status: calculateInventoryStatus(quantityAvailable, existing.reorderLevel),
      });
      return { success: true };
    }),

  transfer: ownerQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        warehouseLocation: z.string().trim().min(1).max(100),
        notes: z.string().trim().max(500).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await getRequiredInventoryRecord(input.id);
      await updateInventory(input.id, {
        warehouseLocation: input.warehouseLocation,
        notes: input.notes || existing.notes || undefined,
        lastCountedAt: new Date(),
      });
      return { success: true };
    }),

  delete: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      await getRequiredInventoryRecord(input.id);
      await deleteInventoryRecord(input.id);
      return { success: true };
    }),

  status: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const record = await getRequiredInventoryRecord(input.id);
      return {
        status: calculateInventoryStatus(
          record.quantityAvailable,
          record.reorderLevel,
        ),
      };
    }),

  stats: ownerQuery
    .input(z.object({ supplierId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return getInventoryStats(input?.supplierId);
    }),
});
