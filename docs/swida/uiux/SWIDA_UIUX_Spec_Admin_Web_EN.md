---
title: 'SWIDA — Admin Web UI/UX Spec'
sidebar_label: 'English'
sidebar_position: 1
---

# UI/UX Specification

## SWIDA — Admin Web

- **Version**: 1.2
- **Date**: 2026-03-30
- **Based on**: SWIDA PRD v1.2, TSD v1.2, Admin Web FSD v1.2
- **Scope**: MVP — Admin-facing platform management web application
- **Target**: Desktop-primary (minimum supported screen width for desktop use)
- **Figma**: Not yet available — to be added in a future revision
- **Document role**: This document defines screen layouts, interaction flows, and component patterns. **Functional logic, business rules, and data contracts are defined in the FSD v1.2, which is the authority for all logic decisions.** The HTML prototype is a visual reference only — it is not a binding interaction contract. See FSD §1.5 for the full document authority hierarchy.
- **Change summary (v1.1 → v1.2):** §1.1/§1.3 source-of-truth contradiction resolved. §2.1 viewport overflow strategy clarified (column truncation, not "no horizontal scroll"). §3.1 Sidebar: explicit logout popover with visible "Log Out" button added; deferred sidebar items shown as disabled. §3.4 Status Badges: `under_review` changed to amber. §3.4 Data Tables: filter chip scalability note added; bulk actions noted as post-MVP. Added §15 Data & UI States (loading skeletons, empty states, error cards). Added §16 Preview System UX. §14.2 updated (bulk actions post-MVP).

---

## 1. Document Overview

### 1.1 Purpose

This document defines the screen layouts, component structures, and interaction flows for the SWIDA Admin Web application. It is the **interaction authority** — it defines how the system behaves, how admins navigate it, and what they see in every state.

**This document does not define:**

- Business rules, status logic, or data contracts → those are in the **FSD v1.2** (the functional authority)
- Colors, typography, spacing, icon styles → those are in the separate **Design System document**
- Backend API behavior → that is in the **TSD v1.2**

**Document hierarchy** (see FSD §1.5 for full spec):

1. **FSD v1.2** — logic authority (what the system does)
2. **This document (UI/UX Spec v1.2)** — interaction authority (how it behaves)
3. **HTML Prototype** — visual reference only (how it looks — not a binding contract)

When this spec and the prototype conflict, **this spec wins**. When this spec and the FSD conflict, **the FSD wins**.

### 1.2 Scope

| Covered                                             | Not Covered                        |
| --------------------------------------------------- | ---------------------------------- |
| Desktop layout shell                                | Colors, typography, spacing values |
| Page-level screen structure (wireframe level)       | Animation speed / easing curves    |
| Component patterns (tables, forms, modals, dialogs) | Customer Web UI                    |
| Admin interaction flows (storyboards)               | Backend system admin panel         |
| State-based screen branching                        |                                    |

### 1.3 Design Principles

| Principle          | Description                                                                      |
| ------------------ | -------------------------------------------------------------------------------- |
| Desktop-primary    | Minimum supported screen width for desktop use. No mobile optimization required. |
| Data-dense         | Prioritize information density — tables, filters, and stats over whitespace      |
| Sidebar navigation | Persistent left sidebar for all pages                                            |
| Confirmation-first | All destructive actions require explicit confirmation dialogs                    |
| English UI         | All admin interface text is in English                                           |

---

## 2. Layout System

### 2.1 Viewport

Optimized for standard desktop monitors (1280px and wider). Single desktop layout — no responsive breakpoints.

**Column overflow strategy for data-dense tables:**

The Admin Web has several tables with many columns (e.g., Shops: Thumb + Name + Location + Themes + Rating + Status + Last Verified + Actions). Rather than enforcing "no horizontal scroll" — which will overflow on real data — the following column strategies apply:

| Technique                           | Used When                                                                                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text truncation with `…` + tooltip  | Long text in fixed-width columns (shop names, descriptions, email addresses)                                                                                            |
| Column priority hiding              | On narrower viewports (1280–1440px), lower-priority columns (e.g., "Last Verified", "Location") collapse or hide. Core columns (Name, Status, Actions) always remain.   |
| Minimum column widths               | Actions column has a fixed minimum width. Name column has a minimum to prevent awkward line-breaks.                                                                     |
| Horizontal scroll within table only | If the table genuinely cannot fit, the table container scrolls horizontally while the sidebar and topbar remain fixed. This is a last resort — prefer truncation first. |

**If the browser window is too narrow** (< 1024px): show a full-page notice: "Admin Web is optimized for desktop browsers (minimum 1024px)." The app is non-functional below this width.

### 2.2 Layout Shell

```
┌──────────┬───────────────────────────────────────────────────────────┐
│  SIDEBAR │  TOPBAR (page-level, fixed top of main area)               │
│  (left   │  [Page Title]  breadcrumb         [Contextual Actions]     │
│  fixed,  ├───────────────────────────────────────────────────────────┤
│  full    │  MAIN CONTENT AREA                                         │
│  height) │  ┌─────────────────────────────────────────────────────┐  │
│          │  │  Page Body (tables, forms, cards)                   │  │
│          │  │  (scrollable)                                       │  │
│          │  │                                                     │  │
│          │  └─────────────────────────────────────────────────────┘  │
└──────────┴───────────────────────────────────────────────────────────┘
```

| Element      | Behavior                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Sidebar      | Fixed-width, fixed left, full viewport height. Contains logo, nav groups, and admin user identity at bottom. Scrollable if overflow.       |
| Topbar       | Fixed at top of main content area only (not full-width). Shows current page title, breadcrumb, and contextual action buttons on the right. |
| Main Content | Fills remaining width to the right of the sidebar. Scrollable vertically.                                                                  |

> There is no separate full-width global header bar. The logo and admin user identity live inside the sidebar, not in a top bar.

---

## 3. Common Shell Components

### 3.1 Sidebar

The sidebar is the primary navigation container. It is fixed on the left, spans the full viewport height, and never scrolls with the page content.

