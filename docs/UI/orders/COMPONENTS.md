````markdown
# Orders Module Components

Version: 1.0

Status: Approved Design

Module: Orders

---

# Purpose

This document defines the reusable user interface components used by the Orders module.

It describes the layout, behavior, states, and interactions of each component.

Business rules are documented in **README.md**.

---

# Page Components

## Orders List Page

Purpose:

Displays all orders available to the current user.

Business Owner

Can:

* View all company orders.
* Search orders.
* Filter orders.
* Open order details.

Buyer

Can:

* View only their own orders.
* Search their orders.
* Open order details.

---

## Order Details Page

Purpose:

Displays complete information about a single order.

Contains:

* Customer Information
* Delivery Information
* Order Summary
* Product Snapshot
* Timeline
* Status Information

Business owners may update order information from this page.

Buyers have read-only access.

---

# Search Component

## Order Search

Purpose:

Allows users to quickly locate orders.

Supports searching by:

* Order Number
* Customer Name
* Product Name (Future)

Placeholder

```text
Search Orders...
```

---

# Filter Components

## Order Status Filter

Purpose:

Filters orders by current status.

Supported values:

* Pending
* Confirmed
* Packed
* Ready for Dispatch
* Out for Delivery
* Delivered
* Cancelled

---

## Delivery Estimate Filter

Purpose:

Filters orders by delivery estimate.

Supported values:

* Same Day
* Next Day
* Within 2 Days
* Within 3–5 Days

---

## Date Filter

Purpose:

Displays orders created within a selected date range.

Future versions may support:

* Today
* Yesterday
* Last 7 Days
* Last 30 Days
* Custom Date Range

---

## Customer Filter

Business Owner only.

Purpose:

Locate orders belonging to a specific customer.

---

# Order List Components

## Orders Table (Desktop)

Displays:

* Order Number
* Customer
* Items
* Order Total
* Order Status
* Delivery Estimate
* Order Date
* Actions

Business owners use a table layout for efficient order management.

---

## Order Cards (Mobile)

Each card displays:

* Order Number
* Customer
* Order Status
* Delivery Estimate
* Order Total
* View Details

Cards provide a touch-friendly experience.

---

## Pagination

Purpose:

Navigate between multiple pages of orders.

Controls include:

* Previous
* Next
* Page Numbers

---

# Order Detail Components

## Customer Information Card

Displays:

* Customer Name
* Mobile Number
* Company Name
* Delivery Address

Read-only.

---

## Order Summary Card

Displays:

* Order Number
* Order Date
* Payment Status
* Order Status
* Delivery Estimate
* Total Amount

---

## Product Snapshot Table

Displays purchased product information stored inside the order.

Columns include:

* Product Name
* Unit Price
* Quantity
* Unit
* Line Total

Product information remains unchanged after the order is created.

---

## Delivery Information Card

Displays:

* Delivery Estimate
* Delivery Address
* Delivery Notes (Future)

Business owners may update the delivery estimate.

Buyers have read-only access.

---

## Order Timeline

Displays the order progress.

Example

```text
✓ Order Created

✓ Confirmed

□ Packed

□ Ready for Dispatch

□ Out for Delivery

□ Delivered
```

Timeline updates automatically as the order progresses.

---

# Action Components

## View Details Button

Purpose:

Opens the selected order.

Available to:

* Business Owner
* Buyer

---

## Update Status Dropdown

Business Owner only.

Supported values:

* Pending
* Confirmed
* Packed
* Ready for Dispatch
* Out for Delivery
* Delivered
* Cancelled

Updates the current order status.

---

## Delivery Estimate Dropdown

Business Owner only.

Supported values:

* Same Day
* Next Day
* Within 2 Days
* Within 3–5 Days

Updates the expected delivery time.

---

## Cancel Order Button

Business Owner only.

Purpose:

Cancels an active order.

Cancelled orders remain in the system for historical purposes.

---

# Buyer Components

## My Orders List

Displays:

* Order Number
* Order Status
* Delivery Estimate
* Total Amount

Selecting an order opens Order Details.

---

## Order Status Badge

Displays the current order status.

Examples:

* Pending
* Confirmed
* Delivered

Provides quick visual identification.

---

## Delivery Estimate Badge

Displays:

* Same Day
* Next Day
* Within 2 Days
* Within 3–5 Days

Helps buyers understand expected delivery time.

---

# Shared Components

## Status Badge

Purpose:

Displays the current order status consistently throughout the application.

Used in:

* Orders List
* Order Details
* Buyer Orders

---

## Empty State

Displayed when no orders exist.

Example message:

```text
No orders found.
```

---

## Loading State

Displayed while order information is loading.

Uses loading placeholders or skeleton components.

---

## Error State

Displayed when order information cannot be loaded.

Example:

```text
Unable to load orders.

Please try again.
```

---

## Confirmation Dialog

Displayed before important actions.

Examples:

* Cancel Order
* Update Order Status (Future if required)

---

# Responsive Behaviour

## Desktop

* Table layout.
* Multiple filters.
* Full order information.
* Timeline displayed vertically.

---

## Tablet

* Responsive table.
* Collapsible filters.
* Reduced spacing.
* Wrapped product information.

---

## Mobile

* Card-based order list.
* Vertical layout.
* Touch-friendly controls.
* Single-column information display.
* Product snapshots displayed as stacked cards.
* Vertical order timeline.

---

# Component States

Each component should support appropriate states.

Examples:

* Default
* Loading
* Empty
* Error
* Disabled (when applicable)

---

# Accessibility

Components should support:

* Keyboard navigation.
* Screen readers.
* Visible focus indicators.
* Sufficient touch targets on mobile devices.
* Responsive layouts across screen sizes.

---

# Future Components

Future versions may introduce:

* Order Notes
* Invoice Preview
* Delivery Tracking Map
* Courier Information Card
* Returns Panel
* Refund Panel
* Payment History
* Order Activity Log
* Order Attachments
* Print Order Summary

---

# Version History

## Version 1.0

Initial Orders module component documentation.

Focus areas:

* Reusable UI components.
* Responsive layouts.
* Business Owner and Buyer interfaces.
* Mobile-first component design.
* Future-ready component architecture.
````
