import { getDb } from "./connection";
import { inventory, products, categories, companies, type InsertProduct } from "@db/schema";
import {
  eq,
  and,
  like,
  or,
  gte,
  lte,
  desc,
  asc,
  sql,
  ne,
} from "drizzle-orm";

// ─── Product Queries ───

export async function findAllProducts(filters?: {
  categoryId?: number;
  supplierId?: number;
  status?: string;
  organic?: boolean;
  grade?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const db = getDb();
  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(products.status, filters.status as any));
  }

  if (filters?.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }
  if (filters?.supplierId) {
    conditions.push(eq(products.supplierId, filters.supplierId));
  }
  if (filters?.organic !== undefined) {
    conditions.push(eq(products.organic, filters.organic));
  }
  if (filters?.grade) {
    conditions.push(eq(products.grade, filters.grade as any));
  }
  if (filters?.minPrice) {
    conditions.push(gte(products.unitPrice, String(filters.minPrice)));
  }
  if (filters?.maxPrice) {
    conditions.push(lte(products.unitPrice, String(filters.maxPrice)));
  }
  if (filters?.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        like(products.name, pattern),
        like(products.description, pattern),
        like(products.tags, pattern)
      )!
    );
  }

  const orderByCol =
    filters?.sortBy === "price"
      ? filters.sortOrder === "asc"
        ? asc(products.unitPrice)
        : desc(products.unitPrice)
      : filters?.sortBy === "name"
        ? filters.sortOrder === "asc"
          ? asc(products.name)
          : desc(products.name)
        : desc(products.createdAt);

  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      categoryId: products.categoryId,
      supplierId: products.supplierId,
      unitPrice: products.unitPrice,
      compareAtPrice: products.compareAtPrice,
      currency: products.currency,
      unitType: products.unitType,
      unitSize: products.unitSize,
      minimumOrderQuantity: products.minimumOrderQuantity,
      image: products.image,
      origin: products.origin,
      season: products.season,
      grade: products.grade,
      organic: products.organic,
      status: products.status,
      tags: products.tags,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
      supplierName: companies.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(companies, eq(products.supplierId, companies.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderByCol);
}

export async function findProductBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      shortDescription: products.shortDescription,
      categoryId: products.categoryId,
      supplierId: products.supplierId,
      unitPrice: products.unitPrice,
      compareAtPrice: products.compareAtPrice,
      currency: products.currency,
      unitType: products.unitType,
      unitSize: products.unitSize,
      minimumOrderQuantity: products.minimumOrderQuantity,
      image: products.image,
      images: products.images,
      origin: products.origin,
      season: products.season,
      grade: products.grade,
      organic: products.organic,
      certifications: products.certifications,
      status: products.status,
      tags: products.tags,
      metaTitle: products.metaTitle,
      metaDescription: products.metaDescription,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      supplierName: companies.name,
      supplierSlug: companies.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(companies, eq(products.supplierId, companies.id))
    .where(eq(products.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

export async function findProductBySku(sku: string, excludeId?: number) {
  const pattern = `%"sku":"${sku.replace(/"/g, '\\"')}"%`;
  const conditions = [like(products.tags, pattern)];
  if (excludeId) {
    conditions.push(ne(products.id, excludeId));
  }
  const rows = await getDb()
    .select({ id: products.id })
    .from(products)
    .where(and(...conditions))
    .limit(1);
  return rows[0] ?? null;
}

export async function createProductWithInventory(input: {
  product: InsertProduct;
  inventory: {
    quantityOnHand: number;
    reorderLevel: number;
    warehouseLocation?: string;
    notes?: string;
  };
}) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const productResult = await tx
      .insert(products)
      .values(input.product)
      .returning({ id: products.id });
    const productId = productResult[0].id;
    const quantityOnHand = input.inventory.quantityOnHand;
    const reorderLevel = input.inventory.reorderLevel;
    const status =
      quantityOnHand <= 0
        ? "out_of_stock"
        : quantityOnHand <= reorderLevel
          ? "low_stock"
          : "in_stock";

    await tx.insert(inventory).values({
      productId,
      supplierId: input.product.supplierId,
      quantityOnHand,
      quantityReserved: 0,
      quantityAvailable: quantityOnHand,
      reorderLevel,
      reorderQuantity: Math.max(reorderLevel * 2, 1),
      warehouseLocation: input.inventory.warehouseLocation,
      receivedDate: new Date(),
      lastCountedAt: new Date(),
      status,
      notes: input.inventory.notes,
    });

    return productId;
  });
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  await getDb()
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  await getDb()
    .update(products)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(products.id, id));
}

export async function getProductStats() {
  const db = getDb();
  const totalRows = await db.select({ count: sql<number>`count(*)` }).from(products);
  const activeRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.status, "active"));
  const avgRows = await db
    .select({ value: sql<string>`avg(${products.unitPrice})` })
    .from(products)
    .where(eq(products.status, "active"));
  const recent = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      unitPrice: products.unitPrice,
      status: products.status,
      createdAt: products.createdAt,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt))
    .limit(5);

  return {
    totalProducts: totalRows[0]?.count ?? 0,
    activeProducts: activeRows[0]?.count ?? 0,
    averageSellingPrice: avgRows[0]?.value ?? "0",
    recentlyAdded: recent,
  };
}

export async function findProductById(id: number) {
  return getDb().query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
      supplier: true,
    },
  });
}

export async function findProductsByCategory(categoryId: number) {
  return findAllProducts({ categoryId });
}

export async function findFeaturedProducts(limit = 8) {
  const db = getDb();
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      shortDescription: products.shortDescription,
      unitPrice: products.unitPrice,
      compareAtPrice: products.compareAtPrice,
      currency: products.currency,
      unitType: products.unitType,
      unitSize: products.unitSize,
      image: products.image,
      origin: products.origin,
      grade: products.grade,
      organic: products.organic,
      categoryName: categories.name,
      supplierName: companies.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(companies, eq(products.supplierId, companies.id))
    .where(eq(products.status, "active"))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function countProducts(filters?: {
  categoryId?: number;
  supplierId?: number;
  search?: string;
}) {
  const db = getDb();
  const conditions = [eq(products.status, "active")];

  if (filters?.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }
  if (filters?.supplierId) {
    conditions.push(eq(products.supplierId, filters.supplierId));
  }
  if (filters?.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(
        like(products.name, pattern),
        like(products.description, pattern)
      )!
    );
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(and(...conditions));

  return result[0]?.count ?? 0;
}
