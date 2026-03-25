---
title: "SWIDA — Product Requirements Document"
sidebar_label: "PRD (EN)"
sidebar_position: 1
---

# SWIDA — Product Requirements Document

## 1. Overview

**Product Name:** SWIDA (Swedish + 쉬다, Korean for "rest")

**Description:** SWIDA is a massage and wellness shop discovery platform exclusively built for the South Korean market. It bridges the gap between local massage/wellness businesses and customers seeking relaxation services. Shop owners get listed through a simple admin-managed onboarding process, while customers enjoy a rich search and discovery experience powered by location, service themes, proximity, and amenity-based filtering.

**Target Market:** South Korea

**Platform:** Web (responsive — mobile & desktop)

**Core Value Proposition:**
- For **customers**: A centralized, trustworthy directory to discover massage and wellness shops tailored to their preferences and location — no more scattered Naver/Kakao searches.
- For **shop owners**: Increased visibility and discoverability without the need to manage their own digital presence or learn a new platform.
- For **SWIDA (business)**: A scalable listing platform with future monetization potential through premium placements, advertising, and partnership tiers.

---

## 2. Goals & Success Metrics

### 2.1 Business Goals
- Build the most comprehensive massage/wellness shop directory in South Korea
- Establish SWIDA as the go-to discovery tool for massage services
- Create a low-friction onboarding pipeline for shop owners via admin-managed registration
- Lay the groundwork for future monetization (premium listings, featured placements, ads)

### 2.2 Key Success Metrics (KPIs)
| Metric | Target (MVP, 6 months) |
|---|---|
| Total listed shops | 500+ |
| Monthly active users (customers) | 10,000+ |
| Average session duration | 3+ minutes |
| Reviews submitted per month | 500+ |
| Partnership inquiries per month | 50+ |

---

## 3. User Roles & Permissions

### 3.1 Admin

The Admin is the central operator of the SWIDA platform. All shop data flows through the Admin.

**Capabilities:**
- **Shop Management:** Create, read, update, and delete (CRUD) shop listings including all associated data (location, themes, amenities, images, descriptions) — performed via the custom Admin Web application (Next.js), which communicates with Strapi's REST API
- **Shop Visibility:** Publish or unpublish any shop via the Admin Web interface, which triggers Strapi's built-in Draft & Publish system via API. Published shops are visible on the Customer Web; unpublished shops are hidden. Configure custom open/close tags per shop for customer-facing operating status display.
- **Preview:** Can preview any shop listing exactly as it appears to customers — a full read-only customer view for quality assurance before publishing. Implemented as a "Preview" button within the Admin Web that opens the Customer Web shop detail page in preview/draft mode.
- **Content Management:** Manage dynamic data such as service themes, location categories (Level 1 and Level 2), and amenity options — managed via the Admin Web interface backed by Strapi collection types
- **Review & Content Moderation:** Ability to review, flag, hide, or remove inappropriate customer reviews and posts via the Admin Web. Admin can hide any review or post from public view at any time.
- **Customer Account Management:** Admin can lock/suspend customer accounts that exhibit abusive behavior (spam, fake reviews, harassment). Locked accounts are prevented from submitting reviews or posts. Admin can unlock accounts when appropriate.
- **Dashboard:** Access to an admin dashboard showing platform statistics (total shops, total reviews, user activity, partnership inquiries) — built as a dedicated page in the Admin Web (Next.js)

**Authentication:** Admin authentication via Strapi's admin API (email/password, JWT-based). The Admin Web (Next.js) is served at a dedicated admin domain (`admin.swida.com`) and communicates with Strapi's admin API endpoints for authentication and data management. Only authorized admin users can log in — customers and shop owners cannot access the Admin Web.

> **Note on Architecture:** Strapi operates as a **headless API-only backend**. The built-in Strapi admin panel is **restricted to developers only** for monitoring, debugging, and emergency operations — it is not used for day-to-day platform management. The primary admin interface is a custom-built Next.js application (Admin Web) that provides a tailored UX for SWIDA's operational workflows. Only authenticated admin users can access the Admin Web; it is not accessible to customers, shop owners, or any other role.

### 3.2 Shop (Shop Owner)

Shop owners have **no direct access** to the SWIDA platform. There is no shop signup, signin, or self-service portal.

**Onboarding Flow:**
1. Shop owner discovers SWIDA through word-of-mouth, social media, or the Partnership page
2. Shop owner contacts the Admin directly through SNS (KakaoTalk, Instagram DM, etc.) or email
3. Shop owner provides required shop details (name, address, themes, amenities, images, etc.)
4. Admin verifies the information and creates the listing via the Admin Web
5. Admin notifies the shop owner once the listing is live

**Future Consideration:** A self-service shop owner portal may be introduced in later phases to allow direct management of listings, responding to reviews, and uploading promotional content.

### 3.3 Customer

Customers are the primary end users of SWIDA. They do **not** need an account to browse and search shops, but an account is required to submit reviews.

**Capabilities:**
- Browse and search all listed shops using various filters and search modes
- View detailed shop profiles including location, themes, amenities, images, and reviews
- Submit reviews and ratings on any shop (no visit verification required, no per-shop or daily limits — abuse is managed via admin account controls)
- Use GPS-based nearby search to find shops in their immediate vicinity

**Authentication:** Optional signup/signin via email or social login (Kakao, Naver) — handled by Strapi's Users & Permissions plugin with custom Kakao/Naver providers. Required only for review submission.

---

## 4. Location System

SWIDA uses a two-level hierarchical location system aligned with South Korea's administrative divisions.

### 4.1 Level 1 — Region (시/도)

Top-level geographic grouping representing provinces and metropolitan cities.

**Strapi Content Type:** `region` (collection type)

**Examples:** 서울특별시, 부산광역시, 경기도, 인천광역시, 대구광역시, 제주특별자치도, etc.

### 4.2 Level 2 — City/District (시/군/구)

Sub-regions within a Level 1 area. Level 2 options are **dynamically filtered** based on the selected Level 1 region.

**Strapi Content Type:** `district` (collection type, relation → belongs to one `region`)

**Examples (서울특별시):** 강남구, 마포구, 종로구, 서초구, 영등포구, etc.
**Examples (부산광역시):** 해운대구, 부산진구, 동래구, 수영구, etc.

### 4.3 Rules
- Every shop **must** be registered under exactly one Level 2 location (district)
- Level 2 options are only displayed after a Level 1 region is selected
- Admin manages the full list of Level 1 and Level 2 entries via the Admin Web (add, edit, delete)
- Location data should be pre-seeded with all South Korean administrative divisions at launch using Strapi seed scripts

---

## 5. Shop Listing Data Model

Each shop profile is defined as a Strapi **collection type** (`shop`) with the following fields and components:

### 5.1 Basic Information

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Shop Name | Text (Short) | Yes | Official name of the shop |
| Slug | UID (from Shop Name) | Yes | URL-friendly identifier, auto-generated |
| Description | Text (Long) | Yes | Brief introduction/overview (max 500 characters) |
| Address | Text (Short) | Yes | Full street address |
| Region | Relation (→ Region) | Yes | Level 1 location (시/도) |
| District | Relation (→ District) | Yes | Level 2 location (시/군/구) |
| Latitude | Decimal (Float) | Yes | GPS latitude — entered by admin via map pin drop (custom field plugin) |
| Longitude | Decimal (Float) | Yes | GPS longitude — entered by admin via map pin drop (custom field plugin) |
| Phone Number | Text (Short) | No | Primary contact phone number |
| Operating Hours | Text (Short) | Yes | Business hours (e.g., 10:00–22:00) |
| Last Order Time | Text (Short) | No | Final booking/walk-in acceptance time |
| Closed Days | Text (Short) | Yes | Regular closed days (e.g., 매주 일요일, 공휴일) |
| Holiday Exceptions | Text (Long) | No | Temporary closures or special holiday schedules |
| Images | Media (Multiple) | Yes | Shop photos (min 1, max 10), stored via Strapi Upload provider → MinIO |
| Thumbnail | Media (Single) | Yes | Primary display image for search results |

### 5.2 Service Information

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Service Themes | Relation (→ Theme, many-to-many) | Yes | One or more massage/service themes |
| Service Menu | Component (Repeatable: `service-menu-item`) | Yes | List of individual services offered (see 5.2.1) |
| Price Range | Text (Short) | No | General price indication (e.g., ₩30,000–₩80,000) |
| Booking Required | Boolean | Yes | Whether advance booking is needed |
| Booking URL/Phone | Text (Short) | No | Link or phone number for booking |
| Gender Availability | Enumeration | No | `all`, `female_only`, `male_only`, `couple_available` |

#### 5.2.1 Service Menu Item (Strapi Repeatable Component: `service-menu-item`)

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Service Name | Text (Short) | Yes | Name of the service (e.g., 스웨디시 60분) |
| Duration | Integer | Yes | Duration in minutes |
| Price | Integer | Yes | Price in KRW (e.g., 50000) |
| Description | Text (Short) | No | Brief description of the service |

### 5.3 Amenities & Facilities (Strapi Component: `amenities`)

A **single component** embedded in the shop content type:

| Field | Strapi Field Type | Description |
|---|---|---|
| Parking Available | Boolean | Whether parking is available |
| Parking Type | Enumeration (nullable) | `free`, `paid`, `validated`, `street` |
| Parking Detail | Text (Short, nullable) | Additional info (e.g., "건물 지하 1층, 2시간 무료") |
| Shower | Boolean | Shower facilities available |
| Sleeping | Boolean | Rest/sleeping area available |
| Private Room | Boolean | Private treatment rooms available |
| WiFi | Boolean | Free WiFi available |
| Accessibility | Boolean | Wheelchair / mobility-friendly access |
| Accessibility Detail | Text (Short, nullable) | Additional info (e.g., "엘리베이터 있음, 1층 시술실") |

### 5.4 Contact Channels (Strapi Component: `contact-channels`)

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Phone Number | Text (Short) | No | Primary phone number |
| KakaoTalk ID | Text (Short) | No | KakaoTalk channel or ID |
| Instagram | Text (Short) | No | Instagram handle |
| Website URL | Text (Short) | No | Shop website or blog URL |
| Naver Place URL | Text (Short) | No | Naver Place listing URL |

### 5.5 Additional Information

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Languages Supported | JSON / Enumeration (multi) | No | Languages spoken (e.g., 한국어, English, 中文, 日本語) |
| Last Verified Date | Date | No | Date when admin last verified listing accuracy |

### 5.6 Metadata

| Field | Strapi Field Type | Description |
|---|---|---|
| Created At | Timestamp | Auto-managed by Strapi |
| Updated At | Timestamp | Auto-managed by Strapi |
| Inactive Reason | Enumeration (nullable) | `closed`, `owner_request`, `violation`, `stale`, `other` |
| Open Tag | Text (Short, nullable) | Custom label or tag displayed on the Customer Web when the shop is currently operating within its business hours (e.g., "영업중", "OPEN"). Falls back to default label "영업중" if left empty. |
| Close Tag | Text (Short, nullable) | Custom label or tag displayed on the Customer Web when the shop is outside its operating hours (e.g., "영업종료", "CLOSED"). Falls back to default label "영업종료" if left empty. Only relevant for published shops — unpublished shops are not displayed at all. |
| Average Rating | Decimal (Float) | Calculated via Strapi lifecycle hooks on Review changes |
| Total Reviews | Integer | Count of published reviews, updated via lifecycle hooks |

> **Note:** Shop visibility on the Customer Web is controlled entirely by Strapi's built-in Draft & Publish system. Admin publishes or unpublishes a shop via the Admin Web (which calls Strapi's Draft & Publish API) — no additional custom boolean is needed. Only published shops appear in customer-facing search results, shop detail pages, and the sitemap. Strapi's REST API natively excludes draft entries from public queries, so no custom policy is required for basic visibility filtering.

> **Note on Inactive Reason:** When unpublishing a shop via the Admin Web, the admin should set an `inactive_reason` to record why the shop was taken offline. This is stored as a custom field for audit purposes and potential reactivation workflows.

> **Note on Open/Close Tags:** The `open_tag` and `close_tag` fields allow per-shop customization of the status labels shown to customers. The open/close determination is based on the shop's `Operating Hours` field compared to the current time in KST (Korea Standard Time). Unpublished shops are never displayed on the Customer Web regardless of tags.

---

## 6. Search & Filtering System

SWIDA provides five distinct search modes accessible from the main navigation. All search results return a **paginated** list of shop cards showing: thumbnail, name, Level 2 location, top themes, average rating, and review count.

**Pagination Strategy:** Traditional page-based pagination is used across all devices (mobile and desktop). This is an intentional decision prioritizing SEO — each page of results has a unique, crawlable URL, ensuring maximum indexability by Naver and Google.

**API Usage:** The Customer Web (Next.js) calls Strapi's REST API with query parameters for filtering, sorting, and pagination. Strapi's built-in `filters`, `sort`, `pagination`, and `populate` parameters handle most search modes natively. Complex queries (nearby search, advanced Korean text search) are handled by custom Strapi controllers/routes.

### 6.1 Detail Search (Advanced)

The most comprehensive search mode combining multiple filters simultaneously.

**Available Filters:**
- **Shop name** — keyword/partial match → Strapi filter: `$containsi`
- **Level 1 + Level 2 location** — cascading dropdowns → Strapi filter: `filters[region][documentId][$eq]` and `filters[district][documentId][$eq]`
- **Service themes** — multi-select → Strapi filter: `filters[themes][documentId][$in]`
- **Amenities** — toggle checkboxes → Strapi filter: `filters[amenities][parking_available][$eq]=true`
- **Booking required** — yes / no / any → Strapi filter: `filters[booking_required][$eq]`

