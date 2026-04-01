---
title: "SWIDA — 기술 사양 문서 (TSD)"
sidebar_label: "TSD (KO)"
sidebar_position: 2
---

# SWIDA — 기술 사양 문서 (TSD)

> **버전:** 1.2.0
> **날짜:** 2026년 3월 30일
> **상태:** 업데이트됨 — 승인된 HTML 프로토타입(v1.1 → v1.2)에 맞춰 Admin Web 섹션 정렬
> **기반 문서:** SWIDA PRD v1.2, SWIDA Admin Web FSD v1.1
> **변경 요약 (Admin Web만 해당; 모든 Customer Web 섹션은 변경 없음):**
>
> - §5.2.5 대시보드 응답 형태 업데이트: 통계 카드 간소화(상태 하위 분류 제거), `monthly_users`, `shops_needing_verify`, `pending_reviews_feed`, `recent_shops_feed`, `recent_inquiries_feed` 추가
> - §5.6 Admin Web 기능 업데이트: 셸이 사이드바 전용(별도 상단 헤더 없음), 사이드바 그룹 수정, New Shop을 사이드바 항목으로 추가, 문의 레이아웃을 카드 그리드로, 감사 로그를 플랫 테이블로 변경
> - 모든 Customer Web 섹션(§6, §10, §11 등)은 변경 없음

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
| --- | --- | --- | --- |
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
| **MinIO** | `RELEASE.2026-03-xx` (최신 안정 버전) | 롤링 릴리즈 | 업체 이미지용 S3 호환 오브젝트 스토리지. Docker에서 특정 `RELEASE` 태그로 고정. |
| **Nginx** | `1.26.x` (최신 안정 버전) | 안정 브랜치 | 오리진 리버스 프록시. |
| **Docker** | `27.x` | 활성 | 컨테이너 런타임. |
| **Docker Compose** | `2.x` | 활성 | 개발 및 프로덕션용 멀티 컨테이너 오케스트레이션. |
| **next-intl** | `4.8.3` | 활성 | Next.js용 경로 기반 i18n 라우팅. v4.4부터 Next.js 16.x 호환. |
| **Tailwind CSS** | `4.x` (최신 안정 버전) | 활성 | Next.js 16이 기본으로 Tailwind v4 스캐폴딩. `@tailwindcss/postcss` 사용. |
| **Headless UI** | `2.2.9` | 활성 | 스타일 없는 접근성 컴포넌트. React 19 호환. |
| **Nodemailer** | `7.x` (최신 안정 버전) | 활성 | 비밀번호 재설정, 알림을 위한 트랜잭션 이메일 발송. SMTP 제공자로 설정 (예: AWS SES, SendGrid, 또는 자체 호스팅 SMTP). 제공자 선택은 배포 결정 사항 — Nodemailer가 전송 방식을 추상화. |

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
| --- | --- | --- | --- | --- | --- |
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
| --- | --- | --- |
| `{{DOMAIN}}` (www) | Next.js Customer Web `:3000` | 고객용 웹 앱 |
| `{{API_DOMAIN}}` | Strapi `:1337/api` | 공개 REST API (양쪽 프론트엔드에서 소비) |
| `{{ADMIN_DOMAIN}}` | Next.js Admin Web `:3001` | 커스텀 관리자 대시보드 및 관리 |

### 3.3 데이터 흐름

**읽기 경로 (고객 탐색):**
`고객 브라우저 → Cloudflare 엣지 캐시 → Nginx → Next.js (SSR/ISR) → Strapi REST API → Redis 캐시 → PostgreSQL`

**쓰기 경로 (리뷰 제출):**
`고객 브라우저 → Cloudflare → Nginx → Next.js (API 라우트 / Server Action) → Strapi REST API → PostgreSQL → Redis 캐시 무효화`

**관리자 경로 (업체 관리):**
`관리자 브라우저 → Cloudflare → Nginx → Admin Web (Next.js) → Strapi Admin API → PostgreSQL`

**개발자 경로 (Strapi 내장 관리자 패널을 통한 모니터링/디버깅):**
`개발자 브라우저 → VPN/IP 화이트리스트 → Nginx → Strapi 내장 관리자 패널 → PostgreSQL`

**이미지 경로:**
`고객 브라우저 → Cloudflare CDN → Nginx (캐시 프록시) → MinIO`

---

## 4. 데이터베이스 설계

### 4.1 개요

Strapi v5는 콘텐츠 타입 정의(`src/api/*/content-types/*/schema.json` 아래 JSON 스키마 파일)를 통해 데이터베이스 스키마를 자동으로 관리합니다. 아래 스키마들은 Strapi가 자동 생성하는 PostgreSQL 테이블에 매핑되는 논리적 데이터 모델을 나타냅니다. 직접 스키마 조작은 권장하지 않으며, 모든 변경은 Strapi의 Content-Type Builder 또는 스키마 JSON 파일을 통해 이루어져야 합니다.

### 4.2 PostGIS 설정

PostGIS는 Strapi가 시작되기 전에 데이터베이스에서 활성화되어야 합니다. 이는 데이터베이스 초기화 스크립트에서 처리됩니다:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- 향후 퍼지 검색을 위해
```

`postgis/postgis:17-3.6` Docker 이미지는 PostGIS가 사전 설치되어 있으며 첫 부팅 시 익스텐션을 자동 생성합니다.

### 4.3 엔티티 관계 다이어그램 (논리적)

```
┌─────────┐     1:N     ┌───────────┐
│  광역   │─────────────│   구/군/시  │
└─────────┘             └─────┬─────┘
                              │ 1:N
                        ┌─────▼─────┐      M:N     ┌─────────┐
                        │   업체    │──────────────│  테마   │
                        └──┬──┬─────┘              └─────────┘
                           │  │ 1:N
              ┌────────────┘  └──────────────┐
              │ 1:N                          │ M:N
        ┌─────▼─────┐               ┌───────▼───────┐
        │   리뷰    │               │  사용자 북마크  │
        └─────┬─────┘               └───────┬───────┘
              │ N:1                          │ N:1
        ┌─────▼─────────────┐────────────────┘
        │  사용자 (고객)     │
        └──┬──┬──┬──────────┘
           │  │  │ 1:N
   ┌───────┘  │  └───────────────┐
   │ 1:N      │ 1:N              │ 1:N
┌──▼──────┐ ┌─▼──────┐  ┌───────▼──────┐
│커뮤니티 │ │ 댓글   │  │   게시물     │
│  게시물 │ │(다형성)│  │   좋아요     │
└─────────┘ └────────┘  │  (다형성)    │
                        └──────────────┘

댓글 대상 (다형성):
  게시판 게시물, 커뮤니티 게시물, 이벤트

게시물 좋아요 대상 (다형성):
  게시판 게시물, 커뮤니티 게시물, 이벤트

┌──────────────┐     ┌──────────────┐
│  게시판 게시물│     │   이벤트     │
│ (관리자)     │     │  (관리자)    │
└──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────────┐
│   공지사항   │     │ 사용자 포인트    │
│ (관리자)     │     │     로그         │
└──────────────┘     └──────────────────┘

┌───────────────────────┐
│   파트너십 문의       │ ──(선택)──→ 업체
└───────────────────────┘

