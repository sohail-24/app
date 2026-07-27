Company Flow

Version: 1.1

Status: Approved Design

Module: Company

Purpose

This document defines the user interaction and business flows for the Company module.

It describes how users interact with company information, how business configuration is managed, how delivery settings are maintained, and how success and failure scenarios are handled.

This document focuses on business behaviour rather than implementation details.

Flow Principles

The Company module follows these principles:

Keep onboarding simple.
Guide users through each step.
Validate before saving.
Display clear feedback.
Prevent data loss.
Maintain centralized business configuration.
Maintain consistent behaviour across devices.
Flow 1 — View Company Information
Trigger

User opens the Company page.

Preconditions
User is authenticated.
Company profile exists.
Main Flow
User
   │
   ▼
Open Company Page
   │
   ▼
Load Company Information
   │
   ▼
Load Delivery Settings
   │
   ▼
Display Company Profile
Success
Company information is displayed.
Company logo is displayed if available.
Delivery settings are loaded.
Supported delivery states are displayed.
Failure
Display friendly error message.
Allow user to retry.
Flow 2 — Create Company (First-Time Setup)
Trigger

User opens the Company page for the first time.

Preconditions
User is authenticated.
No company profile exists.
Main Flow
Open Company Page
        │
        ▼
No Company Found
        │
        ▼
Display Company Form
        │
        ▼
Enter Company Information
        │
        ▼
Configure Delivery Settings
        │
        ▼
Validate Input
        │
        ▼
Create Company
        │
        ▼
Company Created Successfully
Validation
Company Name required.
Business Type required.
Business Email required.
Business Phone required.
Address required.
City required.
State required.
Postal Code required.
At least one delivery state must be enabled.
Success
Company profile is created.
Delivery settings are saved.
Company dashboard is displayed.
Failure

Validation errors are shown and the user remains on the setup form.

Flow 3 — Update Company Information
Trigger

User edits company information.

Preconditions
Company profile exists.
Main Flow
Open Company
      │
      ▼
Modify Company Information
      │
      ▼
Validate Input
      │
      ▼
Save Changes
      │
      ▼
Update Company
      │
      ▼
Display Success
Validation

All required fields must remain valid.

Success

Updated information is displayed immediately.

Failure

Validation errors are displayed.

Flow 4 — Configure Delivery Settings ⭐ (New)
Trigger

Business Owner updates delivery coverage.

Preconditions
Company profile exists.
User is authorized.
Main Flow
Open Company
      │
      ▼
Open Delivery Settings
      │
      ▼
Enable / Disable States
      │
      ▼
Validate Configuration
      │
      ▼
Save Settings
      │
      ▼
Update Company Configuration
      │
      ▼
Display Success
Validation
At least one delivery state must remain enabled.
Duplicate states are not allowed.
Only supported system states can be selected.
Success
Delivery configuration is updated.
Orders module immediately uses the new configuration.
Failure

Display validation message and keep previous configuration.

Flow 5 — Upload Company Logo
Trigger

User selects Upload Company Logo.

Preconditions
Company exists.
User is authorized.
Main Flow
Click Upload Logo
        │
        ▼
Choose Image
        │
        ▼
Validate File
        │
        ▼
Upload Logo
        │
        ▼
Display Updated Logo
Validation
Supported image type.
Maximum file size.
Non-empty file.
Success

New logo replaces the previous logo.

Failure

Display upload error.

Flow 6 — Remove Company Logo
Trigger

User selects Remove Company Logo.

Preconditions
Company logo exists.
Main Flow
Click Remove Logo
        │
        ▼
Confirmation Dialog
        │
        ▼
Confirm
        │
        ▼
Remove Logo
        │
        ▼
Display Default Logo
Success

Default logo is displayed.

Failure

Display error message.

Flow 7 — Cancel Changes
Trigger

User selects Cancel.

Preconditions

Unsaved changes exist.

Main Flow
Edit Company
      │
      ▼
Modify Company Information
Modify Delivery Settings
      │
      ▼
