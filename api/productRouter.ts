import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, ownerQuery } from "./middleware";
import {
  findAllProducts,
  findProductBySlug,
  findProductById,
  findFeaturedProducts,
  countProducts,
  createProductWithInventory,
  deleteProduct,
  findProductBySku,
  getProductStats,
  updateProduct,
} from "./queries/products";
import { findCategoryById } from "./queries/categories";

const unitTypeSchema = z.enum(["kg", "lb", "case", "pallet", "each", "bunch", "box", "bag"]);
const gradeSchema = z.enum(["premium", "grade_a", "grade_b", "standard"]);
const statusSchema = z.enum(["draft", "active", "archived"]);

const productMutationSchema = z.object({
  name: z.string().trim().min(2, "Product name is required."),
  sku: z.string().trim().min(2, "SKU is required.").max(80),
  barcode: z.string().trim().max(100).optional().or(z.literal("").transform(() => undefined)),
  categoryId: z.number().int().positive("Category is required."),
  description: z.string().trim().max(5000).optional().or(z.literal("").transform(() => undefined)),
  purchasePrice: z.number().positive("Purchase price must be greater than zero."),
  sellingPrice: z.number().positive("Selling price must be greater than zero."),
  openingStock: z.number().int().min(0).default(0),
  minimumStock: z.number().int().min(0).default(10),
  warehouse: z.string().trim().min(1, "Warehouse is required.").max(100),
  status: statusSchema.default("active"),
  unitType: unitTypeSchema.default("kg"),
  unitSize: z.string().trim().max(50).optional().or(z.literal("").transform(() => undefined)),
  minimumOrderQuantity: z.number().int().positive().default(1),
  grade: gradeSchema.default("grade_a"),
  organic: z.boolean().default(false),
  images: z.array(z.string()).default([]),
});

const productUpdateSchema = productMutationSchema.partial().extend({
  id: z.number().int().positive(),
});

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product"
  );
}

function productTags(input: { sku: string; barcode?: string }) {
  return JSON.stringify({
    sku: input.sku.trim(),
    barcode: input.barcode?.trim() || undefined,
  });
}

export const productRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          categoryId: z.number().optional(),
          supplierId: z.number().optional(),
          status: z.string().optional(),
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

  stats: publicQuery.query(async () => {
    return getProductStats();
  }),

  create: ownerQuery
    .input(productMutationSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      if (!user.companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Your account is not linked to a business.",
        });
      }

      const category = await findCategoryById(input.categoryId);
      if (!category?.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an active category before publishing this product.",
        });
      }

      const duplicateSku = await findProductBySku(input.sku);
      if (duplicateSku) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A product with this SKU already exists.",
        });
      }

      try {
        const imageUrls = input.images.filter(Boolean);
        const productId = await createProductWithInventory({
          product: {
            name: input.name,
            slug: `${slugify(input.name)}-${input.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
            description: input.description,
            shortDescription: input.description?.slice(0, 220),
            categoryId: input.categoryId,
            supplierId: user.companyId,
            unitPrice: input.sellingPrice.toFixed(2),
            compareAtPrice: input.purchasePrice.toFixed(2),
            currency: "INR",
            unitType: input.unitType,
            unitSize: input.unitSize,
            minimumOrderQuantity: input.minimumOrderQuantity,
            image: imageUrls[0],
            images: JSON.stringify(imageUrls),
            grade: input.grade,
            organic: input.organic,
            status: input.status,
            tags: productTags({ sku: input.sku, barcode: input.barcode }),
          },
          inventory: {
            quantityOnHand: input.openingStock,
            reorderLevel: input.minimumStock,
            warehouseLocation: input.warehouse,
            notes: `Created from product setup. SKU: ${input.sku}`,
          },
        });

        return { id: productId, slug: `${slugify(input.name)}-${input.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? `Could not create product: ${error.message}`
              : "Could not create product. Please try again.",
        });
      }
    }),

  update: ownerQuery.input(productUpdateSchema).mutation(async ({ input }) => {
    const existing = await findProductById(input.id);
    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
    }
    if (input.categoryId) {
      const category = await findCategoryById(input.categoryId);
      if (!category?.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Select an active category before updating this product.",
        });
      }
    }
    if (input.sku) {
      const duplicateSku = await findProductBySku(input.sku, input.id);
      if (duplicateSku) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A product with this SKU already exists.",
        });
      }
    }

    await updateProduct(input.id, {
      name: input.name,
      slug: input.name && input.sku ? `${slugify(input.name)}-${input.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : undefined,
      description: input.description,
      shortDescription: input.description?.slice(0, 220),
      categoryId: input.categoryId,
      unitPrice: input.sellingPrice?.toFixed(2),
      compareAtPrice: input.purchasePrice?.toFixed(2),
      unitType: input.unitType,
      unitSize: input.unitSize,
      minimumOrderQuantity: input.minimumOrderQuantity,
      image: input.images?.[0],
      images: input.images ? JSON.stringify(input.images) : undefined,
      grade: input.grade,
      organic: input.organic,
      status: input.status,
      tags: input.sku ? productTags({ sku: input.sku, barcode: input.barcode }) : undefined,
    });
    return { success: true };
  }),

  delete: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const existing = await findProductById(input.id);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found." });
      }
      await deleteProduct(input.id);
      return { success: true };
    }),
});
