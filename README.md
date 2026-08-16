# FreshFlow

FreshFlow is a B2B wholesale marketplace for fruit suppliers and buyers. The app uses React, Vite, Hono, tRPC, PostgreSQL, and Drizzle ORM. It provides two separate workflows: a Buyer Workspace for procurement and a Business Owner Workspace for ERP operations.

## Setup

### Development

```bash
npm install
cp .env.example .env
npm run dev
```

### Production (Docker)

FreshFlow is containerized for production following a Platform Engineering Phase 1 approach. It uses Docker Compose with an Nginx reverse proxy, a Node 22-slim backend, and a PostgreSQL 15-alpine database.

```bash
cp .env.example .env
docker compose up --build -d
```

- Nginx will run on port `80` acting as the single public entry point, serving static files and reverse-proxying `/api/*` to the backend.
- The Node backend (Hono server + tRPC) runs internally on port `3000`.
- The database runs internally on port `5432`.
- Migrations are automatically run in `api/boot.ts` during backend startup.

Required production environment variables:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Development OTP login uses `MOCK_OTP_CODE`, which defaults to `123456`.

## Scripts

```bash
npm run dev
npm run build
npm run check
npm run test
```

## Authentication

FreshFlow uses local authentication.

- Email/password login with bcrypt password hashing.
- +91 mobile OTP login through an `OtpProvider` interface.
- Mock OTP provider in development; replace `api/auth/otp-provider.ts` to add Twilio, MSG91, or another SMS provider.
- Access and refresh JWTs are stored in HTTP-only cookies.
- Refresh tokens are hashed before being persisted on the user record.
- Logout clears both cookies and removes the stored refresh token hash.

Public routes:

- Products
- Product search
- Product details
- Add to cart
- View cart

Protected routes:

- Checkout
- Orders
- Profile
- Dashboard
- Inventory
- Reports
- Settings

Protected routes redirect to `/login?returnTo=...` and return users to the requested page after successful login. Guest cart items are stored locally and synced to the server cart after login.

## Documentation

- Architecture: `docs/ARCHITECTURE.md`
- Auth API: `docs/API.md`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
