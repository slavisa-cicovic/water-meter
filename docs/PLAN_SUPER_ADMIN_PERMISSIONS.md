# Super Admin Permission Management Plan

## Summary
We will add a Super Admin page that manages which roles can access which domains and actions,
including role-to-role visibility rules (e.g. which account roles an admin can see). The
database remains the single source of truth; the UI simply edits role-permission mappings and
their optional conditions.

## Goals
- Allow super_admin to configure role permissions in-app instead of editing DB by hand.
- Support role-to-role visibility rules (ex: admin can see only these account roles).
- Keep API and UI using the same permission model as current RBAC.
- Provide a safe rollout with minimal impact on existing flows.

## Non-Goals (for initial rollout)
- Advanced deny rules (keep allow-only model).
- Field-level permissions.
- Multi-tenant role templating across organizations.

## Data Model (reuse existing RBAC)
- Role
  - id, name, slug, staffRole?, createdAt, updatedAt
- Permission
  - id, code, name, createdAt, updatedAt
- RolePermission
  - roleId, permissionId, conditions (JSON, optional)

### Condition Schema (initial)
- For account visibility:
  - `accounts.visibility.allowedRoles: string[]` (role slugs)
  - Example stored in `RolePermission.conditions` for `accounts:list` or `accounts:read`
  - If the list is empty, it means "no restrictions"
- For future domains:
  - `meters.visibility.allowedRoles`
  - `billing.visibility.allowedRoles`
  - `readings.visibility.allowedRoles`
  - Keep schema namespaced by domain to avoid collisions.

## API Contract
- `GET /api/roles`
  - Returns roles with permissions and conditions for role-permission assignments.
- `GET /api/permissions`
  - Returns all permissions.
- `PATCH /api/roles/:id/permissions`
  - Body: list of `{ permissionCode, enabled, conditions? }`
  - Server validates condition schema by permission domain.

## UI Plan (Super Admin Page)
- Location: `dashboard/settings`, below existing "current date" and "currency" sections
- Views:
  - Roles list (left)
  - Permission matrix or grouped list (right)
  - Per-permission settings drawer for conditions (e.g. account visibility roles)
- Data flow:
  - Load `roles` + `permissions`
  - Mutations call `PATCH /api/roles/:id/permissions`
  - UI shows resolved permissions with conditions.

## Runtime Permission Resolution
- Backend remains source of truth; API resolves permissions and optional conditions.
- For visibility:
  - When listing accounts, backend reads conditions for `accounts:list`
  - Applies allowedRoles filter only if conditions present and non-empty
  - If missing, default to current behavior (no extra filter)

## Migration Strategy
1. Read-only UI first (shows role-permission mapping + conditions).
2. Enable edits only for super_admin.
3. Use feature flag to turn on conditions usage for accounts list/read.
4. Gradually enable conditions for other domains.

## Tasks (Phase 1)
- Add `super_admin` role if not present and seed permissions.
- Expose `GET /api/permissions` and extend `GET /api/roles` to include conditions.
- Add `PATCH /api/roles/:id/permissions` with validation.
- Build Super Admin UI for accounts visibility rules.
- Update account list/read to honor `accounts.visibility.allowedRoles`.
- Add audit logs for permission changes (role-permission updates).

## Open Questions
- Do we want audit logs for permission changes? Yes.
- Where should the Super Admin page live in the nav? Settings, below current date and currency.
- Should super_admin be able to edit roles themselves or only permissions? Super admin can add new roles.

## Additional Constraints
- Resources are predefined in code (accounts, meters, billing, readings, etc).
- Actions are predefined in code (view, create, reject, issue, etc).
- Super admin can only check/uncheck permissions, not create new resource/action types.
