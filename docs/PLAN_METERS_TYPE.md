# PLAN: Meter type (automatic vs mechanical)
#
# Scope: `wm-web` (Next.js 15 + Prisma + API), meters domain.
#
# Goal
# - Introduce meter type:
#   - `automatic` (remote-readable)
#   - `mechanical` (manual visual reading)
# - Expose this field across DB, types, API, UI list, and seed.
#
# Constraints
# - Follow `wm-web/AGENT.md` conventions (types/service/repo/api/validation separation).
# - No new libraries.
# - Keep UI consistent with existing list view patterns.
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
## Decisions (make early)
- `[ ]` Field name: `type` or `meterType` (recommend `type` in Prisma + `meterType` in API to avoid ambiguity).
- `[ ]` Default type for new meters (recommend `mechanical`).
- `[ ]` Display label in UI list (e.g. "Automatic", "Mechanical").
#
#
## Tasks
### Prisma (schema + migration)
- `[ ]` Add enum `MeterType` with values `automatic`, `mechanical`.
- `[ ]` Add field to `Meter` model (e.g. `type MeterType @default(mechanical)`).
- `[ ]` Create migration SQL for MySQL.
#
### Types + validation
- `[ ]` Update `wm-web/src/types/meters.ts` with `MeterType` and field in `Meter`, `MeterCreateInput`, `MeterUpdateInput`.
- `[ ]` Update `wm-web/src/validation/meters.ts` to validate allowed types.
#
### Repository + service
- `[ ]` Update `wm-web/src/repositories/meterRepository.ts` to persist `type`.
- `[ ]` Update `wm-web/src/services/metersService.ts` mapping to include `type`.
#
### API + UI
- `[ ]` Update `wm-web/src/app/api/meters/*` to accept/return `type`.
- `[ ]` Update `wm-web/src/sections/meters/*`:
  - add a "Type" column to table
  - add filter for type (optional; decide)
#
### Seed
- `[ ]` Update `wm-web/prisma/seed.ts`:
  - assign `automatic`/`mechanical` mix (e.g. 30/70) for seeded meters.
#
### Tests
- `[ ]` Update meters service tests to cover type validation.
- `[ ]` Update meters API tests to include type in POST/GET (if applicable).
#
### Manual verification checklist
- `[t]` Creating a meter without specifying type uses the default.
- `[t]` Meters list displays correct type.
- `[t]` Filter by type (if implemented) works.

