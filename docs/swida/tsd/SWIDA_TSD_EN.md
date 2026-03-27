---
title: "SWIDA — Technical Specification Document (TSD)"
sidebar_label: "TSD (EN)"
sidebar_position: 1
---

# SWIDA — Technical Specification Document (TSD)

> **Version:** 1.1.0
> **Date:** March 25, 2026
> **Status:** Draft
> **Based on:** SWIDA PRD v1.1 (updated — Admin Web as primary admin interface, Strapi admin panel developer-only)
> **Author:** Engineering Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Technology Stack & Version Matrix](#2-technology-stack--version-matrix)
3. [Architecture Overview](#3-architecture-overview)
4. [Database Design](#4-database-design)
5. [Strapi Backend — Content Types & API Contracts](#5-strapi-backend--content-types--api-contracts)
6. [Frontend Architecture — Customer Web (Next.js)](#6-frontend-architecture--customer-web-nextjs)
7. [Infrastructure & DevOps](#7-infrastructure--devops)
8. [Security Architecture](#8-security-architecture)
9. [Caching Strategy](#9-caching-strategy)
10. [Internationalization (i18n)](#10-internationalization-i18n)
11. [SEO Strategy](#11-seo-strategy)
12. [Testing Strategy](#12-testing-strategy)
13. [Monitoring & Observability](#13-monitoring--observability)
14. [Appendix](#14-appendix)

---

## 1. Introduction

### 1.1 Purpose

This Technical Specification Document (TSD) translates the SWIDA Product Requirements Document (PRD) into concrete architectural decisions, technology choices, database schemas, API contracts, and infrastructure configurations required to build and deploy the SWIDA platform.

### 1.2 Scope

The TSD covers the MVP implementation of SWIDA — a massage and wellness shop discovery platform for the South Korean market. It encompasses the Strapi CMS backend (headless API-only), the Next.js Customer Web (customer-facing frontend), the Next.js Admin Web (admin-facing frontend), PostgreSQL + PostGIS database layer, supporting infrastructure (Nginx, Redis, MinIO), and the Cloudflare edge layer. Strapi's built-in admin panel is restricted to developers for monitoring and debugging only.

### 1.3 Conventions

- **Domain placeholders:** `{{DOMAIN}}` (e.g., `swida.com`), `{{ADMIN_DOMAIN}}` (e.g., `admin.swida.com`), `{{API_DOMAIN}}` (e.g., `api.swida.com`)
- **Environment references:** `development`, `staging`, `production`
- All times referenced are in **KST (Korea Standard Time, UTC+9)** unless stated otherwise

---

## 2. Technology Stack & Version Matrix

### 2.1 Architecture Alignment with PRD

The PRD specifies Strapi as a **headless API-only backend** with a **custom Next.js admin web application (Admin Web)** as the primary admin interface. Strapi's built-in admin panel is **restricted to developers only** for monitoring, debugging, and emergency operations — it is not used for day-to-day platform management. Both the customer-facing and admin-facing frontends are Next.js applications. This eliminates the React 18 (Strapi admin) vs React 19 (Next.js 16) version conflict and allows the entire frontend stack to run on the latest versions.

### 2.2 Pinned Versions

All versions are selected for LTS status, active security support, mutual compatibility, and non-deprecated status as of March 2026.

| Technology | Version | LTS / Support Until | Notes |
|---|---|---|---|
| **Node.js** | `24.11.0` | Active LTS → April 2028 | Latest Active LTS. Strapi v5 supports Node 20, 22, 24. Native TypeScript type-stripping stable. npm v11 included. |
| **pnpm** | `10.x` (latest 10.x stable) | Active | Workspace protocol for monorepo. Pin via `packageManager` in root `package.json` using Corepack. |
| **Turborepo** | `2.x` (latest 2.x stable) | Active | Monorepo build orchestrator with remote caching. |
| **Strapi** | `5.39.0` | Active (v5 latest stable) | Headless API-only — built-in admin panel restricted to developers for monitoring/debugging only. |
| **Next.js** | `16.2.1` | Active (latest stable) | Latest stable as of March 2026. Turbopack stable by default. All RSC CVEs patched (see §2.4). |
| **React** | `19.2.4` | Active (latest stable) | Shared across both Admin Web and Customer Web. Includes all RSC security patches. |
| **TypeScript** | `5.9.x` | Active | Latest stable. Shared across all workspaces via `tsconfig` base in `packages/`. |
| **PostgreSQL** | `17.9` | Supported → November 2029 | Latest patch of PG 17 stable. PG 18 is available but PostGIS ecosystem is more proven on 17. |
| **PostGIS** | `3.6.2` | Active | Compatible with PostgreSQL 14–18. Required for nearby search (`ST_Distance`, `ST_DWithin`). |
| **Redis** | `7.4.x` | Active LTS | API response caching at origin. |
| **MinIO** | `RELEASE.2026-03-xx` (latest stable) | Rolling releases | S3-compatible object storage for shop images. Pin to a specific `RELEASE` tag in Docker. |
| **Nginx** | `1.26.x` (latest stable) | Stable branch | Reverse proxy at origin. |
| **Docker** | `27.x` | Active | Container runtime. |
| **Docker Compose** | `2.x` | Active | Multi-container orchestration for development and production. |
| **next-intl** | `4.8.3` | Active | Path-based i18n routing for Next.js. Compatible with Next.js 16.x since v4.4. |
| **Tailwind CSS** | `4.x` (latest stable) | Active | Next.js 16 scaffolds Tailwind v4 by default. Uses `@tailwindcss/postcss`. |
| **Headless UI** | `2.2.9` | Active | Unstyled accessible components. Compatible with React 19. |
| **Nodemailer** | `7.x` (latest stable) | Active | Transactional email delivery for password reset, notifications. Configured with SMTP provider (e.g., AWS SES, SendGrid, or self-hosted SMTP). Provider selection is a deployment decision — Nodemailer abstracts the transport. |

### 2.3 Key Version Decisions & Rationale

**Why Next.js 16.2.1 (latest):**

Since both the Admin Web and Customer Web are custom Next.js applications, and Strapi runs headless (API-only), there is no React version conflict. Next.js 16.2.1 ships with React 19.2.x, Turbopack stable by default, significantly faster dev startup (~87% faster than 16.1), and all RSC security patches. The `16.2.1` release includes fixes for CVE-2026-23864 and all prior RSC CVEs (see §2.4).

**Why Node.js 24 LTS:**

Node.js 24 is the current Active LTS (EOL April 2028) and the recommended choice for new projects in 2026. It includes npm v11 (65% faster installs), native TypeScript type-stripping (stable), and V8 engine upgrades. Strapi v5 officially supports Node 24. Node 24 uses OpenSSL 3.5 with security level 2 by default, providing stronger cryptographic defaults.

**Why Tailwind CSS v4 instead of v3:**

Next.js 16 scaffolds Tailwind v4 by default and uses `@tailwindcss/postcss` instead of the legacy PostCSS plugin. Tailwind v4 features a new engine, CSS-first configuration, and significantly faster build times. Since this is a greenfield project, there are no migration concerns.

**Why PostgreSQL 17 instead of 18:**

PostgreSQL 18 is available (18.3 as of Feb 2026), but PostGIS 3.6.2 Docker images for PG 18 are newer and less battle-tested. PG 17.9 is the latest patch and has full PostGIS 3.6.2 support with extensive production validation.

### 2.4 Compatibility Matrix

```
Node.js 24.11.0
├── Strapi 5.39.0 ✓ (supports Node 20/22/24)
├── Next.js 16.2.1 ✓ (supports Node 20.9+)
├── pnpm 10.x ✓ (supports Node 18+)
└── Turborepo 2.x ✓ (supports Node 18+)

React 19.2.4
├── Next.js 16.2.1 ✓ (ships with React 19.x)
├── next-intl 4.8.3 ✓ (supports React 18+, Next.js 16 since v4.4)
├── Headless UI 2.2.9 ✓ (supports React 19)
└── Tailwind CSS 4.x ✓ (CSS framework, React-agnostic)

PostgreSQL 17.9
├── PostGIS 3.6.2 ✓ (supports PG 14–18)
├── Strapi 5.39.0 ✓ (supports PG via Knex.js)
└── pg_trgm extension ✓ (built-in PG contrib)
```

### 2.5 Security Advisories — React Server Components (Critical)

The React Server Components (RSC) protocol used by Next.js App Router has been the target of multiple critical and high-severity vulnerabilities since December 2025. These directly affect both SWIDA's Admin Web and Customer Web (Next.js with App Router). All patched versions below are **mandatory minimums** — never deploy an unpatched version.

| CVE | Severity | CVSS | Description | Disclosed | Patched in (16.x) |
|---|---|---|---|---|---|
| CVE-2025-55182 | **Critical** | 10.0 | Remote Code Execution via unsafe deserialization in RSC Flight protocol | 2025-12-03 | `16.0.7` |
| CVE-2025-66478 | **Critical** | 10.0 | Next.js-specific tracking of CVE-2025-55182 | 2025-12-03 | `16.0.7` |
| CVE-2025-55184 | **High** | 7.5 | DoS — infinite loop via crafted HTTP request to any App Router endpoint | 2025-12-11 | `16.0.10` |
| CVE-2025-67779 | **High** | 7.5 | Incomplete fix for CVE-2025-55184 — requires re-upgrade | 2025-12-11 | `16.0.10` |
| CVE-2025-55183 | **Medium** | 5.3 | Source code exposure — Server Functions return compiled source including hardcoded secrets | 2025-12-11 | `16.0.10` |
| CVE-2026-23864 | **High** | 7.5 | DoS — memory exhaustion / excessive CPU via crafted HTTP requests to Server Function endpoints | 2026-01-26 | `16.0.11` / **`16.1.5`** / **`16.2.1`** |

**SWIDA pinned version: `next@16.2.1`** — includes fixes for all six CVEs above plus `react@19.2.4` which addresses the underlying React-level vulnerabilities.

**Key facts for SWIDA's deployment:**

- **All CVEs are pre-authentication** — no credentials needed to exploit, making WAF-level protection essential (Cloudflare WAF managed rulesets cover these).
- **App Router is required for exploitation** — Pages Router is not affected. SWIDA uses App Router for both Admin Web and Customer Web, so all endpoints are in scope.
- **Cloudflare WAF mitigation:** Cloudflare has deployed managed WAF rules for CVE-2025-55182 and CVE-2026-23864. Ensure Cloudflare Managed Rulesets are enabled (see §7.4). WAF rules provide defense-in-depth but are **not a substitute for patching**.
- **Hardcoded secrets risk (CVE-2025-55183):** SWIDA must never hardcode secrets in Server Components or Server Actions. All secrets must be in environment variables accessed at runtime — already enforced by the TSD's environment variable strategy (§14.1).
- **Ongoing vigilance:** The RSC protocol has been subject to iterative vulnerability disclosures (initial fix → bypass → re-fix pattern). The team must subscribe to Next.js security advisories and the React blog for future disclosures, and treat RSC-related CVEs as emergency patches with 24–48 hour deployment targets.

**Upgrade verification command:**

```bash
# Verify installed Next.js version includes all patches
npx next --version  # Must be >= 16.2.1
# Verify React version includes all RSC patches
npm ls react react-dom  # Must be >= 19.2.4
# Verify no vulnerable React RSC packages
npm ls react-server-dom-webpack react-server-dom-turbopack 2>/dev/null
```

---

## 3. Architecture Overview

### 3.1 High-Level Architecture

```
                        ┌──────────────────────────────┐
                        │        Cloudflare Edge       │
                        │  DNS, CDN, WAF, DDoS, SSL    │
                        └──────────────┬───────────────┘
                                       │
                        ┌──────────────▼───────────────┐
                        │      Nginx (Reverse Proxy)    │
                        │   Origin access: CF IPs only  │
                        └──┬──────────┬──────────┬──┬──┘
                           │          │          │  │
              ┌────────────▼──┐ ┌─────▼──────┐ ┌▼──▼────────┐
              │  Strapi CMS   │ │ Customer   │ │  Admin     │
              │ (Headless     │ │ Web        │ │  Web       │
              │  API-only)    │ │ (Next.js)  │ │ (Next.js)  │
              │  Port: 1337   │ │ Port: 3000 │ │ Port: 3001 │
              └───────┬───────┘ └─────┬──────┘ └────────────┘
                      │               │
              ┌───────▼───────┐ ┌─────▼──────┐  ┌───────────┐
              │  PostgreSQL   │ │   Redis    │  │   MinIO   │
              │  + PostGIS    │ │  (Cache)   │  │ (S3-compat│
              │  Port: 5432   │ │ Port: 6379 │  │  Storage) │
              └───────────────┘ └────────────┘  │ Port: 9000│
                                                └───────────┘
```

### 3.2 Domain Routing (Nginx)

| Domain | Upstream | Purpose |
|---|---|---|
| `{{DOMAIN}}` (www) | Next.js Customer Web `:3000` | Customer-facing web app |
| `{{API_DOMAIN}}` | Strapi `:1337/api` | Public REST API (consumed by both frontends) |
| `{{ADMIN_DOMAIN}}` | Next.js Admin Web `:3001` | Custom admin dashboard and management |

### 3.3 Data Flow

**Read path (customer browsing):**
`Customer Browser → Cloudflare Edge Cache → Nginx → Next.js (SSR/ISR) → Strapi REST API → Redis Cache → PostgreSQL`

**Write path (review submission):**
`Customer Browser → Cloudflare → Nginx → Next.js (API route / server action) → Strapi REST API → PostgreSQL → Redis Cache Invalidation`

**Admin path (shop management):**
`Admin Browser → Cloudflare → Nginx → Admin Web (Next.js) → Strapi Admin API → PostgreSQL`

**Developer path (monitoring/debugging via Strapi built-in admin panel):**
`Developer Browser → VPN/IP-Whitelist → Nginx → Strapi Built-in Admin Panel → PostgreSQL`

**Image path:**
`Customer Browser → Cloudflare CDN → Nginx (cache proxy) → MinIO`

---

## 4. Database Design

### 4.1 Overview

Strapi v5 manages the database schema automatically via its content-type definitions (JSON schema files under `src/api/*/content-types/*/schema.json`). The schemas below represent the logical data model that maps to Strapi's auto-generated PostgreSQL tables. Direct schema manipulation is not recommended — all changes flow through Strapi's Content-Type Builder or schema JSON files.

### 4.2 PostGIS Setup

PostGIS must be enabled on the database before Strapi starts. This is handled in the database initialization script:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For future fuzzy search
```

The `postgis/postgis:17-3.6` Docker image ships with PostGIS pre-installed and auto-creates the extension on first boot.

### 4.3 Entity Relationship Diagram (Logical)

```
┌─────────┐     1:N     ┌───────────┐
│  Region │─────────────│  District  │
└─────────┘             └─────┬─────┘
                              │ 1:N
                        ┌─────▼─────┐      M:N     ┌─────────┐
                        │   Shop    │──────────────│  Theme  │
                        └──┬──┬─────┘              └─────────┘
                           │  │ 1:N
              ┌────────────┘  └──────────────┐
              │ 1:N                          │ M:N
        ┌─────▼─────┐               ┌───────▼───────┐
        │  Review   │               │ User Bookmark │
        └─────┬─────┘               └───────┬───────┘
              │ N:1                          │ N:1
        ┌─────▼─────────────┐────────────────┘
        │  User (customer)  │
        └──┬──┬──┬──────────┘
           │  │  │ 1:N
   ┌───────┘  │  └───────────────┐
   │ 1:N      │ 1:N              │ 1:N
┌──▼──────┐ ┌─▼──────┐  ┌───────▼──────┐
│Community│ │Comment │  │  Post Like   │
│  Post   │ │(poly)  │  │  (poly)      │
└─────────┘ └────────┘  └──────────────┘

Comment targets (polymorphic):
  Board Post, Community Post, Event

Post Like targets (polymorphic):
  Board Post, Community Post, Event

┌──────────────┐     ┌──────────────┐
│  Board Post  │     │    Event     │
│ (admin)      │     │  (admin)     │
└──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────────┐
│    Notice    │     │ User Points Log  │
│ (admin)      │     │                  │
└──────────────┘     └──────────────────┘

┌───────────────────────┐
│  Partnership Inquiry  │ ──(optional)──→ Shop
└───────────────────────┘

┌───────────────────────┐
│      Audit Log        │
└───────────────────────┘
```

### 4.4 Core Tables (Strapi-Managed)

Below are the logical schemas. Strapi auto-generates the actual SQL tables, column names (snake_case), junction tables for M:N relations, and component tables.

#### 4.4.1 `regions`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | Auto-generated |
| document_id | varchar | Unique, Not Null | Strapi v5 document identifier |
| name | varchar(100) | Not Null | Localized (i18n): 서울특별시, Seoul |
| locale | varchar(10) | Not Null | `ko`, `en` |
| created_at | timestamptz | Not Null | Auto |
| updated_at | timestamptz | Not Null | Auto |
| published_at | timestamptz | Nullable | Draft & Publish |

#### 4.4.2 `districts`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| name | varchar(100) | Not Null | Localized: 강남구, Gangnam-gu |
| region_id | integer | FK → regions.id | Belongs to one Region |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | |

#### 4.4.3 `themes`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| name | varchar(100) | Not Null | Localized: 스웨디시, Swedish |
| slug | varchar(100) | Unique, Not Null | Auto from name |
| display_order | integer | Nullable | Sort priority |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | |

**Media:** `icon` — single media relation (optional)

#### 4.4.4 `shops`

The core entity. Fields are split across the main table and embedded component tables.

**Main table fields:**

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| name | varchar(255) | Not Null | Localized |
| slug | varchar(255) | Unique, Not Null | UID from name |
| description | text | Not Null | Max 500 chars (app-level validation) |
| address | varchar(500) | Not Null | Localized |
| latitude | decimal(10,7) | Not Null | GPS coordinate |
| longitude | decimal(10,7) | Not Null | GPS coordinate |
| phone_number | varchar(20) | Nullable | |
| operating_hours | jsonb | Not Null | Structured per-day schedule (see format below). Not localized — times are universal. |
| operating_hours_text | varchar(200) | Nullable | Localized. Free-text display override for irregular hours (e.g., "공휴일 휴무", "연중무휴"). When set, displayed instead of computed schedule. |
| last_order_time | varchar(100) | Nullable | |
| closed_days | varchar(200) | Not Null | Localized |
| holiday_exceptions | text | Nullable | Localized |
| price_range | varchar(50) | Nullable | |
| booking_required | boolean | Not Null | Default: false |
| booking_url_phone | varchar(255) | Nullable | |
| gender_availability | varchar(20) | Nullable | Enum: all, female_only, male_only, couple_available |
| languages_supported | jsonb | Nullable | Array of language codes |
| last_verified_date | date | Nullable | |
| inactive_reason | varchar(20) | Nullable | Enum: closed, owner_request, violation, stale, other |
| inactive_reason_detail | text | Nullable | Free-text for "other" |
| open_tag | varchar(50) | Nullable | Custom label, default: 영업중 |
| close_tag | varchar(50) | Nullable | Custom label, default: 영업종료 |
| average_rating | decimal(3,2) | Not Null, Default 0 | Computed via lifecycle hooks |
| total_reviews | integer | Not Null, Default 0 | Computed via lifecycle hooks |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | Controls visibility |

**Relations:**
- `region_id` → FK to `regions` (many-to-one)
- `district_id` → FK to `districts` (many-to-one)
- `themes` → M:N junction table `shops_themes_lnk`
- `images` → Strapi media (multiple), stored in `files` table
- `thumbnail` → Strapi media (single)

**Embedded Components (separate tables managed by Strapi):**
- `shop_service_menu_items` — repeatable component
- `shop_amenities` — single component
- `shop_contact_channels` — single component

#### 4.4.5 `reviews`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| rating | integer | Not Null | CHECK: 1–5 |
| comment | text | Not Null | 10–500 chars (app-level) |
| status | varchar(20) | Not Null, Default 'published' | Enum: published, hidden, under_review, deleted |
| moderation_reason | varchar(20) | Nullable | Enum: spam, inappropriate, fake_review, irrelevant, other |
| report_count | integer | Not Null, Default 0 | |

> **Note:** `moderation_reason` values (set by admin: `spam`, `inappropriate`, `fake_review`, `irrelevant`, `other`) differ from user report reasons (submitted via `POST /api/reviews/:id/report`: `spam`, `fake`, `inappropriate`, `irrelevant`, `other`). Note `fake` (user report) vs `fake_review` (admin moderation). Report reasons are not stored on the review record — they are sent as part of the report request body (PRD §8.5).
| author_id | integer | FK → up_users.id | |
| shop_id | integer | FK → shops.id | |
| published_at | timestamptz | Nullable | |

**No i18n** — reviews are stored in the language they were written.

#### 4.4.6 `partnership_inquiries`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| shop_name | varchar(255) | Not Null | |
| contact_person | varchar(100) | Not Null | |
| phone_number | varchar(20) | Not Null | |
| email | varchar(255) | Nullable | |
| address | varchar(500) | Not Null | |
| business_type | varchar(100) | Nullable | |
| preferred_contact_channel | varchar(20) | Not Null | Enum: phone, kakaotalk, instagram, email |
| message | text | Nullable | |
| status | varchar(20) | Not Null, Default 'new' | Enum: new, contacted, awaiting_info, approved, rejected, published |
| source | varchar(20) | Not Null | Enum: website_form, email, kakaotalk, instagram |
| admin_notes | text | Nullable | Not exposed via public API |
| linked_shop_id | integer | FK → shops.id, Nullable | |

#### 4.4.7 `audit_logs`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| content_type | varchar(100) | Not Null | e.g., `api::shop.shop` |
| document_id | varchar | Not Null | ID of the modified document |
| action | varchar(20) | Not Null | `create`, `update`, `delete`, `publish`, `unpublish` |
| admin_user_id | integer | FK → admin_users.id | Who made the change |
| field_diffs | jsonb | Nullable | `{ field: { before, after } }` |
| created_at | timestamptz | Not Null | |

#### Extending `up_users` (Strapi Users & Permissions)

Additional fields on the existing Strapi user model:

| Column | Type | Constraints | Notes |
|---|---|---|---|
| avatar | relation | Nullable | Strapi media (single). Profile photo. Max 5MB, JPG/PNG/WebP. |
| total_points | integer | Not Null, Default 0 | Computed: SUM of user_points_log.points. Updated via lifecycle hook. |
| email_verified | boolean | Not Null, Default false | Set to `true` when user clicks the verification link. Social login users are auto-verified. |
| email_verification_token | varchar | Nullable, Unique | Cryptographically random token sent in verification email. Cleared after verification. |
| email_verification_sent_at | timestamptz | Nullable | Timestamp of last verification email. Used for resend rate-limiting (1 per minute). |

**Level derivation (computed, not stored):**
- 0P → Lv.1, 500P → Lv.2, 2,000P → Lv.3, 5,000P → Lv.4, 10,000P → Lv.5

Existing fields reused: `username` (display name), `email`, `created_at` (member since).

#### 4.4.8 `board_posts`

Admin-curated board posts for shop recommendations and massage information.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | Auto-generated |
| document_id | varchar | Unique, Not Null | Strapi v5 document identifier |
| type | varchar(20) | Not Null | Enum: `recommendation`, `info` |
| title | varchar(255) | Not Null | Localized (i18n) |
| body | text | Not Null | Rich text, localized |
| excerpt | varchar(500) | Nullable | Localized. Auto-generated from body if empty. |
| category | varchar(50) | Nullable | Badge label (e.g., "실전팁", "초보가이드") |
| author_name | varchar(100) | Not Null | Admin display name (not FK — admins create via Strapi) |
| is_featured | boolean | Not Null, Default false | Shown in featured banner carousel |
| is_hot | boolean | Not Null, Default false | Admin-set HOT badge |
| view_count | integer | Not Null, Default 0 | Incremented on page view |
| like_count | integer | Not Null, Default 0, CHECK >= 0 | Computed via lifecycle hooks |
| comment_count | integer | Not Null, Default 0 | Computed via lifecycle hooks |
| locale | varchar(10) | Not Null | `ko`, `en` |
| published_at | timestamptz | Nullable | Draft & Publish |
| created_at | timestamptz | Not Null | Auto |
| updated_at | timestamptz | Not Null | Auto |

**Relations:**
- `region_id` → FK to `regions` (many-to-one, nullable — for region filtering)
- `linked_shop_id` → FK to `shops` (many-to-one, nullable — recommendation posts only)
- `featured_image` → Strapi media (single)

#### 4.4.9 `community_posts`

User-generated community posts.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| content | text | Not Null | 1–2,000 characters (app-level) |
| hashtags | jsonb | Nullable | Array of strings, max 10, each max 30 chars |
| location_text | varchar(200) | Nullable | Free-text location (e.g., "강남구 역삼동") |
| view_count | integer | Not Null, Default 0 | |
| like_count | integer | Not Null, Default 0, CHECK >= 0 | Computed via lifecycle hooks |
| comment_count | integer | Not Null, Default 0 | Computed via lifecycle hooks |
| status | varchar(20) | Not Null, Default 'published' | Enum: `published`, `hidden`, `deleted` |
| author_id | integer | FK → up_users.id | Not Null |
| created_at | timestamptz | Not Null | |
| updated_at | timestamptz | Not Null | |

**Relations:**
- `photos` → Strapi media (multiple, max 5, max 5MB each, JPG/PNG/WebP)
- `video` → Strapi media (single, nullable, max 50MB, MP4/MOV)

**No i18n** — community posts are stored in the language they were written (same as reviews).

#### 4.4.10 `comments`

Shared polymorphic comment system for board posts, community posts, and events.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| content | text | Not Null | 1–500 characters (app-level) |
| parent_type | varchar(50) | Not Null | Polymorphic: `board_post`, `community_post`, `event` |
| parent_id | integer | Not Null | ID of the parent entity |
| reply_to_id | integer | FK → comments.id, Nullable | For 1-level nested replies only |
| author_id | integer | FK → up_users.id | Not Null |
| created_at | timestamptz | Not Null | |

**No i18n** — comments stored in language written.

**Constraint:** `reply_to_id` must reference a comment with the same `parent_type` and `parent_id`. Application-level validation prevents deeper nesting (reply to a reply).

#### 4.4.11 `events`

Admin-managed time-limited events/campaigns.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| title | varchar(255) | Not Null | Localized (i18n) |
| body | text | Not Null | Rich text, localized |
| category | varchar(30) | Not Null | Enum: `new_opening`, `closing_soon`, `coupon`, `winner_announcement`, `general` |
| start_date | date | Not Null | Event start (KST) |
| end_date | date | Not Null | Event end (KST). Used for D-day calculation. |
| disclaimers | text | Nullable | Localized. Event rules/conditions. |
| is_featured | boolean | Not Null, Default false | Shown in hero banner carousel |
| view_count | integer | Not Null, Default 0 | |
| like_count | integer | Not Null, Default 0, CHECK >= 0 | Computed via lifecycle hooks |
| author_name | varchar(100) | Not Null | Admin display name |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | |
| created_at | timestamptz | Not Null | |
| updated_at | timestamptz | Not Null | |

**Relations:**
- `banner_image` → Strapi media (single) — full-width detail banner
- `featured_image` → Strapi media (single) — card thumbnail

**D-Day Countdown (computed, not stored):**
- `end_date > today(KST)` → D-N
- `end_date = today(KST)` → D-DAY
- `end_date < today(KST)` → 마감 (Closed)

#### 4.4.12 `notices`

Admin-published announcements.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| title | varchar(255) | Not Null | Localized (i18n) |
| body | text | Not Null | Rich text, localized |
| category | varchar(20) | Not Null | Enum: `notice`, `general` |
| is_important | boolean | Not Null, Default false | Pinned to top with 📌 |
| view_count | integer | Not Null, Default 0 | |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | |
| created_at | timestamptz | Not Null | |
| updated_at | timestamptz | Not Null | |

No comments, no likes on notices.

#### 4.4.13 `user_bookmarks`

Junction table for user ↔ shop bookmarks.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| user_id | integer | FK → up_users.id, Not Null | |
| shop_id | integer | FK → shops.id, Not Null | |
| created_at | timestamptz | Not Null | For "most recently bookmarked" sort |

**Unique constraint:** `(user_id, shop_id)` — prevents duplicate bookmarks.

#### 4.4.14 `user_points_log`

Point transaction history for gamification.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| user_id | integer | FK → up_users.id, Not Null | |
| action | varchar(30) | Not Null | Enum: `post_created`, `comment_created`, `like_received` |
| points | integer | Not Null | +50, +10, or +5 |
| reference_type | varchar(50) | Not Null | `community_post`, `comment`, `post_like` |
| reference_id | integer | Not Null | ID of the triggering entity |
| created_at | timestamptz | Not Null | For daily limit tracking |

**Daily limit enforcement:** `comment_created` actions capped at 10 per user per day (check `COUNT WHERE action='comment_created' AND user_id=X AND created_at >= today`).

#### 4.4.15 `post_likes`

Junction table tracking who liked what (polymorphic).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| user_id | integer | FK → up_users.id, Not Null | |
| target_type | varchar(50) | Not Null | `board_post`, `community_post`, `event` |
| target_id | integer | Not Null | ID of the liked entity |
| created_at | timestamptz | Not Null | |

**Unique constraint:** `(user_id, target_type, target_id)` — one like per user per target.

#### 4.4.16 `rating_recalc_queue`

Retry queue for failed shop rating recalculations (see §5.3.3). Ensures a failed recalculation does not leave `average_rating` permanently stale.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | Auto-generated |
| shop_id | integer | FK → shops.id, Not Null | Shop whose rating needs recalculation |
| attempts | integer | Not Null, Default 0 | Number of retry attempts so far |
| max_attempts | integer | Not Null, Default 5 | Configurable ceiling |
| last_error | text | Nullable | Most recent error message / stack trace |
| next_retry_at | timestamptz | Not Null | When the next retry should be attempted |
| created_at | timestamptz | Not Null | Auto |
| resolved_at | timestamptz | Nullable | Set when recalculation finally succeeds |

**Index:** `CREATE INDEX idx_recalc_queue_pending ON rating_recalc_queue (next_retry_at) WHERE resolved_at IS NULL;`

### 4.5 Indexes

Beyond Strapi's auto-generated indexes (PKs, FKs, unique constraints), the following custom indexes should be created via a Strapi bootstrap script or migration:

```sql
-- Geospatial index for nearby search (critical for performance)
CREATE INDEX idx_shops_geography ON shops
  USING GIST (ST_MakePoint(longitude, latitude)::geography);

-- Full-text / fuzzy search preparation
CREATE INDEX idx_shops_name_trgm ON shops
  USING GIN (name gin_trgm_ops);

-- Composite index for filtered queries
CREATE INDEX idx_shops_published_rating ON shops (published_at, average_rating DESC)
  WHERE published_at IS NOT NULL;

-- Review queries by shop
CREATE INDEX idx_reviews_shop_status ON reviews (shop_id, status, created_at DESC);

-- District lookup by region
CREATE INDEX idx_districts_region ON districts (region_id);
```

Additional indexes for new tables:

| Table | Columns | Type | Purpose |
|---|---|---|---|
| board_posts | `(type, published_at DESC)` | B-tree | Board list queries by type |
| board_posts | `(region_id, type)` | B-tree | Region filter on recommendations |
| board_posts | `(is_featured, type)` | Partial (where is_featured=true) | Featured banner query |
| community_posts | `(author_id, created_at DESC)` | B-tree | "My posts" filter |
| community_posts | `(status, created_at DESC)` | B-tree | Feed query |
| comments | `(parent_type, parent_id, created_at)` | B-tree | Comment list for a post |
| events | `(category, end_date DESC)` | B-tree | Category + active filter |
| events | `(is_featured, end_date)` | Partial (where is_featured=true) | Hero banner query |
| notices | `(is_important DESC, published_at DESC)` | B-tree | Pinned-first notice list |
| user_bookmarks | `(user_id, created_at DESC)` | B-tree | User's bookmark list |
| user_bookmarks | `(user_id, shop_id)` | Unique | Prevent duplicate bookmarks |
| user_points_log | `(user_id, action, created_at)` | B-tree | Daily limit check |
| post_likes | `(user_id, target_type, target_id)` | Unique | Prevent duplicate likes |
| post_likes | `(target_type, target_id)` | B-tree | Count likes for a target |
| partnership_inquiries | `(shop_name, phone_number, created_at)` | B-tree | Deduplication lookup within time window |

### 4.6 Seed Data

Pre-seeded at launch via Strapi bootstrap scripts (`database/seeds/`):

- **Regions:** All 17 시/도 (metropolitan cities + provinces) of South Korea, in both `ko` and `en` locales
- **Districts:** All 시/군/구 under each region (~250 entries), both locales
- **Themes:** 9 initial massage themes (see PRD §9.3), both locales

---

## 5. Strapi Backend — Content Types & API Contracts

### 5.1 Content Type Summary

| Content Type | API ID | Type | i18n | Draft & Publish |
|---|---|---|---|---|
| Shop | `api::shop.shop` | Collection | Yes | Yes |
| Review | `api::review.review` | Collection | No | Yes |
| Theme | `api::theme.theme` | Collection | Yes | Yes |
| Region | `api::region.region` | Collection | Yes | Yes |
| District | `api::district.district` | Collection | Yes | Yes |
| Partnership Inquiry | `api::partnership-inquiry.partnership-inquiry` | Collection | No | No |
| Audit Log | `api::audit-log.audit-log` | Collection | No | No |
| Board Post | `api::board-post.board-post` | Collection | Yes | Yes |
| Community Post | `api::community-post.community-post` | Collection | No | No |
| Comment | `api::comment.comment` | Collection | No | No |
| Event | `api::event.event` | Collection | Yes | Yes |
| Notice | `api::notice.notice` | Collection | Yes | Yes |
| User Bookmark | `api::user-bookmark.user-bookmark` | Collection | No | No |
| User Points Log | `api::user-points-log.user-points-log` | Collection | No | No |
| Post Like | `api::post-like.post-like` | Collection | No | No |

**Components:**

| Component | Namespace | Type |
|---|---|---|
| Service Menu Item | `shop.service-menu-item` | Repeatable |
| Amenities | `shop.amenities` | Single |
| Contact Channels | `shop.contact-channels` | Single |

### 5.2 REST API Endpoints

All public endpoints serve published content only (Strapi v5 default behavior). Locale is passed as `?locale=ko` or `?locale=en`.

#### 5.2.1 Shops

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/shops` | Public | List shops (paginated, filterable, sortable) |
| GET | `/api/shops/:documentId` | Public | Single shop detail |
| GET | `/api/shops/nearby` | Public | **Custom controller** — geospatial nearby search |

> **Note:** The Customer Web uses slug-based routes (`/[locale]/shop/[slug]`), so it fetches shop detail via `GET /api/shops?filters[slug][$eq]={slug}&locale={locale}` rather than by `documentId`. The `documentId`-based endpoint is used by the Admin Web and internal references.

**GET `/api/shops` — Query Parameters:**

```
?locale=ko
&filters[region][documentId][$eq]=abc123
&filters[district][documentId][$eq]=def456
&filters[themes][documentId][$in][0]=ghi789
&filters[amenities][parking_available][$eq]=true
&filters[booking_required][$eq]=false
&filters[name][$containsi]=스웨디시
&sort=average_rating:desc
&pagination[page]=1
&pagination[pageSize]=20
&populate[thumbnail][fields][0]=url
&populate[thumbnail][fields][1]=alternativeText
&populate[themes][fields][0]=name
&populate[themes][fields][1]=slug
&populate[district][fields][0]=name
&fields[0]=name
&fields[1]=slug
&fields[2]=average_rating
&fields[3]=total_reviews
&fields[4]=address
```

**Response shape (list):**

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "name": "힐링스파 강남",
      "slug": "healing-spa-gangnam",
      "average_rating": 4.5,
      "total_reviews": 23,
      "address": "서울 강남구 ...",
      "thumbnail": { "url": "/uploads/thumb.jpg", "alternativeText": "..." },
      "themes": [{ "name": "스웨디시", "slug": "swedish" }],
      "district": { "name": "강남구" }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "pageCount": 3,
      "total": 42
    }
  }
}
```

**GET `/api/shops/nearby` — Custom Controller:**

```
?lat=37.5665
&lng=126.9780
&radius=5000          // meters, default 5000, min 1000, max 10000
&locale=ko
&pagination[page]=1
&pagination[pageSize]=20
```

Response includes a `distance` field (meters) on each shop. Sorted by distance ascending.

**Implementation:** Custom controller at `src/api/shop/controllers/shop.ts` executes raw PostGIS SQL via Knex:

```typescript
// Simplified — full implementation in codebase
const shops = await strapi.db.connection.raw(`
  SELECT s.*, ST_Distance(
    ST_MakePoint(s.longitude, s.latitude)::geography,
    ST_MakePoint(?, ?)::geography
  ) AS distance
  FROM shops s
  WHERE s.published_at IS NOT NULL
    AND ST_DWithin(
      ST_MakePoint(s.longitude, s.latitude)::geography,
      ST_MakePoint(?, ?)::geography,
      ?
    )
  ORDER BY distance ASC
  LIMIT ? OFFSET ?
`, [lng, lat, lng, lat, radius, pageSize, offset]);
```

**Custom route registration** at `src/api/shop/routes/shop.ts`:

```typescript
export default {
  routes: [
    {
      method: 'GET',
      path: '/shops/nearby',
      handler: 'shop.nearby',
      config: { auth: false },
    },
  ],
};
```

#### 5.2.2 Reviews

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews` | Public | List published reviews (feed) |
| POST | `/api/reviews` | Customer (JWT) | Submit a new review |
| POST | `/api/reviews/:id/report` | Customer (JWT) | Report a review |

**POST `/api/reviews` — Request Body:**

```json
{
  "data": {
    "rating": 5,
    "comment": "정말 좋았습니다! 분위기도 좋고 마사지도 시원해요.",
    "shop": "abc123"
  }
}
```

The `author` is automatically set from the authenticated user's JWT. Validated by a custom policy that checks if the user's account is locked.

**Authenticated Review Response Enhancement:**

When the requesting user is authenticated, each review object in the `GET /api/reviews` response includes an additional field:

| Field | Type | Description |
|---|---|---|
| `reported_by_me` | boolean | `true` if the authenticated user has already reported this review, `false` otherwise |

Computed via `LEFT JOIN` on `review_reports` where `reporter_id = current_user` and `review_id = review.id`. This allows the frontend to disable the report button for already-reported reviews without a separate API call. When the user is not authenticated, this field is omitted.

#### 5.2.3 Themes, Regions, Districts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/themes` | Public | All published themes |
| GET | `/api/regions` | Public | All published regions |
| GET | `/api/districts?filters[region][documentId][$eq]=xxx` | Public | Districts filtered by region |

These are simple Strapi auto-generated endpoints with no custom controllers needed.

#### 5.2.4 Partnership Inquiries

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/partnership-inquiries` | Public | Submit inquiry (form) |

Public role permissions: `create` only. No `find`, `findOne`, `update`, `delete` for public role.

**Server-Side Deduplication:** Before creating a new inquiry, the custom controller checks whether an inquiry with the same `shop_name` + `phone_number` combination was created within the last 5 minutes. If a match is found, the server rejects the request with `409 Conflict`:

```json
{
  "error": {
    "status": 409,
    "name": "ConflictError",
    "message": "A similar inquiry was recently submitted. Please wait a few minutes before resubmitting."
  }
}
```

**Location:** `src/api/partnership-inquiry/controllers/partnership-inquiry.ts` (override default `create`)

#### 5.2.5 Dashboard Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Admin (JWT) | **Custom controller** — aggregated platform statistics |

**Location:** `src/api/dashboard/controllers/dashboard.ts`
**Route:** `src/api/dashboard/routes/dashboard.ts`

**Response Shape:**

```json
{
  "data": {
    "shops": { "total": 150, "published": 120, "draft": 30 },
    "reviews": { "total": 500, "published": 400, "hidden": 20, "under_review": 10, "deleted": 70 },
    "users": { "total": 300, "active": 280, "locked": 20 },
    "inquiries": { "total": 80, "new": 5, "contacted": 10, "awaiting_info": 8, "approved": 7, "rejected": 15, "published": 35 },
    "recent_activity": [
      { "type": "shop_published", "document_id": "abc123", "name": "힐링스파 강남", "admin": "admin@swida.com", "timestamp": "2026-03-25T14:30:00Z" }
    ]
  }
}
```

**Implementation:** Uses Strapi's Document Service API to run aggregation queries (`strapi.documents().count()`) across shops, reviews, users, and partnership inquiries. The `recent_activity` field queries the `audit-log` collection type for the latest 10 entries. This endpoint is restricted to authenticated admin users via the admin API JWT.

#### 5.2.6 Board Posts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/board-posts` | Public | List board posts (paginated, filterable, sortable) |
| GET | `/api/board-posts/:documentId` | Public | Single board post detail |

**GET `/api/board-posts` — Query Parameters:**

```
?locale=ko
&filters[type][$eq]=recommendation
&filters[region][documentId][$eq]=abc123
&filters[is_featured][$eq]=true
&sort=created_at:desc
&pagination[page]=1
&pagination[pageSize]=12
&populate[featured_image][fields][0]=url
&populate[featured_image][fields][1]=alternativeText
&populate[linked_shop][fields][0]=name
&populate[linked_shop][fields][1]=slug
&populate[region][fields][0]=name
```

**Response shape (list):**

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "bp001",
      "type": "recommendation",
      "title": "이번 주 가장 핫한 강남 스웨디시 샵",
      "excerpt": "전문가가 추천하는 최고의...",
      "category": "에디터 픽",
      "author_name": "SWIDA 에디터",
      "is_featured": true,
      "is_hot": false,
      "view_count": 1242,
      "like_count": 84,
      "comment_count": 23,
      "created_at": "2026-03-19T10:00:00Z",
      "featured_image": { "url": "/uploads/board1.jpg", "alternativeText": "..." },
      "linked_shop": { "name": "더 힐 테라피", "slug": "the-hill-therapy" },
      "region": { "name": "서울" }
    }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 12, "pageCount": 3, "total": 30 } }
}
```

**GET `/api/board-posts/:documentId` — Response (single):**

Same shape as list item but with full `body` (rich text) instead of `excerpt`, plus `linked_shop` populated with full shop card fields (name, slug, address, operating_hours, amenities).

#### 5.2.7 Community Posts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/community-posts` | Public | List community posts (feed) |
| GET | `/api/community-posts/:documentId` | Public | Single post detail |
| POST | `/api/community-posts` | Customer (JWT) | Create community post |

**GET `/api/community-posts` — Query Parameters:**

```
?filters[author][id][$eq]=42          // "my posts" filter
&filters[status][$eq]=published
&sort=created_at:desc                  // or like_count:desc for monthly best
&pagination[page]=1
&pagination[pageSize]=10
&populate[photos][fields][0]=url
&populate[author][fields][0]=username
&populate[author][fields][1]=total_points
```

**Response shape (list):**

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "cp001",
      "content": "강남 역삼동에 새로 오픈한 스웨디시 샵 다녀왔어요...",
      "hashtags": ["#강남마사지", "#스웨디시"],
      "location_text": "강남구 역삼동",
      "view_count": 320,
      "like_count": 24,
      "comment_count": 8,
      "created_at": "2026-03-27T08:15:00Z",
      "photos": [{ "url": "/uploads/photo1.jpg" }],
      "author": {
        "id": 42,
        "username": "힐링마스터",
        "total_points": 3200,
        "level": 3
      }
    }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 10, "pageCount": 5, "total": 48 } }
}
```

> **Note:** `level` is computed at response time from `total_points`, not stored.

**POST `/api/community-posts` — Request Body:**

```json
{
  "data": {
    "content": "오늘 방문한 마사지 샵 후기...",
    "hashtags": ["#마사지후기", "#강남"],
    "location_text": "강남구 역삼동"
  }
}
```

Photos and video are uploaded separately via Strapi's media upload endpoint, then linked in a follow-up PUT request (standard Strapi media workflow).

#### 5.2.8 Comments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/comments` | Public | List comments for a parent entity |
| POST | `/api/comments` | Customer (JWT) | Create comment or nested reply |

**GET `/api/comments` — Query Parameters:**

```
?filters[parent_type][$eq]=board_post
&filters[parent_id][$eq]=1
&filters[reply_to_id][$null]=true      // top-level comments only
&sort=created_at:asc
&pagination[page]=1
&pagination[pageSize]=20
&populate[author][fields][0]=username
&populate[author][fields][1]=total_points
&populate[replies][populate][author][fields][0]=username
```

**Response shape:**

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "cm001",
      "content": "와 여기 가보고 싶었는데 상세한 리뷰 감사합니다!",
      "parent_type": "board_post",
      "parent_id": 1,
      "reply_to_id": null,
      "created_at": "2026-03-27T10:30:00Z",
      "author": { "id": 10, "username": "마사지매니아", "total_points": 800, "level": 2 },
      "replies": [
        {
          "id": 2,
          "content": "저도 갈만한지 알려주세요!",
          "reply_to_id": 1,
          "created_at": "2026-03-27T11:00:00Z",
          "author": { "id": 15, "username": "쉬다", "total_points": 100, "level": 1 }
        }
      ]
    }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 20, "pageCount": 2, "total": 24 } }
}
```

**POST `/api/comments` — Request Body:**

```json
{
  "data": {
    "content": "좋은 정보 감사합니다!",
    "parent_type": "board_post",
    "parent_id": 1,
    "reply_to_id": null
  }
}
```

For a reply: set `reply_to_id` to the parent comment's ID. Server validates that the referenced comment shares the same `parent_type` and `parent_id`.

#### 5.2.9 Events & Notices

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/events` | Public | List events (filterable by category, sortable) |
| GET | `/api/events/:documentId` | Public | Single event detail |
| GET | `/api/notices` | Public | List notices (pinned first) |
| GET | `/api/notices/:documentId` | Public | Single notice detail with prev/next |

