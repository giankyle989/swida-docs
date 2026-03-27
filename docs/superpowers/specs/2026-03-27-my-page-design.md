# My Page (마이페이지) — Design Spec

- **Date**: 2026-03-27
- **Scope**: MVP — My Page for Customer Web (dashboard + edit profile)
- **Status**: Draft
- **Related Documents**: Customer Web FSD, Customer Web UIUX Spec

---

## 1. Overview

My Page is a logged-in user's personal dashboard showing their profile, reviews, and bookmarked shops. It is referenced in the UIUX nav (header dropdown, mobile bottom nav, drawer) but has no existing FSD or UIUX specification.

This spec covers two pages:
- **My Page dashboard** — read-only profile card with tabbed content
- **Edit Profile** — profile photo change only

### 1.1 MVP Scope

| Included | Not Included (Future) |
|---|---|
| Profile card (photo, display name, email, member since) | User levels / points system |
| My Reviews tab (paginated list) | Community posts tab |
| Bookmarked Shops tab (paginated grid) | Board posts tab |
| Edit Profile (photo only) | Notification history |
| | Account settings (password change, delete account) |
| | Review statistics / analytics |

---

## 2. Pages & Routes

| # | Page | Route | Auth | Description |
|---|---|---|---|---|
| 14 | My Page | `/[locale]/mypage` | Required | User dashboard with profile + tabbed content |
| 15 | Edit Profile | `/[locale]/mypage/edit` | Required | Profile photo change |

**Auth Legend**: Required = login needed. Unauthenticated users are redirected to `/[locale]/auth/login` with return URL preserved (matching existing FSD §3 auth flow).

**Access Control Update**

| User State | My Page Behavior |
|---|---|
| Not logged in | Redirect to login page (return URL = `/mypage`) |
| Logged in (active) | Full access |
| Logged in (locked/suspended) | Can view profile and bookmarks. Reviews tab shows own reviews (read-only). Cannot write new reviews (existing restriction). |

---

## 3. My Page Dashboard (`/[locale]/mypage`)

### 3.1 Profile Card

Always visible at the top of the page, above tabs.

| Element | Description |
|---|---|
| Profile photo | Circular display, fallback to default avatar if none set |
| Display name | Read-only text |
| Email | Read-only text |
| Member since | Date in `YYYY.MM.DD` format (matches global date rule) |
| Edit Profile button | Navigates to `/[locale]/mypage/edit` |

### 3.2 Tabs

Two tabs below the profile card. Default active tab: **My Reviews**.

| Tab | Label (KO) | Label (EN) |
|---|---|---|
| My Reviews | 내 리뷰 | My Reviews |
| Bookmarked Shops | 찜한 업체 | Bookmarked Shops |

Tab state is reflected in the URL via query parameter: `?tab=reviews` (default, omittable) and `?tab=bookmarks`. This makes tab state shareable and preserves selection on page refresh.

### 3.3 My Reviews Tab

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-MYPAGE-01 | Review List | Paginated list of reviews written by the logged-in user, newest first |
| F-MYPAGE-02 | Review Card | Each card shows: shop name (linked to shop detail), star rating, review text (truncated to 2 lines), date written, photo thumbnail (if review has photos) |
| F-MYPAGE-03 | Empty State | "아직 작성한 리뷰가 없습니다." / "You haven't written any reviews yet." with CTA link to shop discovery |
| F-MYPAGE-04 | Pagination | Page-based, 10 items per page, same pattern as existing list pages |

**Review Card Fields**

| Field | Source | Display |
|---|---|---|
| Shop name | Review → Shop relation | Linked text to `/[locale]/shop/[slug]` |
| Rating | Review rating field | Star icons (1-5) |
| Review text | Review content field | Truncated to 2 lines with ellipsis |
| Date | Review created_at | `YYYY.MM.DD` format |
| Photo thumbnail | Review photos array | First photo as thumbnail, or hidden if no photos |

