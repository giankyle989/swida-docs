---
title: "SWIDA — Admin Web FSD"
sidebar_label: "Admin Web FSD (KO)"
sidebar_position: 4
---

# 기능 명세서 (FSD)

## SWIDA — Admin Web

- **버전**: 1.0
- **날짜**: 2026-03-26
- **기반 문서**: SWIDA PRD v1.1, SWIDA TSD v1.1
- **범위**: MVP — 관리자용 플랫폼 관리 웹 애플리케이션
- **관련 문서**: UI/UX 명세서 (별도 작성 예정), Customer Web FSD v1.0

---

## 1. 문서 개요

### 1.1 목적

본 문서는 SWIDA Admin Web 애플리케이션의 페이지 목록과 기능 명세를 정의한다. Admin Web은 SWIDA 플랫폼을 관리하기 위한 핵심 운영 인터페이스로, 일상적인 운영 업무를 위한 전용 관리자 패널로 사용된다. 시각적 디자인, 레이아웃, 인터랙션 세부사항은 별도의 UI/UX 명세서에서 다룬다.

### 1.2 아키텍처 컨텍스트

Admin Web은 `admin.swida.com`에서 제공되는 전용 웹 애플리케이션이다. 인증 및 콘텐츠 관리를 위해 백엔드와 통신한다. 플랫폼 내장 관리자 패널은 모니터링 및 디버깅 목적으로 개발자에게만 접근이 제한되며, 본 문서에서 정의하는 운영 기능에는 사용되지 않는다.

### 1.3 MVP 범위

| 포함 | 미포함 (향후) |
|---|---|
| 관리자 인증 (이메일/비밀번호) | 업체 오너 셀프서비스 포털 |
| 대시보드 (플랫폼 통계) | 고급 분석 및 리포트 |
| 업체 CRUD (생성, 수정, 공개/비공개) | 업체 목록 일괄 가져오기/내보내기 |
| 지도 핀 드롭을 통한 위도/경도 선택 | 전체 업체 지도 보기 |
| 업체 미리보기 (고객 화면) | 푸시 알림 관리 |
| 리뷰 관리 (조회, 숨김, 삭제) | 자동 리뷰 관리 (AI/규칙 기반) |
| 고객 계정 관리 (잠금/해제) | 쿠폰/할인 관리 |
| 테마 관리 (CRUD) | 예약 시스템 관리 |
| 지역 및 구역 관리 (CRUD) | |
| 파트너십 문의 관리 (상태 워크플로우) | |
| 게시판 게시글 관리 (CRUD) | |
| 이벤트 관리 (CRUD) | |
| 공지사항 관리 (CRUD) | |
| 커뮤니티 게시글 관리 (조회, 숨김, 삭제) | |
| 감사 로그 뷰어 | |
| 로케일 관리 (한국어/영어 콘텐츠) | |

### 1.4 글로벌 규칙

| 항목 | 규칙 |
|---|---|
| 언어 | Admin Web UI는 영어로 표시 (관리자용이며, 고객용이 아님) |
| 날짜/시간 | KST (한국 표준시, UTC+9). 형식: `YYYY-MM-DD HH:mm:ss` |
| 인증 | 모든 페이지는 관리자 인증 필요. 미인증 요청은 로그인 페이지로 리다이렉트 |
| API 통신 | 백엔드가 인증 및 콘텐츠 작업을 처리. 자세한 API 사양은 TSD §5.2 참조 |
| 소프트 삭제 정책 | 업체 목록은 절대 물리 삭제하지 않음. 비활성화된 업체는 비활성 사유와 함께 비공개 처리 |
| 페이지네이션 | 설정 가능한 페이지 크기(10, 20, 50)의 테이블 기반 페이지네이션 |
| 로딩 상태 | 데이터 테이블 및 폼에 스켈레톤 플레이스홀더 표시 |
| 확인 | 모든 파괴적 작업(숨김, 삭제, 잠금, 비공개)은 확인 대화상자 필요 |
| 토스트 알림 | 모든 쓰기 작업에 대한 성공/오류 피드백 |
| 반응형 | 데스크톱 우선. 최소 지원 너비: 1024px |
| 입력 값 검증 | 관리자가 제출하는 모든 자유 텍스트 필드(업체 설명, 비활성 사유 상세, 테마 이름, 관리 사유)는 저장 전 서버 측에서 검증됩니다. HTML 태그는 제거되고, 렌더링 시 출력 값은 Customer Web에서의 저장형 XSS 방지를 위해 이스케이프됩니다. |
| 중복 제출 방지 | 모든 폼 제출 및 액션 버튼(저장, 공개, 숨김, 삭제, 잠금, 상태 변경)은 첫 클릭 시 서버 응답이 올 때까지 비활성화 + 로딩 상태로 전환됩니다. 빠른 클릭으로 인한 API 중복 호출을 방지합니다. |
| 충돌 감지 | 모든 편집 폼은 저장 요청에 레코드의 `updatedAt` 타임스탬프를 포함합니다. `409 Conflict` 응답(다른 세션에서 레코드가 수정됨) 시 모달 대화상자를 표시: "이 항목이 다른 세션에서 수정되었습니다. 새로고침 후 다시 시도하세요." 페이지를 새로고침하는 새로고침 버튼 포함. 관리자가 새로고침할 때까지 저장 작업이 차단됩니다. 서버 측 구현은 TSD §5.3.1a 참조. |

---

## 2. 페이지 목록

| # | 페이지 | 경로 | 설명 |
|---|---|---|---|
| 1 | 로그인 | `/login` | 관리자 인증 |
| 2 | 대시보드 | `/dashboard` | 플랫폼 개요 통계 |
| 3 | 업체 목록 | `/shops` | 검색, 필터, 정렬이 가능한 전체 업체 목록 |
| 4 | 업체 생성 | `/shops/new` | 새 업체 목록 생성 |
| 5 | 업체 수정 | `/shops/[id]` | 기존 업체 목록 수정 |
| 6 | 리뷰 | `/reviews` | 리뷰 관리 |
| 7 | 테마 | `/themes` | 테마 관리 |
| 8 | 지역 | `/locations` | 지역 및 구역 관리 |
| 9 | 파트너십 문의 | `/inquiries` | 파트너십 문의 관리 |
| 10 | 사용자 | `/users` | 고객 계정 관리 |
| 11 | 게시판 게시글 | `/board-posts` | 게시판 게시글 관리 |
| 12 | 게시판 게시글 생성 | `/board-posts/new` | 새 게시판 게시글 생성 |
| 13 | 게시판 게시글 수정 | `/board-posts/[id]` | 기존 게시판 게시글 수정 |
| 14 | 이벤트 | `/events` | 이벤트 관리 |
| 15 | 이벤트 생성 | `/events/new` | 새 이벤트 생성 |
| 16 | 이벤트 수정 | `/events/[id]` | 기존 이벤트 수정 |
| 17 | 공지사항 | `/notices` | 공지사항 관리 |
| 18 | 공지사항 생성 | `/notices/new` | 새 공지사항 생성 |
| 19 | 공지사항 수정 | `/notices/[id]` | 기존 공지사항 수정 |
| 20 | 커뮤니티 게시글 | `/community-posts` | 커뮤니티 게시글 관리 |
| 21 | 감사 로그 | `/audit-log` | 감사 로그 뷰어 |

**접근 제어**: 로그인 페이지를 제외한 모든 페이지는 인증된 관리자 세션이 필요하다. 미인증 상태에서 페이지에 접근하면 `/login`으로 리다이렉트된다.

