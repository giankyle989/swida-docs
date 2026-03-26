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
