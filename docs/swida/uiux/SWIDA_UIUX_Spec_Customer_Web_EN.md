---
title: "SWIDA — Customer Web UI/UX Spec"
sidebar_label: "English"
sidebar_position: 1
---

# UI/UX Specification

## SWIDA — Customer Web

- **Version**: 1.0
- **Date**: 2026-03-26
- **Based on**: SWIDA PRD v1.1, TSD v1.1, FSD (Customer Web) v1.0
- **Scope**: MVP — Customer-facing shop discovery web application
- **Target**: Mobile-First responsive (3-tier)
- **Note**: Colors, typography, spacing values, and icon styles are defined in a separate Design System document. Figma frames are used as visual reference only — FSD is the source of truth for all functional decisions.

---

## 1. Document Overview

### 1.1 Purpose

This document defines the screen layouts, responsive behavior, component structures, and interaction flows for the SWIDA Customer Web application on a page-by-page basis. Functional specifications and business rules are defined in the FSD; design tokens are defined in the Design System guide.

### 1.2 Scope

| Covered | Not Covered |
|---|---|
| 3-tier responsive layout shell | Colors, typography, spacing values |
| Page-level screen structure (wireframe level) | Animation speed / easing curves |
| Component tier adaptation rules | Per-client theming |
| User interaction flows (storyboards) | Admin Web UI |
| State-based screen branching | Backend configuration |
| Figma–FSD conflict resolution log | |

---

## 2. Responsive Layout System

### 2.1 Breakpoints

| Tier | Abbr | Reference Device |
|---|---|---|
| Desktop | D | PC, large monitors |
| Tablet | T | iPad, small laptops |
| Mobile | M | Smartphones |

The layout adapts across three tiers: Desktop, Tablet, and Mobile. Components are designed mobile-first, then extended for larger screens.

- Screen definitions follow Mobile → Tablet → Desktop order

> For detailed technical specifications (breakpoint values, CSS implementation), see the TSD.

### 2.2 Layout Shell Matrix

| Element | Desktop | Tablet | Mobile |
|---|:---:|:---:|:---:|
| Header (top fixed) | ✅ Full nav | ✅ Condensed | ✅ Minimal |
| Search Tab Bar | ✅ 6 tabs inline | ✅ 6 tabs (compact) | ❌ Hidden |
| Mobile Bottom Nav | ❌ | ❌ | ✅ |
| Hamburger Drawer | ❌ | ✅ (☰ trigger) | ✅ (☰ trigger) |
| Footer | ✅ 4-column | ✅ 2-column | ✅ Accordion |

### 2.3 Layout Shell Structure

**Desktop**

```
┌──────────────────────────────────────────────────────┐
│  Header (top fixed)                                   │
│  [Logo] [Search Bar] [샵검색▾] [이벤트] [게시판▾] [제휴문의] [로그인] │
├──────────────────────────────────────────────────────┤
│  Search Tab Bar (6 tabs)                              │
│  [상세검색] [테마별검색] [지역별검색] [내주변검색] [방문후기] [업소제휴] │
├──────────────────────────────────────────────────────┤
│  Main Content (scrollable)                            │
├──────────────────────────────────────────────────────┤
│  Footer (4-column)                                    │
└──────────────────────────────────────────────────────┘
```

**Tablet**

```
┌──────────────────────────────────────────────────────┐
│  Header (top fixed, condensed)                        │
│  [☰] [Logo] [Search Bar]              [로그인]         │
├──────────────────────────────────────────────────────┤
│  Search Tab Bar (6 tabs, compact)                     │
├──────────────────────────────────────────────────────┤
│  Main Content (full width, scrollable)                │
├──────────────────────────────────────────────────────┤
│  Footer (2-column)                                    │
└──────────────────────────────────────────────────────┘

  ┌──────────┐
  │ Drawer   │ ← ☰ click → left overlay
  │ (dim bg) │
  └──────────┘
```

**Mobile**

```
┌──────────────────────────────────────────────────────┐
│  Header (top fixed, minimal)                          │
│  [☰] [Logo]                           [로그인]         │
├──────────────────────────────────────────────────────┤
│  Main Content (full width, scrollable)                │
├──────────────────────────────────────────────────────┤
│  Footer (accordion)                                   │
├──────────────────────────────────────────────────────┤
│  Bottom Nav Bar (fixed)                               │
│  [홈] [검색] [내주변] [게시판] [MY]                      │
└──────────────────────────────────────────────────────┘

  ┌──────────┐
  │ Drawer   │ ← ☰ tap → left overlay
  └──────────┘
```

---

## 3. Common Shell Components

### 3.1 Header

#### Desktop Header

```
┌────────────────────────────────────────────────────────────────────┐
│ [Logo]  [지역,업소명,테마를 검색해보세요 🔍]  [샵검색▾] [이벤트] [게시판▾] [제휴문의] [로그인] [회원가입] │  ← Guest
│ [Logo]  [지역,업소명,테마를 검색해보세요 🔍]  [샵검색▾] [이벤트] [게시판▾] [제휴문의] [👤]            │  ← Logged in
└────────────────────────────────────────────────────────────────────┘
```

| Element | Guest | Logged In |
|---|---|---|
| Logo | ✅ → Homepage | ✅ → Homepage |
| Search Bar (Quick Search) | ✅ Name search (F-NAV-02) | ✅ Name search |
| 샵 검색 ▾ (dropdown) | ✅ → Search mode dropdown | ✅ |
| 이벤트 | ✅ → Events & Notices | ✅ |
| 게시판 ▾ (dropdown) | ✅ → Board dropdown | ✅ |
| 제휴문의 | ✅ → Partnership | ✅ |
| 로그인 / 회원가입 | ✅ → Login / Sign Up pages | — |
| User avatar 👤 | — | ✅ → User menu dropdown |
| Language Switcher | ✅ ko/en toggle (F-I18N-04) | ✅ |

**샵 검색 Dropdown**: 상세 검색, 테마별 검색, 지역 검색, 내주변 검색

**게시판 Dropdown**: 샵 추천, 마사지 정보, 커뮤니티

**User Menu Dropdown** (logged in): 마이페이지, 로그아웃

#### Tablet Header

```
┌────────────────────────────────────────────────────────────────────┐
│ [☰] [Logo]  [지역,업소명,테마를 검색해보세요 🔍]          [로그인]          │  ← Guest
│ [☰] [Logo]  [지역,업소명,테마를 검색해보세요 🔍]          [👤]              │  ← Logged in
└────────────────────────────────────────────────────────────────────┘
```

| Difference from Desktop | Description |
|---|---|
| ☰ added | Drawer trigger |
| Nav links hidden | Moved to Drawer |
| Search bar | Retained but narrower |

#### Mobile Header

```
┌──────────────────────────────┐
│ [☰] [Logo]        [로그인]    │  ← Guest
│ [☰] [Logo]        [👤]        │  ← Logged in
└──────────────────────────────┘
```

- Search bar hidden — accessible via Bottom Nav "검색" tab or Drawer
- All nav links moved to Drawer and Bottom Nav

### 3.2 Search Tab Bar — Desktop & Tablet

A horizontal tab bar displayed below the header on search-related pages.

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ 🔍 상세검색│ 💆 테마별검색│ 📍 지역별검색│ 📡 내주변검색│ ⭐ 방문후기 │ 🤝 업소제휴 │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

| Behavior | Description |
|---|---|
| Active state | Filled background on current tab (orange) |
| Click | Navigate to corresponding page |
| Desktop | 6 tabs with icon + label, full width |
| Tablet | 6 tabs with icon + label, compact |
| Mobile | Hidden — replaced by Bottom Nav |

### 3.3 Bottom Nav Bar — Mobile Only

```
┌──────┬──────┬──────┬──────┬──────┐
│  🏠  │  🔍  │  📡  │  📋  │  👤  │
│  홈  │  검색 │ 내주변 │ 게시판│  MY  │
└──────┴──────┴──────┴──────┴──────┘
```

| Tab | Action |
|---|---|
| 홈 | → Homepage |
| 검색 | → Detail Search |
| 내주변 | → Nearby Search |
| 게시판 | → Board (Shop Recommendation) |
| MY | Guest → Login page / Logged in → My Page |

