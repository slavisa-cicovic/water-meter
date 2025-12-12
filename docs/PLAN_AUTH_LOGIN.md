# Plan – Auth Login View

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Build a classic login view in `src/sections/auth/login-view.tsx` with username/password, forgot password, and register links.
- First implement UI/design; then wire functionality.

## Design tasks (UI first)
1. `[d]` Layout: render a centered login card with heading/subtext; add logo if desired.
2. `[d]` Form fields: username/email input, password input with show/hide toggle.
3. `[d]` Actions: primary “Login” button; secondary links for “Forgot password?” and “Create an account”.
4. `[d]` Validation UI: inline error display and disabled state on submit; minimal helper text.
5. `[d]` Responsiveness: ensure mobile-friendly spacing and widths; remove fragile animations.

## Functionality tasks (after UI)
6. `[d]` Hook up form handling (react-hook-form + Yup if available) with required validation.
7. `[d]` Wire submit to auth context/service (JWT) and handle loading/error states.
8. `[d]` Link “Forgot password?” to its route (or placeholder) and “Create account” to register route.
9. `[d]` Optionally add remember-me checkbox; persist token per existing auth pattern.
