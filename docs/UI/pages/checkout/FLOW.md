# Checkout

**Version:** 1.0

**Status:** Approved Design

**Page:** Checkout

---

# Overview

This document describes how buyers interact with the Checkout page.

The Checkout page is the final stage before a purchase order is created. Buyers provide delivery information, review their order, confirm delivery details, and submit the order.

---

# User Entry Flow

Users may arrive at the Checkout page from:

* Shopping Cart

Only authenticated buyers with at least one product in their shopping cart may access this page.

---

# Navigation Flow

```text
Shopping Cart
      │
      ▼
Checkout
      │
 ┌────┼─────────────┐
 ▼    ▼             ▼
Back Edit Form  Place Order
```

---

# Checkout Loading Flow

```text
Open Checkout
      │
      ▼
Load Cart
      │
      ▼
Load Delivery Settings
      │
      ▼
Display Checkout Form
      │
      ▼
Ready for Review
```

The page displays both the checkout form and the current order summary.

---

# Shipping Information Flow

```text
Enter Contact Name
         │
         ▼
Enter Mobile Number
         │
         ▼
Validate Required Fields
         │
         ▼
Continue
```

Shipping information is collected before the order can be submitted.

---

# Delivery Address Flow

```text
Select State
      │
      ▼
Select City
      │
      ▼
Enter Address
      │
      ▼
Optional Landmark
      │
      ▼
Validate Delivery Area
```

Delivery eligibility is determined using the Company's supported delivery configuration.

---

# Delivery Slot Flow

```text
Choose Delivery Slot
        │
   ┌────┼────┐
   ▼    ▼    ▼
Morning Afternoon Evening
        │
        ▼
Continue
```

Selecting a delivery slot is optional.

---

# Order Notes Flow

```text
Add Notes
    │
    ▼
Save Notes
    │
    ▼
Continue
```

Order notes are optional and accompany the purchase order.

---

# Order Review Flow

```text
Checkout Loaded
       │
       ▼
Display Products
       │
       ▼
Display Quantities
       │
       ▼
Display Pricing
       │
       ▼
Display Order Summary
```

The order summary is read-only during checkout.

Product changes must be made in the Shopping Cart.

---

# Confirmation Flow

```text
Review Checkout
        │
        ▼
Confirm Delivery Address
        │
        ▼
Accept Terms & Conditions
        │
        ▼
Enable Review & Place Order
```

The primary action remains disabled until all required confirmations are completed.

---

# Review & Place Order Flow

```text
Review & Place Order
          │
          ▼
Validate Checkout
          │
     ┌────┴────┐
     ▼         ▼
Valid      Validation Error
     │         │
     ▼         ▼
Create Order  Display Messages
     │
     ▼
Redirect to Orders
```

Order creation is handled by the Orders module.

---

# Successful Order Flow

```text
Order Created
      │
      ▼
Generate Order Number
      │
      ▼
Display Success
      │
      ▼
Orders Page
```

The buyer is redirected to view the newly created order.

---

# Validation Flow

```text
Submit Checkout
        │
        ▼
Validate Required Fields
        │
        ▼
Validate Delivery Area
        │
        ▼
Validate Confirmations
        │
   ┌────┴────┐
   ▼         ▼
Valid     Invalid
   │         │
   ▼         ▼
Continue  Display Errors
```

Checkout cannot proceed until all required validations succeed.

---

# Error Flows

## Unsupported Delivery Area

```text
Submit Checkout
        │
        ▼
Unsupported State
        │
        ▼
Display Delivery Message
```

---

## Missing Required Information

```text
Submit Checkout
        │
        ▼
Missing Required Field
        │
        ▼
Highlight Field
        │
        ▼
Correct Information
```

---

## Terms Not Accepted

```text
Review Checkout
        │
        ▼
Terms Not Accepted
        │
        ▼
Disable Review & Place Order
```

---

## Empty Shopping Cart

```text
Open Checkout
      │
      ▼
Cart Empty
      │
      ▼
Redirect to Shopping Cart
```

---

## Authentication Required

```text
Access Checkout
       │
       ▼
User Not Logged In
       │
       ▼
Authentication Page
```

---

# Responsive Behaviour Flow

## Desktop

* Checkout form displayed beside a sticky order summary.
* Buyers can review order details while completing delivery information.
* Primary action remains visible.

---

## Tablet

* Checkout form displayed above the order summary.
* Responsive address fields.
* Large touch-friendly controls.

---

## Mobile

* Single-column checkout flow.
* Full-width input fields.
* Order summary displayed after delivery information.
* Full-width **Review & Place Order** button.

The purchasing workflow remains consistent across all supported devices.

---

# Exit Points

Users may leave the Checkout page by navigating to:

* Shopping Cart
* Orders (after successful submission)

---

# Flow Summary

```text
Shopping Cart
      │
      ▼
Checkout
      │
      ▼
Shipping Information
      │
      ▼
Delivery Address
      │
      ▼
Delivery Preferences
      │
      ▼
Order Notes
      │
      ▼
Review Order
      │
      ▼
Confirm Details
      │
      ▼
Review & Place Order
      │
      ▼
Order Created
      │
      ▼
Orders
```

---

# Design Principles

The Checkout flow is designed to:

* Guide buyers through a simple, step-by-step checkout experience.
* Collect only essential delivery information.
* Keep the order summary visible throughout the checkout process.
* Prevent incomplete or invalid order submissions.
* Maintain a clear separation between cart management and order creation.
* Provide a consistent experience across desktop, tablet, and mobile devices.

---

# Version History

## Version 1.0

Initial Checkout page flow documentation.

Focus areas:

* Delivery information.
* Delivery validation.
* Order review.
* Confirmation workflow.
* Order submission.
* Successful order creation.
* Responsive checkout experience.
