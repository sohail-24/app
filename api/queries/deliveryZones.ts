import { getDb } from "./connection";
import {
  deliveryZones,
  warehouses,
  type InsertDeliveryZone,
} from "@db/schema";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

export type DeliveryEstimate = NonNullable<InsertDeliveryZone["deliveryEstimate"]>;

export type DeliveryZoneFilters = {
  search?: string;
  isActive?: boolean;
  warehouseId?: number;
};

function withoutUndefined<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export function normalizeState(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function findDeliveryZonesByCompany(
  companyId: number,
  filters?: DeliveryZoneFilters,
) {
  const conditions = [eq(deliveryZones.companyId, companyId)];
  if (filters?.isActive !== undefined) {
    conditions.push(eq(deliveryZones.isActive, filters.isActive));
  }
  if (filters?.warehouseId) {
    conditions.push(eq(deliveryZones.warehouseId, filters.warehouseId));
  }
  if (filters?.search?.trim()) {
    const pattern = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(deliveryZones.name, pattern),
        ilike(deliveryZones.state, pattern),
        ilike(warehouses.name, pattern),
      )!,
    );
  }

  return getDb()
    .select({
      id: deliveryZones.id,
      companyId: deliveryZones.companyId,
      warehouseId: deliveryZones.warehouseId,
      name: deliveryZones.name,
      state: deliveryZones.state,
      deliveryEstimate: deliveryZones.deliveryEstimate,
      deliveryFee: deliveryZones.deliveryFee,
      minimumOrderAmount: deliveryZones.minimumOrderAmount,
      isActive: deliveryZones.isActive,
      createdAt: deliveryZones.createdAt,
      updatedAt: deliveryZones.updatedAt,
      warehouseName: warehouses.name,
    })
    .from(deliveryZones)
    .leftJoin(warehouses, eq(deliveryZones.warehouseId, warehouses.id))
    .where(and(...conditions))
    .orderBy(asc(deliveryZones.state));
}

export async function findDeliveryZoneById(companyId: number, id: number) {
  const rows = await getDb()
    .select({
      id: deliveryZones.id,
      companyId: deliveryZones.companyId,
      warehouseId: deliveryZones.warehouseId,
      name: deliveryZones.name,
      state: deliveryZones.state,
      deliveryEstimate: deliveryZones.deliveryEstimate,
      deliveryFee: deliveryZones.deliveryFee,
      minimumOrderAmount: deliveryZones.minimumOrderAmount,
      isActive: deliveryZones.isActive,
      createdAt: deliveryZones.createdAt,
      updatedAt: deliveryZones.updatedAt,
      warehouseName: warehouses.name,
    })
    .from(deliveryZones)
    .leftJoin(warehouses, eq(deliveryZones.warehouseId, warehouses.id))
    .where(and(eq(deliveryZones.companyId, companyId), eq(deliveryZones.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function findDeliveryZoneForState(companyId: number, state: string) {
  const normalized = normalizeState(state);
  const rows = await getDb()
    .select({
      id: deliveryZones.id,
      companyId: deliveryZones.companyId,
      warehouseId: deliveryZones.warehouseId,
      name: deliveryZones.name,
      state: deliveryZones.state,
      deliveryEstimate: deliveryZones.deliveryEstimate,
      deliveryFee: deliveryZones.deliveryFee,
      minimumOrderAmount: deliveryZones.minimumOrderAmount,
      isActive: deliveryZones.isActive,
      createdAt: deliveryZones.createdAt,
      updatedAt: deliveryZones.updatedAt,
      warehouseName: warehouses.name,
    })
    .from(deliveryZones)
    .leftJoin(warehouses, eq(deliveryZones.warehouseId, warehouses.id))
    .where(
      and(
        eq(deliveryZones.companyId, companyId),
        ilike(deliveryZones.state, normalized),
        eq(deliveryZones.isActive, true),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function findDeliveryZoneForStateAnyStatus(companyId: number, state: string) {
  const normalized = normalizeState(state);
  const rows = await getDb()
    .select({ id: deliveryZones.id, name: deliveryZones.name })
    .from(deliveryZones)
    .where(
      and(
        eq(deliveryZones.companyId, companyId),
        ilike(deliveryZones.state, normalized),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function createDeliveryZone(data: InsertDeliveryZone) {
  const [zone] = await getDb().insert(deliveryZones).values(data).returning();
  return zone;
}

export async function updateDeliveryZone(id: number, data: Partial<InsertDeliveryZone>) {
  const [zone] = await getDb()
    .update(deliveryZones)
    .set(withoutUndefined({ ...data, updatedAt: new Date() }))
    .where(eq(deliveryZones.id, id))
    .returning();
  return zone;
}

export async function deleteDeliveryZone(id: number) {
  const [zone] = await getDb()
    .update(deliveryZones)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(deliveryZones.id, id))
    .returning();
  return zone;
}

export async function getDeliveryZoneStats(companyId: number) {
  const rows = await getDb()
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${deliveryZones.isActive} = true)`,
      states: sql<number>`count(distinct ${deliveryZones.state})`,
    })
    .from(deliveryZones)
    .where(eq(deliveryZones.companyId, companyId));
  return {
    total: Number(rows[0]?.total ?? 0),
    active: Number(rows[0]?.active ?? 0),
    states: Number(rows[0]?.states ?? 0),
  };
}