| Behavior | Description |
|---|---|
| Fixed | Bottom of viewport, always visible |
| Active indicator | Icon + label highlight |
| Hide on scroll down | Optional — show on scroll up |

### 3.4 Hamburger Drawer — Tablet & Mobile

| Property | Value |
|---|---|
| Trigger | T: Header ☰ / M: Header ☰ |
| Direction | Left slide-in |
| Width | 80% (max 360px) |
| Background | Dim overlay |
| Close | ✕ button, background tap, left swipe |

**Drawer — Guest**

```
┌─────────────────────────────────┐
│  [로그인]  [회원가입]         [✕]  │
├─────────────────────────────────┤
│  🏠 홈                           │
│                                  │
│  ── 샵 검색 ──                    │
│  🔍 상세 검색                     │
│  💆 테마별 검색                    │
│  📍 지역별 검색                    │
│  📡 내주변 검색                    │
│                                  │
│  ── 게시판 ──                     │
│  📝 샵 추천                       │
│  📰 마사지 정보                    │
│  💬 커뮤니티                      │
│                                  │
│  ── 기타 ──                      │
│  ⭐ 방문 후기                     │
│  📢 이벤트 & 공지                  │
│  🤝 제휴문의                      │
│                                  │
│  🌐 한국어 / English              │
└─────────────────────────────────┘
```

**Drawer — Logged In**

```
┌─────────────────────────────────┐
│  👤 닉네임                  [✕]  │
├─────────────────────────────────┤
│  (same menu as guest)            │
│  + 마이페이지                     │
│  + 로그아웃                       │
└─────────────────────────────────┘
```

### 3.5 Footer

**Desktop (4-column)**

```
┌──────────────────────────────────────────────────────────────────┐
│  [Swida Logo]       │ 고객센터         │ 메뉴            │ SNS        │
│  Description        │ 1588-1234       │ 이용안내         │ [IG] [Blog]│
│                     │ 평일 09:00-18:00│ 개인정보처리방침  │            │
│                     │                 │ 서비스이용약관    │            │
│                     │                 │ 제휴문의         │            │
├──────────────────────────────────────────────────────────────────┤
│  © 2026 SWIDA Co., Ltd. All Rights Reserved.                     │
└──────────────────────────────────────────────────────────────────┘
```

| Tier | Layout |
|---|---|
| Desktop | 4 columns as shown above |
| Tablet | 2 columns (Logo+고객센터 / 메뉴+SNS) |
| Mobile | Accordion — each section collapsible |

---

## 4. Pages — Search & Discovery

### 4.1 Homepage (`/[locale]`)

> FSD: §4, F-HOME-01~04

#### Screen Structure

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
├──────────────────────────────────────────────────────────────────┤
│  NOTICE BAR (dismissible)                                        │
│  "마짱 프리미엄 제휴점 신규 입점 안내..."              [자세히보기]  │
├──────────────────────────────────────────────────────────────────┤
│  HERO BANNER (carousel, full width)                              │
│  ┌──────────────────────────────────────────────────────┐        │
│  │  내 주변 가장 가까운                                    │        │
│  │  최고의 힐링 명소                                       │        │
│  │  [지금 바로 예약하기]                                   │        │
│  └──────────────────────────────────────────────────────┘        │
├──────────────────────────────────────────────────────────────────┤
│  THEME ICONS (2 rows, 6 per row)                                 │
│  [전체보기] [아로마] [한국마사지] [커플마사지] [스포츠] [발마사지]    │
│  [태국마사지] [홈케어] [스웨디시] [스톤테라피] [로미로미] [중국마사지] │
├──────────────────────────────────────────────────────────────────┤
│  REGION QUICK ACCESS                                             │
│  지역별 마사지 찾기                              [상세검색+]       │
│  [서울] [경기] [인천] [부산] [대구] [광주] [대전] [울산]           │
├──────────────────────────────────────────────────────────────────┤
│  CURRENT LOCATION + NEARBY SHOPS                                 │
│  📍 현재 위치: 서울 강남구 역삼동  [변경]                          │
│  내 주변 추천샵 HOT!                              [더보기→]       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                    │
│  │ Shop 1 │ │ Shop 2 │ │ Shop 3 │ │ Shop 4 │  ← 4-col cards    │
│  └────────┘ └────────┘ └────────┘ └────────┘                    │
├──────────────────────────────────────────────────────────────────┤
│  EDITOR'S CHOICE                                                 │
│  Swida 추천샵 Editor's Choice                                    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                   │
│  │ Feature 1  │ │ Feature 2  │ │ Feature 3  │  ← 3-col cards   │
│  └────────────┘ └────────────┘ └────────────┘                   │
│                    [더보기]                                       │
├──────────────────────────────────────────────────────────────────┤
│  REGIONAL RECOMMENDATIONS                                       │
│  지역별 마사지 추천                                               │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │ 강남구 최고 인기샵    │ │ 부산 해운대 힐링 명소 │  ← 2-col     │
│  └─────────────────────┘ └─────────────────────┘                │
│                    [더보기]                                       │
├──────────────────────────────────────────────────────────────────┤
│  [Footer]                                                        │
└──────────────────────────────────────────────────────────────────┘
```

#### Tier Adaptations

| Section | Desktop | Tablet | Mobile |
|---|---|---|---|
| Hero Banner | Full width, large | Full width, medium height | Full width, compact |
| Theme Icons | 6 × 2 grid | 4 × 3 grid | 3 × 4 grid, horizontal scroll |
| Region Quick Access | 8 tabs inline | 6 tabs + "더보기" | Horizontal scroll |
| Nearby Shop Cards | 4 columns | 2 columns | 1 column or horizontal scroll |
| Editor's Choice | 3 columns | 2 columns | 1 column |
| Regional Recs | 2-column cards | 2-column cards | 1-column stack |

#### Storyboard: Homepage Load

```
[1] User visits / or /ko → Redirect to /ko (default locale)

[2] SSG page loads with:
    - Theme icons (sorted by display_order)
    - Region quick-access tabs
    - Editor's Choice cards (static content)

[3] ISR-loaded sections:
    - Featured/nearby shops (revalidate 300s)

[4] Client-side:
    - GPS permission request → populate "현재 위치" + nearby shops
    - If denied → hide nearby section or show "위치 권한이 필요합니다"

[5] Notice bar:
    - Fetched from API → displayed at top
    - "자세히보기" → /[locale]/events (notices section)
    - Dismissible (session-scoped)
```

### 4.2 Detail Search (`/[locale]/search`)

> FSD: §5, F-SEARCH-01~11

#### Screen Structure

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  [Search Tab Bar — "상세 검색" active]                             │
├──────────┬───────────────────────────────────────────────────────┤
│  FILTER  │  상세 검색 결과 총 1,234개              [Sort Options]  │
│  PANEL   │  [강남구 ×] [스웨디시 ×] [24시간 ×]  ← Active chips    │
│  (left)  ├───────────────────────────────────────────────────────┤
│          │  ┌─────────┐ ┌─────────┐ ┌─────────┐                 │
│ 키워드검색│  │ Shop 1  │ │ Shop 2  │ │ Shop 3  │  ← 3-col grid  │
│ [업소명] │  └─────────┘ └─────────┘ └─────────┘                 │
│          │  ┌─────────┐ ┌─────────┐ ┌─────────┐                 │
│ 지역선택  │  │ (skel)  │ │ (skel)  │ │ (skel)  │  ← skeleton    │
│ [시/도 ▾]│  └─────────┘ └─────────┘ └─────────┘                 │
│ [시군구▾]│  ┌─────────┐ ┌─────────┐ ┌─────────┐                 │
│          │  │ (skel)  │ │ (skel)  │ │ (skel)  │                 │
│ 서비스혜택│  └─────────┘ └─────────┘ └─────────┘                 │
│ ☑ 24시간 │                                                       │
│ ☐ 주차   │  ┌─────────────────────────────────────┐              │
│ ☐ 샤워   │  │  Pagination  [< 1 2 3 4 5 >]       │              │
│ ☐ 수면   │  └─────────────────────────────────────┘              │
│ ☐ 개인실 │                                                       │
│ ☐ WiFi   │                                                       │
│ ☐ 예약필수│                                                       │
│          │                                                       │
│ 테마      │                                                       │
│ [스웨디시]│                                                       │
│ [로미로미]│                                                       │
│ ...      │                                                       │
│          │                                                       │
│ [검색하기]│                                                       │
└──────────┴───────────────────────────────────────────────────────┘
```

