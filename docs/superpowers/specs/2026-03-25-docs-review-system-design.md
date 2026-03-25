# Docs Review System — Design Spec

**Date:** 2026-03-25
**Status:** Approved
**Scope:** Skill + subagent system for comprehensive documentation quality assurance

---

## 1. Problem

The SWIDA docs site is bilingual (EN/KO) and spans multiple doc types (PRD, TSD, FSD, and more over time). As docs grow, several quality issues become hard to catch manually:

- EN and KO versions drifting out of sync
- Inconsistent terminology across documents
- Cross-reference contradictions between doc types
- Formatting and structure inconsistencies
- Stale content that no longer reflects the project

## 2. Solution

A `/docs-review` skill backed by an orchestrator agent that dispatches four specialized subagents. Each subagent focuses on one quality concern. The system runs in two modes:

- **Full sweep** — manually invoked via `/docs-review`, scans all docs
- **Auto-check** — convention-based (CLAUDE.md instruction), runs after doc edits

All output is **advisory** — findings are printed inline in the conversation, never blocking.

## 3. Architecture

```
Trigger
├── /docs-review (full sweep)
└── Auto-check (CLAUDE.md convention, on doc edit)
        │
        ▼
docs-review orchestrator
├── Determines scope (full repo vs changed files)
├── Dispatches subagents (independent, no data dependencies)
└── Collects results, prints unified report
        │
        ├── docs-sync        (EN/KO parity)
        ├── docs-terminology  (glossary enforcement)
        ├── docs-xref        (cross-reference consistency)
        └── docs-format      (structure/formatting)

Shared resource: docs/swida/glossary.md
```

**Dispatch model:** The four subagents are independent (no data dependencies between them). The orchestrator dispatches them using the Agent tool — multiple calls in a single message for parallel execution where supported, or sequentially if not. Either way, results are collected and merged into one report.

## 4. Subagent Specifications

### 4.1 docs-sync (EN/KO Parity)

**Purpose:** Detect gaps and drift between English and Korean doc versions.

**Checks:**
- For every EN doc, a corresponding KO doc exists (and vice versa)
- Section headings match between paired docs (same structure)
- Tables have the same number of rows/columns
- Content recently updated in one language but not the other (git blame comparison when available; skip gracefully if git history is unavailable)

**Pair discovery algorithm:**
1. **Single-file pattern:** `en.md` and `ko.md` at the same directory level → pair directly (e.g., `tsd/en.md` ↔ `tsd/ko.md`)
2. **Subdirectory pattern:** `en/` and `ko/` sibling directories → pair files by matching filename (e.g., `prd/en/05-shop-listing-data-model.md` ↔ `prd/ko/05-shop-listing-data-model.md`)
3. **Index + subdirectory:** Index files (`prd/en.md` ↔ `prd/ko.md`) are paired separately from their subdirectory section files
4. **Fallback:** If naming convention doesn't match, attempt pairing by frontmatter `title` similarity

**Output example:**
```
[SYNC] docs/swida/tsd/en.md has section "## 4. Caching Strategy" — no equivalent in ko.md
[SYNC] docs/swida/prd/en/08-review-system.md modified 2 days after its KO pair — possible drift
[SYNC] docs/swida/fsd/customer-web/ko.md — no EN pair found
```

### 4.2 docs-terminology (Glossary Enforcement)

**Purpose:** Enforce consistent terminology across all docs and maintain the glossary.

**Glossary location:** `docs/swida/glossary.md` — rendered as a public Docusaurus page (useful reference for contributors). Includes frontmatter for sidebar placement.

**Glossary format:**
```markdown
---
title: "Glossary"
sidebar_label: "Glossary"
sidebar_position: 99
---

# Terminology Glossary

> Auto-maintained by docs-terminology agent. Human-reviewed.

| Term (EN) | Term (KO) | Context | Avoid |
|-----------|-----------|---------|-------|
| shop | 업체 | A listed massage/wellness business | store, place, venue |
| customer | 고객 | End user browsing/reviewing shops | user, client, member |
```

