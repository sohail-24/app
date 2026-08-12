import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .limit(1);
  return rows.at(0);
}

export async function findUserByMobileNumber(mobileNumber: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.phone, mobileNumber))
    .limit(1);
  return rows.at(0);
}

export async function updateUserRefreshTokenHash(
  userId: number,
  refreshTokenHash: string | null,
) {
  await getDb()
    .update(schema.users)
    .set({ refreshTokenHash, updatedAt: new Date() })
    .where(eq(schema.users.id, userId));
}

export async function updateLastSignIn(userId: number) {
  await getDb()
    .update(schema.users)
    .set({ lastSignInAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.users.id, userId));
}

export async function updateUserProfile(
  userId: number,
  data: Partial<{
    name: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    dateOfBirth: Date | null;
    gender: "male" | "female" | "other" | "prefer_not_to_say" | null;
    addressLine1: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    themePreference: "system" | "light" | "dark";
  }>,
) {
  const [updated] = await getDb()
    .update(schema.users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.users.id, userId))
    .returning();

  return updated ?? null;
}

export async function updateUserPasswordHash(userId: number, passwordHash: string) {
  await getDb()
    .update(schema.users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(schema.users.id, userId));
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.email &&
    values.email.toLowerCase() === env.ownerEmail.toLowerCase()
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onConflictDoUpdate({
      target: schema.users.unionId,
      set: updateSet,
    });
}
