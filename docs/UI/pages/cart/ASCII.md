Excellent. The Cart page is where buyers stop browsing and start reviewing their purchase. The layout should make it easy to verify products, adjust quantities, and proceed to checkout without distractions.

For Version **1.0**, I recommend a **two-column desktop layout**:

* **Left:** Cart Items
* **Right:** Sticky Order Summary

This is the pattern used by most modern ecommerce platforms because the order summary remains visible while buyers review their cart.

Here's the production-ready `ASCII.md`.

# Shopping Cart

**Version:** 1.0

**Status:** Approved Design

**Page:** Shopping Cart

---

# Desktop Layout

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← Continue Shopping                                                   Shopping Cart (3 Items)                                          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     ┌──────────────────────────────────────┐              │
│ ┌───────────────────────────────────────────────────────────────┐                   │ Order Summary                        │              │
│ │ 🍎 Apple                                                      │                   ├──────────────────────────────────────┤              │
│ │ Fresh Farms                                                   │                   │ Products : 3                         │              │
│ │ ₹214 / kg                                                     │                   │ Total Quantity : 17 kg               │              │
│ │                                                               │                   │                                      │              │
│ │ Quantity                                                      │                   │ Subtotal : ₹3,420                    │              │
│ │ [-] 5 kg [+]                                                  │                   │                                      │              │
│ │                                                               │                   │ Estimated Total : ₹3,420             │              │
│ │ Total : ₹1,070                                                │                   │                                      │              │
│ │                                                               │                   │ Delivery : Tomorrow                  │              │
│ │ [ Remove ]                                                    │                   │ Delivery Area : Hyderabad            │              │
│ └───────────────────────────────────────────────────────────────┘                   ├──────────────────────────────────────┤              │
│                                                                                     │ ✓ Proceed to Checkout               │              │
│ ┌───────────────────────────────────────────────────────────────┐                   └──────────────────────────────────────┘              │
│ │ 🥭 Mango                                                      │                                                         │              │
│ │ Green Farm                                                    │                                                         │              │
│ │ ₹140 / kg                                                     │                                                         │              │
│ │                                                               │                                                         │              │
│ │ Quantity                                                      │                                                         │              │
│ │ [-] 10 kg [+]                                                 │                                                         │              │
│ │                                                               │                                                         │              │
│ │ Total : ₹1,400                                                │                                                         │              │
│ │                                                               │                                                         │              │
│ │ [ Remove ]                                                    │                                                         │              │
│ └───────────────────────────────────────────────────────────────┘                                                         │              │
│                                                                                                                                    │
│ ┌───────────────────────────────────────────────────────────────┐                                                         │              │
│ │ 🍌 Banana                                                     │                                                         │              │
│ │ Farm Fresh                                                    │                                                         │              │
│ │ ₹95 / dozen                                                   │                                                         │              │
│ │                                                               │                                                         │              │
│ │ Quantity                                                      │                                                         │              │
│ │ [-] 2 dozen [+]                                               │                                                         │              │
│ │                                                               │                                                         │              │
│ │ Total : ₹950                                                  │                                                         │              │
│ │                                                               │                                                         │              │
│ │ [ Remove ]                                                    │                                                         │              │
│ └───────────────────────────────────────────────────────────────┘                                                         │              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# Empty Cart

```text
┌──────────────────────────────────────────────────────────────┐
│                🛒 Your Shopping Cart is Empty                 │
│                                                              │
│      You haven't added any products yet.                     │
│                                                              │
│      [ Continue Shopping ]                                   │
└──────────────────────────────────────────────────────────────┘
```

---

# Tablet Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Continue Shopping             Shopping Cart (3 Items)                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ 🍎 Apple                                                             │
│ Fresh Farms                                                          │
│ ₹214 / kg                                                            │
│ Quantity                                                             │
│ [-] 5 kg [+]                                                         │
│ Total : ₹1,070                                                       │
│ [ Remove ]                                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ 🥭 Mango                                                             │
│ Quantity                                                             │
│ [-] 10 kg [+]                                                        │
│ Total : ₹1,400                                                       │
│ [ Remove ]                                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ 🍌 Banana                                                            │
│ Quantity                                                             │
│ [-] 2 dozen [+]                                                      │
│ Total : ₹950                                                         │
│ [ Remove ]                                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ Order Summary                                                        │
│ Products : 3                                                         │
│ Total Quantity : 17 kg                                               │
│ Estimated Total : ₹3,420                                             │
│ Delivery : Tomorrow                                                  │
│ [ Proceed to Checkout ]                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# Mobile Layout

```text
┌──────────────────────────────┐
│ ← Cart (3 Items)             │
├──────────────────────────────┤
│ 🍎 Apple                     │
│ ₹214 / kg                    │
│ [-] 5 kg [+]                 │
│ Total : ₹1,070               │
│ Remove                       │
├──────────────────────────────┤
│ 🥭 Mango                     │
│ ₹140 / kg                    │
│ [-] 10 kg [+]                │
│ Total : ₹1,400               │
│ Remove                       │
├──────────────────────────────┤
│ 🍌 Banana                    │
│ ₹95 / dozen                  │
│ [-] 2 dozen [+]              │
│ Total : ₹950                 │
│ Remove                       │
├──────────────────────────────┤
│ Order Summary                │
│ Products : 3                 │
│ Total : ₹3,420               │
│ Delivery : Tomorrow          │
├──────────────────────────────┤
│ ✓ Proceed to Checkout        │
└──────────────────────────────┘
```

---

# Layout Principles

* Cart items are displayed individually for easy review.
* Quantity controls remain adjacent to each product.
* Remove actions are clearly visible but secondary to quantity management.
* The order summary remains visible on desktop using a dedicated side panel.
* Checkout is presented as the primary action.
* The empty cart provides a clear recovery path back to shopping.
* The layout adapts consistently across desktop, tablet, and mobile devices while preserving the purchasing workflow.
