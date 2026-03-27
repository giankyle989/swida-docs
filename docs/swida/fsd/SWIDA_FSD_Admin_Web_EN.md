---
title: "SWIDA — Admin Web FSD"
sidebar_label: "Admin Web FSD (EN)"
sidebar_position: 3
---

# Functional Specification Document (FSD)

## SWIDA — Admin Web

- **Version**: 1.0
- **Date**: 2026-03-26
- **Based on**: SWIDA PRD v1.1, SWIDA TSD v1.1
- **Scope**: MVP — Admin-facing platform management web application
- **Related Documents**: UI/UX Specification (to be created separately), Customer Web FSD v1.0

---

## 1. Document Overview

### 1.1 Purpose

This document defines the page list and functional specifications for the SWIDA Admin Web application. The Admin Web is the primary operational interface for managing the SWIDA platform — it serves as the dedicated admin panel for all day-to-day operations. Visual design, layout, and interaction details are covered in the separate UI/UX Specification.

### 1.2 Architecture Context

The Admin Web is a dedicated web application served at `admin.swida.com`. It connects to the backend for authentication and content management. The platform's underlying admin panel is restricted to developers only for monitoring and debugging — it is not used for any operational features defined in this document.

### 1.3 MVP Scope

| Included | Not Included (Future) |
|---|---|
| Admin authentication (email/password) | Shop owner self-service portal |
| Dashboard (platform statistics) | Advanced analytics & reports |
| Shop CRUD (create, edit, publish/unpublish) | Bulk import/export of shop listings |
| Map pin drop for lat/lng selection | Map view of all shops |
| Shop preview (customer view) | Push notification management |
| Review moderation (view, hide, delete) | Automated review moderation (AI/rules) |
| Customer account management (lock/unlock) | Coupon / deals management |
| Theme management (CRUD) | Booking system management |
| Region & district management (CRUD) | |
| Partnership inquiry management (status workflow) | |
| Board post management (CRUD) | |
| Event management (CRUD) | |
| Notice management (CRUD) | |
| Community post moderation (view, hide, delete) | |
| Audit log viewer | |
| Locale management (Korean/English content) | |

### 1.4 Global Rules

| Item | Rule |
|---|---|
| Language | Admin Web UI is in English (admin-facing, not customer-facing) |
| Date/Time | KST (Korea Standard Time, UTC+9). Format: `YYYY-MM-DD HH:mm:ss` |
| Authentication | All pages require admin authentication. Unauthenticated requests redirect to login |
| API Communication | Backend handles authentication and content operations. See TSD §5.2 for API details |
| Soft Delete Policy | Shop listings are never hard-deleted. Deactivated shops are unpublished with an inactive reason |
| Pagination | Table-based pagination with configurable page size (10, 20, 50) |
| Loading States | Skeleton placeholders for data tables and forms |
| Confirmation | All destructive actions (hide, delete, lock, unpublish) require confirmation dialog |
| Toast Notifications | Success/error feedback for all write operations |
| Responsive | Desktop-primary. Minimum supported width: 1024px |
| Input Sanitization | All admin-submitted free-text fields (shop descriptions, inactive reason details, theme names, moderation reasons) are sanitized server-side before storage. HTML tags are stripped. Output is escaped on render to prevent stored XSS on Customer Web. |
| Submit Protection | All form submit and action buttons (Save, Publish, Hide, Delete, Lock, status changes) enter a disabled + loading state on first click until the server responds. Prevents duplicate API calls from rapid clicks. |
| Conflict Detection | All edit forms include the record's `updatedAt` timestamp in save requests. On `409 Conflict` response (record modified by another session), show a modal dialog: "This record was modified in another session. Please reload and try again." with a Reload button that refreshes the page. The save action is blocked until the admin reloads. See TSD §5.3.1a for server-side implementation. |

---

## 2. Page List

| # | Page | Route | Description |
|---|---|---|---|
| 1 | Login | `/login` | Admin authentication |
| 2 | Dashboard | `/dashboard` | Platform overview statistics |
| 3 | Shop List | `/shops` | All shop listings with search, filter, sort |
| 4 | Shop Create | `/shops/new` | Create new shop listing |
| 5 | Shop Edit | `/shops/[id]` | Edit existing shop listing |
| 6 | Reviews | `/reviews` | Review moderation |
| 7 | Themes | `/themes` | Theme management |
| 8 | Locations | `/locations` | Region & district management |
| 9 | Partnership Inquiries | `/inquiries` | Partnership inquiry management |
| 10 | Users | `/users` | Customer account management |
| 11 | Board Posts | `/board-posts` | Board post management |
| 12 | Board Post Create | `/board-posts/new` | Create new board post |
| 13 | Board Post Edit | `/board-posts/[id]` | Edit existing board post |
| 14 | Events | `/events` | Event management |
| 15 | Event Create | `/events/new` | Create new event |
| 16 | Event Edit | `/events/[id]` | Edit existing event |
| 17 | Notices | `/notices` | Notice management |
| 18 | Notice Create | `/notices/new` | Create new notice |
| 19 | Notice Edit | `/notices/[id]` | Edit existing notice |
| 20 | Community Posts | `/community-posts` | Community post moderation |
| 21 | Audit Log | `/audit-log` | Change history viewer |

**Access Control**: All pages except Login require an authenticated admin session. Unauthenticated access to any page redirects to `/login`.

---

## 3. Authentication

### 3.1 Login (`/login`)

