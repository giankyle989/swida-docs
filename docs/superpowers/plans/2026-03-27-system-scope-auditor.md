# SystemScopeAuditor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a `/scope-audit` skill with orchestrator + 8 subagents that audit SWIDA documentation for production-readiness gaps.

**Architecture:** Mirrors the existing `docs-review` pattern — a SKILL.md slash command triggers an orchestrator agent that dispatches 8 specialized subagents in parallel, collects findings, and produces a severity-sorted unified report.

**Tech Stack:** Claude Code agents (markdown), Claude Code skills (markdown with YAML frontmatter)

---

## File Structure

```
.claude/
  skills/
    scope-audit/
      SKILL.md                          # Slash command definition
  agents/
    scope-audit.md                      # Orchestrator
    scope-audit-gap.md                  # [SCOPE] scope_gap_audit
    scope-audit-failure.md              # [FAIL] failure_simulator
    scope-audit-idempotency.md          # [IDEM] idempotency_checker
    scope-audit-state.md                # [STATE] state_machine_validator
    scope-audit-race.md                 # [RACE] race_condition_detector
    scope-audit-behavior.md             # [BEHAV] user_behavior_simulator
    scope-audit-ownership.md            # [OWNER] ownership_mapper
    scope-audit-observability.md        # [OBSERV] observability_checker
```

---

### Task 1: Create the skill definition (`SKILL.md`)

**Files:**
- Create: `.claude/skills/scope-audit/SKILL.md`

- [ ] **Step 1: Create the skill file**

```markdown
---
name: scope-audit
description: Run a production-readiness audit on SWIDA documentation. Finds design gaps, missing failure handling, race conditions, state machine issues, and more. Invoke manually for a full sweep or targeted scan.
---

# Scope Audit

Run a production-readiness audit on SWIDA documentation.

## Usage

- `/scope-audit` — Full sweep of all docs under `docs/swida/`
- `/scope-audit docs/swida/fsd` — Targeted scan of a specific directory
- `/scope-audit docs/swida/fsd/SWIDA_FSD_Customer_Web_EN.md` — Targeted scan of a single file
- `/scope-audit --only race,state` — Run specific checks only

## What It Checks

- **Scope Gaps** `[SCOPE]` — Missing specs, vague requirements, coverage holes between PRD/FSD/TSD/UIUX
- **Failure Simulation** `[FAIL]` — Unhandled errors, no retry/recovery, third-party failures
- **Idempotency** `[IDEM]` — Double-submit, replay attacks, duplicate creation risks
- **State Machines** `[STATE]` — Stuck states, missing transitions, state conflicts across docs
- **Race Conditions** `[RACE]` — Concurrent access, data corruption, stale reads
- **User Behavior** `[BEHAV]` — Spam clicks, back button, multi-tab, stale pages, input abuse
- **Ownership** `[OWNER]` — Ambiguous frontend/backend/system responsibility
- **Observability** `[OBSERV]` — No audit trail, no error tracing, no logging

## How to Run

Dispatch the `scope-audit` orchestrator agent with the scope and options from the user's command. The orchestrator handles subagent dispatch and report generation.

If the user provided a path argument, pass it as `scope`. If `--only` was specified, pass the skill list as `only`. If no arguments, use scope "all".

## Valid `--only` values

`gap`, `failure`, `idempotency`, `state`, `race`, `behavior`, `ownership`, `observability`
```

- [ ] **Step 2: Verify the file exists and has correct frontmatter**

Read `.claude/skills/scope-audit/SKILL.md` and confirm the `name` and `description` fields are in the YAML frontmatter.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/scope-audit/SKILL.md
git commit -m "feat: add /scope-audit skill definition"
```

---

### Task 2: Create the orchestrator agent (`scope-audit.md`)

**Files:**
- Create: `.claude/agents/scope-audit.md`

- [ ] **Step 1: Create the orchestrator agent file**

```markdown
# scope-audit

Orchestrator agent for production-readiness audit of SWIDA documentation. Dispatches specialized subagents and collects results into a severity-sorted unified report.

## Input

You will receive:
- `scope` — "all" for full sweep, or a specific path (file or directory) for targeted scan
- `only` (optional) — comma-separated list of skills to run (e.g., "race,state,idempotency"). If omitted, run all eight.

## Skill-to-Agent Mapping

