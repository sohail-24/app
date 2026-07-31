import { getDb } from "./connection";
import { inventory, products, companies, type InsertInventory } from "@db/schema";
import { eq, and, sql, asc } from "drizzle-orm";

function withoutUndefined<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

import { TRPCError } from "@trpc/server";

export async function validateInventory(
  productId: number,
  supplierId: number,
  productName: string,
  requiredQuantity: number
) {
  const [inventoryRecord] = await findAllInventory({
    supplierId,
    productId,
  });

  if (!inventoryRecord) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${productName} does not have inventory available.`,
    });
  }

  if (!inventoryRecord.isActive) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${productName} is currently inactive.`,
    });
  }


  if (inventoryRecord.quantityAvailable < requiredQuantity) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Insufficient inventory for ${productName}.`,
    });
  }

  return inventoryRecord;
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
      isActive: inventory.isActive,
      notes: inventory.notes,
      createdAt: inventory.createdAt,
      updatedAt: inventory.updatedAt,
      productName: products.name,
      productSlug: products.slug,
      productImage: products.image,
      unitPrice: products.unitPrice,
      compareAtPrice: products.compareAtPrice,
      tags: products.tags,
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
    isActive: boolean;
  }>,
  pricing?: {
    unitPrice?: number;
    compareAtPrice?: number;
    wholesalePrice?: number;
  }
) {
  const db = getDb();
  const dataUpdates = withoutUndefined(data);
  const hasData = Object.keys(dataUpdates).length > 0;

  if (!hasData && !pricing) return;

  const updates = { ...dataUpdates, updatedAt: new Date() };

  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ productId: inventory.productId })
      .from(inventory)
      .where(eq(inventory.id, id))
      .limit(1);

    if (hasData) {
      await tx.update(inventory).set(updates).where(eq(inventory.id, id));
    }

    if (existing) {
      const pUpdates: any = {};
      if (data.supplierId !== undefined) {
        pUpdates.supplierId = data.supplierId;
      }
      if (pricing?.unitPrice !== undefined) {
        pUpdates.unitPrice = pricing.unitPrice.toFixed(2);
      }
      if (pricing?.compareAtPrice !== undefined) {
        pUpdates.compareAtPrice = pricing.compareAtPrice.toFixed(2);
      }

      if (pricing?.wholesalePrice !== undefined) {
        const [prod] = await tx
          .select({ tags: products.tags })
          .from(products)
          .where(eq(products.id, existing.productId))
          .limit(1);

        if (prod) {
          let meta: any = {};
          try {
            if (prod.tags && prod.tags.startsWith("{")) {
              meta = JSON.parse(prod.tags);
            } else if (prod.tags) {
              meta = { tags: prod.tags.split(",").map(t => t.trim()).filter(Boolean) };
            }
          } catch (e) {}
          meta.wholesalePrice = pricing.wholesalePrice;
          pUpdates.tags = JSON.stringify(meta);
        }
      }

      if (Object.keys(pUpdates).length > 0) {
        pUpdates.updatedAt = new Date();
        await tx
          .update(products)
          .set(pUpdates)
          .where(eq(products.id, existing.productId));
      }
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
