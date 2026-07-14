# FreshFlow

FreshFlow is a B2B wholesale marketplace for fruit suppliers and buyers. The app uses React, Vite, Hono, tRPC, MySQL, and Drizzle ORM.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

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
