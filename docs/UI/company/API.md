# Company API

Version: 1.0

Status: Approved Design

Module: Company

---

# Purpose

This document defines the official API contract for the Company module.

It specifies how the frontend communicates with the backend, what operations are supported, validation requirements, authorization rules, expected responses, and error handling.

This document is the single source of truth for all Company module APIs.

---

# API Principles

The Company APIs follow these principles.

* Authentication required for every request.
* Authorization enforced on the server.
* One company per business in Version 1.1.
* Company business settings are centrally managed by the Company module.
* Partial updates are preferred.
* Validate all input before saving.
* Return only necessary data.
* Maintain backward compatibility whenever possible.
---

# Authentication

Every Company API requires an authenticated session.

Authentication is provided by the FreshFlow Authentication Module using:

* JWT Access Token
* HTTP-only Cookies
* Refresh Token Rotation
* Session Validation

Unauthenticated requests are rejected.

---

# Authorization

Authorization rules:

* Only authorized users may view company information.
* Only authorized users may update company information.
* Only authorized users may upload a company logo.
* Only authorized users may remove a company logo.
* Only authorized users may manage delivery settings.

The authenticated company context is resolved from the current session.

---

# API Summary

Version 1.0 provides the following APIs.

| API                      | Purpose                             |
| ------------------------ | ----------------------------------- |
| Get Company              | Retrieve company information        |
| Create Company           | Create the initial company profile  |
| Update Company           | Update editable company information |
| Upload Company Logo      | Upload or replace company logo      |
| Delete Company Logo      | Remove company logo                 |
| Get Delivery Settings    | Retrieve supported delivery states  |
| Update Delivery Settings | Update supported delivery states    |



---

# API 1 — Get Company

## Purpose

Retrieve the authenticated company's information.

### Authentication

Required

### Authorization

Authorized users only.

### Input

No company identifier is required.

The backend resolves the company from the authenticated session.

### Response

Returns:

* Company ID
* Company Logo
* Company Name
* Business Type
* Business Email
* Business Phone
* Website
* Address
* City
* State
* Postal Code
* Created Date
* Updated Date
* Supported Delivery States

### Business Rules

* Only one company is returned.
* Company information is read from the central company record.

### Possible Errors

* UNAUTHORIZED
* COMPANY_NOT_FOUND
* INTERNAL_SERVER_ERROR

---

# API 2 — Create Company

## Purpose

Create the first company profile.

### Authentication

Required

### Authorization

Authorized users only.

### Required Fields

* Company Name
* Business Type
* Business Email
* Business Phone
* Address
* City
* State
* Postal Code

### Delivery Settings

* At least one supported delivery state

### Optional Fields

* Company Logo
* Website

### Business Rules

* Only one company profile may exist for the business.
* Company creation is allowed only if no company profile exists.

### Response

Returns the newly created company.

Supported Delivery States

### Possible Errors

* UNAUTHORIZED
* COMPANY_ALREADY_EXISTS
* VALIDATION_ERROR
* INTERNAL_SERVER_ERROR

### Delivery Settings

* At least one supported delivery state

---

# API 3 — Update Company

## Purpose

Update editable company information.

### Authentication

Required

### Authorization

Authorized users only.

### Editable Fields

* Company Name
* Business Type
* Business Email
* Business Phone
* Website
* Address
* City
* State
* Postal Code
* Supported Delivery States

### Business Rules

* Only modified fields should be updated.
* Validation occurs before saving.

### Validation

* Company Name is required.
* Business Type is required.
* Business Email must be valid.
* Business Phone is required.
* Address is required.
* City is required.
* State is required.
* Postal Code is required.

### Response

Returns the updated company information.

### Possible Errors

* UNAUTHORIZED
* COMPANY_NOT_FOUND
* VALIDATION_ERROR
* INTERNAL_SERVER_ERROR

---

# API 4 — Upload Company Logo

## Purpose

Upload or replace the company logo.

### Authentication

Required

### Authorization

Authorized users only.

### Business Rules

* Only one active logo is allowed.
* Uploading a new logo replaces the previous logo.
* If no logo exists, the default logo is displayed.

### Validation

* Supported image types only.
* Maximum file size enforced.
* Empty uploads rejected.

### Response

Returns the updated logo reference.

### Possible Errors