```
┌──────────────────────┐
│  SWI[DA]             │  ← logo mark, links to /dashboard
│  Admin Console       │  ← sub-label
├──────────────────────┤
│  ── Overview ──      │
│  📊 Dashboard        │  ← active: white text + subtle bg
│                      │
│  ── Content ──       │
│  🏪 Shops    [512]   │  ← badge: total shop count
│  ➕ New Shop          │
│  🌿 Themes           │
│  📍 Locations        │
│  📋 Board Posts ···  │  ← disabled (deferred)
│  🎉 Events      ···  │  ← disabled (deferred)
│  📢 Notices     ···  │  ← disabled (deferred)
│                      │
│  ── Moderation ──    │
│  ⭐ Reviews   [7]    │  ← badge: under_review count (amber)
│  🤝 Partnership [4]  │  ← badge: new inquiry count
│  👥 Users            │
│  💬 Community   ···  │  ← disabled (deferred)
│                      │
│  ── System ──        │
│  📋 Audit Log        │
│                      │
│  ░░░░░░░░░░░░░░░░░░  │  ← spacer fills remaining height
├──────────────────────┤
│  [관] Admin          │  ← click to open logout popover
│       admin.swida.com│
└──────────────────────┘
```

**Disabled sidebar items (deferred):**

Items marked `···` (Board Posts, Events, Notices, Community) are deferred MVP features. They appear in the sidebar as grayed-out, non-interactive entries. On hover, a tooltip shows: "Coming soon." Clicking does nothing. This ensures engineers can see the full navigation scope and route slots are reserved.

**Logout popover:**

Clicking the admin user identity block at the bottom opens a small popover anchored to the bottom of the sidebar:

```
┌────────────────────────────┐
│  admin@swida.com           │
│  ─────────────────────     │
│  [  Log Out  ]             │
└────────────────────────────┘
```

The "Log Out" button is always immediately visible inside the popover — it is not hidden behind a hover state or a secondary click. Clicking "Log Out" triggers F-LOGOUT-01~02 (clear session → redirect to `/login`).

| Element           | Description                                                                          | FSD Ref     |
| ----------------- | ------------------------------------------------------------------------------------ | ----------- |
| Logo mark         | "SWIDA" text with brand color accent. Links to `/dashboard`                          | F-NAV-01    |
| Sub-label         | "Admin Console" in small uppercase muted text                                        | —           |
| Group labels      | Uppercase muted section headers: Overview / Content / Moderation / System            | —           |
| Active item       | White text + subtle semi-transparent white background                                | F-NAV-02~10 |
| Shops badge       | Total shop count. Brand-color pill                                                   | F-NAV-03    |
| Reviews badge     | `under_review` count. **Amber** pill (matches the amber `under_review` status color) | F-NAV-07    |
| Partnership badge | `new` inquiry count. Brand-color pill                                                | F-NAV-08    |
| Disabled items    | Gray text, no hover state, "Coming soon" tooltip on hover                            | F-NAV §2.2  |
| Admin identity    | Avatar initial + display name + role label. Clickable — opens logout popover         | F-NAV-12    |
| Logout popover    | Email + explicit "Log Out" button. Always visible, not hover-gated                   | F-LOGOUT-03 |

### 3.2 Topbar (Page-Level)