**Behavior:**
- Scans all docs for terms in the "Avoid" column and flags them
- When a new recurring term is found that's not in the glossary, proposes adding it in the report output
- The agent never auto-writes to the glossary without explicit user confirmation. In full sweep mode, the user reviews the report and tells the agent which proposed terms to add. In auto-check mode, proposals are printed as suggestions only.
- Checks that KO docs use the correct KO term where EN docs use the EN term
- Never overwrites human edits to the glossary — additions are always appended

**Bootstrap:** On first run with an empty/missing glossary, seeds it by scanning all existing docs for common noun/term patterns (~20-30 initial terms). Prints proposed glossary for review before writing.

**Output example:**
```
[TERM] docs/swida/fsd/customer-web/en.md:42 — "store" should be "shop" (see glossary)
[TERM] New term detected: "partnership inquiry" (EN) / "파트너십 문의" (KO) — appears 8 times. Add to glossary? (proposed)
[TERM] docs/swida/prd/ko/03-user-roles-permissions.md:15 — "사용자" used instead of glossary term "고객" for customer
```

### 4.3 docs-xref (Cross-Reference Consistency)

**Purpose:** Detect contradictions between docs — data models, tech stack, feature scope.

**Checks (in priority order):**
1. **Broken internal links** — markdown links pointing to docs that don't exist (deterministic, highest confidence)
2. **Tech stack references** — extracts version numbers, library names, service names, flags contradictions
3. **Data model fields** — extracts field names, types, required/optional from tables across docs, flags mismatches
4. **Feature scope** — flags when a doc references a feature that another doc marks as out-of-scope or future

**How it works:**
- Builds an in-memory index of key entities (fields, tech, features) per doc
- Compares across all docs dynamically — not hardcoded to specific doc types
- Reports conflicts with file paths and line references
- **Prioritizes precision over recall** — only flags high-confidence contradictions. Ambiguous or uncertain matches are omitted to avoid false-positive noise.

**Output example:**
```
[XREF] Broken link: docs/swida/prd/en.md:15 → "en/overview" — target not found
[XREF] Version conflict: Next.js "16" in prd/en/13-technical-architecture.md:699 vs "15" in fsd/customer-web/en.md:12
[XREF] Field mismatch: "booking_required" is Boolean (required) in prd/en/05-shop-listing-data-model.md:151 but optional in tsd/en.md:203
```

### 4.4 docs-format (Structure Consistency)

**Purpose:** Enforce consistent formatting and structure across all doc files.

**Checks:**
- Frontmatter completeness (`title`, `sidebar_label`, `sidebar_position` present)
- Heading hierarchy (no skipped levels, e.g., `##` followed by `####`)
- Table formatting consistency (separator rows, column alignment)
- Consistent use of Strapi field type notation across tables
- Trailing whitespace, double blank lines, missing trailing newline
- Consistent section separator usage (`---`)

**Output example:**
```
[FMT] docs/swida/prd/ko/05-shop-listing-data-model.md — missing frontmatter field: sidebar_position
[FMT] docs/swida/tsd/en.md:145 — heading level skipped: ## followed by ####
[FMT] docs/swida/fsd/customer-web/ko.md:89 — double blank line
```

## 5. Report Format

The orchestrator collects all subagent findings and prints a unified report:

```
## Docs Review Report

**Scope:** Full sweep (all docs) | Targeted (changed files only)
**Files scanned:** 34

### Summary
12 issues found: 3 sync, 4 terminology, 2 cross-reference, 3 formatting

### Sync (EN/KO Parity)
[SYNC] ...

### Terminology
[TERM] ...

### Cross-References
[XREF] ...

### Formatting
[FMT] ...

### Proposed Glossary Additions
(listed here if any new terms detected)
```

- Findings grouped by subagent category
- Summary line at the top with counts per category
- When zero issues found: prints "All clear — no issues found."
- No truncation — full report always printed. For very large reports, the orchestrator may suggest running with `--only` to focus.

