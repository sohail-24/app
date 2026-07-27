# Home Marketplace

**Version:** 1.0

**Status:** Approved Design

**Page:** Home Marketplace

---

# Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ FreshFlow Logo        Search Products...                    Login / Profile              Cart                        │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ All Products │ Fruits │ Vegetables │ Dairy │ Grocery │ Beverages │ More...                                     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🚚 Same Day Delivery   ✔ Verified Suppliers   📦 Bulk Orders   💰 Wholesale Pricing                              │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                      │
│                                  Today's Fresh Deals                                                                 │
│                                                                                                                      │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                                                   │
│ │ Product     │  │ Product     │  │ Product     │  │ Product     │                                                   │
│ │ Image       │  │ Image       │  │ Image       │  │ Image       │                                                   │
│ │ Name        │  │ Name        │  │ Name        │  │ Name        │                                                   │
│ │ Price       │  │ Price       │  │ Price       │  │ Price       │                                                   │
│ │ MOQ         │  │ MOQ         │  │ MOQ         │  │ MOQ         │                                                   │
│ │ Stock       │  │ Stock       │  │ Stock       │  │ Stock       │                                                   │
│ │ [Add Cart]  │  │ [Add Cart]  │  │ [Add Cart]  │  │ [Add Cart]  │                                                   │
│ │ [Details]   │  │ [Details]   │  │ [Details]   │  │ [Details]   │                                                   │
│ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                            Browse by Categories                                                      │
│                                                                                                                      │
│ ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐                                                   │
│ │ Fruits │   │ Dairy  │   │ Grocery│   │ Snacks │   │ More...│                                                   │
│ └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘                                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                         Recently Added Products                                                      │
│                                                                                                                      │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                                                   │
│ │ Product     │  │ Product     │  │ Product     │  │ Product     │                                                   │
│ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘                                                   │
│                                                                                                                      │
│                     [ Load More Products ]      [ Open Product Catalog ]                                              │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Footer                                                                                                               │
│ Company │ About │ Contact │ Terms │ Privacy │ Social Links                                                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# Tablet Layout

```text
┌───────────────────────────────────────────────────────────────┐
│ FreshFlow Logo                 Cart │ Login                   │
│                                                       │
│ Search Products...                                      │
├───────────────────────────────────────────────────────────────┤
│ Categories (Horizontal Scroll)                              │
├───────────────────────────────────────────────────────────────┤
│ Business Information Strip                                  │
├───────────────────────────────────────────────────────────────┤
│ Today's Fresh Deals                                         │
│                                                             │
│ ┌─────────────┐   ┌─────────────┐                           │
│ │ Product     │   │ Product     │                           │
│ └─────────────┘   └─────────────┘                           │
│                                                             │
│ ┌─────────────┐   ┌─────────────┐                           │
│ │ Product     │   │ Product     │                           │
│ └─────────────┘   └─────────────┘                           │
├───────────────────────────────────────────────────────────────┤
│ Browse by Categories                                        │
├───────────────────────────────────────────────────────────────┤
│ Recently Added Products                                     │
├───────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└───────────────────────────────────────────────────────────────┘
```

---

# Mobile Layout

```text
┌───────────────────────────────┐
│ FreshFlow            ☰ Cart   │
├───────────────────────────────┤
│ Search Products...            │
├───────────────────────────────┤
│ Categories → → →              │
├───────────────────────────────┤
│ Business Information Strip    │
├───────────────────────────────┤
│ Today's Fresh Deals           │
│                               │
│ ┌───────────────────────────┐ │
│ │ Product Image             │ │
│ │ Product Name              │ │
│ │ Price                     │ │
│ │ MOQ                       │ │
│ │ Stock                     │ │
│ │ [ Add to Cart ]           │ │
│ │ [ View Details ]          │ │
│ └───────────────────────────┘ │
│                               │
│ ┌───────────────────────────┐ │
│ │ Product                   │ │
│ └───────────────────────────┘ │
├───────────────────────────────┤
│ Browse by Categories          │
├───────────────────────────────┤
│ Recently Added Products       │
├───────────────────────────────┤
│ Load More Products            │
├───────────────────────────────┤
│ Footer                        │
└───────────────────────────────┘
```

---

# Layout Principles

* Sticky header for quick navigation.
* Product-first layout with minimal marketing content.
* Categories remain easily accessible on all devices.
* Product cards are responsive across desktop, tablet, and mobile.
* Primary actions (Search, Add to Cart, View Details) remain visible without excessive scrolling.
* Footer contains company information and secondary navigation.
