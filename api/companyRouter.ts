import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  findAllCompanies,
  findCompaniesByType,
  findCompanyById,
  findCompanyBySlug,
  searchCompanies,
} from "./queries/companies";

export const companyRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          type: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      if (input?.type) {
        return findCompaniesByType(input.type);
      }
      return findAllCompanies();
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return findCompanyById(input.id);
    }),

  bySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return findCompanyBySlug(input.slug);
    }),

  search: publicQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return searchCompanies(input.query);
    }),
});
