# Plan – Auth Registration View

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Build a registration view in `src/sections/auth/register-view.tsx` (and related routes) with a classic form flow.
- Deliver UI first, then wire validation and backend submission.

## Design tasks
1. `[d]` Layout a centered register card matching the current LoginView styling (same spacing/typography/logo placement).
2. `[d]` Form fields: first name, last name, email, username, password, confirm password.
3. `[d]` Actions: primary “Create account” button; link to “Already have an account? Sign in”.
4. `[d]` Validation UI: inline helper text and disabled submit state; password confirmation hint.
5. `[d]` Responsive spacing and stacking (mobile-first), avoid fragile animations.

## Functionality tasks
6. `[d]` Add form handling via `react-hook-form` + Yup schema with required rules and password match check.
7. `[ ]` Wire submit to registration API/service; show loading/error state and success feedback (e.g., verification instructions).
8. `[d]` Link to login route and forgot-password (placeholder ok) for navigation.
9. `[d]` Optional: add terms checkbox (required) and remember default locale; persist as per existing auth pattern.
