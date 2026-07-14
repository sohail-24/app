# FreshFlow API

FreshFlow exposes backend operations through tRPC at `/api/trpc`.

## Auth Router

All auth responses use HTTP-only cookies for session state.

### `auth.me`

Returns the current user or `null`.

### `auth.register`

Creates a business account and signs the user in.

Input:

```ts
{
  businessName: string;
  ownerName: string;
  mobileNumber: string; // +91 mobile number
  email?: string;
  password: string; // min 8 chars
  businessType: "buyer" | "supplier" | "both";
}
```

### `auth.loginEmail`

Signs in with email and password.

Input:

```ts
{
  email: string;
  password: string;
}
```

### `auth.requestMobileOtp`

Creates and sends an OTP challenge.

Input:

```ts
{
  mobileNumber: string; // +91 mobile number
}
```

Development responses include `devCode` when the mock provider is active.

### `auth.verifyMobileOtp`

Verifies OTP and creates or logs in the mobile account.

Input:

```ts
{
  mobileNumber: string;
  otp: string; // 6 digits
}
```

### `auth.refresh`

Rotates session cookies when a valid refresh cookie is present.

### `auth.logout`

Clears access and refresh cookies and removes the stored refresh token hash.

## Route Protection

Public product browsing, search, product details, adding to cart, and cart viewing do not require authentication. Checkout, orders, profile, dashboard, inventory, reports, and settings require a valid session.