* UNAUTHORIZED
* COMPANY_NOT_FOUND
* FILE_TOO_LARGE
* UNSUPPORTED_FILE_TYPE
* INTERNAL_SERVER_ERROR

---

# API 5 — Delete Company Logo

## Purpose

Remove the current company logo.

### Authentication

Required

### Authorization

Authorized users only.

### Business Rules

* The custom logo is removed.
* The default logo is displayed automatically.
* No other company information is modified.

### Response

Returns the updated company profile.

### Possible Errors

* UNAUTHORIZED
* COMPANY_NOT_FOUND
* INTERNAL_SERVER_ERROR

---
API 6 — Get Delivery Settings
Purpose

Retrieve the company's configured delivery settings.

Authentication

Required

Authorization

Authorized users only.

Response

Returns:

* Supported Delivery States
* Active States
* Disabled States

Business Rules

* Delivery settings belong to the Company module.
* Orders consume these settings but cannot modify them.

Possible Errors

* UNAUTHORIZED
* COMPANY_NOT_FOUND
* INTERNAL_SERVER_ERROR

API 7 — Update Delivery Settings

Purpose

Update supported delivery states.

Authentication

Required

Authorization

Business Owner only.

Validation

* At least one state must remain enabled.
* Duplicate states are not allowed.
* Only supported system states can be configured.

Business Rules

* Changes become active immediately.
* Orders automatically use the updated configuration.

Response

Returns updated delivery settings.

Possible Errors

* UNAUTHORIZED
* COMPANY_NOT_FOUND
* INVALID_DELIVERY_CONFIGURATION
* INTERNAL_SERVER_ERROR

---

# Validation Rules

## Company Information

* Company Name is required.
* Business Type is required.
* Business Email must be valid.
* Business Phone is required.
* Address is required.
* City is required.
* State is required.
* Postal Code is required.

---
## Delivery Settings

* At least one supported delivery state is required.
* Duplicate states are not allowed.
* Only supported system states can be configured.

---

## Website

* Optional.
* Must be a valid URL when provided.

---

## Company Logo

* Image file required.
* Unsupported formats rejected.
* Maximum upload size enforced.

---

# Error Catalog

| Error                          | Description                          |
| ----------------------         | -------------------------------      |
| UNAUTHORIZED                   | Authentication required              |
| FORBIDDEN                      | Access denied                        |
| COMPANY_NOT_FOUND              | Company profile does not exist       |    
| COMPANY_ALREADY_EXISTS         | Company profile already created      |
| VALIDATION_ERROR               | Input validation failed              |
| FILE_TOO_LARGE                 | Logo exceeds maximum size            |
| UNSUPPORTED_FILE_TYPE          | Invalid image format                 |
| INTERNAL_SERVER_ERROR          | Unexpected server error              |
| DELIVERY_STATE_REQUIRED        | At least one delivery state required |
| INVALID_DELIVERY_CONFIGURATION | Invalid delivery configuration       |

---

# Response Standards

Successful requests return:

* Requested resource
* Updated resource
* Success confirmation where appropriate

Failed requests return:

* Error code
* User-friendly message
* Validation details when applicable

Sensitive information is never included in API responses.

---

# Security Rules

The Company APIs follow FreshFlow Authentication v1.0.

Security requirements include:

* JWT authentication
* HTTP-only cookie sessions
* Server-side authorization
* Input validation
* Output sanitization
* Secure logo upload validation
* Delivery settings can only be modified by authorized users.

Client-side validation is never considered a security boundary.

---

# Dependencies

The Company APIs depend on:

## Authentication Module

Provides:

* Session validation
* Current user resolution
* Authorization

---

## Database

Current tables:

* companies

Future tables:

company_settings
company_delivery_settings
company_locations
company_branding

---

# Future APIs

The architecture supports future endpoints without breaking Version 1.0.

Planned APIs include:

* Business Verification
* Company Settings
* Multiple Business Locations
* Company Branding
* Tax Information
* Currency Settings
* Timezone Settings
* Language Preferences
* Delivery Cities
* Delivery Districts
* Delivery PIN Codes
* Delivery Charges

---

# API Versioning

Current Version:

**v1.1**

Future versions should remain backward compatible whenever possible.

Breaking API changes require a new documented version.

---

# Approval

This document defines the official API contract for the Company module.

All backend implementation, frontend integration, validation, and future maintenance must follow this specification unless superseded by a newer approved version.
