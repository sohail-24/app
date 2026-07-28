import {
  pgTable,
  bigserial,
  varchar,
  text,
  timestamp,
  numeric,
  integer,
  bigint,
  pgEnum,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";

export const authProviderEnum = pgEnum("authProvider", ["local", "mobile"]);
export const userRoleEnum = pgEnum("role", ["user", "admin"]);
export const companyTypeEnum = pgEnum("company_type", [
  "supplier",
  "buyer",
  "both",
]);
export const paymentTermsEnum = pgEnum("paymentTerms", [
  "net_15",
  "net_30",
  "net_45",
  "net_60",
  "cod",
  "prepaid",
]);
export const unitTypeEnum = pgEnum("unitType", [
  "kg",
  "lb",
  "case",
  "pallet",
  "each",
  "bunch",
  "box",
  "bag",
]);
export const productGradeEnum = pgEnum("grade", [
  "premium",
  "grade_a",
  "grade_b",
  "standard",
]);
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "packed",
  "ready_for_dispatch",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);
export const deliveryEstimateEnum = pgEnum("delivery_estimate", [
  "same_day",
  "next_day",
  "within_2_days",
  "within_3_5_days",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["generated"]);
export const paymentStatusEnum = pgEnum("paymentStatus", [
  "pending",
  "authorized",
  "paid",
  "partially_paid",
  "refunded",
  "failed",
]);
export const userGenderEnum = pgEnum("user_gender", [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
]);
export const userThemePreferenceEnum = pgEnum("user_theme_preference", [
  "system",
  "light",
  "dark",
]);
export const inventoryStatusEnum = pgEnum("inventory_status", [
  "in_stock",
  "low_stock",
  "out_of_stock",
]);
export const warehouseStatusEnum = pgEnum("warehouse_status", [
  "active",
  "inactive",
]);
export const warehouseMovementTypeEnum = pgEnum("warehouse_movement_type", [
  "receive",
  "dispatch",
]);
export const otpPurposeEnum = pgEnum("purpose", ["login"]);

// ─────────────────────────────────────────────────────────────
// USERS — Extended from auth with company association
// ─────────────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    unionId: varchar("unionId", { length: 255 }).notNull().unique(),
    authProvider: authProviderEnum("authProvider")
      .default("local")
      .notNull(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 320 }),
    passwordHash: text("passwordHash"),
    refreshTokenHash: text("refreshTokenHash"),
    avatar: text("avatar"),
    role: userRoleEnum("role").default("user").notNull(),
    // B2B: each user belongs to a company
    companyId: bigint("companyId", { mode: "number" }),
    phone: varchar("phone", { length: 50 }),
    dateOfBirth: timestamp("dateOfBirth"),
    gender: userGenderEnum("gender"),
    addressLine1: varchar("addressLine1", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    country: varchar("country", { length: 100 }),
    postalCode: varchar("postalCode", { length: 20 }),
    themePreference: userThemePreferenceEnum("themePreference")
      .default("system")
      .notNull(),
    mobileVerifiedAt: timestamp("mobileVerifiedAt"),
    emailVerifiedAt: timestamp("emailVerifiedAt"),
    jobTitle: varchar("jobTitle", { length: 100 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
  },
  (table) => ({
    companyIdx: index("user_company_idx").on(table.companyId),
    emailIdx: index("user_email_idx").on(table.email),
    phoneIdx: index("user_phone_idx").on(table.phone),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─────────────────────────────────────────────────────────────
// OTP VERIFICATIONS — Pluggable mobile login verification
// ─────────────────────────────────────────────────────────────
export const otpVerifications = pgTable(
  "otp_verifications",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    mobileNumber: varchar("mobileNumber", { length: 20 }).notNull(),
    codeHash: text("codeHash").notNull(),
    purpose: otpPurposeEnum("purpose").default("login").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    consumedAt: timestamp("consumedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    mobileIdx: index("otp_mobile_idx").on(table.mobileNumber),
    expiresIdx: index("otp_expires_idx").on(table.expiresAt),
  })
);

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = typeof otpVerifications.$inferInsert;

// ─────────────────────────────────────────────────────────────
// COMPANIES — B2B entities (buyers, suppliers, or both)
// ─────────────────────────────────────────────────────────────
export const companies = pgTable(
  "companies",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    type: companyTypeEnum("type")
      .default("buyer")
      .notNull(),
    description: text("description"),
    logo: text("logo"),
    website: varchar("website", { length: 255 }),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 50 }),
    // Address fields
    addressLine1: varchar("addressLine1", { length: 255 }),
    addressLine2: varchar("addressLine2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postalCode", { length: 20 }),
    country: varchar("country", { length: 100 }),
    // Business details
    taxId: varchar("taxId", { length: 100 }),
    businessLicense: varchar("businessLicense", { length: 255 }),
    // Verification
    isVerified: boolean("isVerified").default(false).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    // Wholesale-specific
    minimumOrderAmount: numeric("minimumOrderAmount", {
      precision: 12,
      scale: 2,
    }).default("0.00"),
    paymentTerms: paymentTermsEnum("paymentTerms").default("net_30"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    typeIdx: index("company_type_idx").on(table.type),
    slugIdx: index("company_slug_idx").on(table.slug),
    verifiedIdx: index("company_verified_idx").on(table.isVerified),
  })
);

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ─────────────────────────────────────────────────────────────
// CATEGORIES — Product categories for fruits
// ─────────────────────────────────────────────────────────────
export const categories = pgTable(
  "categories",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 7 }), // hex color for UI
    parentId: bigint("parentId", { mode: "number" }),
    sortOrder: integer("sortOrder").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugIdx: index("category_slug_idx").on(table.slug),
    parentIdx: index("category_parent_idx").on(table.parentId),
    activeIdx: index("category_active_idx").on(table.isActive),
  })
);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─────────────────────────────────────────────────────────────
// PRODUCTS — Wholesale fruit products
// ─────────────────────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    shortDescription: varchar("shortDescription", { length: 500 }),
    // Category
    categoryId: bigint("categoryId", { mode: "number" }).notNull(),
    // Supplier (the company selling this product)
    supplierId: bigint("supplierId", { mode: "number" }).notNull(),
    // Pricing (wholesale)
    unitPrice: numeric("unitPrice", { precision: 12, scale: 2 }).notNull(),
    compareAtPrice: numeric("compareAtPrice", {
      precision: 12,
      scale: 2,
    }).default("0.00"),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    // Unit of measure
    unitType: unitTypeEnum("unitType").notNull(),
    unitSize: varchar("unitSize", { length: 50 }),
    // Quantity
    minimumOrderQuantity: integer("minimumOrderQuantity").default(1).notNull(),
    // Media
    image: text("image"),
    images: text("images"), // JSON array of image URLs
    // Details
    origin: varchar("origin", { length: 100 }),
    season: varchar("season", { length: 100 }),
    grade: productGradeEnum("grade")
      .default("grade_a")
      .notNull(),
    organic: boolean("organic").default(false).notNull(),
    certifications: text("certifications"), // JSON array
    // Status
    status: productStatusEnum("status")
      .default("draft")
      .notNull(),
    // SEO
    metaTitle: varchar("metaTitle", { length: 255 }),
    metaDescription: text("metaDescription"),
    tags: text("tags"), // comma-separated
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugIdx: index("product_slug_idx").on(table.slug),
    categoryIdx: index("product_category_idx").on(table.categoryId),
    supplierIdx: index("product_supplier_idx").on(table.supplierId),
    statusIdx: index("product_status_idx").on(table.status),
    priceIdx: index("product_price_idx").on(table.unitPrice),
    organicIdx: index("product_organic_idx").on(table.organic),
    gradeIdx: index("product_grade_idx").on(table.grade),
    nameIdx: index("product_name_idx").on(table.name),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// ─────────────────────────────────────────────────────────────
