import { getDb } from "./connection";
import { categories, type InsertCategory } from "@db/schema";
import { eq, asc, sql } from "drizzle-orm";

export async function findAllCategories(options?: { includeInactive?: boolean }) {
  return getDb().query.categories.findMany({
    where: options?.includeInactive ? undefined : eq(categories.isActive, true),
    orderBy: asc(categories.sortOrder),
  });
}

export async function findCategoryBySlug(slug: string) {
  return getDb().query.categories.findFirst({
    where: eq(categories.slug, slug),
  });
}

export async function findCategoryById(id: number) {
  return getDb().query.categories.findFirst({
    where: eq(categories.id, id),
  });
}

export async function createCategory(data: InsertCategory) {
  const result = await getDb().insert(categories).values(data).$returningId();
  return result[0].id;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  await getDb()
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  await getDb()
    .update(categories)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(categories.id, id));
}

export async function countCategories() {
  const result = await getDb()
    .select({ count: sql<number>`count(*)` })
    .from(categories)
    .where(eq(categories.isActive, true));
  return result[0]?.count ?? 0;
}

export async function findCategoriesWithProductCount() {
  const db = getDb();
  const allCategories = await db.query.categories.findMany({
    where: eq(categories.isActive, true),
    orderBy: asc(categories.sortOrder),
    with: {
      products: {
        where: eq(categories.id, categories.id),
      },
    },
  });
  return allCategories.map((cat) => ({
    ...cat,
    productCount: cat.products?.length ?? 0,
  }));
}
