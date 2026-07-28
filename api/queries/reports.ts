import { getDb } from "./connection";
import { inventory, invoices, orderItems, orders, products } from "@db/schema";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";

export const reportPeriods = ["today", "this_week", "this_month"] as const;
export type ReportPeriod = (typeof reportPeriods)[number];

function getPeriodStart(period: ReportPeriod) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (period === "this_week") {
    const day = start.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + mondayOffset);
  }

  if (period === "this_month") {
    start.setDate(1);
  }

  return start;
}

export async function getDashboardSummary(companyId: number | undefined, period: ReportPeriod) {
  const db = getDb();
  const periodStart = getPeriodStart(period);
  const invoiceCompanyFilter = companyId ? eq(invoices.companyId, companyId) : undefined;
  const orderCompanyFilter = companyId ? eq(orders.supplierId, companyId) : undefined;
  const productCompanyFilter = companyId ? eq(products.supplierId, companyId) : undefined;
  const inventoryCompanyFilter = companyId ? eq(inventory.supplierId, companyId) : undefined;

  const [revenueRow] = await db
    .select({
      revenue: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
      invoices: sql<number>`count(*)`,
    })
    .from(invoices)
    .where(
      invoiceCompanyFilter
        ? and(invoiceCompanyFilter, gte(invoices.invoiceDate, periodStart))
        : gte(invoices.invoiceDate, periodStart),
    );

  const [ordersRow] = await db
    .select({ orders: sql<number>`count(*)` })
    .from(orders)
    .where(
      orderCompanyFilter
        ? and(orderCompanyFilter, gte(orders.orderedAt, periodStart))
        : gte(orders.orderedAt, periodStart),
    );

  const [productsRow] = await db
    .select({ products: sql<number>`count(*)` })
    .from(products)
    .where(productCompanyFilter);

  const [inventoryRow] = await db
    .select({
      inventory: sql<number>`coalesce(sum(${inventory.quantityAvailable}), 0)`,
      lowStock: sql<number>`count(*) filter (where ${inventory.status} = 'low_stock')`,
      outOfStock: sql<number>`count(*) filter (where ${inventory.status} = 'out_of_stock')`,
    })
    .from(inventory)
    .where(inventoryCompanyFilter);

  return {
    revenue: Number(revenueRow?.revenue ?? 0),
    orders: Number(ordersRow?.orders ?? 0),
    products: Number(productsRow?.products ?? 0),
    inventory: Number(inventoryRow?.inventory ?? 0),
    invoices: Number(revenueRow?.invoices ?? 0),
    lowStock: Number(inventoryRow?.lowStock ?? 0),
    outOfStock: Number(inventoryRow?.outOfStock ?? 0),
  };
}

export async function getSalesReport(companyId: number, period: ReportPeriod) {
  const periodStart = getPeriodStart(period);
  const [row] = await getDb()
    .select({
      revenue: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
      orderCount: sql<number>`count(distinct ${invoices.orderId})`,
    })
    .from(invoices)
    .where(and(eq(invoices.companyId, companyId), gte(invoices.invoiceDate, periodStart)));

  const revenue = Number(row?.revenue ?? 0);
  const orderCount = Number(row?.orderCount ?? 0);

  return {
    revenue,
    orderCount,
    averageOrderValue: orderCount > 0 ? revenue / orderCount : 0,
  };
}

export async function getOrderReport(companyId: number, period: ReportPeriod) {
  const rows = await getDb()
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(eq(orders.supplierId, companyId), gte(orders.orderedAt, getPeriodStart(period))))
    .groupBy(orders.status);

  const counts = Object.fromEntries(rows.map((row) => [row.status, Number(row.count)]));

  return {
    totalOrders: rows.reduce((sum, row) => sum + Number(row.count), 0),
    pendingOrders: counts.pending ?? 0,
    confirmedOrders: counts.confirmed ?? 0,
    deliveredOrders: counts.delivered ?? 0,
  };
}

