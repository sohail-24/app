import { getDb } from "./connection";
import { companies } from "@db/schema";
import { eq, like, and, or } from "drizzle-orm";

export async function findAllCompanies() {
  return getDb().query.companies.findMany({
    where: eq(companies.isActive, true),
    orderBy: companies.name,
  });
}

export async function findCompaniesByType(type: string) {
  return getDb().query.companies.findMany({
    where: and(eq(companies.type, type as any), eq(companies.isActive, true)),
    orderBy: companies.name,
  });
}

export async function findCompanyById(id: number) {
  return getDb().query.companies.findFirst({
    where: eq(companies.id, id),
  });
}

export async function findCompanyBySlug(slug: string) {
  return getDb().query.companies.findFirst({
    where: eq(companies.slug, slug),
  });
}

export async function searchCompanies(query: string) {
  const pattern = `%${query}%`;
  return getDb()
    .select()
    .from(companies)
    .where(
      and(
        eq(companies.isActive, true),
        or(like(companies.name, pattern), like(companies.city, pattern))
      )
    )
    .orderBy(companies.name);
}