---

## 3. 인증

### 3.1 로그인 (`/login`)

> PRD Reference: §3.1 Admin Authentication, TSD §5.4.2

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-AUTH-01 | 이메일/비밀번호 로그인 | 관리자가 이메일과 비밀번호로 로그인. 세션이 안전하게 유지됨 |
| F-AUTH-02 | 세션 저장 | 관리자 세션이 브라우저에 안전하게 저장되며 이후 모든 요청에 사용 |
| F-AUTH-03 | 로그인 후 리다이렉트 | 로그인 성공 시 `/dashboard`로 리다이렉트 |
| F-AUTH-04 | 오류 처리 | 잘못된 자격 증명 또는 서버 오류 시 오류 메시지 표시 |
| F-AUTH-05 | 이미 인증된 상태 | 관리자가 이미 로그인한 경우 `/login`에서 `/dashboard`로 리다이렉트 |

**입력 제약사항**

| 필드 | 필수 | 제약사항 |
|---|---|---|
| Email | 예 | 유효한 이메일 형식 |
| Password | 예 | 비어 있지 않아야 함 |

**서버 유효성 검사 오류**

| 조건 | 오류 |
|---|---|
| 잘못된 자격 증명 | "Invalid email or password" |
| 서버 접속 불가 | "Unable to connect to server. Please try again." |

### 3.2 세션 관리

| # | 기능 | 설명 |
|---|---|---|
| F-AUTH-06 | 세션 유지 | 관리자 세션은 만료 또는 로그아웃 시까지 브라우저 세션 간 유지 |
| F-AUTH-07 | 세션 만료 | 세션 만료 시 로그인 페이지로 리다이렉트하며 메시지 표시: "Session expired. Please log in again." |
| F-AUTH-08 | 로그아웃 | 관리자 세션 삭제 후 `/login`으로 리다이렉트 |

### 3.3 로그아웃

| # | 기능 | 설명 |
|---|---|---|
| F-LOGOUT-01 | 세션 초기화 | 관리자 세션 제거 및 클라이언트 측 상태 초기화 |
| F-LOGOUT-02 | 리다이렉트 | 로그아웃 후 `/login`으로 이동 |
| F-LOGOUT-03 | 로그아웃 버튼 | 모든 인증된 페이지의 관리자 헤더/사이드바에 제공 |

---

## 4. 대시보드

### 4.1 대시보드 (`/dashboard`)

> PRD Reference: §3.1 Admin — Dashboard, §7.2 Admin-Facing Menus

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-DASH-01 | 총 업체 수 | 전체 업체 수 (공개 + 초안). 공개 대 초안 비율 표시 |
| F-DASH-02 | 총 리뷰 수 | 전체 리뷰 수. 상태별 비율 표시 (published, hidden, under_review, deleted) |
| F-DASH-03 | 총 사용자 수 | 등록된 고객 수. 활성 대 잠금 사용자 수 표시 |
| F-DASH-04 | 총 문의 수 | 파트너십 문의 수. 상태별 비율 표시 (new, contacted, awaiting_info, approved, rejected, published) |
| F-DASH-05 | 신규 문의 알림 | `new` (미연락) 문의 수를 시각적 표시기와 함께 강조 |
| F-DASH-06 | 대기 중인 리뷰 | 관리자 확인이 필요한 `under_review` 상태의 리뷰 수 |
| F-DASH-07 | 최근 활동 | 최근 업체 공개, 리뷰 관리, 문의 상태 변경 목록 (최근 10건) |
| F-DASH-08 | 빠른 작업 | 바로가기 링크: 새 업체 생성, 대기 중인 리뷰 보기, 신규 문의 보기 |

**데이터 소스**: 대시보드는 집계된 플랫폼 통계(업체, 리뷰, 사용자, 문의, 최근 활동)와 초안 업체 수, 대기 중인 리뷰 수, 신규 문의 수를 조회한다.

> 자세한 API 사양은 TSD §5.2 참조.

---

## 5. 업체 관리

### 5.1 업체 목록 (`/shops`)

> PRD Reference: §3.1 Shop Management, §7.2 Admin-Facing Menus

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-SHOP-01 | 업체 테이블 | 전체 업체의 페이지네이션 테이블. 컬럼: 썸네일, 이름, 구역, 테마, 평점, 리뷰 수, 상태 (published/draft), 생성일 |
| F-SHOP-02 | 검색 | 업체 이름으로 텍스트 검색 (부분 일치) |
| F-SHOP-03 | 필터 — 상태 | 노출 상태별 필터: 전체 / 공개 / 초안 |
| F-SHOP-04 | 필터 — 지역 | Level 1 지역별 필터 |
| F-SHOP-05 | 필터 — 테마 | 서비스 테마별 필터 |
| F-SHOP-06 | 정렬 | 정렬 기준: 이름, 평점, 리뷰 수, 생성일, 수정일 |
| F-SHOP-07 | 공개 작업 | 각 행의 빠른 공개 버튼. 업체가 Customer Web에 즉시 노출됨 (PRD §7.3) |
| F-SHOP-08 | 비공개 작업 | 각 행의 빠른 비공개 버튼. 비공개 전 비활성 사유 대화상자 표시 (PRD §7.3) |
| F-SHOP-09 | 생성 버튼 | `/shops/new`로 이동 |
| F-SHOP-10 | 수정 버튼 | 선택한 업체의 `/shops/[id]`로 이동 |
| F-SHOP-11 | 미리보기 버튼 | Customer Web 업체 상세 페이지를 새 탭에서 열기 (미리보기/초안 모드) (PRD §3.1) |
| F-SHOP-12 | 페이지네이션 | 설정 가능한 페이지 크기(10, 20, 50)의 테이블 페이지네이션 |

**비공개 — 비활성 사유 대화상자** (PRD §7.3)

| 필드 | 필수 | 옵션 |
|---|---|---|
| Inactive Reason | 예 | `closed`, `owner_request`, `violation`, `stale`, `other` |
| Inactive Reason Detail | `other`인 경우에만 | 자유 텍스트 설명 (최대 500자) |

### 5.2 업체 생성 (`/shops/new`)

