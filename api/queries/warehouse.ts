import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import {
  inventory,
  products,
  users,
  warehouses,
  warehouseStockMovements,
  type InsertWarehouse,
} from "@db/schema";
import { getDb } from "./connection";

type WarehouseStatus = "active" | "inactive";
type MovementType = "receive" | "dispatch";

export type WarehouseMutationInput = {
  name: string;
  code?: string;
  description?: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  capacityUnits?: number;
  usedCapacityUnits?: number;
  isDefault?: boolean;
  contactPerson?: string;
  contactNumber?: string;
  status: WarehouseStatus;
};

function calculateInventoryStatus(quantityOnHand: number, reorderLevel: number) {
  if (quantityOnHand <= 0) return "out_of_stock";
  if (quantityOnHand <= reorderLevel) return "low_stock";
  return "in_stock";
}

function calculateAvailableStock(quantityOnHand: number, quantityReserved: number) {
  return Math.max(quantityOnHand - quantityReserved, 0);
}

function withoutUndefined<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export async function findWarehousesByCompany(options: {
  companyId: number;
  search?: string;
  status?: WarehouseStatus;
}) {
  const conditions = [eq(warehouses.companyId, options.companyId)];
  if (options.status) {
    conditions.push(eq(warehouses.status, options.status));
  }
  if (options.search?.trim()) {
    const pattern = `%${options.search.trim()}%`;
    conditions.push(
      or(
        like(warehouses.name, pattern),
        like(warehouses.code, pattern),
        like(warehouses.city, pattern),
        like(warehouses.postalCode, pattern),
      )!,
    );
  }

  return getDb()
    .select()
    .from(warehouses)
    .where(and(...conditions))
    .orderBy(desc(warehouses.isDefault), asc(warehouses.name));
}

export async function findWarehouseByCompany(companyId: number) {
  const rows = await getDb()
    .select()
    .from(warehouses)
    .where(eq(warehouses.companyId, companyId))
    .orderBy(desc(warehouses.isDefault), asc(warehouses.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function findWarehouseById(companyId: number, id: number) {
  return getDb().query.warehouses.findFirst({
    where: and(eq(warehouses.companyId, companyId), eq(warehouses.id, id)),
  });
}

export async function upsertWarehouseForCompany(
  companyId: number,
  data: WarehouseMutationInput,
) {
  const db = getDb();
  const existing = await findWarehouseByCompany(companyId);
  const values: InsertWarehouse = {
    companyId,
    name: data.name,
    code: data.code,
    description: data.description,
    address: data.address,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country,
    capacityUnits: data.capacityUnits ?? 0,
    usedCapacityUnits: data.usedCapacityUnits ?? 0,
    isDefault: data.isDefault ?? true,
    contactPerson: data.contactPerson,
    contactNumber: data.contactNumber,
    status: data.status,
  };

  if (existing) {
    const [warehouse] = await db
      .update(warehouses)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(warehouses.id, existing.id))
      .returning();
    return warehouse;
  }

  if (values.isDefault) {
    await db
      .update(warehouses)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(warehouses.companyId, companyId));
  }

  const [warehouse] = await db.insert(warehouses).values(values).returning();
  return warehouse;
}

export async function createWarehouseForCompany(
  companyId: number,
  data: WarehouseMutationInput,
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    if (data.isDefault) {
      await tx
        .update(warehouses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(warehouses.companyId, companyId));
    }
    const [warehouse] = await tx
      .insert(warehouses)
      .values({
        companyId,
        name: data.name,
        code: data.code,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        capacityUnits: data.capacityUnits ?? 0,
        usedCapacityUnits: data.usedCapacityUnits ?? 0,
        isDefault: data.isDefault ?? false,
        contactPerson: data.contactPerson,
        contactNumber: data.contactNumber,
        status: data.status,
      })
      .returning();
    return warehouse;
  });
}

export async function updateWarehouseForCompany(
  companyId: number,
  id: number,
  data: Partial<WarehouseMutationInput>,
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    if (data.isDefault) {
      await tx
        .update(warehouses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(and(eq(warehouses.companyId, companyId), sql`${warehouses.id} <> ${id}`));
    }
    const [warehouse] = await tx
      .update(warehouses)
      .set(withoutUndefined({ ...data, updatedAt: new Date() }))
      .where(and(eq(warehouses.companyId, companyId), eq(warehouses.id, id)))
      .returning();
    return warehouse;
  });
}