#### Shop Card Component

```
┌──────────────────────────┐
│  [Thumbnail]       [♡]  │  ← Heart icon: DEFERRED (PRD §12)
│  [PREMIUM badge]         │  ← Badge: DEFERRED (needs admin support)
├──────────────────────────┤
│  Shop Name      ★ 4.9   │
│  📍 서울 강남구 청담동     │
│  #아로마 #주차가능 #사워실│
│  최저가  30,000원~       │
└──────────────────────────┘
```

**Card Fields (per FSD §5.1)**: Thumbnail, shop name, district (localized), theme tags (localized), average rating, review count, open/close tag (computed client-side)

#### Filter Panel

| Filter | Type | FSD Ref |
|---|---|---|
| Keyword (shop name) | Text input | F-SEARCH-01 |
| Region (Level 1) | Dropdown | F-SEARCH-02 |
| District (Level 2) | Dropdown (cascading) | F-SEARCH-02 |
| Amenities | Checkboxes (6 options) | F-SEARCH-04 |
| Booking Required | Yes/No/Any | F-SEARCH-05 |
| Themes | Multi-select tag chips | F-SEARCH-03 |

**Note**: Figma includes a "가격대" (price range) slider — this is NOT in the FSD filter spec and is deferred to a future iteration. See §14 Conflict Log.

#### Sort Options

| Option | FSD Ref | Default |
|---|---|---|
| 평점 높은순 (Rating desc) | F-SEARCH-07 | ✅ |
| 리뷰 많은순 (Review count desc) | F-SEARCH-07 | |
| 추천순 (Recommended) | — | |
| 가격 낮은순 (Price low) | — | |

**Note**: FSD specifies "Newest listed" as a sort option. Figma shows "추천순" and "가격 낮은순" instead. Per priority rules, use FSD sort options: Rating, Review count, Newest.

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Filter panel | Left sidebar (sticky) | Left sidebar (collapsible) | Icon → Bottom Sheet |
| Results grid | 3 columns | 2 columns | 1 column |
| Active filter chips | Inline above results | Inline above results | Horizontal scroll |
| Sort | Inline text links | Inline text links | Dropdown |
| Pagination | Page numbers | Page numbers | Page numbers (compact) |
| "검색하기" button | Bottom of filter panel | Bottom of filter panel | Bottom Sheet CTA |

#### Storyboard: Detail Search

```
[1] /search → SSR. Default: no filters, sorted by rating desc.

[2] User selects Region (Level 1) → Level 2 dropdown enables and loads districts.
    API: GET /api/districts?filters[region][documentId][$eq]={regionId}

[3] User selects amenities, themes → active filter chips appear above results.

[4] "검색하기" click or filter change → URL updates with query params → SSR re-fetch.
    All filters serialized to URL (F-SEARCH-10).

[5] Results load:
    [5a] Data found → shop cards + result count ("검색 결과 총 1,234개")
    [5b] No results → "검색 결과가 없습니다" + suggestion to broaden filters (F-SEARCH-11)
    [5c] Error → toast notification + retry option

[6] Shop card click → /[locale]/shop/[slug]

[7] Pagination → unique URL per page (/search?page=2&...) for SEO (F-SEARCH-09)
```

### 4.3 Theme Browse (`/[locale]/theme/[theme-slug]`)

> FSD: §6, F-THEME-01~06

#### Screen Structure

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  [Search Tab Bar — "테마별 검색" active]                           │
├──────────────────────────────────────────────────────────────────┤
│  THEME ICON GRID (2 rows × 6)                                   │
│  [전체보기] [아로마] [한국마사지] [커플마사지] [스포츠] [발마사지]    │
│  [태국마사지] [홈케어] [스웨디시] [스톤테라피] [로미로미] [중국마사지] │
│  ← selected theme highlighted                                   │
├──────────┬───────────────────────────────────────────────────────┤
│  FILTER  │  아로마 검색 결과 총 1,004개            [Sort Options]  │
│  PANEL   │  [강남구 ×] [24시간 ×]                                 │
│  (same   ├───────────────────────────────────────────────────────┤
│  as 4.2) │  [Shop Grid — 3 columns]                              │
│          │  [Pagination]                                         │
└──────────┴───────────────────────────────────────────────────────┘
```

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Theme icon grid | 6 × 2 | 4 × 3 | Horizontal scroll |
| Filter + results | Same as Detail Search | Same | Same |

### 4.4 Location Browse (`/[locale]/location/[level1]/[level2]`)

> FSD: §7, F-LOC-01~06

#### Screen Structure

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  [Search Tab Bar — "지역별 검색" active]                           │
├──────────────────────────────────────────────────────────────────┤
│  지역별 마사지 찾기                              [상세검색+]       │
│  [전체] [서울] [경기] [인천] [부산] [대구] [광주] [대전]           │
│  ← selected region highlighted (orange fill)                     │
├──────────┬───────────────────────────────────────────────────────┤
│  FILTER  │  서울 강남구 검색 결과 총 1,004개       [Sort Options]  │
│  PANEL   │  [강남구 ×] [24시간 ×]                                 │
│  (same   ├───────────────────────────────────────────────────────┤
│  as 4.2) │  [Shop Grid — 3 columns]                              │
│          │  [Pagination]                                         │
└──────────┴───────────────────────────────────────────────────────┘
```

**Breadcrumb**: Home > Region > District (F-LOC-06)

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Region tabs | Full inline (8+) | 6 + horizontal scroll | Horizontal scroll |
| Rest | Same as Detail Search | Same | Same |

### 4.5 Nearby Search (`/[locale]/nearby`)

> FSD: §8, F-NEAR-01~08

#### Screen Structure

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  [Search Tab Bar — "내 주변 검색" active]                          │
├──────────────────────────────────────────────────────────────────┤
│  📍 현재 위치: 서울 강남구 역삼동  [변경]                          │
│  Breadcrumb: 서울 > 강남구 > 역삼동 > 주변 샵                     │
├───────────────────────────┬──────────────────────────────────────┤
│  MAP (interactive)         │  주변 추천 샵 12개    [거리순][추천순] │
│  ┌───────────────────┐    │  ┌──────────────────────────────┐   │
│  │                   │    │  │ [Thumb] 아모레 테라피    450m │   │
│  │   Kakao Map       │    │  │         ★4.8 (126)          │   │
│  │   with shop pins  │    │  │         #강남구 #스웨디시    │   │
│  │                   │    │  │         45,000원~           │   │
│  │                   │    │  ├──────────────────────────────┤   │
│  │                   │    │  │ [Thumb] 타이 인 럭셔리 820m  │   │
│  │                   │    │  │         ...                  │   │
│  └───────────────────┘    │  └──────────────────────────────┘   │
│                            │  [결과 더보기 (4/12)]               │
└───────────────────────────┴──────────────────────────────────────┘
```

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Layout | Map (left) + List (right) | Map (top) + List (bottom) | Map (top, 40vh) + List (bottom) |
| Map | ~60% width | Full width | Full width |
| Shop list | Scrollable right panel | Below map | Below map |
| Distance display | Right-aligned in card | Right-aligned | Right-aligned |
| Radius control | Preset buttons: 1km, 3km, 5km, 10km | Same | Same |

#### Storyboard: Nearby Search

```
[1] /nearby → CSR page. Request GPS permission.

[2a] Permission granted → loading indicator → fetch nearby shops
     API: GET /api/shops/nearby?lat={lat}&lng={lng}&radius=5000
[2b] Permission denied → display "위치 권한이 필요합니다" + instructions (F-NEAR-02)

[3] Results load → map pins + shop list sorted by distance

[4] Sort toggle: 거리순 (default) / 추천순 / 가격순

[5] Shop card click → /[locale]/shop/[slug]

[6] Radius change → re-fetch with new radius parameter

