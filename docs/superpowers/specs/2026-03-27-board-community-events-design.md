# Board, Community & Events — Design Spec

- **Date**: 2026-03-27
- **Scope**: FSD sections for Board System, Community (with gamification), and Events & Notices
- **Status**: Draft
- **Related Documents**: Customer Web FSD, Customer Web UIUX Spec (§7, §8, §9)

---

## 1. Overview

Three UIUX-specified feature areas (§7 Board, §8 Community, §9 Events & Notices) lack corresponding FSD sections. This spec defines the functional requirements for all three, to be added as §17, §18, and §19 in the Customer Web FSD.

### 1.1 Scope Summary

| Section | Pages | Content Source | Auth Model |
|---|---|---|---|
| §17 Board System | 3 pages | Admin-curated (Strapi) | Public browse, login for comments |
| §18 Community | 2 pages | User-generated | Public browse, login for posting |
| §19 Events & Notices | 4 pages | Admin-managed (Strapi) | Public |

### 1.2 MVP Scope

| Included | Not Included (Future) |
|---|---|
| Board: shop recommendation + info boards | Board: user-created posts |
| Board: comments with nested replies | Board: post search/filtering by keyword |
| Community: user posts with photos/video | Community: post editing/deletion by users |
| Community: user levels & points system | Community: reporting community posts |
| Community: feed filters (all, mine, monthly best) | Community: points redemption/spending |
| Events: hub page with notices + events | Events: event registration/signup |
| Events: D-day countdown badges | Events: coupon issuance from events |
| Events: category filtering | Events: push notifications |
| Notices: detail with prev/next nav | |

---

## 2. Pages & Routes

| # | Page | Route | Auth | Description |
|---|---|---|---|---|
| 16 | Shop Recommendation Board | `/[locale]/board/recommendation` | Public | Editorial shop recommendation posts |
| 17 | Massage Info Board | `/[locale]/board/info` | Public | Forum-style info articles |
| 18 | Board Post Detail | `/[locale]/board/[type]/[id]` | Public | Individual board post with comments |
| 19 | Community Feed | `/[locale]/community` | Public | Social feed with user-generated posts |
| 20 | Community Post Detail | `/[locale]/community/[id]` | Public | Individual community post |
| 21 | Events & Notices Hub | `/[locale]/events` | Public | Combined notices + events landing |
| 22 | All Ongoing Events | `/[locale]/events/ongoing` | Public | Filterable event grid |
| 23 | Event Detail | `/[locale]/events/[id]` | Public | Individual event page |
| 24 | Notice Detail | `/[locale]/events/notice/[id]` | Public | Individual notice page |

All pages are public. Actions requiring login: posting comments (Board), creating community posts, liking posts.

---

## 3. Board System (§17)

### 3.1 Shop Recommendation Board (`/[locale]/board/recommendation`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-BOARD-01 | Featured Banner | Carousel of editor's pick posts at the top of the page |
| F-BOARD-02 | Post Grid | 3-column grid of recommendation post cards (image, title, location, date, excerpt) |
| F-BOARD-03 | Region Filter | Tab-style filter by region (전체, 서울, 경기, 부산, 대구, 기타). Filter state in URL query param `?region=` |
| F-BOARD-04 | Pagination | Page-based, same pattern as existing list pages |

**Post Card Fields**

| Field | Source | Display |
|---|---|---|
| Image | Post featured image | Card thumbnail |
| Title | Post title | Linked text to post detail |
| Location | Post region tag | Text below title |
| Date | Post published_at | `YYYY.MM.DD` format |
| Excerpt | Post body | Truncated to 2 lines |

### 3.2 Massage Info Board (`/[locale]/board/info`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-BOARD-05 | Post List | Forum-style list layout (no image cards), paginated |
| F-BOARD-06 | Sort Options | Latest (최신순, default), Popular (인기순), Most Commented (댓글많은순). Sort state in URL `?sort=` |
| F-BOARD-07 | Category Badge | Each post displays a category badge (e.g., [실전팁]) |
| F-BOARD-08 | Post Metadata | Each post shows: author, views, likes, comments count, date |
| F-BOARD-09 | HOT Badge | Posts exceeding a threshold (admin-configurable) display a 🔥HOT indicator |

