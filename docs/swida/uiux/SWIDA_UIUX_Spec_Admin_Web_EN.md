---
title: "SWIDA — Admin Web UI/UX Spec"
sidebar_label: "English"
sidebar_position: 1
---

# UI/UX Specification

## SWIDA — Admin Web

- **Version**: 1.0
- **Date**: 2026-03-26
- **Based on**: SWIDA PRD v1.1, TSD v1.1, Admin Web FSD v1.0
- **Scope**: MVP — Admin-facing platform management web application
- **Target**: Desktop-primary (minimum supported screen width for desktop use)
- **Figma**: Not yet available — to be added in a future revision
- **Note**: Colors, typography, spacing values, and icon styles are defined in a separate Design System document. All functional decisions follow the Admin Web FSD as the source of truth.

---

## 1. Document Overview

### 1.1 Purpose

This document defines the screen layouts, component structures, and interaction flows for the SWIDA Admin Web application on a page-by-page basis. The Admin Web is the primary operational interface for managing the SWIDA platform — it serves as the dedicated admin panel for all day-to-day operations.

### 1.2 Scope

| Covered | Not Covered |
|---|---|
| Desktop layout shell | Colors, typography, spacing values |
| Page-level screen structure (wireframe level) | Animation speed / easing curves |
| Component patterns (tables, forms, modals, dialogs) | Customer Web UI |
| Admin interaction flows (storyboards) | Backend system admin panel |
| State-based screen branching | |

### 1.3 Design Principles

| Principle | Description |
|---|---|
| Desktop-primary | Minimum supported screen width for desktop use. No mobile optimization required. |
| Data-dense | Prioritize information density — tables, filters, and stats over whitespace |
| Sidebar navigation | Persistent left sidebar for all pages |
| Confirmation-first | All destructive actions require explicit confirmation dialogs |
| English UI | All admin interface text is in English |

---

## 2. Layout System

### 2.1 Viewport

Optimized for standard desktop monitors. Vertical scroll only — no horizontal scroll on supported screen sizes.

> Detailed pixel specifications are in the TSD.

No responsive breakpoints — single desktop layout. If the browser window is too narrow, a notice is shown: "Admin Web is optimized for desktop browsers."

### 2.2 Layout Shell

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER (top fixed, full width)                                      │
│  [SWIDA Admin]                           [View Site ↗] [Admin ▾]     │
├──────────┬───────────────────────────────────────────────────────────┤
│  SIDEBAR │  MAIN CONTENT AREA                                        │
│  (left   │  ┌───────────────────────────────────────────────────┐   │
│  fixed)  │  │  Page Header (title + actions)                    │   │
│          │  ├───────────────────────────────────────────────────┤   │
│          │  │  Page Body (tables, forms, cards)                 │   │
│          │  │  (scrollable)                                     │   │
│          │  │                                                   │   │
│          │  │                                                   │   │
│          │  │                                                   │   │
│          │  └───────────────────────────────────────────────────┘   │
└──────────┴───────────────────────────────────────────────────────────┘
```

| Element | Behavior |
|---|---|
| Header | Full-width, fixed at top |
| Sidebar | Fixed-width, fixed left. Full viewport height minus header. Scrollable if overflow |
| Main Content | Fills remaining width. Scrollable. Content is centered with a maximum width |

> Detailed dimension specifications are in the TSD.

---

## 3. Common Shell Components

### 3.1 Header

```
┌──────────────────────────────────────────────────────────────────────┐
│  SWIDA Admin                                [View Site ↗] [Admin ▾]  │
└──────────────────────────────────────────────────────────────────────┘
```

| Element | Description | FSD Ref |
|---|---|---|
| SWIDA Admin (logo/text) | Links to `/dashboard` | F-NAV-01 |
| View Site ↗ | Opens `www.swida.com` in new tab | F-NAV-12 |
| Admin ▾ | Dropdown: admin name/email + Logout | F-NAV-10, F-NAV-11 |

### 3.2 Sidebar Navigation

```
┌──────────────────┐
│  📊 Dashboard     │  ← active highlight
│                   │
│  ── Content ──    │
│  🏪 Shops         │
│  ⭐ Reviews [3]   │  ← badge: under_review count
│  💆 Themes        │
│  📍 Locations     │
│                   │
│  ── Operations ── │
│  🤝 Inquiries [5] │  ← badge: new inquiry count
│  👥 Users         │
│                   │
│  ── System ──     │
│  📋 Audit Log     │
└──────────────────┘
```

| Behavior | Description |
|---|---|
| Active state | The current page is visually highlighted in the sidebar |
| Badges | Real-time count badges on Reviews (under_review) and Inquiries (new) |
| Collapse | Optional collapse to icon-only mode with tooltips. Collapse state is remembered between sessions |

### 3.3 Page Header Pattern

Every page follows a consistent header structure:

```
┌──────────────────────────────────────────────────────────────────┐
│  Page Title                                    [Primary Action]  │
│  Subtitle/description (optional)                                 │
├──────────────────────────────────────────────────────────────────┤
│  [Filter Bar]                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 3.4 Common UI Patterns

