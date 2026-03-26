# Auth FSD Gaps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Sign Up (§3.5) and Password Reset (§3.6) sections to the Customer Web FSD, plus update the page list and access control tables, in both EN and KO.

**Architecture:** Documentation-only changes. Extend the existing FSD §3 (Authentication) with two new subsections following the established format (feature tables, input constraints, server errors, storyboards). Update §2 page list with 3 new routes. Add a deferred items appendix.

**Tech Stack:** Markdown (Docusaurus v3)

---

### Task 1: Update EN FSD — Page List and Access Control (§2)

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md:61-82`

- [ ] **Step 1: Add 3 new routes to the Page List table**

In `SWIDA_FSD_Customer_Web_EN.md`, find the Page List table (line 61-72). After row 10 (OAuth Callback), add:

```markdown
| 11 | Sign Up | `/[locale]/auth/signup` | Guest Only | Email registration with consent |
| 12 | Forgot Password | `/[locale]/auth/forgot-password` | Guest Only | Password reset request (email input) |
| 13 | Reset Password | `/[locale]/auth/reset-password` | Guest Only | Set new password (token-based) |
```

- [ ] **Step 2: Update the Access Control table**

Find the Access Control table (line 78-82). Replace it with:

```markdown
| User State | Accessible Pages | Restricted Action Behavior |
|---|---|---|
| Not logged in | All pages (browse only) | Review submission / report → redirect to login page |
| Logged in (active) | All pages + review submission | Login / Sign Up / Forgot Password / Reset Password → redirect to homepage |
| Logged in (locked/suspended) | All pages (browse only) | Review submission / report → error message: "계정이 정지되었습니다. 관리자에게 문의해주세요." |
```

- [ ] **Step 3: Verify the edits are correct**

Read lines 59-85 of `SWIDA_FSD_Customer_Web_EN.md` and confirm:
- Page list has 13 rows
- Access control reflects Guest Only behavior for new auth pages

- [ ] **Step 4: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md
git commit -m "docs(fsd): add auth page routes to EN Customer Web page list"
```

---

### Task 2: Add EN FSD — §3.5 Sign Up

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md:145-146`

- [ ] **Step 1: Add §3.5 Sign Up section**

In `SWIDA_FSD_Customer_Web_EN.md`, find the `---` separator after §3.4 Logout (between the end of §3.4 and the start of §4). Insert the following **before** that `---` separator:

```markdown
### 3.5 Sign Up (`/[locale]/auth/signup`)

> PRD Reference: §3.3 Customer, §11.5 Security

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-AUTH-10 | Email Registration Form | Form with email, password, password confirm, display name fields |
| F-AUTH-11 | Consent Agreement | "Select All" checkbox + individual required checkboxes for Terms of Service and Privacy Policy. Both must be checked to submit. |
| F-AUTH-12 | Client-Side Validation | Real-time field validation: email format, password min 6 chars, password match, display name 2–20 chars |
| F-AUTH-13 | Server-Side Validation | Duplicate email/display name checks per existing F-AUTH-04 constraints |
| F-AUTH-14 | Sign Up Success Modal | On successful registration: celebration modal with personalized greeting, CTAs to homepage and nearby search |
| F-AUTH-15 | Post-Signup Auto-Login | User is automatically logged in after successful registration (session created immediately) |

**Input Fields**

| Field | Required | Constraints | Validation |
|---|---|---|---|
| Email | Yes | Valid email format, unique | Real-time format check + server uniqueness on submit |
| Password | Yes | Min 6 characters | Real-time length check |
| Password Confirm | Yes | Must match Password | Real-time match check |
| Display Name | Yes | 2–20 characters, unique | Real-time length check + server uniqueness on submit |

**Consent Checkboxes**

| Checkbox | Required | Action |
|---|---|---|
| Select All | No | Toggles all individual checkboxes |
| Terms of Service | Yes | Expandable link to terms content |
| Privacy Policy | Yes | Expandable link to privacy content |

**Server Validation Errors** (extends §3.1 table)

| Condition | Error |
|---|---|
| Email already registered | "이미 등록된 이메일입니다" / "This email is already registered" |
| Display name taken | "이미 사용 중인 닉네임입니다" / "This display name is already taken" |
| Password too short | "비밀번호는 최소 6자 이상이어야 합니다" / "Password must be at least 6 characters" |

**Success Modal CTAs**

