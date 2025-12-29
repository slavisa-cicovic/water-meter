# PLAN_MOBILE_PAYMENTS

## Goal
Implement the mobile PAYMENT use case to display issued invoice details on the payment screen, following the same architecture pattern as readings.

## Scope
- Mobile (`wm-mobile`): payment screen UI, API/types/service wiring.
- Backend (`wm-web`): add `/api/mobile/payments` (or `/api/mobile/invoices`) endpoint for the latest issued invoice details.
- No payment processor integration yet (read-only UI).
- Notification badge + tab enablement (based on issued invoice presence).

## Assumptions
- Mobile endpoints use the same JWT parsing as other `/api/mobile/*` routes.
- The payment screen shows the latest `issued` invoice for the logged-in account.
- Invoice details include consumption, VAT, line items (if any), and total.
- If no issued invoice exists, show an empty state.

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Tasks
1. `[d]` Confirm invoice endpoint path, response shape, and which fields to expose (consumption, VAT, line items, total).
2. `[d]` Add backend `/api/mobile/payments` route (GET) returning latest issued invoice for account.
3. `[d]` Extend `MobileRepository` to query latest issued invoice + line items + meter/account refs as needed.
4. `[d]` Extend `MobileService` with payment summary/detail response mapping.
5. `[d]` Add mobile API/types for payment invoice details.
6. `[d]` Add mobile service function for fetching invoice details with error mapping.
7. `[d]` Update payment screen UI to show invoice details and empty state when none.
8. `[d]` Enable/disable payment tab or show badge based on issued invoice presence.
9. `[ ]` Manual smoke check: issued invoice appears, details render, empty state when none.
