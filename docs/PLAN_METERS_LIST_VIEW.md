# PLAN: Meters list view + deterministic seeding
#
# Scope: `wm-web` (Next.js 15 + MUI), meters domain (Prisma + API routes already added).
#
# Goal
# - Add a `meter-list-view` that mirrors the routing and UI patterns of `account-list-view`.
# - Add deterministic seed data for meters and their consumer links (many-to-many) to support UI testing and demos.
#
# Constraints
# - Follow `wm-web/AGENT.md` conventions:
#   - UI under `src/sections/<domain>/view`
#   - API hooks under `src/api`
#   - domain logic under `src/services`
#   - types under `src/types`
#   - validation under `src/validation`
# - No new libraries without confirmation.
# - Keep design consistent with `AccountsListView` (table layout, filters, pagination, skeletons).
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
## Decisions (make early)
- `[ ]` List columns (initial):
  - serial number
  - group code
  - address
  - status
  - consumer count (derived from `MeterConsumer`)
  - created date
  - actions (placeholder for later)
- `[ ]` Filters (initial):
  - search (serialNumber/address/groupCode)
  - status (active/inactive/removed)
  - groupCode (optional)
- `[ ]` Routing:
  - `/dashboard/meters` list page (mirrors `/dashboard/accounts`)
#
#
## Tasks
### Routing + navigation
- `[ ]` Add `paths.dashboard.meters` in `wm-web/src/routes/paths.ts`.
- `[ ]` Add "Meters" nav item in `wm-web/src/layouts/dashboard/config-navigation.tsx`.
- `[ ]` Add `wm-web/src/app/dashboard/meters/page.tsx` that renders `<MetersListView />`.
#
### API hook layer
- `[ ]` Add `endpoints.meters.*` in `wm-web/src/utils/axios.ts`:
  - `list`, `details(id)`, `consumers(id)`
- `[ ]` Add `wm-web/src/api/meters.ts`:
  - `useGetMeters()` SWR hook that matches `useGetAccounts` style (query params + pagination)
#
### UI (meters list)
- `[ ]` Create `wm-web/src/sections/meters/view/meters-list-view.tsx`:
  - mirror `AccountsListView` layout (Container → Card → Toolbar → FiltersResult → Table → Pagination)
- `[ ]` Create `wm-web/src/sections/meters/view/index.tsx` re-export (same pattern as accounts).
- `[ ]` Create table components (mirror accounts structure):
  - `wm-web/src/sections/meters/meter-table-toolbar.tsx` (search + status + groupCode)
  - `wm-web/src/sections/meters/meter-table-row.tsx`
  - `wm-web/src/sections/meters/meter-table-filters-result.tsx`
  - `wm-web/src/sections/meters/meter-skeleton.tsx`
#
### Seed data (meters + links)
- `[ ]` Update `wm-web/prisma/seed.ts`:
  - Extend `clearData()` to delete `MeterConsumer` then `Meter` (before accounts).
  - After seeding accounts, query consumer accounts deterministically (e.g. `orderBy: { email: 'asc' }`).
  - Create 40 meters and link them 1:1 with the first 40 consumer accounts.
  - Create 1 shared meter and link the remaining 15 consumer accounts to it (building scenario).
  - Create 1 additional meter and link it to any consumer that already has a meter (so one consumer has 2 meters).
  - Assign `groupCode`:
    - for 1:1 meters: `"01"`..`"40"`
    - shared meter: `"99"` (or another reserved code)
    - extra meter: `"41"` (or another free code)
#
### Tests
- `[ ]` Add minimal tests:
  - `[ ]` Unit test for `useGetMeters` mapping (optional), OR
  - `[ ]` UI test that renders `MetersListView` with mocked SWR response (match existing test style if present).
#
### Manual verification checklist
- `[t]` `npx prisma db seed` creates meters and links as specified.
- `[t]` `/dashboard/meters` renders table, pagination and filters.
- `[t]` Status filter works (active/inactive/removed).
- `[t]` Search matches serialNumber/address/groupCode.
- `[t]` Shared meter shows consumer count = 15 and one consumer shows 2 meters in DB.

