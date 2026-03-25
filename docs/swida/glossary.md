---
title: "SWIDA Glossary"
sidebar_label: "Glossary"
sidebar_position: 99
---

# SWIDA Glossary

Canonical terminology for the SWIDA documentation. When writing or editing docs, use the preferred terms below.

| Term (EN) | Term (KO) | Context | Avoid |
|---|---|---|---|
| Shop | 업체 | Core entity — a massage/wellness business listing on the platform | 가게, 매장, 상점 |
| Admin Web | Admin Web | Custom Next.js admin interface at `admin.swida.com` (kept in English in KO docs) | 관리자 웹, 어드민 웹 |
| Customer Web | Customer Web | Customer-facing Next.js frontend at `www.swida.com` (kept in English in KO docs) | 고객 웹, 사용자 웹 |
| Review | 리뷰 | User-generated star rating + comment on a shop | 후기, 평가 |
| Theme | 테마 | Service category for classifying shop types (e.g., Swedish, Thai, Aroma) | 카테고리, 분류 |
| Region | 광역 | Level 1 location — province or metropolitan city (시/도) | 지역 (ambiguous — use Region for L1 only) |
| District | 구/군/시 | Level 2 location — sub-region within a Region (시/군/구) | 지구 |
| Partnership Inquiry | 파트너십 문의 | Onboarding request submitted by a shop owner to join SWIDA | 제휴 문의 |
| Audit Log | 감사 로그 | Change history recording who changed what and when | 변경 이력 |
| Amenities | 편의시설 | Shop facilities such as parking, shower, WiFi, private room | 시설, 부대시설 |
| Nearby Search | 주변 검색 | GPS-based shop discovery using browser geolocation | 근처 검색 |
| Draft & Publish | 초안 및 게시 | Strapi's built-in visibility system controlling shop/content visibility | 임시저장/공개 |
| Lifecycle Hook | 라이프사이클 훅 | Strapi event handler (e.g., afterCreate, afterUpdate) that triggers side effects | 생명주기 훅 |
| Service Menu | 서비스 메뉴 | A shop's list of offered services with name, duration, and price | 서비스 목록, 메뉴판 |
| Detail Search | 상세 검색 | Advanced multi-filter search combining name, location, theme, amenities, and booking | 고급 검색, 정밀 검색 |
| Location Search | 지역 검색 | Browse shops by selecting Region then District in cascading dropdowns | 위치 검색 |
| Theme Search | 테마 검색 | Browse shops filtered by a selected service theme | 테마 찾기 |
| Name Search | 이름 검색 | Simple keyword search by shop name (subset of Detail Search) | 상호 검색 |
| Slug | Slug | URL-friendly identifier auto-generated from shop or theme name (kept in English in KO docs) | |
| Content Type | 콘텐츠 타입 | Strapi data model definition (collection type or single type) | — |
| Strapi | Strapi | Headless CMS backend — API-only in production (kept in English in KO docs) | |
| PostGIS | PostGIS | PostgreSQL spatial extension used for nearby search distance calculations (kept in English in KO docs) | |
| ISR | ISR | Incremental Static Regeneration — Next.js rendering strategy for cached dynamic pages (kept in English in KO docs) | |
| SSR | SSR | Server-Side Rendering — Next.js rendering strategy for dynamic search pages (kept in English in KO docs) | |
| SSG | SSG | Static Site Generation — Next.js rendering strategy for static content pages (kept in English in KO docs) | |
| Contact Channels | 연락처 | Shop's communication links: phone, KakaoTalk, Instagram, website, Naver Place | 연락 방법, 소통 채널 |
| Open/Close Tag | 영업중/영업종료 태그 | Per-shop custom labels indicating operating status on Customer Web | 오픈/마감 태그 |
| Inactive Reason | 비활성 사유 | Reason code recorded when unpublishing a shop (closed, owner_request, violation, stale, other) | 비공개 사유 |
| Moderation | 검토/관리 | Admin process of reviewing and managing user-generated content (reviews, reports) | 중재 |
| Display Name | 닉네임 | Customer's public-facing name shown on reviews | 표시 이름, 사용자명 |