## 6. File Layout

```
C:\Dev\swida-docs\
├── .claude/
│   ├── agents/
│   │   ├── docs-review.md         # Orchestrator subagent
│   │   ├── docs-sync.md           # EN/KO parity checker
│   │   ├── docs-terminology.md    # Glossary enforcer
│   │   ├── docs-xref.md          # Cross-reference checker
│   │   └── docs-format.md        # Formatting/structure checker
│   └── skills/
│       └── docs-review.md        # /docs-review slash command skill
├── docs/
│   └── glossary.md               # Auto-managed terminology glossary (Docusaurus page)
└── CLAUDE.md                     # Project context for Claude Code
```

## 7. Trigger Modes

### 7.1 Full Sweep (`/docs-review`)

- User invokes `/docs-review` to scan all docs
- Optionally accepts arguments:
  - A path (file or directory) for targeted scan, e.g., `/docs-review docs/swida/prd`
  - `--only sync,terminology` to run specific subagents only
- Orchestrator dispatches subagents on the specified scope
- Subagents return findings
- Orchestrator prints a unified report (see Section 5)

### 7.2 Auto-Check (Convention)

- **Not a system hook** — implemented as a CLAUDE.md instruction that tells the agent to run a lightweight docs check after editing `.md` files under `docs/`.
- Compliance depends on the agent following CLAUDE.md instructions and is best-effort, not guaranteed.
- When triggered, runs a targeted check on the changed file(s) only:
  - **docs-sync** — if the edited file has a language pair
  - **docs-terminology** — always runs on the changed file
  - **docs-xref** — if the file contains data models, tech refs, or feature mentions
  - **docs-format** — always runs on the changed file
- Prints findings inline, advisory only, never blocks

## 8. CLAUDE.md

Establishes project context:
- Docusaurus v3 docs site for the SWIDA platform
- Bilingual convention: EN/KO pairs (`en.md` ↔ `ko.md`, or `en/` ↔ `ko/` subdirectories)
- Doc types are open-ended (currently PRD, TSD, FSD — more may be added)
- `docs/swida/glossary.md` is the canonical terminology source — agents maintain it, humans review
- When editing docs: use glossary terms, maintain EN/KO parity, keep cross-references consistent
- `/docs-review` available for full documentation health check
- After editing any `.md` file under `docs/`, run a lightweight docs review on the changed file (auto-check convention)

## 9. Glossary Bootstrap

On first `/docs-review` run when `docs/swida/glossary.md` doesn't exist or is empty:
1. Terminology agent scans all existing docs
2. Extracts recurring terms and their EN/KO equivalents
3. Generates initial glossary with ~20-30 seed terms
4. Prints proposed glossary for user review before writing
5. After approval, writes `docs/swida/glossary.md`

After bootstrap, the glossary grows incrementally as new terms appear in docs.

## 10. Error Handling

- **Subagent failure is non-fatal.** If a subagent encounters an error (malformed file, timeout, unexpected format), the orchestrator reports the failure and continues with results from other subagents.
- **Malformed frontmatter or markdown** — the format subagent reports it as a finding rather than crashing.
- **Glossary file malformed or has merge conflicts** — the terminology subagent reports the issue and skips glossary enforcement for that run.
- **Git history unavailable** (fresh clone, shallow clone) — the sync subagent skips timestamp-based drift detection and only checks structural parity.
- **Path argument outside `docs/`** — the orchestrator prints a warning and exits without scanning.

## 11. Constraints & Non-Goals

- **No auto-translation** — sync checker reports gaps only, does not generate translations
- **No auto-fix** — all output is advisory; the system reports issues, human decides what to fix
- **Doc-type agnostic** — works on any markdown files under `docs/`, no hardcoded doc type assumptions
- **Glossary is agent-proposed, human-approved** — agent proposes terms in the report; only writes to glossary after explicit user confirmation. Never overwrites human edits.
- **Precision over recall for xref** — the cross-reference checker flags only high-confidence contradictions to avoid false-positive noise
