import { getDb } from "./connection";
import {
  gstConfigurations,
  invoiceItems,
  invoices,
  orders,
  type InsertInvoice,
  type InsertInvoiceItem,
} from "@db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

export type InvoiceStatus = NonNullable<InsertInvoice["status"]>;

export type InvoiceListFilters = {
  search?: string;
  status?: InvoiceStatus;
  page?: number;
  size?: number;
};

function formatCompanyAddress(company: {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}) {
  return [
    company.addressLine1,
    company.addressLine2,
    company.city,
    company.state,
    company.postalCode,
    company.country,
  ].filter(Boolean).join(", ");
}

function formatOrderBillingAddress(order: {
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry?: string | null;
}) {
  return [
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    order.shippingCity,
    order.shippingState,
    order.shippingPostalCode,
    order.shippingCountry,
  ].filter(Boolean).join(", ");
}

export async function findInvoicesByCompany(companyId: number, filters?: InvoiceListFilters) {
  const db = getDb();
  const page = Math.max(1, filters?.page ?? 1);
  const size = Math.min(100, Math.max(1, filters?.size ?? 20));
  const conditions = [eq(invoices.companyId, companyId)];

  if (filters?.status) {
    conditions.push(eq(invoices.status, filters.status));
  }
  if (filters?.search?.trim()) {
    const pattern = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(invoices.invoiceNumber, pattern),
        ilike(invoices.customerName, pattern),
        ilike(invoices.orderNumber, pattern),
      )!,
    );
  }

  const items = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      orderNumber: invoices.orderNumber,
      status: invoices.status,
      invoiceDate: invoices.invoiceDate,
      customerName: invoices.customerName,
      totalAmount: invoices.totalAmount,
      createdAt: invoices.createdAt,
    })
    .from(invoices)
    .where(and(...conditions))
    .orderBy(desc(invoices.invoiceDate))
    .limit(size)
    .offset((page - 1) * size);

  const totalRows = await db
    .select({ total: sql<number>`count(*)` })
    .from(invoices)
    .where(and(...conditions));

  return {
    items,
    total: Number(totalRows[0]?.total ?? 0),
    page,
    size,
  };
}

export async function findInvoiceById(invoiceId: number) {
  const rows = await getDb()
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);
  return rows[0] ?? null;
}

export async function findInvoiceByOrderId(orderId: number) {
  const rows = await getDb()
    .select()
    .from(invoices)
    .where(eq(invoices.orderId, orderId))
    .limit(1);
  return rows[0] ?? null;
}

export async function findInvoiceWithDetails(invoiceId: number) {
  const invoice = await findInvoiceById(invoiceId);
  if (!invoice) return null;

  const items = await getDb()
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoice.id))
    .orderBy(invoiceItems.createdAt);

  return { ...invoice, items };
}

async function nextInvoiceNumber() {
  const rows = await getDb()
    .select({ nextId: sql<number>`coalesce(max(${invoices.id}), 0) + 1` })
    .from(invoices);
  return `INV-${String(Number(rows[0]?.nextId ?? 1)).padStart(6, "0")}`;
}

export async function generateInvoiceFromOrder(orderId: number) {
  const db = getDb();
  const existing = await findInvoiceByOrderId(orderId);
  if (existing) return existing;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      buyer: true,
      supplier: true,
      items: true,
    },
  });

  if (!order || order.status !== "delivered" || !order.buyer || !order.supplier) {
    return null;
  }
  if (!order.items.length) {
    return null;
  }

  const invoiceNumber = await nextInvoiceNumber();
  const gstConfig = order.gstConfigId
    ? await db.query.gstConfigurations.findFirst({
        where: eq(gstConfigurations.id, order.gstConfigId),
      })
    : null;
  const invoiceData: InsertInvoice = {
    companyId: order.supplierId,
    orderId: order.id,
    invoiceNumber,
    orderNumber: order.orderNumber,
    status: "generated",
    companyName: order.supplier.name,
    companyPhone: order.supplier.phone,
    companyAddress: formatCompanyAddress(order.supplier),
    customerName: order.buyer.name,
    customerPhone: order.buyer.phone,
    billingAddress: formatOrderBillingAddress(order),
    subtotal: order.subtotal,
    taxAmount: order.taxAmount ?? "0.00",
    shippingAmount: order.shippingAmount ?? "0.00",
    gstRate: gstConfig?.rate ?? "0.00",
    gstin: gstConfig?.gstin,
    totalAmount: order.totalAmount,
  };

  const items: Array<Omit<InsertInvoiceItem, "id" | "createdAt" | "invoiceId">> = order.items.map((item) => ({
    productName: item.productName,
    quantity: item.quantity,
    unitType: item.unitType,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
  }));

  return db.transaction(async (tx) => {
    const [invoice] = await tx
      .insert(invoices)
      .values(invoiceData)
      .returning();

    await tx.insert(invoiceItems).values(
      items.map((item) => ({
        ...item,
        invoiceId: invoice.id,
      })),
    );

    return invoice;
  });
}