### 3.3 Board Post Detail (`/[locale]/board/[type]/[id]`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-BOARD-10 | Breadcrumb | Navigation breadcrumb showing board type > post title |
| F-BOARD-11 | Post Header | Category badge, title, author, date, view count, like count, comment count |
| F-BOARD-12 | Post Body | Rich text content with embedded images |
| F-BOARD-13 | Embedded Shop Card | For shop recommendation posts only: shop logo, name, location, hours, amenity tags, link to shop detail |
| F-BOARD-14 | Like Button | "이 글이 도움이 되셨나요?" + like counter. Login required. One like per user per post. |
| F-BOARD-15 | Back to List | "목록으로" button returns to the board list page |
| F-BOARD-16 | Comment Section | Comment input (login required) + comment list with nested replies (1 level deep) |
| F-BOARD-17 | Related Posts | Grid of related posts (shop recommendation type only). 3 posts max. |

**Comment System**

| # | Feature | Description |
|---|---|---|
| F-BOARD-18 | Comment Input | Text input + submit button. Login required. Placeholder: "따뜻한 댓글을 남겨주세요." |
| F-BOARD-19 | Comment Display | Author, relative time ("2시간 전"), comment text |
| F-BOARD-20 | Nested Replies | 1 level deep. Reply button on each comment opens inline reply input. |
| F-BOARD-21 | Comment Pagination | "댓글 더보기 (N)" button loads additional comments |

**Comment Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Comment text | Yes | 1–500 characters, trimmed whitespace |

**Server Validation Errors (Comments)**

| Condition | Error |
|---|---|
| Empty comment | "댓글을 입력해주세요." / "Please enter a comment." |
| Comment too long | "댓글은 500자 이하로 작성해주세요." / "Comments must be 500 characters or less." |
| Not logged in | Redirect to login page |

### 3.4 Sub-Navigation

Shared sub-nav bar across Board and Community pages:

| Tab | Label (KO) | Label (EN) | Route |
|---|---|---|---|
| Shop Recommendations | 샵추천 | Shop Picks | `/[locale]/board/recommendation` |
| Massage Info | 마사지정보 | Massage Info | `/[locale]/board/info` |
| Community | 커뮤니티 | Community | `/[locale]/community` |

Active tab is determined by current route.

---

## 4. Community (§18)

### 4.1 Community Feed (`/[locale]/community`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-COMM-01 | Post Feed | Paginated feed of user-generated posts, newest first by default |
| F-COMM-02 | Post Card | Each card shows: author (with level badge), location, content text, image(s), like count, comment count |
| F-COMM-03 | Post Creation Box | Inline form above feed (desktop/tablet) or FAB → Bottom Sheet (mobile). Login required. |
| F-COMM-04 | Feed Filters | 전체글 (all posts, default), 내글 (my posts, login required), 이달 베스트 (monthly best by likes) |
| F-COMM-05 | User Profile Sidebar | Left sidebar (desktop): profile photo, level, display name, points, post count, like count, feed filter links |
| F-COMM-06 | Popular Shops Sidebar | Right sidebar (desktop): "이번 주 인기샵" list of top shops |
| F-COMM-07 | Pagination | Page-based |

**Post Creation Input Constraints**

| Field | Required | Constraints |
|---|---|---|
| Text content | Yes | 1–2,000 characters |
| Photos | No | Max 5 photos, each max 5MB, JPG/PNG/WebP |
| Video | No | Max 1 video, max 50MB, MP4/MOV |
| Hashtags | No | Max 10 hashtags, each max 30 characters |

**Server Validation Errors (Post Creation)**

| Condition | Error |
|---|---|
| Empty content | "내용을 입력해주세요." / "Please enter content." |
| Content too long | "내용은 2,000자 이하로 작성해주세요." / "Content must be 2,000 characters or less." |
| Too many photos | "사진은 최대 5장까지 업로드할 수 있습니다." / "You can upload up to 5 photos." |
| Photo too large | "파일 크기가 5MB를 초과합니다." / "File size exceeds 5MB." |
| Invalid photo type | "지원하지 않는 파일 형식입니다. JPG, PNG, WebP만 가능합니다." / "Unsupported file type. Only JPG, PNG, and WebP are allowed." |
| Video too large | "동영상 크기가 50MB를 초과합니다." / "Video size exceeds 50MB." |
| Invalid video type | "지원하지 않는 동영상 형식입니다. MP4, MOV만 가능합니다." / "Unsupported video format. Only MP4 and MOV are allowed." |
| Too many hashtags | "해시태그는 최대 10개까지 가능합니다." / "You can add up to 10 hashtags." |
| Not logged in | Redirect to login page |

