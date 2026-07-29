import { getDb } from "./connection";
import {
  companies,
  customers,
  orders,
  type InsertCustomer,
} from "@db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

export type CustomerStatus = NonNullable<InsertCustomer["status"]>;

export type CustomerListFilters = {
  search?: string;
  status?: CustomerStatus;
  page?: number;
  size?: number;
};

function withoutUndefined<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function normalizedPostalCode(value?: string | null) {
  return value?.trim().replace(/\s+/g, "").toUpperCase() || undefined;
}

export async function findCustomersByOwner(
  ownerCompanyId: number,
  filters?: CustomerListFilters,
) {
  const db = getDb();
  const page = Math.max(1, filters?.page ?? 1);
  const size = Math.min(100, Math.max(1, filters?.size ?? 20));
  const conditions = [eq(customers.ownerCompanyId, ownerCompanyId)];

  if (filters?.status) {
    conditions.push(eq(customers.status, filters.status));
  }
  if (filters?.search?.trim()) {
    const pattern = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(customers.name, pattern),
        ilike(customers.contactName, pattern),
        ilike(customers.email, pattern),
        ilike(customers.phone, pattern),
        ilike(customers.city, pattern),
        ilike(customers.postalCode, pattern),
      )!,
    );
  }

  const items = await db
    .select({
      id: customers.id,
      ownerCompanyId: customers.ownerCompanyId,
      buyerCompanyId: customers.buyerCompanyId,
      name: customers.name,
      contactName: customers.contactName,
      email: customers.email,
      phone: customers.phone,
      status: customers.status,
      city: customers.city,
      state: customers.state,
      postalCode: customers.postalCode,
      country: customers.country,
      taxId: customers.taxId,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
      linkedCompanyName: companies.name,
      orderCount: sql<number>`count(${orders.id})`,
      lifetimeValue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`,
      lastOrderAt: sql<Date | null>`max(${orders.orderedAt})`,
    })
    .from(customers)
    .leftJoin(companies, eq(customers.buyerCompanyId, companies.id))
    .leftJoin(
      orders,
      and(
        eq(orders.supplierId, customers.ownerCompanyId),
        eq(orders.buyerId, customers.buyerCompanyId),
      ),
    )
    .where(and(...conditions))
    .groupBy(customers.id, companies.name)
    .orderBy(desc(customers.updatedAt))
    .limit(size)
    .offset((page - 1) * size);

  const totalRows = await db
    .select({ total: sql<number>`count(*)` })
    .from(customers)
    .where(and(...conditions));

  return {
    items,
    total: Number(totalRows[0]?.total ?? 0),
    page,
    size,
  };
}

export async function findCustomerById(ownerCompanyId: number, id: number) {
  const db = getDb();
  const rows = await db
    .select({
      id: customers.id,
      ownerCompanyId: customers.ownerCompanyId,
      buyerCompanyId: customers.buyerCompanyId,
      name: customers.name,
      contactName: customers.contactName,
      email: customers.email,
      phone: customers.phone,
      status: customers.status,
      addressLine1: customers.addressLine1,
      addressLine2: customers.addressLine2,
      city: customers.city,
      state: customers.state,
      postalCode: customers.postalCode,
      country: customers.country,
      taxId: customers.taxId,
      notes: customers.notes,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
      linkedCompanyName: companies.name,
    })
    .from(customers)
    .leftJoin(companies, eq(customers.buyerCompanyId, companies.id))
    .where(and(eq(customers.ownerCompanyId, ownerCompanyId), eq(customers.id, id)))
    .limit(1);

  return rows[0] ?? null;
}

export async function findCustomerOrderHistory(ownerCompanyId: number, customerId: number) {
  const customer = await findCustomerById(ownerCompanyId, customerId);
  if (!customer?.buyerCompanyId) return [];

  return getDb()
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      subtotal: orders.subtotal,
      taxAmount: orders.taxAmount,
      shippingAmount: orders.shippingAmount,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      deliveryEstimate: orders.deliveryEstimate,
      orderedAt: orders.orderedAt,
    })
    .from(orders)
    .where(
      and(
        eq(orders.supplierId, ownerCompanyId),
        eq(orders.buyerId, customer.buyerCompanyId),
      ),
    )
    .orderBy(desc(orders.orderedAt));
}

export async function findCustomerDuplicate(input: {
  ownerCompanyId: number;
  email?: string;
  phone?: string;
  buyerCompanyId?: number;
  excludeId?: number;
}) {
  const conditions = [eq(customers.ownerCompanyId, input.ownerCompanyId)];
  const matches = [];
  if (input.email) matches.push(ilike(customers.email, input.email));
  if (input.phone) matches.push(eq(customers.phone, input.phone));
  if (input.buyerCompanyId) matches.push(eq(customers.buyerCompanyId, input.buyerCompanyId));
  if (!matches.length) return null;
  conditions.push(or(...matches)!);
  if (input.excludeId) {
    conditions.push(sql`${customers.id} <> ${input.excludeId}`);
  }

  const rows = await getDb()
    .select({ id: customers.id })
    .from(customers)
    .where(and(...conditions))
    .limit(1);
  return rows[0] ?? null;
}

export async function createCustomer(data: InsertCustomer) {
  const [customer] = await getDb()
    .insert(customers)
    .values({
      ...data,
      postalCode: normalizedPostalCode(data.postalCode),
    })
    .returning();
  return customer;
}

export async function updateCustomer(id: number, data: Partial<InsertCustomer>) {
  const updates = withoutUndefined({
    ...data,
    postalCode: normalizedPostalCode(data.postalCode),
    updatedAt: new Date(),
  });
  const [customer] = await getDb()
    .update(customers)
    .set(updates)
    .where(eq(customers.id, id))
    .returning();
  return customer;
}

export async function deleteCustomer(id: number) {
  const [customer] = await getDb()
    .update(customers)
    .set({ status: "inactive", updatedAt: new Date() })
    .where(eq(customers.id, id))
    .returning();
  return customer;
}

export async function getCustomerStats(ownerCompanyId: number) {
  const rows = await getDb()
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${customers.status} = 'active')`,
      blocked: sql<number>`count(*) filter (where ${customers.status} = 'blocked')`,
    })
    .from(customers)
    .where(eq(customers.ownerCompanyId, ownerCompanyId));

  return {
    total: Number(rows[0]?.total ?? 0),
    active: Number(rows[0]?.active ?? 0),
    blocked: Number(rows[0]?.blocked ?? 0),
  };
}
