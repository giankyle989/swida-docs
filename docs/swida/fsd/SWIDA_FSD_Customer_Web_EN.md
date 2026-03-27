---
title: "SWIDA — Customer Web FSD"
sidebar_label: "Customer Web FSD (EN)"
sidebar_position: 1
---

# Functional Specification Document (FSD)

## SWIDA — Customer Web

- **Version**: 1.0
- **Date**: 2026-03-26
- **Based on**: SWIDA PRD v1.1, SWIDA TSD v1.1
- **Scope**: MVP — Customer-facing shop discovery web application
- **Related Documents**: UI/UX Specification (to be created separately)

---

## 1. Document Overview

### 1.1 Purpose

This document defines the page list and functional specifications for the SWIDA Customer Web application. It covers what each page does, what data it displays, and how users interact with it. Visual design, layout, and interaction details are covered in the separate UI/UX Specification.

### 1.2 MVP Scope

| Included | Not Included (Future) |
|---|---|
| Homepage (featured shops/themes) | Map View (visual map with pins) |
| Detail Search (advanced multi-filter) | Booking Integration |
| Theme Search (browse by service type) | Push Notifications |
| Location Search (browse by region/district) | Coupon / Deals System |
| Nearby Search (GPS-based discovery) | Chat / Messaging |
| Shop Detail Page (full profile + reviews) | 초성 Search (consonant-based) |
| Review Feed + Review Submission | Advanced Fuzzy Search |
| Partnership Page + Inquiry Form | Shop Owner Portal |
| Customer Authentication (Email, Kakao, Naver) | Analytics for Shops |
| Multi-language (Korean / English) | SMS Verification for Reviews |
| Review Reporting | |
| My Page (profile, reviews, bookmarks) | |
| Bookmarks / Favorites | |
| Board System (shop recommendations, info posts) | Board: user-created posts |
| Board comments with nested replies | Board: keyword search |
| Community posts with photos/video | Community: post editing/deletion |
| Community user levels & points | Community: reporting posts |
| Community feed filters | Community: points redemption |
| Events & Notices hub + detail pages | Events: registration/signup |
| Event D-day countdown + category filtering | Events: coupon issuance |
| Notices with prev/next navigation | Events: push notifications |

### 1.3 Global Rules

| Item | Rule |
|---|---|
| Currency | KRW (₩). Prices displayed as integers with comma separator (e.g., ₩50,000) |
| Date/Time | KST (Korea Standard Time, UTC+9). Format: `YYYY.MM.DD` for dates, `HH:mm` for times |
| Timezone | Open/Close tag determination uses Korea Standard Time (Asia/Seoul) |
| Locale Routing | Path-based: `/ko/...` (default), `/en/...`. Root `/` redirects to `/ko` |
| Pagination | Page-based (not infinite scroll) for SEO. Each page has a unique URL |
| Filter State | All active filters persisted in URL query parameters (shareable, bookmarkable) |
| Responsive | Mobile-first design with three tiers: Mobile, Tablet, Desktop |
| Authentication | Optional for browsing. Required only for review submission and review reporting |
| Empty States | Friendly message with suggestion to broaden filters or try a different search mode |
| Loading States | Skeleton placeholders for all data-fetching states (defined in UI/UX Spec) |
| Error Handling | Toast notifications for API errors. Retry option for network failures |
| Input Sanitization | All user-submitted free-text fields (review comments, partnership messages, display names, search queries) are sanitized server-side before storage. HTML tags are stripped. Output is escaped on render to prevent XSS. Client-side sanitization is advisory only — never trust client input. |
| Submit Protection | All form submit buttons enter a disabled + loading state on first click until the server responds. This prevents double-submit on all write operations (sign up, review, partnership inquiry, password reset request, login). Server-side deduplication is the backstop — client-side disable is UX only. |

---

## 2. Page List

| # | Page | Route | Auth | Description |
|---|---|---|---|---|
| 1 | Homepage | `/[locale]` | Public | Featured shops, theme cards, quick access |
| 2 | Detail Search | `/[locale]/search` | Public | Advanced multi-filter search |
| 3 | Theme Browse | `/[locale]/theme/[theme-slug]` | Public | Shops filtered by service theme |
| 4 | Location Browse | `/[locale]/location/[level1]/[level2]` | Public | Shops filtered by region/district |
| 5 | Nearby Search | `/[locale]/nearby` | Public | GPS-based shop discovery |
| 6 | Shop Detail | `/[locale]/shop/[slug]` | Public | Full shop profile + reviews |
| 7 | Review Feed | `/[locale]/reviews` | Public | Latest reviews across all shops |
| 8 | Partnership | `/[locale]/partnership` | Public | Shop owner onboarding landing page |
| 9 | Login | `/[locale]/auth/login` | Guest Only | Email + social login (Kakao, Naver) |
| 10 | OAuth Callback | `/[locale]/auth/callback` | Guest Only | Social login callback handler |
| 11 | Sign Up | `/[locale]/auth/signup` | Guest Only | Email registration with consent |
| 12 | Forgot Password | `/[locale]/auth/forgot-password` | Guest Only | Password reset request (email input) |
| 13 | Reset Password | `/[locale]/auth/reset-password` | Guest Only | Set new password (token-based) |
| 14 | My Page | `/[locale]/mypage` | Required | User dashboard with profile + tabbed content |
| 15 | Edit Profile | `/[locale]/mypage/edit` | Required | Profile photo change |
| 16 | Shop Recommendation Board | `/[locale]/board/recommendation` | Public | Editorial shop recommendation posts |
| 17 | Massage Info Board | `/[locale]/board/info` | Public | Forum-style info articles |
| 18 | Board Post Detail | `/[locale]/board/[type]/[id]` | Public | Individual board post with comments |
| 19 | Community Feed | `/[locale]/community` | Public | Social feed with user-generated posts |
| 20 | Community Post Detail | `/[locale]/community/[id]` | Public | Individual community post |
| 21 | Events & Notices Hub | `/[locale]/events` | Public | Combined notices + events landing |
| 22 | All Ongoing Events | `/[locale]/events/ongoing` | Public | Filterable event grid |
| 23 | Event Detail | `/[locale]/events/[id]` | Public | Individual event page |
| 24 | Notice Detail | `/[locale]/events/notice/[id]` | Public | Individual notice page |

**Auth Legend**: Public = anyone can access (no login required) / Guest Only = only non-authenticated users (logged-in users redirect to homepage)

**Access Control**

| User State | Accessible Pages | Restricted Action Behavior |
|---|---|---|
| Not logged in | All public pages (browse only) | Review submission / report → redirect to login. My Page / Edit Profile → redirect to login. Community post creation / commenting → redirect to login. |
| Logged in (active) | All pages + review submission + My Page + community post creation + commenting | Login / Sign Up / Forgot Password / Reset Password → redirect to homepage |
| Logged in (locked/suspended) | All pages (browse only) + My Page (view only) | Review submission / report → error message. Community post creation / commenting → error message. |

