import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllCategories,
  findCategoryBySlug,
  findCategoryById,
} from "./queries/categories";

export const categoryRouter = createRouter({
  list: publicQuery.query(async () => {
    return findAllCategories();
  }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return findCategoryBySlug(input.slug);
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findCategoryById(input.id);
    }),
});
