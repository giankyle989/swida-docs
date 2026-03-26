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
