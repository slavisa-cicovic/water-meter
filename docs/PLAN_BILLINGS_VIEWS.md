# PLAN: Billing views (backoffice + account/meter detail)
#
# Scope: `wm-web` (Next.js 15 + MUI). Billing API already exists.
#
# Goal
# - Add Billing Overview (backoffice).
# - Add Invoice Detail view (navigated from overview).
# - Show Account Billing History for consumer accounts inside AccountEditForm.
# - Show Readings History for staff_field accounts inside AccountEditForm.
# - Add Meter Detail view with Meter Billing History.
#
# Constraints
# - Follow `wm-web/AGENT.md` (sections/<domain>/view, services/api/types separation).
# - Keep layout/design consistent with existing list views (accounts/meters).
# - No new libraries.
#
#
## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold
#
#
## Tasks
1. `[ ]` Routing + navigation:
   - add `paths.dashboard.billing` and `paths.dashboard.invoices.details`
   - add nav item "Billing" (backoffice)
2. `[ ]` API hooks:
   - add `src/api/billing.ts` (list invoices, get invoice)
   - extend `src/api/readings.ts` for list by account
   - add `useGetMeter` in `src/api/meters.ts`
3. `[ ]` Billing Overview UI:
   - `sections/billing/view/billing-overview-view.tsx` (table + filters)
   - `app/dashboard/billing/page.tsx`
4. `[ ]` Invoice Detail UI:
   - `sections/billing/view/invoice-detail-view.tsx`
   - `app/dashboard/billing/[id]/page.tsx`
5. `[ ]` AccountDetail enhancements:
   - in `AccountEditForm`, show:
     - consumer → Billing History
     - staff_field → Readings History
   - prompt on address change: ask if meter address should be updated (UI only)
6. `[ ]` Meter Detail view:
   - `sections/meters/view/meter-detail-view.tsx`
   - `app/dashboard/meters/[id]/page.tsx`
   - include Meter Billing History list
7. `[ ]` Tests:
   - add minimal API tests for billing/invoice detail if needed
   - optional UI smoke tests
#
