# FreshFlow API Standards

**Version:** 1.1

**Status:** Active

**Last Updated:** 2026-07-27

---

# Purpose

This document defines the official API standards for the FreshFlow project.

It does not document individual business module APIs.

Each business module is responsible for maintaining its own `API.md` document.

This document serves as the project-wide API standard that every backend service and module must follow.

---

# API Architecture

FreshFlow exposes backend functionality through **tRPC**.

Business logic is organised into independent routers.

Current implemented routers:

```text
address
auth
cart
category
company
customer
deliveryZone
gst
inventory
invoice
order
product
profile
report
shipping
warehouse
```

Each router owns its own business operations.

---

# Module Ownership

Each business module maintains its own API documentation.

Example:

```text
docs/UI/categories/API.md
docs/UI/company/API.md
docs/UI/inventory/API.md
docs/UI/invoices/API.md
docs/UI/orders/API.md
docs/UI/products/API.md
docs/UI/reports/API.md
docs/UI/user-profile/API.md
docs/UI/warehouse/API.md
```

Project-level API standards belong only in this document.

Business-specific endpoints belong inside the corresponding module.

---

# API Design Principles

All APIs should follow these principles:

* Single responsibility.
* Clear naming.
* Predictable behaviour.
* Business-focused operations.
* Consistent validation.
* Consistent error handling.
* Reusable request models.
* Reusable response models.

---

# Naming Standards

Router names use singular nouns.

Examples:

```text
auth
company
category
product
inventory
warehouse
order
invoice
report
```

Procedure names use verbs that describe the operation.

Examples:

```text
list
get
create
update
delete
archive
search
stats
count
```

Avoid unclear names such as:

```text
process
handle
execute
doSomething
```

---

# Authentication

Authentication is required for protected APIs.

Supported authentication methods are documented in:

```text
docs/AUTHENTICATION.md
```

Authentication should be completed before any protected business operation.

---

# Authorization

Authorization must be enforced on the server.

Permissions must never rely solely on the frontend.

Business rules determine who can perform each operation.

Future role expansion should not require API redesign.

---

# Validation

All API inputs must be validated before business logic executes.

Validation should include:

* Required fields
* Data types
* Length limits
* Numeric ranges
* Business rules
* Enum validation
* Format validation

Invalid requests must return meaningful validation errors.

---

# Error Handling

APIs should return clear and consistent errors.

Typical error categories include:

* Validation Error
* Authentication Error
* Authorization Error
* Not Found
* Conflict
* Business Rule Violation
* Internal Server Error

Internal implementation details must never be exposed.

---

# Response Principles

Responses should be:

* Consistent
* Predictable
* Easy to understand
* Business-focused

Return only the information required by the client.

Avoid unnecessary data.

---

# Pagination

Large datasets should support pagination.

Typical examples include:

* Products
* Orders
* Inventory
* Reports

Pagination should remain consistent across all modules.

---

# Search

Search operations should:

* Support partial matches where appropriate.
* Return predictable results.
* Respect user permissions.
* Filter only accessible data.

---

# Filtering

Filtering should be available where it improves usability.

Typical filters include:

* Status
* Category
* Date
* Company
* Warehouse
* Supplier
* Buyer

Business modules define their own supported filters.

---

# Sorting

Sorting should be consistent across modules.

Common sorting options include:

* Name
* Created Date
* Updated Date
* Status
* Price
* Quantity

---

# Security Standards

Every API must follow these security principles:

* Authentication required where appropriate.
* Server-side authorization.
* Input validation.
* Protection against unauthorized access.
* Secure handling of sensitive information.
* Audit-ready business operations where required.

---

# API Documentation Rules

Every business module must maintain its own `API.md`.

Module documentation should include:

* Purpose
* Available operations
* Validation rules
* Business rules
* Request fields
* Response fields
* Error scenarios
* Security requirements

Project-wide standards should never be duplicated inside module documentation.

---


# Order & Payment Flow

The order creation process integrates securely with Razorpay.

## 1. Creating a Razorpay Order
- **Procedure:** `createRazorpayOrder`
- **Purpose:** Generates a short-lived `razorpay_order_id` intended for the frontend checkout.
- **Rules:** The amount and currency are securely calculated on the backend based on the user's cart.

## 2. Payment Verification
- **Procedure:** `create` (Order Creation)
- **Purpose:** Finalizes the application order only if the payment signature is valid.
- **Verification Inputs:**
  - `razorpayOrderId`
  - `razorpayPaymentId`
  - `razorpaySignature`
- **Security:** The backend securely verifies the `razorpaySignature` using `crypto.timingSafeEqual` against a locally computed HMAC-SHA256 hash using the server-side Razorpay secret (e.g., `RAZORPAY_KEY_SECRET`).

## 3. Idempotency & Duplicate Protection
If a `razorpayOrderId` has already been processed and an application order exists for it, another order must not be created.
- **Behavior:** The API queries the database for the provided `razorpayOrderId`. If found, a duplicate-payment conflict error is raised to prevent duplicate orders.


# Future Improvements

Future versions may include:

* API versioning
* Rate limiting
* Webhooks
* Batch operations
* Background job APIs
* Public developer APIs
* OpenAPI documentation
* API monitoring
* API analytics

---

# Related Documentation

Project documentation:

```text
ARCHITECTURE.md
AUTHENTICATION.md
DOCUMENTATION_STRUCTURE.md
ROADMAP.md
```

Business module documentation:

```text
docs/UI/<module>/API.md
```

---

# Version History

## Version 1.1

Updated to accurately reflect the real API implemented, including all current routers and Razorpay flow.

## Version 1.0

Initial API standards document.
