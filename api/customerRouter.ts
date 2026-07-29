import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter, ownerQuery } from "./middleware";
import { findCompanyById } from "./queries/companies";
import {
  createCustomer,
  deleteCustomer,
  findCustomerById,
  findCustomerDuplicate,
  findCustomerOrderHistory,
  findCustomersByOwner,
  getCustomerStats,
  updateCustomer,
} from "./queries/customers";

const customerStatusSchema = z.enum(["active", "inactive", "blocked"]);

const emptyToUndefined = z.literal("").transform(() => undefined);
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(emptyToUndefined);

const customerInputSchema = z.object({
  buyerCompanyId: z.number().int().positive().optional(),
  name: z.string().trim().min(2, "Customer name is required.").max(255),
  contactName: optionalText(255),
  email: z.string().trim().email("Enter a valid email.").optional().or(emptyToUndefined),
  phone: optionalText(50),
  status: customerStatusSchema.default("active"),
  addressLine1: optionalText(255),
  addressLine2: optionalText(255),
  city: optionalText(100),
  state: optionalText(100),
  postalCode: optionalText(20),
  country: optionalText(100),
  taxId: optionalText(100),
  notes: optionalText(4000),
});

const customerUpdateSchema = customerInputSchema.partial().extend({
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

async function validateBuyerCompany(buyerCompanyId?: number) {
  if (!buyerCompanyId) return;
  const company = await findCompanyById(buyerCompanyId);
  if (!company || !company.isActive || !["buyer", "both"].includes(company.type)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Select an active buyer company.",
    });
  }
}

async function assertCustomerOwner(ownerCompanyId: number, id: number) {
  const customer = await findCustomerById(ownerCompanyId, id);
  if (!customer) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Customer not found.",
    });
  }
  return customer;
}

async function assertUniqueCustomer(input: {
  ownerCompanyId: number;
  email?: string;
  phone?: string;
  buyerCompanyId?: number;
  excludeId?: number;
}) {
  const duplicate = await findCustomerDuplicate(input);
  if (duplicate) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "A matching customer already exists.",
    });
  }
}

export const customerRouter = createRouter({
  list: ownerQuery
    .input(
      z
        .object({
          search: z.string().trim().optional(),
          status: customerStatusSchema.optional(),
          page: z.number().int().min(1).optional(),
          size: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(({ ctx, input }) => {
      const ownerCompanyId = requireCompanyId(ctx.user.companyId);
      return findCustomersByOwner(ownerCompanyId, input);
    }),

  detail: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const ownerCompanyId = requireCompanyId(ctx.user.companyId);
      return assertCustomerOwner(ownerCompanyId, input.id);
    }),

  orderHistory: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const ownerCompanyId = requireCompanyId(ctx.user.companyId);
      await assertCustomerOwner(ownerCompanyId, input.id);
      return findCustomerOrderHistory(ownerCompanyId, input.id);
    }),

  create: ownerQuery.input(customerInputSchema).mutation(async ({ ctx, input }) => {
    const ownerCompanyId = requireCompanyId(ctx.user.companyId);
    await validateBuyerCompany(input.buyerCompanyId);
    await assertUniqueCustomer({
      ownerCompanyId,
      email: input.email,
      phone: input.phone,
      buyerCompanyId: input.buyerCompanyId,
    });
    return createCustomer({
      ...input,
      ownerCompanyId,
    });
  }),

  update: ownerQuery.input(customerUpdateSchema).mutation(async ({ ctx, input }) => {
    const ownerCompanyId = requireCompanyId(ctx.user.companyId);
    await assertCustomerOwner(ownerCompanyId, input.id);
    await validateBuyerCompany(input.buyerCompanyId);
    await assertUniqueCustomer({
      ownerCompanyId,
      email: input.email,
      phone: input.phone,
      buyerCompanyId: input.buyerCompanyId,
      excludeId: input.id,
    });
    const { id, ...data } = input;
    return updateCustomer(id, data);
  }),

  delete: ownerQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const ownerCompanyId = requireCompanyId(ctx.user.companyId);
      await assertCustomerOwner(ownerCompanyId, input.id);
      return deleteCustomer(input.id);
    }),

  stats: ownerQuery.query(({ ctx }) => {
    const ownerCompanyId = requireCompanyId(ctx.user.companyId);
    return getCustomerStats(ownerCompanyId);
  }),
});