### 4.2 Community Post Detail (`/[locale]/community/[id]`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-COMM-08 | Post Content | Full post text, photos, video, hashtags |
| F-COMM-09 | Author Info | Profile photo, display name, level badge |
| F-COMM-10 | Like Button | Like counter. Login required. One like per user per post. |
| F-COMM-11 | Comment Section | Same comment system as Board (F-BOARD-18 through F-BOARD-21) |
| F-COMM-12 | User Profile Sidebar | Same as feed (desktop only) |
| F-COMM-13 | Popular Shops Sidebar | Same as feed (desktop only) |

### 4.3 User Levels & Points

**Point Earning Rules**

| Action | Points | Limit |
|---|---|---|
| Create community post | +50P | No daily limit |
| Post a comment (Board or Community) | +10P | Max 10 comments/day earn points |
| Receive a like on your post | +5P | No limit |

**Level Thresholds**

| Level | Points Required | Badge |
|---|---|---|
| Lv.1 | 0P | Lv.1 |
| Lv.2 | 500P | Lv.2 |
| Lv.3 | 2,000P | Lv.3 |
| Lv.4 | 5,000P | Lv.4 |
| Lv.5 | 10,000P | Lv.5 |

**Display Locations**

| Location | What's Shown |
|---|---|
| Community profile sidebar | Level badge, total points, post count, like count |
| Community post cards | Author name + level badge |
| Community post detail | Author name + level badge |

**Rules:**
- Points are display-only in MVP — no spending or redeeming
- Points are cumulative and never decrease
- Level is derived from total points (not stored separately)
- Points are earned immediately on action (no approval delay)

---

## 5. Events & Notices (§19)

### 5.1 Events & Notices Hub (`/[locale]/events`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVENT-01 | Important Notices | Pinned notice cards in a 2×2 grid at the top. Admin marks notices as "important" in Strapi. |
| F-EVENT-02 | Ongoing Events Carousel | Horizontal carousel of active events with D-day countdown badges and "전체보기" link to `/[locale]/events/ongoing` |
| F-EVENT-03 | Notice & Post Table | Combined table of all notices and general posts. Columns: No., Category (공지/일반), Title, Date, View count. Pinned notices (📌) always at top. |
| F-EVENT-04 | Pagination | Page-based for the notice table |

**Event Card Fields (Carousel)**

| Field | Source | Display |
|---|---|---|
| Status badge | Event status | [이벤트] tag |
| D-day badge | Calculated from end date | D-N / D-DAY / 마감 |
| Banner image | Event featured image | Card image |
| Title | Event title | Text |
| Date range | Event start_date – end_date | `YYYY.MM.DD-MM.DD` format |

### 5.2 All Ongoing Events (`/[locale]/events/ongoing`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVENT-05 | Category Sidebar | Filter by category: 전체이벤트 (All), 신규오픈 (New Opening), 마감임박 (Closing Soon), 쿠폰혜택 (Coupon), 당첨자발표 (Winner Announcement). State in URL `?category=` |
| F-EVENT-06 | Hero Event Banner | Carousel of featured/highlighted events at the top |
| F-EVENT-07 | Event Grid | 3-column grid of event cards with status badge, D-day badge, image, title, date, views, likes |
| F-EVENT-08 | Sort Options | Latest (최신순, default), Popular (인기순). State in URL `?sort=` |
| F-EVENT-09 | Pagination | Page-based |

### 5.3 Event Detail (`/[locale]/events/[id]`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVENT-10 | Breadcrumb | 이벤트 & 공지사항 > 진행중인 이벤트 > event title |
| F-EVENT-11 | Event Banner | Full-width banner with status badge + D-day countdown |
| F-EVENT-12 | Event Header | Title, author, date, view count, like count, comment count |
| F-EVENT-13 | Event Body | Rich text content with embedded images |
| F-EVENT-14 | Disclaimers | "이벤트 유의사항" section with bulleted rules |
| F-EVENT-15 | Like Button | Same pattern as Board (login required, one per user) |
| F-EVENT-16 | Back to List | "목록으로" returns to events/ongoing |
| F-EVENT-17 | Related Events | Grid of other ongoing events (2 max) |

