# My Page (마이페이지) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add My Page specification to the Customer Web FSD and UIUX docs (EN + KO), covering dashboard, tabs, edit profile, bookmarks, and navigation updates.

**Architecture:** This is a documentation-only plan. We add a new FSD section (§16) and UIUX section (§10.5) for My Page to 4 existing doc files (EN + KO pairs), update the page list tables, MVP scope tables, access control tables, navigation sections, and error message appendices. Glossary gets new terms.

**Tech Stack:** Markdown (Docusaurus v3)

---

## File Map

| File | Action | What Changes |
|---|---|---|
| `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` | Modify | Add §16 My Page, update §1.2 MVP scope, §2 Page List, §15 Nav, Appendix A |
| `docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md` | Modify | Mirror all EN FSD changes in Korean |
| `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_EN.md` | Modify | Add §10.5 My Page section (between Auth §10 and Partnership §11), update §14 Conflict Resolution Log |
| `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_KO.md` | Modify | Mirror all EN UIUX changes in Korean |
| `docs/swida/glossary.md` | Modify | Add My Page, Bookmark, Profile Photo terms |

---

### Task 1: Update FSD MVP Scope & Page List (EN)

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` (§1.2 and §2)

- [ ] **Step 1: Update MVP scope table at §1.2**

In the MVP scope table, move "Bookmarks / Favorites" from "Not Included" to "Included" and add My Page:

| Included | Not Included (Future) |
|---|---|
| ... (existing rows) | ... |
| My Page (profile, reviews, bookmarks) | Map View (visual map with pins) |
| Bookmarks / Favorites | Booking Integration |

Remove "Bookmarks / Favorites" from the "Not Included" column.

- [ ] **Step 2: Add My Page and Edit Profile to §2 Page List table**

Add two rows after row 13 (Reset Password):

| # | Page | Route | Auth | Description |
|---|---|---|---|---|
| 14 | My Page | `/[locale]/mypage` | Required | User dashboard with profile + tabbed content |
| 15 | Edit Profile | `/[locale]/mypage/edit` | Required | Profile photo change |

- [ ] **Step 3: Update Access Control table**

In the Access Control table after the Page List, update:

| User State | Accessible Pages | Restricted Action Behavior |
|---|---|---|
| Not logged in | All public pages (browse only) | Review submission / report → redirect to login. My Page / Edit Profile → redirect to login. |
| Logged in (active) | All pages + review submission + My Page | Login / Sign Up / Forgot Password / Reset Password → redirect to homepage |
| Logged in (locked/suspended) | All pages (browse only) + My Page (view only) | Review submission / report → error message. |

- [ ] **Step 4: Verify changes**

Read back §1.2, §2, and Access Control table to confirm formatting is correct and no table rows are broken.

- [ ] **Step 5: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md
git commit -m "docs(fsd): add My Page to MVP scope, page list, and access control (EN)"
```

---

### Task 2: Add FSD §16 My Page Section (EN)

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` (add §16 after §15)

- [ ] **Step 1: Add §16 My Page section after §15 Global Layout & Navigation**

Insert before Appendix A:

```markdown
---

## 16. My Page

### 16.1 My Page Dashboard (`/[locale]/mypage`)

> Design Spec Reference: My Page Design Spec (2026-03-27)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-MYPAGE-01 | Review List | Paginated list of reviews written by the logged-in user, newest first |
| F-MYPAGE-02 | Review Card Display | Each review shows: shop name (linked to shop detail), star rating, review text (truncated to 2 lines), date written, photo thumbnail (if photos exist) |
| F-MYPAGE-03 | Reviews Empty State | "아직 작성한 리뷰가 없습니다." / "You haven't written any reviews yet." with CTA link to shop discovery |
| F-MYPAGE-04 | Reviews Pagination | Page-based, 10 items per page |
| F-MYPAGE-05 | Bookmark Grid | Paginated grid of bookmarked shops, most recently bookmarked first |
| F-MYPAGE-06 | Shop Card Display | Matches existing shop card pattern: thumbnail, shop name (linked), region/district, theme badges, unbookmark button (heart icon) |
| F-MYPAGE-07 | Unbookmark Toggle | Heart icon removes bookmark. Optimistic UI: heart unfills immediately. On failure: reverts with toast error. Card remains visible until next page load. |
| F-MYPAGE-08 | Bookmarks Empty State | "아직 찜한 업체가 없습니다." / "No bookmarked shops yet." with CTA link to shop discovery |
| F-MYPAGE-09 | Bookmarks Pagination | Page-based, 12 items per page |

