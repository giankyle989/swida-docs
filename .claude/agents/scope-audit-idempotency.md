# scope-audit-idempotency

Idempotency checker — flags operations where duplicate/retry execution could cause problems and the docs don't address it.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/swida/` directory.

## Task

Scan all API endpoints (from TSD), form submissions (from FSD/UIUX), and state-changing actions for idempotency risks. For each issue, output a line in this exact format:

```
[IDEM] <severity> | <file-path>:<line-number> | <description>
```

Severity is one of: `critical`, `warning`, `info`.

## Doc Structure

SWIDA docs are at `docs/swida/` with:
- `prd/` — Product Requirements Document.
- `tsd/` — Technical Specification. Lists API endpoints, HTTP methods, lifecycle hooks.
- `fsd/` — Functional Specifications (Admin Web + Customer Web). Define form submissions, feature codes, storyboards.
- `uiux/` — UI/UX Specifications (Admin Web + Customer Web). Define button behaviors, modals, user flows.

Audit EN files only.

## Checks

### 1. Form Double-Submit

- Identify all form submission flows in FSD (sign up, review submit, partnership inquiry, password reset request, login)
- For each: is the submit button disabled after first click? Is server-side deduplication defined?
- Look for: "disabled", "loading state", "debounce" in UIUX interaction descriptions
- Flag when no double-submit protection is mentioned for a write operation

### 2. Webhook/Callback Replay

- OAuth callback (FSD §3.2) — if Kakao/Naver calls the callback URL twice, what happens?
- Password reset token (FSD §3.6) — is the token marked single-use? What if the user clicks the link twice?
- Look for: "single-use", "consumed", "invalidated" language around tokens and callbacks

### 3. State Transition Replay

- Admin publishes an already-published shop — no-op or error?
- Admin approves an already-approved inquiry — no-op or error?
- User submits a review for a shop they already reviewed — allowed or blocked?
- Look for: pre-condition checks in FSD storyboards, "if already in state X" clauses

### 4. Email/Notification Re-Send

- Password reset requested multiple times — are multiple emails sent? Rate limiting?
- Look for: rate limits, deduplication, "max N per hour" language
- Note: FSD §3.6.1 defines "max 3 reset requests per email per hour" — verify this is the only flow needing rate limits

### 5. Concurrent Write Conflicts

- Two admins edit the same shop simultaneously — last-write-wins? Optimistic locking? Error?
- Two admins change the same inquiry status — race to transition
- Look for: locking strategies, conflict resolution, "if modified since" patterns
- Flag when concurrent writes are possible but no strategy is defined

### 6. Retry-Safe API Design

- Extract POST endpoints from TSD that create resources
- For each: is there an idempotency key? A unique constraint that prevents duplicates?
- Email uniqueness on sign up is one example — check for others
- Flag POST endpoints with no duplicate-prevention mechanism

## Severity Rules

- **critical**: Auth operation (sign up, password reset) with no idempotency safeguard, or token/callback with no single-use enforcement
- **warning**: User-facing write operation with no double-submit protection
- **info**: Admin operation or read-heavy flow with minor duplication risk

## Precision Policy

Prioritize precision over recall. If a global rule (e.g., FSD §1.3 error handling) already covers a scenario, don't flag it. Only flag clear gaps.

## Output

- Print each issue as an `[IDEM]` line
- If no issues found, print: `[IDEM] All clear — no idempotency risks found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files
