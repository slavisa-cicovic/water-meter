# PLAN_CURRENCY_FORMATTING

## Goal
Format all currency values based on `settings.currency` (e.g. `120,00 RSD` for RSD, `$120.00` for USD).

## Scope
- Web only (`wm-web`).
- UI display formatting of currency values.
- Reuse `settings.currency` as the single source of truth.

## Assumptions
- `settings.currency` is already available in the web app settings state.
- The currency code is a standard ISO 4217 string (e.g. `RSD`, `USD`, `EUR`).
- Values are numeric and should always display two decimals.

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Tasks
1. `[d]` Inventory all currency displays in `wm-web` (tables, cards, charts, forms).
2. `[d]` Add a shared formatter utility that uses `Intl.NumberFormat` with `settings.currency`.
3. `[d]` Ensure `settings.currency` is available where formatting occurs (context/store/hooks).
4. `[d]` Replace inline/legacy formatting with the shared formatter.
5. `[d]` Verify locale/format rules:
   - `RSD` -> `120,00 RSD`
   - `USD` -> `$120.00`
6. `[d]` Manual smoke check across affected views.