| Skill name | Agent file | Tag |
|---|---|---|
| gap | scope-audit-gap | [SCOPE] |
| failure | scope-audit-failure | [FAIL] |
| idempotency | scope-audit-idempotency | [IDEM] |
| state | scope-audit-state | [STATE] |
| race | scope-audit-race | [RACE] |
| behavior | scope-audit-behavior | [BEHAV] |
| ownership | scope-audit-ownership | [OWNER] |
| observability | scope-audit-observability | [OBSERV] |

## Task

1. **Determine file list.** If scope is "all", find all `.md` files under `docs/swida/`. If scope is a directory, find all `.md` files in it. If scope is a file, use that single file. If scope is outside `docs/swida/`, print a warning and exit.

2. **Dispatch subagents.** Launch subagents using the Agent tool. Dispatch all independent subagents in parallel (multiple Agent calls in one message). If `only` is specified, dispatch only those subagents.

   Each subagent receives a prompt containing:
   - The scope (file list)
   - The doc structure context: "SWIDA docs are at `docs/swida/` with subdirectories: `prd/` (Product Requirements), `tsd/` (Technical Spec), `fsd/` (Functional Specs — Admin Web and Customer Web), `uiux/` (UI/UX Specs — Admin Web and Customer Web). Each has EN and KO versions; audit EN files only."
   - Instructions to return findings in the standard format: `[TAG] <severity> | <file-path>:<line-number> | <description>`

3. **Collect results.** Wait for all subagents to complete.

4. **Merge and sort.** Parse all subagent findings. Group by severity: critical first, then warning, then info. Within each severity group, preserve the tag order.

5. **Print unified report** in this format:

```
## Scope Audit Report

**Scope:** [Full sweep | Targeted: <path>]
**Files scanned:** <count>
**Skills run:** <comma-separated list of skills run>

### Summary
<total> issues found: <N> critical, <N> warning, <N> info

### Critical
[TAG] <file>:<line> — <description>
[TAG] <file>:<line> — <description>
...

### Warning
[TAG] <file>:<line> — <description>
...

### Info
[TAG] <file>:<line> — <description>
...
```

6. **Handle failures.** If a subagent fails or errors, report the failure and continue with results from other subagents. Example: `scope-audit-race encountered an error: <message>. Skipping race condition checks.`

7. **Zero issues.** If all subagents report no issues, print:

```
## Scope Audit Report

**Scope:** [scope]
**Files scanned:** <count>

All clear — no issues found across all production-readiness checks.
```

## Important

- Do NOT fix any issues — report only
- The report is advisory — the user decides what to fix
- Use EN files only for auditing (KO mirrors EN)
- Use the Read tool, Glob tool, and Grep tool to examine files
```

- [ ] **Step 2: Verify the file**

Read `.claude/agents/scope-audit.md` and confirm the structure matches the existing `docs-review.md` orchestrator pattern.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/scope-audit.md
git commit -m "feat: add scope-audit orchestrator agent"
```

---

### Task 3: Create subagent — `scope-audit-gap.md` (Scope Gap Audit)

**Files:**
- Create: `.claude/agents/scope-audit-gap.md`

- [ ] **Step 1: Create the agent file**

```markdown
# scope-audit-gap

Scope gap auditor — finds missing definitions, vague requirements, and coverage holes between SWIDA documentation.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/swida/` directory.

## Task

Detect coverage gaps and vague requirements across all documentation. For each issue, output a line in this exact format:

```
[SCOPE] <severity> | <file-path>:<line-number> | <description>
```

For cross-doc issues:

```
[SCOPE] <severity> | <file>:<line> → <other-file>:<line> | <description>
```

Severity is one of: `critical`, `warning`, `info`.

## Doc Structure

SWIDA docs are at `docs/swida/` with:
- `prd/` — Product Requirements Document (EN/KO). Defines MVP scope, features, data models.
- `tsd/` — Technical Specification Document (EN/KO). Defines API endpoints, data structures, rendering strategies.
- `fsd/` — Functional Specification Documents: `SWIDA_FSD_Admin_Web_EN.md` and `SWIDA_FSD_Customer_Web_EN.md`. Define page lists, feature codes (F-XXX-NN), input constraints, validation rules, storyboards.
- `uiux/` — UI/UX Specifications: `SWIDA_UIUX_Spec_Admin_Web_EN.md` and `SWIDA_UIUX_Spec_Customer_Web_EN.md`. Define wireframes, layouts, interactions, tier adaptations.

Audit EN files only (KO mirrors EN).

## Checks (in priority order)

