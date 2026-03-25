---
title: "SWIDA — Customer Web FSD"
sidebar_label: "Customer Web FSD (KO)"
sidebar_position: 2
---

# 기능 명세서 (FSD)

## SWIDA — Customer Web

- **버전**: 1.0
- **날짜**: 2026-03-26
- **기반 문서**: SWIDA PRD v1.1, SWIDA TSD v1.1
- **범위**: MVP — 고객 대상 업체 탐색 웹 애플리케이션
- **관련 문서**: UI/UX 명세서 (TBD)

---

## 1. 문서 개요

### 1.1 목적

본 문서는 SWIDA Customer Web 애플리케이션의 페이지 목록과 기능 명세를 정의합니다. 각 페이지의 역할, 표시 데이터, 사용자 인터랙션 방식을 다룹니다. 시각 디자인, 레이아웃, 인터랙션 세부사항은 별도의 UI/UX 명세서에서 다룹니다.

### 1.2 MVP 범위

| 포함 | 미포함 (향후 개발) |
|---|---|
| 홈페이지 (추천 업체/테마) | 북마크 / 즐겨찾기 |
| 상세 검색 (고급 다중 필터) | 지도 뷰 (핀이 표시된 시각적 지도) |
| 테마 검색 (서비스 유형별 탐색) | 예약 연동 |
| 지역 검색 (시/도·구/군별 탐색) | 푸시 알림 |
| 내 주변 검색 (GPS 기반 탐색) | 쿠폰 / 딜 시스템 |
| 업체 상세 페이지 (전체 프로필 + 리뷰) | 채팅 / 메시지 |
| 리뷰 피드 + 리뷰 작성 | 초성 검색 (자음 기반) |
| 파트너십 페이지 + 문의 양식 | 고급 유사 검색 (pg_trgm / Meilisearch) |
| 고객 인증 (이메일, 카카오, 네이버) | 업체 운영자 포털 |
| 다국어 지원 (한국어 / 영어) | 업체 분석 |
| 리뷰 신고 | 리뷰 SMS 인증 |

### 1.3 글로벌 규칙

| 항목 | 규칙 |
|---|---|
| 통화 | KRW (₩). 정수에 쉼표 구분자로 표시 (예: ₩50,000) |
| 날짜/시간 | KST (한국 표준시, UTC+9). 형식: 날짜 `YYYY.MM.DD`, 시간 `HH:mm` |
| 시간대 | 영업중/영업종료 태그 판별 시 `Intl.DateTimeFormat`을 통해 `Asia/Seoul` 시간대 사용 |
| 로케일 라우팅 | 경로 기반: `/ko/...` (기본), `/en/...`. 루트 `/`는 `/ko`로 리다이렉트 |
| 페이지네이션 | SEO를 위해 페이지 기반 (무한 스크롤 아님). 각 페이지는 고유 URL 보유 |
| 필터 상태 | 모든 활성 필터는 URL 쿼리 파라미터에 유지 (공유 가능, 북마크 가능) |
| 렌더링 | 정적 콘텐츠는 SSG/ISR, 동적 검색은 SSR, GPS 및 인증 플로우는 CSR |
| 반응형 | 모바일 우선. Tailwind CSS min-width 브레이크포인트 (기본=모바일 → `md:`=태블릿 → `lg:`=데스크톱) |
| 인증 | 탐색 시 선택 사항. 리뷰 작성 및 리뷰 신고 시에만 필요 |
| 빈 상태 | 필터를 넓히거나 다른 검색 모드를 시도하도록 안내하는 친화적 메시지 |
| 로딩 상태 | 모든 데이터 로딩 상태에 스켈레톤 플레이스홀더 적용 (UI/UX 명세서에 정의) |
| 오류 처리 | API 오류 시 토스트 알림. 네트워크 장애 시 재시도 옵션 제공 |

---

## 2. 페이지 목록

| # | 페이지 | 경로 | 인증 | 렌더링 | SEO 색인 | 설명 |
|---|---|---|---|---|---|---|
| 1 | 홈페이지 | `/[locale]` | 공개 | SSG + ISR | 예 | 추천 업체, 테마 카드, 빠른 접근 |
| 2 | 상세 검색 | `/[locale]/search` | 공개 | SSR | 아니오 | 고급 다중 필터 검색 |
| 3 | 테마 탐색 | `/[locale]/theme/[theme-slug]` | 공개 | SSG | 예 | 서비스 테마별 업체 필터링 |
| 4 | 지역 탐색 | `/[locale]/location/[level1]/[level2]` | 공개 | SSG | 예 | 시/도·구/군별 업체 필터링 |
| 5 | 내 주변 검색 | `/[locale]/nearby` | 공개 | CSR | 아니오 | GPS 기반 업체 탐색 |
| 6 | 업체 상세 | `/[locale]/shop/[slug]` | 공개 | ISR | 예 | 업체 전체 프로필 + 리뷰 |
| 7 | 리뷰 피드 | `/[locale]/reviews` | 공개 | SSR | 아니오 | 전체 업체의 최신 리뷰 |
| 8 | 파트너십 | `/[locale]/partnership` | 공개 | SSG | 예 | 업체 운영자 온보딩 랜딩 페이지 |
| 9 | 로그인 | `/[locale]/auth/login` | 비회원 전용 | CSR | 아니오 | 이메일 + 소셜 로그인 (카카오, 네이버) |
| 10 | OAuth 콜백 | `/[locale]/auth/callback` | 비회원 전용 | CSR | 아니오 | 소셜 로그인 콜백 핸들러 |