> PRD Reference: §3.1 Admin Authentication, TSD §5.4.2

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-AUTH-01 | Email/Password Login | Admins log in with email and password. The session is maintained securely |
| F-AUTH-02 | Session Storage | The admin session is stored securely in the browser and used for all subsequent requests |
| F-AUTH-03 | Post-Login Redirect | On successful login, redirect to `/dashboard` |
| F-AUTH-04 | Error Handling | Display error message for invalid credentials or server errors |
| F-AUTH-05 | Already Authenticated | If admin is already logged in, redirect from `/login` to `/dashboard` |

**Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Email | Yes | Valid email format |
| Password | Yes | Non-empty |

**Server Validation Errors**

| Condition | Error |
|---|---|
| Invalid credentials | "Invalid email or password" |
| Server unreachable | "Unable to connect to server. Please try again." |

### 3.2 Session Management

| # | Feature | Description |
|---|---|---|
| F-AUTH-06 | Session Persistence | Admin session persists across browser sessions (until expiry or logout) |
| F-AUTH-07 | Session Expiry | On session expiry, redirect to login page with message: "Session expired. Please log in again." |
| F-AUTH-08 | Logout | Clear admin session, redirect to `/login` |

### 3.3 Logout

| # | Feature | Description |
|---|---|---|
| F-LOGOUT-01 | Session Clear | Remove admin session and clear client-side state |
| F-LOGOUT-02 | Redirect | Navigate to `/login` after logout |
| F-LOGOUT-03 | Logout Button | Available in the admin header/sidebar on all authenticated pages |

---

## 4. Dashboard

### 4.1 Dashboard (`/dashboard`)

> PRD Reference: §3.1 Admin — Dashboard, §7.2 Admin-Facing Menus

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-DASH-01 | Total Shops | Count of all shops (published + draft). Show published vs draft breakdown |
| F-DASH-02 | Total Reviews | Count of all reviews. Show breakdown by status (published, hidden, under_review, deleted) |
| F-DASH-03 | Total Users | Count of registered customers. Show active vs locked count |
| F-DASH-04 | Total Inquiries | Count of partnership inquiries. Show breakdown by status (new, contacted, awaiting_info, approved, rejected, published) |
| F-DASH-05 | New Inquiries Alert | Highlight count of `new` (uncontacted) inquiries with visual indicator |
| F-DASH-06 | Pending Reviews | Count of reviews in `under_review` status requiring admin attention |
| F-DASH-07 | Recent Activity | List of recent shop publishes, review moderations, and inquiry status changes (last 10 actions) |
| F-DASH-08 | Quick Actions | Quick links to: create new shop, view pending reviews, view new inquiries |

**Data Sources**: The dashboard fetches aggregated platform statistics (shops, reviews, users, inquiries, recent activity), as well as counts of draft shops, pending reviews, and new inquiries.

> See TSD §5.2 for API details.

---

## 5. Shop Management

### 5.1 Shop List (`/shops`)

> PRD Reference: §3.1 Shop Management, §7.2 Admin-Facing Menus

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-SHOP-01 | Shop Table | Paginated table of all shops. Columns: thumbnail, name, district, themes, rating, reviews, status (published/draft), created date |
| F-SHOP-02 | Search | Text search by shop name (partial match) |
| F-SHOP-03 | Filter — Status | Filter by visibility: All / Published / Draft |
| F-SHOP-04 | Filter — Region | Filter by Level 1 region |
| F-SHOP-05 | Filter — Theme | Filter by service theme |
| F-SHOP-06 | Sort | Sort by: name, rating, review count, created date, updated date |
| F-SHOP-07 | Publish Action | Quick publish button on each row. Shop becomes visible on Customer Web immediately (PRD §7.3) |
| F-SHOP-08 | Unpublish Action | Quick unpublish button on each row. Opens inactive reason dialog before unpublishing (PRD §7.3) |
| F-SHOP-09 | Create Button | Navigate to `/shops/new` |
| F-SHOP-10 | Edit Button | Navigate to `/shops/[id]` for the selected shop |
| F-SHOP-11 | Preview Button | Open the Customer Web shop detail page in a new tab (preview/draft mode) (PRD §3.1) |
| F-SHOP-12 | Pagination | Table pagination with configurable page size (10, 20, 50) |

**Unpublish — Inactive Reason Dialog** (PRD §7.3)

| Field | Required | Options |
|---|---|---|
| Inactive Reason | Yes | `closed`, `owner_request`, `violation`, `stale`, `other` |
| Inactive Reason Detail | Only if `other` | Free-text explanation (max 500 characters) |

### 5.2 Shop Create (`/shops/new`)

