---
title: "FSD — Customer Web"
sidebar_label: "English"
sidebar_position: 1
---

# SWIDA — Functional Specification Document (FSD)
# Customer Web

> **Version:** 1.0.0
> **Date:** March 25, 2026
> **Status:** Draft
> **Based on:** SWIDA PRD v1.1, SWIDA TSD v1.1, Figma Design (latest)
> **Scope:** Customer Web (Next.js) — all customer-facing pages and interactions
> **Author:** Engineering Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Global Layout & Navigation](#2-global-layout--navigation)
3. [Homepage](#3-homepage)
4. [Detail Search Page](#4-detail-search-page)
5. [Theme Search Page](#5-theme-search-page)
6. [Location Search Page](#6-location-search-page)
7. [Nearby Search Page](#7-nearby-search-page)
8. [Shop Detail Page](#8-shop-detail-page)
9. [Review Feed Page](#9-review-feed-page)
10. [Partnership Page](#10-partnership-page)
11. [Authentication Pages](#11-authentication-pages)
12. [Board Pages (게시판)](#12-board-pages)
13. [Events Page (이벤트)](#13-events-page)
14. [Shared Components](#14-shared-components)
15. [Cross-Cutting Concerns](#15-cross-cutting-concerns)
16. [New Content Types Required](#16-new-content-types-required)
17. [Appendix](#17-appendix)

---

## 1. Introduction

### 1.1 Purpose

This Functional Specification Document (FSD) defines the exact behavior, user interactions, UI states, validations, error handling, and acceptance criteria for every page and component in the SWIDA Customer Web application. It serves as the single source of truth for frontend developers, connecting the product vision (PRD) and technical architecture (TSD) to the visual design (Figma).

### 1.2 Scope

This document covers the Customer Web only — the Next.js application serving shop discovery, search, reviews, and partnership inquiry features at `www.swida.com`. The Admin Web and Strapi backend are out of scope for this FSD.

### 1.3 Reference Documents

| Document | Version | Purpose |
|---|---|---|
| SWIDA PRD | v1.1 | Product requirements, business rules, data model |
| SWIDA TSD | v1.1 | Technology stack, API contracts, database schema, infrastructure |
| Figma Design | Latest | Visual design, layout, component specs |

### 1.4 Conventions

- **Figma Reference:** Each page section includes a `Figma:` tag linking to the corresponding Figma screen name
- **URL patterns** use `[locale]` for the dynamic locale segment (`ko` or `en`)
- **API endpoints** reference the Strapi REST API contracts defined in TSD §5.2
- **i18n keys** are shown as `t('key.name')` — actual strings are in `messages/ko.json` and `messages/en.json`
- All times are **KST (Korea Standard Time, UTC+9)** unless stated otherwise
- **States** are documented using the pattern: Default → Loading → Loaded → Empty → Error

### 1.5 PRD Deviations

The Figma design introduces features and navigation changes not present in the PRD v1.1. This FSD follows the Figma design as the source of truth for UI/UX. The PRD should be updated to reflect these additions:

| Feature | PRD Status | FSD Status | Notes |
|---|---|---|---|
| 이벤트 (Events) page | Not in PRD | Included | New nav item, requires new content type |
| 게시판 (Board) section | Not in PRD | Included | Replaces PRD's "Review" nav item. Contains: 샵 추천, 마사지 정보, 커뮤니티 |
| Editor's Choice (스위다 추천샵) | Not in PRD | Included | Curated editorial cards on Homepage, requires new content type |
| Shop badges (프리미엄, 신규) | Not in PRD | Included | Visual badges on shop cards |
| Discount pricing (strikethrough) | Not in PRD | Included | Promotion/sale price feature, extends shop data model |
| Notice banner (공지) | Not in PRD | Included | Rotating announcements, requires new content type |
| Navigation structure | 6 top-level items | Restructured | Figma uses dropdown menus: 샵 검색 ▾, 이벤트, 게시판 ▾, 제휴문의 |
| Nearby Search location | Separate nav item | Inside 샵 검색 dropdown | Moved from top-level nav to sub-item |
| Review menu | Top-level nav item | Inside 게시판 dropdown | Merged into Board section |

---

## 2. Global Layout & Navigation

> **Figma:** 메인 - Main (header and footer visible)

### 2.1 Page Shell

Every page in the Customer Web shares a consistent layout shell:

```
┌─────────────────────────────────────────────────┐
│  Notice Banner (rotating)                        │
├─────────────────────────────────────────────────┤
│  Header (logo, search bar, nav, auth buttons)    │
├─────────────────────────────────────────────────┤
│                                                  │
│  Page Content (varies per route)                 │
│                                                  │
├─────────────────────────────────────────────────┤
│  Footer                                          │
└─────────────────────────────────────────────────┘
```

**Implementation:** Root layout at `app/[locale]/layout.tsx` renders the Notice Banner, Header, `{children}` (page content), and Footer.

> **Note:** Search-related pages (Detail Search, Theme Search, Location Search, Nearby Search) additionally render a **Sub-Navigation Bar** between the Header and Page Content. This sub-nav is defined in §4.2 and is shared across these pages, plus the Review Feed and Partnership pages.

### 2.2 Notice Banner

**Purpose:** Display rotating admin-managed announcements (system notices, promotions, maintenance alerts).

**Position:** Fixed at the very top of the page, above the Header. Full-width, compact height.

**Visual Design:**
- Dark navy/blue background with white text
- Left side: Orange "NOTICE" badge + notice title text (truncated with ellipsis if too long)
- Right side: "자세히보기" (View details) link
- Auto-rotates through multiple notices on a timed interval

**Behavior:**

| Aspect | Specification |
|---|---|
| Data source | `GET /api/notices?sort=createdAt:desc&filters[status][$eq]=published&locale={locale}` (new endpoint) |
| Rotation | Auto-advances every 5 seconds. Pauses on hover. |
| Click | Clicking the notice title or "자세히보기" navigates to the notice detail page or external URL (configurable per notice) |
| Empty state | If no active notices exist, the banner is hidden entirely — no empty space |
| Max displayed | Latest 5 published notices in rotation |
| Dismissibility | Not dismissible — always visible when notices exist |
| Mobile | Full width, text truncated. Same rotation behavior. |

**New Content Type Required:** `notice` — see §16.1

### 2.3 Header

**Position:** Sticky at the top of the viewport (below Notice Banner). Remains visible during scroll.

**Layout (Desktop — Left to Right):**

```
┌─────────────────────────────────────────────────────────────────┐
│  [Swida Logo]  │  [Search Bar + 🔍]  │  Nav Items  │  Auth     │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.3.1 Logo

- Swida brand logo (orange "S" icon + "Swida" text)
- Click → Navigate to Homepage (`/[locale]`)
- Alt text: "Swida - 마사지 & 웰니스 검색 플랫폼"

#### 2.3.2 Search Bar

**Position:** Center of header, prominent placement.

**Visual Design:**
- Rounded input field with placeholder text: `t('header.search.placeholder')` → "지역, 업소명, 테마를 검색해보세요"
- Blue search icon button (🔍) on the right side of the input

**Behavior:**

| Action | Result |
|---|---|
| Focus | Input becomes active, no dropdown |
| Type + press Enter or click 🔍 | Navigate to Name Search results: `/[locale]/search?q={query}` |
| Empty submit | No action (prevent empty search) |
| Max length | 100 characters |

**Validation:** Trim whitespace. Minimum 1 character after trim to submit.

#### 2.3.3 Navigation Items

The main navigation consists of 4 items. Two items have dropdown sub-menus.

```
샵 검색 ▾   |   이벤트   |   게시판 ▾   |   제휴문의
```

**Nav Item: 샵 검색 (Shop Search) — Dropdown**

| Sub-item | Label | Route |
|---|---|---|
| 상세 검색 | Detail Search | `/[locale]/search` |
| 테마별 검색 | Theme Search | `/[locale]/theme` |
| 지역 검색 | Location Search | `/[locale]/location` |
| 내주변 검색 | Nearby Search | `/[locale]/nearby` |

> **Figma:** Drop_Down_샵검색

**Nav Item: 이벤트 (Events) — Direct Link**

Route: `/[locale]/events`

**Nav Item: 게시판 (Board) — Dropdown**

| Sub-item | Label | Route |
|---|---|---|
| 샵 추천 | Shop Recommendations | `/[locale]/board/recommendations` |
| 마사지 정보 | Massage Info | `/[locale]/board/info` |
| 커뮤니티 | Community | `/[locale]/board/community` |

> **Figma:** Drop_Down_게시판

**Nav Item: 제휴문의 (Partnership) — Direct Link**

Route: `/[locale]/partnership`

**Dropdown Behavior:**

| Aspect | Specification |
|---|---|
| Trigger | Click on nav item to toggle open/close (not hover) |
| Appearance | Floating panel with rounded corners, subtle shadow, white background |
| Sub-items | Vertically stacked, blue text, separated by thin dividers |
| Close | Click outside, click the parent nav item again, or select a sub-item |
| Active state | Current page's nav item is visually highlighted |
| Keyboard | Enter/Space to toggle. Arrow keys to navigate sub-items. Escape to close. |

#### 2.3.4 Auth Buttons

**Logged Out State:**

Two buttons on the right side of the header:

| Button | Style | Action |
|---|---|---|
| 로그인 (Login) | Outlined / secondary | Navigate to `/[locale]/auth/login` |
| 회원 가입 (Sign Up) | Filled / primary (orange) | Navigate to `/[locale]/auth/signup` |

**Logged In State:**

Replace the two buttons with:

| Element | Action |
|---|---|
| User display name or avatar | Click → dropdown with: 마이페이지 (My Page), 내 리뷰 (My Reviews), 로그아웃 (Logout) |
| Logout | Clear JWT, redirect to Homepage |

### 2.4 Footer

> **Figma:** 메인 - Main (bottom section)

**Position:** Bottom of every page, below all page content. Not sticky.

**Layout (Desktop — 4 columns):**

```
┌────────────────────────────────────────────────────────────────┐
│  Swida Brand    │  고객센터       │  메뉴            │  SNS     │
│                 │                │                  │          │
│  Logo           │  1588-1234     │  이용안내         │  [icons] │
│  Tagline text   │  운영시간       │  개인정보처리방침   │          │
│                 │                │  서비스이용약관     │          │
│                 │                │  제휴문의          │          │
├────────────────────────────────────────────────────────────────┤
│  © 2026 SWIDA Co., Ltd. All Rights Reserved.                   │
└────────────────────────────────────────────────────────────────┘
```

**Column Details:**

| Column | Content |
|---|---|
| Swida Brand | Swida logo (white on dark background) + tagline: "전국 마사지 업소 정보 No.1 플랫폼 '스위다'" + secondary text about SWIDA's mission |
| 고객센터 (Customer Center) | Phone number: `1588-1234` (styled prominently). Operating hours: "평일 09:00 - 18:00 (주말/공휴일 제외)" |
| 메뉴 (Menu) | Links: 이용안내, 개인정보처리방침 (Privacy Policy), 서비스이용약관 (Terms of Service), 제휴문의 (Partnership) |
| SNS | Social media icon buttons (links to SWIDA's official accounts) |

**Copyright:** Centered below the 4 columns: "© 2026 SWIDA Co., Ltd. All Rights Reserved."

**Footer Background:** Dark navy/charcoal. White text.

**Mobile:** Stacks vertically — Brand → Customer Center → Menu → SNS → Copyright.

### 2.5 Language Switcher

**Position:** To be determined (not visible in current Figma). Recommended placement: top-right corner of header or footer.

**Behavior:**

| Action | Result |
|---|---|
| Click "EN" / "한국어" toggle | Navigate to the equivalent page in the other locale. E.g., `/ko/shop/healing-spa` → `/en/shop/healing-spa` |
| URL change | Locale segment changes, all other path/query params preserved |
| Content fallback | If translated content unavailable, show Korean with a subtle "번역 준비 중" indicator |

### 2.6 Responsive Breakpoints

| Breakpoint | Name | Width | Layout Changes |
|---|---|---|---|
| `sm` | Mobile | < 768px | Single column, hamburger menu, stacked cards |
| `md` | Tablet | 768px–1023px | 2-column grids, condensed nav |
| `lg` | Desktop | 1024px–1279px | Full nav, 3-4 column grids |
| `xl` | Wide Desktop | ≥ 1280px | Max content width ~1200px, centered |

**Mobile Navigation (< 768px):**
- Header collapses to: Logo + Search icon + Hamburger menu (☰)
- Hamburger opens a full-screen slide-in drawer with all nav items, auth buttons
- Dropdowns become expandable accordion sections in the drawer

### 2.7 Global Loading & Error States

**Page-Level Loading:**
- Skeleton screens matching the target page layout (not a generic spinner)
- Header and Footer render immediately; only page content area shows skeleton

**Page-Level Error:**
- Friendly error message centered in the content area
- "다시 시도" (Retry) button
- Header and Footer remain functional

**Network Error / Offline:**
- Toast notification: "인터넷 연결을 확인해주세요" (Please check your internet connection)
- Cached content remains visible if available (ISR/SSG pages)

**Toast Notifications:**
- Position: Top-center, below header
- Auto-dismiss after 4 seconds
- Types: Success (green), Error (red), Info (blue), Warning (yellow)

---

## 3. Homepage

> **Figma:** 메인 - Main
> **Route:** `/[locale]` (e.g., `/ko`, `/en`)
> **Rendering:** SSG + ISR (revalidate: 300 seconds)
> **SEO:** Indexed, included in sitemap

### 3.1 Page Purpose

The Homepage is the primary entry point for SWIDA. It serves as a discovery hub that gives customers multiple pathways to find massage and wellness shops: by theme, by location, by proximity, and through curated editorial recommendations. It is designed to immediately surface relevant shops and encourage exploration.

### 3.2 Data Sources

| Section | API Endpoint | Cache |
|---|---|---|
| Notice Banner | `GET /api/notices?sort=createdAt:desc&filters[status][$eq]=published&pagination[pageSize]=5&locale={locale}` | Redis: 5 min |
| Hero Banner | `GET /api/banners?sort=display_order:asc&filters[status][$eq]=published&filters[placement][$eq]=homepage_hero&locale={locale}` | Redis: 5 min |
| Theme Grid | `GET /api/themes?sort=display_order:asc&locale={locale}&populate[icon][fields][0]=url` | Redis: 24 hr |
| Location Quick-Select | `GET /api/regions?sort=display_order:asc&locale={locale}` | Redis: 24 hr |
| Nearby Shops | `GET /api/shops/nearby?lat={lat}&lng={lng}&radius=5000&locale={locale}&pagination[pageSize]=4` | No cache (GPS-dependent) |
| Editor's Choice | `GET /api/editorial-picks?sort=display_order:asc&filters[status][$eq]=published&pagination[pageSize]=3&locale={locale}` | Redis: 1 hr |
| Region Recommendations | `GET /api/region-recommendations?sort=display_order:asc&filters[status][$eq]=published&pagination[pageSize]=4&locale={locale}` | Redis: 1 hr |

### 3.3 Page Sections (Top to Bottom)

#### 3.3.1 Hero Banner

**Purpose:** Full-width promotional banner showcasing SWIDA's value proposition or featured campaigns.

**Visual Design:**
- Full-width image/gradient background spanning the content area
- Overlay text (left-aligned): Headline text in white, bold (e.g., "내 주변 가장 가까운 최고의 힐링 명소")
- CTA button: Orange filled button with white text (e.g., "지금 바로 예약하기")
- Image shows a lifestyle/wellness visual

**Behavior:**

| Aspect | Specification |
|---|---|
| Data source | Admin-managed `banner` content type (new — see §16.2) |
| Rotation | If multiple banners: auto-rotate every 6 seconds with fade transition. Dot indicators at bottom. |
| CTA click | Navigates to the URL configured in the banner (can be internal page or external link) |
| Single banner | No rotation controls, no dots |
| Empty state | If no banners published, show a static default hero with SWIDA branding and a "검색 시작하기" CTA linking to Detail Search |
| Mobile | Same layout, text scales down. CTA button remains tappable (min 44px height). |

**New Content Type Required:** `banner` — see §16.2

#### 3.3.2 Theme Grid

**Purpose:** Quick-access grid of all massage/service themes for one-tap browsing.

**Visual Design:**
- Section has no visible header (themes are self-explanatory from their icons/labels)
- Grid layout: 6 columns on desktop, wrapping to 2 rows of 6 for 12 themes
- Each theme cell: Circular icon above + theme name label below
- Icons are custom illustrations (stored as media in the Theme content type)

**Themes displayed (from Figma):**
Row 1: 전체보기, 아로마, 한국마사지, 커플마사지, 스포츠, 발마사지
Row 2: 태국마사지, 홈케어, 스웨디시, 스톤테라피, 풀미용미, 중국마사지

**Behavior:**

| Action | Result |
|---|---|
| Click "전체보기" | Navigate to `/[locale]/theme` (Theme Search page showing all themes) |
| Click any other theme | Navigate to `/[locale]/theme/{theme-slug}` (filtered shop results for that theme) |
| Hover (desktop) | Subtle scale-up animation on the icon |

**States:**

| State | Display |
|---|---|
| Loading | 12 skeleton circles with text placeholders |
| Loaded | Theme grid as designed |
| Error | Hide section entirely (non-critical) — log error silently |

**Mobile (< 768px):** 4 columns, 3 rows. Scrollable horizontally if needed, or wrap.

#### 3.3.3 Location Quick-Select Bar (지역별 마사지 찾기)

**Purpose:** One-tap access to shops in major regions, with a shortcut to detailed location search.

**Visual Design:**
- Section header: "지역별 마사지 찾기" (left-aligned)
- Right side of header: "상세검색+" link (blue text)
- Below header: Horizontal row of region chips/buttons
- Chips shown (from Figma): 서울, 경기, 인천, 부산, 대구, 광주, 대전, 울산
- Each chip: Outlined pill/button style with region name

**Behavior:**

| Action | Result |
|---|---|
| Click a region chip | Navigate to `/[locale]/location/{region-slug}` (Location Search page pre-filtered to that region) |
| Click "상세검색+" | Navigate to `/[locale]/search` (Detail Search page) |
| Horizontal overflow (mobile) | Chips are horizontally scrollable with no wrapping |

**Data Source:** Regions from `GET /api/regions`. Display order configurable by admin. Only the top 8 most popular regions are shown on the Homepage — full list is on the Location Search page.

#### 3.3.4 Current Location Display

**Purpose:** Show the customer's detected location and allow them to change it.

**Visual Design:**
- Location pin icon (◎) + "현재 위치:" label + **Bold location text** (e.g., "서울 강남구 역삼동") + "변경" link (orange/red text)

**Behavior:**

| Aspect | Specification |
|---|---|
| GPS request | On Homepage load, request `navigator.geolocation.getCurrentPosition()` |
| Permission granted | Reverse-geocode coordinates to get the nearest district name (via Google Maps Geocoding API or Kakao Local API). Display as "현재 위치: {구/동 name}" |
| Permission denied | Display: "현재 위치: 위치 정보를 사용할 수 없습니다" with a "위치 허용하기" button that re-triggers the permission dialog |
| Permission pending | Display: "현재 위치: 위치 확인 중..." with a subtle loading animation |
| "변경" click | Opens a modal/drawer allowing the customer to manually select a region and district from cascading dropdowns (same as LocationCascade component). Updates the Nearby Shops section below accordingly. |
| Location change | When location changes (GPS or manual), re-fetch the Nearby Shops section with new coordinates or selected district |

**Reverse Geocoding:** Use the Kakao Local API (`GET https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x={lng}&y={lat}`) to convert GPS coordinates to a Korean administrative address. Extract `region_2depth_name` (구) and `region_3depth_name` (동).

#### 3.3.5 Nearby Recommended Shops (내 주변 추천샵 HOT!)

**Purpose:** Show the highest-rated or most popular shops near the customer's current location.

**Visual Design:**
- Section header: "내 주변 추천샵" + "HOT!" badge (red/orange) on the left, "더보기→" link on the right
- Horizontal row of 4 shop cards (desktop), scrollable on mobile
- Shop cards include badges (프리미엄, 신규) on the thumbnail

**Shop Card Content (per card):**

| Element | Data Source | Display |
|---|---|---|
| Thumbnail image | `shop.thumbnail.url` | Rectangular image, rounded corners |
| Badges | `shop.is_premium`, `shop.is_new` (new fields — see §16.5) | Overlaid on top-left of thumbnail. "프리미엄" (gold) if `is_premium`, "신규" (blue) if `is_new` |
| Shop name | `shop.name` | Bold text below image |
| Location | `shop.district.name` | Gray text (e.g., "서울 강남구 역삼동") |
| Rating + review count | `shop.average_rating` + `shop.total_reviews` | "★ 4.9 (322)" |
| Original price | `shop.original_price` (new field) | Strikethrough gray text (e.g., "~~40,000원~~") |
| Sale price | `shop.sale_price` (new field) | Bold colored text (e.g., "**30,000원 ~**") |

**Behavior:**

| Action | Result |
|---|---|
| Click any shop card | Navigate to `/[locale]/shop/{slug}` |
| Click "더보기→" | Navigate to `/[locale]/nearby` (Nearby Search page) |
| GPS not available | Show fallback: "위치 정보를 허용하면 내 주변 추천 매장을 확인할 수 있어요" with a "위치 허용하기" button |
| Horizontal scroll (mobile) | Cards are horizontally scrollable in a single row |

**Data:** Fetched from the Nearby Search API (`/api/shops/nearby`) with `pageSize=4`, sorted by rating descending within a 5km radius. Requires GPS coordinates.

**States:**

| State | Display |
|---|---|
| GPS pending | Skeleton cards (4) with pulsing animation |
| GPS granted, loading data | Skeleton cards |
| Loaded | 4 shop cards as designed |
| No results within radius | Message: "주변에 등록된 매장이 없습니다. 다른 지역을 검색해보세요." |
| GPS denied | Fallback message with permission request button |
| API error | Hide section — log error |

**New Data Model Fields Required:** `original_price`, `sale_price`, `is_premium`, `is_new` — see §16.5

#### 3.3.6 Editor's Choice (Swida 추천샵 Editor's Choice)

**Purpose:** Admin-curated editorial recommendations showcasing themed collections of shops.

**Visual Design:**
- Section header: "**Swida 추천샵**" + "**Editor's Choice**" (styled as a subtitle/badge)
- 3 editorial cards in a horizontal row (desktop)
- Each card is tall/portrait-oriented with:
  - Large background image (dark overlay for text readability)
  - Badge tag on the bottom-left of the image: "BEST THEME", "RECOMMEND", "NEW OPEN" (colored pill badges)
  - Title text (white, bold) overlaid at the bottom of the image (e.g., "지친 하루의 끝, 커플 스파로 힐링하세요")
  - Description text (white, smaller) below the title (e.g., "강남권 최고의 분위기를 자랑하는 커플 전용 스파 베스트 5를 소개합니다.")
- Below the 3 cards: Centered "더보기" button (outlined)

**Behavior:**

| Action | Result |
|---|---|
| Click an editorial card | Navigate to the editorial detail page: `/[locale]/board/recommendations/{slug}` or a custom URL configured per pick |
| Click "더보기" | Navigate to `/[locale]/board/recommendations` (Shop Recommendations board) |
| Hover (desktop) | Slight image zoom / brightness shift for visual feedback |

**Data Source:** `editorial-pick` content type (new — see §16.3). Admin creates each pick with: title, description, image, badge tag, link URL, and display order.

**States:**

| State | Display |
|---|---|
| Loading | 3 skeleton cards with gradient placeholders |
| Loaded | Cards as designed |
| Empty (no picks published) | Hide section entirely |
| Error | Hide section — log error |

**Mobile (< 768px):** Cards stack vertically (1 per row, full width) or display as a horizontal carousel with snap scrolling.

#### 3.3.7 Region-Based Recommendations (지역별 마사지 추천)

**Purpose:** Highlight curated shop collections organized by popular regions.

**Visual Design:**
- Section header: "지역별 마사지 추천"
- 2 horizontal cards (desktop) — wider/landscape format
- Each card layout:
  - Left: Thumbnail image (region/vibe photo)
  - Right: Title (bold, e.g., "강남구 최고 인기샵"), description text, hashtag chips (e.g., #압구정, #신사, #한남)
- Below cards: Centered "더보기" button (outlined)

**Behavior:**

| Action | Result |
|---|---|
| Click a region card | Navigate to the corresponding location page or a curated list: `/[locale]/location/{region-slug}/{district-slug}` or a custom URL |
| Click a hashtag chip | Navigate to search filtered by that area or tag |
| Click "더보기" | Navigate to `/[locale]/location` (Location Search page) |

**Data Source:** `region-recommendation` content type (new — see §16.4). Admin creates each recommendation with: title, description, image, hashtags, linked region/district, and display order.

**States:**

| State | Display |
|---|---|
| Loading | 2 skeleton cards |
| Loaded | Cards as designed |
| Empty | Hide section entirely |
| Error | Hide section — log error |

**Mobile (< 768px):** Cards stack vertically (1 per row, full width).

### 3.4 Homepage Data Fetching Strategy

**Server-side (SSG/ISR — runs at build time + revalidation):**
- Hero banners
- Theme grid
- Region list (for quick-select bar)
- Editor's Choice picks
- Region recommendations

**Client-side (CSR — runs in browser after hydration):**
- GPS location detection → Current location display
- Nearby recommended shops (depends on GPS coordinates)
- Notice banner rotation state

**Revalidation:** The page is statically generated and revalidated every 300 seconds (5 minutes). Strapi webhooks can trigger on-demand revalidation when banners, editorial picks, or themes are updated.

### 3.5 SEO Metadata

```typescript
// app/[locale]/page.tsx — generateMetadata()
{
  title: t('seo.homepage.title'),       // "SWIDA - 내 주변 마사지 & 웰니스 검색"
  description: t('seo.homepage.desc'),  // "전국 마사지, 스파, 웰니스 매장을 한눈에. 지역별, 테마별 검색과 리뷰를 확인하세요."
  openGraph: {
    title: "SWIDA - 마사지 & 웰니스 검색 플랫폼",
    description: "...",
    url: `https://www.swida.com/${locale}`,
    siteName: "SWIDA",
    locale: locale === 'ko' ? 'ko_KR' : 'en_US',
    type: 'website',
    images: [{ url: '/og-homepage.jpg', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: `https://www.swida.com/${locale}`,
    languages: {
      'ko': 'https://www.swida.com/ko',
      'en': 'https://www.swida.com/en',
      'x-default': 'https://www.swida.com/ko',
    },
  },
}
```

### 3.6 Acceptance Criteria

| # | Criteria | Priority |
|---|---|---|
| HP-01 | Page loads with SSG content (hero, themes, regions, editorial picks) within 2 seconds | P0 |
| HP-02 | GPS permission is requested on page load; nearby shops display within 3 seconds of permission grant | P0 |
| HP-03 | If GPS is denied, the nearby shops section shows a clear fallback message with a re-request button | P0 |
| HP-04 | Clicking "변경" on the current location opens a location selection modal | P1 |
| HP-05 | All shop cards navigate to the correct shop detail page | P0 |
| HP-06 | Theme icons navigate to the correct theme search results page | P0 |
| HP-07 | Region chips navigate to the correct location search page | P0 |
| HP-08 | Notice banner rotates through multiple notices with correct timing | P1 |
| HP-09 | Hero banner rotates through multiple banners (if configured) | P1 |
| HP-10 | Editor's Choice cards navigate to the correct editorial detail or URL | P1 |
| HP-11 | Page is fully responsive — all sections render correctly at mobile, tablet, and desktop breakpoints | P0 |
| HP-12 | SEO metadata (title, description, OG tags, hreflang) renders correctly for both locales | P0 |
| HP-13 | If any non-critical section fails to load (editorial, region recommendations), the section is hidden — page does not break | P1 |
| HP-14 | Shop card badges (프리미엄, 신규) display correctly when present | P1 |
| HP-15 | Shop card discount prices show original price struck through and sale price highlighted | P1 |
| HP-16 | Language switcher correctly navigates between `/ko` and `/en` | P1 |

---

## 4. Detail Search Page (상세 검색)

> **Figma:** 상세검색 - Advanced Search
> **Route:** `/[locale]/search`
> **Rendering:** SSR (dynamic filters make SSG impractical)
> **SEO:** `noindex` (filtered results with query parameters)

### 4.1 Page Purpose

The Detail Search page is the most comprehensive search mode. It combines keyword search, location filtering, amenity toggles, theme selection, and price range into a single interface. It is the power-user search tool and the destination for the header search bar and "상세검색+" links.

### 4.2 Sub-Navigation Bar

All search pages share a horizontal tab bar immediately below the header. This sub-nav provides quick switching between the 6 search/content modes.

**Tabs (left to right):**

| Tab | Label | Route | Icon |
|---|---|---|---|
| 상세 검색 | Detail Search | `/[locale]/search` | 🔍 |
| 테마별 검색 | Theme Search | `/[locale]/theme` | 🏷️ |
| 지역별 검색 | Location Search | `/[locale]/location` | 📍 |
| 내 주변 검색 | Nearby Search | `/[locale]/nearby` | 📡 |
| 방문 후기 | Visit Reviews | `/[locale]/reviews` | ✍️ |
| 업소 제휴 | Business Partnership | `/[locale]/partnership` | 💎 |

**Behavior:**
- Active tab is highlighted with orange/filled background
- Clicking a tab navigates to that page
- On mobile (< 768px): horizontally scrollable if tabs overflow

> **PRD Deviation:** The sub-nav includes "방문 후기" and "업소 제휴" which are not in the header nav dropdown. These provide alternative navigation paths to the Review Feed and Partnership pages.

### 4.3 Layout

```
┌──────────────────────────────────────────────────────────┐
│  Sub-Navigation Bar (6 tabs)                              │
├────────────┬─────────────────────────────────────────────┤
│            │  Result Header: "상세 검색 결과 총 1,234개"    │
│   Filter   │  Active Filter Chips: [강남구 ✕] [스웨디시 ✕] │
│   Sidebar  │  Sort Options (right-aligned)                │
│   (left)   │                                              │
│            │  Shop Card Grid (3 columns)                  │
│            │  ┌─────┐ ┌─────┐ ┌─────┐                    │
│            │  │Card │ │Card │ │Card │                    │
│            │  └─────┘ └─────┘ └─────┘                    │
│            │  ┌─────┐ ┌─────┐ ┌─────┐                    │
│            │  │ ... │ │ ... │ │ ... │                    │
│            │  └─────┘ └─────┘ └─────┘                    │
│            │  [Pagination]                                │
├────────────┴─────────────────────────────────────────────┤
│  Footer                                                   │
└──────────────────────────────────────────────────────────┘
```

### 4.4 Filter Sidebar (Left Panel)

**Header:** "필터" icon + "필터" text + "초기화" reset link (right-aligned)

**Filter Groups (top to bottom):**

#### 4.4.1 Keyword Search (키워드 검색)
- Search input with placeholder "업소명 검색"
- Magnifying glass icon on the left
- Searches by shop name (`$containsi`)

#### 4.4.2 Location Select (지역 선택)
- Two cascading dropdowns:
  - Level 1: "시/도 전체" → selects a region
  - Level 2: "시/군/구 전체" → dynamically loads districts based on selected region
- Level 2 is disabled until Level 1 is selected

#### 4.4.3 Service Benefits (서비스 혜택)
Checkbox list of amenity/feature filters:

| Checkbox | API Filter | Description |
|---|---|---|
| 24시간 영업 | `filters[is_24hr][$eq]=true` | 24-hour operation (new field needed) |
| 주차가능 | `filters[amenities][parking_available][$eq]=true` | Parking available |
| 샤워가능 | `filters[amenities][shower][$eq]=true` | Shower facilities |
| 수면가능 | `filters[amenities][sleeping][$eq]=true` | Sleeping area |
| 개인실 | `filters[amenities][private_room][$eq]=true` | Private rooms |
| Wifi | `filters[amenities][wifi][$eq]=true` | Free WiFi |
| 예약필수 | `filters[booking_required][$eq]=true` | Booking required |

#### 4.4.4 Theme (테마)
- Multi-select toggle chips/pills
- All themes displayed as small pill buttons (e.g., 스웨디시, 로미로미, 발마사지, 중국, 한국, 커플, 스포츠, 아로마, 홈케어, 타이, 스톤)
- Selected themes are highlighted with orange outline
- Multiple themes can be selected (OR logic within theme, AND with other filters)

#### 4.4.5 Price Range (가격대)
- Range slider with two handles
- Min: 0원, Max: 20만원+
- Displays selected range as filter
- API: `filters[sale_price][$gte]=min&filters[sale_price][$lte]=max`

#### 4.4.6 Search Button
- Full-width orange button: "검색하기"
- Click applies all selected filters and refreshes results
- Filters are persisted in URL query parameters

**"초기화" (Reset) Behavior:** Clears all filter selections, resets dropdowns to default, clears keyword input, resets price range. Does NOT automatically re-search — user must click "검색하기".

### 4.5 Results Area (Right Panel)

#### 4.5.1 Result Header
- Text: "상세 검색 결과 총 **{count}**개" — count from `meta.pagination.total`
- Active filter chips displayed as removable tags: e.g., `[강남구 ✕]` `[스웨디시 ✕]` `[24시간 ✕]`
- Clicking ✕ on a chip removes that filter and re-fetches results

#### 4.5.2 Sort Options
Right-aligned sort links:

| Sort | Label | API Parameter | Default |
|---|---|---|---|
| 평점 높은순 | Rating (high to low) | `sort=average_rating:desc` | ✓ (default, highlighted) |
| 리뷰 많은순 | Most reviews | `sort=total_reviews:desc` | |
| 추천순 | Recommended | `sort=recommendation_score:desc` | |
| 가격 낮은순 | Price (low to high) | `sort=sale_price:asc` | |

Active sort option is styled in orange/bold.

#### 4.5.3 Shop Card (Search Result Card)

Each card in the 3-column grid contains:

| Element | Data | Display |
|---|---|---|
| Thumbnail | `shop.thumbnail.url` | Large rectangular image, rounded corners |
| Badge | `shop.is_premium` / `shop.is_new` | "PREMIUM" (gold) if `is_premium`, "BEST" (red) if admin-featured (see §16.5), or "신규" if `is_new` |
| Favorite heart | Click to save/unsave | Heart icon (♡/♥) on top-right of image. Requires login. |
| Shop name | `shop.name` | Bold text below image |
| Rating | `shop.average_rating` | "★ 4.9" orange star + number (right of name) |
| Location | `shop.district.name` | "📍 서울 강남구 청담동" gray text |
| Theme tags | `shop.themes[].name` | Small gray pill tags (e.g., "아로마", "주차가능", "사워실") |
| Price label | "회원가" | Small gray label |
| Sale price | `shop.sale_price` | Bold orange text: "**30,000원 ~**" |

**Card Click:** Navigate to `/[locale]/shop/{slug}`
**Heart Click:** If logged in → toggle favorite (API call). If not logged in → redirect to login page.

#### 4.5.4 Pagination
- Not visible in this Figma screen but implied by the result count (1,234 results)
- Page-based pagination as per PRD (unique URLs per page for SEO)
- URL pattern: `/[locale]/search?...&page=2`

### 4.6 URL Query Parameters

All filters are serialized to the URL for shareability and back-navigation:

```
/ko/search?q=스웨디시&region=seoul&district=gangnam&amenities=24hr,parking&themes=swedish,aroma&priceMin=0&priceMax=100000&sort=average_rating:desc&page=1
```

### 4.7 States

| State | Display |
|---|---|
| Initial load (no filters) | Show all published shops, sorted by rating descending |
| Filters applied, loading | Skeleton cards (9) in grid layout |
| Results loaded | Shop cards + result count + active chips |
| Zero results | "검색 결과가 없습니다. 다른 조건으로 검색해보세요." centered in results area |
| API error | "검색 중 오류가 발생했습니다. 다시 시도해주세요." with retry button |

### 4.8 Acceptance Criteria

| # | Criteria | Priority |
|---|---|---|
| DS-01 | All filter types (keyword, location, amenities, themes, price) correctly filter results | P0 |
| DS-02 | Cascading location dropdowns work — Level 2 loads after Level 1 selection | P0 |
| DS-03 | Active filters display as removable chips above results | P0 |
| DS-04 | "초기화" resets all filters to default state | P1 |
| DS-05 | Sort options change result order and persist in URL | P0 |
| DS-06 | Filter state persists in URL query parameters | P0 |
| DS-07 | Shop cards navigate to correct shop detail page | P0 |
| DS-08 | Favorite heart requires login, toggles correctly when logged in | P1 |
| DS-09 | Price range slider filters results by sale_price | P1 |
| DS-10 | Results load within 2 seconds | P0 |

### 4.9 New Data Model Fields Required

| Field | Content Type | Description |
|---|---|---|
| `is_24hr` | Shop | Boolean — whether the shop operates 24 hours. Used as a prominent filter. |
| `recommendation_score` | Shop | Integer — admin-managed or algorithmically calculated score for "추천순" sort. |

---

## 5. Theme Search Page (테마별 검색)

> **Figma:** 테마별 검색 - Theme-based Search
> **Route:** `/[locale]/theme` (all themes) or `/[locale]/theme/{theme-slug}` (filtered by theme)
> **Rendering:** SSG for theme list page; SSR for filtered results
> **SEO:** Theme list page and individual theme pages are indexed

### 5.1 Page Purpose

The Theme Search page allows customers to discover shops by massage/service theme. It features the full theme grid at the top for browsing, with results filtered by the selected theme below.

### 5.2 Layout

Identical to Detail Search (§4.3) with one addition: the **Theme Grid** is displayed between the Sub-Navigation Bar and the filter/results area.

### 5.3 Theme Grid (Top Section)

- Same theme grid as the Homepage (§3.3.2) — 12 themes in 2 rows of 6
- The currently selected theme is highlighted with an orange outline/background
- "전체보기" shows all shops (no theme filter)
- Clicking a different theme re-filters results immediately

### 5.4 Filter Sidebar

Same filter sidebar as Detail Search (§4.4) but without the "테마" section (since themes are selected via the top grid instead). Contains: keyword search, location select, service benefits, price range, and search button.

### 5.5 Results Area

Same structure as Detail Search (§4.5):
- Result header: "**아로마** 검색 결과 총 **1,004**개" — shows the selected theme name
- Active filter chips
- Sort options (same 4 options)
- Shop card grid (3 columns)
- Pagination

### 5.5.1 Data Sources

| Data | API Endpoint |
|---|---|
| Theme list | `GET /api/themes?sort=display_order:asc&locale={locale}&populate[icon][fields][0]=url` |
| Shop results | `GET /api/shops?filters[themes][slug][$eq]={theme-slug}&locale={locale}&sort=average_rating:desc&pagination[page]={page}&pagination[pageSize]=9` + additional sidebar filters |

### 5.6 Behavior

| Action | Result |
|---|---|
| Click a theme in the grid | URL changes to `/[locale]/theme/{theme-slug}`, results filter to that theme, sidebar filters reset |
| Click "전체보기" | URL changes to `/[locale]/theme`, shows all shops |
| Apply sidebar filters | Additional filters applied on top of the selected theme |
| No theme selected (landing) | Show theme grid only, prompt user to select a theme |

### 5.7 SEO Metadata

Individual theme pages (`/[locale]/theme/{theme-slug}`) are indexed with:
- Title: "{Theme Name} 마사지 - SWIDA"
- Description: "{Theme Name} 마사지 매장을 찾아보세요. 전국 {count}개 매장 정보와 리뷰를 확인하세요."

### 5.8 Acceptance Criteria

| # | Criteria | Priority |
|---|---|---|
| TS-01 | Theme grid displays all themes with icons | P0 |
| TS-02 | Selecting a theme filters results correctly | P0 |
| TS-03 | Selected theme is visually highlighted in the grid | P0 |
| TS-04 | Sidebar filters work in combination with the selected theme | P0 |
| TS-05 | Theme page URL is crawlable and indexed | P0 |

### 5.9 States

| State | Display |
|---|---|
| Landing (no theme selected) | Theme grid displayed, results area shows prompt: "테마를 선택해주세요" |
| Theme selected, loading | Skeleton cards (9) in grid layout |
| Results loaded | Shop cards + result count + active chips |
| Zero results | "검색 결과가 없습니다. 다른 테마를 선택해보세요." |
| API error | "검색 중 오류가 발생했습니다. 다시 시도해주세요." with retry button |

---

## 6. Location Search Page (지역별 검색)

> **Figma:** 지역별 검색 - Region-based Search
> **Route:** `/[locale]/location` or `/[locale]/location/{region-slug}` or `/[locale]/location/{region-slug}/{district-slug}`
> **Rendering:** SSG for region/district combination pages; SSR for filtered results
> **SEO:** Location pages are indexed (crawlable URLs per region/district)

### 6.1 Page Purpose

The Location Search page allows customers to browse shops by geographic region. It features a region chip bar at the top for quick Level 1 selection, with results filtered by the selected region (and optionally district) below.

### 6.2 Layout

Identical to Detail Search (§4.3) with one addition: the **Region Chip Bar** is displayed between the Sub-Navigation Bar and the filter/results area.

### 6.3 Region Chip Bar (Top Section)

**Header:** "지역별 마사지 찾기" (left) + "상세검색+" link (right)

**Chips:** Horizontal row of region pills — 전체, **서울** (highlighted), 경기, 인천, 부산, 대구, 광주, 대전

| Action | Result |
|---|---|
| Click a region chip | URL changes to `/[locale]/location/{region-slug}`, results filter to that region. Level 2 dropdown in sidebar updates to show districts for the selected region. |
| Click "전체" | Shows all shops, no region filter |
| Click "상세검색+" | Navigate to `/[locale]/search` (Detail Search) |

**Active State:** Selected region chip has an orange filled background (others are outlined).

### 6.4 Filter Sidebar

Same filter sidebar as Detail Search (§4.4) with the **full set of filters**: keyword search, location select, service benefits (checkboxes), theme chips, price range, and search button. The **Level 1 dropdown in the sidebar syncs with the region chip bar** — selecting a region chip auto-updates the Level 1 dropdown and vice versa. Unlike Theme Search (§5), the theme chip section IS included because themes are not already represented as a top-level selector on this page.

### 6.5 Results Area

Same structure as Detail Search (§4.5):
- Result header: "**서울 강남구** 검색 결과 총 **1,004**개"
- Active filter chips
- Sort options (same 4 options)
- Shop card grid (3 columns)
- Pagination

### 6.5.1 Data Sources

| Data | API Endpoint |
|---|---|
| Region list | `GET /api/regions?sort=display_order:asc&locale={locale}` |
| District list | `GET /api/districts?filters[region][slug][$eq]={region-slug}&locale={locale}` |
| Shop results | `GET /api/shops?filters[region][slug][$eq]={region-slug}&filters[district][slug][$eq]={district-slug}&locale={locale}&sort=average_rating:desc&pagination[page]={page}&pagination[pageSize]=9` + additional sidebar filters |

### 6.6 SEO Metadata

Location pages are indexed with:
- Title: "{Region} {District} 마사지 - SWIDA" (e.g., "서울 강남구 마사지 - SWIDA")
- Both `/ko` and `/en` versions included in sitemap

### 6.7 Acceptance Criteria

| # | Criteria | Priority |
|---|---|---|
| LS-01 | Region chip bar displays all major regions | P0 |
| LS-02 | Selecting a region filters results and syncs with sidebar dropdown | P0 |
| LS-03 | Region + district combination URLs are crawlable | P0 |
| LS-04 | Sidebar filters work in combination with region selection | P0 |
| LS-05 | Location page URLs are indexed in sitemap for both locales | P0 |

### 6.8 States

| State | Display |
|---|---|
| Landing (no region selected) | Region chip bar with "전체" active, all shops shown |
| Region selected, loading | Skeleton cards (9) in grid layout |
| Results loaded | Shop cards + result count + active chips |
| Zero results | "해당 지역에 등록된 매장이 없습니다." |
| API error | "검색 중 오류가 발생했습니다. 다시 시도해주세요." with retry button |

---

## 7. Nearby Search Page (내 주변 검색)

> **Figma:** 내주변 검색 - Popular Area Search
> **Route:** `/[locale]/nearby`
> **Rendering:** CSR (GPS-dependent, fully dynamic)
> **SEO:** `noindex` (dynamic, personalized content)

### 7.1 Page Purpose

The Nearby Search page provides GPS-powered shop discovery with a map + list split view. Customers see shops plotted on a map alongside a scrollable list sorted by distance.

### 7.2 Layout

```
┌──────────────────────────────────────────────────────────┐
│  Sub-Navigation Bar (6 tabs — "내 주변 검색" active)       │
├──────────────────────────────────────────────────────────┤
│  Current Location: 서울 강남구 역삼동  [변경]              │
│  Breadcrumb: 서울 > 강남구 > 역삼동 > 주변 샵              │
├───────────────────────────┬──────────────────────────────┤
│                           │  주변 추천 샵  12개            │
│                           │  Sort: [거리순] 추천순 가격순   │
│       Interactive Map     ├──────────────────────────────┤
│    (Google Maps / Kakao)  │  Shop List Card 1 (450m)     │
│                           │  Shop List Card 2 (820m)     │
│    Shops marked as pins   │  Shop List Card 3 (1.2km)    │
│    with name labels       │  Shop List Card 4 (1.5km)    │
│                           │                              │
│                           │  [결과 더보기 (4/12)]          │
├───────────────────────────┴──────────────────────────────┤
│  Footer                                                   │
└──────────────────────────────────────────────────────────┘
```

### 7.3 Current Location Bar

Same behavior as Homepage current location display (§3.3.4):
- Shows detected location with "변경" button
- GPS requested on page load
- Breadcrumb trail: 서울 > 강남구 > 역삼동 > 주변 샵

### 7.4 Map Panel (Left)

**Map Provider:** Google Maps or Kakao Map (same as used in Admin Web for consistency)

**Features:**

| Feature | Specification |
|---|---|
| Center | User's GPS coordinates |
| Zoom level | Auto-fit to show all results within radius, or default zoom ~14 |
| Shop pins | Each nearby shop displayed as a colored pin/marker on the map |
| Pin labels | Shop name displayed as a label next to each pin (e.g., "더 원 테라피", "아모레 테라피") |
| Pin label style | Rounded orange/dark pill with white text |
| Pin click | Highlight the corresponding shop card in the right panel (scroll to it) |
| Zoom controls | +/- buttons (top right of map) |
| My location button | Target icon (⊙) button to re-center on user's GPS location |
| Map interaction | Draggable, zoomable. Moving the map does NOT re-search (search is GPS-based, not map-bounds-based) |

### 7.5 Shop List Panel (Right)

**Header:** "주변 추천 샵" + "**12개**" count (orange) on the left

**Sort Tabs:**

| Sort | Label | API Parameter | Default |
|---|---|---|---|
| 거리순 | Distance | `sort=distance:asc` (custom controller) | ✓ (default, highlighted orange) |
| 추천순 | Recommended | `sort=recommendation_score:desc` | |
| 가격순 | Price | `sort=sale_price:asc` | |

**Shop List Card (Horizontal Layout):**

Each card is a horizontal row (unlike the vertical grid cards on other pages):

| Element | Data | Position |
|---|---|---|
| Thumbnail | `shop.thumbnail.url` | Left side, square image |
| Shop name | `shop.name` | Bold, top-right of image |
| Rating + review count | `★ 4.8 (128)` | Below name |
| Hashtag tags | e.g., "#강남구 #스웨디시 #아로마 #커플환영" | Below rating, gray text |
| Hashtag tags | Derived from `shop.themes[].name` + amenity flags | e.g., "#강남구 #스웨디시 #아로마 #커플환영" |
| Distance | Computed from API `distance` field | Right-aligned, orange text |
| Original price (strikethrough) | `shop.original_price` | Bottom-right, gray strikethrough |
| Sale price | `shop.sale_price` | Bottom-right, bold orange |

**Card Click:** Navigate to `/[locale]/shop/{slug}`

**"결과 더보기" Button:**
- Displayed at the bottom of the list: "결과 더보기 (4/12)" — showing current count / total count
- Click loads the next batch of results (append to list, not paginate)
- This is **load-more pagination** (not page-based), since the page is CSR and `noindex`

### 7.6 Map-List Interaction

| Action | Result |
|---|---|
| Click a pin on the map | Scroll the list panel to the corresponding shop card, highlight it briefly |
| Hover a shop card in the list | Highlight the corresponding pin on the map (bounce or color change) |
| Change sort order | List re-sorts; map pins remain in same positions |
| Change location ("변경") | Re-center map, re-fetch shops for new location |

### 7.7 States

| State | Display |
|---|---|
| GPS pending | Map shows Seoul (default center). List shows: "위치를 확인하는 중..." |
| GPS granted, loading | Map centers on user. List shows skeleton cards. |
| Loaded | Map with pins + list with cards |
| No results | Map centered on user, no pins. List: "주변에 등록된 매장이 없습니다." |
| GPS denied | Map shows Seoul. Prominent message: "위치 정보를 허용하면 내 주변 매장을 확인할 수 있어요" + "위치 허용하기" button |
| API error | Map remains. List: "검색 중 오류가 발생했습니다." + retry button |

### 7.8 Acceptance Criteria

| # | Criteria | Priority |
|---|---|---|
| NS-01 | GPS permission requested on page load; map centers on user location | P0 |
| NS-02 | Shops within 5km radius displayed as pins on map and cards in list | P0 |
| NS-03 | Distance is displayed on each card and results default to distance sort | P0 |
| NS-04 | Clicking a map pin scrolls to and highlights the corresponding list card | P1 |
| NS-05 | "결과 더보기" loads additional results without page reload | P1 |
| NS-06 | Sort tabs (거리순, 추천순, 가격순) re-order the list correctly | P0 |
| NS-07 | "변경" location change re-fetches results for new location | P0 |
| NS-08 | Page loads within 3 seconds after GPS permission granted | P0 |

---

## 8. Shop Detail Page (샵 상세 페이지)

> **Figma:** 샵 상세 페이지 리뷰 - Shop Detail Page
> **Route:** `/[locale]/shop/{slug}`
> **Rendering:** ISR (revalidate: 60 seconds)
> **SEO:** Indexed, included in sitemap. Structured data (JSON-LD `LocalBusiness`)

### 8.1 Page Purpose

The Shop Detail page is the most content-rich page in SWIDA. It shows all information about a single shop: images, description, location, services/pricing, amenities, reviews, and nearby alternatives. It is the primary conversion page where customers decide to book or contact a shop.

### 8.2 Layout

```
┌──────────────────────────────────────────────────────────┐
│  Breadcrumb: 서울 > 동대문구 > 장안동 > 골드문              │
├────────────────────────────────┬─────────────────────────┤
│                                │                         │
│  Image Gallery (main + thumbs) │  Booking Sidebar        │
│  ┌──────────────┐ ┌───┐ ┌───┐ │  ┌─────────────────┐   │
│  │  Main Image  │ │ 2 │ │ 3 │ │  │ 지도에서 위치보기  │   │
│  │              │ ├───┤ ├───┤ │  │                   │   │
│  │              │ │ 4 │ │ 5 │ │  │ Price: 60,000원~  │   │
│  │              │ │   │ │+12│ │  │ Service tabs      │   │
│  └──────────────┘ └───┘ └───┘ │  │ Course list       │   │
│                                │  │ [전화 예약하기]    │   │
│  Shop Name           ♡ 207    │  │ [문자 예약하기]    │   │
│  ★ 4.9  리뷰 128개             │  └─────────────────┘   │
│  📍 Address                    │                         │
│  🕐 Operating Hours            │                         │
│  🅿️ Parking info               │                         │
│  Amenity hashtags              │                         │
├────────────────────────────────┴─────────────────────────┤
│  Tab Bar: [가격&코스] [이벤트(2)] [리뷰(128)] [이용안내]    │
├──────────────────────────────────────────────────────────┤
│  Tab Content (varies by selected tab)                     │
├──────────────────────────────────────────────────────────┤
│  이 주변 추천샵 (Nearby Recommendations)                   │
├──────────────────────────────────────────────────────────┤
│  Footer                                                   │
└──────────────────────────────────────────────────────────┘
```

### 8.3 Breadcrumb

Path: `{Region} > {District} > {Dong/Area} > {Shop Name}`
Example: "서울 > 동대문구 > 장안동 > 골드문"

Each breadcrumb segment is clickable and navigates to the corresponding location search page.

### 8.4 Image Gallery

**Layout:** Main large image (left) + thumbnail grid (right, 2 columns × 2-3 rows)

| Element | Specification |
|---|---|
| Main image | Largest image from `shop.images`, displayed prominently |
| Thumbnail grid | Next 4-5 images displayed as smaller thumbnails |
| "+12 더보기" overlay | If more than 6 images exist, the last thumbnail shows a "+{count} 더보기" overlay |
| Click main image | Opens full-screen image lightbox/gallery |
| Click thumbnail | Swaps the main image to the clicked thumbnail |
| Click "+더보기" | Opens full-screen gallery starting from that image |
| Favorite heart (♡) | Top-right corner of main image. Toggles favorite. Requires login. |

### 8.5 Shop Info Section

**Shop Name:** Large heading text (e.g., "골드문 스웨디시 & 테라피")

**Favorite Count:** "♡ 207" — heart icon + count, right-aligned on the same line as shop name

**Rating + Review Count:** "★ 4.9  리뷰 128개" — orange star, rating number, review count link (clicking "리뷰 128개" scrolls to the review tab)

**Details (icon + text rows):**

| Icon | Content | Data Source |
|---|---|---|
| 📍 | Full address (e.g., "서울 동대문구 장안동 123-45 (장한평역 2번출구)") | `shop.address` |
| 🕐 | Operating hours (e.g., "매일 11:00 ~ 익일 05:00 (연중무휴)") | `shop.operating_hours` + `shop.closed_days` |
| 🅿️ | Parking info (e.g., "건물 지하 무료 주차 가능") | `shop.amenities.parking_detail` |
| ✓ | Amenity summary (e.g., "남녀공용, 개인실 완비") | Derived from amenities component |

**Hashtag Tags:** Row of gray pill tags summarizing key features:
e.g., `#24시간` `#주차가능` `#샤워실완비` `#커플환영` `#역세권`
Derived from shop amenities and features. Clicking a tag navigates to Detail Search filtered by that feature.

### 8.6 Booking Sidebar (Right Panel — Sticky)

**Position:** Sticky on the right side, stays visible as user scrolls through the main content.

**Components (top to bottom):**

#### 8.6.1 Map Button
- "지도에서 위치보기" button with location pin icon
- Click opens Google Maps / Kakao Map in a new tab centered on shop coordinates
- Or opens an inline map modal showing the shop location

#### 8.6.2 Price Display
- Original price (strikethrough, small, gray): "~~80,000원~~"
- Label: "회원가"
- Sale price (large, bold, orange): "**60,000원 ~**"

#### 8.6.3 Service Category Tabs
- Horizontal tabs to switch between service categories
- Example: `[스웨디시]` `[타이/아로마]`
- Each tab shows the service menu items for that category

#### 8.6.4 Course/Service List
Table of services for the selected category:

| Column | Example |
|---|---|
| Course name | "A코스 (60분)" |
| Price | "80,000원" |

#### 8.6.5 Booking CTAs
Two full-width buttons stacked vertically:

| Button | Style | Action |
|---|---|---|
| 전화 예약하기 | Orange filled, phone icon | Opens phone dialer (`tel:{shop.phone_number}`) on mobile; shows phone number on desktop |
| 문자 예약하기 | Orange outlined, message icon | Opens SMS (`sms:{shop.phone_number}`) on mobile; shows phone number on desktop |

### 8.7 Content Tabs

Horizontal tab bar below the shop info section:

| Tab | Label | Content |
|---|---|---|
| 가격&코스 | Pricing & Courses | Full service menu with all categories, durations, and prices |
| 이벤트 (2) | Events | Shop-specific events/promotions (count in parentheses). New feature — see §16.6 |
| 리뷰 (128) | Reviews | Customer reviews with ratings (count in parentheses) |
| 이용안내 | Usage Guide | Additional information — policies, directions, notes |

**Default tab:** 리뷰 (as shown in Figma — the review tab is active and orange)

### 8.7.1 가격&코스 Tab Content

**Purpose:** Full service menu displaying all available courses/services grouped by category.

**Layout:**
- Services grouped by category headers (e.g., "스웨디시", "타이/아로마") — same categories as the booking sidebar tabs (§8.6.3)
- Each service row shows:

| Element | Data Source | Display |
|---|---|---|
| Service name | `service_menu_item.name` | e.g., "A코스 (60분)" |
| Duration | `service_menu_item.duration` | e.g., "60분" |
| Price | `service_menu_item.price` | e.g., "80,000원" |
| Description | `service_menu_item.description` | Optional — brief text below the service name |

- Original/sale price indicator at the top (same as booking sidebar)
- If no service menu items exist, show: "서비스 정보가 등록되지 않았습니다."

### 8.7.2 이벤트 Tab Content

**Purpose:** Display shop-specific promotions and events.

**Layout:**
- List of event cards, each showing:

| Element | Data Source | Display |
|---|---|---|
| Event image | `shop_event.image.url` | Banner image (optional — show placeholder if no image) |
| Event title | `shop_event.title` | Bold heading |
| Event description | `shop_event.description` | Body text |
| Event dates | `shop_event.start_date` – `shop_event.end_date` | "2026.03.15 ~ 2026.04.15" (if dates set) |

- Tab label shows count in parentheses: "이벤트 (2)"
- Data source: `GET /api/shop-events?filters[shop][slug][$eq]={slug}&filters[status][$eq]=published&sort=createdAt:desc&locale={locale}`
- If no events exist, show: "현재 진행 중인 이벤트가 없습니다."

### 8.7.3 이용안내 Tab Content

**Purpose:** Additional usage information — directions, policies, rules, notes.

**Layout:**
- Free-form rich text content rendered from the shop's `usage_guide` field (new field — Text/Long or Rich Text)
- Typical content includes: detailed directions, parking instructions, booking policies, cancellation policies, age restrictions, group booking info, etc.
- If no content exists, show: "이용안내가 등록되지 않았습니다."

**New Data Model Field Required:** `usage_guide` — Text (Long) or Rich Text field on the `shop` content type.

### 8.8 Review Tab Content

#### 8.8.1 Review Summary
- "전체 평점" label + "★ 4.9" (orange)
- "리뷰 작성+" link (right-aligned, orange) → opens review submission form (requires login)

#### 8.8.2 Review List
Each review card shows:

| Element | Data |
|---|---|
| Author avatar | Circle with initial (e.g., "김") |
| Author nickname | e.g., "힐링마스터" |
| Badge | e.g., "2회 첨" (visited 2 times) |
| Date | Relative: "2일 전", "1주일 전" |
| Star rating | 5 orange stars (filled/empty) |
| Comment text | Full review body |
| Report button | "신고" link/icon — report a review (see below) |

**Review text:** Displayed in full (not truncated). Long reviews may expand with a "더보기" link.

**Report Review flow:**
1. Click "신고" on a review card
2. If not logged in → redirect to login page with return URL
3. If logged in → show a reason selection modal: `spam`, `fake`, `inappropriate`, `irrelevant`, `other`
4. On submit → `POST /api/reviews/{id}/report` with `{ reason }`
5. Success → toast "신고가 접수되었습니다." Report button disabled for this review.
6. Reported reviews enter `under_review` status via Strapi lifecycle hook (PRD §8.5)

**"리뷰 작성+" flow:**
1. Click "리뷰 작성+"
2. If not logged in → redirect to login page with return URL
3. If logged in but account locked → show toast: "계정이 정지되었습니다. 관리자에게 문의해주세요."
4. If logged in → show review submission form (inline or modal):
   - Star rating selector (1-5, required)
   - Comment textarea (10-500 chars, required)
   - Submit button
5. On submit → `POST /api/reviews` with `{ rating, comment, shop: documentId }`
6. Success → toast "리뷰가 등록되었습니다" + prepend new review to list
7. Error → toast with error message

#### 8.8.3 Review Pagination
Page-based pagination at the bottom: `< [1] 2 3 4 5 >`

- Each page shows ~5-10 reviews
- URL: `/[locale]/shop/{slug}?tab=reviews&page=2`

### 8.9 Nearby Recommendations (이 주변 추천샵)

**Position:** Below the tab content area, before the footer.

**Visual Design:**
- Section header: "이 주변 추천샵"
- Horizontal row of 4 shop cards
- Each card shows: thumbnail image with rating badge (★ 4.8), shop name, location + walking distance (e.g., "도보 5분"), sale price with strikethrough original price

**Data Source:** `GET /api/shops/nearby?lat={shop.latitude}&lng={shop.longitude}&radius=3000&pagination[pageSize]=4` — fetched using the current shop's coordinates (not the user's GPS).

**Walking Distance Calculation:** The API returns a `distance` field in meters. The Customer Web converts this to a walking time estimate using the formula: `walking_minutes = Math.round(distance_meters / 80)` (assuming ~80m/min average walking speed). Displayed as "도보 {N}분" on each card. If distance > 3km, show "차량 {N}분" using `Math.round(distance_meters / 500)` instead.

**Card Click:** Navigate to `/[locale]/shop/{slug}` for that nearby shop.

### 8.10 SEO Metadata

```typescript
{
  title: `${shop.name} - SWIDA`,
  description: `${shop.description.substring(0, 160)}`,
  openGraph: {
    title: shop.name,
    description: shop.description,
    images: [{ url: shop.thumbnail.url }],
    type: 'place',
  },
  // JSON-LD LocalBusiness structured data
}
```

**JSON-LD:** `LocalBusiness` schema with: name, address, geo (lat/lng), telephone, openingHours, aggregateRating, priceRange.

### 8.11 Acceptance Criteria

| # | Criteria | Priority |
|---|---|---|
| SD-01 | Shop detail page loads with ISR within 2 seconds | P0 |
| SD-02 | Image gallery displays correctly with lightbox functionality | P0 |
| SD-03 | Booking sidebar is sticky and displays correct pricing | P0 |
| SD-04 | Phone/SMS booking buttons work correctly on mobile and desktop | P0 |
| SD-05 | Tab switching (가격&코스, 이벤트, 리뷰, 이용안내) works without page reload | P0 |
| SD-06 | Reviews display with pagination, sorted by newest first | P0 |
| SD-07 | "리뷰 작성+" requires login, validates input (1-5 stars, 10-500 chars), and submits successfully | P0 |
| SD-08 | Locked accounts see an error message when attempting to submit reviews | P0 |
| SD-09 | Favorite heart toggles correctly (requires login) | P1 |
| SD-10 | Nearby recommendations show shops near the current shop's location | P1 |
| SD-11 | Breadcrumb links navigate to correct location pages | P1 |
| SD-12 | JSON-LD structured data renders correctly for search engines | P0 |
| SD-13 | SEO metadata (title, OG tags, hreflang) renders correctly | P0 |
| SD-14 | Service category tabs in booking sidebar switch course lists correctly | P1 |

### 8.12 New Data Model Fields / Content Types Required

| Item | Type | Description |
|---|---|---|
| Shop Events | New content type (`shop-event`) | Shop-specific promotions/events shown in the "이벤트" tab — see §16.6 |
| Favorite/Bookmark | New content type or relation | User-shop favorite relation for the ♡ heart functionality — see §16.7 |
| Service Categories | Component extension | Group `service-menu-item` components by category (스웨디시, 타이/아로마) for the booking sidebar tabs — see §16.8 |
| Usage Guide | New field on `shop` | Rich text field for the "이용안내" tab content — see §16.8 |

---

*Sections 9–15 and 17 will be added as we review the remaining Figma screens (Partnership, Auth, Board pages, Events).*

---

## 16. New Content Types Required

The Figma design introduces UI features that require new Strapi content types not present in the current PRD/TSD. These must be added to the Strapi backend and the Admin Web before the Customer Web can consume them.

### 16.1 Notice (`notice`)

**Purpose:** Rotating announcement banners displayed at the top of every page.

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Title | Text (Short) | Yes | Notice headline text displayed in the banner |
| Link URL | Text (Short) | No | URL to navigate to when clicked (internal or external) |
| Link Target | Enumeration | No | `_self` (default), `_blank` |
| Status | Enumeration | Yes | `draft`, `published`, `archived` |
| Display Order | Integer | No | Sort priority (lower = higher priority) |
| Start Date | DateTime | No | Optional — notice only visible after this date |
| End Date | DateTime | No | Optional — notice automatically hidden after this date |

**i18n:** Enabled (title and link URL localized)
**Draft & Publish:** Enabled

### 16.2 Banner (`banner`)

**Purpose:** Hero banners displayed on the Homepage (and potentially other pages).

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Title | Text (Short) | Yes | Headline text overlaid on the banner |
| Subtitle | Text (Short) | No | Secondary text below the headline |
| CTA Text | Text (Short) | No | Button text (e.g., "지금 바로 예약하기") |
| CTA URL | Text (Short) | No | URL the CTA button navigates to |
| Image | Media (Single) | Yes | Background image |
| Placement | Enumeration | Yes | `homepage_hero`, `search_top` (extensible) |
| Status | Enumeration | Yes | `draft`, `published` |
| Display Order | Integer | No | Sort priority for rotation order |

**i18n:** Enabled (title, subtitle, CTA text localized)
**Draft & Publish:** Enabled

### 16.3 Editorial Pick (`editorial-pick`)

**Purpose:** Curated editorial recommendation cards displayed on the Homepage ("Swida 추천샵 Editor's Choice").

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Title | Text (Short) | Yes | Card title (e.g., "지친 하루의 끝, 커플 스파로 힐링하세요") |
| Description | Text (Long) | Yes | Card description text |
| Image | Media (Single) | Yes | Background image for the card |
| Badge Tag | Enumeration | Yes | `best_theme`, `recommend`, `new_open`, `hot`, `premium` |
| Link URL | Text (Short) | Yes | URL to navigate to when clicked |
| Status | Enumeration | Yes | `draft`, `published` |
| Display Order | Integer | No | Sort priority |

**i18n:** Enabled (title, description localized)
**Draft & Publish:** Enabled

### 16.4 Region Recommendation (`region-recommendation`)

**Purpose:** Curated region-based shop collection cards on the Homepage ("지역별 마사지 추천").

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Title | Text (Short) | Yes | Card title (e.g., "강남구 최고 인기샵") |
| Description | Text (Long) | Yes | Card description |
| Image | Media (Single) | Yes | Thumbnail image |
| Hashtags | JSON | No | Array of hashtag strings (e.g., ["#압구정", "#신사", "#한남"]) |
| Linked Region | Relation (→ Region) | No | Optional link to a region |
| Linked District | Relation (→ District) | No | Optional link to a district |
| Link URL | Text (Short) | No | Custom URL override (if not using linked region/district) |
| Status | Enumeration | Yes | `draft`, `published` |
| Display Order | Integer | No | Sort priority |

**i18n:** Enabled (title, description, hashtags localized)
**Draft & Publish:** Enabled

### 16.5 Shop Data Model Extensions

The following fields need to be added to the existing `shop` content type:

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Original Price | Integer | No | Original/regular starting price in KRW (displayed with strikethrough when sale price exists) |
| Sale Price | Integer | No | Discounted/promotion starting price in KRW |
| Is Premium | Boolean | No | Whether the shop has a premium listing (controls "PREMIUM" badge) |
| Is Best | Boolean | No | Whether the shop is admin-curated as a top pick (controls "BEST" badge) |
| Is New | Boolean | No | Whether the shop is newly listed (controls "신규" badge). Auto-set by lifecycle hook if shop was published within the last 30 days. |

**Badge Display Logic:**

| Badge ID | Label | Color | Condition |
|---|---|---|---|
| `premium` | PREMIUM / 프리미엄 | Gold/yellow | `shop.is_premium === true` |
| `best` | BEST | Red | `shop.is_best === true` (admin-curated featured shop) |
| `new` | 신규 | Blue | `shop.is_new === true` OR shop published within last 30 days |

**Price Display Logic:**

| Scenario | Display |
|---|---|
| Both `original_price` and `sale_price` exist and `sale_price < original_price` | Show `original_price` with strikethrough + `sale_price` highlighted |
| Only `sale_price` exists (or they are equal) | Show `sale_price` only, no strikethrough |
| Neither exists | Show the price from the cheapest `service_menu_item` (fallback) |
| No pricing data at all | Show "가격 문의" (Price on inquiry) |

### 16.6 Shop Event (`shop-event`)

**Purpose:** Shop-specific promotions or events displayed in the "이벤트" tab on the Shop Detail page.

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Title | Text (Short) | Yes | Event title |
| Description | Text (Long) | Yes | Event details |
| Image | Media (Single) | No | Event banner image |
| Shop | Relation (→ Shop) | Yes | The shop this event belongs to |
| Start Date | DateTime | No | Event start date |
| End Date | DateTime | No | Event end date |
| Status | Enumeration | Yes | `draft`, `published`, `expired` |

**i18n:** Enabled (title, description localized)
**Draft & Publish:** Enabled

### 16.7 Favorite / Bookmark (`favorite`)

**Purpose:** Allows logged-in customers to save/bookmark shops for quick access.

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| User | Relation (→ Users-Permissions User) | Yes | The customer who favorited |
| Shop | Relation (→ Shop) | Yes | The favorited shop |

**API Endpoints:**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/favorites` | Customer JWT | Add a shop to favorites |
| DELETE | `/api/favorites/:id` | Customer JWT | Remove a shop from favorites |
| GET | `/api/favorites?filters[user][id][$eq]={userId}` | Customer JWT | List user's favorites |

**Behavior:** Unique constraint on (user, shop) pair — a user can only favorite a shop once.

### 16.8 Additional Shop Data Model Extensions (from Search Pages)

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Is 24hr | Boolean | No | Whether the shop operates 24 hours. Prominent filter on search pages. |
| Is Best | Boolean | No | Whether the shop is admin-curated as a top pick (controls "BEST" badge on search cards). |
| Recommendation Score | Integer | No | Admin-managed or calculated score for "추천순" sort order. Default: 0 |
| Usage Guide | Text (Long) or Rich Text | No | Free-form content for the "이용안내" tab on Shop Detail page (directions, policies, rules). Localized via i18n. |
| Service Category | Component extension on `service-menu-item` | No | Add a `category` text field to group services by category (e.g., "스웨디시", "타이/아로마") for the booking sidebar tabs |

---

> **Document End (Partial)**
>
> Sections 9–15 and 17 are pending Figma screen review for: Partnership, Auth, Board pages, Events, Shared Components, and Cross-Cutting Concerns.