**인증 범례**: 공개 = 누구나 접근 가능 (로그인 불필요) / 비회원 전용 = 비인증 사용자만 접근 (로그인 사용자는 홈페이지로 리다이렉트)

**접근 제어**

| 사용자 상태 | 접근 가능 페이지 | 제한된 동작 처리 |
|---|---|---|
| 비로그인 | 모든 페이지 (탐색만 가능) | 리뷰 작성 / 신고 → 로그인 페이지로 리다이렉트 |
| 로그인 (활성) | 모든 페이지 + 리뷰 작성 | 로그인 페이지 → 홈페이지로 리다이렉트 |
| 로그인 (잠금/정지) | 모든 페이지 (탐색만 가능) | 리뷰 작성 / 신고 → 오류 메시지: "계정이 정지되었습니다. 관리자에게 문의해주세요." |

---

## 3. 인증

### 3.1 로그인 (`/[locale]/auth/login`)

> PRD 참조: §3.3 Customer, §11.5 Security

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-AUTH-01 | 이메일/비밀번호 로그인 | Strapi Users & Permissions 플러그인을 통한 표준 이메일 + 비밀번호 인증 |
| F-AUTH-02 | 카카오 소셜 로그인 | 카카오를 통한 OAuth 2.0 로그인 — Strapi 커스텀 프로바이더 (PRD §3.3) |
| F-AUTH-03 | 네이버 소셜 로그인 | 네이버를 통한 OAuth 2.0 로그인 — Strapi 커스텀 프로바이더 (PRD §3.3) |
| F-AUTH-04 | 이메일 회원가입 | 이메일, 비밀번호, 닉네임으로 신규 계정 생성 |
| F-AUTH-05 | 로그인 후 리다이렉트 | 로그인 성공 후, 로그인 전에 있던 페이지로 리다이렉트 |
| F-AUTH-06 | 잠금 계정 처리 | 계정이 잠금/정지된 경우, 오류 메시지를 표시하고 리뷰 기능 로그인을 차단 |

**회원가입 입력 제약조건**

| 필드 | 필수 | 제약조건 | 비고 |
|---|---|---|---|
| Email | 예 | 유효한 이메일 형식, 고유값 | Strapi Users & Permissions |
| Password | 예 | 최소 6자 | Strapi 기본 정책 |
| Display Name | 예 | 2–20자, 고유값 | 리뷰에 표시 |

**서버 유효성 검사 오류**

| 조건 | 오류 |
|---|---|
| 잘못된 이메일/비밀번호 | "이메일 또는 비밀번호가 올바르지 않습니다" / "Invalid email or password" |
| 이미 등록된 이메일 | "이미 등록된 이메일입니다" / "This email is already registered" |
| 이미 사용 중인 닉네임 | "이미 사용 중인 닉네임입니다" / "This display name is already taken" |
| 계정 정지 | "계정이 정지되었습니다. 관리자에게 문의해주세요." / "Your account has been suspended. Please contact the administrator." |

### 3.2 OAuth 콜백 (`/[locale]/auth/callback`)

| # | 기능 | 설명 |
|---|---|---|
| F-AUTH-07 | 토큰 교환 | OAuth 인가 코드를 Strapi JWT로 교환 |
| F-AUTH-08 | 자동 회원가입 | 소셜 로그인 최초 사용자는 자동으로 회원가입 처리 |
| F-AUTH-09 | 오류 처리 | OAuth 플로우 실패 시 오류 메시지를 표시하고 로그인 페이지로 리다이렉트 |

### 3.3 세션 관리

> PRD 참조: §11.5 Security, TSD §5.4.1

| # | 기능 | 설명 |
|---|---|---|
| F-SESSION-01 | JWT 저장 | Strapi JWT를 httpOnly 쿠키(권장) 또는 클라이언트 측 상태에 저장 |
| F-SESSION-02 | 토큰 유효기간 | 7일 (Strapi `plugins.ts`에서 설정 가능) (TSD §5.4.1) |
| F-SESSION-03 | 로그아웃 | JWT 삭제, 클라이언트 상태 초기화, 홈페이지로 리다이렉트 |
| F-SESSION-04 | 세션 만료 | 토큰 만료 시, 인증 상태를 초기화하고 보호된 동작 시도 시 로그인 페이지로 리다이렉트 |

### 3.4 로그아웃

| # | 기능 | 설명 |
|---|---|---|
| F-LOGOUT-01 | 세션 삭제 | JWT 토큰 제거 및 클라이언트 측 인증 상태 초기화 |
| F-LOGOUT-02 | 리다이렉트 | 로그아웃 후 홈페이지로 이동 |

---

## 4. 홈페이지

### 4.1 홈페이지 (`/[locale]`)

