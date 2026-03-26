# scope-audit-failure

Failure simulator — for every feature/flow, asks "what breaks?" and flags when the docs don't answer.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/swida/` directory.

## Task

Simulate real-world breakdowns for every user-facing flow. For each issue, output a line in this exact format:

```
[FAIL] <severity> | <file-path>:<line-number> | <description>
```

Severity is one of: `critical`, `warning`, `info`.

## Doc Structure

SWIDA docs are at `docs/swida/` with:
- `prd/` — Product Requirements Document. Defines features and business rules.
- `tsd/` — Technical Specification. Defines APIs, data structures, third-party integrations.
- `fsd/` — Functional Specifications (Admin Web + Customer Web). Define features, validation, storyboards.
- `uiux/` — UI/UX Specifications (Admin Web + Customer Web). Define wireframes and interactions.

Audit EN files only.

## Checks

For each user-facing flow defined in FSD (auth, search, review, partnership, shop CRUD, etc.):

### 1. Network Failures

- API call fails mid-flow. Is retry behavior defined? Does the user see an error? Can they resume?
- Look for: error handling sections, toast notification definitions, retry mechanisms
- Focus on: form submissions (sign up, review, partnership inquiry), search requests, OAuth callbacks

### 2. Partial Failures

- Multi-step operation succeeds halfway. Is rollback or recovery defined?
- Examples: review submitted but rating recalculation fails; shop published but notification fails; sign up succeeds but auto-login fails
- Look for: lifecycle hooks, multi-step storyboards, operations that trigger side effects

### 3. Third-Party Failures

- Kakao/Naver OAuth provider down — is there a fallback or error message?
- KakaoMap API unreachable — is there a fallback for map-dependent features?
- Email service down — password reset email fails to send. User feedback?
- Look for: third-party dependencies in TSD, OAuth flows in FSD, map features in UIUX

### 4. Data Integrity Failures

- Referenced entity deleted: shop deleted but reviews remain; theme deleted but shops tagged; user deleted but reviews exist
- Look for: cascade/protect rules in PRD data model, lifecycle hooks in TSD
- Flag when deletion cascading is undefined

### 5. Timeout Scenarios

- Long-running operations: nearby search with PostGIS, image upload, bulk admin operations
- Look for: timeout limits, loading states, user feedback during long operations
- Flag when timeout behavior is not defined for operations that could be slow

### 6. Capacity Failures

- 10,000 reviews on one shop — does pagination handle this?
- 500 search results — is there a max results limit?
- Bulk admin operations — is there a batch limit?
- Flag when capacity limits are not defined for operations that could grow unbounded

## Severity Rules

- **critical**: Auth or data-mutating flow with no failure handling defined (e.g., OAuth callback failure with no recovery)
- **warning**: User-facing flow with no error state or recovery path
- **info**: Admin-only flow or edge case with missing failure handling

## Precision Policy

Only report findings where you have high confidence that a real failure scenario is unaddressed. Skip trivially handled cases (e.g., if the FSD has a global error handling rule in §1.3 that covers the scenario). A shorter, accurate report is better than a long, noisy one.

## Output

- Print each issue as a `[FAIL]` line
- If no issues found, print: `[FAIL] All clear — no unhandled failure scenarios found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files