### 1. PRD → FSD Coverage (highest priority)

- Extract all MVP features listed in PRD (§1.2 MVP Scope table, feature sections §3–§12)
- For each feature, check that a corresponding FSD section exists with feature codes
- Flag MVP features with zero FSD coverage as critical
- Flag features with partial coverage (mentioned but no feature codes or field constraints) as warning

### 2. UIUX → FSD Coverage

- Extract all pages and interactive flows from UIUX specs
- For each page, check that the FSD has a matching section with feature codes
- Flag pages with zero FSD coverage as warning (unless they are explicitly noted as deferred/future in the UIUX spec itself)
- Ignore sections already marked as deferred (check for notes like "Not in current FSD", "deferred", "future scope", "FSD Appendix D")

### 3. FSD → UIUX Coverage

- Extract all FSD page list entries and feature codes
- For each page, check that the UIUX spec has a matching section
- Flag FSD pages with no UIUX representation as info

### 4. Vague Requirements

- Scan all docs for vague language: "appropriate", "as needed", "TBD", "TODO", "etc.", "should be handled", "to be determined", "may", "if applicable"
- Flag these in spec-level docs (FSD, TSD) as warning — these become ambiguous implementation instructions
- Flag these in PRD as info — PRD is allowed to be less specific

### 5. Missing Error States

- For each user-facing feature in FSD (identified by feature codes starting with F-), check if error/failure states are defined
- Features that only describe the happy path with no error handling → warning
- Auth and data-mutating features with no error states → critical

### 6. Missing Field Constraints

- Extract input field tables from FSD (registration, search, review submission, partnership inquiry, etc.)
- Flag fields with no validation rules (no min/max, no format, no required/optional) as warning
- Flag data model fields in PRD that have no corresponding FSD constraint table as info

### 7. Undefined Edge Cases

- For list/collection features: is empty state defined? Is max capacity addressed?
- For search: is zero-results behavior defined?
- For pagination: is last-page behavior defined?
- Flag missing edge case definitions as info

## Severity Rules

- **critical**: MVP feature in PRD with zero FSD coverage, or auth/data feature with no error states
- **warning**: Feature exists but is vague/incomplete, UIUX defines something with no FSD, missing field constraints
- **info**: Minor omissions, nice-to-have clarifications, PRD-level vagueness

## Precision Policy

Prioritize precision over recall. Only report findings where you have high confidence of an actual gap. Skip ambiguous or uncertain matches. A shorter, accurate report is better than a long, noisy one.

## Output

- Print each issue as a `[SCOPE]` line
- If no issues found, print: `[SCOPE] All clear — no scope gaps found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files
```

- [ ] **Step 2: Verify the file**

Read `.claude/agents/scope-audit-gap.md` and confirm the structure matches the existing subagent pattern (e.g., `docs-xref.md`).

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/scope-audit-gap.md
git commit -m "feat: add scope-audit-gap subagent (scope gap audit)"
```

---

### Task 4: Create subagent — `scope-audit-failure.md` (Failure Simulator)

**Files:**
- Create: `.claude/agents/scope-audit-failure.md`

- [ ] **Step 1: Create the agent file**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/scope-audit-failure.md
git commit -m "feat: add scope-audit-failure subagent (failure simulator)"
```

---

### Task 5: Create subagent — `scope-audit-idempotency.md` (Idempotency Checker)

**Files:**
- Create: `.claude/agents/scope-audit-idempotency.md`

- [ ] **Step 1: Create the agent file**

```markdown
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
- Look for: "button disabled" in UIUX, debounce/throttle mentions, idempotency keys
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/scope-audit-idempotency.md
git commit -m "feat: add scope-audit-idempotency subagent (idempotency checker)"
```

---

### Task 6: Create subagent — `scope-audit-state.md` (State Machine Validator)

**Files:**
- Create: `.claude/agents/scope-audit-state.md`

- [ ] **Step 1: Create the agent file**

```markdown
# scope-audit-state

State machine validator — extracts every entity with statuses, maps valid transitions, and detects invalid transitions, stuck states, or missing transitions.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/swida/` directory.

## Task

Identify all entities with defined states across PRD, FSD, TSD, and UIUX. Validate their state machines. For each issue, output a line in this exact format:

```
[STATE] <severity> | <file-path>:<line-number> | <description>
```

For cross-doc issues:

```
[STATE] <severity> | <file>:<line> → <other-file>:<line> | <description>
```

