# Categories Module ASCII

Version: 1.0

Status: Approved Design

Module: Categories

---

# Purpose

This document defines the visual structure and screen layout of the Categories module.

The layouts presented here describe the logical organization of the interface and user interactions.

These diagrams are implementation-independent and serve as the blueprint for frontend development.

---

# Categories List Page

```text
+--------------------------------------------------------------------------------------------------+
| Dashboard > Categories                                                          Owner            |
+--------------------------------------------------------------------------------------------------+

 Search Categories...                              [+ Add Category]

----------------------------------------------------------------------------------------------------

+-----------------------------------------------------------------------------------------------+
| Image | Category Name | Description | Products | Status | Updated | Actions                  |
+-----------------------------------------------------------------------------------------------+
| 🥭    | Fruits        | Fresh Fruits|   125    | Active | Today   | Edit Archive            |
| 🥦    | Vegetables    | Vegetables  |    82    | Active | Today   | Edit Archive            |
| 🥛    | Dairy         | Milk Items  |    31    | Active | Today   | Edit Archive            |
| 🌾    | Rice          | Rice Items  |    18    | Active | Today   | Edit Archive            |
| 🧂    | Spices        | Spices      |    44    | Active | Today   | Edit Archive            |
+-----------------------------------------------------------------------------------------------+

Showing 1-5 of 5 Categories
```

---

# Add Category Dialog

```text
+------------------------------------------------------+
|                 Add Category                         |
+------------------------------------------------------+

Category Name *

[_______________________________]

Description

[_______________________________]

Category Image

[ Upload Image ]

Status

(•) Active
( ) Inactive

--------------------------------------------------------

             Cancel           Create Category
```

---

# Edit Category Dialog

```text
+------------------------------------------------------+
|                Edit Category                         |
+------------------------------------------------------+

Category Name *

[ Fruits________________________ ]

Description

[ Fresh Fruits__________________ ]

Category Image

[ Replace Image ]

Status

(•) Active
( ) Inactive
( ) Archived

--------------------------------------------------------

             Cancel            Save Changes
```

---

# Archive Confirmation

```text
+------------------------------------------------------+
|              Archive Category                        |
+------------------------------------------------------+

Are you sure you want to archive this category?

Archived categories cannot be assigned to new products.

[ Cancel ]                    [ Archive ]
```

---

# Empty State

```text
+------------------------------------------------------+

            📂

No Categories Found

Create your first category to begin organizing products.

              [+ Add Category]

+------------------------------------------------------+
```

---

# Loading State

```text
+------------------------------------------------------+

Loading Categories...

██████████████████████████████

Please wait...

+------------------------------------------------------+
```

---

# Search Results

```text
Search : "Fruit"

----------------------------------------------------

🥭 Fruits

1 Category Found
```

---

# Mobile Layout

```text
+--------------------------------------+

Categories

🔍 Search...

+ Add Category

--------------------------------------

🥭 Fruits

Active

125 Products

Edit

--------------------------------------

🥦 Vegetables

Active

82 Products

Edit

--------------------------------------

🥛 Dairy

Inactive

31 Products

Edit

--------------------------------------
```

---

# Marketplace Category Display

```text
------------------------------------------------------------

Browse Categories

🍎 Fruits

🥬 Vegetables

🥛 Dairy

🌾 Rice

🧂 Spices

🥜 Dry Fruits

🍞 Bakery

------------------------------------------------------------
```

---

# Navigation Flow

```text
Dashboard

     │

     ▼

Categories

     │

     ├──────────────┐
     ▼              ▼

Add Category    Edit Category

     │              │

     └──────┬───────┘
            ▼

     Categories List

            │

            ▼

Archive Category
```

---

# Screen States

Supported interface states:

* Loading
* Empty
* Search Results
* Populated List
* Add Category
* Edit Category
* Archive Confirmation

---

# Responsive Design

Desktop

* Table layout
* Full category information
* Action buttons visible
* Search and Add Category on the same row

Mobile

* Card layout
* Vertical stacking
* Touch-friendly actions
* Simplified information display

---

# Version History

## Version 1.0

Initial Categories module wireframes.

Focus areas:

* Clean ERP layout.
* Simple category management.
* Responsive interface.
* Consistent user experience.
