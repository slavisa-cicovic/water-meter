# PLAN: Meters domain model (Meter + consumer links)
#
# Scope: `wm-web` (Next.js 15 full-stack), Prisma (MySQL), domain-oriented structure.
#
# Goal
# - Define the initial Meter domain model with:
#   - `serialNumber` (unique, back-office managed)
#   - `groupCode?: string` (nullable, formatted "xx" from 01 to 99)
#   - `address` (required)
#   - `status` (MeterStatus)
#   - `installedAt?`, `notes?`, `createdAt`, `updatedAt`
# - Model consumer association as many-to-many:
#   - one consumer may pay for multiple meters
#   - one meter may be shared by multiple consumers (e.g. buildings)
#
# Constraints
# - Follow `wm-web/AGENT.md` conventions (types/service/repo/api/validation separation).
# - No new libraries without confirmation.
# - `groupCode` must be NULL when unassigned (do not use 0).
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
- `[ ]` `groupCode` representation:
  - `[ ]` Field name: `groupCode?: string` (not `groupId` yet)
  - `[ ]` Allowed values: NULL or `^(0[1-9]|[1-9][0-9])$` ("01"–"99")
  - `[ ]` Later: can be replaced by a `MeterGroup` entity relation (migration planned)
- `[ ]` Consumer link model:
  - `[ ]` Many-to-many via explicit join table/model (e.g. `MeterConsumer`)
  - `[ ]` Only `Account.role = consumer` can be linked (enforced in service layer)
- `[ ]` `serialNumber`:
  - `[ ]` Unique across the system
  - `[ ]` Populated by back-office (not auto-generated)
#
#
## Tasks
### Prisma (schema + migration)
- `[ ]` Add `MeterStatus` enum (`active|inactive|removed`).
- `[ ]` Add `Meter` model with fields:
  - `id` (uuid), `serialNumber` (unique), `groupCode` (nullable string),
    `address`, `status`, `installedAt?`, `notes?`, `createdAt`, `updatedAt`.
- `[ ]` Add join model `MeterConsumer`:
  - composite key/unique on `(meterId, accountId)`
  - indices for `meterId`, `accountId`
- `[ ]` Create migration SQL for MySQL.
- `[h]` If existing data exists, add a safe data-migration step (map old 1-N to join table).
#
### Types
- `[ ]` Add `wm-web/src/types/meters.ts`:
  - `MeterStatus`, `Meter`, `MeterCreateInput`, `MeterUpdateInput`, list params
  - add types for linking/unlinking consumers
#
### Validation
- `[ ]` Add `wm-web/src/validation/meters.ts`:
  - validate `serialNumber` required/non-blank
  - validate `address` required/non-blank
  - validate `groupCode` NULL or matches ("01"–"99")
  - validate `status` allowed values
  - validate `installedAt` ISO date (when provided)
#
### Repository
- `[ ]` Add `wm-web/src/repositories/meterRepository.ts`:
  - `create`, `update`, `delete`, `findById`, `list`
  - `addConsumerLink`, `removeConsumerLink`, `listConsumersForMeter`
#
### Service
- `[ ]` Add `wm-web/src/services/metersService.ts`:
  - enforce validation results (`VALIDATION_FAILED`)
  - enforce "consumer only" association (reject linking staff/admin)
  - ensure link dedupe (idempotent add)
#
### API routes
- `[ ]` Implement `wm-web/src/app/api/meters/route.ts`:
  - `GET` list, `POST` create
- `[ ]` Implement `wm-web/src/app/api/meters/[id]/route.ts`:
  - `GET` details, `PUT` update, `DELETE` delete
- `[ ]` Implement `wm-web/src/app/api/meters/[id]/consumers/route.ts`:
  - `POST` link consumer, `DELETE` unlink consumer
- `[ ]` Protect routes with back-office/admin guard (same convention as accounts).
#
### Tests
- `[ ]` Add Vitest unit tests for `MetersService`:
  - `groupCode` validation (NULL ok, "01" ok, "1"/"00"/"100" invalid)
  - "consumer only" link enforcement
  - idempotent link add
#
### Manual verification checklist
- `[t]` Create meter with `groupCode=null` succeeds.
- `[t]` Create meter with `groupCode="01"` succeeds; `"1"` fails.
- `[t]` Link/unlink consumer to meter works; linking staff/admin is rejected.

