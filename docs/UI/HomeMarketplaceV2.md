# FreshFlow Home Marketplace V2

## Status

Implemented on `2026-07-21` in `src/pages/LandingPage.tsx`.

This document is the source of truth for the public `/` homepage. FreshFlow is a B2B wholesale marketplace, not a fashion ecommerce landing page. The home screen must help visitors browse products immediately before authentication.

## Homepage Flow

1. Sticky marketplace header.
2. Horizontally scrollable category bar.
3. Compact business information strip.
4. Product-first featured grid.
5. Browse by category cards.
6. Recently added product grid with load-more behavior.

There is no oversized marketing hero on the homepage.

## Header

The header is sticky and uses a clean B2B marketplace layout:

- FreshFlow logo linking to `/`.
- Large search input backed by `trpc.product.list`.
- Login button for guests.
- Profile button for authenticated users.
- Cart button with authenticated cart count when available.
- Mobile layout stacks the logo/actions and search while preserving the category bar below.

Search updates the live product query and does not require login.

## Category Bar

The category bar sits directly below the header.

- Categories come from `trpc.category.list`.
- `All Products` resets category filtering.
- Category buttons filter the homepage product query by `categoryId`.
- The bar is horizontally scrollable on mobile.
- `More` links to `/products`.

## Business Information Strip

The compact strip replaces the previous marketing hero and appears before products:

- Same Day Delivery
- Verified Suppliers
- Bulk Orders
- Wholesale Pricing

The strip is intentionally small so products appear quickly.

## Featured Products

The first product section is titled `Today's Fresh Deals`.

Products are loaded from `trpc.product.list` with:

- `status: "active"`
- optional `search`
- optional `categoryId`
- `sortBy` of `newest`, `price`, or `name`

No static product mocks are used on the homepage.

Each product card shows:

- Product image or a neutral image placeholder.
- Product name linking to `/products/:slug`.
- Supplier name.
- Wholesale unit price.
- Compare-at price when available.
- MOQ.
- Available stock when provided.
- Rating fallback label.
- Category name.
- Quantity selector bounded by MOQ.
- Live total price.
- Add To Cart.
- View Details.

## Browse by Category

Category cards use live `trpc.category.list` data and display up to eight categories.

Each card includes:

- Minimal icon.
- Category name.
- Description or a neutral wholesale listing fallback.
- Click behavior that filters the homepage product query.

## Recently Added Products

Recently added products continue the same backend product result set below categories.

- The section shows additional products after the first featured set.
- If there are more products available, `Load More Products` reveals more cards.
- `Open Full Catalog` links to `/products`.

## Login Flow

Visitors can browse, search, filter, and view product details without login.

Authentication is required for Add To Cart:

- Guests who click Add To Cart receive a login prompt toast.
- Guests are redirected to `/login` with a `returnTo` value.
- Authenticated users call the existing `trpc.cart.add` mutation.

Checkout, orders, dashboard, profile, and settings keep their existing route guards.

## Backend Contract

No backend changes were made for this redesign.

Homepage data sources:

- `trpc.product.list`
- `trpc.category.list`
- `trpc.cart.list` only when authenticated
- `trpc.cart.add` only when authenticated

Do not replace these calls with static product data.

## Responsive Behavior

- Desktop: logo, large search, and actions share one header row; category bar remains horizontal.
- Tablet: product cards use two to three columns depending on available width.
- Mobile: header stacks into compact rows, category bar scrolls horizontally, product cards become one column, and controls wrap without overlap.

## Design Notes

- Visual style is professional, minimal, wholesale-first, and product-dense.
- Cards use restrained borders, white surfaces, compact spacing, and 8px radii.
- No promotional hero, oversized decorative sections, or fashion marketplace styling.
- The palette stays neutral with emerald as the primary action color.
