# PLAN: Meter create flow (register new meter)
#
# Scope: `wm-web` (Next.js 15 + MUI), meters domain.
#
# Goal
# - Add a “New meter” action to the meters list and provide a create flow.
# - Allow backoffice to register a new meter with:
#   - serialNumber
#   - groupCode
#   - address
#   - type (automatic/mechanical)
#   - assigned consumers (1 or many)
# - Status is always **Inactive** on create (backoffice cannot change it).
#
# Constraints
# - Follow `wm-web/AGENT.md` conventions (sections/<domain>/view, services/api/types separation).
# - Keep layout consistent with existing list views.
# - No new libraries.
#
#
## Status legend
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
1. `[ ]` Add “New meter” button in meters list header (right aligned).
2. `[ ]` Add route `/dashboard/meters/new`:
   - `wm-web/src/app/dashboard/meters/new/page.tsx`
   - render `<MeterCreateView />`
3. `[ ]` Add `MeterCreateView`:
   - `wm-web/src/sections/meters/view/meter-create-view.tsx`
   - layout: `Container` + `MeterEditForm`
4. `[ ]` Implement `MeterEditForm` for create:
   - fields: `serialNumber`, `groupCode`, `address`, `type`, `consumers`
   - status is fixed to `inactive` (hidden/read-only)
   - consumer selection: multi-select list
5. `[ ]` API integration:
   - create meter via `/api/meters` (POST)
   - link consumers via `/api/meters/[id]/consumers` (POST)
6. `[ ]` Validation + UX:
   - required fields
   - groupCode format (01–99 or null)
   - show success/failure feedback
7. `[ ]` Tests:
   - API-level test for create flow (optional)
   - UI smoke test for create view (optional)
#
