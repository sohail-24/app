# Buyer Dashboard

**Version:** 1.0

**Status:** Approved Design

**Page:** Buyer Dashboard

---

# Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏠 FreshFlow                     🔍 Search products, suppliers...                 ❤️ Wishlist   🛒 Cart(3)   🔔   👤 Mohammed ▼           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Welcome back, Mohammed 👋                                                                                                                 │
│ Continue shopping, review recent orders, or discover new wholesale products.                                                             │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│ 🛒 Cart              │ 📦 Orders            │ ❤️ Wishlist          │ 🏪 Suppliers         │
│ 3 Items              │ 12 Total             │ 8 Saved              │ 15 Active            │
└──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🍎 Fruits   🥬 Vegetables   🥛 Dairy   🍚 Rice   🥔 Grocery   🧃 Beverages   🌶 Spices   ➜ More                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Filters                  │ Sort: Newest ▼   Price ▼   Rating ▼                                      Showing 248 Products                    │
├──────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Category                 │                                                                                                                   │
│ ☑ Fruits                 │ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐             │
│ □ Vegetables             │ │        🥭            │ │        🍎            │ │        🍊            │ │        🍌            │             │
│ □ Dairy                  │ │                      │ │                      │ │                      │ │                      │             │
│ □ Grocery                │ │ Mango                │ │ Apple                │ │ Orange               │ │ Banana               │             │
│                           │ │ ⭐ 4.8               │ │ ⭐ 4.6               │ │ ⭐ 4.7               │ │ ⭐ 4.5               │             │
│ Price                    │ │ ₹150 / kg           │ │ ₹214 / kg           │ │ ₹180 / kg           │ │ ₹60 / dozen         │             │
│ ₹0 ───────── ₹1000        │ │ MOQ : 10 kg         │ │ MOQ : 5 kg          │ │ MOQ : 20 kg         │ │ MOQ : 5 dozen       │             │
│                           │ │ Stock : 420 kg      │ │ Stock : 700 kg      │ │ Stock : 500 kg      │ │ Stock : 900 doz.    │             │
│ Origin                   │ │ Supplier A          │ │ Supplier B          │ │ Supplier C          │ │ Supplier D          │             │
│ ☑ India                  │ │                      │ │                      │ │                      │ │                      │             │
│ □ Imported               │ │ Quantity            │ │ Quantity            │ │ Quantity            │ │ Quantity            │             │
│                           │ │ [-] 10 kg [+]      │ │ [-] 5 kg [+]       │ │ [-] 20 kg [+]      │ │ [-] 5 [+]          │             │
│ Supplier                 │ │                      │ │                      │ │                      │ │                      │             │
│ ▼ Any                    │ │ Total ₹1,500        │ │ Total ₹1,070        │ │ Total ₹3,600        │ │ Total ₹300          │             │
│                           │ │                      │ │                      │ │                      │ │                      │             │
│ Availability             │ │ View Details        │ │ View Details        │ │ View Details        │ │ View Details        │             │
│ ☑ In Stock               │ │ Add to Cart         │ │ Add to Cart         │ │ Add to Cart         │ │ Add to Cart         │             │
│ □ Low Stock              │ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘             │
│ □ Out of Stock           │                                                                                                                   │
│                           │                                                                                                                   │
│ Rating                   │                                                                                                                   │
│ ★★★★★                    │                                                                                                                   │
│ ★★★★☆                    │                                                                                                                   │
│                           │                                                                                                                   │
│ [ Reset Filters ]         │                                                                                                                   │
└──────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ◀ Previous                                   Page 1 of 25                                   Next ▶                                         │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# Tablet Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ 🏠 FreshFlow                 🔍 Search...          🛒 ❤️ 🔔 👤               │
├──────────────────────────────────────────────────────────────────────────────┤
│ Welcome back, Mohammed 👋                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ 🛒 3 Items   📦 12 Orders   ❤️ 8 Wishlist                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Categories                                                               │
│ Fruits  Vegetables  Dairy  Grocery  More                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Filters ▼    Sort ▼                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ Product Card                                                             │
│ Image                                                                    │
│ Name                                                                     │
│ Rating                                                                   │
│ Price                                                                    │
│ MOQ                                                                      │
│ Stock                                                                    │
│ Supplier                                                                 │
│ Quantity                                                                 │
│ Total                                                                    │
│ View Details                                                             │
│ Add to Cart                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Pagination                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# Mobile Layout

```text
┌──────────────────────────────┐
│ ☰ FreshFlow      🛒 👤        │
├──────────────────────────────┤
│ Welcome, Mohammed 👋         │
├──────────────────────────────┤
│ 🔍 Search Products          │
├──────────────────────────────┤
│ Categories ▶                │
├──────────────────────────────┤
│ Filters  Sort               │
├──────────────────────────────┤
│ 🥭 Mango                    │
│ ⭐4.8                       │
│ ₹150 / kg                  │
│ MOQ : 10 kg                │
│ Stock : 420 kg             │
│ Supplier A                 │
│ [-]10kg[+]                 │
│ Total ₹1,500               │
│ View Details               │
│ Add to Cart                │
├──────────────────────────────┤
│ More Products...           │
├──────────────────────────────┤
│ ◀ 1 2 3 ▶                  │
└──────────────────────────────┘
```

---

# Layout Principles

* The Buyer Dashboard opens with a personalised welcome section to reinforce that this is the buyer's primary workspace after authentication.
* Quick Statistics provide immediate visibility into cart items, recent orders, wishlist, and supplier activity.
* Categories remain easily accessible to support fast product discovery.
* Filters are grouped in a dedicated sidebar on desktop and become collapsible on smaller devices.
* Product cards present information in a consistent visual hierarchy: product identity, rating, pricing, purchasing details, quantity controls, and actions.
* Primary actions (**View Details** and **Add to Cart**) remain consistently positioned across all product cards.
* Search, filtering, and sorting work together to minimise the effort required to locate wholesale products.
* The layout adapts seamlessly across desktop, tablet, and mobile while preserving a familiar buying workflow.