export async function archiveWarehouse(companyId: number, id: number) {
  const [warehouse] = await getDb()
    .update(warehouses)
    .set({
      status: "inactive",
      isDefault: false,
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(warehouses.companyId, companyId), eq(warehouses.id, id)))
    .returning();
  return warehouse;
}

export async function findWarehouseStock(options: {
  companyId: number;
  search?: string;
  status?: "in_stock" | "low_stock" | "out_of_stock";
}) {
  const db = getDb();
  const conditions = [eq(inventory.supplierId, options.companyId)];
  if (options.status) {
    conditions.push(eq(inventory.status, options.status));
  }
  if (options.search) {
    const pattern = `%${options.search}%`;
    conditions.push(
      or(
        like(products.name, pattern),
        like(products.tags, pattern),
        like(inventory.warehouseLocation, pattern),
      )!,
    );
  }

  return db
    .select({
      inventoryId: inventory.id,
      productId: inventory.productId,
      productName: products.name,
      productSlug: products.slug,
      productImage: products.image,
      availableStock: inventory.quantityAvailable,
      reservedStock: inventory.quantityReserved,
      currentStock: inventory.quantityOnHand,
      status: inventory.status,
      warehouseLocation: inventory.warehouseLocation,
      lastUpdated: inventory.updatedAt,
    })
    .from(inventory)
    .leftJoin(products, eq(inventory.productId, products.id))
    .where(and(...conditions))
    .orderBy(products.name);
}

export async function findWarehouseMovements(options: {
  companyId: number;
  type?: MovementType;
  search?: string;
  limit?: number;
}) {
  const db = getDb();
  const conditions = [eq(warehouseStockMovements.companyId, options.companyId)];
  if (options.type) {
    conditions.push(eq(warehouseStockMovements.type, options.type));
  }
  if (options.search) {
    const pattern = `%${options.search}%`;
    conditions.push(
      or(
        like(products.name, pattern),
        like(warehouseStockMovements.reference, pattern),
        like(warehouseStockMovements.notes, pattern),
      )!,
    );
  }

  return db
    .select({
      id: warehouseStockMovements.id,
      warehouseId: warehouseStockMovements.warehouseId,
      productId: warehouseStockMovements.productId,
      productName: products.name,
      type: warehouseStockMovements.type,
      quantity: warehouseStockMovements.quantity,
      supplierName: warehouseStockMovements.supplierName,
      orderId: warehouseStockMovements.orderId,
      reference: warehouseStockMovements.reference,
      notes: warehouseStockMovements.notes,
      performedByName: users.name,
      createdAt: warehouseStockMovements.createdAt,
      warehouseName: warehouses.name,
    })
    .from(warehouseStockMovements)
    .leftJoin(products, eq(warehouseStockMovements.productId, products.id))
    .leftJoin(warehouses, eq(warehouseStockMovements.warehouseId, warehouses.id))
    .leftJoin(users, eq(warehouseStockMovements.performedByUserId, users.id))
    .where(and(...conditions))
    .orderBy(desc(warehouseStockMovements.createdAt))
    .limit(options.limit ?? 100);
}

export async function getWarehouseStats(companyId: number) {
  const db = getDb();
  const [stock] = await db
    .select({
      totalProducts: sql<number>`count(*)`,
      currentStock: sql<number>`coalesce(sum(${inventory.quantityOnHand}), 0)`,
      inStock: sql<number>`count(*) filter (where ${inventory.status} = 'in_stock')`,
      lowStock: sql<number>`count(*) filter (where ${inventory.status} = 'low_stock')`,
      outOfStock: sql<number>`count(*) filter (where ${inventory.status} = 'out_of_stock')`,
    })
    .from(inventory)
    .where(eq(inventory.supplierId, companyId));

  const [movementsToday] = await db
    .select({
      receivedToday: sql<number>`coalesce(sum(${warehouseStockMovements.quantity}) filter (where ${warehouseStockMovements.type} = 'receive'), 0)`,
      dispatchedToday: sql<number>`coalesce(sum(${warehouseStockMovements.quantity}) filter (where ${warehouseStockMovements.type} = 'dispatch'), 0)`,
    })
    .from(warehouseStockMovements)
    .where(
      and(
        eq(warehouseStockMovements.companyId, companyId),
        sql`${warehouseStockMovements.createdAt}::date = current_date`,
      ),
    );

  return {
    totalProducts: stock?.totalProducts ?? 0,
    currentStock: stock?.currentStock ?? 0,
    inStock: stock?.inStock ?? 0,
    lowStock: stock?.lowStock ?? 0,
    outOfStock: stock?.outOfStock ?? 0,
    receivedToday: movementsToday?.receivedToday ?? 0,
    dispatchedToday: movementsToday?.dispatchedToday ?? 0,
  };
}

