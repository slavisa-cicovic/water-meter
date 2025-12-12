# Plan – Auth Forgot Password

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Build a forgot-password view in `src/sections/auth/forgot-password-view.tsx` (and route) using the same layout style as LoginView/RegisterView.
- UI first, then validation and wiring to backend reset endpoint.

## Design tasks
1. `[d]` Layout a centered card matching login/register styling (logo, heading, subtext).
2. `[d]` Form field: single email/username input with helper text.
3. `[d]` Actions: primary “Send reset link” button; link back to login (and optionally register).
4. `[d]` Validation UI: inline error display and disabled submit state.
5. `[d]` Responsive spacing consistent with existing auth screens (desktop-oriented).

## Functionality tasks
6. `[d]` Add form handling via `react-hook-form` + Yup schema (required email/identifier).
7. `[ ]` Wire submit to forgot-password API/service; show loading/error and success message/CTA.
8. `[d]` Link navigation buttons to login/register routes.
9. `[ ]` Optional: throttle/resend UX (cooldown) and note to check spam folder.
