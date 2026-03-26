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

This document defines the page list and functional specifications for the SWIDA Admin Web application. The Admin Web is the primary operational interface for managing the SWIDA platform — it replaces Strapi's built-in admin panel for all day-to-day operations. Visual design, layout, and interaction details are covered in the separate UI/UX Specification.

### 1.2 Architecture Context

The Admin Web is a custom-built Next.js application served at `admin.swida.com`. It communicates with Strapi's admin API (`/admin/*`) for authentication and Strapi's REST API (`/api/*`) for content management. Strapi's built-in admin panel is restricted to developers only for monitoring and debugging — it is not used for any operational features defined in this document.

### 1.3 MVP Scope

| Included | Not Included (Future) |
|---|---|
| Admin authentication (email/password, JWT) | Shop owner self-service portal |
| Dashboard (platform statistics) | Advanced analytics & reports |
| Shop CRUD (create, edit, publish/unpublish) | Bulk import/export of shop listings |
| Map pin drop for lat/lng selection | Map view of all shops |
| Shop preview (customer view) | Push notification management |
| Review moderation (view, hide, delete) | Automated review moderation (AI/rules) |
| Customer account management (lock/unlock) | Coupon / deals management |
| Theme management (CRUD) | Booking system management |
| Region & district management (CRUD) | |
| Partnership inquiry management (status workflow) | |
| Audit log viewer | |
| Locale management (Korean/English content) | |

### 1.4 Global Rules

| Item | Rule |
|---|---|
| Language | Admin Web UI is in English (admin-facing, not customer-facing) |
| Date/Time | KST (Korea Standard Time, UTC+9). Format: `YYYY-MM-DD HH:mm:ss` |
| Authentication | All pages require admin authentication. Unauthenticated requests redirect to login |
| API Communication | Strapi Admin API for auth (`/admin/login`). Strapi REST API + Admin API for content operations |
| Soft Delete Policy | Shop listings are never hard-deleted. Deactivated shops are unpublished with an inactive reason |
| Pagination | Table-based pagination with configurable page size (10, 20, 50) |
| Loading States | Skeleton placeholders for data tables and forms |
| Confirmation | All destructive actions (hide, delete, lock, unpublish) require confirmation dialog |
| Toast Notifications | Success/error feedback for all write operations |
| Responsive | Desktop-primary. Minimum supported width: 1024px |

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
| 11 | Audit Log | `/audit-log` | Change history viewer |

**Access Control**: All pages except Login require an authenticated admin session. Unauthenticated access to any page redirects to `/login`.

---

## 3. Authentication

### 3.1 Login (`/login`)

> PRD Reference: §3.1 Admin Authentication, TSD §5.4.2

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-AUTH-01 | Email/Password Login | Authenticate against Strapi's admin API endpoint (`/admin/login`). Returns admin JWT |
| F-AUTH-02 | JWT Storage | Store admin JWT securely (httpOnly cookie). Used for all subsequent Strapi admin API requests |
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
| F-AUTH-06 | Session Persistence | Admin JWT persisted across browser sessions (until expiry or logout) |
| F-AUTH-07 | Token Expiry | On token expiry, redirect to login page with message: "Session expired. Please log in again." |
| F-AUTH-08 | Logout | Clear admin JWT, redirect to `/login` |

### 3.3 Logout

| # | Feature | Description |
|---|---|---|
| F-LOGOUT-01 | Session Clear | Remove admin JWT and clear client-side state |
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

**API Calls**

| Endpoint | Purpose |
|---|---|
| `GET /api/dashboard/stats` (custom controller, TSD §5.2.5) | Aggregated platform statistics (shops, reviews, users, inquiries, recent activity) |
| `GET /api/shops?pagination[pageSize]=1&status=draft` | Draft shop count |
| `GET /api/reviews?filters[status][$eq]=under_review&pagination[pageSize]=1` | Pending review count |
| `GET /api/partnership-inquiries?filters[status][$eq]=new&pagination[pageSize]=1` | New inquiry count |

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
| F-SHOP-07 | Publish Action | Quick publish button on each row. Triggers Strapi's publish API. Shop becomes visible on Customer Web immediately (PRD §7.3) |
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
| F-SHOP-15 | Map Pin Drop | Integrated Kakao Map component for selecting latitude/longitude. Admin clicks on map to set coordinates. Supports address search to center map — if address not found, show "주소를 찾을 수 없습니다" toast and allow manual pin drop. Default center: Seoul City Hall (37.5666, 126.9784), zoom level 12. When editing an existing shop, center on saved coordinates. (PRD §3.1, TSD §5.6) |
| F-SHOP-16 | Theme Selection | Multi-select from all available themes (PRD §5.2) |
| F-SHOP-17 | Service Menu | Repeatable form component — add/remove service menu items. Each item: service name, duration (minutes), price (KRW), description (PRD §5.2.1) |
| F-SHOP-18 | Booking Info | Boolean toggle for booking required. Conditional input for booking URL/phone. Gender availability dropdown (PRD §5.2) |
| F-SHOP-19 | Amenities | Toggle switches for each amenity. Conditional inputs for parking type, parking detail, accessibility detail (PRD §5.3) |
| F-SHOP-20 | Contact Channels | Optional inputs: phone, KakaoTalk ID, Instagram, website URL, Naver Place URL (PRD §5.4) |
| F-SHOP-21 | Languages | Multi-select for languages supported (PRD §5.5) |
| F-SHOP-22 | Image Upload | Upload shop images (min: 1, max: 10). Accepted formats: JPEG, PNG, WebP. Max file size: 5MB per image. Drag-and-drop or file picker. Images stored via Strapi Upload → MinIO (PRD §5.1) |
| F-SHOP-23 | Thumbnail Selection | Select one image as the primary thumbnail for search results (PRD §5.1) |
| F-SHOP-24 | Open/Close Tags | Optional custom labels for operating status display on Customer Web. Defaults: "영업중" / "영업종료" (PRD §5.6) |
| F-SHOP-25 | Save as Draft | Save shop without publishing. Creates draft entry in Strapi (PRD §7.3) |
| F-SHOP-26 | Save & Publish | Save shop and publish immediately. Shop becomes visible on Customer Web (PRD §7.3) |
| F-SHOP-27 | Locale Switcher | Switch between Korean and English content editing. Korean fields must be saved before English editing is enabled. English is optional (PRD §11.4) |

**Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Shop Name | Yes | Max 255 characters |
| Slug | Yes (auto-generated) | Auto-generated from shop name, editable |
| Description | Yes | Max 500 characters |
| Address | Yes | Max 500 characters |
| Region | Yes | Select from regions API |
| District | Yes | Select from districts API (filtered by region) |
| Latitude | Yes | Decimal, set via map pin drop |
| Longitude | Yes | Decimal, set via map pin drop |
| Operating Hours | Yes | Text (e.g., "10:00–22:00") |
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
published ──→ deleted (admin delete)
under_review ──→ published (admin approve)
under_review ──→ hidden (admin hide)
under_review ──→ deleted (admin delete)
hidden ──→ published (admin restore)
```

**Rating Recalculation**: Any status change automatically triggers Strapi lifecycle hooks to recalculate the parent shop's `average_rating` and `total_reviews` (PRD §8.5).

---

## 7. Theme Management

### 7.1 Themes (`/themes`)

> PRD Reference: §9 Service Themes

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-THEME-01 | Theme List | Table of all themes. Columns: icon, name (Korean), name (English), slug, display order, shop count |
| F-THEME-02 | Create Theme | Form: name (Korean, required), name (English, optional), slug (auto-generated), icon upload, display order (PRD §9.1) |
| F-THEME-03 | Edit Theme | Edit existing theme. All fields editable |
| F-THEME-04 | Delete Theme | Delete a theme. Confirmation dialog. Blocked if shops are tagged with this theme — display warning with shop count. Admin must untag all shops first before deletion is allowed. |
| F-THEME-05 | Reorder | Drag-and-drop or manual number input to change display order |
| F-THEME-06 | Locale Switcher | Switch between Korean and English name editing (PRD §11.4) |

**Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Name (Korean) | Yes | Max 100 characters |
| Name (English) | No | Max 100 characters |
| Slug | Yes (auto-generated) | Auto-generated from Korean name, editable |
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
| F-INQ-07 | Update Status | Change inquiry status via dropdown. Status flow: `new` → `contacted` → `awaiting_info` → `approved` → `published`. Any status except `published` → `rejected`. Both `published` and `rejected` are terminal states. (PRD §10.3.2) |
| F-INQ-08 | Admin Notes | Add/edit internal notes on any inquiry. Notes are not visible to the public (PRD §10.3.1) |
| F-INQ-09 | Duplicate Detection | Visual flag/badge on inquiries where same shop name + address already exists in another inquiry or shop listing (PRD §10.3.2) |
| F-INQ-10 | Convert to Shop | Button on `approved` inquiries: "Create Shop Listing". Pre-populates a new shop form (`/shops/new`) with inquiry data (shop name, address, business type, contact info) (PRD §10.3.2) |
| F-INQ-11 | Link to Shop | Once a shop listing is created and published from an inquiry, the inquiry shows a link to the associated shop. Status automatically set to `published` (PRD §10.3.1) |
| F-INQ-12 | New Inquiry Badge | Visual badge/counter showing unread `new` inquiries. 48-hour goal indicator — highlight inquiries still in `new` status (not yet moved to `contacted`) for more than 48 hours (PRD §10.3.3) |
| F-INQ-13 | Pagination | Table pagination with configurable page size |

**Status Flow Diagram**

```
new ──→ contacted ──→ awaiting_info ──→ approved ──→ published
  └──→ rejected                          └──→ rejected
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
| Lock | Account's `blocked` field set to `true` (Strapi built-in). User sees suspension message on Customer Web when attempting review submission. All existing published reviews remain visible (PRD §8.5) |
| Unlock | Account's `blocked` field set to `false`. User can resume submitting reviews (PRD §8.5) |

