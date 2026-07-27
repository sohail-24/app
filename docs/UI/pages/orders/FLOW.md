# Orders

**Version:** 1.0

**Status:** Approved Design

**Page:** Orders

---

# Overview

This document describes how authenticated buyers interact with the Orders page.

The Orders page provides buyers with a complete view of their purchasing history, active deliveries, invoices, and reordering options. It serves as the primary location for managing orders after checkout.

---

# User Entry Flow

Users may arrive at the Orders page from:

* Buyer Dashboard
* Checkout (after successful order placement)
* Order Confirmation (Future)
* Notifications (Future)

Only authenticated buyers may access this page.

---

# Navigation Flow

```text
Authentication
      │
      ▼
Buyer Dashboard
      │
      ▼
Orders
      │
 ┌────┼─────────────────────────────────────────────┐
 ▼    ▼               ▼              ▼              ▼
Search Filters   View Details   Track Order   Reorder
```

The Orders page acts as the buyer's central order management workspace.

---

# Orders Loading Flow

```text
Open Orders
      │
      ▼
Validate Buyer Session
      │
      ▼
Load Buyer Orders
      │
      ▼
Load Order Statistics
      │
      ▼
Display Orders
```

Orders are displayed in reverse chronological order by default.

---

# Search Flow

```text
Enter Order ID
      │
      ▼
Search Orders
      │
      ▼
Display Matching Orders
```

Only orders belonging to the authenticated buyer are returned.

---

# Filter Flow

```text
Select Filter
      │
      ▼
Apply Status Filter
      │
      ▼
Apply Date Filter
      │
      ▼
Refresh Order List
```

Multiple filters may be combined.

---

# Sorting Flow

```text
Select Sort Option
        │
        ▼
Apply Sorting
        │
        ▼
Refresh Order List
```

Sorting affects only the displayed order sequence.

---

# Order Review Flow

```text
Browse Orders
      │
      ▼
Select Order
      │
      ▼
View Order Summary
      │
      ▼
Choose Action
```

Each order card provides enough information for quick review without opening the full details page.

---

# View Details Flow

```text
Select Order
      │
      ▼
View Details
      │
      ▼
Order Details Page
```

The buyer can review the complete order information.

---

# Track Delivery Flow

```text
Select Active Order
      │
      ▼
Track Delivery
      │
      ▼
Display Delivery Progress
```

Tracking is available only for active deliveries.

---

# Invoice Download Flow

```text
Select Order
      │
      ▼
Download Invoice
      │
      ▼
Generate Invoice
      │
      ▼
Download Complete
```

Invoices are available only after invoice generation.

---

# Reorder Flow

```text
Delivered Order
      │
      ▼
Select Reorder
      │
      ▼
Validate Product Availability
      │
      ▼
Add Products to Shopping Cart
      │
      ▼
Shopping Cart
```

Reordering creates a new shopping session using current pricing and product availability.

---

# Order Status Flow

```text
Order Created
      │
      ▼
Pending
      │
      ▼
Confirmed
      │
      ▼
Packed
      │
      ▼
Delivered
```

The Orders page reflects the latest fulfilment status supplied by the Orders business module.

---

# Validation Flow

```text
Buyer Action
      │
      ▼
Validate Request
      │
 ┌────┴────┐
 ▼         ▼
Valid    Invalid
 │         │
 ▼         ▼
Continue  Display Message
```

Only authorised actions are available for each order.

---

# Error Flows

## No Orders Found

```text
Open Orders
      │
      ▼
No Orders Available
      │
      ▼
Display Empty State
      │
      ▼
Start Shopping
```

---

## No Search Results

```text
Search Orders
      │
      ▼
No Matching Orders
      │
      ▼
Display Empty Results
```

---

## Tracking Unavailable

```text
Track Delivery
      │
      ▼
Tracking Not Available
      │
      ▼
Display Information
```

---

## Invoice Unavailable

```text
Download Invoice
      │
      ▼
Invoice Not Ready
      │
      ▼
Display Information
```

---

## Session Expired

```text
Open Orders
      │
      ▼
Session Expired
      │
      ▼
Authentication
```

---

# Responsive Behaviour Flow

## Desktop

* Summary statistics remain visible.
* Full-width order cards.
* Search and filters displayed together.
* Multiple order actions shown inline.

---

## Tablet

* Responsive order cards.
* Collapsible filter controls.
* Touch-friendly action buttons.

---

## Mobile

* Single-column order cards.
* Stacked filters.
* Simplified order summaries.
* Large action buttons.

The order management workflow remains consistent across all supported devices.

---

# Exit Points

Users may leave the Orders page by navigating to:

* Buyer Dashboard
* Order Details
* Shopping Cart (via Reorder)
* Product Details (Future)
* User Profile
* Logout

---

# Flow Summary

```text
Authentication
      │
      ▼
Buyer Dashboard
      │
      ▼
Orders
      │
 ┌────┼───────────────────────────────┐
 ▼    ▼               ▼               ▼
Search View Details  Track Delivery  Reorder
 │                                      │
 │                                      ▼
 │                               Shopping Cart
 │                                      │
 ▼                                      ▼
Order Details                     Checkout
```

---

# Design Principles

The Orders page flow is designed to:

* Make previous purchases easy to locate.
* Provide clear visibility into order progress.
* Minimise the number of steps required to review an order.
* Support fast repeat purchasing.
* Keep order management separate from shopping workflows.
* Maintain a consistent experience across desktop, tablet, and mobile devices.

---

# Version History

## Version 1.0

Initial Orders page flow documentation.

Focus areas:

* Order history.
* Search and filtering.
* Delivery tracking.
* Invoice downloads.
* Reordering workflow.
* Responsive order management.