| Button | Action |
|---|---|
| Go to Homepage | Navigate to `/[locale]` |
| View Nearby Shops | Navigate to `/[locale]/nearby` |

**Storyboard: Sign Up**

```
[1] User navigates to /[locale]/auth/signup. If already logged in → redirect to homepage.
[2] User fills in email, password, password confirm, display name.
[3] User checks required consent checkboxes (Terms of Service, Privacy Policy).
[4] User clicks "Sign Up". Client-side validation runs first.
[5] On validation pass → submit to server. Server checks email/display name uniqueness.
[6a] Success → auto-login → show success modal with greeting and CTAs.
[6b] Server error → display inline error message under the relevant field.
[7] User dismisses modal or clicks a CTA → navigate to chosen page.
```
```

- [ ] **Step 2: Verify the edit is correct**

Read the newly added §3.5 section and confirm:
- Feature codes are F-AUTH-10 through F-AUTH-15 (no conflict with existing F-AUTH-01–09)
- Input field constraints match §3.1 Registration Input Constraints
- Server error messages match §3.1 Server Validation Errors format

- [ ] **Step 3: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md
git commit -m "docs(fsd): add §3.5 Sign Up to EN Customer Web FSD"
```

---

### Task 3: Add EN FSD — §3.6 Password Reset

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` (after newly added §3.5)

- [ ] **Step 1: Add §3.6 Password Reset section**

Insert the following after §3.5 (before the `---` separator that precedes §4 Homepage):

```markdown
### 3.6 Password Reset

> PRD Reference: §3.3 Customer, §11.5 Security

#### 3.6.1 Forgot Password (`/[locale]/auth/forgot-password`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-AUTH-16 | Password Reset Request | User submits email address to receive a reset link |
| F-AUTH-17 | Email Delivery | System sends email with tokenized reset link. Token expires after 1 hour, single-use. |
| F-AUTH-18 | Confirmation Message | After submit: generic success message shown regardless of whether email exists (prevents user enumeration) |

**Input Fields**

| Field | Required | Constraints |
|---|---|---|
| Email | Yes | Valid email format |

**Server Behavior**

- If email exists: send password reset email with tokenized link
- If email does not exist: show same success message (no indication of whether account exists)
- Rate limit: max 3 reset requests per email per hour

**Confirmation Message**

| Condition | Message |
|---|---|
| Submit (always) | "비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요." / "A password reset link has been sent to your email. Please check your inbox." |

#### 3.6.2 Reset Password (`/[locale]/auth/reset-password?token=XXX`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-AUTH-19 | Token Validation | On page load, validate the token. If invalid/expired → error message + link to forgot-password |
| F-AUTH-20 | New Password Form | Two fields: new password + confirm. Validation: min 6 chars, must match. |
| F-AUTH-21 | Reset Success | On success: confirmation message + redirect to login page |

**Input Fields**

| Field | Required | Constraints | Validation |
|---|---|---|---|
| New Password | Yes | Min 6 characters | Real-time length check |
| Password Confirm | Yes | Must match New Password | Real-time match check |

**Server Validation Errors**

| Condition | Error |
|---|---|
| Token invalid/expired | "링크가 만료되었거나 유효하지 않습니다. 다시 요청해주세요." / "This link has expired or is invalid. Please request a new one." |
| Password too short | "비밀번호는 최소 6자 이상이어야 합니다" / "Password must be at least 6 characters" |
| Passwords don't match | "비밀번호가 일치하지 않습니다" / "Passwords do not match" |

**Storyboard: Password Reset**

```
[1] User clicks "비밀번호 찾기" on login page → navigates to /[locale]/auth/forgot-password.
[2] User enters email → clicks submit.
[3] System sends reset email (if account exists). Shows generic confirmation message.
[4] User clicks link in email → /[locale]/auth/reset-password?token=XXX.
[5] Page validates token on load.
[5a] Token valid → show new password form.
[5b] Token invalid/expired → error message + "Request new link" button → back to forgot-password.
[6] User enters new password + confirm → submit.
[7a] Success → confirmation message → redirect to login.
[7b] Validation error → inline error messages.
```
```

- [ ] **Step 2: Verify the edit is correct**

Read the newly added §3.6 section and confirm:
- Feature codes are F-AUTH-16 through F-AUTH-21
- Two sub-sections: 3.6.1 Forgot Password and 3.6.2 Reset Password
- Error message format matches §3.1 pattern (KO / EN pairs)

- [ ] **Step 3: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md
git commit -m "docs(fsd): add §3.6 Password Reset to EN Customer Web FSD"
```

