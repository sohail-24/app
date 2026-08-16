# AM Fruits (FreshFlow) Architecture

*Note: FreshFlow is the internal project/platform name; AM Fruits is the current public business/product brand.*

## Project Overview

FreshFlow is a production-style B2B wholesale commerce platform for fruit wholesalers, vegetable suppliers, grocery distributors, dairy suppliers, and similar bulk trade businesses. It combines an owner-facing ERP workspace with a buyer-facing marketplace workspace.

The project is not a simple ecommerce demo. Its core domain is wholesale procurement: managed catalogs, category and inventory operations, purchase orders, buyer carts, invoices, delivery tracking, and future multi-tenant SaaS administration.

## Vision

FreshFlow should become a multi-tenant SaaS platform where supplier businesses can run wholesale operations and buyer businesses can purchase from verified suppliers. The MVP currently focuses on one business owner and buyer accounts, while keeping the role model and data model ready for managers, warehouse staff, sales executives, and platform administrators.

## Folder Structure

```text
app/
├── api/                    # Hono/tRPC backend routers, auth, middleware, and query functions
│   ├── auth/               # Password, mobile OTP, OTP provider, and JWT session helpers
│   ├── lib/                # Server utilities for cookies, env, HTTP, and Vite integration
│   ├── queries/            # Drizzle query functions for products, categories, cart, orders, etc.
│   ├── *Router.ts          # tRPC domain routers
│   ├── context.ts          # Per-request tRPC context and authenticated user resolution
│   ├── middleware.ts       # publicQuery, authedQuery, ownerQuery, adminQuery
│   └── router.ts           # App router aggregation
├── contracts/              # Shared server/client constants, types, errors, and role helpers
├── db/                     # Drizzle schema, relations, seed data, migrations
├── docs/                   # Architecture, development log, roadmap, API notes
├── src/                    # React application
│   ├── components/         # Layout and shadcn/ui components
│   ├── hooks/              # React hooks such as useAuth
│   ├── lib/                # Frontend utilities and role re-exports
│   ├── pages/              # Route-level screens
│   └── providers/          # tRPC and theme providers
└── dist/                   # Production build output
```

## Frontend Architecture

The frontend is a React 19 + TypeScript + Vite application using React Router for route composition. `src/App.tsx` defines public routes, authenticated routes, and owner-only routes.

`src/pages/LandingPage.tsx` is the public `/` route. It now acts as a product-first B2B wholesale marketplace homepage instead of a marketing landing page. It uses public `product.list` and `category.list` tRPC queries for browsing, search, category filtering, featured products, category cards, and recently added products. Visitors can browse and open product details without a session, while homepage Add To Cart redirects guests to login and uses the authenticated cart mutation only after login.

`src/components/AppLayout.tsx` is the authenticated shell. It renders a role-aware sidebar and top bar:

- Business owner and platform admin see ERP navigation for dashboard, product catalog, categories, inventory, orders, reports, settings, and profile.
- Buyers see marketplace/procurement navigation for dashboard, browse products, cart, purchase orders, delivery tracking, settings, and profile.

`src/pages/Dashboard.tsx` is role-split:

- Owner dashboard shows operational analytics such as products, categories, inventory value, revenue, today's orders, pending orders, low stock, recent products, recent activity, and top products.
- Buyer dashboard is purchasing-first, with a large search bar, featured products, popular categories, recommendations, recent orders, pending deliveries, quick reorder signals, invoice summary, and order status.

`src/pages/Products.tsx` is also role-aware:

- Owner mode exposes import, export, add product, selection, bulk action surface, purchase pricing, and archive actions.
- Buyer mode hides administrative controls completely and exposes add to cart, request quote, and view product flows.

Product image rendering uses fallback placeholders on list, dashboard, detail, and inventory screens so stale image URLs or failed uploads do not display broken image icons.

## Backend Architecture



The backend is a Hono server with tRPC routers. It uses Drizzle ORM against PostgreSQL (Neon). The server entry is bundled from `api/boot.ts`; `api/router.ts` aggregates domain routers.

Backend query functions live in `api/queries/` and keep database access separate from router input validation and authorization. Routers validate input with Zod and call query helpers for persistence.

## Database Tables

Current Drizzle tables:

- `users`: authenticated users, local/mobile auth fields, role, company association, profile fields.
- `otp_verifications`: mobile OTP challenge records.
- `companies`: buyer, supplier, or both company records.
- `customers`: customer management records.
- `categories`: product taxonomy with active/inactive and sort ordering.
- `products`: wholesale catalog items, pricing, images, status, grade, and supplier ownership.
- `cart_items`: user-scoped cart rows.
- `orders`: purchase order header, parties, totals, status, shipping, payment, and timestamps.
- `order_items`: line-item snapshots for orders.
- `invoices`: invoice headers.
- `invoice_items`: invoice line items.
- `inventory`: stock quantity, reserve, availability, reorder status, warehouse, and batch tracking.
- `warehouses`: warehouse management records.
- `warehouse_stock_movements`: history of stock movements.
- `delivery_zones`: geographical delivery zones for shipping rules.
- `gst_configurations`: tax configurations.
- `shipping_methods`: available shipping methods.