### 5.4 Notice Detail (`/[locale]/events/notice/[id]`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVENT-18 | Notice Header | Title, date, view count |
| F-EVENT-19 | Notice Body | Rich text content with embedded images |
| F-EVENT-20 | Prev/Next Navigation | Links to previous and next notice posts (by date) |

**No comment section, no like button, no related posts on notices.**

### 5.5 D-Day Countdown Logic

| Condition | Display |
|---|---|
| Event end date > today | D-N (where N = days remaining) |
| Event end date = today | D-DAY |
| Event end date < today | 마감 (Closed) |

Countdown is calculated server-side using KST (Asia/Seoul), matching global date rules.

---

## 6. Shared Comment System

Board (§17) and Community (§18) share the same comment system. Features F-BOARD-18 through F-BOARD-21 define the canonical implementation. Community references these features directly.

**Comment constraints apply everywhere:**
- Login required
- 1–500 characters
- Nested replies: 1 level deep
- Same validation errors

---

## 7. Navigation Updates

### 7.1 Sub-Navigation Bar

A shared sub-nav bar appears on Board and Community pages (defined in §3.4).

### 7.2 Main Navigation

The existing FSD §15.2 Navigation Menu should be updated to include links to:
- Board (shop recommendation as default entry point)
- Community
- Events & Notices

### 7.3 Page List Update

Add rows 16–24 to the FSD §2 Page List table.

---

## 8. Glossary Additions

New terms to add:

| Term (EN) | Term (KO) | Context | Avoid |
|---|---|---|---|
| Board | 게시판 | Admin-curated content boards (shop recommendations, massage info) | 보드 |
| Community | 커뮤니티 | User-generated social feed for sharing massage experiences | 소셜, 피드 |
| Event | 이벤트 | Time-limited promotional campaign managed by admins | 행사, 프로모션 |
| Notice | 공지사항 | Admin-published announcement or policy update | 알림, 통지 |
| User Level | 사용자 레벨 | Gamification tier (Lv.1–Lv.5) derived from accumulated points | 등급, 랭크 |
| Points | 포인트 | Gamification currency earned from community actions | 점수, 마일리지 |

---

## 9. Error Codes (Appendix A Additions)

| Code | Korean | English |
|---|---|---|
| ERR_COMMENT_EMPTY | 댓글을 입력해주세요. | Please enter a comment. |
| ERR_COMMENT_LENGTH | 댓글은 500자 이하로 작성해주세요. | Comments must be 500 characters or less. |
| ERR_POST_EMPTY | 내용을 입력해주세요. | Please enter content. |
| ERR_POST_LENGTH | 내용은 2,000자 이하로 작성해주세요. | Content must be 2,000 characters or less. |
| ERR_PHOTO_LIMIT | 사진은 최대 5장까지 업로드할 수 있습니다. | You can upload up to 5 photos. |
| ERR_VIDEO_TOO_LARGE | 동영상 크기가 50MB를 초과합니다. | Video size exceeds 50MB. |
| ERR_INVALID_VIDEO_TYPE | 지원하지 않는 동영상 형식입니다. MP4, MOV만 가능합니다. | Unsupported video format. Only MP4 and MOV are allowed. |
| ERR_HASHTAG_LIMIT | 해시태그는 최대 10개까지 가능합니다. | You can add up to 10 hashtags. |

Note: ERR_FILE_TOO_LARGE and ERR_INVALID_FILE_TYPE (from My Page §16) are reused for community photo uploads.

---

## 10. Conflict Resolution Log Updates

| # | Current | Updated |
|---|---|---|
| C-10 | Review points (500P) — **Excluded from MVP** | **Partially included** — Community points system is in MVP, but review points remain excluded. Points are earned from community actions only. |
| C-12 | User level/points — **Excluded from MVP** | **Included in MVP (revised)** — User levels (Lv.1–Lv.5) and points system included for Community. |