[7] "결과 더보기" → load more results (pagination)

[8] GPS timeout (10s) → error with retry button (F-NEAR-07)
```

---

## 5. Pages — Shop

### 5.1 Shop Detail (`/[locale]/shop/[slug]`)

> FSD: §10, F-SHOP-01~17

#### Screen Structure

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  Breadcrumb: 서울 > 동대문구 > 장안동 > 골드문                    │
├──────────────────────────────┬────────────────────────────────────┤
│  IMAGE GALLERY               │  BOOKING SIDEBAR                  │
│  ┌──────────┐ ┌────┐ ┌────┐ │  ┌────────────────────────────┐   │
│  │  Main    │ │ T2 │ │ T3 │ │  │  [Map preview — static]    │   │
│  │  Image   │ │    │ │    │ │  │  지도에서 위치보기           │   │
│  │          │ ├────┤ ├────┤ │  ├────────────────────────────┤   │
│  │          │ │ T4 │ │ T5 │ │  │  최저가                     │   │
│  │          │ │    │ │+12 │ │  │  60,000원~     ~~80,000~~  │   │
│  └──────────┘ └────┘ └────┘ │  │  [스웨디시] [타이/아로마]   │   │
│                              │  │  A코스(60분)    80,000원   │   │
│  골드문 스웨디시 & 테라피      │  │  B코스(90분)   110,000원   │   │
│  ★ 4.9  리뷰 128개    ♡ 207 │  │                            │   │
│                              │  │  [📞 전화 예약하기]         │   │
│  📍 서울 동대문구 장안동...    │  │  [💬 문자 예약하기]         │   │
│  🕐 매일 11:00~05:00         │  └────────────────────────────┘   │
│  🅿️ 건물 지하 무료 주차       │                                   │
│  👥 남녀공용, 개인실 완비      │                                   │
│                              │                                   │
│  #24시간 #주차가능 #샤워실완비 │                                   │
│  #커플환영 #액세권             │                                   │
├──────────────────────────────┴────────────────────────────────────┤
│  TAB NAVIGATION                                                  │
│  [가격&코스] [이벤트(2)] [리뷰(128)] [이용안내]                    │
├──────────────────────────────────────────────────────────────────┤
│  TAB CONTENT AREA (varies by selected tab)                       │
│  ...                                                             │
├──────────────────────────────────────────────────────────────────┤
│  이 주변 추천샵 (4-col cards of nearby shops)                     │
├──────────────────────────────────────────────────────────────────┤
│  [Footer]                                                        │
└──────────────────────────────────────────────────────────────────┘
```

#### Tab: 가격&코스 (Price & Courses)

```
┌──────────────────────────────────────────────────────┐
│  스웨디시 & 아로마 테라피                              │
│                                                       │
│  [스페셜] A코스 60분                     ~~120,000~~  │
│  전신관리 + 스웨디시 + 로미로미      80,000원 (회원가) │
│  ─────────────────────────────────────────────────── │
│  [스페셜] B코스 90분                     ~~150,000~~  │
│  전신관리 + 림프관리 + 스웨디시     110,000원 (회원가) │
│  ...                                                  │
└──────────────────────────────────────────────────────┘
```

#### Tab: 리뷰 (Reviews)

```
┌──────────────────────────────────────────────────────┐
│  전체 평점  ★ 4.9                    [리뷰 작성+]    │
│                                                       │
│  ┌────────────────────────────────────────────┐      │
│  │ 👤 힐링마스터  2일 전  ★★★★★               │      │
│  │ 샵도 깨끗하고 관리사분 실력이 너무 좋으시네요│      │
│  │ ...                                        │      │
│  └────────────────────────────────────────────┘      │
│  ┌────────────────────────────────────────────┐      │
│  │ 👤 단골예정  1주일 전  ★★★★★               │      │
│  │ 주차 편해서 좋았어요...                     │      │
│  └────────────────────────────────────────────┘      │
│                                                       │
│  [< 1 2 3 4 5 >]  ← Pagination (F-SHOP-15)          │
└──────────────────────────────────────────────────────┘
```

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Layout | Gallery + Sidebar (2-col) | Gallery (top) + Sidebar (below) | Gallery (top) + Sidebar (below) |
| Image gallery | Main + 5 thumbnails grid | Main + 4 thumbnails | Horizontal swipe carousel |
| Booking sidebar | Fixed right column | Full width below gallery | Full width, sticky CTA at bottom |
| Tab navigation | Inline tabs | Inline tabs | Horizontal scroll tabs |
| Service menu | Full table | Full table | Card list |
| Review list | List (wide) | List | List (full width) |
| Nearby shops | 4 columns | 2 columns | Horizontal scroll |

#### Storyboard: Shop Detail

```
[1] /shop/{slug} → ISR (revalidate 60s). Full shop data loaded.

[2] Image gallery → click thumbnail to swap main image.
    "+12개 더보기" → open fullscreen gallery lightbox.

[3] Open/Close tag computed client-side:
    - Compare shop.operating_hours against current time in KST (Appendix B of FSD)
    - Display open_tag (default "영업중") or close_tag (default "영업종료")

[4] Tab navigation → switch content area (SPA-style, no page reload).
    Default tab: 가격&코스

[5] "리뷰 작성+" click:
    [5a] Guest → redirect to login page
    [5b] Logged in → open Review Write Modal (§6.2)
    [5c] Locked account → error message (F-REV-05)

[6] "전화 예약하기" → tel: link
    "문자 예약하기" → sms: link

[7] "지도에서 위치보기" → Kakao Map static image (MVP), link to Kakao Map

[8] Nearby shop card click → navigate to that shop's detail page
```

---

## 6. Pages — Review

### 6.1 Review Feed (`/[locale]/reviews`)

> FSD: §11.2, F-REV-07~10

