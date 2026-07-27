# Owner Dashboard

**Version:** 1.0

**Status:** Approved Design

**Page:** Owner Dashboard

---

# Overview

This document describes how Business Owners interact with the Owner Dashboard.

The Owner Dashboard is the central operational workspace of FreshFlow.

It provides a real-time overview of business performance, operational alerts, analytics, infrastructure health, and quick access to every management module.

Business operations themselves are performed within their respective modules and are intentionally not duplicated here.

---

# User Entry Flow

Business Owners may enter the dashboard from:

* Authentication
* Login Session Restore
* Company Setup Completion
* Browser Refresh

Only authenticated Business Owners may access this page.

---

# Navigation Flow

```text
Authentication
      │
      ▼
Owner Dashboard
      │
 ┌────┼───────────────────────────────────────────────────────────────┐
 ▼    ▼          ▼         ▼         ▼          ▼          ▼
Products Inventory Orders Customers Reports Settings Notifications
```

The dashboard acts as the central navigation hub for all business modules.

---

# Dashboard Loading Flow

```text
Open Dashboard
      │
      ▼
Validate Owner Session
      │
      ▼
Load Company Information
      │
      ▼
Load Business KPIs
      │
      ▼
Load Analytics
      │
      ▼
Load Recent Activity
      │
      ▼
Load Infrastructure Status
      │
      ▼
Dashboard Ready
```

The dashboard loads summary information only.

Detailed data remains within each business module.

---

# Business KPI Flow

```text
Dashboard Ready
      │
      ▼
Load Today's Business Metrics
      │
      ▼
Load Business Overview Metrics
      │
      ▼
Display KPI Cards
```

KPIs provide a high-level operational overview without exposing detailed records.

---

# Analytics Flow

```text
Dashboard Ready
      │
      ▼
Load Sales Analytics
      │
      ▼
Generate Charts
      │
      ▼
Display Analytics
```

Analytics summarise business performance over selected time periods.

---

# Recent Activity Flow

```text
Dashboard Ready
      │
      ▼
Load Recent Business Events
      │
      ▼
Sort by Latest Activity
      │
      ▼
Display Activity Feed
```

The activity feed highlights operational events requiring owner awareness.

---

# Low Stock Flow

```text
Dashboard Ready
      │
      ▼
Check Inventory Summary
      │
      ▼
Identify Low Stock Products
      │
      ▼
Display Alerts
```

Selecting an alert opens the Inventory module.

---

# Recent Orders Flow

```text
Dashboard Ready
      │
      ▼
Load Recent Orders
      │
      ▼
Display Latest Orders
      │
      ▼
Open Orders Module
```

Detailed order processing is handled by the Orders module.

---

# Quick Actions Flow

```text
Dashboard Ready
      │
      ▼
Select Quick Action
      │
 ┌────┼───────────────────────────────────────────────────────────────┐
 ▼    ▼         ▼          ▼         ▼         ▼
Products Categories Inventory Customers Suppliers Reports
```

Quick Actions provide direct access to common administrative tasks.

---

# Global Search Flow

```text
Enter Search
      │
      ▼
Search Business Records
      │
      ▼
Display Matching Results
      │
      ▼
Open Selected Module
```

Global Search provides fast navigation across supported business modules.

---

# Notifications Flow

```text
Dashboard Ready
      │
      ▼
Load Notifications
      │
      ▼
Display Notification List
      │
      ▼
Open Related Module
```

Notifications provide awareness of important business events.

---

# Infrastructure Health Flow

```text
Dashboard Ready
      │
      ▼
Check Connected Services
      │
      ▼
Database
API
Storage
Email
WhatsApp
Payments
Backups
SSL
      │
      ▼
Display Service Status
```

Infrastructure Health displays operational status only.

Configuration is managed within Settings.

---

# Profile Flow

```text
Owner Profile
      │
      ▼
Profile Menu
      │
 ┌────┼───────────────────────┐
 ▼    ▼            ▼
Profile Settings Logout
```

---

# Validation Flow

```text
Owner Action
      │
      ▼
Validate Permissions
      │
 ┌────┴────┐
 ▼         ▼
Valid    Invalid
 │         │
 ▼         ▼
Continue  Display Message
```

Only authorised Business Owners may access dashboard functionality.

---

# Error Flows

## Session Expired

```text
Open Dashboard
      │
      ▼
Session Expired
      │
      ▼
Authentication
```

---

## KPI Loading Failed

```text
Load KPIs
      │
      ▼
Service Unavailable
      │
      ▼
Display Retry Option
```

---

## Analytics Unavailable

```text
Load Analytics
      │
      ▼
Analytics Not Available
      │
      ▼
Display Placeholder
```

---

## Notifications Unavailable

```text
Load Notifications
      │
      ▼
Unable to Load
      │
      ▼
Display Information
```

---

## Infrastructure Check Failed

```text
Check Services
      │
      ▼
Unable to Verify Status
      │
      ▼
Display Warning
```

---

# Responsive Behaviour Flow

## Desktop

* Permanent sidebar navigation.
* Multi-column dashboard.
* Full analytics view.
* Simultaneous dashboard widgets.

---

## Tablet

* Collapsible sidebar.
* Responsive KPI cards.
* Two-column widgets.
* Touch-friendly navigation.

---

## Mobile

* Drawer navigation.
* Stacked dashboard widgets.
* Simplified analytics.
* Full-width action buttons.

Business management workflows remain consistent across all supported devices.

---

# Exit Points

Business Owners may navigate from the dashboard to:

* Product Catalog
* Categories
* Inventory
* Orders
* Customers
* Delivery Zones
* GST Rules
* Shipping Rules
* Coupons
* Reports
* Notifications
* Staff
* Settings
* Profile
* Logout

---

# Flow Summary

```text
Authentication
      │
      ▼
Owner Dashboard
      │
 ┌────┼─────────────────────────────────────────────────────────────────────────────┐
 ▼    ▼          ▼         ▼         ▼         ▼         ▼         ▼
Products Inventory Orders Customers Reports Settings Staff Notifications
      │
      ▼
Module Workspace
      │
      ▼
Return to Dashboard
```

---

# Design Principles

The Owner Dashboard flow is designed to:

* Serve as the central operational workspace.
* Provide immediate business visibility.
* Minimise navigation effort.
* Surface operational alerts quickly.
* Present summary information without duplicating module logic.
* Maintain consistent navigation across all business modules.
* Support responsive business management on desktop, tablet, and mobile devices.

---

# Version History

## Version 1.0

Initial Owner Dashboard flow documentation.

Focus areas:

* Dashboard loading.
* Business KPIs.
* Analytics.
* Recent activity.
* Infrastructure health.
* Global navigation.
* Quick Actions.
* Responsive operational workflow.
