import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartTotal,
} from "./queries/cart";
import { findProductById } from "./queries/products";

export const cartRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    return getCartTotal(ctx.user.id);
  }),

  add: authedQuery
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await findProductById(input.productId);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }
      if (product.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Product is not available for purchase",
        });
      }
      if (input.quantity < product.minimumOrderQuantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Minimum order quantity is ${product.minimumOrderQuantity}`,
        });
      }

      return addToCart({
        userId: ctx.user.id,
        productId: input.productId,
        quantity: input.quantity,
        unitPrice: product.unitPrice.toString(),
        notes: input.notes,
      });
    }),

  update: authedQuery
    .input(
      z.object({
        cartItemId: z.number(),
        quantity: z.number().min(1).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateCartItem(
        input.cartItemId,
        ctx.user.id,
        {
          quantity: input.quantity,
          notes: input.notes,
        }
      );
      return { success: true };
    }),

  remove: authedQuery
    .input(z.object({ cartItemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await removeFromCart(input.cartItemId, ctx.user.id);
      return { success: true };
    }),

  clear: authedQuery.mutation(async ({ ctx }) => {
    await clearCart(ctx.user.id);
    return { success: true };
  }),
});