The topbar sits at the top of the main content area. It is not full-width — it only spans the content area to the right of the sidebar.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Dashboard                              KST 2026-03-26 14:32        │
│  SWIDA Admin  ›  Overview                                            │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  Shops                      [Export CSV]  [+ New Shop]               │
│  SWIDA Admin  ›  All Listings                                        │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  Edit Shop                  [Cancel]  [Save Draft]  [Publish]        │
│  Shops  ›  그린 힐링 스파                                              │
└──────────────────────────────────────────────────────────────────────┘
```

| Element            | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| Page title         | Current page name, bold (e.g., "Dashboard", "Shops", "Edit Shop") |
| Breadcrumb         | Muted path below the title (e.g., "SWIDA Admin › Overview")       |
| Contextual actions | Right-aligned buttons — vary by page. See per-page specs below.   |

**Contextual actions by page:**

| Page               | Actions                         |
| ------------------ | ------------------------------- |
| Dashboard          | KST timestamp (no buttons)      |
| Shops list         | [Export CSV] [+ New Shop]       |
| Shop Create / Edit | [Cancel] [Save Draft] [Publish] |
| Reviews            | [Export]                        |
| All other pages    | KST timestamp (no buttons)      |

> Note: There is no "View Site ↗" or "Admin ▾" dropdown in the topbar. These are not present in the prototype.

### 3.3 Page Header Pattern

Every page topbar follows this structure. The filter bar appears in the content area directly below the topbar, as part of the page body:

```
TOPBAR:
┌──────────────────────────────────────────────────────────────────┐
│  Page Title                              [Contextual Actions]    │
│  Breadcrumb path                                                 │
└──────────────────────────────────────────────────────────────────┘
CONTENT AREA:
┌──────────────────────────────────────────────────────────────────┐
│  [Search / Filter Bar]                                           │
├──────────────────────────────────────────────────────────────────┤
│  [Page Body]                                                     │
└──────────────────────────────────────────────────────────────────┘
```

### 3.4 Common UI Patterns

#### Data Tables

List pages that use a table pattern (Shops, Reviews, Users, Audit Log):

```
┌──────────────────────────────────────────────────────────────────┐
│  [Search input]  [Filter chip: All]  [Filter chip: Status]  ...  │
├──────────┬────────┬───────┬────────┬─────────┬──────────────────┤
│ Column 1 │ Col 2  │ Col 3 │ Col 4  │ Status  │ Actions          │
├──────────┼────────┼───────┼────────┼─────────┼──────────────────┤
│ Data     │ Data   │ Data  │ Data   │ [Badge] │ [Btn] [Btn] [Btn]│
│ Data     │ Data   │ Data  │ Data   │ [Badge] │ [Btn] [Btn] [Btn]│
│ Data     │ Data   │ Data  │ Data   │ [Badge] │ [Btn] [Btn] [Btn]│
├──────────┴────────┴───────┴────────┴─────────┴──────────────────┤
│  Showing 1-5 of 512            [< 1 2 3 … >]                    │
└──────────────────────────────────────────────────────────────────┘
```

| Feature               | Description                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No checkbox column    | Row selection / bulk actions are not present in the MVP. See "Bulk Actions" note below.                                                                                  |
| Filter chips          | Horizontal pill-style chips for single-dimension filtering (e.g., status). Active chip has brand-color border and light background. One active at a time per chip group. |
| Inline action buttons | Each row has 2–3 small inline buttons. No ⋯ overflow menu in MVP.                                                                                                        |
| Pagination            | Page number buttons + "Showing N–M of Total" info line                                                                                                                   |
| Loading               | Skeleton rows while data loads (see §15.1)                                                                                                                               |
| Empty state           | Context-specific message + action (see §15.2)                                                                                                                            |

> **Filter chip scalability note:** Filter chips work well for single-dimension filtering (status only). For multi-dimensional filtering (location + theme + status simultaneously), chips will be insufficient. Multi-dimensional filtering is out of scope for MVP but must be planned for in the component architecture — use separate chip groups per dimension that can be combined, not a flat single chip group that would require one chip per combination.

> **Bulk actions — post-MVP:** Checkbox column and bulk action dropdown (Hide, Delete) are planned for a post-MVP iteration. The data model and API already support bulk operations. When implemented, the table gains a checkbox column on the left and a "Bulk actions" dropdown appears in the filter bar when ≥1 row is selected. Engineers should not assume the current table structure is permanent.

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

Status pills are small rounded labels with colored text on a lightly tinted background.

| Status           | Color       | CSS Class       | Used In        | Rationale                             |
| ---------------- | ----------- | --------------- | -------------- | ------------------------------------- |
| Published        | Green       | `.pub`          | Shops, Reviews | Positive / publicly visible           |
| Active           | Green       | `.pub`          | Users          | Account in good standing              |
| Contacted        | Green       | Inline style    | Inquiries      | Progress made                         |
| Draft            | Amber       | `.draft`        | Shops          | Needs attention before publishing     |
| **Under Review** | **Amber**   | `.under-review` | **Reviews**    | **Action needed — admin must triage** |
| Hidden           | Red         | `.hidden`       | Reviews        | Terminal / removed from public view   |
| Locked           | Red         | `.hidden`       | Users          | Blocked state                         |
| New              | Blue        | `.new`          | Inquiries      | Unread / first contact not yet made   |
| Awaiting Info    | Blue        | Inline style    | Inquiries      | Waiting on external input             |
| Approved         | Brand color | Inline style    | Inquiries      | Ready for next step                   |
| Rejected         | Red         | Inline style    | Inquiries      | Terminal / declined                   |

> **Why `under_review` is amber, not red:** `under_review` and `hidden` are functionally different states that happen to both mean "not visible on Customer Web." `under_review` means "flagged, waiting for admin decision" — it requires action. `hidden` means "admin already decided to hide it" — it is a resolved terminal state. Giving them the same color would prevent admins from triaging by scan. Amber = action needed. Red = already handled or blocked. This intentionally deviates from the HTML prototype, which uses red for both — the prototype's color choice was a known visual gap (see FSD §6).

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

> FSD: §4, F-DASH-01~09

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Dashboard                             KST 2026-03-26 14:32      │
│  SWIDA Admin  ›  Overview                                        │
├──────────────────────────────────────────────────────────────────┤
│  ⚠️ [amber alert] 7 shops have not been verified in over 90 days  │
│                                          [Review now →]          │
├──────────────────────────────────────────────────────────────────┤
│  STAT CARDS (4 columns)                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│  │ Total Shops│ │Monthly     │ │Total       │ │New         │    │
│  │ 512        │ │Users       │ │Reviews     │ │Inquiries   │    │
│  │            │ │ 9,841      │ │ 4,328      │ │ 4          │    │
│  │↑ +18 this  │ │↑ +12% vs   │ │↑ +487 this │ │⚠ 2 overdue│    │
│  │  month     │ │  last month│ │  month     │ │  (48h)     │    │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘    │
├─────────────────────────────┬────────────────────────────────────┤
│  Monthly Signups            │  Pending Reviews                   │
│  ┌─────────────────────┐   │  ┌────────────────────────────┐   │
│  │  [bar chart ×7 mo]  │   │  │ ⭐ 그린 힐링 스파 — 김민준  │   │
│  │  9월 10월…  3월     │   │  │    신고 3회 · "스팸 의심"   │   │
│  └─────────────────────┘   │  │    [under review pill]      │   │
│                             │  │                            │   │
│                             │  │ ⭐ 타이 마사지 방콕 — 이서연│   │
│                             │  │    신고 1회                 │   │
│                             │  │                            │   │
│                             │  │           [View all →]     │   │
│                             │  └────────────────────────────┘   │
├─────────────────────────────┼────────────────────────────────────┤
│  Recent Shops               │  Partnership Inquiries             │
│  ┌─────────────────────┐   │  ┌────────────────────────────┐   │
│  │ 🌿 그린 힐링 스파     │   │  │ 🤝 한강 뷰 스파            │   │
│  │    강남구 · 2026.03.24│  │  │    마포구 · Overdue [red]   │   │
│  │    [published]       │   │  │    [new pill]               │   │
│  │                      │   │  │                            │   │
│  │ 🙏 타이 마사지 방콕   │   │  │ 🤝 강남 프리미엄 마사지    │   │
│  │    마포구 · 2026.03.22│  │  │    강남구 · 2026.03.25      │   │
│  │    [draft]           │   │  │    [new pill]               │   │
│  │              [View →]│   │  │                  [View →]   │   │
│  └─────────────────────┘   │  └────────────────────────────┘   │
└─────────────────────────────┴────────────────────────────────────┘
```

| Section               | Description                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Verify alert          | Amber banner shown only when shops haven't been re-verified in 90+ days. Amber background, amber text, link to filtered shop list. |
| Stat cards            | 4 equal-width cards in one row. Each shows a label, large number, and a delta line below. No status sub-breakdown.                 |
| Monthly Signups       | Bar chart of new user signups per month, last 7 months. Active month bar highlighted in brand color.                               |
| Pending Reviews       | Feed of up to 3 `under_review` reviews. Icon, shop+author name, report count snippet, status pill. "View all →" link.              |
| Recent Shops          | Feed of up to 3 most recently created shops. Icon, name, district + date, status pill. "View all →" link.                          |
| Partnership Inquiries | Feed of up to 3 open inquiries. Overdue items show red "Overdue" label. Status pill. "View all →" link.                            |

**Stat card delta line colors:**

- Positive delta (↑) → green text
- Overdue warning (⚠) → amber text

---

## 6. Shop Management

### 6.1 Shop List (`/shops`)

