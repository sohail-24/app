import { getDb } from "./connection";
import { inventory, products, companies, type InsertInventory } from "@db/schema";
import { eq, and, sql, asc } from "drizzle-orm";

function withoutUndefined<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export async function findAllInventory(filters?: {
  supplierId?: number;
  status?: string;
  productId?: number;
}) {
  const db = getDb();
  const conditions = [];

  if (filters?.supplierId) {
    conditions.push(eq(inventory.supplierId, filters.supplierId));
  }
  if (filters?.status) {
    conditions.push(eq(inventory.status, filters.status as any));
  }
  if (filters?.productId) {
    conditions.push(eq(inventory.productId, filters.productId));
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select({
      id: inventory.id,
      productId: inventory.productId,
      supplierId: inventory.supplierId,
      quantityOnHand: inventory.quantityOnHand,
      quantityReserved: inventory.quantityReserved,
      quantityAvailable: inventory.quantityAvailable,
      reorderLevel: inventory.reorderLevel,
      reorderQuantity: inventory.reorderQuantity,
      warehouseLocation: inventory.warehouseLocation,
      batchNumber: inventory.batchNumber,
      expiryDate: inventory.expiryDate,
      receivedDate: inventory.receivedDate,
      lastCountedAt: inventory.lastCountedAt,
      status: inventory.status,
      notes: inventory.notes,
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
      productName: products.name,
      productSlug: products.slug,
      productImage: products.image,
      supplierName: companies.name,
    })
    .from(inventory)
    .leftJoin(products, eq(inventory.productId, products.id))
    .leftJoin(companies, eq(inventory.supplierId, companies.id))
    .where(whereClause)
    .orderBy(asc(products.name));
}

export async function findInventoryByProduct(productId: number) {
  return getDb().query.inventory.findMany({
    where: eq(inventory.productId, productId),
    with: {
      supplier: true,
    },
  });
}

export async function findInventoryById(id: number) {
  return getDb().query.inventory.findFirst({
    where: eq(inventory.id, id),
    with: {
      product: true,
      supplier: true,
    },
  });
}

export async function findInventoryBySupplier(supplierId: number) {
  return findAllInventory({ supplierId });
}

export async function updateInventory(
  id: number,
  data: Partial<{
    supplierId: number;
    quantityOnHand: number;
    quantityReserved: number;
    quantityAvailable: number;
    reorderLevel: number;
    reorderQuantity: number;
    warehouseLocation: string;
    batchNumber: string;
    expiryDate: Date;
    receivedDate: Date;
    lastCountedAt: Date;
    notes: string;
    status: "in_stock" | "low_stock" | "out_of_stock";
  }>
) {
  const db = getDb();
  const updates = withoutUndefined({ ...data, updatedAt: new Date() });
  if (Object.keys(updates).length === 0) return;

  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ productId: inventory.productId })
      .from(inventory)
      .where(eq(inventory.id, id))
      .limit(1);

    await tx.update(inventory).set(updates).where(eq(inventory.id, id));

    if (data.supplierId !== undefined && existing) {
      await tx
        .update(products)
        .set({ supplierId: data.supplierId, updatedAt: new Date() })
        .where(eq(products.id, existing.productId));
    }
  });
}

export async function createInventoryRecord(data: InsertInventory) {
  const result = await getDb()
    .insert(inventory)
    .values(data)
    .returning({ id: inventory.id });
  return result[0].id;
}

export async function getInventoryStats(supplierId?: number) {
  const db = getDb();

  const conditions = supplierId
    ? [eq(inventory.supplierId, supplierId)]
    : [];
  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const totalItems = await db
    .select({ count: sql<number>`count(*)` })
    .from(inventory)
    .where(whereClause);

  const lowStock = await db
    .select({ count: sql<number>`count(*)` })
    .from(inventory)
    .where(
      supplierId
        ? and(
            eq(inventory.supplierId, supplierId),
            eq(inventory.status, "low_stock")
          )
        : eq(inventory.status, "low_stock")
    );

  const outOfStock = await db
    .select({ count: sql<number>`count(*)` })
    .from(inventory)
    .where(
      supplierId
        ? and(
            eq(inventory.supplierId, supplierId),
            eq(inventory.status, "out_of_stock")
          )
        : eq(inventory.status, "out_of_stock")
    );

  const totalValue = await db
    .select({
      value: sql<string>`sum(${inventory.quantityOnHand} * ${products.unitPrice})`,
    })
    .from(inventory)
    .leftJoin(products, eq(inventory.productId, products.id))
    .where(supplierId ? eq(inventory.supplierId, supplierId) : undefined);

  return {
    totalItems: totalItems[0]?.count ?? 0,
    lowStock: lowStock[0]?.count ?? 0,
    outOfStock: outOfStock[0]?.count ?? 0,
    totalValue: totalValue[0]?.value ?? "0",
  };
}
