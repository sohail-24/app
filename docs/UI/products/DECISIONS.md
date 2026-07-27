# Products Module Decisions

Version: 1.0

Status: Approved Design

Module: Products

---

# Purpose

This document records the permanent architectural, business, and user experience decisions made for the Products module.

These decisions serve as the long-term reference for future development and maintenance.

The purpose of this document is to explain **why** important decisions were made, not simply **what** the module does.

---

# Decision 1 — Products Manage Product Information Only

The Products module is responsible only for product information.

It manages:

* Product details
* Price
* Category
* Images
* Product availability

The Products module does not manage:

* Stock quantity
* Warehouse information
* Customer orders
* Invoices
* Delivery
* Business settings

This keeps the module focused and easy to maintain.

---

# Decision 2 — Inventory Is Independent

Stock information belongs to the Inventory module.

A product may exist before any stock is added.

This allows businesses to prepare their product catalog before receiving inventory.

Separating products from inventory also supports future warehouse management without changing the product architecture.

---

# Decision 3 — Simple Language Over Technical Terms

FreshFlow is designed for businesses of all sizes.

Many business owners may not be familiar with technical or wholesale abbreviations.

The user interface should always use clear and easy-to-understand language.

Examples:

Use:

* Minimum Order

Instead of:

* Minimum Order Quantity

Use:

* Price

Instead of:

* Unit Price

The goal is to reduce confusion and shorten the learning curve.

---

# Decision 4 — Keep Product Creation Simple

Creating a product should require only the information necessary to begin selling.

Required information:

* Product Name
* Category
* Price
* Unit
* Minimum Order

Optional information:

* Description
* Brand
* Product Code
* Barcode
* Product Quality
* Organic Product
* Images

Businesses should be able to create products within a few minutes.

---

# Decision 5 — Archive Instead of Delete

Products are never permanently deleted through the user interface.

Instead, products are archived.

Reasons:

* Preserve order history.
* Preserve reports.
* Prevent accidental data loss.
* Allow future product restoration.

Archived products cannot be purchased.

---

# Decision 6 — Product Availability

Products may exist in one of three states.

* Available for Sale
* Hidden from Customers
* Archived

Only products marked as Available for Sale are visible to customers.

This allows business owners to prepare products before making them available.

---

# Decision 7 — Product Images

Every product may contain:

* One main product image.
* Multiple additional images.

If no image is uploaded, FreshFlow displays a default product image.

Broken image links should never display broken image icons.

---

# Decision 8 — Automatic Price Calculation

Customers should immediately see the total price as they change the quantity.

Example:

Price

₹20 per Item

Customer selects:

12 Items

FreshFlow automatically displays:

12 × ₹20 = ₹240

This improves transparency and reduces calculation mistakes.

---

# Decision 9 — Minimum Order

Every product includes a minimum order.

Customers may not purchase less than the configured minimum quantity.

The minimum order helps businesses avoid processing orders that are too small to be practical.

---

# Decision 10 — Business Order Rules

Business-wide selling rules are managed outside the Products module.

These include:

* Business opening time
* Business closing time
* Working days
* Minimum order value
* Delivery charge for small orders

These settings belong to the Company or Business Settings module because they apply to every product.

---

# Decision 11 — Buyers and Business Owners Have Different Experiences

Business Owners can:

* Create products
* Update products
* Archive products
* Manage product images
* Change product availability

Buyers can:

* Browse products
* Search products
* Filter products
* View product details
* Add products to the shopping cart

Administrative actions are never shown to buyers.

---

# Decision 12 — One Product Belongs to One Company

Every product belongs to one company.

Product ownership is permanent unless ownership is intentionally transferred in a future version.

This decision supports future multi-business and multi-tenant architecture.

---

# Decision 13 — Categories Organize Products

Every product belongs to one category.

Categories improve:

* Product browsing
* Product searching
* Marketplace organization
* Reporting

A product cannot exist without a category.

---

# Decision 14 — Products Support Different Business Types

FreshFlow is designed for many types of businesses.

Examples include:

* Fruit wholesalers
* Vegetable suppliers
* Grocery distributors
* Dairy suppliers
* Beverage suppliers
* Bakery businesses

For this reason, products support different units such as:

* Item
* Kilogram
* Gram
* Box
* Packet
* Bag
* Bottle
* Crate
* Tray

The architecture is intentionally generic and is not limited to fruits or vegetables.

---

# Decision 15 — Future Features Are Intentionally Deferred

The following features are not included in Version 1.0:

* Product variants
* Batch tracking
* Expiry dates
* Product bundles
* Multiple suppliers for one product
* Barcode generation
* Product reviews
* Artificial intelligence product suggestions

These features remain possible without changing the existing architecture.

---

# Version 1.0 Design Principles

The Products module follows these permanent design principles.

* Simplicity before complexity.
* Business understanding before technical implementation.
* Plain language instead of technical terminology.
* One responsibility for each module.
* Mobile-first user experience.
* Prevent accidental data loss.
* Keep product management fast and easy.
* Build for local businesses first while preparing for future expansion.

---

# Version History

## Version 1.0

Initial architectural decisions approved for the Products module.

These decisions become the reference for future implementation unless a significant architectural issue requires revision.

