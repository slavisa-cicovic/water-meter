# PLAN_MOBILE_OCR

## Goal
Implement meter reading recognition from photos (camera + gallery), including watermark metadata and permission-safe handling for App Store / Play Store.

## Scope
- Mobile (`wm-mobile`): capture/select image, draw watermark (date + user name), run OCR, display recognized value.
- Backend (`wm-web`): optional endpoint to upload/store image or OCR results if needed (TBD).
- No production OCR service integration yet unless explicitly requested.

## Assumptions
- OCR can be client-side initially; server-side can be added later.
- Image should include overlay text (capture date + logged user name).
- Permission prompts must follow Expo best practices (camera + media library).

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Tasks
1. `[d]` Confirm OCR approach (client-side vs server-side) and acceptable accuracy/latency targets.
2. `[d]` Select OCR library/SDK compatible with Expo (e.g., ML Kit wrapper, native module, or backend OCR).
3. `[d]` Add camera + gallery pick flow in readings screen (both paths must be supported).
4. `[d]` Implement watermark overlay (date + logged user) on the selected image before OCR/upload.
5. `[d]` Update permissions flow:
   - Camera permissions (iOS/Android)
   - Media library permissions for gallery access
   - Ensure info-plist/Android manifest entries are present and minimal
6. `[d]` Wire OCR result to recognized value field (read-only) and allow user override.
7. `[d]` Add error handling and fallback (no OCR result, invalid image, permission denied).
8. `[d]` Add configurable upload storage:
   - Local default: `wm-web/public/uploads` (gitignored)
   - ENV override (e.g., `UPLOADS_DIR`) for server paths
   - Production switch to S3 later
9. `[ ]` (Optional) If backend storage is needed, add upload endpoint and persist image + OCR metadata.
10. `[ ]` Manual QA: camera flow, gallery flow, watermark visibility, OCR result, permission prompts.
