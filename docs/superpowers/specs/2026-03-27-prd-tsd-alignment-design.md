# PRD & TSD Alignment — Design Spec

- **Date**: 2026-03-27
- **Scope**: Update PRD and TSD to align with FSD §16 My Page, §17 Board, §18 Community, §19 Events & Notices
- **Status**: Draft
- **Related Documents**: Customer Web FSD v1.1, UIUX Spec, PRD v1.1, TSD v1.1

---

## 1. Overview

The Customer Web FSD was updated with four new feature areas (My Page, Board System, Community with gamification, Events & Notices — totaling 11 new pages). The PRD and TSD must now be updated to reflect these features at the product requirements and technical specification levels.

### 1.1 Change Summary

| Doc | Sections Affected | Nature of Change |
|---|---|---|
| PRD | §3.3, §7.1, §12 | Update existing sections (capabilities, nav, future scope) |
| TSD | §4.3, §4.4, §4.5, §5.1, §5.2, §5.3, §6.1, §6.2 | Add new tables, endpoints, routes, hooks; update existing sections |

---

## 2. PRD Changes

### 2.1 §3.3 Customer — Capabilities Update

Add to the existing Customer capabilities list:

- Bookmark/save shops for quick access via a personal dashboard (My Page)
- View personal profile, submitted reviews, and bookmarked shops on My Page
- Update profile photo via Edit Profile page
- Create community posts with text, photos (max 5), video (max 1), and hashtags
- Comment on board posts and community posts (1-level nested replies)
- Like board posts, community posts, and events
- Earn points from community actions and progress through levels (Lv.1–Lv.5)
- Browse admin-curated board content (shop recommendations, massage info)
- Browse platform events and notices

Update the Authentication line:
- **Current:** "Required only for review submission."
- **New:** "Required for review submission, review reporting, community posting, commenting, liking, and bookmarking."

### 2.2 §7.1 Customer-Facing Menus — Add Items

Add 4 rows to the existing navigation table:

| Menu | Icon Suggestion | Description |
|---|---|---|
| **Board** | 📋 | Admin-curated shop recommendations and massage info articles |
| **Community** | 💬 | User-generated social feed for sharing experiences |
| **Events & Notices** | 🎉 | Platform events, promotions, and announcements |
| **My Page** | 👤 | Personal dashboard — profile, reviews, bookmarks (logged-in only) |

### 2.3 §12 Future Considerations — Update

Remove from future list:
- "Bookmarks / Favorites" — now in MVP (FSD §16 My Page)

Add clarification for remaining future items related to new features:
- Community: post editing/deletion by users, post reporting, points redemption/spending
- Events: registration/signup, coupon issuance from events
- Board: user-created posts, keyword search within board

---

## 3. TSD Database Changes

### 3.1 §4.3 ERD Update

Add the following entities and relationships to the existing ERD diagram:

```
┌─────────┐     1:N     ┌───────────┐
│  Region │─────────────│  District  │
└─────────┘             └─────┬─────┘
                              │ 1:N
                        ┌─────▼─────┐      M:N     ┌─────────┐
                        │   Shop    │──────────────│  Theme  │
                        └─────┬─────┘              └─────────┘
                           │  │ 1:N
              ┌────────────┘  └────────────┐
              │ 1:N                        │ 1:N
        ┌─────▼─────┐              ┌───────▼───────┐
        │  Review   │              │ User Bookmark │
        └─────┬─────┘              └───────┬───────┘
              │ N:1                        │ N:1
        ┌─────▼─────────────┐       ┌─────▼─────────────┐
        │  User (customer)  │───────│                    │
        └─────┬─────────────┘       └────────────────────┘
              │ 1:N                        │ 1:N
     ┌────────┼────────┬───────────────────┘
     │        │        │
┌────▼────┐ ┌─▼──────┐ ┌▼───────────┐
│Community│ │Comment │ │ Post Like  │
│  Post   │ │        │ │            │
└─────────┘ └────────┘ └────────────┘
                │ N:1 (polymorphic)
        ┌───────┴───────┐
        │  Board Post   │
        │  Community Post│
        │  Event        │
        └───────────────┘

┌──────────────┐     ┌──────────────┐
│    Event     │     │    Notice    │
└──────────────┘     └──────────────┘

┌──────────────────────┐
│   User Points Log    │
└──────────────────────┘

┌───────────────────────┐
│  Partnership Inquiry  │ ──(optional)──→ Shop
└───────────────────────┘

┌───────────────────────┐
│      Audit Log        │
└───────────────────────┘
```