┌───────────────────────┐
│      감사 로그        │
└───────────────────────┘
```

### 4.4 핵심 테이블 (Strapi 관리)

아래는 논리적 스키마입니다. Strapi는 실제 SQL 테이블, 컬럼명(snake_case), M:N 관계의 연결 테이블, 컴포넌트 테이블을 자동 생성합니다.

#### 4.4.1 `regions`

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | 자동 생성 |
| document_id | varchar | Unique, Not Null | Strapi v5 문서 식별자 |
| name | varchar(100) | Not Null | 다국어(i18n): 서울특별시, Seoul |
| locale | varchar(10) | Not Null | `ko`, `en` |
| created_at | timestamptz | Not Null | 자동 |
| updated_at | timestamptz | Not Null | 자동 |
| published_at | timestamptz | Nullable | 초안 및 게시 |

#### 4.4.2 `districts`

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| name | varchar(100) | Not Null | 다국어: 강남구, Gangnam-gu |
| region_id | integer | FK → regions.id | 하나의 광역에 소속 |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | |

#### 4.4.3 `themes`

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| name | varchar(100) | Not Null | 다국어: 스웨디시, Swedish |
| slug | varchar(100) | Unique, Not Null | 이름에서 자동 생성 |
| display_order | integer | Nullable | 정렬 우선순위 |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | |

**미디어:** `icon` — 단일 미디어 관계 (선택)

#### 4.4.4 `shops`

핵심 엔티티. 필드는 메인 테이블과 임베디드 컴포넌트 테이블에 분산됩니다.

**메인 테이블 필드:**

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| name | varchar(255) | Not Null | 다국어 |
| slug | varchar(255) | Unique, Not Null | 이름에서 UID 생성 |
| description | text | Not Null | 최대 500자 (앱 레벨 검증) |
| address | varchar(500) | Not Null | 다국어 |
| latitude | decimal(10,7) | Not Null | GPS 좌표 |
| longitude | decimal(10,7) | Not Null | GPS 좌표 |
| phone_number | varchar(20) | Nullable | |
| operating_hours | jsonb | Not Null | 요일별 구조화된 스케줄 (아래 형식 참조). 다국어 아님 — 시간은 보편적. |
| operating_hours_text | varchar(200) | Nullable | 다국어. 불규칙 시간에 대한 자유 텍스트 표시 오버라이드 (예: "공휴일 휴무", "연중무휴"). 설정 시 계산된 스케줄 대신 표시. |
| last_order_time | varchar(100) | Nullable | |
| closed_days | varchar(200) | Not Null | 다국어 |
| holiday_exceptions | text | Nullable | 다국어 |
| price_range | varchar(50) | Nullable | |
| booking_required | boolean | Not Null | 기본값: false |
| booking_url_phone | varchar(255) | Nullable | |
| gender_availability | varchar(20) | Nullable | Enum: all, female_only, male_only, couple_available |
| languages_supported | jsonb | Nullable | 언어 코드 배열 |
| last_verified_date | date | Nullable | |
| inactive_reason | varchar(20) | Nullable | Enum: closed, owner_request, violation, stale, other |
| inactive_reason_detail | text | Nullable | "other"에 대한 자유 텍스트 |
| open_tag | varchar(50) | Nullable | 커스텀 라벨, 기본값: 영업중 |
| close_tag | varchar(50) | Nullable | 커스텀 라벨, 기본값: 영업종료 |
| average_rating | decimal(3,2) | Not Null, Default 0 | 라이프사이클 훅을 통해 계산 |
| total_reviews | integer | Not Null, Default 0 | 라이프사이클 훅을 통해 계산 |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | 가시성 제어 |

**관계:**

- `region_id` → FK to `regions` (다대일)
- `district_id` → FK to `districts` (다대일)
- `themes` → M:N 연결 테이블 `shops_themes_lnk`
- `images` → Strapi 미디어 (다중), `files` 테이블에 저장
- `thumbnail` → Strapi 미디어 (단일)

**임베디드 컴포넌트 (Strapi가 관리하는 별도 테이블):**

- `shop_service_menu_items` — 반복 가능 컴포넌트
- `shop_amenities` — 단일 컴포넌트
- `shop_contact_channels` — 단일 컴포넌트

#### 4.4.5 `reviews`

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| rating | integer | Not Null | CHECK: 1–5 |
| comment | text | Not Null | 10–500자 (앱 레벨) |
| status | varchar(20) | Not Null, Default 'published' | Enum: published, hidden, under_review, deleted |
| moderation_reason | varchar(20) | Nullable | Enum: spam, inappropriate, fake_review, irrelevant, other |
| report_count | integer | Not Null, Default 0 | |

> **참고:** `moderation_reason` 값(관리자가 설정: `spam`, `inappropriate`, `fake_review`, `irrelevant`, `other`)은 사용자 신고 사유(`POST /api/reviews/:id/report`를 통해 제출: `spam`, `fake`, `inappropriate`, `irrelevant`, `other`)와 다릅니다. `fake`(사용자 신고)와 `fake_review`(관리자 검토/관리)의 차이에 주의하십시오. 신고 사유는 리뷰 레코드에 저장되지 않으며 신고 요청 본문의 일부로 전송됩니다(PRD §8.5).
> | author_id | integer | FK → up_users.id | |
> | shop_id | integer | FK → shops.id | |
> | published_at | timestamptz | Nullable | |

**i18n 없음** — 리뷰는 작성된 언어로 저장됩니다.

#### 4.4.6 `partnership_inquiries`

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
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
| admin_notes | text | Nullable | 공개 API에 노출되지 않음 |
| linked_shop_id | integer | FK → shops.id, Nullable | |

#### 4.4.7 `audit_logs`

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | |
| content_type | varchar(100) | Not Null | 예: `api::shop.shop` |
| document_id | varchar | Not Null | 수정된 문서의 ID |
| action | varchar(20) | Not Null | `create`, `update`, `delete`, `publish`, `unpublish` |
| admin_user_id | integer | FK → admin_users.id | 변경을 수행한 관리자 |
| field_diffs | jsonb | Nullable | `{ field: { before, after } }` |
| created_at | timestamptz | Not Null | |

#### `up_users` 확장 (Strapi Users & Permissions)

기존 Strapi 사용자 모델에 추가되는 필드:

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| avatar | relation | Nullable | Strapi 미디어 (단일). 프로필 사진. 최대 5MB, JPG/PNG/WebP. |
| total_points | integer | Not Null, Default 0 | 계산값: user_points_log.points의 SUM. 라이프사이클 훅으로 업데이트. |
| email_verified | boolean | Not Null, Default false | 사용자가 인증 링크를 클릭하면 `true`로 설정. 소셜 로그인 사용자는 자동 인증. |
| email_verification_token | varchar | Nullable, Unique | 인증 이메일에 전송되는 암호학적 랜덤 토큰. 인증 후 삭제. |
| email_verification_sent_at | timestamptz | Nullable | 마지막 인증 이메일의 타임스탬프. 재전송 속도 제한(1분당 1회)에 사용. |

**사용자 레벨 산출 (계산값, 저장하지 않음):**

- 0P → Lv.1, 500P → Lv.2, 2,000P → Lv.3, 5,000P → Lv.4, 10,000P → Lv.5

재사용되는 기존 필드: `username` (닉네임), `email`, `created_at` (가입일).

#### 4.4.8 `board_posts`

관리자가 큐레이션한 업체 추천 및 마사지 정보 게시판 게시물.

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | 자동 생성 |
| document_id | varchar | Unique, Not Null | Strapi v5 문서 식별자 |
| type | varchar(20) | Not Null | Enum: `recommendation`, `info` |
| title | varchar(255) | Not Null | 다국어(i18n) |
| body | text | Not Null | 리치 텍스트, 다국어 |
| excerpt | varchar(500) | Nullable | 다국어. 비어있으면 body에서 자동 생성. |
| category | varchar(50) | Nullable | 배지 라벨 (예: "실전팁", "초보가이드") |
| author_name | varchar(100) | Not Null | 관리자 닉네임 (FK 아님 — 관리자가 Strapi를 통해 생성) |
| is_featured | boolean | Not Null, Default false | 추천 배너 캐러셀에 표시 |
| is_hot | boolean | Not Null, Default false | 관리자가 설정하는 HOT 배지 |
| view_count | integer | Not Null, Default 0 | 페이지 조회 시 증가 |
| like_count | integer | Not Null, Default 0, CHECK >= 0 | 라이프사이클 훅을 통해 계산 |
| comment_count | integer | Not Null, Default 0 | 라이프사이클 훅을 통해 계산 |
| locale | varchar(10) | Not Null | `ko`, `en` |
| published_at | timestamptz | Nullable | 초안 및 게시 |
| created_at | timestamptz | Not Null | 자동 |
| updated_at | timestamptz | Not Null | 자동 |

**관계:**

- `region_id` → FK to `regions` (다대일, nullable — 광역 필터링용)
- `linked_shop_id` → FK to `shops` (다대일, nullable — 추천 게시물만 해당)
- `featured_image` → Strapi 미디어 (단일)

#### 4.4.9 `community_posts`

사용자가 생성한 커뮤니티 게시물.

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| content | text | Not Null | 1–2,000자 (앱 레벨) |
| hashtags | jsonb | Nullable | 문자열 배열, 최대 10개, 각 최대 30자 |
| location_text | varchar(200) | Nullable | 자유 텍스트 위치 (예: "강남구 역삼동") |
| view_count | integer | Not Null, Default 0 | |
| like_count | integer | Not Null, Default 0, CHECK >= 0 | 라이프사이클 훅을 통해 계산 |
| comment_count | integer | Not Null, Default 0 | 라이프사이클 훅을 통해 계산 |
| status | varchar(20) | Not Null, Default 'published' | Enum: `published`, `hidden`, `deleted` |
| author_id | integer | FK → up_users.id | Not Null |
| created_at | timestamptz | Not Null | |
| updated_at | timestamptz | Not Null | |

**관계:**

- `photos` → Strapi 미디어 (다중, 최대 5개, 각 최대 5MB, JPG/PNG/WebP)
- `video` → Strapi 미디어 (단일, nullable, 최대 50MB, MP4/MOV)

**i18n 없음** — 커뮤니티 게시물은 작성된 언어로 저장됩니다 (리뷰와 동일).

#### 4.4.10 `comments`

게시판 게시물, 커뮤니티 게시물, 이벤트에 대한 공유 다형성 댓글 시스템.

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| content | text | Not Null | 1–500자 (앱 레벨) |
| parent_type | varchar(50) | Not Null | 다형성: `board_post`, `community_post`, `event` |
| parent_id | integer | Not Null | 부모 엔티티의 ID |
| reply_to_id | integer | FK → comments.id, Nullable | 1단계 중첩 답글만 해당 |
| author_id | integer | FK → up_users.id | Not Null |
| created_at | timestamptz | Not Null | |

**i18n 없음** — 댓글은 작성된 언어로 저장됩니다.

**제약조건:** `reply_to_id`는 동일한 `parent_type`과 `parent_id`를 가진 댓글을 참조해야 합니다. 애플리케이션 레벨 검증이 더 깊은 중첩(답글에 대한 답글)을 방지합니다.

#### 4.4.11 `events`

관리자가 관리하는 시간 제한 이벤트/캠페인.

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| title | varchar(255) | Not Null | 다국어(i18n) |
| body | text | Not Null | 리치 텍스트, 다국어 |
| category | varchar(30) | Not Null | Enum: `new_opening`, `closing_soon`, `coupon`, `winner_announcement`, `general` |
| start_date | date | Not Null | 이벤트 시작 (KST) |
| end_date | date | Not Null | 이벤트 종료 (KST). D-day 계산에 사용. |
| disclaimers | text | Nullable | 다국어. 이벤트 규칙/조건. |
| is_featured | boolean | Not Null, Default false | 히어로 배너 캐러셀에 표시 |
| view_count | integer | Not Null, Default 0 | |
| like_count | integer | Not Null, Default 0, CHECK >= 0 | 라이프사이클 훅을 통해 계산 |
| author_name | varchar(100) | Not Null | 관리자 닉네임 |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | |
| created_at | timestamptz | Not Null | |
| updated_at | timestamptz | Not Null | |

**관계:**

- `banner_image` → Strapi 미디어 (단일) — 전체 너비 상세 배너
- `featured_image` → Strapi 미디어 (단일) — 카드 썸네일

**D-Day 카운트다운 (계산값, 저장하지 않음):**

- `end_date > today(KST)` → D-N
- `end_date = today(KST)` → D-DAY
- `end_date < today(KST)` → 마감 (Closed)

#### 4.4.12 `notices`

관리자가 발행하는 공지사항.

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| title | varchar(255) | Not Null | 다국어(i18n) |
| body | text | Not Null | 리치 텍스트, 다국어 |
| category | varchar(20) | Not Null | Enum: `notice`, `general` |
| is_important | boolean | Not Null, Default false | 상단 고정 📌 |
| view_count | integer | Not Null, Default 0 | |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | |
| created_at | timestamptz | Not Null | |
| updated_at | timestamptz | Not Null | |

공지사항에는 댓글, 좋아요 없음.

#### 4.4.13 `user_bookmarks`

사용자 ↔ 업체 북마크 연결 테이블.

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | |
| user_id | integer | FK → up_users.id, Not Null | |
| shop_id | integer | FK → shops.id, Not Null | |
| created_at | timestamptz | Not Null | "최근 북마크순" 정렬용 |

**유니크 제약조건:** `(user_id, shop_id)` — 중복 북마크를 방지합니다.

#### 4.4.14 `user_points_log`

게이미피케이션을 위한 포인트 거래 이력.

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | |
| user_id | integer | FK → up_users.id, Not Null | |
| action | varchar(30) | Not Null | Enum: `post_created`, `comment_created`, `like_received` |
| points | integer | Not Null | +50, +10, 또는 +5 |
| reference_type | varchar(50) | Not Null | `community_post`, `comment`, `post_like` |
| reference_id | integer | Not Null | 트리거한 엔티티의 ID |
| created_at | timestamptz | Not Null | 일일 한도 추적용 |

**일일 한도 적용:** `comment_created` 액션은 사용자당 하루 10회로 제한 (`COUNT WHERE action='comment_created' AND user_id=X AND created_at >= today` 확인).

#### 4.4.15 `post_likes`

누가 무엇을 좋아요 했는지 추적하는 연결 테이블 (다형성).

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | |
| user_id | integer | FK → up_users.id, Not Null | |
| target_type | varchar(50) | Not Null | `board_post`, `community_post`, `event` |
| target_id | integer | Not Null | 좋아요한 엔티티의 ID |
| created_at | timestamptz | Not Null | |

**유니크 제약조건:** `(user_id, target_type, target_id)` — 사용자당 대상당 하나의 좋아요만 허용.

#### 4.4.16 `rating_recalc_queue`

실패한 업체 평점 재계산을 위한 재시도 큐 (§5.3.3 참조). 실패한 재계산이 `average_rating`을 영구적으로 오래된 상태로 방치하지 않도록 보장합니다.

| 컬럼 | 타입 | 제약조건 | 비고 |
| --- | --- | --- | --- |
| id | serial | PK | 자동 생성 |
| shop_id | integer | FK → shops.id, Not Null | 평점 재계산이 필요한 업체 |
| attempts | integer | Not Null, Default 0 | 현재까지의 재시도 횟수 |
| max_attempts | integer | Not Null, Default 5 | 설정 가능한 상한 |
| last_error | text | Nullable | 가장 최근 오류 메시지 / 스택 트레이스 |
| next_retry_at | timestamptz | Not Null | 다음 재시도 시점 |
| created_at | timestamptz | Not Null | 자동 |
| resolved_at | timestamptz | Nullable | 재계산이 최종 성공하면 설정 |

**인덱스:** `CREATE INDEX idx_recalc_queue_pending ON rating_recalc_queue (next_retry_at) WHERE resolved_at IS NULL;`

### 4.5 인덱스

Strapi가 자동 생성하는 인덱스(PK, FK, 유니크 제약조건) 외에, 다음 커스텀 인덱스를 Strapi 부트스트랩 스크립트 또는 마이그레이션을 통해 생성해야 합니다:

```sql
-- 주변 검색을 위한 공간 인덱스 (성능에 중요)
CREATE INDEX idx_shops_geography ON shops
  USING GIST (ST_MakePoint(longitude, latitude)::geography);

-- 전문/퍼지 검색 준비
CREATE INDEX idx_shops_name_trgm ON shops
  USING GIN (name gin_trgm_ops);

-- 필터링 쿼리를 위한 복합 인덱스
CREATE INDEX idx_shops_published_rating ON shops (published_at, average_rating DESC)
  WHERE published_at IS NOT NULL;

-- 업체별 리뷰 쿼리
CREATE INDEX idx_reviews_shop_status ON reviews (shop_id, status, created_at DESC);