> FSD: §5.1, F-SHOP-01~12

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Shops                          [Export CSV]  [+ New Shop]       │
│  SWIDA Admin  ›  All Listings                                    │
├──────────────────────────────────────────────────────────────────┤
│  [🔍 Search shop name...]                                        │
│  [All (512)] [Published (488)] [Draft (24)] [Verify needed (7)]  │
├───────┬──────────────────┬──────────┬────────┬───────┬──────┬───────────────────┤
│ Thumb │ Shop Name        │ Location │ Themes │Rating │Status│ Last Verified  │ Actions│
├───────┼──────────────────┼──────────┼────────┼───────┼──────┼───────────────────┤
│ [🌿]  │ 그린 힐링 스파    │ 서울 강남구│스웨디시│★ 4.9  │[pub] │ 2026.03.20     │[Edit][Unpublish][👁]│
│       │ 역삼동           │          │아로마  │(238)  │      │                │                    │
├───────┼──────────────────┼──────────┼────────┼───────┼──────┼───────────────────┤
│ [🙏]  │ 타이 마사지 방콕  │ 서울 마포구│타이    │★ 4.8  │[draft]│⚠ 95일 경과    │[Edit][Publish][👁] │
│       │ 합정동           │          │딥티슈  │(175)  │      │                │                    │
├───────┴──────────────────┴──────────┴────────┴───────┴──────┴───────────────────┤
│  Showing 1–5 of 512          [‹]  [1]  [2]  [3]  …  [103]  [›]                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Column details:**

- **Thumb**: Small icon/emoji in a rounded square (40×40). No actual image in prototype — placeholder icon.
- **Shop Name**: Bold shop name on top, muted district name sub-label below.
- **Location**: Full "Region District" text (e.g., "서울 강남구").
- **Themes**: Comma-separated theme names in muted small text.
- **Rating**: Star + number + review count in parentheses.
- **Status**: Colored pill — `[published]` green, `[draft]` amber.
- **Last Verified**: Date string. Overdue shows red "⚠ N일 경과" text.
- **Actions**: Inline buttons — `[Edit]` always, `[Publish]` or `[Unpublish]` based on status, `[👁]` preview always.

**Filter chips (above table):** Pill-style chips — All (total), Published (count), Draft (count), Verify needed (count). Active chip has brand-color border and light fill. Only one active at a time.

**No checkbox column. No ⋯ overflow menu.**

### 6.2 Shop Create (`/shops/new`)

> FSD: §5.2, F-SHOP-13~27

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Create New Shop              [Cancel]  [Save Draft]  [Publish]  │
│  Shops  ›  New                                                   │
├─────────────────────────────────────────┬────────────────────────┤
│  LEFT COLUMN (main form)                │  RIGHT COLUMN (sidebar)│
│                                         │                        │
│  ┌─ Basic Information ───────────────┐  │  ┌─ Publish Status ──┐ │
│  │ Shop Name *  [________________]  │  │  │ ● Draft            │ │
│  │ Phone Number [________________]  │  │  │   Not visible      │ │
│  │ Description *                    │  │  │                    │ │
│  │ [______________________________] │  │  │ [✓ Publish Shop]   │ │
│  │ [______________________________] │  │  │ [👁 Preview]       │ │
│  │               max 500 characters │  │  └────────────────────┘ │
│  │ Address *    [________________]  │  │                        │
│  └───────────────────────────────────┘  │  ┌─ Contact Channels ┐ │
│                                         │  │ KakaoTalk ID      │ │
│  ┌─ Location ────────────────────────┐  │  │ [______________]  │ │
│  │ Region (Level 1) * [▾ select]    │  │  │ Instagram         │ │
│  │ District (Level 2)* [▾ select]   │  │  │ [______________]  │ │
│  └───────────────────────────────────┘  │  │ Naver Place URL   │ │
│                                         │  │ [______________]  │ │
│  ┌─ Location — Map Pin Drop ─────────┐  │  │ Website URL       │ │
│  │ [🗺️ Kakao Map placeholder]        │  │  │ [______________]  │ │
│  │    Click to place pin             │  │  └────────────────────┘ │
│  │    Lat: 37.4981 · Lng: 127.0276  │  │                        │
│  │                                   │  │  ┌─ Custom Tags ─────┐ │
│  │ Latitude *  [37.4981  ]           │  │  │ Open Tag           │ │
│  │ Longitude * [127.0276 ]           │  │  │ [영업중 default]   │ │
│  └───────────────────────────────────┘  │  │ Closed Tag         │ │
│                                         │  │ [영업종료 default] │ │
│  ┌─ Service Themes * ────────────────┐  │  └────────────────────┘ │
│  │ [🌿 스웨디시●] [🌸 아로마●]        │  │                        │
│  │ [🙏 타이] [⚡ 스포츠] [💑 커플]    │  │                        │
│  │ [💪 딥티슈] [🦶 발마사지] ...      │  │                        │
│  └───────────────────────────────────┘  │                        │
│                                         │                        │
│  ┌─ Hours & Booking ─────────────────┐  │                        │
│  │ Operating Hours * [10:00–22:00]  │  │                        │
│  │ Last Order Time   [21:30      ]  │  │                        │
│  │ Closing Days *    [매주 일요일]   │  │                        │
│  │ Booking Required *[▾ No/Yes   ]  │  │                        │
│  └───────────────────────────────────┘  │                        │
│                                         │                        │
│  ┌─ Amenities ───────────────────────┐  │                        │
│  │ ☑ Parking  ☑ Shower  ☑ Sleeping  │  │                        │
│  │ ☑ Private  ☑ WiFi    ☐ Access    │  │                        │
│  └───────────────────────────────────┘  │                        │
│                                         │                        │
│  ┌─ Images ──────────────────────────┐  │                        │
│  │ 📸 Click to upload photos         │  │                        │
│  │    (max 10, min 1)                │  │                        │
│  │    JPG, PNG · Stored in MinIO     │  │                        │
│  └───────────────────────────────────┘  │                        │
└─────────────────────────────────────────┴────────────────────────┘
```

**Layout:** Two-column. Left column is wider (main form cards stacked vertically). Right column is narrower (Publish Status card, Contact Channels card, Custom Tags card stacked vertically).

**Topbar buttons:**

- `[Cancel]` → navigates back to `/shops`
- `[Save Draft]` → saves without publishing, redirects to `/shops/[id]`
- `[Publish]` → saves and publishes, redirects to `/shops/[id]`

**Theme chips:** Clickable pill chips. Selected chips have brand-color border and light fill. Unselected chips have neutral border.

**Amenities:** Grid of checkboxes (2 columns). No separate toggle UI — standard checkboxes.

**Publish Status card (right column):** Shows current status (dot indicator + label + "Not visible" note). Two buttons stacked: "✓ Publish Shop" (green, full width) and "👁 Preview (Customer View)" (ghost, full width).

**Deferred fields** (in data model but not in current prototype form): service menu table, price range, gender availability, holiday exceptions, languages supported, thumbnail star selector, locale switcher.

#### Map Pin Drop (F-SHOP-15)

| Behavior              | Description                                                                                                                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default center        | Seoul City Hall (37.5666, 126.9784), zoom 12                                                                                                                                                                                                                                  |
| Address search        | Input above map → auto-center. If not found → toast "주소를 찾을 수 없습니다" + allow manual pin                                                                                                                                                                              |
| Pin placement         | Click map to place/move pin. Pin is draggable                                                                                                                                                                                                                                 |
| Coordinate fields     | Auto-populated from pin. Also manually editable. Manual entry overrides pin drop values                                                                                                                                                                                       |
| SDK load failure      | If Kakao Map JS SDK fails (key expired, quota exceeded, network timeout): hide map container, show error banner "지도를 불러올 수 없습니다 — 좌표를 직접 입력하세요" / "Map unavailable — enter coordinates manually". Lat/lng text fields remain functional for manual entry |
| Coordinate validation | Latitude: −90 to 90. Longitude: −180 to 180. Both required for save                                                                                                                                                                                                           |
| Edit mode             | Center on saved coordinates                                                                                                                                                                                                                                                   |

#### Storyboard: Shop Create

```
[1] /shops/new → empty form. Topbar: Create New Shop | Cancel | Save Draft | Publish