---

### Task 4: Add EN FSD — Appendix D: Deferred Auth Features

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` (before Document End)

- [ ] **Step 1: Add Appendix D**

Find the `> **Document End**` block at the bottom of the file. Insert the following **before** it:

```markdown
## Appendix D. Deferred Auth Features

The following features are defined in the UI/UX Specification but deferred from MVP:

| Feature | Reason | Depends On |
|---|---|---|
| ID Recovery (find email by display name) | No reliable alternative identifier without phone number | Phone/SMS verification |
| Phone/SMS Verification | Not in PRD MVP scope | SMS service integration |
| Welcome Coupon (3,000 KRW on signup) | Coupon system not in PRD MVP scope | Coupon content type + admin management |
| Stronger Password Rules (8+ chars, alphanumeric + special) | Current FSD/PRD specifies min 6 chars only | PRD update to strengthen requirements |

> These features should be added to the FSD when their dependencies are resolved and the PRD scope is updated.

---

```

- [ ] **Step 2: Verify the edit is correct**

Read the last 30 lines of the file and confirm Appendix D appears before Document End.

- [ ] **Step 3: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md
git commit -m "docs(fsd): add Appendix D deferred auth features to EN Customer Web FSD"
```

---

### Task 5: Update KO FSD — Page List and Access Control (§2)

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md:61-82`

- [ ] **Step 1: Add 3 new routes to the KO Page List table**

In `SWIDA_FSD_Customer_Web_KO.md`, find the page list table (line 61-72). After row 10 (OAuth 콜백), add:

```markdown
| 11 | 회원가입 | `/[locale]/auth/signup` | 비회원 전용 | 이메일 회원가입 및 약관 동의 |
| 12 | 비밀번호 찾기 | `/[locale]/auth/forgot-password` | 비회원 전용 | 비밀번호 재설정 요청 (이메일 입력) |
| 13 | 비밀번호 재설정 | `/[locale]/auth/reset-password` | 비회원 전용 | 새 비밀번호 설정 (토큰 기반) |
```

- [ ] **Step 2: Update the KO Access Control table**

Find the Access Control table (line 78-82). Replace it with:

```markdown
| 사용자 상태 | 접근 가능 페이지 | 제한된 동작 처리 |
|---|---|---|
| 비로그인 | 모든 페이지 (탐색만 가능) | 리뷰 작성 / 신고 → 로그인 페이지로 리다이렉트 |
| 로그인 (활성) | 모든 페이지 + 리뷰 작성 | 로그인 / 회원가입 / 비밀번호 찾기 / 비밀번호 재설정 → 홈페이지로 리다이렉트 |
| 로그인 (잠금/정지) | 모든 페이지 (탐색만 가능) | 리뷰 작성 / 신고 → 오류 메시지: "계정이 정지되었습니다. 관리자에게 문의해주세요." |
```

- [ ] **Step 3: Verify the edits are correct**

Read lines 59-85 of `SWIDA_FSD_Customer_Web_KO.md` and confirm page list has 13 rows and access control is updated.

- [ ] **Step 4: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md
git commit -m "docs(fsd): add auth page routes to KO Customer Web page list"
```

---

### Task 6: Add KO FSD — §3.5 회원가입

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md:145-146`

- [ ] **Step 1: Add §3.5 회원가입 section**

In `SWIDA_FSD_Customer_Web_KO.md`, find the `---` separator after §3.4 로그아웃 (between end of §3.4 and start of §4). Insert the following **before** that `---` separator:

```markdown
### 3.5 회원가입 (`/[locale]/auth/signup`)

> PRD 참조: §3.3 Customer, §11.5 Security

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-AUTH-10 | 이메일 회원가입 폼 | 이메일, 비밀번호, 비밀번호 확인, 닉네임 필드로 구성된 폼 |
| F-AUTH-11 | 약관 동의 | "전체 동의" 체크박스 + 이용약관 및 개인정보처리방침 개별 필수 체크박스. 모두 체크해야 제출 가능. |
| F-AUTH-12 | 클라이언트 유효성 검사 | 실시간 필드 검사: 이메일 형식, 비밀번호 최소 6자, 비밀번호 일치, 닉네임 2–20자 |
| F-AUTH-13 | 서버 유효성 검사 | 기존 F-AUTH-04 제약조건에 따른 이메일/닉네임 중복 검사 |
| F-AUTH-14 | 회원가입 완료 모달 | 가입 성공 시: 개인화된 환영 메시지와 홈페이지·내 주변 검색 이동 버튼이 포함된 축하 모달 |
| F-AUTH-15 | 가입 후 자동 로그인 | 가입 성공 즉시 자동 로그인 처리 (세션 즉시 생성) |

