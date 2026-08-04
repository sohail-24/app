import { eq, and } from "drizzle-orm";
import { getDb } from "./connection";
import { userAddresses, users } from "@db/schema";
import type { InsertUserAddress } from "@db/schema";

export async function findAddressesByUserId(userId: number) {
  // Check if they have addresses
  const addresses = await getDb()
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.userId, userId))
    .orderBy(userAddresses.createdAt);

  if (addresses.length > 0) {
    return addresses;
  }

  // Migration fallback: if no addresses exist, try migrating from their user profile
  const [userProfile] = await getDb()
    .select({
      name: users.name,
      phone: users.phone,
      addressLine1: users.addressLine1,
      city: users.city,
      state: users.state,
      postalCode: users.postalCode,
      country: users.country,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (userProfile && userProfile.addressLine1 && userProfile.city && userProfile.state && userProfile.postalCode) {
    const [newAddress] = await getDb().insert(userAddresses).values({
      userId,
      fullName: userProfile.name || "User",
      mobileNumber: userProfile.phone || "",
      addressLine1: userProfile.addressLine1,
      city: userProfile.city,
      state: userProfile.state,
      postalCode: userProfile.postalCode,
      country: userProfile.country || "India",
      addressType: "home",
      isDefault: true,
    }).returning();

    return [newAddress];
  }

  return [];
}

export async function createAddress(data: InsertUserAddress) {
  return getDb().transaction(async (tx: any) => {
    if (data.isDefault) {
      await tx
        .update(userAddresses)
        .set({ isDefault: false })
        .where(eq(userAddresses.userId, data.userId));
    } else {
      // If it's the first address, make it default regardless
      const count = await tx
        .select({ id: userAddresses.id })
        .from(userAddresses)
        .where(eq(userAddresses.userId, data.userId))
        .limit(1);
      if (count.length === 0) {
        data.isDefault = true;
      }
    }

    const [created] = await tx
      .insert(userAddresses)
      .values(data)
      .returning();

    return created;
  });
}

export async function updateAddress(id: number, userId: number, data: Partial<InsertUserAddress>) {
  return getDb().transaction(async (tx: any) => {
    if (data.isDefault) {
      await tx
        .update(userAddresses)
        .set({ isDefault: false })
        .where(and(eq(userAddresses.userId, userId), eq(userAddresses.isDefault, true)));
    }

    const [updated] = await tx
      .update(userAddresses)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
      .returning();

    return updated;
  });
}

export async function deleteAddress(id: number, userId: number) {
  return getDb().transaction(async (tx: any) => {
    const [deleted] = await tx
      .delete(userAddresses)
      .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
      .returning();

    if (deleted && deleted.isDefault) {
      // Assign another address as default if the deleted one was the default
      const remaining = await tx
        .select({ id: userAddresses.id })
        .from(userAddresses)
        .where(eq(userAddresses.userId, userId))
        .limit(1);

      if (remaining.length > 0) {
        await tx
          .update(userAddresses)
          .set({ isDefault: true, updatedAt: new Date() })
          .where(eq(userAddresses.id, remaining[0].id));
      }
    }

    return deleted;
  });
}

export async function setAddressAsDefault(id: number, userId: number) {
  return getDb().transaction(async (tx: any) => {
    await tx
      .update(userAddresses)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(userAddresses.userId, userId));

    const [updated] = await tx
      .update(userAddresses)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)))
      .returning();

    return updated;
  });
}
