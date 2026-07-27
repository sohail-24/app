# Company ASCII Design

Version: 1.0

Status: Approved Design

Module: Company

---

# Purpose

This document defines the visual layout and user interface structure for the Company module.

The design prioritizes simplicity, fast onboarding, and a consistent experience across desktop, tablet, and mobile devices.

---

# Design Principles

* Mobile-First Design
* Clean and minimal interface
* Easy onboarding
* Large touch-friendly controls
* Responsive layout
* Consistent with other FreshFlow modules
* Fast and intuitive navigation

---

# Desktop Layout

```text
+------------------------------------------------------------------------------------+
| Dashboard > Company                                              [ Save Changes ]  |
+------------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------+
|                               Company Logo                                    |
|                          [ Upload / Change Logo ]                             |
+-------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------+
|                         Basic Information                                     |
|-------------------------------------------------------------------------------|
| Company Name *                                                        [______]|
| Business Type *                                                      [▼ Select]|
+-------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------+
|                         Contact Information                                  |
|-------------------------------------------------------------------------------|
| Business Email *                                                  [__________]|
| Business Phone *                                                  [__________]|
| Website (Optional)                                                [__________]|
+-------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------+
|                          Business Address                                    |
|-------------------------------------------------------------------------------|
| Address *                                                        [___________]|
| City *                                   State *                            |
| [___________]                           [___________]                       |
| Postal Code *                                                   [___________]|
+-------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------+
|                          Delivery Settings                                   |
|-------------------------------------------------------------------------------|
| Supported States                                                      [ Edit ]|
|-------------------------------------------------------------------------------|
| ☑ Telangana                                                            Active |
| ☑ Andhra Pradesh                                                       Active |
| ☐ Karnataka                                                          Disabled |
| ☐ Maharashtra                                                        Disabled |
| ☐ Tamil Nadu                                                        Disabled |
|-------------------------------------------------------------------------------|
| Orders are accepted only from enabled states.                                |
+-------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------+
|                      Cancel                    Save Changes                   |
+-------------------------------------------------------------------------------+
```

---

# Tablet Layout

```text
+-----------------------------------------------------------+
| Company                                  Save             |
+-----------------------------------------------------------+

+-----------------------------------------------------------+
|                       Company Logo                         |
|                  [ Upload / Change Logo ]                 |
+-----------------------------------------------------------+

+-----------------------------------------------------------+
| Basic Information                                         |
|-----------------------------------------------------------|
| Company Name                                              |
| Business Type                                              |
+-----------------------------------------------------------+

+-----------------------------------------------------------+
| Contact Information                                       |
|-----------------------------------------------------------|
| Business Email                                            |
| Business Phone                                            |
| Website (Optional)                                        |
+-----------------------------------------------------------+

+-----------------------------------------------------------+
| Business Address                                          |
|-----------------------------------------------------------|
| Address                                                   |
| City                                                      |
| State                                                     |
| Postal Code                                               |
+-----------------------------------------------------------+
+-----------------------------------------------------------+
| Delivery Settings                                         |
|-----------------------------------------------------------|
| ☑ Telangana                                               |
| ☑ Andhra Pradesh                                          |
| ☐ Karnataka                                                |
| ☐ Maharashtra                                              |
| ☐ Tamil Nadu                                               |
|                                                           |
| Orders are accepted only from enabled states.            |
+-----------------------------------------------------------+

+-----------------------------------------------------------+
| Cancel                              Save                  |
+-----------------------------------------------------------+
```

---

# Mobile Layout

