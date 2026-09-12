# Architecture

This document defines the technical architecture of the FreshFlow / AM Fruits application based strictly on verified repository implementation.

### 1. Project Identity

The application maintains a dual-naming convention:
- **Public Branding:** **AM Fruits** (domain `amfruits.shop`), visible to buyers and external customers across marketplace views, checkout flows, invoices, and notification emails.
- **Internal / Architectural Identifier:** **FreshFlow**, used throughout repository folders, database schemas, API routers, Docker services, and documentation.

## Project Overview

FreshFlow is a full-stack B2B wholesale produce commerce platform and ERP designed for fruit wholesalers, vegetable suppliers, grocery distributors, and bulk produce traders. It unifies two operational workspaces within a single responsive web application:

1. **Owner ERP Workspace:** A dedicated management environment for wholesale suppliers and business operators to manage catalogs, bulk pricing, category taxonomies, multi-status inventory, warehouse facilities, stock movements, customers, delivery zones, GST tax rates, shipping methods, invoices, and business analytics.
2. **Buyer Procurement Workspace:** A streamlined B2B ordering portal for commercial buyers (grocers, restaurants, institutions) to browse live wholesale produce, evaluate bulk specifications, manage shopping carts, calculate state-specific shipping and GST, checkout via Razorpay or Cash on Delivery, track orders, and view official tax invoices.

## Folder Structure

```text
app/
├── api/                    # Hono/tRPC backend routers, auth, middleware, and query functions
│   ├── auth/               # Password hashing, mobile OTP normalization, OTP store, and JWT sessions
│   ├── lib/                # Server utilities (cookies, env validation, HTTP helpers, Razorpay, Vite)
│   ├── queries/            # Drizzle ORM query modules and connection proxy with mock fallback
│   ├── services/           # Background services (transactional email, order notification)
│   ├── *Router.ts          # Domain-specific tRPC routers (product, order, warehouse, invoice, etc.)
│   ├── context.ts          # Per-request tRPC context with JWT authentication resolution
│   ├── middleware.ts       # Procedure middleware (publicQuery, authedQuery, ownerQuery, adminQuery)
│   ├── boot.ts             # Server entry point, runs migrations and boots Hono HTTP listener
│   └── router.ts           # App router aggregating all 16 domain routers
├── contracts/              # Shared server/client types, constants, error codes, and role definitions
├── db/                     # Drizzle ORM schema, table relations, seed data, and migration scripts
├── docs/                   # Architecture, API standards, authentication, roadmap, and UI docs
├── nginx/                  # Production Nginx reverse proxy configuration, SSL, and security headers
├── public/                 # Static assets (avatars, icons, logos, manifest)
├── src/                    # React 19 single-page application
│   ├── components/         # Layout shells (AppLayout, Navbar, Footer) and shadcn/ui components
│   ├── hooks/              # Custom React hooks (useAuth, useDebounce, etc.)
│   ├── lib/                # Client utilities, tRPC client configuration, and role helpers
│   ├── pages/              # Route-level view components (marketplace, ERP modules, auth, settings)
│   └── providers/          # React 19 native ThemeProvider and tRPC QueryClient provider
├── dist/                   # Production build outputs (frontend SPA assets and bundled server)
├── Dockerfile              # Multi-stage production build (Node 22-slim)
└── docker-compose.yml      # Multi-container orchestration (App, Nginx, PostgreSQL)
```

## Technology Stack

