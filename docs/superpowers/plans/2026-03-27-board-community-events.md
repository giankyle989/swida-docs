# Board, Community & Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add FSD §17 (Board System), §18 (Community with gamification), §19 (Events & Notices) to the Customer Web FSD in both EN and KO, plus update page lists, navigation, error codes, glossary, and UIUX conflict resolution log.

**Architecture:** Documentation-only. Three new FSD sections are inserted after §16 My Page, before Appendix A. Each section mirrors the established FSD format (feature tables with Feature IDs, input constraints, server validation errors). KO files mirror EN with translated prose, identical Feature IDs and routes. UIUX §7/§8/§9 already exist — no UIUX additions needed, only conflict log updates.

**Tech Stack:** Markdown (Docusaurus v3)

---

## File Map

| File | Action | What Changes |
|---|---|---|
| `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` | Modify | Add §17, §18, §19; update §1.2 MVP scope, §2 Page List, §15 Nav, Appendix A |
| `docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md` | Modify | Mirror all EN FSD changes in Korean |
| `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_EN.md` | Modify | Update §14 Conflict Resolution Log (C-10, C-12) |
| `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_KO.md` | Modify | Mirror conflict log updates |
| `docs/swida/glossary.md` | Modify | Add Board, Community, Event, Notice, User Level, Points terms |

---

### Task 1: Update FSD MVP Scope & Page List (EN)

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` (§1.2 and §2)

- [ ] **Step 1: Update MVP scope table at §1.2**

Add to the "Included" column (after existing rows):

```
| Board System (shop recommendations, info posts) | Board: user-created posts |
| Board comments with nested replies | Board: keyword search |
| Community posts with photos/video | Community: post editing/deletion |
| Community user levels & points | Community: reporting posts |
| Community feed filters | Community: points redemption |
| Events & Notices hub + detail pages | Events: registration/signup |
| Event D-day countdown + category filtering | Events: coupon issuance |
| Notices with prev/next navigation | Events: push notifications |
```

Note: Some "Not Included" items fill the right column of new rows. Where no right-column item pairs, leave the right cell empty.

- [ ] **Step 2: Add 9 new rows to §2 Page List table**

Add after row 15 (Edit Profile):

```markdown
| 16 | Shop Recommendation Board | `/[locale]/board/recommendation` | Public | Editorial shop recommendation posts |
| 17 | Massage Info Board | `/[locale]/board/info` | Public | Forum-style info articles |
| 18 | Board Post Detail | `/[locale]/board/[type]/[id]` | Public | Individual board post with comments |
| 19 | Community Feed | `/[locale]/community` | Public | Social feed with user-generated posts |
| 20 | Community Post Detail | `/[locale]/community/[id]` | Public | Individual community post |
| 21 | Events & Notices Hub | `/[locale]/events` | Public | Combined notices + events landing |
| 22 | All Ongoing Events | `/[locale]/events/ongoing` | Public | Filterable event grid |
| 23 | Event Detail | `/[locale]/events/[id]` | Public | Individual event page |
| 24 | Notice Detail | `/[locale]/events/notice/[id]` | Public | Individual notice page |
```

- [ ] **Step 3: Update Access Control table**

The existing Access Control table needs an update for Community post creation:

In the "Logged in (active)" row, update "Accessible Pages" to include "+ community post creation + commenting".
In the "Not logged in" row, update "Restricted Action Behavior" to add: "Community post creation / commenting → redirect to login."
In the "Locked/suspended" row, add: "Community post creation / commenting → error message."

- [ ] **Step 4: Verify changes**

Read back §1.2, §2, and Access Control to confirm formatting.

- [ ] **Step 5: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md
git commit -m "docs(fsd): add Board, Community, Events to MVP scope and page list (EN)"
```

---

### Task 2: Add FSD §17 Board System (EN)

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` (add §17 after §16)

- [ ] **Step 1: Insert §17 after §16 My Page, before Appendix A**

Find the `---` separator between §16 (which ends with the Bookmark API section around line 758) and `## Appendix A. Error Message Guide`. Insert the following BETWEEN them:

```markdown
---

## 17. Board System

> UIUX Reference: §7 Pages — Board System

### 17.1 Shop Recommendation Board (`/[locale]/board/recommendation`)

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

### 17.2 Massage Info Board (`/[locale]/board/info`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-BOARD-05 | Post List | Forum-style list layout (no image cards), paginated |
| F-BOARD-06 | Sort Options | Latest (최신순, default), Popular (인기순), Most Commented (댓글많은순). Sort state in URL `?sort=` |
| F-BOARD-07 | Category Badge | Each post displays a category badge (e.g., [실전팁]) |
| F-BOARD-08 | Post Metadata | Each post shows: author, views, likes, comments count, date |
| F-BOARD-09 | HOT Badge | Posts exceeding a threshold (admin-configurable) display a 🔥HOT indicator |

### 17.3 Board Post Detail (`/[locale]/board/[type]/[id]`)

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

### 17.4 Comment System

Shared comment system used by Board (§17) and Community (§18).

**Feature List**

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

### 17.5 Sub-Navigation

Shared sub-nav bar across Board and Community pages:

| Tab | Label (KO) | Label (EN) | Route |
|---|---|---|---|
| Shop Recommendations | 샵추천 | Shop Picks | `/[locale]/board/recommendation` |
| Massage Info | 마사지정보 | Massage Info | `/[locale]/board/info` |
| Community | 커뮤니티 | Community | `/[locale]/community` |

Active tab is determined by current route.
```

- [ ] **Step 2: Verify formatting**

Read back the new §17 section.

- [ ] **Step 3: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md
git commit -m "docs(fsd): add §17 Board System with comments, sub-nav (EN)"
```

---

### Task 3: Add FSD §18 Community (EN)

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` (add §18 after §17)

- [ ] **Step 1: Insert §18 after §17, before Appendix A**

```markdown
---

## 18. Community

> UIUX Reference: §8 Pages — Community

### 18.1 Community Feed (`/[locale]/community`)

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

### 18.2 Community Post Detail (`/[locale]/community/[id]`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-COMM-08 | Post Content | Full post text, photos, video, hashtags |
| F-COMM-09 | Author Info | Profile photo, display name, level badge |
| F-COMM-10 | Like Button | Like counter. Login required. One like per user per post. |
| F-COMM-11 | Comment Section | Same comment system as Board (§17.4, F-BOARD-18 through F-BOARD-21) |
| F-COMM-12 | User Profile Sidebar | Same as feed (desktop only) |
| F-COMM-13 | Popular Shops Sidebar | Same as feed (desktop only) |

### 18.3 User Levels & Points

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
```

- [ ] **Step 2: Verify formatting**

Read back the new §18 section.

- [ ] **Step 3: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md
git commit -m "docs(fsd): add §18 Community with gamification (EN)"
```

---

### Task 4: Add FSD §19 Events & Notices (EN)

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` (add §19 after §18)

- [ ] **Step 1: Insert §19 after §18, before Appendix A**

```markdown
---

## 19. Events & Notices

> UIUX Reference: §9 Pages — Events & Notices

### 19.1 Events & Notices Hub (`/[locale]/events`)

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

### 19.2 All Ongoing Events (`/[locale]/events/ongoing`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVENT-05 | Category Sidebar | Filter by category: 전체이벤트 (All), 신규오픈 (New Opening), 마감임박 (Closing Soon), 쿠폰혜택 (Coupon), 당첨자발표 (Winner Announcement). State in URL `?category=` |
| F-EVENT-06 | Hero Event Banner | Carousel of featured/highlighted events at the top |
| F-EVENT-07 | Event Grid | 3-column grid of event cards with status badge, D-day badge, image, title, date, views, likes |
| F-EVENT-08 | Sort Options | Latest (최신순, default), Popular (인기순). State in URL `?sort=` |
| F-EVENT-09 | Pagination | Page-based |

### 19.3 Event Detail (`/[locale]/events/[id]`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVENT-10 | Breadcrumb | 이벤트 & 공지사항 > 진행중인 이벤트 > event title |
| F-EVENT-11 | Event Banner | Full-width banner with status badge + D-day countdown |
| F-EVENT-12 | Event Header | Title, author, date, view count, like count, comment count |
| F-EVENT-13 | Event Body | Rich text content with embedded images |
| F-EVENT-14 | Disclaimers | "이벤트 유의사항" section with bulleted rules |
| F-EVENT-15 | Like Button | Same pattern as Board (§17.3 F-BOARD-14). Login required, one per user. |
| F-EVENT-16 | Back to List | "목록으로" returns to `/[locale]/events/ongoing` |
| F-EVENT-17 | Related Events | Grid of other ongoing events (2 max) |

### 19.4 Notice Detail (`/[locale]/events/notice/[id]`)

**Feature List**

| # | Feature | Description |
|---|---|---|
| F-EVENT-18 | Notice Header | Title, date, view count |
| F-EVENT-19 | Notice Body | Rich text content with embedded images |
| F-EVENT-20 | Prev/Next Navigation | Links to previous and next notice posts (by date). Display: title + date for each. |

No comment section, no like button, no related posts on notices.

### 19.5 D-Day Countdown Logic

| Condition | Display |
|---|---|
| Event end date > today | D-N (where N = days remaining) |
| Event end date = today | D-DAY |
| Event end date < today | 마감 (Closed) |

Countdown is calculated server-side using KST (Asia/Seoul), matching global date rules (§1.3).
```