async function getActiveWarehouse(companyId: number) {
  const warehouse = await findWarehouseByCompany(companyId);
  if (!warehouse) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Warehouse information has not been configured.",
    });
  }
  if (warehouse.status !== "active") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Inactive warehouses cannot receive or dispatch stock.",
    });
  }
  return warehouse;
}

export async function assignInventoryToWarehouse(input: {
  companyId: number;
  inventoryId: number;
  warehouseId: number;
  warehouseLocation?: string;
}) {
  const warehouse = await findWarehouseById(input.companyId, input.warehouseId);
  if (!warehouse || warehouse.status !== "active") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Select an active warehouse.",
    });
  }

  const [record] = await getDb()
    .update(inventory)
    .set({
      warehouseLocation: input.warehouseLocation || warehouse.name,
      updatedAt: new Date(),
    })
    .where(and(eq(inventory.id, input.inventoryId), eq(inventory.supplierId, input.companyId)))
    .returning();
  return record;
}

export async function receiveWarehouseStock(input: {
  companyId: number;
  performedByUserId: number;
  productId: number;
  quantity: number;
  supplierName?: string;
  reference?: string;
  notes?: string;
}) {
  const db = getDb();
  const warehouse = await getActiveWarehouse(input.companyId);

  return db.transaction(async (tx) => {
    const stock = await tx.query.inventory.findFirst({
      where: and(
        eq(inventory.productId, input.productId),
        eq(inventory.supplierId, input.companyId),
      ),
    });
    if (!stock) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product inventory was not found for this warehouse.",
      });
    }

    const quantityOnHand = stock.quantityOnHand + input.quantity;
    const quantityAvailable = calculateAvailableStock(
      quantityOnHand,
      stock.quantityReserved,
    );

    await tx
      .update(inventory)
      .set({
        quantityOnHand,
        quantityAvailable,
        status: calculateInventoryStatus(quantityOnHand, stock.reorderLevel),
        receivedDate: new Date(),
        lastCountedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, stock.id));

    const [movement] = await tx
      .insert(warehouseStockMovements)
      .values({
        warehouseId: warehouse.id,
        companyId: input.companyId,
        productId: input.productId,
        inventoryId: stock.id,
        type: "receive",
        quantity: input.quantity,
        supplierName: input.supplierName,
        reference: input.reference,
        notes: input.notes,
        performedByUserId: input.performedByUserId,
      })
      .returning();

    return movement;
  });
}

export async function dispatchWarehouseStock(input: {
  companyId: number;
  performedByUserId: number;
  productId: number;
  quantity: number;
  orderId?: number;
  notes?: string;
}) {
  const db = getDb();
  const warehouse = await getActiveWarehouse(input.companyId);

  return db.transaction(async (tx) => {
    const stock = await tx.query.inventory.findFirst({
      where: and(
        eq(inventory.productId, input.productId),
        eq(inventory.supplierId, input.companyId),
      ),
    });
    if (!stock) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product inventory was not found for this warehouse.",
      });
    }
    if (input.quantity > stock.quantityAvailable) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Insufficient stock available.",
      });
    }

    const quantityOnHand = stock.quantityOnHand - input.quantity;
    const quantityAvailable = calculateAvailableStock(
      quantityOnHand,
      stock.quantityReserved,
    );

    await tx
      .update(inventory)
      .set({
        quantityOnHand,
        quantityAvailable,
        status: calculateInventoryStatus(quantityOnHand, stock.reorderLevel),
        lastCountedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, stock.id));

    const [movement] = await tx
      .insert(warehouseStockMovements)
      .values({
        warehouseId: warehouse.id,
        companyId: input.companyId,
        productId: input.productId,
        inventoryId: stock.id,
        type: "dispatch",
        quantity: input.quantity,
        orderId: input.orderId,
        notes: input.notes,
        performedByUserId: input.performedByUserId,
      })
      .returning();

    return movement;
  });
}