> PRD Reference: §5 Shop Listing Data Model, §7.3 Admin Operational Workflows

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-SHOP-13 | 기본 정보 폼 | 모든 기본 정보 입력 필드: 이름, 설명, 주소, 운영 시간, 라스트 오더 시간, 정기 휴무일, 휴일 예외, 전화번호 (PRD §5.1) |
| F-SHOP-14 | 지역 선택 | 지역 (Level 1) → 구역 (Level 2) 연동 드롭다운 (PRD §5.1) |
| F-SHOP-15 | 지도 핀 드롭 | 업체 위치 선택을 위한 카카오맵 통합. 관리자가 지도를 클릭하여 좌표 설정. 주소 검색을 통한 지도 중심 이동 지원 — 주소를 찾을 수 없는 경우 "주소를 찾을 수 없습니다" 토스트 표시 후 수동 핀 드롭 허용. 기본 중심: 서울시청. 기존 업체 수정 시 저장된 좌표로 중심 이동. (PRD §3.1, TSD §5.6) |
| F-SHOP-15a | 좌표 수동 입력 폴백 | 위도/경도 수동 텍스트 입력 필드가 지도 아래에 항상 표시. 지도 핀 드롭 시 텍스트 필드에 자동 입력; 수동 입력 시 핀 드롭 값을 덮어씀. 카카오맵 JS SDK 로드 실패 시 (키 만료, 할당량 초과, 네트워크 타임아웃): 지도 컨테이너 숨김, 오류 배너 표시 "지도를 불러올 수 없습니다 — 좌표를 직접 입력하세요" / "Map unavailable — enter coordinates manually". 관리자는 수동 좌표 입력으로 업체 저장 가능. 유효성 검사: 위도 −90 ~ 90, 경도 −180 ~ 180, 저장 시 필수. |
| F-SHOP-16 | 테마 선택 | 사용 가능한 전체 테마에서 다중 선택 (PRD §5.2) |
| F-SHOP-17 | 서비스 메뉴 | 반복 가능한 폼 컴포넌트 — 서비스 메뉴 항목 추가/제거. 각 항목: 서비스 이름, 소요 시간(분), 가격(KRW), 설명 (PRD §5.2.1) |
| F-SHOP-18 | 예약 정보 | 예약 필수 여부 불리언 토글. 예약 URL/전화번호 조건부 입력. 성별 이용 가능 여부 드롭다운 (PRD §5.2) |
| F-SHOP-19 | 편의시설 | 각 편의시설에 대한 토글 스위치. 주차 유형, 주차 세부사항, 접근성 세부사항 조건부 입력 (PRD §5.3) |
| F-SHOP-20 | 연락 채널 | 선택 입력: 전화번호, KakaoTalk ID, Instagram, 웹사이트 URL, Naver Place URL (PRD §5.4) |
| F-SHOP-21 | 지원 언어 | 지원 언어 다중 선택 (PRD §5.5) |
| F-SHOP-22 | 이미지 업로드 | 업체 이미지 업로드 (최소: 1장, 최대: 10장). 허용 형식: JPEG, PNG, WebP. 파일당 최대 크기: 5MB. 드래그 앤 드롭 또는 파일 선택. 이미지는 안전하게 업로드 및 저장됨 (PRD §5.1). **MinIO 장애 시:** 이미지 업로드 실패 시(MinIO 연결 불가 또는 스토리지 오류) "이미지 업로드에 실패했습니다. 다시 시도해주세요." 오류 토스트와 재시도 버튼을 표시. 이미지 없이도 초안으로 저장 가능 — 이미지 최소 요구사항(1장)은 공개 시에만 적용되며, 초안 저장 시에는 적용되지 않음. |
| F-SHOP-23 | 썸네일 선택 | 검색 결과에 표시될 대표 썸네일 이미지 1장 선택 (PRD §5.1) |
| F-SHOP-24 | 영업중/영업종료 태그 | Customer Web에서 영업 상태 표시를 위한 선택적 커스텀 라벨. 기본값: "영업중" / "영업종료" (PRD §5.6) |
| F-SHOP-25 | 초안 | 공개하지 않고 업체 저장. 초안 항목 생성 (PRD §7.3) |
| F-SHOP-26 | 저장 및 공개 | 업체 저장 후 즉시 공개. Customer Web에서 업체 노출 (PRD §7.3) |
| F-SHOP-27 | 로케일 전환기 | 한국어와 영어 콘텐츠 편집 간 전환. 한국어 필드 저장 후 영어 편집 활성화. 영어는 선택 (PRD §11.4) |

**입력 제약사항**

| 필드 | 필수 | 제약사항 |
|---|---|---|
| Shop Name | 예 | 최대 255자 |
| Slug | 예 (자동 생성) | 업체 이름에서 URL 친화적 식별자가 자동 생성됨, 수정 가능 |
| Description | 예 | 최대 500자 |
| Address | 예 | 최대 500자 |
| Region | 예 | 사용 가능한 지역에서 선택 |
| District | 예 | 사용 가능한 구역에서 선택 (지역별 필터) |
| Latitude | 예 | 소수점, 지도 핀 드롭 또는 수동 입력으로 설정. 범위: −90 ~ 90 |
| Longitude | 예 | 소수점, 지도 핀 드롭 또는 수동 입력으로 설정. 범위: −180 ~ 180 |
| Operating Hours | 예 | 요일별 스케줄: 7개 요일 행 (월–일), 각 행에 영업 시작 시간 및 마감 시간 선택기, 요일별 "휴무" 체크박스 포함. 특이사항을 위한 자유 텍스트 오버라이드 필드 포함 (예: "공휴일 영업시간 변동 가능"). 구조화된 입력은 `operating_hours` (JSONB)에, 텍스트 필드는 `operating_hours_text`에 저장. |
| Closed Days | 예 | 텍스트 (예: "매주 일요일") |
| Themes | 예 | 최소 1개 테마 선택 |
| Service Menu | 예 | 최소 1개 서비스 메뉴 항목 |
| Images | 예 | 1–10장 이미지 |
| Thumbnail | 예 | 1장 이미지를 썸네일로 선택 |

### 5.3 업체 수정 (`/shops/[id]`)

> PRD Reference: §5 Shop Listing Data Model, §7.3 Admin Operational Workflows

| # | 기능 | 설명 |
|---|---|---|
| F-SHOP-28 | 기존 데이터 로드 | 업체의 현재 데이터로 모든 폼 필드를 미리 채움 |
| F-SHOP-29 | 전체 필드 수정 | 업체 생성의 모든 필드(F-SHOP-13 ~ F-SHOP-27)를 수정 가능 |
| F-SHOP-30 | 변경사항 저장 | 업데이트된 데이터 저장. 공개 상태인 경우 변경사항이 Customer Web에 즉시 반영 |
| F-SHOP-31 | 공개/비공개 토글 | 이 페이지에서 노출 상태 변경 (F-SHOP-07/F-SHOP-08과 동일한 동작) |
| F-SHOP-32 | 미리보기 | 현재 업체를 Customer Web에서 새 탭으로 열기 (PRD §3.1) |
| F-SHOP-33 | 최종 확인일 | 수정 가능한 날짜 필드 — 관리자가 목록의 정확성을 확인할 때 설정 (PRD §5.5) |
| F-SHOP-34 | 로케일 전환기 | 한국어와 영어 콘텐츠 편집 간 전환. 영어 번역이 누락된 경우 표시기 노출 (PRD §11.4) |
| F-SHOP-35 | 감사 이력 링크 | 이 업체의 document ID로 필터된 감사 로그 링크 |

---

## 6. 리뷰 관리

### 6.1 리뷰 목록 (`/reviews`)

> PRD Reference: §8.4 Review Moderation, §8.5 Review Integrity & Abuse Prevention

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-REV-01 | 리뷰 테이블 | 전체 리뷰의 페이지네이션 테이블. 컬럼: 업체 이름, 작성자, 평점, 코멘트(축약), 상태, 신고 수, 생성일 |
| F-REV-02 | 필터 — 상태 | 필터: 전체 / Published / Hidden / Under Review / Deleted |
| F-REV-03 | 필터 — 신고됨 | 신고된 리뷰만 표시 (신고 수 > 0) |
| F-REV-04 | 필터 — 업체 | 업체 이름으로 필터 |
| F-REV-05 | 필터 — 날짜 | 날짜 범위로 필터 |
| F-REV-06 | 정렬 | 정렬 기준: 생성일, 평점, 신고 수 |
| F-REV-07 | 리뷰 상세 | 확장/모달로 전체 리뷰 코멘트, 작성자 정보, 업체 정보, 신고 이력 표시 |
| F-REV-08 | 상태 변경 — 숨김 | 상태를 `hidden`으로 변경. 관리 사유 선택 필요. 리뷰가 Customer Web 및 평점 계산에서 즉시 제외 (PRD §8.4) |
| F-REV-09 | 상태 변경 — 공개 | 상태를 `published`로 변경. 리뷰가 Customer Web에 표시되고 평점에 반영 (PRD §8.4) |
| F-REV-10 | 상태 변경 — 삭제 | 상태를 `deleted`로 변경. 소프트 삭제 — 데이터베이스에 보존. 확인 대화상자 필요 (PRD §8.4) |
| F-REV-11 | 작성자 보기 | 리뷰 작성자의 사용자 관리 페이지 링크 |
| F-REV-12 | 일괄 작업 | 여러 리뷰를 선택하여 일괄 상태 변경 (숨김, 삭제) |
| F-REV-13 | 페이지네이션 | 설정 가능한 페이지 크기의 테이블 페이지네이션 |

