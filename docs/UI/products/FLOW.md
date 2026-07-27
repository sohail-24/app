# Products Module Flow

Version: 1.0

Status: Approved Design

Module: Products

---

# Purpose

This document defines the business flows for the Products module.

The goal is to describe how users interact with the system and how the system responds to each action.

The flows focus on business behavior rather than implementation details.

---

# Flow 1 — View Products

## Business Owner

```text
Open Products Page
        │
        ▼
Load Products
        │
        ▼
Display All Products
        │
        ▼
Ready
```

Business owners can view every product regardless of its availability.

---

## Buyer

```text
Open Marketplace
        │
        ▼
Load Products
        │
        ▼
Display Only Products Available for Sale
        │
        ▼
Ready
```

Hidden and archived products are never displayed to buyers.

---

# Business Rules

* Business owners can view all products.
* Buyers can only view products available for sale.
* Product information is read-only for buyers.

---

# Flow 2 — Search Products

```text
Enter Search Text
        │
        ▼
Search Products
        │
        ▼
Matching Products Found?
        │
   ┌────┴────┐
   │         │
 Yes        No
   │         │
   ▼         ▼
Show      Show Friendly
Results   "No Products Found"
```

---

# Business Rules

* Search is performed using the product name.
* Search results update without reloading the page.
* Searching never changes product information.

---

# Flow 3 — Filter Products

```text
Select Category
        │
        ▼
Select Availability
        │
        ▼
Update Product List
        │
        ▼
Display Matching Products
```

---

# Business Rules

Business Owner filters:

* Category
* Availability

Buyer filters:

* Category

Buyers only see products available for sale.

---

# Flow 4 — Add Product

```text
Open Add Product
        │
        ▼
Enter Product Information
        │
        ▼
Upload Images (Optional)
        │
        ▼
Click Save Product
        │
        ▼
Validate Information
        │
   ┌────┴────┐
   │         │
Valid      Invalid
   │         │
   ▼         ▼
Create     Show
Product    Validation Errors
   │
   ▼
Display Success Message
   │
   ▼
Return to Products Page
```

---

# Business Rules

* Product Name is required.
* Category is required.
* Price is required.
* Unit is required.
* Minimum Order is required.
* Product images are optional.
* A product can be created before stock is added.

---

# Flow 5 — Edit Product

```text
Open Product
        │
        ▼
Click Edit
        │
        ▼
Update Information
        │
        ▼
Save Changes
        │
        ▼
Validate Information
        │
   ┌────┴────┐
   │         │
Valid      Invalid
   │         │
   ▼         ▼
Update     Show
Product    Validation Errors
   │
   ▼
Display Success Message
```

---

# Business Rules

* Only business owners can edit products.
* Product history should remain accurate.
* Validation rules are the same as product creation.

---

# Flow 6 — Archive Product

```text
Click Archive
        │
        ▼
Display Confirmation
        │
        ▼
Confirm?
        │
   ┌────┴────┐
   │         │
 Yes        No
   │         │
   ▼         ▼
Archive   Return
Product   Without Changes
   │
   ▼
Refresh Product List
```

---

# Business Rules

* Products are archived instead of deleted.
* Archived products cannot be purchased.
* Previous orders remain unchanged.

---

# Flow 7 — Browse Product

```text
Open Product
        │
        ▼
View Product Information
        │
        ▼
View Images
        │
        ▼
Select Quantity
        │
        ▼
System Calculates Total Price
        │
        ▼
Ready to Add to Shopping Cart
```

---

# Business Rules

* Total price updates automatically.
* Customers cannot choose less than the minimum order.
* Product information remains read-only.

---

# Flow 8 — Add to Shopping Cart

```text
Click Add to Shopping Cart
        │
        ▼
User Logged In?
        │
   ┌────┴────┐
   │         │
 Yes        No
   │         │
   ▼         ▼
Add To     Redirect To
Shopping   Login
Cart
```

---

# Business Rules

* Authentication is required.
* Guest users may browse products but cannot add items to the shopping cart.

---

# Flow 9 — Business Hours Validation

```text
Customer Starts Checkout
        │
        ▼
Check Business Hours
        │
        ▼
Business Open?
        │
   ┌────┴────┐
   │         │
 Yes        No
   │         │
   ▼         ▼
Continue   Display Message
Checkout   Business Is Closed
```

---

# Business Rules

* Customers can browse products at any time.
* Checkout is available only during configured business hours.
* Business hours are managed in the Company module.

---

# Flow 10 — Minimum Order Value

```text
Calculate Order Total
        │
        ▼
Order Total Meets Minimum Value?
        │
   ┌────┴────┐
   │         │
 Yes        No
   │         │
   ▼         ▼
Continue   Add Delivery Charge
Checkout         │
                 ▼
          Display Updated Total
                 │
                 ▼
          Customer Confirms
```

---

# Business Rules

* The minimum order value is configured by the business owner.
* Orders below the minimum value automatically receive the configured delivery charge.
* Customers always see the updated total before confirming the order.

---

# Flow 11 — Error Handling

## Validation Error

```text
Submit Form
        │
        ▼
Validation Fails
        │
        ▼
Display Field Errors
        │
        ▼
User Corrects Information
```

---

## Session Expired

```text
Protected Action
        │
        ▼
Session Invalid
        │
        ▼
Redirect To Login
```

---

## Product Not Found

```text
Open Product
        │
        ▼
Product Missing
        │
        ▼
Display Friendly Message
        │
        ▼
Return To Products
```

---

## Image Upload Failure

```text
Upload Image
        │
        ▼
Upload Failed
        │
        ▼
Display Error Message
        │
        ▼
Allow Retry
```

---

# Flow Principles

The Products module follows these principles:

* Business owners manage products.
* Buyers purchase products.
* Browsing should always remain available.
* Important actions require confirmation.
* Validation happens before saving.
* Friendly messages are shown instead of technical errors.
* Products are archived instead of deleted.
* Product information remains independent from inventory.

---

# Version History

## Version 1.0

Initial business flows approved for the Products module.

These flows become the reference for implementation, testing, and future maintenance.
