# Company

**Version:** 1.1

**Status:** Approved Design

**Module:** Company

---

# Overview

The Company module manages the core business information and operational settings required to operate FreshFlow.

It serves as the business identity and central configuration module for the platform, providing company information and business settings that are shared across all modules.

Version 1.1 introduces **Delivery Settings**, allowing business owners to define the geographical areas where customers can place orders. This enables startups to launch in selected regions while supporting future expansion.

---

# Purpose

The purpose of this module is to:

* Create and manage company information.
* Store essential business details.
* Configure business delivery settings.
* Provide company information to other modules.
* Maintain a single source of truth for business identity and business configuration.
* Keep business setup simple and fast.

---

# Business Goals

The Company module aims to:

* Reduce onboarding time.
* Allow businesses to start using FreshFlow within minutes.
* Provide consistent company information across the system.
* Allow businesses to operate only within supported delivery areas.
* Support future business growth without increasing initial complexity.
* Maintain a clean and user-friendly experience.

---

# Users

The following users can access this module:

* Business Owner
* Authorized Staff (Future Version)

---

# Permissions

## Business Owner

Can:

* View company information.
* Update company information.
* Upload or replace company logo.
* Configure supported delivery states.

Cannot:

* Delete the company through the user interface.
* Modify restricted system settings.

---

# Features

Version 1.1 includes:

## Company Information

* Company Logo (Optional)
* Company Name
* Business Type
* Business Email
* Business Phone
* Website (Optional)

## Business Address

* Business Address
* City
* State
* Postal Code

## Delivery Settings

* Supported States
* Enable or Disable Delivery by State

---

# Business Rules

The Company module follows these business rules:

* Every business has one company profile.
* Company Name is required.
* Business Type is required.
* Business Email is required.
* Business Phone is required.
* Website is optional.
* Company Logo is optional.
* Address information is required.
* Only authorized users can update company information.
* Delivery is available only in supported states.
* Supported delivery states are managed by the Business Owner.
* Orders from unsupported states cannot be completed.
* Company information is shared across all business modules.

---

# Dependencies

The Company module is used by:

* Products
* Inventory
* Warehouse
* Orders
* Invoices
* Reports

The Company module depends on:

* Authentication Module
* User Profile Module

---

# Database

Version 1.1 uses:

## Table

* companies

Typical information stored includes:

### Company Information

* Company Logo
* Company Name
* Business Type
* Business Email
* Business Phone
* Website

### Address

* Address
* City
* State
* Postal Code

### Delivery Settings

* Supported States

### System

* Created Date
* Updated Date

---

# API

The Company module provides APIs for:

* Get Company Information
* Update Company Information
* Upload Company Logo
* Delete Company Logo
* Get Supported Delivery States
* Update Supported Delivery States

Detailed API specifications are documented in **API.md**.

---

# Security

Security requirements include:

* Authentication required.
* Server-side authorization.
* Input validation.
* Secure logo upload validation.
* Protected company information.
* Only Business Owners can modify delivery settings.
* Audit-ready update process.

---

# Future Roadmap

Future versions may include:

* Business verification
* GST and tax information
* Multi-company support
* Multiple business locations
* Delivery by City
* Delivery by District
* Delivery by PIN Code
* Delivery charges by location
* Currency selection
* Timezone selection
* Language preferences
* Company branding options

These features are intentionally excluded from Version 1.1 to maintain a simple onboarding experience while supporting controlled business expansion.

---

# Related Modules

The Company module works with:

* User Profile
* Products
* Inventory
* Warehouse
* Orders
* Invoices
* Reports

The **Orders** module uses the configured supported delivery states to determine whether a customer's delivery address is eligible for order placement.

---

# Documentation

This module includes:

* README.md
* DECISIONS.md
* ASCII.md
* COMPONENTS.md
* FLOW.md
* API.md
* TESTING.md

---

# Version History

## Version 1.1

Updated Company module documentation.

New additions:

* Delivery Settings
* Supported States configuration
* Order delivery eligibility rules
* Company-managed delivery configuration

Continued focus areas:

* Simple business onboarding.
* Core company information.
* Centralized business configuration.
* Controlled startup expansion.
* Foundation for future business modules.
