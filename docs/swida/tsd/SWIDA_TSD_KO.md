---
title: "SWIDA — 기술 사양 문서 (TSD)"
sidebar_label: "TSD (KO)"
sidebar_position: 2
---

# SWIDA — 기술 사양 문서 (TSD)

> **버전:** 1.1.0
> **날짜:** 2026년 3월 25일
> **상태:** 초안
> **기반 문서:** SWIDA PRD v1.1 (업데이트됨 — Admin Web을 주요 관리 인터페이스로, Strapi 관리자 패널은 개발자 전용으로 변경)
> **작성자:** 엔지니어링 팀

---

## 목차

1. [소개](#1-소개)
2. [기술 스택 및 버전 매트릭스](#2-기술-스택-및-버전-매트릭스)
3. [아키텍처 개요](#3-아키텍처-개요)
4. [데이터베이스 설계](#4-데이터베이스-설계)
5. [Strapi 백엔드 — 콘텐츠 타입 및 API 계약](#5-strapi-백엔드--콘텐츠-타입-및-api-계약)
6. [프론트엔드 아키텍처 — Customer Web (Next.js)](#6-프론트엔드-아키텍처--customer-web-nextjs)
7. [인프라 및 DevOps](#7-인프라-및-devops)
8. [보안 아키텍처](#8-보안-아키텍처)
9. [캐싱 전략](#9-캐싱-전략)
10. [국제화 (i18n)](#10-국제화-i18n)
11. [SEO 전략](#11-seo-전략)
12. [테스트 전략](#12-테스트-전략)
13. [모니터링 및 관찰 가능성](#13-모니터링-및-관찰-가능성)
14. [부록](#14-부록)

---

## 1. 소개

### 1.1 목적

본 기술 사양 문서(TSD)는 SWIDA 제품 요구사항 문서(PRD)를 구체적인 아키텍처 결정, 기술 선택, 데이터베이스 스키마, API 계약, 그리고 SWIDA 플랫폼 구축 및 배포에 필요한 인프라 구성으로 변환합니다.

### 1.2 범위

본 TSD는 한국 시장을 대상으로 하는 마사지 및 웰니스 업체 탐색 플랫폼인 SWIDA의 MVP 구현을 다룹니다. Strapi CMS 백엔드(헤드리스 API 전용), Next.js Customer Web(고객용 프론트엔드), Next.js Admin Web(관리자용 프론트엔드), PostgreSQL + PostGIS 데이터베이스 레이어, 지원 인프라(Nginx, Redis, MinIO), 그리고 Cloudflare 엣지 레이어를 포함합니다. Strapi의 내장 관리자 패널은 개발자가 모니터링 및 디버깅 목적으로만 사용하도록 제한됩니다.

### 1.3 표기 규칙

- **도메인 플레이스홀더:** `{{DOMAIN}}` (예: `swida.com`), `{{ADMIN_DOMAIN}}` (예: `admin.swida.com`), `{{API_DOMAIN}}` (예: `api.swida.com`)
- **환경 참조:** `development`, `staging`, `production`
- 특별히 명시되지 않는 한 모든 시간은 **KST(한국 표준시, UTC+9)** 기준

---

## 2. 기술 스택 및 버전 매트릭스

### 2.1 PRD와의 아키텍처 정렬

PRD는 Strapi를 **헤드리스 API 전용 백엔드**로, **커스텀 Next.js 관리 웹 애플리케이션(Admin Web)**을 주요 관리 인터페이스로 지정합니다. Strapi의 내장 관리자 패널은 모니터링, 디버깅, 긴급 운영을 위한 **개발자 전용 접근으로 제한**되며, 일상적인 플랫폼 관리에는 사용하지 않습니다. 고객용 및 관리자용 프론트엔드 모두 Next.js 애플리케이션입니다. 이를 통해 React 18(Strapi 관리자)과 React 19(Next.js 16) 간의 버전 충돌이 해소되고, 전체 프론트엔드 스택을 최신 버전으로 운영할 수 있습니다.

### 2.2 고정 버전

아래 모든 버전은 2026년 3월 기준 LTS 상태, 활성 보안 지원, 상호 호환성, 그리고 미지원 종료 여부를 기준으로 선택되었습니다.

| 기술 | 버전 | LTS / 지원 종료 | 비고 |
|---|---|---|---|
| **Node.js** | `24.11.0` | Active LTS → 2028년 4월 | 최신 Active LTS. Strapi v5는 Node 20, 22, 24를 지원. 네이티브 TypeScript 타입 스트리핑 안정화. npm v11 포함. |
| **pnpm** | `10.x` (최신 10.x 안정 버전) | 활성 | 모노레포용 워크스페이스 프로토콜. 루트 `package.json`의 `packageManager`에 Corepack으로 고정. |
| **Turborepo** | `2.x` (최신 2.x 안정 버전) | 활성 | 원격 캐싱 기능을 갖춘 모노레포 빌드 오케스트레이터. |
| **Strapi** | `5.39.0` | 활성 (v5 최신 안정 버전) | 헤드리스 API 전용 — 내장 관리자 패널은 개발자의 모니터링/디버깅 용도로만 제한. |
| **Next.js** | `16.2.1` | 활성 (최신 안정 버전) | 2026년 3월 기준 최신 안정 버전. Turbopack이 기본으로 안정화. 모든 RSC CVE 패치 완료(§2.4 참조). |
| **React** | `19.2.4` | 활성 (최신 안정 버전) | Admin Web 및 Customer Web 모두 공유. 모든 RSC 보안 패치 포함. |
| **TypeScript** | `5.9.x` | 활성 | 최신 안정 버전. `packages/`의 `tsconfig` 베이스를 통해 전 워크스페이스에서 공유. |
| **PostgreSQL** | `17.9` | 지원 → 2029년 11월 | PG 17 안정 버전의 최신 패치. PG 18은 사용 가능하나 PostGIS 생태계는 17에서 더 검증됨. |
| **PostGIS** | `3.6.2` | 활성 | PostgreSQL 14–18 호환. 주변 검색(`ST_Distance`, `ST_DWithin`)에 필요. |
| **Redis** | `7.4.x` | Active LTS | 오리진에서 API 응답 캐싱. |
| **MinIO** | `RELEASE.2026-03-xx` (최신 안정 버전) | 롤링 릴리즈 | 쇼핑 이미지용 S3 호환 오브젝트 스토리지. Docker에서 특정 `RELEASE` 태그로 고정. |
| **Nginx** | `1.26.x` (최신 안정 버전) | 안정 브랜치 | 오리진 리버스 프록시. |
| **Docker** | `27.x` | 활성 | 컨테이너 런타임. |
| **Docker Compose** | `2.x` | 활성 | 개발 및 프로덕션용 멀티 컨테이너 오케스트레이션. |
| **next-intl** | `4.8.3` | 활성 | Next.js용 경로 기반 i18n 라우팅. v4.4부터 Next.js 16.x 호환. |
| **Tailwind CSS** | `4.x` (최신 안정 버전) | 활성 | Next.js 16이 기본으로 Tailwind v4 스캐폴딩. `@tailwindcss/postcss` 사용. |
| **Headless UI** | `2.2.9` | 활성 | 스타일 없는 접근성 컴포넌트. React 19 호환. |

### 2.3 주요 버전 결정 및 근거

**Next.js 16.2.1(최신)을 선택한 이유:**

Admin Web과 Customer Web 모두 커스텀 Next.js 애플리케이션이고 Strapi가 헤드리스(API 전용)로 동작하기 때문에 React 버전 충돌이 없습니다. Next.js 16.2.1은 React 19.2.x, 기본으로 안정화된 Turbopack, 현저히 빠른 개발 서버 시작(16.1 대비 ~87% 향상), 그리고 모든 RSC 보안 패치를 포함합니다. `16.2.1` 릴리즈에는 CVE-2026-23864 및 이전 모든 RSC CVE 수정이 포함됩니다(§2.4 참조).

**Node.js 24 LTS를 선택한 이유:**

Node.js 24는 현재 Active LTS(EOL 2028년 4월)이며 2026년 신규 프로젝트에 권장되는 선택입니다. npm v11(설치 속도 65% 향상), 안정화된 네이티브 TypeScript 타입 스트리핑, V8 엔진 업그레이드를 포함합니다. Strapi v5는 Node 24를 공식 지원합니다. Node 24는 기본 보안 레벨 2의 OpenSSL 3.5를 사용하여 더 강력한 암호화 기본값을 제공합니다.

**Tailwind CSS v4를 v3 대신 선택한 이유:**

Next.js 16이 기본으로 Tailwind v4를 스캐폴딩하며 레거시 PostCSS 플러그인 대신 `@tailwindcss/postcss`를 사용합니다. Tailwind v4는 새로운 엔진, CSS 우선 설정, 현저히 빠른 빌드 시간을 제공합니다. 그린필드 프로젝트이므로 마이그레이션 우려가 없습니다.

**PostgreSQL 18 대신 17을 선택한 이유:**

PostgreSQL 18이 사용 가능하지만(2026년 2월 기준 18.3), PG 18용 PostGIS 3.6.2 Docker 이미지는 출시된 지 얼마 되지 않아 충분히 검증되지 않았습니다. PG 17.9는 최신 패치 버전으로 PostGIS 3.6.2를 완전히 지원하며 광범위한 프로덕션 검증을 거쳤습니다.

### 2.4 호환성 매트릭스

```
Node.js 24.11.0
├── Strapi 5.39.0 ✓ (Node 20/22/24 지원)
├── Next.js 16.2.1 ✓ (Node 20.9+ 지원)
├── pnpm 10.x ✓ (Node 18+ 지원)
└── Turborepo 2.x ✓ (Node 18+ 지원)

React 19.2.4
├── Next.js 16.2.1 ✓ (React 19.x 포함)
├── next-intl 4.8.3 ✓ (React 18+, v4.4부터 Next.js 16 지원)
├── Headless UI 2.2.9 ✓ (React 19 지원)
└── Tailwind CSS 4.x ✓ (CSS 프레임워크, React 무관)

PostgreSQL 17.9
├── PostGIS 3.6.2 ✓ (PG 14–18 지원)
├── Strapi 5.39.0 ✓ (Knex.js를 통한 PG 지원)
└── pg_trgm extension ✓ (PG 기본 contrib에 포함)
```

### 2.5 보안 권고 — React Server Components (긴급)

Next.js App Router에서 사용되는 RSC(React Server Components) 프로토콜은 2025년 12월부터 다수의 심각(Critical) 및 높음(High) 등급 취약점의 대상이 되었습니다. 이는 SWIDA의 Admin Web과 Customer Web(App Router를 사용하는 Next.js) 모두에 직접적인 영향을 미칩니다. 아래의 패치된 버전들은 **필수 최소 요건**입니다 — 패치되지 않은 버전은 절대 배포하지 마십시오.

| CVE | 심각도 | CVSS | 설명 | 공개일 | 패치 버전 (16.x) |
|---|---|---|---|---|---|
| CVE-2025-55182 | **긴급** | 10.0 | RSC Flight 프로토콜의 안전하지 않은 역직렬화를 통한 원격 코드 실행 | 2025-12-03 | `16.0.7` |
| CVE-2025-66478 | **긴급** | 10.0 | CVE-2025-55182의 Next.js 전용 추적 CVE | 2025-12-03 | `16.0.7` |
| CVE-2025-55184 | **높음** | 7.5 | DoS — App Router 엔드포인트에 대한 조작된 HTTP 요청으로 인한 무한 루프 | 2025-12-11 | `16.0.10` |
| CVE-2025-67779 | **높음** | 7.5 | CVE-2025-55184 불완전 수정 — 재업그레이드 필요 | 2025-12-11 | `16.0.10` |
| CVE-2025-55183 | **보통** | 5.3 | 소스 코드 노출 — Server Functions가 하드코딩된 시크릿을 포함한 컴파일된 소스 반환 | 2025-12-11 | `16.0.10` |
| CVE-2026-23864 | **높음** | 7.5 | DoS — Server Function 엔드포인트에 대한 조작된 HTTP 요청으로 인한 메모리 고갈 / 과도한 CPU 사용 | 2026-01-26 | `16.0.11` / **`16.1.5`** / **`16.2.1`** |

**SWIDA 고정 버전: `next@16.2.1`** — 위 6개 CVE 전체 수정 포함. `react@19.2.4`는 React 레벨의 기반 취약점을 해결합니다.

**SWIDA 배포 시 핵심 사항:**

- **모든 CVE는 인증 전 단계** — 자격증명 없이도 악용 가능하므로 WAF 수준의 보호가 필수입니다(Cloudflare WAF 관리 룰셋이 이를 커버합니다).
- **App Router 사용 시만 악용 가능** — Pages Router는 영향받지 않습니다. SWIDA는 Admin Web과 Customer Web 모두 App Router를 사용하므로 모든 엔드포인트가 범위에 해당합니다.
- **Cloudflare WAF 완화:** Cloudflare는 CVE-2025-55182 및 CVE-2026-23864에 대한 관리형 WAF 규칙을 배포했습니다. Cloudflare 관리형 룰셋이 활성화되어 있는지 확인하십시오(§7.4 참조). WAF 규칙은 심층 방어를 제공하지만 **패치의 대체재가 아닙니다**.
- **하드코딩된 시크릿 위험(CVE-2025-55183):** SWIDA는 Server Components나 Server Actions에 시크릿을 절대 하드코딩해서는 안 됩니다. 모든 시크릿은 런타임에 접근되는 환경 변수에 보관되어야 합니다 — TSD의 환경 변수 전략(§14.1)에서 이미 강제하고 있습니다.
- **지속적인 경계:** RSC 프로토콜은 반복적인 취약점 공개(초기 수정 → 우회 → 재수정 패턴)의 대상이었습니다. 팀은 Next.js 보안 권고 및 React 블로그를 구독하고, RSC 관련 CVE를 24–48시간 내 배포 목표의 긴급 패치로 취급해야 합니다.

**업그레이드 검증 명령어:**

```bash
# 설치된 Next.js 버전에 모든 패치가 포함되어 있는지 확인
npx next --version  # 반드시 >= 16.2.1
# React 버전에 모든 RSC 패치가 포함되어 있는지 확인
npm ls react react-dom  # 반드시 >= 19.2.4
# 취약한 React RSC 패키지가 없는지 확인
npm ls react-server-dom-webpack react-server-dom-turbopack 2>/dev/null
```

---

## 3. 아키텍처 개요

### 3.1 고수준 아키텍처

```
                        ┌──────────────────────────────┐
                        │        Cloudflare 엣지        │
                        │  DNS, CDN, WAF, DDoS, SSL    │
                        └──────────────┬───────────────┘
                                       │
                        ┌──────────────▼───────────────┐
                        │      Nginx (리버스 프록시)     │
                        │   오리진 접근: CF IP만 허용    │
                        └──┬──────────┬──────────┬──┬──┘
                           │          │          │  │
              ┌────────────▼──┐ ┌─────▼──────┐ ┌▼──▼────────┐
              │  Strapi CMS   │ │ Customer   │ │  Admin     │
              │ (헤드리스     │ │ Web        │ │  Web       │
              │  API 전용)    │ │ (Next.js)  │ │ (Next.js)  │
              │  포트: 1337   │ │ 포트: 3000 │ │ 포트: 3001 │
              └───────┬───────┘ └─────┬──────┘ └────────────┘
                      │               │
              ┌───────▼───────┐ ┌─────▼──────┐  ┌───────────┐
              │  PostgreSQL   │ │   Redis    │  │   MinIO   │
              │  + PostGIS    │ │  (캐시)    │  │ (S3 호환  │
              │  포트: 5432   │ │ 포트: 6379 │  │  스토리지)│
              └───────────────┘ └────────────┘  │ 포트: 9000│
                                                └───────────┘
```

### 3.2 도메인 라우팅 (Nginx)

| 도메인 | 업스트림 | 용도 |
|---|---|---|
| `{{DOMAIN}}` (www) | Next.js Customer Web `:3000` | 고객용 웹 앱 |
| `{{API_DOMAIN}}` | Strapi `:1337/api` | 공개 REST API (양쪽 프론트엔드에서 소비) |
| `{{ADMIN_DOMAIN}}` | Next.js Admin Web `:3001` | 커스텀 관리자 대시보드 및 관리 |

### 3.3 데이터 흐름

**읽기 경로 (고객 탐색):**
`고객 브라우저 → Cloudflare 엣지 캐시 → Nginx → Next.js (SSR/ISR) → Strapi REST API → Redis 캐시 → PostgreSQL`

**쓰기 경로 (리뷰 제출):**
`고객 브라우저 → Cloudflare → Nginx → Next.js (API 라우트 / 서버 액션) → Strapi REST API → PostgreSQL → Redis 캐시 무효화`

**관리자 경로 (업체 관리):**
`관리자 브라우저 → Cloudflare → Nginx → Admin Web (Next.js) → Strapi Admin API → PostgreSQL`

**개발자 경로 (Strapi 내장 관리자 패널을 통한 모니터링/디버깅):**
`개발자 브라우저 → VPN/IP 화이트리스트 → Nginx → Strapi 내장 관리자 패널 → PostgreSQL`

**이미지 경로:**
`고객 브라우저 → Cloudflare CDN → Nginx (캐시 프록시) → MinIO`

---

## 4. 데이터베이스 설계

### 4.1 개요

Strapi v5는 콘텐츠 타입 정의(`src/api/*/content-types/*/schema.json` 아래의 JSON 스키마 파일)를 통해 데이터베이스 스키마를 자동으로 관리합니다. 아래 스키마는 Strapi가 자동 생성하는 PostgreSQL 테이블에 매핑되는 논리 데이터 모델을 나타냅니다. 직접적인 스키마 조작은 권장하지 않으며, 모든 변경은 Strapi의 Content-Type Builder 또는 스키마 JSON 파일을 통해 진행합니다.

### 4.2 PostGIS 설정

PostGIS는 Strapi 시작 전에 데이터베이스에서 활성화되어야 합니다. 이는 데이터베이스 초기화 스크립트에서 처리됩니다:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- 향후 퍼지 검색용
```

`postgis/postgis:17-3.6` Docker 이미지는 PostGIS가 사전 설치되어 있으며 최초 부팅 시 자동으로 익스텐션을 생성합니다.

### 4.3 엔티티 관계도 (논리적)

```
┌─────────┐     1:N     ┌───────────┐
│  Region │─────────────│  District  │
└─────────┘             └─────┬─────┘
                              │ 1:N
                        ┌─────▼─────┐      M:N     ┌─────────┐
                        │   Shop    │──────────────│  Theme  │
                        └─────┬─────┘              └─────────┘
                              │ 1:N
                        ┌─────▼─────┐
                        │  Review   │
                        └─────┬─────┘
                              │ N:1
                        ┌─────▼─────────────┐
                        │  User (customer)  │
                        └───────────────────┘

┌───────────────────────┐
│  Partnership Inquiry  │ ──(선택적)──→ Shop
└───────────────────────┘

┌───────────────────────┐
│      Audit Log        │
└───────────────────────┘
```

### 4.4 핵심 테이블 (Strapi 관리)

아래는 논리적 스키마입니다. Strapi는 실제 SQL 테이블, 컬럼명(snake_case), M:N 관계를 위한 조인 테이블, 컴포넌트 테이블을 자동 생성합니다.

#### 4.4.1 `regions`

| 컬럼 | 타입 | 제약 조건 | 비고 |
|---|---|---|---|
| id | serial | PK | 자동 생성 |
| document_id | varchar | Unique, Not Null | Strapi v5 문서 식별자 |
| name | varchar(100) | Not Null | 다국어(i18n): 서울특별시, Seoul |
| locale | varchar(10) | Not Null | `ko`, `en` |
| created_at | timestamptz | Not Null | 자동 |
| updated_at | timestamptz | Not Null | 자동 |
| published_at | timestamptz | Nullable | 초안 & 게시 |

#### 4.4.2 `districts`

| 컬럼 | 타입 | 제약 조건 | 비고 |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| name | varchar(100) | Not Null | 다국어: 강남구, Gangnam-gu |
| region_id | integer | FK → regions.id | 하나의 Region에 소속 |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | |

#### 4.4.3 `themes`

| 컬럼 | 타입 | 제약 조건 | 비고 |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| name | varchar(100) | Not Null | 다국어: 스웨디시, Swedish |
| slug | varchar(100) | Unique, Not Null | name에서 자동 생성 |
| display_order | integer | Nullable | 정렬 우선순위 |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | |

**미디어:** `icon` — 단일 미디어 관계 (선택적)

#### 4.4.4 `shops`

핵심 엔티티. 필드는 메인 테이블과 임베디드 컴포넌트 테이블에 분산됩니다.

**메인 테이블 필드:**

| 컬럼 | 타입 | 제약 조건 | 비고 |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| name | varchar(255) | Not Null | 다국어 |
| slug | varchar(255) | Unique, Not Null | name에서 UID 생성 |
| description | text | Not Null | 최대 500자 (앱 레벨 유효성 검사) |
| address | varchar(500) | Not Null | 다국어 |
| latitude | decimal(10,7) | Not Null | GPS 좌표 |
| longitude | decimal(10,7) | Not Null | GPS 좌표 |
| phone_number | varchar(20) | Nullable | |
| operating_hours | jsonb | Not Null | 요일별 구조화된 스케줄 (아래 형식 참조). 다국어 아님 — 시간은 범용. |
| operating_hours_text | varchar(200) | Nullable | 다국어. 비정기 영업시간 표시용 자유 텍스트 (예: "공휴일 휴무", "연중무휴"). 설정 시 계산된 스케줄 대신 표시. |
| last_order_time | varchar(100) | Nullable | |
| closed_days | varchar(200) | Not Null | 다국어 |
| holiday_exceptions | text | Nullable | 다국어 |
| price_range | varchar(50) | Nullable | |
| booking_required | boolean | Not Null | 기본값: false |
| booking_url_phone | varchar(255) | Nullable | |
| gender_availability | varchar(20) | Nullable | 열거형: all, female_only, male_only, couple_available |
| languages_supported | jsonb | Nullable | 언어 코드 배열 |
| last_verified_date | date | Nullable | |
| inactive_reason | varchar(20) | Nullable | 열거형: closed, owner_request, violation, stale, other |
| inactive_reason_detail | text | Nullable | "other"에 대한 자유 텍스트 |
| open_tag | varchar(50) | Nullable | 커스텀 레이블, 기본값: 영업중 |
| close_tag | varchar(50) | Nullable | 커스텀 레이블, 기본값: 영업종료 |
| average_rating | decimal(3,2) | Not Null, 기본값 0 | 라이프사이클 훅으로 계산 |
| total_reviews | integer | Not Null, 기본값 0 | 라이프사이클 훅으로 계산 |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | 공개 여부 제어 |

**관계:**
- `region_id` → `regions`로의 FK (다대일)
- `district_id` → `districts`로의 FK (다대일)
- `themes` → M:N 조인 테이블 `shops_themes_lnk`
- `images` → Strapi 미디어 (다수), `files` 테이블에 저장
- `thumbnail` → Strapi 미디어 (단일)

**임베디드 컴포넌트 (Strapi가 관리하는 별도 테이블):**
- `shop_service_menu_items` — 반복 가능 컴포넌트
- `shop_amenities` — 단일 컴포넌트
- `shop_contact_channels` — 단일 컴포넌트

#### 4.4.5 `reviews`

| 컬럼 | 타입 | 제약 조건 | 비고 |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| rating | integer | Not Null | CHECK: 1–5 |
| comment | text | Not Null | 10–500자 (앱 레벨) |
| status | varchar(20) | Not Null, 기본값 'published' | 열거형: published, hidden, under_review, deleted |
| moderation_reason | varchar(20) | Nullable | 열거형: spam, inappropriate, fake_review, irrelevant, other |
| report_count | integer | Not Null, 기본값 0 | |

> **참고:** `moderation_reason` 값(관리자 설정: `spam`, `inappropriate`, `fake_review`, `irrelevant`, `other`)은 사용자 신고 사유(`POST /api/reviews/:id/report`로 제출: `spam`, `fake`, `inappropriate`, `irrelevant`, `other`)와 다릅니다. `fake`(사용자 신고) vs `fake_review`(관리자 모더레이션)에 유의하세요. 신고 사유는 리뷰 레코드에 저장되지 않으며, 신고 요청 본문의 일부로 전송됩니다(PRD §8.5).
| author_id | integer | FK → up_users.id | |
| shop_id | integer | FK → shops.id | |
| published_at | timestamptz | Nullable | |

**i18n 없음** — 리뷰는 작성된 언어로 저장됩니다.

#### 4.4.6 `partnership_inquiries`

| 컬럼 | 타입 | 제약 조건 | 비고 |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| shop_name | varchar(255) | Not Null | |
| contact_person | varchar(100) | Not Null | |
| phone_number | varchar(20) | Not Null | |
| email | varchar(255) | Nullable | |
| address | varchar(500) | Not Null | |
| business_type | varchar(100) | Nullable | |
| preferred_contact_channel | varchar(20) | Not Null | 열거형: phone, kakaotalk, instagram, email |
| message | text | Nullable | |
| status | varchar(20) | Not Null, 기본값 'new' | 열거형: new, contacted, awaiting_info, approved, rejected, published |
| source | varchar(20) | Not Null | 열거형: website_form, email, kakaotalk, instagram |
| admin_notes | text | Nullable | 공개 API에 노출 안 됨 |
| linked_shop_id | integer | FK → shops.id, Nullable | |

#### 4.4.7 `audit_logs`

| 컬럼 | 타입 | 제약 조건 | 비고 |
|---|---|---|---|
| id | serial | PK | |
| content_type | varchar(100) | Not Null | 예: `api::shop.shop` |
| document_id | varchar | Not Null | 수정된 문서의 ID |
| action | varchar(20) | Not Null | `create`, `update`, `delete`, `publish`, `unpublish` |
| admin_user_id | integer | FK → admin_users.id | 변경한 사람 |
| field_diffs | jsonb | Nullable | `{ field: { before, after } }` |
| created_at | timestamptz | Not Null | |

### 4.5 인덱스

Strapi가 자동 생성하는 인덱스(PK, FK, 고유 제약) 외에, 다음 커스텀 인덱스를 Strapi 부트스트랩 스크립트 또는 마이그레이션을 통해 생성해야 합니다:

```sql
-- 주변 검색을 위한 지리 공간 인덱스 (성능에 중요)
CREATE INDEX idx_shops_geography ON shops
  USING GIST (ST_MakePoint(longitude, latitude)::geography);

-- 전문/퍼지 검색 준비
CREATE INDEX idx_shops_name_trgm ON shops
  USING GIN (name gin_trgm_ops);

-- 필터 쿼리를 위한 복합 인덱스
CREATE INDEX idx_shops_published_rating ON shops (published_at, average_rating DESC)
  WHERE published_at IS NOT NULL;

-- 업체별 리뷰 쿼리
CREATE INDEX idx_reviews_shop_status ON reviews (shop_id, status, created_at DESC);

-- 지역별 구/군 조회
CREATE INDEX idx_districts_region ON districts (region_id);
```

### 4.6 시드 데이터

Strapi 부트스트랩 스크립트(`database/seeds/`)를 통해 출시 시 미리 시드됩니다:

- **지역(Regions):** 대한민국 17개 시/도(광역시 + 도) 전체, `ko` 및 `en` 로케일
- **구/군(Districts):** 각 지역 아래의 모든 시/군/구(약 250개 항목), 양쪽 로케일
- **테마(Themes):** 초기 마사지 테마 9개(PRD §9.3 참조), 양쪽 로케일

---

## 5. Strapi 백엔드 — 콘텐츠 타입 및 API 계약

### 5.1 콘텐츠 타입 요약

| 콘텐츠 타입 | API ID | 타입 | i18n | 초안 & 게시 |
|---|---|---|---|---|
| Shop | `api::shop.shop` | 컬렉션 | 예 | 예 |
| Review | `api::review.review` | 컬렉션 | 아니오 | 예 |
| Theme | `api::theme.theme` | 컬렉션 | 예 | 예 |
| Region | `api::region.region` | 컬렉션 | 예 | 예 |
| District | `api::district.district` | 컬렉션 | 예 | 예 |
| Partnership Inquiry | `api::partnership-inquiry.partnership-inquiry` | 컬렉션 | 아니오 | 아니오 |
| Audit Log | `api::audit-log.audit-log` | 컬렉션 | 아니오 | 아니오 |

**컴포넌트:**

| 컴포넌트 | 네임스페이스 | 타입 |
|---|---|---|
| Service Menu Item | `shop.service-menu-item` | 반복 가능 |
| Amenities | `shop.amenities` | 단일 |
| Contact Channels | `shop.contact-channels` | 단일 |

### 5.2 REST API 엔드포인트

모든 공개 엔드포인트는 게시된 콘텐츠만 제공합니다(Strapi v5 기본 동작). 로케일은 `?locale=ko` 또는 `?locale=en`으로 전달합니다.

#### 5.2.1 업체(Shops)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|---|---|---|---|
| GET | `/api/shops` | 공개 | 업체 목록 (페이지네이션, 필터, 정렬 가능) |
| GET | `/api/shops/:documentId` | 공개 | 단일 업체 상세 |
| GET | `/api/shops/nearby` | 공개 | **커스텀 컨트롤러** — 지리 공간 주변 검색 |

> **참고:** 고객 웹은 슬러그 기반 라우트(`/[locale]/shop/[slug]`)를 사용하므로, `documentId` 대신 `GET /api/shops?filters[slug][$eq]={slug}&locale={locale}`로 업체 상세를 조회합니다. `documentId` 기반 엔드포인트는 Admin Web 및 내부 참조에서 사용됩니다.

**GET `/api/shops` — 쿼리 파라미터:**

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

**응답 형식 (목록):**

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

**GET `/api/shops/nearby` — 커스텀 컨트롤러:**

```
?lat=37.5665
&lng=126.9780
&radius=5000          // 미터 단위, 기본값 5000, 최소 1000, 최대 10000
&locale=ko
&pagination[page]=1
&pagination[pageSize]=20
```

응답에는 각 업체에 `distance` 필드(미터)가 포함됩니다. 거리 오름차순으로 정렬됩니다.

**구현:** `src/api/shop/controllers/shop.ts`의 커스텀 컨트롤러가 Knex를 통해 PostGIS 원시 SQL을 실행합니다:

```typescript
// 단순화된 코드 — 전체 구현은 코드베이스 참조
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

**커스텀 라우트 등록** — `src/api/shop/routes/shop.ts`:

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

#### 5.2.2 리뷰(Reviews)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|---|---|---|---|
| GET | `/api/reviews` | 공개 | 게시된 리뷰 목록 (피드) |
| POST | `/api/reviews` | 고객 (JWT) | 새 리뷰 제출 |
| POST | `/api/reviews/:id/report` | 고객 (JWT) | 리뷰 신고 |

**POST `/api/reviews` — 요청 본문:**

```json
{
  "data": {
    "rating": 5,
    "comment": "정말 좋았습니다! 분위기도 좋고 마사지도 시원해요.",
    "shop": "abc123"
  }
}
```

`author`는 인증된 사용자의 JWT에서 자동으로 설정됩니다. 사용자 계정 잠금 여부를 확인하는 커스텀 정책으로 검증됩니다.

#### 5.2.3 테마, 지역, 구/군

| 메서드 | 엔드포인트 | 인증 | 설명 |
|---|---|---|---|
| GET | `/api/themes` | 공개 | 게시된 모든 테마 |
| GET | `/api/regions` | 공개 | 게시된 모든 지역 |
| GET | `/api/districts?filters[region][documentId][$eq]=xxx` | 공개 | 지역으로 필터링된 구/군 |

이들은 커스텀 컨트롤러 없이 Strapi가 자동 생성하는 단순 엔드포인트입니다.

#### 5.2.4 파트너십 문의(Partnership Inquiries)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|---|---|---|---|
| POST | `/api/partnership-inquiries` | 공개 | 문의 제출 (폼) |

공개 역할 권한: `create`만 허용. 공개 역할에는 `find`, `findOne`, `update`, `delete` 불허.

#### 5.2.5 대시보드 분석(Dashboard Analytics)

| 메서드 | 엔드포인트 | 인증 | 설명 |
|---|---|---|---|
| GET | `/api/dashboard/stats` | 관리자 (JWT) | **커스텀 컨트롤러** — 집계된 플랫폼 통계 |

**위치:** `src/api/dashboard/controllers/dashboard.ts`
**라우트:** `src/api/dashboard/routes/dashboard.ts`

**응답 형태:**

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

**구현:** Strapi Document Service API를 사용하여 업체, 리뷰, 사용자, 파트너십 문의에 대한 집계 쿼리(`strapi.documents().count()`)를 실행합니다. `recent_activity` 필드는 `audit-log` 컬렉션 타입에서 최근 10개 항목을 쿼리합니다. 이 엔드포인트는 관리자 API JWT를 통해 인증된 관리자 사용자만 접근 가능합니다.

### 5.3 커스텀 미들웨어, 정책 및 라이프사이클 훅

#### 5.3.1 미들웨어: `account-lock`

**위치:** `src/middlewares/account-lock.ts`
**목적:** 잠긴 고객 계정의 쓰기 요청 차단.
**동작:** Strapi 내장 필드인 `up_users.blocked`를 확인합니다. `true`이면 메시지와 함께 `403 Forbidden` 반환: `"계정이 정지되었습니다. 관리자에게 문의해주세요."` / `"Your account has been suspended. Please contact the administrator."`
**적용 대상:** `POST /api/reviews`, `POST /api/reviews/:id/report`

#### 5.3.2 정책: `is-active-shop`

**위치:** `src/api/shop/policies/is-active-shop.ts`
**목적:** 게시된 업체만 반환되도록 추가 보호. Strapi v5는 기본적으로 초안을 제외하지만, 이 정책은 심층 방어를 제공합니다.
**적용 대상:** `GET /api/shops/:documentId`

#### 5.3.3 라이프사이클 훅: 리뷰 평점 재계산

**위치:** `src/api/review/content-types/review/lifecycles.ts`
**트리거:** `afterCreate`, `afterUpdate`, `afterDelete`
**동작:**

1. 리뷰에서 상위 업체를 식별
2. `status = 'published'`인 해당 업체의 모든 리뷰 조회
3. 새 `average_rating`(소수점 2자리 반올림) 및 `total_reviews` 계산
4. Document Service API를 통해 업체 문서 업데이트

```typescript
// 단순화된 코드
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

#### 5.3.4 라이프사이클 훅: 감사 로그

**위치:** `src/api/shop/content-types/shop/lifecycles.ts`
**트리거:** `beforeUpdate`(이전 값 캡처용), `afterUpdate`, `afterCreate`, `afterDelete`
**동작:** 필드 수준 차이를 캡처하고, `strapi.requestContext`의 관리 API JWT에서 추출한 관리자 사용자 정보와 함께 `audit-log` 컬렉션 타입에 기록합니다.

### 5.4 인증

#### 5.4.1 고객 인증 (Strapi Users & Permissions)

- **기본 제공자:** 이메일/비밀번호 회원가입
- **소셜 제공자:** 카카오, 네이버 — Strapi Users & Permissions 플러그인을 확장하는 커스텀 제공자로 구현
- **JWT:** 로그인 시 Strapi에서 발급, 보안을 위해 localStorage 대신 httpOnly 쿠키에 클라이언트 측 저장 권장
- **토큰 유효 기간:** 7일 (`plugins.ts`를 통해 설정 가능)

**커스텀 제공자 위치:** `src/extensions/users-permissions/`

#### 5.4.2 관리자 인증

**Admin Web 인증:** Admin Web(Next.js)은 Strapi의 관리자 API 엔드포인트(`/admin/login`)에 이메일/비밀번호 자격증명으로 인증합니다. Strapi가 JWT 토큰을 반환하면 Admin Web이 이를 저장하여 Strapi 관리자 API 엔드포인트에 대한 후속 요청에 사용합니다. 권한이 부여된 관리자 사용자만 Admin Web에 로그인할 수 있으며, 고객, 업체 소유자, 개발자는 접근할 수 없습니다.

**Strapi 내장 관리자 패널 인증:** 모니터링 및 디버깅을 위한 개발자 전용 접근. Strapi의 내장 세션 기반 JWT 인증을 사용합니다. Strapi 내장 관리자 패널(`{{API_DOMAIN}}/admin`)에 대한 접근은 Nginx IP 화이트리스트(개발자 IP 또는 VPN 범위만)를 통해 제한됩니다.

### 5.5 Strapi 플러그인

| 플러그인 | 목적 | 설정 비고 |
|---|---|---|
| Users & Permissions | 고객 인증 | 카카오/네이버 제공자 확장 |
| i18n | 콘텐츠 현지화 | 기본 로케일: `ko`, 추가: `en` |
| Upload | 미디어 관리 | 제공자: MinIO를 가리키는 `@strapi/provider-upload-aws-s3` |
| 커스텀 캐시 미들웨어 | API 응답 캐싱 | Redis 기반 커스텀 Strapi 미들웨어 (`src/middlewares/api-cache.ts`), 라이프사이클 훅으로 무효화. 캐시 키 및 무효화 로직의 완전한 제어를 위해 플러그인 대신 선택. |

### 5.6 Admin Web 기능 (Next.js)

다음 기능들은 Strapi 관리자 플러그인이 아닌 Admin Web(Next.js) 애플리케이션 내의 페이지/컴포넌트로 구축됩니다:

| 기능 | 설명 |
|---|---|
| 대시보드 | 플랫폼 통계: 전체 업체, 리뷰, 사용자, 문의 수. 커스텀 분석 엔드포인트(`GET /api/dashboard/stats`, §5.2.5)에서 데이터를 가져오는 Next.js 페이지로 구축. |
| 지도 핀 드롭 | 업체 등록 또는 수정 시 위도/경도 선택을 위한 통합 지도 컴포넌트(카카오맵). 고객 웹 업체 상세 페이지에서도 정적 지도로 사용. Admin Web 내 React 컴포넌트로 구축. |
| 업체 CRUD | 검색, 필터, 정렬 기능을 갖춘 업체 목록 생성, 조회, 수정, 삭제 인터페이스. |
| 리뷰 모더레이션 | 고객 리뷰 조회, 신고, 숨김, 관리. |
| 파트너십 문의 관리 | 상태 워크플로우를 통한 입력 제휴 요청 추적 및 관리. |
| 고객 계정 관리 | 고객 계정 잠금/해제, 활동 조회. |
| 콘텐츠 관리 | 테마, 지역, 구/군, 편의시설 옵션 관리. |
| 로케일 관리 | Admin Web의 로케일 전환기를 통해 Strapi i18n API를 호출하여 현지화된 콘텐츠(한국어/영어) 생성 및 관리. |
| 감사 로그 뷰어 | 모든 목록 변경 내역의 검색 가능하고 필터 가능한 테이블. |

> **참고:** Strapi의 내장 관리자 패널은 이러한 운영 기능에 사용하지 않습니다. 개발자의 모니터링 및 디버깅 목적으로만 제한됩니다.

---

## 6. 프론트엔드 아키텍처 — Customer Web (Next.js)

### 6.1 프로젝트 구조

```
apps/customer-web/
├── app/
│   └── [locale]/                    # ko | en
│       ├── layout.tsx               # 루트 레이아웃 — 로케일 제공자, 네비게이션, 푸터
│       ├── page.tsx                  # 홈페이지
│       ├── shop/
│       │   └── [slug]/
│       │       └── page.tsx         # 업체 상세 (ISR)
│       ├── theme/
│       │   └── [theme-slug]/
│       │       └── page.tsx         # 테마 탐색 (SSG)
│       ├── location/
│       │   └── [level1]/
│       │       └── [level2]/
│       │           └── page.tsx     # 위치 탐색 (SSG)
│       ├── search/
│       │   └── page.tsx             # 상세 검색 (SSR)
│       ├── nearby/
│       │   └── page.tsx             # 주변 검색 (CSR)
│       ├── reviews/
│       │   └── page.tsx             # 리뷰 피드 (SSR)
│       ├── partnership/
│       │   └── page.tsx             # 제휴 랜딩 (SSG)
│       ├── auth/
│       │   ├── login/
│       │   │   └── page.tsx         # 로그인 페이지
│       │   └── callback/
│       │       └── page.tsx         # OAuth 콜백
│       └── not-found.tsx
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
│   │   ├── NearbySearch.tsx         # 클라이언트 컴포넌트 (GPS)
│   │   └── DistanceLabel.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       └── Skeleton.tsx
├── lib/
│   ├── strapi.ts                    # Strapi API 클라이언트 래퍼
│   ├── api/
│   │   ├── shops.ts                 # 업체 관련 API 호출
│   │   ├── themes.ts
│   │   ├── regions.ts
│   │   ├── reviews.ts
│   │   └── partnership.ts
│   ├── hooks/
│   │   ├── useGeolocation.ts
│   │   └── useAuth.ts
│   └── utils/
│       ├── format.ts                # 통화, 날짜 포맷 (KRW, KST)
│       └── seo.ts                   # 메타 태그 생성기
├── messages/
│   ├── ko.json                      # 한국어 UI 문자열
│   └── en.json                      # 영어 UI 문자열
├── middleware.ts                     # 로케일 감지, / → /ko 리다이렉트
├── i18n.ts                          # next-intl 설정
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### 6.2 렌더링 전략

| 페이지 | 전략 | 재검증 | 근거 |
|---|---|---|---|
| 홈페이지 | SSG + ISR | 300초 (5분) | 비교적 정적, 주요 업체/테마 표시 |
| 업체 상세 | ISR | 60초 | 콘텐츠 업데이트(리뷰, 평점)의 실시간 반영 필요 |
| 테마 탐색 | SSG | 온디맨드 (웹훅) | 테마 목록은 거의 변경되지 않음 |
| 위치 탐색 | SSG | 온디맨드 (웹훅) | 위치 계층 구조는 정적 |
| 상세 검색 | SSR | N/A | 동적 필터/정렬 조합, SSG로 캐싱 불가 |
| 주변 검색 | CSR | N/A | 클라이언트 측 GPS 필요, 완전 동적 |
| 리뷰 피드 | SSR | N/A | 최신 리뷰 반영 필요 |
| 제휴 | SSG | 온디맨드 | 정적 콘텐츠 페이지 |
| 로그인/콜백 | CSR | N/A | 인증 흐름, SEO 가치 없음 |

**온디맨드 재검증:** Strapi 웹훅이 콘텐츠 게시/업데이트 시 Next.js 재검증을 트리거합니다.

**웹훅 설정:**
- **Next.js 재검증 엔드포인트:** `POST /api/revalidate` (Customer Web과 Admin Web 모두의 커스텀 API 라우트)
- **인증:** 웹훅 요청은 `x-revalidate-secret` 헤더에 전달되는 공유 시크릿(`REVALIDATION_SECRET` 환경 변수)으로 검증
- **페이로드:** `{ "model": "shop", "documentId": "abc123", "event": "entry.publish" }`
- **트리거 대상:** shop, review, theme, region, district 콘텐츠 타입의 `afterCreate`, `afterUpdate`, `afterDelete` Strapi 라이프사이클 훅
- **실패 처리:** 웹훅 실패는 로그에 기록되지만 Strapi 작업을 차단하지 않음. 폴백으로 ISR 시간 기반 재검증을 통해 이전 콘텐츠가 계속 제공됨.

### 6.3 Strapi API 클라이언트

**`lib/strapi.ts`** — 다음을 수행하는 `fetch` 래퍼:

1. 환경 변수 `STRAPI_API_URL`에서 Strapi API 기본 URL 추가
2. 현재 라우트 세그먼트의 `locale` 파라미터 전달
3. Strapi 응답 형식 처리(`data`, `meta` 언래핑)
4. 서버 측 호출에 API 토큰 추가(`STRAPI_API_TOKEN`) — 읽기 전용 API 토큰
5. `packages/shared-types`의 TypeScript 타입으로 오류 처리 구현

```typescript
// 단순화된 코드
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

### 6.4 핵심 프론트엔드 패턴

**URL에 필터 상태 저장:** 모든 검색 필터는 `useSearchParams()`를 통해 URL 쿼리 파라미터로 직렬화됩니다. 이를 통해:
- 검색 결과의 공유 및 북마크 가능
- 뒤로 가기 시 상태 유지
- 검색 결과 페이지의 SEO 지원 (`noindex` 처리되지만)

**계단식 위치 드롭다운:** `LocationCascade` 컴포넌트가 마운트 시 지역을 가져오고, 지역 선택 시 구/군을 가져옵니다. 두 호출 모두 적극적으로 캐싱됩니다(지역/구/군 데이터는 거의 변경되지 않음).

**GPS 주변 검색:** `NearbySearch` 컴포넌트는 클라이언트 컴포넌트(`"use client"`)로:
1. `navigator.geolocation.getCurrentPosition()` 요청
2. 커스텀 `/api/shops/nearby` 엔드포인트 호출
3. 거리 레이블과 함께 결과 렌더링

**영업/종료 태그:** `OpenCloseTag` 컴포넌트가 업체의 `operating_hours` JSON을 `Intl.DateTimeFormat`의 `timeZone: 'Asia/Seoul'`을 사용하여 현재 KST 시간과 비교하여 적절한 태그를 표시합니다. `operating_hours_text`가 설정된 경우 JSON 스케줄 계산 대신 해당 텍스트가 그대로 표시됩니다.

**`operating_hours` JSON 형식:**
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
- 키: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`
- 값: `{ "open": "HH:mm", "close": "HH:mm" }` 또는 `null` (해당 요일 휴무)
- 시간은 24시간 KST 형식. 야간 영업(예: `"open": "18:00", "close": "02:00"`)도 지원 — close 시간이 open 시간보다 이르면 다음 날로 간주.

### 6.5 이미지 처리

- 업체 이미지는 Nginx(캐시 프록시 역할)와 Cloudflare CDN을 통해 MinIO에서 제공
- MinIO/API 도메인용 `remotePatterns`이 설정된 Next.js `<Image>` 컴포넌트
- 반응형 이미지 크기: 썸네일(300w), 상세(800w, 1200w)
- WebP 변환: MVP 이후로 연기 (Cloudflare Pro+ 플랜 필요). MVP에서는 업로드된 형식(JPEG/PNG/WebP) 그대로 Nginx 캐시 및 Cloudflare CDN을 통해 제공. Next.js `<Image>` 컴포넌트가 클라이언트 측 반응형 크기 조정 처리.

---

## 7. 인프라 및 DevOps

### 7.1 온프레미스 서버 요구 사항

| 리소스 | 최소 (MVP) | 권장 |
|---|---|---|
| CPU | 4코어 | 8코어 |
| RAM | 8 GB | 16 GB |
| 스토리지 | 100 GB SSD | 250 GB NVMe SSD |
| OS | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| 네트워크 | 100 Mbps | 1 Gbps |

### 7.2 Docker Compose — 프로덕션

```yaml
# docker/docker-compose.prod.yml (단순화)
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
    image: minio/minio:RELEASE.2026-03-15T00-00-00Z  # 특정 릴리즈로 고정
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
      - /etc/ssl/cloudflare:/etc/ssl/cloudflare:ro  # Cloudflare 오리진 인증서
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

### 7.3 Nginx 설정

```nginx
# nginx/nginx.conf (주요 섹션)

# Cloudflare IP에서만 연결 허용
# 최신 목록: https://www.cloudflare.com/ips/
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
    # IPv6 범위는 간략화를 위해 생략 — 프로덕션에서는 포함
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

        # Cloudflare용 캐시 헤더
        add_header Cache-Control "public, max-age=60, s-maxage=300";
    }

    # 캐싱을 갖춘 MinIO 이미지 프록시
    location /uploads/ {
        proxy_pass http://minio:9000/{{MINIO_BUCKET_NAME}}/;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
        add_header X-Cache-Status $upstream_cache_status;
    }

    # Strapi 내장 관리자 패널 — 개발자 전용 접근
    # 모니터링 및 디버깅을 위한 개발자 IP / VPN으로 제한
    location /admin {
        # 개발자 IP / VPN 범위만 허용
        allow {{DEV_VPN_CIDR}};        # 예: 10.0.0.0/24
        # allow {{DEV_IP_1}};          # 개별 개발자 IP
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

### 7.4 Cloudflare 설정

| 설정 | 값 | 비고 |
|---|---|---|
| SSL 모드 | Full (Strict) | Nginx에 오리진 인증서 설치 |
| 최소 TLS | 1.2 | |
| 항상 HTTPS 사용 | 켜짐 | |
| 자동 축소 | JS, CSS, HTML | |
| Brotli | 켜짐 | |
| HTTP/3 (QUIC) | 켜짐 | |
| Bot Fight Mode | 켜짐 | 의심스러운 봇에 챌린지 |
| Crawler Hints | 켜짐 | Yeti(네이버), Googlebot 허용 |

**페이지 규칙 / 캐시 규칙:**

| 패턴 | 규칙 | 비고 |
|---|---|---|
| `{{API_DOMAIN}}/api/themes*` | 모두 캐시, 엣지 TTL: 1일 | |
| `{{API_DOMAIN}}/api/regions*` | 모두 캐시, 엣지 TTL: 1일 | |
| `{{API_DOMAIN}}/api/districts*` | 모두 캐시, 엣지 TTL: 1일 | |
| `{{API_DOMAIN}}/uploads/*` | 모두 캐시, 엣지 TTL: 7일 | |
| `{{ADMIN_DOMAIN}}/*` | 캐시 우회, 보안 레벨: 높음 | Admin Web (관리자 전용 접근) |
| `{{API_DOMAIN}}/admin/*` | 캐시 우회, 보안 레벨: 높음 | Strapi 내장 관리자 패널 (개발자 전용, Nginx에서 IP 제한) |

**속도 제한 규칙 (Cloudflare):**

| 경로 패턴 | 제한 | 기간 | 조치 |
|---|---|---|---|
| `{{API_DOMAIN}}/api/auth/*` | 10회 요청 | 1분 | 차단 |
| `{{API_DOMAIN}}/api/reviews` (POST) | 5회 요청 | 1분 | 챌린지 |
| `{{API_DOMAIN}}/api/partnership-inquiries` (POST) | 3회 요청 | 1분 | 챌린지 |

### 7.5 CI/CD 파이프라인 (GitLab CI)

```yaml
# .gitlab-ci.yml (단순화)
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

### 7.6 배포 스크립트

```bash
#!/bin/bash
# deploy.sh — 온프레미스 서버에서 실행
set -euo pipefail

cd /opt/swida
docker load < images.tar.gz
docker compose -f docker/docker-compose.prod.yml up -d --remove-orphans
docker system prune -f
echo "배포 완료: $(date)"
```

---

## 8. 보안 아키텍처

### 8.1 방어 레이어

```
레이어 1: Cloudflare 엣지
  ├── DDoS 완화 (L3/L4/L7)
  ├── WAF (OWASP 관리형 룰셋)
  ├── 봇 관리
  ├── 속도 제한
  └── SSL 종료 (공개 인증서)

레이어 2: Nginx (오리진)
  ├── Cloudflare 전용 IP 허용 목록
  ├── Strapi 내장 관리자 패널 IP 제한 (개발자 IP / VPN 전용)
  ├── Gzip / Brotli 압축
  ├── SSL (Cloudflare 오리진 인증서)
  └── 요청 버퍼링 / 타임아웃

레이어 3: 애플리케이션 (Strapi)
  ├── 입력 새니타이징 (내장)
  ├── CSRF 보호 (미들웨어)
  ├── CORS 설정
  ├── JWT 인증
  ├── 역할 기반 권한
  ├── 속도 제한 (strapi 미들웨어)
  └── 계정 잠금 메커니즘

레이어 4: 데이터베이스
  ├── 내부 Docker 네트워크를 통해서만 연결
  ├── 파라미터화된 쿼리 (Knex.js)
  └── 공개 포트 노출 없음
```

### 8.2 CORS 설정

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

### 8.3 시크릿 관리

- 모든 시크릿은 환경별 `.env` 파일에 저장 (Git에 커밋 금지)
- `.env.example`은 플레이스홀더 값으로 유지
- 프로덕션 `.env` 파일은 보안 SCP 또는 환경별 CI/CD 변수를 통해 배포
- Strapi의 `APP_KEYS`, `JWT_SECRET`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT` — 모두 `openssl rand -base64 32`로 생성

---

## 9. 캐싱 전략

### 9.1 3계층 캐시 아키텍처

```
계층 1: Cloudflare 엣지 캐시
  └── 정적 자산 (JS, CSS, 폰트, 이미지): TTL 7일
  └── 캐시 가능한 API 응답 (테마, 지역, 구/군): TTL 1일
  └── MinIO의 업체 이미지: TTL 7일

계층 2: Redis (오리진 캐시)
  └── 업체 상세: TTL 1분
  └── 업체 목록/검색: TTL 30초
  └── 리뷰 피드: TTL 30초
  └── 지역/구군 목록: TTL 24시간
  └── 테마 목록: TTL 24시간
  └── 상위 평점 업체: TTL 5분
  └── 개별 업체 상세: TTL 1분

계층 3: PostgreSQL (진실의 원천)
  └── 모든 데이터
```

### 9.2 캐시 무효화

캐시 무효화는 Strapi 라이프사이클 훅에 의해 트리거됩니다:

- **업체 게시/수정/게시 취소** → 영향받는 업체, 검색 결과, 관련 테마/위치 캐시에 대한 Redis 키 무효화. 항상 Cloudflare API(`POST /client/v4/zones/{zone_id}/purge_cache`)를 통해 해당 업체 URL(`/ko/shop/{slug}` 및 `/en/shop/{slug}`) 캐시 제거 트리거.
- **리뷰 생성/수정/삭제** → 상위 업체의 Redis 캐시 무효화(평점 변경).
- **테마/지역/구군 변경** → 해당 Redis 키 및 Cloudflare 캐시 무효화.

### 9.3 Next.js 캐싱

- **ISR 재검증:** 업체 상세 페이지는 60초마다 재검증
- **온디맨드 재검증:** Strapi 웹훅 → Next.js 재검증 API 라우트 → `revalidatePath('/ko/shop/[slug]')` 및 `revalidatePath('/en/shop/[slug]')`
- **Fetch 캐시:** Strapi에 대한 서버 측 `fetch` 호출은 시간 기반 재검증을 위해 `next: { revalidate: N }` 사용

---

## 10. 국제화 (i18n)

### 10.1 아키텍처

```
┌─────────────────────────────────────────────┐
│            Customer Web (Next.js)            │
│  미들웨어: 로케일 감지 → 리다이렉트          │
│  [locale] 동적 세그먼트: /ko/... /en/...    │
│  next-intl: UI 문자열 관리                  │
│  Strapi API 호출: ?locale=ko 또는 ?locale=en│
└─────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│                  Strapi                      │
│  i18n 플러그인: ko(기본), en(추가)          │
│  Admin Web(Next.js)을 통한 콘텐츠 작성      │
│  한국어 콘텐츠 우선, 영어 번역은 선택적     │
│  대체: 영어 없을 경우 ko 콘텐츠 표시        │
└─────────────────────────────────────────────┘
                    ▲
┌───────────────────┘─────────────────────────┐
│             Admin Web (Next.js)               │
│  콘텐츠 작성을 위한 로케일 전환기 UI         │
│  번역을 위해 Strapi i18n API 호출            │
│  관리자가 ko 우선 작성, en은 선택적          │
└───────────────────────────────────────────────┘
```

### 10.2 Next.js 미들웨어

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'always',  // /ko 와 /en 모두 명시적
  localeDetection: true,    // Accept-Language 헤더에서 감지
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

### 10.3 대체 동작

업체나 엔티티에 대한 영어 콘텐츠가 없을 경우, Customer Web은 다음 안내 문구와 함께 한국어 버전을 표시합니다: `"이 내용은 아직 번역되지 않았습니다"` / `"This content is not yet translated"`. 이는 Strapi 응답 로케일이 요청된 로케일과 다를 때를 감지하는 API 클라이언트에서 처리됩니다.

---

## 11. SEO 전략

### 11.1 인덱싱 페이지 (사이트맵 포함)

`/ko` 및 `/en` 버전 모두:

- 홈페이지
- 업체 상세 페이지 (`/[locale]/shop/[slug]`)
- 위치 탐색 페이지 (`/[locale]/location/[level1]/[level2]`)
- 테마 탐색 페이지 (`/[locale]/theme/[theme-slug]`)
- 제휴 페이지

### 11.2 제외 페이지 (`noindex`)

- 쿼리 파라미터가 있는 검색 결과
- 리뷰 제출 페이지
- 로그인 / 회원가입 페이지
- 모든 Admin Web 페이지 (`{{ADMIN_DOMAIN}}/*`)
- Strapi 내장 관리자 패널 (`{{API_DOMAIN}}/admin/*`) — 개발자 전용, 공개 접근 불가

### 11.3 사이트맵 생성

Next.js App Router의 `sitemap.ts`가 Strapi API에서 게시된 모든 업체, 테마, 위치 조합을 가져와 `sitemap.xml`을 동적으로 생성합니다. 양쪽 로케일 버전이 포함됩니다.

### 11.4 hreflang 태그

모든 페이지에 다음이 포함됩니다:

```html
<link rel="alternate" hreflang="ko" href="https://{{DOMAIN}}/ko/..." />
<link rel="alternate" hreflang="en" href="https://{{DOMAIN}}/en/..." />
<link rel="alternate" hreflang="x-default" href="https://{{DOMAIN}}/ko/..." />
```

### 11.5 구조화된 데이터 (JSON-LD)

업체 상세 페이지에는 다음을 포함하는 `LocalBusiness` 스키마 마크업이 포함됩니다:
- 이름, 주소, 전화번호
- GPS 좌표 (위도, 경도)
- 영업 시간
- 종합 평점 (`averageRating`, `reviewCount`)
- 가격대

---

## 12. 테스트 전략

### 12.1 방법론

TDD(테스트 주도 개발) — 구현 전에 테스트를 먼저 작성합니다.

### 12.2 테스트 레이어

| 레이어 | 도구 | 범위 | 커버리지 목표 |
|---|---|---|---|
| 단위 테스트 | Vitest | 컨트롤러, 서비스, 훅, 유틸리티, React 컴포넌트 | 라인 커버리지 ≥ 80% |
| 통합 테스트 | Vitest + Supertest | Strapi API 엔드포인트, 커스텀 라우트, 정책 | 라인 커버리지 ≥ 80% |
| E2E 테스트 | Playwright | 양쪽 로케일에 걸친 전체 사용자 플로우 | 중요 경로 100% |

### 12.3 중요 E2E 테스트 경로

1. **검색 플로우:** 홈페이지 → 테마 검색 → 위치별 필터링 → 업체 상세 조회
2. **주변 검색:** GPS 허용 → 근처 결과 조회 → 업체 상세 조회
3. **리뷰 플로우:** 로그인(카카오/네이버) → 업체 이동 → 리뷰 제출 → 표시 확인
4. **제휴 플로우:** 제휴 페이지 방문 → 문의 양식 제출 → 제출 확인
5. **관리자 플로우:** Admin Web 로그인 → 업체 생성 → 게시 → Customer Web에서 확인
6. **i18n 플로우:** 언어 전환 → URL 변경 확인 → 콘텐츠 언어 확인

---

## 13. 모니터링 및 관찰 가능성

### 13.1 헬스 체크

| 서비스 | 엔드포인트 | 예상 결과 |
|---|---|---|
| Strapi | `/_health` | HTTP 204 |
| Customer Web (Next.js) | `/api/health` (커스텀) | HTTP 200 + JSON |
| Admin Web (Next.js) | `/api/health` (커스텀) | HTTP 200 + JSON |
| PostgreSQL | `pg_isready` | 종료 코드 0 |
| Redis | `redis-cli ping` | PONG |
| MinIO | `mc ready local` | 종료 코드 0 |

### 13.2 로깅

- **Strapi:** 내장 로거(`strapi.log`) → stdout → Docker 로그
- **Customer Web (Next.js):** `console.log` / `console.error` → stdout → Docker 로그
- **Admin Web (Next.js):** `console.log` / `console.error` → stdout → Docker 로그
- **Nginx:** 접근 및 오류 로그 → Docker 로그
- **중앙 집중식 로깅:** MVP 이후 Docker 로그를 로그 수집기(예: Loki + Grafana)로 전달

### 13.3 업타임 모니터링

- **Cloudflare 헬스 체크:** Cloudflare 엣지에서 오리진 서버 가용성 모니터링
- **외부 업타임 모니터:** UptimeRobot (무료 티어, 5분 간격) `https://{{DOMAIN}}/ko`, `https://{{ADMIN_DOMAIN}}/api/health`, `https://{{API_DOMAIN}}/api/themes` 핑

---

## 14. 부록

### 14.1 환경 변수 템플릿

```bash
# .env.example

# ── 데이터베이스 ──
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

# ── 인증 (고객) ──
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

# ── 외부 ──
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

# ── 도메인 ──
DOMAIN=example.com
ADMIN_DOMAIN=admin.example.com
```

### 14.2 모노레포 워크스페이스 설정

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

### 14.3 공유 타입 패키지

`packages/shared-types/`는 Customer Web과 Admin Web 모두에서 사용되는 Strapi 응답 타입의 TypeScript 인터페이스와 공유 유틸리티를 내보냅니다:

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

### 14.4 결정 로그

| # | 결정 | 근거 | 날짜 |
|---|---|---|---|
| D-001 | 양쪽 프론트엔드에 Next.js 16.2.1(최신) 사용 | 커스텀 Admin Web으로 Strapi React 18 충돌 해소. 모든 RSC CVE 패치. Turbopack 안정화, 개발 서버 시작 87% 향상. | 2026-03-24 |
| D-002 | Node.js 24 Active LTS | 2026년 신규 프로젝트에 권장. Strapi v5 공식 지원. 네이티브 TS 타입 스트리핑, npm v11, OpenSSL 3.5. EOL 2028년 4월. | 2026-03-24 |
| D-003 | PostgreSQL 18 대신 17 선택 | PG 17에서 PostGIS 3.6.2가 더 잘 검증됨, PG 18은 아직 신규 | 2026-03-24 |
| D-004 | Tailwind CSS v4(최신) | Next.js 16이 기본으로 v4 스캐폴딩. 그린필드 프로젝트 — 마이그레이션 우려 없음. 빠른 빌드, CSS 우선 설정. | 2026-03-24 |
| D-005 | npm/yarn 대신 pnpm | 최고의 모노레포 지원, 빠른 설치, 엄격한 의존성 격리 | 2026-03-24 |
| D-006 | Strapi 내장 관리자 대신 커스텀 Next.js Admin Web | 통합 프론트엔드 스택(전체 React 19), 관리자 워크플로우를 위한 커스텀 UX, 완전한 디자인 제어. Admin Web은 인증된 관리자만 접근 가능. | 2026-03-24 |
| D-007 | Strapi를 헤드리스 API 전용으로 사용 | Strapi 내장 관리자 패널은 모니터링, 디버깅, 긴급 운영을 위한 개발자 전용으로 제한 — 일상적인 플랫폼 관리에는 미사용 | 2026-03-24 |
| D-008 | 업체 상세에 전체 SSR 대신 ISR 사용 | 신선도(60초 재검증)와 성능 및 비용의 균형 | 2026-03-24 |
| D-009 | 무한 스크롤 대신 페이지 기반 페이지네이션 | SEO: 네이버/구글 색인을 위한 페이지당 고유한 크롤 가능 URL | 2026-03-24 |
| D-010 | 클라우드 대신 온프레미스 | 클라이언트 요구사항 — 완전한 제어가 가능한 전용 서버 | 2026-03-24 |
| D-011 | ORM 지리 공간 대신 PostGIS 원시 SQL | Strapi의 Knex는 PostGIS를 네이티브 지원하지 않음. `strapi.db.connection.raw()`를 통한 원시 SQL이 권장 접근법. | 2026-03-24 |
| D-012 | 인메모리 대신 Redis API 캐시 | Strapi 재시작 시에도 영속, 다중 인스턴스로 확장 시 공유 가능 | 2026-03-24 |
| D-013 | React 19.2.4 고정 | CVE-2026-23864를 포함한 모든 RSC CVE 패치. 모든 프론트엔드가 동일 버전 공유. | 2026-03-24 |

---

> **문서 끝**
>
> 본 TSD는 구현이 진행됨에 따라 검토 및 업데이트되어야 합니다. 버전이 고정된 의존성은 보안 패치를 위해 각 스프린트 경계마다 재평가해야 합니다.