> PRD Reference: §5 Shop Listing Data Model, §7.3 Admin Operational Workflows

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-SHOP-13 | Basic Info Form | Input fields for all basic information: name, description, address, operating hours, last order time, closed days, holiday exceptions, phone number (PRD §5.1) |
| F-SHOP-14 | Location Selection | Cascading dropdowns for region (Level 1) → district (Level 2) (PRD §5.1) |
| F-SHOP-15 | Map Pin Drop | Integrated Kakao Map for selecting the shop's location. Admin clicks on the map to set coordinates. Supports address search to center the map — if address not found, show "주소를 찾을 수 없습니다" toast and allow manual pin drop. Default center: Seoul City Hall. When editing an existing shop, center on saved coordinates. (PRD §3.1, TSD §5.6) |
| F-SHOP-15a | Coordinate Manual Fallback | Manual latitude/longitude text input fields are always visible below the map. Map pin drop auto-fills the text fields; manual entry overrides pin drop values. If Kakao Map JS SDK fails to load (key expired, quota exceeded, network timeout): hide the map container, show error banner "지도를 불러올 수 없습니다 — 좌표를 직접 입력하세요" / "Map unavailable — enter coordinates manually". Admin can still save the shop using manual coordinate entry. Validation: latitude −90 to 90, longitude −180 to 180, both required for save. |
| F-SHOP-16 | Theme Selection | Multi-select from all available themes (PRD §5.2) |
| F-SHOP-17 | Service Menu | Repeatable form component — add/remove service menu items. Each item: service name, duration (minutes), price (KRW), description (PRD §5.2.1) |
| F-SHOP-18 | Booking Info | Boolean toggle for booking required. Conditional input for booking URL/phone. Gender availability dropdown (PRD §5.2) |
| F-SHOP-19 | Amenities | Toggle switches for each amenity. Conditional inputs for parking type, parking detail, accessibility detail (PRD §5.3) |
| F-SHOP-20 | Contact Channels | Optional inputs: phone, KakaoTalk ID, Instagram, website URL, Naver Place URL (PRD §5.4) |
| F-SHOP-21 | Languages | Multi-select for languages supported (PRD §5.5) |
| F-SHOP-22 | Image Upload | Upload shop images (min: 1, max: 10). Accepted formats: JPEG, PNG, WebP. Max file size: 5MB per image. Drag-and-drop or file picker. Images are uploaded and stored securely (PRD §5.1). **MinIO unavailability:** If image upload fails (MinIO unreachable or storage error), show error toast "Image upload failed. Please try again." with a retry button. The shop form can still be saved as a draft without images — the image requirement (min 1) is only enforced on Publish, not on Save as Draft. |
| F-SHOP-23 | Thumbnail Selection | Select one image as the primary thumbnail for search results (PRD §5.1) |
| F-SHOP-24 | Open/Close Tags | Optional custom labels for operating status display on Customer Web. Defaults: "영업중" / "영업종료" (PRD §5.6) |
| F-SHOP-25 | Save as Draft | Save shop without publishing. Creates a draft entry (PRD §7.3) |
| F-SHOP-26 | Save & Publish | Save shop and publish immediately. Shop becomes visible on Customer Web (PRD §7.3) |
| F-SHOP-27 | Locale Switcher | Switch between Korean and English content editing. Korean fields must be saved before English editing is enabled. English is optional (PRD §11.4) |

**Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Shop Name | Yes | Max 255 characters |
| Slug | Yes (auto-generated) | A URL-friendly identifier is automatically generated from the shop name, editable |
| Description | Yes | Max 500 characters |
| Address | Yes | Max 500 characters |
| Region | Yes | Select from available regions |
| District | Yes | Select from available districts (filtered by region) |
| Latitude | Yes | Decimal, set via map pin drop or manual entry. Range: −90 to 90 |
| Longitude | Yes | Decimal, set via map pin drop or manual entry. Range: −180 to 180 |
| Operating Hours | Yes | Per-day schedule: 7 day rows (Mon–Sun), each with open time and close time selectors, plus a "Closed" checkbox per day. Includes a free-text override field for special notes (e.g., "Holiday hours may vary"). The structured input populates `operating_hours` (JSONB); the text field populates `operating_hours_text`. |
| Closed Days | Yes | Text (e.g., "매주 일요일") |
| Themes | Yes | At least one theme selected |
| Service Menu | Yes | At least one service menu item |
| Images | Yes | 1–10 images |
| Thumbnail | Yes | One image selected as thumbnail |

### 5.3 Shop Edit (`/shops/[id]`)

> PRD Reference: §5 Shop Listing Data Model, §7.3 Admin Operational Workflows

| # | Feature | Description |
|---|---|---|
| F-SHOP-28 | Load Existing Data | Pre-populate all form fields with the shop's current data |
| F-SHOP-29 | Edit All Fields | All fields from Shop Create (F-SHOP-13 through F-SHOP-27) are editable |
| F-SHOP-30 | Save Changes | Save updated data. If published, changes are reflected on Customer Web immediately |
| F-SHOP-31 | Publish/Unpublish Toggle | Change visibility status from this page (same behavior as F-SHOP-07/F-SHOP-08) |
| F-SHOP-32 | Preview | Open current shop in Customer Web in new tab (PRD §3.1) |
| F-SHOP-33 | Last Verified Date | Editable date field — admin sets this when verifying the listing is still accurate (PRD §5.5) |
| F-SHOP-34 | Locale Switcher | Switch between Korean and English content editing. Shows indicator if English translation is missing (PRD §11.4) |
| F-SHOP-35 | Audit History Link | Link to audit log filtered by this shop's document ID |

---

## 6. Review Moderation

### 6.1 Review List (`/reviews`)

> PRD Reference: §8.4 Review Moderation, §8.5 Review Integrity & Abuse Prevention

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-REV-01 | Review Table | Paginated table of all reviews. Columns: shop name, author, rating, comment (truncated), status, report count, created date |
| F-REV-02 | Filter — Status | Filter by: All / Published / Hidden / Under Review / Deleted |
| F-REV-03 | Filter — Reported | Filter to show only reported reviews (report count > 0) |
| F-REV-04 | Filter — Shop | Filter by shop name |
| F-REV-05 | Filter — Date | Filter by date range |
| F-REV-06 | Sort | Sort by: created date, rating, report count |
| F-REV-07 | Review Detail | Expand/modal to show full review comment, author info, shop info, report history |
| F-REV-08 | Set Status — Hide | Change status to `hidden`. Requires moderation reason selection. Review immediately excluded from Customer Web and rating calculations (PRD §8.4) |
| F-REV-09 | Set Status — Publish | Change status to `published`. Review becomes visible on Customer Web and counted in rating (PRD §8.4) |
| F-REV-10 | Set Status — Delete | Change status to `deleted`. Soft delete — preserved in database. Requires confirmation dialog (PRD §8.4) |
| F-REV-11 | View Author | Link to user management page for the review's author |
| F-REV-12 | Bulk Actions | Select multiple reviews and apply bulk status change (hide, delete) |
| F-REV-13 | Pagination | Table pagination with configurable page size |