**Behavior:** Filters are combined with AND logic (Strapi's default). Only shops matching **all** selected criteria are returned. Empty/unselected filters are ignored.

### 6.2 Theme Search

A focused browse experience centered on massage/service themes.

**Behavior:**
- Displays all available themes as selectable cards or tags (fetched from `GET /api/themes`)
- Selecting a theme returns all shops tagged with that theme, sorted by rating (descending) → `filters[themes][documentId][$eq]={themeId}&sort=average_rating:desc`
- Customer can optionally narrow results by location after selecting a theme

### 6.3 Location Search

Browse shops by geographic area using the two-level location hierarchy.

**Behavior:**
- Customer selects Level 1 region first → `GET /api/regions`
- Level 2 options load dynamically → `GET /api/districts?filters[region][documentId][$eq]={regionId}`
- Selecting Level 2 returns all shops in that district, sorted by rating (descending)

### 6.4 Nearby Search

GPS-powered discovery of shops in the customer's immediate area.

**Behavior:**
- Requests browser/device location permission on first use
- Returns shops sorted by distance (nearest first) within a configurable radius (default: 5km)
- Displays distance from customer to each shop
- Optionally allows filtering by theme or amenities within nearby results

**Implementation:** This requires a custom Strapi controller (`/api/shops/nearby`) that executes a raw SQL query using PostGIS:
```
SELECT *, ST_Distance(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint(:userLng, :userLat)::geography
) AS distance
FROM shops
WHERE published_at IS NOT NULL
  AND ST_DWithin(
    ST_MakePoint(longitude, latitude)::geography,
    ST_MakePoint(:userLng, :userLat)::geography,
    :radiusMeters
  )
ORDER BY distance ASC
```

### 6.5 Name Search

Simple keyword search by shop name.

**Behavior:**
- Accepts partial or full shop name input → Strapi filter: `filters[name][$containsi]`
- Returns matching shops ranked by relevance
- Case-insensitive and supports Korean character matching (초성 search is a nice-to-have)

### 6.6 Search UX Rules (Baseline — Adjustable During Design Phase)

**Default Sort Order:**
- Detail Search → Rating (descending) → `sort=average_rating:desc`
- Theme Search → Rating (descending) → `sort=average_rating:desc`
- Location Search → Rating (descending) → `sort=average_rating:desc`
- Nearby Search → Distance (nearest first) → custom controller
- Name Search → Relevance → custom controller or `$containsi` default

**Available Sort Options:** Rating, Review count, Newest listed → `sort=average_rating:desc`, `sort=total_reviews:desc`, `sort=createdAt:desc`

**Zero Results:** Display a friendly message (e.g., "검색 결과가 없습니다") with a suggestion to broaden filters or try a different search mode.

**Filter State:** All active filters are persisted in URL query parameters. This ensures search result pages are shareable, bookmarkable, and survive back-navigation.

**Result Count:** Always displayed at the top of results (e.g., "검색 결과 42개"). Strapi returns `pagination.total` in its response metadata.

**Inactive Shops:** Fully excluded from all search results and sitemap. Strapi's built-in Draft & Publish system natively excludes unpublished entries from public API responses. The `is-active-shop` policy serves as an additional safeguard.

---

## 7. Main Navigation & Menus

### 7.1 Customer-Facing Menus

| Menu | Icon Suggestion | Description |
|---|---|---|
| **Detail Search** | 🔍 | Advanced multi-filter search page |
| **Theme Search** | 💆 | Browse by massage/service theme |
| **Location Search** | 📍 | Browse by region and district |
| **Nearby Search** | 📡 | GPS-based nearby shop discovery |
| **Review** | ⭐ | Recent reviews feed + ability to write reviews |
| **Partnership** | 🤝 | Landing page explaining how shops can join SWIDA |

### 7.2 Admin-Facing Menus (Admin Web — Next.js)

The Admin Web is a custom-built Next.js application providing a tailored admin experience. Only authenticated admin users can access the Admin Web. Strapi's built-in admin panel is **restricted to developers only** for monitoring, debugging, and emergency operations — it is not used for day-to-day platform management.

| Admin Web Page/Section | Description |
|---|---|
| **Dashboard** | Platform overview statistics (total shops, reviews, users, inquiries) |
| **Shops** | CRUD interface for all shop listings with search, filter, and sort |
| **Themes** | Add, edit, delete service themes |
| **Regions & Districts** | Manage Level 1 and Level 2 location entries |
| **Reviews** | View, flag, hide, and moderate reviews |
| **Partnership Inquiries** | Track and manage incoming partnership requests with status workflow |
| **Users** | Customer account management (lock/unlock, view activity) |

**Custom Admin Features:**
- **Dashboard:** Platform stats with charts and trends — built as a Next.js page with data fetched from Strapi's admin API and custom analytics endpoints.
- **Audit Log Viewer:** History of all listing changes, displayed in a searchable, filterable table. Data stored in Strapi's `audit-log` collection type, populated via lifecycle hooks.
- **Map Pin Drop:** Integrated map component (Google Maps or Kakao Map) for latitude/longitude selection when creating or editing shop listings.

### 7.3 Admin Operational Workflows (MVP)

Since shop owners do not self-manage listings, the Admin Web is the core operational engine. The following workflows are required from launch:

**Listing Publish Flow:**
`draft` → `published`
- **Draft:** Admin creates a listing with partial data via the Admin Web. Not visible to customers. Strapi's built-in Draft state handles this natively via API.
- **Published:** Admin publishes the listing via the Admin Web (which calls Strapi's publish API). The shop becomes immediately visible in all customer-facing search results, shop detail pages, and sitemap. To hide a shop (e.g., for temporary closures or violations), the admin simply unpublishes it via the Admin Web.

> Strapi v5's built-in Draft & Publish system natively handles visibility. Draft entries are excluded from public API responses by default — no custom policy or middleware is needed for basic visibility control.

**Inactive Reason Codes:**
When unpublishing a shop, the admin should select an `inactive_reason` to record why:
- `closed` — Business permanently closed
- `owner_request` — Shop owner requested removal
- `violation` — Listing violated platform policies
- `stale` — Unable to verify current operating status
- `other` — Free-text explanation required (stored in a separate `inactive_reason_detail` text field)

**Soft Delete Policy:**
Shop listings are **never hard-deleted**. Removed or deactivated shops are unpublished and hidden from customer-facing search. All historical data (reviews, images, metadata) is preserved for audit and potential reactivation.

**Audit Log:**
All changes to shop listings are logged with:
- Who made the change (admin user) — captured from the Admin Web session (passed to Strapi via API)
- What was changed (field-level diff)
- When it was changed (timestamp)
- The previous and new values

> Use Strapi lifecycle hooks (`beforeUpdate`) to capture field diffs and write to an `audit-log` collection type. Strapi Enterprise has built-in Audit Logs.

---

## 8. Review System

### 8.1 Review Content Type (Strapi Collection Type: `review`)

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Author | Relation (→ Users-Permissions User) | Yes | The customer who submitted the review |
| Shop | Relation (→ Shop) | Yes | The shop being reviewed |
| Rating | Integer (min: 1, max: 5) | Yes | Star rating |
| Comment | Text (Long) | Yes | Review body (10–500 characters, validated via custom validator) |
| Status | Enumeration | Yes | `published`, `hidden`, `under_review`, `deleted` |
| Moderation Reason | Enumeration (nullable) | No | `spam`, `inappropriate`, `fake_review`, `irrelevant`, `other` |
| Report Count | Integer | No | Number of user reports received |

### 8.2 Review Submission
- **Who can review:** Any registered customer (login required via Strapi Users & Permissions). Customers with locked/suspended accounts cannot submit reviews.
- **Visit verification:** Not required
- **Rating:** 1–5 star scale (required)
- **Comment:** Free-text review body (required, 10–500 characters)
- **Limit:** No per-shop or daily review limits are enforced. Abuse prevention is handled through admin-level account management (see Section 8.5).

### 8.3 Review Display
- Reviews are displayed on each shop's detail page, sorted by most recent first
- Each review shows: author display name, rating, comment, and submission date
- Shop's average rating and total review count are prominently displayed

### 8.4 Review Moderation
- Admin can flag reviews containing inappropriate, abusive, or spam content via the Admin Web
- **Admin can hide any review or post** from public view at any time via the Admin Web. Hidden reviews are immediately excluded from customer-facing display and average rating calculations.
- Flagged reviews are hidden from public view pending admin decision
- Admin can set review status to `deleted` (soft delete)
- **Moderation reason codes:** `spam`, `inappropriate`, `fake_review`, `irrelevant`, `other`

### 8.5 Review Integrity & Abuse Prevention (MVP)

Since SWIDA allows reviews without visit verification, the following safeguards are implemented to maintain trust:

**User Reporting:**
- Customers can report any review via a "Report" button → `POST /api/reviews/:id/report`
- Report includes a reason selection: `spam`, `fake`, `inappropriate`, `irrelevant`, `other`
- Reported reviews enter `under_review` status via Strapi lifecycle hook

**Admin Account Lock (Primary Abuse Prevention):**
- No per-shop or daily review limits are enforced. Instead, the admin has full control over customer accounts to handle abuse.
- Admin can **lock/suspend** any customer account via the Admin Web. Locked accounts are immediately prevented from submitting reviews or any other user-generated content.
- Account lock reasons are recorded: `spam`, `fake_reviews`, `harassment`, `abuse`, `other`
- Locked users see a clear message explaining their account has been suspended when attempting to submit content.
- Admin can **unlock** accounts at their discretion after the issue is resolved.

**Admin Content Hiding:**
- Admin can **hide any individual review or post** directly from the Admin Web.
- Hidden content is immediately removed from customer-facing views and excluded from rating calculations.
- Hidden content is preserved in the database for audit purposes (soft hide, not hard delete).

**Review Statuses:**
| Status | Description |
|---|---|
| `published` | Visible to all users, counted in average rating |
| `hidden` | Temporarily hidden by admin or system, excluded from average rating |
| `under_review` | Flagged by user report or system, pending admin decision |
| `deleted` | Permanently removed by admin, excluded from average rating |

**Rating Recalculation:** Implemented via Strapi lifecycle hooks on the Review content type — `afterCreate`, `afterUpdate`, `afterDelete` recalculate the parent shop's `average_rating` and `total_reviews` fields.

**Future Enhancement:** SMS verification for reviewer signup, "Verified Customer" badges, cooldown periods, IP/device-level fraud detection, behavioral pattern analysis, edit window rules, and shop owner appeal process — see Section 12.

### 8.6 Review Feed (Menu)
- A dedicated page showing the latest reviews across all shops → `GET /api/reviews?sort=createdAt:desc&populate=shop&filters[status][$eq]=published`
- Serves as social proof and encourages engagement
- Each review card links to the corresponding shop's detail page

---

## 9. Service Themes

### 9.1 Strapi Content Type: `theme` (Collection Type, i18n enabled)

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Name | Text (Short) | Yes | Theme name — localized per locale via Strapi i18n (e.g., "스웨디시" in `ko`, "Swedish" in `en`) |
| Slug | UID (from Name) | Yes | URL-friendly identifier |
| Icon | Media (Single) | No | Theme icon/image |
| Display Order | Integer | No | For controlling display priority |

### 9.2 Association
- Each shop can be tagged with **one or more** themes (many-to-many relation)
- Themes are used as primary filters in Theme Search and as secondary filters in other search modes

### 9.3 Example Themes (Initial Seed Data)
| Korean | English | Description |
|---|---|---|
| 스웨디시 | Swedish | Classic Swedish relaxation massage |
| 타이 | Thai | Traditional Thai stretching massage |
| 아로마 | Aroma | Essential oil-based aromatherapy massage |
| 스포츠 | Sports | Deep tissue massage for athletes |
| 딥티슈 | Deep Tissue | Focused pressure on deep muscle layers |
| 발마사지 | Foot | Reflexology and foot massage |
| 커플 | Couple | Side-by-side couple massage |
| 경락 | Meridian | Traditional Korean meridian massage |
| 림프 | Lymphatic | Lymphatic drainage massage |

---

## 10. Partnership Flow

### 10.1 Partnership Page Content
The Partnership page is a public-facing landing page that explains:
- What SWIDA is and its value for shop owners
- Benefits of being listed (increased visibility, customer reviews, search discoverability)
- Step-by-step process for getting listed
- Contact information (email, KakaoTalk ID, Instagram handle)
- FAQ for shop owners

### 10.2 Onboarding Process
1. Shop owner visits the Partnership page or discovers SWIDA through other channels
2. Shop owner reaches out via SNS (KakaoTalk, Instagram) or email
3. Admin responds and collects required shop information (name, address, themes, amenities, images, operating hours)
4. Admin creates the shop listing in Strapi as a `draft`
5. Admin reviews and verifies the information
6. Admin publishes the listing (status → `published`)
7. Admin notifies the shop owner that the listing is live

### 10.3 Partnership Inquiry Management

#### 10.3.1 Inquiry Content Type (Strapi Collection Type: `partnership-inquiry`)

| Field | Strapi Field Type | Required | Description |
|---|---|---|---|
| Shop Name | Text (Short) | Yes | Name of the business |
| Contact Person | Text (Short) | Yes | Name of the person reaching out |
| Phone Number | Text (Short) | Yes | Contact phone number |
| Email | Email | No | Contact email address |
| Address | Text (Short) | Yes | Shop address |
| Business Type | Text (Short) | No | Type of massage/wellness service |
| Preferred Contact Channel | Enumeration | Yes | `phone`, `kakaotalk`, `instagram`, `email` |
| Message | Text (Long) | No | Additional notes or questions |
| Status | Enumeration | Yes | `new`, `contacted`, `awaiting_info`, `approved`, `rejected`, `published` |
| Source | Enumeration | Yes | `website_form`, `email`, `kakaotalk`, `instagram` |
| Admin Notes | Text (Long) | No | Internal notes (not visible to public) |
| Linked Shop | Relation (→ Shop, nullable) | No | Link to the created shop listing once published |

#### 10.3.2 Inquiry Status Flow

`new` → `contacted` → `awaiting_info` → `approved` → `published`

| Status | Description |
|---|---|
| `new` | Inquiry received, not yet contacted |
| `contacted` | Admin has reached out to the shop owner |
| `awaiting_info` | Waiting for shop owner to provide required listing details |
| `approved` | Information verified, ready to create listing |
| `rejected` | Inquiry declined (with reason) |
| `published` | Shop listing is live on SWIDA |

**Public API:** The Partnership inquiry form submits to `POST /api/partnership-inquiries` — this is a public endpoint (no auth required). Strapi permissions are configured to allow `create` for the Public role on this content type only.

**Admin Capabilities (via Admin Web):**
- View all inquiries in a filterable list (by status, date, source)
- Add internal notes to each inquiry
- Update inquiry status
- Duplicate inquiry detection (custom policy: flag if same shop name + address already exists)
- Convert an approved inquiry directly into a new shop listing draft (custom admin action button)

#### 10.3.3 Response Target
Admin should aim to make first contact within **48 hours** of receiving a new inquiry.

### 10.4 Ongoing Communication
- Shop owners can request updates to their listing by contacting the Admin
- Admin periodically verifies that listed shops are still operational
- Inactive or closed shops are unpublished (reverted to `draft` status) with an `inactive_reason` set, and hidden from search results

---

## 11. Non-Functional Requirements

### 11.1 Performance
- Search results should load within 2 seconds under normal conditions
- Nearby search (GPS) should return results within 3 seconds
- The platform should support up to 10,000 concurrent users without degradation
- **Edge caching via Cloudflare:** Static assets and cacheable API responses served from Cloudflare PoPs in South Korea (Seoul, Busan), reducing latency for Korean users to single-digit milliseconds for cached content
- **Three-tier caching strategy:** Cloudflare edge cache (static assets, images) → Redis (API response cache at origin) → PostgreSQL (source of truth)

### 11.2 Responsiveness
- Fully responsive design optimized for mobile-first usage (estimated 80%+ mobile traffic)
- Consistent experience across iOS Safari, Android Chrome, and desktop browsers

### 11.3 SEO
- Each shop listing should have a unique, crawlable URL
- Proper meta tags, Open Graph data, and structured data (JSON-LD) for search engine visibility
- Korean-language SEO optimization for Naver and Google Korea
- **Crawler allowlisting:** Cloudflare bot management is configured to always allow verified Naver and Google crawlers without challenge. WAF rules include allowlists for `Yeti` (Naver) and `Googlebot` user agents with IP verification.
- **Automated `sitemap.xml` generation:** Next.js built-in sitemap generation, fetching active shops from Strapi API

**SEO Page Classification:**

Pages to be **indexed** (included in sitemap, crawlable) — both `/ko` and `/en` versions:
- Homepage (`/ko`, `/en`)
- Shop detail pages (`/ko/shop/{slug}`, `/en/shop/{slug}`)
- Location browse pages (`/ko/location/{level1}/{level2}`, `/en/location/{level1}/{level2}`)
- Theme browse pages (`/ko/theme/{theme-slug}`, `/en/theme/{theme-slug}`)
- Partnership page (`/ko/partnership`, `/en/partnership`)

Pages to be **excluded from indexing** (`noindex`, excluded from sitemap):
- Search results with filter parameters (`/[locale]/search?theme=...&location=...`)
- Review submission pages
- Login / signup pages
- All Admin Web pages (`admin.swida.com/*`)
- Strapi built-in admin panel (`api.swida.com/admin/*`) — developer-only, not publicly accessible

### 11.4 Localization (Path-Based Multi-Language)

SWIDA supports two languages using **path-based routing** in Next.js:

**Supported Locales:**

| Locale | Code | URL Prefix | Role |
|---|---|---|---|
| Korean (한국어) | `ko` | `/ko` | Default language — all content authored in Korean first |
| English | `en` | `/en` | Secondary language — for international visitors and expats |

**URL Structure:**

| Page | Korean (default) | English |
|---|---|---|
| Homepage | `www.swida.com/ko` | `www.swida.com/en` |
| Shop detail | `www.swida.com/ko/shop/{slug}` | `www.swida.com/en/shop/{slug}` |
| Theme browse | `www.swida.com/ko/theme/{theme-slug}` | `www.swida.com/en/theme/{theme-slug}` |
| Location browse | `www.swida.com/ko/location/{level1}/{level2}` | `www.swida.com/en/location/{level1}/{level2}` |
| Partnership | `www.swida.com/ko/partnership` | `www.swida.com/en/partnership` |

**Implementation — Next.js:**
- Next.js App Router `[locale]` dynamic segment with middleware-based locale detection
- Both locales use explicit URL prefixes: `/ko` for Korean, `/en` for English — no unprefixed routes
- Root path (`www.swida.com/`) redirects to `/ko` (default locale) via Next.js middleware
- `next-intl` or Next.js built-in i18n for message/string management
- Static UI strings (labels, buttons, navigation, system messages) stored in JSON translation files per locale (`messages/ko.json`, `messages/en.json`)
- Language switcher component available in the site header/navigation, linking to the equivalent page in the alternate locale using `hreflang` alternate URLs

**Implementation — Strapi (Content i18n):**
- Strapi's built-in **Internationalization (i18n) plugin** enabled for content types that require localized content
- Default locale set to `ko` in Strapi i18n configuration
- `en` added as an additional locale
- Admin creates content in Korean first, then optionally adds English translations via the Admin Web's locale switcher (which calls Strapi's i18n API)
- Customer Web requests content with the `locale` query parameter: `GET /api/shops?locale=ko` or `GET /api/shops?locale=en`

**Content Types with i18n Enabled:**

| Content Type | i18n Enabled | Localized Fields |
|---|---|---|
| Shop | Yes | Shop Name, Description, Address, Closed Days, Holiday Exceptions, Operating Hours, Open Tag, Close Tag |
| Theme | Yes | `name` field localized per locale (e.g., "스웨디시" in `ko`, "Swedish" in `en`) |
| Region | Yes | Region name (e.g., 서울특별시 / Seoul) |
| District | Yes | District name (e.g., 강남구 / Gangnam-gu) |
| Review | No | Reviews are stored in the language they were written — no translation |
| Partnership Inquiry | No | Submitted in the user's language — no translation needed |

**Fallback Behavior:**
- If English content is not available for a shop or content entry, the Customer Web falls back to displaying the Korean version with a subtle indicator (e.g., "이 내용은 아직 번역되지 않았습니다" / "This content is not yet translated")
- Strapi's i18n plugin supports fallback locale configuration — set `ko` as the fallback for `en`
- Non-localizable fields (latitude, longitude, phone number, images, ratings, booleans) are shared across locales automatically

**SEO for Multi-Language:**
- Each localized page includes `<link rel="alternate" hreflang="ko" href="..." />` and `<link rel="alternate" hreflang="en" href="..." />` tags
- Sitemap includes both locale versions of all indexed pages
- `x-default` hreflang points to the `/ko` (default) version
- Separate Open Graph and meta description tags per locale

**Admin Workflow:**
- Admin authors all content in Korean first (required)
- English translations are optional — admin can add them at any time via the Admin Web's locale management interface (which calls Strapi's i18n API)
- The Admin Web UI is in English (admin-facing, not customer-facing)