### 3.2 §4.4 New Content Types

#### §4.4.8 `board_posts`

Admin-curated board posts for shop recommendations and massage information.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | Auto-generated |
| document_id | varchar | Unique, Not Null | Strapi v5 document identifier |
| type | varchar(20) | Not Null | Enum: `recommendation`, `info` |
| title | varchar(255) | Not Null | Localized (i18n) |
| body | text | Not Null | Rich text, localized |
| excerpt | varchar(500) | Nullable | Localized. Auto-generated from body if empty. |
| category | varchar(50) | Nullable | Badge label (e.g., "실전팁", "초보가이드") |
| author_name | varchar(100) | Not Null | Admin display name (not FK — admins create via Strapi) |
| is_featured | boolean | Not Null, Default false | Shown in featured banner carousel |
| is_hot | boolean | Not Null, Default false | Admin-set HOT badge |
| view_count | integer | Not Null, Default 0 | Incremented on page view |
| like_count | integer | Not Null, Default 0 | Computed via lifecycle hooks |
| comment_count | integer | Not Null, Default 0 | Computed via lifecycle hooks |
| locale | varchar(10) | Not Null | `ko`, `en` |
| published_at | timestamptz | Nullable | Draft & Publish |
| created_at | timestamptz | Not Null | Auto |
| updated_at | timestamptz | Not Null | Auto |

**Relations:**
- `region_id` → FK to `regions` (many-to-one, nullable — for region filtering)
- `linked_shop_id` → FK to `shops` (many-to-one, nullable — recommendation posts only)
- `featured_image` → Strapi media (single)

#### §4.4.9 `community_posts`

User-generated community posts.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| content | text | Not Null | 1–2,000 characters (app-level) |
| hashtags | jsonb | Nullable | Array of strings, max 10, each max 30 chars |
| location_text | varchar(200) | Nullable | Free-text location (e.g., "강남구 역삼동") |
| view_count | integer | Not Null, Default 0 | |
| like_count | integer | Not Null, Default 0 | Computed via lifecycle hooks |
| comment_count | integer | Not Null, Default 0 | Computed via lifecycle hooks |
| status | varchar(20) | Not Null, Default 'published' | Enum: `published`, `hidden`, `deleted` |
| author_id | integer | FK → up_users.id | Not Null |
| created_at | timestamptz | Not Null | |
| updated_at | timestamptz | Not Null | |

**Relations:**
- `photos` → Strapi media (multiple, max 5, max 5MB each, JPG/PNG/WebP)
- `video` → Strapi media (single, nullable, max 50MB, MP4/MOV)

**No i18n** — community posts are stored in the language they were written (same as reviews).

#### §4.4.10 `comments`

Shared polymorphic comment system for board posts, community posts, and events.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| content | text | Not Null | 1–500 characters (app-level) |
| parent_type | varchar(50) | Not Null | Polymorphic: `board_post`, `community_post`, `event` |
| parent_id | integer | Not Null | ID of the parent entity |
| reply_to_id | integer | FK → comments.id, Nullable | For 1-level nested replies only |
| author_id | integer | FK → up_users.id | Not Null |
| created_at | timestamptz | Not Null | |

**No i18n** — comments stored in language written.

**Constraint:** `reply_to_id` must reference a comment with the same `parent_type` and `parent_id`. Application-level validation prevents deeper nesting (reply to a reply).

#### §4.4.11 `events`

