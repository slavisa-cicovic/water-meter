# PLAN_WEB_SETTINGS

## Goal
Add an admin-only Settings page in `wm-web` where admins can set current month logic and currency, following existing routing + section view patterns.

## Scope
- Web only (`wm-web`).
- New dashboard route + section view.
- Backend API to load/save settings.
- Admin-only access guard.

## Assumptions
- Settings are stored server-side in a key/value table `AppSetting` and retrieved via `/api/*` endpoints.
- “Current month” setting has two modes:
  - Auto: app uses `new Date()`
  - Manual: admin selects a month (Jan–Dec)
- Currency is stored as a simple string (e.g., `EUR`, `USD`, `RSD`).
- Each setting group can be saved separately.

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Tasks
1. `[d]` Add `AppSetting` key/value table in Prisma schema (key unique, value JSON/string, timestamps).
2. `[d]` Add settings types in `wm-web/src/types/settings.ts` (month mode, month value, currency).
3. `[d]` Create settings repository + service in `wm-web/src/repositories/settingsRepository.ts` and `wm-web/src/services/settingsService.ts`.
4. `[d]` Add API routes in `wm-web/src/app/api/settings/route.ts` (GET/PUT) with admin guard and validation.
5. `[d]` Add dashboard page route `wm-web/src/app/dashboard/settings/page.tsx` and section view `wm-web/src/sections/settings/view/settings-view.tsx`.
6. `[d]` Implement UI controls:
   - Month mode toggle (auto/manual)
   - Month picker when manual
   - Currency input/select
   - Separate Save actions (month vs currency)
7. `[d]` Wire API calls and loading/error states.
8. `[d]` Add RoleBasedGuard to restrict access to admin only.
9. `[ ]` Manual smoke check: view settings, change month/currency, save, reload.
