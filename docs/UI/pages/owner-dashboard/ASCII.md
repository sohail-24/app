# Owner Dashboard

**Version:** 1.0

**Status:** Approved Design

**Page:** Owner Dashboard

---

# Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏪 FreshFlow ERP                                         🔍 Global Search...                     🔔 4 Notifications     👤 Mohammed Sohail ▼           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DASHBOARD                    │ Welcome Back, Mohammed 👋                                                                                                  │
│                              │ Fresh Mart Wholesale • Monday, 27 Jul 2026                                                                                │
│ 📊 Dashboard                 │ Business Status : 🟢 Healthy                                                                                               │
│ 📦 Products                  ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🗂 Categories                │ TODAY'S BUSINESS                                                                                                           │
│ 📦 Inventory                 │                                                                                                                           │
│ 🛒 Orders                    │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                                                     │
│ 👥 Customers                 │ │ Revenue      │ │ New Orders   │ │ Pending      │ │ Low Stock    │                                                     │
│ 🏭 Suppliers                 │ │ ₹82,450      │ │      18      │ │      5       │ │      12      │                                                     │
│ 🚚 Delivery Zones            │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘                                                     │
│ 💰 GST Rules                 │                                                                                                                           │
│ 🚛 Shipping Rules            │ BUSINESS OVERVIEW                                                                                                          │
│ 🎁 Coupons                   │                                                                                                                           │
│ 📊 Reports                   │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                                                     │
│ 🔔 Notifications             │ │ Products     │ │ Customers    │ │ Suppliers    │ │ Categories  │                                                     │
│ 👨‍💼 Staff                    │ │     120      │ │      86      │ │      25      │ │      14      │                                                     │
│ ⚙ Settings                  │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘                                                     │
│                              ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                              │ 📈 SALES ANALYTICS                                                                                                          │
│                              │ Today • This Week • This Month • This Year                                                                                 │
│                              │                                                                                                                           │
│                              │ ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│                              │ │                                                                                                                     │ │
│                              │ │                                         Sales & Revenue Chart                                                      │ │
│                              │ │                                                                                                                     │ │
│                              │ └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                              ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                              │ RECENT BUSINESS ACTIVITY                                                                                                   │
│                              │                                                                                                                           │
│                              │ 10:15  🛒 New Order #FF1024 received                                                                                     │
│                              │ 10:21  💳 Payment received from Fresh Mart                                                                                │
│                              │ 10:36  📦 Inventory updated                                                                                               │
│                              │ 10:44  👤 New customer registered                                                                                         │
│                              │ 10:55  🚚 Delivery completed                                                                                              │
│                              ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                              │ LOW STOCK ALERTS                                      RECENT ORDERS                                                      │
│                              │                                                                                                                           │
│                              │ 🔴 Mango ............. 8 kg left                      #FF1021   Pending                                                  │
│                              │ 🟠 Apple ............ 12 kg left                      #FF1022   Confirmed                                               │
│                              │ 🟡 Tomato ........... 15 kg left                      #FF1023   Packed                                                  │
│                              │                                                       #FF1024   Delivered                                               │
│                              ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                              │ QUICK ACTIONS                                                                                                              │
│                              │                                                                                                                           │
│                              │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                                                     │
│                              │ │ + Product    │ │ + Category   │ │ + Customer   │ │ + Supplier   │                                                     │
│                              │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘                                                     │
│                              │                                                                                                                           │
│                              │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                                                     │
│                              │ │ Inventory    │ │ Orders       │ │ Reports      │ │ Coupons      │                                                     │
│                              │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘                                                     │
│                              │                                                                                                                           │
│                              │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                                                     │
│                              │ │ GST Rules    │ │ Delivery     │ │ Staff        │ │ Settings     │                                                     │
│                              │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘                                                     │
│                              ├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                              │ INFRASTRUCTURE HEALTH                                                                                                      │
│                              │                                                                                                                           │
│                              │ Database          🟢 Connected                                                                                             │
│                              │ API Server        🟢 Running                                                                                               │
│                              │ Storage           🟢 Healthy                                                                                               │
│                              │ Email Service     🟢 Connected                                                                                             │
│                              │ WhatsApp API      🟢 Connected                                                                                             │
│                              │ Payment Gateway   🟢 Active                                                                                                │
│                              │ Backup Status     🟢 Last Backup : Today 02:00                                                                             │
│                              │ SSL Certificate   🟢 Valid (82 Days Remaining)                                                                             │
└──────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# Tablet Layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ ☰ FreshFlow ERP          🔍 Search            🔔      👤                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ Welcome Back, Mohammed 👋                                                   │
│ Business Status : 🟢 Healthy                                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ Revenue │ Orders │ Pending │ Low Stock                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ Products │ Customers │ Suppliers │ Categories                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ Sales Analytics                                                         │
│ Chart                                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ Recent Activity                                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ Low Stock │ Recent Orders                                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Quick Actions                                                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ Infrastructure Health                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# Mobile Layout

```text
┌──────────────────────────────┐
│ ☰ FreshFlow ERP      👤       │
├──────────────────────────────┤
│ Welcome, Mohammed 👋         │
│ 🟢 Business Healthy          │
├──────────────────────────────┤
│ Revenue                      │
│ Orders                       │
│ Pending                      │
│ Low Stock                    │
├──────────────────────────────┤
│ Sales Chart                  │
├──────────────────────────────┤
│ Recent Activity              │
├──────────────────────────────┤
│ Low Stock Alerts             │
├──────────────────────────────┤
│ Quick Actions                │
├──────────────────────────────┤
│ Infrastructure Health        │
└──────────────────────────────┘
```

---

# Empty Dashboard (New Business)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ 👋 Welcome to FreshFlow                                                    │
│                                                                              │
│ Your business has been created successfully.                                 │
│                                                                              │
│ Complete the following setup to begin selling:                               │
│                                                                              │
│ ✅ Company Profile                                                           │
│ ☐ Add Categories                                                             │
│ ☐ Add Products                                                               │
│ ☐ Configure Delivery Zones                                                   │
│ ☐ Configure GST Rules                                                        │
│ ☐ Configure Shipping Rules                                                   │
│                                                                              │
│                    [ Start Business Setup ]                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# Layout Principles

* The Owner Dashboard is the operational control centre for the business and should allow owners to manage day-to-day operations without requiring command-line tools.
* Business health is presented first through today's KPIs, followed by overall business metrics.
* Analytics, activity feeds, and operational alerts help owners identify trends and take action quickly.
* Quick Actions provide one-click access to the most common administrative tasks.
* Infrastructure Health offers visibility into connected services such as the database, APIs, storage, messaging, payments, backups, and certificates without exposing technical implementation details.
* The sidebar provides consistent access to every management module while keeping the main workspace focused on business operations.
* The layout remains responsive across desktop, tablet, and mobile while preserving the same management workflow.