---

## 3. Authentication

### 3.1 Login (`/[locale]/auth/login`)

> PRD Reference: §3.3 Customer, §11.5 Security

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-AUTH-01 | Email/Password Login | Standard email + password authentication (PRD §3.3) |
| F-AUTH-02 | Kakao Social Login | Login via Kakao account (PRD §3.3) |
| F-AUTH-03 | Naver Social Login | Login via Naver account (PRD §3.3) |
| F-AUTH-04 | Email Registration | New account creation with email, password, and display name |
| F-AUTH-05 | Post-Login Redirect | After successful login, redirect to the page the user was on before login |
| F-AUTH-06 | Locked Account Handling | If account is locked/suspended, display error message and prevent login to review features |

**Registration Input Constraints**

| Field | Required | Constraints | Notes |
|---|---|---|---|
| Email | Yes | Valid email format, unique | — |
| Password | Yes | Minimum 6 characters | — |
| Display Name | Yes | 2–20 characters, unique | Shown on reviews |

**Server Validation Errors**

| Condition | Error |
|---|---|
| Invalid email/password | "이메일 또는 비밀번호가 올바르지 않습니다" / "Invalid email or password" |
| Email already registered | "이미 등록된 이메일입니다" / "This email is already registered" |
| Display name taken | "이미 사용 중인 닉네임입니다" / "This display name is already taken" |
| Account suspended | "계정이 정지되었습니다. 관리자에게 문의해주세요." / "Your account has been suspended. Please contact the administrator." |

### 3.2 OAuth Callback (`/[locale]/auth/callback`)

| # | Feature | Description |
|---|---|---|
| F-AUTH-07 | Token Exchange | Complete social login and establish user session |
| F-AUTH-08 | Auto-Registration | First-time social login users are automatically registered |
| F-AUTH-09 | Error Handling | Display error message and redirect to login if OAuth flow fails. Error message varies by failure type (see below). Pre-login redirect target is preserved in session storage so the user can retry without losing their place. |

**OAuth Error Messages**

| Failure Type | Error Message |
|---|---|
| Provider unreachable | "소셜 로그인 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요." / "Unable to connect to the social login service. Please try again later." |
| Token exchange failed | "로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요." / "An error occurred during login. Please try again." |
| Account conflict (email exists with different provider) | "이미 다른 방법으로 가입된 이메일입니다." / "This email is already registered with a different login method." |

**Recovery:** On any OAuth failure, redirect to login page with a `?error=oauth_failed` query parameter. The login page displays the appropriate error message and preserves the original return URL for retry.

### 3.3 Session Management

> PRD Reference: §11.5 Security, TSD §5.4.1

| # | Feature | Description |
|---|---|---|
| F-SESSION-01 | Session Storage | Login session is stored securely in the browser |
| F-SESSION-02 | Session Lifetime | Login session persists for 7 days (TSD §5.4.1) |
| F-SESSION-03 | Logout | End session, reset state, redirect to homepage |
| F-SESSION-04 | Session Expiry | On session expiry, redirect to login if attempting a protected action |

### 3.4 Logout

| # | Feature | Description |
|---|---|---|
| F-LOGOUT-01 | Session Clear | End login session and clear user state |
| F-LOGOUT-02 | Redirect | Navigate to homepage after logout |

### 3.5 Sign Up (`/[locale]/auth/signup`)

> PRD Reference: §3.3 Customer, §11.5 Security

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-AUTH-10 | Email Registration Form | Form with email, password, password confirm, display name fields |
| F-AUTH-11 | Consent Agreement | "Select All" checkbox + individual required checkboxes for Terms of Service and Privacy Policy. Both must be checked to submit. |
| F-AUTH-12 | Client-Side Validation | Real-time field validation: email format, password min 6 chars, password match, display name 2–20 chars |
| F-AUTH-13 | Server-Side Validation | Duplicate email/display name checks per existing F-AUTH-04 constraints |
| F-AUTH-14 | Sign Up Success Modal | On successful registration: celebration modal with personalized greeting, CTAs to homepage and nearby search |
| F-AUTH-15 | Post-Signup Auto-Login | User is automatically logged in after successful registration (session created immediately) |

**Input Fields**

| Field | Required | Constraints | Validation |
|---|---|---|---|
| Email | Yes | Valid email format, unique | Real-time format check + server uniqueness on submit |
| Password | Yes | Min 6 characters | Real-time length check |
| Password Confirm | Yes | Must match Password | Real-time match check |
| Display Name | Yes | 2–20 characters, unique | Real-time length check + server uniqueness on submit |

**Consent Checkboxes**

| Checkbox | Required | Action |
|---|---|---|
| Select All | No | Toggles all individual checkboxes |
| Terms of Service | Yes | Expandable link to terms content |
| Privacy Policy | Yes | Expandable link to privacy content |

**Server Validation Errors** (extends §3.1 table)

| Condition | Error |
|---|---|
| Email already registered | "이미 등록된 이메일입니다" / "This email is already registered" |
| Display name taken | "이미 사용 중인 닉네임입니다" / "This display name is already taken" |
| Password too short | "비밀번호는 최소 6자 이상이어야 합니다" / "Password must be at least 6 characters" |

**Success Modal CTAs**

| Button | Action |
|---|---|
| Go to Homepage | Navigate to `/[locale]` |
| View Nearby Shops | Navigate to `/[locale]/nearby` |

**Storyboard: Sign Up**

```
[1] User navigates to /[locale]/auth/signup. If already logged in → redirect to homepage.
[2] User fills in email, password, password confirm, display name.
[3] User checks required consent checkboxes (Terms of Service, Privacy Policy).
[4] User clicks "Sign Up". Client-side validation runs first.
[5] On validation pass → submit to server. Server checks email/display name uniqueness.
[6a] Success → auto-login → show success modal with greeting and CTAs.
[6b] Server error → display inline error message under the relevant field.
[6c] Registration succeeds but auto-login fails → show success modal with message "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다." / "Registration complete. Redirecting to login." CTA: "Go to Login" instead of homepage/nearby CTAs.
[7] User dismisses modal or clicks a CTA → navigate to chosen page.
```

### 3.6 Password Reset

> PRD Reference: §3.3 Customer, §11.5 Security

#### 3.6.1 Forgot Password (`/[locale]/auth/forgot-password`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-AUTH-16 | Password Reset Request | User submits email address to receive a reset link |
| F-AUTH-17 | Email Delivery | System sends email with tokenized reset link. Token expires after 1 hour, single-use. |
| F-AUTH-18 | Confirmation Message | After submit: generic success message shown regardless of whether email exists (prevents user enumeration) |

**Input Fields**

| Field | Required | Constraints |
|---|---|---|
| Email | Yes | Valid email format |

**Server Behavior**

