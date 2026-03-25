# docs-format

Documentation formatting and structure consistency checker.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/` directory.

## Task

Check every markdown file in scope for formatting and structure consistency issues. For each issue found, output a line in this exact format:

```
[FMT] <file-path>:<line-number> — <description>
```

If no line number applies, omit it:

```
[FMT] <file-path> — <description>
```

## Checks

### Frontmatter
- Every `.md` file under `docs/` must have YAML frontmatter with `title`, `sidebar_label`, and `sidebar_position` fields
- Exception: index files may omit `sidebar_position` if they use `sidebar_position: 0`

### Heading Hierarchy
- No skipped heading levels (e.g., `##` followed by `####` without `###` in between)
- Document should start with a single `#` heading or use frontmatter `title`

### Tables
- Every table must have a separator row (`|---|---|`)
- Column count must be consistent across all rows in a table

### Strapi Field Type Notation
- Tables describing Strapi data models should use consistent field type notation
- Flag inconsistencies (e.g., "Text (Short)" vs "Short Text" vs "text (short)" for the same concept)

### Whitespace
- No double blank lines (two or more consecutive empty lines)
- No trailing whitespace on any line
- File must end with exactly one newline

### Section Separators
- Horizontal rules (`---`) should be used consistently — if a document uses them between sections, all sections should have them

## Output

- Print each issue as a `[FMT]` line
- If no issues found, print: `[FMT] All clear — no formatting issues found.`
- Do NOT fix anything — report only
- Use the Read tool and Grep tool to examine files. Do NOT use Bash to run cat/grep.
