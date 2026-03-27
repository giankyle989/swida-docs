# PRD & TSD Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update PRD and TSD (EN + KO) to align with the new FSD §16–§19 features (My Page, Board, Community, Events & Notices).

**Architecture:** Documentation-only updates to 4 files. PRD gets 3 section updates (§3.3, §7.1, §12). TSD gets major additions: 8 new database table schemas, 7 API endpoint groups with full request/response shapes, frontend route/component additions, rendering strategy rows, and new lifecycle hooks. All changes are mirrored EN → KO.

**Tech Stack:** Markdown (Docusaurus v3)

---

## File Map

| File | Action | What Changes |
|---|---|---|
| `docs/swida/prd/SWIDA_PRD_EN.md` | Modify | §3.3 Customer capabilities, §7.1 nav menu, §12 future scope |
| `docs/swida/prd/SWIDA_PRD_KO.md` | Modify | Mirror all EN PRD changes |
| `docs/swida/tsd/SWIDA_TSD_EN.md` | Modify | §4.3 ERD, §4.4 tables, §4.5 indexes, §5.1 summary, §5.2 endpoints, §5.3 hooks, §5.6 admin, §6.1 routes, §6.2 rendering, §9 caching |
| `docs/swida/tsd/SWIDA_TSD_KO.md` | Modify | Mirror all EN TSD changes |

---

### Task 1: Update PRD §3.3, §7.1, §12 (EN)

**Files:**
- Modify: `docs/swida/prd/SWIDA_PRD_EN.md`

- [ ] **Step 1: Update §3.3 Customer capabilities**

Find §3.3 Customer (around line 95). In the **Capabilities** list, add these bullets after the existing ones (after "Use GPS-based nearby search..."):

```markdown
- Bookmark/save shops for quick access via a personal dashboard (My Page)
- View personal profile, submitted reviews, and bookmarked shops on My Page
- Update profile photo via Edit Profile page
- Create community posts with text, photos (max 5), video (max 1), and hashtags
- Comment on board posts and community posts (1-level nested replies)
- Like board posts, community posts, and events (one like per user per target)
- Earn points from community actions and progress through user levels (Lv.1–Lv.5)
- Browse admin-curated board content (shop recommendations, massage info)
- Browse platform events and notices
```

Update the **Authentication** line. Find the line that says:
"Required only for review submission."
Replace with:
"Required for review submission, review reporting, community posting, commenting, liking, and bookmarking."

- [ ] **Step 2: Update §7.1 Customer-Facing Menus**

Find §7.1 Customer-Facing Menus (around line 314). Add 4 rows to the existing navigation table after the "Partnership" row:

```markdown
| **Board** | 📋 | Admin-curated shop recommendations and massage info articles |
| **Community** | 💬 | User-generated social feed for sharing experiences |
| **Events & Notices** | 🎉 | Platform events, promotions, and announcements |
| **My Page** | 👤 | Personal dashboard — profile, reviews, bookmarks (logged-in only) |
```

- [ ] **Step 3: Update §12 Future Considerations**

Find §12 Future Considerations (around line 668).