-- 광역별 구/군/시 조회
CREATE INDEX idx_districts_region ON districts (region_id);
```

신규 테이블에 대한 추가 인덱스:

| 테이블 | 컬럼 | 타입 | 용도 |
| --- | --- | --- | --- |
| board_posts | `(type, published_at DESC)` | B-tree | 타입별 게시판 목록 쿼리 |
| board_posts | `(region_id, type)` | B-tree | 추천 게시물의 광역 필터 |
| board_posts | `(is_featured, type)` | Partial (where is_featured=true) | 추천 배너 쿼리 |
| community_posts | `(author_id, created_at DESC)` | B-tree | "내 게시물" 필터 |
| community_posts | `(status, created_at DESC)` | B-tree | 피드 쿼리 |
| comments | `(parent_type, parent_id, created_at)` | B-tree | 게시물의 댓글 목록 |
| events | `(category, end_date DESC)` | B-tree | 카테고리 + 활성 필터 |
| events | `(is_featured, end_date)` | Partial (where is_featured=true) | 히어로 배너 쿼리 |
| notices | `(is_important DESC, published_at DESC)` | B-tree | 고정 우선 공지 목록 |
| user_bookmarks | `(user_id, created_at DESC)` | B-tree | 사용자의 북마크 목록 |
| user_bookmarks | `(user_id, shop_id)` | Unique | 중복 북마크 방지 |
| user_points_log | `(user_id, action, created_at)` | B-tree | 일일 한도 확인 |
| post_likes | `(user_id, target_type, target_id)` | Unique | 중복 좋아요 방지 |
| post_likes | `(target_type, target_id)` | B-tree | 대상의 좋아요 수 조회 |
| partnership_inquiries | `(shop_name, phone_number, created_at)` | B-tree | 시간 범위 내 중복 확인 |

### 4.6 시드 데이터

Strapi 부트스트랩 스크립트(`database/seeds/`)를 통해 런칭 시 사전 투입:

- **광역:** 대한민국 전체 17개 시/도 (광역시 + 도), `ko`와 `en` 양쪽 로캘
- **구/군/시:** 각 광역 하위의 모든 시/군/구 (~250개 항목), 양쪽 로캘
- **테마:** 초기 9개 마사지 테마 (PRD §9.3 참조), 양쪽 로캘

---

## 5. Strapi 백엔드 — 콘텐츠 타입 및 API 계약

### 5.1 콘텐츠 타입 요약

| 콘텐츠 타입 | API ID | 유형 | i18n | 초안 및 게시 |
| --- | --- | --- | --- | --- |
| 업체 | `api::shop.shop` | Collection | Yes | Yes |
| 리뷰 | `api::review.review` | Collection | No | Yes |
| 테마 | `api::theme.theme` | Collection | Yes | Yes |
| 광역 | `api::region.region` | Collection | Yes | Yes |
| 구/군/시 | `api::district.district` | Collection | Yes | Yes |
| 파트너십 문의 | `api::partnership-inquiry.partnership-inquiry` | Collection | No | No |
| 감사 로그 | `api::audit-log.audit-log` | Collection | No | No |
| 게시판 게시물 | `api::board-post.board-post` | Collection | Yes | Yes |
| 커뮤니티 게시물 | `api::community-post.community-post` | Collection | No | No |
| 댓글 | `api::comment.comment` | Collection | No | No |
| 이벤트 | `api::event.event` | Collection | Yes | Yes |
| 공지사항 | `api::notice.notice` | Collection | Yes | Yes |
| 사용자 북마크 | `api::user-bookmark.user-bookmark` | Collection | No | No |
| 사용자 포인트 로그 | `api::user-points-log.user-points-log` | Collection | No | No |
| 게시물 좋아요 | `api::post-like.post-like` | Collection | No | No |

**컴포넌트:**

| 컴포넌트 | 네임스페이스 | 유형 |
| --- | --- | --- |
| 서비스 메뉴 항목 | `shop.service-menu-item` | Repeatable |
| 편의시설 | `shop.amenities` | Single |
| 연락처 | `shop.contact-channels` | Single |

### 5.2 REST API 엔드포인트

모든 공개 엔드포인트는 게시된 콘텐츠만 제공합니다 (Strapi v5 기본 동작). 로캘은 `?locale=ko` 또는 `?locale=en`으로 전달합니다.

#### 5.2.1 업체

| Method | 엔드포인트 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/shops` | Public | 업체 목록 (페이지네이션, 필터, 정렬) |
| GET | `/api/shops/:documentId` | Public | 업체 상세 정보 |
| GET | `/api/shops/nearby` | Public | **커스텀 컨트롤러** — 공간 주변 검색 |

> **참고:** Customer Web은 Slug 기반 라우트(`/[locale]/shop/[slug]`)를 사용하므로, `documentId`가 아닌 `GET /api/shops?filters[slug][$eq]={slug}&locale={locale}`로 업체 상세를 가져옵니다. `documentId` 기반 엔드포인트는 Admin Web 및 내부 참조에 사용됩니다.

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

**응답 형태 (목록):**

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
&radius=5000          // 미터, 기본값 5000, 최소 1000, 최대 10000
&locale=ko
&pagination[page]=1
&pagination[pageSize]=20
```

응답에는 각 업체에 `distance` 필드(미터)가 포함됩니다. 거리 오름차순으로 정렬됩니다.

**구현:** `src/api/shop/controllers/shop.ts`의 커스텀 컨트롤러가 Knex를 통해 원시 PostGIS SQL을 실행합니다:

```typescript
// 간소화 — 전체 구현은 코드베이스 참조
const shops = await strapi.db.connection.raw(
  `
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
`,
  [lng, lat, lng, lat, radius, pageSize, offset],
);
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

#### 5.2.2 리뷰

| Method | 엔드포인트 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/reviews` | Public | 게시된 리뷰 목록 (피드) |
| POST | `/api/reviews` | Customer (JWT) | 새 리뷰 제출 |
| POST | `/api/reviews/:id/report` | Customer (JWT) | 리뷰 신고 |

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

`author`는 인증된 사용자의 JWT에서 자동으로 설정됩니다. 사용자 계정의 잠금 여부를 확인하는 커스텀 정책으로 검증됩니다.

**인증된 리뷰 응답 향상:**

요청하는 사용자가 인증된 경우, `GET /api/reviews` 응답의 각 리뷰 객체에 추가 필드가 포함됩니다:

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `reported_by_me` | boolean | 인증된 사용자가 이미 이 리뷰를 신고했으면 `true`, 아니면 `false` |

`review_reports`에서 `reporter_id = current_user` 및 `review_id = review.id`로 `LEFT JOIN`하여 계산합니다. 이를 통해 프론트엔드에서 별도 API 호출 없이 이미 신고한 리뷰의 신고 버튼을 비활성화할 수 있습니다. 사용자가 인증되지 않은 경우 이 필드는 생략됩니다.

#### 5.2.3 테마, 광역, 구/군/시

| Method | 엔드포인트 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/themes` | Public | 게시된 전체 테마 |
| GET | `/api/regions` | Public | 게시된 전체 광역 |
| GET | `/api/districts?filters[region][documentId][$eq]=xxx` | Public | 광역으로 필터링한 구/군/시 |

커스텀 컨트롤러가 필요 없는 단순한 Strapi 자동 생성 엔드포인트입니다.

#### 5.2.4 파트너십 문의

| Method | 엔드포인트 | 인증 | 설명 |
| --- | --- | --- | --- |
| POST | `/api/partnership-inquiries` | Public | 문의 제출 (폼) |

Public 역할 권한: `create`만 허용. Public 역할에는 `find`, `findOne`, `update`, `delete` 불가.

**서버 측 중복 확인:** 새 문의를 생성하기 전에, 커스텀 컨트롤러가 동일한 `shop_name` + `phone_number` 조합의 문의가 최근 5분 이내에 생성되었는지 확인합니다. 일치하는 항목이 발견되면 서버가 `409 Conflict`로 요청을 거부합니다:

```json
{
  "error": {
    "status": 409,
    "name": "ConflictError",
    "message": "A similar inquiry was recently submitted. Please wait a few minutes before resubmitting."
  }
}
```

**위치:** `src/api/partnership-inquiry/controllers/partnership-inquiry.ts` (기본 `create` 오버라이드)

#### 5.2.5 대시보드 분석

| Method | 엔드포인트 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/dashboard/stats` | Admin (JWT) | **커스텀 컨트롤러** — 집계된 플랫폼 통계 |

**위치:** `src/api/dashboard/controllers/dashboard.ts`
**라우트:** `src/api/dashboard/routes/dashboard.ts`

**응답 형태:**

```json
{
  "data": {
    "shops": {
      "total": 512,
      "delta_this_month": 18,
      "needs_verify": 7
    },
    "monthly_users": {
      "total": 9841,
      "delta_percent_vs_last_month": 12
    },
    "reviews": {
      "total": 4328,
      "delta_this_month": 487,
      "under_review": 7
    },
    "inquiries": {
      "total": 4,
      "new": 4,
      "overdue_new": 2
    },
    "pending_reviews_feed": [
      {
        "shop_name": "그린 힐링 스파",
        "author": "김민준",
        "report_count": 3,
        "report_reason": "스팸 의심",
        "status": "under_review"
      }
    ],
    "recent_shops_feed": [
      {
        "document_id": "abc123",
        "name": "그린 힐링 스파",
        "district": "강남구",
        "created_at": "2026-03-24T00:00:00Z",
        "status": "published"
      }
    ],
    "recent_inquiries_feed": [
      {
        "document_id": "inq001",
        "shop_name": "한강 뷰 스파",
        "district": "마포구",
        "created_at": "2026-03-26T00:00:00Z",
        "status": "new",
        "is_overdue": true
      }
    ]
  }
}
```

**통계 카드 매핑 (Admin Web 대시보드):**

| 통계 카드 | 사용 필드 | 변동 라인 |
| --- | --- | --- |
| 전체 업체 | `shops.total` | `shops.delta_this_month` (이번 달 +N) |
| 월간 사용자 | `monthly_users.total` | `monthly_users.delta_percent_vs_last_month` (전월 대비 +N%) |
| 전체 리뷰 | `reviews.total` | `reviews.delta_this_month` (이번 달 +N) |
| 신규 문의 | `inquiries.new` | `inquiries.overdue_new` (48시간 초과 N건) |

**검증 필요 알림:** `shops.needs_verify > 0`이면 대시보드에 주황색 알림 배너가 표시됩니다: "N개 업체가 90일 이상 재검증되지 않았습니다." 필터링된 업체 목록(`/shops?filter=verify_needed`)으로 연결됩니다.

**피드:** `pending_reviews_feed` (최대 3건, `under_review` 상태), `recent_shops_feed` (최근 생성된 업체 최대 3건), `recent_inquiries_feed` (최신순 정렬 오픈 문의 최대 3건, 지연 플래그 포함). 모든 피드는 대시보드에서 통계 숫자가 아닌 항목 목록으로 표시됩니다.

**구현:** Strapi의 Document Service API를 사용하여 업체, 리뷰, 사용자, 파트너십 문의에 대한 집계 쿼리(`strapi.documents().count()`)를 실행합니다. 월간 사용자 수는 `up_users`에서 `created_at >= 현재 KST 월 첫째 날`인 항목으로 계산합니다. `needs_verify`는 `last_verified_at < NOW() - INTERVAL '90 days'`인 업체를 카운트합니다. 이 엔드포인트는 admin API JWT를 통해 인증된 관리자만 접근할 수 있습니다.

#### 5.2.6 게시판 게시물

| Method | 엔드포인트 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/board-posts` | Public | 게시판 게시물 목록 (페이지네이션, 필터, 정렬) |
| GET | `/api/board-posts/:documentId` | Public | 게시판 게시물 상세 |

**GET `/api/board-posts` — 쿼리 파라미터:**

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

**응답 형태 (목록):**

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
      "featured_image": {
        "url": "/uploads/board1.jpg",
        "alternativeText": "..."
      },
      "linked_shop": { "name": "더 힐 테라피", "slug": "the-hill-therapy" },
      "region": { "name": "서울" }
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 12, "pageCount": 3, "total": 30 }
  }
}
```

**GET `/api/board-posts/:documentId` — 응답 (단일):**

목록 항목과 동일한 형태이지만 `excerpt` 대신 전체 `body`(리치 텍스트)가 포함되며, `linked_shop`에 전체 업체 카드 필드(name, slug, address, operating_hours, amenities)가 포함됩니다.

#### 5.2.7 커뮤니티 게시물

| Method | 엔드포인트 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/community-posts` | Public | 커뮤니티 게시물 목록 (피드) |
| GET | `/api/community-posts/:documentId` | Public | 게시물 상세 |
| POST | `/api/community-posts` | Customer (JWT) | 커뮤니티 게시물 작성 |

**GET `/api/community-posts` — 쿼리 파라미터:**

```
?filters[author][id][$eq]=42          // "내 게시물" 필터
&filters[status][$eq]=published
&sort=created_at:desc                  // 또는 like_count:desc (월간 인기)
&pagination[page]=1
&pagination[pageSize]=10
&populate[photos][fields][0]=url
&populate[author][fields][0]=username
&populate[author][fields][1]=total_points
```