**관리 사유 선택** (PRD §8.4)

| Reason Code | Display Label |
|---|---|
| `spam` | Spam |
| `inappropriate` | Inappropriate content |
| `fake_review` | Fake review |
| `irrelevant` | Irrelevant |
| `other` | Other |

**상태 전이**

```
published ──→ hidden (관리자 숨김)
published ──→ deleted (관리자 삭제)
under_review ──→ published (관리자 승인)
under_review ──→ hidden (관리자 숨김)
under_review ──→ deleted (관리자 삭제)
hidden ──→ published (관리자 복원)
deleted ──→ published (관리자 복원 — 확인 필요: "이 리뷰는 이전에 삭제되었습니다. 복원하면 다시 표시됩니다.")
```

**복원 전 검증 (deleted → published)**

삭제된 리뷰를 `published` 상태로 복원하기 전에 시스템이 다음 검사를 수행한다. 검사에 실패하면 복원이 차단된다:

| # | 검사 항목 | 실패 조건 | 오류 메시지 |
|---|---|---|---|
| 1 | 작성자 계정 상태 | 작성자 계정이 잠김 (`blocked = true`) | "작성자 계정이 잠겨 있습니다" |
| 2 | 상위 업체 상태 | 상위 업체가 공개되지 않음 (초안 또는 비공개) | "해당 업체가 비공개 상태입니다" |

두 검사는 확인 대화상자가 표시되기 전에 실행된다. 검사에 실패하면 복원 버튼이 비활성화되고 오류 메시지가 인라인으로 표시된다. 리뷰를 복원하려면 관리자가 먼저 근본 문제(계정 잠금 해제 또는 업체 공개)를 해결해야 한다.

**평점 재계산**: 상태 변경 시 상위 업체의 평균 평점 및 리뷰 수가 자동으로 재계산됨 (PRD §8.5).

---

## 7. 테마 관리

### 7.1 테마 (`/themes`)

> PRD Reference: §9 Service Themes

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-THEME-01 | 테마 목록 | 전체 테마 테이블. 컬럼: 아이콘, 이름(한국어), 이름(영어), URL 식별자, 표시 순서, 업체 수 |
| F-THEME-02 | 테마 생성 | 폼: 이름(한국어, 필수), 이름(영어, 선택), URL 식별자(자동 생성), 아이콘 업로드, 표시 순서 (PRD §9.1) |
| F-THEME-03 | 테마 수정 | 기존 테마 수정. 모든 필드 수정 가능 |
| F-THEME-04 | 테마 삭제 | 테마 삭제. 확인 대화상자 표시. 해당 테마에 태그된 업체가 있으면 차단 — 업체 수와 함께 경고 표시. 삭제 전 모든 업체에서 태그 해제 필요. |
| F-THEME-05 | 순서 변경 | 드래그 앤 드롭 또는 수동 번호 입력으로 표시 순서 변경 |
| F-THEME-06 | 로케일 전환기 | 한국어와 영어 이름 편집 간 전환 (PRD §11.4) |

**입력 제약사항**

| 필드 | 필수 | 제약사항 |
|---|---|---|
| Name (Korean) | 예 | 최대 100자 |
| Name (English) | 아니오 | 최대 100자 |
| Slug | 예 (자동 생성) | 한국어 이름에서 URL 친화적 식별자가 자동 생성됨, 수정 가능 |
| Icon | 아니오 | 단일 이미지 |
| Display Order | 아니오 | 정수 |

---

## 8. 지역 관리

### 8.1 지역 및 구역 (`/locations`)

> PRD Reference: §4 Location System

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-LOC-01 | 지역 목록 | 전체 Level 1 지역 테이블. 컬럼: 이름(한국어), 이름(영어), 구역 수 |
| F-LOC-02 | 지역 생성 | 폼: 이름(한국어, 필수), 이름(영어, 선택) (PRD §4.1) |
| F-LOC-03 | 지역 수정 | 기존 지역 이름 수정 |
| F-LOC-04 | 지역 삭제 | 지역 삭제. 하위 구역이 없는 경우에만 허용. 구역이 존재하면 경고 표시 |
| F-LOC-05 | 구역 목록 | 지역을 클릭하면 제자리에서 확장하여 해당 Level 2 구역 표시 (아코디언 패턴). 테이블: 이름(한국어), 이름(영어), 업체 수 |
| F-LOC-06 | 구역 생성 | 폼: 이름(한국어, 필수), 이름(영어, 선택), 상위 지역(컨텍스트에서 자동 설정) (PRD §4.2) |
| F-LOC-07 | 구역 수정 | 기존 구역 이름 수정 |
| F-LOC-08 | 구역 삭제 | 구역 삭제. 등록된 업체가 없는 경우에만 허용. 업체가 존재하면 업체 수와 함께 경고 표시 |
| F-LOC-09 | 로케일 전환기 | 한국어와 영어 이름 편집 간 전환 (PRD §11.4) |

**참고**: 지역 및 구역은 출시 시 대한민국 전체 행정구역(약 17개 지역, 약 250개 구역)이 양쪽 로케일로 사전 등록됨 (TSD §4.6). 이 페이지는 주로 수정 및 추가를 위한 것이다.

---

## 9. 파트너십 문의 관리

### 9.1 문의 (`/inquiries`)

> PRD Reference: §10.3 Partnership Inquiry Management

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-INQ-01 | 문의 테이블 | 전체 문의의 페이지네이션 테이블. 컬럼: 업체 이름, 담당자, 전화번호, 선호 연락 채널, 상태, 출처, 생성일 |
| F-INQ-02 | 필터 — 상태 | 필터: 전체 / New / Contacted / Awaiting Info / Approved / Rejected / Published |
| F-INQ-03 | 필터 — 출처 | 필터: 전체 / Website Form / Email / KakaoTalk / Instagram |
| F-INQ-04 | 필터 — 날짜 | 날짜 범위로 필터 |
| F-INQ-05 | 정렬 | 정렬 기준: 생성일 (기본값: 최신순), 상태 |
| F-INQ-06 | 문의 상세 | 확장/모달로 메시지 및 관리자 메모를 포함한 전체 문의 필드 표시 |
| F-INQ-07 | 상태 업데이트 | 드롭다운을 통한 문의 상태 변경. 상태 흐름: `new` → `contacted` → `awaiting_info` → `approved` → `published`. `published`를 제외한 모든 상태 → `rejected`. `rejected` → `new` (재오픈). `published`는 최종 상태 — 업체는 업체 관리에서 관리됨. (PRD §10.3.2) |
| F-INQ-08 | 관리자 메모 | 모든 문의에 내부 메모 추가/수정. 메모는 외부에 공개되지 않음 (PRD §10.3.1) |
| F-INQ-09 | 중복 감지 | 동일한 업체 이름 + 주소가 다른 문의 또는 업체 목록에 이미 존재하는 경우 시각적 플래그/배지 표시 (PRD §10.3.2) |
| F-INQ-10 | 업체으로 전환 | `approved` 문의에서 "Create Shop Listing" 버튼. 문의 데이터(업체 이름, 주소, 업종, 연락처 정보)로 새 업체 폼(`/shops/new`)을 미리 채움 (PRD §10.3.2) |
| F-INQ-11 | 업체 링크 | 문의에서 업체 목록이 생성 및 공개되면 해당 업체 링크 표시. 상태가 자동으로 `published`로 설정 (PRD §10.3.1) |
| F-INQ-12 | 신규 문의 배지 | 미읽은 `new` 문의 수를 나타내는 시각적 배지/카운터. 48시간 목표 표시기 — `new` 상태(`contacted`로 전환되지 않음)에서 48시간 이상 경과한 문의 강조 표시 (PRD §10.3.3) |
| F-INQ-13 | 페이지네이션 | 설정 가능한 페이지 크기의 테이블 페이지네이션 |

