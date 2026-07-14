import { getDb } from "./connection";
import { products, categories, companies } from "@db/schema";
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
  const conditions = [eq(products.status, "active")];

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
    .where(and(...conditions))
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
