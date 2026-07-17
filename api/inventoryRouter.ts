import { z } from "zod";
import { createRouter, ownerQuery } from "./middleware";
import {
  findAllInventory,
  findInventoryByProduct,
  findInventoryBySupplier,
  updateInventory,
  getInventoryStats,
} from "./queries/inventory";

export const inventoryRouter = createRouter({
  list: ownerQuery
    .input(
      z
        .object({
          supplierId: z.number().optional(),
          status: z.string().optional(),
          productId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return findAllInventory(input ?? {});
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
          quantityOnHand: z.number().optional(),
          quantityReserved: z.number().optional(),
          quantityAvailable: z.number().optional(),
          reorderLevel: z.number().optional(),
          reorderQuantity: z.number().optional(),
          warehouseLocation: z.string().optional(),
          batchNumber: z.string().optional(),
          expiryDate: z.string().optional(),
          notes: z.string().optional(),
          status: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const updateData: Record<string, unknown> = { ...input.data };
      if (input.data.expiryDate) {
        updateData.expiryDate = new Date(input.data.expiryDate);
      }
      await updateInventory(input.id, updateData);
      return { success: true };
    }),

  stats: ownerQuery
    .input(z.object({ supplierId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return getInventoryStats(input?.supplierId);
    }),
});