Severity is one of: `critical`, `warning`, `info`.

## Doc Structure

SWIDA docs are at `docs/swida/` with `prd/`, `tsd/`, `fsd/`, `uiux/` subdirectories. Audit EN files only.

## Target Entities

Extract and validate state machines for these entities:

1. **Shop** — States: Draft, Published, Unpublished. Unpublish has inactive reasons (closed, owner_request, violation, stale, other). Look in: PRD §5 (data model), FSD Admin §5 (shop CRUD), FSD Customer Appendix B (display rules).
2. **Review** — States: Published, Under Review, Hidden. Look in: PRD §8 (reviews), FSD Admin §7 (review moderation), FSD Customer §11 (review submission/reporting).
3. **Partnership Inquiry** — States: New, Contacted, Awaiting Info, Approved, Rejected, Spam. Look in: PRD §10 (partnership), FSD Admin §9 (inquiry management).
4. **Customer Account** — States: Active, Locked, Suspended. Look in: PRD §3.3 (customer role), FSD §3 (auth), FSD Admin §8 (user management).
5. **Password Reset Token** — States: Valid, Used, Expired. Look in: FSD Customer §3.6 (password reset).

## Checks

For each entity:

### 1. Extract All States
- Collect every state/status value mentioned across all docs for this entity
- Note which doc defines each state

### 2. Map Defined Transitions
- For each pair of states, determine: is the transition explicitly defined? What triggers it? Who can trigger it (user, admin, system)?

### 3. Detect Missing Transitions
- For each state, check: can the entity leave this state? Are there reverse transitions where expected?
- Example: Can a shop go from Unpublished back to Published? Can a hidden review be un-hidden?

### 4. Detect Stuck States
- A state with no defined exit transition
- Example: Partnership Inquiry "Spam" — can it ever be un-spammed?
- This is critical because stuck states mean manual database intervention in production

### 5. Detect Orphaned States
- A state mentioned in one doc but not in others
- Example: PRD mentions a state that FSD doesn't implement, or FSD defines a state not in PRD

### 6. Detect Trigger Gaps
- A transition is defined but the trigger is unclear
- "Review enters under_review" — triggered by what? Report count threshold? Admin action? Automatic?

### 7. Cross-Doc State Conflicts
- PRD says N states, FSD says M states for the same entity
- State names differ between docs (e.g., "hidden" vs "removed" vs "deleted")

## Severity Rules

- **critical**: Entity can reach a state with no defined exit (stuck state), or state count conflicts between PRD and FSD
- **warning**: Transition exists but trigger/permission not defined, or reverse transition missing where expected
- **info**: State mentioned in only one doc, or minor naming inconsistency

## Output

- Print each issue as a `[STATE]` line
- If no issues found, print: `[STATE] All clear — no state machine issues found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/scope-audit-state.md
git commit -m "feat: add scope-audit-state subagent (state machine validator)"
```

---

### Task 7: Create subagent — `scope-audit-race.md` (Race Condition Detector)

**Files:**
- Create: `.claude/agents/scope-audit-race.md`

- [ ] **Step 1: Create the agent file**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/scope-audit-race.md
git commit -m "feat: add scope-audit-race subagent (race condition detector)"
```

---

### Task 8: Create subagent — `scope-audit-behavior.md` (User Behavior Simulator)

**Files:**
- Create: `.claude/agents/scope-audit-behavior.md`

- [ ] **Step 1: Create the agent file**

```markdown
# scope-audit-behavior

