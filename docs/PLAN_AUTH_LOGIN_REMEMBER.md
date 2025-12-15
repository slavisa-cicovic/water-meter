# PLAN: Login "Remember me"
#
# Scope: `wm-web` (Next.js + MUI), existing JWT auth context.
#
# Goal
# - Implement a real "Remember me" behavior:
#   - checked: persist session across browser restarts
#   - unchecked: session ends when the browser/tab closes
#
# Notes / assumptions
# - Token is stored client-side (previous implementation used `sessionStorage` only).
# - We’ll keep current JWT flow and only change storage/session behavior.
#
#
## Decisions (implemented)
- Remember checked → store `accessToken` in `localStorage` (persists across restarts).
- Remember unchecked → store `accessToken` in `sessionStorage` (ends when browser/tab closes).
- Init reads `sessionStorage` first, then `localStorage`.
- Logout and token-expiry clear both storages.
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
## Tasks
### Design & UX
- `[d]` Confirm expected behavior for "Remember me" (session vs local persistence, logout behavior).
- `[d]` Keep checkbox + helper text consistent with LoginView design (no layout changes unless needed).
#
### Auth storage strategy
- `[d]` Introduce a small storage abstraction for auth session (e.g. `tokenStorage`):
  - persistent: `localStorage`
  - session-only: `sessionStorage`
- `[d]` Persist the chosen mode (`remember=true/false`) so refresh works consistently.
#
### Implementation
- `[d]` Update login submit flow to pass `remember` into the JWT session setter.
- `[d]` Update `setSession` (or equivalent) to write token/user into:
  - `localStorage` when remember is checked
  - `sessionStorage` when remember is unchecked
- `[d]` Update AuthProvider initialization to read token from the correct storage (session first, then persistent).
- `[d]` Ensure logout clears both storages.
#
### Tests
- `[d]` Add unit tests for token storage logic (store/read/clear; remember true/false).
- `[d]` Add AuthProvider/init test to ensure correct storage source priority.
#
### Manual verification checklist
- `[t]` Remember checked: login → refresh → still logged in; close browser → still logged in.
- `[t]` Remember unchecked: login → refresh → still logged in; close browser → logged out.
- `[t]` Logout always logs out, regardless of remember choice.
#
## Notes
- `wm-web` tests pass via `npx vitest run`. `npm run test:ci` currently fails due to missing `@vitest/coverage-v8` (add it only if you want coverage in CI).