#### Screen Structure

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  [Search Tab Bar — "방문 후기" active]                             │
├──────────────────────────────────────────────────────────────────┤
│  전체 방문 후기  15,240                                           │
│  ★★★★★ 4.6                                                      │
│  [5★ ████████████████ 75%]                                      │
│  [4★ ████████       15%]                                        │
│  [3★ ████           6%]                                         │
│  [2★ ██             3%]                                         │
│  [1★ █              1%]                                         │
├──────────┬───────────────────────────────────────────────────────┤
│  FILTER  │  REVIEW LIST                                          │
│  (left)  │  ┌──────────────────────────────────────────┐        │
│          │  │ 👤 스웨디시매니아  2026.05.20  ★★★★★     │        │
│ 평점      │  │ 🏪 골드문 스웨디시                        │        │
│ ☐ 5 Stars│  │ 관리사님이 정말 친절하시고 마사지 실력이...│        │
│ ☐ 4 Stars│  │ 👍 도움이 돼요 24                         │        │
│ ☐ 3 Stars│  └──────────────────────────────────────────┘        │
│          │  ┌──────────────────────────────────────────┐        │
│ 정렬      │  │ 👤 힐링왕자  2026.05.19  ★★★★★          │        │
│ ● 최신순  │  │ ...                                      │        │
│ ○ 추천순  │  └──────────────────────────────────────────┘        │
│ ○ 별점순  │                                                      │
│          │  [후기 더보기 (4/15,240)]                              │
│ 지역선택  │                                                      │
│ [시/도 ▾]│                                                      │
│ [시군구▾]│                                                      │
└──────────┴───────────────────────────────────────────────────────┘
```

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Rating distribution | Horizontal bar chart | Same | Same (compact) |
| Filter panel | Left sidebar | Left sidebar (collapsible) | Bottom Sheet |
| Review cards | Wide list | Wide list | Full-width cards |

### 6.2 Review Write Modal

> FSD: §11.1, F-REV-01~06

```
┌──────────────────────────────────────────────┐
│  방문 리뷰 작성                           [✕] │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │ [Thumb] 쉬다 파트너샵                   │  │
│  │         골드문 스웨디시 & 테라피         │  │
│  │         📍 서울 동대문구                 │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  서비스는 어떠셨나요?                         │
│  ★ ★ ★ ★ ☆                                 │
│  "최고예요! 추천합니다."                      │
│                                              │
│  상세 후기 작성                               │
│  ┌────────────────────────────────────────┐  │
│  │ (textarea placeholder)                 │  │
│  │                                0 / 500 │  │  ← FSD: 10-500 chars
│  └────────────────────────────────────────┘  │
│  ⓘ 부적절한 후기는 관리자에 의해 삭제될 수 있습니다  │
│                                              │
│  [취소하기]              [리뷰 등록하기]       │
└──────────────────────────────────────────────┘
```

**Note**: Figma shows 0/1000 character limit. Per FSD (source of truth), the limit is **10–500 characters** (F-REV-03).

| Tier | Display |
|---|---|
| Desktop | Center modal with dim overlay |
| Tablet | Center modal |
| Mobile | Bottom Sheet (full width, slide up) |

### 6.3 Review Success Modal

```
┌──────────────────────────────────────┐
│                [✕]                    │
│        🎁 (icon)                     │
│                                      │
│   리뷰 작성이 완료되었습니다!          │
│   소중한 리뷰를 남겨주셔서 감사합니다.  │
│                                      │
│              [확인]                   │
└──────────────────────────────────────┘
```

**Note**: Figma shows "리뷰 작성 포인트 500P가 적립되었습니다" — point system is not in PRD/FSD MVP scope. Omit for MVP.

### 6.4 Review Report

> FSD: §11.3, F-REV-11~14

- **Trigger**: "Report" button on each review card
- **Auth**: Login required
- **Flow**: Click report → reason selection dropdown (spam, fake, inappropriate, irrelevant, other) → submit → confirmation toast
- **Duplicate**: If already reported, button disabled + "이미 신고한 리뷰입니다"
- **Display**: Inline dropdown or small modal per tier

---

## 7. Pages — Board System

> **Note**: Board system is NOT in the current FSD. These specs are derived from Figma frames with functional details inferred from the Figma designs. A corresponding FSD update is recommended.

### 7.1 Shop Recommendation Board (`/[locale]/board/recommendation`)

#### Screen Structure

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  Sub-nav: [샵추천 (active)] [마사지정보] [커뮤니티]                │
├──────────────────────────────────────────────────────────────────┤
│  FEATURED BANNER (carousel)                                      │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  에디터 픽                                             │       │
│  │  이번 주 가장 핫한 강남 스웨디시 샵 더 힐 테라피         │       │
│  │  [읽어보기 →]                                          │       │
│  └──────────────────────────────────────────────────────┘       │
├──────────────────────────────────────────────────────────────────┤
│  샵 추천 게시판                                                   │
│  전문가가 추천하는 최고의 샵들을 확인하세요.                        │
│  Region Filter: [전체] [서울] [경기] [부산] [대구] [기타]          │
├──────────────────────────────────────────────────────────────────┤
│  POST GRID (3 columns)                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                         │
│  │ [Image]  │ │ [Image]  │ │ [Image]  │                         │
│  │ Title    │ │ Title    │ │ Title    │                         │
│  │ Location │ │ Location │ │ Location │                         │
│  │ Date     │ │ Date     │ │ Date     │                         │
│  │ Excerpt  │ │ Excerpt  │ │ Excerpt  │                         │
│  └──────────┘ └──────────┘ └──────────┘                         │
│                                                                  │
│  [Pagination]                                                    │
└──────────────────────────────────────────────────────────────────┘
```

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Post grid | 3 columns | 2 columns | 1 column |
| Region filter | Inline tabs | Inline tabs | Horizontal scroll |
| Featured banner | Large | Medium | Compact |

### 7.2 Massage Info Board (`/[locale]/board/info`)

#### Screen Structure

Forum-style list layout (no image cards).

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  Sub-nav: [샵추천] [마사지정보 (active)] [커뮤니티]                │
├──────────────────────────────────────────────────────────────────┤
│  Sort: [최신순 (active)] [인기순] [댓글많은순]                     │
├──────────────────────────────────────────────────────────────────┤
│  POST LIST                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [실전팁] 🔥HOT                                2026.03.19│   │
│  │ 초보자도 실패 없는 스웨디시 샵 구별법 5가지                 │   │
│  │ 마사지 커뮤니티에서 활동하면서 가장 많이 받은 질문 중...    │   │
│  │ 👤 관리자    👁 1,242  👍 84  💬 23                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [실전팁]                                      2026.03.19│   │
│  │ 허리 통증이 심한데 스포츠랑 타이 중 어떤 게 나올까요?      │   │
│  │ ...                                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [Pagination]                                                    │
└──────────────────────────────────────────────────────────────────┘
```

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Post list | Wide list | Wide list | Full-width cards |
| Stats (views/likes/comments) | Inline right | Inline right | Below excerpt |

### 7.3 Board Post Detail (`/[locale]/board/[type]/[id]`)

#### Screen Structure

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  Sub-nav: [샵추천] [마사지정보 (active)] [커뮤니티]                │
│  Breadcrumb: 마사지정보 > 게시글 상세                              │
├──────────────────────────────────────────────────────────────────┤
│  [실전 팁] badge                                                  │
│  초보자도 실패 없는 스웨디시 샵 구별법                              │
│  👤 힐링마스터_K                                                  │
│  2024.05.15 · 조회 12,540        👁 4,521  👍 128  💬 23         │
├──────────────────────────────────────────────────────────────────┤
│  POST BODY (rich text + images)                                  │
│  ...                                                             │
├──────────────────────────────────────────────────────────────────┤
│  EMBEDDED SHOP CARD (for shop recommendation posts)              │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ [Logo] 더 힐 테라피 (The Hill Therapy)  [예약 바로가기]│       │
│  │ 서울 강남구 • 매일 09:00~01:00 (연중무휴)              │       │
│  │ #주차가능 #샤워가능 #수면가능 #커플                     │       │
│  └──────────────────────────────────────────────────────┘       │
├──────────────────────────────────────────────────────────────────┤
│  이 글이 도움이 되셨나요?                                         │
│  [👍 좋아요 128]                                                 │
│  [목록으로]                                                       │
├──────────────────────────────────────────────────────────────────┤
│  COMMENT SECTION                                                 │
│  [따뜻한 댓글을 남겨주세요.]                        [등록하기]     │
│                                                                  │
│  댓글 24                                                         │
│  ┌────────────────────────────────────────────────────┐         │
│  │ 👤 마사지매니아  2시간 전                            │         │
│  │ 와 여기 가보고 싶었는데 상세한 리뷰 감사합니다!       │         │
│  └────────────────────────────────────────────────────┘         │
│  [댓글 더보기 (15)]                                               │
├──────────────────────────────────────────────────────────────────┤
│  RELATED POSTS (for shop recommendation type — 3-col)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                         │
│  │ Related1 │ │ Related2 │ │ Related3 │                         │
│  └──────────┘ └──────────┘ └──────────┘                         │
├──────────────────────────────────────────────────────────────────┤
│  [Footer]                                                        │
└──────────────────────────────────────────────────────────────────┘
```

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Post body max width | 800px centered | Padding 24px | Padding 16px |
| Embedded shop card | Inline card | Full width | Full width |
| Related posts | 3 columns | 2 columns | Horizontal scroll |
| Comment input | Full width | Full width | Sticky bottom |

---

## 8. Pages — Community

> **Note**: Community is NOT in the current FSD. These specs are derived from Figma frames. A corresponding FSD update is recommended.

### 8.1 Community Feed (`/[locale]/community`)

#### Screen Structure

