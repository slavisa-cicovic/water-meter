# PLAN: Jobs list view refactor (table pattern)
#
# Scope: `wm-web` jobs list UI (view + table components).
#
# Goal
# - Align Jobs list with billing/account list pattern (toolbar, filters result, row, skeleton).
# - Add table actions for bulk delete/activate/deactivate.
# - Keep existing create/edit/run dialogs working.
#
# Constraints
# - No new libraries.
# - Delete is logical only (soft delete / disable), not hard delete.
# - Preserve existing layout and navigation.
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
1. `[d]` Confirm jobs API capabilities for delete/activate/deactivate (logical delete) and available filters/search.
2. `[d]` Create jobs table components:
   - `jobs-table-toolbar` (search/status filters)
   - `jobs-table-filters-result`
   - `jobs-table-row`
   - `jobs-table-skeleton`
3. `[d]` Refactor `jobs-list-view.tsx` to use new components, shared table helpers, and consistent pagination/sorting.
4. `[d]` Implement bulk actions (delete/activate/deactivate) via `TableSelectedAction` with confirm dialog.
5. `[d]` Wire backend calls for actions and ensure UI refresh (mutate) on success.
6. `[ ]` QA: selection, actions, filters, and dialogs (create/edit/run).
7. `[d]` Add generic search (as in billing overview) to filter by job name and handler.
8. `[d]` Add job run master-detail with run timestamps and summary counts.
#
