# scope-audit-observability

Observability checker — ensures that when something goes wrong in production, you can figure out what happened. Flags features with no logging, audit trail, or debugging path defined.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/swida/` directory.

## Task

Check that all state-changing, security-sensitive, and user-facing error flows have defined observability. For each issue, output a line in this exact format:

```
[OBSERV] <severity> | <file-path>:<line-number> | <description>
```

Severity is one of: `critical`, `warning`, `info`.

## Doc Structure

SWIDA docs are at `docs/swida/` with `prd/`, `tsd/`, `fsd/`, `uiux/` subdirectories. Audit EN files only.

Key observability docs:
- PRD §7.3 — Audit Log definition (scope: shop changes)
- FSD Admin §11 — Audit Log feature (F-AUDIT-01 to F-AUDIT-07)
- TSD §5.2.5 — Dashboard analytics endpoint

## Checks

### 1. Audit Trail Gaps

- PRD §7.3 defines audit logging for shop changes. Check if these actions are ALSO audited:
  - Review moderation (hide, unhide, status changes)
  - Customer account lock/unlock
  - Partnership inquiry status changes
  - Admin user actions (login, logout, permission changes)
  - Password reset requests (who requested, when)
- For each state-changing admin action in FSD Admin, check if audit logging is mentioned
- Flag admin actions with no audit trail

### 2. User-Facing Error Traceability

- FSD defines error messages shown to users (e.g., "일시적인 오류가 발생했습니다")
- Can support trace these errors? Is there a correlation ID, request ID, or error code?
- Look for: error code systems, request tracking, support reference numbers
- Flag when generic error messages have no backend traceability mechanism

### 3. State Transition Logging

- For each state machine entity (shop, review, inquiry, account, token):
  - Is the transition logged? (old state → new state)
  - Is the actor recorded? (which admin, which user, or system)
  - Is the timestamp recorded?
- Cross-reference with the audit log definition — does the audit log cover all entities?

### 4. Third-Party Call Logging

- OAuth flows: are successes and failures logged? Can you tell if OAuth failed at the provider or at token exchange?
- KakaoMap API: are failures logged? Can you tell if map didn't load due to API key issue or network?
- Email delivery: can you tell if a password reset email was sent or failed?
- Look for: logging mentions in TSD integration sections

### 5. Security Events

- Failed login attempts — are they logged? Can you detect brute-force attacks?
- Account lockouts — logged with reason and admin who triggered it?
- Password resets — logged with requester IP/email?
- Session expirations — any logging for unusual patterns?
- Flag when security-sensitive events have no logging defined

### 6. Admin Action Attribution

- When an admin hides a review: is the admin's identity recorded?
- When an admin unpublishes a shop: is the admin's identity in the audit log?
- When an admin changes an inquiry status: same question
- Cross-reference FSD Admin features with the audit log schema — are all admin actions attributed?

### 7. Missing Metrics/Monitoring

- Search latency: is monitoring defined for search response times?
- API response times: any SLA or monitoring?
- PostGIS query performance for nearby search: any monitoring?
- Error rates: any alerting threshold defined?
- Flag when performance-critical operations have no monitoring defined

### 8. Data Retention

- Audit logs: how long are they kept? Is cleanup defined?
- Session data: expiry is 7 days per FSD — is cleanup of expired sessions defined?
- Password reset tokens: expire after 1 hour — are expired tokens cleaned up?
- Review reports: are report records retained after resolution?
- Flag when data with a lifecycle has no retention/cleanup policy

## Severity Rules

- **critical**: Auth/security event with no logging (failed logins, password resets, account locks)
- **warning**: State-changing action with no audit trail, or user-facing error with no traceability
- **info**: Missing monitoring metrics, data retention gaps, admin action without explicit attribution

## Output

- Print each issue as an `[OBSERV]` line
- If no issues found, print: `[OBSERV] All clear — no observability gaps found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files