- [ ] **Step 2: Verify formatting**

Read back the new §19 section.

- [ ] **Step 3: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md
git commit -m "docs(fsd): add §19 Events & Notices with D-day logic (EN)"
```

---

### Task 5: Update FSD Navigation & Appendix (EN)

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` (§15 and Appendix A)

- [ ] **Step 1: Add nav links to §15.2 Navigation Menu**

Find §15.2 Navigation Menu table (F-NAV-05 through F-NAV-10). Add three new rows after F-NAV-10:

```markdown
| F-NAV-15 | Board | Link to `/[locale]/board/recommendation` (PRD §7.1) |
| F-NAV-16 | Community | Link to `/[locale]/community` (PRD §7.1) |
| F-NAV-17 | Events & Notices | Link to `/[locale]/events` (PRD §7.1) |
```

- [ ] **Step 2: Add error codes to Appendix A**

Find Appendix A error message table. Add these rows at the end (after the existing ERR_BOOKMARK_FAILED row):

```markdown
| ERR_COMMENT_EMPTY | 댓글을 입력해주세요. | Please enter a comment. |
| ERR_COMMENT_LENGTH | 댓글은 500자 이하로 작성해주세요. | Comments must be 500 characters or less. |
| ERR_POST_EMPTY | 내용을 입력해주세요. | Please enter content. |
| ERR_POST_LENGTH | 내용은 2,000자 이하로 작성해주세요. | Content must be 2,000 characters or less. |
| ERR_PHOTO_LIMIT | 사진은 최대 5장까지 업로드할 수 있습니다. | You can upload up to 5 photos. |
| ERR_VIDEO_TOO_LARGE | 동영상 크기가 50MB를 초과합니다. | Video size exceeds 50MB. |
| ERR_INVALID_VIDEO_TYPE | 지원하지 않는 동영상 형식입니다. MP4, MOV만 가능합니다. | Unsupported video format. Only MP4 and MOV are allowed. |
| ERR_HASHTAG_LIMIT | 해시태그는 최대 10개까지 가능합니다. | You can add up to 10 hashtags. |
```

Note: ERR_FILE_TOO_LARGE and ERR_INVALID_FILE_TYPE already exist from My Page — reused for community photo uploads.

- [ ] **Step 3: Verify changes**

Read back §15.2 and Appendix A.