```text
+----------------------------------+
| ← Company               Save     |
+----------------------------------+

+----------------------------------+
|                                  |
|        Company Logo              |
|                                  |
|   [ Upload / Change Logo ]       |
|                                  |
+----------------------------------+

+----------------------------------+
| Basic Information                |
+----------------------------------+
| Company Name *                   |
| [__________________________]     |
|                                  |
| Business Type *                  |
| [ Select ▼ ]                     |
+----------------------------------+

+----------------------------------+
| Contact Information              |
+----------------------------------+
| Business Email *                 |
| [__________________________]     |
|                                  |
| Business Phone *                 |
| [__________________________]     |
|                                  |
| Website (Optional)               |
| [__________________________]     |
+----------------------------------+

+----------------------------------+
| Business Address                 |
+----------------------------------+
| Address *                        |
| [__________________________]     |
|                                  |
| City *                           |
| [__________________________]     |
|                                  |
| State *                          |
| [__________________________]     |
|                                  |
| Postal Code *                    |
| [__________________________]     |
+----------------------------------+
+----------------------------------+
| Delivery Settings                |
+----------------------------------+

☑ Telangana

☑ Andhra Pradesh

☐ Karnataka

☐ Maharashtra

☐ Tamil Nadu

------------------------------------

Orders are accepted only from
enabled states.
+----------------------------------+

+----------------------------------+
|      Save Changes                |
+----------------------------------+
```

---

# Loading State

```text
+----------------------------------+
| ████████████████████████████     |
|                                  |
| ████████████████████████████     |
| ████████████████████████████     |
| ████████████████████████████     |
| ████████████████████████████     |
|                                  |
| Loading Company Information...   |
+----------------------------------+
```

---

# Empty Logo State

```text
+----------------------------------+
|                                  |
|          🏢                      |
|                                  |
|      No Logo Uploaded            |
|                                  |
|     [ Upload Company Logo ]      |
|                                  |
+----------------------------------+
```

---

# Upload Logo Dialog

```text
+--------------------------------------+
| Upload Company Logo                  |
+--------------------------------------+
|                                      |
| Select image from device             |
|                                      |
| Supported: JPG PNG WEBP              |
|                                      |
| Maximum Size: 5 MB                   |
|                                      |
| Cancel              Upload           |
+--------------------------------------+
```

---

# Remove Logo Dialog

```text
+--------------------------------------+
| Remove Company Logo                  |
+--------------------------------------+
|                                      |
| Remove the current company logo?     |
|                                      |
| This action cannot be undone.        |
|                                      |
| Cancel             Remove            |
+--------------------------------------+
```

---

# Delivery Settings Dialog

+------------------------------------------------+
| Configure Delivery States                      |
+------------------------------------------------+

Select states where delivery is available.

☑ Telangana

☑ Andhra Pradesh

☐ Karnataka

☐ Maharashtra

☐ Tamil Nadu

----------------------------------------------

Cancel                      Save Changes


# Success Notification

```text
+--------------------------------------+
| ✅ Company information updated.      |
+--------------------------------------+
```

+----------------------------------------------+
| ✅ Delivery settings updated successfully.   |
+----------------------------------------------+

---

# Validation Error

```text
+--------------------------------------+
| ❌ Company Name is required.         |
+--------------------------------------+

+--------------------------------------+
| ❌ Business Email is invalid.        |
+--------------------------------------+

+--------------------------------------+
| ❌ Business Phone is required.       |
+--------------------------------------+

+----------------------------------------------+
| ❌ Select at least one supported state.      |
+----------------------------------------------+
```

---

# Responsive Rules

Desktop

* Multi-column layout.
* Wide content cards.
* Save button in page header.

Tablet

* Reduced spacing.
* Stacked sections.
* Touch-friendly controls.

Mobile

* Single-column layout.
* Full-width inputs.
* Sticky Save button.
* Large touch targets.
* Easy thumb navigation.
* Minimal scrolling.

Delivery Settings

• Checkbox list
• Scrollable if many states
• Easy touch selection on mobile

---

# UI Rules

* Keep the interface clean.
* Use clear section titles.
* Highlight required fields.
* Optional fields must be clearly labeled.
* Show validation messages immediately after submission.
* Maintain consistent spacing between cards.
* Never overwhelm users with unnecessary settings.
* Prioritize speed and simplicity.
* Delivery Settings should appear after Business Address.
* At least one delivery state must remain enabled.
* Disabled states are clearly distinguishable.
* Changes require explicit Save.
* Orders module uses these settings during checkout.
---

# Approval

This document defines the official user interface layout for the Company module.

All implementation must follow this design unless a newer approved version replaces it.

The Company module follows the FreshFlow Mobile-First, Desktop-Complete design philosophy.
