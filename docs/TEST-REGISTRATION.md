# Registration Test Plan

## Validation (unit)
- Consumer registration: required fields, min lengths, household size integer >=1, email/phone format, password length.
- Staff registration: required fields, staffRole must be field/backoffice, email/phone format, password length.
- Verification action: requires accountId, reviewerId, valid status; reject invalid transitions.

## API (integration)
- POST `/api/accounts/consumer` success with valid payload → returns id, pending status, token.
- POST `/api/accounts/staff` success with valid payload → returns id, pending status, token.
- Duplicate email/phone → 409 with `ACCOUNT_EXISTS`.
- Invalid payloads → 400 with field errors.
- POST `/api/accounts/verify` transitions pending→verified and pending→rejected, logs audit, returns token.
- Verify already verified or invalid transition → 409 with conflict code.
- GET `/api/accounts` returns stored accounts with statuses and logs.
- POST `/api/readings` without token → 401; with unverified token → 403; with verified token → success.

## Mobile (manual/smoke)
- Consumer registration form: client validation errors show; successful submit shows pending message; duplicate shows “already exists” message.
- Staff registration form: role toggle works; validation errors show; successful submit shows pending message; duplicate shows “already exists” message.
- API base URL from `EXPO_PUBLIC_API_URL` is used.

## Web back-office UI (manual/smoke)
- Accounts list loads data; status chips reflect backend.
- Verify/Reject buttons update status and list refreshes.
- Detail page displays account info and verification history.
- Navigation item “accounts” appears under Management and links to list.