Important relationships:

- `users.companyId` references `companies.id`.
- `products.categoryId` references `categories.id`.
- `products.supplierId` references `companies.id`.
- `cart_items.userId` references `users.id`.
- `cart_items.productId` references `products.id`.
- `orders.buyerId` and `orders.supplierId` reference `companies.id`.
- `order_items.orderId` references `orders.id`.
- `inventory.productId` and `inventory.supplierId` link stock to products and suppliers.

## API Routers

`appRouter` includes:

- `auth`: current user, registration, email login, mobile OTP request/verify, refresh, logout.
- `product`: public list/detail/featured/count/stats plus owner-only create/update/delete.
- `category`: public active category browsing plus owner-only create/update/delete; inactive categories are only returned to owners/admins.
- `cart`: authenticated cart list/add/update/remove/clear.
- `order`: authenticated order list/detail/create/stats/recent; status updates are owner-only.
- `inventory`: owner-only inventory list/detail/update/stats.
- `company`: company list/detail/search.
- `warehouse`: warehouse management.
- `invoice`: invoice operations.
- `report`: reporting aggregates.
- `profile`: user profile management.
- `customer`: customer records.
- `deliveryZone`: delivery zone configurations.
- `gst`: GST settings.
- `shipping`: shipping method management.
- `ping`: health check.

Procedure types:

- `publicQuery`: no session required.
- `authedQuery`: requires a valid authenticated user.
- `ownerQuery`: requires the configured business owner email or an admin user.
- `adminQuery`: requires `users.role === "admin"`.

## Authentication

Authentication supports email/password and +91 mobile OTP login. Successful auth creates HTTP-only access and refresh cookies. `api/context.ts` resolves the current user for every tRPC request through `authenticateRequest`.

Access and refresh JWTs are rotated by the session helpers. Frontend auth state is consumed through `src/hooks/useAuth.ts`.

## Role System

The role system is centralized in `contracts/roles.ts` and re-exported by `src/lib/roles.ts`.

MVP business owner:

```text
mdsohail88008@gmail.com
```

Rules:

- `isOwner(user)` checks the normalized user email against the MVP owner email.
- `getAppRole(user)` maps admin users to `platform_admin`, the configured owner email to `business_owner`, and all others to `buyer`.
- Owner-only frontend routes use `OwnerRoute`.
- Owner-only backend actions use `ownerQuery`.

Future roles are documented in the helper for expansion: manager, warehouse staff, sales executive, and platform admin.

## Business Workflows

Owner workflow:

1. Sign in as the configured owner.
2. Monitor operations from the ERP dashboard.
3. Create categories and products.
4. Product creation writes product records and matching inventory records.
5. Manage inventory, reports, and incoming order flow.
6. Update order status through the owner-only status endpoint.

Buyer workflow:

1. Browse the public marketplace homepage or product catalog without signing in.
2. Search products, filter by categories, and open product detail pages before authentication.
3. Sign in when adding products to cart, checking out, viewing orders, or entering the dashboard.
4. Checkout converts cart items to a purchase order.
5. Track purchase orders, invoices, and delivery status from buyer workspace pages.

## Business Owner Workspace

The owner workspace is the ERP side of the product. It provides:

- Dashboard analytics.
- Product catalog management.
- Category management.
- Inventory management.
- Order desk for supplier-side orders.
- Reports.
- Business settings and profile.
- Owner-only route and API protections.

Owner can create products, edit/update product records through the API, archive products, manage categories, inspect inventory, view reports, import/export UI affordances, and access business settings.

Product editing is exposed through the owner-only `/products/:slug/edit` route. The edit screen uses the existing `product.bySlug` query and `product.update` mutation, preserves stored image URLs, and lets owners update catalog details, SKU metadata, wholesale units, minimum order quantity, grade, organic status, pricing, and publication status without exposing those controls to buyers.

## Buyer Workspace

The buyer workspace is the marketplace/procurement side. It provides:

- Procurement dashboard.
- Browse products.
- My cart.
- Purchase orders.
- Delivery tracking entry point.
- Profile and settings.

Buyers must never see administrative controls. The UI hides add/edit/delete product actions, import/export, bulk actions, category management, inventory, warehouse, reports, and platform settings. Backend owner-only procedures also prevent direct mutation access.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Routing | React Router |
| Styling | Tailwind CSS, shadcn/ui-style components, lucide-react icons |
| Data Fetching | tRPC React + TanStack Query |
| Backend | Hono, tRPC 11 |
| Database | PostgreSQL (Neon) with Drizzle ORM|
| Auth | Local password, mobile OTP, JWT cookies |
| Validation | Zod |
| Build | Vite + esbuild |
| Testing/Checks | TypeScript build check, Vitest config present |
| Infrastructure | Docker Compose, Nginx, Node 22-slim, PostgreSQL 15-alpine |