**Profile Card**

| Element | Display |
|---|---|
| Profile photo | Circular, fallback to default avatar |
| Display name | Read-only text |
| Email | Read-only text |
| Member since | `YYYY.MM.DD` format |
| Edit Profile button | Navigates to `/[locale]/mypage/edit` |

**Tab Configuration**

| Tab | Label (KO) | Label (EN) | URL Param |
|---|---|---|---|
| My Reviews | 내 리뷰 | My Reviews | `?tab=reviews` (default, omittable) |
| Bookmarked Shops | 찜한 업체 | Bookmarked Shops | `?tab=bookmarks` |

### 16.2 Edit Profile (`/[locale]/mypage/edit`)

| # | Feature | Description |
|---|---|---|
| F-MYPAGE-10 | Photo Upload | Upload or change profile photo |
| F-MYPAGE-11 | Photo Remove | Remove current profile photo (reverts to default avatar) |
| F-MYPAGE-12 | Read-Only Fields | Display name, email, and member since displayed but not editable |
| F-MYPAGE-13 | Save | Validates photo, uploads, redirects to `/[locale]/mypage` |
| F-MYPAGE-14 | Cancel | Discards changes, returns to `/[locale]/mypage` |

**Photo Constraints**

| Constraint | Rule |
|---|---|
| File types | JPG, PNG, WebP |
| Max file size | 5 MB |
| Validation | Client-side: file type + size check before upload. Server-side: re-validate. |

**Server Validation Errors**

| Condition | Error |
|---|---|
| File too large | "파일 크기가 5MB를 초과합니다." / "File size exceeds 5MB." |
| Invalid file type | "지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 가능합니다." / "Unsupported file type. Only JPG, PNG, and WebP are allowed." |
| Upload failed | "업로드에 실패했습니다. 다시 시도해주세요." / "Upload failed. Please try again." |

### 16.3 Bookmark API

Minimum bookmark API surface required for My Page:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/bookmarks` | Add bookmark (shop ID) |
| DELETE | `/bookmarks/:id` | Remove bookmark |
| GET | `/bookmarks?user=me&page=N` | List user's bookmarks (paginated) |

Bookmark toggle (heart icon) also appears on shop detail page and shop cards site-wide.
```

- [ ] **Step 2: Verify the new section renders correctly**

Read back §16 to confirm all tables are properly formatted.

- [ ] **Step 3: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md
git commit -m "docs(fsd): add §16 My Page section with features, profile, bookmarks (EN)"
```

---

### Task 3: Update FSD Navigation & Appendix (EN)

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` (§15 and Appendix A)

- [ ] **Step 1: Add My Page link to §15.1 Header**

Add row to §15.1 Header feature table:

| F-NAV-14 | My Page Link | Logged in: user dropdown includes "마이페이지" / "My Page" link to `/[locale]/mypage` |

- [ ] **Step 2: Add My Page nav entry to §15.2 Navigation Menu**

Add row:

| F-NAV-11 | My Page | Link to `/[locale]/mypage` (visible only when logged in) |

Note: Renumber if F-NAV-11 conflicts — check existing numbering. The current F-NAV-11 is "Site Links" in §15.3 Footer. Add as F-NAV-15 instead to avoid renumbering:

| F-NAV-15 | My Page | Logged in: link to `/[locale]/mypage`. Not logged in: hidden or redirects to login. |

- [ ] **Step 3: Add error codes to Appendix A**

Add these rows to the error message table:

| ERR_FILE_TOO_LARGE | 파일 크기가 5MB를 초과합니다. | File size exceeds 5MB. |
| ERR_INVALID_FILE_TYPE | 지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 가능합니다. | Unsupported file type. Only JPG, PNG, and WebP are allowed. |
| ERR_UPLOAD_FAILED | 업로드에 실패했습니다. 다시 시도해주세요. | Upload failed. Please try again. |
| ERR_BOOKMARK_FAILED | 북마크 해제에 실패했습니다. 다시 시도해주세요. | Failed to remove bookmark. Please try again. |

- [ ] **Step 4: Verify changes**

Read back §15 and Appendix A to confirm.

- [ ] **Step 5: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md
git commit -m "docs(fsd): add My Page nav links and error codes to appendix (EN)"
```

---

### Task 4: Mirror FSD Changes to KO

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md`

- [ ] **Step 1: Read the KO FSD to find equivalent sections**

Read §1.2 (MVP 범위), §2 (페이지 목록), Access Control table, the end of the last section (before 부록), §15 equivalent, and 부록 A in the KO file.

- [ ] **Step 2: Update KO MVP scope table**

Mirror the EN changes: move 북마크/즐겨찾기 to 포함 column, add 마이페이지.

- [ ] **Step 3: Update KO Page List table**

Add:

| 14 | 마이페이지 | `/[locale]/mypage` | 필수 | 프로필 + 탭 콘텐츠가 있는 사용자 대시보드 |
| 15 | 프로필 수정 | `/[locale]/mypage/edit` | 필수 | 프로필 사진 변경 |

- [ ] **Step 4: Update KO Access Control table**

Mirror EN access control updates in Korean.

- [ ] **Step 5: Add §16 마이페이지 section in KO**

Translate the full §16 from EN to KO, keeping all Feature IDs (F-MYPAGE-01 through F-MYPAGE-14) identical. Section title: `## 16. 마이페이지`

- [ ] **Step 6: Update KO Nav section and 부록 A**

Add F-NAV-15 마이페이지 link and error codes (ERR_FILE_TOO_LARGE, ERR_INVALID_FILE_TYPE, ERR_UPLOAD_FAILED, ERR_BOOKMARK_FAILED) to Korean appendix.

- [ ] **Step 7: Verify changes**

Spot-check that Feature IDs, route paths, and table structures match the EN version.

- [ ] **Step 8: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md
git commit -m "docs(fsd): add §16 마이페이지 and related updates (KO)"
```

---

### Task 5: Add UIUX §10.5 My Page Section (EN)

**Files:**
- Modify: `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_EN.md`

- [ ] **Step 1: Identify insertion point**

The UIUX EN file has:
- §10 Pages — Auth (line ~1209)
- §11 Pages — Partnership (line ~1384)

My Page should be inserted as a new section between Auth and Partnership. Since inserting §10.5 would break numbering, instead add as **§10A Pages — My Page** or renumber §11+ by 1. Check existing section references before deciding.

Recommended: Insert as `## 10A. Pages — My Page` to avoid renumbering all downstream sections and breaking cross-references.

- [ ] **Step 2: Add UIUX My Page section**

Insert after §10 Pages — Auth, before §11 Pages — Partnership:

```markdown
---

## 10A. Pages — My Page

> FSD Reference: §16 My Page
> **Note:** This section was added to fill a content gap — My Page was referenced in nav (§3) but had no UIUX specification.

### 10A.1 My Page Dashboard (`/[locale]/mypage`)

**Layout — Desktop (D)**

```
┌─────────────────────────────────────────────────────────┐
│  Header (§3.1)                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌──────────┐                                          │
│   │  (Photo) │  Display Name                            │
│   │  ○    ○  │  email@example.com                       │
│   └──────────┘  가입일: 2026.01.15                       │
│                 [ 프로필 수정 ]                            │
│                                                         │
│   ┌──────────────┬──────────────┐                       │
│   │  내 리뷰 (●) │  찜한 업체    │                       │
│   ├──────────────┴──────────────┤                       │
│   │                             │                       │
│   │  Review Card 1              │                       │
│   │  ┌────┐ ★★★★☆             │                       │
│   │  │img │ Shop Name            │                       │
│   │  └────┘ 리뷰 텍스트...       │                       │
│   │         2026.03.15           │                       │
│   │                             │                       │
│   │  Review Card 2              │                       │
│   │  ...                        │                       │
│   │                             │                       │
│   │  [ 1 ] [ 2 ] [ 3 ] ...     │                       │
│   └─────────────────────────────┘                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Footer (§3.3)                                          │
└─────────────────────────────────────────────────────────┘
```

**Layout — Mobile (M)**

```
┌─────────────────────────┐
│  Header (§3.1)          │
├─────────────────────────┤
│                         │
│      ┌──────┐           │
│      │(Photo)│          │
│      └──────┘           │
│    Display Name         │
│    email@example.com    │
│    가입일: 2026.01.15    │
│    [ 프로필 수정 ]       │
│                         │
│  ┌────────┬────────┐    │
│  │내 리뷰●│찜한 업체│    │
│  ├────────┴────────┤    │
│  │                 │    │
│  │ Review Card 1   │    │
│  │ (full width)    │    │
│  │                 │    │
│  │ Review Card 2   │    │
│  │ ...             │    │
│  │                 │    │
│  │ [ 1 ][ 2 ][ 3 ]│    │
│  └─────────────────┘    │
│                         │
├─────────────────────────┤
│  Tab Bar (§3.2)         │
└─────────────────────────┘
```

**Bookmarked Shops Tab — Desktop (D)**

```
┌──────────────┴──────────────┐
│  내 리뷰     │  찜한 업체 (●) │
├──────────────┴──────────────┤
│                             │
│  ┌─────┐ ┌─────┐ ┌─────┐   │
│  │ img │ │ img │ │ img │   │
│  │  ♥  │ │  ♥  │ │  ♥  │   │
│  │Name │ │Name │ │Name │   │
│  │Loc  │ │Loc  │ │Loc  │   │
│  │Tags │ │Tags │ │Tags │   │
│  └─────┘ └─────┘ └─────┘   │
│                             │
│  [ 1 ] [ 2 ] [ 3 ] ...     │
└─────────────────────────────┘
```

**Tier Adaptation**

| Element | Desktop (D) | Tablet (T) | Mobile (M) |
|---|---|---|---|
| Profile card | Horizontal layout (photo left, info right) | Same as D | Stacked (photo centered above info) |
| Tab bar | Full-width tabs | Same as D | Same as D |
| My Reviews list | Single column, comfortable spacing | Same as D | Full-width cards |
| Bookmarks grid | 3 columns | 2 columns | 1 column |
| Pagination | Page numbers | Page numbers | Page numbers |

**Interaction Details**

| Action | Behavior |
|---|---|
| Tab switch | URL updates with `?tab=reviews` or `?tab=bookmarks`. Content area swaps. No full page reload. |
| Review card tap | Navigate to shop detail page (`/[locale]/shop/[slug]`) |
| Unbookmark (♥ tap) | Heart unfills (optimistic). On API failure: heart refills + toast error. Card stays until page refresh. |
| Edit Profile button | Navigate to `/[locale]/mypage/edit` |

**Data States**

| State | Treatment |
|---|---|
| Loading | Skeleton UI for profile card and tab content |
| Reviews empty | Empty state: icon + "아직 작성한 리뷰가 없습니다." + CTA to discover shops |
| Bookmarks empty | Empty state: icon + "아직 찜한 업체가 없습니다." + CTA to discover shops |

### 10A.2 Edit Profile (`/[locale]/mypage/edit`)

**Layout — Desktop (D)**

```
┌─────────────────────────────────────────────────────────┐
│  Header (§3.1)                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   프로필 수정                                             │
│                                                         │
│   ┌──────────┐                                          │
│   │  (Photo) │  [ 사진 변경 ]  [ 사진 삭제 ]               │
│   │  ○    ○  │                                          │
│   └──────────┘                                          │
│                                                         │
│   닉네임:      Display Name (read-only)                   │
│   이메일:      email@example.com (read-only)              │
│   가입일:      2026.01.15 (read-only)                     │
│                                                         │
│   [ 취소 ]                              [ 저장 ]          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Footer (§3.3)                                          │
└─────────────────────────────────────────────────────────┘
```

**Tier Adaptation**

| Element | Desktop (D) | Tablet (T) | Mobile (M) |
|---|---|---|---|
| Layout | Centered card (max-width 600px) | Same as D | Full-width with padding |
| Photo actions | Inline buttons beside photo | Same as D | Buttons below photo |
| Save/Cancel | Right-aligned row | Same as D | Full-width stacked buttons (Save primary, Cancel secondary) |

**Interaction Details**

| Action | Behavior |
|---|---|
| 사진 변경 | Opens file picker. Client validates type + size before upload. |
| 사진 삭제 | Confirm dialog: "프로필 사진을 삭제하시겠습니까?" → removes photo, shows default avatar |
| 저장 | Submit → loading state on button → redirect to `/[locale]/mypage` on success |
| 취소 | Navigate back to `/[locale]/mypage` (no confirmation if no changes made; confirm if unsaved changes) |
```

