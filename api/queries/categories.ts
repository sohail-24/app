import { getDb } from "./connection";
import { categories } from "@db/schema";
import { eq, asc } from "drizzle-orm";

export async function findAllCategories() {
  return getDb().query.categories.findMany({
    where: eq(categories.isActive, true),
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
