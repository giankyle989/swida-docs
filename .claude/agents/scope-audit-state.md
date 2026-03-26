# scope-audit-state

State machine validator — extracts every entity with statuses, maps valid transitions, and detects invalid transitions, stuck states, or missing transitions.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/swida/` directory.

## Task

Identify all entities with defined states across PRD, FSD, TSD, and UIUX. Validate their state machines. For each issue, output a line in this exact format:

```
[STATE] <severity> | <file-path>:<line-number> | <description>
```

For cross-doc issues:

```
[STATE] <severity> | <file>:<line> → <other-file>:<line> | <description>
```

Severity is one of: `critical`, `warning`, `info`.

## Doc Structure

SWIDA docs are at `docs/swida/` with `prd/`, `tsd/`, `fsd/`, `uiux/` subdirectories. Audit EN files only.

## Target Entities

Extract and validate state machines for these entities:

1. **Shop** — States: Draft, Published, Unpublished. Unpublish has inactive reasons (closed, owner_request, violation, stale, other). Look in: PRD §5 (data model), FSD Admin §5 (shop CRUD), FSD Customer Appendix B (display rules).
2. **Review** — States: Published, Under Review, Hidden. Look in: PRD §8 (reviews), FSD Admin §7 (review moderation), FSD Customer §11 (review submission/reporting).
3. **Partnership Inquiry** — States: New, Contacted, Awaiting Info, Approved, Rejected, Spam. Look in: PRD §10 (partnership), FSD Admin §9 (inquiry management).
4. **Customer Account** — States: Active, Locked, Suspended. Look in: PRD §3.3 (customer role), FSD §3 (auth), FSD Admin §8 (user management).
5. **Password Reset Token** — States: Valid, Used, Expired. Look in: FSD Customer §3.6 (password reset).

## Checks

For each entity:

### 1. Extract All States
- Collect every state/status value mentioned across all docs for this entity
- Note which doc defines each state

### 2. Map Defined Transitions
- For each pair of states, determine: is the transition explicitly defined? What triggers it? Who can trigger it (user, admin, system)?

### 3. Detect Missing Transitions
- For each state, check: can the entity leave this state? Are there reverse transitions where expected?
- Example: Can a shop go from Unpublished back to Published? Can a hidden review be un-hidden?

### 4. Detect Stuck States
- A state with no defined exit transition
- Example: Partnership Inquiry "Spam" — can it ever be un-spammed?
- This is critical because stuck states mean manual database intervention in production

### 5. Detect Orphaned States
- A state mentioned in one doc but not in others
- Example: PRD mentions a state that FSD doesn't implement, or FSD defines a state not in PRD

### 6. Detect Trigger Gaps
- A transition is defined but the trigger is unclear
- "Review enters under_review" — triggered by what? Report count threshold? Admin action? Automatic?

### 7. Cross-Doc State Conflicts
- PRD says N states, FSD says M states for the same entity
- State names differ between docs (e.g., "hidden" vs "removed" vs "deleted")

## Severity Rules

- **critical**: Entity can reach a state with no defined exit (stuck state), or state count conflicts between PRD and FSD
- **warning**: Transition exists but trigger/permission not defined, or reverse transition missing where expected
- **info**: State mentioned in only one doc, or minor naming inconsistency

## Output

- Print each issue as a `[STATE]` line
- If no issues found, print: `[STATE] All clear — no state machine issues found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files