**GET `/api/events` — Query Parameters:**

```
?locale=ko
&filters[category][$eq]=new_opening
&filters[end_date][$gte]=2026-03-27    // only active/future events
&sort=end_date:asc                      // or like_count:desc for popular
&pagination[page]=1
&pagination[pageSize]=12
&populate[featured_image][fields][0]=url
```

**Response shape (event list):**

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "ev001",
      "title": "신규 가입하고 1만원 즉시 할인!",
      "category": "coupon",
      "start_date": "2026-05-01",
      "end_date": "2026-05-31",
      "is_featured": true,
      "view_count": 4521,
      "like_count": 128,
      "author_name": "SWIDA",
      "dday": "D-12",
      "featured_image": { "url": "/uploads/event1.jpg" }
    }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 12, "pageCount": 1, "total": 8 } }
}
```

> **Note:** `dday` is computed at response time using KST, not stored.

**GET `/api/notices` — Response includes `is_important` for pinned sorting:**

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "nt001",
      "title": "쉬다 리뉴얼 기념 포인트 2배 적립",
      "category": "notice",
      "is_important": true,
      "view_count": 1245,
      "published_at": "2026-05-15T00:00:00Z"
    }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 20, "pageCount": 1, "total": 15 } }
}
```

**GET `/api/notices/:documentId` — Single notice with prev/next:**