> PRD 참조: §6 Search & Filtering, §7.1 Customer-Facing Menus, §9 Service Themes

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-HOME-01 | 테마 카드 | 모든 서비스 테마를 선택 가능한 카드/태그로 표시. 테마 클릭 시 테마 탐색 페이지로 이동. `display_order` 기준 정렬. (PRD §9) |
| F-HOME-02 | 추천 업체 | 높은 평점 또는 최근 등록된 업체의 선별 목록 표시. 업체 카드에 표시되는 항목: 썸네일, 이름, 구/군, 테마, 평균 평점, 리뷰 수 |
| F-HOME-03 | 빠른 검색 접근 | 내비게이션을 통한 5가지 검색 모드(상세, 테마, 지역, 내 주변, 이름)의 주요 진입점 |
| F-HOME-04 | 내비게이션 메뉴 | 하단 내비게이션(모바일) / 사이드바 또는 상단 내비게이션(데스크톱)에 모든 고객용 메뉴 항목 표시 (PRD §7.1) |

**API 호출**

| Endpoint | 용도 | 캐시 |
|---|---|---|
| `GET /api/themes?locale={locale}&sort=display_order:asc` | 테마 카드 목록 | SSG, 온디맨드 재검증 |
| `GET /api/shops?locale={locale}&sort=average_rating:desc&pagination[pageSize]=12` | 추천 업체 | ISR, 300초마다 재검증 |

---

## 5. 검색 — 상세 검색

### 5.1 상세 검색 (`/[locale]/search`)

> PRD 참조: §6.1 Detail Search (Advanced), §6.6 Search UX Rules

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-SEARCH-01 | 업체명 필터 | 키워드/부분 일치 입력. 대소문자 무관 한국어 문자 매칭 (PRD §6.1) |
| F-SEARCH-02 | 지역 필터 | 계단식 드롭다운 — Level 1 (시/도) 선택 시 Level 2 (구/군) 옵션을 동적으로 로드 (PRD §6.1) |
| F-SEARCH-03 | 테마 필터 | 모든 테마에서 다중 선택 (PRD §6.1) |
| F-SEARCH-04 | 편의시설 필터 | 편의시설 토글 체크박스: 주차, 샤워, 수면실, 개인실, WiFi, 장애인 편의 (PRD §6.1) |
| F-SEARCH-05 | 예약 필터 | 예약 필요 여부 토글: 예 / 아니오 / 전체 (PRD §6.1) |
| F-SEARCH-06 | 필터 논리 | 모든 필터는 AND 논리로 결합. 선택한 모든 기준에 부합하는 업체만 반환. 비어있는 필터는 무시 (PRD §6.1) |
| F-SEARCH-07 | 정렬 옵션 | 평점순 (내림차순, 기본값), 리뷰 수순 (내림차순), 최신 등록순 (내림차순) (PRD §6.6) |
| F-SEARCH-08 | 결과 수 | 결과 상단에 표시 (예: "검색 결과 42개") `pagination.total`에서 가져옴 (PRD §6.6) |
| F-SEARCH-09 | 페이지네이션 | 페이지별 고유 URL을 가진 페이지 기반. SEO 친화적 크롤링 가능 URL (PRD §6.6) |
| F-SEARCH-10 | URL 상태 | 모든 활성 필터를 URL 쿼리 파라미터로 직렬화. 공유 가능, 북마크 가능, 뒤로가기 안전 (PRD §6.6) |
| F-SEARCH-11 | 결과 없음 | 친화적 메시지: "검색 결과가 없습니다" / "No results found" 및 필터를 넓히도록 제안 (PRD §6.6) |

**업체 카드 표시 필드** (모든 검색 결과 목록에 적용)

| 필드 | 출처 | 비고 |
|---|---|---|
| 썸네일 | `shop.thumbnail.url` | 기본 표시 이미지 |
| 업체명 | `shop.name` | 로컬라이즈됨 |
| 구/군 | `shop.district.name` | Level 2 지역, 로컬라이즈됨 |
| 테마 | `shop.themes[].name` | 상위 테마를 태그로 표시, 로컬라이즈됨 |
| 평균 평점 | `shop.average_rating` | 별점으로 표시 (예: ★ 4.5) |
| 리뷰 수 | `shop.total_reviews` | 개수로 표시 (예: "리뷰 23개") |
| 영업중/영업종료 태그 | 클라이언트 측 계산 | `shop.operating_hours`와 현재 KST 시간 비교 |

**API 호출**

```
GET /api/shops?locale={locale}
  &filters[name][$containsi]={keyword}
  &filters[region][documentId][$eq]={regionId}
  &filters[district][documentId][$eq]={districtId}
  &filters[themes][documentId][$in][0]={themeId}
  &filters[amenities][parking_available][$eq]=true
  &filters[booking_required][$eq]=false
  &sort=average_rating:desc
  &pagination[page]={page}
  &pagination[pageSize]=20
  &populate[thumbnail][fields][0]=url
  &populate[themes][fields][0]=name&populate[themes][fields][1]=slug
  &populate[district][fields][0]=name
  &fields[0]=name&fields[1]=slug&fields[2]=average_rating
  &fields[3]=total_reviews&fields[4]=address&fields[5]=operating_hours
```