**상태 흐름 다이어그램**

```
new ──→ contacted ──→ awaiting_info ──→ approved ──→ published
  └──→ rejected       └──→ rejected      └──→ rejected
         └──→ rejected
```

---

## 10. 고객 계정 관리

### 10.1 사용자 (`/users`)

> PRD Reference: §3.1 Customer Account Management, §8.5 Admin Account Lock

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-USER-01 | 사용자 테이블 | 전체 등록 고객의 페이지네이션 테이블. 컬럼: 닉네임, 이메일, 제공자(email/kakao/naver), 상태(active/locked), 리뷰 수, 가입일 |
| F-USER-02 | 검색 | 닉네임 또는 이메일로 텍스트 검색 |
| F-USER-03 | 필터 — 상태 | 필터: 전체 / Active / Locked |
| F-USER-04 | 필터 — 제공자 | 필터: 전체 / Email / Kakao / Naver |
| F-USER-05 | 정렬 | 정렬 기준: 가입일, 리뷰 수, 닉네임 |
| F-USER-06 | 계정 잠금 | 고객 계정 잠금/정지. 잠금 사유 선택 필요. 잠긴 계정은 리뷰 또는 사용자 생성 콘텐츠 제출 불가 (PRD §8.5) |
| F-USER-07 | 계정 해제 | 이전에 잠긴 계정 해제. 계정의 리뷰 제출 기능 복구 (PRD §8.5) |
| F-USER-08 | 사용자 상세 | 확장/모달 표시: 전체 프로필 정보, 계정 상태, 잠금 사유(잠긴 경우), 리뷰 이력, 활동 요약 |
| F-USER-09 | 리뷰 보기 | 해당 사용자의 리뷰로 필터된 리뷰 관리 페이지 링크 |
| F-USER-10 | 페이지네이션 | 설정 가능한 페이지 크기의 테이블 페이지네이션 |

**잠금 사유 선택** (PRD §8.5)

| Reason Code | Display Label |
|---|---|
| `spam` | Spam |
| `fake_reviews` | Fake reviews |
| `harassment` | Harassment |
| `abuse` | Abuse |
| `other` | Other |

**잠금/해제 동작**

| 작업 | 효과 |
|---|---|
| 잠금 | 계정이 차단됨으로 표시됨. 사용자가 Customer Web에서 리뷰 제출 시도 시 정지 메시지 표시. 기존 공개된 리뷰는 그대로 유지 (PRD §8.5) |
| 해제 | 계정 차단이 해제됨. 사용자가 리뷰 제출 재개 가능 (PRD §8.5) |

---

## 11. 게시판 게시글 관리

### 11.1 게시판 게시글 목록 (`/board-posts`)

> TSD Reference: §4.4.8 `board_posts`, §5.6 Admin Web Features

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-BRD-01 | 게시글 테이블 | 전체 게시판 게시글의 페이지네이션 테이블. 컬럼: 대표 이미지(썸네일), 제목, 유형(recommendation/info), 카테고리, 상태(published/draft), 추천, HOT, 조회수, 생성일 |
| F-BRD-02 | 필터 — 상태 | 필터: 전체 / Published / Draft |
| F-BRD-03 | 필터 — 유형 | 필터: 전체 / Recommendation / Info |
| F-BRD-04 | 필터 — 카테고리 | 카테고리 배지로 필터 (예: "실전팁", "초보가이드") |
| F-BRD-05 | 정렬 | 정렬 기준: 생성일 (기본값: 최신순), 조회수, 좋아요 수 |
| F-BRD-06 | 공개 작업 | 각 행의 빠른 공개 버튼. 게시글이 Customer Web에 즉시 노출 |
| F-BRD-07 | 비공개 작업 | 각 행의 빠른 비공개 버튼. Customer Web에서 게시글 숨김 |
| F-BRD-08 | 삭제 작업 | 게시글 소프트 삭제. 확인 대화상자 필요 |
| F-BRD-09 | 생성 버튼 | `/board-posts/new`로 이동 |
| F-BRD-10 | 수정 버튼 | 선택한 게시글의 `/board-posts/[id]`로 이동 |
| F-BRD-11 | 페이지네이션 | 설정 가능한 페이지 크기(10, 20, 50)의 테이블 페이지네이션 |

### 11.2 게시판 게시글 생성 (`/board-posts/new`)

> TSD Reference: §4.4.8 `board_posts`

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-BRD-12 | 기본 정보 폼 | 입력 필드: 제목, 본문(리치 텍스트 에디터), 발췌(선택 — 비어 있으면 본문에서 자동 생성), 카테고리 배지, 작성자 이름 |
| F-BRD-13 | 유형 선택 | 드롭다운: `recommendation` 또는 `info` (TSD §4.4.8) |
| F-BRD-14 | 지역 선택 | 지역 필터링을 위한 선택적 지역 선택 (추천 게시글용) |
| F-BRD-15 | 연결 업체 | 추천 게시글을 위한 선택적 업체 선택기. 업체 이름으로 검색하여 연결 (`shops`로의 FK) |
| F-BRD-16 | 대표 이미지 | 게시글 카드 썸네일용 단일 이미지 업로드 |
| F-BRD-17 | 추천 토글 | 추천 배너 캐러셀에 게시글 표시를 위한 불리언 토글 |
| F-BRD-18 | HOT 배지 토글 | 게시글에 HOT 배지 표시를 위한 불리언 토글 |
| F-BRD-19 | 초안 저장 | 공개하지 않고 게시글 저장 |
| F-BRD-20 | 저장 및 공개 | 게시글 저장 후 즉시 공개 |
| F-BRD-21 | 로케일 전환기 | 한국어와 영어 콘텐츠 편집 간 전환. 한국어 필드 저장 후 영어 편집 활성화 (TSD §4.4.8 i18n) |

**입력 제약사항**

| 필드 | 필수 | 제약사항 |
|---|---|---|
| Title | 예 | 최대 255자 |
| Body | 예 | 리치 텍스트 |
| Excerpt | 아니오 | 최대 500자. 비어 있으면 본문에서 자동 생성 |
| Category | 아니오 | 최대 50자 |
| Author Name | 예 | 최대 100자 |
| Type | 예 | `recommendation` 또는 `info` |
| Region | 아니오 | 사용 가능한 지역에서 선택 |
| Linked Shop | 아니오 | 기존 업체에서 선택 (recommendation 유형만) |
| Featured Image | 아니오 | 단일 이미지 |