- [ ] **Step 3: Update §14 Conflict Resolution Log**

Update C-02 entry about Favorites/heart icon. Currently says "Excluded from MVP". Add note:

| C-02 | Favorites / heart icon | ♡ on shop cards + detail | PRD §12: "Future" | **Included in MVP (revised)** | Bookmarks moved to MVP scope for My Page. Heart icon on shop cards + detail + My Page bookmarks tab. |

- [ ] **Step 4: Verify changes**

Read back the new section and conflict log update.

- [ ] **Step 5: Commit**

```bash
git add docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_EN.md
git commit -m "docs(uiux): add §10A My Page wireframes and interaction spec (EN)"
```

---

### Task 6: Mirror UIUX Changes to KO

**Files:**
- Modify: `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_KO.md`

- [ ] **Step 1: Read KO UIUX to find insertion point**

Find the equivalent of §10 (인증 페이지) and §11 (제휴 페이지) in the KO file.

- [ ] **Step 2: Add §10A 마이페이지 section**

Translate the full §10A from EN to KO. Keep all wireframe ASCII art identical (Korean labels are already used in the wireframes). Translate only the prose, table headers, and descriptive text.

- [ ] **Step 3: Update §14 Conflict Resolution Log in KO**

Mirror the C-02 update.

- [ ] **Step 4: Verify changes**

Spot-check wireframes and tables match EN structure.

- [ ] **Step 5: Commit**

```bash
git add docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_KO.md
git commit -m "docs(uiux): add §10A 마이페이지 wireframes and interaction spec (KO)"
```

---

### Task 7: Update Glossary

**Files:**
- Modify: `docs/swida/glossary.md`

- [ ] **Step 1: Read current glossary**

Read `docs/swida/glossary.md` to find the right insertion points (alphabetical order).

- [ ] **Step 2: Add new terms**

Add these rows to the glossary table:

| Bookmark | 북마크 / 찜 | User's saved shop for quick access from My Page | Favorite, Like, Save |
| My Page | 마이페이지 | Logged-in user's personal dashboard (profile, reviews, bookmarks) | My Account, Dashboard, Profile Page |
| Profile Photo | 프로필 사진 | User's avatar image displayed on profile card | Avatar, Profile Picture, Profile Image |

- [ ] **Step 3: Verify changes**

Read back the glossary to confirm alphabetical order and formatting.

- [ ] **Step 4: Commit**

```bash
git add docs/swida/glossary.md
git commit -m "docs: add My Page, Bookmark, Profile Photo to glossary"
```

---

### Task 8: Run /docs-review

- [ ] **Step 1: Run docs-review on all changed files**

Run `/docs-review` targeting:
- `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md`
- `docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md`
- `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_EN.md`
- `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_KO.md`
- `docs/swida/glossary.md`

- [ ] **Step 2: Fix any issues found**

Address sync gaps, terminology issues, cross-reference conflicts, and formatting problems.

- [ ] **Step 3: Commit fixes if any**

```bash
git add docs/swida/
git commit -m "docs: address docs-review findings for My Page additions"
```
