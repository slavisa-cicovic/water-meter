# PLAN: Chart component refinements
#
# Scope: `wm-web` chart utilities (`components/chart`).
#
# Goal
# - Make the chart utilities efficient and consistent for heavy dashboard usage.
# - Keep styling centralized and avoid per‑chart duplication.
#
# Constraints
# - No new libraries without confirmation.
# - Keep existing API stable where possible.
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
1. `[d]` Add memoization in `useChart` (`useMemo` based on theme only).
2. `[d]` Add a small `ChartWrapper` component to standardize `height`, `type`, `series`, and `options`.
3. `[h]` Update chart examples to use the wrapper (if any).
4. `[h]` Optional: add `defaultProps` or exported presets for common chart types.
5. `[d]` (Pending approval) Add `apexcharts` + `react-apexcharts` to `package.json`.
#
