# PLAN_WEB_CURRENT_DATE

## Goal
Implement a settings-based “effective date” override (date from settings + real clock time) for dev flow testing without changing Prisma `@default(now())` / `@updatedAt`.

## Scope
- Web (`wm-web`) only.
- Settings keys + UI for effective date.
- Override date usage in jobs and readings flows (create/edit).
- Do NOT modify Prisma `@default(now())` / `@updatedAt`.

## Assumptions
- Settings are stored in `AppSetting` key/value table.
- Keys: `currentDate.mode` and `currentDate.value` (ISO date string, e.g. `2025-01-09`).
- When mode is `auto`, use real `new Date()`.
- When mode is `manual`, use date from settings + current time from real `new Date()`.
- Prisma `@default(now())` / `@updatedAt` stay unchanged (DB time).

## Prisma now/updatedAt locations (informational)
- `wm-web/prisma/schema.prisma`: `JobDefinition.createdAt`, `JobDefinition.updatedAt`
- `wm-web/prisma/schema.prisma`: `JobRun.runAt`
- `wm-web/prisma/schema.prisma`: `Account.createdAt`, `Account.updatedAt`
- `wm-web/prisma/schema.prisma`: `VerificationLog.reviewedAt`
- `wm-web/prisma/schema.prisma`: `Meter.createdAt`, `Meter.updatedAt`
- `wm-web/prisma/schema.prisma`: `Reading.createdAt`, `Reading.updatedAt`
- `wm-web/prisma/schema.prisma`: `ReadingEdit.editedAt`
- `wm-web/prisma/schema.prisma`: `Tariff.createdAt`, `Tariff.updatedAt`
- `wm-web/prisma/schema.prisma`: `Invoice.createdAt`, `Invoice.updatedAt`
- `wm-web/prisma/schema.prisma`: `InvoiceOverrideLog.createdAt`
- `wm-web/prisma/schema.prisma`: `AppSetting.createdAt`, `AppSetting.updatedAt`

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Tasks
1. `[d]` Rename settings keys/types to `currentDate.*` in `wm-web/src/types/settings.ts`.
2. `[d]` Update settings validation for ISO date in `wm-web/src/validation/settings.ts`.
3. `[d]` Update settings defaults + getters in `wm-web/src/services/settingsService.ts`.
4. `[d]` Implement `getEffectiveDate()` to combine settings date + real time.
5. `[d]` Apply effective date in readings create/edit:
   - `wm-web/src/app/api/mobile/readings/route.ts`
   - `wm-web/src/services/readingsService.ts`
6. `[d]` Apply effective date in manual job run flow:
   - `wm-web/src/services/job-handlers.ts`
7. `[d]` Update settings UI to select date (auto/manual) in `wm-web/src/sections/settings/view/settings-view.tsx`.
8. `[d]` Update API usage/storage keys and decide migration for existing `currentMonth.*` keys.
9. `[ ]` Manual smoke check: settings save, readings create/edit, manual job run use effective date.
