Company Components

Version: 1.1

Status: Approved Design

Module: Company

Purpose

This document defines the component architecture for the Company module.

It describes how the user interface is organized into reusable, maintainable components and clearly defines the responsibility of each component.

The Company module manages both business information and business configuration, including delivery settings that determine where the business operates.

Implementation details are intentionally excluded from this document.

Design Principles

The Company module follows these principles:

Single responsibility for every component.
Mobile-first design.
Reusable UI components.
One-way data flow.
Clear ownership of state.
Centralized business configuration.
Consistent architecture across FreshFlow.
Component Hierarchy
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
├── DeliverySettingsCard
│   ├── DeliveryStateList
│   ├── StateItem
│   │   ├── StateName
│   │   ├── StatusBadge
│   │   └── ToggleSwitch
│   ├── DeliveryInformation
│   └── EmptyState
│
├── SaveBar
│
├── UploadLogoDialog
│
├── RemoveLogoDialog
│
└── DeliverySettingsDialog
Component Responsibilities
CompanyPage
Purpose

Acts as the parent component for the entire Company module.

Responsibilities
Load company information.
Load delivery settings.
Manage page state.
Handle validation.
Coordinate API requests.
Control dialog visibility.
Pass data to child components.
Save business configuration.
Children
PageHeader
CompanyLogoCard
BasicInformationCard
ContactInformationCard
BusinessAddressCard
DeliverySettingsCard
SaveBar
UploadLogoDialog
RemoveLogoDialog
DeliverySettingsDialog
PageHeader
Purpose

Displays the page title and primary actions.

Responsibilities
Display page title.
Display Save action.
Provide consistent navigation context.
CompanyLogoCard
Purpose

Manage the company's branding image.

Responsibilities
Display current logo.
Display default placeholder.
Trigger upload dialog.
Trigger remove dialog.
Children
CompanyLogo
UploadLogoButton
RemoveLogoButton
CompanyLogo
Purpose

Display the current company logo.

Responsibilities
Show uploaded logo.
Show default placeholder when no logo exists.
UploadLogoButton
Purpose

Allow users to upload a company logo.

Responsibilities
Open upload dialog.
Trigger upload workflow.
RemoveLogoButton
Purpose

Allow users to remove the current company logo.

Responsibilities
Open confirmation dialog.
Remove logo after confirmation.
BasicInformationCard
Purpose

Display and edit basic company details.

Responsibilities

Manage:

Company Name
Business Type
ContactInformationCard
Purpose

Display and edit business contact details.

Responsibilities

Manage:

Business Email
Business Phone
Website
BusinessAddressCard
Purpose

Display and edit business location details.

Responsibilities

Manage:

Address
City
State
Postal Code
DeliverySettingsCard
Purpose

Manage the business delivery coverage.

Responsibilities
Display supported delivery states.
Enable or disable delivery for individual states.
Display delivery configuration.
Validate business delivery settings.
Children
DeliveryStateList
DeliveryInformation
EmptyState
DeliveryStateList
Purpose

Display all configured delivery states.

Responsibilities
Render state list.
Organize delivery coverage.
Display active and inactive states.
StateItem
Purpose

Represent a single delivery state.

Responsibilities
Display state name.
Display delivery status.
Allow delivery toggle.
Children
StateName
StatusBadge
ToggleSwitch
StateName
Purpose

Display the state name.

Responsibilities
Render readable state name.
StatusBadge
Purpose

Display current delivery availability.

Responsibilities

Show:

Active
Disabled
ToggleSwitch
Purpose

Enable or disable delivery.

Responsibilities
Toggle delivery status.
Notify parent component.
Prevent invalid configuration.
DeliveryInformation
Purpose

Provide helpful guidance.

Responsibilities

Display messages such as:

Orders are accepted only from enabled states.
EmptyState
Purpose

Handle missing delivery configuration.

Responsibilities

Display friendly guidance when no states are configured.

SaveBar
Purpose

Provide save functionality for modified company information and business settings.

Responsibilities
Save changes.
Cancel changes.
Display saving state.
Prevent duplicate submissions.
Save delivery settings together with company information.
UploadLogoDialog
Purpose

Upload a new company logo.

Responsibilities
Select image.
Validate file.
Upload logo.
Display upload progress.
RemoveLogoDialog
Purpose

Confirm logo removal.

Responsibilities
Confirm removal.
Cancel removal.
Trigger delete action.
DeliverySettingsDialog
Purpose

Configure supported delivery locations.

Responsibilities
Display available states.
Enable or disable delivery states.
Validate configuration.
Save delivery settings.
Cancel changes.
Prevent invalid configuration.
State Ownership

The CompanyPage owns all business state.

Managed state includes:

Company information.
Business information.
Delivery settings.
Supported delivery states.
Loading state.
Saving state.
Validation errors.
Upload progress.
Logo state.
Dialog visibility.

Child components remain stateless whenever possible.

Component Communication

The Company module follows a one-way data flow.

CompanyPage
      │
      ▼
Company Information
Delivery Settings
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

This architecture keeps data predictable, reusable, and easy to maintain.

Reusable Components

The following components should be reusable across FreshFlow:

PageHeader
SaveBar
SectionCard
CompanyLogo
UploadButton
ConfirmationDialog
TextInput
SelectInput
PhoneInput
EmailInput
ToggleSwitch
StatusBadge
StateItem
EmptyState
SettingsCard

These shared components help maintain a consistent user experience throughout the application.

Future Expansion

The architecture supports additional components without affecting existing functionality.

Potential future components include:

BusinessSettingsCard
TaxInformationCard
BusinessVerificationCard
MultipleLocationsCard
BrandingSettingsCard
NotificationPreferencesCard
DeliveryCitiesCard
DeliveryDistrictsCard
DeliveryPincodeCard
DeliveryChargesCard
DeliveryScheduleCard

Future components should follow the same design principles and integrate into the existing component hierarchy.

Architectural Rules

The following rules apply to every Company component:

One component should have one primary responsibility.
Business logic belongs in the parent page.
Components communicate through props and callbacks.
Components should avoid direct API communication unless specifically designed for that purpose.
Shared UI elements should be reusable.
Mobile responsiveness must be considered during component design.
Components should remain simple, predictable, and easy to maintain.
Delivery configuration belongs to the Company module.
Orders consume delivery settings but never modify them.
At least one delivery state must remain enabled.
Delivery components should support future expansion to cities, districts, and PIN code coverage without requiring architectural changes.
Approval

This document defines the official component architecture for the Company module.

All implementation must follow this component structure unless a newer approved design replaces it.

The Company module follows the FreshFlow Mobile-First, Desktop-Complete architecture and shares common UI patterns with all current and future modules.

Version History
Version 1.1

Updated Company component architecture.

New Components
DeliverySettingsCard
DeliveryStateList
StateItem
StateName
StatusBadge
ToggleSwitch
DeliveryInformation
EmptyState
DeliverySettingsDialog
Architecture Improvements
Company module now manages both business information and business configuration.
Added centralized delivery settings management.
Improved reusable component structure.
Prepared architecture for future city-, district-, and PIN code-based delivery coverage.
Maintained consistent architecture with all FreshFlow modules.