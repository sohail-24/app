# User Profile API

Version: 1.0

Status: Approved Design

Module: User Profile

---

# Purpose

This document defines the backend API contract for the User Profile module.

It specifies how the frontend communicates with the backend, what operations are available, the required validation, authorization rules, expected responses, and error handling.

This document serves as the single source of truth for all User Profile APIs.

---

# API Principles

The User Profile APIs follow these principles.

* Authentication required for every request.
* Authorization enforced on the server.
* Users may access only their own profile.
* Business information is excluded.
* Validation occurs before database updates.
* Partial updates are preferred over replacing entire records.
* Sensitive information is never returned to clients.
* API contracts remain backward compatible whenever possible.

---

# Authentication

Every User Profile API requires an authenticated session.

Authentication is provided by the FreshFlow Authentication Module using:

* JWT Access Token
* HTTP-only Cookies
* Refresh Token Rotation
* Session Validation

Unauthenticated requests are rejected.

---

# Authorization

Authorization rules:

* Users may view only their own profile.
* Users may edit only their own profile.
* Users may change only their own password.
* Users may upload only their own avatar.
* Users may delete only their own avatar.

No API accepts an arbitrary user identifier for profile operations.

The authenticated user is resolved from the current session.

---

# API Summary

Version 1.0 provides the following APIs.

| API                 | Purpose                               |
| ------------------- | ------------------------------------- |
| Get Current Profile | Retrieve authenticated user's profile |
| Update Profile      | Update editable profile information   |
| Upload Avatar       | Upload or replace profile picture     |
| Delete Avatar       | Remove profile picture                |
| Change Password     | Update account password               |

---

# API 1 — Get Current Profile

## Purpose

Retrieve the authenticated user's profile information.

### Authentication

Required

### Authorization

Authenticated user only.

### Input

No user identifier is required.

The backend resolves the current user from the authenticated session.

### Response

Returns:

* User ID
* Full Name
* Email
* Mobile Number
* Date of Birth
* Gender
* Address
* City
* State
* Country
* Postal Code
* Avatar
* Theme Preference
* Role
* Last Login
* Account Created Date

### Business Rules

* Email is read-only.
* Password is never returned.
* Company information is excluded.

### Possible Errors

* UNAUTHORIZED
* PROFILE_NOT_FOUND
* INTERNAL_SERVER_ERROR

---

# API 2 — Update Profile

## Purpose

Update editable profile information.

### Authentication

Required

### Authorization

Authenticated user only.

### Editable Fields

* Full Name
* Mobile Number
* Date of Birth
* Gender
* Address
* City
* State
* Country
* Postal Code
* Theme Preference

### Read-Only Fields

* Email
* Role
* Account Created Date
* Last Login

### Business Rules

* Only modified fields should be updated.
* Email updates are rejected.
* Empty required fields are not accepted.

### Validation

* Full Name is required.
* Mobile number format must be valid.
* Date of Birth cannot be in the future.
* Gender must match supported values.
* Address length limits apply.
* Postal Code validation is planned for future versions.

### Response

Returns the updated profile.

### Possible Errors

* UNAUTHORIZED
* VALIDATION_ERROR
* EMAIL_READ_ONLY
* PROFILE_NOT_FOUND
* INTERNAL_SERVER_ERROR

---

# API 3 — Upload Avatar

## Purpose

Upload or replace the user's profile picture.

### Authentication

Required

### Authorization

Authenticated user only.

### Business Rules

* One active avatar per user.
* Uploading a new avatar replaces the previous avatar.
* If no avatar exists, the default avatar is displayed.

### Validation

* Supported image types only.
* Maximum file size enforced.
* Empty uploads rejected.

### Response

Returns the updated avatar reference.

### Possible Errors

* UNAUTHORIZED
* UNSUPPORTED_FILE_TYPE
* FILE_TOO_LARGE
* PROFILE_NOT_FOUND
* INTERNAL_SERVER_ERROR

---

# API 4 — Delete Avatar

## Purpose

Remove the current profile picture.

### Authentication

Required

### Authorization

Authenticated user only.

### Business Rules

* The custom avatar is removed.
* The default avatar is displayed automatically.
* Deleting an avatar does not affect any other profile data.

### Response

Returns the updated profile.

### Possible Errors

* UNAUTHORIZED
* PROFILE_NOT_FOUND
* INTERNAL_SERVER_ERROR

---

# API 5 — Change Password

## Purpose

Update the authenticated user's password.

### Authentication

Required

### Authorization

Authenticated user only.

### Required Information

* Current Password
* New Password
* Confirm Password

### Business Rules

* Current password must be verified.
* New password must satisfy password policy.
* New password and confirmation must match.
* Passwords are always stored using secure hashing.

### Validation

* Current password required.
* New password required.
* Confirmation required.
* Confirmation must match.
* Password strength policy enforced.

### Response

Password updated successfully.

### Possible Errors

* UNAUTHORIZED
* INVALID_PASSWORD
* PASSWORD_MISMATCH
* VALIDATION_ERROR
* INTERNAL_SERVER_ERROR

---

# Validation Rules

## Personal Information

* Full Name is required.
* Email is immutable in Version 1.0.
* Mobile number must be valid.
* Date of Birth cannot be a future date.
* Gender must match supported values.

---

## Contact Information

* Address fields have maximum length limits.
* Country and State must be supported values.
* Postal Code validation will expand in future versions.

---

## Avatar

* Image file required.
* Unsupported formats rejected.
* Maximum upload size enforced.

---

## Password

* Current password required.
* New password required.
* Confirmation required.
* Confirmation must match.
* Password policy enforced.

---

# Error Catalog

| Error                 | Description                  |
| --------------------- | ---------------------------- |
| UNAUTHORIZED          | Authentication required      |
| FORBIDDEN             | Access denied                |
| PROFILE_NOT_FOUND     | Profile does not exist       |
| VALIDATION_ERROR      | Input validation failed      |
| EMAIL_READ_ONLY       | Email cannot be modified     |
| INVALID_PASSWORD      | Current password incorrect   |
| PASSWORD_MISMATCH     | Password confirmation failed |
| FILE_TOO_LARGE        | Avatar exceeds maximum size  |
| UNSUPPORTED_FILE_TYPE | Invalid image format         |
| INTERNAL_SERVER_ERROR | Unexpected server error      |

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

The User Profile APIs follow FreshFlow Authentication v1.0.

Security requirements include:

* JWT authentication
* HTTP-only cookie sessions
* Server-side authorization
* Password hashing
* Input validation
* Output sanitization
* Secure avatar upload validation

No client-side validation is considered a security boundary.

---

# Dependencies

The User Profile APIs depend on:

## Authentication Module

Provides:

* Session validation
* Current user resolution
* JWT authentication
* Authorization

---

## Database

Current tables:

* users

Future tables:

* user_preferences
* user_sessions
* login_history

---

# Future APIs

The architecture supports future endpoints without breaking Version 1.0.

Planned APIs include:

* Verify Email
* Verify Mobile
* Enable MFA
* Disable MFA
* Get Active Sessions
* Revoke Session
* Login History
* Notification Preferences
* Language Preferences
* Privacy Settings
* Connected Devices
* API Tokens

---

# API Versioning

Current Version:

**v1.0**

Future versions must remain backward compatible whenever possible.

Breaking API changes require a new documented version.

---

# Approval

This document defines the official API contract for the User Profile module.

All backend implementation, frontend integration, validation, and future maintenance must follow this specification unless superseded by a newer approved version.
