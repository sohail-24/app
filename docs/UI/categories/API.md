# Categories Module API

Version: 1.0

Status: Approved Design

Module: Categories

---

# Purpose

This document defines the API contract for the Categories module.

It describes the available procedures, authentication requirements, authorization rules, validation requirements, expected responses, and business constraints.

The API serves as the communication layer between the frontend and backend while maintaining a consistent interface across the FreshFlow platform.

---

# API Architecture

The Categories module uses:

* Hono
* tRPC
* Drizzle ORM
* PostgreSQL

All procedures follow the FreshFlow API standards documented in:

**docs/API.md**

---

# Authentication

## Public Access

Allowed:

* Get Active Categories

---

## Authenticated Users

Allowed:

* View Categories (based on permissions)

---

## Business Owner

Allowed:

* Create Category
* Update Category
* Archive Category
* Upload Category Image
* Remove Category Image

---

# API Procedures

---

## category.list

### Purpose

Returns a list of categories.

### Authentication

Not required for active marketplace categories.

### Authorization

* Public users receive only Active categories.
* Business Owners receive all categories.

### Input

Optional:

* Search
* Status
* Sort Order

### Response

Returns:

* Category List
* Product Count
* Status
* Display Order

---

## category.byId

### Purpose

Returns details for a single category.

### Authentication

Required.

### Authorization

Business Owner only.

### Input

* Category ID

### Response

Returns complete category information.

---

## category.create

### Purpose

Creates a new category.

### Authentication

Required.

### Authorization

Business Owner only.

### Input

* Category Name
* Description (Optional)
* Status
* Display Order

### Validation

* Category Name is required.
* Category Name must be unique within the company.
* Status must be valid.

### Response

Returns the newly created category.

---

## category.update

### Purpose

Updates an existing category.

### Authentication

Required.

### Authorization

Business Owner only.

### Input

* Category ID
* Updated Fields

### Validation

* Category must exist.
* Category Name cannot be empty.
* Duplicate names are not allowed.

### Response

Returns updated category information.

---

## category.archive

### Purpose

Archives an existing category.

### Authentication

Required.

### Authorization

Business Owner only.

### Input

* Category ID

### Business Rules

* Categories are archived instead of deleted.
* Archived categories cannot receive new products.
* Historical data must be preserved.

### Response

Confirmation that the category has been archived.

---

## category.uploadImage

### Purpose

Uploads or replaces a category image.

### Authentication

Required.

### Authorization

Business Owner only.

### Input

* Category ID
* Image File

### Validation

* Supported image format.
* Valid image size.
* Secure upload validation.

### Response

Updated image URL.

---

## category.removeImage

### Purpose

Removes the current category image.

### Authentication

Required.

### Authorization

Business Owner only.

### Input

* Category ID

### Response

Category image removed successfully.

---

# Validation Rules

The following validations apply throughout the module.

| Field         | Rule                              |
| ------------- | --------------------------------- |
| Category Name | Required                          |
| Category Name | Must be unique within the company |
| Description   | Optional                          |
| Status        | Active, Inactive, or Archived     |
| Display Order | Optional positive number          |
| Image         | Optional                          |

---

# Business Rules

The API enforces the following rules:

* Every category belongs to one company.
* Products reference only existing categories.
* Archived categories cannot receive new products.
* Inactive categories are hidden from buyers.
* Categories are archived instead of deleted.
* Only Business Owners may modify category information.

---

# Success Responses

Typical successful operations return:

* Requested data
* Success message
* Updated resource information

Example messages:

* Category created successfully.
* Category updated successfully.
* Category archived successfully.
* Category image uploaded successfully.
* Category image removed successfully.

---

# Error Responses

| Code | Description           |
| ---- | --------------------- |
| 400  | Validation Error      |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Category Not Found    |
| 409  | Duplicate Category    |
| 500  | Internal Server Error |

---

# Security

The Categories API follows FreshFlow Authentication v1.0.

Security includes:

* JWT Authentication
* HTTP-only Cookies
* Server-side Authorization
* Input Validation
* Secure Image Upload Validation
* Audit-ready Category Updates

---

# Future API Enhancements

Future versions may introduce:

* Bulk Category Import
* Bulk Category Export
* Category Reordering
* Parent Categories
* Child Categories
* Category Analytics
* Category Activity History

These procedures are intentionally excluded from Version 1.0.

---

# Related Modules

The Categories API integrates with:

* Authentication
* Company
* Products
* Inventory
* Marketplace
* Orders
* Reports
* Dashboard

---

# Version History

## Version 1.0

Initial Categories API specification.

Focus areas:

* Secure category management.
* Consistent API contracts.
* Role-based authorization.
* Validation and business rule enforcement.
* Foundation for future API expansion.
