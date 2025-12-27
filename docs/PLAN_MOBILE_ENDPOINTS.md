# Plan: Mobile account endpoints

## Goal
Add `GET` and `PUT /api/mobile` to serve and update the data used on the mobile home screen (account card), and establish a base path for future mobile endpoints.

## Scope
- Backend endpoints:
  - `GET /api/mobile`
  - `PUT /api/mobile`
- Mobile service layer for mobile account profile read/update
- Mobile repository layer for mobile-specific queries
- Response shape for mobile account card (name, email, meter info)
- Validation for profile updates (first/last name, email)

## Rationale
- Keep mobile logic isolated for easier migration to a dedicated mobile backend later.
- Reduce coupling with web-specific account service rules.
- Allow mobile API to evolve independently (readings, billing, payments).

## Proposed response shape (draft)
```
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "meter": {
      "serialNumber": "string",
      "shared": true,
      "status": "active"
    }
  }
}
```
Note: confirm exact `meter` fields and how "shared" is derived.

## Status legend (pick one per task)
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Tasks
- [d] Define final mobile response shape (confirm meter fields + shared flag logic)
- [d] Add `app/api/mobile/route.ts` (GET/PUT)
- [d] Add `services/mobileService.ts` for mobile read/update functions
- [d] Add `repositories/mobileRepository.ts` for account + meter queries
- [d] Add validation for PUT payload (names + email)
- [d] Update mobile app to consume the new endpoint once available

## Open questions
- Should shared be a boolean from DB or computed via `MeterConsumer` count?
- Which meter `status` values should be exposed to mobile?
- Should PUT update email only on account table (no verification flow)?
- Scale plan for high-volume readings ingestion (defer; revisit once data flow is clearer).
