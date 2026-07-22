# Company Components

Version: 1.0

Status: Approved Design

Module: Company

---

# Purpose

This document defines the component architecture for the Company module.

It describes how the user interface is organized into reusable, maintainable components and clearly defines the responsibility of each component.

Implementation details are intentionally excluded from this document.

---

# Design Principles

The Company module follows these principles:

* Single responsibility for every component.
* Mobile-first design.
* Reusable UI components.
* One-way data flow.
* Clear ownership of state.
* Consistent architecture across FreshFlow.

---

# Component Hierarchy

```text
CompanyPage
│
├── PageHeader
│
├── CompanyLogoCard
│   ├── CompanyLogo
│   ├── UploadLogoButton
│   └── RemoveLogoButton
│
├── BasicInformationCard
│
├── ContactInformationCard
│
├── BusinessAddressCard
│
├── SaveBar
│
├── UploadLogoDialog
│
└── RemoveLogoDialog
```

---

# Component Responsibilities

## CompanyPage

### Purpose

Acts as the parent component for the entire Company module.

### Responsibilities

* Load company information.
* Manage page state.
* Handle validation.
* Coordinate API requests.
* Control dialog visibility.
* Pass data to child components.

### Children

* PageHeader
* CompanyLogoCard
* BasicInformationCard
* ContactInformationCard
* BusinessAddressCard
* SaveBar
* UploadLogoDialog
* RemoveLogoDialog

---

## PageHeader

### Purpose

Displays the page title and primary actions.

### Responsibilities

* Display page title.
* Display Save action.
* Provide consistent navigation context.

---

## CompanyLogoCard

### Purpose

Manage the company's branding image.

### Responsibilities

* Display current logo.
* Display default placeholder.
* Trigger upload dialog.
* Trigger remove dialog.

### Children

* CompanyLogo
* UploadLogoButton
* RemoveLogoButton

---

## CompanyLogo

### Purpose

Display the current company logo.

### Responsibilities

* Show uploaded logo.
* Show default placeholder when no logo exists.

---

## UploadLogoButton

### Purpose

Allow users to upload a company logo.

### Responsibilities

* Open upload dialog.
* Trigger upload workflow.

---

## RemoveLogoButton

### Purpose

Allow users to remove the current company logo.

### Responsibilities

* Open confirmation dialog.
* Remove logo after confirmation.

---

## BasicInformationCard

### Purpose

Display and edit basic company details.

### Responsibilities

Manage:

* Company Name
* Business Type

---

## ContactInformationCard

### Purpose

Display and edit business contact details.

### Responsibilities

Manage:

* Business Email
* Business Phone
* Website

---

## BusinessAddressCard

### Purpose

Display and edit business location details.

### Responsibilities

Manage:

* Address
* City
* State
* Postal Code

---

## SaveBar

### Purpose

Provide save functionality for modified data.

### Responsibilities

* Save changes.
* Cancel changes.
* Display saving state.
* Prevent duplicate submissions.

---

## UploadLogoDialog

### Purpose

Upload a new company logo.

### Responsibilities

* Select image.
* Validate file.
* Upload logo.
* Display upload progress.

---

## RemoveLogoDialog

### Purpose

Confirm logo removal.

### Responsibilities

* Confirm removal.
* Cancel removal.
* Trigger delete action.

---

# State Ownership

The CompanyPage owns all business state.

Managed state includes:

* Company information.
* Loading state.
* Saving state.
* Validation errors.
* Upload progress.
* Logo state.
* Dialog visibility.

Child components remain stateless whenever possible.

---

# Component Communication

The Company module follows a one-way data flow.

```text
CompanyPage
      │
      ▼
Child Components
      │
      ▼
User Input
      │
      ▼
Validation
      │
      ▼
SaveBar
      │
      ▼
Backend API
```

This architecture keeps data predictable and simplifies maintenance.

---

# Reusable Components

The following components should be reusable across FreshFlow:

* PageHeader
* SaveBar
* SectionCard
* CompanyLogo
* UploadButton
* ConfirmationDialog
* TextInput
* SelectInput
* PhoneInput
* EmailInput

These shared components help maintain a consistent user experience throughout the application.

---

# Future Expansion

The architecture supports additional components without affecting existing functionality.

Potential future components include:

* BusinessSettingsCard
* TaxInformationCard
* BusinessVerificationCard
* MultipleLocationsCard
* BrandingSettingsCard
* NotificationPreferencesCard

Future components should follow the same design principles and integrate into the existing component hierarchy.

---

# Architectural Rules

The following rules apply to every Company component:

* One component should have one primary responsibility.
* Business logic belongs in the parent page.
* Components communicate through props and callbacks.
* Components should avoid direct API communication unless specifically designed for that purpose.
* Shared UI elements should be reusable.
* Mobile responsiveness must be considered during component design.
* Components should remain simple, predictable, and easy to maintain.

---

# Approval

This document defines the official component architecture for the Company module.

All implementation must follow this component structure unless a newer approved design replaces it.

The Company module follows the FreshFlow Mobile-First, Desktop-Complete architecture and shares common UI patterns with all future modules.