User behavior simulator — simulates chaotic real-user behavior: spam clicks, refreshes, multi-tab, back button, unexpected navigation, input abuse.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/swida/` directory.

## Task

For each user-facing flow defined in FSD and UIUX, simulate what real users actually do — not the happy path, but the chaotic path. For each issue, output a line in this exact format:

```
[BEHAV] <severity> | <file-path>:<line-number> | <description>
```

Severity is one of: `critical`, `warning`, `info`.

## Doc Structure

SWIDA docs are at `docs/swida/` with `prd/`, `tsd/`, `fsd/`, `uiux/` subdirectories. Audit EN files only.

## Checks

### 1. Rapid Repeated Clicks

- Identify all form submit buttons in FSD/UIUX: sign up, login, review submit, partnership inquiry, password reset request, search
- For each: is submit button disabled after first click? Is debounce defined?
- Look for: "disabled", "loading state", "debounce" in UIUX interaction descriptions
- Flag when a write-operation button has no click protection defined

### 2. Browser Back/Forward

- Identify all multi-step flows with success states: sign up → success modal, review submit → success modal, partnership inquiry → success, password reset → confirmation
- For each: what happens if user hits browser back after success? Can they re-submit? Do they see a stale form?
- Look for: "redirect after success", "replace history", "prevent back navigation" in FSD storyboards

### 3. Multi-Tab

- Login in two tabs — user logs in on tab 1. Tab 2 still shows login page. User tries to log in on tab 2.
- Admin opens shop edit in two tabs — saves different data in each. Which version persists?
- Look for: session synchronization, tab-awareness mentions in FSD/UIUX

### 4. Page Refresh Mid-Flow

- Refresh during OAuth callback — is the callback idempotent?
- Refresh the password reset page (token in URL) — is the token consumed on page load or on form submit?
- Refresh after form submit but before success modal — does the submission repeat?
- Look for: token consumption timing, form re-submission prevention

### 5. Stale Page

- User loads shop detail, leaves tab open for hours, then submits a review. Shop was unpublished in the meantime. What error?
- User loads search results, leaves, returns. Results are stale. Any indication?
- Look for: stale data handling, TTL on cached pages, ISR revalidation in TSD

### 6. Direct URL Access

- User types `/en/auth/reset-password` without a token parameter — what happens?
- User bookmarks a search page with filters — filters still valid later?
- User shares a shop URL for a now-unpublished shop — 404? Error message? Redirect?
- Look for: missing parameter handling, unpublished content behavior in FSD

### 7. Form Abandonment

- User fills half a shop create form (admin, 15+ fields) and navigates away — unsaved changes warning?
- User starts writing a review and accidentally closes the modal — content lost?
- Look for: "unsaved changes", "confirm navigation", "draft save" in FSD/UIUX

### 8. Input Abuse

- Max-length inputs: 500-char review at exactly 500, 20-char display name at exactly 20 — boundary behavior?
- Special characters in search: `<script>`, emoji, SQL injection attempts — is input sanitization defined?
- HTML tags in text fields: review body, partnership message — is XSS prevention mentioned?
- Look for: input sanitization, XSS prevention, max-length enforcement in FSD field constraints

## Severity Rules

- **critical**: Behavior that could corrupt data or bypass auth (re-submit creating duplicates, stale token reuse, XSS via input)
- **warning**: Confusing UX with no defined handling (back button loops, stale page errors, lost form data)
- **info**: Minor UX gaps (no unsaved changes warning, no debounce on search, no stale-data indicator)

## Output

- Print each issue as a `[BEHAV]` line
- If no issues found, print: `[BEHAV] All clear — no user behavior risks found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/scope-audit-behavior.md
git commit -m "feat: add scope-audit-behavior subagent (user behavior simulator)"
```

---

### Task 9: Create subagent — `scope-audit-ownership.md` (Ownership Mapper)

**Files:**
- Create: `.claude/agents/scope-audit-ownership.md`

- [ ] **Step 1: Create the agent file**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/scope-audit-ownership.md
git commit -m "feat: add scope-audit-ownership subagent (ownership mapper)"
```

---

### Task 10: Create subagent — `scope-audit-observability.md` (Observability Checker)

**Files:**
- Create: `.claude/agents/scope-audit-observability.md`

- [ ] **Step 1: Create the agent file**

```markdown
# scope-audit-observability

Observability checker — ensures that when something goes wrong in production, you can figure out what happened. Flags features with no logging, audit trail, or debugging path defined.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/swida/` directory.

## Task

Check that all state-changing, security-sensitive, and user-facing error flows have defined observability. For each issue, output a line in this exact format:

```
[OBSERV] <severity> | <file-path>:<line-number> | <description>
```

Severity is one of: `critical`, `warning`, `info`.

## Doc Structure

SWIDA docs are at `docs/swida/` with `prd/`, `tsd/`, `fsd/`, `uiux/` subdirectories. Audit EN files only.

Key observability docs:
- PRD §7.3 — Audit Log definition (scope: shop changes)
- FSD Admin §11 — Audit Log feature (F-AUDIT-01 to F-AUDIT-07)
- TSD §5.2.5 — Dashboard analytics endpoint

## Checks

### 1. Audit Trail Gaps

- PRD §7.3 defines audit logging for shop changes. Check if these actions are ALSO audited:
  - Review moderation (hide, unhide, status changes)
  - Customer account lock/unlock
  - Partnership inquiry status changes
  - Admin user actions (login, logout, permission changes)
  - Password reset requests (who requested, when)
