# PLAN: Readings history edit (AccountEditForm)
#
# Scope: `wm-web` (AccountEditForm staff_field view), readings domain.
#
# Goal
# - Enable backoffice to edit reading values via a dialog with validation against adjacent readings.
#
# Constraints
# - No new libraries.
# - Follow existing UI patterns (tables, dialogs, actions).
# - Validate: new value must be >= previous and <= next reading (sorted by readAt desc).
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
1. `[d]` Review readings update flow + identify where to add actions column and dialog state in `AccountEditForm`.
2. `[d]` Add actions column + dialog for editing reading value (prefill current value).
3. `[d]` Add mandatory edit reason field; show editor name + reason tooltip in table.
4. `[d]` Implement client-side validation vs previous/next reading + mandatory reason and surface errors in dialog.
5. `[d]` Call update endpoint on save; refresh readings list and show updated value.
6. `[r]` Quick QA for validation boundaries and no console errors.
#