```
Desktop (3-column layout)
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  Sub-nav: [샵추천] [마사지정보] [커뮤니티 (active)]                │
├──────────┬───────────────────────────────────┬────────────────────┤
│  USER    │  POST CREATION                    │  SIDEBAR           │
│  PROFILE │  ┌────────────────────────────┐   │  ┌──────────────┐ │
│  ┌─────┐│  │ 마사지 경험을 커뮤니티와     │   │  │ 이번 주 인기샵│ │
│  │ 👤  ││  │ 공유해보세요!               │   │  │ 라온테라피    │ │
│  │Lv.3 ││  │ [📷 사진] [🎬 동영상]      │   │  │ 명가 타이     │ │
│  │쉬다  ││  │              [게시하기]     │   │  │ 수 힐링 케어  │ │
│  ├─────┤│  └────────────────────────────┘   │  └──────────────┘ │
│  │보유  ││                                   │                    │
│  │3200P ││  POST FEED                        │  ┌──────────────┐ │
│  ├─────┤│  ┌────────────────────────────┐   │  │ 쉬다 앱 다운  │ │
│  │내글  ││  │ 👤 힐링마스터 Lv.5  15분전 │   │  │ 만원 할인 받기│ │
│  │12    ││  │ 강남구 역삼동              │   │  └──────────────┘ │
│  │좋아요 ││  │ (post content + image)     │   │                    │
│  │45    ││  │ ♡ 24  💬 8                │   │                    │
│  ├─────┤│  └────────────────────────────┘   │                    │
│  │전체글││  ┌────────────────────────────┐   │                    │
│  │내글  ││  │ 👤 마사지덕후 Lv.2         │   │                    │
│  │이달  ││  │ ...                        │   │                    │
│  │베스트││  └────────────────────────────┘   │                    │
│  └─────┘│                                   │                    │
└──────────┴───────────────────────────────────┴────────────────────┘
```

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Layout | 3-column (profile + feed + sidebar) | 2-column (feed + sidebar, profile in drawer) | 1-column (feed only) |
| User profile | Left sidebar | Drawer/collapsed | Hidden or top bar |
| Post creation | Inline above feed | Inline | FAB (floating action button) → Bottom Sheet |
| Popular shops sidebar | Right column | Right column | Hidden or horizontal scroll below feed |
| App promo | Right column below shops | Right column | Hidden |

### 8.2 Community Post Detail

Same structure as Board Post Detail (§7.3) but with:
- User profile sidebar (left, Desktop only)
- Popular shops sidebar (right, Desktop only)
- Post content area in center column

### 8.3 Post Creation

- **Trigger**: Post creation box on community feed
- **Auth**: Login required
- **Fields**: Text content, photo upload, video upload (optional), hashtags
- **Submit**: "게시하기" button
- **Mobile**: FAB → Bottom Sheet with creation form

---

## 9. Pages — Events & Notices

> **Note**: Events pages are NOT in the current FSD. These specs are derived from Figma frames. A corresponding FSD update is recommended.

### 9.1 Events & Notices Hub (`/[locale]/events`)

#### Screen Structure

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  이벤트 & 공지사항                                                │
├──────────────────────────────────────────────────────────────────┤
│  📌 중요 공지사항                                                 │
│  ┌───────────────────────────┐ ┌───────────────────────────┐    │
│  │ [공지] 쉬다 리뉴얼 기념... │ │ [공지] 개인정보처리방침... │    │
│  │ 2024.05.15                │ │ 2024.05.10                │    │
│  └───────────────────────────┘ └───────────────────────────┘    │
│  ┌───────────────────────────┐ ┌───────────────────────────┐    │
│  │ [공지] 서비스 이용 약관... │ │ [공지] 불건전 업체 신고... │    │
│  └───────────────────────────┘ └───────────────────────────┘    │
├──────────────────────────────────────────────────────────────────┤
│  🎉 진행중인 이벤트                                [전체보기 >]   │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │ [이벤트] [D-12]      │ │ [이벤트] [D-DAY]     │                │
│  │ [Banner Image]      │ │ [Banner Image]      │                │
│  │ 신규 가입하고 1만원...│ │ 후기 작성하고 기프티콘│                │
│  │ 2024.05.01-05.31    │ │ 2024.04.15-05.20    │                │
│  └─────────────────────┘ └─────────────────────┘                │
├──────────────────────────────────────────────────────────────────┤
│  📋 공지사항 및 게시글                                            │
│  TABLE                                                           │
│  No.  | 카테고리 | 제목                    | 작성일    | 조회수   │
│  📌   | 공지    | 마짱 리뉴얼 기념 포인트..  | 2024.05.15| 1,245  │
│  📌   | 공지    | 개인정보처리방침 개정...   | 2024.05.10| 856    │
│  124  | 일반    | 이용 후기 작성 시 주의...  | 2024.05.18| 42     │
│  ...                                                             │
│  [Pagination]                                                    │
└──────────────────────────────────────────────────────────────────┘
```

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Important notices | 2×2 grid cards | 2×2 grid | 1-column list |
| Event cards | 2 columns | 2 columns | 1 column |
| Notice table | Full table | Compact table | Card list |

### 9.2 All Ongoing Events (`/[locale]/events/ongoing`)

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  Breadcrumb: 이벤트 & 공지사항 > 진행중인 이벤트                   │
├──────────┬───────────────────────────────────────────────────────┤
│  EVENT   │  HERO EVENT BANNER (carousel)                         │
│  CATEGORY│  ┌─────────────────────────────────────────────┐      │
│  (left)  │  │  HOT EVENT                                  │      │
│          │  │  여름 맞이 힐링 프로젝트                      │      │
│  전체이벤트│ └─────────────────────────────────────────────┘      │
│  신규오픈 │                                                       │
│  마감임박 │  진행 중인 이벤트 48             [최신순] [인기순]      │
│  쿠폰혜택 │  ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  당첨자발표│  │[진행중]   │ │[진행중]   │ │[진행중]   │              │
│          │  │[D-12]    │ │[D-5]     │ │[D-21]    │              │
│          │  │ [Image]  │ │ [Image]  │ │ [Image]  │              │
│          │  │ Title    │ │ Title    │ │ Title    │              │
│          │  │ Date     │ │ Date     │ │ Date     │              │
│          │  │ 👁 1,240 │ │ 👁 3,562 │ │ 👁 892   │              │
│          │  │ ♡ 84     │ │ ♡ 245   │ │ ♡ 56    │              │
│          │  └──────────┘ └──────────┘ └──────────┘              │
│          │                                                       │
│          │  [Pagination]                                         │
└──────────┴───────────────────────────────────────────────────────┘
```

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Category sidebar | Left sidebar | Collapsible or horizontal tabs | Horizontal scroll tabs |
| Event grid | 3 columns | 2 columns | 1 column |

### 9.3 Event Detail (`/[locale]/events/[id]`)

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  Breadcrumb: 이벤트 & 공지사항 > 진행중인 이벤트 > 이벤트 상세     │
├──────────────────────────────────────────────────────────────────┤
│  EVENT BANNER (full width)                                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │ [진행중] [D-12]                                       │       │
│  │ 신규 가입하고 첫 방문 시 1만원 즉시 할인!              │       │
│  │ 2024.05.01 ~ 2024.05.31                              │       │
│  └──────────────────────────────────────────────────────┘       │
├──────────────────────────────────────────────────────────────────┤
│  EVENT TITLE + META                                              │
│  신규 가입 이벤트                                                 │
│  👤 힐링마스터_K  2024.05.15  👁 4,521  👍 128  💬 23            │
├──────────────────────────────────────────────────────────────────┤
│  EVENT BODY (rich text + images)                                 │
│  ...                                                             │
├──────────────────────────────────────────────────────────────────┤
│  ⓘ 이벤트 유의사항                                               │
│  (bulleted rules list)                                           │
├──────────────────────────────────────────────────────────────────┤
│  이 글이 도움이 되셨나요?  [👍 좋아요 128]                        │
│  [목록으로]                                                       │
├──────────────────────────────────────────────────────────────────┤
│  다른 이벤트 보기 (2-col related events)                          │
├──────────────────────────────────────────────────────────────────┤
│  [Footer]                                                        │
└──────────────────────────────────────────────────────────────────┘
```

### 9.4 Notice Detail (`/[locale]/events/notice/[id]`)

Same structure as Board Post Detail (§7.3) without:
- Embedded shop card
- Related posts replaced with prev/next navigation

```
├──────────────────────────────────────────────────────────────────┤
│  ← 다음글  서비스 정기 점검 안내 (2024년 6월 1일)    2024.05.28  │
│  → 이전글  부적절한 후기 작성 시 제재 안내            2024.05.10  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10. Pages — Auth

### 10.1 Login (`/[locale]/auth/login`)

> FSD: §3.1, F-AUTH-01~06

#### Screen Structure