---

## 6. 검색 — 테마 탐색

### 6.1 테마 탐색 (`/[locale]/theme/[theme-slug]`)

> PRD 참조: §6.2 Theme Search, §9 Service Themes

| # | 기능 | 설명 |
|---|---|---|
| F-THEME-01 | 테마 헤더 | 선택된 테마명, 아이콘, 설명을 페이지 상단에 표시 |
| F-THEME-02 | 업체 목록 | 선택된 테마가 태그된 모든 업체, 기본 정렬은 평점순 (내림차순) (PRD §6.2) |
| F-THEME-03 | 선택적 지역 필터 | 테마 선택 후 Level 1 + Level 2 지역으로 결과를 좁힐 수 있음 (PRD §6.2) |
| F-THEME-04 | 정렬 옵션 | 평점순 (내림차순, 기본값), 리뷰 수순 (내림차순), 최신 등록순 (내림차순) |
| F-THEME-05 | 페이지네이션 | 고유 URL을 가진 페이지 기반 |
| F-THEME-06 | 결과 수 | 해당 테마의 전체 업체 수 |

**API 호출**

```
GET /api/shops?locale={locale}
  &filters[themes][slug][$eq]={theme-slug}
  &sort=average_rating:desc
  &pagination[page]={page}&pagination[pageSize]=20
  &populate[thumbnail][fields][0]=url
  &populate[themes][fields][0]=name&populate[themes][fields][1]=slug
  &populate[district][fields][0]=name
```

---

## 7. 검색 — 지역 탐색

### 7.1 지역 탐색 (`/[locale]/location/[level1]/[level2]`)

> PRD 참조: §6.3 Location Search, §4 Location System

| # | 기능 | 설명 |
|---|---|---|
| F-LOC-01 | 시/도 선택 | API에서 Level 1 시/도 목록을 조회. 시/도 선택 시 Level 2 구/군을 동적으로 로드 (PRD §6.3) |
| F-LOC-02 | 구/군 선택 | 선택한 시/도에 따라 필터링된 Level 2 구/군 목록 (PRD §6.3) |
| F-LOC-03 | 업체 목록 | 선택한 구/군의 모든 업체, 평점순 정렬 (내림차순) (PRD §6.3) |
| F-LOC-04 | 정렬 옵션 | 평점순 (내림차순, 기본값), 리뷰 수순 (내림차순), 최신 등록순 (내림차순) |
| F-LOC-05 | 페이지네이션 | 고유 URL을 가진 페이지 기반 |
| F-LOC-06 | 브레드크럼 | 내비게이션 브레드크럼 표시: 홈 > 시/도 > 구/군 |

**API 호출**

| Endpoint | 용도 |
|---|---|
| `GET /api/regions?locale={locale}` | 모든 Level 1 시/도 |
| `GET /api/districts?locale={locale}&filters[region][documentId][$eq]={regionId}` | 선택한 시/도의 Level 2 구/군 |
| `GET /api/shops?locale={locale}&filters[district][documentId][$eq]={districtId}&sort=average_rating:desc` | 선택한 구/군의 업체 |

---

## 8. 검색 — 내 주변

### 8.1 내 주변 검색 (`/[locale]/nearby`)

> PRD 참조: §6.4 Nearby Search

| # | 기능 | 설명 |
|---|---|---|
| F-NEAR-01 | GPS 권한 | 최초 사용 시 브라우저/기기 위치 권한을 요청. 설명과 함께 권한 요청 프롬프트 표시 (PRD §6.4) |
| F-NEAR-02 | 권한 거부 | 위치 권한이 필요하다는 안내 메시지와 함께 활성화 방법 안내 표시 |
| F-NEAR-03 | 업체 목록 | 설정 가능한 반경 내에서 거리순 (가까운 순) 정렬된 업체 (기본값: 5km) (PRD §6.4) |
| F-NEAR-04 | 거리 표시 | 고객과 각 업체 간 거리 표시 (예: "1.2 km") (PRD §6.4) |
| F-NEAR-05 | 선택적 필터 | 내 주변 결과를 테마 또는 편의시설로 선택적 필터링 가능 (PRD §6.4) |
| F-NEAR-06 | 반경 조절 | 검색 반경을 사용자가 조절 가능 (예: 1km, 3km, 5km, 10km) |
| F-NEAR-07 | 로딩 상태 | GPS 확인 및 API 조회 중 로딩 인디케이터 표시 |
| F-NEAR-08 | 페이지네이션 | 페이지 기반 |

**API 호출 (커스텀 컨트롤러)**

```
GET /api/shops/nearby?lat={lat}&lng={lng}&radius={meters}
  &locale={locale}
  &pagination[page]={page}&pagination[pageSize]=20
```

응답에는 각 업체의 `distance` 필드(미터 단위)가 포함되며, 거리 오름차순으로 정렬됩니다. (TSD §5.2.1)

---

## 9. 검색 — 이름 검색

> PRD 참조: §6.5 Name Search