#### Data Tables

All list pages use a consistent table pattern:

```
┌──────────────────────────────────────────────────────────────────┐
│  [Search input]  [Filter: Status ▾]  [Filter: ... ▾]   [Sort ▾]│
├───────┬──────────┬────────┬───────┬────────┬─────────┬──────────┤
│  ☐    │ Column 1 │ Col 2  │ Col 3 │ Col 4  │ Status  │ Actions  │
├───────┼──────────┼────────┼───────┼────────┼─────────┼──────────┤
│  ☐    │ Data     │ Data   │ Data  │ Data   │ [Badge] │ [⋯]     │
│  ☐    │ Data     │ Data   │ Data  │ Data   │ [Badge] │ [⋯]     │
│  ☐    │ Data     │ Data   │ Data  │ Data   │ [Badge] │ [⋯]     │
├───────┴──────────┴────────┴───────┴────────┴─────────┴──────────┤
│  Showing 1-10 of 234         [10▾] per page    [< 1 2 3 4 5 >] │
└──────────────────────────────────────────────────────────────────┘
```

| Feature | Description |
|---|---|
| Checkbox column | Row selection for bulk actions |
| Actions column | "⋯" menu or inline icon buttons (edit, preview, etc.) |
| Pagination | Page numbers + configurable page size (10, 20, 50) |
| Loading | Loading indicators are shown while content loads |
| Empty state | "No results found" centered in table body |

#### Confirmation Dialog

Used for all destructive actions:

```
┌──────────────────────────────────────┐
│  ⚠️ Confirm Action                   │
│                                      │
│  Are you sure you want to {action}?  │
│  {additional context}                │
│                                      │
│            [Cancel]  [Confirm]       │
└──────────────────────────────────────┘
```

#### Toast Notifications

- **Success**: Green, auto-dismiss after 5 seconds
- **Error**: Red, persistent until dismissed
- **Position**: Top-right of main content area

#### Status Badges

| Status | Color | Used In |
|---|---|---|
| Published | Green | Shops, Reviews |
| Draft | Gray | Shops |
| Hidden | Yellow | Reviews |
| Under Review | Orange | Reviews |
| Deleted | Red | Reviews |
| Active | Green | Users |
| Locked | Red | Users |
| New | Blue | Inquiries |
| Contacted | Cyan | Inquiries |
| Awaiting Info | Yellow | Inquiries |
| Approved | Green | Inquiries |
| Rejected | Red | Inquiries |

---

## 4. Login (`/login`)

> FSD: §3, F-AUTH-01~05

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                     ┌────────────────────────┐                   │
│                     │  SWIDA Admin            │                   │
│                     │                        │                   │
│                     │  Email                 │                   │
│                     │  [________________]    │                   │
│                     │                        │                   │
│                     │  Password              │                   │
│                     │  [________________]    │                   │
│                     │                        │                   │
│                     │  [Log In]              │                   │
│                     │                        │                   │
│                     │  {error message area}  │                   │
│                     └────────────────────────┘                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

- Centered card on neutral background. No sidebar or header.
- Error messages displayed inline below the form.

### Storyboard

```
[1] /login → If already authenticated → redirect to /dashboard (F-AUTH-05)

[2] Enter email + password → [Log In]

[3a] Success → user session is saved securely → redirect to /dashboard (F-AUTH-03)
[3b] Invalid credentials → inline error: "Invalid email or password" (F-AUTH-04)
[3c] Server error → inline error: "Unable to connect to server. Please try again."

[4] Session expiry (any page) → redirect to /login with message:
    "Session expired. Please log in again." (F-AUTH-07)
```

---

## 5. Dashboard (`/dashboard`)

