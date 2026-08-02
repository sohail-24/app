# FreshFlow Roadmap

FreshFlow is being built as a production-ready B2B wholesale commerce platform following a Platform Engineering approach.

Development follows this principle:

Foundation → Business Platform → Platform Engineering → DevOps → Cloud → Kubernetes → Observability

---

# Phase 1 — Foundation

## Authentication

- [x] Email Registration
- [x] Mobile Registration
- [x] Email Login
- [x] Mobile Login
- [x] Mobile OTP Authentication
- [x] JWT Authentication
- [x] Access Token
- [x] Refresh Token
- [x] HTTP-only Cookie Sessions
- [x] Authentication Documentation

## User & Company

- [x] User Profile
- [x] Profile Update
- [ ] Company Profile
- [ ] Business Settings
- [ ] Role Mapping
- [ ] Authorization Review

---

# Phase 2 — Business Platform

## Product Management

- [x] Product CRUD
- [x] Product Edit
- [x] Product Archive
- [x] Product Search
- [x] Product Images
- [ ] Durable Image Storage

## Category Management

- [x] Category CRUD
- [ ] Category Analytics

## Inventory

- [x] Inventory CRUD
- [x] Warehouse Management
- [x] Stock Movement History
- [ ] Low Stock Alerts

## Orders

- [x] Cart
- [x] Checkout
- [x] Order Creation
- [ ] Order Approval
- [ ] Order Dispatch
- [ ] Delivery Tracking
- [x] Invoice Management

## Customers

- [x] Customer Management
- [ ] Supplier Profiles
- [ ] Buyer Profiles

## Reports

- [x] Sales Reports
- [x] Inventory Reports
- [x] Order Analytics
- [ ] Business Dashboard

---

# Phase 1
Docker & Docker Compose

# Phase 2
Deploy to a single server / VPS

# Phase 3
CI/CD

# Phase 4
Kubernetes (future scaling)

# Phase 8 — Enterprise SaaS

- [ ] Multi-Tenant Isolation
- [ ] Tenant Middleware
- [ ] Permission Tables
- [ ] Staff Roles
- [ ] Audit Logs
- [ ] Subscription System
- [ ] Usage Limits
- [ ] Billing

---

# Future Security

- [ ] Email Verification
- [ ] SMS Verification
- [ ] Forgot Password
- [ ] Reset Password
- [ ] MFA
- [ ] Rate Limiting
- [ ] Login History
- [ ] Device Management