이름 검색은 상세 검색(§5)의 하위 기능으로 구현됩니다. 사용자가 다른 필터 없이 업체명 키워드만 입력하면 상세 검색 페이지가 이름 검색으로 작동합니다.

| # | 기능 | 설명 |
|---|---|---|
| F-NAME-01 | 키워드 입력 | 부분 또는 전체 업체명 입력 가능. 대소문자 무관, 한국어 문자 매칭 지원 (PRD §6.5) |
| F-NAME-02 | 결과 | 일치하는 업체를 표준 업체 카드 레이아웃으로 표시 |
| F-NAME-03 | 빠른 검색 | 모든 페이지에서 빠른 이름 검색을 위해 글로벌 내비게이션 헤더에 검색 입력 제공 |

---

## 10. 업체 상세

### 10.1 업체 상세 페이지 (`/[locale]/shop/[slug]`)

> PRD 참조: §5 Shop Listing Data Model, §8 Review System

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-SHOP-01 | 이미지 갤러리 | 업체 이미지(1~10장) 표시, 스와이프/클릭 내비게이션. 썸네일을 기본 이미지로 사용 (PRD §5.1) |
| F-SHOP-02 | 기본 정보 | 업체명, 설명, 주소, 영업 시간, 라스트 오더 시간, 휴무일, 휴일 예외 (PRD §5.1) |
| F-SHOP-03 | 영업중/영업종료 태그 | `operating_hours`와 현재 KST 시간 비교. `open_tag` (기본: "영업중") 또는 `close_tag` (기본: "영업종료") 표시 (PRD §5.6) |
| F-SHOP-04 | 위치 표시 | 시/도 + 구/군 이름. 선택적으로 정적 지도 이미지에 주소 표시 |
| F-SHOP-05 | 서비스 테마 | 태그된 모든 테마를 배지/태그 칩으로 표시 (PRD §5.2) |
| F-SHOP-06 | 서비스 메뉴 | 서비스명, 소요 시간, 가격(₩XX,XXX 형식)이 포함된 서비스 메뉴 (PRD §5.2.1) |
| F-SHOP-07 | 가격대 | 가용 시 일반적인 가격 표시 (PRD §5.2) |
| F-SHOP-08 | 예약 정보 | 예약 필요 여부. 필요 시 예약 URL/전화번호와 CTA 버튼 표시 (PRD §5.2) |
| F-SHOP-09 | 성별 이용 가능 여부 | 설정된 경우 성별 이용 가능 레이블 표시 (PRD §5.2) |
| F-SHOP-10 | 편의시설 | 편의시설 아이콘/레이블과 가용 시 세부 텍스트 표시. 편의시설: 주차(유형 + 세부사항), 샤워, 수면실, 개인실, WiFi, 장애인 편의(세부사항) (PRD §5.3) |
| F-SHOP-11 | 연락 채널 | 가용한 연락 링크 표시: 전화(tel: 링크), 카카오톡, 인스타그램, 웹사이트, 네이버 플레이스 (PRD §5.4) |
| F-SHOP-12 | 지원 언어 | 가용 시 업체에서 사용 가능한 언어 표시 (PRD §5.5) |
| F-SHOP-13 | 평균 평점 | 별점과 전체 리뷰 수를 눈에 띄게 표시 (PRD §5.6) |
| F-SHOP-14 | 리뷰 목록 | 해당 업체의 게시된 리뷰를 최신순으로 표시. 각 리뷰에 표시되는 항목: 작성자 닉네임, 평점(별), 코멘트, 작성일 (PRD §8.3) |
| F-SHOP-15 | 리뷰 페이지네이션 | 업체 상세 페이지의 리뷰에 대한 페이지 기반 페이지네이션 |
| F-SHOP-16 | 리뷰 작성 | 업체 상세 페이지의 인라인 리뷰 양식 (로그인 필요). 상세 내용은 §11 참조 |
| F-SHOP-17 | 리뷰 신고 | 각 리뷰의 신고 버튼 (로그인 필요). 상세 내용은 §11.3 참조 |

**성별 이용 가능 표시 레이블**

| 값 | 한국어 | 영어 |
|---|---|---|
| `all` | 남녀 모두 | All genders |
| `female_only` | 여성 전용 | Female only |
| `male_only` | 남성 전용 | Male only |
| `couple_available` | 커플 가능 | Couples available |

**API 호출**

```
GET /api/shops?locale={locale}
  &filters[slug][$eq]={slug}
  &populate[images][fields][0]=url&populate[images][fields][1]=alternativeText
  &populate[thumbnail][fields][0]=url
  &populate[themes][fields][0]=name&populate[themes][fields][1]=slug
  &populate[region][fields][0]=name
  &populate[district][fields][0]=name
  &populate[amenities]=*
  &populate[contact_channels]=*
  &populate[service_menu]=*
```

**SEO — 구조화된 데이터 (JSON-LD)**

업체 상세 페이지는 `LocalBusiness` 스키마 마크업을 포함합니다: name, address, telephone, geo coordinates (latitude, longitude), opening hours, aggregate rating (`averageRating`, `reviewCount`), price range. (TSD §11.5)

---

## 11. 리뷰 시스템

### 11.1 리뷰 작성 (업체 상세 페이지)