> FSD: §4, F-DASH-01~08

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Dashboard                                                       │
├──────────────────────────────────────────────────────────────────┤
│  STAT CARDS (4 columns)                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 🏪 Shops  │ │ ⭐ Reviews│ │ 👥 Users  │ │ 🤝 Inquiries│          │
│  │ 1,234     │ │ 15,240   │ │ 8,500    │ │ 127       │          │
│  │ 1,100 pub │ │ 14,800pub│ │ 8,420 act│ │ 5 new     │          │
│  │ 134 draft │ │ 12 pend  │ │ 80 locked│ │           │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├──────────────────────────────────────────────────────────────────┤
│  ALERT SECTION (conditional — only shown if action needed)       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ ⚠️ 5 new partnership inquiries awaiting first contact │       │
│  │ ⚠️ 12 reviews flagged as under review                 │       │
│  └──────────────────────────────────────────────────────┘       │
├───────────────────────────────┬──────────────────────────────────┤
│  QUICK ACTIONS                │  RECENT ACTIVITY                 │
│  ┌──────────────────────┐    │  ┌──────────────────────────┐   │
│  │ + Create New Shop     │    │  │ Admin published "힐링스파" │   │
│  │ 🔍 View Pending Reviews│   │  │ 2 minutes ago             │   │
│  │ 📨 View New Inquiries  │   │  │                           │   │
│  └──────────────────────┘    │  │ Admin hid review #4521    │   │
│                               │  │ 15 minutes ago            │   │
│                               │  │                           │   │
│                               │  │ Admin updated status of   │   │
│                               │  │ inquiry #89 to "contacted"│   │
│                               │  │ 1 hour ago                │   │
│                               │  │ ...                       │   │
│                               │  └──────────────────────────┘   │
└───────────────────────────────┴──────────────────────────────────┘
```

| Section | Description |
|---|---|
| Stat Cards | 4 cards. Each shows total count + status breakdown. Clickable → navigate to respective list page |
| Alert Section | Shown only when items need attention. Links to filtered views |
| Quick Actions | 3 primary shortcuts. Most common admin tasks |
| Recent Activity | Last 10 actions across the platform. Timestamp + action description |

---

## 6. Shop Management

### 6.1 Shop List (`/shops`)

> FSD: §5.1, F-SHOP-01~12

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Shops                                          [+ Create Shop]  │
├──────────────────────────────────────────────────────────────────┤
│  [🔍 Search by name]  [Status: All ▾]  [Region ▾]  [Theme ▾]   │
├───┬───────┬────────┬──────┬────────┬───────┬────────┬───────────┤
│ ☐ │ Thumb │ Name   │ Dist │ Themes │ ★ Rtg │ Status │ Actions   │
├───┼───────┼────────┼──────┼────────┼───────┼────────┼───────────┤
│ ☐ │ [img] │ 골드문  │ 장안동│ 스웨디시│ 4.9   │[Published]│ [Edit][Preview][⋯]│
│ ☐ │ [img] │ 힐링스파│ 역삼동│ 아로마  │ 4.5   │[Draft]   │ [Edit][Preview][⋯]│
│ ☐ │ [img] │ ...    │ ...  │ ...    │ ...   │ ...    │ ...       │
├───┴───────┴────────┴──────┴────────┴───────┴────────┴───────────┤
│  Showing 1-10 of 1,234        [10▾] per page   [< 1 2 3 ... >] │
└──────────────────────────────────────────────────────────────────┘
```

**Row Actions (⋯ menu)**:

| Action | Condition | Behavior |
|---|---|---|
| Edit | Always | → `/shops/[id]` |
| Preview | Always | Opens Customer Web shop detail in new tab (F-SHOP-11) |
| Publish | Status = Draft | Publish immediately (F-SHOP-07) |
| Unpublish | Status = Published | Opens inactive reason dialog → unpublish (F-SHOP-08) |
| View Audit Log | Always | → `/audit-log?document={id}` |

### 6.2 Shop Create (`/shops/new`)