- If email exists: send password reset email with tokenized link
- If email does not exist: show same success message (no indication of whether account exists)
- If email delivery fails (SMTP error): log the failure server-side with email, timestamp, and error details. User still sees the generic success message (no indication of delivery failure to prevent enumeration). Admin dashboard or monitoring should surface delivery failures.
- Rate limit: max 3 reset requests per email per hour

**Confirmation Message**

| Condition | Message |
|---|---|
| Submit (always) | "비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요." / "A password reset link has been sent to your email. Please check your inbox." |

#### 3.6.2 Reset Password (`/[locale]/auth/reset-password?token=XXX`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-AUTH-19 | Token Validation | On page load, validate the token. If invalid/expired → error message + link to forgot-password |
| F-AUTH-20 | New Password Form | Two fields: new password + confirm. Validation: min 6 chars, must match. |
| F-AUTH-21 | Reset Success | On success: confirmation message + redirect to login page |

**Input Fields**

| Field | Required | Constraints | Validation |
|---|---|---|---|
| New Password | Yes | Min 6 characters | Real-time length check |
| Password Confirm | Yes | Must match New Password | Real-time match check |

**Server Validation Errors**

| Condition | Error |
|---|---|
| Token invalid/expired | "링크가 만료되었거나 유효하지 않습니다. 다시 요청해주세요." / "This link has expired or is invalid. Please request a new one." |
| Password too short | "비밀번호는 최소 6자 이상이어야 합니다" / "Password must be at least 6 characters" |
| Passwords don't match | "비밀번호가 일치하지 않습니다" / "Passwords do not match" |

**Storyboard: Password Reset**