Admin-managed time-limited events/campaigns.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| title | varchar(255) | Not Null | Localized (i18n) |
| body | text | Not Null | Rich text, localized |
| category | varchar(30) | Not Null | Enum: `new_opening`, `closing_soon`, `coupon`, `winner_announcement`, `general` |
| start_date | date | Not Null | Event start (KST) |
| end_date | date | Not Null | Event end (KST). Used for D-day calculation. |
| disclaimers | text | Nullable | Localized. Event rules/conditions. |
| is_featured | boolean | Not Null, Default false | Shown in hero banner carousel |
| view_count | integer | Not Null, Default 0 | |
| like_count | integer | Not Null, Default 0 | Computed via lifecycle hooks |
| author_name | varchar(100) | Not Null | Admin display name |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | |
| created_at | timestamptz | Not Null | |
| updated_at | timestamptz | Not Null | |

**Relations:**
- `banner_image` → Strapi media (single) — full-width detail banner
- `featured_image` → Strapi media (single) — card thumbnail

**D-Day Countdown (computed, not stored):**
- `end_date > today(KST)` → D-N
- `end_date = today(KST)` → D-DAY
- `end_date < today(KST)` → 마감 (Closed)

#### §4.4.12 `notices`

Admin-published announcements.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| document_id | varchar | Unique, Not Null | |
| title | varchar(255) | Not Null | Localized (i18n) |
| body | text | Not Null | Rich text, localized |
| category | varchar(20) | Not Null | Enum: `notice`, `general` |
| is_important | boolean | Not Null, Default false | Pinned to top with 📌 |
| view_count | integer | Not Null, Default 0 | |
| locale | varchar(10) | Not Null | |
| published_at | timestamptz | Nullable | |
| created_at | timestamptz | Not Null | |
| updated_at | timestamptz | Not Null | |

No comments, no likes on notices.

#### §4.4.13 `user_bookmarks`

Junction table for user ↔ shop bookmarks.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| user_id | integer | FK → up_users.id, Not Null | |
| shop_id | integer | FK → shops.id, Not Null | |
| created_at | timestamptz | Not Null | For "most recently bookmarked" sort |

**Unique constraint:** `(user_id, shop_id)` — prevents duplicate bookmarks.

#### §4.4.14 `user_points_log`

Point transaction history for gamification.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| user_id | integer | FK → up_users.id, Not Null | |
| action | varchar(30) | Not Null | Enum: `post_created`, `comment_created`, `like_received` |
| points | integer | Not Null | +50, +10, or +5 |
| reference_type | varchar(50) | Not Null | `community_post`, `comment`, `post_like` |
| reference_id | integer | Not Null | ID of the triggering entity |
| created_at | timestamptz | Not Null | For daily limit tracking |

**Daily limit enforcement:** `comment_created` actions capped at 10 per user per day (check `COUNT WHERE action='comment_created' AND user_id=X AND created_at >= today`).

#### §4.4.15 `post_likes`

Junction table tracking who liked what (polymorphic).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | serial | PK | |
| user_id | integer | FK → up_users.id, Not Null | |
| target_type | varchar(50) | Not Null | `board_post`, `community_post`, `event` |
| target_id | integer | Not Null | ID of the liked entity |
| created_at | timestamptz | Not Null | |

**Unique constraint:** `(user_id, target_type, target_id)` — one like per user per target.

### 3.3 Extend `up_users` (Strapi Users & Permissions)

Add fields to the existing Strapi user model:

| Column | Type | Constraints | Notes |
|---|---|---|---|
| avatar | relation | Nullable | Strapi media (single). Profile photo. |
| total_points | integer | Not Null, Default 0 | Computed: SUM of user_points_log.points for this user. Updated via lifecycle hook on point creation. |

**Level derivation (not stored):**
- 0P → Lv.1, 500P → Lv.2, 2000P → Lv.3, 5000P → Lv.4, 10000P → Lv.5
- Computed at API response time from `total_points`.

**Existing fields reused:**
- `username` → display name (already exists)
- `email` → email (already exists)
- `created_at` → member since (already exists)

### 3.4 §4.5 Index Additions

Add to existing index list:

| Table | Index | Type | Purpose |
|---|---|---|---|
| board_posts | `(type, published_at DESC)` | B-tree | Board list queries by type |
| board_posts | `(region_id, type)` | B-tree | Region filter on recommendations |
| board_posts | `(is_featured, type)` | Partial (where is_featured=true) | Featured banner query |
| community_posts | `(author_id, created_at DESC)` | B-tree | "My posts" filter |
| community_posts | `(status, created_at DESC)` | B-tree | Feed query |
| comments | `(parent_type, parent_id, created_at)` | B-tree | Comment list for a post |
| events | `(category, end_date DESC)` | B-tree | Category + active filter |
| events | `(is_featured, end_date)` | Partial (where is_featured=true) | Hero banner query |
| notices | `(is_important DESC, published_at DESC)` | B-tree | Pinned-first notice list |
| user_bookmarks | `(user_id, created_at DESC)` | B-tree | User's bookmark list |
| user_bookmarks | `(user_id, shop_id)` | Unique | Prevent duplicate bookmarks |
| user_points_log | `(user_id, action, created_at)` | B-tree | Daily limit check |
| post_likes | `(user_id, target_type, target_id)` | Unique | Prevent duplicate likes |
| post_likes | `(target_type, target_id)` | B-tree | Count likes for a target |

---

## 4. TSD API Changes

### 4.1 §5.1 Content Type Summary Update

Add to existing summary table:

| Content Type | Type | i18n | Draft & Publish | Notes |
|---|---|---|---|---|
| board_post | Collection | Yes | Yes | Admin-curated board posts |
| community_post | Collection | No | No | User-generated (auto-published) |
| comment | Collection | No | No | Shared polymorphic comments |
| event | Collection | Yes | Yes | Admin-managed events |
| notice | Collection | Yes | Yes | Admin announcements |
| user_bookmark | Collection | No | No | User ↔ Shop junction |
| user_points_log | Collection | No | No | Point transactions |
| post_like | Collection | No | No | Like junction |

### 4.2 §5.2 New Endpoint Groups

#### §5.2.6 Board Posts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/board-posts` | Public | List board posts (paginated, filterable, sortable) |
| GET | `/api/board-posts/:documentId` | Public | Single board post detail |

**GET `/api/board-posts` — Query Parameters:**

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

**Response shape (list):**

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
      "featured_image": { "url": "/uploads/board1.jpg", "alternativeText": "..." },
      "linked_shop": { "name": "더 힐 테라피", "slug": "the-hill-therapy" },
      "region": { "name": "서울" }
    }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 12, "pageCount": 3, "total": 30 } }
}
```

**GET `/api/board-posts/:documentId` — Response (single):**

Same shape as list item but with full `body` (rich text) instead of `excerpt`, plus `linked_shop` populated with full shop card fields (name, slug, address, operating_hours, amenities).

#### §5.2.7 Community Posts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/community-posts` | Public | List community posts (feed) |
| GET | `/api/community-posts/:documentId` | Public | Single post detail |
| POST | `/api/community-posts` | Customer (JWT) | Create community post |

**GET `/api/community-posts` — Query Parameters:**

```
?filters[author][id][$eq]=42          // "my posts" filter
&filters[status][$eq]=published
&sort=created_at:desc                  // or like_count:desc for monthly best
&pagination[page]=1
&pagination[pageSize]=10
&populate[photos][fields][0]=url
&populate[author][fields][0]=username
&populate[author][fields][1]=total_points
```

**Response shape (list):**

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
  "meta": { "pagination": { "page": 1, "pageSize": 10, "pageCount": 5, "total": 48 } }
}
```

> **Note:** `level` is computed at response time from `total_points`, not stored.

**POST `/api/community-posts` — Request Body:**

```json
{
  "data": {
    "content": "오늘 방문한 마사지 샵 후기...",
    "hashtags": ["#마사지후기", "#강남"],
    "location_text": "강남구 역삼동"
  }
}
```

Photos and video are uploaded separately via Strapi's media upload endpoint, then linked in a follow-up PUT request (standard Strapi media workflow).

#### §5.2.8 Comments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/comments` | Public | List comments for a parent entity |
| POST | `/api/comments` | Customer (JWT) | Create comment or nested reply |

**GET `/api/comments` — Query Parameters:**

```
?filters[parent_type][$eq]=board_post
&filters[parent_id][$eq]=1
&filters[reply_to_id][$null]=true      // top-level comments only
&sort=created_at:asc
&pagination[page]=1
&pagination[pageSize]=20
&populate[author][fields][0]=username
&populate[author][fields][1]=total_points
&populate[replies][populate][author][fields][0]=username
```