> FSD: §5.2, F-SHOP-13~27

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Create New Shop        [ko ▾ en] locale switcher (F-SHOP-27)    │
│                                    [Save Draft] [Save & Publish] │
├──────────────────────────────────────────────────────────────────┤
│  FORM SECTIONS (vertical scroll, grouped by category)            │
│                                                                  │
│  ┌─ Basic Information ─────────────────────────────────────────┐ │
│  │  Shop Name *          [_____________________________]       │ │
│  │  Slug (auto)          [_____________________________]       │ │
│  │  Description *        [_____________________________]       │ │
│  │                       [                             ] 0/500 │ │
│  │  Address *            [_____________________________]       │ │
│  │  Phone Number         [_____________________________]       │ │
│  │  Operating Hours *    [_____________________________]       │ │
│  │  Last Order Time      [_____________________________]       │ │
│  │  Closed Days *        [_____________________________]       │ │
│  │  Holiday Exceptions   [_____________________________]       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Location ──────────────────────────────────────────────────┐ │
│  │  Region *             [▾ Select region     ]                │ │
│  │  District *           [▾ Select district   ] ← cascading   │ │
│  │                                                             │ │
│  │  MAP (Kakao Map — pin drop)                                 │ │
│  │  ┌───────────────────────────────────────────────┐          │ │
│  │  │  [Address search bar]                         │          │ │
│  │  │                                               │          │ │
│  │  │             📍 (draggable pin)                │          │ │
│  │  │                                               │          │ │
│  │  │                                               │          │ │
│  │  └───────────────────────────────────────────────┘          │ │
│  │  Latitude *  [37.5666    ]  Longitude *  [126.9784   ]     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Service Information ───────────────────────────────────────┐ │
│  │  Themes * (multi-select)                                    │ │
│  │  [스웨디시 ×] [아로마 ×]  [+ Add theme]                      │ │
│  │                                                             │ │
│  │  Booking Required *   [● Yes  ○ No]                         │ │
│  │  Booking URL/Phone    [_____________________________]       │ │
│  │  Gender Availability  [▾ Select         ]                   │ │
│  │  Price Range          [_____________________________]       │ │
│  │                                                             │ │
│  │  Service Menu *                                [+ Add Item] │ │
│  │  ┌──────────────────────────────────────────────────┐      │ │
│  │  │ Service Name *  Duration * (min)  Price * (₩)    │ [✕] │ │
│  │  │ [스웨디시 60분]  [60          ]    [80000    ]    │      │ │
│  │  ├──────────────────────────────────────────────────┤      │ │
│  │  │ [아로마 90분  ]  [90          ]    [110000   ]    │ [✕] │ │
│  │  └──────────────────────────────────────────────────┘      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Amenities ─────────────────────────────────────────────────┐ │
│  │  Parking Available    [Toggle: OFF]                         │ │
│  │    Parking Type       [▾ Select   ]  ← shown when ON       │ │
│  │    Parking Detail     [___________]  ← shown when ON       │ │
│  │  Shower               [Toggle: OFF]                         │ │
│  │  Sleeping             [Toggle: OFF]                         │ │
│  │  Private Room         [Toggle: OFF]                         │ │
│  │  WiFi                 [Toggle: OFF]                         │ │
│  │  Accessibility        [Toggle: OFF]                         │ │
│  │    Accessibility Detail [________]  ← shown when ON        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Contact Channels ─────────────────────────────────────────┐ │
│  │  Phone                [_____________________________]       │ │
│  │  KakaoTalk ID         [_____________________________]       │ │
│  │  Instagram            [_____________________________]       │ │
│  │  Website URL          [_____________________________]       │ │
│  │  Naver Place URL      [_____________________________]       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Additional ────────────────────────────────────────────────┐ │
│  │  Languages Supported  [▾ Multi-select  ]                    │ │
│  │  Open Tag             [___________] default: 영업중          │ │
│  │  Close Tag            [___________] default: 영업종료        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Images ────────────────────────────────────────────────────┐ │
│  │  Shop Images * (1–10)                                       │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────────┐              │ │
│  │  │ img1 │ │ img2 │ │ img3 │ │ + Drop files │              │ │
│  │  │ [★]  │ │      │ │      │ │  or click    │              │ │
│  │  │ [✕]  │ │ [✕]  │ │ [✕]  │ └──────────────┘              │ │
│  │  └──────┘ └──────┘ └──────┘                                │ │
│  │  ★ = Thumbnail (click star to set primary image)            │ │
│  │  Accepted: JPEG, PNG, WebP. Max 5MB per image.              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│                                    [Save Draft] [Save & Publish] │
└──────────────────────────────────────────────────────────────────┘
```

#### Map Pin Drop (F-SHOP-15)

| Behavior | Description |
|---|---|
| Default center | Seoul City Hall (37.5666, 126.9784), zoom 12 |
| Address search | Input above map → auto-center. If not found → toast "주소를 찾을 수 없습니다" + allow manual pin |
| Pin placement | Click map to place/move pin. Pin is draggable |
| Coordinate fields | Auto-populated from pin. Also manually editable. Manual entry overrides pin drop values |
| SDK load failure | If Kakao Map JS SDK fails (key expired, quota exceeded, network timeout): hide map container, show error banner "지도를 불러올 수 없습니다 — 좌표를 직접 입력하세요" / "Map unavailable — enter coordinates manually". Lat/lng text fields remain functional for manual entry |
| Coordinate validation | Latitude: −90 to 90. Longitude: −180 to 180. Both required for save |
| Edit mode | Center on saved coordinates |

#### Locale Switcher (F-SHOP-27)

```
┌──────────────────────┐
│  [ko ▾]  [en]        │
│  ● Korean (saved)    │
│  ○ English (missing) │  ← indicator if translation not yet saved
└──────────────────────┘
```

- Korean must be saved before English editing is enabled.
- English fields are optional. Missing translations show indicator.

#### Storyboard: Shop Create

```
[1] /shops/new → empty form. Locale: Korean (default).