> PRD 참조: §8.2 Review Submission

| # | 기능 | 설명 |
|---|---|---|
| F-REV-01 | 로그인 게이트 | 리뷰 양식은 로그인한 사용자에게만 표시. 비로그인 사용자에게는 로그인 CTA 표시 (PRD §8.2) |
| F-REV-02 | 별점 입력 | 1~5점 척도, 필수. 인터랙티브 별점 선택기 (PRD §8.2) |
| F-REV-03 | 코멘트 입력 | 자유 텍스트, 필수. 10~500자. 글자 수 표시. 클라이언트 측 유효성 검사 (PRD §8.2) |
| F-REV-04 | 리뷰 제출 | API로 POST. 성공 시 리뷰가 목록에 표시되고 업체 평점/리뷰 수 업데이트. 성공 토스트 표시 |
| F-REV-05 | 잠금 계정 | 사용자의 계정이 잠금된 경우, 오류 메시지를 표시하고 제출 차단 (PRD §8.5) |
| F-REV-06 | 유효성 검사 오류 | 코멘트가 10자 미만 또는 500자 초과 시 인라인 오류 표시 |

**입력 제약조건**

| 필드 | 필수 | 제약조건 |
|---|---|---|
| Rating | 예 | 정수, 1–5 |
| Comment | 예 | 10–500자 |

**API 호출**

```
POST /api/reviews
Authorization: Bearer {jwt}
Body: { "data": { "rating": 5, "comment": "...", "shop": "{shopDocumentId}" } }
```

`author` 필드는 인증된 사용자의 JWT에서 자동으로 설정됩니다. (TSD §5.2.2)

**서버 유효성 검사 오류**

| 조건 | 오류 |
|---|---|
| 계정 잠금/정지 | "계정이 정지되었습니다. 관리자에게 문의해주세요." / "Your account has been suspended." |
| 코멘트 길이 초과/미달 | "리뷰는 10자 이상 500자 이하로 작성해주세요." / "Review must be 10–500 characters." |
| 별점 누락 | "별점을 선택해주세요." / "Please select a star rating." |

### 11.2 리뷰 피드 (`/[locale]/reviews`)

> PRD 참조: §8.6 Review Feed

| # | 기능 | 설명 |
|---|---|---|
| F-REV-07 | 최신 리뷰 | 모든 업체의 최신 게시 리뷰를 최신순으로 표시 (PRD §8.6) |
| F-REV-08 | 리뷰 카드 | 각 리뷰에 표시되는 항목: 작성자 닉네임, 평점(별), 코멘트, 작성일, 연결된 업체명 + 썸네일 |
| F-REV-09 | 업체 링크 | 리뷰 카드의 업체명/썸네일 클릭 시 해당 업체의 상세 페이지로 이동 |
| F-REV-10 | 페이지네이션 | 페이지 기반 |

**API 호출**

```
GET /api/reviews?locale={locale}
  &sort=createdAt:desc
  &filters[status][$eq]=published
  &populate[shop][fields][0]=name&populate[shop][fields][1]=slug
  &populate[shop][populate][thumbnail][fields][0]=url
  &populate[author][fields][0]=username
  &pagination[page]={page}&pagination[pageSize]=20
```

### 11.3 리뷰 신고

> PRD 참조: §8.5 Review Integrity & Abuse Prevention

| # | 기능 | 설명 |
|---|---|---|
| F-REV-11 | 신고 버튼 | 각 리뷰의 "신고" 버튼. 로그인 필요 (PRD §8.5) |
| F-REV-12 | 신고 사유 | 사유 선택: `spam`, `fake`, `inappropriate`, `irrelevant`, `other` (PRD §8.5) |
| F-REV-13 | 신고 제출 | API로 POST. 성공 시 확인 토스트 표시. 신고된 리뷰는 `under_review` 상태로 전환 (PRD §8.5) |
| F-REV-14 | 중복 신고 | 사용자가 이미 해당 리뷰를 신고한 경우, 신고 버튼을 비활성화하고 "이미 신고한 리뷰입니다" / "You have already reported this review" 표시 |

**API 호출**

```
POST /api/reviews/{id}/report
Authorization: Bearer {jwt}
Body: { "reason": "spam" }
```

---

## 12. 파트너십

### 12.1 파트너십 페이지 (`/[locale]/partnership`)

> PRD 참조: §10.1 Partnership Page Content, §10.3 Partnership Inquiry Management

| # | 기능 | 설명 |
|---|---|---|
| F-PART-01 | 랜딩 콘텐츠 | SWIDA 소개, 업체 운영자를 위한 혜택, 단계별 등록 프로세스, 연락처 정보(이메일, 카카오톡, 인스타그램), FAQ (PRD §10.1) |
| F-PART-02 | 문의 양식 | 업체 운영자가 파트너십 문의를 제출할 수 있는 내장 양식 (PRD §10.3.1) |
| F-PART-03 | 양식 제출 | 공개 API로 POST. 인증 불필요. 제출 성공 시 성공 메시지 표시 (PRD §10.3) |
| F-PART-04 | 중복 감지 | 서버 측: 동일한 업체명 + 주소가 이미 존재하는 경우, 잠재적 중복으로 표시 (PRD §10.3.2) |

