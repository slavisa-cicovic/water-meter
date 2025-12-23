# PLAN: Readings domain model (no list view yet)
#
# Scope: `wm-web` (Next.js 15 full-stack), Prisma (MySQL), meters domain.
#
# Goal
# - Introduce the Readings domain model with:
#   - `meterId`
#   - `readAt` (timestamp)
#   - `method` (remote | manual | photo_ocr)
#   - `readerAccountId` (consumer or staff_field)
#   - `value` (current reading value)
#   - edit/audit fields (original vs edited value + editor + note)
#   - `imageFilename` (required only for photo_ocr)
# - Provide API endpoints to list readings by meter/account and to create/update readings.
# - Defer any dedicated `readings_list_view` UI until billing/detail views are defined.
#
# Constraints
# - Follow `wm-web/AGENT.md` conventions (types/service/repo/api/validation separation).
# - No new libraries.
# - Keep audit fields explicit to support later billing disputes.
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
- `[ ]` Enum names:
  - `ReadingMethod`: `remote`, `manual`, `photo_ocr`
- `[ ]` Edits history:
  - use `ReadingEdit` table (user-driven changes)
  - store `value`, `reason`, `accountId`, `editorRole`, `editedAt`
- `[ ]` Image requirement:
  - `imageFilename` required when `method=photo_ocr`, else NULL
#
#
## Tasks
### Prisma (schema + migration)
1. `[ ]` Add enums: `ReadingMethod` (remote/manual/photo_ocr).
2. `[ ]` Add `Reading` model with fields:
   - `id` (uuid)
   - `meterId` (FK to Meter)
   - `readerAccountId` (FK to Account)
   - `readAt` (DateTime)
   - `method` (ReadingMethod)
   - `value` (Int or Decimal — decide)
   - `originalValue` (Int/Decimal)
   - `imageFilename` (String, nullable; required for photo_ocr)
   - `createdAt`, `updatedAt`
   - indices on `meterId`, `readerAccountId`, `readAt`
3. `[ ]` Add `ReadingEdit` model:
   - `id` (uuid)
   - `readingId` (FK to Reading)
   - `accountId` (FK to Account)
   - `editorRole` (AccountRole)
   - `value` (Int/Decimal)
   - `reason` (Text, nullable)
   - `editedAt` (DateTime)
   - indices on `readingId`, `accountId`, `editedAt`
4. `[ ]` Create migration SQL for MySQL.
#
### Types + validation
5. `[ ]` Add `wm-web/src/types/readings.ts`:
   - `ReadingMethod`, `Reading`, `ReadingCreateInput`, `ReadingUpdateInput`, list params
6. `[ ]` Add `wm-web/src/validation/readings.ts`:
   - validate method + imageFilename rule
   - validate value/originalValue presence and numeric range
   - validate reader role (consumer or staff_field)
#
### Repository + service
7. `[ ]` Add `wm-web/src/repositories/readingRepository.ts`:
   - `create`, `update`, `findById`, `list`
8. `[ ]` Add `wm-web/src/services/readingsService.ts`:
   - enforce validation
   - enforce role constraints (reader must be consumer/staff_field)
   - create `ReadingEdit` entry when value changes
#
### API routes
9. `[ ]` Add `wm-web/src/app/api/readings/route.ts`:
   - `GET` list (filters: meterId, accountId, from/to)
   - `POST` create
10. `[ ]` Add `wm-web/src/app/api/readings/[id]/route.ts`:
   - `GET` details
   - `PUT` update
# 11. `[ ]` Protect routes (same guard as accounts/meters; refine later if needed)
#
### Seed data
12. `[ ]` Update `wm-web/prisma/seed.ts`:
   - create sample readings for a few meters
   - include at least one photo_ocr with imageFilename
   - include one edited reading (originalValue != value) with ReadingEdit entry
#
### Tests
13. `[ ]` Add service tests:
   - imageFilename required when method=photo_ocr
   - role constraints for reader
   - edit entry created when value changes
14. `[ ]` Add API tests for basic GET/POST/PUT
#
### Manual verification checklist
15. `[t]` Create a photo_ocr reading without imageFilename → validation error.
16. `[t]` Create a manual reading with reader role staff_field → success.
17. `[t]` Update reading value → ReadingEdit entry created.
# 18. `[t]` List readings by meter and by account works.