Custom controller adds `prev` and `next` fields:

```json
{
  "data": {
    "id": 1,
    "documentId": "nt001",
    "title": "쉬다 리뉴얼 기념 포인트 2배 적립",
    "body": "<p>Rich text content...</p>",
    "category": "notice",
    "is_important": true,
    "view_count": 1246,
    "published_at": "2026-05-15T00:00:00Z"
  },
  "prev": { "documentId": "nt002", "title": "서비스 정기 점검 안내", "published_at": "2026-05-28T00:00:00Z" },
  "next": { "documentId": "nt003", "title": "부적절한 리뷰 작성 시 제재 안내", "published_at": "2026-05-10T00:00:00Z" }
}
```

#### 5.2.10 Bookmarks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/bookmarks` | Customer (JWT) | List user's bookmarked shops (paginated) |
| POST | `/api/bookmarks` | Customer (JWT) | Add bookmark |
| DELETE | `/api/bookmarks/:id` | Customer (JWT) | Remove bookmark |

**GET `/api/bookmarks` — Query Parameters:**

```
?sort=created_at:desc
&pagination[page]=1
&pagination[pageSize]=12
&populate[shop][populate][thumbnail][fields][0]=url
&populate[shop][fields][0]=name
&populate[shop][fields][1]=slug
&populate[shop][fields][2]=address
&populate[shop][populate][themes][fields][0]=name
&populate[shop][populate][district][fields][0]=name
```

