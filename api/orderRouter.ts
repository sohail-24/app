import { z } from "zod";
import { createRouter, authedQuery, ownerQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import { isOwner } from "@contracts/roles";
import {
  cancelOrder,
  createOrderFromCart,
  deliveryEstimates,
  findOrdersByBuyer,
  findOrdersBySupplier,
  findOrderWithDetails,
  orderStatuses,
  orderStatusTransitions,
  type OrderStatus,
  updateOrderStatus,
  updateOrderDeliveryEstimate,
  countOrdersByStatus,
  getRecentOrders,
} from "./queries/orders";
import { getCartTotal } from "./queries/cart";
import { findProductById } from "./queries/products";
import { findAllInventory } from "./queries/inventory";
import { generateInvoiceFromOrder } from "./queries/invoices";

function canAccessOrderDetails(input: {
  user: { role: string; email?: string | null; companyId?: number | null };
  order: { buyerId: number; supplierId: number };
}) {
  if (input.user.role === "admin" || isOwner(input.user)) {
    return true;
  }

  return (
    !!input.user.companyId &&
    (input.order.buyerId === input.user.companyId ||
      input.order.supplierId === input.user.companyId)
  );
}

function canManageOrder(input: {
  user: { role: string; email?: string | null; companyId?: number | null };
  order: { supplierId: number };
}) {
  if (input.user.role === "admin" || isOwner(input.user)) return true;
  return input.user.companyId === input.order.supplierId;
}

function requireCompanyId(companyId?: number | null) {
  if (!companyId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User is not associated with a company",
    });
  }
  return companyId;
}

const orderStatusSchema = z.enum(orderStatuses);
const deliveryEstimateSchema = z.enum(deliveryEstimates);