```
Desktop (split-screen layout)
┌──────────────────────────────┬───────────────────────────────────┐
│  BRAND PANEL (left, orange)  │  LOGIN FORM (right, white)        │
│                              │                                   │
│  쉬다                        │  로그인                            │
│                              │  소셜 계정으로 간편하게 로그인하세요 │
│  [Hero Image]                │                                   │
│                              │  [카카오 로그인]  ← yellow bg      │
│  전국 마사지 최저가, 쉬다      │  [네이버 로그인]  ← green bg       │
│                              │                                   │
│  🏢 전국 8,000+ 제휴 업소 보유│  아이디/비밀번호 찾기 | 회원가입    │
│  🎁 매일 쏟아지는 이벤트와 쿠폰│  ─────── OR ──────                │
│  ⭐ 실제 방문자 100% 리얼 후기 │  [비회원 예약 조회]                │
│                              │                                   │
│                              │  로그인 시 이용약관 및 개인정보처리  │
│                              │  방침에 동의하는 것으로 간주합니다.  │
│                              │                                   │
│                              │  Terms of Service  Privacy Policy │
│                              │  Customer Support                 │
└──────────────────────────────┴───────────────────────────────────┘
```

**Note**: FSD specifies email/password login (F-AUTH-01) + Kakao (F-AUTH-02) + Naver (F-AUTH-03). Figma shows social login only (no email form on the login page itself). Per FSD source-of-truth: include email login option alongside social login.

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Layout | Split-screen (brand + form) | Split-screen (narrower brand panel) | Single column (brand banner top + form below) |
| Brand panel | 50% width | 40% width | Compact banner |

#### Storyboard: Login

```
[1] /auth/login → CSR page. If already logged in → redirect to homepage (F-AUTH-05).

[2a] Kakao Login → redirect to Kakao OAuth → callback → JWT stored → redirect to previous page
[2b] Naver Login → redirect to Naver OAuth → callback → JWT stored → redirect to previous page
[2c] Email Login → form validation → submit to backend → session stored → redirect

[3] Locked account → error message: "계정이 정지되었습니다." (F-AUTH-06)

[4] "아이디/비밀번호 찾기" → ID Recovery / Password Reset flows (§10.4, §10.5)
[5] "회원가입" → Sign Up page (§10.2)
```

### 10.2 Sign Up (`/[locale]/auth/signup`)

> FSD: §3.1, F-AUTH-04

#### Screen Structure

```
Desktop (split-screen layout)
┌──────────────────────────────┬───────────────────────────────────┐
│  BRAND PANEL (left, orange)  │  SIGNUP FORM (right, white)       │
│                              │                                   │
│  반갑습니다!                  │  회원가입                          │
│  쉬다와 함께하는 즐거운       │  쉬다의 다양한 서비스를 만나보세요  │
│  힐링 라이프                  │                                   │
│                              │  아이디 (이메일)                    │
│  [Hero Image]                │  [📧 example@email.com          ] │
│                              │                                   │
│  🎁 무료 쿠폰 혜택            │  비밀번호                          │
│  📡 주변 샵 실시간 확인        │  [🔒 ●●●●●●●●                  ] │
│  ⭐ 실제 방문 리뷰             │                                   │
│                              │  비밀번호 확인                      │
│                              │  [🔒 ●●●●●●●●                  ] │
│                              │                                   │
│                              │  이름/닉네임                        │
│                              │  [👤 Display name               ] │
│                              │                                   │
│                              │  ☐ 전체 동의하기                    │
│                              │    ☐ 이용약관 동의 (필수)      >    │
│                              │    ☐ 개인정보 수집 동의 (필수)  >    │
│                              │                                   │
│                              │  [회원가입 완료]                    │
│                              │                                   │
│                              │  이미 계정이 있으신가요? [로그인]   │
└──────────────────────────────┴───────────────────────────────────┘
```

**FSD Fields**: Email (required), Password (min 6 chars), Display Name (2–20 chars, unique)

**Figma additions not in FSD** (noted for future): Phone number + SMS verification, 위치정보 서비스 이용약관 consent. These are deferred per FSD source-of-truth.

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Layout | Split-screen | Split-screen (narrower brand) | Single column |

### 10.3 Sign Up Success Modal

```
┌──────────────────────────────────────┐
│                [✕]                    │
│        🎉 (celebration icon)         │
│                                      │
│   반갑습니다, 홍길동님!               │
│   마짱의 회원행 되신 것을 환영합니다.  │
│   지금 바로 내 주변 마사지 샵을       │
│   확인해보세요.                       │
│                                      │
│          [홈으로 가기]                │
│       [✈ 내 주변 샵 보기]             │
└──────────────────────────────────────┘
```

**Note**: Figma shows welcome coupon (3,000 KRW) — coupon system is not in FSD/PRD MVP scope. Omit for MVP.

### 10.4 Password Reset (`/[locale]/auth/reset-password`)

> **Note**: Not in current FSD. Derived from Figma frame.

#### Screen Structure

```
Desktop (split-screen layout)
┌──────────────────────────────┬───────────────────────────────────┐
│  BRAND PANEL (left, orange)  │  RESET FORM (right, white)        │
│                              │                                   │
│  Swida                       │  비밀번호 재설정                    │
│  새로운 비밀번호를 설정해주세요│  새로 사용할 비밀번호를 입력해주세요│
│  더욱 안전하게 마짱을 이용하실│                                   │
│  수 있습니다.                 │  새 비밀번호                       │
│                              │  [🔒 ●●●●●●●●                  ] │
│  [Lock/Reset icon]           │  ✅ 8자 이상  ⊘ 영문/숫자/특수문자 │
│                              │                                   │
│                              │  비밀번호 확인                      │
│                              │  [🔒 ●●●●●●●●                  ] │
│                              │                                   │
│                              │  [비밀번호 변경하기]                │
│                              │                                   │
│                              │  ← 로그인으로 돌아가기              │
└──────────────────────────────┴───────────────────────────────────┘
```

### 10.5 ID Recovery Modal

> **Note**: Not in current FSD. Derived from Figma frame.

```
┌──────────────────────────────────────┐
│                                [✕]   │
│        👤🔍 (icon)                   │
│                                      │
│   계정 정보 찾기 결과                  │
│   입력하신 정보와 일치하는 계정입니다.  │
│                                      │
│   ┌──────────────────────────────┐   │
│   │  가입 이메일 ID               │   │
│   │  maj***@email.com            │   │
│   │  📅 가입일: 2023.10.15        │   │
│   └──────────────────────────────┘   │
│                                      │
│   ⓘ 보안을 위해 아이디의 일부를       │
│     마스킹 처리하였습니다.            │
│                                      │
│          [로그인하러 가기]            │
│          [비밀번호 찾기]              │
└──────────────────────────────────────┘
```

---

## 11. Pages — Partnership

### 11.1 Partnership Landing + Form (`/[locale]/partnership`)

> FSD: §12, F-PART-01~04

#### Screen Structure

```
Desktop
┌──────────────────────────────────────────────────────────────────┐
│  [Header]                                                        │
│  [Search Tab Bar — "업소 제휴" active]                             │
├──────────────────────────────────────────────────────────────────┤
│  HERO SECTION (dark bg)                                          │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  B2B Partnership                                      │       │
│  │  쉬다와 함께 성장하세요                                │       │
│  │  월간 200만 명의 고객이 마짱을 통해 당신의 서비스를     │       │
│  │  기다립니다.                                           │       │
│  │  [🔗 제휴 신청하기]  [💬 카카오톡 상담]                 │       │
│  └──────────────────────────────────────────────────────┘       │
├──────────────────────────────────────────────────────────────────┤
│  STATS ROW (4 columns)                                           │
│  [8,000+ 제휴 업소 수] [200만+ 월간 방문자] [★4.5 실방문자 평점] [5년+ 안정적 운영] │
├──────────────────────────────────────────────────────────────────┤
│  BENEFITS SECTION                                                │
│  쉬다 파트너만의 특별한 혜택                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                         │
│  │ 무료등록  │ │ 예약관리  │ │ 할인지원  │                         │
│  │ 입점비 없│ │ 스마트한  │ │ 플랫폼 차원│                         │
│  │ 는 자유로│ │ 대시보드  │ │ 의 프로모션│                         │
│  │ 운 등록  │ │ 관리     │ │ 노출     │                         │
│  └──────────┘ └──────────┘ └──────────┘                         │
├──────────────────────────────────────────────────────────────────┤
│  INQUIRY FORM (card, centered)                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  제휴 신청                                             │       │
│  │  전문 상담관이 영업일 기준 24시간 내에 연락드립니다.      │       │
│  │                                                        │       │
│  │  업소명 [________]        대표자 성함 [________]        │       │
│  │  연락처 [________]        지역 [▾ 지역 선택]            │       │
│  │  상세 내용 [____________________________]               │       │
│  │                                                        │       │
│  │  [💬 카톡으로 상담하기]    [🔗 제휴 신청하기]            │       │
│  └──────────────────────────────────────────────────────┘       │
├──────────────────────────────────────────────────────────────────┤
│  상담 문의                                                       │
│  📞 010-9799-4456                                                │
│  평일 10:00~18:00 (점심시간 12:00~13:00) / 토, 일, 공휴일 휴무    │
├──────────────────────────────────────────────────────────────────┤
│  [Footer]                                                        │
└──────────────────────────────────────────────────────────────────┘
```