**Response shape:**

```json
{
  "data": [
    {
      "id": 1,
      "shop": {
        "documentId": "shop001",
        "name": "힐링스파 강남",
        "slug": "healing-spa-gangnam",
        "address": "서울 강남구 ...",
        "thumbnail": { "url": "/uploads/thumb.jpg" },
        "themes": [{ "name": "스웨디시" }],
        "district": { "name": "강남구" }
      },
      "created_at": "2026-03-27T14:00:00Z"
    }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 12, "pageCount": 1, "total": 5 } }
}
```

**POST `/api/bookmarks` — Request:**

```json
{ "data": { "shop": "shop001" } }
```

Server auto-sets `user_id` from JWT. Returns 409 if bookmark already exists.

**DELETE `/api/bookmarks/:id`** — Server validates the bookmark belongs to the authenticated user.

**POST `/api/bookmarks/toggle` — Idempotent Toggle:**

Atomic bookmark toggle endpoint. Uses UPSERT/DELETE pattern to avoid race conditions.

Request:
```json
{ "shop": "shop001" }
```

Response (bookmark created):
```json
{ "bookmarked": true, "id": 42 }
```

Response (bookmark removed):
```json
{ "bookmarked": false }
```

Logic: If a bookmark for the given shop + authenticated user exists, delete it and return `{ "bookmarked": false }`. If not, create it and return `{ "bookmarked": true, "id": newId }`. Auth: Customer (JWT).

#### 5.2.11 Likes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/likes` | Customer (JWT) | Like a target |
| DELETE | `/api/likes/:id` | Customer (JWT) | Unlike |

**POST `/api/likes` — Request:**

```json
{
  "data": {
    "target_type": "board_post",
    "target_id": 1
  }
}
```

Server auto-sets `user_id` from JWT. Returns 409 if already liked. On success, the like insert, `like_count` increment, and point award execute within a single transaction (see §5.3.6). If any step fails, the entire operation rolls back.

**DELETE `/api/likes/:id`** — Server validates ownership. The like delete and `like_count` decrement execute within a single transaction (see §5.3.6). Does NOT reverse the point award (points never decrease).

#### 5.2.12 User Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | Customer (JWT) | Current user profile with computed level |
| PUT | `/api/users/me/avatar` | Customer (JWT) | Upload/change profile photo |
| DELETE | `/api/users/me/avatar` | Customer (JWT) | Remove profile photo |

**GET `/api/users/me` — Response:**

```json
{
  "id": 42,
  "username": "힐링마스터",
  "email": "user@example.com",
  "total_points": 3200,
  "level": 3,
  "avatar": { "url": "/uploads/avatar42.jpg" },
  "created_at": "2026-01-15T00:00:00Z"
}
```

> `level` is computed from `total_points` at response time.

**PUT `/api/users/me/avatar`** — Multipart form upload. Server validates file type (JPG/PNG/WebP) and size (max 5MB). Replaces existing avatar.

**DELETE `/api/users/me/avatar`** — Removes avatar media relation. Profile reverts to default avatar on client.

### 5.3 Custom Middleware, Policies & Lifecycle Hooks

#### 5.3.1 Middleware: `account-lock`

