# Orders

**Version:** 1.0

**Status:** Approved Design

**Page:** Orders

---

# Overview

The Orders page provides authenticated buyers with a complete view of their purchase history within FreshFlow.

It enables buyers to search, filter, review, track, and manage their orders after checkout. The page presents order information in a clear and organised manner while providing quick access to commonly used actions such as viewing order details, tracking deliveries, downloading invoices, and reordering previously purchased products.

Version 1.0 focuses on providing a simple, responsive, and efficient order management experience.

---

# Purpose

The Orders page exists to:

* Display buyer orders.
* Provide order tracking.
* Allow buyers to review previous purchases.
* Enable invoice downloads.
* Support product reordering.
* Provide quick access to order information.
* Help buyers manage their purchasing history.

---

# Users

## Guest Visitor

Cannot access the Orders page.

Guests are redirected to the Authentication page.

---

## Buyer

Can:

* View personal orders.
* Search orders.
* Filter orders.
* Track active deliveries.
* View order details.
* Download invoices.
* Reorder delivered products.

---

## Business Owner

Business Owners use the Business Owner Dashboard to manage customer orders.

---

# Page Goals

The Orders page aims to:

* Simplify order management.
* Reduce the time required to locate previous orders.
* Improve visibility into delivery status.
* Support repeat purchasing.
* Provide easy access to invoices.
* Present order information consistently across all devices.

---

# Navigation

Users can navigate to:

* Buyer Dashboard
* Product Details (via Reorder)
* Shopping Cart
* Checkout
* User Profile

---

# Page Layout

The page is organised into the following sections:

1. Header Navigation
2. Order Summary
3. Search
4. Filters
5. Order List
6. Pagination

---

# Page Sections

## Header Navigation

Displays:

* Back to Buyer Dashboard
* Page Title

Provides quick navigation back to the buyer workspace.

---

## Order Summary

Displays a high-level overview of buyer activity.

Typical information includes:

* Total Orders
* Pending Orders
* Delivered Orders
* Cancelled Orders

These statistics help buyers quickly understand the current state of their purchases.

---

## Search

Allows buyers to search orders using:

* Order ID

Matching orders are displayed immediately.

---

## Filters

Supports filtering by:

* Order Status
* Date Range
* Supplier (Future Enhancement)

Filters may be combined.

---

## Order List

Displays individual order cards.

Each card includes:

* Order Number
* Order Date
* Order Status
* Product Summary
* Supplier
* Quantity
* Total Amount
* Delivery Status (when applicable)

The order list presents the most relevant purchasing information without requiring buyers to open each order.

---

## Order Actions

Available actions depend on the order status.

Common actions include:

* View Details
* Track Delivery
* Download Invoice
* Reorder

Unavailable actions remain hidden or disabled when not applicable.

---

## Pagination

Allows buyers to browse older orders.

Navigation includes:

* Previous
* Page Numbers
* Next

---

# User Interactions

Users can:

* Search orders.
* Filter orders.
* View order details.
* Track deliveries.
* Download invoices.
* Reorder products.
* Navigate back to the Buyer Dashboard.

---

# Business Modules Used

The Orders page uses the following business modules.

## Orders Module

Provides:

* Order information.
* Order status.
* Delivery progress.
* Invoice availability.
* Reorder eligibility.

---

## Products Module

Provides:

* Product information.
* Product images.
* Product availability.

---

## Company Module

Provides:

* Supplier information.

---

## Authentication Module

Provides:

* Buyer authentication.
* Secure access to buyer orders.

---

## Shopping Cart

Provides:

* Cart destination when products are reordered.

---

# Business Rules

The Orders page follows these page-level rules:

* Only authenticated buyers may access the page.
* Buyers may view only their own orders.
* Orders are displayed in reverse chronological order by default.
* Search results respect active filters.
* Tracking is available only for active deliveries.
* Invoice downloads are available only when an invoice has been generated.
* Reordering creates a new shopping session using current product availability and pricing.
* Historical order information remains unchanged after order completion.

---

# Responsive Behaviour

## Desktop

* Full-width order cards.
* Summary statistics displayed in a single row.
* Search and filters displayed together.
* Multi-action order cards.

---

## Tablet

* Responsive order cards.
* Collapsible filters.
* Touch-friendly controls.

---

## Mobile

* Single-column order cards.
* Stacked search and filter controls.
* Large action buttons.
* Simplified order summaries.

---

# Design Principles

The Orders page follows these principles:

* Clear order visibility.
* Efficient order management.
* Minimal navigation effort.
* Consistent action placement.
* Responsive design.
* Accessible interface.
* Fast access to repeat purchasing.

---

# Accessibility

The page should support:

* Keyboard navigation.
* Screen reader compatibility.
* Accessible search controls.
* Accessible filter controls.
* Visible keyboard focus.
* Sufficient colour contrast.
* Accessible order cards.
* Clearly identifiable status indicators.

---

# Future Enhancements

Future versions may include:

* Advanced order search.
* Supplier filtering.
* Shipment timeline.
* Delivery map tracking.
* Order notes.
* Order sharing.
* Export order history.
* Bulk reorder.
* Favourite orders.
* Smart reorder recommendations.
* Delivery notifications.

These features are intentionally excluded from Version 1.0 to maintain a focused and efficient buyer experience.

---

# Related Pages

The Orders page connects with:

* Buyer Dashboard
* Product Details
* Shopping Cart
* Checkout
* User Profile

---

# Documentation

This page includes:

* README.md
* ASCII.md
* FLOW.md

Business logic for orders, products, authentication, and shopping cart is documented within their respective business modules and is intentionally not duplicated in this page documentation.

---

# Version History

## Version 1.0

Initial Orders page documentation.

Focus areas:

* Buyer order management.
* Order tracking.
* Purchase history.
* Invoice access.
* Reordering workflow.
* Responsive order experience.
