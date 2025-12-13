# Plan – Accounts API Access Control

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Restrict accounts APIs to `admin` and `staff_backoffice` roles.
- Enforce visibility: `staff_backoffice` sees only consumers; `admin` sees admin + staff_backoffice (and optionally others if needed).

## Tasks
1. `[d]` Token/role source: confirm token payload carries role (`admin`, `staff_backoffice`, etc.); extend types if needed.
2. `[d]` Add API guard middleware/helper for `/api/accounts*` that rejects non-admin/backoffice.
3. `[d]` Update `AccountsService.list/findById` to accept viewer role and constrain results (staff_backoffice -> consumers only; admin -> admin + staff_backoffice [+ others if desired]).
4. `[d]` Apply guard/role to API routes (`/api/accounts`, `/api/accounts/[id]`, `/api/accounts/verify`, etc.) passing viewer role to service.
5. `[d]` Optional UI handling: surface 403 errors and hide entry points if user lacks role.
6. `[ ]` QA: verify role-based visibility and access denials for unauthenticated/unauthorized roles.