## Docker & Nginx Infrastructure

FreshFlow is containerized following a Platform Engineering Phase 1 approach. Production deployment is orchestrated using Docker Compose (`docker-compose.yml`).

### Container Flow

- **Nginx Container:** Runs `nginx:stable` on port `80` and `443`. It acts as the single public entry point for the application serving the domain `amfruits.shop` and `www.amfruits.shop`. It statically serves the React SPA frontend and reverse-proxies all `/api/*` and WebSocket upgrades to the internal Node backend. It provides compression (gzip), security headers, handles Let's Encrypt ACME challenges, and rate-limiting. Health checks utilize `GET /nginx-health`.
- **App Container:** Runs the Node backend (`node:22-slim`) on internal port `3000`. It executes the bundled Hono server (`dist/boot.js`). Health checks utilize `GET /health` internally.
- **Database Container:** Runs `postgres:15-alpine` on internal port `5432`. Data is persisted using the `pgdata` volume.

### Volumes and Networks

- **Networks:** Services communicate securely over the `freshflow-network` bridge.
- **Volumes:** `pgdata` stores PostgreSQL database state. `product_uploads` stores uploaded product images at `/app/uploads`. `/etc/letsencrypt` is mounted to nginx for SSL certificates.

### Startup Sequence

1. `docker compose up --build` brings up the Database, App, and Nginx containers.
2. The Node App waits for the Postgres container health check (`pg_isready`).
3. The Node App starts, running Drizzle migrations programmatically in `api/boot.ts` before listening for requests.
4. Nginx waits for the App container health check before serving traffic.

### Network Request Flow

```text
Browser
    ↓
Cloudflare/DNS
    ↓
Nginx HTTPS
    ↓
React SPA
    ↓
/api/*
    ↓
Hono/tRPC
    ↓
PostgreSQL
```

### Razorpay Payment Flow

```text
Buyer
 ↓
Checkout
 ↓
Backend creates Razorpay order
 ↓
Razorpay Checkout
 ↓
Payment
 ↓
Frontend receives Razorpay response
 ↓
Backend verifies payment signature
 ↓
Order creation
 ↓
Database
```

### Payment Security Improvements

The payment flow has been production-hardened with the following features:

- **Razorpay Signature Verification:** Verifies the payment locally on the backend using the server-side Razorpay secret.
- **HMAC-SHA256:** Cryptographically hashes the payment payload.
- **Timing-safe Signature Comparison:** Uses `crypto.timingSafeEqual` to prevent timing attacks during signature validation.
- **Duplicate Payment/Order Protection (Idempotency):** Uses the `razorpayOrderId` to ensure multiple callbacks do not result in duplicate application orders.
- **Frontend Payment-in-progress State:** Prevents repeated checkout submissions by disabling checkout buttons while the Razorpay modal is open.
- **Failed/Cancelled Payment Handling:** Gracefully captures errors and failed states from the Razorpay modal.

## Current Features

- Email/password auth.
- Mobile OTP auth scaffolding/provider.
- JWT cookie sessions.
- Role-aware app shell.
- Centralized owner helper.
- Owner-only route and API protection for ERP functions.
- Product list/detail.
- Product-first public homepage for browsing active wholesale products before authentication.
- Product create with inventory creation.
- Product edit screen for owner catalog maintenance.
- Product archive mutation.
- Category create/update/delete.
- Inventory list/stats/update.
- Cart operations.
- Checkout/order creation.
- Buyer dashboard redesign.
- Owner dashboard analytics.
- Buyer-safe product catalog actions.
- Image fallback placeholders.
- Documentation single source of truth.

## Known Limitations

- Only one configured MVP owner email is supported.
- Future staff roles are planned but not persisted as first-class authorization records yet.
- Product upload currently uses local object URLs; no durable cloud storage is implemented.
- Import/export and bulk-edit buttons are UI affordances and need full workflows.
- Customer, invoice, delivery, warehouse, and platform settings pages are not yet fully separated route modules.
- Order analytics use available order data plus placeholder trend data where historical aggregates do not yet exist.
- Multi-tenant isolation is modeled through companies but not yet hardened with tenant middleware across every query.

## Future Architecture

Planned evolution:

- Add durable object storage for product media.
- Add role and permission tables for manager, warehouse staff, sales executive, and platform admin.
- Introduce tenant-aware middleware that scopes every query by active company/tenant.
- Implement invoice, delivery, customer, warehouse, and notification modules.

- Add import/export and bulk edit jobs.
- Add reporting aggregates and scheduled analytics snapshots.
- Add CI/CD, cloud deployment, and Kubernetes deployment targets.
- Add audit logs for owner/admin actions.
- Add automated tests for role gating, product CRUD, order lifecycle, and image fallback behavior.
