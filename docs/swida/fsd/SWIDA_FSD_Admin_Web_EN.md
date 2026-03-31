---
title: 'SWIDA — Admin Web FSD'
sidebar_label: 'Admin Web FSD (EN)'
sidebar_position: 3
---

# Functional Specification Document (FSD)

## SWIDA — Admin Web

- **Version**: 1.2
- **Date**: 2026-03-30
- **Based on**: SWIDA PRD v1.2, SWIDA TSD v1.2
- **Scope**: MVP — Admin-facing platform management web application
- **Related Documents**: UI/UX Specification v1.2, Customer Web FSD v1.0
- **Change summary (v1.1 → v1.2):** Added §1.5 Document Authority Hierarchy (resolves source-of-truth contradiction). §1.3 MVP Scope table updated — deferred features (Board Posts, Events, Notices, Community Posts) now explicitly listed as Deferred MVP with disabled sidebar placeholder requirement. §1.4 Global Rules expanded: preview contract, data states, localization rules. §6 Reviews: `under_review` status visual changed from red to amber (action-needed signal). §9 Inquiries: progress bar step-to-status mapping formally defined. §16.2 Logout updated to require explicit visible button. Added §17 Data & UI States (loading, empty, error, network) spec. Added §18 Preview System Contract.

---

## 1. Document Overview

### 1.1 Purpose

This document defines the page list and functional specifications for the SWIDA Admin Web application. The Admin Web is the primary operational interface for managing the SWIDA platform — it serves as the dedicated admin panel for all day-to-day operations. Visual design, layout, and interaction details are covered in the separate UI/UX Specification.

### 1.2 Architecture Context

The Admin Web is a dedicated web application served at `admin.swida.com`. It connects to the backend for authentication and content management. The platform's underlying admin panel is restricted to developers only for monitoring and debugging — it is not used for any operational features defined in this document.

### 1.3 MVP Scope

| Included                                         | Not Included (Future)                  |
| ------------------------------------------------ | -------------------------------------- |
| Admin authentication (email/password)            | Shop owner self-service portal         |
| Dashboard (platform statistics)                  | Advanced analytics & reports           |
| Shop CRUD (create, edit, publish/unpublish)      | Bulk import/export of shop listings    |
| Map pin drop for lat/lng selection               | Map view of all shops                  |
| Shop preview (customer view)                     | Push notification management           |
| Review moderation (view, hide, delete)           | Automated review moderation (AI/rules) |
| Customer account management (lock/unlock)        | Coupon / deals management              |
| Theme management (CRUD)                          | Booking system management              |
| Region & district management (CRUD)              |                                        |
| Partnership inquiry management (status workflow) |                                        |
| Board post management (CRUD)                     |                                        |
| Event management (CRUD)                          |                                        |
| Notice management (CRUD)                         |                                        |
| Community post moderation (view, hide, delete)   |                                        |
| Audit log viewer                                 |                                        |
| Locale management (Korean/English content)       |                                        |

### 1.4 Global Rules

| Item                    | Rule                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language                | Admin Web UI is in English (admin-facing, not customer-facing)                                                                                                                                                                                                                                                                                                                                  |
| Date/Time               | KST (Korea Standard Time, UTC+9). Format: `YYYY-MM-DD HH:mm:ss`                                                                                                                                                                                                                                                                                                                                 |
| Authentication          | All pages require admin authentication. Unauthenticated requests redirect to login                                                                                                                                                                                                                                                                                                              |
| API Communication       | Backend handles authentication and content operations. See TSD §5.2 for API details                                                                                                                                                                                                                                                                                                             |
| Soft Delete Policy      | Shop listings are never hard-deleted. Deactivated shops are unpublished with an inactive reason                                                                                                                                                                                                                                                                                                 |
| Pagination              | Table-based pagination with configurable page size (10, 20, 50)                                                                                                                                                                                                                                                                                                                                 |
| Loading States          | Skeleton placeholders for data tables and forms while API calls are in flight                                                                                                                                                                                                                                                                                                                   |
| Empty States            | "No results found" with a suggestion to adjust filters. For first-time empty pages (e.g., no shops yet), show a prompt to create the first item.                                                                                                                                                                                                                                                |
| Error States            | Server errors: red toast "A temporary error occurred. Please try again shortly." + retry button. Network errors: red toast "Please check your network connection." Both are persistent until dismissed.                                                                                                                                                                                         |
| Confirmation            | All destructive actions (hide, delete, lock, unpublish) require confirmation dialog                                                                                                                                                                                                                                                                                                             |
| Toast Notifications     | Success/error feedback for all write operations                                                                                                                                                                                                                                                                                                                                                 |
| Responsive              | Desktop-primary. Minimum supported width: 1024px                                                                                                                                                                                                                                                                                                                                                |
| Input Sanitization      | All admin-submitted free-text fields (shop descriptions, inactive reason details, theme names, moderation reasons) are sanitized server-side before storage. HTML tags are stripped. Output is escaped on render to prevent stored XSS on Customer Web.                                                                                                                                         |
| Submit Protection       | All form submit and action buttons (Save, Publish, Hide, Delete, Lock, status changes) enter a disabled + loading state on first click until the server responds. Prevents duplicate API calls from rapid clicks.                                                                                                                                                                               |
| Conflict Detection      | All edit forms include the record's `updatedAt` timestamp in save requests. On `409 Conflict` response (record modified by another session), show a modal dialog: "This record was modified in another session. Please reload and try again." with a Reload button that refreshes the page. The save action is blocked until the admin reloads. See TSD §5.3.1a for server-side implementation. |
| Localization (Admin UI) | All Admin Web UI chrome (labels, buttons, navigation, error messages) is in English. Content data (shop names, descriptions, theme names, etc.) is authored in Korean and optionally translated to English via the locale switcher. These are two separate concerns — never conflate "English-only admin UI" with "English-only content".                                                       |
| Preview Contract        | Shop preview opens the Customer Web in a new browser tab. Previewing a draft (unpublished) shop requires a time-limited signed preview token passed as a URL parameter. The Customer Web reads this token and temporarily bypasses its published-only filter for that session. Token expiry: 15 minutes. See §18 for full preview system spec.                                                  |

### 1.5 Document Authority Hierarchy

To avoid contradictions between this FSD, the UI/UX Specification, and the HTML prototype, the following hierarchy applies:

| Layer       | Document                     | Authority                                                                          | Scope                                   |
| ----------- | ---------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------- |
| 1 (Highest) | **This FSD**                 | Functional logic, business rules, status transitions, data contracts, API behavior | What the system does                    |
| 2           | **UI/UX Specification v1.2** | Screen layouts, interaction flows, component patterns, storyboards                 | How the system behaves and is navigated |
| 3 (Lowest)  | **HTML Prototype**           | Visual reference — colors, spacing, component aesthetics                           | How it looks                            |

**Rules:**

- If the FSD and UI/UX spec conflict → **FSD wins**. Update UI/UX to match, note the discrepancy.
- If the UI/UX spec and prototype conflict → **UI/UX spec wins**. The prototype is a visual reference, not a binding interaction contract.
- If the prototype introduces interaction patterns not covered in either doc → **add to UI/UX spec**, review against FSD logic before implementing.
- Engineers follow FSD for all logic decisions. Designers follow UI/UX spec for all layout/interaction decisions. The prototype is a starting point for visual polish only.

---

## 2. Page List

### 2.1 Active MVP Pages

| #   | Page                  | Route         | Description                                                           |
| --- | --------------------- | ------------- | --------------------------------------------------------------------- |
| 1   | Login                 | `/login`      | Admin authentication                                                  |
| 2   | Dashboard             | `/dashboard`  | Platform overview statistics                                          |
| 3   | Shop List             | `/shops`      | All shop listings with search, filter, sort                           |
| 4   | Shop Create           | `/shops/new`  | Create new shop listing (also accessible via "New Shop" sidebar item) |
| 5   | Shop Edit             | `/shops/[id]` | Edit existing shop listing                                            |
| 6   | Reviews               | `/reviews`    | Review moderation                                                     |
| 7   | Themes                | `/themes`     | Theme management                                                      |
| 8   | Locations             | `/locations`  | Region & district management                                          |
| 9   | Partnership Inquiries | `/inquiries`  | Partnership inquiry management (card grid layout)                     |
| 10  | Users                 | `/users`      | Customer account management                                           |
| 11  | Audit Log             | `/audit-log`  | Change history viewer                                                 |

### 2.2 Deferred MVP Pages

The following pages are **fully specified in this FSD** and **included in the backend data model (TSD §4.4)**, but their UI is deferred to a later prototype iteration. They must appear as **disabled sidebar items** (grayed out, with a "Coming soon" tooltip) so engineers can see the full scope and the navigation structure is reserved. They must **not** be omitted entirely.

| #   | Page              | Route               | Sidebar Group | FSD Section |
| --- | ----------------- | ------------------- | ------------- | ----------- |
| 12  | Board Posts       | `/board-posts`      | Content       | §11         |
| 13  | Board Post Create | `/board-posts/new`  | —             | §11         |
| 14  | Board Post Edit   | `/board-posts/[id]` | —             | §11         |
| 15  | Events            | `/events`           | Content       | §12         |
| 16  | Event Create      | `/events/new`       | —             | §12         |
| 17  | Event Edit        | `/events/[id]`      | —             | §12         |
| 18  | Notices           | `/notices`          | Content       | §13         |
| 19  | Notice Create     | `/notices/new`      | —             | §13         |
| 20  | Notice Edit       | `/notices/[id]`     | —             | §13         |
| 21  | Community Posts   | `/community-posts`  | Moderation    | §14         |

