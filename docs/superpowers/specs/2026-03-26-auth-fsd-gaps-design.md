# Auth FSD Gaps — Design Spec

**Date**: 2026-03-26
**Scope**: Add Sign Up and Password Reset coverage to Customer Web FSD
**Approach**: Extend existing FSD §3 (Authentication) with new subsections

---

## Background

The UIUX Customer Web spec defines auth pages (Sign Up, Password Reset, ID Recovery) that have no corresponding FSD sections. The docs review identified these as scope gaps that need resolution before implementation.

After analysis:
- **Sign Up** — FSD has registration constraints (F-AUTH-04) but no page route, form flow, or success modal
- **Password Reset** — Not in FSD at all; UIUX defines the reset form (derived from Figma)
- **ID Recovery** — Deferred (requires phone/SMS as alternative identifier, not in MVP)

---

## Changes to Customer Web FSD (EN + KO)

### 1. Update §2 Page List

Add 3 new rows to the page list table:

| # | Page | Route | Auth | Description |
|---|---|---|---|---|
| 11 | Sign Up | `/[locale]/auth/signup` | Guest Only | Email registration with consent |
| 12 | Forgot Password | `/[locale]/auth/forgot-password` | Guest Only | Password reset request (email input) |
| 13 | Reset Password | `/[locale]/auth/reset-password` | Guest Only | Set new password (token-based) |

### 2. Add §3.5 Sign Up (`/[locale]/auth/signup`)

**PRD Reference**: §3.3 Customer, §11.5 Security

**Feature List:**

| # | Feature | Description |
|---|---|---|
| F-AUTH-10 | Email Registration Form | Form with email, password, password confirm, display name fields |
| F-AUTH-11 | Consent Agreement | "Select All" checkbox + individual required checkboxes for Terms of Service and Privacy Policy. Both must be checked to submit. |
| F-AUTH-12 | Client-Side Validation | Real-time field validation: email format, password min 6 chars, password match, display name 2-20 chars |
| F-AUTH-13 | Server-Side Validation | Duplicate email/display name checks per existing F-AUTH-04 constraints |
| F-AUTH-14 | Sign Up Success Modal | On successful registration: celebration modal with personalized greeting, CTAs to homepage and nearby search |
| F-AUTH-15 | Post-Signup Auto-Login | User is automatically logged in after successful registration (session created immediately) |

**Input Fields:**

| Field | Required | Constraints | Validation |
|---|---|---|---|
| Email | Yes | Valid email format, unique | Real-time format check + server uniqueness on submit |
| Password | Yes | Min 6 characters | Real-time length check |
| Password Confirm | Yes | Must match Password | Real-time match check |
| Display Name | Yes | 2-20 characters, unique | Real-time length check + server uniqueness on submit |

**Consent Checkboxes:**

| Checkbox | Required | Action |
|---|---|---|
| Select All | No | Toggles all individual checkboxes |
| Terms of Service | Yes | Expandable link to terms content |
| Privacy Policy | Yes | Expandable link to privacy content |

**Server Validation Errors** (extends §3.1 table):

| Condition | Error (KO) | Error (EN) |
|---|---|---|
| Email already registered | 이미 등록된 이메일입니다 | This email is already registered |
| Display name taken | 이미 사용 중인 닉네임입니다 | This display name is already taken |
| Password too short | 비밀번호는 최소 6자 이상이어야 합니다 | Password must be at least 6 characters |

**Success Modal CTAs:**

| Button | Action |
|---|---|
| Go to Homepage | Navigate to `/[locale]` |
| View Nearby Shops | Navigate to `/[locale]/nearby` |

**Storyboard:**

```
[1] User navigates to /[locale]/auth/signup. If already logged in → redirect to homepage.
[2] User fills in email, password, password confirm, display name.
[3] User checks required consent checkboxes (Terms of Service, Privacy Policy).
[4] User clicks "Sign Up". Client-side validation runs first.
[5] On validation pass → submit to server. Server checks email/display name uniqueness.
[6a] Success → auto-login → show success modal with greeting and CTAs.
[6b] Server error → display inline error message under the relevant field.
[7] User dismisses modal or clicks a CTA → navigate to chosen page.
```

