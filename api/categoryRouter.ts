import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { isOwner } from "@contracts/roles";
import { createRouter, ownerQuery, publicQuery } from "./middleware";
import {
  findAllCategories,
  findCategoryBySlug,
  findCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./queries/categories";

const categoryInput = z.object({
  name: z.string().trim().min(2, "Category name is required.").max(100),
  description: z.string().trim().max(2000).optional().or(z.literal("").transform(() => undefined)),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "category"
  );
}

export const categoryRouter = createRouter({
  list: publicQuery
    .input(z.object({ includeInactive: z.boolean().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return findAllCategories({
        includeInactive: input?.includeInactive && (isOwner(ctx.user) || ctx.user?.role === "admin"),
      });
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

  create: ownerQuery.input(categoryInput).mutation(async ({ input }) => {
    const slug = slugify(input.name);
    const existing = await findCategoryBySlug(slug);
    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A category with this name already exists.",
      });
    }

    const id = await createCategory({
      name: input.name,
      slug,
      description: input.description,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    });
    return { id };
  }),

  update: ownerQuery
    .input(categoryInput.partial().extend({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const existing = await findCategoryById(input.id);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found." });
      }

      const slug = input.name ? slugify(input.name) : undefined;
      if (slug && slug !== existing.slug) {
        const duplicate = await findCategoryBySlug(slug);
        if (duplicate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A category with this name already exists.",
          });
        }
      }

      await updateCategory(input.id, {
        name: input.name,
        slug,
        description: input.description,
        isActive: input.isActive,
        sortOrder: input.sortOrder,
      });
      return { success: true };
    }),

  delete: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const existing = await findCategoryById(input.id);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found." });
      }
      await deleteCategory(input.id);
      return { success: true };
    }),
});