**Location:** `src/middlewares/account-lock.ts`
**Purpose:** Intercepts write requests from locked customer accounts.
**Behavior:** Checks `up_users.blocked` field (Strapi built-in). If `true`, returns `403 Forbidden` with message: `"계정이 정지되었습니다. 관리자에게 문의해주세요."` / `"Your account has been suspended. Please contact the administrator."`
**Applied to:** `POST /api/reviews`, `POST /api/reviews/:id/report`, `POST /api/community-posts`, `POST /api/comments`, `POST /api/likes`

> **Note:** Bookmarks (`POST /api/bookmarks`) are exempt — bookmarking is a passive action that does not generate user-visible content.

#### 5.3.1a Middleware: `optimistic-lock`

**Location:** `src/middlewares/optimistic-lock.ts`
**Purpose:** Prevents concurrent editing conflicts in the Admin Web by enforcing optimistic locking on all admin write operations.
**Behavior:** All admin `PUT` and `PATCH` requests must include the `updatedAt` field from the record being modified. The middleware compares the submitted `updatedAt` with the current record's `updatedAt` in the database. If they do not match (indicating another session modified the record), the server returns `409 Conflict` with the response:

```json
{
  "error": {
    "status": 409,
    "name": "ConflictError",
    "message": "This record was modified in another session. Please reload and try again."
  }
}
```

**Applied to:** All admin API `PUT` and `PATCH` endpoints (shops, reviews, themes, regions, districts, inquiries, board posts, events, notices, community posts, users).

#### 5.3.2 Policy: `is-active-shop`

**Location:** `src/api/shop/policies/is-active-shop.ts`
**Purpose:** Additional safeguard ensuring only published shops are returned. Strapi v5 natively excludes drafts, but this policy provides defense-in-depth.
**Applied to:** `GET /api/shops/:documentId`

#### 5.3.3 Lifecycle Hooks: Review Rating Recalculation

**Location:** `src/api/review/content-types/review/lifecycles.ts`
**Triggers:** `afterCreate`, `afterUpdate`, `afterDelete`
**Behavior:**

1. Identify the parent shop from the review
2. Query all reviews for that shop where `status = 'published'`
3. Calculate new `average_rating` (rounded to 2 decimal places) and `total_reviews`
4. Update the shop document via Document Service API

```typescript
// Simplified
async afterCreate(event) {
  const { result } = event;
  await recalculateShopRating(result.shop.documentId);
}

async function recalculateShopRating(shopDocumentId: string) {
  const reviews = await strapi.documents('api::review.review').findMany({
    filters: { shop: { documentId: shopDocumentId }, status: 'published' },
    fields: ['rating'],
  });
  const total = reviews.length;
  const avg = total > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;
  await strapi.documents('api::shop.shop').update({
    documentId: shopDocumentId,
    data: { average_rating: Math.round(avg * 100) / 100, total_reviews: total },
  });
}
```

**Concurrency Safety:**

The `recalculateShopRating` function uses a read-then-write pattern that is vulnerable to concurrent execution. If two reviews are created simultaneously for the same shop, both hooks read the same set of reviews, compute the same (stale) count, and one overwrites the other's result.

**Required safeguard:** Wrap the recalculation in a PostgreSQL advisory lock keyed on the shop's `documentId`. This ensures only one recalculation runs at a time per shop:

```typescript
await strapi.db.connection.raw('SELECT pg_advisory_xact_lock(hashtext(?))', [shopDocumentId]);
// ... then read reviews, compute average, update shop (within the same transaction)
```

**Error handling:** If the recalculation fails (e.g., database connection error), the review CRUD operation should still succeed — the lifecycle hook must not block the user. Log the failure and insert a row into the `rating_recalc_queue` table (§4.4.16) with `next_retry_at = now() + interval '5 minutes'`.

**Retry mechanism (Strapi cron job):**

A Strapi cron task registered in `config/cron-tasks.ts` runs every 5 minutes and processes the retry queue:

```typescript
// config/cron-tasks.ts (simplified)
export default {
  '*/5 * * * *': async ({ strapi }) => {
    const pending = await strapi.db.connection('rating_recalc_queue')
      .where('next_retry_at', '<=', new Date())
      .whereNull('resolved_at')
      .where('attempts', '<', strapi.db.connection.ref('max_attempts'));

    for (const entry of pending) {
      try {
        await recalculateShopRating(entry.shop_id);
        await strapi.db.connection('rating_recalc_queue')
          .where('id', entry.id)
          .update({ resolved_at: new Date() });
      } catch (err) {
        const nextAttempt = entry.attempts + 1;
        await strapi.db.connection('rating_recalc_queue')
          .where('id', entry.id)
          .update({
            attempts: nextAttempt,
            last_error: err.message,
            next_retry_at: new Date(Date.now() + nextAttempt * 5 * 60_000),
          });
      }
    }
  },
};
```

Key behaviors:
- **Exponential backoff:** Each successive retry waits `attempts * 5 minutes` (5 min, 10 min, 15 min, 20 min, 25 min).
- **On success:** `resolved_at` is set; the row remains for auditing.
- **On exhaustion:** When `attempts >= max_attempts` (default 5), the entry is no longer retried. An admin alert is raised (see below).

**Admin alert:** The admin dashboard must surface an alert when any `rating_recalc_queue` entry reaches `attempts >= max_attempts` with `resolved_at IS NULL`. Display: _"Shop ID {X} rating recalculation failed after {max_attempts} attempts — last error: {last_error}"_. The admin can manually trigger a recalculation or investigate the root cause.

> **Note:** A shop publish and concurrent review creation may briefly show a stale rating due to ISR cache timing. The advisory lock on recalculation and 60-second ISR revalidation mitigate this. No additional safeguard is required for MVP.

#### 5.3.4 Lifecycle Hooks: Audit Log

**Location:** `src/api/shop/content-types/shop/lifecycles.ts`
**Triggers:** `beforeUpdate` (to capture old values), `afterUpdate`, `afterCreate`, `afterDelete`
**Behavior:** Captures field-level diffs and writes to the `audit-log` collection type with admin user info extracted from the authenticated Admin Web session (passed to Strapi via the admin API JWT in `strapi.requestContext`).

#### 5.3.5 Lifecycle Hooks: Comment Count Recalculation

On `comment` `afterCreate`: increment `comment_count` on the parent entity (determined by `parent_type` field — `board_post`, `community_post`, or `event`). Uses atomic `UPDATE SET comment_count = comment_count + 1` query.

#### 5.3.6 Lifecycle Hooks: Like Count Recalculation

On `post_like` creation, the following operations MUST execute within a single database transaction:
1. Insert the `post_like` row
2. Atomic increment `like_count` on the target entity (determined by `target_type` — `board_post`, `community_post`, or `event`)
3. Insert `user_points_log` entry for the target author (+5P `like_received`, see §5.3.7)

If any step fails, the entire transaction rolls back — no partial state.

On `post_like` deletion, the following operations MUST execute within a single database transaction:
1. Delete the `post_like` row
2. Atomic decrement `like_count` on the target entity

If the decrement would violate the `CHECK (like_count >= 0)` constraint, the transaction aborts.

**Rapid-click protection:** The unique constraint on `(user_id, target_type, target_id)` in `post_likes` prevents duplicate likes at the database level. Combined with transaction wrapping, this ensures count consistency even under concurrent requests.

#### 5.3.7 Lifecycle Hooks: Points Calculation

On `community_post` `afterCreate`:
1. Insert `user_points_log` entry: `{ action: 'post_created', points: 50, reference_type: 'community_post', reference_id: post.id }`
2. Increment author's `total_points` by 50

On `comment` `afterCreate`:
1. Check daily limit: `SELECT COUNT(*) FROM user_points_log WHERE user_id = author.id AND action = 'comment_created' AND created_at >= today_start(KST)`
2. If count < 10: insert `user_points_log` entry `{ action: 'comment_created', points: 10 }` and increment author's `total_points` by 10
3. If count >= 10: skip point award (daily cap reached)

On `post_like` `afterCreate`:
1. Find the author of the liked target entity
2. Insert `user_points_log` for that author: `{ action: 'like_received', points: 5, reference_type: 'post_like', reference_id: like.id }`
3. Increment that author's `total_points` by 5

> **Note:** Points never decrease. Unlinking (deleting a like) does NOT reverse the point award.

#### 5.3.8 Custom Controller: View Count Increment

**Route:** `POST /api/:contentType/:documentId/view`

Increments `view_count` atomically for the specified content type and document. Rate-limited per user session (cookie-based, max 1 count per document per 30 minutes) to prevent artificial inflation.

**Applies to:** `board-posts`, `community-posts`, `events`, `notices`

**Response:** `{ "data": { "view_count": 1243 } }`

> **Note:** Cookie-based rate limiting is bypassable via incognito mode or cookie clearing. For MVP this is acceptable — view counts are informational, not used for ranking or monetization. Future enhancement: IP + fingerprint-based deduplication or analytics pipeline.

#### 5.3.9 Custom Controller: Notice Prev/Next

**Route:** `GET /api/notices/:documentId`

Custom controller that extends the default Strapi `findOne` with `prev` and `next` notice references, based on `published_at` ordering within the same locale.

**Logic:**
- `prev`: the notice with the closest `published_at` AFTER the current notice (newer)
- `next`: the notice with the closest `published_at` BEFORE the current notice (older)
- If no prev/next exists, the field is `null`

**Response fields added:**
```json
{
  "data": { ... },
  "prev": { "documentId": "nt002", "title": "...", "published_at": "..." },
  "next": { "documentId": "nt003", "title": "...", "published_at": "..." }
}
```

### 5.4 Authentication

#### 5.4.1 Customer Auth (Strapi Users & Permissions)

- **Default providers:** Email/password registration
- **Social providers:** Kakao, Naver — implemented as custom providers extending Strapi's Users & Permissions plugin
- **JWT:** Issued by Strapi on login, stored client-side (httpOnly cookie preferred over localStorage for security)
- **Token lifetime:** 7 days (configurable via `plugins.ts`)

**Custom provider location:** `src/extensions/users-permissions/`

**Email verification flow:**

1. On email registration (`POST /api/auth/local/register`), a lifecycle hook generates a cryptographic token, stores it in `email_verification_token`, and sends a verification email via the existing email service.
2. `POST /api/auth/verify-email` — Public endpoint. Accepts `{ token: string }`. Looks up the user by token, sets `email_verified = true`, clears the token. Returns `200` on success, `400` on invalid/expired token.
3. `POST /api/auth/resend-verification` — Authenticated endpoint. Generates a new token and resends the verification email. Rate-limited to 1 request per minute per user (checked via `email_verification_sent_at`). Returns `429` if rate-limited, `400` if already verified.
4. Social login users (Kakao, Naver) have `email_verified` set to `true` automatically on first login.

**Email verification middleware:** A custom Strapi policy (`is-email-verified`) checks `ctx.state.user.email_verified` before allowing write operations. Applied to:
- `POST /api/reviews` (review creation)
- `POST /api/community-posts` (community post creation)
- `POST /api/comments` (comment creation)
- `POST /api/likes` (like creation)
- `POST /api/review-reports` (review reporting)

Unverified users receive `403 { error: "EMAIL_NOT_VERIFIED", message: "Please verify your email address to perform this action." }`.

#### 5.4.2 Admin Auth

**Admin Web authentication:** The Admin Web (Next.js) authenticates against Strapi's admin API endpoint (`/admin/login`) using email/password credentials. Strapi returns a JWT token which the Admin Web stores and uses for subsequent API requests to Strapi's admin API endpoints. Only authorized admin users can log in — customers, shop owners, and developers do not have access to the Admin Web.

**Strapi built-in admin panel authentication:** Developer-only access for monitoring and debugging. Uses Strapi's built-in session-based JWT authentication. Access to the Strapi built-in admin panel (`{{API_DOMAIN}}/admin`) is restricted via Nginx IP-whitelist (developer IPs or VPN range only).

### 5.5 Strapi Plugins

| Plugin | Purpose | Config Notes |
|---|---|---|
| Users & Permissions | Customer auth | Extended with Kakao/Naver providers |
| i18n | Content localization | Default locale: `ko`, additional: `en` |
| Upload | Media management | Provider: `@strapi/provider-upload-aws-s3` pointed at MinIO |
| Custom cache middleware | API response caching | Redis-backed custom Strapi middleware (`src/middlewares/api-cache.ts`), invalidated via lifecycle hooks. Chosen over plugin for full control over cache keys and invalidation logic. |

### 5.6 Admin Web Features (Next.js)

The following features are built as pages/components within the Admin Web (Next.js) application — not as Strapi admin plugins:

| Feature | Description |
|---|---|
| Dashboard | Platform stats: total shops, reviews, users, inquiries. Built as a Next.js page fetching data from the custom analytics endpoint (`GET /api/dashboard/stats`, §5.2.5). |
| Map Pin Drop | Integrated map component (Kakao Map) for latitude/longitude selection when creating or editing shop listings. Also used on the Customer Web shop detail page as a static map. Built as a React component within the Admin Web. |
| Shop CRUD | Full create, read, update, delete interface for shop listings with search, filter, and sort. |
| Review Moderation | View, flag, hide, and moderate customer reviews. |
| Partnership Inquiry Management | Track and manage incoming partnership requests with status workflow. |
| Customer Account Management | Lock/unlock customer accounts, view activity. |
| Content Management | Manage themes, regions, districts, and amenity options. |
| Locale Management | Create and manage localized content (Korean/English) via the Admin Web's locale switcher, which calls Strapi's i18n API. |
| Audit Log Viewer | Searchable, filterable table of all listing changes. |
| **Board Posts** | CRUD interface for board posts with type filter, featured toggle, HOT badge management |
| **Events** | CRUD for events with date pickers, category, featured toggle |
| **Notices** | CRUD for notices with important/pinned toggle |
| **Community Moderation** | View, hide, or delete community posts. View user activity. |
| **User Points** | View user point history and current levels (read-only) |

