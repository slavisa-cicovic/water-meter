# PLAN_MOBILE_REGISTER_REFACTOR

## Goal
Refactor mobile registration so consumer and staff_field share the same required fields, with username-or-email support.

## Scope
- Mobile only (`wm-mobile`).
- Minimal UI changes; keep existing screen structure.
- No new packages.

## Requirements
- Shared mandatory fields for consumer and staff_field:
  - firstName
  - lastName
  - address
  - householdSize (default 1)
  - identifier (email or username)
  - phone
  - password
- All fields are required.
- Identifier accepts non-email usernames.

## Plan
- [d] Review current `wm-mobile/src/screens/auth/register-screen.tsx` and identify consumer/staff differences.
- [d] Introduce a shared form model for both modes with required fields and default `householdSize = "1"`.
- [d] Update UI labels/placeholders to “Email or Username”.
- [d] Update validation: all fields required; `householdSize` integer >= 1; allow non-email identifiers.
- [d] Update submit payloads for consumer and staff_field to use `identifier` field (map to backend expectation).
- [t] Verify registration flow; check validation messages and back-to-login link.