**Disabled sidebar behavior:** Deferred items appear in the sidebar with muted/gray text and no hover state. Clicking shows a tooltip: "Coming soon". Routes return a 404 or redirect to `/dashboard` until implemented.

**Access Control**: All pages except Login require an authenticated admin session. Unauthenticated access to any page redirects to `/login`.

---

## 3. Authentication

### 3.1 Login (`/login`)

> PRD Reference: §3.1 Admin Authentication, TSD §5.4.2

**Feature List**

| #         | Feature               | Description                                                                              |
| --------- | --------------------- | ---------------------------------------------------------------------------------------- |
| F-AUTH-01 | Email/Password Login  | Admins log in with email and password. The session is maintained securely                |
| F-AUTH-02 | Session Storage       | The admin session is stored securely in the browser and used for all subsequent requests |
| F-AUTH-03 | Post-Login Redirect   | On successful login, redirect to `/dashboard`                                            |
| F-AUTH-04 | Error Handling        | Display error message for invalid credentials or server errors                           |
| F-AUTH-05 | Already Authenticated | If admin is already logged in, redirect from `/login` to `/dashboard`                    |

**Input Constraints**

| Field    | Required | Constraints        |
| -------- | -------- | ------------------ |
| Email    | Yes      | Valid email format |
| Password | Yes      | Non-empty          |

**Server Validation Errors**

| Condition           | Error                                            |
| ------------------- | ------------------------------------------------ |
| Invalid credentials | "Invalid email or password"                      |
| Server unreachable  | "Unable to connect to server. Please try again." |

### 3.2 Session Management

| #         | Feature             | Description                                                                                     |
| --------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| F-AUTH-06 | Session Persistence | Admin session persists across browser sessions (until expiry or logout)                         |
| F-AUTH-07 | Session Expiry      | On session expiry, redirect to login page with message: "Session expired. Please log in again." |
| F-AUTH-08 | Logout              | Clear admin session, redirect to `/login`                                                       |

### 3.3 Logout

| #           | Feature       | Description                                                                                                                                                                                                                                                                                      |
| ----------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F-LOGOUT-01 | Session Clear | Remove admin session and clear client-side state                                                                                                                                                                                                                                                 |
| F-LOGOUT-02 | Redirect      | Navigate to `/login` after logout                                                                                                                                                                                                                                                                |
| F-LOGOUT-03 | Logout Button | Accessible via the admin user identity block at the bottom of the sidebar. Clicking the identity block opens a small popover. The popover contains the admin email and an explicit "Log Out" button. The button must always be visible in the popover — not hidden behind a further interaction. |

---

## 4. Dashboard

### 4.1 Dashboard (`/dashboard`)

> PRD Reference: §3.1 Admin — Dashboard, §7.2 Admin-Facing Menus

**Feature List**

| #         | Feature                    | Description                                                                                                                                                                                                                                                           |
| --------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-DASH-01 | Total Shops stat card      | Displays total shop count with a delta line showing how many were added this month (e.g., "+18 this month"). No published/draft sub-breakdown shown on card.                                                                                                          |
| F-DASH-02 | Monthly Users stat card    | Displays monthly active user count with a delta line showing percentage change vs last month (e.g., "+12% vs last month").                                                                                                                                            |
| F-DASH-03 | Total Reviews stat card    | Displays total review count with a delta line showing how many were added this month.                                                                                                                                                                                 |
| F-DASH-04 | New Inquiries stat card    | Displays count of `new` (uncontacted) partnership inquiries. Delta line shows overdue count in amber (e.g., "⚠ 2 overdue (48h)").                                                                                                                                     |
| F-DASH-05 | Verify-Needed Alert Banner | Amber alert banner shown at the top of the dashboard when any shops have not been re-verified in 90+ days. Shows shop count and links to filtered shop list. Example: "⚠️ 7 shops have not been verified in over 90 days."                                            |
| F-DASH-06 | Monthly Signups Chart      | Bar chart showing monthly new user signups for the past 7 months. Displayed in the first card of the second row.                                                                                                                                                      |
| F-DASH-07 | Pending Reviews Feed       | List of up to 3 reviews in `under_review` status. Each item shows: shop name + reviewer name, report count + reason snippet, and status pill. Includes a "View all →" link to `/reviews?status=under_review`. Displayed in the second card of the second row.         |
| F-DASH-08 | Recent Shops Feed          | List of up to 3 most recently created shops. Each item shows: shop icon, name, district + date, and status pill. Includes a "View all →" link to `/shops`. Displayed in the first card of the third row.                                                              |
| F-DASH-09 | Recent Inquiries Feed      | List of up to 3 open partnership inquiries (sorted by newest). Each item shows: shop name, district + date (with "Overdue" label in red if applicable), and status pill. Includes a "View all →" link to `/inquiries`. Displayed in the second card of the third row. |

**Dashboard layout:** 4 stat cards in a single row at the top. Below: two rows of 2 equal-width cards each. The verify-needed alert banner appears above the stat cards when applicable.

**Data Sources**: `GET /api/dashboard/stats` (TSD §5.2.5). All fields are fetched in a single API call on page load.

---

## 5. Shop Management

### 5.1 Shop List (`/shops`)

> PRD Reference: §3.1 Shop Management, §7.2 Admin-Facing Menus

**Feature List**

| #         | Feature          | Description                                                                                                                                                                                                            |
| --------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-SHOP-01 | Shop Table       | Paginated table of all shops. Columns: thumbnail icon, shop name + district sub-label, full location (region + district), themes, rating + review count, status pill, last verified date, actions. No checkbox column. |
| F-SHOP-02 | Search           | Text search by shop name (partial match)                                                                                                                                                                               |
| F-SHOP-03 | Filter — Status  | Filter chips: All (with count) / Published (with count) / Draft (with count) / Verify needed (with count)                                                                                                              |
| F-SHOP-04 | Filter — Region  | Filter by Level 1 region (future; not in prototype filter bar)                                                                                                                                                         |
| F-SHOP-05 | Filter — Theme   | Filter by service theme (future; not in prototype filter bar)                                                                                                                                                          |
| F-SHOP-06 | Sort             | Sort by: name, rating, review count, created date, updated date                                                                                                                                                        |
| F-SHOP-07 | Publish Action   | Inline "Publish" button on Draft rows. Shop becomes visible on Customer Web immediately (PRD §7.3)                                                                                                                     |
| F-SHOP-08 | Unpublish Action | Inline "Unpublish" button on Published rows. Opens inactive reason dialog before unpublishing (PRD §7.3)                                                                                                               |
| F-SHOP-09 | Create Button    | "+ New Shop" button in topbar — navigates to `/shops/new`                                                                                                                                                              |
| F-SHOP-10 | Edit Button      | Inline "Edit" button on each row — navigates to `/shops/[id]`                                                                                                                                                          |
| F-SHOP-11 | Preview Button   | Inline 👁 icon button on each row — opens Customer Web shop detail in a new tab (PRD §3.1)                                                                                                                             |
| F-SHOP-12 | Pagination       | Table pagination with configurable page size (10, 20, 50). Shows "Showing N–M of Total shops"                                                                                                                          |

> Note: The "Verify needed" filter chip surfaces shops where `last_verified_at` is older than 90 days (PRD §10.4). Row actions are inline buttons (Edit | Publish/Unpublish | 👁) — there is no ⋯ overflow menu in the prototype.

**Unpublish — Inactive Reason Dialog** (PRD §7.3)

| Field                  | Required        | Options                                                  |
| ---------------------- | --------------- | -------------------------------------------------------- |
| Inactive Reason        | Yes             | `closed`, `owner_request`, `violation`, `stale`, `other` |
| Inactive Reason Detail | Only if `other` | Free-text explanation (max 500 characters)               |

### 5.2 Shop Create (`/shops/new`)

> PRD Reference: §5 Shop Listing Data Model, §7.3 Admin Operational Workflows

**Feature List**