- [ ] **Step 4: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md
git commit -m "docs(fsd): add Board/Community/Events nav links and error codes (EN)"
```

---

### Task 6: Mirror All FSD Changes to KO

**Files:**
- Modify: `docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md`

- [ ] **Step 1: Read KO FSD to find equivalent sections**

Read §1.2 (MVP 범위), §2 (페이지 목록), Access Control, end of §16, §15.2, 부록 A.

- [ ] **Step 2: Update KO MVP scope table**

Mirror EN changes. Add Board/Community/Events items to 포함 column with Korean descriptions:

```
| 게시판 시스템 (업체 추천, 정보 게시글) | 게시판: 사용자 작성 게시글 |
| 게시판 댓글 및 대댓글 | 게시판: 키워드 검색 |
| 커뮤니티 게시글 (사진/동영상) | 커뮤니티: 게시글 수정/삭제 |
| 커뮤니티 사용자 레벨 & 포인트 | 커뮤니티: 게시글 신고 |
| 커뮤니티 피드 필터 | 커뮤니티: 포인트 사용 |
| 이벤트 & 공지사항 허브 + 상세 페이지 | 이벤트: 참가 신청 |
| 이벤트 D-day 카운트다운 + 카테고리 필터 | 이벤트: 쿠폰 발행 |
| 공지사항 이전/다음 내비게이션 | 이벤트: 푸시 알림 |
```

- [ ] **Step 3: Update KO Page List table**

Add 9 rows (16–24) with Korean translations:

```markdown
| 16 | 업체 추천 게시판 | `/[locale]/board/recommendation` | 공개 | 에디터 추천 업체 게시글 |
| 17 | 마사지 정보 게시판 | `/[locale]/board/info` | 공개 | 포럼 형식 정보 게시글 |
| 18 | 게시판 게시글 상세 | `/[locale]/board/[type]/[id]` | 공개 | 개별 게시판 게시글 (댓글 포함) |
| 19 | 커뮤니티 피드 | `/[locale]/community` | 공개 | 사용자 생성 콘텐츠 소셜 피드 |
| 20 | 커뮤니티 게시글 상세 | `/[locale]/community/[id]` | 공개 | 개별 커뮤니티 게시글 |
| 21 | 이벤트 & 공지사항 허브 | `/[locale]/events` | 공개 | 공지사항 + 이벤트 통합 랜딩 |
| 22 | 진행중인 이벤트 전체 | `/[locale]/events/ongoing` | 공개 | 필터 가능한 이벤트 그리드 |
| 23 | 이벤트 상세 | `/[locale]/events/[id]` | 공개 | 개별 이벤트 페이지 |
| 24 | 공지사항 상세 | `/[locale]/events/notice/[id]` | 공개 | 개별 공지사항 페이지 |
```

- [ ] **Step 4: Update KO Access Control table**

Mirror EN access control updates for community posting/commenting.

- [ ] **Step 5: Add §17 게시판 시스템 in KO**

Translate full §17 from EN. Keep all Feature IDs (F-BOARD-01 through F-BOARD-21) identical. Section title: `## 17. 게시판 시스템`. Subsections:
- 17.1 업체 추천 게시판
- 17.2 마사지 정보 게시판
- 17.3 게시판 게시글 상세
- 17.4 댓글 시스템
- 17.5 서브 내비게이션

Full Korean translation of all feature descriptions, table headers, error messages. Routes and Feature IDs stay in English/alphanumeric.

- [ ] **Step 6: Add §18 커뮤니티 in KO**

Translate full §18 from EN. Keep all Feature IDs (F-COMM-01 through F-COMM-13) identical. Section title: `## 18. 커뮤니티`. Subsections:
- 18.1 커뮤니티 피드
- 18.2 커뮤니티 게시글 상세
- 18.3 사용자 레벨 & 포인트

Full Korean translation. Error messages already contain both KO and EN strings — keep both.

- [ ] **Step 7: Add §19 이벤트 & 공지사항 in KO**

Translate full §19 from EN. Keep all Feature IDs (F-EVENT-01 through F-EVENT-20) identical. Section title: `## 19. 이벤트 & 공지사항`. Subsections:
- 19.1 이벤트 & 공지사항 허브
- 19.2 진행중인 이벤트 전체
- 19.3 이벤트 상세
- 19.4 공지사항 상세
- 19.5 D-Day 카운트다운 로직

- [ ] **Step 8: Update KO §15.2 nav and 부록 A**

Add F-NAV-15 (게시판), F-NAV-16 (커뮤니티), F-NAV-17 (이벤트 & 공지사항) to §15.2.
Add 8 error codes to 부록 A (same codes, matching EN).

- [ ] **Step 9: Verify changes**

Spot-check Feature IDs, routes, and table structures match EN.

- [ ] **Step 10: Commit**

```bash
git add docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md
git commit -m "docs(fsd): add §17-§19 게시판/커뮤니티/이벤트 and related updates (KO)"
```

---

### Task 7: Update UIUX Conflict Resolution Log (EN + KO)

**Files:**
- Modify: `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_EN.md` (§14)
- Modify: `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_KO.md` (§14)

- [ ] **Step 1: Update C-10 and C-12 in EN UIUX**

Find §14 Conflict Resolution Log. Find and update these rows:

C-10 currently:
```
| C-10 | Review points (500P) | Review success modal shows points | Not in PRD/FSD | **Excluded from MVP** | Point system is future scope |
```
Replace with:
```
| C-10 | Review points (500P) | Review success modal shows points | Not in PRD/FSD | **Partially included** | Community points system in MVP (FSD §18.3), but review-specific points remain excluded. |
```

C-12 currently:
```
| C-12 | User level/points | Lv.3, 보유 포인트 3200P | Not in PRD customer model | **Excluded from MVP** | Gamification is future scope |
```
Replace with:
```
| C-12 | User level/points | Lv.3, 보유 포인트 3200P | Not in PRD customer model | **Included in MVP (revised)** | User levels (Lv.1–Lv.5) and points system included for Community (FSD §18.3). |
```

- [ ] **Step 2: Update C-10 and C-12 in KO UIUX**

C-10 currently:
```
| C-10 | 리뷰 포인트 (500P) | 리뷰 성공 모달에 포인트 표시 | PRD/FSD에 없음 | **MVP에서 제외** | 포인트 시스템은 향후 범위 |
```
Replace with:
```
| C-10 | 리뷰 포인트 (500P) | 리뷰 성공 모달에 포인트 표시 | PRD/FSD에 없음 | **부분 포함** | 커뮤니티 포인트 시스템은 MVP에 포함 (FSD §18.3), 리뷰 관련 포인트는 제외 유지. |
```

C-12 currently:
```
| C-12 | 사용자 레벨/포인트 | Lv.3, 보유 포인트 3200P | PRD 고객 모델에 없음 | **MVP에서 제외** | 게이미피케이션은 향후 범위 |
```
Replace with:
```
| C-12 | 사용자 레벨/포인트 | Lv.3, 보유 포인트 3200P | PRD 고객 모델에 없음 | **MVP에 포함 (수정됨)** | 커뮤니티를 위해 사용자 레벨 (Lv.1–Lv.5) 및 포인트 시스템 포함 (FSD §18.3). |
```

- [ ] **Step 3: Verify changes**

Read back both conflict log updates.

- [ ] **Step 4: Commit**

```bash
git add docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_EN.md docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_KO.md
git commit -m "docs(uiux): update conflict log C-10, C-12 for Community gamification (EN+KO)"
```

---

### Task 8: Update Glossary

**Files:**
- Modify: `docs/swida/glossary.md`

- [ ] **Step 1: Read current glossary**

Read `docs/swida/glossary.md` to find insertion points (alphabetical order).

- [ ] **Step 2: Add new terms**

Add these rows in alphabetical order within the existing table:

```markdown
| Board | 게시판 | Admin-curated content boards (shop recommendations, massage info) | 보드 |
| Community | 커뮤니티 | User-generated social feed for sharing massage experiences | 소셜, 피드 |
| Event | 이벤트 | Time-limited promotional campaign managed by admins | 행사, 프로모션 |
| Notice | 공지사항 | Admin-published announcement or policy update | 알림, 통지 |
| Points | 포인트 | Gamification currency earned from community actions (display-only in MVP) | 점수, 마일리지 |
| User Level | 사용자 레벨 | Gamification tier (Lv.1–Lv.5) derived from accumulated points | 등급, 랭크 |
```

- [ ] **Step 3: Verify alphabetical order**

Read back the glossary to confirm ordering.

- [ ] **Step 4: Commit**

```bash
git add docs/swida/glossary.md
git commit -m "docs: add Board, Community, Event, Notice, Points, User Level to glossary"
```

---

### Task 9: Run /docs-review

- [ ] **Step 1: Run docs-review on all changed files**

Run `/docs-review` targeting:
- `docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md`
- `docs/swida/fsd/SWIDA_FSD_Customer_Web_KO.md`
- `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_EN.md`
- `docs/swida/uiux/SWIDA_UIUX_Spec_Customer_Web_KO.md`
- `docs/swida/glossary.md`

Focus review on: §17/§18/§19 content, EN/KO sync, Feature ID consistency, glossary term usage, cross-references between FSD and UIUX sections.

- [ ] **Step 2: Fix any issues found**

Address sync gaps, terminology issues, cross-reference conflicts, and formatting problems.

- [ ] **Step 3: Commit fixes if any**

```bash
git add docs/swida/
git commit -m "docs: address docs-review findings for Board/Community/Events additions"
```