**Response shape:**

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
      "author": { "id": 10, "username": "마사지매니아", "total_points": 800, "level": 2 },
      "replies": [
        {
          "id": 2,
          "content": "저도 갈만한지 알려주세요!",
          "reply_to_id": 1,
          "created_at": "2026-03-27T11:00:00Z",
          "author": { "id": 15, "username": "쉬다", "total_points": 100, "level": 1 }
        }
      ]
    }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 20, "pageCount": 2, "total": 24 } }
}
```

**POST `/api/comments` — Request Body:**

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

For a reply: set `reply_to_id` to the parent comment's ID. Server validates that the referenced comment shares the same `parent_type` and `parent_id`.

#### §5.2.9 Events & Notices

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/events` | Public | List events (filterable by category, sortable) |
| GET | `/api/events/:documentId` | Public | Single event detail |
| GET | `/api/notices` | Public | List notices (pinned first) |
| GET | `/api/notices/:documentId` | Public | Single notice detail with prev/next |

**GET `/api/events` — Query Parameters:**

```
?locale=ko
&filters[category][$eq]=new_opening
&filters[end_date][$gte]=2026-03-27    // only active/future events
&sort=end_date:asc                      // or like_count:desc for popular
&pagination[page]=1
&pagination[pageSize]=12
&populate[featured_image][fields][0]=url
```

**Response shape (event list):**

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
  "meta": { "pagination": { "page": 1, "pageSize": 12, "pageCount": 1, "total": 8 } }
}
```

> **Note:** `dday` is computed at response time using KST, not stored.

**GET `/api/notices` — Response includes `is_important` for pinned sorting:**

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
  "meta": { "pagination": { "page": 1, "pageSize": 20, "pageCount": 1, "total": 15 } }
}
```

**GET `/api/notices/:documentId` — Single notice with prev/next:**

Custom controller adds `prev` and `next` fields:

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
  "prev": { "documentId": "nt002", "title": "서비스 정기 점검 안내", "published_at": "2026-05-28T00:00:00Z" },
  "next": { "documentId": "nt003", "title": "부적절한 리뷰 작성 시 제재 안내", "published_at": "2026-05-10T00:00:00Z" }
}
```

#### §5.2.10 Bookmarks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/bookmarks` | Customer (JWT) | List user's bookmarked shops (paginated) |
| POST | `/api/bookmarks` | Customer (JWT) | Add bookmark |
| DELETE | `/api/bookmarks/:id` | Customer (JWT) | Remove bookmark |

**GET `/api/bookmarks` — Query Parameters:**

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

**Response shape:**

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
  "meta": { "pagination": { "page": 1, "pageSize": 12, "pageCount": 1, "total": 5 } }
}
```

**POST `/api/bookmarks` — Request:**

```json
{ "data": { "shop": "shop001" } }
```

Server auto-sets `user_id` from JWT. Returns 409 if bookmark already exists.

**DELETE `/api/bookmarks/:id`** — Server validates the bookmark belongs to the authenticated user.

#### §5.2.11 Likes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/likes` | Customer (JWT) | Like a target |
| DELETE | `/api/likes/:id` | Customer (JWT) | Unlike |

**POST `/api/likes` — Request:**

```json
{
  "data": {
    "target_type": "board_post",
    "target_id": 1
  }
}
```

Server auto-sets `user_id` from JWT. Returns 409 if already liked. On success, triggers lifecycle hook to increment `like_count` on the target entity and create a `user_points_log` entry for the target author (+5P `like_received`).

**DELETE `/api/likes/:id`** — Server validates ownership. Decrements `like_count` on target. Does NOT reverse the point award (points never decrease).

#### §5.2.12 User Profile

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | Customer (JWT) | Current user profile with computed level |
| PUT | `/api/users/me/avatar` | Customer (JWT) | Upload/change profile photo |
| DELETE | `/api/users/me/avatar` | Customer (JWT) | Remove profile photo |

**GET `/api/users/me` — Response:**

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

> `level` is computed from `total_points` at response time.