| #          | Feature                    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-SHOP-13  | Basic Info Form            | Input fields for all basic information: name, description, address, operating hours, last order time, closed days, phone number (PRD §5.1)                                                                                                                                                                                                                                                                                                                                                                                                    |
| F-SHOP-14  | Location Selection         | Cascading dropdowns for region (Level 1) → district (Level 2) (PRD §5.1)                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| F-SHOP-15  | Map Pin Drop               | Integrated Kakao Map for selecting the shop's location. Admin clicks on the map to set coordinates. Supports address search to center the map — if address not found, show "주소를 찾을 수 없습니다" toast and allow manual pin drop. Default center: Seoul City Hall. When editing an existing shop, center on saved coordinates. (PRD §3.1, TSD §5.6)                                                                                                                                                                                       |
| F-SHOP-15a | Coordinate Manual Fallback | Manual latitude/longitude text input fields are always visible below the map. Map pin drop auto-fills the text fields; manual entry overrides pin drop values. If Kakao Map JS SDK fails to load (key expired, quota exceeded, network timeout): hide the map container, show error banner "지도를 불러올 수 없습니다 — 좌표를 직접 입력하세요" / "Map unavailable — enter coordinates manually". Admin can still save the shop using manual coordinate entry. Validation: latitude −90 to 90, longitude −180 to 180, both required for save. |
| F-SHOP-16  | Theme Selection            | Multi-select chip picker from all available themes (PRD §5.2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| F-SHOP-17  | Service Menu               | Repeatable form component — add/remove service menu items. Each item: service name, duration (minutes), price (KRW), description (PRD §5.2.1). Deferred from current prototype.                                                                                                                                                                                                                                                                                                                                                               |
| F-SHOP-18  | Booking Info               | Dropdown for booking required (Yes / No walk-in available). Conditional input for booking URL/phone. Gender availability dropdown (PRD §5.2)                                                                                                                                                                                                                                                                                                                                                                                                  |
| F-SHOP-19  | Amenities                  | Checkbox toggles for each amenity: Parking, Shower, Sleeping, Private Room, WiFi, Accessibility. Conditional inputs for parking type, parking detail, accessibility detail (PRD §5.3)                                                                                                                                                                                                                                                                                                                                                         |
| F-SHOP-20  | Contact Channels           | Optional inputs in right sidebar panel: KakaoTalk ID, Instagram, Naver Place URL, Website URL (PRD §5.4)                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| F-SHOP-21  | Languages                  | Multi-select for languages supported (PRD §5.5). Deferred from current prototype.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| F-SHOP-22  | Image Upload               | Upload shop images (min: 1, max: 10). Accepted formats: JPEG, PNG, WebP. Max file size: 5MB per image. Drag-and-drop or file picker. Images are uploaded and stored in MinIO (PRD §5.1). **MinIO unavailability:** If image upload fails (MinIO unreachable or storage error), show error toast "Image upload failed. Please try again." with a retry button. The shop form can still be saved as a draft without images — the image requirement (min 1) is only enforced on Publish, not on Save as Draft.                                   |
| F-SHOP-23  | Thumbnail Selection        | Select one image as the primary thumbnail for search results (PRD §5.1). Deferred from current prototype — thumbnail star selector not yet implemented.                                                                                                                                                                                                                                                                                                                                                                                       |
| F-SHOP-24  | Open/Close Tags            | Optional custom labels for operating status display on Customer Web, in a "Custom Status Tags" card in the right sidebar. Defaults: "영업중" / "영업종료" (PRD §5.6)                                                                                                                                                                                                                                                                                                                                                                          |
| F-SHOP-25  | Save as Draft              | "Save Draft" button in topbar. Saves shop without publishing. Creates a draft entry (PRD §7.3)                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| F-SHOP-26  | Publish                    | "Publish" button in topbar. Saves shop and publishes immediately. Shop becomes visible on Customer Web (PRD §7.3)                                                                                                                                                                                                                                                                                                                                                                                                                             |
| F-SHOP-27  | Locale Switcher            | Switch between Korean and English content editing. Korean fields must be saved before English editing is enabled. English is optional (PRD §11.4). Deferred from current prototype — not yet implemented.                                                                                                                                                                                                                                                                                                                                     |

**Form layout:** Two-column layout. Left main column (wider): Basic Information card, Location (cascading dropdowns), Map Pin Drop card, Service Themes card, Hours & Booking card, Amenities card, Images card. Right sidebar column (narrower): Publish Status card (status dot + "Publish Shop" button + "Preview (Customer View)" button), Contact Channels card, Custom Status Tags card. Topbar title is "Create New Shop" on `/shops/new` and "Edit Shop" on `/shops/[id]`. Topbar actions: Cancel / Save Draft / Publish.

**Input Constraints**

| Field           | Required             | Constraints                                                                                                                                                                                                                                                                                                                |
| --------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shop Name       | Yes                  | Max 255 characters                                                                                                                                                                                                                                                                                                         |
| Slug            | Yes (auto-generated) | A URL-friendly identifier is automatically generated from the shop name, editable                                                                                                                                                                                                                                          |
| Description     | Yes                  | Max 500 characters                                                                                                                                                                                                                                                                                                         |
| Address         | Yes                  | Max 500 characters                                                                                                                                                                                                                                                                                                         |
| Region          | Yes                  | Select from available regions                                                                                                                                                                                                                                                                                              |
| District        | Yes                  | Select from available districts (filtered by region)                                                                                                                                                                                                                                                                       |
| Latitude        | Yes                  | Decimal, set via map pin drop or manual entry. Range: −90 to 90                                                                                                                                                                                                                                                            |
| Longitude       | Yes                  | Decimal, set via map pin drop or manual entry. Range: −180 to 180                                                                                                                                                                                                                                                          |
| Operating Hours | Yes                  | Per-day schedule: 7 day rows (Mon–Sun), each with open time and close time selectors, plus a "Closed" checkbox per day. Includes a free-text override field for special notes (e.g., "Holiday hours may vary"). The structured input populates `operating_hours` (JSONB); the text field populates `operating_hours_text`. |
| Closed Days     | Yes                  | Text (e.g., "매주 일요일")                                                                                                                                                                                                                                                                                                 |
| Themes          | Yes                  | At least one theme selected                                                                                                                                                                                                                                                                                                |
| Service Menu    | Yes                  | At least one service menu item                                                                                                                                                                                                                                                                                             |
| Images          | Yes                  | 1–10 images                                                                                                                                                                                                                                                                                                                |
| Thumbnail       | Yes                  | One image selected as thumbnail                                                                                                                                                                                                                                                                                            |

### 5.3 Shop Edit (`/shops/[id]`)

> PRD Reference: §5 Shop Listing Data Model, §7.3 Admin Operational Workflows

| #         | Feature                  | Description                                                                                                      |
| --------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| F-SHOP-28 | Load Existing Data       | Pre-populate all form fields with the shop's current data                                                        |
| F-SHOP-29 | Edit All Fields          | All fields from Shop Create (F-SHOP-13 through F-SHOP-27) are editable                                           |
| F-SHOP-30 | Save Changes             | Save updated data. If published, changes are reflected on Customer Web immediately                               |
| F-SHOP-31 | Publish/Unpublish Toggle | Change visibility status from this page (same behavior as F-SHOP-07/F-SHOP-08)                                   |
| F-SHOP-32 | Preview                  | Open current shop in Customer Web in new tab (PRD §3.1)                                                          |
| F-SHOP-33 | Last Verified Date       | Editable date field — admin sets this when verifying the listing is still accurate (PRD §5.5)                    |
| F-SHOP-34 | Locale Switcher          | Switch between Korean and English content editing. Shows indicator if English translation is missing (PRD §11.4) |
| F-SHOP-35 | Audit History Link       | Link to audit log filtered by this shop's document ID                                                            |

---

## 6. Review Moderation

### 6.1 Review List (`/reviews`)

> PRD Reference: §8.4 Review Moderation, §8.5 Review Integrity & Abuse Prevention

**Feature List**

| #        | Feature           | Description                                                                                                                                                                                                                                                                                             |
| -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-REV-01 | Review Table      | Paginated table of all reviews. Columns: Shop, Reviewer, Rating (stars), Content Preview (truncated), Report count, Report reason (raw code), Status pill, Actions                                                                                                                                      |
| F-REV-02 | Filter — Status   | Filter chips: All / Under Review (with count) / Published / Hidden                                                                                                                                                                                                                                      |
| F-REV-03 | Filter — Reported | No separate filter chip — reported reviews are surfaced via the "Under Review" filter chip                                                                                                                                                                                                              |
| F-REV-04 | Filter — Shop     | Text search input: "Search shop or reviewer..."                                                                                                                                                                                                                                                         |
| F-REV-05 | Filter — Date     | Filter by date range (future; not in prototype filter bar)                                                                                                                                                                                                                                              |
| F-REV-06 | Sort              | Sort by: created date, rating, report count                                                                                                                                                                                                                                                             |
| F-REV-07 | Review Detail     | Expand/modal to show full review comment, author info, shop info, report history (PRD §8.4)                                                                                                                                                                                                             |
| F-REV-08 | Keep Action       | Inline "Keep" button (green styled) — sets status to `published`. Review becomes visible on Customer Web and counted in rating. Available on `under_review` rows.                                                                                                                                       |
| F-REV-09 | Hide Action       | Inline "Hide" button (red styled) — sets status to `hidden`. Requires moderation reason selection dialog. Review excluded from Customer Web and rating calculations. Available on `under_review` and `published` rows.                                                                                  |
| F-REV-10 | Delete Action     | Available via row action or confirmation dialog — sets status to `deleted`. Soft delete. (PRD §8.4)                                                                                                                                                                                                     |
| F-REV-11 | View Author       | Link to user management page for the review's author (future navigation)                                                                                                                                                                                                                                |
| F-REV-12 | Bulk Actions      | **Post-MVP.** Not in the current prototype. When implemented: checkbox column added to review table, "Bulk" dropdown appears when ≥1 row selected, supports bulk Hide and bulk Delete. Confirmation dialog shows affected count. This is a planned feature — the data model and API already support it. |
| F-REV-13 | Pagination        | Table pagination with configurable page size. Shows "N reviews under review" info line.                                                                                                                                                                                                                 |

**Row action buttons (as implemented):** Two inline buttons per row — "Keep" (green border, navigates status to published) and "Hide" (red border, opens reason dialog). No ⋯ overflow menu. No checkbox column.

**Status pill rendering:**

| Status         | CSS class       | Display color | Rationale                                                                                            |
| -------------- | --------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| `published`    | `.pub`          | Green         | Positive / visible state                                                                             |
| `under_review` | `.under-review` | **Amber**     | **Action needed** — functionally distinct from hidden. Amber signals "requires admin attention now." |
| `hidden`       | `.hidden`       | Red           | Terminal / blocked state                                                                             |

> **Important:** `under_review` and `hidden` must be **visually distinct** despite both meaning "not visible on Customer Web." An admin scanning the review table needs to immediately identify which reviews need action (`under_review` = amber) vs which are already handled (`hidden` = red). Using the same color for both prevents efficient triage. The prototype uses `.hidden` (red) for both — this is a known visual gap that must be corrected in implementation.

**Report count column:** Shown as a colored badge — red background for high count (≥3 reports), amber background for lower counts.

**Moderation Reason Selection** (PRD §8.4)

| Reason Code     | Display Label         |
| --------------- | --------------------- |
| `spam`          | Spam                  |
| `inappropriate` | Inappropriate content |
| `fake_review`   | Fake review           |
| `irrelevant`    | Irrelevant            |
| `other`         | Other                 |

**Status Transitions**

```
published ──→ hidden (admin hide)
published ──→ deleted (admin soft-delete)
under_review ──→ published (admin approve)
under_review ──→ hidden (admin hide)
under_review ──→ deleted (admin soft-delete)
hidden ──→ published (admin restore)
deleted ──→ published (admin restore — requires confirmation: "This review was previously deleted. Restoring will make it visible again.")
```

**Pre-Restore Validation (deleted → published)**

Before restoring a deleted review to `published` status, the system performs the following checks. The restore is blocked if any check fails:

| #   | Check                 | Failure Condition                                   | Error Message                   |
| --- | --------------------- | --------------------------------------------------- | ------------------------------- |
| 1   | Author account status | Author's account is locked (`blocked = true`)       | "Author account is locked"      |
| 2   | Parent shop status    | Parent shop is not published (draft or unpublished) | "Shop is currently unpublished" |

Both checks run before the confirmation dialog is shown. If either check fails, the restore button is disabled and the error message is displayed inline. The admin must resolve the underlying issue (unlock the account or publish the shop) before the review can be restored.

**Rating Recalculation**: Any status change automatically triggers the parent shop's average rating and review count to be recalculated (PRD §8.5).

---

## 7. Theme Management

### 7.1 Themes (`/themes`)

> PRD Reference: §9 Service Themes

**Feature List**

| #          | Feature         | Description                                                                                                                                            |
| ---------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F-THEME-01 | Theme List      | Table of all themes inside a card. Columns: Icon + KO name, EN name, Shop count, Actions                                                               |
| F-THEME-02 | Create Theme    | "+ Add Theme" button below the table opens a form/modal: name (Korean, required), name (English, optional), icon upload, display order (PRD §9.1)      |
| F-THEME-03 | Edit Theme      | Inline "Edit" button per row — opens edit form/modal. All fields editable                                                                              |
| F-THEME-04 | Delete Theme    | Deferred from current prototype — no Delete button shown in the theme table. Backend guard still required: blocked if shops are tagged with this theme |
| F-THEME-05 | Reorder         | Deferred from current prototype — no drag handle present                                                                                               |
| F-THEME-06 | Locale Switcher | Deferred from current prototype — no locale switcher in the themes table view                                                                          |

**Theme table columns (as implemented):** Icon + KO name | EN name | Shop count | Edit button. No Slug column, no display order column, no drag handle, no Delete button visible in prototype.

**Input Constraints**

| Field          | Required             | Constraints                                                           |
| -------------- | -------------------- | --------------------------------------------------------------------- |
| Name (Korean)  | Yes                  | Max 100 characters                                                    |
| Name (English) | No                   | Max 100 characters                                                    |
| Slug           | Yes (auto-generated) | URL-friendly identifier auto-generated from the Korean name, editable |
| Icon           | No                   | Single image                                                          |
| Display Order  | No                   | Integer                                                               |

---

## 8. Location Management

### 8.1 Regions & Districts (`/locations`)

> PRD Reference: §4 Location System

**Feature List**

| #        | Feature         | Description                                                                                                                            |
| -------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| F-LOC-01 | Region List     | Table of all Level 1 regions. Columns: name (Korean), name (English), district count                                                   |
| F-LOC-02 | Create Region   | Form: name (Korean, required), name (English, optional) (PRD §4.1)                                                                     |
| F-LOC-03 | Edit Region     | Edit existing region name                                                                                                              |
| F-LOC-04 | Delete Region   | Delete a region. Only allowed if no districts exist under it. If districts exist, display warning                                      |
| F-LOC-05 | District List   | Clicking a region expands in-place to show its Level 2 districts (accordion pattern). Table: name (Korean), name (English), shop count |
| F-LOC-06 | Create District | Form: name (Korean, required), name (English, optional), parent region (auto-set from context) (PRD §4.2)                              |
| F-LOC-07 | Edit District   | Edit existing district name                                                                                                            |
| F-LOC-08 | Delete District | Delete a district. Only allowed if no shops are registered in it. If shops exist, display warning with shop count                      |
| F-LOC-09 | Locale Switcher | Switch between Korean and English name editing (PRD §11.4)                                                                             |

**Note**: Regions and districts are pre-seeded at launch with all South Korean administrative divisions (~17 regions, ~250 districts) in both locales (TSD §4.6). This page is primarily for corrections and additions.

---

## 9. Partnership Inquiry Management

### 9.1 Inquiries (`/inquiries`)

> PRD Reference: §10.3 Partnership Inquiry Management

**Feature List**

| #        | Feature             | Description                                                                                                                                                                                                                                                               |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-INQ-01 | Inquiry Card Grid   | Inquiries are displayed as a responsive card grid (3 columns). Each card shows: shop name, district + channel + date metadata, status badge, overdue warning (if >48h in `new` status), contact person details, a 5-step progress bar, and action buttons.                |
| F-INQ-02 | Filter — Status     | Single filter chip group shown inline above the grid: All / (future: New / Contacted / etc.). Defaults to All.                                                                                                                                                            |
| F-INQ-03 | Filter — Source     | Filter by source channel (future; not in current prototype)                                                                                                                                                                                                               |
| F-INQ-04 | Filter — Date       | Filter by date range (future; not in current prototype)                                                                                                                                                                                                                   |
| F-INQ-05 | Sort                | Sort by: created date (default: newest first), status                                                                                                                                                                                                                     |
| F-INQ-06 | Inquiry Detail      | Each card shows summarized info inline. Full detail modal/expand available on click (PRD §10.3.1)                                                                                                                                                                         |
| F-INQ-07 | Update Status       | Primary action button on each card changes based on current status: `new` → "Contact →" (green), `contacted` / `awaiting_info` → "Approve →" (brand color), `approved` → "Create Draft →" (brand color). Status advances via button click with confirmation where needed. |
| F-INQ-08 | Admin Notes         | "Add Note" button on each card — opens note input. Notes are internal only (PRD §10.3.1)                                                                                                                                                                                  |
| F-INQ-09 | Duplicate Detection | Visual flag on cards where same shop name + address already exists (PRD §10.3.2)                                                                                                                                                                                          |
| F-INQ-10 | Convert to Shop     | "Create Draft →" button on `approved` cards — pre-populates `/shops/new` with inquiry data (PRD §10.3.2)                                                                                                                                                                  |
| F-INQ-11 | Link to Shop        | Once a shop listing is created and published, the card shows a link to the associated shop. Status auto-set to `published` (PRD §10.3.1)                                                                                                                                  |
| F-INQ-12 | Overdue Indicator   | Cards with inquiries in `new` status for >48h display a red left border and an overdue warning label (e.g., "⚠ 48h overdue — response needed"). The page header also shows a summary count: "N open inquiries · M overdue (48h response target)" (PRD §10.3.3)            |
| F-INQ-13 | Pagination          | Pagination below the card grid if results exceed page size                                                                                                                                                                                                                |

**Progress bar step-to-status mapping:**

The 5-step progress bar on each inquiry card maps directly to the inquiry status. This mapping is deterministic — the frontend derives the active step from the status field alone, with no additional state needed.

| Step | Status          | Bar segment color                  | Notes                                                                             |
| ---- | --------------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| 1    | `new`           | Current = brand, 2–5 = gray        | First contact not yet made                                                        |
| 2    | `contacted`     | 1 = green, 2 = brand, 3–5 = gray   | Admin has reached out                                                             |
| 3    | `awaiting_info` | 1–2 = green, 3 = brand, 4–5 = gray | Waiting on owner info                                                             |
| 4    | `approved`      | 1–3 = green, 4 = brand, 5 = gray   | Ready to create listing                                                           |
| 5    | `published`     | 1–5 = green                        | Terminal — listing live                                                           |
| —    | `rejected`      | All gray                           | Terminal — no progress shown; card shows "Rejected" label instead of progress bar |

**Status transition rules (enforced server-side):**

- `new` → `contacted` only (or `rejected`)
- `contacted` → `awaiting_info` only (or `rejected`)
- `awaiting_info` → `approved` only (or `rejected`)
- `approved` → `published` only (triggered automatically when shop is created + published, or `rejected`)
- `rejected` → `new` (admin reopen — requires confirmation)
- `published` is terminal — no further transitions allowed

**Frontend derivation:** The primary action button label and state are derived entirely from the current `status` field:

| Status          | Primary button | Button style          | Action                                                |
| --------------- | -------------- | --------------------- | ----------------------------------------------------- |
| `new`           | Contact →      | Green (approve style) | Advances status to `contacted`                        |
| `contacted`     | Approve →      | Brand color           | Advances status to `awaiting_info`                    |
| `awaiting_info` | Approve →      | Brand color           | Advances status to `approved`                         |
| `approved`      | Create Draft → | Brand color           | Navigates to `/shops/new?from_inquiry={id}`           |
| `published`     | View Shop →    | Ghost                 | Links to the associated shop listing                  |
| `rejected`      | Reopen →       | Ghost                 | Advances status back to `new` (requires confirmation) |

**Status badge colors on inquiry cards:**

| Status          | Color                     |
| --------------- | ------------------------- |
| `new`           | Blue                      |
| `contacted`     | Green                     |
| `awaiting_info` | Blue (using `.new` style) |
| `approved`      | Brand color (orange)      |
| `rejected`      | Red                       |
| `published`     | Green                     |

**Overdue card styling:** Cards with overdue inquiries have a 3px red left border accent (`border-left: 3px solid var(--red)`).

**Status Flow Diagram**

```
new ──→ contacted ──→ awaiting_info ──→ approved ──→ published
  └──→ rejected       └──→ rejected      └──→ rejected
         └──→ rejected
```

---

## 10. Customer Account Management

### 10.1 Users (`/users`)

> PRD Reference: §3.1 Customer Account Management, §8.5 Admin Account Lock

**Feature List**

| #         | Feature           | Description                                                                                                                                                         |
| --------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-USER-01 | User Table        | Paginated table of all registered customers inside a card. Columns: Name (display name), Email, Reviews (count), Joined (date), Status pill, Action button          |
| F-USER-02 | Search            | Text search by display name or email (future; not in current prototype filter bar)                                                                                  |
| F-USER-03 | Filter — Status   | Filter by: All / Active / Locked (future; not in current prototype)                                                                                                 |
| F-USER-04 | Filter — Provider | Filter by: All / Email / Kakao / Naver. Deferred — no Provider column in prototype table                                                                            |
| F-USER-05 | Sort              | Sort by: registered date, review count, display name                                                                                                                |
| F-USER-06 | Lock Account      | Inline "Lock" button (red styled) per active-user row. Opens lock reason dialog → account blocked (PRD §8.5)                                                        |
| F-USER-07 | Unlock Account    | Inline "Unlock" button (green styled) per locked-user row. Confirmation → account unblocked (PRD §8.5)                                                              |
| F-USER-08 | User Detail       | Expand/modal showing full profile info, account status, lock reason (if locked), review history, activity summary. Deferred — not in current prototype row actions. |
| F-USER-09 | View Reviews      | Link to review moderation page filtered by this user's reviews. Deferred — not in current prototype row actions.                                                    |
| F-USER-10 | Pagination        | Table pagination with configurable page size                                                                                                                        |

**User table columns (as implemented):** Name | Email | Reviews (count) | Joined (date) | Status pill | Action (Lock or Unlock button). No Provider column in prototype.

**Status pill rendering:**

| Status | CSS class | Color |
| ------ | --------- | ----- |
| Active | `.pub`    | Green |
| Locked | `.hidden` | Red   |

**Lock Account Dialog** (PRD §8.5)

```
⚠️ Lock Account

User "{display name}" will be unable to submit reviews or any content.

Reason *
[▾ Select reason]

Reasons: Spam, Fake reviews, Harassment, Abuse, Other

[Cancel]  [Lock Account]
```

**Lock Reason Selection** (PRD §8.5)

| Reason Code    | Display Label |
| -------------- | ------------- |
| `spam`         | Spam          |
| `fake_reviews` | Fake reviews  |
| `harassment`   | Harassment    |
| `abuse`        | Abuse         |
| `other`        | Other         |

**Lock/Unlock Behavior**

| Action | Effect                                                                                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lock   | Account is marked as blocked. User sees suspension message on Customer Web when attempting review submission. All existing published reviews remain visible (PRD §8.5) |
| Unlock | Account block is removed. User can resume submitting reviews (PRD §8.5)                                                                                                |

---

## 11. Board Post Management

### 11.1 Board Post List (`/board-posts`)

> TSD Reference: §4.4.8 `board_posts`, §5.6 Admin Web Features

**Feature List**

| #        | Feature           | Description                                                                                                                                                                             |
| -------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-BRD-01 | Post Table        | Paginated table of all board posts. Columns: featured image (thumbnail), title, type (recommendation/info), category, status (published/draft), featured, HOT, view count, created date |
| F-BRD-02 | Filter — Status   | Filter by: All / Published / Draft                                                                                                                                                      |
| F-BRD-03 | Filter — Type     | Filter by: All / Recommendation / Info                                                                                                                                                  |
| F-BRD-04 | Filter — Category | Filter by category badge (e.g., "실전팁", "초보가이드")                                                                                                                                 |
| F-BRD-05 | Sort              | Sort by: created date (default: newest first), view count, like count                                                                                                                   |
| F-BRD-06 | Publish Action    | Quick publish button on each row. Post becomes visible on Customer Web immediately                                                                                                      |
| F-BRD-07 | Unpublish Action  | Quick unpublish button on each row. Post is hidden from Customer Web                                                                                                                    |
| F-BRD-08 | Delete Action     | Soft delete post. Requires confirmation dialog                                                                                                                                          |
| F-BRD-09 | Create Button     | Navigate to `/board-posts/new`                                                                                                                                                          |
| F-BRD-10 | Edit Button       | Navigate to `/board-posts/[id]` for the selected post                                                                                                                                   |
| F-BRD-11 | Pagination        | Table pagination with configurable page size (10, 20, 50)                                                                                                                               |

### 11.2 Board Post Create (`/board-posts/new`)

> TSD Reference: §4.4.8 `board_posts`

**Feature List**

| #        | Feature          | Description                                                                                                                        |
| -------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| F-BRD-12 | Basic Info Form  | Input fields: title, body (rich text editor), excerpt (optional — auto-generated from body if empty), category badge, author name  |
| F-BRD-13 | Type Selection   | Dropdown: `recommendation` or `info` (TSD §4.4.8)                                                                                  |
| F-BRD-14 | Region Selection | Optional region selection for region filtering (recommendation posts)                                                              |
| F-BRD-15 | Linked Shop      | Optional shop selector for recommendation posts. Search shops by name to link (FK to `shops`)                                      |
| F-BRD-16 | Featured Image   | Upload a single featured image for the post card thumbnail                                                                         |
| F-BRD-17 | Featured Toggle  | Boolean toggle to show post in featured banner carousel                                                                            |
| F-BRD-18 | HOT Badge Toggle | Boolean toggle to display HOT badge on the post                                                                                    |
| F-BRD-19 | Save as Draft    | Save post without publishing                                                                                                       |
| F-BRD-20 | Save & Publish   | Save post and publish immediately                                                                                                  |
| F-BRD-21 | Locale Switcher  | Switch between Korean and English content editing. Korean fields must be saved before English editing is enabled (TSD §4.4.8 i18n) |

**Input Constraints**

| Field          | Required | Constraints                                           |
| -------------- | -------- | ----------------------------------------------------- |
| Title          | Yes      | Max 255 characters                                    |
| Body           | Yes      | Rich text                                             |
| Excerpt        | No       | Max 500 characters. Auto-generated from body if empty |
| Category       | No       | Max 50 characters                                     |
| Author Name    | Yes      | Max 100 characters                                    |
| Type           | Yes      | `recommendation` or `info`                            |
| Region         | No       | Select from available regions                         |
| Linked Shop    | No       | Select from existing shops (recommendation type only) |
| Featured Image | No       | Single image                                          |

### 11.3 Board Post Edit (`/board-posts/[id]`)

> TSD Reference: §4.4.8 `board_posts`

| #        | Feature                  | Description                                                                                          |
| -------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| F-BRD-22 | Load Existing Data       | Pre-populate all form fields with the post's current data                                            |
| F-BRD-23 | Edit All Fields          | All fields from Board Post Create (F-BRD-12 through F-BRD-21) are editable                           |
| F-BRD-24 | Save Changes             | Save updated data. If published, changes are reflected on Customer Web immediately                   |
| F-BRD-25 | Publish/Unpublish Toggle | Change visibility status from this page (same behavior as F-BRD-06/F-BRD-07)                         |
| F-BRD-26 | Locale Switcher          | Switch between Korean and English content editing. Shows indicator if English translation is missing |

---

## 12. Event Management

### 12.1 Event List (`/events`)

> TSD Reference: §4.4.11 `events`, §5.6 Admin Web Features

**Feature List**

| #        | Feature                | Description                                                                                                                                                                           |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-EVT-01 | Event Table            | Paginated table of all events. Columns: featured image (thumbnail), title, category, start date, end date, D-day status, status (published/draft), featured, view count, created date |
| F-EVT-02 | Filter — Status        | Filter by: All / Published / Draft                                                                                                                                                    |
| F-EVT-03 | Filter — Category      | Filter by: All / New Opening / Closing Soon / Coupon / Winner Announcement / General                                                                                                  |
| F-EVT-04 | Filter — Date Range    | Filter by event date range (start/end overlap)                                                                                                                                        |
| F-EVT-05 | Filter — Active Status | Filter by: All / Ongoing (end_date >= today) / Ended (end_date < today)                                                                                                               |
| F-EVT-06 | Sort                   | Sort by: created date (default: newest first), start date, end date, view count                                                                                                       |
| F-EVT-07 | Publish Action         | Quick publish button on each row. Event becomes visible on Customer Web immediately                                                                                                   |
| F-EVT-08 | Unpublish Action       | Quick unpublish button on each row. Event is hidden from Customer Web                                                                                                                 |
| F-EVT-09 | Delete Action          | Soft delete event. Requires confirmation dialog                                                                                                                                       |
| F-EVT-10 | Create Button          | Navigate to `/events/new`                                                                                                                                                             |
| F-EVT-11 | Edit Button            | Navigate to `/events/[id]` for the selected event                                                                                                                                     |
| F-EVT-12 | Pagination             | Table pagination with configurable page size (10, 20, 50)                                                                                                                             |

### 12.2 Event Create (`/events/new`)

> TSD Reference: §4.4.11 `events`

**Feature List**

| #        | Feature            | Description                                                                                                                         |
| -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| F-EVT-13 | Basic Info Form    | Input fields: title, body (rich text editor), disclaimers (optional), author name                                                   |
| F-EVT-14 | Category Selection | Dropdown: `new_opening`, `closing_soon`, `coupon`, `winner_announcement`, `general` (TSD §4.4.11)                                   |
| F-EVT-15 | Date Range Picker  | Start date and end date pickers (KST). End date must be >= start date. D-day is computed from end date                              |
| F-EVT-16 | Banner Image       | Upload a single full-width banner image for the event detail page                                                                   |
| F-EVT-17 | Featured Image     | Upload a single card thumbnail image for event listings                                                                             |
| F-EVT-18 | Featured Toggle    | Boolean toggle to show event in hero banner carousel                                                                                |
| F-EVT-19 | Save as Draft      | Save event without publishing                                                                                                       |
| F-EVT-20 | Save & Publish     | Save event and publish immediately                                                                                                  |
| F-EVT-21 | Locale Switcher    | Switch between Korean and English content editing. Korean fields must be saved before English editing is enabled (TSD §4.4.11 i18n) |

**Input Constraints**

| Field          | Required | Constraints                                                                     |
| -------------- | -------- | ------------------------------------------------------------------------------- |
| Title          | Yes      | Max 255 characters                                                              |
| Body           | Yes      | Rich text                                                                       |
| Category       | Yes      | Enum: `new_opening`, `closing_soon`, `coupon`, `winner_announcement`, `general` |
| Start Date     | Yes      | Date (KST)                                                                      |
| End Date       | Yes      | Date (KST), must be >= start date                                               |
| Disclaimers    | No       | Text                                                                            |
| Author Name    | Yes      | Max 100 characters                                                              |
| Banner Image   | No       | Single image                                                                    |
| Featured Image | No       | Single image                                                                    |

### 12.3 Event Edit (`/events/[id]`)

> TSD Reference: §4.4.11 `events`

| #        | Feature                  | Description                                                                                          |
| -------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| F-EVT-22 | Load Existing Data       | Pre-populate all form fields with the event's current data                                           |
| F-EVT-23 | Edit All Fields          | All fields from Event Create (F-EVT-13 through F-EVT-21) are editable                                |
| F-EVT-24 | Save Changes             | Save updated data. If published, changes are reflected on Customer Web immediately                   |
| F-EVT-25 | Publish/Unpublish Toggle | Change visibility status from this page (same behavior as F-EVT-07/F-EVT-08)                         |
| F-EVT-26 | Locale Switcher          | Switch between Korean and English content editing. Shows indicator if English translation is missing |

---

## 13. Notice Management

### 13.1 Notice List (`/notices`)

> TSD Reference: §4.4.12 `notices`, §5.6 Admin Web Features

**Feature List**

| #        | Feature            | Description                                                                                                                                       |
| -------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-NTC-01 | Notice Table       | Paginated table of all notices. Columns: title, category (notice/general), important (pinned), status (published/draft), view count, created date |
| F-NTC-02 | Filter — Status    | Filter by: All / Published / Draft                                                                                                                |
| F-NTC-03 | Filter — Category  | Filter by: All / Notice / General                                                                                                                 |
| F-NTC-04 | Filter — Important | Filter by: All / Important (pinned) / Normal                                                                                                      |
| F-NTC-05 | Sort               | Sort by: created date (default: newest first), view count                                                                                         |
| F-NTC-06 | Publish Action     | Quick publish button on each row. Notice becomes visible on Customer Web immediately                                                              |
| F-NTC-07 | Unpublish Action   | Quick unpublish button on each row. Notice is hidden from Customer Web                                                                            |
| F-NTC-08 | Delete Action      | Soft delete notice. Requires confirmation dialog                                                                                                  |
| F-NTC-09 | Create Button      | Navigate to `/notices/new`                                                                                                                        |
| F-NTC-10 | Edit Button        | Navigate to `/notices/[id]` for the selected notice                                                                                               |
| F-NTC-11 | Pagination         | Table pagination with configurable page size (10, 20, 50)                                                                                         |

### 13.2 Notice Create (`/notices/new`)

> TSD Reference: §4.4.12 `notices`

**Feature List**

| #        | Feature            | Description                                                                                                                         |
| -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| F-NTC-12 | Basic Info Form    | Input fields: title, body (rich text editor)                                                                                        |
| F-NTC-13 | Category Selection | Dropdown: `notice` or `general` (TSD §4.4.12)                                                                                       |
| F-NTC-14 | Important Toggle   | Boolean toggle to pin the notice to the top of the notice list (displayed with pinned indicator on Customer Web)                    |
| F-NTC-15 | Save as Draft      | Save notice without publishing                                                                                                      |
| F-NTC-16 | Save & Publish     | Save notice and publish immediately                                                                                                 |
| F-NTC-17 | Locale Switcher    | Switch between Korean and English content editing. Korean fields must be saved before English editing is enabled (TSD §4.4.12 i18n) |

**Input Constraints**

| Field    | Required | Constraints               |
| -------- | -------- | ------------------------- |
| Title    | Yes      | Max 255 characters        |
| Body     | Yes      | Rich text                 |
| Category | Yes      | Enum: `notice`, `general` |

### 13.3 Notice Edit (`/notices/[id]`)

> TSD Reference: §4.4.12 `notices`

| #        | Feature                  | Description                                                                                          |
| -------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| F-NTC-18 | Load Existing Data       | Pre-populate all form fields with the notice's current data                                          |
| F-NTC-19 | Edit All Fields          | All fields from Notice Create (F-NTC-12 through F-NTC-17) are editable                               |
| F-NTC-20 | Save Changes             | Save updated data. If published, changes are reflected on Customer Web immediately                   |
| F-NTC-21 | Publish/Unpublish Toggle | Change visibility status from this page (same behavior as F-NTC-06/F-NTC-07)                         |
| F-NTC-22 | Locale Switcher          | Switch between Korean and English content editing. Shows indicator if English translation is missing |

---

## 14. Community Moderation

### 14.1 Community Posts (`/community-posts`)

> TSD Reference: §4.4.9 `community_posts`, §5.6 Admin Web Features

**Feature List**

| #        | Feature         | Description                                                                                                                                                                    |
| -------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F-CMT-01 | Post Table      | Paginated table of all community posts. Columns: content (truncated), author, hashtags, status (published/hidden/deleted), like count, comment count, view count, created date |
| F-CMT-02 | Filter — Status | Filter by: All / Published / Hidden / Deleted                                                                                                                                  |
| F-CMT-03 | Filter — Author | Filter by author display name                                                                                                                                                  |
| F-CMT-04 | Filter — Date   | Filter by date range                                                                                                                                                           |
| F-CMT-05 | Sort            | Sort by: created date (default: newest first), like count, comment count, view count                                                                                           |
| F-CMT-06 | Post Detail     | Expand/modal to show full post content, photos, video, author info, hashtags, location text                                                                                    |
| F-CMT-07 | Hide Post       | Change status to `hidden`. Post is immediately removed from the Customer Web feed. Requires confirmation dialog                                                                |
| F-CMT-08 | Unhide Post     | Change status back to `published`. Post is restored to the Customer Web feed                                                                                                   |
| F-CMT-09 | Delete Post     | Change status to `deleted`. Soft delete — preserved in database. Requires confirmation dialog                                                                                  |
| F-CMT-10 | View Author     | Link to user management page for the post's author                                                                                                                             |
| F-CMT-11 | View Comments   | Expand to show all comments on the post. Admin can hide or delete individual comments                                                                                          |
| F-CMT-12 | Pagination      | Table pagination with configurable page size (10, 20, 50)                                                                                                                      |

**Status Transitions**

```
published ──→ hidden (admin hide)
published ──→ deleted (admin soft-delete)
hidden ──→ published (admin unhide/restore)
deleted ──→ published (admin restore — requires confirmation: "This post was previously deleted. Restoring will make it visible again.")
```

---

## 15. Audit Log

### 15.1 Audit Log Viewer (`/audit-log`)

> PRD Reference: §7.3 Audit Log, TSD §4.4.7, §5.3.4

**Feature List**

| #          | Feature              | Description                                                                                                                                                                                                                                  |
| ---------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-AUDIT-01 | Log Table            | Paginated flat table of all audit entries. Columns: Timestamp (monospace), Admin, Shop (document name), Action (status pill), Field (monospace), Change (before → after with strikethrough/green styling)                                    |
| F-AUDIT-02 | Filter — Change Type | Filter chips: All Changes / Publish/Unpublish / Field Updates. Selecting a chip filters the table to that category of action.                                                                                                                |
| F-AUDIT-03 | Filter — Action      | Future filter (not in current prototype)                                                                                                                                                                                                     |
| F-AUDIT-04 | Filter — Admin User  | Future filter (not in current prototype)                                                                                                                                                                                                     |
| F-AUDIT-05 | Filter — Date        | Future filter (not in current prototype)                                                                                                                                                                                                     |
| F-AUDIT-06 | Filter — Document    | Text search input: "Search shop or field..." — filters by shop name or field name                                                                                                                                                            |
| F-AUDIT-07 | Change Display       | Each row shows the field that changed and before/after values inline in the Change column. Before value shown with red strikethrough styling; after value shown in green. No expand/collapse — all diffs are flat, one row per field change. |
| F-AUDIT-08 | Sort                 | Sort by: timestamp (default: newest first)                                                                                                                                                                                                   |
| F-AUDIT-09 | Pagination           | Table pagination. Shows "Showing N–M of Total log entries"                                                                                                                                                                                   |

**Flat row format (as implemented):** Each audit log entry is a single table row containing all information inline: timestamp, admin name, shop name, action pill, field name (monospace), and before→after change inline. There is no expandable row — each field change in a single save operation generates its own flat row.

**Action pill color mapping:**

| Action       | CSS class | Color |
| ------------ | --------- | ----- |
| published    | `.pub`    | Green |
| field update | `.draft`  | Amber |
| unpublished  | `.hidden` | Red   |
| created      | `.new`    | Blue  |

**Change column format:** `<span class="diff-old">before_value</span> → <span class="diff-new">after_value</span>`. Old value has red strikethrough text; new value is green.

> See TSD §4.4.7 for the detailed data schema.

**Expanded Audit Scope**

The audit log covers ALL state-changing admin actions, not only shop changes:

| Content Type        | Audited Actions                                                                    |
| ------------------- | ---------------------------------------------------------------------------------- |
| Shop                | Create, Update, Delete, Publish, Unpublish                                         |
| Theme               | Create, Update, Delete                                                             |
| Region / District   | Create, Update, Delete                                                             |
| Review              | Hide, Restore, Delete (moderation actions)                                         |
| Partnership Inquiry | Status changes (New → Contacted → Awaiting Info → Approved → Rejected → Published) |
| User (Customer)     | Lock, Unlock                                                                       |
| Board Post          | Create, Update, Delete, Publish, Unpublish                                         |
| Event               | Create, Update, Delete, Publish, Unpublish                                         |
| Notice              | Create, Update, Delete, Publish, Unpublish                                         |
| Community Post      | Hide, Restore, Delete (moderation actions)                                         |

**Security Event Log**

In addition to the content audit log, the following security-sensitive events are logged server-side for monitoring and incident response:

| Event                                    | Logged Fields                                 |
| ---------------------------------------- | --------------------------------------------- |
| Failed login attempt (admin or customer) | Email, IP address, timestamp, failure reason  |
| Account lock/unlock                      | Target user, acting admin, reason, timestamp  |
| Password reset request                   | Email, IP address, timestamp, delivery status |
| Admin login/logout                       | Admin user, IP address, timestamp             |
| Session expiration                       | User, session age, timestamp                  |

> Security events are stored in a dedicated `security_events` log (separate from the content audit log). Retention: 90 days minimum. See TSD for implementation details.

---

## 16. Global Layout & Navigation

### 16.1 Shell Layout

The Admin Web uses a **sidebar-only shell**. There is no separate full-width global header bar. The layout consists of:

- **Left Sidebar** (fixed width, full viewport height): Contains the logo mark, navigation group sections, and admin user identity at the bottom.
- **Topbar** (fixed, inside the main content area): Shows the current page title, breadcrumb path (e.g., "SWIDA Admin › Overview"), and contextual action buttons (e.g., "+ New Shop", "Export CSV") on the right side. This is a page-level topbar, not a global header.
- **Main Content Area** (scrollable, fills remaining width): Page body with tables, forms, and cards.

### 16.2 Admin Sidebar

| #        | Feature             | Description                                                                                                                                                                                                                                                                                                  |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F-NAV-01 | Logo                | "SWIDA" logo mark at the top of the sidebar — links to `/dashboard`                                                                                                                                                                                                                                          |
| F-NAV-02 | Dashboard Link      | Group: Overview. Navigate to `/dashboard`                                                                                                                                                                                                                                                                    |
| F-NAV-03 | Shops Link          | Group: Content. Navigate to `/shops`. Badge shows total shop count                                                                                                                                                                                                                                           |
| F-NAV-04 | New Shop Link       | Group: Content. Navigate to `/shops/new` directly                                                                                                                                                                                                                                                            |
| F-NAV-05 | Themes Link         | Group: Content. Navigate to `/themes`                                                                                                                                                                                                                                                                        |
| F-NAV-06 | Locations Link      | Group: Content. Navigate to `/locations`                                                                                                                                                                                                                                                                     |
| F-NAV-07 | Reviews Link        | Group: Moderation. Navigate to `/reviews`. Badge shows `under_review` count in yellow                                                                                                                                                                                                                        |
| F-NAV-08 | Partnership Link    | Group: Moderation. Navigate to `/inquiries`. Badge shows `new` inquiry count                                                                                                                                                                                                                                 |
| F-NAV-09 | Users Link          | Group: Moderation. Navigate to `/users`                                                                                                                                                                                                                                                                      |
| F-NAV-10 | Audit Log Link      | Group: System. Navigate to `/audit-log`                                                                                                                                                                                                                                                                      |
| F-NAV-11 | Active State        | The current page's sidebar item is visually highlighted (white text, subtle background)                                                                                                                                                                                                                      |
| F-NAV-12 | Admin User Identity | Bottom of sidebar: avatar (initial letter in brand-color circle), display name, role/domain label. Clicking this area expands a small popover containing: the admin's full email address and an explicit **"Log Out"** button. The Log Out button must be clearly visible — not hidden behind a hover state. |

**Sidebar group labels:**

| Group Label | Items                              |
| ----------- | ---------------------------------- |
| Overview    | Dashboard                          |
| Content     | Shops, New Shop, Themes, Locations |
| Moderation  | Reviews, Partnership, Users        |
| System      | Audit Log                          |

> Note: Board Posts, Events, Notices, and Community Posts links are defined in the FSD page list (§2) but not present in the current HTML prototype sidebar. They are deferred to the next prototype iteration.

### 16.3 Topbar (Page-Level)

| #        | Feature            | Description                                                                                                                                                                                                                                                      |
| -------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-NAV-13 | Page Title         | Current page name displayed in the topbar (e.g., "Dashboard", "Shops", "Reviews")                                                                                                                                                                                |
| F-NAV-14 | Breadcrumb         | Path shown below the title: "SWIDA Admin › {Section}" (e.g., "SWIDA Admin › Overview")                                                                                                                                                                           |
| F-NAV-15 | Contextual Actions | Right side of topbar shows page-specific action buttons. Examples: "+ New Shop" and "Export CSV" on the Shops page; "Cancel", "Save Draft", "Publish" on the Shop form; "Export" on the Reviews page. Default (non-action pages): current KST timestamp display. |

> Note: There is no "View Site ↗" global button or "Admin ▾" dropdown in the topbar. The Customer Web link and logout are not accessible from the topbar in the prototype. Logout is accessed from the user identity area at the bottom of the sidebar.

---

## Appendix A. Error Message Guide

| Code                                | Message                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| ERR_LOGIN                           | Invalid email or password                                                      |
| ERR_SESSION_EXPIRED                 | Session expired. Please log in again.                                          |
| ERR_UNAUTHORIZED                    | You do not have permission to perform this action.                             |
| ERR_SHOP_PUBLISH_FAIL               | Failed to publish shop. Please try again.                                      |
| ERR_SHOP_UNPUBLISH_FAIL             | Failed to unpublish shop. Please try again.                                    |
| ERR_SHOP_SAVE_FAIL                  | Failed to save shop. Please check required fields and try again.               |
| ERR_SHOP_MISSING_FIELDS             | Please fill in all required fields before saving.                              |
| ERR_IMAGE_UPLOAD_FAIL               | Failed to upload image. Please try again.                                      |
| ERR_IMAGE_TOO_LARGE                 | Image file is too large. Maximum size: 5MB.                                    |
| ERR_REVIEW_STATUS_FAIL              | Failed to update review status. Please try again.                              |
| ERR_USER_LOCK_FAIL                  | Failed to lock user account. Please try again.                                 |
| ERR_USER_UNLOCK_FAIL                | Failed to unlock user account. Please try again.                               |
| ERR_THEME_DELETE_HAS_SHOPS          | Cannot delete theme. {count} shop(s) are still tagged with this theme.         |
| ERR_REGION_DELETE_HAS_DISTRICTS     | Cannot delete region. {count} district(s) still exist under this region.       |
| ERR_DISTRICT_DELETE_HAS_SHOPS       | Cannot delete district. {count} shop(s) are still registered in this district. |
| ERR_INQUIRY_STATUS_FAIL             | Failed to update inquiry status. Please try again.                             |
| ERR_BOARD_SAVE_FAIL                 | Failed to save board post. Please check required fields and try again.         |
| ERR_BOARD_PUBLISH_FAIL              | Failed to publish board post. Please try again.                                |
| ERR_BOARD_DELETE_FAIL               | Failed to delete board post. Please try again.                                 |
| ERR_EVENT_SAVE_FAIL                 | Failed to save event. Please check required fields and try again.              |
| ERR_EVENT_PUBLISH_FAIL              | Failed to publish event. Please try again.                                     |
| ERR_EVENT_DELETE_FAIL               | Failed to delete event. Please try again.                                      |
| ERR_EVENT_DATE_INVALID              | End date must be on or after start date.                                       |
| ERR_NOTICE_SAVE_FAIL                | Failed to save notice. Please check required fields and try again.             |
| ERR_NOTICE_PUBLISH_FAIL             | Failed to publish notice. Please try again.                                    |
| ERR_NOTICE_DELETE_FAIL              | Failed to delete notice. Please try again.                                     |
| ERR_COMMUNITY_STATUS_FAIL           | Failed to update community post status. Please try again.                      |
| ERR_NETWORK                         | Please check your network connection.                                          |
| ERR_SERVER                          | A temporary error occurred. Please try again shortly.                          |
| ERR_REVIEW_RESTORE_AUTHOR_LOCKED    | Author account is locked                                                       |
| ERR_REVIEW_RESTORE_SHOP_UNPUBLISHED | Shop is currently unpublished                                                  |
| ERR_IMAGE_UPLOAD_MINIO              | Image upload failed. Please try again.                                         |
| ERR_CONFLICT                        | This record was modified in another session. Please reload and try again.      |

---

## Appendix B. Inactive Reason Codes

> PRD Reference: §7.3 Inactive Reason Codes

| Code            | Display Label      | Description                               |
| --------------- | ------------------ | ----------------------------------------- |
| `closed`        | Permanently Closed | Business has permanently closed           |
| `owner_request` | Owner Request      | Shop owner requested removal from SWIDA   |
| `violation`     | Policy Violation   | Listing violated platform policies        |
| `stale`         | Unverified         | Unable to verify current operating status |
| `other`         | Other              | Free-text explanation required            |

---

## Appendix C. Partnership Inquiry Status Flow

> PRD Reference: §10.3.2 Inquiry Status Flow

| Status          | Display Label | Description                                   | Next Possible Statuses                                                        |
| --------------- | ------------- | --------------------------------------------- | ----------------------------------------------------------------------------- |
| `new`           | New           | Inquiry received, not yet contacted           | `contacted`, `rejected`                                                       |
| `contacted`     | Contacted     | Admin has reached out to the shop owner       | `awaiting_info`, `rejected`                                                   |
| `awaiting_info` | Awaiting Info | Waiting for shop owner to provide details     | `approved`, `rejected`                                                        |
| `approved`      | Approved      | Information verified, ready to create listing | `published`, `rejected`                                                       |
| `rejected`      | Rejected      | Inquiry declined                              | `new` (admin reopen — requires confirmation: "Reopen this rejected inquiry?") |
| `published`     | Published     | Shop listing is live on SWIDA                 | (terminal state — shop is managed via Shop Management from this point)        |

**SLA Indicator**: Inquiries in `new` status for more than 48 hours should be visually highlighted as overdue (PRD §10.3.3).

---

## Appendix D. Review Status Mapping

> PRD Reference: §8.5 Review Statuses

| Status         | Display Label | CSS Class       | Display Color                    | Visible on Customer Web | Counted in Rating |
| -------------- | ------------- | --------------- | -------------------------------- | ----------------------- | ----------------- |
| `published`    | Published     | `.pub`          | Green                            | Yes                     | Yes               |
| `hidden`       | Hidden        | `.hidden`       | Red                              | No                      | No                |
| `under_review` | Under Review  | `.under-review` | **Amber**                        | No                      | No                |
| `deleted`      | Deleted       | —               | Not shown as pill (soft-deleted) | No                      | No                |

> `under_review` uses amber to signal "admin action required." `hidden` uses red to signal "terminal/blocked." They must be visually distinct. See §6 for full rationale.

---

## Appendix E. Admin API Endpoints Used

The Admin Web communicates with the backend through two API surfaces: one for authentication and admin-level operations, and another for content management (shops, reviews, themes, locations, inquiries, board posts, events, notices, community posts, audit logs, users, and image uploads).

For the complete list of API endpoints, see TSD §5.2.

---

## 17. Data & UI States

This section defines the required UI behavior for all non-happy-path states. Every page and data-fetching component must handle all four states.

### 17.1 Loading State

| Context                                   | Behavior                                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Data tables (shops, reviews, users, etc.) | Show skeleton rows — same column structure as the table, with animated gray placeholder bars in each cell. Show 5 skeleton rows while loading. |
| Dashboard stat cards                      | Show skeleton card with animated placeholder for the number and delta line.                                                                    |
| Dashboard feed cards                      | Show 2–3 skeleton list items per card.                                                                                                         |
| Form fields (edit pages)                  | Show skeleton inputs in place of populated fields until data loads. Topbar action buttons are disabled (grayed out) during load.               |
| Inline actions (Publish, Hide, Lock)      | Button enters disabled + spinner state immediately on click. Remains in this state until the server responds (success or error).               |

### 17.2 Empty State

| Context                                 | Message                                         | Secondary Action     |
| --------------------------------------- | ----------------------------------------------- | -------------------- |
| Shop list — no results matching filters | "No shops found. Try adjusting your filters."   | Clear filters button |
| Shop list — no shops yet                | "No shops yet. Create your first shop listing." | "+ New Shop" button  |
| Reviews — no results matching filters   | "No reviews found. Try adjusting your filters." | Clear filters button |
| Users — no users yet                    | "No registered customers yet."                  | —                    |
| Inquiries — no open inquiries           | "No open inquiries."                            | —                    |
| Audit log — no entries                  | "No audit entries found."                       | Clear filters button |
| Dashboard pending reviews feed          | "No reviews pending moderation."                | —                    |
| Dashboard recent shops feed             | "No shops created yet."                         | —                    |
| Dashboard recent inquiries feed         | "No open inquiries."                            | —                    |

### 17.3 Server Error State

Triggered by non-2xx API responses (5xx, unexpected 4xx):

| Severity         | Trigger                                                | Behavior                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page-level error | Initial page load fails (e.g., can't fetch shop list)  | Replace table/content area with an error card: "Something went wrong. Please try again." + [Retry] button that re-fetches.                                                       |
| Action error     | A write action fails (save, publish, hide, lock, etc.) | Persistent red toast: "A temporary error occurred. Please try again shortly." Toast includes a [Retry] link that retriggers the action. Button returns to its pre-loading state. |
| 409 Conflict     | Edit form save returns 409 (concurrent edit)           | Modal dialog: "This record was modified in another session. Please reload and try again." + [Reload] button.                                                                     |
| 401 Unauthorized | Any request returns 401                                | Clear session + redirect to `/login` with message: "Session expired. Please log in again."                                                                                       |

### 17.4 Network Error State

| Trigger                                           | Behavior                                                                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Request fails with no response (timeout, offline) | Persistent red toast: "Please check your network connection." Toast remains until dismissed. Button returns to its pre-loading state. |
| Intermittent (retry succeeds)                     | Success toast replaces error toast on retry success.                                                                                  |

### 17.5 Validation Error State

| Context                                    | Behavior                                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Required field empty on submit             | Red border + inline error message below field: "This field is required."                                  |
| Field exceeds max length                   | Character counter turns red when limit approached (≥90% used), error message on submit.                   |
| Invalid format (email, URL, coordinates)   | Red border + inline error on blur.                                                                        |
| Multiple errors                            | Page scrolls to the first error field on submit. All errors are shown simultaneously — not one at a time. |
| Form-level error (e.g., no theme selected) | Inline error within the relevant card/section, plus scroll-to behavior.                                   |

---

## 18. Preview System Contract

This section defines the complete spec for the shop preview feature (F-SHOP-11, F-SHOP-32).

### 18.1 What "Preview" means

Preview allows an admin to see exactly how a shop listing will appear to a customer on the Customer Web — including draft (unpublished) shops that are not yet publicly visible.

### 18.2 How it works

| Step | Description                                                                                                                                                                                          |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Admin clicks the "Preview" button (👁) on the shop list row or the "Preview (Customer View)" button on the shop edit form.                                                                           |
| 2    | The Admin Web requests a time-limited signed preview token from the backend: `POST /api/admin/shops/{id}/preview-token`                                                                              |
| 3    | The backend generates a cryptographically signed token (JWT, 15-minute expiry) containing the `shop_documentId` and `admin_user_id`. Returns the token.                                              |
| 4    | The Admin Web opens a new browser tab with the URL: `{CUSTOMER_WEB_URL}/[locale]/shop/{slug}?preview_token={token}`                                                                                  |
| 5    | The Customer Web reads the `preview_token` query parameter. If present and valid, it fetches the shop bypassing the published-only filter (calls `GET /api/shops/{id}?status=draft` with the token). |
| 6    | The Customer Web displays the shop as it will appear when published, with a "Preview mode" banner at the top of the page indicating the shop is not yet publicly visible.                            |
| 7    | Token expiry (15 min): If the token is expired or invalid, the Customer Web shows a "Preview link expired" page. Admin must click Preview again.                                                     |

### 18.3 Draft visibility rules

| Shop status | Behavior on Customer Web (public) | Behavior with valid preview token    |
| ----------- | --------------------------------- | ------------------------------------ |
| `published` | Visible normally                  | Visible normally (token is optional) |
| `draft`     | Not visible — 404 page            | Visible with "Preview mode" banner   |

### 18.4 Environment rules

- Preview always opens the **same environment's** Customer Web. Production Admin Web previews Production Customer Web. Staging previews Staging.
- The `NEXT_PUBLIC_CUSTOMER_URL` env var in the Admin Web defines the base URL for preview links.
- Preview tokens are environment-scoped — a token generated on staging will not work on production.

---

> **Document End**
>
> This FSD v1.2 is the functional authority for the SWIDA Admin Web. See §1.5 for document authority hierarchy. This FSD should be reviewed and updated alongside the UI/UX Specification v1.2.