**응답 형태 (목록):**

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
  "meta": {
    "pagination": { "page": 1, "pageSize": 10, "pageCount": 5, "total": 48 }
  }
}
```

> **참고:** `level`은 `total_points`에서 응답 시점에 계산되며 저장되지 않습니다.

**POST `/api/community-posts` — 요청 본문:**

```json
{
  "data": {
    "content": "오늘 방문한 마사지 샵 후기...",
    "hashtags": ["#마사지후기", "#강남"],
    "location_text": "강남구 역삼동"
  }
}
```

사진과 동영상은 Strapi의 미디어 업로드 엔드포인트를 통해 별도로 업로드한 후, 후속 PUT 요청에서 연결합니다 (표준 Strapi 미디어 워크플로우).

#### 5.2.8 댓글

| Method | 엔드포인트 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/comments` | Public | 부모 엔티티의 댓글 목록 |
| POST | `/api/comments` | Customer (JWT) | 댓글 또는 중첩 답글 작성 |

**GET `/api/comments` — 쿼리 파라미터:**

```
?filters[parent_type][$eq]=board_post
&filters[parent_id][$eq]=1
&filters[reply_to_id][$null]=true      // 최상위 댓글만
&sort=created_at:asc
&pagination[page]=1
&pagination[pageSize]=20
&populate[author][fields][0]=username
&populate[author][fields][1]=total_points
&populate[replies][populate][author][fields][0]=username
```

**응답 형태:**

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
      "author": {
        "id": 10,
        "username": "마사지매니아",
        "total_points": 800,
        "level": 2
      },
      "replies": [
        {
          "id": 2,
          "content": "저도 갈만한지 알려주세요!",
          "reply_to_id": 1,
          "created_at": "2026-03-27T11:00:00Z",
          "author": {
            "id": 15,
            "username": "쉬다",
            "total_points": 100,
            "level": 1
          }
        }
      ]
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 20, "pageCount": 2, "total": 24 }
  }
}
```

**POST `/api/comments` — 요청 본문:**

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

답글의 경우: `reply_to_id`를 부모 댓글의 ID로 설정합니다. 서버는 참조된 댓글이 동일한 `parent_type`과 `parent_id`를 공유하는지 검증합니다.

#### 5.2.9 이벤트 및 공지사항

| Method | 엔드포인트 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/events` | Public | 이벤트 목록 (카테고리별 필터, 정렬 가능) |
| GET | `/api/events/:documentId` | Public | 이벤트 상세 |
| GET | `/api/notices` | Public | 공지 목록 (고정 우선) |
| GET | `/api/notices/:documentId` | Public | 공지 상세 (이전/다음 포함) |

**GET `/api/events` — 쿼리 파라미터:**

```
?locale=ko
&filters[category][$eq]=new_opening
&filters[end_date][$gte]=2026-03-27    // 활성/예정 이벤트만
&sort=end_date:asc                      // 또는 like_count:desc (인기순)
&pagination[page]=1
&pagination[pageSize]=12
&populate[featured_image][fields][0]=url
```

**응답 형태 (이벤트 목록):**

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
  "meta": {
    "pagination": { "page": 1, "pageSize": 12, "pageCount": 1, "total": 8 }
  }
}
```

> **참고:** `dday`는 KST 기준으로 응답 시점에 계산되며 저장되지 않습니다.

**GET `/api/notices` — 응답에 고정 정렬용 `is_important` 포함:**

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
  "meta": {
    "pagination": { "page": 1, "pageSize": 20, "pageCount": 1, "total": 15 }
  }
}
```

**GET `/api/notices/:documentId` — 이전/다음이 포함된 단일 공지:**

커스텀 컨트롤러가 `prev`와 `next` 필드를 추가합니다:

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
  "prev": {
    "documentId": "nt002",
    "title": "서비스 정기 점검 안내",
    "published_at": "2026-05-28T00:00:00Z"
  },
  "next": {
    "documentId": "nt003",
    "title": "부적절한 리뷰 작성 시 제재 안내",
    "published_at": "2026-05-10T00:00:00Z"
  }
}
```

#### 5.2.10 북마크

| Method | 엔드포인트 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/bookmarks` | Customer (JWT) | 사용자의 북마크 업체 목록 (페이지네이션) |
| POST | `/api/bookmarks` | Customer (JWT) | 북마크 추가 |
| DELETE | `/api/bookmarks/:id` | Customer (JWT) | 북마크 제거 |

**GET `/api/bookmarks` — 쿼리 파라미터:**

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

**응답 형태:**

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
  "meta": {
    "pagination": { "page": 1, "pageSize": 12, "pageCount": 1, "total": 5 }
  }
}
```

**POST `/api/bookmarks` — 요청:**

```json
{ "data": { "shop": "shop001" } }
```

서버가 JWT에서 `user_id`를 자동 설정합니다. 북마크가 이미 존재하면 409를 반환합니다.

**DELETE `/api/bookmarks/:id`** — 서버가 해당 북마크가 인증된 사용자의 것인지 검증합니다.

**POST `/api/bookmarks/toggle` — 멱등성 토글:**

원자적 북마크 토글 엔드포인트. 레이스 컨디션을 방지하기 위해 UPSERT/DELETE 패턴을 사용합니다.

요청:

```json
{ "shop": "shop001" }
```

응답 (북마크 생성):

```json
{ "bookmarked": true, "id": 42 }
```

응답 (북마크 제거):

```json
{ "bookmarked": false }
```

로직: 주어진 업체 + 인증된 사용자에 대한 북마크가 존재하면 삭제하고 `{ "bookmarked": false }`를 반환합니다. 존재하지 않으면 생성하고 `{ "bookmarked": true, "id": newId }`를 반환합니다. 인증: Customer (JWT).

#### 5.2.11 좋아요

| Method | 엔드포인트 | 인증 | 설명 |
| --- | --- | --- | --- |
| POST | `/api/likes` | Customer (JWT) | 대상에 좋아요 |
| DELETE | `/api/likes/:id` | Customer (JWT) | 좋아요 취소 |

**POST `/api/likes` — 요청:**

```json
{
  "data": {
    "target_type": "board_post",
    "target_id": 1
  }
}
```

서버가 JWT에서 `user_id`를 자동 설정합니다. 이미 좋아요한 경우 409를 반환합니다. 성공 시, 좋아요 삽입, `like_count` 증가, 포인트 지급이 단일 트랜잭션 내에서 실행됩니다(§5.3.6 참조). 어느 단계라도 실패하면 전체 작업이 롤백됩니다.

**DELETE `/api/likes/:id`** — 서버가 소유권을 검증합니다. 좋아요 삭제와 `like_count` 감소가 단일 트랜잭션 내에서 실행됩니다(§5.3.6 참조). 포인트 지급을 되돌리지 않습니다(포인트는 절대 감소하지 않음).

#### 5.2.12 사용자 프로필

| Method | 엔드포인트 | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/api/users/me` | Customer (JWT) | 계산된 레벨이 포함된 현재 사용자 프로필 |
| PUT | `/api/users/me/avatar` | Customer (JWT) | 프로필 사진 업로드/변경 |
| DELETE | `/api/users/me/avatar` | Customer (JWT) | 프로필 사진 제거 |

**GET `/api/users/me` — 응답:**

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

> `level`은 응답 시점에 `total_points`에서 계산됩니다.

**PUT `/api/users/me/avatar`** — 멀티파트 폼 업로드. 서버가 파일 타입(JPG/PNG/WebP)과 크기(최대 5MB)를 검증합니다. 기존 아바타를 교체합니다.

**DELETE `/api/users/me/avatar`** — 아바타 미디어 관계를 제거합니다. 클라이언트에서 기본 아바타로 되돌아갑니다.

### 5.3 커스텀 미들웨어, 정책 및 라이프사이클 훅

#### 5.3.1 미들웨어: `account-lock`

**위치:** `src/middlewares/account-lock.ts`
**목적:** 잠긴 고객 계정에서의 쓰기 요청을 차단합니다.
**동작:** `up_users.blocked` 필드(Strapi 내장)를 확인합니다. `true`이면 `403 Forbidden`과 함께 메시지를 반환합니다: `"계정이 정지되었습니다. 관리자에게 문의해주세요."` / `"Your account has been suspended. Please contact the administrator."`
**적용 대상:** `POST /api/reviews`, `POST /api/reviews/:id/report`, `POST /api/community-posts`, `POST /api/comments`, `POST /api/likes`

> **참고:** 북마크(`POST /api/bookmarks`)는 면제됩니다 — 북마크는 사용자가 볼 수 있는 콘텐츠를 생성하지 않는 수동적 액션입니다.

#### 5.3.1a 미들웨어: `optimistic-lock`

**위치:** `src/middlewares/optimistic-lock.ts`
**목적:** 모든 관리자 쓰기 작업에 낙관적 잠금을 적용하여 Admin Web에서의 동시 편집 충돌을 방지합니다.
**동작:** 모든 관리자 `PUT` 및 `PATCH` 요청은 수정 중인 레코드의 `updatedAt` 필드를 포함해야 합니다. 미들웨어는 제출된 `updatedAt`과 데이터베이스의 현재 레코드 `updatedAt`을 비교합니다. 일치하지 않으면(다른 세션에서 레코드를 수정했음을 의미) 서버가 `409 Conflict`로 응답합니다:

```json
{
  "error": {
    "status": 409,
    "name": "ConflictError",
    "message": "This record was modified in another session. Please reload and try again."
  }
}
```

**적용 대상:** 모든 관리자 API `PUT` 및 `PATCH` 엔드포인트 (업체, 리뷰, 테마, 광역, 구/군/시, 문의, 게시판 게시물, 이벤트, 공지사항, 커뮤니티 게시물, 사용자).

#### 5.3.2 정책: `is-active-shop`

**위치:** `src/api/shop/policies/is-active-shop.ts`
**목적:** 게시된 업체만 반환되도록 하는 추가 안전장치. Strapi v5가 기본적으로 초안을 제외하지만, 이 정책이 심층 방어를 제공합니다.
**적용 대상:** `GET /api/shops/:documentId`

#### 5.3.3 라이프사이클 훅: 리뷰 평점 재계산

**위치:** `src/api/review/content-types/review/lifecycles.ts`
**트리거:** `afterCreate`, `afterUpdate`, `afterDelete`
**동작:**

1. 리뷰에서 부모 업체를 식별
2. 해당 업체의 `status = 'published'`인 모든 리뷰를 조회
3. 새 `average_rating`(소수점 2자리 반올림)과 `total_reviews`를 계산
4. Document Service API를 통해 업체 문서를 업데이트

