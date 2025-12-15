# Plan – Tests for Accounts Filters (UI/MSW)

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Add automated tests to verify accounts filters (search, type, status) and result count behave correctly.
- Use Vitest + React Testing Library + MSW (no Playwright yet).

## Tasks
1. `[d]` Test setup: add RTL and MSW helpers (test render, server setup).
2. `[d]` Mock `/api/accounts` via MSW to capture query params and return controlled data (multiple pages, different roles/types/status).
3. `[d]` Search filter test: type partial name/email, expect filtered rows.
4. `[d]` Type filter test: select consumer/staff, expect filtered rows.
5. `[d]` Status filter test: select pending/verified/rejected, expect filtered render.
6. `[d]` Combined filters: search + type + status → verify all params and rows; pagination shows correct total.
7. `[h]` (Optional) Reset filters test: “Clear” restores defaults and fetches unfiltered results.
8. `[d]` Document how to run UI/MSW tests (npm test / npm run test:ci); note: uses MSW + RTL (no Playwright yet).