[2] Admin fills required fields. Form validates in real-time:
    - Required field empty → red border + "Required" label
    - Description exceeds 500 chars → character counter turns red
    - No theme selected → inline error on theme section

[3] Map pin drop:
    [3a] Admin clicks map → pin placed → lat/lng fields update
    [3b] Address not found → toast + manual pin placement
    [3c] Kakao Map SDK fails → map hidden, error banner shown,
         admin enters lat/lng manually in text fields

[4] Image upload:
    [4a] Click upload zone → file picker → image preview
    [4b] > 5MB → error toast: "Image file is too large. Maximum size: 5MB."

[5a] "Save Draft" → save as draft → success toast → redirect to /shops/[id]
[5b] "Publish" → save and publish → success toast → redirect to /shops/[id]
[5c] Validation fails → scroll to first error + inline error messages
```

### 6.3 Shop Edit (`/shops/[id]`)

> FSD: §5.3, F-SHOP-28~35

Same two-column layout as Shop Create with these differences:

| Difference           | Description                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Topbar title         | "Edit Shop" (not "Create New Shop")                                                                                                          |
| Breadcrumb           | "Shops › {shop name}"                                                                                                                        |
| Pre-populated fields | All existing data loaded into form (F-SHOP-28)                                                                                               |
| Publish Status card  | Shows current status. Published shops show "Unpublish" button (triggers reason dialog). Draft shops show "✓ Publish Shop" button (F-SHOP-31) |
| Preview button       | "👁 Preview (Customer View)" in the Publish Status card. Opens Customer Web in new tab (F-SHOP-32)                                           |

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
│  Reviews                                           [Export]      │
│  SWIDA Admin  ›  Moderation                                      │
├──────────────────────────────────────────────────────────────────┤
│  [🔍 Search shop or reviewer...]                                 │
│  [All]  [Under Review (7)]  [Published]  [Hidden]                │
├───────────┬────────┬───┬──────────────────┬─────┬───────┬───────┬────────────┤
│ Shop      │Reviewer│ ★ │ Content Preview  │ Rpt │Reason │Status │ Actions    │
├───────────┼────────┼───┼──────────────────┼─────┼───────┼───────┼────────────┤
│ 그린 힐링  │ 김민준 │ ★5│ 스웨디시 90분...  │ [3] │ spam  │[under │[Keep][Hide]│
│ 스파       │       │   │                  │     │       │review]│            │
├───────────┼────────┼───┼──────────────────┼─────┼───────┼───────┼────────────┤
│ 타이 마사지│ 이서연 │ ★4│ 커플 패키지...    │ [1] │inapp. │[under │[Keep][Hide]│
│ 방콕       │       │   │                  │     │       │review]│            │
├───────────┴────────┴───┴──────────────────┴─────┴───────┴───────┴────────────┤
│  7 reviews under review          [1]  [2]                                     │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Report count badge:** Red background pill for high count (≥3), amber for lower counts.

**Reason column:** Shows raw reason code in monospace text (e.g., `spam`, `inappropriate`, `fake_review`).

**Status pill:** `under_review` uses amber `.under-review` pill. `hidden` uses red `.hidden` pill. They are visually distinct — amber signals "admin action needed", red signals "already handled." See §3.4 for full rationale. Note: the prototype uses red for both — this is a known deviation that must be corrected in implementation.

**Row actions — two inline buttons per row:**

- `[Keep]` — green-styled button → sets status to `published`
- `[Hide]` — red-styled button → opens Hide Reason dialog → sets status to `hidden`

**No checkbox column. No bulk action dropdown. No ⋯ overflow menu.**

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

### Storyboard: Review Moderation

```
[1] /reviews → default: "Under Review" filter chip active
    → shows flagged reviews needing attention

[2] Admin reads content preview + report count + reason

[3a] "Keep" → status → published → review appears on Customer Web
     → rating recalculated → toast "Review published"
[3b] "Hide" → reason dialog → confirmed → review hidden
     → rating recalculated → toast "Review hidden"

