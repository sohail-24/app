# Checkout

**Version:** 1.0

**Status:** Approved Design

**Page:** Checkout

---

# Desktop Layout

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Cart                                                           Checkout                                                    │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     ┌────────────────────────────────────────┐           │
│ Shipping Information                                                               │ Order Summary                          │           │
│                                                                                     ├────────────────────────────────────────┤           │
│ Contact Person Name *                                                              │ 🍎 Apple                 5 kg          │           │
│ [ Mohammed Sohail________________________ ]                                         │ ₹214/kg        Total : ₹1,070          │           │
│                                                                                     │                                        │           │
│ Mobile Number *                                                                     │ 🥭 Mango               10 kg          │           │
│ [ +91 ________________________________ ]                                            │ ₹140/kg        Total : ₹1,400          │           │
│                                                                                     │                                        │           │
│──────────────────────────────────────────────────────────────────────────────────   │ 🍌 Banana              2 dozen        │           │
│                                                                                     │ ₹95/dozen      Total : ₹950           │           │
│ Delivery Address                                                                    ├────────────────────────────────────────┤           │
│                                                                                     │ Products : 3                          │           │
│ State *             City *                                                          │ Total Quantity : 17                   │           │
│ ▼ Telangana         ▼ Hyderabad                                                    │                                        │           │
│                                                                                     │ Subtotal : ₹3,420                     │           │
│ Delivery Address *                                                                  │                                        │           │
│ ________________________________________________                                    │ Estimated Total : ₹3,420              │           │
│ ________________________________________________                                    ├────────────────────────────────────────┤           │
│                                                                                     │ Delivery                              │           │
│ Landmark (Optional)                                                                 │ Tomorrow                              │           │
│ ________________________________________________                                    │ Hyderabad                             │           │
│                                                                                     ├────────────────────────────────────────┤           │
│──────────────────────────────────────────────────────────────────────────────────   │ ✓ Review & Place Order                │           │
│                                                                                     └────────────────────────────────────────┘           │
│ Delivery Slot (Optional)                                                                                                               │
│                                                                                                                                        │
│ ○ Morning                                                                                                                             │
│ ○ Afternoon                                                                                                                           │
│ ○ Evening                                                                                                                             │
│                                                                                                                                        │
│────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│ Order Notes (Optional)                                                                                                                │
│                                                                                                                                        │
│ ____________________________________________________________________________________________________________________________________ │
│                                                                                                                                        │
│────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│ ☐ I confirm the delivery address is correct.                                                                                           │
│                                                                                                                                        │
│ ☐ I agree to the Terms & Conditions.                                                                                                   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# Empty Checkout

```text
┌──────────────────────────────────────────────────────────────┐
│                  Checkout Unavailable                        │
│                                                              │
│ Your shopping cart is empty.                                 │
│                                                              │
│ Please add products before proceeding to checkout.           │
│                                                              │
│          [ Continue Shopping ]                              │
└──────────────────────────────────────────────────────────────┘
```

---

# Tablet Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Cart                      Checkout                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Shipping Information                                                  │
│ Contact Person Name                                                   │
│ Mobile Number                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Delivery Address                                                      │
│ State                                                                 │
│ City                                                                  │
│ Address                                                               │
│ Landmark                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Delivery Slot                                                         │
│ ○ Morning                                                             │
│ ○ Afternoon                                                           │
│ ○ Evening                                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ Order Notes                                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ Order Summary                                                         │
│ Products : 3                                                          │
│ Quantity : 17                                                         │
│ Estimated Total : ₹3,420                                              │
│ Delivery : Tomorrow                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ ☑ Address Confirmation                                                │
│ ☑ Terms & Conditions                                                  │
│                                                                        │
│ [ Review & Place Order ]                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# Mobile Layout

```text
┌──────────────────────────────┐
│ ← Checkout                   │
├──────────────────────────────┤
│ Contact Person Name          │
│ Mobile Number                │
├──────────────────────────────┤
│ State                        │
│ City                         │
│ Address                      │
│ Landmark                     │
├──────────────────────────────┤
│ Delivery Slot                │
│ ○ Morning                    │
│ ○ Afternoon                  │
│ ○ Evening                    │
├──────────────────────────────┤
│ Order Notes                  │
├──────────────────────────────┤
│ Order Summary                │
│ Products : 3                 │
│ Total : ₹3,420               │
│ Delivery : Tomorrow          │
├──────────────────────────────┤
│ ☑ Address Confirmed          │
│ ☑ Terms Accepted             │
├──────────────────────────────┤
│  Review & Place Order        │
└──────────────────────────────┘
```

---

# Layout Principles

* The checkout form is displayed before the order summary to keep buyers focused on completing required information.
* A sticky Order Summary remains visible on desktop, allowing buyers to verify products, quantities, pricing, and delivery details without returning to the Shopping Cart.
* Delivery information is grouped into a dedicated section for clarity.
* Optional fields (Landmark, Delivery Slot, Order Notes) are separated from required information to reduce cognitive load.
* Confirmation checkboxes are positioned immediately before the primary action to reinforce user acknowledgement.
* **Review & Place Order** is the only primary call-to-action, emphasizing the final step in the purchasing journey.
* The layout follows a consistent hierarchy across desktop, tablet, and mobile while maintaining a simple, distraction-free checkout experience.
