# FreshFlow — Architecture Documentation

## Project Overview

FreshFlow is a B2B Wholesale Marketplace platform for fruit wholesalers. It connects fruit suppliers with buyers (grocery chains, restaurants, distributors) for bulk ordering.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS 3.4 + shadcn/ui |
| Backend | Hono + tRPC 11.x |
| Database | MySQL (TiDB Cloud) + Drizzle ORM |
| Auth | Local email/password + mobile OTP + JWT sessions |
| Validation | Zod |
| Serialization | Superjson |

## Database Schema

### Tables

```
users              — Platform users with local/mobile credentials
otp_verifications  — Mobile OTP challenges
companies          — B2B entities (suppliers, buyers, both)
categories         — Product categories (Citrus, Tropical, etc.)
products           — Wholesale fruit products
cart_items         — Shopping cart entries
orders             — Purchase orders
order_items        — Order line items
inventory          — Stock tracking per product/supplier
```

### Key Relationships

- `users.companyId` → `companies.id` (many-to-one)
- `products.categoryId` → `categories.id` (many-to-one)
- `products.supplierId` → `companies.id` (many-to-one)
- `cartItems.userId` → `users.id` (many-to-one)
- `cartItems.productId` → `products.id` (many-to-one)
- `orders.buyerId` → `companies.id` (many-to-one)
- `orders.supplierId` → `companies.id` (many-to-one)
- `orderItems.orderId` → `orders.id` (many-to-one)
- `inventory.productId` → `products.id` (many-to-one)
- `inventory.supplierId` → `companies.id` (many-to-one)

### Indexes

Every foreign key and frequently queried column is indexed:
- Product: categoryId, supplierId, status, price, name (for search)
- Order: buyerId, supplierId, status, orderNumber
- Inventory: productId, supplierId, status, batchNumber

## API Architecture

### Router Structure

```
appRouter
├── ping              — Health check
├── auth              — Authentication (me, register, loginEmail, requestMobileOtp, verifyMobileOtp, refresh, logout)
├── product           — Product catalog (list, bySlug, byId, featured, count)
├── category          — Categories (list, bySlug, byId)
├── cart              — Shopping cart (list, add, update, remove, clear)
├── order             — Orders (list, detail, create, status, stats, recent)
├── inventory         — Inventory (list, byProduct, bySupplier, update, stats)
└── company           — Companies (list, byId, bySlug, search)
```

### Procedure Types

| Type | Auth Required | Use Case |
|------|-------------|----------|
| `publicQuery` | No | Product listings, categories, company profiles |
| `authedQuery` | Yes | Checkout, orders, inventory, reports, dashboard data |
| `adminQuery` | Admin role | Admin-only operations |

### Authentication Flow

1. User continues with email/password, registers a business account, or verifies a +91 mobile OTP.
2. Server creates or resolves the user, signs access and refresh JWTs, and stores the refresh token hash.
3. Access and refresh tokens are sent as HTTP-only secure cookies.
4. Request context resolves `ctx.user` when cookies are valid; `authedQuery` procedures require that user.
5. If the access token expires and a valid refresh cookie is present, the server rotates session cookies.

## Project Structure

```
app/
├── api/                    # Backend
│   ├── queries/           # Database query functions
│   ├── auth/              # Local auth, JWT, password, and OTP helpers
│   │   ├── connection.ts  # Drizzle connection
│   │   ├── companies.ts
│   │   ├── categories.ts
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   └── inventory.ts
│   ├── productRouter.ts
│   ├── categoryRouter.ts
│   ├── cartRouter.ts
│   ├── orderRouter.ts
│   ├── inventoryRouter.ts
│   ├── companyRouter.ts
│   ├── router.ts          # tRPC router aggregation
│   ├── middleware.ts      # Procedure types
│   ├── context.ts         # Auth context
│   └── auth-router.ts
├── db/
│   ├── schema.ts          # Table definitions
│   ├── relations.ts       # Drizzle relations
│   └── seed.ts            # Dev seed data
├── contracts/             # Shared types/constants
├── src/
│   ├── pages/            # Route pages
│   ├── components/       # Reusable UI
│   ├── hooks/            # Custom hooks
│   └── providers/        # tRPC provider
└── docs/                 # Documentation
```

## Key Design Decisions

### 1. B2B-First Data Model
- Companies are first-class entities, not just user profiles
- Users belong to companies, enabling team-based access
- Company types: supplier, buyer, or both
- Minimum order amounts at both company and product levels

### 2. Order Lifecycle
```
pending → confirmed → processing → shipped → delivered
  ↓
cancelled
```
- Each status transition records a timestamp
- Payment tracking is separate from fulfillment status

### 3. Inventory Tracking
- Three quantities tracked: on-hand, reserved, available
- Automatic status based on reorder levels
- Batch/lot tracking for traceability

### 4. Cart → Order Flow
- Cart is user-scoped (not company-scoped)
- Checkout converts cart items to order items with price snapshots
- Cart is cleared after successful order creation
- Order items denormalize product name/image for historical accuracy

## Security

- All mutations use Zod input validation
- Cart operations verify user ownership
- Order creation validates company association
- tRPC provides end-to-end type safety
- JWT sessions with httpOnly cookies