---

## 11. Audit Log

### 11.1 Audit Log Viewer (`/audit-log`)

> PRD Reference: §7.3 Audit Log, TSD §4.4.7, §5.3.4

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-AUDIT-01 | Log Table | Paginated table of all audit entries. Columns: timestamp, admin user, content type, action, document name/ID |
| F-AUDIT-02 | Filter — Content Type | Filter by: All / Shop / Theme / Region / District |
| F-AUDIT-03 | Filter — Action | Filter by: All / Create / Update / Delete / Publish / Unpublish |
| F-AUDIT-04 | Filter — Admin User | Filter by admin who made the change |
| F-AUDIT-05 | Filter — Date | Filter by date range |
| F-AUDIT-06 | Filter — Document | Filter by specific document ID (e.g., filter to see all changes for a specific shop) |
| F-AUDIT-07 | Diff Viewer | Expand a log entry to show field-level diff: field name, previous value, new value (TSD §4.4.7 — `field_diffs` jsonb column) |
| F-AUDIT-08 | Sort | Sort by: timestamp (default: newest first) |
| F-AUDIT-09 | Pagination | Table pagination with configurable page size |

**Audit Entry Fields** (TSD §4.4.7)

| Field | Description |
|---|---|
| `content_type` | Strapi API ID (e.g., `api::shop.shop`) |
| `document_id` | ID of the modified document |
| `action` | `create`, `update`, `delete`, `publish`, `unpublish` |
| `admin_user_id` | Admin who performed the action |
| `field_diffs` | JSON object: `{ "field_name": { "before": "old value", "after": "new value" } }` |
| `created_at` | Timestamp of the change |

---

## 12. Global Layout & Navigation

### 12.1 Admin Sidebar

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
| F-NAV-09 | Audit Log Link | Navigate to `/audit-log` |

### 12.2 Admin Header

| # | Feature | Description |
|---|---|---|
| F-NAV-10 | Admin User Display | Show currently logged-in admin user name/email |
| F-NAV-11 | Logout Button | Log out and redirect to `/login` |
| F-NAV-12 | Customer Web Link | "View Site" button — opens `www.swida.com` in a new tab |

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
| ERR_NETWORK | Please check your network connection. |
| ERR_SERVER | A temporary error occurred. Please try again shortly. |

---

## Appendix B. Inactive Reason Codes

> PRD Reference: §7.3 Inactive Reason Codes

| Code | Display Label | Description |
|---|---|---|
| `closed` | Permanently Closed | Business has permanently closed |
| `owner_request` | Owner Request | Shop owner requested removal from SWIDA |
| `violation` | Policy Violation | Listing violated platform policies |
| `stale` | Unverified | Unable to verify current operating status |
| `other` | Other | Free-text explanation required (`inactive_reason_detail` field) |

---

## Appendix C. Partnership Inquiry Status Flow

> PRD Reference: §10.3.2 Inquiry Status Flow

| Status | Display Label | Description | Next Possible Statuses |
|---|---|---|---|
| `new` | New | Inquiry received, not yet contacted | `contacted`, `rejected` |
| `contacted` | Contacted | Admin has reached out to the shop owner | `awaiting_info`, `rejected` |
| `awaiting_info` | Awaiting Info | Waiting for shop owner to provide details | `approved`, `rejected` |
| `approved` | Approved | Information verified, ready to create listing | `published`, `rejected` |
| `rejected` | Rejected | Inquiry declined | (terminal state) |
| `published` | Published | Shop listing is live on SWIDA | (terminal state) |

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

The Admin Web communicates with Strapi via two API surfaces:

**Strapi Admin API** (authentication and admin-level operations):

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/login` | Admin authentication |
| GET | `/admin/users/me` | Current admin user info |

**Strapi REST API** (content management — using admin JWT):

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/api/shops` | List shops / Create shop |
| GET/PUT/DELETE | `/api/shops/{documentId}` | Get / Update / Delete single shop |
| POST | `/api/shops/{documentId}/actions/publish` | Publish shop (Strapi v5 Document Service API) |
| POST | `/api/shops/{documentId}/actions/unpublish` | Unpublish shop (Strapi v5 Document Service API) |
| GET/PUT | `/api/reviews` | Review listing and status updates |
| GET/POST/PUT/DELETE | `/api/themes` | Theme CRUD |
| GET/POST/PUT/DELETE | `/api/regions` | Region CRUD |
| GET/POST/PUT/DELETE | `/api/districts` | District CRUD |
| GET/PUT | `/api/partnership-inquiries` | Inquiry listing and status updates |
| GET | `/api/audit-logs` | Audit log listing |
| GET/PUT | `/content-manager/collection-types/plugin::users-permissions.user` | Customer account management |
| POST | `/api/upload` | Image upload to MinIO |

---

> **Document End**
>
> This FSD should be reviewed and updated alongside the UI/UX Specification. The Admin Web FSD references the Customer Web FSD for preview functionality and shared data models.
