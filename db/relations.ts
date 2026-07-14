import { relations } from "drizzle-orm";
import {
  users,
  companies,
  categories,
  products,
  cartItems,
  orders,
  orderItems,
  inventory,
} from "./schema";

// ─────────────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────────────

// Users belong to a Company
export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

// Companies have many Users and Products
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  products: many(products),
  ordersAsBuyer: many(orders, { relationName: "buyer" }),
  ordersAsSupplier: many(orders, { relationName: "supplier" }),
  inventoryItems: many(inventory),
}));

// Categories can have subcategories and products
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parent",
  }),
  children: many(categories, { relationName: "parent" }),
  products: many(products),
}));

// Products belong to a Category and Supplier
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  supplier: one(companies, {
    fields: [products.supplierId],
    references: [companies.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  inventoryItems: many(inventory),
}));

// Cart items belong to a User and Product
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// Orders belong to Buyer, Supplier, and User who placed it
export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(companies, {
    fields: [orders.buyerId],
    references: [companies.id],
    relationName: "buyer",
  }),
  supplier: one(companies, {
    fields: [orders.supplierId],
    references: [companies.id],
    relationName: "supplier",
  }),
  placedBy: one(users, {
    fields: [orders.placedByUserId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

// Order items belong to an Order and Product
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Inventory belongs to a Product and Supplier
export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
  supplier: one(companies, {
    fields: [inventory.supplierId],
    references: [companies.id],
  }),
}));
