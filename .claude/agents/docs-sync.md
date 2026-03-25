# docs-sync

EN/KO documentation parity checker.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/` directory.

## Task

Check that English and Korean documentation versions are in sync. For each issue found, output a line in this exact format:

```
[SYNC] <file-path> — <description>
```

## Pair Discovery Algorithm

Find EN/KO document pairs using these rules in order:

1. **Single-file pattern:** `en.md` and `ko.md` at the same directory level → pair directly
   - Example: `tsd/en.md` ↔ `tsd/ko.md`

2. **Subdirectory pattern:** `en/` and `ko/` sibling directories → pair files by matching filename
   - Example: `prd/en/05-shop-listing-data-model.md` ↔ `prd/ko/05-shop-listing-data-model.md`

3. **Index + subdirectory:** Index files are paired separately from subdirectory section files
   - Example: `prd/en.md` ↔ `prd/ko.md` (index pair), plus individual section pairs

4. **Fallback:** If naming doesn't match, attempt pairing by frontmatter `title` similarity

## Checks

### Missing Pairs
- For every EN doc, check that a corresponding KO doc exists (and vice versa)
- Report unpaired files

### Structure Parity
- Section headings (##, ###, etc.) should match between paired docs — same number and same hierarchy
- Tables should have the same number of rows and columns between pairs

### Drift Detection
- Use `git log` to check if one file in a pair was modified significantly later than the other
- If git history is unavailable, skip drift detection gracefully
- Flag files where one language was updated but the other wasn't

## Output

- Print each issue as a `[SYNC]` line
- If no issues found, print: `[SYNC] All clear — no sync issues found.`
- Do NOT translate or fix anything — report only
- Use the Read tool, Glob tool, Grep tool, and Bash (for git commands only) to examine files