### 11.5 Security
- **Cloudflare edge protection:** DDoS mitigation, Web Application Firewall (WAF), bot management, and rate limiting at the edge — before traffic reaches the origin server
- **SSL/TLS:** Cloudflare handles public SSL termination (edge certificates). Origin connection secured via Cloudflare Full (Strict) mode with an origin certificate on Nginx, ensuring end-to-end encryption.
- **Strapi built-in admin panel authentication:** Developer-only access for monitoring and debugging (built-in, session-based with JWT). Access to Strapi's built-in admin panel (`api.swida.com/admin`) should be restricted via IP-whitelist or VPN to authorized developers only.
- **Admin Web authentication:** The Admin Web (Next.js) authenticates against Strapi's admin API (email/password, JWT-based). Only authorized admin users can log in — the Admin Web is not accessible to customers, shop owners, or developers without admin credentials.
- Customer authentication via Strapi Users & Permissions plugin with custom Kakao/Naver providers
- Strapi's built-in input sanitization and protection against XSS, SQL injection
- CSRF protection via Strapi middleware
- HTTPS enforced across all pages
- Strapi API rate limiting via middleware plugin (application-level, complementing Cloudflare edge rate limiting)
- **Origin IP protection:** The server's real IP is never exposed publicly. All DNS records are proxied through Cloudflare (orange cloud enabled). Direct origin access is blocked via Nginx `allow` rules restricted to Cloudflare IP ranges only.

