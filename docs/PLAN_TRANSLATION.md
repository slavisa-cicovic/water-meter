# PLAN_TRANSLATION

## Goal
Introduce multilingual support with Serbian (Latin + Cyrillic) and English across the app.

## Scope
- `wm-web` and `wm-mobile` UI text.
- Language selection and persistence.
- Localization infrastructure (no new libraries without confirmation).

## Assumptions
- Most UI strings are currently hardcoded in English.
- Language choice should persist per user/device.
- Serbian Latin and Cyrillic are separate locales (`sr-Latn`, `sr-Cyrl`) sharing the same translation keys.

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Tasks
1. `[d]` Inventory existing language/i18n handling in `wm-web` and `wm-mobile`.
2. `[d]` Decide localization approach per app (reuse existing setup if present; confirm before adding libraries).
3. `[d]` Define supported locales and labels: `en`, `sr-Latn`, `sr-Cyrl`.
4. `[p]` Create translation key structure and base English dictionary.
5. `[p]` Add Serbian Latin translations.
6. `[p]` Add Serbian Cyrillic translations (ensure key parity with Latin).
7. `[d]` Implement language state + persistence:
   - `wm-web`: tie into existing settings/profile or language storage.
   - `wm-mobile`: persist via AsyncStorage + app state store.
8. `[p]` Wire language switching UI:
   - `wm-web`: use existing header language popover patterns.
   - `wm-mobile`: add to settings/profile screen (or existing equivalent).
9. `[p]` Replace hardcoded strings with translation keys in priority screens (auth, dashboard, meters, readings, billing).
10. `[ ]` Validate locale-sensitive formatting (dates/numbers) aligns with selected locale.
11. `[ ]` Manual QA: language switch persists, no missing keys, and layouts handle longer strings.
12. `[p]` Add backend translations storage + admin editor + mobile runtime fetch (ETag/If-Modified-Since with local fallback).