[2] Admin fills required fields. Form validates in real-time:
    - Required field empty → red border + "Required" label
    - Description exceeds 500 chars → character counter turns red
    - No theme selected → inline error on theme section

[3] Map pin drop:
    [3a] Admin enters address in search → map centers + pin placed
    [3b] Admin clicks map to adjust pin → lat/lng fields update
    [3c] Address not found → toast + manual pin placement
    [3d] Kakao Map SDK fails to load → map hidden, error banner shown,
         admin enters lat/lng manually in text fields below map area

[4] Image upload:
    [4a] Drag-and-drop or file picker → image preview + upload to server
    [4b] Click star icon on an image → set as thumbnail
    [4c] Click ✕ → remove image (confirmation if it's the thumbnail)
    [4d] > 5MB → error toast: "Image file is too large. Maximum size: 5MB."

[5] Service menu:
    [5a] "+ Add Item" → new row with empty fields
    [5b] Fill name, duration, price → validate (all required)
    [5c] "✕" → remove row (confirmation if last remaining)

[6a] "Save Draft" → save as draft → success toast → redirect to /shops/[id]
[6b] "Save & Publish" → save and publish → success toast → redirect to /shops/[id]
[6c] Validation fails → scroll to first error + inline error messages

[7] Locale switcher → save Korean first → switch to English → fill optional translations
```

### 6.3 Shop Edit (`/shops/[id]`)

> FSD: §5.3, F-SHOP-28~35

Same layout as Shop Create with these additions:

| Addition | Description |
|---|---|
| Pre-populated fields | All existing data loaded into form (F-SHOP-28) |
| Publish/Unpublish toggle | In page header. Published shops show "Unpublish" (triggers reason dialog). Draft shops show "Publish" (F-SHOP-31) |
| Preview button | In page header. Opens Customer Web in new tab (F-SHOP-32) |
| Last Verified Date | Additional date picker field in the form (F-SHOP-33) |
| Audit History link | Link in page header → `/audit-log?document={id}` (F-SHOP-35) |
| Locale indicator | Shows which locales have saved content (F-SHOP-34) |

#### Unpublish Dialog

```
┌──────────────────────────────────────────────┐
│  ⚠️ Unpublish Shop                            │
│                                              │
│  This shop will be hidden from the Customer  │
│  Web immediately.                            │
│                                              │
│  Inactive Reason *                           │
│  [▾ Select reason                    ]       │
│                                              │
│  Detail (required if "Other")                │
│  [________________________________]  0/500   │
│                                              │
│              [Cancel]  [Unpublish]            │
└──────────────────────────────────────────────┘
```

Reasons: Permanently Closed, Owner Request, Policy Violation, Unverified, Other (Appendix B of FSD).

---

## 7. Review Moderation (`/reviews`)

> FSD: §6, F-REV-01~13

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Reviews                                          [Bulk: Hide ▾] │
├──────────────────────────────────────────────────────────────────┤
│  [Status: All ▾] [Reported Only ☐] [Shop ▾] [Date: from–to]    │
├───┬───────────┬────────┬───┬─────────────────┬────┬──────┬──────┤
│ ☐ │ Shop      │ Author │ ★ │ Comment         │ Rpt│Status│ Act  │
├───┼───────────┼────────┼───┼─────────────────┼────┼──────┼──────┤
│ ☐ │ 골드문     │ 힐링마스터│ 5 │ 정말 좋았어요... │ 0  │[Pub] │ [⋯] │
│ ☐ │ 아로마테라피│ 스파러버 │ 2 │ 별로였어요...   │ 3  │[UnRv]│ [⋯] │
│ ☐ │ ...       │ ...    │...│ ...             │... │ ...  │ ...  │
├───┴───────────┴────────┴───┴─────────────────┴────┴──────┴──────┤
│  Showing 1-20 of 15,240      [20▾] per page   [< 1 2 3 ... >]  │
└──────────────────────────────────────────────────────────────────┘
```

**Row Actions (⋯ menu)**:

| Action | Applicable Status | Behavior |
|---|---|---|
| View Detail | All | Expand inline or modal — full comment, author info, report history (F-REV-07) |
| Publish | hidden, under_review | Set status → published. Toast confirmation (F-REV-09) |
| Hide | published, under_review | Opens reason dialog → set status → hidden (F-REV-08) |
| Delete | published, hidden, under_review | Confirmation dialog → set status → deleted (F-REV-10) |
| View Author | All | → `/users?search={author}` (F-REV-11) |

**Hide Reason Dialog**:

```
┌──────────────────────────────────────┐
│  Hide Review                         │
│                                      │
│  Reason *                            │
│  [▾ Select reason              ]     │
│                                      │
│  Reasons: Spam, Inappropriate,       │
│  Fake review, Irrelevant, Other      │
│                                      │
│            [Cancel]  [Hide Review]   │
└──────────────────────────────────────┘
```

**Bulk Actions** (F-REV-12): Select multiple rows → "Bulk" dropdown → Hide / Delete. Confirmation dialog shows count.

### Storyboard: Review Moderation

```
[1] /reviews → default: all reviews, sorted by newest first

[2] Filter to "Under Review" → shows flagged reviews needing attention

[3] Expand review → see full comment + report reasons + author info

[4a] "Publish" → status changes → review appears on Customer Web → rating recalculated
[4b] "Hide" → reason dialog → confirmed → review hidden → rating recalculated
[4c] "Delete" → confirmation dialog → review removed from public view → rating recalculated

[5] "View Author" → navigate to user management filtered by that user
    → If pattern of abuse → lock account from user page
```

---

## 8. Theme Management (`/themes`)

> FSD: §7, F-THEME-01~06

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Themes                                          [+ Create Theme]│
├──────────────────────────────────────────────────────────────────┤
│  [ko ▾ en] locale switcher                                      │
├───┬──────┬───────────┬──────────┬──────┬───────┬────────────────┤
│ ⠿ │ Icon │ Name (ko) │ Name(en) │ Slug │ Shops │ Actions        │
├───┼──────┼───────────┼──────────┼──────┼───────┼────────────────┤
│ ⠿ │ 💆   │ 스웨디시   │ Swedish  │ swed │ 234   │ [Edit] [Delete]│
│ ⠿ │ 🧴   │ 아로마     │ Aroma    │ arom │ 189   │ [Edit] [Delete]│
│ ⠿ │ ...  │ ...       │ ...      │ ...  │ ...   │ ...            │
└───┴──────┴───────────┴──────────┴──────┴───────┴────────────────┘
  ⠿ = drag handle for reorder (F-THEME-05)
```

**Create/Edit Theme** — inline form or modal:

```
┌──────────────────────────────────────┐
│  Create Theme                        │
│                                      │
│  Name (Korean) *  [_______________]  │
│  Name (English)   [_______________]  │
│  Slug (auto)      [_______________]  │
│  Icon             [📎 Upload     ]   │
│  Display Order    [___]              │
│                                      │
│            [Cancel]  [Save]          │
└──────────────────────────────────────┘
```

**Delete guard** (F-THEME-04): If shops are tagged → error: "Cannot delete theme. {count} shop(s) are still tagged with this theme."

---

## 9. Location Management (`/locations`)

> FSD: §8, F-LOC-01~09

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Regions & Districts                             [+ Add Region]  │
├──────────────────────────────────────────────────────────────────┤
│  [ko ▾ en] locale switcher                                      │
├──────────────────┬───────────────┬───────────┬──────────────────┤
│  Name (ko)       │ Name (en)     │ Districts │ Actions          │
├──────────────────┼───────────────┼───────────┼──────────────────┤
│ ▶ 서울특별시      │ Seoul         │ 25        │ [Edit] [Delete]  │
│ ▼ 부산광역시      │ Busan         │ 16        │ [Edit] [Delete]  │
│   ├─ 해운대구     │ Haeundae-gu   │ 12 shops  │ [Edit] [Delete]  │
│   ├─ 부산진구     │ Busanjin-gu   │ 8 shops   │ [Edit] [Delete]  │
│   ├─ 동래구       │ Dongnae-gu    │ 5 shops   │ [Edit] [Delete]  │
│   └─ [+ Add District]                                           │
│ ▶ 경기도          │ Gyeonggi-do   │ 44        │ [Edit] [Delete]  │
│ ▶ ...             │ ...           │ ...       │ ...              │
└──────────────────┴───────────────┴───────────┴──────────────────┘
```

**Accordion pattern** (F-LOC-05): Click ▶ to expand region and show its districts inline.

**Delete guards**:
- Region: blocked if districts exist → "Cannot delete region. {count} district(s) still exist." (F-LOC-04)
- District: blocked if shops exist → "Cannot delete district. {count} shop(s) are registered." (F-LOC-08)

---

## 10. Partnership Inquiry Management (`/inquiries`)

> FSD: §9, F-INQ-01~13

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Partnership Inquiries                                           │
├──────────────────────────────────────────────────────────────────┤
│  [Status: All ▾] [Source: All ▾] [Date: from–to]                │
├──────┬──────────┬───────┬─────────┬───────┬──────┬──────────────┤
│ Shop │ Contact  │ Phone │ Channel │ Source│Status│ Actions       │
├──────┼──────────┼───────┼─────────┼───────┼──────┼──────────────┤
│힐링스파│ 김사장   │ 010...│ KakaoTalk│ Web  │[New]🔴│ [View][⋯]   │
│마사지원│ 이대표   │ 010...│ Phone   │ Email│[Cont]│ [View][⋯]    │
│ ...  │ ...      │ ...   │ ...     │ ...  │ ...  │ ...          │
└──────┴──────────┴───────┴─────────┴───────┴──────┴──────────────┘
  🔴 = overdue indicator (>48h in "new" status) (F-INQ-12)
```

**Inquiry Detail** (F-INQ-06) — expand or modal:

```
┌──────────────────────────────────────────────────────────────────┐
│  Partnership Inquiry — 힐링스파                                   │
│  Submitted: 2026-03-20 14:30 via Website Form                    │
│  ⚠️ OVERDUE — 72 hours without contact                           │
├──────────────────────────────────────────────────────────────────┤
│  Shop Name:        힐링스파                                       │
│  Contact Person:   김사장                                         │
│  Phone:            010-1234-5678                                 │
│  Email:            kim@example.com                               │
│  Address:          서울특별시 강남구 역삼동 123-45                  │
│  Business Type:    스웨디시/아로마                                 │
│  Preferred Channel: KakaoTalk                                    │
│  Message:          "강남에서 3년째 운영 중입니다..."               │
│                                                                  │
│  ⚠️ Duplicate detected: Similar shop name found in listing #456  │
├──────────────────────────────────────────────────────────────────┤
│  Status: [▾ New → Contacted → Awaiting Info → Approved]          │
├──────────────────────────────────────────────────────────────────┤
│  Admin Notes (internal)                                          │
│  [________________________________]                              │
│  [________________________________]                              │
│                                              [Save Notes]        │
├──────────────────────────────────────────────────────────────────┤
│  [Reject]                    [Create Shop Listing →] ← if approved│
│                              (pre-populates /shops/new)           │
└──────────────────────────────────────────────────────────────────┘
```

### Storyboard: Inquiry Lifecycle

```
[1] New inquiry arrives (via website form or manual entry)
    → appears in list with "New" status + badge in sidebar

[2] Admin opens detail → sees all submitted info + overdue indicator if >48h

[3] Admin contacts shop owner → updates status to "Contacted" → adds notes

[4] Shop owner provides details → status to "Awaiting Info"

[5] Admin verifies → status to "Approved"

[6] "Create Shop Listing" → pre-populates /shops/new with inquiry data (F-INQ-10)
    → Admin completes the listing → saves & publishes

[7] Inquiry linked to published shop → status auto-set to "Published" (F-INQ-11)

Alternative:
[3b] Inquiry rejected at any stage → "Reject" → confirmation → terminal state
```

---

## 11. Customer Account Management (`/users`)

> FSD: §10, F-USER-01~10

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Users                                                           │
├──────────────────────────────────────────────────────────────────┤
│  [🔍 Search by name/email]  [Status: All ▾]  [Provider: All ▾]  │
├──────────┬──────────┬──────────┬────────┬──────┬────────┬───────┤
│ Name     │ Email    │ Provider │ Reviews│Status│ Joined │ Act   │
├──────────┼──────────┼──────────┼────────┼──────┼────────┼───────┤
│ 힐링마스터│ heal@... │ Kakao    │ 24     │[Active]│ 2026-01│ [⋯]│
│ 스팸유저  │ spam@... │ Email    │ 52     │[Locked]│ 2026-02│ [⋯]│
│ ...      │ ...      │ ...      │ ...    │ ...  │ ...    │ ...  │
└──────────┴──────────┴──────────┴────────┴──────┴────────┴───────┘
```

**Row Actions (⋯)**:

| Action | Behavior |
|---|---|
| View Detail | Modal: profile info, account status, lock reason, review count, activity summary (F-USER-08) |
| Lock Account | Lock reason dialog → account blocked (F-USER-06) |
| Unlock Account | Confirmation → account unblocked (F-USER-07) |
| View Reviews | → `/reviews?author={userId}` (F-USER-09) |

**Lock Account Dialog**:

```
┌──────────────────────────────────────┐
│  ⚠️ Lock Account                      │
│                                      │
│  User "힐링마스터" will be unable to  │
│  submit reviews or any content.      │
│                                      │
│  Reason *                            │
│  [▾ Select reason              ]     │
│                                      │
│  Reasons: Spam, Fake reviews,        │
│  Harassment, Abuse, Other            │
│                                      │
│            [Cancel]  [Lock Account]  │
└──────────────────────────────────────┘
```

---

## 12. Audit Log (`/audit-log`)

> FSD: §11, F-AUDIT-01~09

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Audit Log                                                       │
├──────────────────────────────────────────────────────────────────┤
│  [Content Type ▾] [Action ▾] [Admin ▾] [Date: from–to] [Doc ID] │
├───────────────────┬───────┬──────────┬────────┬─────────────────┤
│ Timestamp         │ Admin │ Type     │ Action │ Document        │
├───────────────────┼───────┼──────────┼────────┼─────────────────┤
│▶ 2026-03-26 14:30 │ admin │ Shop     │ Update │ 골드문 (#456)    │
│▼ 2026-03-26 14:15 │ admin │ Shop     │ Publish│ 힐링스파 (#789)  │
│  ┌─ Field Diffs ──────────────────────────────────────────┐    │
│  │ Field            │ Before          │ After              │    │
│  │ description      │ "이전 설명..."   │ "수정된 설명..."    │    │
│  │ operating_hours  │ "10:00–22:00"   │ "10:00–23:00"     │    │
│  └────────────────────────────────────────────────────────┘    │
│▶ 2026-03-26 13:50 │ admin │ Review   │ Hide   │ Review #4521   │
│▶ ...              │ ...   │ ...      │ ...    │ ...            │
└───────────────────┴───────┴──────────┴────────┴─────────────────┘
```

**Expand** (▶ → ▼): Shows field-level diff table (F-AUDIT-07) with before/after values for each changed field.

---

## 13. State-Based Screen Branching

### 13.1 Auth States

| State | Behavior |
|---|---|
| Not authenticated | Any page → redirect to `/login` |
| Authenticated | `/login` → redirect to `/dashboard` |
| Session expired | Current action interrupted → redirect to `/login` + "Session expired" message |

### 13.2 Data States

| State | Treatment |
|---|---|
| Loading | Loading indicators are shown while content loads |
| Data empty | "No results found" centered in table body area. Suggestion to adjust filters |
| Error (server) | Error toast: "A temporary error occurred. Please try again shortly." + retry |
| Error (network) | Error toast: "Please check your network connection." |
| Validation error | Inline field-level errors (red border + message). Scroll to first error on submit |

### 13.3 Destructive Action Confirmation

All of these require explicit confirmation dialogs:

| Action | Dialog Message |
|---|---|
| Unpublish shop | "This shop will be hidden from the Customer Web immediately." + reason selection |
| Hide review | "This review will be removed from public view." + reason selection |
| Delete review | "This review will be permanently removed from public view." |
| Lock user | "This user will be unable to submit reviews or content." + reason selection |
| Delete theme | "This theme will be permanently deleted." (blocked if shops tagged) |
| Delete region/district | "This will be permanently deleted." (blocked if children exist) |
| Reject inquiry | "This inquiry will be marked as rejected." |

---

## 14. Interaction Patterns Summary

### 14.1 CRUD Pattern

All management pages follow the same interaction loop:

```
List (table) → Create/Edit (form) → Save → Back to List (with toast)
                                  ↘ Preview (new tab, Customer Web view)
```

### 14.2 Inline vs Modal vs Page

| Pattern | Used For |
|---|---|
| Full page form | Shop Create, Shop Edit (complex, many fields) |
| Modal/dialog | Theme create/edit, review detail, user detail, confirmations |
| Inline expand | Audit log diffs, location district list, inquiry detail |
| Dropdown menu | Row actions (⋯), status changes |

### 14.3 Cross-Page Navigation

| From | Link | To |
|---|---|---|
| Dashboard → New Inquiries alert | → | `/inquiries?status=new` |
| Dashboard → Pending Reviews alert | → | `/reviews?status=under_review` |
| Dashboard → Create Shop | → | `/shops/new` |
| Shop Edit → Audit History | → | `/audit-log?document={shopId}` |
| Review row → View Author | → | `/users?search={authorName}` |
| User row → View Reviews | → | `/reviews?author={userId}` |
| Inquiry → Create Shop Listing | → | `/shops/new?from_inquiry={inquiryId}` |

---

> **Document End**
>
> This UI/UX Specification should be reviewed alongside the Admin Web FSD and updated when Figma designs are available. Figma frames will provide visual refinement for all wireframes defined in this document.
