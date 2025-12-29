# PLAN_MOBILE_READINGS

## Goal
Implement the mobile READING use case end-to-end (mobile UI + backend mobile endpoint) following existing architecture and AGENT rules.

## Scope
- Mobile (`wm-mobile`): readings screen UI, API/types/service wiring.
- Backend (`wm-web`): add `/api/mobile/readings` endpoint with GET (context) and POST (create).
- No offline engine changes.
- Image upload is stubbed for now (send `imageFilename`).

## Assumptions
- JWT auth for mobile endpoints uses the same token parsing as other `/api/mobile/*` routes.
- Previous reading value comes from the latest PAID invoice (end-reading link preferred; fallback to latest linked reading); if none, use 0.
- `originalValue` equals the recognized (fake OCR) value.
- Method is `photo_ocr` when a photo is captured; otherwise `manual`.
- If camera dependency is missing, add `expo-image-picker` with approval.

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Tasks
1. `[d]` Confirm backend payload fields and response shape for mobile readings create.
2. `[d]` Add backend `/api/mobile/readings` route with GET (reading context) + POST (create reading).
3. `[d]` Extend `MobileRepository` to fetch latest paid invoice reading + meter linkage.
4. `[d]` Extend `MobileService` with reading context and create-reading wrappers.
5. `[d]` Add mobile API/types for reading context and create payload/response.
6. `[d]` Add mobile service functions for reading context and submission with error mapping.
7. `[d]` Update readings screen UI: camera button, preview image, previous paid value, fake OCR, user input, submit.
8. `[d]` Wire camera permissions and capture flow (fake OCR = previous + 10..20).
9. `[ ]` Manual smoke check: load context, capture photo, submit reading, verify success/error display.
