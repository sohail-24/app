import { getDb } from "./connection";
import {
  categories,
  gstConfigurations,
  type InsertGstConfiguration,
} from "@db/schema";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

export type GstStatus = NonNullable<InsertGstConfiguration["status"]>;

export type GstFilters = {
  search?: string;
  status?: GstStatus;
  categoryId?: number;
};

export type GstLineItem = {
  categoryId: number;
  taxableAmount: number;
};

function withoutUndefined<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export function normalizeGstin(value?: string | null) {
  return value?.trim().toUpperCase() || undefined;
}

export function isValidGstin(value?: string | null) {
  const gstin = normalizeGstin(value);
  if (!gstin) return true;
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin);
}

export function calculateGstAmount(subtotal: number, rate: number) {
  return Math.max(0, subtotal) * (Math.max(0, rate) / 100);
}

export async function findGstConfigurations(companyId: number, filters?: GstFilters) {
  const conditions = [eq(gstConfigurations.companyId, companyId)];
  if (filters?.status) {
    conditions.push(eq(gstConfigurations.status, filters.status));
  }
  if (filters?.categoryId) {
    conditions.push(eq(gstConfigurations.categoryId, filters.categoryId));
  }
  if (filters?.search?.trim()) {
    const pattern = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        ilike(gstConfigurations.name, pattern),
        ilike(gstConfigurations.gstin, pattern),
        ilike(gstConfigurations.hsnCode, pattern),
        ilike(categories.name, pattern),
      )!,
    );
  }

  return getDb()
    .select({
      id: gstConfigurations.id,
      companyId: gstConfigurations.companyId,
      categoryId: gstConfigurations.categoryId,
      name: gstConfigurations.name,
      gstin: gstConfigurations.gstin,
      hsnCode: gstConfigurations.hsnCode,
      rate: gstConfigurations.rate,
      status: gstConfigurations.status,
      isDefault: gstConfigurations.isDefault,
      createdAt: gstConfigurations.createdAt,
      updatedAt: gstConfigurations.updatedAt,
      categoryName: categories.name,
    })
    .from(gstConfigurations)
    .leftJoin(categories, eq(gstConfigurations.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(asc(categories.name), asc(gstConfigurations.name));
}

export async function findGstConfigurationById(companyId: number, id: number) {
  const rows = await getDb()
    .select()
    .from(gstConfigurations)
    .where(and(eq(gstConfigurations.companyId, companyId), eq(gstConfigurations.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function findGstConfigurationByCategory(companyId: number, categoryId: number) {
  const rows = await getDb()
    .select()
    .from(gstConfigurations)
    .where(
      and(
        eq(gstConfigurations.companyId, companyId),
        eq(gstConfigurations.categoryId, categoryId),
        eq(gstConfigurations.status, "active"),
      ),
    )
    .orderBy(asc(gstConfigurations.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function findGstDuplicate(input: {
  companyId: number;
  categoryId: number;
  excludeId?: number;
}) {
  const conditions = [
    eq(gstConfigurations.companyId, input.companyId),
    eq(gstConfigurations.categoryId, input.categoryId),
  ];
  if (input.excludeId) {
    conditions.push(sql`${gstConfigurations.id} <> ${input.excludeId}`);
  }
  const rows = await getDb()
    .select({ id: gstConfigurations.id })
    .from(gstConfigurations)
    .where(and(...conditions))
    .limit(1);
  return rows[0] ?? null;
}

export async function createGstConfiguration(data: InsertGstConfiguration) {
  const [config] = await getDb()
    .insert(gstConfigurations)
    .values({ ...data, gstin: normalizeGstin(data.gstin), isDefault: false })
    .returning();
  return config;
}

export async function updateGstConfiguration(
  companyId: number,
  id: number,
  data: Partial<InsertGstConfiguration>,
) {
  const [config] = await getDb()
    .update(gstConfigurations)
    .set(withoutUndefined({ ...data, gstin: normalizeGstin(data.gstin), isDefault: false, updatedAt: new Date() }))
    .where(and(eq(gstConfigurations.companyId, companyId), eq(gstConfigurations.id, id)))
    .returning();
  return config;
}

export async function deleteGstConfiguration(companyId: number, id: number) {
  const [config] = await getDb()
    .update(gstConfigurations)
    .set({ status: "inactive", isDefault: false, updatedAt: new Date() })
    .where(and(eq(gstConfigurations.companyId, companyId), eq(gstConfigurations.id, id)))
    .returning();
  return config;
}

export async function calculateGstForOrder(input: {
  companyId: number;
  items: GstLineItem[];
}) {
  const breakdown = [];
  let taxAmount = 0;
  let primaryConfigId: number | undefined;
  let primaryRate = 0;
  let primaryGstin: string | undefined;

  for (const item of input.items) {
    const config = await findGstConfigurationByCategory(input.companyId, item.categoryId);
    const rate = config ? Number(config.rate) : 0;
    const lineTaxAmount = calculateGstAmount(item.taxableAmount, rate);
    taxAmount += lineTaxAmount;
    if (!primaryConfigId && config) {
      primaryConfigId = config.id;
      primaryRate = rate;
      primaryGstin = config.gstin ?? undefined;
    }
    breakdown.push({
      categoryId: item.categoryId,
      gstConfigId: config?.id,
      gstRate: rate,
      taxableAmount: item.taxableAmount,
      taxAmount: lineTaxAmount,
    });
  }

  return {
    gstConfigId: primaryConfigId,
    gstRate: primaryRate,
    gstin: primaryGstin,
    taxAmount,
    breakdown,
  };
}

export async function getGstStats(companyId: number) {
  const rows = await getDb()
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${gstConfigurations.status} = 'active')`,
      mappedCategories: sql<number>`count(distinct ${gstConfigurations.categoryId}) filter (where ${gstConfigurations.status} = 'active')`,
    })
    .from(gstConfigurations)
    .where(eq(gstConfigurations.companyId, companyId));

  return {
    total: Number(rows[0]?.total ?? 0),
    active: Number(rows[0]?.active ?? 0),
    mappedCategories: Number(rows[0]?.mappedCategories ?? 0),
  };
}