export async function getInventoryReport(companyId: number) {
  const db = getDb();
  const [summary] = await db
    .select({
      availableStock: sql<number>`coalesce(sum(${inventory.quantityAvailable}), 0)`,
      lowStockProducts: sql<number>`count(*) filter (where ${inventory.status} = 'low_stock')`,
      outOfStockProducts: sql<number>`count(*) filter (where ${inventory.status} = 'out_of_stock')`,
    })
    .from(inventory)
    .where(eq(inventory.supplierId, companyId));

  const lowStockItems = await db
    .select({
      productId: inventory.productId,
      productName: products.name,
      availableStock: inventory.quantityAvailable,
      status: inventory.status,
    })
    .from(inventory)
    .leftJoin(products, eq(inventory.productId, products.id))
    .where(and(eq(inventory.supplierId, companyId), eq(inventory.status, "low_stock")))
    .orderBy(asc(inventory.quantityAvailable))
    .limit(5);

  return {
    availableStock: Number(summary?.availableStock ?? 0),
    lowStockProducts: Number(summary?.lowStockProducts ?? 0),
    outOfStockProducts: Number(summary?.outOfStockProducts ?? 0),
    lowStockItems,
  };
}

export async function getProductPerformanceReport(companyId: number, period: ReportPeriod) {
  const rows = await getDb()
    .select({
      productId: orderItems.productId,
      productName: orderItems.productName,
      quantitySold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
      revenue: sql<string>`coalesce(sum(${orderItems.totalPrice}), 0)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(eq(orders.supplierId, companyId), gte(orders.orderedAt, getPeriodStart(period))))
    .groupBy(orderItems.productId, orderItems.productName);

  const ranked = rows
    .map((row) => ({
      ...row,
      quantitySold: Number(row.quantitySold),
      revenue: Number(row.revenue),
    }))
    .sort((a, b) => b.quantitySold - a.quantitySold);

  return {
    bestSellingProducts: ranked.slice(0, 5),
    leastSellingProducts: [...ranked].sort((a, b) => a.quantitySold - b.quantitySold).slice(0, 5),
  };
}

export async function getInvoiceReport(companyId: number, period: ReportPeriod) {
  const db = getDb();
  const [periodRow] = await db
    .select({
      totalInvoices: sql<number>`count(*)`,
      invoiceTotal: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)`,
    })
    .from(invoices)
    .where(and(eq(invoices.companyId, companyId), gte(invoices.invoiceDate, getPeriodStart(period))));

  const [todayRow] = await db
    .select({ dailyInvoiceCount: sql<number>`count(*)` })
    .from(invoices)
    .where(and(eq(invoices.companyId, companyId), gte(invoices.invoiceDate, getPeriodStart("today"))));

  const [monthRow] = await db
    .select({ monthlyInvoiceCount: sql<number>`count(*)` })
    .from(invoices)
    .where(and(eq(invoices.companyId, companyId), gte(invoices.invoiceDate, getPeriodStart("this_month"))));

  const recentInvoices = await db
    .select({
      invoiceNumber: invoices.invoiceNumber,
      customerName: invoices.customerName,
      invoiceDate: invoices.invoiceDate,
      totalAmount: invoices.totalAmount,
    })
    .from(invoices)
    .where(eq(invoices.companyId, companyId))
    .orderBy(desc(invoices.invoiceDate))
    .limit(5);

  return {
    totalInvoices: Number(periodRow?.totalInvoices ?? 0),
    dailyInvoiceCount: Number(todayRow?.dailyInvoiceCount ?? 0),
    monthlyInvoiceCount: Number(monthRow?.monthlyInvoiceCount ?? 0),
    invoiceTotal: Number(periodRow?.invoiceTotal ?? 0),
    recentInvoices,
  };
}

export async function getBusinessSummary(companyId: number, period: ReportPeriod) {
  const [dashboard, sales, ordersReport, inventoryReport, productReport, invoiceReport] =
    await Promise.all([
      getDashboardSummary(companyId, period),
      getSalesReport(companyId, period),
      getOrderReport(companyId, period),
      getInventoryReport(companyId),
      getProductPerformanceReport(companyId, period),
      getInvoiceReport(companyId, period),
    ]);

  return {
    dashboard,
    sales,
    orders: ordersReport,
    inventory: inventoryReport,
    products: productReport,
    invoices: invoiceReport,
  };
}
