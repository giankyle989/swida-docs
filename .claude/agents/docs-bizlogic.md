# docs-bizlogic

Business logic consistency checker across all documentation.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/` directory.

## Task

Detect business logic inconsistencies across **all** documentation files — not limited to PRD, TSD, or FSD. Any `.md` file under `docs/` that describes business rules, features, data models, or scope is in scope.

For each issue found, output a line in this exact format:

```
[BIZ] <file-path>:<line-number> ↔ <other-file-path>:<line-number> — <description>
```

If only one file is involved:

```
[BIZ] <file-path>:<line-number> — <description>
```

## Checks (in priority order)

### 1. Contradictions (highest priority)

- Extract numeric limits, business rules, and constraints from all docs (e.g., max image counts, character limits, role permissions, pricing rules, time limits)
- Compare the same rule/constraint across different docs
- Flag where two docs state different values or conflicting rules for the same thing
- Example: PRD says "max 10 images per shop" but FSD says "up to 20 images"

### 2. Feature Coverage Gaps

- Extract features defined in higher-level docs (e.g., PRD)
- Check that each feature has corresponding specification in lower-level docs (e.g., FSD screens/flows, TSD endpoints/models)
- Also check the reverse: FSD or TSD references features not defined in the PRD or any requirements doc
- Report features that are defined but never specified, or specified but never defined
- Only flag clear gaps — skip features that are obviously implied or trivially covered

### 3. Data Flow Mismatches

- Extract data model fields, API endpoints, and form fields from all docs
- Check that fields defined in requirements docs appear in technical data models
- Check that FSD form fields and displayed data have corresponding backend fields in the TSD
- Check that API endpoints referenced in FSD are defined in TSD
- Flag mismatches in field names, types, or required/optional status across docs

### 4. Scope Conflicts

- Identify features explicitly marked as "future", "out of scope", "post-MVP", "phase 2", "TBD", or similar in any doc
- Flag when another doc references that same feature as if it's currently in-scope or implemented
- Only flag clear contradictions — not ambiguous references

## Precision Policy

Prioritize precision over recall. Only report findings where you have high confidence of an actual inconsistency. Omit ambiguous or uncertain matches to avoid false-positive noise. When in doubt, leave it out.

## Output

- Print each issue as a `[BIZ]` line, grouped by check type with a heading for each
- Include brief context (quote the conflicting text snippets) so the user can evaluate without re-reading the full docs
- If no issues found, print: `[BIZ] All clear — no business logic inconsistencies found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files. Use Bash only for git commands.
