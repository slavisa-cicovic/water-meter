# Plan – Align Type Filter with Viewer Roles

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Make the accounts “type” filter reflect viewer role (admin vs staff_backoffice) in both UI options and backend filtering.
- Ensure “all” means role-appropriate scopes (not every role).

## Tasks
1. `[d]` UI options: derive type filter options from current user role:
   - admin: all, admin, staff_backoffice
   - staff_backoffice: all, consumer, staff_field, staff_backoffice
2. `[d]` UI default: map “all” to an explicit value (e.g., empty) and pass through to API.
3. `[d]` Backend logic (`AccountsService.list` / API): interpret type per viewer role:
   - admin: all -> [admin, staff_backoffice]; specific -> that role only
   - staff_backoffice: all -> [consumer, staff_field, staff_backoffice]; specific -> that role only
4. `[d]` Adjust tests (service/API/UI) to match new semantics; add assertions for option lists and allowed roles.
5. `[d]` QA: verify filtering for admin/staff_backoffice in UI and API returns correct scopes; ensure consumers/other roles cannot access. (Covered via updated role logic and tests.)
