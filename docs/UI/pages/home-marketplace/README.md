# Home Marketplace

**Version:** 1.0

**Status:** Approved Design

**Page:** Home Marketplace

---

# Overview

The Home Marketplace is the public entry point of FreshFlow.

It allows visitors and buyers to discover wholesale products, browse categories, search the catalogue, and begin the purchasing journey before authentication.

Unlike a traditional ecommerce landing page, the Home Marketplace focuses on product discovery rather than marketing content. Users should be able to find products quickly with minimal navigation.

This page serves as the gateway to the marketplace while maintaining a clean, professional, and business-oriented experience.

---

# Purpose

The Home Marketplace exists to:

* Introduce FreshFlow to new visitors.
* Display available wholesale products.
* Help buyers discover products quickly.
* Provide category-based product browsing.
* Allow product searching before login.
* Encourage purchasing without forcing immediate authentication.
* Direct users into the shopping and ordering workflow.

---

# Users

## Guest Visitor

Can:

* Browse products.
* Search products.
* Browse categories.
* View product details.
* View supplier information.
* Register or sign in.

Cannot:

* Add products to the cart.
* Place orders.
* View buyer dashboard.

---

## Buyer

Can:

* Browse products.
* Search products.
* Filter products by category.
* View product details.
* Add products to the cart.
* Continue shopping.
* Access buyer features after authentication.

---

## Business Owner

Can:

* View the public marketplace.
* Access owner workspace after authentication.

The Home Marketplace is not intended for product management or administrative tasks.

---

# Page Goals

The Home Marketplace aims to:

* Showcase wholesale products immediately.
* Reduce the time required to discover products.
* Promote product browsing before login.
* Create a simple purchasing journey.
* Support both desktop and mobile users.
* Maintain a professional B2B marketplace experience.

---

# Navigation

Users can navigate to:

* Product Details
* Product Catalog
* Categories
* Login
* Registration
* Shopping Cart
* Buyer Dashboard (Authenticated)
* Owner Dashboard (Authenticated Business Owner)

---

# Page Layout

The page is organised into the following sections:

1. Sticky Marketplace Header
2. Search Bar
3. Category Navigation
4. Business Information Strip
5. Featured Products
6. Browse by Categories
7. Recently Added Products
8. Footer

The layout prioritises products above promotional content.

---

# Page Sections

## Sticky Marketplace Header

Displays:

* FreshFlow logo
* Product search
* Login or Profile
* Shopping Cart

The header remains visible while scrolling.

---

## Search

Allows users to search products from anywhere on the page.

Search results update the visible product listing without requiring page navigation.

---

## Category Navigation

Displays active product categories.

Selecting a category filters the visible products.

Users can return to the complete catalogue by selecting **All Products**.

---

## Business Information Strip

Displays key marketplace highlights such as:

* Wholesale Pricing
* Verified Suppliers
* Bulk Orders
* Fast Delivery

This section is intentionally compact to keep products visible near the top of the page.

---

## Featured Products

Displays selected wholesale products available for purchase.

Each product card may display:

* Product Image
* Product Name
* Supplier
* Price
* Unit
* Minimum Order Quantity
* Stock Availability
* Category
* Add to Cart
* View Details

Only products available for sale are displayed.

---

## Browse by Categories

Displays active categories to help buyers discover products quickly.

Selecting a category updates the product listing.

---

## Recently Added Products

Displays recently added products.

Users may continue loading additional products or open the complete product catalogue.

---

## Footer

Displays:

* Company information
* Contact information
* Useful links
* Copyright
* Legal pages

---

# User Interactions

Users can:

* Search products.
* Browse categories.
* Filter products.
* View product details.
* Add products to the cart (Authenticated Buyers).
* Sign in.
* Register.
* Navigate to the complete catalogue.

---

# Business Modules Used

The Home Marketplace uses the following business modules.

## Products Module

Provides:

* Product listing
* Product information
* Product availability
* Product pricing
* Product search
* Product images

---

## Categories Module

Provides:

* Category navigation
* Product categorisation
* Category filtering

---

## Company Module

Provides:

* Supplier and business information displayed with products.
* Business identity shown throughout the marketplace.

---

## Authentication Module

Provides:

* Login
* Registration
* Session management
* Authentication before cart operations

---

# Business Rules

The Home Marketplace follows these page-level rules:

* Products can be browsed without authentication.
* Product searching is available to all visitors.
* Category filtering is available to all visitors.
* Only available products are displayed.
* Only active categories are displayed.
* Guests cannot add products to the shopping cart.
* Guests attempting to add products to the cart are redirected to authentication.
* Administrative controls are never displayed on this page.
* Product management is performed only within the Business Owner workspace.

---

# Responsive Behaviour

## Desktop

* Multi-column product grid.
* Sticky header.
* Full search bar.
* Horizontal category navigation.

---

## Tablet

* Responsive product grid.
* Collapsible spacing.
* Touch-friendly controls.

---

## Mobile

* Stacked header layout.
* Full-width search.
* Horizontally scrollable categories.
* Single-column product cards.
* Touch-optimised actions.

---

# Design Principles

The Home Marketplace follows these design principles:

* Product-first experience.
* Minimal visual clutter.
* Professional wholesale appearance.
* Simple navigation.
* Consistent spacing.
* Fast product discovery.
* Mobile-first responsiveness.
* Accessible user interface.
* Consistent branding throughout the page.

---

# Accessibility

The page should support:

* Keyboard navigation.
* Visible keyboard focus.
* Screen reader compatibility.
* Alternative text for images.
* Accessible form controls.
* Responsive layouts across supported devices.
* Sufficient colour contrast for readability.

---

# Future Enhancements

Future versions may include:

* Featured suppliers.
* Personalised recommendations.
* Seasonal promotions.
* Recently viewed products.
* Product comparison.
* Saved searches.
* Advanced product filters.
* Multi-language support.

These features are intentionally excluded from Version 1.0 to maintain a simple and focused marketplace experience.

---

# Related Pages

The Home Marketplace connects with:

* Product Catalog
* Product Details
* Cart
* Checkout
* Authentication
* Buyer Dashboard
* Owner Dashboard

---

# Documentation

This page includes:

* README.md
* ASCII.md
* FLOW.md

Business logic is documented in the corresponding business modules and should not be duplicated within this page documentation.

---

# Version History

## Version 1.0

Initial Home Marketplace page documentation.

Focus areas:

* Product-first marketplace experience.
* Simple product discovery.
* Category-based navigation.
* Guest browsing with authenticated purchasing.
* Responsive wholesale marketplace design.
