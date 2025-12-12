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
1. `[ ]` Layout: render a centered login card with heading/subtext; add logo if desired.
2. `[ ]` Form fields: username/email input, password input with show/hide toggle.
3. `[ ]` Actions: primary “Login” button; secondary links for “Forgot password?” and “Create an account”.
4. `[ ]` Validation UI: inline error display and disabled state on submit; minimal helper text.

## Functionality tasks (after UI)
5. `[ ]` Hook up form handling (react-hook-form + Yup if available) with required validation.
6. `[ ]` Wire submit to auth context/service (JWT) and handle loading/error states.
7. `[ ]` Link “Forgot password?” to its route (or placeholder) and “Create account” to register route.
8. `[ ]` Optionally add remember-me checkbox; persist token per existing auth pattern.