### 3. Add §3.6 Password Reset

**PRD Reference**: §3.3 Customer, §11.5 Security

#### 3.6.1 Forgot Password (`/[locale]/auth/forgot-password`)

| # | Feature | Description |
|---|---|---|
| F-AUTH-16 | Password Reset Request | User submits email address to receive a reset link |
| F-AUTH-17 | Email Delivery | System sends email with tokenized reset link. Token expires after 1 hour, single-use. |
| F-AUTH-18 | Confirmation Message | After submit: generic success message shown regardless of whether email exists (prevents user enumeration) |

**Input Fields:**

| Field | Required | Constraints |
|---|---|---|
| Email | Yes | Valid email format |

**Server Behavior:**
- If email exists: send password reset email with tokenized link
- If email does not exist: show same success message (no indication of whether account exists)
- Rate limit: max 3 reset requests per email per hour

**Success Message:**

| KO | EN |
|---|---|
| 비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요. | A password reset link has been sent to your email. Please check your inbox. |

#### 3.6.2 Reset Password (`/[locale]/auth/reset-password?token=XXX`)

| # | Feature | Description |
|---|---|---|
| F-AUTH-19 | Token Validation | On page load, validate the token. If invalid/expired → error message + link to forgot-password |
| F-AUTH-20 | New Password Form | Two fields: new password + confirm. Validation: min 6 chars, must match. |
| F-AUTH-21 | Reset Success | On success: confirmation message + redirect to login page |

**Input Fields:**

| Field | Required | Constraints | Validation |
|---|---|---|---|
| New Password | Yes | Min 6 characters | Real-time length check |
| Password Confirm | Yes | Must match New Password | Real-time match check |

**Server Validation Errors:**

| Condition | Error (KO) | Error (EN) |
|---|---|---|
| Token invalid/expired | 링크가 만료되었거나 유효하지 않습니다. 다시 요청해주세요. | This link has expired or is invalid. Please request a new one. |
| Password too short | 비밀번호는 최소 6자 이상이어야 합니다 | Password must be at least 6 characters |
| Passwords don't match | 비밀번호가 일치하지 않습니다 | Passwords do not match |

**Storyboard:**

```
[1] User clicks "비밀번호 찾기" on login page → navigates to /[locale]/auth/forgot-password. (Note: login page link text changes from "아이디/비밀번호 찾기" to "비밀번호 찾기" since ID Recovery is deferred.)
[2] User enters email → clicks submit.
[3] System sends reset email (if account exists). Shows generic confirmation message.
[4] User clicks link in email → /[locale]/auth/reset-password?token=XXX.
[5] Page validates token on load.
[5a] Token valid → show new password form.
[5b] Token invalid/expired → error message + "Request new link" button → back to forgot-password.
[6] User enters new password + confirm → submit.
[7a] Success → confirmation message → redirect to login.
[7b] Validation error → inline error messages.
```

### 4. Update Access Control Table (§2)

Add to the Access Control table:

| User State | Sign Up / Forgot Password / Reset Password |
|---|---|
| Not logged in | Accessible |
| Logged in | Redirect to homepage |

### 5. Deferred Items

The following auth features are acknowledged in the UIUX spec but deferred from MVP:

| Feature | Reason | Depends On |
|---|---|---|
| ID Recovery (find email by display name) | No reliable alternative identifier without phone number | Phone/SMS verification |
| Phone/SMS Verification | Not in PRD MVP scope | SMS service integration |
| Welcome Coupon (3,000 KRW on signup) | Coupon system not in PRD MVP scope | Coupon content type + admin management |
| Stronger Password Rules (8+ chars, alphanumeric + special) | Current FSD/PRD specifies min 6 chars only | PRD update to strengthen requirements |

---

## Files to Modify

| File | Changes |
|---|---|
| `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` | Add §3.5, §3.6, update §2 page list + access control, add deferred items note |
| `docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md` | Mirror all changes in Korean |

---

## Out of Scope (This Spec)

- Board System (UIUX §7) — separate spec needed
- Community (UIUX §8) — separate spec needed
- Events & Notices (UIUX §9) — separate spec needed
- Email service provider selection — TSD concern
- Terms of Service / Privacy Policy content — legal/business concern
