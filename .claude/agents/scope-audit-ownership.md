# scope-audit-ownership

Ownership mapper — for every feature, forces clarity on who owns it: frontend, backend, system, or third-party. Flags ambiguous or missing ownership.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/swida/` directory.

## Task

For each feature defined in FSD and PRD, determine if the responsible system component is clearly identified. For each issue, output a line in this exact format:

```
[OWNER] <severity> | <file-path>:<line-number> | <description>
```

Severity is one of: `critical`, `warning`, `info`.

## Doc Structure

SWIDA docs are at `docs/swida/` with `prd/`, `tsd/`, `fsd/`, `uiux/` subdirectories. Audit EN files only.

The tech stack is: Next.js (frontend, SSR/SSG/ISR), Strapi (headless CMS backend, API), PostgreSQL + PostGIS (database), Kakao/Naver (OAuth), KakaoMap (maps), email service (password reset).

## Checks

### 1. Frontend vs Backend Ambiguity

- For each validation rule in FSD: does it specify where validation happens? Client-side, server-side, or both?
- "Validate email format" — if it just says "valid email format" without specifying client/server, flag it
- Auth-related validation MUST have server-side — flag if only client-side is mentioned
- Look for: input constraint tables in FSD, "real-time" (suggests client), "server validation errors" (suggests server)

### 2. Rendering Responsibility

- TSD defines rendering strategies (SSR, SSG, ISR) per page type
- FSD features should be implementable with the assigned rendering strategy
- Flag features that seem incompatible: e.g., real-time data on an SSG page, user-specific data on an ISR page
- Look for: rendering strategy table in TSD, page list in FSD

### 3. Computation Location

- Rating recalculation: PRD says "Strapi lifecycle hooks". Is this clear enough for implementation?
- Open/Close tag determination: who computes it? Frontend on render? Backend in API response? Scheduled job?
- Search result ranking/sorting: database query? API layer? Frontend?
- Look for: "computed", "calculated", "determined" language without specifying where

### 4. Third-Party Dependency Ownership

- KakaoMap: who handles API key management? Rate limits? Fallback if API is down?
- Kakao/Naver OAuth: who monitors provider uptime? Who handles token refresh failures?
- Email service: who manages deliverability? Who monitors bounce rates?
- Flag when a third-party dependency is used but failure ownership is undefined

### 5. Data Ownership

- Source of truth for each entity: Strapi CMS is the general answer, but are there caching layers?
- Search filters live in URL (FSD says so) — is the frontend or backend responsible for parsing/validating them?
- Session data: browser storage, but who validates session integrity?
- Flag when source-of-truth is ambiguous for an entity or data flow

### 6. Trigger Ownership

- State transitions: "Review enters under_review" — triggered by frontend report button? Backend threshold check? Strapi lifecycle hook?
- "Notification is sent" — sent by whom? Strapi plugin? External service? Backend API?
- "Rating is recalculated" — when exactly? On every review CRUD? Batched?
- Flag when the trigger mechanism is described but the owning component is not

### 7. Missing "Who"

- Scan for passive voice in FSD/TSD: "the system does X", "X is performed", "validation occurs"
- These phrases hide ownership — flag when the acting component is unclear
- Only flag in implementation-level docs (FSD, TSD), not PRD (which is allowed to be abstract)

## Severity Rules

- **critical**: Auth or data-mutating feature with ambiguous ownership (could lead to security gaps or missed validation)
- **warning**: Feature with unclear frontend/backend split (leads to implementation confusion or duplicated logic)
- **info**: Minor ambiguity in non-critical features, or passive voice that's clear from context

## Output

- Print each issue as an `[OWNER]` line
- If no issues found, print: `[OWNER] All clear — no ownership ambiguity found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files