| Layer | Technology | Implementation Details |
| --- | --- | --- |
| **Frontend Framework** | React 19 (`react@^19.0.0`) | Modern React 19 SPA with concurrent rendering features |
| **Build & Tooling** | Vite 6 (`vite@^6.0.7`) + TypeScript 5.7 | Fast bundling, strict TypeScript type checking |
| **Client Routing** | React Router 7 (`react-router-dom@^7.0.2`) | Declarative client-side routing with role-gated guards |
| **Styling & Icons** | Tailwind CSS 3, Lucide React (`lucide-react@^0.468.0`) | Utility-first styling with responsive, accessible layout |
| **Theme System** | Custom React 19 Native `ThemeProvider` | Document class manipulation (`light`/`dark`/`system`), zero-script hydration, database profile sync |
| **Data Fetching / RPC**| tRPC 11 (`@trpc/server`, `@trpc/react-query`) + TanStack Query 5 | End-to-end typesafe client-server communication |
| **Backend Framework** | Hono (`hono@^4.6.14`) | High-performance server framework running on Node.js 22 |
| **Validation** | Zod (`zod@^3.24.1`) | Runtime input and schema validation across client and server |
| **Database & ORM** | Drizzle ORM (`drizzle-orm@^0.38.3`) + PostgreSQL | Schema-first relational modeling, automated migrations |
| **Database Resiliency**| Dynamic Connection Proxy (`api/queries/connection.ts`) | Automatic failover to in-memory `mockDbInstance` upon connection drops |
| **Authentication** | Passwords (bcryptjs), Mobile OTP, JWT Cookies | Dual-token HTTP-only cookie session management |
| **Payment Gateway** | Razorpay Node SDK (`razorpay@^2.9.5`) | HMAC-SHA256 signature verification, timing-safe equality |
| **Transactional Email**| Nodemailer (`nodemailer@^6.9.16`) + Resend API | Fail-safe admin order alerts with HTML/plain-text templates |
| **Container & Proxy** | Docker Compose, Nginx (`nginx:stable`), Node 22-slim | Production containerization, SSL termination, static SPA serving |

## Frontend Architecture

The frontend is a React 19 single-page application built on Vite and React Router 7. Route declarations are centralized in `src/App.tsx`.

### Route Structure and Access Control

Routes are partitioned into three distinct tiers:

1. **Public Routes:** Accessible without an active session:
   - `/`: B2B wholesale marketplace landing page (`src/pages/LandingPage.tsx`). Allows immediate product discovery, category filtering, search, and detail viewing without forced sign-in.
   - `/login`, `/register`, `/auth`: Authentication views supporting email/password and mobile OTP flows (`src/pages/Auth.tsx`).
2. **Authenticated Buyer Routes (`PrivateRoute`):** Protected views requiring a valid session:
   - `/dashboard`: Buyer procurement dashboard (`src/pages/Dashboard.tsx`), featuring quick search, category shortcuts, reorder alerts, recent purchases, and active deliveries.
   - `/products`, `/products/:slug`: Wholesale catalog exploration with bulk pricing and stock status (`src/pages/Products.tsx`, `src/pages/ProductDetail.tsx`).
   - `/cart`: Shopping cart management with line-item notes and bulk quantity adjustments (`src/pages/Cart.tsx`).
   - `/checkout`: Multi-step checkout with address selection, zone-based shipping calculations, GST computation, and payment selection (`src/pages/Checkout.tsx`).
   - `/orders`, `/orders/:id`: Purchase order history and detailed order fulfillment timelines (`src/pages/Orders.tsx`, `src/pages/OrderDetail.tsx`).
   - `/delivery-tracking`: Active order shipment tracker (`src/pages/DeliveryTracking.tsx`).
   - `/profile`, `/settings`: Personal profile editing, avatar selection, theme preference, and password updates (`src/pages/Profile.tsx`, `src/pages/Settings.tsx`).
3. **Owner / Admin ERP Routes (`OwnerRoute`):** Protected views strictly restricted to the business owner or users with the `admin` role:
   - `/dashboard`: Operational analytics view (`src/pages/Dashboard.tsx`), surfacing revenue aggregates, inventory valuations, low-stock warnings, and recent order feeds.
   - `/products/:slug/edit`: Wholesale catalog maintenance, SKU adjustments, bulk tiers, and visibility toggles (`src/pages/EditProduct.tsx`).
   - `/categories`: Produce category taxonomy management (`src/pages/Categories.tsx`).
   - `/inventory`: Multi-metric stock level management, batch tracking, expiry monitoring, and stock adjustment tools (`src/pages/Inventory.tsx`).
   - `/warehouses`: Physical warehouse facility management, capacity utilization, stock assignment, and stock movements log (`src/pages/Warehouse.tsx`).
   - `/customers`: B2B customer directory, credit terms, and purchasing histories (`src/pages/Customers.tsx`).
   - `/invoices`, `/invoices/:id`: Immutable tax invoice records, print views, and financial reports (`src/pages/Invoices.tsx`, `src/pages/InvoiceDetail.tsx`).
   - `/delivery-zones`: Serviceable geographic states, delivery time estimates, and threshold rules (`src/pages/DeliveryZones.tsx`).
   - `/shipping-methods`: Warehouse and zone-linked shipping charges and free shipping tiers (`src/pages/ShippingMethods.tsx`).
   - `/gst-settings`: Category-mapped GST tax rules and HSN code configuration (`src/pages/GstSettings.tsx`).
   - `/reports`: Multi-period sales, orders, inventory, and product performance analytics (`src/pages/Reports.tsx`).