> **Note:** Strapi's built-in admin panel is not used for any of these operational features. It is restricted to developers for monitoring and debugging only.

---

## 6. Frontend Architecture — Customer Web (Next.js)

### 6.1 Project Structure

```
apps/customer-web/
├── app/
│   └── [locale]/                    # ko | en
│       ├── layout.tsx               # Root layout — locale provider, nav, footer
│       ├── page.tsx                  # Homepage
│       ├── shop/
│       │   └── [slug]/
│       │       └── page.tsx         # Shop detail (ISR)
│       ├── theme/
│       │   └── [theme-slug]/
│       │       └── page.tsx         # Theme browse (SSG)
│       ├── location/
│       │   └── [level1]/
│       │       └── [level2]/
│       │           └── page.tsx     # Location browse (SSG)
│       ├── search/
│       │   └── page.tsx             # Detail search (SSR)
│       ├── nearby/
│       │   └── page.tsx             # Nearby search (CSR)
│       ├── reviews/
│       │   └── page.tsx             # Review feed (SSR)
│       ├── partnership/
│       │   └── page.tsx             # Partnership landing (SSG)
│       ├── auth/
│       │   ├── login/
│       │   │   └── page.tsx         # Login page
│       │   └── callback/
│       │       └── page.tsx         # OAuth callback
│       ├── mypage/
│       │   ├── page.tsx              # My Page dashboard (CSR)
│       │   └── edit/
│       │       └── page.tsx          # Edit profile (CSR)
│       ├── board/
│       │   ├── recommendation/
│       │   │   └── page.tsx          # Shop recommendation board (SSR)
│       │   ├── info/
│       │   │   └── page.tsx          # Massage info board (SSR)
│       │   └── [type]/
│       │       └── [id]/
│       │           └── page.tsx      # Board post detail (ISR)
│       ├── community/
│       │   ├── page.tsx              # Community feed (SSR)
│       │   └── [id]/
│       │       └── page.tsx          # Community post detail (SSR)
│       └── events/
│           ├── page.tsx              # Events & notices hub (ISR)
│           ├── ongoing/
│           │   └── page.tsx          # All ongoing events (SSR)
│           ├── [id]/
│           │   └── page.tsx          # Event detail (ISR)
│           └── notice/
│               └── [id]/
│                   └── page.tsx      # Notice detail (SSG)
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── shop/
│   │   ├── ShopCard.tsx
│   │   ├── ShopGrid.tsx
│   │   ├── ShopDetail.tsx
│   │   ├── ShopAmenities.tsx
│   │   ├── ShopServiceMenu.tsx
│   │   ├── ShopContactChannels.tsx
│   │   └── OpenCloseTag.tsx
│   ├── search/
│   │   ├── SearchFilters.tsx
│   │   ├── ThemeSelector.tsx
│   │   ├── LocationCascade.tsx
│   │   ├── AmenityToggles.tsx
│   │   ├── SortSelector.tsx
│   │   └── Pagination.tsx
│   ├── review/
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewForm.tsx
│   │   ├── ReviewList.tsx
│   │   ├── StarRating.tsx
│   │   └── ReportButton.tsx
│   ├── nearby/
│   │   ├── NearbySearch.tsx         # Client component (GPS)
│   │   └── DistanceLabel.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── Skeleton.tsx
│   ├── board/
│   │   ├── BoardPostCard.tsx
│   │   ├── BoardPostList.tsx
│   │   ├── BoardSubNav.tsx
│   │   └── RegionFilter.tsx
│   ├── community/
│   │   ├── CommunityPostCard.tsx
│   │   ├── CommunityPostForm.tsx
│   │   ├── ProfileSidebar.tsx
│   │   └── PopularShopsSidebar.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── NoticeCard.tsx
│   │   ├── DdayBadge.tsx
│   │   └── CategorySidebar.tsx
│   ├── mypage/
│   │   ├── ProfileCard.tsx
│   │   ├── MyReviewList.tsx
│   │   ├── BookmarkGrid.tsx
│   │   └── TabNav.tsx
│   └── shared/
│       ├── CommentSection.tsx
│       ├── CommentInput.tsx
│       └── LikeButton.tsx
├── lib/
│   ├── strapi.ts                    # Strapi API client wrapper
│   ├── api/
│   │   ├── shops.ts                 # Shop-related API calls
│   │   ├── themes.ts
│   │   ├── regions.ts
│   │   ├── reviews.ts
│   │   ├── partnership.ts
│   │   ├── board.ts
│   │   ├── community.ts
│   │   ├── events.ts
│   │   ├── bookmarks.ts
│   │   ├── likes.ts
│   │   └── profile.ts
│   ├── hooks/
│   │   ├── useGeolocation.ts
│   │   └── useAuth.ts
│   └── utils/
│       ├── format.ts                # Currency, date formatting (KRW, KST)
│       └── seo.ts                   # Meta tag generators
├── messages/
│   ├── ko.json                      # Korean UI strings
│   └── en.json                      # English UI strings
├── middleware.ts                     # Locale detection, redirect / → /ko
├── i18n.ts                          # next-intl config
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### 6.2 Rendering Strategy

| Page | Strategy | Revalidation | Rationale |
|---|---|---|---|
| Homepage | SSG + ISR | 300s (5 min) | Relatively static, shows featured shops/themes |
| Shop Detail | ISR | 60s | Content updates (reviews, ratings) need near-real-time reflection |
| Theme Browse | SSG | On-demand (webhook) | Theme list rarely changes |
| Location Browse | SSG | On-demand (webhook) | Location hierarchy is static |
| Detail Search | SSR | N/A | Dynamic filter/sort combos, not cacheable via SSG |
| Nearby Search | CSR | N/A | Requires client-side GPS, fully dynamic |
| Review Feed | SSR | N/A | Must reflect latest reviews |
| Partnership | SSG | On-demand | Static content page |
| Login/Callback | CSR | N/A | Auth flow, no SEO value |
| My Page | CSR | N/A | Auth-required, personalized, no SEO value |
| Edit Profile | CSR | N/A | Auth-required form |
| Board Recommendation | SSR | N/A | Dynamic region filtering |
| Board Info | SSR | N/A | Dynamic sorting |
| Board Post Detail | ISR | 60s | Content stable, comments dynamic via client |
| Community Feed | SSR | N/A | Highly dynamic user content |
| Community Post Detail | SSR | N/A | Dynamic comments/likes |
| Events Hub | ISR | 300s (5 min) | Mixed static notices + time-sensitive events |
| Ongoing Events | SSR | N/A | Dynamic category filtering/sorting |
| Event Detail | ISR | 60s | Content stable, D-day needs freshness |
| Notice Detail | SSG | On-demand (webhook) | Static admin content |

**On-demand revalidation:** Strapi webhooks trigger Next.js revalidation when content is published/updated.

**Webhook configuration:**
- **Next.js revalidation endpoint:** `POST /api/revalidate` (custom API route in both Customer Web and Admin Web)
- **Authentication:** Webhook requests are verified via a shared secret (`REVALIDATION_SECRET` env var) passed in the `x-revalidate-secret` header
- **Payload:** `{ "model": "shop", "documentId": "abc123", "event": "entry.publish" }`
- **Triggered by:** Strapi lifecycle hooks on `afterCreate`, `afterUpdate`, `afterDelete` for shop, review, theme, region, district content types
- **Failure handling:** Webhook failures are logged but do not block the Strapi operation. Stale content is still served via ISR time-based revalidation as fallback.

### 6.3 Strapi API Client

**`lib/strapi.ts`** — thin wrapper around `fetch` that:

1. Prepends the Strapi API base URL from env var `STRAPI_API_URL`
2. Passes `locale` parameter from the current route segment
3. Handles Strapi's response format (unwraps `data`, `meta`)
4. Adds API token for server-side calls (`STRAPI_API_TOKEN`) via read-only API token
5. Implements error handling and TypeScript types from `packages/shared-types`

```typescript
// Simplified
export async function fetchStrapi<T>(
  path: string,
  params?: Record<string, any>,
  options?: RequestInit
): Promise<StrapiResponse<T>> {
  const url = new URL(`${process.env.STRAPI_API_URL}${path}`);
  if (params) {
    url.search = qs.stringify(params, { encodeValuesOnly: true });
  }
  const res = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new StrapiError(res.status, await res.json());
  return res.json();
}
```

### 6.4 Key Frontend Patterns

**Filter state in URL:** All search filters are serialized to URL query parameters via `useSearchParams()`. This ensures:
- Shareable/bookmarkable search results
- Back-navigation preserves state
- SEO for search result pages (though marked `noindex`)

**Cascading location dropdowns:** The `LocationCascade` component fetches regions on mount, then fetches districts when a region is selected. Both calls are cached aggressively (region/district data rarely changes).

**GPS nearby search:** The `NearbySearch` component is a client component (`"use client"`) that:
1. Requests `navigator.geolocation.getCurrentPosition()`
2. Calls the custom `/api/shops/nearby` endpoint
3. Renders results with distance labels

**Open/Close tag:** The `OpenCloseTag` component compares the shop's `operating_hours` JSON against the current time in KST (using `Intl.DateTimeFormat` with `timeZone: 'Asia/Seoul'`) to display the appropriate tag. If `operating_hours_text` is set, it is displayed as-is instead of computing from the JSON schedule.

> **Rendering ownership (OWNER-01):** `OpenCloseTag` is a **server component** — the tag is computed server-side during SSR/ISR using KST via `Intl.DateTimeFormat`. On shop cards in search results (SSR) and shop detail pages (ISR), the tag is included in the rendered HTML. Because both server and client use the same KST logic, there is no hydration mismatch. For ISR-cached pages, the tag may be up to 60 seconds stale (the ISR revalidation interval), which is acceptable for operating-hours granularity.

**`operating_hours` JSON format:**
```json
{
  "mon": { "open": "10:00", "close": "22:00" },
  "tue": { "open": "10:00", "close": "22:00" },
  "wed": { "open": "10:00", "close": "22:00" },
  "thu": { "open": "10:00", "close": "22:00" },
  "fri": { "open": "10:00", "close": "23:00" },
  "sat": { "open": "11:00", "close": "23:00" },
  "sun": null
}
```
- Keys: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`
- Values: `{ "open": "HH:mm", "close": "HH:mm" }` or `null` (closed that day)
- Times are in 24-hour KST format. Overnight hours (e.g., `"open": "18:00", "close": "02:00"`) are supported — close time before open time means next day.

### 6.5 Image Handling

- Shop images are served from MinIO via Nginx (acting as cache proxy) and Cloudflare CDN
- Next.js `<Image>` component with `remotePatterns` configured for the MinIO/API domain
- Responsive image sizes: thumbnail (300w), detail (800w, 1200w)
- WebP conversion: deferred to post-MVP (requires Cloudflare Pro+ plan). For MVP, images are served in their uploaded format (JPEG/PNG/WebP) via Nginx cache and Cloudflare CDN. Next.js `<Image>` component handles client-side responsive sizing.

---

## 7. Infrastructure & DevOps

### 7.1 On-Premise Server Requirements

| Resource | Minimum (MVP) | Recommended |
|---|---|---|
| CPU | 4 cores | 8 cores |
| RAM | 8 GB | 16 GB |
| Storage | 100 GB SSD | 250 GB NVMe SSD |
| OS | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| Network | 100 Mbps | 1 Gbps |

### 7.2 Docker Compose — Production

```yaml
# docker/docker-compose.prod.yml (simplified)
version: "3.9"

services:
  postgres:
    image: postgis/postgis:17-3.6
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    ports:
      - "127.0.0.1:5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USERNAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7.4-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s

  minio:
    image: minio/minio:RELEASE.2026-03-15T00-00-00Z  # Pin to specific release
    restart: unless-stopped
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s

  strapi:
    build:
      context: ../
      dockerfile: docker/Dockerfile.strapi
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_NAME: ${DATABASE_NAME}
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
      MINIO_BUCKET_NAME: ${MINIO_BUCKET_NAME}
    ports:
      - "127.0.0.1:1337:1337"

  customer-web:
    build:
      context: ../
      dockerfile: docker/Dockerfile.web
    restart: unless-stopped
    depends_on:
      - strapi
    environment:
      NODE_ENV: production
      STRAPI_API_URL: http://strapi:1337/api
      STRAPI_API_TOKEN: ${STRAPI_API_TOKEN}
      NEXT_PUBLIC_SITE_URL: https://${DOMAIN}
    ports:
      - "127.0.0.1:3000:3000"

  admin-web:
    build:
      context: ../
      dockerfile: docker/Dockerfile.admin
    restart: unless-stopped
    depends_on:
      - strapi
    environment:
      NODE_ENV: production
      STRAPI_API_URL: http://strapi:1337
      NEXT_PUBLIC_ADMIN_URL: https://${ADMIN_DOMAIN}
      NEXT_PUBLIC_CUSTOMER_URL: https://${DOMAIN}
      NEXT_PUBLIC_KAKAO_MAP_APP_KEY: ${KAKAO_MAP_APP_KEY}
    ports:
      - "127.0.0.1:3001:3001"

  nginx:
    image: nginx:1.26-alpine
    restart: unless-stopped
    depends_on:
      - strapi
      - customer-web
      - admin-web
      - minio
    volumes:
      - ../nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/ssl/cloudflare:/etc/ssl/cloudflare:ro  # Cloudflare Origin Certificate
    ports:
      - "443:443"
      - "80:80"
    healthcheck:
      test: ["CMD", "nginx", "-t"]
      interval: 30s

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 7.3 Nginx Configuration

```nginx
# nginx/nginx.conf (key sections)