**FSD Form Fields**: Shop Name (required), Contact Person (required), Phone Number (required), Email (optional), Address (required), Business Type (optional), Preferred Contact Channel (required), Message (optional)

**Figma form** is simplified (업소명, 대표자 성함, 연락처, 지역, 상세내용). Per FSD source of truth, include all FSD-specified fields.

#### Tier Adaptations

| Item | Desktop | Tablet | Mobile |
|---|---|---|---|
| Hero section | Full width, large text | Full width, medium | Full width, compact |
| Stats row | 4 columns | 2×2 grid | 1 column or 2×2 |
| Benefits | 3 columns | 3 columns | 1 column |
| Form fields | 2 columns | 2 columns | 1 column stack |

### 11.2 Partnership Success Modal

```
┌──────────────────────────────────────┐
│        ✅ (check icon)               │
│                                      │
│   제휴 신청이 완료되었습니다!          │
│   담당자가 확인 후 영업일 기준         │
│   24시간 이내에 연락드리겠습니다.      │
│                                      │
│   쉬다와 함께하는 성장의 시작을        │
│   환영합니다.                         │
│                                      │
│              [확인]                   │
└──────────────────────────────────────┘
```

---

## 12. Navigation Access Paths

| Feature | Desktop | Tablet | Mobile |
|---|---|---|---|
| Detail Search | Header "샵 검색 ▾" → dropdown OR Tab Bar | Drawer → 샵 검색 section OR Tab Bar | Bottom Nav "검색" |
| Theme Search | Header dropdown OR Tab Bar | Drawer OR Tab Bar | Bottom Nav "검색" → switch tab |
| Location Search | Header dropdown OR Tab Bar | Drawer OR Tab Bar | Bottom Nav "검색" → switch tab |
| Nearby Search | Tab Bar | Tab Bar | Bottom Nav "내주변" |
| Review Feed | Tab Bar | Tab Bar | Bottom Nav → Drawer |
| Shop Recommendation | Header "게시판 ▾" → dropdown | Drawer → 게시판 | Bottom Nav "게시판" |
| Massage Info | Header "게시판 ▾" → dropdown | Drawer → 게시판 | Bottom Nav "게시판" → tab |
| Community | Header "게시판 ▾" → dropdown | Drawer → 게시판 | Bottom Nav "게시판" → tab |
| Events & Notices | Header "이벤트" | Drawer → 이벤트 | Drawer |
| Partnership | Header "제휴문의" OR Tab Bar | Drawer OR Tab Bar | Drawer |
| Login | Header "로그인" | Header "로그인" | Header "로그인" or Drawer |
| Sign Up | Header "회원가입" | Drawer | Drawer |
| Language Switch | Header (ko/en toggle) | Drawer | Drawer |
| Quick Search | Header search bar | Header search bar | Drawer or search page |

---

## 13. State-Based Screen Branching

### 13.1 Auth States

| State | Header Display | Accessible Pages | Restricted Action |
|---|---|---|---|
| Guest | 로그인 / 회원가입 buttons | All pages (browse only) | Review submit/report → redirect to login |
| Active (logged in) | User avatar 👤 | All pages + review submission | Login/signup → redirect to homepage |
| Locked/Suspended | User avatar 👤 | All pages (browse only) | Review submit/report → error: "계정이 정지되었습니다." |

#### Storyboard: Guest → Protected Action

```
[1] Guest attempts protected action (e.g., "리뷰 작성")
[2] → Redirect to login page (/[locale]/auth/login)
[3] → Successful login
[4] → Redirect back to the page where the action was attempted (F-AUTH-05)
```

### 13.2 Data States

| State | Treatment |
|---|---|
| Loading | Skeleton UI (gray placeholder blocks matching content layout) |
| Data empty | Empty state icon + message + suggestion (e.g., "검색 결과가 없습니다") |
| Error | Toast notification + retry button |
| End of list | "더 이상 데이터가 없습니다" or load-more button with remaining count |

### 13.3 i18n Fallback

| Condition | Treatment |
|---|---|
| English content unavailable | Display Korean version + indicator: "This content is not yet translated" (F-I18N-07) |
| Language switcher | Available in header (Desktop) and Drawer (Tablet/Mobile). Links to equivalent page in alternate locale. |

---

## 14. Conflict Resolution Log

All conflicts between Figma designs and FSD are resolved with **FSD as source of truth**.

| # | Item | Figma | FSD | Resolution | Notes |
|---|---|---|---|---|---|
| C-01 | Review character limit | 0/1000 | 10–500 characters | **Use FSD: 10–500** | Figma limit appears to be placeholder |
| C-02 | Favorites / heart icon | ♡ on shop cards + detail | PRD §12: "Future" | **Excluded from MVP** | Remove heart icons from all shop cards |
| C-03 | Price range slider filter | 0~20만원+ slider | Not in FSD filter list | **Deferred** | Note as future enhancement |
| C-04 | PREMIUM / BEST badges | On shop card thumbnails | Not specified | **Deferred** | Requires admin-side badge assignment |
| C-05 | Member pricing (회원가) | Original→member price | FSD: `price_range` text only | **Use FSD** | Display price_range text as-is |
| C-06 | Booking CTA split | "전화 예약" / "문자 예약" | `booking_url_phone` single field | **Use FSD** | Single booking CTA |
| C-07 | Sort options | 추천순, 가격 낮은순 | Rating, Review count, Newest | **Use FSD** | 3 sort options as specified |
| C-08 | Signup phone + SMS verification | Phone field + 인증요청 | Email + password + display name | **Use FSD** | Phone/SMS deferred |
| C-09 | Password requirements | 영문/숫자/특수문자 8자+ | Min 6 characters (backend default) | **Use FSD** | Recommend upgrading to Figma's rule in future |
| C-10 | Review points (500P) | Review success modal shows points | Not in PRD/FSD | **Excluded from MVP** | Point system is future scope |
| C-11 | Welcome coupon (3,000 KRW) | Signup success modal shows coupon | Not in PRD/FSD | **Excluded from MVP** | Coupon system is future scope |
| C-12 | User level/points | Lv.3, 보유 포인트 3200P | Not in PRD customer model | **Excluded from MVP** | Gamification is future scope |
| C-13 | Navigation structure | Header dropdowns (샵검색▾, 게시판▾) | FSD §15.2 has 6 inline nav items | **Use Figma nav pattern** | Dropdown nav is cleaner for header; Tab Bar provides inline access. Exception to FSD-first rule — layout decision. |
| C-14 | "비회원 예약 조회" | On login page | Not in FSD | **Deferred** | Non-member booking lookup is future scope |
| C-15 | App download promo | In community sidebar | Not in FSD | **Deferred** | No mobile app in MVP |

---

> **Document End**
>
> This UI/UX Specification should be reviewed alongside the FSD and updated when new features are added. Sections §7 (Board), §8 (Community), §9 (Events), §10.4 (Password Reset), and §10.5 (ID Recovery) require corresponding FSD updates before implementation.