**Moderation Reason Selection** (PRD §8.4)

| Reason Code | Display Label |
|---|---|
| `spam` | Spam |
| `inappropriate` | Inappropriate content |
| `fake_review` | Fake review |
| `irrelevant` | Irrelevant |
| `other` | Other |

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

| # | Check | Failure Condition | Error Message |
|---|---|---|---|
| 1 | Author account status | Author's account is locked (`blocked = true`) | "Author account is locked" |
| 2 | Parent shop status | Parent shop is not published (draft or unpublished) | "Shop is currently unpublished" |

Both checks run before the confirmation dialog is shown. If either check fails, the restore button is disabled and the error message is displayed inline. The admin must resolve the underlying issue (unlock the account or publish the shop) before the review can be restored.

**Rating Recalculation**: Any status change automatically triggers the parent shop's average rating and review count to be recalculated (PRD §8.5).

---

## 7. Theme Management

### 7.1 Themes (`/themes`)

> PRD Reference: §9 Service Themes

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-THEME-01 | Theme List | Table of all themes. Columns: icon, name (Korean), name (English), URL identifier, display order, shop count |
| F-THEME-02 | Create Theme | Form: name (Korean, required), name (English, optional), URL identifier (auto-generated), icon upload, display order (PRD §9.1) |
| F-THEME-03 | Edit Theme | Edit existing theme. All fields editable |
| F-THEME-04 | Delete Theme | Delete a theme. Confirmation dialog. Blocked if shops are tagged with this theme — display warning with shop count. Admin must untag all shops first before deletion is allowed. |
| F-THEME-05 | Reorder | Drag-and-drop or manual number input to change display order |
| F-THEME-06 | Locale Switcher | Switch between Korean and English name editing (PRD §11.4) |

**Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Name (Korean) | Yes | Max 100 characters |
| Name (English) | No | Max 100 characters |
| Slug | Yes (auto-generated) | A URL-friendly identifier is automatically generated from the Korean name, editable |
| Icon | No | Single image |
| Display Order | No | Integer |

---

## 8. Location Management

### 8.1 Regions & Districts (`/locations`)

> PRD Reference: §4 Location System

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-LOC-01 | Region List | Table of all Level 1 regions. Columns: name (Korean), name (English), district count |
| F-LOC-02 | Create Region | Form: name (Korean, required), name (English, optional) (PRD §4.1) |
| F-LOC-03 | Edit Region | Edit existing region name |
| F-LOC-04 | Delete Region | Delete a region. Only allowed if no districts exist under it. If districts exist, display warning |
| F-LOC-05 | District List | Clicking a region expands in-place to show its Level 2 districts (accordion pattern). Table: name (Korean), name (English), shop count |
| F-LOC-06 | Create District | Form: name (Korean, required), name (English, optional), parent region (auto-set from context) (PRD §4.2) |
| F-LOC-07 | Edit District | Edit existing district name |
| F-LOC-08 | Delete District | Delete a district. Only allowed if no shops are registered in it. If shops exist, display warning with shop count |
| F-LOC-09 | Locale Switcher | Switch between Korean and English name editing (PRD §11.4) |

**Note**: Regions and districts are pre-seeded at launch with all South Korean administrative divisions (~17 regions, ~250 districts) in both locales (TSD §4.6). This page is primarily for corrections and additions.

---

## 9. Partnership Inquiry Management

### 9.1 Inquiries (`/inquiries`)

> PRD Reference: §10.3 Partnership Inquiry Management

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-INQ-01 | Inquiry Table | Paginated table of all inquiries. Columns: shop name, contact person, phone, preferred channel, status, source, created date |
| F-INQ-02 | Filter — Status | Filter by: All / New / Contacted / Awaiting Info / Approved / Rejected / Published |
| F-INQ-03 | Filter — Source | Filter by: All / Website Form / Email / KakaoTalk / Instagram |
| F-INQ-04 | Filter — Date | Filter by date range |
| F-INQ-05 | Sort | Sort by: created date (default: newest first), status |
| F-INQ-06 | Inquiry Detail | Expand/modal to show all inquiry fields including message and admin notes |
| F-INQ-07 | Update Status | Change inquiry status via dropdown. Status flow: `new` → `contacted` → `awaiting_info` → `approved` → `published`. Any status except `published` → `rejected`. `rejected` → `new` (reopen). `published` is terminal — shop is managed via Shop Management. (PRD §10.3.2) |
| F-INQ-08 | Admin Notes | Add/edit internal notes on any inquiry. Notes are not visible to the public (PRD §10.3.1) |
| F-INQ-09 | Duplicate Detection | Visual flag/badge on inquiries where same shop name + address already exists in another inquiry or shop listing (PRD §10.3.2) |
| F-INQ-10 | Convert to Shop | Button on `approved` inquiries: "Create Shop Listing". Pre-populates a new shop form (`/shops/new`) with inquiry data (shop name, address, business type, contact info) (PRD §10.3.2) |
| F-INQ-11 | Link to Shop | Once a shop listing is created and published from an inquiry, the inquiry shows a link to the associated shop. Status automatically set to `published` (PRD §10.3.1) |
| F-INQ-12 | New Inquiry Badge | Visual badge/counter showing unread `new` inquiries. 48-hour goal indicator — highlight inquiries still in `new` status (not yet moved to `contacted`) for more than 48 hours (PRD §10.3.3) |
| F-INQ-13 | Pagination | Table pagination with configurable page size |

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

