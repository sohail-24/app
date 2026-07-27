````markdown
# Orders Module Flow

Version: 1.0

Status: Approved Design

Module: Orders

---

# Purpose

This document defines the business workflows, user journeys, and process flows used by the Orders module.

It explains how orders move through the FreshFlow platform from checkout until delivery while keeping responsibilities separated across business modules.

Business rules are documented in **README.md**.

---

# Overall Order Lifecycle

```text
Browse Products
        ↓
Add to Cart
        ↓
Checkout
        ↓
Order Created
        ↓
Order Confirmed
        ↓
Packed
        ↓
Ready for Dispatch
        ↓
Out for Delivery
        ↓
Delivered
```

Alternative path

```text
Pending
      ↓
Cancelled
```

---

# Buyer Purchase Journey

The buyer purchases products using the marketplace.

```text
Marketplace
      ↓
Browse Products
      ↓
View Product Details
      ↓
Add to Cart
      ↓
Checkout
      ↓
Order Created
      ↓
Confirmation
      ↓
My Orders
      ↓
Track Order
```

---

# Order Creation Flow

The Orders module begins after a successful checkout.

```text
Buyer Checkout
       ↓
Validate Cart
       ↓
Validate Products
       ↓
Validate Inventory
       ↓
Create Order
       ↓
Create Order Items
       ↓
Create Product Snapshots
       ↓
Calculate Totals
       ↓
Reserve / Update Inventory
       ↓
Order Created Successfully
```

---

# Product Snapshot Flow

FreshFlow stores a snapshot of purchased products.

This ensures historical orders never change.

```text
Product

Apple

₹120 / Kg

MOQ 5 Kg

        ↓

Buyer Places Order

        ↓

Order Snapshot Created

        ↓

Owner Updates Product

Apple

₹150 / Kg

MOQ 10 Kg

        ↓

Historical Order

Apple

₹120 / Kg

MOQ 5 Kg

(UNCHANGED)
```

Order snapshots preserve:

* Product Name
* Price
* Unit
* Quantity
* Line Total

Historical orders always display the original purchase information.

---

# Inventory Flow

Inventory is managed separately but participates during order creation.

```text
Inventory

Current Stock

50 Kg

       ↓

Buyer Orders

10 Kg

       ↓

Inventory Updated

40 Kg Remaining

       ↓

Order Created
```

Inventory ownership remains within the Inventory module.

---

# Business Owner Order Processing

Business owners manage order fulfilment.

```text
New Order
      ↓
Review Order
      ↓
Confirm Order
      ↓
Pack Products
      ↓
Ready for Dispatch
      ↓
Out for Delivery
      ↓
Delivered
```

Each status reflects the current fulfilment stage.

---

# Delivery Estimate Flow

Delivery estimates communicate expected arrival time.

```text
Order Created
        ↓

Business Owner Selects

Same Day
OR
Next Day
OR
Within 2 Days
OR
Within 3–5 Days

        ↓

Buyer Sees Updated Estimate
```

Delivery Estimate answers:

> When will my order arrive?

Order Status answers:

> What stage is my order currently in?

Both values are independent.

---

# Buyer Order Tracking

Buyers can monitor order progress.

```text
Login
      ↓
My Orders
      ↓
Open Order
      ↓
View Status
      ↓
View Estimated Delivery
      ↓
View Purchased Products
      ↓
Delivered
```

Buyers cannot modify order information.

---

# Order Status Progression

Normal workflow

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

Cancelled workflow

```text
Pending
      ↓
Cancelled
```

Delivered orders are considered complete.

---

# Order Cancellation Flow

Only eligible orders may be cancelled.

```text
Pending
      ↓
Cancelled
      ↓
Order Archived
      ↓
Visible in Order History
```

Cancelled orders remain part of business history.

---

# Permission Flow

Business Owner

```text
View All Orders
        ↓
Open Order
        ↓
Update Status
        ↓
Update Delivery Estimate
        ↓
Monitor Order Progress
```

Buyer

```text
View Own Orders
        ↓
Open Order
        ↓
Track Status
        ↓
View Delivery Estimate
```

Server-side authorization protects all operations.

---

# Order Information Flow

```text
Products Module
        ↓
Product Information
        ↓
Checkout
        ↓
Orders Module
        ↓
Order Snapshot Stored
        ↓
Invoices
        ↓
Reports
```

Orders consume product information but never own live product data.

---

# Module Interaction Flow

```text
Authentication
        ↓
User Profile
        ↓
Company
        ↓
Categories
        ↓
Products
        ↓
Inventory
        ↓
Orders
        ↓
Invoices
        ↓
Reports
        ↓
Dashboard
```

Orders act as the bridge between purchasing and post-purchase business operations.

---

# Future Business Flow

Future versions may extend the workflow.

```text
Order Created
        ↓
Invoice Generated
        ↓
Payment Confirmed
        ↓
Courier Assigned
        ↓
Live Tracking
        ↓
Delivered
        ↓
Customer Feedback
        ↓
Reports & Analytics
```

This evolution does not require changes to the Version 1.0 architecture.

---

# Error Flow

If validation fails during checkout:

```text
Checkout
      ↓
Validation Failed
      ↓
Display Error
      ↓
Buyer Corrects Issue
      ↓
Retry Checkout
```

Examples include:

* Product unavailable
* Insufficient inventory
* Invalid delivery information
* Authentication required

---

# Mobile User Journey

Buyer

```text
Home
   ↓
Products
   ↓
Cart
   ↓
Checkout
   ↓
My Orders
   ↓
Order Details
```

Business Owner

```text
Dashboard
    ↓
Orders
    ↓
Order Details
    ↓
Update Status
    ↓
Save
```

All workflows are designed to be mobile-friendly.

---

# Summary

The Orders module provides a simple and reliable workflow that:

* Converts checkout into permanent business records.
* Preserves historical product snapshots.
* Separates order status from delivery estimates.
* Keeps inventory ownership independent.
* Supports both buyer tracking and business fulfilment.
* Provides the foundation for invoices, reporting, analytics, and future ERP features.

---

# Version History

## Version 1.0

Initial Orders workflow documentation.

Includes:

* Complete order lifecycle.
* Buyer purchase journey.
* Business owner fulfilment process.
* Product snapshot workflow.
* Inventory interaction.
* Delivery estimate workflow.
* Permission flow.
* Module interaction.
* Future business expansion.
* Mobile user journeys.
````