**문의 양식 필드**

| 필드 | 필수 | 제약조건 |
|---|---|---|
| 업체명 | 예 | 텍스트, 최대 255자 |
| 담당자 | 예 | 텍스트, 최대 100자 |
| 전화번호 | 예 | 숫자, 최대 20자 |
| 이메일 | 아니오 | 유효한 이메일 형식 |
| 주소 | 예 | 텍스트, 최대 500자 |
| 업종 | 아니오 | 텍스트, 최대 100자 |
| 선호 연락 채널 | 예 | 선택: phone, kakaotalk, instagram, email |
| 메시지 | 아니오 | 텍스트, 최대 2000자 |

**API 호출**

```
POST /api/partnership-inquiries
Body: {
  "data": {
    "shop_name": "...",
    "contact_person": "...",
    "phone_number": "...",
    "email": "...",
    "address": "...",
    "business_type": "...",
    "preferred_contact_channel": "phone",
    "message": "...",
    "source": "website_form"
  }
}
```

**서버 유효성 검사 오류**

| 조건 | 오류 |
|---|---|
| 필수 항목 누락 | "필수 항목을 입력해주세요." / "Please fill in all required fields." |
| 잘못된 이메일 형식 | "올바른 이메일 형식을 입력해주세요." / "Please enter a valid email address." |
| 요청 제한 | "잠시 후 다시 시도해주세요." / "Please try again later." |

---

## 13. 국제화 (i18n)

> PRD 참조: §11.4 Localization

| # | 기능 | 설명 |
|---|---|---|
| F-I18N-01 | 경로 기반 라우팅 | 한국어: `/ko/...` (기본), 영어: `/en/...`. 둘 다 명시적이며, 접두사 없는 경로는 없음 (PRD §11.4) |
| F-I18N-02 | 루트 리다이렉트 | `www.swida.com/`은 Next.js 미들웨어를 통해 `/ko`로 리다이렉트 (PRD §11.4) |
| F-I18N-03 | 로케일 감지 | 최초 방문 시 `Accept-Language` 헤더에서 로케일을 감지하여 적절한 로케일 접두사로 리다이렉트 |
| F-I18N-04 | 언어 전환 | 사이트 헤더/내비게이션의 언어 전환기. 대체 로케일의 동일 페이지로 링크 (PRD §11.4) |
| F-I18N-05 | UI 문자열 번역 | 정적 UI 문자열(레이블, 버튼, 내비게이션, 메시지)을 JSON 번역 파일(`messages/ko.json`, `messages/en.json`)에서 로드 (PRD §11.4) |
| F-I18N-06 | 콘텐츠 로케일 | API 요청에 `?locale=ko` 또는 `?locale=en` 포함. Strapi가 로컬라이즈된 콘텐츠 반환 (PRD §11.4) |
| F-I18N-07 | 폴백 동작 | 영어 콘텐츠가 없는 경우, 한국어 버전을 표시하며 안내 문구 표시: "이 내용은 아직 번역되지 않았습니다" / "This content is not yet translated" (PRD §11.4) |
| F-I18N-08 | hreflang 태그 | 모든 페이지에 `<link rel="alternate" hreflang="ko">`와 `<link rel="alternate" hreflang="en">` 태그 포함. `x-default`는 `/ko`를 가리킴 (PRD §11.4) |

---

## 14. SEO

> PRD 참조: §11.3 SEO, TSD §11

| # | 기능 | 설명 |
|---|---|---|
| F-SEO-01 | 메타 태그 | 페이지별 고유 `<title>` 및 `<meta name="description">`, 로케일별 로컬라이즈 (PRD §11.3) |
| F-SEO-02 | Open Graph | 소셜 공유를 위한 페이지별 OG title, description, image (PRD §11.3) |
| F-SEO-03 | 구조화된 데이터 | 업체 상세 페이지의 JSON-LD `LocalBusiness` 스키마 (TSD §11.5) |
| F-SEO-04 | 사이트맵 | Next.js를 통한 자동 생성 `sitemap.xml`, Strapi API에서 모든 게시된 업체, 테마, 지역 조회. 양쪽 로케일 버전 포함 (PRD §11.3) |
| F-SEO-05 | noindex | 적용 대상: 쿼리 파라미터가 있는 검색 결과, 리뷰 페이지, 로그인/회원가입 페이지 (PRD §11.3) |
| F-SEO-06 | 정규 URL | 각 페이지에 정규 URL을 가리키는 `<link rel="canonical">` 태그 포함 |

---

## 15. 글로벌 레이아웃 및 내비게이션

> PRD 참조: §7.1 Customer-Facing Menus

### 15.1 헤더

| # | 기능 | 설명 |
|---|---|---|
| F-NAV-01 | 로고 | SWIDA 로고 — 홈페이지(`/[locale]`)로 링크 |
| F-NAV-02 | 빠른 검색 | 모든 페이지에서 빠른 이름 검색을 위한 헤더 내 검색 입력 |
| F-NAV-03 | 언어 전환 | 한국어와 영어 간 전환 (§13 F-I18N-04 참조) |
| F-NAV-04 | 인증 동작 | 비로그인: "로그인" / "Login" 버튼. 로그인: 사용자 닉네임 + 로그아웃 옵션 |

