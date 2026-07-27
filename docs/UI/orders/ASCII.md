````markdown
# Orders Module ASCII Wireframes

Version: 1.0

Status: Approved Design

Module: Orders

---

# Purpose

This document defines the visual layout and screen organization for the Orders module.

It focuses on structure and user flow rather than colors, styling, or implementation.

Business rules are documented in **README.md**.

---

# Desktop Layout

---

# 1. Orders List (Business Owner)

```text
+--------------------------------------------------------------------------------------+
| Orders                                                       Search [______________] |
+--------------------------------------------------------------------------------------+

 Filters

 [Status ▼] [Delivery ▼] [Date ▼] [Customer ▼]

+--------------------------------------------------------------------------------------+
| Order # | Customer | Items | Total | Status | Delivery | Date | Action              |
+--------------------------------------------------------------------------------------+
| ORD001  | Ahmed    |   4   | ₹850   | Pending | Same Day | Today | View             |
| ORD002  | Salman   |   2   | ₹430   | Packed  | Next Day | Today | View             |
| ORD003  | John     |   8   | ₹2100  | Dispatch| 2 Days   | Today | View             |
+--------------------------------------------------------------------------------------+

 Previous   1   2   3   Next
```

---

# 2. Order Details (Business Owner)

```text
+--------------------------------------------------------------------------------------+
| ← Back                                  Order # ORD001                              |
+--------------------------------------------------------------------------------------+

Customer Information
-------------------------------------------------------------
Name
Phone
Company
Delivery Address

-------------------------------------------------------------

Order Summary

Status             [ Pending ▼ ]
Delivery Estimate  [ Same Day ▼ ]
Payment Status     Paid

-------------------------------------------------------------

Products

+-----------------------------------------------------------------------+
| Product | Price | Qty | Unit | Total                                 |
+-----------------------------------------------------------------------+
| Apple   | ₹120  | 5    | Kg   | ₹600                                  |
| Mango   | ₹250  | 1    | Box  | ₹250                                  |
+-----------------------------------------------------------------------+

-------------------------------------------------------------

Order Total

Subtotal

Grand Total

-------------------------------------------------------------

Timeline

✓ Order Created

✓ Confirmed

□ Packed

□ Ready for Dispatch

□ Out for Delivery

□ Delivered
```

---

# 3. Buyer Order List

```text
+--------------------------------------------------------------+
| My Orders                                                    |
+--------------------------------------------------------------+

Search Orders

+--------------------------------------------------------------+
| Order # ORD001                                               |
| Pending                                                      |
| Same Day Delivery                                            |
| ₹850                                                         |
| View Details →                                               |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
| Order # ORD002                                               |
| Delivered                                                    |
| Next Day Delivery                                            |
| ₹430                                                         |
| View Details →                                               |
+--------------------------------------------------------------+
```

---

# 4. Buyer Order Details

```text
+--------------------------------------------------------------------+
| ← Back                     Order # ORD001                          |
+--------------------------------------------------------------------+

Current Status

Pending

Estimated Delivery

Today

------------------------------------------------------

Products

Apple

5 Kg

₹600

------------------------

Mango

1 Box

₹250

------------------------------------------------------

Delivery Address

xxxxxxxxxxxxxxxx

------------------------------------------------------

Grand Total

₹850
```

---

# Mobile Layout

FreshFlow is designed mobile-first.

Business owners and buyers should be able to manage and track orders comfortably on mobile devices.

---

# 1. Orders List (Business Owner)

```text
+-------------------------+
| ← Orders                |
+-------------------------+

🔍 Search

[Status ▼]

-------------------------

ORD001

Ahmed

₹850

Pending

Same Day

View →

-------------------------

ORD002

Salman

₹430

Packed

Next Day

View →
```

---

# 2. Order Details (Business Owner)

```text
+---------------------------+
| ← Order # ORD001          |
+---------------------------+

Customer

Ahmed

---------------------------

Status

[ Pending ▼ ]

---------------------------

Delivery

[ Same Day ▼ ]

---------------------------

Products

Apple

5 Kg

₹600

---------------------------

Mango

1 Box

₹250

---------------------------

Total

₹850

---------------------------

Timeline

✓ Created

✓ Confirmed

□ Packed

□ Dispatch

□ Delivered
```

---

# 3. Buyer Orders

```text
+---------------------------+
| My Orders                 |
+---------------------------+

ORD001

Pending

Today

₹850

View →

---------------------------

ORD002

Delivered

Yesterday

₹430

View →
```

---

# 4. Buyer Order Details

```text
+---------------------------+
| Order # ORD001            |
+---------------------------+

Status

Pending

---------------------------

Estimated Delivery

Today

---------------------------

Apple

5 Kg

₹600

---------------------------

Mango

1 Box

₹250

---------------------------

Delivery Address

xxxxxxxxxx

---------------------------

Grand Total

₹850
```

---

# Responsive Behaviour

Desktop

* Multi-column data tables.
* Sidebar navigation.
* Inline filters.
* Timeline displayed vertically.
* Product table with complete details.

---

Tablet

* Collapsible sidebar.
* Reduced table columns.
* Responsive filter layout.
* Product information wraps into multiple lines.

---

Mobile

* Card-based order list.
* Vertical stacking of information.
* Large touch-friendly buttons.
* Dropdown status selection.
* Single-column layout.
* Product snapshots displayed as cards.
* Timeline displayed vertically.
* No horizontal scrolling for essential information.

---

# Navigation

Business Owner

```text
Dashboard
      ↓
Orders
      ↓
Orders List
      ↓
Order Details
      ↓
Update Status
```

---

Buyer

```text
Dashboard
      ↓
My Orders
      ↓
Order Details
      ↓
Track Order
```

---

# Version History

## Version 1.0

Initial Orders module ASCII wireframes.

Includes:

* Desktop layouts.
* Mobile layouts.
* Business Owner screens.
* Buyer screens.
* Responsive behaviour.
* Navigation structure.
````