```typescript
// 간소화
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

**동시성 안전:**

`recalculateShopRating` 함수는 읽기 후 쓰기 패턴을 사용하므로 동시 실행에 취약합니다. 동일한 업체에 대해 두 개의 리뷰가 동시에 생성되면, 두 훅이 동일한 리뷰 세트를 읽고, 동일한(오래된) 카운트를 계산하여, 한쪽이 다른 쪽의 결과를 덮어씁니다.

**필수 안전장치:** 업체의 `documentId`를 키로 하는 PostgreSQL Advisory Lock으로 재계산을 래핑합니다. 이를 통해 업체당 한 번에 하나의 재계산만 실행되도록 보장합니다:

```typescript
await strapi.db.connection.raw('SELECT pg_advisory_xact_lock(hashtext(?))', [
  shopDocumentId,
]);
// ... 동일 트랜잭션 내에서 리뷰 읽기, 평균 계산, 업체 업데이트
```

**오류 처리:** 재계산이 실패하면(예: 데이터베이스 연결 오류), 리뷰 CRUD 작업은 여전히 성공해야 합니다 — 라이프사이클 훅이 사용자를 차단해서는 안 됩니다. 실패를 로깅하고 `rating_recalc_queue` 테이블(§4.4.16)에 `next_retry_at = now() + interval '5 minutes'`로 행을 삽입합니다.

**재시도 메커니즘 (Strapi cron 작업):**

`config/cron-tasks.ts`에 등록된 Strapi cron 태스크가 5분마다 실행되어 재시도 큐를 처리합니다:

```typescript
// config/cron-tasks.ts (간소화)
export default {
  '*/5 * * * *': async ({ strapi }) => {
    const pending = await strapi.db
      .connection('rating_recalc_queue')
      .where('next_retry_at', '<=', new Date())
      .whereNull('resolved_at')
      .where('attempts', '<', strapi.db.connection.ref('max_attempts'));

    for (const entry of pending) {
      try {
        await recalculateShopRating(entry.shop_id);
        await strapi.db
          .connection('rating_recalc_queue')
          .where('id', entry.id)
          .update({ resolved_at: new Date() });
      } catch (err) {
        const nextAttempt = entry.attempts + 1;
        await strapi.db
          .connection('rating_recalc_queue')
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

주요 동작:

- **지수 백오프:** 각 후속 재시도는 `attempts * 5분`을 대기합니다 (5분, 10분, 15분, 20분, 25분).
- **성공 시:** `resolved_at`이 설정됩니다; 행은 감사 목적으로 유지됩니다.
- **소진 시:** `attempts >= max_attempts`(기본값 5)이면 더 이상 재시도하지 않습니다. 관리자 알림이 발생합니다(아래 참조).

**관리자 알림:** 관리자 대시보드는 `rating_recalc_queue` 항목이 `resolved_at IS NULL` 상태에서 `attempts >= max_attempts`에 도달하면 알림을 표시해야 합니다. 표시: _"업체 ID {X} 평점 재계산이 {max_attempts}회 시도 후 실패했습니다 — 마지막 오류: {last_error}"_. 관리자는 수동으로 재계산을 트리거하거나 근본 원인을 조사할 수 있습니다.

> **참고:** 업체 게시와 동시 리뷰 생성은 ISR 캐시 타이밍으로 인해 잠시 오래된 평점을 표시할 수 있습니다. 재계산에 대한 Advisory Lock과 60초 ISR 재검증이 이를 완화합니다. MVP에는 추가 안전장치가 필요하지 않습니다.

#### 5.3.4 라이프사이클 훅: 감사 로그

**위치:** `src/api/shop/content-types/shop/lifecycles.ts`
**트리거:** `beforeUpdate` (이전 값 캡처용), `afterUpdate`, `afterCreate`, `afterDelete`
**동작:** 필드 레벨 차이를 캡처하고, 인증된 Admin Web 세션의 관리자 사용자 정보(`strapi.requestContext`에서 admin API JWT를 통해 전달)와 함께 `audit-log` 컬렉션 타입에 기록합니다.

#### 5.3.5 라이프사이클 훅: 댓글 수 재계산

`comment`의 `afterCreate` 시: 부모 엔티티(`parent_type` 필드에 의해 결정 — `board_post`, `community_post`, 또는 `event`)의 `comment_count`를 증가시킵니다. 원자적 `UPDATE SET comment_count = comment_count + 1` 쿼리를 사용합니다.

#### 5.3.6 라이프사이클 훅: 좋아요 수 재계산

`post_like` 생성 시, 다음 작업이 반드시 단일 데이터베이스 트랜잭션 내에서 실행되어야 합니다:

1. `post_like` 행 삽입
2. 대상 엔티티(`target_type`에 의해 결정 — `board_post`, `community_post`, 또는 `event`)의 `like_count` 원자적 증가
3. 대상 작성자에 대한 `user_points_log` 항목 삽입 (+5P `like_received`, §5.3.7 참조)

어느 단계라도 실패하면 전체 트랜잭션이 롤백됩니다 — 부분적 상태 없음.

`post_like` 삭제 시, 다음 작업이 반드시 단일 데이터베이스 트랜잭션 내에서 실행되어야 합니다:

1. `post_like` 행 삭제
2. 대상 엔티티의 `like_count` 원자적 감소

감소가 `CHECK (like_count >= 0)` 제약조건을 위반하면 트랜잭션이 중단됩니다.

**빠른 클릭 보호:** `post_likes`의 `(user_id, target_type, target_id)` 유니크 제약조건이 데이터베이스 레벨에서 중복 좋아요를 방지합니다. 트랜잭션 래핑과 결합하여 동시 요청에서도 카운트 일관성을 보장합니다.

#### 5.3.7 라이프사이클 훅: 포인트 계산

`community_post`의 `afterCreate` 시:

1. `user_points_log` 항목 삽입: `{ action: 'post_created', points: 50, reference_type: 'community_post', reference_id: post.id }`
2. 작성자의 `total_points`를 50 증가

`comment`의 `afterCreate` 시:

1. 일일 한도 확인: `SELECT COUNT(*) FROM user_points_log WHERE user_id = author.id AND action = 'comment_created' AND created_at >= today_start(KST)`
2. 카운트 < 10이면: `user_points_log` 항목 `{ action: 'comment_created', points: 10 }` 삽입 및 작성자의 `total_points`를 10 증가
3. 카운트 >= 10이면: 포인트 지급 건너뜀 (일일 상한 도달)

`post_like`의 `afterCreate` 시:

1. 좋아요 대상 엔티티의 작성자를 검색
2. 해당 작성자에 대한 `user_points_log` 삽입: `{ action: 'like_received', points: 5, reference_type: 'post_like', reference_id: like.id }`
3. 해당 작성자의 `total_points`를 5 증가

> **참고:** 포인트는 절대 감소하지 않습니다. 좋아요 취소(좋아요 삭제)는 포인트 지급을 되돌리지 않습니다.

#### 5.3.8 커스텀 컨트롤러: 조회수 증가

**라우트:** `POST /api/:contentType/:documentId/view`

지정된 콘텐츠 타입과 문서에 대해 `view_count`를 원자적으로 증가시킵니다. 인위적 부풀림을 방지하기 위해 사용자 세션당 속도 제한(쿠키 기반, 문서당 30분에 최대 1회)이 적용됩니다.

**적용 대상:** `board-posts`, `community-posts`, `events`, `notices`

**응답:** `{ "data": { "view_count": 1243 } }`

> **참고:** 쿠키 기반 속도 제한은 시크릿 모드나 쿠키 삭제로 우회 가능합니다. MVP에서는 이것이 허용됩니다 — 조회수는 정보 제공 목적이며 랭킹이나 수익화에 사용되지 않습니다. 향후 개선: IP + 핑거프린트 기반 중복 제거 또는 분석 파이프라인.

#### 5.3.9 커스텀 컨트롤러: 공지 이전/다음

**라우트:** `GET /api/notices/:documentId`

기본 Strapi `findOne`을 확장하여 동일 로캘 내 `published_at` 순서에 기반한 `prev`와 `next` 공지 참조를 추가하는 커스텀 컨트롤러.

**로직:**

- `prev`: 현재 공지 이후의 가장 가까운 `published_at`을 가진 공지 (더 최신)
- `next`: 현재 공지 이전의 가장 가까운 `published_at`을 가진 공지 (더 오래된)
- prev/next가 없으면 해당 필드는 `null`

**추가되는 응답 필드:**

```json
{
  "data": { ... },
  "prev": { "documentId": "nt002", "title": "...", "published_at": "..." },
  "next": { "documentId": "nt003", "title": "...", "published_at": "..." }
}
```

### 5.4 인증

#### 5.4.1 고객 인증 (Strapi Users & Permissions)

- **기본 제공자:** 이메일/비밀번호 회원가입
- **소셜 제공자:** Kakao, Naver — Strapi의 Users & Permissions 플러그인을 확장하여 커스텀 제공자로 구현
- **JWT:** Strapi가 로그인 시 발급, 클라이언트 측 저장 (보안을 위해 localStorage보다 httpOnly 쿠키 권장)
- **토큰 유효기간:** 7일 (`plugins.ts`에서 설정 가능)

**커스텀 제공자 위치:** `src/extensions/users-permissions/`

**이메일 인증 흐름:**

1. 이메일 회원가입(`POST /api/auth/local/register`) 시, 라이프사이클 훅이 암호학적 토큰을 생성하고, `email_verification_token`에 저장한 후, 기존 이메일 서비스를 통해 인증 이메일을 전송합니다.
2. `POST /api/auth/verify-email` — 공개 엔드포인트. `{ token: string }`을 받습니다. 토큰으로 사용자를 찾고, `email_verified = true`로 설정하고, 토큰을 삭제합니다. 성공 시 `200`, 유효하지 않거나 만료된 토큰이면 `400`을 반환합니다.
3. `POST /api/auth/resend-verification` — 인증된 엔드포인트. 새 토큰을 생성하고 인증 이메일을 재전송합니다. 사용자당 1분에 1회로 속도 제한(`email_verification_sent_at`으로 확인). 속도 제한 시 `429`, 이미 인증된 경우 `400`을 반환합니다.
4. 소셜 로그인 사용자(Kakao, Naver)는 첫 로그인 시 `email_verified`가 자동으로 `true`로 설정됩니다.

**이메일 인증 미들웨어:** 커스텀 Strapi 정책(`is-email-verified`)이 쓰기 작업을 허용하기 전에 `ctx.state.user.email_verified`를 확인합니다. 적용 대상:

- `POST /api/reviews` (리뷰 작성)
- `POST /api/community-posts` (커뮤니티 게시물 작성)
- `POST /api/comments` (댓글 작성)
- `POST /api/likes` (좋아요)
- `POST /api/review-reports` (리뷰 신고)

인증되지 않은 사용자는 `403 { error: "EMAIL_NOT_VERIFIED", message: "Please verify your email address to perform this action." }`을 받습니다.

#### 5.4.2 관리자 인증

**Admin Web 인증:** Admin Web(Next.js)은 이메일/비밀번호 자격증명을 사용하여 Strapi의 관리자 API 엔드포인트(`/admin/login`)에 인증합니다. Strapi는 JWT 토큰을 반환하고, Admin Web은 이를 저장하여 Strapi의 관리자 API 엔드포인트에 대한 후속 요청에 사용합니다. 인가된 관리자만 로그인할 수 있으며, 고객, 업체 소유자, 개발자는 Admin Web에 접근할 수 없습니다.

**Strapi 내장 관리자 패널 인증:** 모니터링 및 디버깅을 위한 개발자 전용 접근. Strapi의 내장 세션 기반 JWT 인증을 사용합니다. Strapi 내장 관리자 패널(`{{API_DOMAIN}}/admin`)에 대한 접근은 Nginx IP 화이트리스트(개발자 IP 또는 VPN 범위만)로 제한됩니다.

### 5.5 Strapi 플러그인

| 플러그인 | 용도 | 설정 참고사항 |
| --- | --- | --- |
| Users & Permissions | 고객 인증 | Kakao/Naver 제공자로 확장 |
| i18n | 콘텐츠 다국어화 | 기본 로캘: `ko`, 추가: `en` |
| Upload | 미디어 관리 | 제공자: `@strapi/provider-upload-aws-s3` → MinIO를 가리킴 |
| 커스텀 캐시 미들웨어 | API 응답 캐싱 | Redis 기반 커스텀 Strapi 미들웨어(`src/middlewares/api-cache.ts`), 라이프사이클 훅으로 무효화. 캐시 키와 무효화 로직에 대한 완전한 제어를 위해 플러그인 대신 선택. |

### 5.6 Admin Web 기능 (Next.js)

아래 기능은 Admin Web(Next.js) 애플리케이션 내의 페이지/컴포넌트로 구축됩니다 — Strapi 관리자 플러그인이 아닙니다:

**셸 레이아웃:** Admin Web은 사이드바 전용 셸을 사용합니다. 별도의 글로벌 상단 헤더 바는 없습니다. 좌측 사이드바에는 상단에 로고 마크, 중간에 카테고리별로 그룹화된 네비게이션 링크, 하단에 로그인된 관리자 사용자 정보(아바타 이니셜, 닉네임, 역할 라벨)가 포함됩니다. 메인 콘텐츠 영역 상단의 탑바에는 현재 페이지 제목, 브레드크럼, 컨텍스트 액션 버튼만 표시됩니다. 로그아웃은 사이드바 하단의 사용자 정보 영역에서 접근합니다.

**사이드바 네비게이션 그룹 및 항목:**

| 그룹 라벨 | 사이드바 항목 |
| --- | --- |
| Overview | Dashboard |
| Content | Shops (총수 배지), New Shop, Themes, Locations |
| Moderation | Reviews (under_review 수 배지 — 노란색), Partnership (신규 문의 수 배지), Users |
| System | Audit Log |

**기능 표:**

| 기능 | 설명 |
| --- | --- |
| Dashboard | 4개 통계 카드(전체 업체, 월간 사용자, 전체 리뷰, 신규 문의)와 월별 변동 라인. 90일 이상 재검증되지 않은 업체에 대한 검증 필요 알림 배너. 두 개의 대시보드 행: (1) 월간 가입자 막대 차트 + 검토 대기 리뷰 피드; (2) 최근 업체 피드 + 최근 파트너십 문의 피드. `GET /api/dashboard/stats`(§5.2.5)에서 데이터를 가져오는 Next.js 페이지로 구축. |
| 지도 핀 드롭 | 업체 등록 또는 편집 시 위도/경도 선택을 위한 통합 지도 컴포넌트(카카오 맵). Customer Web 업체 상세 페이지에서 정적 지도로도 사용. Admin Web 내 React 컴포넌트로 구축. |
| 업체 CRUD | 검색, 필터(전체/게시됨/초안/검증 필요), 정렬 기능이 포함된 업체 등록의 전체 생성, 읽기, 수정, 삭제 인터페이스. 업체 목록 탑바에 "+ New Shop" 버튼 표시. 인라인 행 액션: 편집, 게시/게시 취소, 미리보기 (👁). |
| 업체 폼 | 2열 폼 레이아웃: 메인 열(기본 정보, 위치 + 지도, 서비스 테마, 영업시간 & 예약, 편의시설, 이미지)과 오른쪽 사이드바 패널(게시 상태 카드, 연락처 카드, 커스텀 상태 태그 카드). `/shops/new`에서는 "Create New Shop", `/shops/[id]`에서는 "Edit Shop"이 폼 제목으로 표시. 탑바 액션: 취소 / 초안 저장 / 게시. |
| 리뷰 검토/관리 | 필터 칩(전체 / 검토 중 / 게시됨 / 숨김)이 있는 플랫 리뷰 테이블. 행 액션: 유지(→ published) 및 숨김 인라인 버튼. 상태는 컬러 필로 표시. |
| 파트너십 문의 관리 | 카드 그리드 레이아웃(3열). 각 카드에 업체명, 위치/채널 메타데이터, 상태 배지, 지연 경고(new 상태에서 48시간 초과 시), 연락처, 진행 단계 바, 메모 추가 + 주요 액션 버튼이 표시. 상태 배지 색상: new=파란색, contacted=초록색, awaiting info=파란색, approved=브랜드 색상. |
| 고객 계정 관리 | 이름, 이메일, 리뷰 수, 가입일, 상태, 액션 컬럼이 있는 사용자 테이블. 행당 하나의 잠금/해제 액션 버튼. 상태 필: active=초록, locked=빨강(`hidden` 클래스 사용). |
| 테마 관리 | KO 이름, EN 이름, 업체 수 컬럼이 있는 테이블. 행당 편집 버튼. 테이블 아래 "+ Add Theme" 버튼. |
| 지역 관리 | 아코디언 확장이 있는 광역/구/군/시 관리 페이지. |
| 감사 로그 뷰어 | 플랫 테이블(확장/축소 없음). 컬럼: 타임스탬프, 관리자, 업체, 액션, 필드, 변경(이전 → 이후). 필터 칩: 전체 변경 / 게시/게시 취소 / 필드 업데이트. 텍스트 검색 입력. |
| 게시판 게시물 | 타입 필터, 추천 토글, HOT 배지 관리가 포함된 게시판 게시물 CRUD 인터페이스. |
| 이벤트 | 날짜 선택기, 카테고리, 추천 토글이 포함된 이벤트 CRUD. |
| 공지사항 | 중요/고정 토글이 포함된 공지사항 CRUD. |
| 커뮤니티 검토/관리 | 커뮤니티 게시물 보기, 숨김, 삭제. 사용자 활동 보기. |
| 사용자 포인트 | 사용자 포인트 이력 및 현재 레벨 보기(읽기 전용). |

**상태 필 색상 매핑 (프로토타입 CSS에 구현된 대로):**

| CSS 클래스 | 색상 | 용도 |
| --- | --- | --- |
| `.pub` | 초록 | 게시됨(업체, 리뷰) / 활성(사용자) |
| `.draft` | 주황 | 초안(업체) |
| `.hidden` | 빨강 | 숨김(리뷰), 검토 중(리뷰), 잠김(사용자) |
| `.new` | 파랑 | 신규(문의) |

> **참고:** 프로토타입에서 `hidden`과 `under_review` 상태의 리뷰 모두 `.hidden`(빨강) CSS 클래스를 사용합니다. 구분은 별도 색상이 아닌 필 안의 텍스트 라벨로 표시됩니다.

> **참고:** Strapi의 내장 관리자 패널은 위의 운영 기능에 사용되지 않습니다. 개발자의 모니터링 및 디버깅 용도로만 제한됩니다.

---

## 6. 프론트엔드 아키텍처 — Customer Web (Next.js)

### 6.1 프로젝트 구조

```
apps/customer-web/
├── app/
│   └── [locale]/                    # ko | en
│       ├── layout.tsx               # 루트 레이아웃 — 로캘 제공자, 네비게이션, 푸터
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
│       │           └── page.tsx     # 지역 탐색 (SSG)
│       ├── search/
│       │   └── page.tsx             # 상세 검색 (SSR)
│       ├── nearby/
│       │   └── page.tsx             # 주변 검색 (CSR)
│       ├── reviews/
│       │   └── page.tsx             # 리뷰 피드 (SSR)
│       ├── partnership/
│       │   └── page.tsx             # 파트너십 랜딩 (SSG)
│       ├── auth/
│       │   ├── login/
│       │   │   └── page.tsx         # 로그인 페이지
│       │   └── callback/
│       │       └── page.tsx         # OAuth 콜백
│       ├── mypage/
│       │   ├── page.tsx              # 마이페이지 대시보드 (CSR)
│       │   └── edit/
│       │       └── page.tsx          # 프로필 편집 (CSR)
│       ├── board/
│       │   ├── recommendation/
│       │   │   └── page.tsx          # 업체 추천 게시판 (SSR)
│       │   ├── info/
│       │   │   └── page.tsx          # 마사지 정보 게시판 (SSR)
│       │   └── [type]/
│       │       └── [id]/
│       │           └── page.tsx      # 게시판 게시물 상세 (ISR)
│       ├── community/
│       │   ├── page.tsx              # 커뮤니티 피드 (SSR)
│       │   └── [id]/
│       │       └── page.tsx          # 커뮤니티 게시물 상세 (SSR)
│       └── events/
│           ├── page.tsx              # 이벤트 & 공지 허브 (ISR)
│           ├── ongoing/
│           │   └── page.tsx          # 진행 중 전체 이벤트 (SSR)
│           ├── [id]/
│           │   └── page.tsx          # 이벤트 상세 (ISR)
│           └── notice/
│               └── [id]/
│                   └── page.tsx      # 공지 상세 (SSG)
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
│   ├── strapi.ts                    # Strapi API 클라이언트 래퍼
│   ├── api/
│   │   ├── shops.ts                 # 업체 관련 API 호출
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
│       ├── format.ts                # 통화, 날짜 포맷팅 (KRW, KST)
│       └── seo.ts                   # 메타 태그 생성기
├── messages/
│   ├── ko.json                      # 한국어 UI 문자열
│   └── en.json                      # 영어 UI 문자열
├── middleware.ts                     # 로캘 감지, / → /ko 리디렉트
├── i18n.ts                          # next-intl 설정
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### 6.2 렌더링 전략

| 페이지 | 전략 | 재검증 | 근거 |
| --- | --- | --- | --- |
| 홈페이지 | SSG + ISR | 300초 (5분) | 비교적 정적, 추천 업체/테마 표시 |
| 업체 상세 | ISR | 60초 | 콘텐츠 업데이트(리뷰, 평점)에 거의 실시간 반영 필요 |
| 테마 탐색 | SSG | 온디맨드 (웹훅) | 테마 목록은 거의 변경되지 않음 |
| 지역 탐색 | SSG | 온디맨드 (웹훅) | 지역 계층 구조는 정적 |
| 상세 검색 | SSR | N/A | 동적 필터/정렬 조합, SSG로 캐싱 불가 |
| 주변 검색 | CSR | N/A | 클라이언트 측 GPS 필요, 완전 동적 |
| 리뷰 피드 | SSR | N/A | 최신 리뷰를 반영해야 함 |
| 파트너십 | SSG | 온디맨드 | 정적 콘텐츠 페이지 |
| 로그인/콜백 | CSR | N/A | 인증 흐름, SEO 가치 없음 |
| 마이페이지 | CSR | N/A | 인증 필요, 개인화, SEO 가치 없음 |
| 프로필 편집 | CSR | N/A | 인증 필요 폼 |
| 게시판 추천 | SSR | N/A | 동적 광역 필터링 |
| 게시판 정보 | SSR | N/A | 동적 정렬 |
| 게시판 게시물 상세 | ISR | 60초 | 콘텐츠 안정, 댓글은 클라이언트를 통해 동적 |
| 커뮤니티 피드 | SSR | N/A | 매우 동적인 사용자 콘텐츠 |
| 커뮤니티 게시물 상세 | SSR | N/A | 동적 댓글/좋아요 |
| 이벤트 허브 | ISR | 300초 (5분) | 정적 공지 + 시간 민감 이벤트 혼합 |
| 진행 중 이벤트 | SSR | N/A | 동적 카테고리 필터/정렬 |
| 이벤트 상세 | ISR | 60초 | 콘텐츠 안정, D-day에 최신성 필요 |
| 공지 상세 | SSG | 온디맨드 (웹훅) | 정적 관리자 콘텐츠 |

**온디맨드 재검증:** Strapi 웹훅이 콘텐츠 게시/업데이트 시 Next.js 재검증을 트리거합니다.

**웹훅 설정:**

- **Next.js 재검증 엔드포인트:** `POST /api/revalidate` (Customer Web과 Admin Web 모두의 커스텀 API 라우트)
- **인증:** 웹훅 요청은 `x-revalidate-secret` 헤더에 전달되는 공유 시크릿(`REVALIDATION_SECRET` 환경 변수)으로 검증
- **페이로드:** `{ "model": "shop", "documentId": "abc123", "event": "entry.publish" }`
- **트리거:** 업체, 리뷰, 테마, 광역, 구/군/시 콘텐츠 타입에 대한 `afterCreate`, `afterUpdate`, `afterDelete` Strapi 라이프사이클 훅
- **실패 처리:** 웹훅 실패는 로깅되지만 Strapi 작업을 차단하지 않습니다. 오래된 콘텐츠는 폴백으로 ISR 시간 기반 재검증을 통해 계속 제공됩니다.

### 6.3 Strapi API 클라이언트

**`lib/strapi.ts`** — 다음을 수행하는 `fetch` 경량 래퍼:

1. 환경 변수 `STRAPI_API_URL`에서 Strapi API 기본 URL을 앞에 추가
2. 현재 라우트 세그먼트에서 `locale` 파라미터를 전달
3. Strapi의 응답 형식을 처리 (`data`, `meta` 언래핑)
4. 서버 측 호출에 읽기 전용 API 토큰(`STRAPI_API_TOKEN`)을 추가
5. 오류 처리 및 `packages/shared-types`의 TypeScript 타입 구현

```typescript
// 간소화
export async function fetchStrapi<T>(
  path: string,
  params?: Record<string, any>,
  options?: RequestInit,
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

**URL의 필터 상태:** 모든 검색 필터는 `useSearchParams()`를 통해 URL 쿼리 파라미터로 직렬화됩니다. 이를 통해:

- 공유 가능/북마크 가능한 검색 결과
- 뒤로 가기 네비게이션 시 상태 유지
- 검색 결과 페이지의 SEO (`noindex`로 표시되지만)

**계단식 지역 드롭다운:** `LocationCascade` 컴포넌트는 마운트 시 광역을 가져오고, 광역이 선택되면 구/군/시를 가져옵니다. 두 호출 모두 적극적으로 캐싱됩니다 (광역/구/군/시 데이터는 거의 변경되지 않음).

**GPS 주변 검색:** `NearbySearch` 컴포넌트는 클라이언트 컴포넌트(`"use client"`)로:

1. `navigator.geolocation.getCurrentPosition()`을 요청
2. 커스텀 `/api/shops/nearby` 엔드포인트를 호출
3. 거리 라벨과 함께 결과를 렌더링

**영업중/영업종료 태그:** `OpenCloseTag` 컴포넌트는 업체의 `operating_hours` JSON을 `Intl.DateTimeFormat`(`timeZone: 'Asia/Seoul'` 사용)으로 현재 KST 시간과 비교하여 적절한 태그를 표시합니다. `operating_hours_text`가 설정된 경우 JSON 스케줄에서 계산하는 대신 그대로 표시됩니다.

> **렌더링 소유권 (OWNER-01):** `OpenCloseTag`는 **서버 컴포넌트**입니다 — 태그는 `Intl.DateTimeFormat`을 사용하여 SSR/ISR 중 서버 측에서 KST로 계산됩니다. 검색 결과의 업체 카드(SSR)와 업체 상세 페이지(ISR)에서 태그가 렌더링된 HTML에 포함됩니다. 서버와 클라이언트 모두 동일한 KST 로직을 사용하므로 하이드레이션 불일치가 없습니다. ISR 캐시된 페이지의 경우 태그가 최대 60초까지 오래될 수 있지만(ISR 재검증 간격), 영업시간 단위로는 허용 가능합니다.

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
- 시간은 24시간 KST 형식. 야간 운영(예: `"open": "18:00", "close": "02:00"`)이 지원됩니다 — 종료 시간이 시작 시간보다 이르면 다음 날을 의미합니다.

### 6.5 이미지 처리

- 업체 이미지는 MinIO에서 Nginx(캐시 프록시 역할)와 Cloudflare CDN을 통해 제공
- Next.js `<Image>` 컴포넌트에 MinIO/API 도메인용 `remotePatterns` 설정
- 반응형 이미지 크기: 썸네일(300w), 상세(800w, 1200w)
- WebP 변환: 포스트-MVP로 연기(Cloudflare Pro+ 플랜 필요). MVP에서는 업로드된 형식(JPEG/PNG/WebP) 그대로 Nginx 캐시와 Cloudflare CDN을 통해 제공. Next.js `<Image>` 컴포넌트가 클라이언트 측 반응형 사이즈를 처리.

---

## 7. 인프라 및 DevOps

### 7.1 온프레미스 서버 요구사항

| 리소스 | 최소 (MVP) | 권장 |
| --- | --- | --- |
| CPU | 4코어 | 8코어 |
| RAM | 8 GB | 16 GB |
| 스토리지 | 100 GB SSD | 250 GB NVMe SSD |
| OS | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| 네트워크 | 100 Mbps | 1 Gbps |

### 7.2 Docker Compose — 프로덕션

```yaml
# docker/docker-compose.prod.yml (간소화)
version: '3.9'

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
      - '127.0.0.1:5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DATABASE_USERNAME}']
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
      - '127.0.0.1:6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', '-a', '${REDIS_PASSWORD}', 'ping']
      interval: 10s

  minio:
    image: minio/minio:RELEASE.2026-03-15T00-00-00Z # 특정 릴리즈 고정
    restart: unless-stopped
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    ports:
      - '127.0.0.1:9000:9000'
      - '127.0.0.1:9001:9001'
    healthcheck:
      test: ['CMD', 'mc', 'ready', 'local']
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
      - '127.0.0.1:1337:1337'

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
      - '127.0.0.1:3000:3000'

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
      - '127.0.0.1:3001:3001'

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
      - /etc/ssl/cloudflare:/etc/ssl/cloudflare:ro # Cloudflare Origin Certificate
    ports:
      - '443:443'
      - '80:80'
    healthcheck:
      test: ['CMD', 'nginx', '-t']
      interval: 30s

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 7.3 Nginx 설정

```nginx
# nginx/nginx.conf (핵심 섹션)

# Cloudflare IP에서만 접속 허용
# 업데이트된 목록: https://www.cloudflare.com/ips/
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
    # IPv6 범위는 간결함을 위해 생략 — 프로덕션에서 포함
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

    # MinIO 이미지 프록시 (캐싱 포함)
    location /uploads/ {
        proxy_pass http://minio:9000/{{MINIO_BUCKET_NAME}}/;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800, immutable";
        add_header X-Cache-Status $upstream_cache_status;
    }

    # Strapi 내장 관리자 패널 — 개발자 전용 접근
    # 모니터링 및 디버깅을 위해 개발자 IP / VPN으로 제한
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
| --- | --- | --- |
| SSL 모드 | Full (Strict) | Nginx에 Origin Certificate 설치 |
| 최소 TLS | 1.2 | |
| 항상 HTTPS 사용 | 켜짐 | |
| 자동 축소 | JS, CSS, HTML | |
| Brotli | 켜짐 | |
| HTTP/3 (QUIC) | 켜짐 | |
| Bot Fight Mode | 켜짐 | 의심스러운 봇에 챌린지 |
| Crawler Hints | 켜짐 | Yeti(네이버), Googlebot 허용 목록 |

**Page Rules / Cache Rules:**

| 패턴 | 규칙 | 비고 |
| --- | --- | --- |
| `{{API_DOMAIN}}/api/themes*` | Cache Everything, Edge TTL: 1일 | |
| `{{API_DOMAIN}}/api/regions*` | Cache Everything, Edge TTL: 1일 | |
| `{{API_DOMAIN}}/api/districts*` | Cache Everything, Edge TTL: 1일 | |
| `{{API_DOMAIN}}/uploads/*` | Cache Everything, Edge TTL: 7일 | |
| `{{ADMIN_DOMAIN}}/*` | Bypass Cache, Security Level: High | Admin Web (관리자 전용 접근) |
| `{{API_DOMAIN}}/admin/*` | Bypass Cache, Security Level: High | Strapi 내장 관리자 패널 (개발자 전용, Nginx에서 IP 제한) |

**속도 제한 규칙 (Cloudflare):**

| 경로 패턴 | 제한 | 시간 범위 | 액션 |
| --- | --- | --- | --- |
| `{{API_DOMAIN}}/api/auth/*` | 10 요청 | 1분 | 차단 |
| `{{API_DOMAIN}}/api/reviews` (POST) | 5 요청 | 1분 | 챌린지 |
| `{{API_DOMAIN}}/api/partnership-inquiries` (POST) | 3 요청 | 1분 | 챌린지 |

### 7.5 CI/CD 파이프라인 (GitLab CI)

```yaml
# .gitlab-ci.yml (간소화)
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
echo "Deployment complete at $(date)"
```

### 7.7 백업 전략

#### PostgreSQL 백업

| 항목 | 사양 |
| --- | --- |
| 방법 | `pg_dump --format=custom` (cron 사용) |
| 스케줄 | 매일 03:00 KST |
| 저장소 | 오프사이트 S3 호환 스토리지 (MinIO와 별도) |
| 보관 기간 | 30일 롤링 |
| 검증 | 주간 스테이징 데이터베이스 테스트 복원 |

**복원 절차:**

1. 애플리케이션 컨테이너 중지: `docker compose stop strapi customer-web admin-web`
2. 복원: `pg_restore --clean --if-exists -d swida backup.dump`
3. 검증: `psql -c "SELECT count(*) FROM shops;"`
4. 재시작: `docker compose up -d`

#### MinIO 백업

| 항목 | 사양 |
| --- | --- |
| 방법 | `rsync`로 MinIO 데이터 디렉토리 동기화 |
| 스케줄 | 매일 04:00 KST |
| 저장소 | 오프사이트 S3 호환 스토리지 |
| 보관 기간 | 30일 롤링 |

---

## 8. 보안 아키텍처

### 8.1 방어 레이어

```
레이어 1: Cloudflare 엣지
  ├── DDoS 완화 (L3/L4/L7)
  ├── WAF (OWASP 관리형 룰셋)
  ├── 봇 관리
  ├── 속도 제한
  └── SSL 종단 (공개 인증서)

레이어 2: Nginx (오리진)
  ├── Cloudflare 전용 IP 허용 목록
  ├── Strapi 내장 관리자 패널 IP 제한 (개발자 IP / VPN만)
  ├── Gzip / Brotli 압축
  ├── SSL (Cloudflare Origin Certificate)
  └── 요청 버퍼링 / 타임아웃

레이어 3: 애플리케이션 (Strapi)
  ├── 입력 살균 (내장)
  ├── CSRF 보호 (미들웨어)
  ├── CORS 설정
  ├── JWT 인증
  ├── 역할 기반 권한
  ├── 속도 제한 (Strapi 미들웨어)
  └── 계정 잠금 메커니즘

레이어 4: 데이터베이스
  ├── 내부 Docker 네트워크 전용 접속
  ├── 파라미터화 쿼리 (Knex.js)
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
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            `${process.env.MINIO_ENDPOINT}`,
          ],
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

- 모든 시크릿은 환경별 `.env` 파일에 저장 (Git에 커밋하지 않음)
- `.env.example`에 플레이스홀더 값으로 유지
- 프로덕션 `.env` 파일은 보안 SCP 또는 환경별 CI/CD 변수로 배포
- Strapi의 `APP_KEYS`, `JWT_SECRET`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT` — 모두 `openssl rand -base64 32`로 생성

---

## 9. 캐싱 전략

### 9.1 3계층 캐시 아키텍처

```
Tier 1: Cloudflare 엣지 캐시
  └── 정적 자산 (JS, CSS, 폰트, 이미지): TTL 7일
  └── 캐싱 가능한 API 응답 (테마, 광역, 구/군/시): TTL 1일
  └── MinIO의 업체 이미지: TTL 7일

Tier 2: Redis (오리진 캐시)
  └── 업체 상세: TTL 1분
  └── 업체 목록/검색: TTL 30초
  └── 리뷰 피드: TTL 30초
  └── 광역/구/군/시 목록: TTL 24시간
  └── 테마 목록: TTL 24시간
  └── 최고 평점 업체: TTL 5분
  └── 개별 업체 상세: TTL 1분

Tier 3: PostgreSQL (진실의 원천)
  └── 모든 데이터
```

### 9.1.1 Redis 장애 폴백

캐시 미들웨어는 Redis를 반드시 선택 사항으로 취급해야 합니다. Redis 연결 장애 시 미들웨어는 캐시를 우회하고 PostgreSQL에 직접 쿼리합니다. Redis 연결 오류는 `warn` 레벨로 로깅되며 요청을 차단해서는 안 됩니다. MVP에는 서킷 브레이커가 필요하지 않습니다 — Redis 작업 주위의 단순한 try/catch만으로 충분합니다.

### 9.2 캐시 무효화

캐시 무효화는 Strapi 라이프사이클 훅으로 트리거됩니다:

- **업체 게시/업데이트/게시 취소** → 영향받은 업체, 검색 결과, 관련 테마/지역 캐시의 Redis 키를 무효화합니다. 특정 업체 URL(`/ko/shop/{slug}` 및 `/en/shop/{slug}` 모두)에 대해 항상 Cloudflare API(`POST /client/v4/zones/{zone_id}/purge_cache`)를 통한 캐시 퍼지를 트리거합니다.
- **리뷰 생성/업데이트/삭제** → 부모 업체의 Redis 캐시를 무효화합니다(평점 변경).
- **테마/광역/구/군/시 변경** → 해당 Redis 키 및 Cloudflare 캐시를 무효화합니다.

**신규 콘텐츠 타입에 대한 추가 웹훅 트리거:**

| 콘텐츠 타입 | 웹훅 이벤트 | 재검증 대상 |
| --- | --- | --- |
| board_post | publish, update, unpublish | 게시판 목록 페이지, 게시물 상세 |
| event | publish, update, unpublish | 이벤트 허브, 진행 중 이벤트, 이벤트 상세 |
| notice | publish, update, unpublish | 이벤트 허브, 공지 상세 |

커뮤니티 게시물과 댓글은 SSR(캐시 없음)이므로 웹훅 재검증이 필요하지 않습니다. 북마크와 좋아요 작업은 사용자별 CSR 호출이므로 캐시에 영향이 없습니다.

### 9.3 Next.js 캐싱

- **ISR 재검증:** 업체 상세 페이지는 60초마다 재검증
- **온디맨드 재검증:** Strapi 웹훅 → Next.js 재검증 API 라우트 → `revalidatePath('/ko/shop/[slug]')` 및 `revalidatePath('/en/shop/[slug]')`
- **Fetch 캐시:** Strapi에 대한 서버 측 `fetch` 호출은 시간 기반 재검증을 위해 `next: { revalidate: N }`을 사용

---

## 10. 국제화 (i18n)

### 10.1 아키텍처

```
┌─────────────────────────────────────────────┐
│            Customer Web (Next.js)            │
│  미들웨어: 로캘 감지 → 리디렉트              │
│  [locale] 동적 세그먼트: /ko/... /en/...     │
│  next-intl: UI 문자열 관리                   │
│  Strapi API 호출: ?locale=ko 또는 ?locale=en │
└─────────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│                  Strapi                      │
│  i18n 플러그인: ko (기본), en (추가)          │
│  Admin Web(Next.js)을 통해 콘텐츠 작성       │
│  한국어 콘텐츠 우선, 영어 번역은 선택        │
│  폴백: 영어가 없으면 한국어 콘텐츠           │
└─────────────────────────────────────────────┘
                    ▲
┌───────────────────┘─────────────────────────┐
│             Admin Web (Next.js)               │
│  콘텐츠 작성을 위한 로캘 전환 UI             │
│  번역을 위해 Strapi의 i18n API 호출          │
│  관리자가 한국어 먼저 작성, 영어는 선택      │
└───────────────────────────────────────────────┘
```

### 10.2 Next.js 미들웨어

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'always', // /ko와 /en 모두 명시적
  localeDetection: true, // Accept-Language 헤더에서 감지
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

### 10.3 폴백 동작

업체나 엔티티에 영어 콘텐츠가 없는 경우, Customer Web은 한국어 버전을 미묘한 표시와 함께 보여줍니다: `"이 내용은 아직 번역되지 않았습니다"` / `"This content is not yet translated"`. 이는 Strapi 응답 로캘이 요청된 로캘과 다를 때를 감지하여 API 클라이언트에서 처리됩니다.

---

## 11. SEO 전략

### 11.1 인덱싱 페이지 (사이트맵에 포함)

`/ko`와 `/en` 버전 모두:

- 홈페이지
- 업체 상세 페이지 (`/[locale]/shop/[slug]`)
- 지역 탐색 페이지 (`/[locale]/location/[level1]/[level2]`)
- 테마 탐색 페이지 (`/[locale]/theme/[theme-slug]`)
- 파트너십 페이지

### 11.2 제외 페이지 (`noindex`)

- 쿼리 파라미터가 있는 검색 결과
- 리뷰 제출 페이지
- 로그인 / 회원가입 페이지
- 모든 Admin Web 페이지 (`{{ADMIN_DOMAIN}}/*`)
- Strapi 내장 관리자 패널 (`{{API_DOMAIN}}/admin/*`) — 개발자 전용, 공개 접근 불가

### 11.3 사이트맵 생성

Next.js App Router `sitemap.ts`가 Strapi API에서 게시된 모든 업체, 테마, 지역 조합을 가져와 동적으로 `sitemap.xml`을 생성합니다. 양쪽 로캘 버전이 모두 포함됩니다.

### 11.4 hreflang 태그

모든 페이지에 포함:

```html
<link rel="alternate" hreflang="ko" href="https://{{DOMAIN}}/ko/..." />
<link rel="alternate" hreflang="en" href="https://{{DOMAIN}}/en/..." />
<link rel="alternate" hreflang="x-default" href="https://{{DOMAIN}}/ko/..." />
```

### 11.5 구조화 데이터 (JSON-LD)

업체 상세 페이지에 `LocalBusiness` 스키마 마크업 포함:

- 이름, 주소, 전화번호
- 지리 좌표 (위도, 경도)
- 영업시간
- 종합 평점 (`averageRating`, `reviewCount`)
- 가격 범위

---

## 12. 테스트 전략

### 12.1 방법론

테스트 주도 개발(TDD) — 구현 전 테스트 작성.

### 12.2 테스트 레이어

| 레이어 | 도구 | 범위 | 커버리지 목표 |
| --- | --- | --- | --- |
| 단위 | Vitest | 컨트롤러, 서비스, 훅, 유틸리티, React 컴포넌트 | 라인 ≥ 80% |
| 통합 | Vitest + Supertest | Strapi API 엔드포인트, 커스텀 라우트, 정책 | 라인 ≥ 80% |
| E2E | Playwright | 양쪽 로캘에 걸친 전체 사용자 흐름 | 핵심 경로 100% |

### 12.3 핵심 E2E 테스트 경로

1. **검색 흐름:** 홈페이지 → 테마 검색 → 지역 필터 → 업체 상세 보기
2. **주변 검색:** GPS 허용 → 주변 결과 보기 → 업체 상세 보기
3. **리뷰 흐름:** 로그인(Kakao/Naver) → 업체로 이동 → 리뷰 제출 → 표시 확인
4. **파트너십 흐름:** 파트너십 페이지 방문 → 문의 폼 제출 → 제출 확인
5. **관리자 흐름:** Admin Web 로그인 → 업체 생성 → 게시 → Customer Web에서 확인
6. **i18n 흐름:** 언어 전환 → URL 변경 확인 → 콘텐츠 언어 확인

---

## 13. 모니터링 및 관찰 가능성

### 13.1 헬스 체크

| 서비스 | 엔드포인트 | 예상 응답 |
| --- | --- | --- |
| Strapi | `/_health` | HTTP 204 |
| Customer Web (Next.js) | `/api/health` (커스텀) | HTTP 200 + JSON |
| Admin Web (Next.js) | `/api/health` (커스텀) | HTTP 200 + JSON |
| PostgreSQL | `pg_isready` | 종료 코드 0 |
| Redis | `redis-cli ping` | PONG |
| MinIO | `mc ready local` | 종료 코드 0 |

**MinIO 스토리지 모니터링:**

- **헬스체크 엔드포인트:** MinIO는 `/minio/health/live`에 내장 헬스 엔드포인트를 제공합니다(정상 시 HTTP 200). Docker Compose 헬스체크는 `mc ready local`을 사용합니다(동등).
- **디스크 용량 알림:** MinIO 데이터 볼륨에서 **80% 용량** 시 디스크 사용량 알림을 설정합니다. 임계값 초과 시 운영 채널에 경고 알림을 트리거합니다. **90% 용량** 시 긴급 알림을 트리거합니다. `mc admin info` 또는 포트 `9001`의 MinIO Console 대시보드를 통해 모니터링합니다.

### 13.2 로깅

- **Strapi:** 내장 로거(`strapi.log`) → stdout → Docker 로그
- **Customer Web (Next.js):** `console.log` / `console.error` → stdout → Docker 로그
- **Admin Web (Next.js):** `console.log` / `console.error` → stdout → Docker 로그
- **Nginx:** 접근 및 오류 로그 → Docker 로그
- **중앙 집중 로깅:** 포스트-MVP에서 Docker 로그를 로그 수집기(예: Loki + Grafana)로 전달

#### Nginx 접근 로그 형식

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

- `proxy_set_header X-Request-ID $request_id;`를 통해 업스트림 서비스에 `X-Request-ID` 헤더 전달

#### Strapi 요청 로깅

| 상태 범위 | 로그 레벨 | 상세 |
| --- | --- | --- |
| 2xx | `debug` | 라우트, 응답 시간 |
| 4xx | `warn` | 라우트, 상태, 요청 ID, 클라이언트 IP |
| 5xx | `error` | 라우트, 상태, 요청 ID, 클라이언트 IP, 스택 트레이스 |

- Nginx의 `X-Request-ID` 헤더를 사용하여 로그 연관

#### 로그 로테이션

| 항목 | 사양 |
| --- | --- |
| 도구 | `logrotate` |
| 보관 기간 | 90일 |
| 로테이션 | 매일, 압축(`gzip`) |
| 형식 | 머신 파싱용 JSON |

### 13.3 업타임 모니터링

- **Cloudflare Health Checks:** Cloudflare 엣지에서 오리진 서버 가용성 모니터링
- **외부 업타임 모니터:** UptimeRobot(무료 티어, 5분 간격)으로 `https://{{DOMAIN}}/ko`, `https://{{ADMIN_DOMAIN}}/api/health`, `https://{{API_DOMAIN}}/api/themes` 핑

### 13.4 오류 추적

- **도구:** Sentry (자체 호스팅 또는 클라우드)
- **Strapi:** `@sentry/node` — 처리되지 않은 예외 및 5xx 응답 캡처
- **Customer Web (Next.js):** `@sentry/nextjs` — 빌드 시 소스맵 업로드
- **Admin Web (Next.js):** `@sentry/nextjs` — 빌드 시 소스맵 업로드
- **환경 태그:** `production`, `staging`

### 13.5 핵심 메트릭 및 알림

| 메트릭 | 소스 | 임계값 (경고) | 임계값 (긴급) |
| --- | --- | --- | --- |
| API 응답 시간 p95 | Nginx 접근 로그 | > 1초 | > 2초 |
| 오류율 (5xx / 전체) | Nginx 접근 로그 | > 2% | > 5% |
| 헬스 체크 실패 | UptimeRobot | — | 모든 실패 |
| 활성 사용자 (동시) | Nginx 접근 로그 | 정보 제공 | — |
| 디스크 사용량 | `df` (cron 사용) | > 80% | > 90% |
| PostgreSQL 커넥션 | `pg_stat_activity` | `max_connections`의 > 80% | > 90% |

**알림 채널:** 전용 Slack 채널 (`#swida-alerts`).

**알림 전달:**

- UptimeRobot → Slack 웹훅 (헬스 체크 실패)
- Sentry → Slack 연동 (애플리케이션 오류)
- Cron 스크립트 → Slack 웹훅 (디스크, DB 연결 임계값 초과)

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
  - 'apps/*'
  - 'packages/*'
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
| --- | --- | --- | --- |
| D-001 | 양쪽 프론트엔드에 Next.js 16.2.1(최신) 사용 | 커스텀 Admin Web이 Strapi React 18 충돌을 해소. 모든 RSC CVE 패치 완료. Turbopack 안정화, 개발 시작 87% 빠름. | 2026-03-24 |
| D-002 | Node.js 24 Active LTS | 2026년 신규 프로젝트에 권장. Strapi v5 공식 지원. 네이티브 TS 타입 스트리핑, npm v11, OpenSSL 3.5. EOL 2028년 4월. | 2026-03-24 |
| D-003 | PostgreSQL 18 대신 17 | PostGIS 3.6.2가 PG 17에서 더 검증됨, PG 18은 아직 새로움 | 2026-03-24 |
| D-004 | Tailwind CSS v4(최신) | Next.js 16이 기본으로 v4 스캐폴딩. 그린필드 프로젝트 — 마이그레이션 우려 없음. 빠른 빌드, CSS 우선 설정. | 2026-03-24 |
| D-005 | npm/yarn 대신 pnpm | 최고의 모노레포 지원, 가장 빠른 설치, 엄격한 의존성 격리 | 2026-03-24 |
| D-006 | Strapi 내장 관리자 대신 커스텀 Next.js Admin Web | 통합 프론트엔드 스택(모든 곳에서 React 19), 관리 워크플로우를 위한 커스텀 UX, 완전한 디자인 제어. Admin Web은 인증된 관리자만 접근 가능. | 2026-03-24 |
| D-007 | Strapi를 헤드리스 API 전용으로 | Strapi의 내장 관리자 패널은 모니터링, 디버깅, 긴급 운영을 위한 개발자 전용으로 제한 — 일상적인 플랫폼 관리에는 사용하지 않음 | 2026-03-24 |
| D-008 | 업체 상세에 전체 SSR 대신 ISR | 최신성(60초 재검증)과 성능 및 비용 간의 균형 | 2026-03-24 |
| D-009 | 무한 스크롤 대신 페이지 기반 페이지네이션 | SEO: 네이버/Google 인덱싱을 위한 페이지별 고유 크롤링 가능 URL | 2026-03-24 |
| D-010 | 클라우드 대신 온프레미스 | 클라이언트 요구사항 — 완전한 제어가 가능한 전용 서버 | 2026-03-24 |
| D-011 | ORM 공간 쿼리 대신 PostGIS 원시 SQL | Strapi의 Knex는 PostGIS를 네이티브로 지원하지 않음. `strapi.db.connection.raw()`를 통한 원시 SQL이 권장 접근법. | 2026-03-24 |
| D-012 | 인메모리 대신 Redis를 API 캐시로 | Strapi 재시작 시에도 지속, 여러 인스턴스로 확장 시 공유 가능 | 2026-03-24 |
| D-013 | React 19.2.4 고정 | CVE-2026-23864를 포함한 모든 RSC CVE 패치. 모든 프론트엔드가 동일 버전 공유. | 2026-03-24 |

### 14.5 연기된 항목

| 항목 | 설명 | 의존성 |
| --- | --- | --- |
| 서버 측 리뷰 속도 제한 | Cloudflare WAF 제한(~400+/일/사용자 통과)을 넘어서는 리뷰 대량 생성을 방지하기 위한 사용자별 시간당 및 업체별 일일 제한(예: 10 리뷰/사용자/시간, 3 리뷰/사용자/업체/일)을 Strapi 미들웨어로 적용. 커스텀 `review-rate-limit` 미들웨어에서 Redis 기반 카운터 필요. | Strapi 커스텀 미들웨어 + Redis |

---

> **문서 종료**
>
> 본 TSD는 구현이 진행됨에 따라 검토 및 업데이트되어야 합니다. 고정된 의존성 버전은 각 스프린트 경계에서 보안 패치를 위해 재평가되어야 합니다.