**입력 필드**

| 필드 | 필수 | 제약조건 | 유효성 검사 |
|---|---|---|---|
| 이메일 | 예 | 유효한 이메일 형식, 고유값 | 실시간 형식 검사 + 제출 시 서버 고유값 검사 |
| 비밀번호 | 예 | 최소 6자 | 실시간 길이 검사 |
| 비밀번호 확인 | 예 | 비밀번호와 일치 | 실시간 일치 검사 |
| 닉네임 | 예 | 2–20자, 고유값 | 실시간 길이 검사 + 제출 시 서버 고유값 검사 |

**약관 동의 체크박스**

| 체크박스 | 필수 | 동작 |
|---|---|---|
| 전체 동의 | 아니오 | 모든 개별 체크박스를 토글 |
| 이용약관 | 예 | 약관 내용으로 이동하는 링크 |
| 개인정보처리방침 | 예 | 개인정보처리방침 내용으로 이동하는 링크 |

**서버 유효성 검사 오류** (§3.1 테이블 확장)

| 조건 | 오류 |
|---|---|
| 이미 등록된 이메일 | "이미 등록된 이메일입니다" / "This email is already registered" |
| 이미 사용 중인 닉네임 | "이미 사용 중인 닉네임입니다" / "This display name is already taken" |
| 비밀번호 너무 짧음 | "비밀번호는 최소 6자 이상이어야 합니다" / "Password must be at least 6 characters" |

**회원가입 완료 모달 CTA**

| 버튼 | 동작 |
|---|---|
| 홈으로 가기 | `/[locale]`로 이동 |
| 내 주변 업체 보기 | `/[locale]/nearby`로 이동 |

**스토리보드: 회원가입**

```
[1] 사용자가 /[locale]/auth/signup으로 이동. 이미 로그인 상태 → 홈페이지로 리다이렉트.
[2] 사용자가 이메일, 비밀번호, 비밀번호 확인, 닉네임을 입력.
[3] 사용자가 필수 약관 동의 체크박스를 체크 (이용약관, 개인정보처리방침).
[4] 사용자가 "회원가입"을 클릭. 클라이언트 유효성 검사가 먼저 실행.
[5] 검사 통과 → 서버에 제출. 서버가 이메일/닉네임 고유값 검사.
[6a] 성공 → 자동 로그인 → 환영 메시지와 CTA가 포함된 완료 모달 표시.
[6b] 서버 오류 → 해당 필드 아래에 인라인 오류 메시지 표시.
[7] 사용자가 모달을 닫거나 CTA를 클릭 → 선택한 페이지로 이동.
```
```

- [ ] **Step 2: Verify the edit is correct**

Read the newly added §3.5 section and confirm it mirrors the EN version structurally.

- [ ] **Step 3: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md
git commit -m "docs(fsd): add §3.5 회원가입 to KO Customer Web FSD"
```

---

### Task 7: Add KO FSD — §3.6 비밀번호 재설정

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md` (after newly added §3.5)

- [ ] **Step 1: Add §3.6 비밀번호 재설정 section**

Insert the following after §3.5 (before the `---` separator that precedes §4 홈페이지):

```markdown
### 3.6 비밀번호 재설정

> PRD 참조: §3.3 Customer, §11.5 Security

#### 3.6.1 비밀번호 찾기 (`/[locale]/auth/forgot-password`)

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-AUTH-16 | 비밀번호 재설정 요청 | 사용자가 재설정 링크를 받기 위해 이메일 주소를 제출 |
| F-AUTH-17 | 이메일 발송 | 토큰화된 재설정 링크가 포함된 이메일 발송. 토큰은 1시간 후 만료, 일회용. |
| F-AUTH-18 | 확인 메시지 | 제출 후: 이메일 존재 여부와 관계없이 동일한 성공 메시지 표시 (사용자 열거 방지) |

**입력 필드**

