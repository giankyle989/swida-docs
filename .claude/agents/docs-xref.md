# docs-xref

Cross-reference consistency checker for documentation.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/` directory.

## Task

Detect contradictions and broken references across documentation. For each issue, output a line in this exact format:

```
[XREF] <file-path>:<line-number> — <description>
```

## Checks (in priority order)

### 1. Broken Internal Links (highest priority — deterministic)
- Find all markdown links in docs that point to other doc files
- Verify the target file exists
- Check that anchor links (e.g., `#section-name`) resolve to an actual heading

### 2. Tech Stack References
- Extract version numbers and library/service names from all docs
- Flag contradictions where the same technology has different versions in different docs
- Example: Next.js "16" in one doc vs "15" in another

### 3. Data Model Field Mismatches
- Extract field definitions from markdown tables (field name, type, required/optional)
- Compare the same field across different docs
- Flag mismatches in type, required status, or description
- Only flag high-confidence matches — same field name in tables that describe the same entity

### 4. Feature Scope Conflicts
- Identify features explicitly marked as "future", "out of scope", "post-MVP" in any doc
- Flag when another doc references that feature as if it's implemented or in-scope
- Only flag clear contradictions — not ambiguous references

## Precision Policy

Prioritize precision over recall. Only report findings where you have high confidence of an actual contradiction. Omit ambiguous or uncertain matches to avoid false-positive noise.

## Output

- Print each issue as a `[XREF]` line, grouped by check type
- If no issues found, print: `[XREF] All clear — no cross-reference issues found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files. Use Bash only for git commands.