### 11.6 Data Privacy
- Compliance with South Korea's Personal Information Protection Act (PIPA / 개인정보보호법)
- Clear privacy policy and terms of service
- Customer data (email, location) handled with proper consent and encryption

---

## 12. Future Considerations (Out of Scope for MVP)

These features are intentionally excluded from the initial release but are strong candidates for future iterations:

- **Bookmarks / Favorites:** Customer ability to save/bookmark favorite shops with a dedicated "My Saved Shops" page
- **Shop Owner Portal:** Self-service dashboard — could leverage Strapi's custom roles/permissions
- **Booking Integration:** In-app booking/reservation system connected to shop calendars
- **Paid Tiers:** Premium listing options (featured placement, highlighted badges, top-of-search positioning)
- **Push Notifications:** Alerts for new reviews, nearby deals, or saved shop updates
- **Coupon/Deals System:** Promotional offers and discount coupons managed by shops or Admin
- **Chat/Messaging:** In-app communication between customers and shop owners
- **Map View:** Visual map interface showing shop pins alongside list results
- **Analytics for Shops:** View counts, search impressions, and review analytics per listing
- **초성 Search:** Korean consonant-based search for faster name lookup (e.g., ㅅㅇㄷ → 스웨디시)
- **Advanced Korean Search:** Upgrade from `LIKE` to `pg_trgm` (PostgreSQL trigram extension) for fuzzy/typo-tolerant matching. If search demands grow further, introduce Meilisearch with built-in CJK tokenization.
- **Review Integrity Enhancements:** SMS verification for reviewer signup (via AlimTalk/Solapi), "Verified Customer" badge for receipt-photo reviews, cooldown periods (e.g., one review per shop per week per user), IP/device-level fraud detection, and behavioral pattern analysis to combat review bombing and spam.

