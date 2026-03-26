# scope-audit-behavior

User behavior simulator — simulates chaotic real-user behavior: spam clicks, refreshes, multi-tab, back button, unexpected navigation, input abuse.

## Input

You will receive a `scope` — either a list of specific file paths or "all" to scan the entire `docs/swida/` directory.

## Task

For each user-facing flow defined in FSD and UIUX, simulate what real users actually do — not the happy path, but the chaotic path. For each issue, output a line in this exact format:

```
[BEHAV] <severity> | <file-path>:<line-number> | <description>
```

Severity is one of: `critical`, `warning`, `info`.

## Doc Structure

SWIDA docs are at `docs/swida/` with `prd/`, `tsd/`, `fsd/`, `uiux/` subdirectories. Audit EN files only.

## Checks

### 1. Rapid Repeated Clicks

- Identify all form submit buttons in FSD/UIUX: sign up, login, review submit, partnership inquiry, password reset request, search
- For each: is submit button disabled after first click? Is debounce defined?
- Look for: "disabled", "loading state", "debounce" in UIUX interaction descriptions
- Flag when a write-operation button has no click protection defined

### 2. Browser Back/Forward

- Identify all multi-step flows with success states: sign up → success modal, review submit → success modal, partnership inquiry → success, password reset → confirmation
- For each: what happens if user hits browser back after success? Can they re-submit? Do they see a stale form?
- Look for: "redirect after success", "replace history", "prevent back navigation" in FSD storyboards

### 3. Multi-Tab

- Login in two tabs — user logs in on tab 1. Tab 2 still shows login page. User tries to log in on tab 2.
- Admin opens shop edit in two tabs — saves different data in each. Which version persists?
- Look for: session synchronization, tab-awareness mentions in FSD/UIUX

### 4. Page Refresh Mid-Flow

- Refresh during OAuth callback — is the callback idempotent?
- Refresh the password reset page (token in URL) — is the token consumed on page load or on form submit?
- Refresh after form submit but before success modal — does the submission repeat?
- Look for: token consumption timing, form re-submission prevention

### 5. Stale Page

- User loads shop detail, leaves tab open for hours, then submits a review. Shop was unpublished in the meantime. What error?
- User loads search results, leaves, returns. Results are stale. Any indication?
- Look for: stale data handling, TTL on cached pages, ISR revalidation in TSD

### 6. Direct URL Access

- User types `/en/auth/reset-password` without a token parameter — what happens?
- User bookmarks a search page with filters — filters still valid later?
- User shares a shop URL for a now-unpublished shop — 404? Error message? Redirect?
- Look for: missing parameter handling, unpublished content behavior in FSD

### 7. Form Abandonment

- User fills half a shop create form (admin, 15+ fields) and navigates away — unsaved changes warning?
- User starts writing a review and accidentally closes the modal — content lost?
- Look for: "unsaved changes", "confirm navigation", "draft save" in FSD/UIUX

### 8. Input Abuse

- Max-length inputs: 500-char review at exactly 500, 20-char display name at exactly 20 — boundary behavior?
- Special characters in search: `<script>`, emoji, SQL injection attempts — is input sanitization defined?
- HTML tags in text fields: review body, partnership message — is XSS prevention mentioned?
- Look for: input sanitization, XSS prevention, max-length enforcement in FSD field constraints

## Severity Rules

- **critical**: Behavior that could corrupt data or bypass auth (re-submit creating duplicates, stale token reuse, XSS via input)
- **warning**: Confusing UX with no defined handling (back button loops, stale page errors, lost form data)
- **info**: Minor UX gaps (no unsaved changes warning, no debounce on search, no stale-data indicator)

## Output

- Print each issue as a `[BEHAV]` line
- If no issues found, print: `[BEHAV] All clear — no user behavior risks found.`
- Do NOT fix anything — report only
- Use the Read tool, Glob tool, and Grep tool to examine files