// CART ITEMS — Shopping cart
// ─────────────────────────────────────────────────────────────
export const cartItems = pgTable(
  "cart_items",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: bigint("userId", { mode: "number" }).notNull(),
    productId: bigint("productId", { mode: "number" }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unitPrice", { precision: 12, scale: 2 }).notNull(),
    notes: varchar("notes", { length: 500 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("cart_user_idx").on(table.userId),
    productIdx: index("cart_product_idx").on(table.productId),
    uniqueUserProduct: index("cart_user_product_idx").on(
      table.userId,
      table.productId
    ),
  })
);

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// ─────────────────────────────────────────────────────────────
// ORDERS — Purchase orders
// ─────────────────────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
    // Parties
    buyerId: bigint("buyerId", { mode: "number" }).notNull(),
    supplierId: bigint("supplierId", { mode: "number" }).notNull(),
    placedByUserId: bigint("placedByUserId", { mode: "number" }).notNull(),
    // Financial
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    taxAmount: numeric("taxAmount", {
      precision: 12,
      scale: 2,
    }).default("0.00"),
    shippingAmount: numeric("shippingAmount", {
      precision: 12,
      scale: 2,
    }).default("0.00"),
    discountAmount: numeric("discountAmount", {
      precision: 12,
      scale: 2,
    }).default("0.00"),
    totalAmount: numeric("totalAmount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    // Status workflow
    status: orderStatusEnum("status")
      .default("pending")
      .notNull(),
    paymentStatus: paymentStatusEnum("paymentStatus")
      .default("pending")
      .notNull(),
    // Shipping
    shippingAddressLine1: varchar("shippingAddressLine1", { length: 255 }),
    shippingAddressLine2: varchar("shippingAddressLine2", { length: 255 }),
    shippingCity: varchar("shippingCity", { length: 100 }),
    shippingState: varchar("shippingState", { length: 100 }),
    shippingPostalCode: varchar("shippingPostalCode", { length: 20 }),
    shippingCountry: varchar("shippingCountry", { length: 100 }),
    shippingMethod: varchar("shippingMethod", { length: 100 }),
    trackingNumber: varchar("trackingNumber", { length: 100 }),
    deliveryEstimate: deliveryEstimateEnum("deliveryEstimate"),
    estimatedDeliveryDate: timestamp("estimatedDeliveryDate"),
    actualDeliveryDate: timestamp("actualDeliveryDate"),
    // Dates
    orderedAt: timestamp("orderedAt").defaultNow().notNull(),
    confirmedAt: timestamp("confirmedAt"),
    shippedAt: timestamp("shippedAt"),
    deliveredAt: timestamp("deliveredAt"),
    cancelledAt: timestamp("cancelledAt"),
    // Notes
    buyerNotes: text("buyerNotes"),
    sellerNotes: text("sellerNotes"),
    internalNotes: text("internalNotes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    orderNumberIdx: index("order_number_idx").on(table.orderNumber),
    buyerIdx: index("order_buyer_idx").on(table.buyerId),
    supplierIdx: index("order_supplier_idx").on(table.supplierId),
    statusIdx: index("order_status_idx").on(table.status),
    deliveryEstimateIdx: index("order_delivery_estimate_idx").on(table.deliveryEstimate),
    paymentStatusIdx: index("order_payment_idx").on(table.paymentStatus),
    orderedAtIdx: index("order_date_idx").on(table.orderedAt),
    placedByIdx: index("order_placed_by_idx").on(table.placedByUserId),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ─────────────────────────────────────────────────────────────
// ORDER ITEMS — Line items within orders
// ─────────────────────────────────────────────────────────────
export const orderItems = pgTable(
  "order_items",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    orderId: bigint("orderId", { mode: "number" }).notNull(),
    productId: bigint("productId", { mode: "number" }).notNull(),
    productName: varchar("productName", { length: 255 }).notNull(),
    productImage: text("productImage"),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unitPrice", { precision: 12, scale: 2 }).notNull(),
    totalPrice: numeric("totalPrice", { precision: 12, scale: 2 }).notNull(),
    unitType: unitTypeEnum("unitType").notNull(),
    notes: varchar("notes", { length: 500 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("order_item_order_idx").on(table.orderId),
    productIdx: index("order_item_product_idx").on(table.productId),
  })
);

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// ─────────────────────────────────────────────────────────────
// INVOICES — Immutable financial documents generated from orders
// ─────────────────────────────────────────────────────────────
export const invoices = pgTable(
  "invoices",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    companyId: bigint("companyId", { mode: "number" }).notNull(),
    orderId: bigint("orderId", { mode: "number" }).notNull().unique(),
    invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
    orderNumber: varchar("orderNumber", { length: 50 }).notNull(),
    status: invoiceStatusEnum("status").default("generated").notNull(),
    invoiceDate: timestamp("invoiceDate").defaultNow().notNull(),
    companyName: varchar("companyName", { length: 255 }).notNull(),
    companyPhone: varchar("companyPhone", { length: 50 }),
    companyAddress: text("companyAddress"),
    customerName: varchar("customerName", { length: 255 }).notNull(),
    customerPhone: varchar("customerPhone", { length: 50 }),
    billingAddress: text("billingAddress"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    totalAmount: numeric("totalAmount", { precision: 12, scale: 2 }).notNull(),
    archivedAt: timestamp("archivedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    companyIdx: index("invoice_company_idx").on(table.companyId),
    orderIdx: index("invoice_order_idx").on(table.orderId),
    invoiceNumberIdx: index("invoice_number_idx").on(table.invoiceNumber),
    statusIdx: index("invoice_status_idx").on(table.status),
    invoiceDateIdx: index("invoice_date_idx").on(table.invoiceDate),
  })
);

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    invoiceId: bigint("invoiceId", { mode: "number" }).notNull(),
    productName: varchar("productName", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitType: unitTypeEnum("unitType").notNull(),
    unitPrice: numeric("unitPrice", { precision: 12, scale: 2 }).notNull(),
    totalPrice: numeric("totalPrice", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    invoiceIdx: index("invoice_item_invoice_idx").on(table.invoiceId),
  })
);

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

// ─────────────────────────────────────────────────────────────
// INVENTORY — Stock tracking per product per supplier
// ─────────────────────────────────────────────────────────────
export const inventory = pgTable(
  "inventory",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    productId: bigint("productId", { mode: "number" }).notNull(),
    supplierId: bigint("supplierId", { mode: "number" }).notNull(),
    // Stock levels
    quantityOnHand: integer("quantityOnHand").default(0).notNull(),
    quantityReserved: integer("quantityReserved").default(0).notNull(),
    quantityAvailable: integer("quantityAvailable").default(0).notNull(),
    reorderLevel: integer("reorderLevel").default(10).notNull(),
    reorderQuantity: integer("reorderQuantity").default(100).notNull(),
    // Location
    warehouseLocation: varchar("warehouseLocation", { length: 100 }),
    batchNumber: varchar("batchNumber", { length: 100 }),
    // Dates
    expiryDate: timestamp("expiryDate"),
    receivedDate: timestamp("receivedDate"),
    lastCountedAt: timestamp("lastCountedAt"),
    // Status
    status: inventoryStatusEnum("status")
      .default("in_stock")
      .notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    productIdx: index("inventory_product_idx").on(table.productId),
    supplierIdx: index("inventory_supplier_idx").on(table.supplierId),
    statusIdx: index("inventory_status_idx").on(table.status),
    batchIdx: index("inventory_batch_idx").on(table.batchNumber),
    uniqueProductSupplier: index("inventory_product_supplier_idx").on(
      table.productId,
      table.supplierId
    ),
  })
);

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