### 15.2 내비게이션 메뉴

| # | 기능 | 설명 |
|---|---|---|
| F-NAV-05 | 상세 검색 | `/[locale]/search` 링크 (PRD §7.1) |
| F-NAV-06 | 테마 검색 | 테마 탐색 진입점 링크 (모든 테마 표시) (PRD §7.1) |
| F-NAV-07 | 지역 검색 | 지역 탐색 진입점 링크 (모든 시/도 표시) (PRD §7.1) |
| F-NAV-08 | 내 주변 검색 | `/[locale]/nearby` 링크 (PRD §7.1) |
| F-NAV-09 | 리뷰 | `/[locale]/reviews` 링크 (PRD §7.1) |
| F-NAV-10 | 파트너십 | `/[locale]/partnership` 링크 (PRD §7.1) |

### 15.3 푸터

| # | 기능 | 설명 |
|---|---|---|
| F-NAV-11 | 사이트 링크 | 주요 페이지 링크 (검색, 테마, 파트너십) |
| F-NAV-12 | 법적 링크 | 개인정보처리방침, 이용약관 (PRD §11.6) |
| F-NAV-13 | 연락처 정보 | SWIDA 연락처 이메일, 소셜 미디어 링크 |

---

## 부록 A. 오류 메시지 가이드

| 코드 | 한국어 | 영어 |
|---|---|---|
| ERR_LOGIN | 이메일 또는 비밀번호가 올바르지 않습니다 | Invalid email or password |
| ERR_DUP_EMAIL | 이미 등록된 이메일입니다 | This email is already registered |
| ERR_DUP_DISPLAY_NAME | 이미 사용 중인 닉네임입니다 | This display name is already taken |
| ERR_ACCOUNT_SUSPENDED | 계정이 정지되었습니다. 관리자에게 문의해주세요. | Your account has been suspended. Please contact the administrator. |
| ERR_REVIEW_LENGTH | 리뷰는 10자 이상 500자 이하로 작성해주세요. | Review must be 10–500 characters. |
| ERR_REVIEW_RATING | 별점을 선택해주세요. | Please select a star rating. |
| ERR_REVIEW_REPORTED | 이미 신고한 리뷰입니다 | You have already reported this review |
| ERR_REQUIRED_FIELD | 필수 항목을 입력해주세요. | Please fill in all required fields. |
| ERR_INVALID_EMAIL | 올바른 이메일 형식을 입력해주세요. | Please enter a valid email address. |
| ERR_GPS_DENIED | 위치 권한이 필요합니다. 브라우저 설정에서 허용해주세요. | Location permission is required. Please allow it in your browser settings. |
| ERR_RATE_LIMITED | 잠시 후 다시 시도해주세요. | Please try again later. |
| ERR_NETWORK | 네트워크 연결을 확인해 주세요. | Please check your network connection. |
| ERR_SERVER | 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. | A temporary error occurred. Please try again shortly. |
| ERR_NOT_TRANSLATED | 이 내용은 아직 번역되지 않았습니다 | This content is not yet translated |

---

## 부록 B. 영업중/영업종료 태그 로직

> PRD 참조: §5.6 Metadata — Open/Close Tags

**판별 로직 (클라이언트 측)**

```
currentTime = Asia/Seoul 시간대의 현재 시간 (Intl.DateTimeFormat)
operatingHours = shop.operating_hours (예: "10:00–22:00")

if currentTime이 operatingHours 범위 내:
  shop.open_tag 또는 기본값 "영업중" (ko) / "OPEN" (en) 표시
else:
  shop.close_tag 또는 기본값 "영업종료" (ko) / "CLOSED" (en) 표시
```

**표시 규칙**
- 게시된 업체만 Customer Web에 표시
- 미게시 업체는 영업중/영업종료 상태와 무관하게 표시되지 않음
- `open_tag` 또는 `close_tag`가 비어있거나 null인 경우 기본 레이블로 폴백

---

## 부록 C. 편의시설 표시 매핑

| 필드 | 아이콘 제안 | 한국어 레이블 | 영어 레이블 |
|---|---|---|---|
| parking_available | 🅿️ | 주차 | Parking |
| parking_type: free | — | 무료 주차 | Free parking |
| parking_type: paid | — | 유료 주차 | Paid parking |
| parking_type: validated | — | 주차 확인 | Validated parking |
| parking_type: street | — | 노상 주차 | Street parking |
| shower | 🚿 | 샤워 | Shower |
| sleeping | 🛏️ | 수면실 | Sleeping area |
| private_room | 🚪 | 개인실 | Private room |
| wifi | 📶 | 무료 WiFi | Free WiFi |
| accessibility | ♿ | 장애인 편의 | Accessibility |

---

> **문서 끝**
>
> 본 FSD는 UI/UX 명세서와 함께 검토 및 업데이트되어야 합니다. 기능 변경 사항은 필요에 따라 PRD와 TSD에 모두 반영되어야 합니다.