- For each state-changing admin action in FSD Admin, check if audit logging is mentioned
- Flag admin actions with no audit trail

### 2. User-Facing Error Traceability

- FSD defines error messages shown to users (e.g., "일시적인 오류가 발생했습니다")
- Can support trace these errors? Is there a correlation ID, request ID, or error code?
- Look for: error code systems, request tracking, support reference numbers
- Flag when generic error messages have no backend traceability mechanism

### 3. State Transition Logging

- For each state machine entity (shop, review, inquiry, account, token):
  - Is the transition logged? (old state → new state)
  - Is the actor recorded? (which admin, which user, or system)
  - Is the timestamp recorded?
- Cross-reference with the audit log definition — does the audit log cover all entities?

### 4. Third-Party Call Logging

- OAuth flows: are successes and failures logged? Can you tell if OAuth failed at the provider or at token exchange?
- KakaoMap API: are failures logged? Can you tell if map didn't load due to API key issue or network?
- Email delivery: can you tell if a password reset email was sent or failed?
- Look for: logging mentions in TSD integration sections

### 5. Security Events

- Failed login attempts — are they logged? Can you detect brute-force attacks?
- Account lockouts — logged with reason and admin who triggered it?
- Password resets — logged with requester IP/email?
- Session expirations — any logging for unusual patterns?
- Flag when security-sensitive events have no logging defined

### 6. Admin Action Attribution

- When an admin hides a review: is the admin's identity recorded?
- When an admin unpublishes a shop: is the admin's identity in the audit log?
- When an admin changes an inquiry status: same question
- Cross-reference FSD Admin features with the audit log schema — are all admin actions attributed?

### 7. Missing Metrics/Monitoring

- Search latency: is monitoring defined for search response times?
- API response times: any SLA or monitoring?
- PostGIS query performance for nearby search: any monitoring?
- Error rates: any alerting threshold defined?
- Flag when performance-critical operations have no monitoring defined

### 8. Data Retention

- Audit logs: how long are they kept? Is cleanup defined?
- Session data: expiry is 7 days per FSD — is cleanup of expired sessions defined?
- Password reset tokens: expire after 1 hour — are expired tokens cleaned up?
- Review reports: are report records retained after resolution?
- Flag when data with a lifecycle has no retention/cleanup policy

## Severity Rules

- **critical**: Auth/security event with no logging (failed logins, password resets, account locks)
- **warning**: State-changing action with no audit trail, or user-facing error with no traceability
- **info**: Missing monitoring metrics, data retention gaps, admin action without explicit attribution

## Output

- Print each issue as an `[OBSERV]` line
- If no issues found, print: `[OBSERV] All clear — no observability gaps found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files
```

- [ ] **Step 2: Commit**

```bash
git add .claude/agents/scope-audit-observability.md
git commit -m "feat: add scope-audit-observability subagent (observability checker)"
```

---

### Task 11: Smoke test — run `/scope-audit --only gap` on a single file

**Files:**
- No files created/modified — validation only

- [ ] **Step 1: Test the skill invocation**

Run `/scope-audit --only gap` to verify:
1. The skill is recognized by Claude Code
2. The orchestrator dispatches the `scope-audit-gap` subagent
3. The subagent produces findings in the correct `[SCOPE] severity | file:line | description` format
4. The orchestrator formats the unified report correctly

- [ ] **Step 2: Verify output format**

Confirm the report follows the expected structure:
```
## Scope Audit Report

**Scope:** Full sweep
**Files scanned:** <N>
**Skills run:** gap

### Summary
<N> issues found: ...

### Critical
...
### Warning
...
### Info
...
```

- [ ] **Step 3: Fix any issues found during smoke test**

If the skill isn't recognized, check SKILL.md frontmatter. If the orchestrator fails, check agent file naming. If output format is wrong, adjust the orchestrator.

---

### Task 12: Full audit run and push

**Files:**
- No files created/modified — validation and push

- [ ] **Step 1: Run full `/scope-audit`**

Run `/scope-audit` (no flags) to verify all 8 subagents work in parallel and produce a merged report.

- [ ] **Step 2: Review output quality**

Check that:
- All 8 tags appear in the output (or "All clear" for some)
- No subagent errors
- Findings are sorted by severity
- No duplicate findings across subagents

- [ ] **Step 3: Push all commits to remote**

```bash
git push
```