### Shell and Layout Architecture

`src/components/AppLayout.tsx` serves as the primary authenticated shell. It dynamically configures the sidebar and top navigation based on the active user role:
- **Business Owner & Admin:** Displays ERP navigation covering Dashboard, Products, Categories, Inventory, Warehouses, Customers, Invoices, Delivery Zones, Shipping Methods, GST Settings, Reports, Settings, and Profile.
- **Buyer Accounts:** Displays procurement navigation covering Dashboard, Browse Products, Cart (with badge count), Orders, Delivery Tracking, Settings, and Profile.

### Theme System

The application features a clean, native React 19 theme provider (`src/providers/theme.tsx`) supporting `light`, `dark`, and `system` modes. Theme preferences are applied directly to the document root element (`classList.toggle('dark')`) without injecting raw script tags, eliminating React 19 DOM hydration errors while persisting user selections both to `localStorage` and the database `users.themePreference` column.

## Backend Architecture

The backend is built using Hono with tRPC 11 routers. It compiles via `esbuild` from `api/boot.ts` into a self-contained CommonJS bundle at `dist/boot.js`.

### Middleware and Authorization Tiers

Backend endpoints are protected via four middleware layers defined in `api/middleware.ts`:

1. `publicQuery` / `publicProcedure`: Permits unauthenticated access for public catalog browsing, category lookups, and authentication endpoints.
2. `authedQuery` / `authedProcedure`: Validates the JWT session cookie via `authenticateRequest` in `api/context.ts`. Injects the verified user into procedure context `ctx.user`.
3. `ownerQuery` / `ownerProcedure`: Restricts execution to the designated business owner email (`mdsohail88008@gmail.com`) or users possessing `role === "admin"`.
4. `adminQuery` / `adminProcedure`: Restricts execution strictly to users possessing `role === "admin"`.

### Complete tRPC Router Surface

The root router in `api/router.ts` combines 16 domain routers:

1. **`auth` (`api/auth-router.ts`):** Session resolution (`session`), email login (`login`), user registration (`register`), mobile OTP request/verify (`requestOtp`, `verifyOtp`), session refresh (`refresh`), and logout (`logout`).
2. **`product` (`api/productRouter.ts`):** Public catalog browsing (`list`, `detail`, `bySlug`, `featured`, `count`, `categories`, `suppliers`, `stats`); owner catalog management (`create`, `update`, `delete`, `archive`).
3. **`category` (`api/categoryRouter.ts`):** Public category taxonomy (`list`, `byId`, `bySlug`, `tree`); owner category maintenance (`create`, `update`, `delete`).
4. **`cart` (`api/cartRouter.ts`):** User-scoped cart management (`list`, `add`, `update`, `remove`, `clear`, `count`).
5. **`order` (`api/orderRouter.ts`):** Order lifecycle (`list`, `detail`, `byOrderNumber`, `create`, `updateStatus`, `cancel`, `stats`, `recent`).
6. **`inventory` (`api/inventoryRouter.ts`):** Stock operations (`list`, `byId`, `byProduct`, `bySupplier`, `update`, `updateStock`, `adjustStock`, `stockIn`, `stockOut`, `transfer`, `delete`, `status`, `stats`).
7. **`warehouse` (`api/warehouseRouter.ts`):** Physical facility operations (`list`, `get`, `byId`, `create`, `update`, `updateById`, `delete`, `assignStock`, `stock`, `receive`, `dispatch`, `movements`, `stats`).
8. **`invoice` (`api/invoiceRouter.ts`):** Tax invoice management (`list`, `detail`, `byOrder`, `print`).
9. **`report` (`api/reportRouter.ts`):** Business intelligence queries (`dashboardSummary`, `sales`, `orders`, `inventory`, `products`, `invoices`, `businessSummary`) with period filters (`today`, `yesterday`, `this_week`, `this_month`, `this_quarter`, `this_year`).
10. **`customer` (`api/customerRouter.ts`):** B2B customer management (`list`, `detail`, `orderHistory`, `create`, `update`, `delete`, `stats`).
11. **`deliveryZone` (`api/deliveryZoneRouter.ts`):** Serviceable area rules (`list`, `detail`, `availability`, `create`, `update`, `delete`, `stats`).
12. **`shipping` (`api/shippingRouter.ts`):** Shipping method rules and order calculation (`list`, `calculate`, `create`, `update`, `delete`, `stats`).
13. **`gst` (`api/gstRouter.ts`):** Tax rules and order GST calculations (`list`, `detail`, `calculate`, `create`, `update`, `delete`, `stats`).
14. **`profile` (`api/profileRouter.ts`):** User profile operations (`current`, `avatars`, `update`, `changePassword`).
15. **`address` (`api/addressRouter.ts`):** Saved user addresses (`list`, `create`, `update`, `delete`, `setDefault`).
16. **`company` (`api/companyRouter.ts`):** Company lookups (`list`, `byId`, `bySlug`, `search`).