### 11.3 게시판 게시글 수정 (`/board-posts/[id]`)

> TSD Reference: §4.4.8 `board_posts`

| # | 기능 | 설명 |
|---|---|---|
| F-BRD-22 | 기존 데이터 로드 | 게시글의 현재 데이터로 모든 폼 필드를 미리 채움 |
| F-BRD-23 | 전체 필드 수정 | 게시판 게시글 생성의 모든 필드(F-BRD-12 ~ F-BRD-21)를 수정 가능 |
| F-BRD-24 | 변경사항 저장 | 업데이트된 데이터 저장. 공개 상태인 경우 변경사항이 Customer Web에 즉시 반영 |
| F-BRD-25 | 공개/비공개 토글 | 이 페이지에서 노출 상태 변경 (F-BRD-06/F-BRD-07과 동일한 동작) |
| F-BRD-26 | 로케일 전환기 | 한국어와 영어 콘텐츠 편집 간 전환. 영어 번역이 누락된 경우 표시기 노출 |

---

## 12. 이벤트 관리

### 12.1 이벤트 목록 (`/events`)

> TSD Reference: §4.4.11 `events`, §5.6 Admin Web Features

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-EVT-01 | 이벤트 테이블 | 전체 이벤트의 페이지네이션 테이블. 컬럼: 대표 이미지(썸네일), 제목, 카테고리, 시작일, 종료일, D-day 상태, 상태(published/draft), 추천, 조회수, 생성일 |
| F-EVT-02 | 필터 — 상태 | 필터: 전체 / Published / Draft |
| F-EVT-03 | 필터 — 카테고리 | 필터: 전체 / New Opening / Closing Soon / Coupon / Winner Announcement / General |
| F-EVT-04 | 필터 — 날짜 범위 | 이벤트 날짜 범위로 필터 (시작/종료 중복) |
| F-EVT-05 | 필터 — 진행 상태 | 필터: 전체 / 진행 중 (end_date >= today) / 종료됨 (end_date < today) |
| F-EVT-06 | 정렬 | 정렬 기준: 생성일 (기본값: 최신순), 시작일, 종료일, 조회수 |
| F-EVT-07 | 공개 작업 | 각 행의 빠른 공개 버튼. 이벤트가 Customer Web에 즉시 노출 |
| F-EVT-08 | 비공개 작업 | 각 행의 빠른 비공개 버튼. Customer Web에서 이벤트 숨김 |
| F-EVT-09 | 삭제 작업 | 이벤트 소프트 삭제. 확인 대화상자 필요 |
| F-EVT-10 | 생성 버튼 | `/events/new`로 이동 |
| F-EVT-11 | 수정 버튼 | 선택한 이벤트의 `/events/[id]`로 이동 |
| F-EVT-12 | 페이지네이션 | 설정 가능한 페이지 크기(10, 20, 50)의 테이블 페이지네이션 |

### 12.2 이벤트 생성 (`/events/new`)

> TSD Reference: §4.4.11 `events`

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-EVT-13 | 기본 정보 폼 | 입력 필드: 제목, 본문(리치 텍스트 에디터), 유의사항(선택), 작성자 이름 |
| F-EVT-14 | 카테고리 선택 | 드롭다운: `new_opening`, `closing_soon`, `coupon`, `winner_announcement`, `general` (TSD §4.4.11) |
| F-EVT-15 | 날짜 범위 선택기 | 시작일과 종료일 선택기 (KST). 종료일은 시작일 이후여야 함. D-day는 종료일로부터 계산 |
| F-EVT-16 | 배너 이미지 | 이벤트 상세 페이지용 전체 너비 배너 이미지 단일 업로드 |
| F-EVT-17 | 대표 이미지 | 이벤트 목록용 카드 썸네일 이미지 단일 업로드 |
| F-EVT-18 | 추천 토글 | 히어로 배너 캐러셀에 이벤트 표시를 위한 불리언 토글 |
| F-EVT-19 | 초안 저장 | 공개하지 않고 이벤트 저장 |
| F-EVT-20 | 저장 및 공개 | 이벤트 저장 후 즉시 공개 |
| F-EVT-21 | 로케일 전환기 | 한국어와 영어 콘텐츠 편집 간 전환. 한국어 필드 저장 후 영어 편집 활성화 (TSD §4.4.11 i18n) |

**입력 제약사항**

| 필드 | 필수 | 제약사항 |
|---|---|---|
| Title | 예 | 최대 255자 |
| Body | 예 | 리치 텍스트 |
| Category | 예 | 열거형: `new_opening`, `closing_soon`, `coupon`, `winner_announcement`, `general` |
| Start Date | 예 | 날짜 (KST) |
| End Date | 예 | 날짜 (KST), 시작일 이후여야 함 |
| Disclaimers | 아니오 | 텍스트 |
| Author Name | 예 | 최대 100자 |
| Banner Image | 아니오 | 단일 이미지 |
| Featured Image | 아니오 | 단일 이미지 |

### 12.3 이벤트 수정 (`/events/[id]`)

> TSD Reference: §4.4.11 `events`

| # | 기능 | 설명 |
|---|---|---|
| F-EVT-22 | 기존 데이터 로드 | 이벤트의 현재 데이터로 모든 폼 필드를 미리 채움 |
| F-EVT-23 | 전체 필드 수정 | 이벤트 생성의 모든 필드(F-EVT-13 ~ F-EVT-21)를 수정 가능 |
| F-EVT-24 | 변경사항 저장 | 업데이트된 데이터 저장. 공개 상태인 경우 변경사항이 Customer Web에 즉시 반영 |
| F-EVT-25 | 공개/비공개 토글 | 이 페이지에서 노출 상태 변경 (F-EVT-07/F-EVT-08과 동일한 동작) |
| F-EVT-26 | 로케일 전환기 | 한국어와 영어 콘텐츠 편집 간 전환. 영어 번역이 누락된 경우 표시기 노출 |

---

## 13. 공지사항 관리

### 13.1 공지사항 목록 (`/notices`)

> TSD Reference: §4.4.12 `notices`, §5.6 Admin Web Features

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-NTC-01 | 공지사항 테이블 | 전체 공지사항의 페이지네이션 테이블. 컬럼: 제목, 카테고리(notice/general), 중요(고정), 상태(published/draft), 조회수, 생성일 |
| F-NTC-02 | 필터 — 상태 | 필터: 전체 / Published / Draft |
| F-NTC-03 | 필터 — 카테고리 | 필터: 전체 / Notice / General |
| F-NTC-04 | 필터 — 중요 | 필터: 전체 / 중요 (고정) / 일반 |
| F-NTC-05 | 정렬 | 정렬 기준: 생성일 (기본값: 최신순), 조회수 |
| F-NTC-06 | 공개 작업 | 각 행의 빠른 공개 버튼. 공지사항이 Customer Web에 즉시 노출 |
| F-NTC-07 | 비공개 작업 | 각 행의 빠른 비공개 버튼. Customer Web에서 공지사항 숨김 |
| F-NTC-08 | 삭제 작업 | 공지사항 소프트 삭제. 확인 대화상자 필요 |
| F-NTC-09 | 생성 버튼 | `/notices/new`로 이동 |
| F-NTC-10 | 수정 버튼 | 선택한 공지사항의 `/notices/[id]`로 이동 |
| F-NTC-11 | 페이지네이션 | 설정 가능한 페이지 크기(10, 20, 50)의 테이블 페이지네이션 |

