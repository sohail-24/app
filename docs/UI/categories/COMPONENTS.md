# Categories Module Components

Version: 1.0

Status: Approved Design

Module: Categories

---

# Purpose

This document defines the user interface components used by the Categories module.

It describes the purpose, responsibilities, states, interactions, and permissions of each reusable component.

These components provide a consistent user experience throughout FreshFlow and serve as the foundation for frontend implementation.

---

# Component Hierarchy

```text
Categories Page

├── Page Header
├── Breadcrumb
├── Search Bar
├── Add Category Button
├── Category Table
│   ├── Table Header
│   ├── Category Row
│   ├── Category Image
│   ├── Category Information
│   ├── Product Count
│   ├── Status Badge
│   └── Action Menu
├── Pagination
├── Empty State
├── Loading State
├── Add Category Dialog
├── Edit Category Dialog
├── Archive Confirmation Dialog
└── Toast Notification
```

---

# Page Header

## Purpose

Displays the page title and primary action.

## Responsibilities

* Display module title.
* Display Add Category button.
* Maintain consistent page layout.

## States

* Default

---

# Breadcrumb

## Purpose

Shows the user's current location within the application.

Example:

Dashboard > Categories

---

# Search Bar

## Purpose

Allows business owners to quickly find categories.

## Responsibilities

* Search by category name.
* Filter displayed results.

## States

* Empty
* Typing
* Searching
* Results
* No Results

---

# Add Category Button

## Purpose

Opens the Add Category dialog.

## Responsibilities

* Launch category creation.
* Remain visible on desktop and mobile.

## Permissions

Business Owner only.

---

# Category Table

## Purpose

Displays all available categories.

## Responsibilities

* Show category information.
* Display current status.
* Provide quick actions.

## Columns

* Image
* Category Name
* Description
* Products
* Status
* Updated
* Actions

---

# Category Row

## Purpose

Represents a single category within the table.

## Responsibilities

* Display category information.
* Display product count.
* Display status.
* Provide actions.

---

# Category Image

## Purpose

Displays the category image.

## Behavior

* Show uploaded image.
* Display default placeholder when no image exists.

---

# Category Information

## Displays

* Category Name
* Description

---

# Product Count

## Purpose

Displays the number of products assigned to the category.

## Behavior

* Read-only.
* Automatically updated by the system.

---

# Status Badge

## Purpose

Displays the current category status.

## Supported Statuses

* Active
* Inactive
* Archived

Each status should be visually distinct.

---

# Action Menu

## Purpose

Provides category management actions.

## Actions

* Edit
* Archive

## Permissions

Business Owner only.

---

# Pagination

## Purpose

Allows navigation through multiple pages of categories.

## Responsibilities

* Previous page.
* Next page.
* Current page indicator.

Future versions may support configurable page sizes.

---

# Empty State

## Purpose

Displayed when no categories exist.

## Displays

* Empty illustration.
* Informational message.
* Add Category button.

---

# Loading State

## Purpose

Displayed while category data is loading.

## Displays

* Loading indicator.
* Placeholder content.

---

# Add Category Dialog

## Purpose

Creates a new category.

## Fields

* Category Name
* Description
* Category Image
* Status

## Actions

* Create Category
* Cancel

---

# Edit Category Dialog

## Purpose

Updates an existing category.

## Fields

* Category Name
* Description
* Category Image
* Status

## Actions

* Save Changes
* Cancel

---

# Archive Confirmation Dialog

## Purpose

Confirms category archival before completing the action.

## Displays

* Confirmation message.
* Archive warning.

## Actions

* Archive
* Cancel

---

# Toast Notification

## Purpose

Provides immediate feedback after user actions.

## Success Messages

* Category created successfully.
* Category updated successfully.
* Category archived successfully.

## Error Messages

* Failed to create category.
* Failed to update category.
* Failed to archive category.
* Validation error.

---

# Component Permissions

| Component           | Business Owner | Buyer |
| ------------------- | :------------: | :---: |
| Page Header         |        ✓       |   ✗   |
| Search Bar          |        ✓       |   ✗   |
| Add Category Button |        ✓       |   ✗   |
| Category Table      |        ✓       |   ✗   |
| Edit Category       |        ✓       |   ✗   |
| Archive Category    |        ✓       |   ✗   |
| Status Badge        |        ✓       |   ✗   |
| Pagination          |        ✓       |   ✗   |
| Empty State         |        ✓       |   ✗   |
| Loading State       |        ✓       |   ✗   |
| Toast Notification  |        ✓       |   ✗   |

---

# Responsive Behavior

## Desktop

* Full-width table layout.
* Search bar and Add Category button displayed on the same row.
* Actions displayed inline.

---

## Mobile

* Card-based layout.
* Components stacked vertically.
* Touch-friendly action buttons.
* Simplified information display.

---

# Future Components

Future versions may introduce:

* Bulk Actions Toolbar
* Drag-and-Drop Category Ordering
* Advanced Filters
* Import Categories Dialog
* Export Categories Dialog
* Category Analytics Panel
* Category Activity Timeline

These components are intentionally excluded from Version 1.0.

---

# Version History

## Version 1.0

Initial Categories component specification.

Focus areas:

* Reusable UI components.
* Consistent user experience.
* Responsive design.
* Clear component responsibilities.
