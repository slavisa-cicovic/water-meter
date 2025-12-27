# PLAN_MOBILE_LOGIN

## Goal
Implement the mobile LOGIN use case in `wm-mobile` following the existing Registration patterns and AGENT rules.

## Scope
- Mobile only (`wm-mobile`).
- Minimal UI and validation, functional first.
- No new packages and no offline engine changes.

## Assumptions
- Backend login endpoint and payload/response are available under `/api/*` (confirm exact path and response shape).
- JWT token must be persisted in AsyncStorage and attached to API requests after login.
- File naming uses kebab-case in `wm-mobile/src`.

## Plan
- [ ] Confirm backend login endpoint, request fields, and response payload (token + user info + error codes).
- [ ] Define login types in `wm-mobile/src/api/types/auth.ts` and export from `wm-mobile/src/api/types/index.ts`.
- [ ] Add API wrapper in `wm-mobile/src/api/auth/login.api.ts` using `apiClient`.
- [ ] Add service in `wm-mobile/src/services/auth/login.service.ts` to call API, normalize errors, and persist JWT (AsyncStorage + set axios auth header if that is the existing pattern).
- [ ] Implement login screen in `wm-mobile/src/screens/auth/login-screen.tsx` with minimal inputs/validation matching Registration styling.
- [ ] Add route in `wm-mobile/app/login.tsx` mirroring `app/register.tsx`.
- [ ] Manual smoke check: open login screen, submit valid/invalid creds, verify message display and token storage.
