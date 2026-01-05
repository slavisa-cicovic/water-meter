# Plan – RBAC (Database-Driven Permissions)

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Replace hardcoded role checks with a configurable, database-driven RBAC model.
- Use the database as the single source of truth for roles and permissions.
- Keep API and UI authorization aligned via the same permission model.
- Provide a safe migration path from current checks to DB-driven permissions.

## Tasks
1. `[ ]` Inventory current auth usage (API routes, services, UI guards) and map each check to a permission slug.
2. `[ ]` Define a permission catalog (resource:action) starting with settings, accounts, and meters; expand to other domains once stable.
3. `[ ]` Schema design: add `Role`, `Permission`, `RolePermission`, `AccountRole`, and a `permissionsVersion` (or equivalent) for cache invalidation.
4. `[ ]` Seed roles/permissions in DB and backfill `AccountRole` from existing `Account.role` values.
5. `[ ]` Backend resolution: implement a single `AuthorizationService` with an allow-only model (permission exists or not); defer deny overrides to a later phase.
6. `[ ]` API integration: replace `requireAccountsAccess`/role checks with permission checks; keep a dual-check feature flag and log mismatches.
7. `[ ]` JWT updates: include `permissionsVersion` in token payload; backend is the only writer. Bump version when user role changes or role-permission mapping changes, and verify JWT version matches server state.
8. `[ ]` UI integration: add a permission-based guard, fetch resolved permissions from the backend (e.g., `/api/auth/me`), and update navigation/feature gating.
9. `[ ]` Migration safety: run both old and new checks in parallel, verify parity, then remove hardcoded role logic.
10. `[ ]` QA: validate role/permission behavior across admin, staff_backoffice, staff_field, and consumer flows (web + mobile).

## Notes
- Phase 1 uses an allow-only model: permission exists or not; no deny overrides.
- Prefer permission slugs like `resource:action` (e.g., `settings:update`, `readings:edit`, `jobs:run`).
- Scope handling should be explicit if needed (e.g., per-meter or per-account scope).
- Keep `Account.role` as a legacy display field until migration is complete.
- `permissionsVersion` is backend-only; frontend and mobile must never increment it.