| 필드 | 필수 | 제약조건 |
|---|---|---|
| 이메일 | 예 | 유효한 이메일 형식 |

**서버 동작**

- 이메일이 존재하는 경우: 토큰화된 링크가 포함된 비밀번호 재설정 이메일 발송
- 이메일이 존재하지 않는 경우: 동일한 성공 메시지 표시 (계정 존재 여부 표시 없음)
- 요청 제한: 이메일당 시간당 최대 3회 재설정 요청

**확인 메시지**

| 조건 | 메시지 |
|---|---|
| 제출 (항상) | "비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요." / "A password reset link has been sent to your email. Please check your inbox." |

#### 3.6.2 비밀번호 재설정 (`/[locale]/auth/reset-password?token=XXX`)

**기능 목록**

| # | 기능 | 설명 |
|---|---|---|
| F-AUTH-19 | 토큰 유효성 검사 | 페이지 로드 시 토큰 검증. 유효하지 않거나 만료된 경우 → 오류 메시지 + 비밀번호 찾기 링크 |
| F-AUTH-20 | 새 비밀번호 폼 | 두 개의 필드: 새 비밀번호 + 확인. 유효성 검사: 최소 6자, 일치 필수. |
| F-AUTH-21 | 재설정 완료 | 성공 시: 확인 메시지 + 로그인 페이지로 리다이렉트 |

**입력 필드**

| 필드 | 필수 | 제약조건 | 유효성 검사 |
|---|---|---|---|
| 새 비밀번호 | 예 | 최소 6자 | 실시간 길이 검사 |
| 비밀번호 확인 | 예 | 새 비밀번호와 일치 | 실시간 일치 검사 |

**서버 유효성 검사 오류**

| 조건 | 오류 |
|---|---|
| 토큰 유효하지 않음/만료 | "링크가 만료되었거나 유효하지 않습니다. 다시 요청해주세요." / "This link has expired or is invalid. Please request a new one." |
| 비밀번호 너무 짧음 | "비밀번호는 최소 6자 이상이어야 합니다" / "Password must be at least 6 characters" |
| 비밀번호 불일치 | "비밀번호가 일치하지 않습니다" / "Passwords do not match" |

**스토리보드: 비밀번호 재설정**

```
[1] 사용자가 로그인 페이지에서 "비밀번호 찾기"를 클릭 → /[locale]/auth/forgot-password로 이동.
[2] 사용자가 이메일을 입력 → 제출 클릭.
[3] 시스템이 재설정 이메일 발송 (계정이 존재하는 경우). 일반 확인 메시지 표시.
[4] 사용자가 이메일의 링크를 클릭 → /[locale]/auth/reset-password?token=XXX.
[5] 페이지가 로드 시 토큰 검증.
[5a] 토큰 유효 → 새 비밀번호 폼 표시.
[5b] 토큰 유효하지 않음/만료 → 오류 메시지 + "새 링크 요청" 버튼 → 비밀번호 찾기로 이동.
[6] 사용자가 새 비밀번호 + 확인 입력 → 제출.
[7a] 성공 → 확인 메시지 → 로그인으로 리다이렉트.
[7b] 유효성 검사 오류 → 인라인 오류 메시지.
```
```

- [ ] **Step 2: Verify the edit is correct**

Read the newly added §3.6 section and confirm it mirrors the EN version structurally.

- [ ] **Step 3: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md
git commit -m "docs(fsd): add §3.6 비밀번호 재설정 to KO Customer Web FSD"
```

---

### Task 8: Add KO FSD — 부록 D: 연기된 인증 기능

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md` (before Document End)

- [ ] **Step 1: Add 부록 D**

Find the `> **문서 끝**` block at the bottom of the file. Insert the following **before** it:

```markdown
## 부록 D. 연기된 인증 기능

다음 기능은 UI/UX 화면 정의서에 정의되어 있으나 MVP에서 연기됨:

| 기능 | 사유 | 의존 항목 |
|---|---|---|
| 아이디 찾기 (닉네임으로 이메일 조회) | 휴대폰 번호 없이 대체 식별자 부재 | 휴대폰/SMS 인증 |
| 휴대폰/SMS 인증 | PRD MVP 범위에 포함되지 않음 | SMS 서비스 연동 |
| 웰컴 쿠폰 (가입 시 3,000원) | 쿠폰 시스템이 PRD MVP 범위에 포함되지 않음 | 쿠폰 콘텐츠 타입 + 관리자 관리 |
| 강화된 비밀번호 규칙 (8자+, 영문/숫자/특수문자) | 현재 FSD/PRD는 최소 6자만 명시 | PRD 업데이트로 요구사항 강화 |

