import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllProducts,
  findProductBySlug,
  findProductById,
  findFeaturedProducts,
  countProducts,
} from "./queries/products";

export const productRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          categoryId: z.number().optional(),
          supplierId: z.number().optional(),
          organic: z.boolean().optional(),
          grade: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          search: z.string().optional(),
          sortBy: z.enum(["price", "name", "newest"]).optional(),
          sortOrder: z.enum(["asc", "desc"]).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return findAllProducts(input ?? {});
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return findProductBySlug(input.slug);
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findProductById(input.id);
    }),

  featured: publicQuery
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return findFeaturedProducts(input?.limit ?? 8);
    }),

  count: publicQuery
    .input(
      z
        .object({
          categoryId: z.number().optional(),
          supplierId: z.number().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return countProducts(input ?? {});
    }),
});
