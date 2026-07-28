import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { isOwner } from "@contracts/roles";
import { createRouter, ownerQuery } from "./middleware";
import {
  getBusinessSummary,
  getDashboardSummary,
  getInventoryReport,
  getInvoiceReport,
  getOrderReport,
  getProductPerformanceReport,
  getSalesReport,
  reportPeriods,
} from "./queries/reports";

const periodSchema = z.enum(reportPeriods);

function requireCompanyId(companyId?: number | null) {
  if (!companyId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "User is not associated with a company.",
    });
  }
  return companyId;
}

function ownerScopeCompanyId(user: { role?: string | null; email?: string | null; companyId?: number | null }) {
  return user.role === "admin" || isOwner(user) ? undefined : requireCompanyId(user.companyId);
}

const periodInput = z.object({
  period: periodSchema.default("today"),
});

export const reportRouter = createRouter({
  dashboardSummary: ownerQuery
    .input(periodInput.optional())
    .query(async ({ ctx, input }) => {
      return getDashboardSummary(ownerScopeCompanyId(ctx.user), input?.period ?? "today");
    }),

  sales: ownerQuery
    .input(periodInput.optional())
    .query(async ({ ctx, input }) => {
      return getSalesReport(requireCompanyId(ctx.user.companyId), input?.period ?? "today");
    }),

  orders: ownerQuery
    .input(periodInput.optional())
    .query(async ({ ctx, input }) => {
      return getOrderReport(requireCompanyId(ctx.user.companyId), input?.period ?? "today");
    }),

  inventory: ownerQuery.query(async ({ ctx }) => {
    return getInventoryReport(requireCompanyId(ctx.user.companyId));
  }),

  products: ownerQuery
    .input(periodInput.optional())
    .query(async ({ ctx, input }) => {
      return getProductPerformanceReport(requireCompanyId(ctx.user.companyId), input?.period ?? "today");
    }),

  invoices: ownerQuery
    .input(periodInput.optional())
    .query(async ({ ctx, input }) => {
      return getInvoiceReport(requireCompanyId(ctx.user.companyId), input?.period ?? "today");
    }),

  businessSummary: ownerQuery
    .input(periodInput.optional())
    .query(async ({ ctx, input }) => {
      return getBusinessSummary(requireCompanyId(ctx.user.companyId), input?.period ?? "today");
    }),
});
