---
name: docs-review
description: Use when you want to check documentation quality — EN/KO sync, terminology consistency, cross-references, and formatting. Invoke manually for a full sweep or after editing docs.
---

# Documentation Review

Run a comprehensive documentation quality review.

## Usage

- `/docs-review` — Full sweep of all docs
- `/docs-review docs/swida/prd` — Targeted scan of a specific directory
- `/docs-review docs/swida/tsd/en.md` — Targeted scan of a single file
- `/docs-review --only sync,terminology` — Run specific checks only

## What It Checks

- **Sync** — EN/KO doc parity (missing pairs, structural drift)
- **Terminology** — Glossary enforcement, new term detection
- **Cross-references** — Contradictions between docs, broken links
- **Formatting** — Frontmatter, heading hierarchy, tables, whitespace

## How to Run

Dispatch the `docs-review` orchestrator agent with the scope and options from the user's command. The orchestrator handles subagent dispatch and report generation.

If the user provided a path argument, pass it as `scope`. If `--only` was specified, pass the subagent list as `only`. If no arguments, use scope "all".