**PUT `/api/users/me/avatar`** — Multipart form upload. Server validates file type (JPG/PNG/WebP) and size (max 5MB). Replaces existing avatar.

**DELETE `/api/users/me/avatar`** — Removes avatar media relation. Profile reverts to default avatar on client.

### 4.3 §5.3 New Lifecycle Hooks & Custom Controllers

Add to existing §5.3:

#### §5.3.5 Lifecycle Hooks: Comment Count Recalculation

On `comment` `afterCreate`: increment `comment_count` on the parent entity (board_post, community_post, or event, determined by `parent_type`).

#### §5.3.6 Lifecycle Hooks: Like Count Recalculation

On `post_like` `afterCreate`: increment `like_count` on target entity. On `post_like` `afterDelete`: decrement `like_count` on target entity.

#### §5.3.7 Lifecycle Hooks: Points Calculation

On `community_post` `afterCreate`: insert `user_points_log` entry (+50P `post_created`) and increment author's `total_points`.

On `comment` `afterCreate`: check daily limit (max 10 point-earning comments per day). If under limit, insert `user_points_log` (+10P `comment_created`) and increment author's `total_points`.

On `post_like` `afterCreate`: insert `user_points_log` for the **target entity's author** (+5P `like_received`) and increment that author's `total_points`.

#### §5.3.8 Custom Controller: View Count Increment

Custom route `POST /api/:contentType/:id/view` — increments `view_count` atomically. Called by the frontend on page load. Rate-limited per user session to prevent abuse.

Applies to: board_posts, community_posts, events, notices.

#### §5.3.9 Custom Controller: Notice Prev/Next

Custom controller for `GET /api/notices/:documentId` that adds `prev` and `next` notice references based on `published_at` ordering.

---

## 5. TSD Frontend Changes

### 5.1 §6.1 Route Additions

Add to existing project structure:

```
app/[locale]/
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

New component directories:

```
components/
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

New API client modules:

```
lib/api/
├── board.ts
├── community.ts
├── events.ts
├── bookmarks.ts
├── likes.ts
└── profile.ts
```

### 5.2 §6.2 Rendering Strategy Additions

| Page | Strategy | Revalidation | Rationale |
|---|---|---|---|
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

### 5.3 §9 Caching Strategy Additions

Add webhook triggers for new content types:

| Content Type | Webhook Event | Revalidation Target |
|---|---|---|
| board_post | publish, update, unpublish | Board list pages, post detail |
| event | publish, update, unpublish | Events hub, ongoing events, event detail |
| notice | publish, update, unpublish | Events hub, notice detail |

Community posts and comments are SSR (no cache), so no webhook revalidation needed.

Bookmark and like operations are user-specific CSR calls — no cache implications.

---

## 6. Admin Web Updates (TSD §5.6)

Add to existing Admin Web features:

| Admin Web Page/Section | Description |
|---|---|
| **Board Posts** | CRUD interface for board posts with type filter, featured toggle, HOT badge management |
| **Events** | CRUD for events with date pickers, category, featured toggle |
| **Notices** | CRUD for notices with important/pinned toggle |
| **Community Moderation** | View, hide, or delete community posts. View user activity. |
| **User Points** | View user point history and current levels (read-only) |

---

## 7. PRD §7.2 Admin Menu Updates

Add to existing Admin Web menu table:

| Admin Web Page/Section | Description |
|---|---|
| **Board Posts** | Create, edit, publish board posts (shop recommendations, massage info) |
| **Events** | Create, edit, publish events with scheduling and categories |
| **Notices** | Create, edit, publish platform announcements |
| **Community Moderation** | Review and moderate user-generated community posts |

---

## 8. Bilingual (EN/KO) Mirroring

All changes apply to both EN and KO versions of PRD and TSD. Feature IDs, table names, API endpoints, column names, and code snippets remain in English. Only prose descriptions, section titles, and user-facing strings are translated to Korean.

Files affected:
- `docs/swida/prd/SWIDA_PRD_EN.md`
- `docs/swida/prd/SWIDA_PRD_KO.md`
- `docs/swida/tsd/SWIDA_TSD_EN.md`
- `docs/swida/tsd/SWIDA_TSD_KO.md`
