# User Profile Components

Version: 1.0

Status: Approved Design

Module: User Profile

---

# Purpose

This document defines the official React component architecture for the User Profile module.

It describes the responsibility, hierarchy, and relationships of each component without specifying implementation details.

This document is the bridge between the approved ASCII design and the future React implementation.

---

# Design Principles

The component architecture follows these principles:

* Single Responsibility Principle
* Reusable components
* Clear separation of concerns
* Predictable hierarchy
* Responsive by design
* Minimal component coupling
* Easy future expansion

---

# Component Hierarchy

```text
UserProfilePage
│
├── PageHeader
│
├── ProfileCard
│   ├── Avatar
│   ├── UserSummary
│   └── AvatarActions
│
├── PersonalInformationCard
│
├── ContactInformationCard
│
├── SecurityCard
│
├── PreferencesCard
│
├── SaveBar
│
├── ChangePasswordDialog
│
├── UploadAvatarDialog
│
└── RemoveAvatarDialog
```

---

# Page Component

## UserProfilePage

### Purpose

The root container for the User Profile module.

### Responsibilities

* Load authenticated user profile
* Arrange page layout
* Coordinate child components
* Manage page-level loading and error states
* Handle save workflow

### Child Components

* PageHeader
* ProfileCard
* PersonalInformationCard
* ContactInformationCard
* SecurityCard
* PreferencesCard
* SaveBar
* Dialog components

---

# Header Component

## PageHeader

### Purpose

Displays the page title and description.

### Responsibilities

* Module title
* Module description
* Consistent page spacing

### Child Components

None

---

# Profile Section

## ProfileCard

### Purpose

Displays the user's identity summary.

### Responsibilities

* Show avatar
* Show name
* Show role
* Show email
* Organize avatar actions

### Child Components

* Avatar
* UserSummary
* AvatarActions

---

## Avatar

### Purpose

Displays the current profile image.

### Responsibilities

* Display uploaded avatar
* Display default avatar
* Handle loading placeholder

### Child Components

None

---

## UserSummary

### Purpose

Displays high-level account information.

### Responsibilities

* Full name
* Role
* Email address

### Child Components

None

---

## AvatarActions

### Purpose

Provides avatar management actions.

### Responsibilities

* Upload photo
* Replace photo
* Remove photo

### Child Components

None

---

# Personal Information

## PersonalInformationCard

### Purpose

Displays editable personal information.

### Responsibilities

* Full Name
* Mobile Number
* Date of Birth
* Gender
* Read-only Email

### Child Components

Individual form controls

---

# Contact Information

## ContactInformationCard

### Purpose

Displays address information.

### Responsibilities

* Address
* City
* State
* Country
* Postal Code

### Child Components

Individual form controls

---

# Security

## SecurityCard

### Purpose

Displays account security information.

### Responsibilities

* Last login
* Account creation date
* Change password entry point

### Child Components

* Change Password Button

---

# Preferences

## PreferencesCard

### Purpose

Displays user preferences.

### Responsibilities

* Theme selection
* Future preferences

### Future Expansion

* Language
* Notifications
* Accessibility
* Regional settings

---

# Save Section

## SaveBar

### Purpose

Provides profile update actions.

### Responsibilities

* Save changes
* Cancel changes
* Display save status

### Behavior

* Disabled until changes exist
* Fixed position on larger screens
* Full-width action area on mobile

---

# Dialog Components

## ChangePasswordDialog

### Purpose

Allows users to update their password.

### Responsibilities

* Current password
* New password
* Confirm password
* Validation
* Submit

---

## UploadAvatarDialog

### Purpose

Handles profile photo uploads.

### Responsibilities

* File selection
* Preview
* Upload
* Validation

---

## RemoveAvatarDialog

### Purpose

Confirms avatar removal.

### Responsibilities

* Confirmation
* Cancel
* Remove

---

# Shared Components

The following shared UI components are expected to be reused from the global design system.

* Card
* Button
* Input
* Textarea
* Select
* Avatar
* Badge
* Separator
* Dialog
* Alert
* Toast
* Skeleton Loader
* Spinner

The User Profile module should never duplicate these shared components.

---

# Loading Components

## ProfileSkeleton

### Purpose

Displayed while profile information loads.

### Responsibilities

* Skeleton avatar
* Skeleton cards
* Placeholder buttons

---

# Error Components

## ProfileLoadError

### Purpose

Displayed when profile retrieval fails.

### Responsibilities

* Error message
* Retry action

---

# Empty Components

## DefaultAvatar

### Purpose

Displayed when no profile photo exists.

### Responsibilities

* Default user icon
* Upload action

---

# State Ownership

## UserProfilePage

Owns

* Loading state
* Error state
* Profile data
* Dirty state
* Save state
* Dialog visibility

Child components receive only the data they require.

---

# Component Communication

```text
UserProfilePage
        │
        ├───────────────┐
        │               │
Profile Data      UI State
        │               │
        ▼               ▼
ProfileCard
PersonalInformationCard
ContactInformationCard
SecurityCard
PreferencesCard
SaveBar
Dialogs
```

All communication flows through the page component.

Child components never communicate directly with each other.

---

# Reusability

The following components should be reusable across FreshFlow.

* PageHeader
* Avatar
* UserSummary
* Card layouts
* SaveBar
* Dialog components
* Skeleton loaders
* Error state component

Business-specific logic must remain outside reusable UI components.

---

# Future Expansion

The architecture is designed to support future additions without restructuring.

Examples include:

* MFA settings
* Login history
* Device management
* Active sessions
* API tokens
* Notification preferences
* Language settings
* Privacy settings
* Connected accounts
* Audit log viewer

These additions should be implemented as new cards or dialogs while preserving the existing hierarchy.

---

# Architectural Rules

* Every component has a single responsibility.
* Business logic belongs outside presentation components.
* Shared UI components must be reused whenever possible.
* Components communicate through the page container.
* Dialogs remain independent from page layout.
* Responsive behavior is handled within components.
* Future features extend the hierarchy rather than replacing it.

---

# Approval

This document defines the official component architecture for the User Profile module.

All future React implementation must follow this hierarchy unless the architecture is formally updated through the documentation-first workflow.
