import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import {
  findOrdersByBuyer,
  findOrderWithDetails,
  createOrder,
  createOrderItems,
  updateOrderStatus,
  countOrdersByStatus,
  getRecentOrders,
} from "./queries/orders";
import { getCartTotal, clearCart } from "./queries/cart";
import { findProductById } from "./queries/products";

export const orderRouter = createRouter({
  list: authedQuery
    .input(
      z
        .object({
          type: z.enum(["buyer", "supplier"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx }) => {
      const companyId = ctx.user.companyId;
      if (!companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not associated with a company",
        });
      }
      // Default to buyer view
      return findOrdersByBuyer(companyId);
    }),

  detail: authedQuery
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      return findOrderWithDetails(input.orderId);
    }),

  create: authedQuery
    .input(
      z.object({
        supplierId: z.number(),
        shippingAddressLine1: z.string().optional(),
        shippingCity: z.string().optional(),
        shippingState: z.string().optional(),
        shippingPostalCode: z.string().optional(),
        shippingCountry: z.string().optional(),
        shippingMethod: z.string().optional(),
        buyerNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const buyerId = ctx.user.companyId;
      if (!buyerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User must be associated with a company to place orders",
        });
      }

      // Get cart items
      const cart = await getCartTotal(ctx.user.id);
      if (cart.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      // Calculate totals
      const subtotal = cart.total;
      const taxAmount = 0; // TODO: calculate tax
      const shippingAmount = 0; // TODO: calculate shipping
      const totalAmount = subtotal + taxAmount + shippingAmount;

      // Generate order number
      const orderNumber = `FF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create order
      const orderId = await createOrder({
        orderNumber,
        buyerId,
        supplierId: input.supplierId,
        placedByUserId: ctx.user.id,
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        shippingAmount: shippingAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        currency: "USD",
        shippingAddressLine1: input.shippingAddressLine1,
        shippingCity: input.shippingCity,
        shippingState: input.shippingState,
        shippingPostalCode: input.shippingPostalCode,
        shippingCountry: input.shippingCountry,
        shippingMethod: input.shippingMethod,
        buyerNotes: input.buyerNotes,
      });

      // Create order items
      const orderItemsData = [];
      for (const item of cart.items) {
        const product = await findProductById(item.productId);
        if (!product) continue;

        const unitPrice = parseFloat(item.unitPrice?.toString() ?? "0");
        const totalPrice = unitPrice * item.quantity;

        orderItemsData.push({
          orderId,
          productId: item.productId,
          productName: product.name,
          productImage: product.image ?? undefined,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
          unitType: product.unitType,
          notes: item.notes ?? undefined,
        });
      }

      await createOrderItems(orderItemsData);

      // Clear cart after order
      await clearCart(ctx.user.id);

      return { orderId, orderNumber, totalAmount: totalAmount.toFixed(2) };
    }),

  status: authedQuery
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum([
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      const timestampMap: Record<string, string> = {
        confirmed: "confirmedAt",
        shipped: "shippedAt",
        delivered: "deliveredAt",
        cancelled: "cancelledAt",
      };
      await updateOrderStatus(
        input.orderId,
        input.status,
        timestampMap[input.status]
      );
      return { success: true };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const companyId = ctx.user.companyId;
    if (!companyId) return [];
    return countOrdersByStatus(companyId);
  }),

  recent: authedQuery
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const companyId = ctx.user.companyId;
      if (!companyId) return [];
      return getRecentOrders(companyId, input?.limit ?? 5);
    }),
});
