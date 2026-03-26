# SystemScopeAuditor — Design Spec

**Date**: 2026-03-27
**Scope**: New agent + skill system for production-readiness auditing of SWIDA documentation
**Architecture**: Orchestrator + 8 specialized subagents, mirroring the existing `docs-review` pattern

---

## Background

The existing `docs-review` system checks documentation **quality** (sync, terminology, formatting, cross-references, business logic). The SystemScopeAuditor checks documentation **completeness for production readiness** — surfacing design gaps that would cause bugs, data corruption, or confusion during implementation.

This is a pre-code design review tool. All 8 skills read documentation (PRD, TSD, FSD, UIUX) under `docs/swida/` and flag where production concerns aren't addressed.

## Decisions

- **SWIDA-specific** — tailored to the SWIDA doc structure (PRD/TSD/FSD/UIUX pattern)
- **Docs-only** — audits specs, not code
- **Separate from docs-review** — independent `/scope-audit` skill, does not interact with `/docs-review`
- **Severity-first output** — issues sorted by severity (critical → warning → info) with skill tags for filtering
- **Orchestrator + 8 subagents** — each skill is a focused agent file, dispatched in parallel

---

## File Structure

```
.claude/
  skills/
    scope-audit/
      SKILL.md                          # Slash command: /scope-audit
  agents/
    scope-audit.md                      # Orchestrator agent
    scope-audit-gap.md                  # 1. scope_gap_audit       [SCOPE]
    scope-audit-failure.md              # 2. failure_simulator      [FAIL]
    scope-audit-idempotency.md          # 3. idempotency_checker   [IDEM]
    scope-audit-state.md                # 4. state_machine_validator [STATE]
    scope-audit-race.md                 # 5. race_condition_detector [RACE]
    scope-audit-behavior.md             # 6. user_behavior_simulator [BEHAV]
    scope-audit-ownership.md            # 7. ownership_mapper       [OWNER]
    scope-audit-observability.md        # 8. observability_checker  [OBSERV]
```

---

## Skill Definition (`SKILL.md`)

```yaml
name: scope-audit
description: Run a production-readiness audit on SWIDA documentation. Finds design gaps, missing failure handling, race conditions, state machine issues, and more.
```

**Usage:**
- `/scope-audit` — Full sweep of all docs under `docs/swida/`
- `/scope-audit docs/swida/fsd` — Targeted scan of a specific directory
- `/scope-audit --only race,state,idempotency` — Run specific checks only

---

## Orchestrator (`scope-audit.md`)

### Input

- `scope` — "all" for full sweep, or a specific path (file or directory)
- `only` (optional) — comma-separated skill list to run a subset

### Flow

1. **Determine file list.** If scope is "all", find all `.md` files under `docs/swida/`. If scope is a directory, find `.md` files in it. If scope is a file, use that single file.

2. **Dispatch subagents.** Launch all 8 subagents in parallel using the Agent tool (or filtered subset if `only` is specified). Each subagent receives the scope and file list.

3. **Collect results.** Wait for all subagents to complete.

4. **Merge and sort.** Parse all subagent findings, sort by severity (critical first, then warning, then info).

5. **Print unified report.**

### Report Format

```
## Scope Audit Report

**Scope:** [Full sweep | Targeted: <path>]
**Files scanned:** <count>
**Skills run:** <list of skills run>

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

### Error Handling

If a subagent fails, report the failure and continue:
```
scope-audit-race encountered an error: <message>. Skipping race condition checks.
```

### Zero Issues

```
## Scope Audit Report

**Scope:** [scope]
**Files scanned:** <count>