[4] Switch to "All" chip to see all reviews regardless of status
```

---

## 8. Theme Management (`/themes`)

> FSD: §7, F-THEME-01~06

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Themes                                                          │
│  SWIDA Admin  ›  Content                                         │
├──────────────────────────────────────────────────────────────────┤
│  ┌─ Service Themes (9) ──────────────────────────────────────┐  │
│  │                                                           │  │
│  │  KO             EN        Shops    Actions                │  │
│  │  ─────────────────────────────────────────────────────    │  │
│  │  🌿 스웨디시     Swedish    184      [Edit]                │  │
│  │  🙏 타이         Thai       132      [Edit]                │  │
│  │  🌸 아로마       Aroma      210      [Edit]                │  │
│  │  💑 커플         Couple      97      [Edit]                │  │
│  │  ...            ...        ...      ...                   │  │
│  │                                                           │  │
│  │  [+ Add Theme]                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**Table columns:** Icon + KO name | EN name | Shop count | Edit button.

**No drag handle. No Delete button in table. No Slug column. No locale switcher in page.**

**"+ Add Theme" button:** Below the table, navigates to or opens a create form/modal.

**Create/Edit Theme** — modal:

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

Inquiries are displayed as a **card grid** (3 columns), not a table.

```
┌──────────────────────────────────────────────────────────────────┐
│  Partnership Inquiries                                           │
│  SWIDA Admin  ›  Moderation                                      │
├──────────────────────────────────────────────────────────────────┤
│  4 open inquiries · 2 overdue (48h response target)    [All]     │
├──────────────────────┬───────────────────────┬───────────────────┤
│ ┌─overdue border─┐   │ ┌────────────────────┐│ ┌───────────────┐ │
│ │ 한강 뷰 스파    │   │ │ 강남 프리미엄 마사지││ │ 힐링 존 마사지│ │
│ │         [new]  │   │ │             [new]  ││ │   [contacted] │ │
│ │ 📍 마포구       │   │ │ 📍 강남구 · Email  ││ │ 📍 종로구     │ │
│ │ KakaoTalk       │   │ │ ⚠ 24h no response  ││ │ Instagram     │ │
│ │ 2026.03.24      │   │ │ 담당: 이사장        ││ │ Awaiting info │ │
│ │ ⚠ 48h overdue  │   │ │                    ││ │ 담당: 박원장  │ │
│ │ 담당: 김대표    │   │ │ [▓][ ][ ][ ][ ]   ││ │               │ │
│ │ 010-1234-5678   │   │ │                    ││ │ [▓][▓][▓][ ][ │ │
│ │ [▓][ ][ ][ ][ ]│   │ │[Add Note][Contact→]││ │               │ │
│ │[Add Note][Cont→]│   │ └────────────────────┘│ │[Add Note]     │ │
│ └────────────────┘   │                        │ │[Approve →]    │ │
│                      │                        │ └───────────────┘ │
└──────────────────────┴───────────────────────┴───────────────────┘
```

**Card anatomy:**

| Element             | Description                                                                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shop name           | Bold, at top of card                                                                                                                                                                           |
| Status badge        | Top-right corner of card                                                                                                                                                                       |
| Overdue left border | 3px red left border on cards >48h in `new` status                                                                                                                                              |
| Metadata            | 📍 District · Channel · Date                                                                                                                                                                   |
| Overdue warning     | Red bold text (e.g., "⚠ 48h overdue — response needed")                                                                                                                                        |
| Contact info        | Contact person + phone or email                                                                                                                                                                |
| Progress bar        | 5 thin equal segments. Done = green, current = brand color, remaining = gray. Step-to-status mapping is formally defined in FSD §9 — the active step is derived from the `status` field alone. |
| Action buttons      | [Add Note] (secondary) + [Primary Action] (green or brand color)                                                                                                                               |

**Primary action button by status:**

| Status          | Button         | Style       |
| --------------- | -------------- | ----------- |
| `new`           | Contact →      | Green       |
| `contacted`     | Approve →      | Brand color |
| `awaiting_info` | Approve →      | Brand color |
| `approved`      | Create Draft → | Brand color |

**Page header line:** Muted summary text + single [All] filter chip.

### Storyboard: Inquiry Lifecycle

```
[1] New inquiry arrives → card appears in grid, sidebar badge increments
    → if >48h: red left border + "⚠ overdue" warning on card

[2] Admin clicks "Contact →" → status: new → contacted
    → progress bar advances to step 2

[3] Admin clicks "Approve →" → status: contacted/awaiting_info → approved
    → progress bar advances to step 4

[4] Admin clicks "Create Draft →" → /shops/new pre-populated with inquiry data

[5] Shop published → inquiry status auto-set to "published" (terminal)

[*] "Add Note" at any stage → note input opens → saved internally
```

---

## 11. Customer Account Management (`/users`)

> FSD: §10, F-USER-01~10

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Users                                                           │
│  SWIDA Admin  ›  Moderation                                      │
├──────────────────────────────────────────────────────────────────┤
│  ┌─ Users table ───────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │  Name        Email          Reviews  Joined      Status  Act│ │
│  │  ──────────────────────────────────────────────────────────  │ │
│  │  김민준      kim@ex...        12     2025.11.03  [active] [Lock]│ │
│  │  이서연      lee@ex...         8     2025.12.17  [active] [Lock]│ │
│  │  스팸봇123   spam@ex...       47     2026.02.01  [locked][Unlock]│ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Table columns:** Name | Email | Reviews (count) | Joined (date) | Status pill | Action button.

**No Provider column. No ⋯ overflow menu.**

**Row actions — one inline button per row:**

- Active users: `[Lock]` — red-styled border button
- Locked users: `[Unlock]` — green-styled border button

**Status pills:** `[active]` = green `.pub` pill. `[locked]` = red `.hidden` pill.

**Lock Account Dialog**:

```
┌──────────────────────────────────────┐
│  ⚠️ Lock Account                      │
│                                      │
│  User "김민준" will be unable to     │
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

> FSD: §15, F-AUDIT-01~09

### Screen Structure

```
┌──────────────────────────────────────────────────────────────────┐
│  Audit Log                                                       │
│  SWIDA Admin  ›  System                                          │
├──────────────────────────────────────────────────────────────────┤
│  [🔍 Search shop or field...]                                    │
│  [All Changes]  [Publish/Unpublish]  [Field Updates]             │
├────────────────────┬───────┬──────────────────┬──────────┬────────────────────────────┤
│ Timestamp          │ Admin │ Shop             │ Action   │ Field      │ Change         │
├────────────────────┼───────┼──────────────────┼──────────┼────────────┼────────────────┤
│ 2026-03-26 14:22:01│ Admin │ 그린 힐링 스파    │[published]│ status    │ ~~draft~~ → published│
│ 2026-03-26 13:44:17│ Admin │ 타이 마사지 방콕  │[field upd]│ op_hours  │ ~~10:00–21:00~~ → 11:00–23:00│
│ 2026-03-25 16:10:33│ Admin │ 플로럴 웰니스     │[unpub'd]  │ status    │ ~~published~~ → draft│
│ 2026-03-25 11:05:09│ Admin │ 그린 힐링 스파    │[field upd]│ phone     │ ~~02-9999-0000~~ → 02-1234-5678│
│ 2026-03-24 09:33:52│ Admin │ 퍼포먼스 스포츠   │[created]  │ —         │ New listing created (draft)   │
├────────────────────┴───────┴──────────────────┴──────────┴────────────┴────────────────────────────┤
│  Showing 1–5 of 1,284 log entries          [1]  [2]  [3]  [›]                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Flat row format:** Each audit entry is one flat row. No expand/collapse. Each field change in a single operation creates its own row.

**Columns:** Timestamp (monospace) | Admin | Shop name | Action pill | Field (monospace) | Change (before → after)

**Action pill colors:**

| Action       | Color          |
| ------------ | -------------- |
| published    | Green `.pub`   |
| field update | Amber `.draft` |
| unpublished  | Red `.hidden`  |
| created      | Blue `.new`    |

**Change column format:** Before value shown with red strikethrough. After value shown in green. Example: `~~draft~~ → published`

**Filter chips:** "All Changes" | "Publish/Unpublish" | "Field Updates" — only one active at a time. Active chip has brand-color border and fill.

**Search:** Text input filters by shop name or field name.

---

## 13. State-Based Screen Branching

### 13.1 Auth States

| State             | Behavior                                                                      |
| ----------------- | ----------------------------------------------------------------------------- |
| Not authenticated | Any page → redirect to `/login`                                               |
| Authenticated     | `/login` → redirect to `/dashboard`                                           |
| Session expired   | Current action interrupted → redirect to `/login` + "Session expired" message |

### 13.2 Data States

| State            | Treatment                                                                         |
| ---------------- | --------------------------------------------------------------------------------- |
| Loading          | Loading indicators are shown while content loads                                  |
| Data empty       | "No results found" centered in table body area. Suggestion to adjust filters      |
| Error (server)   | Error toast: "A temporary error occurred. Please try again shortly." + retry      |
| Error (network)  | Error toast: "Please check your network connection."                              |
| Validation error | Inline field-level errors (red border + message). Scroll to first error on submit |

### 13.3 Destructive Action Confirmation

All of these require explicit confirmation dialogs:

| Action                 | Dialog Message                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| Unpublish shop         | "This shop will be hidden from the Customer Web immediately." + reason selection                  |
| Hide review            | "This review will be removed from public view." + reason selection                                |
| Delete review          | "This review will be permanently removed from public view."                                       |
| Lock user              | "This user will be unable to submit reviews or content." + reason selection                       |
| Delete theme           | "This theme will be permanently deleted." (blocked if shops tagged — Delete not in prototype yet) |
| Delete region/district | "This will be permanently deleted." (blocked if children exist)                                   |

---

## 14. Interaction Patterns Summary

### 14.1 CRUD Pattern

All management pages follow the same interaction loop:

```
List (table/grid) → Create/Edit (form) → Save → Back to List (with toast)
                                       ↘ Preview (new tab, Customer Web view)
```

### 14.2 Inline vs Modal vs Page

| Pattern                         | Used For                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------- |
| Full page form (two-column)     | Shop Create, Shop Edit                                                       |
| Modal/dialog                    | Theme create/edit, Lock account, confirmations, Hide reason                  |
| Card grid                       | Partnership Inquiries                                                        |
| Flat table (no expand)          | Audit Log                                                                    |
| Inline buttons                  | All row actions (Edit, Publish/Unpublish, Keep/Hide, Lock/Unlock) — MVP only |
| Filter chips                    | All list pages — single-dimension filtering per chip group                   |
| Checkbox + bulk action dropdown | **Post-MVP** — planned for reviews and shops. Not in current UI.             |

### 14.3 Cross-Page Navigation

| From                                     | Action | To                                 |
| ---------------------------------------- | ------ | ---------------------------------- |
| Dashboard — Pending Reviews "View all →" | click  | `/reviews?status=under_review`     |
| Dashboard — Recent Shops "View all →"    | click  | `/shops`                           |
| Dashboard — Inquiries "View all →"       | click  | `/inquiries`                       |
| Dashboard — Verify alert "Review now →"  | click  | `/shops?filter=verify_needed`      |
| Shop list — "+ New Shop" button          | click  | `/shops/new`                       |
| Sidebar — "New Shop" item                | click  | `/shops/new`                       |
| Shop list — Edit button                  | click  | `/shops/[id]`                      |
| Shop list — 👁 button                    | click  | Customer Web shop detail (new tab) |
| Shop form — Publish Status "Preview"     | click  | Customer Web shop detail (new tab) |
| Inquiry card — "Create Draft →"          | click  | `/shops/new?from_inquiry={id}`     |

---

## 15. Data & UI States

Every page and data-fetching component must handle all four states: loading, empty, error, and the happy path. This section defines the visual patterns.

### 15.1 Loading State

```
TABLE LOADING (skeleton rows):
┌──────────────────────────────────────────────────────────────────┐
│  [░░░░░░░░░░░░░░░░░]  [░░░░░░]  [░░░░░░░░]   (filter chips)     │
├──────────┬────────┬───────┬────────┬─────────┬──────────────────┤
│ ░░░░░░░░ │ ░░░░░░ │ ░░░░░ │ ░░░░░░ │ ░░░░░░░ │ ░░░░  ░░░░  ░░░ │
│ ░░░░░░░░ │ ░░░░░░ │ ░░░░░ │ ░░░░░░ │ ░░░░░░░ │ ░░░░  ░░░░  ░░░ │
│ ░░░░░░░░ │ ░░░░░░ │ ░░░░░ │ ░░░░░░ │ ░░░░░░░ │ ░░░░  ░░░░  ░░░ │
│ ░░░░░░░░ │ ░░░░░░ │ ░░░░░ │ ░░░░░░ │ ░░░░░░░ │ ░░░░  ░░░░  ░░░ │
│ ░░░░░░░░ │ ░░░░░░ │ ░░░░░ │ ░░░░░░ │ ░░░░░░░ │ ░░░░  ░░░░  ░░░ │
└──────────┴────────┴───────┴────────┴─────────┴──────────────────┘
  ░ = animated pulse skeleton (gray → light gray → gray)
```

```
STAT CARD LOADING:
┌────────────┐
│ ░░░░░░░░░  │  ← label skeleton
│ ░░░░░░░    │  ← number skeleton
│ ░░░░░░░░░  │  ← delta line skeleton
└────────────┘
```

| Context                  | Behavior                                                                       |
| ------------------------ | ------------------------------------------------------------------------------ |
| Data tables              | 5 skeleton rows with same column structure. Animated gray pulse.               |
| Stat cards (dashboard)   | Skeleton number + delta line per card.                                         |
| Feed cards (dashboard)   | 2–3 skeleton list items per card.                                              |
| Form fields (edit pages) | Skeleton inputs. Topbar action buttons disabled (grayed out) until data loads. |
| Inline action buttons    | Button enters disabled + spinner state on click until server responds.         |

### 15.2 Empty State

```
TABLE EMPTY (filters applied, no results):
┌──────────────────────────────────────────────────────────────────┐
│  [Search…]  [All]  [Published]  [Draft]  [Verify needed]         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    🔍                                            │
│           No results found                                       │
│       Try adjusting your filters                                 │
│              [Clear filters]                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

TABLE EMPTY (no data at all):
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    🏪                                            │
│           No shops yet                                           │
│       Create your first shop listing                             │
│              [+ New Shop]                                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

| Context                       | Icon | Message                                         | Action          |
| ----------------------------- | ---- | ----------------------------------------------- | --------------- |
| Shops — no filter results     | 🔍   | "No shops found. Try adjusting your filters."   | [Clear filters] |
| Shops — no shops yet          | 🏪   | "No shops yet. Create your first shop listing." | [+ New Shop]    |
| Reviews — no filter results   | 🔍   | "No reviews found. Try adjusting your filters." | [Clear filters] |
| Users — no users yet          | 👥   | "No registered customers yet."                  | —               |
| Inquiries — no open inquiries | 🤝   | "No open inquiries."                            | —               |
| Audit log — no entries        | 📋   | "No audit entries found."                       | [Clear filters] |
| Dashboard feeds               | —    | "No [items] yet." inline in the feed card       | —               |

### 15.3 Server Error State

```
PAGE-LEVEL ERROR (initial load failed):
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│              ⚠️  Something went wrong                            │
│         We couldn't load this page. Please try again.           │
│                      [Try again]                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

ACTION ERROR (write operation failed):
  ╔══════════════════════════════════════════════╗
  ║  ✕  A temporary error occurred.              ║  ← persistent red toast
  ║      Please try again shortly.  [Retry]      ║     top-right of content area
  ╚══════════════════════════════════════════════╝
```

| Trigger                        | Behavior                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Initial page load fails (5xx)  | Replace content area with error card: icon + message + [Try again] button                     |
| Write action fails (5xx)       | Persistent red toast with [Retry] link. Button returns to pre-loading state.                  |
| 409 Conflict (concurrent edit) | Modal: "This record was modified in another session. Please reload and try again." + [Reload] |
| 401 Unauthorized               | Clear session + redirect to `/login` + "Session expired." message                             |

### 15.4 Network Error State

```
  ╔══════════════════════════════════════════════╗
  ║  ✕  Please check your network connection.   ║  ← persistent red toast
  ╚══════════════════════════════════════════════╝
```

Shown when a request fails with no server response (offline, timeout). Button returns to its pre-loading state. Toast persists until dismissed or a retry succeeds.

### 15.5 Validation Error State

```
FIELD-LEVEL ERROR:
┌────────────────────────────────────┐
│ Shop Name *                        │
│ [                               ]  │  ← red border
│ ⚠ This field is required.          │  ← inline error below field
└────────────────────────────────────┘

CHARACTER LIMIT WARNING:
│ Description *                      │
│ [______________________________]   │
│ ░░░░░░░░░░░░░░░░░░░░░░░░ 480/500  │  ← counter turns red ≥90% used
```

| Trigger                             | Behavior                                                          |
| ----------------------------------- | ----------------------------------------------------------------- |
| Required field empty on submit      | Red border + "This field is required." below field                |
| Field ≥ 90% of character limit      | Counter turns red (warning)                                       |
| Field exceeds character limit       | Red border + error on submit                                      |
| Invalid format (email, URL, coords) | Red border + inline error on blur                                 |
| Multiple errors                     | Scroll to first error on submit. All errors shown simultaneously. |

---

## 16. Preview System UX

> FSD Reference: §18 Preview System Contract, F-SHOP-11, F-SHOP-32

### 16.1 Entry Points

Preview can be triggered from two places:

| Location       | Element                                                    | Condition                                                 |
| -------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| Shop list row  | 👁 icon button                                             | Always visible — works for both published and draft shops |
| Shop Edit page | "👁 Preview (Customer View)" button in Publish Status card | Always visible                                            |

### 16.2 Interaction Flow

```
[1] Admin clicks 👁 (shop list) or "Preview (Customer View)" (edit form)
    → Button enters loading/spinner state

[2] Admin Web requests preview token from backend
    → POST /api/admin/shops/{id}/preview-token
    → Takes ~200ms

[3] Success → browser opens new tab:
    {CUSTOMER_WEB_URL}/ko/shop/{slug}?preview_token={token}
    → Button returns to normal state

    Failure (token request failed) → error toast:
    "Preview unavailable. Please try again."
    → Button returns to normal state

[4] Customer Web tab loads with "Preview Mode" banner:
    ┌──────────────────────────────────────────────────────────┐
    │  🔍 Preview Mode — This shop is not yet publicly visible │
    └──────────────────────────────────────────────────────────┘
    → Rest of page shows the shop exactly as customers will see it

[5] Token expires after 15 minutes:
    → Customer Web shows: "This preview link has expired."
    → Admin must click Preview again to get a fresh token
```

### 16.3 Draft vs Published behavior

| Shop status | 👁 behavior                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------- |
| `draft`     | Opens Customer Web with preview token + "Preview Mode" banner. Shop is not publicly accessible without the token. |
| `published` | Opens Customer Web normally (no token needed). No "Preview Mode" banner — admin sees exactly what customers see.  |

### 16.4 Locale

Preview always opens in Korean (`/ko/`). If English content exists and the admin wants to preview the English version, they append `/en/` manually or a future "Preview EN" button is added.

---

> **Document End**
>
> This UI/UX Specification v1.2 is the interaction authority for the SWIDA Admin Web. The HTML prototype (`swida_admin_web.html`) serves as a visual reference only — it is not a binding interaction contract. When this spec and the prototype conflict, this spec wins. When this spec and the FSD conflict, the FSD wins. See FSD §1.5 for the full document authority hierarchy.
