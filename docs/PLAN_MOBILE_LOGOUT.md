# PLAN_MOBILE_LOGOUT

## Goal
Add a mobile LOGOUT use case that clears local auth state and routes the user back to login.

## Scope
- Mobile only (`wm-mobile`).
- Minimal UI and behavior, functional first.
- No new packages.

## Plan
- [d] Add logout action to auth store (if missing) and ensure it clears token/user and axios auth header.
- [d] Add logout service (optional) or call store directly from UI.
- [d] Add a temporary Logout button on Home screen for debug/testing.
- [t] Verify: pressing logout clears token and redirects to `/login` via the existing auth guard in `app/_layout.tsx`.
