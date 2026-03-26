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