```
[1] User clicks "비밀번호 찾기" on login page → navigates to /[locale]/auth/forgot-password.
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

---

## 4. Homepage

### 4.1 Homepage (`/[locale]`)

> PRD Reference: §6 Search & Filtering, §7.1 Customer-Facing Menus, §9 Service Themes

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-HOME-01 | Theme Cards | Display all available service themes as selectable cards/tags. Clicking a theme navigates to the theme browse page. Sorted by `display_order`. (PRD §9) |
| F-HOME-02 | Featured Shops | Display a curated selection of top-rated or recently added shops. Shop cards show: thumbnail, name, district, themes, average rating, review count |
| F-HOME-03 | Search Quick Access | Prominent entry points to all five search modes (Detail, Theme, Location, Nearby, Name) via navigation |
| F-HOME-04 | Navigation Menu | Bottom navigation (mobile) / top navigation bar (desktop) with all customer-facing menu items (PRD §7.1) |

**Data Sources**

The homepage fetches the list of service themes (sorted by display order) and a selection of featured shops (sorted by highest rating).

> See TSD §5.2.1 for API details.

---

## 5. Search — Detail Search

### 5.1 Detail Search (`/[locale]/search`)

> PRD Reference: §6.1 Detail Search (Advanced), §6.6 Search UX Rules

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-SEARCH-01 | Shop Name Filter | Keyword/partial match input. Case-insensitive Korean character matching (PRD §6.1) |
| F-SEARCH-02 | Location Filter | Cascading dropdowns — Level 2 (district) dropdown starts empty and disabled until Level 1 (region) is selected. "All" option available at both levels. (PRD §6.1) |
| F-SEARCH-03 | Theme Filter | Multi-select from all available themes (PRD §6.1) |
| F-SEARCH-04 | Amenity Filter | Toggle checkboxes for amenities: parking, shower, sleeping, private room, WiFi, accessibility (PRD §6.1) |
| F-SEARCH-05 | Booking Filter | Yes / No / Any toggle for booking requirement (PRD §6.1) |
| F-SEARCH-06 | Filter Logic | All filters combined with AND logic. Only shops matching all selected criteria are returned. Empty filters are ignored (PRD §6.1) |
| F-SEARCH-07 | Sort Options | Rating (desc, default), Review count (desc), Newest listed (desc) (PRD §6.6) |
| F-SEARCH-08 | Result Count | Displayed at top of results (e.g., "검색 결과 42개") (PRD §6.6) |
| F-SEARCH-09 | Pagination | Page-based with unique URL per page. SEO-friendly crawlable URLs (PRD §6.6) |
| F-SEARCH-10 | URL State | All active filters serialized to URL query parameters. Shareable, bookmarkable, back-nav safe (PRD §6.6) |
| F-SEARCH-11 | Zero Results | Friendly message: "검색 결과가 없습니다" / "No results found" with suggestion to broaden filters (PRD §6.6) |

**Shop Card Display Fields** (applies to all search result lists)

| Field | Notes |
|---|---|
| Thumbnail | Primary display image |
| Shop Name | Localized |
| District | Level 2 location, localized |
| Themes | Top themes as tags, localized |
| Average Rating | Displayed as star rating (e.g., ★ 4.5) |
| Review Count | Displayed as count (e.g., "리뷰 23개") |
| Open/Close Tag | The system determines open/closed status based on the shop's operating hours and the current time in Korea (KST) |

**Data Source**

Fetches shops matching all active filters (name, location, themes, amenities, booking requirement), with pagination and the selected sort order. Returns shop card data including thumbnail, name, district, themes, rating, and operating hours.

> See TSD §5.2.1 for API details.

---

## 6. Search — Theme Browse

### 6.1 Theme Browse

> PRD Reference: §6.2 Theme Search, §9 Service Themes

| # | Feature | Description |
|---|---|---|
| F-THEME-01 | Theme Header | Display selected theme name, icon, and description at top of page |
| F-THEME-02 | Shop List | All shops tagged with the selected theme, default sorted by rating (desc) (PRD §6.2) |
| F-THEME-03 | Optional Location Filter | Customer can narrow results by Level 1 + Level 2 location after selecting a theme (PRD §6.2) |
| F-THEME-04 | Sort Options | Rating (desc, default), Review count (desc), Newest listed (desc) |
| F-THEME-05 | Pagination | Page-based with unique URL |
| F-THEME-06 | Result Count | Total shop count for this theme |

**Data Source**

Fetches all shops tagged with the selected theme, with pagination and sort options. Returns shop card data.

> See TSD §5.2.1 for API details.

---

## 7. Search — Location Browse

### 7.1 Location Browse (`/[locale]/location/[level1]/[level2]`)

> PRD Reference: §6.3 Location Search, §4 Location System

| # | Feature | Description |
|---|---|---|
| F-LOC-01 | Region Selection | Level 1 region list fetched from API. Selecting a region loads Level 2 districts dynamically (PRD §6.3) |
| F-LOC-02 | District Selection | Level 2 district list filtered by selected region (PRD §6.3) |
| F-LOC-03 | Shop List | All shops in the selected district, sorted by rating (desc) (PRD §6.3) |
| F-LOC-04 | Sort Options | Rating (desc, default), Review count (desc), Newest listed (desc) |
| F-LOC-05 | Pagination | Page-based with unique URL |
| F-LOC-06 | Breadcrumb | Display navigation breadcrumb: Home > Region > District |

**Data Sources**

The page fetches: (1) all Level 1 regions, (2) Level 2 districts for the selected region, and (3) shops in the selected district sorted by rating.

> See TSD §5.2.1 for API details.

---

## 8. Search — Nearby

### 8.1 Nearby Search (`/[locale]/nearby`)

> PRD Reference: §6.4 Nearby Search

| # | Feature | Description |
|---|---|---|
| F-NEAR-01 | GPS Permission | Request browser/device location permission on first use. Display permission prompt with explanation (PRD §6.4) |
| F-NEAR-02 | Permission Denied | Display friendly message explaining that location permission is needed, with instructions to enable it |
| F-NEAR-03 | Shop List | Shops sorted by distance (nearest first) within user-selected radius (min: 1km, max: 10km, default: 5km) (PRD §6.4) |
| F-NEAR-04 | Distance Display | Show distance from customer to each shop (e.g., "1.2 km") (PRD §6.4) |
| F-NEAR-05 | Optional Filters | Optionally filter nearby results by theme or amenities (PRD §6.4) |
| F-NEAR-06 | Radius Control | Allow user to adjust search radius via preset buttons: 1km, 3km, 5km (default), 10km |
| F-NEAR-07 | Loading State | Display loading indicator while GPS is resolving (timeout: 10 seconds — show error with retry button if GPS fails or times out) and API is fetching |
| F-NEAR-08 | Pagination | Page-based |

**Data Source**

Fetches shops near the user's GPS location within the selected radius. Results include the distance to each shop and are sorted nearest-first.

> See TSD §5.2.1 for API details.

---

## 9. Search — Name Search

> PRD Reference: §6.5 Name Search

Name Search is implemented as a subset of Detail Search (§5). When a user enters only a shop name keyword with no other filters, the Detail Search page functions as a Name Search.

| # | Feature | Description |
|---|---|---|
| F-NAME-01 | Keyword Input | Accepts partial or full shop name. Case-insensitive, supports Korean character matching (PRD §6.5) |
| F-NAME-02 | Results | Matching shops displayed using standard shop card layout |
| F-NAME-03 | Quick Search | Search input accessible from the global navigation header for quick name search from any page |

---

## 10. Shop Detail

### 10.1 Shop Detail Page

> PRD Reference: §5 Shop Listing Data Model, §8 Review System

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-SHOP-01 | Image Gallery | Display shop images (1–10 photos) with swipe/click navigation. Thumbnail as primary image (PRD §5.1) |
| F-SHOP-02 | Basic Information | Shop name, description, address, operating hours, last order time, closed days, holiday exceptions (PRD §5.1) |
| F-SHOP-03 | Open/Close Tag | The system determines open/closed status based on the shop's operating hours and the current time in Korea (KST). Displays "영업중" (Open) or "영업종료" (Closed) (PRD §5.6) |
| F-SHOP-04 | Location Display | Region + District name. Display address on a Kakao Map Static API image (MVP) |
| F-SHOP-05 | Service Themes | Display all tagged themes as badge/tag chips (PRD §5.2) |
| F-SHOP-06 | Service Menu | List of services with name, duration, price (formatted as ₩XX,XXX) (PRD §5.2.1) |
| F-SHOP-07 | Price Range | General price indication if available (PRD §5.2) |
| F-SHOP-08 | Booking Info | Whether booking is required. If yes, display booking URL/phone with CTA button (PRD §5.2) |
| F-SHOP-09 | Gender Availability | Display gender availability label if set (PRD §5.2) |
| F-SHOP-10 | Amenities | Display amenity icons/labels with detail text where available. Amenities: parking (with type + detail), shower, sleeping, private room, WiFi, accessibility (with detail) (PRD §5.3) |
| F-SHOP-11 | Contact Channels | Display available contact links: phone (tel: link), KakaoTalk, Instagram, website, Naver Place (PRD §5.4) |
| F-SHOP-12 | Languages Supported | Display languages spoken at the shop if available (PRD §5.5) |
| F-SHOP-13 | Average Rating | Prominently display star rating and total review count (PRD §5.6) |
| F-SHOP-14 | Review List | Display published reviews for this shop, sorted by most recent first (10 per page, "Load more" button). Each review shows: author display name, rating (stars), comment, submission date (PRD §8.3). Non-logged-in users see a "로그인하고 리뷰 작성" / "Login to write a review" CTA button in place of the review form. |
| F-SHOP-15 | Review Pagination | Page-based pagination for reviews on the shop detail page |
| F-SHOP-16 | Review Submission | Inline review form on the shop detail page (login required). See §11 for details |
| F-SHOP-17 | Review Report | Report button on each review (login required). See §11.3 for details |

**Gender Availability Display Labels**

| Korean | English |
|---|---|
| 남녀 모두 | All genders |
| 여성 전용 | Female only |
| 남성 전용 | Male only |
| 커플 가능 | Couples available |

**Data Source**

Fetches the full shop profile including images, themes, location, amenities, contact channels, and service menu.

> See TSD §5.2.1 for API details.

**SEO**

Shop detail pages include SEO metadata for search engines, including structured business information (name, address, hours, rating) and multilingual alternate links. (TSD §11.5)

---

## 11. Review System

### 11.1 Review Submission (on Shop Detail Page)

> PRD Reference: §8.2 Review Submission

| # | Feature | Description |
|---|---|---|
| F-REV-01 | Login Gate | Review form is visible only to logged-in users. Non-logged-in users see a CTA to log in (PRD §8.2) |
| F-REV-02 | Star Rating Input | 1–5 star scale, required. Interactive star selector (PRD §8.2) |
| F-REV-03 | Comment Input | Free-text, required. 10–500 characters. Display character count. Client-side validation (PRD §8.2) |
| F-REV-04 | Submit Review | On success, review appears in list and shop rating/count updates automatically (via lifecycle hook — see TSD §5.3.3). If rating recalculation fails, the review is still saved; rating updates on next successful recalculation. Display success toast |
| F-REV-05 | Locked Account | If user's account is locked, display error message and prevent submission (PRD §8.5) |
| F-REV-06 | Validation Error | Display inline error if comment is < 10 or > 500 characters |

**Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Rating | Yes | Integer, 1–5 |
| Comment | Yes | 10–500 characters |

**Data Submission**

Submits the review (rating and comment) for the specified shop. The review author is automatically determined from the logged-in user.

> See TSD §5.2.2 for API details.

**Server Validation Errors**

| Condition | Error |
|---|---|
| Account locked/suspended | "계정이 정지되었습니다. 관리자에게 문의해주세요." / "Your account has been suspended." |
| Comment too short/long | "리뷰는 10자 이상 500자 이하로 작성해주세요." / "Review must be 10–500 characters." |
| Missing rating | "별점을 선택해주세요." / "Please select a star rating." |

### 11.2 Review Feed (`/[locale]/reviews`)

> PRD Reference: §8.6 Review Feed

| # | Feature | Description |
|---|---|---|
| F-REV-07 | Latest Reviews | Display latest published reviews across all shops, sorted by most recent first (PRD §8.6) |
| F-REV-08 | Review Card | Each review shows: author display name, rating (stars), comment, submission date, linked shop name + thumbnail |
| F-REV-09 | Shop Link | Clicking the shop name/thumbnail on a review card navigates to that shop's detail page |
| F-REV-10 | Pagination | Page-based |

**Data Source**

Fetches published reviews across all shops, sorted by most recent first, with linked shop name and thumbnail.

> See TSD §5.2.2 for API details.

### 11.3 Review Reporting

> PRD Reference: §8.5 Review Integrity & Abuse Prevention

| # | Feature | Description |
|---|---|---|
| F-REV-11 | Report Button | "Report" button on each review. Login required (PRD §8.5) |
| F-REV-12 | Report Reason | Reason selection: `spam`, `fake`, `inappropriate`, `irrelevant`, `other` (PRD §8.5) |
| F-REV-13 | Report Submission | On success, display confirmation toast. Reported review enters review status for moderation (PRD §8.5) |
| F-REV-14 | Duplicate Report | If user has already reported this review, disable the report button and show "이미 신고한 리뷰입니다" / "You have already reported this review" |

**Data Submission**

Submits a report for the selected review with the chosen reason. Login required.

> See TSD §5.2.2 for API details.

---

## 12. Partnership

### 12.1 Partnership Page (`/[locale]/partnership`)

> PRD Reference: §10.1 Partnership Page Content, §10.3 Partnership Inquiry Management

| # | Feature | Description |
|---|---|---|
| F-PART-01 | Landing Content | What SWIDA is, benefits for shop owners, step-by-step listing process, contact info (email, KakaoTalk, Instagram), FAQ (PRD §10.1) |
| F-PART-02 | Inquiry Form | Embedded form for shop owners to submit a partnership inquiry (PRD §10.3.1) |
| F-PART-03 | Form Submission | No login required. Display success message on submission (PRD §10.3) |
| F-PART-04 | Duplicate Detection | Server-side: if same shop name + address already exists, flag as potential duplicate (PRD §10.3.2) |

**Inquiry Form Fields**

| Field | Required | Constraints |
|---|---|---|
| Shop Name | Yes | Text, max 255 characters |
| Contact Person | Yes | Text, max 100 characters |
| Phone Number | Yes | Numeric, max 20 characters |
| Email | No | Valid email format |
| Address | Yes | Text, max 500 characters |
| Business Type | No | Text, max 100 characters |
| Preferred Contact Channel | Yes | Select: phone, kakaotalk, instagram, email |
| Message | No | Text, max 2000 characters |

**Data Submission**

Submits the partnership inquiry form data to the server.

> See TSD §5.2.3 for API details.

**Server Validation Errors**

| Condition | Error |
|---|---|
| Missing required field | "필수 항목을 입력해주세요." / "Please fill in all required fields." |
| Invalid email format | "올바른 이메일 형식을 입력해주세요." / "Please enter a valid email address." |
| Rate limited | "잠시 후 다시 시도해주세요." / "Please try again later." |

---

## 13. Internationalization (i18n)

> PRD Reference: §11.4 Localization

| # | Feature | Description |
|---|---|---|
| F-I18N-01 | Path-Based Routing | `/ko/...` for Korean (default), `/en/...` for English. Both explicit, no unprefixed routes (PRD §11.4) |
| F-I18N-02 | Root Redirect | `www.swida.com/` redirects to `/ko` (PRD §11.4) |
| F-I18N-03 | Locale Detection | Detect preferred language from the user's browser on first visit. Default: Korean. Override to English only if the browser's primary language is English. Redirect preserves query parameters (e.g., `/?theme=massage` → `/ko/?theme=massage`) |
| F-I18N-04 | Language Switcher | Language switcher in site header/navigation. Links to equivalent page in alternate locale (PRD §11.4) |
| F-I18N-05 | UI String Translation | Content is available in both Korean and English. All static UI strings (labels, buttons, navigation, messages) are translated (PRD §11.4) |
| F-I18N-06 | Content Locale | All content (shop data, themes, locations) is served in the user's selected language (PRD §11.4) |
| F-I18N-07 | Fallback Behavior | If English content is unavailable, display Korean version with indicator: "이 내용은 아직 번역되지 않았습니다" / "This content is not yet translated" (PRD §11.4) |
| F-I18N-08 | Multilingual Links | Pages include multilingual alternate links so search engines and browsers can discover both language versions (PRD §11.4) |

---

## 14. SEO

> PRD Reference: §11.3 SEO, TSD §11

| # | Feature | Description |
|---|---|---|
| F-SEO-01 | Meta Tags | Each page has a unique title and description, localized per language (PRD §11.3) |
| F-SEO-02 | Social Sharing | Each page includes title, description, and image for social media sharing (PRD §11.3) |
| F-SEO-03 | Structured Data | Shop detail pages include SEO metadata for search engines (business name, address, hours, rating) (TSD §11.5) |
| F-SEO-04 | Sitemap | Auto-generated sitemap including all published shops, themes, and locations in both languages (PRD §11.3) |
| F-SEO-05 | Search Indexing | Search engine optimization is applied to public pages. Search results, review pages, and login pages are excluded from search engine indexing (PRD §11.3) |
| F-SEO-06 | Canonical URLs | Each page specifies its preferred URL to avoid duplicate content in search engines |

---

## 15. Global Layout & Navigation

> PRD Reference: §7.1 Customer-Facing Menus

### 15.1 Header

| # | Feature | Description |
|---|---|---|
| F-NAV-01 | Logo | SWIDA logo — links to homepage (`/[locale]`) |
| F-NAV-02 | Quick Search | Search input in header for quick name search from any page |
| F-NAV-03 | Language Switcher | Toggle between Korean and English (see §13 F-I18N-04) |
| F-NAV-04 | Auth Actions | Not logged in: "로그인" / "Login" button. Logged in: user display name + logout option |
| F-NAV-14 | My Page Link | Logged in: user dropdown includes "마이페이지" / "My Page" link to `/[locale]/mypage` |

### 15.2 Navigation Menu

| # | Feature | Description |
|---|---|---|
| F-NAV-05 | Detail Search | Link to `/[locale]/search` (PRD §7.1) |
| F-NAV-06 | Theme Search | Link to theme browse entry (show all themes) (PRD §7.1) |
| F-NAV-07 | Location Search | Link to location browse entry (show all regions) (PRD §7.1) |
| F-NAV-08 | Nearby Search | Link to `/[locale]/nearby` (PRD §7.1) |
| F-NAV-09 | Review | Link to `/[locale]/reviews` (PRD §7.1) |
| F-NAV-10 | Partnership | Link to `/[locale]/partnership` (PRD §7.1) |
| F-NAV-15 | Board | Link to `/[locale]/board/recommendation` (PRD §7.1) |
| F-NAV-16 | Community | Link to `/[locale]/community` (PRD §7.1) |
| F-NAV-17 | Events & Notices | Link to `/[locale]/events` (PRD §7.1) |

### 15.3 Footer

| # | Feature | Description |
|---|---|---|
| F-NAV-11 | Site Links | Links to major pages (search, themes, partnership) |
| F-NAV-12 | Legal Links | Privacy policy, terms of service (PRD §11.6) |
| F-NAV-13 | Contact Info | SWIDA contact email, social media links |

---

## 16. My Page

### 16.1 My Page Dashboard (`/[locale]/mypage`)

> Design Spec Reference: My Page Design Spec (2026-03-27)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-MYPAGE-01 | Review List | Paginated list of reviews written by the logged-in user, newest first |
| F-MYPAGE-02 | Review Card Display | Each review shows: shop name (linked to shop detail), star rating, review text (truncated to 2 lines), date written, photo thumbnail (if photos exist) |
| F-MYPAGE-03 | Reviews Empty State | "아직 작성한 리뷰가 없습니다." / "You haven't written any reviews yet." with CTA link to shop discovery |
| F-MYPAGE-04 | Reviews Pagination | Page-based, 10 items per page |
| F-MYPAGE-05 | Bookmark Grid | Paginated grid of bookmarked shops, most recently bookmarked first |
| F-MYPAGE-06 | Shop Card Display | Matches existing shop card pattern: thumbnail, shop name (linked), region/district, theme badges, unbookmark button (heart icon) |
| F-MYPAGE-07 | Unbookmark Toggle | Heart icon removes bookmark. Optimistic UI: heart unfills immediately. On failure: reverts with toast error. Card remains visible until next page load. |
| F-MYPAGE-08 | Bookmarks Empty State | "아직 찜한 업체가 없습니다." / "No bookmarked shops yet." with CTA link to shop discovery |
| F-MYPAGE-09 | Bookmarks Pagination | Page-based, 12 items per page |

**Profile Card**

| Element | Display |
|---|---|
| Profile photo | Circular, fallback to default avatar |
| Display name | Read-only text |
| Email | Read-only text |
| Member since | `YYYY.MM.DD` format |
| Edit Profile button | Navigates to `/[locale]/mypage/edit` |

**Tab Configuration**

| Tab | Label (KO) | Label (EN) | URL Param |
|---|---|---|---|
| My Reviews | 내 리뷰 | My Reviews | `?tab=reviews` (default, omittable) |
| Bookmarked Shops | 찜한 업체 | Bookmarked Shops | `?tab=bookmarks` |

### 16.2 Edit Profile (`/[locale]/mypage/edit`)

| # | Feature | Description |
|---|---|---|
| F-MYPAGE-10 | Photo Upload | Upload or change profile photo |
| F-MYPAGE-11 | Photo Remove | Remove current profile photo (reverts to default avatar) |
| F-MYPAGE-12 | Read-Only Fields | Display name, email, and member since displayed but not editable |
| F-MYPAGE-13 | Save | Validates photo, uploads, redirects to `/[locale]/mypage` |
| F-MYPAGE-14 | Cancel | Discards changes, returns to `/[locale]/mypage` |

**Photo Constraints**

| Constraint | Rule |
|---|---|
| File types | JPG, PNG, WebP |
| Max file size | 5 MB |
| Validation | Client-side: file type + size check before upload. Server-side: re-validate. |

**Server Validation Errors**

| Condition | Error |
|---|---|
| File too large | "파일 크기가 5MB를 초과합니다." / "File size exceeds 5MB." |
| Invalid file type | "지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 가능합니다." / "Unsupported file type. Only JPG, PNG, and WebP are allowed." |
| Upload failed | "업로드에 실패했습니다. 다시 시도해주세요." / "Upload failed. Please try again." |

### 16.3 Bookmark API

Minimum bookmark API surface required for My Page:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/bookmarks` | Add bookmark (shop ID) |
| DELETE | `/bookmarks/:id` | Remove bookmark |
| GET | `/bookmarks?user=me&page=N` | List user's bookmarks (paginated) |

