# Authentication

**Version:** 1.0

**Status:** Approved Design

**Page:** Authentication

---

# Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🌿 FreshFlow                                            Wholesale Marketplace                               Back to Marketplace │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘


                               ┌──────────────────────────────────────────────────────────────┐
                               │                                                              │
                               │                  Welcome to FreshFlow                        │
                               │                                                              │
                               │      Secure access to your wholesale marketplace.            │
                               │                                                              │
                               ├──────────────────────────────────────────────────────────────┤
                               │                                                              │
                               │ [ Mobile Login ] [ Email Login ] [ OTP Login ] [ Register ] │
                               │                                                              │
                               ├──────────────────────────────────────────────────────────────┤
                               │                                                              │
                               │ Register                                                     │
                               │                                                              │
                               │ Registration Method                                          │
                               │                                                              │
                               │ (●) Mobile Number                                            │
                               │ ( ) Email Address                                            │
                               │                                                              │
                               │──────────────────────────────────────────────────────────────│
                               │                                                              │
                               │ Mobile Number                                                │
                               │ +91 [____________________________________]                   │
                               │                                                              │
                               │ Password                                                     │
                               │ [____________________________________] 👁                   │
                               │                                                              │
                               │ Confirm Password                                             │
                               │ [____________________________________] 👁                   │
                               │                                                              │
                               │ ☑ I agree to the Terms & Conditions                          │
                               │                                                              │
                               │ [ Validation / Error Message ]                               │
                               │                                                              │
                               │             [ Create Account ]                               │
                               │                                                              │
                               │ Already have an account?  Sign In                            │
                               │                                                              │
                               └──────────────────────────────────────────────────────────────┘


                                      Terms • Privacy • Help • Contact
```

---

# Tablet Layout

```text
┌──────────────────────────────────────────────────────────────────────┐
│ 🌿 FreshFlow                              Back to Marketplace        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Welcome to FreshFlow                                                 │
│                                                                      │
│ [ Mobile ] [ Email ] [ OTP ] [ Register ]                            │
│                                                                      │
│ Registration Method                                                  │
│ (●) Mobile                                                           │
│ ( ) Email                                                            │
│                                                                      │
│ Mobile Number                                                        │
│ +91 [_____________________________]                                  │
│                                                                      │
│ Password                                                             │
│ [_____________________________] 👁                                  │
│                                                                      │
│ Confirm Password                                                     │
│ [_____________________________] 👁                                  │
│                                                                      │
│ ☑ Terms & Conditions                                                 │
│                                                                      │
│ [ Validation Message ]                                               │
│                                                                      │
│        [ Create Account ]                                            │
│                                                                      │
│ Already have an account? Sign In                                    │
├──────────────────────────────────────────────────────────────────────┤
│ Terms • Privacy • Help                                               │
└──────────────────────────────────────────────────────────────────────┘
```

---

# Mobile Layout

```text
┌──────────────────────────────┐
│ 🌿 FreshFlow      ← Back      │
├──────────────────────────────┤
│ Welcome to FreshFlow         │
│                              │
│ [ Mobile ]                   │
│ [ Email ]                    │
│ [ OTP ]                      │
│ [ Register ]                 │
├──────────────────────────────┤
│ Registration Method          │
│                              │
│ (●) Mobile                   │
│ ( ) Email                    │
│                              │
│ +91 [________________]        │
│                              │
│ Password                     │
│ [________________] 👁         │
│                              │
│ Confirm Password             │
│ [________________] 👁         │
│                              │
│ ☑ Terms & Conditions         │
│                              │
│ Validation Message           │
│                              │
│ [ Create Account ]           │
│                              │
│ Already have an account?     │
│ Sign In                      │
├──────────────────────────────┤
│ Terms • Privacy • Help       │
└──────────────────────────────┘
```

---

# Alternate Authentication Views

The same page layout is reused for:

## Email Login

```text
Email Address
[____________________________]

Password
[____________________________] 👁

[ Sign In ]
```

---

## Mobile Login

```text
Mobile Number
+91 [_______________________]

Password
[_______________________] 👁

[ Sign In ]
```

---

## Mobile OTP Login

```text
Mobile Number
+91 [_______________________]

[ Send OTP ]

OTP
[______]

[ Verify & Sign In ]
```

---

# Layout Principles

* Single authentication card for all authentication methods.
* Switching between Mobile, Email, OTP, and Register does not change the page layout.
* Authentication remains the primary focus with minimal distractions.
* Password fields include visibility toggle.
* Validation messages appear without shifting the layout.
* The page provides an easy path back to the Home Marketplace.
* Responsive behaviour remains consistent across desktop, tablet, and mobile devices.
* Footer links remain available without distracting from the authentication workflow.
