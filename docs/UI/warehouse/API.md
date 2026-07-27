# Warehouse API

**Version:** 1.0

**Status:** Approved Design

**Module:** Warehouse

---

# Purpose

This document defines the API contract for the Warehouse module.

It describes all REST endpoints, request and response formats, validation rules, authentication requirements, error handling, and future API considerations.

The API follows RESTful principles and is designed to support both current and future Warehouse functionality.

---

# API Design Principles

The Warehouse API follows these principles:

* RESTful architecture
* JSON request and response format
* Stateless communication
* JWT-based authentication
* Consistent response structure
* Standard HTTP status codes
* Secure access control
* Versioned endpoints

---

# Base URL

```text
/api/v1
```

Module base endpoint:

```text
/api/v1/warehouse
```

---

# Authentication

All Warehouse endpoints require authentication.

Authentication Method:

```text
Authorization: Bearer <JWT_TOKEN>
```

Unauthenticated requests return:

```http
401 Unauthorized
```

---

# Standard Response Format

## Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

---

# Warehouse Information APIs

---

## Get Warehouse

### Endpoint

```http
GET /api/v1/warehouse
```

Purpose

Returns warehouse information.

---

### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Main Warehouse",
    "code": "WH001",
    "status": "ACTIVE",
    "contactPerson": "John Doe",
    "contactNumber": "+91XXXXXXXXXX",
    "address": "Hyderabad"
  }
}
```

---

## Update Warehouse

### Endpoint

```http
PUT /api/v1/warehouse
```

Purpose

Updates warehouse details.

---

### Request

```json
{
  "name": "Main Warehouse",
  "contactPerson": "John Doe",
  "contactNumber": "+91XXXXXXXXXX",
  "address": "Hyderabad"
}
```

---

### Response

```json
{
  "success": true,
  "message": "Warehouse updated successfully."
}
```

---

# Warehouse Stock APIs

---

## Get Warehouse Stock

### Endpoint

```http
GET /api/v1/warehouse/stock
```

Purpose

Returns all products currently available in the warehouse.

Supports:

* Pagination
* Search
* Sorting
* Filtering

---

### Sample Response

```json
{
  "success": true,
  "data": [
    {
      "productId": 10,
      "productName": "Milk",
      "availableStock": 120,
      "reservedStock": 20,
      "status": "IN_STOCK"
    }
  ]
}
```

---

# Receive Stock

### Endpoint

```http
POST /api/v1/warehouse/receive
```

Purpose

Adds stock to the warehouse.

---

### Request

```json
{
  "productId": 10,
  "quantity": 50,
  "supplier": "ABC Suppliers",
  "reference": "INV-2026-001",
  "notes": "Monthly stock delivery"
}
```

---

### Validation

* Product must exist
* Warehouse must be active
* Quantity must be greater than zero

---

### Response

```json
{
  "success": true,
  "message": "Stock received successfully."
}
```

---

# Dispatch Stock

### Endpoint

```http
POST /api/v1/warehouse/dispatch
```

Purpose

Dispatches products from the warehouse.

---

### Request

```json
{
  "productId": 10,
  "quantity": 15,
  "orderId": 250,
  "notes": "Customer Order"
}
```

---

### Validation

* Product exists
* Warehouse active
* Quantity available
* Quantity greater than zero

---

### Response

```json
{
  "success": true,
  "message": "Stock dispatched successfully."
}
```

---

# Stock Movement APIs

---

## Get Movement History

### Endpoint

```http
GET /api/v1/warehouse/movements
```

Purpose

Returns stock movement history.

Supports:

* Search
* Filters
* Pagination
* Sorting

---

### Sample Response

```json
{
  "success": true,
  "data": [
    {
      "movementId": 501,
      "product": "Milk",
      "type": "RECEIVE",
      "quantity": 50,
      "date": "2026-07-24",
      "user": "Business Owner"
    }
  ]
}
```

---

# Search Parameters

Warehouse Stock

```text
?page=1
&size=20
&search=milk
&sort=name
```

Movement History

```text
?page=1
&size=20
&type=RECEIVE
&product=Milk
&date=2026-07-24
```

---

# Validation Rules

## Warehouse

* Name is required
* Warehouse code is unique
* Status must be ACTIVE or INACTIVE

---

## Receive Stock

* Product must exist
* Quantity > 0
* Warehouse active

---

## Dispatch Stock

* Product must exist
* Quantity > 0
* Quantity <= Available Stock
* Warehouse active

---

# Business Rules

* Every warehouse belongs to one company.
* Version 1.0 supports one warehouse per company.
* Every stock movement updates Inventory.
* Every receive operation creates a movement record.
* Every dispatch operation creates a movement record.
* Warehouse operations require authenticated users.
* Buyers cannot access Warehouse APIs.

---

# HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Resource Created      |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Resource Not Found    |
| 409  | Conflict              |
| 422  | Validation Failed     |
| 500  | Internal Server Error |

---

# Error Responses

## Invalid Quantity

```json
{
  "success": false,
  "message": "Quantity must be greater than zero."
}
```

---

## Product Not Found

```json
{
  "success": false,
  "message": "Product not found."
}
```

---

## Insufficient Stock

```json
{
  "success": false,
  "message": "Insufficient stock available."
}
```

---

## Unauthorized

```json
{
  "success": false,
  "message": "Authentication required."
}
```

---

## Forbidden

```json
{
  "success": false,
  "message": "Access denied."
}
```

---

# Security

The Warehouse API enforces:

* JWT authentication
* Role-based authorization
* Input validation
* Server-side validation
* Audit logging
* Secure HTTPS communication
* Protection against invalid requests

---

# API Relationships

```text
Products
     │
     ▼
Warehouse
     │
     ▼
Inventory
     │
     ▼
Orders
     │
     ▼
Invoices
     │
     ▼
Reports
```

---

# Future API Endpoints

Future versions may include:

```http
POST   /api/v1/warehouse/transfer
```

Transfer stock between warehouses.

---

```http
GET /api/v1/warehouse/analytics
```

Warehouse analytics dashboard.

---

```http
POST /api/v1/warehouse/barcode/scan
```

Barcode scanning.

---

```http
POST /api/v1/warehouse/qrcode/scan
```

QR code scanning.

---

```http
GET /api/v1/warehouse/shelves
```

Shelf management.

---

```http
GET /api/v1/warehouse/batches
```

Batch tracking.

---

# API Versioning

Current Version

```text
v1
```

Future versions:

```text
v2
v3
```

Older versions should remain supported until officially deprecated.

---

# Version History

## Version 1.0

Initial Warehouse API documentation.

Includes:

* Warehouse Information APIs
* Warehouse Stock APIs
* Receive Stock API
* Dispatch Stock API
* Stock Movement APIs
* Validation rules
* Error handling
* Authentication
* Security guidelines
* Business rules
* Future API roadmap
