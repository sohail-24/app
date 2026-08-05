# Database Schema Overview

FreshFlow uses PostgreSQL as its primary data store, managed via Drizzle ORM.

## Schema Conventions

- All mobile numbers are strictly stored in the database as normalized E.164 strings (`+91XXXXXXXXXX`). Frontend logic and endpoints are responsible for parsing user input and normalizing the data to this standard before persisting.
- `inventory` records link to `products` using `productId`. Because delivery, shipping, and inventory are centrally managed by the platform owner, `inventory.supplierId` does not necessarily match `products.supplierId`.
- Product images are stored as absolute URLs in the database.
- Order records store a complete, immutable snapshot of relevant data (such as address and contact info) at the time of creation.

## Table Inventory

The current Drizzle schema contains the following tables:

- `users`: Authenticated users, role, company association, and profile fields.
- `otp_verifications`: Mobile OTP challenge records.
- `companies`: Buyer, supplier, or mixed company records.
- `customers`: Customer management records.
- `categories`: Product taxonomy (with active/inactive statuses and sort ordering).
- `products`: Wholesale catalog items, pricing, images, status, grade, and supplier ownership.
- `cart_items`: User-scoped cart rows.
- `orders`: Purchase order headers, parties, totals, status, shipping, payment, and timestamps.
- `order_items`: Line-item snapshots for orders.
- `invoices`: Invoice headers.
- `invoice_items`: Invoice line items.
- `inventory`: Stock quantity, reserve, availability, reorder status, warehouse, and batch tracking.
- `warehouses`: Warehouse management locations.
- `warehouse_stock_movements`: Immutable history log of stock movements.
- `delivery_zones`: Geographical delivery zones for shipping rules.
- `gst_configurations`: Tax (GST) configurations.
- `shipping_methods`: Available shipping methods.

## Important Relationships

- `users.companyId` references `companies.id`.
- `products.categoryId` references `categories.id`.
- `products.supplierId` references `companies.id`.
- `cart_items.userId` references `users.id`.
- `cart_items.productId` references `products.id`.
- `orders.buyerId` and `orders.supplierId` reference `companies.id`.
- `order_items.orderId` references `orders.id`.
- `inventory.productId` and `inventory.supplierId` link stock to products and suppliers.
