# Shopping Cart

**Version:** 1.0

**Status:** Approved Design

**Page:** Shopping Cart

---

# Overview

This document describes how users interact with the Shopping Cart page.

The Shopping Cart page allows buyers to review selected products, adjust quantities, remove unwanted items, review order totals, and continue to checkout. It serves as the final review stage before the checkout process begins.

---

# User Entry Flow

Users may arrive at the Shopping Cart page from:

* Product Details
* Home Marketplace (Cart Icon)
* Product Catalog (Cart Icon)
* Buyer Dashboard (Future)

Once loaded, the page displays all products currently added to the shopping cart.

---

# Navigation Flow

```text
Home Marketplace
        │
        ▼
Product Catalog
        │
        ▼
Product Details
        │
        ▼
Shopping Cart
        │
 ┌──────┼───────────────┐
 ▼      ▼               ▼
Continue Update      Checkout
Shopping Quantity
```

---

# Cart Review Flow

```text
Open Shopping Cart
        │
        ▼
Load Cart Items
        │
        ▼
Display Products
        │
        ▼
Display Order Summary
        │
        ▼
Ready for Checkout
```

Buyers can review all selected products before continuing.

---

# Quantity Management Flow

```text
Select Product
      │
      ▼
Increase Quantity
      │
      ▼
Decrease Quantity
      │
      ▼
Update Line Total
      │
      ▼
Update Order Summary
```

Order totals update automatically whenever product quantities change.

---

# Remove Product Flow

```text
Select Product
      │
      ▼
Remove Product
      │
      ▼
Update Cart
      │
      ▼
Update Order Summary
```

If all products are removed, the Empty Cart page is displayed.

---

# Continue Shopping Flow

```text
Continue Shopping
        │
        ▼
Return to Marketplace
        │
        ▼
Browse Products
```

Products already added to the cart remain available.

---

# Checkout Flow

## Guest User

```text
Proceed to Checkout
        │
        ▼
Authentication Required
        │
        ▼
Authentication Page
        │
        ▼
Successful Login
        │
        ▼
Return to Shopping Cart
        │
        ▼
Proceed to Checkout
```

---

## Authenticated Buyer

```text
Proceed to Checkout
        │
        ▼
Checkout Page
```

The Shopping Cart hands control to the Checkout page.

---

# Order Summary Flow

```text
Cart Updated
      │
      ▼
Recalculate Totals
      │
      ▼
Display Updated Summary
```

The summary reflects the latest cart contents.

---

# Empty Cart Flow

```text
Shopping Cart
      │
      ▼
No Products
      │
      ▼
Display Empty Cart
      │
      ▼
Continue Shopping
```

Checkout is unavailable until products are added.

---

# Validation Flow

```text
Update Cart
      │
      ▼
Validate Quantity
      │
 ┌────┴────┐
 ▼         ▼
Valid   Invalid
 │         │
 ▼         ▼
Update   Display Message
```

The selected quantity cannot be lower than the product's Minimum Order Quantity.

---

# Error Flow

## Product No Longer Available

```text
Open Shopping Cart
        │
        ▼
Product Unavailable
        │
        ▼
Display Message
        │
        ▼
Remove or Update Cart
```

---

## Invalid Quantity

```text
Update Quantity
       │
       ▼
Below Minimum Order
       │
       ▼
Display Validation Message
```

---

## Authentication Required

```text
Checkout
     │
     ▼
Authentication Required
     │
     ▼
Authentication Page
```

---

# Responsive Behaviour Flow

## Desktop

* Cart items displayed in the primary content area.
* Sticky order summary displayed alongside cart items.
* Checkout remains visible while reviewing products.

---

## Tablet

* Cart items displayed above the order summary.
* Large touch-friendly quantity controls.
* Responsive order summary.

---

## Mobile

* Single-column layout.
* Full-width product cards.
* Large quantity controls.
* Order summary displayed below cart items.
* Checkout button positioned at the bottom of the page.

The shopping and checkout workflow remains consistent across all supported devices.

---

# Exit Points

Users may leave the Shopping Cart page by navigating to:

* Home Marketplace
* Product Catalog
* Product Details
* Authentication
* Checkout

---

# Flow Summary

```text
Browse Products
       │
       ▼
Product Details
       │
       ▼
Shopping Cart
       │
 ┌─────┼──────────────┐
 ▼     ▼              ▼
Update Remove     Continue Shopping
Items  Items
       │
       ▼
Review Order Summary
       │
       ▼
Checkout
       │
       ▼
Order Created
```

---

# Design Principles

The Shopping Cart flow is designed to:

* Allow buyers to review purchases before checkout.
* Make quantity adjustments fast and intuitive.
* Keep pricing information clear and continuously updated.
* Minimise the number of steps required to reach checkout.
* Redirect guests back to their shopping journey after authentication.
* Preserve a consistent experience across desktop, tablet, and mobile devices.

---

# Version History

## Version 1.0

Initial Shopping Cart page flow documentation.

Focus areas:

* Cart review.
* Quantity management.
* Product removal.
* Order summary updates.
* Guest and authenticated checkout journeys.
* Responsive shopping experience.