Bookmark toggle (heart icon) also appears on shop detail page and shop cards site-wide.

---

## 17. Board System

> UIUX Reference: §7 Pages — Board System

### 17.1 Shop Recommendation Board (`/[locale]/board/recommendation`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-BOARD-01 | Featured Banner | Carousel of editor's pick posts at the top of the page |
| F-BOARD-02 | Post Grid | 3-column grid of recommendation post cards (image, title, location, date, excerpt) |
| F-BOARD-03 | Region Filter | Tab-style filter by region (전체, 서울, 경기, 부산, 대구, 기타). Filter state in URL query param `?region=` |
| F-BOARD-04 | Pagination | Page-based, same pattern as existing list pages |

**Post Card Fields**

| Field | Source | Display |
|---|---|---|
| Image | Post featured image | Card thumbnail |
| Title | Post title | Linked text to post detail |
| Location | Post region tag | Text below title |
| Date | Post published_at | `YYYY.MM.DD` format |
| Excerpt | Post body | Truncated to 2 lines |

### 17.2 Massage Info Board (`/[locale]/board/info`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-BOARD-05 | Post List | Forum-style list layout (no image cards), paginated |
| F-BOARD-06 | Sort Options | Latest (최신순, default), Popular (인기순), Most Commented (댓글많은순). Sort state in URL `?sort=` |
| F-BOARD-07 | Category Badge | Each post displays a category badge (e.g., [실전팁]) |
| F-BOARD-08 | Post Metadata | Each post shows: author, views, likes, comments count, date |
| F-BOARD-09 | HOT Badge | Posts exceeding a threshold (admin-configurable) display a 🔥HOT indicator |

