import { getDb } from "./connection";
import { orders, orderItems, companies } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// ─── Order Queries ───

export async function findOrdersByBuyer(buyerId: number) {
  const db = getDb();
  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      buyerId: orders.buyerId,
      supplierId: orders.supplierId,
      placedByUserId: orders.placedByUserId,
      subtotal: orders.subtotal,
      taxAmount: orders.taxAmount,
      shippingAmount: orders.shippingAmount,
      discountAmount: orders.discountAmount,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      shippingMethod: orders.shippingMethod,
      trackingNumber: orders.trackingNumber,
      orderedAt: orders.orderedAt,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      supplierName: companies.name,
    })
    .from(orders)
    .leftJoin(companies, eq(orders.supplierId, companies.id))
    .where(eq(orders.buyerId, buyerId))
    .orderBy(desc(orders.createdAt));
}

export async function findOrdersBySupplier(supplierId: number) {
  const db = getDb();
  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      buyerId: orders.buyerId,
      supplierId: orders.supplierId,
      placedByUserId: orders.placedByUserId,
      subtotal: orders.subtotal,
      taxAmount: orders.taxAmount,
      shippingAmount: orders.shippingAmount,
      discountAmount: orders.discountAmount,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      shippingMethod: orders.shippingMethod,
      trackingNumber: orders.trackingNumber,
      orderedAt: orders.orderedAt,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      buyerName: companies.name,
    })
    .from(orders)
    .leftJoin(companies, eq(orders.buyerId, companies.id))
    .where(eq(orders.supplierId, supplierId))
    .orderBy(desc(orders.createdAt));
}

export async function findOrderById(orderId: number) {
  const db = getDb();
  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      buyerId: orders.buyerId,
      supplierId: orders.supplierId,
      placedByUserId: orders.placedByUserId,
      subtotal: orders.subtotal,
      taxAmount: orders.taxAmount,
      shippingAmount: orders.shippingAmount,
      discountAmount: orders.discountAmount,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      shippingAddressLine1: orders.shippingAddressLine1,
      shippingAddressLine2: orders.shippingAddressLine2,
      shippingCity: orders.shippingCity,
      shippingState: orders.shippingState,
      shippingPostalCode: orders.shippingPostalCode,
      shippingCountry: orders.shippingCountry,
      shippingMethod: orders.shippingMethod,
      trackingNumber: orders.trackingNumber,
      estimatedDeliveryDate: orders.estimatedDeliveryDate,
      orderedAt: orders.orderedAt,
      confirmedAt: orders.confirmedAt,
      shippedAt: orders.shippedAt,
      deliveredAt: orders.deliveredAt,
      cancelledAt: orders.cancelledAt,
      buyerNotes: orders.buyerNotes,
      sellerNotes: orders.sellerNotes,
      internalNotes: orders.internalNotes,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  return rows[0] ?? null;
}

export async function findOrderItems(orderId: number) {
  const db = getDb();
  return db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(orderItems.createdAt);
}

export async function findOrderWithDetails(orderId: number) {
  const order = await findOrderById(orderId);
  if (!order) return null;

  const items = await findOrderItems(orderId);
  return { ...order, items };
}

export async function createOrder(data: {
  orderNumber: string;
  buyerId: number;
  supplierId: number;
  placedByUserId: number;
  subtotal: string;
  taxAmount?: string;
  shippingAmount?: string;
  discountAmount?: string;
  totalAmount: string;
  currency?: string;
  shippingAddressLine1?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  shippingMethod?: string;
  buyerNotes?: string;
}) {
  const db = getDb();
  const result = await db
    .insert(orders)
    .values(data)
    .returning({ id: orders.id });
  return result[0].id;
}

export async function createOrderItems(
  items: Array<{
    orderId: number;
    productId: number;
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    unitType: string;
    notes?: string;
  }>
) {
  const db = getDb();
  const typedItems = items.map((item) => ({
    ...item,
    unitType: item.unitType as
      | "kg"
      | "lb"
      | "case"
      | "pallet"
      | "each"
      | "bunch"
      | "box"
      | "bag",
  }));
  await db.insert(orderItems).values(typedItems);
}

export async function updateOrderStatus(
  orderId: number,
  status: string,
  timestampField?: string
) {
  const db = getDb();
  const updates: Record<string, unknown> = { status: status as any };
  if (timestampField) {
    updates[timestampField] = new Date();
  }
  await db.update(orders).set(updates).where(eq(orders.id, orderId));
}

export async function countOrdersByStatus(companyId: number) {
  const db = getDb();
  const result = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.buyerId, companyId),
        sql`${orders.status} != 'cancelled'`
      )
    )
    .groupBy(orders.status);

  return result;
}

export async function getRecentOrders(companyId: number, limit = 5) {
  const db = getDb();
  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      totalAmount: orders.totalAmount,
      status: orders.status,
      orderedAt: orders.orderedAt,
      supplierName: companies.name,
    })
    .from(orders)
    .leftJoin(companies, eq(orders.supplierId, companies.id))
    .where(eq(orders.buyerId, companyId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}
