# PLAN: Tariffs views (list/create/detail)
#
# Scope: `wm-web` tariffs UI (list/create/detail) + table components.
#
# Goal
# - Add Tariff list view with client-side filtering/sorting.
# - Add create and detail views following account/meter patterns.
# - Provide table actions for delete/activate/deactivate.
#
# Constraints
# - No new libraries.
# - Client-side filtering/sorting only.
# - Delete is logical only (soft delete / deactivate).
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
1. `[d]` Inspect tariff model/API to confirm status fields and logical delete behavior.
2. `[d]` Add tariffs table components:
   - `tariff-table-toolbar` (client-side search)
   - `tariff-table-filters-result`
   - `tariff-table-row`
   - `tariff-skeleton`
3. `[d]` Implement `tariff-list-view` with table pattern, selection, and bulk actions (delete/activate/deactivate).
4. `[d]` Implement `tariff-create-view` (form + validation) and hook into API.
5. `[d]` Implement `tariff-detail-view` (view/edit) using same form pattern.
6. `[d]` Wire routes/pages and update navigation if needed.
7. `[ ]` QA: list, create, detail, bulk actions, client-side filter.
#
