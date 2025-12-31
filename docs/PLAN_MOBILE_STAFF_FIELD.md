# PLAN_MOBILE_STAFF_FIELD

## Goal
Implement staff_field use cases for mobile and backend: profile edit, meter readings with meter selection, and role-specific UI/permissions.

## Scope
- Mobile (`wm-mobile`): role-based UI for staff_field, meter selection flow before readings, profile edit, hide billing/consumption views, disable payments.
- Backend (`wm-web`): reading processing for shared meters to generate draft invoices per consumer (proportional by household size).
- No changes to offline engine.

## Assumptions
- Staff_field can edit their own profile and submit readings.
- Staff_field cannot submit payments and should not see billing/consumption tables/charts.
- Meter selection is required before entering readings for staff_field.
- Reading screen UI is reused after meter selection.
- Shared meter invoices are split by household size; non-shared meters generate a single draft invoice.

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Tasks
1. `[ ]` Review existing mobile role handling (tabs, home screen, readings) and identify consumer-only sections to extract into components.
2. `[ ]` Add staff_field meter selection flow and reuse the existing readings screen after a meter is chosen.
3. `[ ]` Apply role gating in mobile navigation: disable payments for staff_field, hide consumption/billing views, keep profile edit.
4. `[ ]` Extend backend readings processing to generate draft invoices:
   - non-shared meter: one draft invoice
   - shared meter: one draft per consumer proportional to household size
5. `[ ]` Verify flows manually (staff_field profile edit, meter selection + reading, invoice creation logic, and UI visibility rules).
