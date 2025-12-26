# PLAN: Notifications (billing review flags + draft invoices)
#
# Scope: `wm-web` (Next.js + MUI), notification popover, billing list filters.
#
# Goal
# - Replace mock notifications with real data for review flags and draft invoices.
# - Clicking a notification routes to billing list with the appropriate filter.
# - Suppress notifications during the reading window (1st-5th of month, configurable later) on hold until tested.
#
# Constraints
# - No new libraries without confirmation.
# - Follow existing patterns in billing list and layout popovers.
# - Use SWR with `revalidateOnFocus: true` and `refreshInterval: 1 hour`.
#
#
## Status legend (pick one per task)
# - `[ ]` not started
# - `[p]` in progress
# - `[d]` done
# - `[b]` blocked
# - `[r]` in review
# - `[t]` testing/QA
# - `[h]` on hold
#
#
## Decisions (make early)
# - `[ ]` Data source: add a notifications summary endpoint (counts by reviewFlag + draft invoices).
# - `[ ]` Granularity: one notification per reviewFlag type + one for draft invoices.
# - `[ ]` Copy (initial, English):
#   - invalid_reading: "You have N invalid readings"
#   - no_reading: "You have N consumers missing current readings"
#   - no_previous_reading: "You have N consumers missing previous readings"
#   - no_household_size: "You have N consumers missing household size"
#   - draft invoices: "You have N draft invoices awaiting confirmation"
# - `[h]` Quiet window: suppress notifications when day is between 1 and 5 inclusive (configurable later).
# - `[ ]` Routing: billing list accepts query params `status` and `review` to seed filters.
#
#
## Tasks
# ### 1) API (notifications summary)
# - `[d]` (1.1) Add endpoint (backend or Next API route) to return counts:
#   - `reviewFlags`: map of flag -> count
#   - `draftInvoices`: count
#   - (optional) `suppressed`: boolean when within reading window
# - `[h]` (1.2) Apply quiet-window rule in the API layer (return empty or `suppressed: true`).
# - `[d]` (1.3) Confirm review flag source and mapping (invoice reviewFlags aggregation).
#
# ### 2) Frontend API hook
# - `[d]` (2.1) Add `wm-web/src/api/notifications.ts` with `useGetNotifications()` SWR hook.
# - `[d]` (2.2) Add `endpoints.notifications.summary` in `wm-web/src/utils/axios.ts`.
# - `[d]` (2.3) Set `revalidateOnFocus: true` and `refreshInterval: 3600000`.
#
# ### 3) UI: notification popover
# - `[d]` (3.1) Replace `mockNotifications` in `wm-web/src/layouts/_common/notification-popover.tsx`.
# - `[d]` (3.2) Build notification list from counts (skip zero counts).
# - `[d]` (3.3) Show "No notifications" when list is empty and not suppressed.
# - `[d]` (3.4) Menu item click navigates to billing list:
#   - review flags -> `/dashboard/billing?review=<flag>`
#   - draft invoices -> `/dashboard/billing?status=draft`
# - `[d]` (3.5) Close popover on click (keep current behavior).
#
# ### 4) Billing list filters from URL
# - `[d]` (4.1) Read search params in `wm-web/src/sections/billing/view/billing-overview-view.tsx`.
# - `[d]` (4.2) Seed `filters.status` and `filters.review` from `status`/`review` query params.
# - `[d]` (4.3) Keep existing default date range logic for createdStart/createdEnd.
#
# ### Manual verification checklist
# - `[t]` Notifications hidden between 1st-5th of the month.
# - `[t]` Invalid reading notification links to billing list with `review=invalid_reading`.
# - `[t]` Draft invoice notification links to billing list with `status=draft`.
# - `[t]` "No notifications" shows when there are none (outside quiet window).
