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
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "disputed",
]);
export const paymentStatusEnum = pgEnum("paymentStatus", [
  "pending",
  "authorized",
  "paid",
  "partially_paid",
  "refunded",
  "failed",
]);
export const inventoryStatusEnum = pgEnum("inventory_status", [
  "in_stock",
  "low_stock",
  "out_of_stock",
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