| # | Feature | Description |
|---|---|---|
| F-USER-01 | User Table | Paginated table of all registered customers. Columns: display name, email, provider (email/kakao/naver), status (active/locked), review count, registered date |
| F-USER-02 | Search | Text search by display name or email |
| F-USER-03 | Filter — Status | Filter by: All / Active / Locked |
| F-USER-04 | Filter — Provider | Filter by: All / Email / Kakao / Naver |
| F-USER-05 | Sort | Sort by: registered date, review count, display name |
| F-USER-06 | Lock Account | Lock/suspend a customer account. Requires lock reason selection. Locked accounts cannot submit reviews or any user-generated content (PRD §8.5) |
| F-USER-07 | Unlock Account | Unlock a previously locked account. Account regains review submission ability (PRD §8.5) |
| F-USER-08 | User Detail | Expand/modal showing: all profile info, account status, lock reason (if locked), review history, activity summary |
| F-USER-09 | View Reviews | Link to review moderation page filtered by this user's reviews |
| F-USER-10 | Pagination | Table pagination with configurable page size |

**Lock Reason Selection** (PRD §8.5)

| Reason Code | Display Label |
|---|---|
| `spam` | Spam |
| `fake_reviews` | Fake reviews |
| `harassment` | Harassment |
| `abuse` | Abuse |
| `other` | Other |

**Lock/Unlock Behavior**

| Action | Effect |
|---|---|
| Lock | Account is marked as blocked. User sees suspension message on Customer Web when attempting review submission. All existing published reviews remain visible (PRD §8.5) |
| Unlock | Account block is removed. User can resume submitting reviews (PRD §8.5) |

---

## 11. Board Post Management

### 11.1 Board Post List (`/board-posts`)

> TSD Reference: §4.4.8 `board_posts`, §5.6 Admin Web Features

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-BRD-01 | Post Table | Paginated table of all board posts. Columns: featured image (thumbnail), title, type (recommendation/info), category, status (published/draft), featured, HOT, view count, created date |
| F-BRD-02 | Filter — Status | Filter by: All / Published / Draft |
| F-BRD-03 | Filter — Type | Filter by: All / Recommendation / Info |
| F-BRD-04 | Filter — Category | Filter by category badge (e.g., "실전팁", "초보가이드") |
| F-BRD-05 | Sort | Sort by: created date (default: newest first), view count, like count |
| F-BRD-06 | Publish Action | Quick publish button on each row. Post becomes visible on Customer Web immediately |
| F-BRD-07 | Unpublish Action | Quick unpublish button on each row. Post is hidden from Customer Web |
| F-BRD-08 | Delete Action | Soft delete post. Requires confirmation dialog |
| F-BRD-09 | Create Button | Navigate to `/board-posts/new` |
| F-BRD-10 | Edit Button | Navigate to `/board-posts/[id]` for the selected post |
| F-BRD-11 | Pagination | Table pagination with configurable page size (10, 20, 50) |

### 11.2 Board Post Create (`/board-posts/new`)

> TSD Reference: §4.4.8 `board_posts`

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-BRD-12 | Basic Info Form | Input fields: title, body (rich text editor), excerpt (optional — auto-generated from body if empty), category badge, author name |
| F-BRD-13 | Type Selection | Dropdown: `recommendation` or `info` (TSD §4.4.8) |
| F-BRD-14 | Region Selection | Optional region selection for region filtering (recommendation posts) |
| F-BRD-15 | Linked Shop | Optional shop selector for recommendation posts. Search shops by name to link (FK to `shops`) |
| F-BRD-16 | Featured Image | Upload a single featured image for the post card thumbnail |
| F-BRD-17 | Featured Toggle | Boolean toggle to show post in featured banner carousel |
| F-BRD-18 | HOT Badge Toggle | Boolean toggle to display HOT badge on the post |
| F-BRD-19 | Save as Draft | Save post without publishing |
| F-BRD-20 | Save & Publish | Save post and publish immediately |
| F-BRD-21 | Locale Switcher | Switch between Korean and English content editing. Korean fields must be saved before English editing is enabled (TSD §4.4.8 i18n) |

**Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Title | Yes | Max 255 characters |
| Body | Yes | Rich text |
| Excerpt | No | Max 500 characters. Auto-generated from body if empty |
| Category | No | Max 50 characters |
| Author Name | Yes | Max 100 characters |
| Type | Yes | `recommendation` or `info` |
| Region | No | Select from available regions |
| Linked Shop | No | Select from existing shops (recommendation type only) |
| Featured Image | No | Single image |

### 11.3 Board Post Edit (`/board-posts/[id]`)

> TSD Reference: §4.4.8 `board_posts`

| # | Feature | Description |
|---|---|---|
| F-BRD-22 | Load Existing Data | Pre-populate all form fields with the post's current data |
| F-BRD-23 | Edit All Fields | All fields from Board Post Create (F-BRD-12 through F-BRD-21) are editable |
| F-BRD-24 | Save Changes | Save updated data. If published, changes are reflected on Customer Web immediately |
| F-BRD-25 | Publish/Unpublish Toggle | Change visibility status from this page (same behavior as F-BRD-06/F-BRD-07) |
| F-BRD-26 | Locale Switcher | Switch between Korean and English content editing. Shows indicator if English translation is missing |

---

## 12. Event Management

### 12.1 Event List (`/events`)