# Only accept connections from Cloudflare IPs
# Updated list: https://www.cloudflare.com/ips/
geo $is_cloudflare {
    default         0;
    173.245.48.0/20 1;
    103.21.244.0/22 1;
    103.22.200.0/22 1;
    103.31.4.0/22   1;
    141.101.64.0/18 1;
    108.162.192.0/18 1;
    190.93.240.0/20 1;
    188.114.96.0/20 1;
    197.234.240.0/22 1;
    198.41.128.0/17 1;
    162.158.0.0/15  1;
    104.16.0.0/13   1;
    104.24.0.0/14   1;
    172.64.0.0/13   1;
    131.0.72.0/22   1;
    # IPv6 ranges omitted for brevity — include in production
}

server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

# Customer Web — {{DOMAIN}}
server {
    listen 443 ssl http2;
    server_name {{DOMAIN}} www.{{DOMAIN}};

    ssl_certificate     /etc/ssl/cloudflare/origin.pem;
    ssl_certificate_key /etc/ssl/cloudflare/origin-key.pem;

    if ($is_cloudflare = 0) { return 403; }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location / {
        proxy_pass http://customer-web:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API — {{API_DOMAIN}}
server {
    listen 443 ssl http2;
    server_name {{API_DOMAIN}};

    ssl_certificate     /etc/ssl/cloudflare/origin.pem;
    ssl_certificate_key /etc/ssl/cloudflare/origin-key.pem;

    if ($is_cloudflare = 0) { return 403; }

    location /api/ {
        proxy_pass http://strapi:1337/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache headers for Cloudflare
        add_header Cache-Control "public, max-age=60, s-maxage=300";
    }

    # MinIO image proxy with caching
    location /uploads/ {
        proxy_pass http://minio:9000/{{MINIO_BUCKET_NAME}}/;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
        add_header X-Cache-Status $upstream_cache_status;
    }

    # Strapi built-in admin panel — DEVELOPER-ONLY access
    # Restricted to developer IPs / VPN for monitoring and debugging
    location /admin {
        # Allow developer IPs / VPN range only
        allow {{DEV_VPN_CIDR}};        # e.g., 10.0.0.0/24
        # allow {{DEV_IP_1}};          # Individual developer IPs
        # allow {{DEV_IP_2}};
        deny all;

        proxy_pass http://strapi:1337/admin;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Admin Web — {{ADMIN_DOMAIN}}
server {
    listen 443 ssl http2;
    server_name {{ADMIN_DOMAIN}};

    ssl_certificate     /etc/ssl/cloudflare/origin.pem;
    ssl_certificate_key /etc/ssl/cloudflare/origin-key.pem;

    if ($is_cloudflare = 0) { return 403; }

    location / {
        proxy_pass http://admin-web:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 7.4 Cloudflare Configuration

| Setting | Value | Notes |
|---|---|---|
| SSL Mode | Full (Strict) | Origin Certificate installed on Nginx |
| Minimum TLS | 1.2 | |
| Always Use HTTPS | On | |
| Auto Minify | JS, CSS, HTML | |
| Brotli | On | |
| HTTP/3 (QUIC) | On | |
| Bot Fight Mode | On | Challenge suspicious bots |
| Crawler Hints | On | Allowlist Yeti (Naver), Googlebot |

**Page Rules / Cache Rules:**

| Pattern | Rule | Notes |
|---|---|---|
| `{{API_DOMAIN}}/api/themes*` | Cache Everything, Edge TTL: 1 day | |
| `{{API_DOMAIN}}/api/regions*` | Cache Everything, Edge TTL: 1 day | |
| `{{API_DOMAIN}}/api/districts*` | Cache Everything, Edge TTL: 1 day | |
| `{{API_DOMAIN}}/uploads/*` | Cache Everything, Edge TTL: 7 days | |
| `{{ADMIN_DOMAIN}}/*` | Bypass Cache, Security Level: High | Admin Web (admin-only access) |
| `{{API_DOMAIN}}/admin/*` | Bypass Cache, Security Level: High | Strapi built-in admin panel (developer-only, IP-restricted at Nginx) |

**Rate Limiting Rules (Cloudflare):**

| Path Pattern | Limit | Window | Action |
|---|---|---|---|
| `{{API_DOMAIN}}/api/auth/*` | 10 requests | 1 minute | Block |
| `{{API_DOMAIN}}/api/reviews` (POST) | 5 requests | 1 minute | Challenge |
| `{{API_DOMAIN}}/api/partnership-inquiries` (POST) | 3 requests | 1 minute | Challenge |

### 7.5 CI/CD Pipeline (GitLab CI)

```yaml
# .gitlab-ci.yml (simplified)
stages:
  - lint
  - test
  - build
  - deploy

variables:
  NODE_IMAGE: node:24.11.0-alpine

lint:
  stage: lint
  image: $NODE_IMAGE
  script:
    - corepack enable && corepack prepare pnpm@latest --activate
    - pnpm install --frozen-lockfile
    - pnpm turbo lint

test:
  stage: test
  image: $NODE_IMAGE
  services:
    - postgres:17-alpine
    - redis:7.4-alpine
  script:
    - corepack enable && corepack prepare pnpm@latest --activate
    - pnpm install --frozen-lockfile
    - pnpm turbo test -- --coverage

build:
  stage: build
  image: docker:27
  services:
    - docker:27-dind
  script:
    - docker compose -f docker/docker-compose.prod.yml build
    - docker save strapi customer-web admin-web | gzip > images.tar.gz
  artifacts:
    paths:
      - images.tar.gz

deploy:production:
  stage: deploy
  when: manual
  only:
    - main
  script:
    - scp images.tar.gz deploy@$PROD_SERVER:/opt/swida/
    - ssh deploy@$PROD_SERVER "cd /opt/swida && ./deploy.sh"
```

### 7.6 Deployment Script

```bash
#!/bin/bash
# deploy.sh — runs on the on-premise server
set -euo pipefail

cd /opt/swida
docker load < images.tar.gz
docker compose -f docker/docker-compose.prod.yml up -d --remove-orphans
docker system prune -f
echo "Deployment complete at $(date)"
```

### 7.7 Backup Strategy

#### PostgreSQL Backup

| Item | Spec |
|---|---|
| Method | `pg_dump --format=custom` via cron |
| Schedule | Daily at 03:00 KST |
| Storage | Off-site S3-compatible storage (separate from MinIO) |
| Retention | 30 days rolling |
| Verification | Weekly test restore to staging database |

**Restore procedure:**

1. Stop application containers: `docker compose stop strapi customer-web admin-web`
2. Restore: `pg_restore --clean --if-exists -d swida backup.dump`
3. Verify: `psql -c "SELECT count(*) FROM shops;"`
4. Restart: `docker compose up -d`

#### MinIO Backup

| Item | Spec |
|---|---|
| Method | `rsync` of MinIO data directory |
| Schedule | Daily at 04:00 KST |
| Storage | Off-site S3-compatible storage |
| Retention | 30 days rolling |

---

## 8. Security Architecture

### 8.1 Defense Layers

```
Layer 1: Cloudflare Edge
  ├── DDoS mitigation (L3/L4/L7)
  ├── WAF (OWASP managed rulesets)
  ├── Bot management
  ├── Rate limiting
  └── SSL termination (public certificates)

Layer 2: Nginx (Origin)
  ├── Cloudflare-only IP allowlisting
  ├── Strapi built-in admin panel IP restriction (developer IPs / VPN only)
  ├── Gzip / Brotli compression
  ├── SSL (Cloudflare Origin Certificate)
  └── Request buffering / timeouts

Layer 3: Application (Strapi)
  ├── Input sanitization (built-in)
  ├── CSRF protection (middleware)
  ├── CORS configuration
  ├── JWT authentication
  ├── Role-based permissions
  ├── Rate limiting (strapi middleware)
  └── Account lock mechanism

Layer 4: Database
  ├── Connection via internal Docker network only
  ├── Parameterized queries (Knex.js)
  └── No public port exposure
```

### 8.2 CORS Configuration

```typescript
// config/middlewares.ts
export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', `${process.env.MINIO_ENDPOINT}`],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        `https://${process.env.DOMAIN}`,
        `https://www.${process.env.DOMAIN}`,
        `https://${process.env.ADMIN_DOMAIN}`,
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

### 8.3 Secret Management

- All secrets stored in `.env` files per environment (never committed to Git)
- `.env.example` maintained with placeholder values
- Production `.env` file deployed via secure SCP or environment-specific CI/CD variables
- Strapi's `APP_KEYS`, `JWT_SECRET`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT` — all generated with `openssl rand -base64 32`

---

## 9. Caching Strategy

### 9.1 Three-Tier Cache Architecture

```
Tier 1: Cloudflare Edge Cache
  └── Static assets (JS, CSS, fonts, images): TTL 7 days
  └── Cacheable API responses (themes, regions, districts): TTL 1 day
  └── Shop images from MinIO: TTL 7 days

Tier 2: Redis (Origin Cache)
  └── Shop detail: TTL 1 minute
  └── Shop list/search: TTL 30 seconds
  └── Review feed: TTL 30 seconds
  └── Region/District lists: TTL 24 hours
  └── Theme lists: TTL 24 hours
  └── Top-rated shops: TTL 5 minutes
  └── Individual shop details: TTL 1 minute

Tier 3: PostgreSQL (Source of Truth)
  └── All data
```

### 9.1.1 Redis Failure Fallback

The cache middleware MUST treat Redis as optional. On Redis connection failure, the middleware bypasses the cache and queries PostgreSQL directly. Redis connection errors are logged at `warn` level and must not block requests. No circuit breaker is needed for MVP — a simple try/catch around Redis operations is sufficient.

### 9.2 Cache Invalidation

Cache invalidation is triggered by Strapi lifecycle hooks:

- **Shop publish/update/unpublish** → Invalidate Redis keys for affected shop, search results, and relevant theme/location caches. Always trigger Cloudflare cache purge via API (`POST /client/v4/zones/{zone_id}/purge_cache`) for the specific shop URL (both `/ko/shop/{slug}` and `/en/shop/{slug}`).
- **Review create/update/delete** → Invalidate Redis cache for the parent shop (rating change).
- **Theme/Region/District changes** → Invalidate respective Redis keys and Cloudflare cache.

**Additional webhook triggers for new content types:**

| Content Type | Webhook Event | Revalidation Target |
|---|---|---|
| board_post | publish, update, unpublish | Board list pages, post detail |
| event | publish, update, unpublish | Events hub, ongoing events, event detail |
| notice | publish, update, unpublish | Events hub, notice detail |

Community posts and comments are SSR (no cache), so no webhook revalidation needed. Bookmark and like operations are user-specific CSR calls — no cache implications.

### 9.3 Next.js Caching

- **ISR revalidation:** Shop detail pages revalidate every 60 seconds
- **On-demand revalidation:** Strapi webhook → Next.js revalidation API route → `revalidatePath('/ko/shop/[slug]')` and `revalidatePath('/en/shop/[slug]')`
- **Fetch cache:** Server-side `fetch` calls to Strapi use `next: { revalidate: N }` for time-based revalidation

---

## 10. Internationalization (i18n)

### 10.1 Architecture

```
┌─────────────────────────────────────────────┐
│            Customer Web (Next.js)            │
│  Middleware: detect locale → redirect        │
│  [locale] dynamic segment: /ko/... /en/...   │
│  next-intl: UI string management             │
│  Strapi API calls: ?locale=ko or ?locale=en  │
└─────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│                  Strapi                      │
│  i18n plugin: ko (default), en (additional)  │
│  Content authored via Admin Web (Next.js)    │
│  Korean content first, en translations opt.  │
│  Fallback: ko content if en missing          │
└─────────────────────────────────────────────┘
                    ▲
┌───────────────────┘─────────────────────────┐
│             Admin Web (Next.js)               │
│  Locale switcher UI for content authoring     │
│  Calls Strapi's i18n API for translations     │
│  Admin authors ko first, en optionally        │
└───────────────────────────────────────────────┘
```

### 10.2 Next.js Middleware

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'always',  // Both /ko and /en are explicit
  localeDetection: true,    // Detect from Accept-Language header
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

### 10.3 Fallback Behavior

When English content is unavailable for a shop or entity, the Customer Web displays the Korean version with a subtle indicator: `"이 내용은 아직 번역되지 않았습니다"` / `"This content is not yet translated"`. This is handled in the API client by detecting when the Strapi response locale differs from the requested locale.

---

## 11. SEO Strategy

### 11.1 Indexed Pages (in sitemap)

Both `/ko` and `/en` versions:

- Homepage
- Shop detail pages (`/[locale]/shop/[slug]`)
- Location browse pages (`/[locale]/location/[level1]/[level2]`)
- Theme browse pages (`/[locale]/theme/[theme-slug]`)
- Partnership page

### 11.2 Excluded Pages (`noindex`)

- Search results with query parameters
- Review submission pages
- Login / signup pages
- All Admin Web pages (`{{ADMIN_DOMAIN}}/*`)
- Strapi built-in admin panel (`{{API_DOMAIN}}/admin/*`) — developer-only, not publicly accessible

### 11.3 Sitemap Generation

Next.js App Router `sitemap.ts` dynamically generates `sitemap.xml` by fetching all published shops, themes, and location combos from Strapi API. Both locale versions are included.

### 11.4 hreflang Tags

Every page includes:

```html
<link rel="alternate" hreflang="ko" href="https://{{DOMAIN}}/ko/..." />
<link rel="alternate" hreflang="en" href="https://{{DOMAIN}}/en/..." />
<link rel="alternate" hreflang="x-default" href="https://{{DOMAIN}}/ko/..." />
```

### 11.5 Structured Data (JSON-LD)

Shop detail pages include `LocalBusiness` schema markup with:
- Name, address, telephone
- Geo coordinates (latitude, longitude)
- Opening hours
- Aggregate rating (`averageRating`, `reviewCount`)
- Price range

---

## 12. Testing Strategy

### 12.1 Methodology

Test-Driven Development (TDD) — tests written before implementation.

### 12.2 Test Layers

| Layer | Tool | Scope | Coverage Target |
|---|---|---|---|
| Unit | Vitest | Controllers, services, hooks, utilities, React components | ≥ 80% lines |
| Integration | Vitest + Supertest | Strapi API endpoints, custom routes, policies | ≥ 80% lines |
| E2E | Playwright | Full user flows across both locales | Critical paths 100% |

### 12.3 Critical E2E Test Paths

1. **Search flow:** Homepage → Theme search → Filter by location → View shop detail
2. **Nearby search:** Grant GPS → View nearby results → View shop detail
3. **Review flow:** Login (Kakao/Naver) → Navigate to shop → Submit review → Verify display
4. **Partnership flow:** Visit partnership page → Submit inquiry form → Verify submission
5. **Admin flow:** Login to Admin Web → Create shop → Publish → Verify on Customer Web
6. **i18n flow:** Switch language → Verify URL change → Verify content language

---

## 13. Monitoring & Observability

### 13.1 Health Checks

| Service | Endpoint | Expected |
|---|---|---|
| Strapi | `/_health` | HTTP 204 |
| Customer Web (Next.js) | `/api/health` (custom) | HTTP 200 + JSON |
| Admin Web (Next.js) | `/api/health` (custom) | HTTP 200 + JSON |
| PostgreSQL | `pg_isready` | Exit code 0 |
| Redis | `redis-cli ping` | PONG |
| MinIO | `mc ready local` | Exit code 0 |

**MinIO Storage Monitoring:**

- **Healthcheck endpoint:** MinIO exposes a built-in health endpoint at `/minio/health/live` (HTTP 200 when healthy). The Docker Compose healthcheck uses `mc ready local` (equivalent).
- **Disk space alert:** Configure a disk usage alert at **80% capacity** on the MinIO data volume. When the threshold is exceeded, trigger a warning notification to the ops channel. At **90% capacity**, trigger a critical alert. Monitor via `mc admin info` or the MinIO Console dashboard at port `9001`.

### 13.2 Logging

- **Strapi:** Built-in logger (`strapi.log`) → stdout → Docker logs
- **Customer Web (Next.js):** `console.log` / `console.error` → stdout → Docker logs
- **Admin Web (Next.js):** `console.log` / `console.error` → stdout → Docker logs
- **Nginx:** Access and error logs → Docker logs
- **Centralized logging:** Forward Docker logs to a log aggregator (e.g., Loki + Grafana) post-MVP

#### Nginx Access Log Format

```nginx
log_format json_combined escape=json '{'
  '"time":"$time_iso8601",'
  '"remote_addr":"$http_cf_connecting_ip",'
  '"request_id":"$request_id",'
  '"method":"$request_method",'
  '"uri":"$request_uri",'
  '"status":$status,'
  '"body_bytes_sent":$body_bytes_sent,'
  '"request_time":$request_time,'
  '"upstream_response_time":"$upstream_response_time",'
  '"user_agent":"$http_user_agent"'
'}';
access_log /var/log/nginx/access.log json_combined;
```

- Pass `X-Request-ID` header to upstream services via `proxy_set_header X-Request-ID $request_id;`

#### Strapi Request Logging

| Status Range | Log Level | Details |
|---|---|---|
| 2xx | `debug` | Route, response time |
| 4xx | `warn` | Route, status, request ID, client IP |
| 5xx | `error` | Route, status, request ID, client IP, stack trace |

- Correlate logs using the `X-Request-ID` header from Nginx

#### Log Rotation

| Item | Spec |
|---|---|
| Tool | `logrotate` |
| Retention | 90 days |
| Rotation | Daily, compressed (`gzip`) |
| Format | JSON for machine parsing |

### 13.3 Uptime Monitoring

- **Cloudflare Health Checks:** Monitor origin server availability from Cloudflare edge
- **External uptime monitor:** UptimeRobot (free tier, 5-minute intervals) pinging `https://{{DOMAIN}}/ko`, `https://{{ADMIN_DOMAIN}}/api/health`, and `https://{{API_DOMAIN}}/api/themes`

### 13.4 Error Tracking

- **Tool:** Sentry (self-hosted or cloud)
- **Strapi:** `@sentry/node` — capture unhandled exceptions and 5xx responses
- **Customer Web (Next.js):** `@sentry/nextjs` with source maps uploaded at build time
- **Admin Web (Next.js):** `@sentry/nextjs` with source maps uploaded at build time
- **Environment tags:** `production`, `staging`

### 13.5 Key Metrics & Alerting

| Metric | Source | Threshold (Warning) | Threshold (Critical) |
|---|---|---|---|
| API response time p95 | Nginx access log | > 1 s | > 2 s |
| Error rate (5xx / total) | Nginx access log | > 2 % | > 5 % |
| Health check failure | UptimeRobot | — | Any failure |
| Active users (concurrent) | Nginx access log | Informational | — |
| Disk usage | `df` via cron | > 80 % | > 90 % |
| PostgreSQL connections | `pg_stat_activity` | > 80 % of `max_connections` | > 90 % |

**Alert channel:** Dedicated Slack channel (`#swida-alerts`).

**Alert delivery:**
- UptimeRobot → Slack webhook (health check failures)
- Sentry → Slack integration (application errors)
- Cron scripts → Slack webhook (disk, DB connection threshold breaches)

---

## 14. Appendix

### 14.1 Environment Variables Template

```bash
# .env.example

# ── Database ──
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=swida
DATABASE_USERNAME=swida_user
DATABASE_PASSWORD=CHANGE_ME
DATABASE_SSL=false

# ── Strapi ──
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=CHANGE_ME
ADMIN_JWT_SECRET=CHANGE_ME
TRANSFER_TOKEN_SALT=CHANGE_ME
JWT_SECRET=CHANGE_ME
HOST=0.0.0.0
PORT=1337
NODE_ENV=production
URL=https://api.example.com

# ── Auth (Customer) ──
KAKAO_CLIENT_ID=CHANGE_ME
KAKAO_CLIENT_SECRET=CHANGE_ME
NAVER_CLIENT_ID=CHANGE_ME
NAVER_CLIENT_SECRET=CHANGE_ME

# ── MinIO ──
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=CHANGE_ME
MINIO_SECRET_KEY=CHANGE_ME
MINIO_BUCKET_NAME=swida-uploads
MINIO_USE_SSL=false

# ── Redis ──
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_ME

# ── Cloudflare ──
CLOUDFLARE_ZONE_ID=CHANGE_ME
CLOUDFLARE_API_TOKEN=CHANGE_ME

# ── External ──
KAKAO_MAP_APP_KEY=CHANGE_ME
REVALIDATION_SECRET=CHANGE_ME

# ── Next.js (Customer Web) ──
STRAPI_API_URL=http://strapi:1337/api
STRAPI_API_TOKEN=CHANGE_ME
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=CHANGE_ME

# ── Next.js (Admin Web) ──
STRAPI_API_URL=http://strapi:1337
NEXT_PUBLIC_ADMIN_URL=https://admin.example.com
NEXT_PUBLIC_CUSTOMER_URL=https://example.com
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=CHANGE_ME

# ── Domain ──
DOMAIN=example.com
ADMIN_DOMAIN=admin.example.com
```

### 14.2 Monorepo Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 14.3 Shared Types Package

`packages/shared-types/` exports TypeScript interfaces for Strapi response types used by both the Customer Web and Admin Web, as well as any shared utilities:

```typescript
// packages/shared-types/src/shop.ts
export interface ShopListItem {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  average_rating: number;
  total_reviews: number;
  address: string;
  thumbnail: StrapiMedia | null;
  themes: ThemeListItem[];
  district: { name: string };
}

export interface ShopDetail extends ShopListItem {
  description: string;
  latitude: number;
  longitude: number;
  phone_number: string | null;
  operating_hours: Record<string, { open: string; close: string } | null>;
  operating_hours_text: string | null;
  last_order_time: string | null;
  closed_days: string;
  holiday_exceptions: string | null;
  price_range: string | null;
  booking_required: boolean;
  booking_url_phone: string | null;
  gender_availability: GenderAvailability | null;
  languages_supported: string[] | null;
  open_tag: string | null;
  close_tag: string | null;
  images: StrapiMedia[];
  region: { name: string };
  amenities: Amenities;
  contact_channels: ContactChannels;
  service_menu: ServiceMenuItem[];
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
```

### 14.4 Decision Log

| # | Decision | Rationale | Date |
|---|---|---|---|
| D-001 | Next.js 16.2.1 (latest) for both frontends | Custom admin web eliminates Strapi React 18 conflict. All RSC CVEs patched. Turbopack stable, 87% faster dev startup. | 2026-03-24 |
| D-002 | Node.js 24 Active LTS | Recommended for new projects in 2026. Strapi v5 officially supports it. Native TS type-stripping, npm v11, OpenSSL 3.5. EOL April 2028. | 2026-03-24 |
| D-003 | PostgreSQL 17 over 18 | PostGIS 3.6.2 better validated on PG 17, PG 18 still newer | 2026-03-24 |
| D-004 | Tailwind CSS v4 (latest) | Next.js 16 scaffolds v4 by default. Greenfield project — no migration concerns. Faster builds, CSS-first config. | 2026-03-24 |
| D-005 | pnpm over npm/yarn | Best monorepo support, fastest installs, strict dependency isolation | 2026-03-24 |
| D-006 | Custom Next.js Admin Web over Strapi built-in admin | Unified frontend stack (React 19 everywhere), custom UX for admin workflows, full design control. Admin Web accessible only to authenticated admin users. | 2026-03-24 |
| D-007 | Strapi as headless API-only | Strapi's built-in admin panel restricted to developers only for monitoring, debugging, and emergency operations — not used for day-to-day platform management | 2026-03-24 |
| D-008 | ISR over full SSR for shop detail | Balances freshness (60s revalidation) with performance and cost | 2026-03-24 |
| D-009 | Page-based pagination over infinite scroll | SEO: unique crawlable URLs per page for Naver/Google indexing | 2026-03-24 |
| D-010 | On-premise over cloud | Client requirement — dedicated server with full control | 2026-03-24 |
| D-011 | PostGIS raw SQL over ORM geospatial | Strapi's Knex doesn't natively support PostGIS. Raw SQL via `strapi.db.connection.raw()` is the recommended approach. | 2026-03-24 |
| D-012 | Redis for API cache over in-memory | Persistent across Strapi restarts, shared if scaled to multiple instances | 2026-03-24 |
| D-013 | React 19.2.4 pinned | Patches all RSC CVEs including CVE-2026-23864. All frontends share same version. | 2026-03-24 |

### 14.5 Deferred Items

| Item | Description | Depends On |
|---|---|---|
| Server-Side Review Rate Limits | Per-user hourly and per-shop daily caps (e.g., 10 reviews/user/hour, 3 reviews/user/shop/day) enforced via Strapi middleware to prevent review flooding beyond Cloudflare WAF limits (~400+/day per user passthrough). Requires Redis-backed counters in a custom `review-rate-limit` middleware. | Strapi custom middleware + Redis |

---

> **Document End**
>
> This TSD should be reviewed and updated as implementation progresses. Version-pinned dependencies should be re-evaluated at each sprint boundary for security patches.
