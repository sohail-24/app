# Authentication

**Version:** 1.0

**Status:** Approved Design

**Page:** Authentication

---

# Overview

This document describes how users interact with the Authentication page.

The Authentication page provides a secure entry point into FreshFlow by allowing users to register, sign in, and verify their identity using supported authentication methods.

The page is designed to minimise onboarding friction while maintaining a consistent and secure user experience.

---

# User Entry Flow

Users may arrive at the Authentication page from:

* Clicking **Login** from the Home Marketplace.
* Clicking **Register** from the Home Marketplace.
* Attempting a protected action (such as Add to Cart).
* Accessing a protected page without authentication.
* Session expiration requiring re-authentication.

Once loaded, users can choose their preferred authentication method.

---

# Navigation Flow

```text
Open Authentication
         │
         ▼
Choose Authentication Method
         │
 ┌───────┼────────┬─────────┐
 ▼       ▼        ▼         ▼
Mobile  Email     OTP   Register
Login   Login    Login
         │
         ▼
Authenticate User
         │
         ▼
Successful Login
         │
         ▼
Redirect to Destination
```

---

# Registration Flow

```text
Open Register
       │
       ▼
Choose Registration Method
       │
 ┌─────┴─────┐
 ▼           ▼
Mobile     Email
       │
       ▼
Enter Details
       │
       ▼
Confirm Password
       │
       ▼
Accept Terms
       │
       ▼
Create Account
       │
       ▼
Authentication Complete
       │
       ▼
Redirect
```

New users complete registration using either their mobile number or email address.

---

# Email Login Flow

```text
Open Email Login
         │
         ▼
Enter Email
         │
         ▼
Enter Password
         │
         ▼
Sign In
         │
         ▼
Authentication Successful
         │
         ▼
Redirect
```

---

# Mobile Login Flow

```text
Open Mobile Login
          │
          ▼
Enter Mobile Number
          │
          ▼
Enter Password
          │
          ▼
Sign In
          │
          ▼
Authentication Successful
          │
          ▼
Redirect
```

---

# Mobile OTP Flow

```text
Open OTP Login
        │
        ▼
Enter Mobile Number
        │
        ▼
Request OTP
        │
        ▼
Receive OTP
        │
        ▼
Enter OTP
        │
        ▼
Verify OTP
        │
        ▼
Authentication Successful
        │
        ▼
Redirect
```

---

# Protected Action Flow

When a guest attempts a protected action:

```text
Guest Action
      │
      ▼
Authentication Required
      │
      ▼
Authentication Page
      │
      ▼
Successful Login
      │
      ▼
Return to Original Action
```

Examples include:

* Add to Cart
* Checkout
* Buyer Dashboard
* Business Owner Dashboard

---

# Authentication Success Flow

```text
Authentication Successful
           │
           ▼
Determine User Role
           │
   ┌───────┴────────┐
   ▼                ▼
Buyer        Business Owner
   │                │
   ▼                ▼
Buyer          Owner
Dashboard      Dashboard
```

If authentication was initiated from another page, the user should return to that page instead of the default dashboard whenever appropriate.

---

# Validation Flow

```text
Submit Form
      │
      ▼
Validate Input
      │
 ┌────┴────┐
 ▼         ▼
Valid    Invalid
 │         │
 ▼         ▼
Continue Display Validation
          Messages
```

Validation occurs before authentication is attempted.

---

# Error Flow

## Invalid Credentials

```text
Submit Login
      │
      ▼
Authentication Failed
      │
      ▼
Display Error
      │
      ▼
Allow Retry
```

---

## Invalid OTP

```text
Enter OTP
      │
      ▼
OTP Invalid
      │
      ▼
Display Error
      │
      ▼
Retry Verification
```

---

## Registration Error

```text
Submit Registration
        │
        ▼
Validation Failed
        │
        ▼
Display Errors
        │
        ▼
Correct Information
```

---

# Responsive Behaviour Flow

## Desktop

* Authentication card centred on the page.
* Comfortable spacing.
* Full-width form controls.

---

## Tablet

* Responsive authentication card.
* Touch-friendly inputs.
* Consistent navigation tabs.

---

## Mobile

* Single-column layout.
* Large touch targets.
* Optimised keyboard behaviour.
* Scroll-friendly authentication form.

The authentication process remains identical across all supported devices.

---

# Exit Points

Users may leave the Authentication page by:

* Returning to the Home Marketplace.
* Completing registration.
* Signing in successfully.
* Navigating back before submitting the form.

---

# Flow Summary

```text
Open Authentication
        │
        ▼
Choose Method
        │
 ┌──────┼────────┬─────────┐
 ▼      ▼        ▼         ▼
Email Mobile    OTP   Register
Login  Login    Login
        │
        ▼
Complete Authentication
        │
        ▼
Authentication Successful
        │
        ▼
Determine Destination
        │
 ┌──────┴───────────────┐
 ▼                      ▼
Return to Requested   Default
Page                  Dashboard
```

---

# Design Principles

The authentication flow is designed to:

* Keep onboarding simple.
* Support multiple authentication methods.
* Minimise unnecessary navigation.
* Preserve the user's previous workflow after authentication.
* Provide consistent behaviour across all devices.
* Allow future authentication methods without redesigning the user journey.

---

# Version History

## Version 1.0

Initial Authentication page flow documentation.

Focus areas:

* Multiple authentication methods.
* Simple registration.
* Secure login experience.
* Protected action handling.
* Role-aware redirection.