> TSD Reference: §4.4.11 `events`, §5.6 Admin Web Features

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVT-01 | Event Table | Paginated table of all events. Columns: featured image (thumbnail), title, category, start date, end date, D-day status, status (published/draft), featured, view count, created date |
| F-EVT-02 | Filter — Status | Filter by: All / Published / Draft |
| F-EVT-03 | Filter — Category | Filter by: All / New Opening / Closing Soon / Coupon / Winner Announcement / General |
| F-EVT-04 | Filter — Date Range | Filter by event date range (start/end overlap) |
| F-EVT-05 | Filter — Active Status | Filter by: All / Ongoing (end_date >= today) / Ended (end_date < today) |
| F-EVT-06 | Sort | Sort by: created date (default: newest first), start date, end date, view count |
| F-EVT-07 | Publish Action | Quick publish button on each row. Event becomes visible on Customer Web immediately |
| F-EVT-08 | Unpublish Action | Quick unpublish button on each row. Event is hidden from Customer Web |
| F-EVT-09 | Delete Action | Soft delete event. Requires confirmation dialog |
| F-EVT-10 | Create Button | Navigate to `/events/new` |
| F-EVT-11 | Edit Button | Navigate to `/events/[id]` for the selected event |
| F-EVT-12 | Pagination | Table pagination with configurable page size (10, 20, 50) |

### 12.2 Event Create (`/events/new`)

> TSD Reference: §4.4.11 `events`

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVT-13 | Basic Info Form | Input fields: title, body (rich text editor), disclaimers (optional), author name |
| F-EVT-14 | Category Selection | Dropdown: `new_opening`, `closing_soon`, `coupon`, `winner_announcement`, `general` (TSD §4.4.11) |
| F-EVT-15 | Date Range Picker | Start date and end date pickers (KST). End date must be >= start date. D-day is computed from end date |
| F-EVT-16 | Banner Image | Upload a single full-width banner image for the event detail page |
| F-EVT-17 | Featured Image | Upload a single card thumbnail image for event listings |
| F-EVT-18 | Featured Toggle | Boolean toggle to show event in hero banner carousel |
| F-EVT-19 | Save as Draft | Save event without publishing |
| F-EVT-20 | Save & Publish | Save event and publish immediately |
| F-EVT-21 | Locale Switcher | Switch between Korean and English content editing. Korean fields must be saved before English editing is enabled (TSD §4.4.11 i18n) |

**Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Title | Yes | Max 255 characters |
| Body | Yes | Rich text |
| Category | Yes | Enum: `new_opening`, `closing_soon`, `coupon`, `winner_announcement`, `general` |
| Start Date | Yes | Date (KST) |
| End Date | Yes | Date (KST), must be >= start date |
| Disclaimers | No | Text |
| Author Name | Yes | Max 100 characters |
| Banner Image | No | Single image |
| Featured Image | No | Single image |

### 12.3 Event Edit (`/events/[id]`)

> TSD Reference: §4.4.11 `events`

| # | Feature | Description |
|---|---|---|
| F-EVT-22 | Load Existing Data | Pre-populate all form fields with the event's current data |
| F-EVT-23 | Edit All Fields | All fields from Event Create (F-EVT-13 through F-EVT-21) are editable |
| F-EVT-24 | Save Changes | Save updated data. If published, changes are reflected on Customer Web immediately |
| F-EVT-25 | Publish/Unpublish Toggle | Change visibility status from this page (same behavior as F-EVT-07/F-EVT-08) |
| F-EVT-26 | Locale Switcher | Switch between Korean and English content editing. Shows indicator if English translation is missing |

---

## 13. Notice Management

### 13.1 Notice List (`/notices`)

> TSD Reference: §4.4.12 `notices`, §5.6 Admin Web Features

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-NTC-01 | Notice Table | Paginated table of all notices. Columns: title, category (notice/general), important (pinned), status (published/draft), view count, created date |
| F-NTC-02 | Filter — Status | Filter by: All / Published / Draft |
| F-NTC-03 | Filter — Category | Filter by: All / Notice / General |
| F-NTC-04 | Filter — Important | Filter by: All / Important (pinned) / Normal |
| F-NTC-05 | Sort | Sort by: created date (default: newest first), view count |
| F-NTC-06 | Publish Action | Quick publish button on each row. Notice becomes visible on Customer Web immediately |
| F-NTC-07 | Unpublish Action | Quick unpublish button on each row. Notice is hidden from Customer Web |
| F-NTC-08 | Delete Action | Soft delete notice. Requires confirmation dialog |
| F-NTC-09 | Create Button | Navigate to `/notices/new` |
| F-NTC-10 | Edit Button | Navigate to `/notices/[id]` for the selected notice |
| F-NTC-11 | Pagination | Table pagination with configurable page size (10, 20, 50) |

### 13.2 Notice Create (`/notices/new`)

> TSD Reference: §4.4.12 `notices`

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-NTC-12 | Basic Info Form | Input fields: title, body (rich text editor) |
| F-NTC-13 | Category Selection | Dropdown: `notice` or `general` (TSD §4.4.12) |
| F-NTC-14 | Important Toggle | Boolean toggle to pin the notice to the top of the notice list (displayed with pinned indicator on Customer Web) |
| F-NTC-15 | Save as Draft | Save notice without publishing |
| F-NTC-16 | Save & Publish | Save notice and publish immediately |
| F-NTC-17 | Locale Switcher | Switch between Korean and English content editing. Korean fields must be saved before English editing is enabled (TSD §4.4.12 i18n) |

**Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Title | Yes | Max 255 characters |
| Body | Yes | Rich text |
| Category | Yes | Enum: `notice`, `general` |

### 13.3 Notice Edit (`/notices/[id]`)

> TSD Reference: §4.4.12 `notices`

| # | Feature | Description |
|---|---|---|
| F-NTC-18 | Load Existing Data | Pre-populate all form fields with the notice's current data |
| F-NTC-19 | Edit All Fields | All fields from Notice Create (F-NTC-12 through F-NTC-17) are editable |
| F-NTC-20 | Save Changes | Save updated data. If published, changes are reflected on Customer Web immediately |
| F-NTC-21 | Publish/Unpublish Toggle | Change visibility status from this page (same behavior as F-NTC-06/F-NTC-07) |
| F-NTC-22 | Locale Switcher | Switch between Korean and English content editing. Shows indicator if English translation is missing |