### 17.3 Board Post Detail (`/[locale]/board/[type]/[id]`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-BOARD-10 | Breadcrumb | Navigation breadcrumb showing board type > post title |
| F-BOARD-11 | Post Header | Category badge, title, author, date, view count, like count, comment count |
| F-BOARD-12 | Post Body | Rich text content with embedded images |
| F-BOARD-13 | Embedded Shop Card | For shop recommendation posts only: shop logo, name, location, hours, amenity tags, link to shop detail |
| F-BOARD-14 | Like Button | "이 글이 도움이 되셨나요?" + like counter. Login required. One like per user per post. |
| F-BOARD-15 | Back to List | "목록으로" button returns to the board list page |
| F-BOARD-16 | Comment Section | Comment input (login required) + comment list with nested replies (1 level deep) |
| F-BOARD-17 | Related Posts | Grid of related posts (shop recommendation type only). 3 posts max. |

### 17.4 Comment System

Shared comment system used by Board (§17) and Community (§18).

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-BOARD-18 | Comment Input | Text input + submit button. Login required. Placeholder: "따뜻한 댓글을 남겨주세요." |
| F-BOARD-19 | Comment Display | Author, relative time ("2시간 전"), comment text |
| F-BOARD-20 | Nested Replies | 1 level deep. Reply button on each comment opens inline reply input. |
| F-BOARD-21 | Comment Pagination | "댓글 더보기 (N)" button loads additional comments |

