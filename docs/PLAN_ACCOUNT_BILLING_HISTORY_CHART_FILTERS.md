# Plan: Account billing history chart + filters

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Context
- Account billing history currently renders a table only for consumers.
- Need a chart view (similar to readings history chart) and filters for created date range and invoice status.

## Tasks
1. `[d]` Locate billing history UI in `AccountEditForm` and confirm current invoice query shape and props.
2. `[d]` Add billing filters state (created from/to, status) and wire them into `useGetInvoices` params.
3. `[d]` Add chart UI (likely via tabs: Chart + Table) using `useChart` + `ChartWrapper`, aggregating invoice totals by month.
4. `[d]` Keep table view with the same data, now filtered; ensure empty/loading states remain clear.
5. `[r]` Verify types, API parameters, and UX (date inputs, status select), then mark plan as in review.
