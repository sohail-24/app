import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter, ownerQuery } from "./middleware";
import { findCategoryById } from "./queries/categories";
import {
  calculateGstForOrder,
  createGstConfiguration,
  deleteGstConfiguration,
  findGstConfigurationById,
  findGstConfigurations,
  findGstDuplicate,
  getGstStats,
  isValidGstin,
  updateGstConfiguration,
} from "./queries/gst";

const gstStatusSchema = z.enum(["active", "inactive"]);
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("").transform(() => undefined));

const gstInputSchema = z.object({
  categoryId: z.number().int().positive("Category is required."),
  name: z.string().trim().min(2, "GST mapping name is required.").max(255),
  gstin: optionalText(20),
  hsnCode: optionalText(20),
  rate: z.number().min(0).max(28),
  status: gstStatusSchema.default("active"),
});

const gstUpdateSchema = gstInputSchema.partial().extend({
  id: z.number().int().positive(),
});

function requireCompanyId(companyId?: number | null) {
  if (!companyId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Your account is not linked to a business.",
    });
  }
  return companyId;
}

function validateGstin(gstin?: string) {
  if (!isValidGstin(gstin)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Enter a valid GSTIN.",
    });
  }
}

async function validateCategory(categoryId?: number) {
  if (!categoryId) return;
  const category = await findCategoryById(categoryId);
  if (!category?.isActive) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Select an active category.",
    });
  }
}

async function assertConfig(companyId: number, id: number) {
  const config = await findGstConfigurationById(companyId, id);
  if (!config) {
    throw new TRPCError({ code: "NOT_FOUND", message: "GST mapping not found." });
  }
  return config;
}

async function assertUniqueMapping(input: {
  companyId: number;
  categoryId?: number;
  excludeId?: number;
}) {
  if (!input.categoryId) return;
  const duplicate = await findGstDuplicate({
    companyId: input.companyId,
    categoryId: input.categoryId,
    excludeId: input.excludeId,
  });
  if (duplicate) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "This category already has a GST mapping.",
    });
  }
}

export const gstRouter = createRouter({
  list: ownerQuery
    .input(
      z
        .object({
          search: z.string().trim().optional(),
          status: gstStatusSchema.optional(),
          categoryId: z.number().int().positive().optional(),
        })
        .optional(),
    )
    .query(({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      return findGstConfigurations(companyId, input);
    }),

  detail: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      return assertConfig(companyId, input.id);
    }),

  calculate: ownerQuery
    .input(
      z.object({
        items: z.array(
          z.object({
            categoryId: z.number().int().positive(),
            taxableAmount: z.number().min(0),
          }),
        ),
      }),
    )
    .query(({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      return calculateGstForOrder({ companyId, items: input.items });
    }),

  create: ownerQuery.input(gstInputSchema).mutation(async ({ ctx, input }) => {
    const companyId = requireCompanyId(ctx.user.companyId);
    await validateCategory(input.categoryId);
    await assertUniqueMapping({ companyId, categoryId: input.categoryId });
    validateGstin(input.gstin);
    return createGstConfiguration({
      companyId,
      categoryId: input.categoryId,
      name: input.name,
      gstin: input.gstin,
      hsnCode: input.hsnCode,
      rate: input.rate.toFixed(2),
      status: input.status,
      isDefault: false,
    });
  }),

  update: ownerQuery.input(gstUpdateSchema).mutation(async ({ ctx, input }) => {
    const companyId = requireCompanyId(ctx.user.companyId);
    await assertConfig(companyId, input.id);
    await validateCategory(input.categoryId);
    await assertUniqueMapping({
      companyId,
      categoryId: input.categoryId,
      excludeId: input.id,
    });
    validateGstin(input.gstin);
    const { id, rate, ...data } = input;
    return updateGstConfiguration(companyId, id, {
      ...data,
      rate: rate !== undefined ? rate.toFixed(2) : undefined,
      isDefault: false,
    });
  }),

  delete: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      await assertConfig(companyId, input.id);
      return deleteGstConfiguration(companyId, input.id);
    }),

  stats: ownerQuery.query(({ ctx }) => {
    const companyId = requireCompanyId(ctx.user.companyId);
    return getGstStats(companyId);
  }),
});