## Database Schema & Domain Modeling

The database schema is defined in `db/schema.ts` and associated relations in `db/relations.ts`. It includes 17 relational tables:

1. **`users`:** Core user credentials, authentication provider (`local`, `mobile`), role (`user`, `admin`), company association (`companyId`), personal profile fields, and `themePreference` (`system`, `light`, `dark`).
2. **`otpVerifications`:** Pluggable mobile login OTP verification challenges, code hashes, and expiry timestamps.
3. **`userAddresses`:** Definitive source of truth for buyer and user delivery addresses with default flags.
4. **`companies`:** B2B wholesale organizations (`supplier`, `buyer`, `both`), credit terms (`net_15`, `net_30`, `cod`, `prepaid`), tax identifiers, minimum order amounts, and verification statuses.
5. **`customers`:** Supplier-managed buyer relationship directory linking optional `buyerCompanyId`.
6. **`categories`:** Produce taxonomy with hierarchical nesting (`parentId`), UI color codes, icons, and display ordering.
7. **`products`:** Wholesale produce catalog items with units of measure (`kg`, `lb`, `case`, `pallet`, `box`, etc.), pricing, minimum order quantities, fruit grades (`premium`, `grade_a`, `grade_b`, `standard`), organic flags, and marketplace presentation controls (`marketplaceVisible`, `showInFreshDeals`, `isFeatured`, `displayPriority`).
8. **`cartItems`:** Active user-scoped shopping cart line items with live unit prices.
9. **`orders`:** Master purchase order headers tracking status lifecycle (`pending`, `confirmed`, `packed`, `ready_for_dispatch`, `out_for_delivery`, `delivered`, `cancelled`), payment status, payment method (`upi`, `cod`), Razorpay transaction identifiers, snapshot addresses, warehouse ID, delivery zone ID, shipping method ID, and GST configuration ID.
10. **`orderItems`:** Immutable line items captured at order creation with product names, units, quantities, unit prices, and total prices.
11. **`invoices`:** Immutable tax invoices generated upon order completion, including company tax details, billing address, tax breakdowns, GST rates, and GSTIN.
12. **`invoiceItems`:** Immutable item snapshots linked to invoice headers.
13. **`inventory`:** Granular stock tracking per product per supplier (`quantityOnHand`, `quantityReserved`, `quantityAvailable`, `reorderLevel`, `reorderQuantity`, `warehouseLocation`, `batchNumber`, `expiryDate`, and status: `in_stock`, `low_stock`, `out_of_stock`).
14. **`warehouses`:** Physical storage facilities per company with capacity tracking (`capacityUnits`, `usedCapacityUnits`), addresses, and active/inactive status.
15. **`warehouseStockMovements`:** Immutable audit log for stock receipts and dispatches with timestamps, order linkage, and user attribution.
16. **`deliveryZones`:** Geographic delivery regions mapped by state with delivery time estimates (`same_day`, `next_day`, `within_2_days`, `within_3_5_days`), delivery fees, and minimum order values.
17. **`gstConfigurations`:** Category-specific GST tax rules (HSN codes, GSTIN, rates up to 28%).
18. **`shippingMethods`:** Configurable shipping options per warehouse/zone with threshold-based free shipping rules.

## Database Resilience & Mock Store Fallback

To guarantee high availability across diverse deployment environments, offline development, and sandbox previews, `api/queries/connection.ts` implements a dynamic Database Proxy pattern:

1. **Connection Initialization:** The system attempts to initialize a standard Drizzle ORM client over a PostgreSQL connection pool (`node-postgres`).
2. **Dynamic Trap Proxy:** The database instance exported by `getDb()` is wrapped in a JavaScript `Proxy`. Any query invocation catches runtime connection exceptions (such as `ECONNREFUSED`, `ENOTFOUND`, invalid credentials, or missing database instances).
3. **Graceful Degradation to `mockDbInstance`:** If the real database connection fails, the proxy intercepts the failure, logs a clear warning, and transparently routes all database operations to `mockDbInstance` (`api/queries/mockDb.ts`).
4. **Comprehensive In-Memory Mock Store:** `mockDbInstance` provides an in-memory relational store populated with realistic wholesale produce data (companies, categories, products, inventory, users, warehouses, delivery zones, GST rules, and shipping methods), supporting `select`, `where`, `insert`, `update`, `delete`, and table join queries.

## Order, Payment & Notification Lifecycle

Order processing is fully verified and coordinated across four integrated stages:

```text
[Buyer Shopping Cart]
       ↓ (Proceed to Checkout)
[Shipping & Tax Calculation]
  - Delivery zone fee evaluated based on destination state
  - GST tax computed per category rate (CGST/SGST/IGST)
       ↓
[Payment Method Selection]
  ├── Cash on Delivery (COD) ──→ Instant order creation
  └── Online Payment (Razorpay):
       1. Server generates Razorpay Order
       2. Frontend presents Razorpay Checkout Modal
       3. Payment completed on Razorpay gateway
       4. Client submits payment ID, order ID, and signature
       5. Server verifies signature via HMAC-SHA256 (timingSafeEqual)
       ↓
[Order Persistence & Processing]
  - Validates cart inventory availability
  - Inserts master Order record and snapshot OrderItems
  - Auto-generates immutable Invoice and InvoiceItems
  - Decrements inventory quantities / updates reservation
  - Empties buyer's shopping cart
       ↓
[Transactional Notification]
  - Invokes `notifyAdminNewOrder` in `api/services/orderNotification.ts`
  - Formats branded HTML/text email containing customer, address, itemized units, and direct admin link
  - Dispatches via Resend API or SMTP (nodemailer)
  - Idempotency guard (`notifiedOrderIds`) prevents duplicate emails
  - Error isolation ensures email delivery failures never break order success
```

## Security & Access Control

- **JWT Session Tokens:** Authentication issues HTTP-only access and refresh tokens stored in secure cookies (`freshflow_access_token`, `freshflow_refresh_token`), preventing client-side script theft (XSS).
- **Password Hashing:** Passwords are cryptographically hashed using `bcryptjs` with salt rounds.
- **Mobile OTP Security:** OTP codes are hashed before storage in `otpVerifications` and validated against expiry and consumption flags.
- **Timing-Safe Signatures:** Razorpay payment signature verification uses `crypto.timingSafeEqual` to eliminate timing attacks.
- **Idempotent Order Creation:** Order endpoints check for existing `razorpayOrderId` records to reject duplicate order creation submissions.
- **Security Headers:** Nginx enforces strict HTTP security headers including `X-Frame-Options SAMEORIGIN`, `X-Content-Type-Options nosniff`, `X-XSS-Protection "1; mode=block"`, and Content Security Policy (CSP).

## Container Deployment & Production Infrastructure

Production deployment is orchestrated via Docker Compose (`docker-compose.yml`):

- **Nginx Container (`nginx:stable`):**
  - Acts as the primary ingress proxy listening on ports `80` (HTTP) and `443` (HTTPS).
  - Configured for domains `amfruits.shop` and `www.amfruits.shop`.
  - Serves compiled static SPA frontend files directly with gzip compression and caching headers.
  - Proxies `/api/*` and WebSocket upgrades to the internal Node application container on port `3000`.
  - Mounts `/etc/letsencrypt` for SSL certificate persistence and handles ACME challenge validation.
  - Exposes `/nginx-health` for uptime monitoring.
- **App Container (`node:22-slim`):**
  - Executes the bundled Node.js/Hono server (`dist/boot.js`).
  - Runs programmatic database migrations on startup before binding to port `3000`.
  - Mounts the `product_uploads` volume at `/app/uploads` for local asset storage.
  - Exposes internal health check at `GET /health`.
- **Database Container (`postgres:15-alpine`):**
  - Hosts PostgreSQL on internal port `5432` with health checks via `pg_isready`.
  - Persists database state via named Docker volume `pgdata`.
- **Bridge Network:** All containers communicate securely across the isolated `freshflow-network` bridge.

