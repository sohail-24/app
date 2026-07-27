# Orders

**Version:** 1.0

**Status:** Approved Design

**Page:** Orders

---

# Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← Buyer Dashboard                                                     📦 My Orders                                  👤 Mohammed ▼           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
│ 📦 Total Orders      │ 🟡 Pending          │ 🚚 In Transit        │ ✅ Delivered        │
│ 28                   │ 3                   │ 5                    │ 20                  │
└──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search Order ID _____________________     Status ▼     Date ▼     Sort ▼                                    Showing 28 Orders          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘



┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Order #FF-1784457523124-621                                            Pending                                  ₹428                        │
│ 19 Jul 2026                                                                                                                             │
│                                                                                                                                          │
│ 🍎 Apple                                                                                                                                │
│ Qty : 2 kg                                                                                                                              │
│ Supplier : Fresh Farms                                                                                                                  │
│                                                                                                                                          │
│ ● Pending ───── ○ Confirmed ───── ○ Packed ───── ○ Delivered                                                                            │
│                                                                                                                                          │
│ [ View Details ]     [ Track Delivery ]     [ Download Invoice ]                                                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘



┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Order #FF-1784457523124-622                                          Confirmed                               ₹1,320                        │
│ 20 Jul 2026                                                                                                                             │
│                                                                                                                                          │
│ 🥭 Mango                                                                                                                                │
│ Qty : 10 kg                                                                                                                             │
│ Supplier : Green Farm                                                                                                                   │
│                                                                                                                                          │
│ ● Pending ───── ● Confirmed ───── ○ Packed ───── ○ Delivered                                                                            │
│                                                                                                                                          │
│ [ View Details ]     [ Track Delivery ]     [ Download Invoice ]                                                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘



┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Order #FF-1784457523124-623                                            Packed                                ₹2,840                        │
│ 21 Jul 2026                                                                                                                             │
│                                                                                                                                          │
│ 🍊 Orange                                                                                                                               │
│ Qty : 20 kg                                                                                                                             │
│ Supplier : Sunrise Produce                                                                                                               │
│                                                                                                                                          │
│ ● Pending ───── ● Confirmed ───── ● Packed ───── ○ Delivered                                                                            │
│                                                                                                                                          │
│ [ View Details ]     [ Track Delivery ]     [ Download Invoice ]                                                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘



┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Order #FF-1784457523124-624                                          Delivered                             ₹1,150                        │
│ 16 Jul 2026                                                                                                                             │
│                                                                                                                                          │
│ 🍌 Banana                                                                                                                               │
│ Qty : 15 dozen                                                                                                                          │
│ Supplier : Green Farm                                                                                                                   │
│                                                                                                                                          │
│ ● Pending ───── ● Confirmed ───── ● Packed ───── ● Delivered                                                                            │
│                                                                                                                                          │
│ [ View Details ]     [ Reorder ]     [ Download Invoice ]                                                                               │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘



┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ◀ Previous                                           Page 1 of 6                                           Next ▶                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# Empty Orders

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ 📦 No Orders Yet                                                            │
│                                                                              │
│ You haven't placed any orders yet.                                          │
│                                                                              │
│              [ Start Shopping ]                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# Tablet Layout

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ← Orders                                             👤                  │
├──────────────────────────────────────────────────────────────────────────┤
│ Total 28   Pending 3   Transit 5   Delivered 20                         │
├──────────────────────────────────────────────────────────────────────────┤
│ Search │ Status ▼ │ Date ▼                                              │
├──────────────────────────────────────────────────────────────────────────┤
│ Order Card                                                               │
│ Product                                                                  │
│ Supplier                                                                 │
│ Qty                                                                      │
│ Total                                                                    │
│                                                                           │
│ ● Pending ─ ● Confirmed ─ ○ Packed ─ ○ Delivered                         │
│                                                                           │
│ View Details                                                             │
│ Track Delivery                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

# Mobile Layout

```text
┌──────────────────────────────┐
│ ← Orders            👤        │
├──────────────────────────────┤
│ 📦 28 Orders                │
│ 🟡 3 Pending                │
│ 🚚 5 Transit                │
│ ✅ 20 Delivered             │
├──────────────────────────────┤
│ 🔍 Search                   │
│ Status ▼                    │
├──────────────────────────────┤
│ Order #621                  │
│ Apple                       │
│ Qty : 2 kg                  │
│ ₹428                        │
│                              │
│ ●─○─○─○                     │
│ Pending                     │
│                              │
│ View Details                │
│ Track Delivery              │
├──────────────────────────────┤
│ More Orders...              │
├──────────────────────────────┤
│ ◀ 1 2 3 ▶                   │
└──────────────────────────────┘
```

---

# Layout Principles

* The Orders page opens with summary statistics so buyers can immediately understand the overall status of their purchases.
* Search, filters, and sorting are grouped together to make finding orders quick and efficient.
* Each order is presented as a self-contained card with clear order information, supplier details, quantities, totals, and available actions.
* A four-stage progress timeline (**Pending → Confirmed → Packed → Delivered**) provides immediate visual feedback on the fulfilment status of active orders.
* Available actions adapt to the current order status. For example, active orders display **Track Delivery**, while delivered orders replace it with **Reorder**.
* Pagination remains fixed at the bottom of the page for consistent navigation through historical orders.
* The layout scales cleanly from desktop to tablet and mobile while preserving the same order management workflow.
