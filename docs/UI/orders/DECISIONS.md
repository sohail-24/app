````markdown
# Company Decisions

Version: 1.0

Status: Approved Design

Module: Orders

---

# Purpose

This document records the architectural, business, user experience, security, database, and API decisions made for the Orders module.

It serves as the reasoning behind the design choices and helps maintain consistency throughout future development.

---

# Design Principles

The Orders module follows these principles:

* Keep order processing simple.
* Preserve historical business records.
* Separate order data from product and inventory data.
* Minimize manual work for business owners.
* Keep buyer order tracking clear and easy to understand.
* Design for future business expansion.
* Never sacrifice data integrity for convenience.

---

# Business Decisions

## Orders Represent Completed Purchases

An order is created only after the buyer successfully completes the checkout process.

Shopping Cart and Checkout remain temporary processes.

Orders become permanent business records.

---

## Orders Are Business Documents

Orders are treated as official business transactions.

Once created, they become part of the company's business history and financial records.

Orders should remain available for future reporting, invoices, analytics, and auditing.

---

## Orders Cannot Be Permanently Deleted

Business owners cannot permanently delete orders from the application.

Instead, orders may be archived if necessary.

Reason:

Permanent deletion could damage reporting, auditing, customer history, and financial records.

---

## One Order Belongs To One Buyer

Each order belongs to a single buyer.

Orders cannot contain products purchased by multiple buyers.

This keeps ownership and reporting simple.

---

## One Order Belongs To One Company

Every order belongs to one business.

Future multi-tenant architecture will isolate company orders automatically.

---

# Order Lifecycle Decisions

Version 1.0 uses a simple fulfilment workflow.

```text
Pending
      ↓
Confirmed
      ↓
Packed
      ↓
Ready for Dispatch
      ↓
Out for Delivery
      ↓
Delivered
```

Alternative workflow:

```text
Pending
      ↓
Cancelled
```

The workflow intentionally avoids unnecessary complexity.

Future versions may introduce additional states without changing the existing workflow.

Examples:

* Awaiting Payment
* Partially Packed
* Partially Delivered
* Returned
* Refunded

---

# Delivery Estimate Decisions

Delivery estimates are intentionally separated from order status.

Reason:

Order Status answers:

> "Where is the order?"

Delivery Estimate answers:

> "When will it arrive?"

This separation provides greater flexibility.

Supported delivery estimates:

* Same Day
* Next Day
* Within 2 Days
* Within 3–5 Days

Future versions may support:

* Scheduled delivery date
* Delivery time slots
* Automatic delivery estimation
* Courier-based delivery prediction

---

# Order Snapshot Decisions

Orders store snapshots of purchased products.

Reason:

Product information may change after an order has been placed.

Examples include:

* Price updates
* Product name changes
* Unit changes
* Product archival

Historical orders must always display the original purchased information.

Therefore, order items store copies of important product information rather than referencing live product values during display.

This preserves historical accuracy.

---

# Product Ownership Decisions

The Orders module does not own product information.

Products remain the responsibility of the Products module.

Orders only store product snapshots.

This prevents accidental modification of historical purchases.

---

# Inventory Decisions

Inventory remains an independent business module.

Orders consume inventory information but do not manage inventory directly.

Inventory adjustments occur through business workflows triggered by order creation or fulfilment.

Keeping inventory separate improves maintainability and scalability.

---

# Payment Decisions

Version 1.0 stores payment status only.

Supported examples include:

* Pending
* Paid
* Failed

Payment gateway integration is intentionally postponed.

Future payment providers should integrate without redesigning the Orders module.

---

# Customer Information Decisions

Orders store the buyer information required to process the purchase.

Historical customer information remains attached to the order even if the buyer later updates their profile.

This preserves business records.

---

# Database Decisions

Version 1.0 uses two primary tables.

## orders

Stores:

* Buyer
* Company
* Order Number
* Status
* Delivery Estimate
* Payment Status
* Totals
* Delivery Information
* Dates

---

## order_items

Stores:

* Product Snapshot
* Quantity
* Unit
* Product Price
* Line Total

Separating order items from orders improves normalization and supports future expansion.

---

# API Decisions

Orders expose business-focused APIs.

Typical operations include:

* Create Order
* Get Order List
* Get Order Details
* Update Order Status
* Update Delivery Estimate
* Cancel Order

Product and inventory APIs remain separate.

---

# Security Decisions

Authentication is required for every order operation.

Authorization follows role-based permissions.

Business Owner

Can:

* View all company orders.
* Update order status.
* Update delivery estimates.
* Cancel orders.

Buyer

Can:

* View only their own orders.
* Track order progress.
* View delivery estimates.

Server-side authorization is always enforced.

---

# User Experience Decisions

Order management should require minimal training.

Business owners should update orders using simple status changes.

Buyers should immediately understand:

* Current order status.
* Expected delivery.
* Purchased products.
* Order totals.

Complex ERP terminology is intentionally avoided in Version 1.0.

---

# Scalability Decisions

The Orders module is designed for future expansion without major architectural changes.

Future capabilities may include:

* Invoice generation
* Returns
* Refunds
* Split orders
* Partial deliveries
* Courier integrations
* Delivery staff assignment
* Warehouse picking
* Purchase order approval
* Tax calculation
* Discount engine
* Automated notifications
* Multi-tenant order isolation

---

# Documentation Decisions

Business rules are documented only once.

UI documentation references this module rather than duplicating business logic.

This keeps documentation consistent and easier to maintain.

---

# Version History

## Version 1.0

Initial Orders module design decisions.

Key decisions include:

* Orders are permanent business records.
* Product snapshots preserve historical accuracy.
* Delivery Estimate is separated from Order Status.
* Inventory ownership remains outside the Orders module.
* Simple fulfilment workflow for Version 1.0.
* Architecture prepared for future ERP expansion.
````