### 13.2 공지사항 생성 (`/notices/new`)

> TSD Reference: §4.4.12 `notices`

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-NTC-12 | 기본 정보 폼 | 입력 필드: 제목, 본문(리치 텍스트 에디터) |
| F-NTC-13 | 카테고리 선택 | 드롭다운: `notice` 또는 `general` (TSD §4.4.12) |
| F-NTC-14 | 중요 토글 | 공지사항 목록 상단에 고정하기 위한 불리언 토글 (Customer Web에서 고정 표시기와 함께 노출) |
| F-NTC-15 | 초안 저장 | 공개하지 않고 공지사항 저장 |
| F-NTC-16 | 저장 및 공개 | 공지사항 저장 후 즉시 공개 |
| F-NTC-17 | 로케일 전환기 | 한국어와 영어 콘텐츠 편집 간 전환. 한국어 필드 저장 후 영어 편집 활성화 (TSD §4.4.12 i18n) |

**입력 제약사항**

| 필드 | 필수 | 제약사항 |
|---|---|---|
| Title | 예 | 최대 255자 |
| Body | 예 | 리치 텍스트 |
| Category | 예 | 열거형: `notice`, `general` |

### 13.3 공지사항 수정 (`/notices/[id]`)

> TSD Reference: §4.4.12 `notices`

| # | 기능 | 설명 |
|---|---|---|
| F-NTC-18 | 기존 데이터 로드 | 공지사항의 현재 데이터로 모든 폼 필드를 미리 채움 |
| F-NTC-19 | 전체 필드 수정 | 공지사항 생성의 모든 필드(F-NTC-12 ~ F-NTC-17)를 수정 가능 |
| F-NTC-20 | 변경사항 저장 | 업데이트된 데이터 저장. 공개 상태인 경우 변경사항이 Customer Web에 즉시 반영 |
| F-NTC-21 | 공개/비공개 토글 | 이 페이지에서 노출 상태 변경 (F-NTC-06/F-NTC-07과 동일한 동작) |
| F-NTC-22 | 로케일 전환기 | 한국어와 영어 콘텐츠 편집 간 전환. 영어 번역이 누락된 경우 표시기 노출 |

---

## 14. 커뮤니티 관리

### 14.1 커뮤니티 게시글 (`/community-posts`)

> TSD Reference: §4.4.9 `community_posts`, §5.6 Admin Web Features

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-CMT-01 | 게시글 테이블 | 전체 커뮤니티 게시글의 페이지네이션 테이블. 컬럼: 내용(축약), 작성자, 해시태그, 상태(published/hidden/deleted), 좋아요 수, 댓글 수, 조회수, 생성일 |
| F-CMT-02 | 필터 — 상태 | 필터: 전체 / Published / Hidden / Deleted |
| F-CMT-03 | 필터 — 작성자 | 작성자 닉네임으로 필터 |
| F-CMT-04 | 필터 — 날짜 | 날짜 범위로 필터 |
| F-CMT-05 | 정렬 | 정렬 기준: 생성일 (기본값: 최신순), 좋아요 수, 댓글 수, 조회수 |
| F-CMT-06 | 게시글 상세 | 확장/모달로 전체 게시글 내용, 사진, 동영상, 작성자 정보, 해시태그, 위치 텍스트 표시 |
| F-CMT-07 | 게시글 숨김 | 상태를 `hidden`으로 변경. Customer Web 피드에서 즉시 제거. 확인 대화상자 필요 |
| F-CMT-08 | 게시글 숨김 해제 | 상태를 `published`로 복원. Customer Web 피드에 다시 노출 |
| F-CMT-09 | 게시글 삭제 | 상태를 `deleted`로 변경. 소프트 삭제 — 데이터베이스에 보존. 확인 대화상자 필요 |
| F-CMT-10 | 작성자 보기 | 게시글 작성자의 사용자 관리 페이지 링크 |
| F-CMT-11 | 댓글 보기 | 확장하여 게시글의 전체 댓글 표시. 관리자가 개별 댓글 숨김 또는 삭제 가능 |
| F-CMT-12 | 페이지네이션 | 설정 가능한 페이지 크기(10, 20, 50)의 테이블 페이지네이션 |

**상태 전이**

```
published ──→ hidden (관리자 숨김)
published ──→ deleted (관리자 삭제)
hidden ──→ published (관리자 숨김 해제/복원)
deleted ──→ published (관리자 복원 — 확인 필요: "이 게시글은 이전에 삭제되었습니다. 복원하면 다시 표시됩니다.")
```

---

## 15. 감사 로그

### 15.1 감사 로그 뷰어 (`/audit-log`)

> PRD Reference: §7.3 Audit Log, TSD §4.4.7, §5.3.4

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-AUDIT-01 | 로그 테이블 | 전체 감사 항목의 페이지네이션 테이블. 컬럼: 타임스탬프, 관리자 사용자, 콘텐츠 유형, 작업, 문서 이름/ID |
| F-AUDIT-02 | 필터 — 콘텐츠 유형 | 필터: 전체 / Shop / Theme / Region / District / Review / Partnership Inquiry / User / Board Post / Event / Notice / Community Post |
| F-AUDIT-03 | 필터 — 작업 | 필터: 전체 / Create / Update / Delete / Publish / Unpublish / Hide / Restore / Lock / Unlock |
| F-AUDIT-04 | 필터 — 관리자 | 변경을 수행한 관리자로 필터 |
| F-AUDIT-05 | 필터 — 날짜 | 날짜 범위로 필터 |
| F-AUDIT-06 | 필터 — 문서 | 특정 document ID로 필터 (예: 특정 업체의 전체 감사 로그 조회) |
| F-AUDIT-07 | Diff 뷰어 | 로그 항목을 확장하여 필드 수준 변경 내역 표시: 필드 이름, 이전 값, 새 값 |
| F-AUDIT-08 | 정렬 | 정렬 기준: 타임스탬프 (기본값: 최신순) |
| F-AUDIT-09 | 페이지네이션 | 설정 가능한 페이지 크기의 테이블 페이지네이션 |

**감사 항목 필드**

감사 로그는 누가 변경했는지, 무엇이 변경되었는지, 변경 전후 값을 기록한다. 각 항목에는 콘텐츠 유형(예: 업체, 테마), 수정된 특정 레코드, 수행된 작업(생성, 수정, 삭제, 공개, 비공개), 작업을 수행한 관리자, 변경 전후 값이 포함된 필드별 변경 내역, 변경 타임스탬프가 포함된다.

> 자세한 데이터 스키마는 TSD §4.4.7 참조.

**확장된 감사 범위**

감사 로그는 업체 변경 사항뿐만 아니라 모든 상태 변경 관리자 작업을 포함합니다:

| 콘텐츠 유형 | 감사 대상 작업 |
|---|---|
| Shop | Create, Update, Delete, Publish, Unpublish |
| Theme | Create, Update, Delete |
| Region / District | Create, Update, Delete |
| Review | Hide, Restore, Delete (관리 작업) |
| Partnership Inquiry | 상태 변경 (New → Contacted → Awaiting Info → Approved → Rejected → Published) |
| User (Customer) | Lock, Unlock |
| Board Post | Create, Update, Delete, Publish, Unpublish |
| Event | Create, Update, Delete, Publish, Unpublish |
| Notice | Create, Update, Delete, Publish, Unpublish |
| Community Post | Hide, Restore, Delete (관리 작업) |