export const orderRouter = createRouter({
  list: authedQuery
    .input(
      z
        .object({
          type: z.enum(["buyer", "supplier"]).optional(),
          search: z.string().trim().optional(),
          status: orderStatusSchema.optional(),
          deliveryEstimate: deliveryEstimateSchema.optional(),
          page: z.number().int().min(1).optional(),
          size: z.number().int().min(1).max(100).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      const requestedType = input?.type ?? "buyer";
      if (requestedType === "supplier" && !isOwner(ctx.user) && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to manage supplier orders.",
        });
      }

      const filters = {
        search: input?.search,
        status: input?.status,
        deliveryEstimate: input?.deliveryEstimate,
        page: input?.page,
        size: input?.size,
      };

      if (requestedType === "supplier") {
        return findOrdersBySupplier(ctx.user.role === "admin" || isOwner(ctx.user) ? undefined : companyId, filters);
      }
      return findOrdersByBuyer(companyId, filters);
    }),

  detail: authedQuery
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await findOrderWithDetails(input.orderId);
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found.",
        });
      }

      if (!canAccessOrderDetails({ user: ctx.user, order })) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this order.",
        });
      }

      return order;
    }),

  create: authedQuery
    .input(
      z.object({
        supplierId: z.number().optional(),
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
      const buyerId = requireCompanyId(ctx.user.companyId);

      const cart = await getCartTotal(ctx.user.id);
      if (cart.items.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty",
        });
      }

      const orderItemsData = [];
      let supplierId: number | null = null;
      let currency = "INR";

      for (const item of cart.items) {
        const product = await findProductById(item.productId);
        if (!product || product.status !== "active") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A product in your cart is no longer available.",
          });
        }
        if (supplierId === null) {
          supplierId = product.supplierId;
          currency = product.currency;
        }
        if (product.supplierId !== supplierId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Orders can only contain products from one supplier.",
          });
        }
        if (input.supplierId && input.supplierId !== product.supplierId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cart products do not match the selected supplier.",
          });
        }
        if (product.currency !== currency) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Orders can only contain products with one currency.",
          });
        }

        const [inventoryRecord] = await findAllInventory({
          supplierId: product.supplierId,
          productId: product.id,
        });
        if (!inventoryRecord) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `${product.name} does not have inventory available.`,
          });
        }
        if (inventoryRecord.quantityAvailable < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient inventory for ${product.name}.`,
          });
        }

        const unitPrice = parseFloat(item.unitPrice?.toString() ?? "0");
        const totalPrice = unitPrice * item.quantity;

        orderItemsData.push({
          productId: item.productId,
          productName: product.name,
          productImage: product.image ?? undefined,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
          unitType: product.unitType,
          notes: item.notes ?? undefined,
          inventoryId: inventoryRecord.id,
          currentReserved: inventoryRecord.quantityReserved,
          quantityOnHand: inventoryRecord.quantityOnHand,
          reorderLevel: inventoryRecord.reorderLevel,
        });
      }

      if (supplierId === null || orderItemsData.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart does not contain valid products.",
        });
      }

      const subtotal = cart.total;
      const taxAmount = 0;
      const shippingAmount = 0;
      const totalAmount = subtotal + taxAmount + shippingAmount;
      const orderNumber = `FF-${Date.now()}-${ctx.user.id}`;

      const order = await createOrderFromCart({
        userId: ctx.user.id,
        order: {
          orderNumber,
          buyerId,
          supplierId,
          placedByUserId: ctx.user.id,
          subtotal: subtotal.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          shippingAmount: shippingAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          currency,
          shippingAddressLine1: input.shippingAddressLine1,
          shippingCity: input.shippingCity,
          shippingState: input.shippingState,
          shippingPostalCode: input.shippingPostalCode,
          shippingCountry: input.shippingCountry,
          shippingMethod: input.shippingMethod,
          buyerNotes: input.buyerNotes,
        },
        items: orderItemsData,
      });

      return { orderId: order.id, orderNumber: order.orderNumber, totalAmount: totalAmount.toFixed(2) };
    }),

  status: ownerQuery
    .input(
      z.object({
        orderId: z.number(),
        status: orderStatusSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await findOrderWithDetails(input.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      }
      if (!canManageOrder({ user: ctx.user, order })) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this order.",
        });
      }
      if (order.status === input.status) {
        return { success: true };
      }
      const allowedTransitions = orderStatusTransitions[order.status as OrderStatus] ?? [];
      if (!allowedTransitions.includes(input.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid order status transition.",
        });
      }

      await updateOrderStatus(input.orderId, input.status);
      if (input.status === "delivered") {
        const invoice = await generateInvoiceFromOrder(input.orderId);
        if (!invoice) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Order was delivered, but invoice generation failed.",
          });
        }
      }
      return { success: true };
    }),

  deliveryEstimate: ownerQuery
    .input(
      z.object({
        orderId: z.number(),
        deliveryEstimate: deliveryEstimateSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const order = await findOrderWithDetails(input.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      }
      if (!canManageOrder({ user: ctx.user, order })) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this order.",
        });
      }
      if (order.status === "delivered") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Delivered orders cannot be edited.",
        });
      }
      await updateOrderDeliveryEstimate(input.orderId, input.deliveryEstimate);
      return { success: true };
    }),

  cancel: ownerQuery
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const order = await findOrderWithDetails(input.orderId);
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
      }
      if (!canManageOrder({ user: ctx.user, order })) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to cancel this order.",
        });
      }
      if (order.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only pending orders can be cancelled.",
        });
      }
      await cancelOrder(input.orderId);
      return { success: true };
    }),

  stats: ownerQuery.query(async ({ ctx }) => {
    const companyId = ctx.user.role === "admin" || isOwner(ctx.user)
      ? undefined
      : requireCompanyId(ctx.user.companyId);
    return countOrdersByStatus(companyId);
  }),

  recent: authedQuery
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(20).optional(),
          type: z.enum(["buyer", "supplier"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const requestedType = input?.type ?? "buyer";
      if (requestedType === "supplier") {
        if (!isOwner(ctx.user) && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to view supplier orders.",
          });
        }
        return getRecentOrders(
          ctx.user.role === "admin" || isOwner(ctx.user)
            ? undefined
            : ctx.user.companyId ?? undefined,
          input?.limit ?? 5,
          "supplier",
        );
      }

      const companyId = ctx.user.companyId;
      if (!companyId) return [];
      return getRecentOrders(companyId, input?.limit ?? 5, "buyer");
    }),
});
