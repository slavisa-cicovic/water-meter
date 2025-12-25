# PLAN: Generic table-selected-action
#
# Scope: `wm-web` shared table components.
#
# Goal
# - Replace hardcoded actions (`actionDelete`, `actionActivate`, `actionDeactivate`) with a generic actions list.
# - Enable bulk actions on tables (e.g., invoice status changes).
#
# Constraints
# - Keep existing UX consistent.
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
1. `[d]` Define generic actions API for `TableSelectedAction` (label, icon, onClick, disabled, color).
2. `[d]` Update `table-selected-action.tsx` to render actions from config.
3. `[d]` Refactor existing usages to pass the action list (remove hardcoded props).
4. `[d]` Add a usage example for invoices bulk action (confirm/issue) once status exists.
5. `[r]` Quick QA: selection + action triggers still work.
#