> 이러한 기능은 의존 항목이 해결되고 PRD 범위가 업데이트된 후 FSD에 추가되어야 합니다.

---

```

- [ ] **Step 2: Verify the edit is correct**

Read the last 30 lines of the file and confirm 부록 D appears before 문서 끝.

- [ ] **Step 3: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md
git commit -m "docs(fsd): add 부록 D deferred auth features to KO Customer Web FSD"
```

---

### Task 9: Update UIUX specs — remove "not in FSD" notes

**Files:**
- Modify: `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_EN.md`
- Modify: `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_KO.md`

- [ ] **Step 1: Update EN UIUX Sign Up FSD reference**

In `SWIDA_UIUX_Spec_Customer_Web_EN.md`, find §10.2 Sign Up (around line 1264-1266). The current reference is:

```markdown
> FSD: §3.1, F-AUTH-04
```

Replace with:

```markdown
> FSD: §3.5, F-AUTH-10~15
```

- [ ] **Step 2: Update EN UIUX Password Reset note**

Find §10.4 Password Reset (around line 1329-1331). The current note is:

```markdown
> **Note**: Not in current FSD. Derived from Figma frame.
```

Replace with:

```markdown
> FSD: §3.6, F-AUTH-16~21
```

- [ ] **Step 3: Update EN UIUX ID Recovery note**

Find §10.5 ID Recovery Modal (around line 1356-1358). The current note is:

```markdown
> **Note**: Not in current FSD. Derived from Figma frame.
```

Replace with:

```markdown
> **Note**: Deferred from MVP — see FSD Appendix D. Requires Phone/SMS verification as alternative identifier.
```

- [ ] **Step 4: Repeat steps 1-3 for KO UIUX file**

In `SWIDA_UIUX_Spec_Customer_Web_KO.md`, make the same three changes:

1. §10.2 회원가입: `> FSD: §3.1, F-AUTH-04` → `> FSD: §3.5, F-AUTH-10~15`
2. §10.4 비밀번호 재설정: `> **참고**: 현재 FSD에 없음. Figma 프레임에서 도출.` → `> FSD: §3.6, F-AUTH-16~21`
3. §10.5 아이디 찾기 모달: `> **참고**: 현재 FSD에 없음. Figma 프레임에서 도출.` → `> **참고**: MVP에서 연기 — FSD 부록 D 참조. 대체 식별자로 휴대폰/SMS 인증 필요.`

- [ ] **Step 5: Verify all changes**

Read the relevant sections in both files to confirm the references are updated.

- [ ] **Step 6: Commit**

```bash
git add docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_EN.md docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_KO.md
git commit -m "docs(uiux): update FSD references for auth pages in Customer Web UIUX specs"
```

---

### Task 10: Update UIUX closing notes — remove auth from "needs FSD" list

**Files:**
- Modify: `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_EN.md`
- Modify: `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_KO.md`

- [ ] **Step 1: Update EN UIUX closing note**

Find the closing note (around line 868 or later) that lists features needing FSD updates. It should mention sections 7, 8, 9, 10.4, 10.5. Update to remove 10.4 and 10.5 from the list since they now have FSD coverage (10.4 via §3.6, 10.5 deferred in Appendix D).

The updated note should only reference sections 7 (Board), 8 (Community), and 9 (Events) as needing FSD updates.

- [ ] **Step 2: Update KO UIUX closing note**

Find the matching KO closing note and make the same update.

- [ ] **Step 3: Verify both files**

Read the closing notes in both files to confirm 10.4 and 10.5 are removed from the "needs FSD" list.

- [ ] **Step 4: Commit**

```bash
git add docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_EN.md docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_KO.md
git commit -m "docs(uiux): update closing notes — auth pages now have FSD coverage"
```

---

### Task 11: Final validation — build and push

**Files:**
- All modified files

- [ ] **Step 1: Run Docusaurus build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run /docs-review on changed files**

Run `/docs-review` targeting the FSD and UIUX files to check for sync gaps, terminology issues, and formatting problems.

- [ ] **Step 3: Fix any issues found by docs-review**

Address any warnings or errors reported.

- [ ] **Step 4: Push to remote**

```bash
git push
```
