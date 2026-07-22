Here's the complete **`ASCII.md`** for the **User Profile** module. I designed it as the **official UI blueprint** that future implementation should follow exactly.

# User Profile ASCII

Version: 1.0

Status: Approved Design

Module: User Profile

---

# Purpose

This document defines the official visual layout of the User Profile module.

No implementation should introduce layouts or components that differ from these approved wireframes without updating this document first.

---

# Design Principles

* Clean B2B interface
* Card-based layout
* Consistent spacing
* Responsive on all devices
* Minimal scrolling
* Professional ERP appearance
* Accessible and mobile friendly

---

# Desktop Layout

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Top Navigation                                                    │
├─────────┼───────────────────────────────────────────────────────────────────┤
│         │ USER PROFILE                                                      │
│         │ Manage your personal account                                      │
│         │                                                                   │
│         │ ┌───────────────────────────────────────────────────────────────┐ │
│         │ │                     Profile Card                              │ │
│         │ │                                                               │ │
│         │ │          ○ Avatar                                              │ │
│         │ │                                                               │ │
│         │ │   Mohammed Sohail                                             │ │
│         │ │   Business Owner                                              │ │
│         │ │   mdsohail88008@gmail.com                                     │ │
│         │ │                                                               │ │
│         │ │ [Upload Photo] [Remove Photo]                                 │ │
│         │ └───────────────────────────────────────────────────────────────┘ │
│         │                                                                   │
│         │ ┌───────────────────────────────────────────────────────────────┐ │
│         │ │ Personal Information                                          │ │
│         │ ├───────────────────────────────────────────────────────────────┤ │
│         │ │ Full Name        [__________________________]                 │ │
│         │ │ Email            mdsohail88008@gmail.com 🔒                  │ │
│         │ │ Mobile           [__________________________]                 │ │
│         │ │ Date of Birth    [__________________________]                 │ │
│         │ │ Gender           [▼ Select]                                  │ │
│         │ └───────────────────────────────────────────────────────────────┘ │
│         │                                                                   │
│         │ ┌───────────────────────────────────────────────────────────────┐ │
│         │ │ Contact Information                                           │ │
│         │ ├───────────────────────────────────────────────────────────────┤ │
│         │ │ Address         [__________________________]                  │ │
│         │ │ City            [__________________________]                  │ │
│         │ │ State           [__________________________]                  │ │
│         │ │ Country         [__________________________]                  │ │
│         │ │ Postal Code     [__________________________]                  │ │
│         │ └───────────────────────────────────────────────────────────────┘ │
│         │                                                                   │
│         │ ┌───────────────────────────────────────────────────────────────┐ │
│         │ │ Security                                                     │ │
│         │ ├───────────────────────────────────────────────────────────────┤ │
│         │ │ Last Login      21 Jul 2026 09:15 AM                         │ │
│         │ │ Account Created 17 Jul 2026                                  │ │
│         │ │                                                               │ │
│         │ │ [Change Password]                                             │ │
│         │ └───────────────────────────────────────────────────────────────┘ │
│         │                                                                   │
│         │ ┌───────────────────────────────────────────────────────────────┐ │
│         │ │ Preferences                                                  │ │
│         │ ├───────────────────────────────────────────────────────────────┤ │
│         │ │ Theme      (•) System  ( ) Light  ( ) Dark                  │ │
│         │ └───────────────────────────────────────────────────────────────┘ │
│         │                                                                   │
│         │                              [Cancel] [Save Changes]             │
└─────────┴───────────────────────────────────────────────────────────────────┘
```

---

# Tablet Layout

```text
┌───────────────────────────────────────────────┐
│ Header                                        │
├───────────────────────────────────────────────┤
│ Avatar                                        │
│ Name                                          │
│ Role                                          │
│ Email                                         │
│                                               │
│ Upload / Remove Photo                         │
├───────────────────────────────────────────────┤
│ Personal Information Card                     │
├───────────────────────────────────────────────┤
│ Contact Information Card                      │
├───────────────────────────────────────────────┤
│ Security Card                                 │
├───────────────────────────────────────────────┤
│ Preferences Card                              │
├───────────────────────────────────────────────┤
│ Cancel          Save Changes                  │
└───────────────────────────────────────────────┘
```

---

# Mobile Layout

```text
┌────────────────────────────┐
│ ← User Profile             │
├────────────────────────────┤
│           ○ Avatar         │
│ Mohammed Sohail            │
│ Business Owner             │
│                            │
│ Upload Photo               │
├────────────────────────────┤
│ Personal Information       │
├────────────────────────────┤
│ Full Name                  │
│ Email 🔒                   │
│ Mobile                     │
│ DOB                        │
│ Gender                     │
├────────────────────────────┤
│ Contact Information        │
├────────────────────────────┤
│ Address                    │
│ City                       │
│ State                      │
│ Country                    │
│ Postal Code                │
├────────────────────────────┤
│ Security                   │
│ Change Password            │
├────────────────────────────┤
│ Preferences                │
├────────────────────────────┤
│ Save Changes               │
└────────────────────────────┘
```

---

# Loading State

```text
┌────────────────────────────────────┐
│ ███████████████████████████████    │
│                                    │
│        ◌ Loading Profile...        │
│                                    │
│ ███████████████████████████████    │
│ ███████████████████████████████    │
│ ███████████████████████████████    │
│ ███████████████████████████████    │
└────────────────────────────────────┘
```

Skeleton placeholders replace cards until profile data is loaded.

---

# Empty Avatar State

```text
┌──────────────────────────────┐
│            👤                │
│                              │
│ No profile picture           │
│                              │
│ [Upload Photo]               │
└──────────────────────────────┘
```

A default avatar is displayed whenever no custom image exists.

---

# Error State

```text
┌──────────────────────────────────────────┐
│ ⚠ Unable to load your profile.           │
│                                          │
│ Please try again.                        │
│                                          │
│          [Retry]                         │
└──────────────────────────────────────────┘
```

---

# Edit Mode

```text
┌──────────────────────────────────────────┐
│ Personal Information                     │
├──────────────────────────────────────────┤
│ Full Name      [ Mohammed Sohail ]       │
│ Mobile         [ 9876543210 ]            │
│ Address        [ Hyderabad ]             │
│                                          │
│             Cancel    Save               │
└──────────────────────────────────────────┘
```

Only editable fields become active.

Read-only fields remain locked.

---

# Change Password Dialog

```text
┌────────────────────────────────────┐
│ Change Password                     │
├────────────────────────────────────┤
│ Current Password                    │
│ [________________________]          │
│                                    │
│ New Password                        │
│ [________________________]          │
│                                    │
│ Confirm Password                    │
│ [________________________]          │
│                                    │
│ Cancel      Update Password         │
└────────────────────────────────────┘
```

---

# Upload Avatar Dialog

```text
┌────────────────────────────────────┐
│ Upload Profile Photo                │
├────────────────────────────────────┤
│                                    │
│     Drag & Drop Image              │
│                                    │
│           or                       │
│                                    │
│      [Choose File]                 │
│                                    │
│ Cancel         Upload              │
└────────────────────────────────────┘
```

---

# Remove Avatar Confirmation

```text
┌─────────────────────────────────────────┐
│ Remove Profile Photo?                   │
│                                         │
│ This action cannot be undone.           │
│                                         │
│ Cancel      Remove                      │
└─────────────────────────────────────────┘
```

---

# Success Notification

```text
┌────────────────────────────────────┐
│ ✓ Profile updated successfully.    │
└────────────────────────────────────┘
```

Appears briefly after a successful update.

---

# Validation Error

```text
Full Name

[ Mohammed Sohail ]

⚠ Full Name is required.
```

Validation messages appear directly beneath the affected field.

---

# Responsive Behavior

## Desktop

* Sidebar remains visible.
* Cards use maximum width for readability.
* Save bar stays at the bottom of the page.

## Tablet

* Cards stack vertically.
* Navigation collapses.
* Buttons remain full width where appropriate.

## Mobile

* Single-column layout.
* Touch-friendly controls.
* Save button spans full width.
* Dialogs use full-screen sheets where appropriate.

---

# UI Rules

* Email is always read-only.
* Required fields are clearly indicated.
* Save button remains disabled until changes are made.
* Cancel restores original values.
* Avatar preview updates immediately after selection.
* Password fields never display existing passwords.
* Validation occurs before submitting.
* Success and error messages never hide form fields.
* The layout must remain consistent across all authenticated roles.

---

# Approval

This ASCII document is the official UI blueprint for the User Profile module.

All future React components, styling, and responsive behavior must follow these approved layouts unless this document is revised.
