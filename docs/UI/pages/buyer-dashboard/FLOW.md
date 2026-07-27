# Buyer Dashboard

**Version:** 1.0

**Status:** Approved Design

**Page:** Buyer Dashboard

---

# Overview

This document describes how authenticated buyers interact with the Buyer Dashboard.

The Buyer Dashboard serves as the buyer's primary workspace after authentication. It provides access to product discovery, shopping activities, order management, and account features while maintaining a simple and efficient wholesale purchasing experience.

---

# User Entry Flow

Users may arrive at the Buyer Dashboard from:

* Authentication (Successful Login)
* FreshFlow Home Marketplace
* Product Pages (Future Session Restore)

Only authenticated buyers may access this page.

---

# Navigation Flow

```text
Authentication
      │
      ▼
Buyer Dashboard
      │
 ┌────┼──────────────────────────────────────────────────────────────┐
 ▼    ▼          ▼            ▼            ▼           ▼             ▼
Search Categories Products   Cart       Orders      Profile   Notifications
```

The dashboard acts as the central navigation hub for buyer activities.

---

# Dashboard Loading Flow

```text
Open Buyer Dashboard
          │
          ▼
Load Buyer Profile
          │
          ▼
Load Product Categories
          │
          ▼
Load Product List
          │
          ▼
Load Buyer Statistics
          │
          ▼
Dashboard Ready
```

The page loads personalized buyer information alongside available products.

---

# Search Flow

```text
Enter Search
      │
      ▼
Search Products
      │
      ▼
Display Matching Results
      │
      ▼
Browse Products
```

Search results update the displayed product list.

---

# Category Navigation Flow

```text
Select Category
       │
       ▼
Load Category Products
       │
       ▼
Display Filtered Products
```

Category navigation provides quick access to specific product groups.

---

# Filter Flow

```text
Select Filter
       │
       ▼
Apply Filters
       │
       ▼
Update Product Grid
       │
       ▼
Display Results
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
Refresh Product Grid
```

Sorting changes only the display order of products.

---

# Product Browsing Flow

```text
Browse Products
       │
       ▼
View Product Card
       │
 ┌─────┼───────────────┐
 ▼     ▼               ▼
View Details     Adjust Quantity
                     │
                     ▼
                Add to Cart
```

Buyers can purchase directly from the dashboard or open the Product Details page.

---

# Quantity Selection Flow

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
Update Total
```

Quantities cannot be lower than the product's Minimum Order Quantity.

---

# Add to Cart Flow

```text
Select Product
       │
       ▼
Choose Quantity
       │
       ▼
Add to Cart
       │
       ▼
Update Cart Count
```

The shopping cart is updated without leaving the dashboard.

---

# View Product Details Flow

```text
Select Product
       │
       ▼
View Details
       │
       ▼
Product Details Page
```

Detailed product information is displayed on a dedicated page.

---

# Shopping Cart Flow

```text
Shopping Cart Icon
        │
        ▼
Shopping Cart
```

Buyers may review and manage selected products.

---

# Orders Flow

```text
Orders
   │
   ▼
Orders Page
```

Buyers can review current and previous orders.

---

# Profile Flow

```text
Profile
   │
   ▼
Profile Menu
   │
   ▼
User Profile
```

Profile management is handled by the User Profile module.

---

# Notifications Flow

```text
Notification Icon
        │
        ▼
Notification List
        │
        ▼
View Notification
```

Notification management is reserved for future enhancements.

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

Only valid product quantities and available products may be added to the shopping cart.

---

# Error Flows

## Product Unavailable

```text
Add to Cart
      │
      ▼
Product Unavailable
      │
      ▼
Display Message
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

## No Search Results

```text
Search Products
       │
       ▼
No Results Found
       │
       ▼
Display Empty State
```

---

## Session Expired

```text
Open Dashboard
       │
       ▼
Session Expired
       │
       ▼
Authentication Page
```

---

# Responsive Behaviour Flow

## Desktop

* Sidebar filters remain visible.
* Product grid displays multiple columns.
* Header navigation remains accessible.

---

## Tablet

* Filters become collapsible.
* Product grid adapts to two columns.
* Touch-friendly controls are used throughout.

---

## Mobile

* Single-column product layout.
* Collapsible navigation.
* Sticky search bar.
* Full-width product cards.

The buyer workflow remains consistent across all supported devices.

---

# Exit Points

Users may leave the Buyer Dashboard by navigating to:

* Home Marketplace
* Product Details
* Shopping Cart
* Checkout
* Orders
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
 ┌────┼───────────────────────────────┐
 ▼    ▼               ▼               ▼
Search Products     Orders        Profile
 │
 ▼
Product Details
 │
 ▼
Add to Cart
 │
 ▼
Shopping Cart
 │
 ▼
Checkout
 │
 ▼
Orders
```

---

# Design Principles

The Buyer Dashboard flow is designed to:

* Provide a personalised buyer workspace after authentication.
* Reduce the time required to discover products.
* Support efficient wholesale purchasing.
* Keep shopping actions available without unnecessary navigation.
* Maintain consistent behaviour across desktop, tablet, and mobile devices.
* Clearly separate product discovery, purchasing, and order management.

---

# Version History

## Version 1.0

Initial Buyer Dashboard flow documentation.

Focus areas:

* Dashboard navigation.
* Product discovery.
* Search and filtering.
* Shopping workflow.
* Order access.
* Profile navigation.
* Responsive buyer experience.