Remove the "Bookmarks / Favorites" line (it's now in MVP).

Add after the existing list:

```markdown

> **Moved to MVP:** Bookmarks / Favorites is now included in the MVP scope (FSD §16 My Page).

**Remaining future scope for new features:**
- Community: post editing/deletion by users, post reporting, points redemption/spending
- Events: event registration/signup, coupon issuance from events
- Board: user-created posts, keyword search within board
```

- [ ] **Step 4: Verify changes**

Read back §3.3, §7.1, and §12 to confirm formatting.

- [ ] **Step 5: Commit**

```bash
git add docs/swida/prd/SWIDA_PRD_EN.md
git commit -m "docs(prd): update Customer capabilities, nav menu, future scope for new features (EN)"
```

---

### Task 2: Mirror PRD Changes to KO

**Files:**
- Modify: `docs/swida/prd/SWIDA_PRD_KO.md`

- [ ] **Step 1: Read KO PRD to find equivalent sections**

Find §3.3 고객 (Customer), §7.1 고객 메뉴, §12 향후 고려 사항 sections.

- [ ] **Step 2: Update §3.3 고객 capabilities**

Add Korean translations of the 9 new capability bullets:

```markdown
- 마이페이지를 통해 업체 북마크/저장하여 빠른 접근
- 마이페이지에서 개인 프로필, 작성한 리뷰, 북마크한 업체 확인
- 프로필 수정 페이지에서 프로필 사진 변경
- 텍스트, 사진 (최대 5장), 동영상 (최대 1개), 해시태그로 커뮤니티 게시글 작성
- 게시판 게시글 및 커뮤니티 게시글에 댓글 작성 (1단계 대댓글)
- 게시판 게시글, 커뮤니티 게시글, 이벤트에 좋아요 (사용자당 대상당 1회)
- 커뮤니티 활동으로 포인트 획득 및 사용자 레벨 (Lv.1–Lv.5) 진행
- 관리자 작성 게시판 콘텐츠 (업체 추천, 마사지 정보) 탐색
- 플랫폼 이벤트 및 공지사항 탐색
```

Update auth line to: "리뷰 작성, 리뷰 신고, 커뮤니티 게시글 작성, 댓글 작성, 좋아요, 북마크 시 필요"

- [ ] **Step 3: Update §7.1 고객 메뉴**

Add 4 rows:

```markdown
| **게시판** | 📋 | 관리자 작성 업체 추천 및 마사지 정보 게시글 |
| **커뮤니티** | 💬 | 사용자 생성 경험 공유 소셜 피드 |
| **이벤트 & 공지사항** | 🎉 | 플랫폼 이벤트, 프로모션, 공지사항 |
| **마이페이지** | 👤 | 개인 대시보드 — 프로필, 리뷰, 북마크 (로그인 전용) |
```

- [ ] **Step 4: Update §12 향후 고려 사항**

Remove "북마크 / 즐겨찾기" line. Add Korean translations of the future scope clarifications.

- [ ] **Step 5: Verify and commit**

```bash
git add docs/swida/prd/SWIDA_PRD_KO.md
git commit -m "docs(prd): update 고객 capabilities, nav menu, future scope (KO)"
```

---

### Task 3: Update TSD §4 Database Design (EN) — ERD, Tables, Indexes

**Files:**
- Modify: `docs/swida/tsd/SWIDA_TSD_EN.md` (§4.3, §4.4, §4.5)

This is the largest task. It adds 8 new table schemas, updates the ERD, extends the user model, and adds indexes.

- [ ] **Step 1: Update §4.3 ERD**

Find §4.3 Entity Relationship Diagram (line ~234). Replace the existing ASCII ERD with an expanded version that includes the new entities. The new ERD should show:

```
┌─────────┐     1:N     ┌───────────┐
│  Region │─────────────│  District  │
└─────────┘             └─────┬─────┘
                              │ 1:N
                        ┌─────▼─────┐      M:N     ┌─────────┐
                        │   Shop    │──────────────│  Theme  │
                        └──┬──┬─────┘              └─────────┘
                           │  │ 1:N
              ┌────────────┘  └──────────────┐
              │ 1:N                          │ M:N
        ┌─────▼─────┐               ┌───────▼───────┐
        │  Review   │               │ User Bookmark │
        └─────┬─────┘               └───────┬───────┘
              │ N:1                          │ N:1
        ┌─────▼─────────────┐────────────────┘
        │  User (customer)  │
        └──┬──┬──┬──────────┘
           │  │  │ 1:N
   ┌───────┘  │  └───────────────┐
   │ 1:N      │ 1:N              │ 1:N
┌──▼──────┐ ┌─▼──────┐  ┌───────▼──────┐
│Community│ │Comment │  │  Post Like   │
│  Post   │ │(poly)  │  │  (poly)      │
└─────────┘ └────────┘  └──────────────┘

Comment targets (polymorphic):
  Board Post, Community Post, Event

Post Like targets (polymorphic):
  Board Post, Community Post, Event

┌──────────────┐     ┌──────────────┐
│  Board Post  │     │    Event     │
│ (admin)      │     │  (admin)     │
└──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────────┐
│    Notice    │     │ User Points Log  │
│ (admin)      │     │                  │
└──────────────┘     └──────────────────┘

┌───────────────────────┐
│  Partnership Inquiry  │ ──(optional)──→ Shop
└───────────────────────┘

┌───────────────────────┐
│      Audit Log        │
└───────────────────────┘
```

- [ ] **Step 2: Add §4.4.8 through §4.4.15**

Insert after §4.4.7 `audit_logs` (around line 400) and before §4.5 Indexes. Add all 8 new table schemas exactly as defined in the design spec §3.2:

- §4.4.8 `board_posts`
- §4.4.9 `community_posts`
- §4.4.10 `comments`
- §4.4.11 `events`
- §4.4.12 `notices`
- §4.4.13 `user_bookmarks`
- §4.4.14 `user_points_log`
- §4.4.15 `post_likes`

Also add a note after §4.4.7 about extending the `up_users` table:

```markdown
#### Extending `up_users` (Strapi Users & Permissions)

Additional fields on the existing Strapi user model:

| Column | Type | Constraints | Notes |
|---|---|---|---|
| avatar | relation | Nullable | Strapi media (single). Profile photo. Max 5MB, JPG/PNG/WebP. |
| total_points | integer | Not Null, Default 0 | Computed: SUM of user_points_log.points. Updated via lifecycle hook. |

**Level derivation (computed, not stored):**
- 0P → Lv.1, 500P → Lv.2, 2,000P → Lv.3, 5,000P → Lv.4, 10,000P → Lv.5

Existing fields reused: `username` (display name), `email`, `created_at` (member since).
```

The full table schemas are defined in the design spec at `docs/superpowers/specs/2026-03-27-prd-tsd-alignment-design.md` §3.2. Copy them verbatim — each table needs the full column definitions (Column, Type, Constraints, Notes), relations, and any constraint notes.

- [ ] **Step 3: Add indexes to §4.5**

Find §4.5 Indexes (line ~402). Add the 14 new indexes from the design spec §3.4 to the existing index table.

- [ ] **Step 4: Verify formatting**

Read back §4.3, the new §4.4.8–§4.4.15, and §4.5 to confirm all tables render correctly.

- [ ] **Step 5: Commit**

```bash
git add docs/swida/tsd/SWIDA_TSD_EN.md
git commit -m "docs(tsd): add 8 new DB schemas, extend user model, add indexes (EN)"
```

---

### Task 4: Update TSD §5 API Endpoints & Hooks (EN)

**Files:**
- Modify: `docs/swida/tsd/SWIDA_TSD_EN.md` (§5.1, §5.2, §5.3, §5.6)

- [ ] **Step 1: Update §5.1 Content Type Summary**

Find §5.1 Content Type Summary (line ~438). Add 8 rows to the existing summary table:

```markdown
| board_post | Collection | Yes | Yes | Admin-curated board posts |
| community_post | Collection | No | No | User-generated (auto-published) |
| comment | Collection | No | No | Shared polymorphic comments |
| event | Collection | Yes | Yes | Admin-managed events |
| notice | Collection | Yes | Yes | Admin announcements |
| user_bookmark | Collection | No | No | User ↔ Shop junction |
| user_points_log | Collection | No | No | Point transactions |
| post_like | Collection | No | No | Like junction |
```

- [ ] **Step 2: Add §5.2.6 through §5.2.12**

Insert after §5.2.5 Dashboard Analytics (ends around line 640) and before §5.3. Add all 7 endpoint groups with full request/response shapes as defined in the design spec §4.2:

- §5.2.6 Board Posts (GET list + GET detail with query params and response JSON)
- §5.2.7 Community Posts (GET list + GET detail + POST create with request/response JSON)
- §5.2.8 Comments (GET list + POST create with polymorphic filtering, response JSON with nested replies)
- §5.2.9 Events & Notices (GET events list + GET event detail + GET notices list + GET notice detail with prev/next)
- §5.2.10 Bookmarks (GET list + POST + DELETE with response JSON, 409 on duplicate)
- §5.2.11 Likes (POST + DELETE with polymorphic target, points trigger)
- §5.2.12 User Profile (GET me + PUT avatar + DELETE avatar)

Each endpoint group must include: method/endpoint/auth table, query parameters (where applicable), and full JSON response/request shapes. Copy verbatim from design spec §4.2.

- [ ] **Step 3: Add §5.3.5 through §5.3.9**

Insert after §5.3.4 Lifecycle Hooks: Audit Log (around line 710). Add:

- §5.3.5 Lifecycle Hooks: Comment Count Recalculation
- §5.3.6 Lifecycle Hooks: Like Count Recalculation
- §5.3.7 Lifecycle Hooks: Points Calculation (with daily limit logic)
- §5.3.8 Custom Controller: View Count Increment
- §5.3.9 Custom Controller: Notice Prev/Next

Each hook/controller section should describe: trigger event, what it does, and any business rules (e.g., 10 comment points/day limit).

- [ ] **Step 4: Update §5.6 Admin Web Features**

Find §5.6 Admin Web Features (line ~736). Add to the existing admin features table:

```markdown
| **Board Posts** | CRUD interface for board posts with type filter, featured toggle, HOT badge management |
| **Events** | CRUD for events with date pickers, category, featured toggle |
| **Notices** | CRUD for notices with important/pinned toggle |
| **Community Moderation** | View, hide, or delete community posts. View user activity. |
| **User Points** | View user point history and current levels (read-only) |
```

- [ ] **Step 5: Verify formatting**

Read back §5.1, §5.2.6–§5.2.12, §5.3.5–§5.3.9, and §5.6 to confirm.

- [ ] **Step 6: Commit**

```bash
git add docs/swida/tsd/SWIDA_TSD_EN.md
git commit -m "docs(tsd): add API endpoints, lifecycle hooks, admin features (EN)"
```

---

### Task 5: Update TSD §6 Frontend & §9 Caching (EN)

**Files:**
- Modify: `docs/swida/tsd/SWIDA_TSD_EN.md` (§6.1, §6.2, §9)

- [ ] **Step 1: Update §6.1 Project Structure**

Find §6.1 Project Structure (line ~758). In the `app/[locale]/` directory tree, add the new route directories after the existing `auth/` directory:

```
        ├── mypage/
        │   ├── page.tsx              # My Page dashboard (CSR)
        │   └── edit/
        │       └── page.tsx          # Edit profile (CSR)
        ├── board/
        │   ├── recommendation/
        │   │   └── page.tsx          # Shop recommendation board (SSR)
        │   ├── info/
        │   │   └── page.tsx          # Massage info board (SSR)
        │   └── [type]/
        │       └── [id]/
        │           └── page.tsx      # Board post detail (ISR)
        ├── community/
        │   ├── page.tsx              # Community feed (SSR)
        │   └── [id]/
        │       └── page.tsx          # Community post detail (SSR)
        └── events/
            ├── page.tsx              # Events & notices hub (ISR)
            ├── ongoing/
            │   └── page.tsx          # All ongoing events (SSR)
            ├── [id]/
            │   └── page.tsx          # Event detail (ISR)
            └── notice/
                └── [id]/
                    └── page.tsx      # Notice detail (SSG)
```

In the `components/` directory tree, add new component directories:

```
    ├── board/
    │   ├── BoardPostCard.tsx
    │   ├── BoardPostList.tsx
    │   ├── BoardSubNav.tsx
    │   └── RegionFilter.tsx
    ├── community/
    │   ├── CommunityPostCard.tsx
    │   ├── CommunityPostForm.tsx
    │   ├── ProfileSidebar.tsx
    │   └── PopularShopsSidebar.tsx
    ├── events/
    │   ├── EventCard.tsx
    │   ├── NoticeCard.tsx
    │   ├── DdayBadge.tsx
    │   └── CategorySidebar.tsx
    ├── mypage/
    │   ├── ProfileCard.tsx
    │   ├── MyReviewList.tsx
    │   ├── BookmarkGrid.tsx
    │   └── TabNav.tsx
    └── shared/
        ├── CommentSection.tsx
        ├── CommentInput.tsx
        └── LikeButton.tsx
```

In the `lib/api/` directory, add new modules:

```
    │   ├── board.ts
    │   ├── community.ts
    │   ├── events.ts
    │   ├── bookmarks.ts
    │   ├── likes.ts
    │   └── profile.ts
```

- [ ] **Step 2: Update §6.2 Rendering Strategy**

Find §6.2 Rendering Strategy (line ~851). Add 11 rows to the existing rendering strategy table:

```markdown
| My Page | CSR | N/A | Auth-required, personalized, no SEO value |
| Edit Profile | CSR | N/A | Auth-required form |
| Board Recommendation | SSR | N/A | Dynamic region filtering |
| Board Info | SSR | N/A | Dynamic sorting |
| Board Post Detail | ISR | 60s | Content stable, comments dynamic via client |
| Community Feed | SSR | N/A | Highly dynamic user content |
| Community Post Detail | SSR | N/A | Dynamic comments/likes |
| Events Hub | ISR | 300s (5 min) | Mixed static notices + time-sensitive events |
| Ongoing Events | SSR | N/A | Dynamic category filtering/sorting |
| Event Detail | ISR | 60s | Content stable, D-day needs freshness |
| Notice Detail | SSG | On-demand (webhook) | Static admin content |
```

- [ ] **Step 3: Update §9 Caching Strategy**

Find §9.2 Cache Invalidation. Add webhook triggers for new content types. If there's a table or list of webhook triggers, add:

```markdown
**Additional webhook triggers for new content types:**

| Content Type | Webhook Event | Revalidation Target |
|---|---|---|
| board_post | publish, update, unpublish | Board list pages, post detail |
| event | publish, update, unpublish | Events hub, ongoing events, event detail |
| notice | publish, update, unpublish | Events hub, notice detail |

Community posts and comments are SSR (no cache), so no webhook revalidation needed. Bookmark and like operations are user-specific CSR calls — no cache implications.
```

- [ ] **Step 4: Verify formatting**

Read back §6.1, §6.2, and §9 to confirm.

- [ ] **Step 5: Commit**

```bash
git add docs/swida/tsd/SWIDA_TSD_EN.md
git commit -m "docs(tsd): add frontend routes, rendering strategy, caching for new features (EN)"
```

---

### Task 6: Mirror All TSD Changes to KO

**Files:**
- Modify: `docs/swida/tsd/SWIDA_TSD_KO.md`

- [ ] **Step 1: Read KO TSD to find equivalent sections**

Find §4.3 (ERD), §4.4 (tables, ending at §4.4.7), §4.5 (indexes), §5.1 (content type summary), §5.2 (endpoints, ending at §5.2.5), §5.3 (hooks, ending at §5.3.4), §5.6 (admin), §6.1 (project structure), §6.2 (rendering), §9 (caching).

- [ ] **Step 2: Mirror §4.3 ERD update**

Replace the KO ERD with the same expanded ASCII diagram. ERD is language-neutral (entity names stay in English).

- [ ] **Step 3: Mirror §4.4 new table schemas**

Add §4.4.8 through §4.4.15 and the `up_users` extension. Table schemas are largely language-neutral (column names, types, constraints stay in English). Translate only:
- Section titles (e.g., "#### §4.4.8 `board_posts`" stays, but the prose description is translated)
- "Notes" column descriptions to Korean
- Constraint explanations to Korean

- [ ] **Step 4: Mirror §4.5 index additions**

Add the same 14 indexes. Table content is language-neutral; translate only the "Purpose" column.

- [ ] **Step 5: Mirror §5.1 content type summary**

Add the same 8 rows. "Notes" column translated to Korean.

- [ ] **Step 6: Mirror §5.2.6–§5.2.12 API endpoints**

Add all 7 endpoint groups. API paths, methods, JSON shapes stay in English. Translate:
- Section descriptions/prose
- "Description" column in endpoint tables
- Auth column values can stay in English ("Public", "Customer (JWT)")

- [ ] **Step 7: Mirror §5.3.5–§5.3.9 hooks and controllers**

Add the 5 new hook/controller sections. Translate prose descriptions.

- [ ] **Step 8: Mirror §5.6 admin features**

Add 5 new admin feature rows with Korean descriptions.

- [ ] **Step 9: Mirror §6.1 routes, §6.2 rendering, §9 caching**

Add the same route directories, component directories, API modules, rendering strategy rows, and caching webhook table. Code/paths stay in English; "Rationale" column and prose translated.

- [ ] **Step 10: Verify formatting**

Spot-check that table structures, code blocks, and section numbering match EN.

- [ ] **Step 11: Commit**

```bash
git add docs/swida/tsd/SWIDA_TSD_KO.md
git commit -m "docs(tsd): mirror all EN changes — DB schemas, APIs, frontend, caching (KO)"
```

---

### Task 7: Mirror PRD Changes to KO (if not already done in Task 2)

This task is Task 2. If Task 2 was completed, skip this task.

---

### Task 8: Run /docs-review

- [ ] **Step 1: Run docs-review on all changed files**

Run `/docs-review` targeting:
- `docs/swida/prd/SWIDA_PRD_EN.md`
- `docs/swida/prd/SWIDA_PRD_KO.md`
- `docs/swida/tsd/SWIDA_TSD_EN.md`
- `docs/swida/tsd/SWIDA_TSD_KO.md`

Focus on: EN/KO sync for new sections, table name consistency with FSD (Feature IDs like F-BOARD, F-COMM, F-EVENT should NOT appear in PRD/TSD — those are FSD-only), API endpoint paths matching FSD §16.3 bookmark API, column names matching across schemas and API responses.

- [ ] **Step 2: Fix any issues found**

Address sync gaps, terminology issues, cross-reference conflicts.

- [ ] **Step 3: Commit fixes if any**

```bash
git add docs/swida/prd/ docs/swida/tsd/
git commit -m "docs: address docs-review findings for PRD/TSD alignment"
```
