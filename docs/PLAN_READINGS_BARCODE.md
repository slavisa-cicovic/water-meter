# PLAN_READINGS_BARCODE

## Goal
Capture barcode from mobile reading submissions and enable backoffice/admin to review and accept/reject mismatches while preserving the raw mobile value.

## Plan
1. **Types and payloads**
   - Extend `wm-web/src/types/readings.ts` with:
     - `barcodeRaw` (string | null) – what mobile sends.
     - `barcodeFinal` (string | null) – accepted barcode (can match or override raw).
     - `barcodeStatus` (e.g. `pending | accepted | rejected`).
     - `barcodeUpdatedAt`, `barcodeUpdatedBy` (optional for audit).
   - Extend `wm-mobile/src/api/types/mobile.ts` `MobileReadingCreateInput` with `barcode` (string | null).

2. **DB schema**
   - Update Prisma `Reading` model with `barcodeRaw`, `barcodeFinal`, `barcodeStatus`, and audit fields.
   - Default `barcodeStatus = "pending"` when `barcodeRaw` is present.
   - Add migration and ensure null-safe defaults for existing records.

3. **Mobile API and service**
   - Update mobile reading submit to include barcode in payload:
     - `wm-mobile/src/screens/readings/readings-screen.tsx`
     - `wm-mobile/src/services/mobile.service.ts`
   - Backend accepts barcode in `/api/mobile/readings` payload:
     - `wm-web/src/app/api/mobile/readings/route.ts`
     - `wm-web/src/services/mobileService.ts` or `readingsService.ts` (where reading create logic lives).

4. **Backoffice/admin review flow**
   - Display barcode raw vs. meter barcode on reading detail page.
   - Add actions:
     - Accept → set `barcodeFinal = barcodeRaw`, `barcodeStatus = accepted`.
     - Reject → set `barcodeFinal = null` (or keep existing), `barcodeStatus = rejected`.
   - Show badge/status in reading list.

5. **API endpoint for review**
   - Add endpoint to update barcode decision (admin/backoffice only).
   - Validate role and persist audit fields.

6. **Tests**
   - Mobile create reading with barcode stores `barcodeRaw`.
   - Accept/reject endpoints update status and final barcode.
   - Ensure raw barcode is always preserved.
