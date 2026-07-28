import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter, ownerQuery } from "./middleware";
import {
  findInvoiceByOrderId,
  findInvoicesByCompany,
  findInvoiceWithDetails,
  type InvoiceStatus,
} from "./queries/invoices";

const invoiceStatuses = ["generated"] as const satisfies readonly InvoiceStatus[];
const invoiceStatusSchema = z.enum(invoiceStatuses);

function requireCompanyId(companyId?: number | null) {
  if (!companyId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User is not associated with a company.",
    });
  }
  return companyId;
}

function assertInvoiceAccess(input: {
  user: { role: string; companyId?: number | null };
  invoice: { companyId: number };
}) {
  if (input.user.role === "admin") return;
  if (input.user.companyId !== input.invoice.companyId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to view this invoice.",
    });
  }
}

export const invoiceRouter = createRouter({
  list: ownerQuery
    .input(
      z
        .object({
          search: z.string().trim().optional(),
          status: invoiceStatusSchema.optional(),
          page: z.number().int().min(1).optional(),
          size: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const companyId = requireCompanyId(ctx.user.companyId);
      return findInvoicesByCompany(companyId, input);
    }),

  detail: ownerQuery
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const invoice = await findInvoiceWithDetails(input.invoiceId);
      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found.",
        });
      }
      assertInvoiceAccess({ user: ctx.user, invoice });
      return invoice;
    }),

  byOrder: ownerQuery
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const invoice = await findInvoiceByOrderId(input.orderId);
      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found.",
        });
      }
      assertInvoiceAccess({ user: ctx.user, invoice });
      return invoice;
    }),

  print: ownerQuery
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const invoice = await findInvoiceWithDetails(input.invoiceId);
      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found.",
        });
      }
      assertInvoiceAccess({ user: ctx.user, invoice });
      return invoice;
    }),
});