Cancel
      │
      ▼
Discard Changes
      │
      ▼
Restore Original Values
Success

Original company information and delivery settings are restored.

Failure

No changes are discarded if the operation is interrupted.

Flow 8 — Validation Errors
Trigger

User submits invalid company information or delivery settings.

Validation Scenarios
Missing Company Name.
Missing Business Type.
Invalid Business Email.
Missing Business Phone.
Missing Address.
Missing City.
Missing State.
Missing Postal Code.
Invalid Logo Upload.
No delivery state selected.
Invalid delivery configuration.
Main Flow
Submit Form
      │
      ▼
Validation Failed
      │
      ▼
Display Field Errors
      │
      ▼
User Corrects Input
      │
      ▼
Submit Again
Success

Valid information and delivery settings are accepted.

Flow 9 — Session Expired
Trigger

User performs an action after session expiration.

Main Flow
User Saves Changes
        │
        ▼
Session Expired
        │
        ▼
Authentication Failed
        │
        ▼
Redirect to Login
Success

User signs in again and resumes work.

Flow 10 — Company Load Failure
Trigger

Company information cannot be loaded.

Main Flow
Open Company Page
        │
        ▼
Load Request
        │
        ▼
Server Error
        │
        ▼
Display Friendly Error
        │
        ▼
Retry
Success

Company information and delivery settings load successfully after retry.

Flow 11 — Delivery Eligibility Validation
Trigger

Customer proceeds to checkout.

Preconditions
Company profile exists.
Delivery settings are configured.
Main Flow
Customer Checkout
        │
        ▼
Enter Delivery Address
        │
        ▼
Read Company Delivery Settings
        │
        ▼
State Supported?
        │
   ┌────┴────┐
   │         │
  Yes        No
   │         │
   ▼         ▼
Create     Display
Order      Delivery Not Available
Success
Order creation continues.
Checkout proceeds normally.
Failure
Order is not created.
Customer receives a friendly message.
Customer may change the delivery address.
Complete User Journey
Login
   │
   ▼
Open Company
   │
   ▼
Company Exists?
   │
 ┌─┴─────────────┐
 │               │
No              Yes
 │               │
 ▼               ▼
Create        View Company
 │               │
 ▼               ▼
Configure Company Information
 │
 ▼
Configure Delivery Settings
 │
 ▼
Upload / Remove Logo
 │
 ▼
Save Changes
 │
 ▼
Business Configuration Updated
 │
 ▼
Available for Other Modules


Future Flows

Future versions may introduce:

Business verification.
Multiple company locations.
Company branding settings.
Business tax information.
Company ownership transfer.
Multi-company switching.
Delivery by City.
Delivery by District.
Delivery by PIN Code.
Delivery scheduling.
Delivery charges by location.

Each feature will include its own documented interaction flow.

Flow Rules

The Company module follows these interaction rules:

* Company configuration changes take effect immediately after a successful save.

Every protected action requires authentication.
Validation occurs before saving.
Only authorized users can modify company information.
Required fields must always be completed.
Company logo changes require validation.
At least one delivery state must remain enabled.
Delivery settings are managed only within the Company module.
The Orders module reads delivery settings but cannot modify them.
Users receive immediate success or error feedback.
Unsaved changes can be cancelled safely.
Mobile and desktop follow the same business flow.
Approval

This document defines the official interaction flows for the Company module.

All implementation, testing, and future enhancements must follow these flows unless superseded by a newer approved version.

The Company module follows the FreshFlow Mobile-First, Desktop-Complete interaction philosophy and acts as the central source of truth for business information and business configuration.

Version History
Version 1.1

Updated Company interaction flows.

New Flows
Configure Delivery Settings.
Orders using Company Delivery Settings.
Flow Improvements
Company onboarding now includes delivery configuration.
Delivery settings are validated during company creation and updates.
Orders consume delivery settings without modifying them.
Centralized business configuration established within the Company module.
Architecture prepared for future city-, district-, and PIN code-level delivery coverage.