**Comment Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Comment text | Yes | 1–500 characters, trimmed whitespace |

**Server Validation Errors (Comments)**

| Condition | Error |
|---|---|
| Empty comment | "댓글을 입력해주세요." / "Please enter a comment." |
| Comment too long | "댓글은 500자 이하로 작성해주세요." / "Comments must be 500 characters or less." |
| Not logged in | Redirect to login page |

### 17.5 Sub-Navigation

Shared sub-nav bar across Board and Community pages:

| Tab | Label (KO) | Label (EN) | Route |
|---|---|---|---|
| Shop Recommendations | 샵추천 | Shop Picks | `/[locale]/board/recommendation` |
| Massage Info | 마사지정보 | Massage Info | `/[locale]/board/info` |
| Community | 커뮤니티 | Community | `/[locale]/community` |

Active tab is determined by current route.

---

## 18. Community

> UIUX Reference: §8 Pages — Community

### 18.1 Community Feed (`/[locale]/community`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-COMM-01 | Post Feed | Paginated feed of user-generated posts, newest first by default |
| F-COMM-02 | Post Card | Each card shows: author (with level badge), location, content text, image(s), like count, comment count |
| F-COMM-03 | Post Creation Box | Inline form above feed (desktop/tablet) or FAB → Bottom Sheet (mobile). Login required. |
| F-COMM-04 | Feed Filters | 전체글 (all posts, default), 내글 (my posts, login required), 이달 베스트 (monthly best by likes) |
| F-COMM-05 | User Profile Sidebar | Left sidebar (desktop): profile photo, level, display name, points, post count, like count, feed filter links |
| F-COMM-06 | Popular Shops Sidebar | Right sidebar (desktop): "이번 주 인기샵" list of top shops |
| F-COMM-07 | Pagination | Page-based |

**Post Creation Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Text content | Yes | 1–2,000 characters |
| Photos | No | Max 5 photos, each max 5MB, JPG/PNG/WebP |
| Video | No | Max 1 video, max 50MB, MP4/MOV |
| Hashtags | No | Max 10 hashtags, each max 30 characters |

**Server Validation Errors (Post Creation)**

| Condition | Error |
|---|---|
| Empty content | "내용을 입력해주세요." / "Please enter content." |
| Content too long | "내용은 2,000자 이하로 작성해주세요." / "Content must be 2,000 characters or less." |
| Too many photos | "사진은 최대 5장까지 업로드할 수 있습니다." / "You can upload up to 5 photos." |
| Photo too large | "파일 크기가 5MB를 초과합니다." / "File size exceeds 5MB." |
| Invalid photo type | "지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 가능합니다." / "Unsupported file type. Only JPG, PNG, and WebP are allowed." |
| Video too large | "동영상 크기가 50MB를 초과합니다." / "Video size exceeds 50MB." |
| Invalid video type | "지원하지 않는 동영상 형식입니다. MP4, MOV만 가능합니다." / "Unsupported video format. Only MP4 and MOV are allowed." |
| Too many hashtags | "해시태그는 최대 10개까지 가능합니다." / "You can add up to 10 hashtags." |
| Not logged in | Redirect to login page |

### 18.2 Community Post Detail (`/[locale]/community/[id]`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-COMM-08 | Post Content | Full post text, photos, video, hashtags |
| F-COMM-09 | Author Info | Profile photo, display name, level badge |
| F-COMM-10 | Like Button | Like counter. Login required. One like per user per post. |
| F-COMM-11 | Comment Section | Same comment system as Board (§17.4, F-BOARD-18 through F-BOARD-21) |
| F-COMM-12 | User Profile Sidebar | Same as feed (desktop only) |
| F-COMM-13 | Popular Shops Sidebar | Same as feed (desktop only) |

### 18.3 User Levels & Points

**Point Earning Rules**

| Action | Points | Limit |
|---|---|---|
| Create community post | +50P | No daily limit |
| Post a comment (Board or Community) | +10P | Max 10 comments/day earn points |
| Receive a like on your post | +5P | No limit |

**Level Thresholds**

| Level | Points Required | Badge |
|---|---|---|
| Lv.1 | 0P | Lv.1 |
| Lv.2 | 500P | Lv.2 |
| Lv.3 | 2,000P | Lv.3 |
| Lv.4 | 5,000P | Lv.4 |
| Lv.5 | 10,000P | Lv.5 |

**Display Locations**

| Location | What's Shown |
|---|---|
| Community profile sidebar | Level badge, total points, post count, like count |
| Community post cards | Author name + level badge |
| Community post detail | Author name + level badge |

**Rules:**
- Points are display-only in MVP — no spending or redeeming
- Points are cumulative and never decrease
- Level is derived from total points (not stored separately)
- Points are earned immediately on action (no approval delay)

---

## 19. Events & Notices

> UIUX Reference: §9 Pages — Events & Notices

### 19.1 Events & Notices Hub (`/[locale]/events`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVENT-01 | Important Notices | Pinned notice cards in a 2×2 grid at the top. Admin marks notices as "important" in Strapi. |
| F-EVENT-02 | Ongoing Events Carousel | Horizontal carousel of active events with D-day countdown badges and "전체보기" link to `/[locale]/events/ongoing` |
| F-EVENT-03 | Notice & Post Table | Combined table of all notices and general posts. Columns: No., Category (공지/일반), Title, Date, View count. Pinned notices (📌) always at top. |
| F-EVENT-04 | Pagination | Page-based for the notice table |

**Event Card Fields (Carousel)**

| Field | Source | Display |
|---|---|---|
| Status badge | Event status | [이벤트] tag |
| D-day badge | Calculated from end date | D-N / D-DAY / 마감 |
| Banner image | Event featured image | Card image |
| Title | Event title | Text |
| Date range | Event start_date – end_date | `YYYY.MM.DD-MM.DD` format |

### 19.2 All Ongoing Events (`/[locale]/events/ongoing`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVENT-05 | Category Sidebar | Filter by category: 전체이벤트 (All), 신규오픈 (New Opening), 마감임박 (Closing Soon), 쿠폰혜택 (Coupon), 당첨자발표 (Winner Announcement). State in URL `?category=` |
| F-EVENT-06 | Hero Event Banner | Carousel of featured/highlighted events at the top |
| F-EVENT-07 | Event Grid | 3-column grid of event cards with status badge, D-day badge, image, title, date, views, likes |
| F-EVENT-08 | Sort Options | Latest (최신순, default), Popular (인기순). State in URL `?sort=` |
| F-EVENT-09 | Pagination | Page-based |