### 3.4 Bookmarked Shops Tab

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-MYPAGE-05 | Bookmark Grid | Paginated grid of bookmarked shops, most recently bookmarked first |
| F-MYPAGE-06 | Shop Card | Matches existing shop card pattern: thumbnail image, shop name (linked), region/district, theme badges, unbookmark button (heart icon) |
| F-MYPAGE-07 | Unbookmark Toggle | Clicking the heart icon removes the bookmark. Card is removed from list on next page load (not instantly removed to prevent accidental loss). |
| F-MYPAGE-08 | Empty State | "아직 찜한 업체가 없습니다." / "No bookmarked shops yet." with CTA link to shop discovery |
| F-MYPAGE-09 | Pagination | Page-based, 12 items per page (3-column grid on desktop) |

**Shop Card Fields**

| Field | Source | Display |
|---|---|---|
| Thumbnail | Shop main image | Image card |
| Shop name | Shop name field | Linked text to `/[locale]/shop/[slug]` |
| Region / District | Shop location | Text below shop name |
| Themes | Shop themes | Tag badges |
| Bookmark toggle | User bookmark state | Filled heart icon (click to unbookmark) |

**Unbookmark Behavior**

On unbookmark click:
1. Heart icon transitions to unfilled (optimistic UI)
2. API call to remove bookmark
3. On success: card remains visible with unfilled heart for the rest of the current page view. Card disappears on next page load or tab switch.
4. On failure: heart reverts to filled, toast error: "북마크 해제에 실패했습니다. 다시 시도해주세요." / "Failed to remove bookmark. Please try again."

---

## 4. Edit Profile (`/[locale]/mypage/edit`)

### 4.1 Feature List

| # | Feature | Description |
|---|---|---|
| F-MYPAGE-10 | Photo Upload | Upload or change profile photo |
| F-MYPAGE-11 | Photo Remove | Remove current profile photo (reverts to default avatar) |
| F-MYPAGE-12 | Read-Only Fields | Display name, email, and member since shown but not editable |
| F-MYPAGE-13 | Save | Validates photo, uploads, redirects to `/[locale]/mypage` |
| F-MYPAGE-14 | Cancel | Discards changes, returns to `/[locale]/mypage` |

### 4.2 Photo Constraints

| Constraint | Rule |
|---|---|
| File types | JPG, PNG, WebP |
| Max file size | 5 MB |
| Validation | Client-side: file type + size check before upload. Server-side: re-validate type and size. |

### 4.3 Server Validation Errors

| Condition | Error |
|---|---|
| File too large | "파일 크기가 5MB를 초과합니다." / "File size exceeds 5MB." |
| Invalid file type | "지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 가능합니다." / "Unsupported file type. Only JPG, PNG, and WebP are allowed." |
| Upload failed | "업로드에 실패했습니다. 다시 시도해주세요." / "Upload failed. Please try again." |

---

## 5. Navigation Updates

The following existing navigation elements should link to My Page:

| Location | Element | Behavior |
|---|---|---|
| Header (desktop) | User dropdown → "마이페이지" | Navigate to `/[locale]/mypage` |
| Bottom nav (mobile) | MY tab | Guest → login page / Logged in → `/[locale]/mypage` |
| Drawer nav (mobile/tablet) | "마이페이지" link | Navigate to `/[locale]/mypage` |

---

## 6. Bookmark Feature Note

This spec assumes a bookmark/favorite feature exists at the API level (ability to bookmark a shop and retrieve a user's bookmarked shops). The Bookmarked Shops tab depends on this. The current FSD MVP scope table lists "Bookmarks / Favorites" as "Not Included (Future)" — **this spec moves the bookmark feature into MVP scope** for My Page to be functional.

Minimum bookmark API requirements:
- `POST /bookmarks` — add bookmark (shop ID)
- `DELETE /bookmarks/:id` — remove bookmark
- `GET /bookmarks?user=me&page=N` — list user's bookmarks (paginated)
- Bookmark toggle on shop detail page and shop cards (heart icon)