**보안 이벤트 로그**

콘텐츠 감사 로그 외에도 다음 보안 민감 이벤트는 모니터링 및 인시던트 대응을 위해 서버 측에 기록됩니다:

| 이벤트 | 기록 필드 |
|---|---|
| 로그인 실패 시도 (관리자 또는 고객) | 이메일, IP 주소, 타임스탬프, 실패 사유 |
| 계정 잠금/해제 | 대상 사용자, 수행 관리자, 사유, 타임스탬프 |
| 비밀번호 재설정 요청 | 이메일, IP 주소, 타임스탬프, 발송 상태 |
| 관리자 로그인/로그아웃 | 관리자 사용자, IP 주소, 타임스탬프 |
| 세션 만료 | 사용자, 세션 기간, 타임스탬프 |

> 보안 이벤트는 별도의 `security_events` 로그에 저장됩니다(콘텐츠 감사 로그와 분리). 보관 기간: 최소 90일. 구현 세부 사항은 TSD 참조.

---

## 16. 글로벌 레이아웃 및 내비게이션

### 16.1 관리자 사이드바

| # | 기능 | 설명 |
|---|---|---|
| F-NAV-01 | 로고 | SWIDA 관리자 로고 — `/dashboard` 링크 |
| F-NAV-02 | 대시보드 링크 | `/dashboard`로 이동 |
| F-NAV-03 | 업체 링크 | `/shops`로 이동 |
| F-NAV-04 | 리뷰 링크 | `/reviews`로 이동. `under_review` 수 배지 표시 |
| F-NAV-05 | 테마 링크 | `/themes`로 이동 |
| F-NAV-06 | 지역 링크 | `/locations`로 이동 |
| F-NAV-07 | 문의 링크 | `/inquiries`로 이동. `new` 문의 수 배지 표시 |
| F-NAV-08 | 사용자 링크 | `/users`로 이동 |
| F-NAV-09 | 게시판 게시글 링크 | `/board-posts`로 이동 |
| F-NAV-10 | 이벤트 링크 | `/events`로 이동 |
| F-NAV-11 | 공지사항 링크 | `/notices`로 이동 |
| F-NAV-12 | 커뮤니티 게시글 링크 | `/community-posts`로 이동 |
| F-NAV-13 | 감사 로그 링크 | `/audit-log`로 이동 |

### 16.2 관리자 헤더

| # | 기능 | 설명 |
|---|---|---|
| F-NAV-14 | 관리자 사용자 표시 | 현재 로그인한 관리자 사용자 이름/이메일 표시 |
| F-NAV-15 | 로그아웃 버튼 | 로그아웃 후 `/login`으로 리다이렉트 |
| F-NAV-16 | Customer Web 링크 | "View Site" 버튼 — `www.swida.com`을 새 탭에서 열기 |

---

## 부록 A. 오류 메시지 가이드

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
| ERR_BOARD_SAVE_FAIL | Failed to save board post. Please check required fields and try again. |
| ERR_BOARD_PUBLISH_FAIL | Failed to publish board post. Please try again. |
| ERR_BOARD_DELETE_FAIL | Failed to delete board post. Please try again. |
| ERR_EVENT_SAVE_FAIL | Failed to save event. Please check required fields and try again. |
| ERR_EVENT_PUBLISH_FAIL | Failed to publish event. Please try again. |
| ERR_EVENT_DELETE_FAIL | Failed to delete event. Please try again. |
| ERR_EVENT_DATE_INVALID | End date must be on or after start date. |
| ERR_NOTICE_SAVE_FAIL | Failed to save notice. Please check required fields and try again. |
| ERR_NOTICE_PUBLISH_FAIL | Failed to publish notice. Please try again. |
| ERR_NOTICE_DELETE_FAIL | Failed to delete notice. Please try again. |
| ERR_COMMUNITY_STATUS_FAIL | Failed to update community post status. Please try again. |
| ERR_NETWORK | Please check your network connection. |
| ERR_SERVER | A temporary error occurred. Please try again shortly. |
| ERR_REVIEW_RESTORE_AUTHOR_LOCKED | 작성자 계정이 잠겨 있습니다 |
| ERR_REVIEW_RESTORE_SHOP_UNPUBLISHED | 해당 업체가 비공개 상태입니다 |
| ERR_IMAGE_UPLOAD_MINIO | 이미지 업로드에 실패했습니다. 다시 시도해주세요. |
| ERR_CONFLICT | 이 항목이 다른 세션에서 수정되었습니다. 새로고침 후 다시 시도하세요. |

---

## 부록 B. 비활성 사유 코드

> PRD Reference: §7.3 Inactive Reason Codes

| Code | Display Label | Description |
|---|---|---|
| `closed` | Permanently Closed | Business has permanently closed |
| `owner_request` | Owner Request | Shop owner requested removal from SWIDA |
| `violation` | Policy Violation | Listing violated platform policies |
| `stale` | Unverified | Unable to verify current operating status |
| `other` | Other | Free-text explanation required |

---

## 부록 C. 파트너십 문의 상태 흐름

> PRD Reference: §10.3.2 Inquiry Status Flow

| Status | Display Label | 설명 | 다음 가능한 상태 |
|---|---|---|---|
| `new` | New | 문의 접수됨, 아직 연락하지 않음 | `contacted`, `rejected` |
| `contacted` | Contacted | 관리자가 업체 오너에게 연락함 | `awaiting_info`, `rejected` |
| `awaiting_info` | Awaiting Info | 업체 오너의 세부 정보 제공 대기 중 | `approved`, `rejected` |
| `approved` | Approved | 정보 확인 완료, 업체 목록 생성 준비 완료 | `published`, `rejected` |
| `rejected` | Rejected | 문의 거부됨 | `new` (관리자 재오픈 — 확인 필요: "이 거부된 문의를 다시 열겠습니까?") |
| `published` | Published | 업체 목록이 SWIDA에 공개됨 | (최종 상태 — 이 시점부터 업체는 업체 관리에서 관리됨) |

**SLA 표시기**: `new` 상태에서 48시간 이상 경과한 문의는 지연으로 시각적 강조 표시해야 함 (PRD §10.3.3).

---

## 부록 D. 리뷰 상태 매핑

> PRD Reference: §8.5 Review Statuses

| Status | Display Label | Customer Web 노출 | 평점 반영 |
|---|---|---|---|
| `published` | Published | 예 | 예 |
| `hidden` | Hidden | 아니오 | 아니오 |
| `under_review` | Under Review | 아니오 | 아니오 |
| `deleted` | Deleted | 아니오 | 아니오 |

---

## 부록 E. Admin API 엔드포인트 목록

Admin Web은 두 가지 API 인터페이스를 통해 백엔드와 통신한다: 하나는 인증 및 관리자 수준 작업용이고, 다른 하나는 콘텐츠 관리(업체, 리뷰, 테마, 지역, 문의, 게시판 게시글, 이벤트, 공지사항, 커뮤니티 게시글, 감사 로그, 사용자, 이미지 업로드)용이다.

전체 API 엔드포인트 목록은 TSD §5.2 참조.

---

> **문서 끝**
>
> 본 FSD는 UI/UX 명세서와 함께 검토 및 업데이트되어야 한다. Admin Web FSD는 미리보기 기능 및 공유 데이터 모델에 대해 Customer Web FSD를 참조한다.
