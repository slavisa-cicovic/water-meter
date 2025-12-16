# PLAN: Playwright E2E (wm-web)
#
# Scope: `wm-web` end-to-end tests for critical user flows.
#
# Goal
# - Add Playwright-based E2E coverage for highest-risk workflows that unit/integration tests cannot reliably validate (browser storage, navigation, auth guard).
#
# Constraints
# - Continue development (no redesign).
# - No new libraries without confirmation (`wm-web/AGENT.md`) — Playwright install must be explicitly approved.
# - Network access may be restricted in CI; tests should run locally + in CI with deterministic data.
#
#
## Status legend (pick one per task)
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold
#
#
## Key decisions (make early)
- `[d]` Test data strategy:
  - `[d]` Option B: run against mocked API (Playwright route intercepts) to keep tests deterministic without DB.
  - `[h]` Option A: seed database + dedicated test DB (do later if you want “true E2E”).
- `[d]` Auth strategy:
  - `[d]` Reuse sessions via `storageState`, but keep at least one test covering the login UI.
- `[d]` Browsers in CI: `chromium` only (start simple).
#
#
## Setup
- `[d]` Add Playwright (`@playwright/test`) and config under `wm-web/`.
- `[d]` Add scripts:
  - `[d]` `test:e2e`
  - `[d]` `test:e2e:ci`
- `[d]` Ensure `baseURL` points to a test server and define a reliable port (default `3001`).
- `[d]` Add a “test user” strategy via fixtures (mocked `/api/auth/login` + `/api/auth/me`).
- `[h]` Address Next.js dev warning about `allowedDevOrigins` (optional; warning does not block tests today).
#
#
## Scenarios (initial suite)
### Auth + Remember me (high priority)
- `[d]` Login with “Remember me” checked:
  - login → dashboard visible
  - refresh → still logged in
  - new browser context using saved `storageState` → still logged in
- `[d]` Login with “Remember me” unchecked:
  - login → dashboard visible
  - refresh → still logged in
  - new browser context without `storageState` → redirected to `/auth/login`
- `[d]` Logout:
  - trigger logout from `AccountPopover`
  - redirect to `/auth/login`
  - attempting to visit a protected route redirects to login
#
### Header popovers (smoke)
- `[d]` Header ordering and interaction:
  - `LanguagePopover` opens/closes
  - `NotificationPopover` opens/closes
  - `SettingsButton` still works
  - `AccountPopover` opens/closes
#
### Accounts list (smoke)
- `[d]` Accounts list renders avatar as first column:
  - for non-consumer with avatar → image shown
  - for consumer → fallback avatar (initials) shown
#
#
## Reporting
- `[d]` Enable screenshots/video/trace on failure (configured in Playwright).
- `[h]` Publish HTML report as CI artifact (depends on your CI setup).
#
#
## Manual verification checklist
- `[t]` E2E suite runs locally on a clean install.
- `[t]` E2E suite runs in CI without flakiness (retries rarely needed).