### 19.3 Event Detail (`/[locale]/events/[id]`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVENT-10 | Breadcrumb | 이벤트 & 공지사항 > 진행중인 이벤트 > event title |
| F-EVENT-11 | Event Banner | Full-width banner with status badge + D-day countdown |
| F-EVENT-12 | Event Header | Title, author, date, view count, like count, comment count |
| F-EVENT-13 | Event Body | Rich text content with embedded images |
| F-EVENT-14 | Disclaimers | "이벤트 유의사항" section with bulleted rules |
| F-EVENT-15 | Like Button | Same pattern as Board (§17.3 F-BOARD-14). Login required, one per user. |
| F-EVENT-16 | Back to List | "목록으로" returns to `/[locale]/events/ongoing` |
| F-EVENT-17 | Related Events | Grid of other ongoing events (2 max) |

### 19.4 Notice Detail (`/[locale]/events/notice/[id]`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVENT-18 | Notice Header | Title, date, view count |
| F-EVENT-19 | Notice Body | Rich text content with embedded images |
| F-EVENT-20 | Prev/Next Navigation | Links to previous and next notice posts (by date). Display: title + date for each. |

No comment section, no like button, no related posts on notices.

### 19.5 D-Day Countdown Logic

| Condition | Display |
|---|---|
| Event end date > today | D-N (where N = days remaining) |
| Event end date = today | D-DAY |
| Event end date < today | 마감 (Closed) |

Countdown is calculated server-side using KST (Asia/Seoul), matching global date rules (§1.3).

---

## Appendix A. Error Message Guide

| Code | Korean | English |
|---|---|---|
| ERR_LOGIN | 이메일 또는 비밀번호가 올바르지 않습니다 | Invalid email or password |
| ERR_DUP_EMAIL | 이미 등록된 이메일입니다 | This email is already registered |
| ERR_DUP_DISPLAY_NAME | 이미 사용 중인 닉네임입니다 | This display name is already taken |
| ERR_ACCOUNT_SUSPENDED | 계정이 정지되었습니다. 관리자에게 문의해주세요. | Your account has been suspended. Please contact the administrator. |
| ERR_REVIEW_LENGTH | 리뷰는 10자 이상 500자 이하로 작성해주세요. | Review must be 10–500 characters. |
| ERR_REVIEW_RATING | 별점을 선택해주세요. | Please select a star rating. |
| ERR_REVIEW_REPORTED | 이미 신고한 리뷰입니다 | You have already reported this review |
| ERR_REQUIRED_FIELD | 필수 항목을 입력해주세요. | Please fill in all required fields. |
| ERR_INVALID_EMAIL | 올바른 이메일 형식을 입력해주세요. | Please enter a valid email address. |
| ERR_GPS_DENIED | 위치 권한이 필요합니다. 브라우저 설정에서 허용해주세요. | Location permission is required. Please allow it in your browser settings. |
| ERR_RATE_LIMITED | 잠시 후 다시 시도해주세요. | Please try again later. |
| ERR_NETWORK | 네트워크 연결을 확인해 주세요. | Please check your network connection. |
| ERR_SERVER | 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. | A temporary error occurred. Please try again shortly. |
| ERR_NOT_TRANSLATED | 이 내용은 아직 번역되지 않았습니다 | This content is not yet translated |
| ERR_FILE_TOO_LARGE | 파일 크기가 5MB를 초과합니다. | File size exceeds 5MB. |
| ERR_INVALID_FILE_TYPE | 지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 가능합니다. | Unsupported file type. Only JPG, PNG, and WebP are allowed. |
| ERR_UPLOAD_FAILED | 업로드에 실패했습니다. 다시 시도해주세요. | Upload failed. Please try again. |
| ERR_BOOKMARK_FAILED | 북마크 해제에 실패했습니다. 다시 시도해주세요. | Failed to remove bookmark. Please try again. |
| ERR_COMMENT_EMPTY | 댓글을 입력해주세요. | Please enter a comment. |
| ERR_COMMENT_LENGTH | 댓글은 500자 이하로 작성해주세요. | Comments must be 500 characters or less. |
| ERR_POST_EMPTY | 내용을 입력해주세요. | Please enter content. |
| ERR_POST_LENGTH | 내용은 2,000자 이하로 작성해주세요. | Content must be 2,000 characters or less. |
| ERR_PHOTO_LIMIT | 사진은 최대 5장까지 업로드할 수 있습니다. | You can upload up to 5 photos. |
| ERR_VIDEO_TOO_LARGE | 동영상 크기가 50MB를 초과합니다. | Video size exceeds 50MB. |
| ERR_INVALID_VIDEO_TYPE | 지원하지 않는 동영상 형식입니다. MP4, MOV만 가능합니다. | Unsupported video format. Only MP4 and MOV are allowed. |
| ERR_HASHTAG_LIMIT | 해시태그는 최대 10개까지 가능합니다. | You can add up to 10 hashtags. |

---

## Appendix B. Open/Close Tag Logic

> PRD Reference: §5.6 Metadata — Open/Close Tags

**How it works**

The system determines open/closed status based on the shop's operating hours and the current time in Korea (KST).

- If the shop has a free-text operating hours description, it is displayed as-is (no automatic open/close computation).
- Otherwise, the system checks the shop's structured operating hours for the current day of the week.
- If no hours are set for today, the shop is shown as closed.
- Overnight hours (e.g., 18:00-02:00) are handled correctly by checking across midnight.
- The displayed tag defaults to "영업중" (Open) or "영업종료" (Closed) unless the shop has custom labels.

> See TSD §4.4.4 and §6.4 for data structure details.

**Display Rules**
- Only published shops are displayed on the Customer Web
- Unpublished shops are never shown regardless of open/close status
- Tag display falls back to default labels if `open_tag` or `close_tag` is empty/null

---

## Appendix C. Amenity Display Mapping

| Amenity | Korean Label | English Label |
|---|---|---|
| Parking | 주차 | Parking |
| Parking (free) | 무료 주차 | Free parking |
| Parking (paid) | 유료 주차 | Paid parking |
| Parking (validated) | 주차 확인 | Validated parking |
| Parking (street) | 노상 주차 | Street parking |
| Shower | 샤워 | Shower |
| Sleeping area | 수면실 | Sleeping area |
| Private room | 개인실 | Private room |
| WiFi | 무료 WiFi | Free WiFi |
| Accessibility | 장애인 편의 | Accessibility |

---

## Appendix D. Deferred Auth Features

The following features are defined in the UI/UX Specification but deferred from MVP:

| Feature | Reason | Depends On |
|---|---|---|
| ID Recovery (find email by display name) | No reliable alternative identifier without phone number | Phone/SMS verification |
| Phone/SMS Verification | Not in PRD MVP scope | SMS service integration |
| Welcome Coupon (3,000 KRW on signup) | Coupon system not in PRD MVP scope | Coupon content type + admin management |
| Stronger Password Rules (8+ chars, alphanumeric + special) | Current FSD/PRD specifies min 6 chars only | PRD update to strengthen requirements |

> These features should be added to the FSD when their dependencies are resolved and the PRD scope is updated.

---

> **Document End**
>
> This FSD should be reviewed and updated alongside the UI/UX Specification. Functional changes must be reflected in both the PRD and TSD as needed.