---

## 14. Community Moderation

### 14.1 Community Posts (`/community-posts`)

> TSD Reference: §4.4.9 `community_posts`, §5.6 Admin Web Features

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-CMT-01 | Post Table | Paginated table of all community posts. Columns: content (truncated), author, hashtags, status (published/hidden/deleted), like count, comment count, view count, created date |
| F-CMT-02 | Filter — Status | Filter by: All / Published / Hidden / Deleted |
| F-CMT-03 | Filter — Author | Filter by author display name |
| F-CMT-04 | Filter — Date | Filter by date range |
| F-CMT-05 | Sort | Sort by: created date (default: newest first), like count, comment count, view count |
| F-CMT-06 | Post Detail | Expand/modal to show full post content, photos, video, author info, hashtags, location text |
| F-CMT-07 | Hide Post | Change status to `hidden`. Post is immediately removed from the Customer Web feed. Requires confirmation dialog |
| F-CMT-08 | Unhide Post | Change status back to `published`. Post is restored to the Customer Web feed |
| F-CMT-09 | Delete Post | Change status to `deleted`. Soft delete — preserved in database. Requires confirmation dialog |
| F-CMT-10 | View Author | Link to user management page for the post's author |
| F-CMT-11 | View Comments | Expand to show all comments on the post. Admin can hide or delete individual comments |
| F-CMT-12 | Pagination | Table pagination with configurable page size (10, 20, 50) |

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

| # | Feature | Description |
|---|---|---|
| F-AUDIT-01 | Log Table | Paginated table of all audit entries. Columns: timestamp, admin user, content type, action, document name/ID |
| F-AUDIT-02 | Filter — Content Type | Filter by: All / Shop / Theme / Region / District / Review / Partnership Inquiry / User / Board Post / Event / Notice / Community Post |
| F-AUDIT-03 | Filter — Action | Filter by: All / Create / Update / Delete / Publish / Unpublish / Hide / Restore / Lock / Unlock |
| F-AUDIT-04 | Filter — Admin User | Filter by admin who made the change |
| F-AUDIT-05 | Filter — Date | Filter by date range |
| F-AUDIT-06 | Filter — Document | Filter by specific document ID (e.g., filter to see all changes for a specific shop) |
| F-AUDIT-07 | Diff Viewer | Expand a log entry to show field-level changes: field name, previous value, new value |
| F-AUDIT-08 | Sort | Sort by: timestamp (default: newest first) |
| F-AUDIT-09 | Pagination | Table pagination with configurable page size |

**Audit Entry Fields**

The audit log records who made changes, what was changed, and the before/after values. Each entry includes: the type of content (e.g., Shop, Theme), the specific record that was modified, the action taken (create, update, delete, publish, unpublish), the admin who performed the action, the field-level changes with before and after values, and the timestamp of the change.

> See TSD §4.4.7 for the detailed data schema.

**Expanded Audit Scope**

The audit log covers ALL state-changing admin actions, not only shop changes:

| Content Type | Audited Actions |
|---|---|
| Shop | Create, Update, Delete, Publish, Unpublish |
| Theme | Create, Update, Delete |
| Region / District | Create, Update, Delete |
| Review | Hide, Restore, Delete (moderation actions) |
| Partnership Inquiry | Status changes (New → Contacted → Awaiting Info → Approved → Rejected → Published) |
| User (Customer) | Lock, Unlock |
| Board Post | Create, Update, Delete, Publish, Unpublish |
| Event | Create, Update, Delete, Publish, Unpublish |
| Notice | Create, Update, Delete, Publish, Unpublish |
| Community Post | Hide, Restore, Delete (moderation actions) |

**Security Event Log**

In addition to the content audit log, the following security-sensitive events are logged server-side for monitoring and incident response:

| Event | Logged Fields |
|---|---|
| Failed login attempt (admin or customer) | Email, IP address, timestamp, failure reason |
| Account lock/unlock | Target user, acting admin, reason, timestamp |
| Password reset request | Email, IP address, timestamp, delivery status |
| Admin login/logout | Admin user, IP address, timestamp |
| Session expiration | User, session age, timestamp |

> Security events are stored in a dedicated `security_events` log (separate from the content audit log). Retention: 90 days minimum. See TSD for implementation details.

---

## 16. Global Layout & Navigation

### 16.1 Admin Sidebar

| # | Feature | Description |
|---|---|---|
| F-NAV-01 | Logo | SWIDA admin logo — links to `/dashboard` |
| F-NAV-02 | Dashboard Link | Navigate to `/dashboard` |
| F-NAV-03 | Shops Link | Navigate to `/shops` |
| F-NAV-04 | Reviews Link | Navigate to `/reviews`. Badge shows `under_review` count |
| F-NAV-05 | Themes Link | Navigate to `/themes` |
| F-NAV-06 | Locations Link | Navigate to `/locations` |
| F-NAV-07 | Inquiries Link | Navigate to `/inquiries`. Badge shows `new` inquiry count |
| F-NAV-08 | Users Link | Navigate to `/users` |
| F-NAV-09 | Board Posts Link | Navigate to `/board-posts` |
| F-NAV-10 | Events Link | Navigate to `/events` |
| F-NAV-11 | Notices Link | Navigate to `/notices` |
| F-NAV-12 | Community Posts Link | Navigate to `/community-posts` |
| F-NAV-13 | Audit Log Link | Navigate to `/audit-log` |

### 16.2 Admin Header