---

## 13. Technical Architecture

> **Note:** Exact package versions, configuration details, and implementation specifics will be defined in the **Technical Specification Document (TSD)**.

### 13.1 Architecture Overview

SWIDA uses a **Headless CMS architecture** with Strapi as the API-only backend and two Next.js applications as frontends: a Customer Web for shop discovery and an Admin Web for platform management. Cloudflare sits in front of the origin server as the edge layer for CDN, security, and SSL.

| Component | Technology | Purpose |
|---|---|---|
| **Edge / CDN** | Cloudflare | DNS, CDN, DDoS protection, WAF, SSL termination, edge caching |
| **Backend (API-only)** | Strapi (v5, TypeScript) | Headless CMS, REST API, content management, authentication |
| **Customer Frontend** | Next.js 16 | Shop discovery, search, review submission |
| **Admin Frontend** | Next.js 16 | Custom admin dashboard, shop CRUD, review moderation, analytics |
| **Database** | PostgreSQL + PostGIS | Relational data + geospatial queries |
| **Object Storage** | MinIO (S3-compatible) | Image storage via Strapi Upload provider |
| **Cache** | Redis | API response caching at the origin |
| **Reverse Proxy** | Nginx | Internal routing, gzip, upstream load balancing |

> **Note:** Strapi's built-in admin panel is **restricted to developers only** for monitoring, debugging, and emergency operations — it is not used for day-to-day platform management. The Admin Web (Next.js) provides a custom-built, SWIDA-specific admin experience accessible only to authenticated admin users.

### 13.2 Backend — Strapi

Strapi serves as the **headless API-only backend**, providing the public REST API for both the Customer Web and the Admin Web. The built-in Strapi admin panel is **restricted to developers only** for monitoring, debugging, and emergency operations — the primary admin interface is the custom Admin Web (Next.js). Content types are defined via JSON schema files, and CRUD APIs are auto-generated. Custom business logic is implemented through controllers, lifecycle hooks, policies, and middlewares.

**Configuration:**

