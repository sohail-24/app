# FreshFlow Authentication & Authorization

Version: 1.0

Status: Stable (MVP)

Last Updated: July 2026

---
# Purpose

This document defines the authentication and authorization standards used throughout the FreshFlow project.

It describes how users authenticate, how sessions are managed, how permissions are enforced, and how future security features will be integrated.

Business modules should reference this document instead of defining authentication behaviour independently.

# Overview

FreshFlow uses a production-oriented authentication architecture based on JWT, HTTP-only cookies, password hashing, and role-aware authorization.

The authentication system supports multiple login methods while keeping the business modules independent from authentication.

Current authentication methods:

- Email + Password
- Mobile Number + Password
- Mobile OTP (supported)
- JWT Access Token
- JWT Refresh Token
- HTTP-only Secure Cookies

The authentication system is designed so future features such as Email Verification, SMS OTP Verification, Forgot Password, Multi-Factor Authentication (MFA), and Device Management can be added without redesigning the existing database.

---

# Mobile Number Handling

- Mobile numbers are strictly stored in the database natively in E.164 format (e.g. `+91XXXXXXXXXX`).
- In the frontend UI, mobile numbers are strictly inputted and presented as 10-digit strings without the `+91` prefix.
- The client-side form validation checks for exactly 10 digits.
- Client-side logic strips the `+91` prefix from API responses before displaying it, and normalizes inputs to `+91XXXXXXXXXX` before submitting mutations to the backend.

---

# Goals

Authentication should provide:

- Secure user registration
- Secure login
- Stateless JWT authentication
- Automatic session renewal
- Role-based authorization
- Production-ready cookie security
- Future scalability

---

# Authentication Architecture

```text
                Register/Login
                       │
                       ▼
              Input Validation (Zod)
                       │
                       ▼
            Password Hashing (bcryptjs)
                       │
                       ▼
                PostgreSQL Database
                       │
                       ▼
               Generate JWT Tokens
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   Access Token              Refresh Token
      15 min                    Long-lived
          │                         │
          └────────────┬────────────┘
                       ▼
              HTTP-only Cookies
                       │
                       ▼
               Protected API Routes
```

---

# Authentication Flow

## Registration

```text
User

↓

Choose Registration Method

↓

Email OR Mobile

↓

Enter Password

↓

Confirm Password

↓

Validate Input

↓

Create Company

↓

Create User

↓

Hash Password

↓

Save User

↓

Issue JWT Cookies

↓

Login Complete
```

---

## Email Login

```text
User

↓

Email

↓

Password

↓

Find User

↓

Verify Password

↓

Issue Session Cookies

↓

Authenticated
```

---

## Mobile Login

```text
User

↓

Mobile Number

↓

Password

↓

Verify Password

↓

Issue Session Cookies

↓

Authenticated
```

---

## Mobile OTP Login

```text
User

↓

Enter Mobile

↓

Request OTP

↓

Generate OTP

↓

Store OTP

↓

Verify OTP

↓

Issue Session Cookies

↓

Authenticated
```

---

# Session Architecture

FreshFlow uses two JWT tokens.

## Access Token

Purpose:

- API authentication

Characteristics:

- Short lifetime
- Stored in HTTP-only cookie

---

## Refresh Token

Purpose:

- Generate new Access Tokens

Characteristics:

- Longer lifetime
- Stored in HTTP-only cookie
- Hash stored in PostgreSQL

---

# Automatic Session Refresh

```text
Incoming Request

↓

Access Token Valid?

YES
↓

Continue Request

NO
↓

Refresh Token Valid?

YES
↓

Issue New Tokens

↓

Continue Request

NO
↓

Return Unauthorized
```

---

# Security Features

Implemented:

- bcryptjs password hashing
- JWT Access Tokens
- JWT Refresh Tokens
- Refresh Token Hashing
- HTTP-only Cookies
- Secure Cookie Support
- Automatic Session Refresh
- Role-aware Authorization
- Zod Validation
- User Active Check

---

# Database

Authentication currently uses:

## users

Important fields

- id
- email
- phone
- passwordHash
- refreshTokenHash
- role
- companyId
- isActive
- emailVerifiedAt
- mobileVerifiedAt
- lastSignInAt
- createdAt
- updatedAt

---

## otp_verifications

Stores:

- OTP
- Mobile Number
- Expiration
- Verification Status

---

# Roles

Current implementation

- admin
- user

Business Mapping

Platform

- platform_admin

Business

- business_owner

Future

- warehouse_staff
- sales_executive
- manager
- accountant
- buyer

---

# Authentication Router

Authentication Router

Current Procedures

- me
- register
- loginEmail
- loginMobile
- requestMobileOtp
- verifyMobileOtp
- refresh
- logout

---

# Password Security

Passwords are never stored directly.

```text
Password

↓

bcryptjs

↓

Hash

↓

Database
```

---

# Cookies

Authentication uses HTTP-only cookies.

Benefits

- JavaScript cannot access tokens
- Better XSS protection
- Automatic browser management
- Easier session handling

---

# Current Status

Implemented

- Email Registration
- Mobile Registration
- Email Login
- Mobile Login
- Mobile OTP Login
- JWT Authentication
- Refresh Tokens
- Session Cookies
- Password Hashing
- Logout
- Current User API
- Authentication Middleware

---

# Deferred Features

These are intentionally postponed until the platform has real users.

Authentication

- Email Verification
- SMS OTP Verification
- Forgot Password
- Reset Password
- Change Password

Security

- Rate Limiting
- Account Lockout
- Login History
- Device Management
- Multi-Factor Authentication (MFA)
- Security Alerts

Reason

The current authentication system is sufficient for MVP development.

Additional security workflows will be implemented before production launch or when the platform begins serving real users.

---
# Authorization Rules

Business modules must never implement their own authentication.

Authentication and authorization are centralized.

Every protected operation must verify authentication before applying business-specific permission rules.

---

# Testing Checklist

Authentication

- Register
- Email Login
- Mobile Login
- OTP Login
- Logout
- Refresh Token
- Invalid Password
- Invalid OTP
- Expired Session

Security

- Password Hashing
- Cookie Creation
- Cookie Removal
- JWT Validation
- Protected Routes

---

# Future Improvements

Phase 2

- Email Verification
- Forgot Password
- Reset Password

Phase 3

- SMS Gateway
- OTP Retry Limits
- Rate Limiting
- Device Management

Phase 4

- MFA
- Audit Logs
- Security Dashboard

---

# DevOps Notes

Authentication secrets must always be provided through environment variables.

Examples

- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- OWNER_EMAIL

Never hardcode secrets inside the application.

Production deployments should rotate secrets through the deployment platform.

---

# Module Status

Production Readiness

Architecture        ✅
Database            ✅
Password Hashing    ✅
JWT                 ✅
Cookies             ✅
Refresh Tokens      ✅
Middleware          ✅
Authorization       ✅

Future

Email Verification  ⏳
SMS OTP             ⏳
MFA                 ⏳
Rate Limiting       ⏳

Overall Status

Authentication Module v1.0
Stable for MVP Development