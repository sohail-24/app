import { getDb } from "./connection";
import {
  deliveryZones,
  shippingMethods,
  warehouses,
  type InsertShippingMethod,
} from "@db/schema";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { findDeliveryZoneForState } from "./deliveryZones";

export type ShippingStatus = NonNullable<InsertShippingMethod["status"]>;
export type DeliveryEstimate = NonNullable<InsertShippingMethod["deliveryEstimate"]>;

export type ShippingFilters = {
  search?: string;
  status?: ShippingStatus;
  deliveryZoneId?: number;
  warehouseId?: number;
};

function withoutUndefined<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export function calculateShippingCharge(method: {
  charge: string | number;
  freeShippingThreshold?: string | number | null;
}, subtotal: number) {
  const threshold =
    method.freeShippingThreshold === null || method.freeShippingThreshold === undefined
      ? undefined
      : Number(method.freeShippingThreshold);
  if (threshold !== undefined && subtotal >= threshold) return 0;
  return Math.max(0, Number(method.charge) || 0);
}

export async function findShippingMethods(companyId: number, filters?: ShippingFilters) {
  const conditions = [eq(shippingMethods.companyId, companyId)];
  if (filters?.status) conditions.push(eq(shippingMethods.status, filters.status));
  if (filters?.deliveryZoneId) conditions.push(eq(shippingMethods.deliveryZoneId, filters.deliveryZoneId));
  if (filters?.warehouseId) conditions.push(eq(shippingMethods.warehouseId, filters.warehouseId));
  if (filters?.search?.trim()) {
    const pattern = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(shippingMethods.name, pattern),
        ilike(shippingMethods.code, pattern),
        ilike(shippingMethods.description, pattern),
        ilike(deliveryZones.name, pattern),
        ilike(warehouses.name, pattern),
      )!,
    );
  }

  return getDb()
    .select({
      id: shippingMethods.id,
      companyId: shippingMethods.companyId,
      warehouseId: shippingMethods.warehouseId,
      deliveryZoneId: shippingMethods.deliveryZoneId,
      name: shippingMethods.name,
      code: shippingMethods.code,
      description: shippingMethods.description,
      charge: shippingMethods.charge,
      freeShippingThreshold: shippingMethods.freeShippingThreshold,
      deliveryEstimate: shippingMethods.deliveryEstimate,
      status: shippingMethods.status,
      isDefault: shippingMethods.isDefault,
      createdAt: shippingMethods.createdAt,
      updatedAt: shippingMethods.updatedAt,
      warehouseName: warehouses.name,
      zoneName: deliveryZones.name,
      zoneState: deliveryZones.state,
    })
    .from(shippingMethods)
    .leftJoin(warehouses, eq(shippingMethods.warehouseId, warehouses.id))
    .leftJoin(deliveryZones, eq(shippingMethods.deliveryZoneId, deliveryZones.id))
    .where(and(...conditions))
    .orderBy(desc(shippingMethods.isDefault), asc(shippingMethods.name));
}

export async function findShippingMethodById(companyId: number, id: number) {
  const rows = await getDb()
    .select()
    .from(shippingMethods)
    .where(and(eq(shippingMethods.companyId, companyId), eq(shippingMethods.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function findDefaultShippingMethod(companyId: number, deliveryZoneId?: number) {
  const conditions = [
    eq(shippingMethods.companyId, companyId),
    eq(shippingMethods.status, "active" as const),
  ];
  if (deliveryZoneId) {
    conditions.push(
      or(
        eq(shippingMethods.deliveryZoneId, deliveryZoneId),
        sql`${shippingMethods.deliveryZoneId} is null`,
      )!,
    );
  }
  const rows = await getDb()
    .select()
    .from(shippingMethods)
    .where(and(...conditions))
    .orderBy(
      desc(sql`${shippingMethods.deliveryZoneId} = ${deliveryZoneId ?? 0}`),
      desc(shippingMethods.isDefault),
      asc(shippingMethods.createdAt),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function createShippingMethod(data: InsertShippingMethod) {
  const db = getDb();
  return db.transaction(async (tx) => {
    if (data.isDefault) {
      await tx
        .update(shippingMethods)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(shippingMethods.companyId, data.companyId));
    }
    const [method] = await tx.insert(shippingMethods).values(data).returning();
    return method;
  });
}

export async function updateShippingMethod(
  companyId: number,
  id: number,
  data: Partial<InsertShippingMethod>,
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    if (data.isDefault) {
      await tx
        .update(shippingMethods)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(eq(shippingMethods.companyId, companyId), sql`${shippingMethods.id} <> ${id}`));
    }
    const [method] = await tx
      .update(shippingMethods)
      .set(withoutUndefined({ ...data, updatedAt: new Date() }))
      .where(and(eq(shippingMethods.companyId, companyId), eq(shippingMethods.id, id)))
      .returning();
    return method;
  });
}

export async function deleteShippingMethod(companyId: number, id: number) {
  const [method] = await getDb()
    .update(shippingMethods)
    .set({ status: "inactive", isDefault: false, updatedAt: new Date() })
    .where(and(eq(shippingMethods.companyId, companyId), eq(shippingMethods.id, id)))
    .returning();
  return method;
}

export async function calculateShippingForOrder(input: {
  companyId: number;
  subtotal: number;
  state?: string;
  shippingMethodId?: number;
}) {
  const zone = input.state
    ? await findDeliveryZoneForState(input.companyId, input.state)
    : null;
  const method = input.shippingMethodId
    ? await findShippingMethodById(input.companyId, input.shippingMethodId)
    : await findDefaultShippingMethod(input.companyId, zone?.id);
  if (!method || method.status !== "active") {
    return {
      shippingMethodId: undefined,
      deliveryZoneId: zone?.id,
      warehouseId: zone?.warehouseId ?? undefined,
      shippingMethod: undefined,
      shippingAmount: zone ? Number(zone.deliveryFee) || 0 : 0,
      deliveryEstimate: zone?.deliveryEstimate,
      available: !!zone,
    };
  }
  return {
    shippingMethodId: method.id,
    deliveryZoneId: zone?.id ?? method.deliveryZoneId ?? undefined,
    warehouseId: method.warehouseId ?? zone?.warehouseId ?? undefined,
    shippingMethod: method.name,
    shippingAmount: calculateShippingCharge(method, input.subtotal),
    deliveryEstimate: method.deliveryEstimate,
    available: !input.state || !!zone,
  };
}

export async function getShippingStats(companyId: number) {
  const rows = await getDb()
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${shippingMethods.status} = 'active')`,
      averageCharge: sql<string>`coalesce(avg(${shippingMethods.charge}), 0)`,
    })
    .from(shippingMethods)
    .where(eq(shippingMethods.companyId, companyId));
  return {
    total: Number(rows[0]?.total ?? 0),
    active: Number(rows[0]?.active ?? 0),
    averageCharge: Number(rows[0]?.averageCharge ?? 0),
  };
}