| Setting | Value |
|---|---|
| Language | TypeScript |
| Database | PostgreSQL (via Knex.js, Strapi's internal query builder) |
| Upload Provider | `@strapi/provider-upload-aws-s3` configured for MinIO |
| Auth | Users & Permissions plugin with custom Kakao/Naver providers |
| i18n | Internationalization plugin enabled — default locale `ko`, additional locale `en`. Enabled on Shop, Theme, Region, and District content types. |
| API Style | REST (default), GraphQL available as optional plugin |
| API Prefix | `/api` (Strapi default) |

**Custom Extensions:**

| Extension Type | Purpose |
|---|---|
| Custom Controller: `shops/nearby` | PostGIS-based nearby search endpoint |
| Custom Controller: `shops/search` | Advanced search with pg_trgm (future) |
| Custom Policy: `is-active-shop` | Leverages Strapi's built-in Draft & Publish system — only published shops are returned in public API responses. Strapi natively excludes draft entries from REST API queries, so this policy serves as an additional safeguard to ensure unpublished shops never leak into customer-facing endpoints. |
| Custom Middleware: `account-lock` | Admin can lock/suspend customer accounts that exhibit abusive behavior (spam reviews, fake reviews, etc.). Locked accounts cannot submit reviews or posts. |
| Lifecycle Hook: Review | Recalculate shop average_rating and total_reviews |
| Lifecycle Hook: Shop | Audit log on all changes (writes to `audit-log` collection type) |
| Custom Provider: Kakao Auth | Social login via Kakao |
| Custom Provider: Naver Auth | Social login via Naver |

> **Note:** Dashboard, map picker, and content hiding features that were previously planned as Strapi admin plugins are now implemented in the custom Admin Web (Next.js) application.

### 13.3 Frontend — Customer Web

| Setting | Value |
|---|---|
| Framework | Next.js 16 (latest stable) |
| CSS Framework | Tailwind CSS v4 |
| Component Library | Headless UI |
| Rendering Strategy | SSG + ISR hybrid |
| i18n | Path-based routing — `ko` (default), `en`. Both locales use explicit URL prefix (`/ko/...`, `/en/...`). `next-intl` |
| Data Fetching | Strapi REST API via `fetch` (with `locale` parameter) |

**Rendering Strategy:**
- **SSG (Static Site Generation):** Theme list pages, location browse pages, partnership page, shop detail pages — generated for both `ko` and `en` locales
- **ISR (Incremental Static Regeneration):** Shop detail pages with revalidation every 60 seconds — ensures content stays up-to-date (reviews, ratings, operating status) without requiring full rebuilds or per-request server rendering. Both locale versions are revalidated independently.
- **SSR (Server-Side Rendering):** Search results (dynamic filter/sort combinations make SSG impractical). Locale is passed via the `[locale]` route segment.
- **CSR (Client-Side):** Review submission form, nearby search (GPS-dependent)

### 13.3.1 Frontend — Admin Web

| Setting | Value |
|---|---|
| Framework | Next.js 16 (latest stable) |
| CSS Framework | Tailwind CSS v4 |
| Component Library | Headless UI |
| Rendering Strategy | SSR + CSR (dynamic admin interface) |
| Data Fetching | Strapi REST API + Strapi Admin API via `fetch` |
| Authentication | Admin JWT via Strapi admin API (`/admin/login`) |

The Admin Web is a custom-built Next.js application that replaces Strapi's built-in admin panel as the primary admin interface. It provides a tailored UX for SWIDA's admin workflows including shop CRUD, review moderation, partnership inquiry management, customer account management, and platform analytics dashboard.

**Access Control:** The Admin Web is served at a dedicated admin domain (`admin.swida.com`) and is accessible only to authenticated admin users. Customers, shop owners, and developers do not have access to the Admin Web — developers use the Strapi built-in admin panel for monitoring and debugging instead.

### 13.4 Database

- **RDBMS:** PostgreSQL (latest stable)
- **Schema Management:** Strapi manages schema automatically based on content type definitions. Strapi uses Knex.js internally for migrations.
- **Geolocation:** PostGIS extension for nearby search (used in custom controllers via raw SQL / Knex)
- **Korean Text Search (MVP):** Strapi's `$containsi` filter (uses `ILIKE` internally). For future scale, `pg_trgm` via custom controllers or Meilisearch as a dedicated search engine.

### 13.5 Infrastructure & DevOps

**Edge Layer — Cloudflare:**
- All public domains (`www.swida.com`, `api.swida.com`, `admin.swida.com`) are proxied through Cloudflare (orange cloud enabled)
- Cloudflare manages DNS, public SSL certificates, and edge caching
- **CDN & Edge Caching:** Static assets (JS, CSS, fonts, images) are cached at Cloudflare's edge PoPs closest to South Korean users. Cache-Control headers are set by Nginx/Next.js; Cloudflare respects them. Page Rules or Cache Rules can override for specific paths.
- **DDoS Protection:** Cloudflare's automatic L3/L4/L7 DDoS mitigation is always on (free tier included)
- **WAF (Web Application Firewall):** Cloudflare Managed Rulesets enabled to block common OWASP threats (SQLi, XSS, RCE) at the edge before they reach the origin
- **Bot Management:** Challenge suspicious automated traffic. Configured to allow legitimate bots (Naver crawler, Googlebot) while blocking scrapers and credential stuffers
- **Rate Limiting:** Edge-level rate limiting rules for sensitive endpoints (e.g., `/api/auth/*`, `/api/reviews`, `/api/partnership-inquiries`) to complement Strapi-level rate limiting
- **SSL Mode:** Full (Strict) — Cloudflare encrypts traffic to the origin using a Cloudflare Origin Certificate installed on Nginx. No plaintext between Cloudflare and the server.
- **Image Optimization (optional):** Cloudflare Polish and/or Cloudflare Images can optimize MinIO-served shop photos (WebP conversion, resizing) at the edge — reducing origin bandwidth and improving mobile load times. Evaluate during MVP based on plan tier.

**Reverse Proxy — Nginx (Origin):**
- Nginx sits behind Cloudflare as the internal reverse proxy on the origin server
- Routes traffic to the appropriate upstream service:
  - `admin.swida.com` → Admin Web (Next.js) — accessible only to authenticated admin users
  - `api.swida.com` → Strapi (public REST API + admin API)
  - `www.swida.com` → Customer Web (Next.js)
- **Strapi admin panel access restriction:** The Strapi built-in admin panel (`api.swida.com/admin`) is restricted to developers only. Nginx is configured to limit access to `/admin` paths via IP-whitelist (developer IPs or VPN range only). This ensures the Strapi admin panel is used exclusively for monitoring and debugging, not for day-to-day operations.
- **Origin access restriction:** Nginx is configured to accept connections only from Cloudflare IP ranges (`allow` directives using Cloudflare's published IP list). All other source IPs are denied, preventing direct-to-origin attacks.
- Gzip compression for responses (Cloudflare also compresses at edge, Nginx handles origin compression)
- Nginx acts as a caching proxy for MinIO image delivery (origin-level cache, complementing Cloudflare edge cache)
- Cloudflare Origin Certificate installed for Full (Strict) SSL

**Object Storage:**
- MinIO (self-hosted, S3-compatible) for storing all shop images and thumbnails
- Strapi Upload plugin configured with S3-compatible provider pointing to MinIO
- PostgreSQL stores only image URL references (Strapi handles this automatically)
- MinIO runs as a Docker container alongside other services

**Caching:**
- Redis (self-hosted in Docker) for caching high-traffic, read-heavy API responses
- Implemented via `strapi-plugin-rest-cache` or custom Strapi middleware
- Cached data includes: region/district lists, theme lists, top-rated shops, frequently accessed shop details
- Cache invalidation triggered by Strapi lifecycle hooks on relevant content type changes

**Containerization:**
- All origin services (Strapi, Customer Web, Admin Web, PostgreSQL, MinIO, Redis, Nginx) containerized with Docker
- `docker-compose` for local development environment
- Production orchestration strategy defined in TSD
- Cloudflare is an external SaaS service — not containerized, configured via Cloudflare Dashboard or API

**CI/CD:**
- Repository hosted on GitLab
- GitLab CI pipelines for automated build, lint, test, and deployment
- Pipeline stages: `lint` → `test` → `build` → `deploy`
- Environment branches: `develop`, `staging`, `main` (production)

### 13.6 Code Quality & Standards

**Linting:**
- ESLint with recommended configuration
- Prettier for consistent code formatting
- Shared config across Strapi customizations, Customer Web, and Admin Web

**Commit Conventions:**
- Husky for Git hooks (pre-commit, commit-msg)
- Conventional Commits format enforced (e.g., `feat:`, `fix:`, `chore:`, `docs:`)
- lint-staged to run linters only on staged files

### 13.7 Testing

**Development Methodology:** Test-Driven Development (TDD) — tests are written before implementation code.

| Layer | Tool | Scope |
|---|---|---|
| **Unit Tests** | Vitest | Custom controllers, services, lifecycle hooks, utilities |
| **Integration Tests** | Vitest + Supertest | Strapi API endpoints, custom routes, policy enforcement |
| **E2E Tests** | Playwright | Full user flows (search, review submission, admin CRUD via Admin Web) |

**Coverage Targets:**
- Unit + Integration: ≥ 80% line coverage
- E2E: Critical user paths fully covered (search flows, review flow, admin shop management)

### 13.8 Repository Structure

**Monorepo Tooling:**
- **Package Manager:** pnpm (workspace protocol for internal dependencies)
- **Build Orchestrator:** Turborepo (parallel builds, remote caching, task dependency graph)
- **Workspace Layout:** `apps/*` for deployable applications, `packages/*` for shared libraries

```
swida/
├── apps/
│   ├── strapi/                  # Strapi CMS (Headless API-only Backend)
│   │   ├── config/              # Strapi configuration (database, plugins, middleware, server)
│   │   │   └── plugins.ts       # Plugin config — includes i18n (default locale: ko, additional: en)
│   │   ├── src/
│   │   │   ├── api/             # Content type schemas, controllers, routes, services, policies
│   │   │   │   ├── shop/
│   │   │   │   │   ├── content-types/shop/schema.json
│   │   │   │   │   ├── controllers/shop.ts
│   │   │   │   │   ├── routes/shop.ts
│   │   │   │   │   ├── services/shop.ts
│   │   │   │   │   └── policies/
│   │   │   │   ├── review/
│   │   │   │   ├── theme/
│   │   │   │   ├── region/
│   │   │   │   ├── district/
│   │   │   │   ├── audit-log/
│   │   │   │   └── partnership-inquiry/
│   │   │   ├── components/      # Reusable Strapi components
│   │   │   │   ├── shop/
│   │   │   │   │   ├── service-menu-item.json
│   │   │   │   │   ├── amenities.json
│   │   │   │   │   └── contact-channels.json
│   │   │   ├── extensions/      # Plugin extensions (users-permissions for Kakao/Naver)
│   │   │   ├── middlewares/     # Custom middlewares (rate limiting, caching, account-lock)
│   │   │   └── plugins/         # Reserved for future Strapi plugins
│   │   ├── database/
│   │   │   └── seeds/           # Seed data (regions, districts, themes)
│   │   ├── public/              # Static files
│   │   └── package.json
│   │
│   ├── admin-web/               # Next.js — Admin dashboard & management app
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Dashboard (redirect to /dashboard)
│   │   │   ├── login/
│   │   │   │   └── page.tsx     # Admin login
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     # Platform statistics overview
│   │   │   ├── shops/
│   │   │   │   ├── page.tsx     # Shop listing & management
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx # Create new shop
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Edit shop detail
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx     # Review moderation
│   │   │   ├── themes/
│   │   │   │   └── page.tsx     # Theme management
│   │   │   ├── locations/
│   │   │   │   └── page.tsx     # Region & district management
│   │   │   ├── inquiries/
│   │   │   │   └── page.tsx     # Partnership inquiry management
│   │   │   ├── users/
│   │   │   │   └── page.tsx     # Customer account management
│   │   │   └── audit-log/
│   │   │       └── page.tsx     # Audit log viewer
│   │   ├── components/          # Admin-specific React components
│   │   ├── lib/                 # API client, utilities, hooks
│   │   │   └── strapi-admin.ts  # Strapi Admin API client wrapper
│   │   ├── public/              # Static assets
│   │   └── package.json
│   │
│   └── customer-web/            # Next.js — Customer discovery app
│       ├── app/
│       │   └── [locale]/          # Dynamic locale segment (ko, en)
│       │       ├── layout.tsx     # Root layout with locale provider
│       │       ├── page.tsx       # Homepage
│       │       ├── shop/
│       │       │   └── [slug]/
│       │       │       └── page.tsx
│       │       ├── theme/
│       │       │   └── [theme-slug]/
│       │       │       └── page.tsx
│       │       ├── location/
│       │       │   └── [level1]/
│       │       │       └── [level2]/
│       │       │           └── page.tsx
│       │       ├── search/
│       │       │   └── page.tsx
│       │       └── partnership/
│       │           └── page.tsx
│       ├── components/          # React components
│       ├── lib/                 # API client, utilities, hooks
│       │   └── strapi.ts        # Strapi API client wrapper (passes locale param)
│       ├── messages/            # i18n translation files
│       │   ├── ko.json          # Korean UI strings (default)
│       │   └── en.json          # English UI strings
│       ├── middleware.ts        # Locale detection, redirect `/` → `/ko`
│       ├── i18n.ts              # next-intl configuration (locales, default locale)
│       ├── public/              # Static assets
│       └── package.json
│
├── packages/
│   ├── shared-types/            # Shared TypeScript types/interfaces (Strapi response types)
│   ├── shared-utils/            # Shared utility functions
│   └── eslint-config/           # Shared ESLint + Prettier config
│
├── docker/
│   ├── docker-compose.yml       # Local dev environment (Strapi, Customer Web, Admin Web, PostgreSQL, MinIO, Redis)
│   ├── docker-compose.prod.yml  # Production compose
│   ├── Dockerfile.strapi        # Strapi Dockerfile
│   ├── Dockerfile.web           # Next.js Dockerfile (shared for both Customer Web and Admin Web)
│   └── Dockerfile.admin         # Next.js Admin Web Dockerfile (if separate config needed)
│
├── nginx/
│   └── nginx.conf               # Reverse proxy configuration
│
├── .gitlab-ci.yml               # CI/CD pipeline definition
├── .husky/                      # Git hooks
├── turbo.json                   # Turborepo pipeline configuration
├── pnpm-workspace.yaml          # pnpm workspace definition
├── package.json                 # Root workspace config
└── README.md
```

### 13.9 Environment Configuration

All services use environment variables for configuration, managed via `.env` files per environment:

| Variable Category | Examples |
|---|---|
| **Database** | `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_SSL` |
| **Strapi** | `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET` |
| **Auth (Customer)** | `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` |
| **Server** | `HOST`, `PORT`, `NODE_ENV`, `URL` (public Strapi URL) |
| **Object Storage** | `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET_NAME` |
| **Cache** | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` |
| **Cloudflare** | `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN` (for programmatic cache purge via CI/CD or Strapi lifecycle hooks) |
| **External** | `GOOGLE_MAPS_API_KEY` (for geocoding) |

Environment files are **never committed** to the repository. A `.env.example` template is maintained for each project.

### 13.10 Strapi-Specific Considerations

**Content Type Naming Conventions:**
- Collection types: kebab-case singular (e.g., `shop`, `review`, `theme`, `region`, `district`, `partnership-inquiry`)
- Components: namespaced (e.g., `shop.service-menu-item`, `shop.amenities`, `shop.contact-channels`)

**API Response Optimization:**
- Use Strapi's `populate` and `fields` parameters to control response payload size
- Avoid deep population by default — only populate required relations per endpoint
- Customer Web should request only the fields needed for each view (list vs. detail)

**Strapi Version & Upgrade Strategy:**
- Use Strapi v5 (latest stable) with TypeScript
- Pin major version in `package.json`
- Follow Strapi's official migration guides for upgrades