All clear — no issues found across all 8 production-readiness checks.
```

---

## Subagent Standard Format

Every subagent outputs findings in this format (one per line):

```
[TAG] <severity> | <file-path>:<line-number> | <description>
```

Where:
- `TAG` — skill identifier (`SCOPE`, `FAIL`, `IDEM`, `STATE`, `RACE`, `BEHAV`, `OWNER`, `OBSERV`)
- `severity` — `critical`, `warning`, or `info`
- `file-path` — relative to `docs/swida/`
- `line-number` — approximate line where the issue is (or the section it relates to)
- `description` — clear, actionable description of the gap

For cross-doc issues, use arrow notation:
```
[TAG] <severity> | <file>:<line> → <other-file>:<line> | <description>
```

---

## Subagent 1: `scope_gap_audit` (`scope-audit-gap.md`)

**Tag:** `[SCOPE]`
**Purpose:** Find missing definitions, vague requirements, and coverage holes between docs.

### Checks

1. **PRD → FSD coverage** — Every MVP feature in PRD has a corresponding FSD specification
2. **FSD → PRD traceability** — Every FSD feature traces back to a PRD requirement
3. **UIUX → FSD coverage** — Every UIUX page/flow has FSD backing
4. **FSD → UIUX coverage** — Every FSD feature has UIUX representation
5. **Vague requirements** — Flag words like "appropriate", "as needed", "TBD", "etc.", "should be handled" without specifics
6. **Missing error states** — Features that define the happy path but not failure scenarios
7. **Missing field constraints** — Data fields with no validation rules (min/max length, format, required/optional)
8. **Undefined edge cases** — Empty lists, zero results, max capacity, boundary conditions not addressed

### Severity Rules

- Critical: MVP feature in PRD with zero FSD coverage
- Warning: Feature exists but is vague/incomplete, or UIUX defines something with no FSD
- Info: Minor omissions, nice-to-have clarifications

---

## Subagent 2: `failure_simulator` (`scope-audit-failure.md`)

**Tag:** `[FAIL]`
**Purpose:** For every feature/flow, ask "what breaks?" and flag when the docs don't answer.

### Checks

For each user-facing flow (auth, search, review, partnership, shop CRUD):

1. **Network failures** — API call fails mid-flow. Is retry behavior defined? Does the user see an error? Can they resume?
2. **Partial failures** — Multi-step operation succeeds halfway. E.g., review submitted but rating recalculation fails. Is rollback defined?
3. **Third-party failures** — Kakao/Naver OAuth down, KakaoMap API unreachable, email service down. Are fallbacks specified?
4. **Data integrity failures** — Referenced entity deleted (shop deleted but reviews remain, theme deleted but shops tagged). Are cascading effects defined?
5. **Timeout scenarios** — Long-running operations (nearby search with PostGIS, image upload). Are timeout limits and user feedback defined?
6. **Capacity failures** — Behavior at scale: 10,000 reviews on one shop, 500 search results, bulk admin operations.

### Severity Rules

- Critical: Auth or data-mutating flow with no failure handling defined
- Warning: User-facing flow with no error state or recovery path
- Info: Admin-only flow or edge case with missing failure handling

---

## Subagent 3: `idempotency_checker` (`scope-audit-idempotency.md`)

**Tag:** `[IDEM]`
**Purpose:** Flag operations where duplicate/retry execution could cause problems, and the docs don't address it.

### Checks

Scans all API endpoints (from TSD), form submissions (from FSD/UIUX), and state-changing actions:

1. **Form double-submit** — User clicks "Submit" twice. Is the button disabled? Is server-side deduplication defined? Applies to: review submit, partnership inquiry, sign up, password reset request
2. **Webhook/callback replay** — OAuth callback hit twice, payment callback replayed. Are callbacks idempotent? Is token single-use?
3. **State transition replay** — Admin publishes an already-published shop. Admin approves an already-approved inquiry. No-op or error?
4. **Email/notification re-send** — Password reset requested 3 times. Deduplication? Rate limiting?
5. **Concurrent write conflicts** — Two admins edit same shop simultaneously. Last-write-wins? Optimistic locking?
6. **Retry-safe API design** — POST endpoints that create resources. Idempotency key? Duplicate detection?

### Severity Rules

- Critical: Auth or financial operation with no idempotency safeguard
- Warning: User-facing write operation with no double-submit protection
- Info: Admin operation or read-heavy flow with minor duplication risk

---

## Subagent 4: `state_machine_validator` (`scope-audit-state.md`)

**Tag:** `[STATE]`
**Purpose:** Extract every entity with statuses, map valid transitions, find invalid transitions, stuck states, and missing transitions.

### Target Entities

- **Shop** — Draft, Published, Unpublished (with inactive reasons)
- **Review** — Published, Under Review, Hidden
- **Partnership Inquiry** — New, Contacted, Awaiting Info, Approved, Rejected, Spam
- **Customer Account** — Active, Locked, Suspended
- **Password Reset Token** — Valid, Used, Expired

### Checks

For each entity:

1. **Extract all states** mentioned across PRD, FSD, TSD, UIUX
2. **Map defined transitions** — which state changes are explicitly described
3. **Detect missing transitions** — can a shop go Unpublished → Draft? Can a hidden review be re-published?
4. **Detect stuck states** — state with no exit (e.g., "Spam" inquiry with no un-spam path)
5. **Detect orphaned states** — state mentioned in one doc but not others
6. **Detect trigger gaps** — transition exists but trigger undefined. Who causes it? User? Admin? System?
7. **Cross-doc state conflicts** — PRD says N statuses, FSD says M. Which is correct?

### Severity Rules

- Critical: Entity can reach a state with no defined exit, or state conflict between PRD and FSD
- Warning: Transition exists but trigger/permission not defined, or reverse transition missing
- Info: State mentioned in only one doc, or minor ambiguity

---

## Subagent 5: `race_condition_detector` (`scope-audit-race.md`)

**Tag:** `[RACE]`
**Purpose:** Find concurrent access scenarios the docs don't address.

### Checks

For each write operation, ask "what if two actors do this at the same time?":

1. **Admin-Admin races** — Two admins edit same shop, moderate same review, change same inquiry status. Locking strategy?
2. **User-Admin races** — User submits review while admin hides shop. User submits inquiry while admin processes previous one.
3. **User-User races** — Two users report same review. Two users register with same display name simultaneously.
4. **User-System races** — User edits review while system auto-transitions it to under_review. Session expires mid-submit.
5. **Read-Write races** — User views shop while admin unpublishes it. User browses reviews while review gets hidden.
6. **Counter/aggregate races** — Two reviews posted simultaneously. Rating recalculation fires twice concurrently.

### Severity Rules

- Critical: Data corruption possible (duplicate accounts, wrong calculations, lost state transitions)
- Warning: UX issue (stale data, confusing error) but no data corruption
- Info: Unlikely scenario or admin-only race with low impact

---

## Subagent 6: `user_behavior_simulator` (`scope-audit-behavior.md`)

**Tag:** `[BEHAV]`
**Purpose:** Simulate chaotic real-user behavior — spam clicks, refreshes, multi-tab, back button, unexpected navigation.

### Checks

For each user-facing flow:

1. **Rapid repeated clicks** — Submit clicked 5 times in 1 second. Debounce/disable defined? Applies to: all form submissions
2. **Browser back/forward** — User submits form → success → back button. Empty form? Re-submit possible?
3. **Multi-tab** — Login in two tabs. Shop edit in two admin tabs with different data.
4. **Page refresh mid-flow** — Refresh during OAuth callback. Refresh password reset page. Refresh after submit but before modal.
5. **Stale page** — Page loaded hours ago, underlying data changed. Review submitted for unpublished shop.
6. **Direct URL access** — Reset password page without token. Search page with expired filters. URL for unpublished shop.
7. **Form abandonment** — Half-filled form, navigate away. Unsaved changes warning defined?
8. **Input abuse** — Max-length inputs, special characters, emoji, HTML/script tags in text fields.

### Severity Rules

- Critical: Behavior that could corrupt data or bypass auth
- Warning: Confusing UX with no defined handling
- Info: Minor UX gaps

---

## Subagent 7: `ownership_mapper` (`scope-audit-ownership.md`)

**Tag:** `[OWNER]`
**Purpose:** For every feature, force clarity on who owns it — frontend, backend, system, or third-party.

### Checks

1. **Frontend vs Backend ambiguity** — Validation location unclear. "Validate email format" — where? Client, server, or both?
2. **Rendering responsibility** — SSR, SSG, ISR, or client-side? TSD defines strategies but FSD features don't always map to one.
3. **Computation location** — Rating recalculation, open/close tag determination, search ranking. Who computes?
4. **Third-party dependency ownership** — KakaoMap, Kakao/Naver OAuth, email service. Failure handling owner? Monitoring owner?
5. **Data ownership** — Source of truth for each entity. Strapi CMS? Frontend cache? URL state?
6. **Trigger ownership** — State transitions. "Review enters under_review" — triggered by whom? Frontend, backend API, lifecycle hook?
7. **Missing "who"** — "The system does X" without specifying which component. "Notification is sent" — by whom?

### Severity Rules

- Critical: Auth or data-mutating feature with ambiguous ownership
- Warning: Feature with unclear frontend/backend split
- Info: Minor ambiguity in non-critical features

---

## Subagent 8: `observability_checker` (`scope-audit-observability.md`)

**Tag:** `[OBSERV]`
**Purpose:** Ensure that when something goes wrong in production, you can figure out what happened.

### Checks

1. **Audit trail gaps** — Admin actions not covered by audit logging. PRD §7.3 defines shop audit. What about: review moderation, account lock/unlock, inquiry status changes, password resets?
2. **User-facing error traceability** — User sees generic error. Can support trace it? Correlation ID? Error codes?
3. **State transition logging** — State machine entities should log: old state → new state, who triggered, when.
4. **Third-party call logging** — OAuth, KakaoMap, email delivery. Successes and failures logged?
5. **Security events** — Failed logins, account lockouts, password resets, session expirations. Logged for monitoring?
6. **Admin action attribution** — Admin hides review, unpublishes shop. Admin identity recorded in all cases?
7. **Missing metrics/monitoring** — Search latency, API response times, error rates, PostGIS query performance.
8. **Data retention** — Audit logs, sessions, tokens. How long kept? Cleanup defined?

### Severity Rules

- Critical: Auth/security event with no logging
- Warning: State-changing action with no audit trail, or user-facing error with no traceability
- Info: Missing monitoring metrics, data retention gaps

---

## Skill Tags Reference

| Tag | Skill | Focus |
|---|---|---|
| `[SCOPE]` | scope_gap_audit | Missing specs, vague requirements, coverage holes |
| `[FAIL]` | failure_simulator | Unhandled errors, no retry/recovery, third-party failures |
| `[IDEM]` | idempotency_checker | Double-submit, replay attacks, duplicate creation |
| `[STATE]` | state_machine_validator | Stuck states, missing transitions, state conflicts |
| `[RACE]` | race_condition_detector | Concurrent access, data corruption, stale reads |
| `[BEHAV]` | user_behavior_simulator | Spam clicks, back button, multi-tab, stale pages |
| `[OWNER]` | ownership_mapper | Ambiguous frontend/backend/system responsibility |
| `[OBSERV]` | observability_checker | No audit trail, no error tracing, no logging |

---

## Out of Scope

- Fixing issues — the audit reports only, user decides what to fix
- Code analysis — this tool reads documentation, not source code
- Non-SWIDA projects — agent is tailored to SWIDA's doc structure
- Performance benchmarking — no load testing or performance analysis