// ─────────────────────────────────────────────────────────────
// WAREHOUSES — Single physical storage location per company
// ─────────────────────────────────────────────────────────────
export const warehouses = pgTable(
  "warehouses",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    companyId: bigint("companyId", { mode: "number" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 80 }),
    description: text("description"),
    address: text("address").notNull(),
    contactPerson: varchar("contactPerson", { length: 255 }),
    contactNumber: varchar("contactNumber", { length: 50 }),
    status: warehouseStatusEnum("status").default("active").notNull(),
    archivedAt: timestamp("archivedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    companyIdx: uniqueIndex("warehouse_company_idx").on(table.companyId),
    codeIdx: uniqueIndex("warehouse_code_idx").on(table.code),
    statusIdx: index("warehouse_status_idx").on(table.status),
  })
);

export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = typeof warehouses.$inferInsert;

// ─────────────────────────────────────────────────────────────
// WAREHOUSE STOCK MOVEMENTS — Audit-ready receive/dispatch log
// ─────────────────────────────────────────────────────────────
export const warehouseStockMovements = pgTable(
  "warehouse_stock_movements",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    warehouseId: bigint("warehouseId", { mode: "number" }).notNull(),
    companyId: bigint("companyId", { mode: "number" }).notNull(),
    productId: bigint("productId", { mode: "number" }).notNull(),
    inventoryId: bigint("inventoryId", { mode: "number" }).notNull(),
    type: warehouseMovementTypeEnum("type").notNull(),
    quantity: integer("quantity").notNull(),
    supplierName: varchar("supplierName", { length: 255 }),
    orderId: bigint("orderId", { mode: "number" }),
    reference: varchar("reference", { length: 120 }),
    notes: text("notes"),
    performedByUserId: bigint("performedByUserId", { mode: "number" }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    warehouseIdx: index("warehouse_movement_warehouse_idx").on(table.warehouseId),
    companyIdx: index("warehouse_movement_company_idx").on(table.companyId),
    productIdx: index("warehouse_movement_product_idx").on(table.productId),
    typeIdx: index("warehouse_movement_type_idx").on(table.type),
    createdAtIdx: index("warehouse_movement_created_at_idx").on(table.createdAt),
  })
);

export type WarehouseStockMovement = typeof warehouseStockMovements.$inferSelect;
export type InsertWarehouseStockMovement = typeof warehouseStockMovements.$inferInsert;
