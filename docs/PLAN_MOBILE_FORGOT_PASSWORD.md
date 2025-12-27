# PLAN_MOBILE_FORGOT_PASSWORD

## Goal
Implement the mobile FORGOT_PASSWORD use case with minimal UI and clear messaging.

## Scope
- Mobile only (`wm-mobile`).
- Minimal UI and validation, functional first.
- No new packages.

## Plan
- [d] Confirm backend endpoint and response for `/api/auth/forgot` (payload: identifier/email?).
- [d] Add types in `wm-mobile/src/api/types/auth.ts` if needed (ForgotPasswordInput/Result).
- [d] Add API wrapper in `wm-mobile/src/api/auth/forgot-password.api.ts`.
- [d] Add service in `wm-mobile/src/services/auth/forgot-password.service.ts` to normalize errors/messages.
- [d] Create screen in `wm-mobile/src/screens/auth/forgot-password-screen.tsx` (minimal UI, reuse login styles).
- [d] Wire route in `wm-mobile/app/forgot-password.tsx`.
- [d] Add link from Login screen to Forgot Password.
- [t] Manual check: submit identifier, confirm success/error messaging.