| # | Feature | Description |
|---|---|---|
| F-NAV-14 | Admin User Display | Show currently logged-in admin user name/email |
| F-NAV-15 | Logout Button | Log out and redirect to `/login` |
| F-NAV-16 | Customer Web Link | "View Site" button — opens `www.swida.com` in a new tab |

---

## Appendix A. Error Message Guide

| Code | Message |
|---|---|
| ERR_LOGIN | Invalid email or password |
| ERR_SESSION_EXPIRED | Session expired. Please log in again. |
| ERR_UNAUTHORIZED | You do not have permission to perform this action. |
| ERR_SHOP_PUBLISH_FAIL | Failed to publish shop. Please try again. |
| ERR_SHOP_UNPUBLISH_FAIL | Failed to unpublish shop. Please try again. |
| ERR_SHOP_SAVE_FAIL | Failed to save shop. Please check required fields and try again. |
| ERR_SHOP_MISSING_FIELDS | Please fill in all required fields before saving. |
| ERR_IMAGE_UPLOAD_FAIL | Failed to upload image. Please try again. |
| ERR_IMAGE_TOO_LARGE | Image file is too large. Maximum size: 5MB. |
| ERR_REVIEW_STATUS_FAIL | Failed to update review status. Please try again. |
| ERR_USER_LOCK_FAIL | Failed to lock user account. Please try again. |
| ERR_USER_UNLOCK_FAIL | Failed to unlock user account. Please try again. |
| ERR_THEME_DELETE_HAS_SHOPS | Cannot delete theme. {count} shop(s) are still tagged with this theme. |
| ERR_REGION_DELETE_HAS_DISTRICTS | Cannot delete region. {count} district(s) still exist under this region. |
| ERR_DISTRICT_DELETE_HAS_SHOPS | Cannot delete district. {count} shop(s) are still registered in this district. |
| ERR_INQUIRY_STATUS_FAIL | Failed to update inquiry status. Please try again. |
| ERR_BOARD_SAVE_FAIL | Failed to save board post. Please check required fields and try again. |
| ERR_BOARD_PUBLISH_FAIL | Failed to publish board post. Please try again. |
| ERR_BOARD_DELETE_FAIL | Failed to delete board post. Please try again. |
| ERR_EVENT_SAVE_FAIL | Failed to save event. Please check required fields and try again. |
| ERR_EVENT_PUBLISH_FAIL | Failed to publish event. Please try again. |
| ERR_EVENT_DELETE_FAIL | Failed to delete event. Please try again. |
| ERR_EVENT_DATE_INVALID | End date must be on or after start date. |
| ERR_NOTICE_SAVE_FAIL | Failed to save notice. Please check required fields and try again. |
| ERR_NOTICE_PUBLISH_FAIL | Failed to publish notice. Please try again. |
| ERR_NOTICE_DELETE_FAIL | Failed to delete notice. Please try again. |
| ERR_COMMUNITY_STATUS_FAIL | Failed to update community post status. Please try again. |
| ERR_NETWORK | Please check your network connection. |
| ERR_SERVER | A temporary error occurred. Please try again shortly. |
| ERR_REVIEW_RESTORE_AUTHOR_LOCKED | Author account is locked |
| ERR_REVIEW_RESTORE_SHOP_UNPUBLISHED | Shop is currently unpublished |
| ERR_IMAGE_UPLOAD_MINIO | Image upload failed. Please try again. |
| ERR_CONFLICT | This record was modified in another session. Please reload and try again. |

---

## Appendix B. Inactive Reason Codes

> PRD Reference: §7.3 Inactive Reason Codes

| Code | Display Label | Description |
|---|---|---|
| `closed` | Permanently Closed | Business has permanently closed |
| `owner_request` | Owner Request | Shop owner requested removal from SWIDA |
| `violation` | Policy Violation | Listing violated platform policies |
| `stale` | Unverified | Unable to verify current operating status |
| `other` | Other | Free-text explanation required |

---

## Appendix C. Partnership Inquiry Status Flow

> PRD Reference: §10.3.2 Inquiry Status Flow

| Status | Display Label | Description | Next Possible Statuses |
|---|---|---|---|
| `new` | New | Inquiry received, not yet contacted | `contacted`, `rejected` |
| `contacted` | Contacted | Admin has reached out to the shop owner | `awaiting_info`, `rejected` |
| `awaiting_info` | Awaiting Info | Waiting for shop owner to provide details | `approved`, `rejected` |
| `approved` | Approved | Information verified, ready to create listing | `published`, `rejected` |
| `rejected` | Rejected | Inquiry declined | `new` (admin reopen — requires confirmation: "Reopen this rejected inquiry?") |
| `published` | Published | Shop listing is live on SWIDA | (terminal state — shop is managed via Shop Management from this point) |

**SLA Indicator**: Inquiries in `new` status for more than 48 hours should be visually highlighted as overdue (PRD §10.3.3).

---

## Appendix D. Review Status Mapping

> PRD Reference: §8.5 Review Statuses

| Status | Display Label | Visible on Customer Web | Counted in Rating |
|---|---|---|---|
| `published` | Published | Yes | Yes |
| `hidden` | Hidden | No | No |
| `under_review` | Under Review | No | No |
| `deleted` | Deleted | No | No |

---

## Appendix E. Admin API Endpoints Used

The Admin Web communicates with the backend through two API surfaces: one for authentication and admin-level operations, and another for content management (shops, reviews, themes, locations, inquiries, board posts, events, notices, community posts, audit logs, users, and image uploads).

For the complete list of API endpoints, see TSD §5.2.

---

> **Document End**
>
> This FSD should be reviewed and updated alongside the UI/UX Specification. The Admin Web FSD references the Customer Web FSD for preview functionality and shared data models.
