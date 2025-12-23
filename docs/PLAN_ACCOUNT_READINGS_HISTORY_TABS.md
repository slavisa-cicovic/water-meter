# Plan: Account readings history tabs (chart + table)

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Context
- Current account readings history shows a single table; need two tabs: chart view and table view.
- Chart should use the existing chart utilities/components.

## Tasks
1. `[d]` Locate the account readings history component and its usage inside `AccountEditForm` (confirm file paths and props).
2. `[d]` Add tabbed UI with two tabs: `Chart` (default) and `Table`.
3. `[d]` Implement the chart tab: render monthly consumption chart using `useChart` + `ChartWrapper`, reusing existing data shape.
4. `[d]` Keep the existing table on the second tab; ensure headers and data remain intact.
5. `[r]` Verify behavior (type safety, no console errors) and update this plan status.
