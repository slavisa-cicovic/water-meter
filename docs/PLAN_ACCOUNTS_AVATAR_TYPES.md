# PLAN: Accounts avatar field + list avatar column
#
# Scope: `wm-web` (Next.js 15 + TypeScript), accounts domain types + accounts list UI.
#
# Goal
# - Add `avatar` support to account types.
# - Consumers must not have an avatar; all other roles may have one.
# - In the accounts list, the first column should be the avatar.
#
# Constraints
# - Continue development (no redesign / no layout refactor).
# - Follow `wm-web/AGENT.md`:
#   - TypeScript, function components
#   - absolute imports from `src/`
#   - no default exports (only named exports)
#   - do not add new libraries without confirmation
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
### Types
- `[d]` Review current account types in `wm-web/src/types/accounts.ts`.
- `[d]` Add `avatar` field with role constraints:
  - `[d]` `consumer`: must not have avatar (type-level constraint)
  - `[d]` non-consumer roles: `avatar?: string` (URL or storage key)
- `[d]` Ensure exported types remain compatible (only additive changes where possible).
#
### Backend shape
- `[d]` Propagate `avatar` through repository/service/API responses for accounts list and account details.
- `[d]` Ensure existing endpoints remain stable (only additive field).
- `[h]` Decide persistence strategy and add DB column:
  - URL stored in DB (e.g. `avatarUrl`), OR
  - file key stored in DB (e.g. `avatarKey`) with CDN/storage resolution layer
  - implement together with Edit Account (so we can manage upload/validation)
#
### UI (Accounts list)
- `[d]` Add avatar as the first column in the accounts list table.
- `[d]` Rendering rules:
  - `[d]` If avatar present: show image/avatar.
  - `[d]` Otherwise: fallback avatar (initials or generic).
  - `[d]` Consumers always fallback (no avatar image).
#
### Tests
- `[d]` Update/add tests for API response shape including `avatar` when present.
- `[d]` Update/add UI test ensuring avatar column renders first and fallback works.
#
### Manual verification checklist
- `[t]` Accounts list shows avatar as the first column.
- `[t]` Non-consumer with avatar renders image avatar.
- `[t]` Consumer renders fallback avatar (no avatar image).
