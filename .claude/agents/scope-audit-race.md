# scope-audit-race

Race condition detector — finds concurrent access scenarios the docs don't address. Two users, two admins, or user + system acting on the same resource simultaneously.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/swida/` directory.

## Task

For each write operation defined in FSD and TSD, analyze what happens when two actors perform it simultaneously. For each issue, output a line in this exact format:

```
[RACE] <severity> | <file-path>:<line-number> | <description>
```

Severity is one of: `critical`, `warning`, `info`.

## Doc Structure

SWIDA docs are at `docs/swida/` with `prd/`, `tsd/`, `fsd/`, `uiux/` subdirectories. Audit EN files only.

## Checks

### 1. Admin-Admin Races

- Two admins edit the same shop simultaneously — is there optimistic locking, last-write-wins, or nothing?
- Two admins moderate the same review (one hides, one approves) — which wins?
- Two admins change the same inquiry status — both click "Approve" at the same time
- Look for: locking strategies, version fields, conflict detection in FSD Admin and TSD

### 2. User-Admin Races

- User submits a review while admin is hiding/unpublishing the shop — does the review get created for a hidden shop?
- User submits partnership inquiry while admin is approving a previous one from the same business — duplicate?
- Admin locks user account while user is mid-review-submit — does the review save?

### 3. User-User Races

- Two users report the same review simultaneously — does report count increment correctly? Is it atomic?
- Two users register with the same display name at the same time — is uniqueness enforced atomically at the database level?
- Two users submit reviews for the same shop simultaneously — are both created? Is rating recalculation correct?

### 4. User-System Races

- User edits a review while the system is auto-transitioning it to under_review (from report threshold) — which state wins?
- Session expires while user is mid-form-submit — is the submission lost or processed?
- Strapi lifecycle hook fires while admin is editing the same record — data consistency?

### 5. Read-Write Races

- User is viewing shop detail while admin unpublishes it — does the user see a 404? Stale data? Error message?
- Customer is browsing review feed while a review gets hidden — does it disappear mid-scroll or on next page load?
- Look for: caching strategies in TSD (ISR, SSR, SSG), stale data policies

### 6. Counter/Aggregate Races

- Two reviews posted simultaneously for the same shop — rating recalculation (lifecycle hook) fires twice concurrently. Is the average rating correct?
- Review count and average rating are derived values — are they recalculated atomically?
- Look for: lifecycle hooks in PRD/TSD, aggregate recalculation descriptions

## Severity Rules

- **critical**: Data corruption possible (duplicate accounts, wrong rating calculation, lost state transitions)
- **warning**: User experience issue (stale data shown, confusing error) but no data corruption
- **info**: Unlikely scenario or admin-only race with low impact

## Precision Policy

Focus on races that are likely to occur in production, not theoretical edge cases. A race between two admins editing the same shop is likely. A race between three users all registering the same display name at the exact same millisecond is unlikely.

## Output

- Print each issue as a `[RACE]` line
- If no issues found, print: `[RACE] All clear — no race condition risks found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files
