# Plan – Role-Based Dashboard (Web)

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Define role-based dashboard content for web app, including charts and richer widgets.
- Focus on Admin, Backoffice, and future Manager roles.
- Keep Staff_field and Consumer out of web dashboard scope.

## Scope (roles)
- Admin: full dashboard access.
- Staff_backoffice: operational dashboard access.
- Manager: planning/ops dashboard access (future role).
- Staff_field: no web access (exclude).
- Consumer: no web access (exclude).

## Dashboard content proposals
### Admin
- KPI overview: total meters, active meters, inactive/removed meters.
- Alerts: active alarms, anomalies, failed readings.
- Operational health: API/collector status, backlog counts.
- Verification queue: pending staff/consumer approvals.
- Billing snapshot: current cycle status, failed invoices.

### Staff_backoffice
- Pending approvals: consumers + staff.
- Reading review: latest submissions, failed/flagged readings.
- Anomaly list: sudden spikes, suspected leaks.
- Billing: cycle progress + exceptions.
- Tasks: recent meter lifecycle updates (install/remove).

### Manager (future)
- Zone heatmap: issues by area (leaks/offline/anomalies).
- Top issues list: prioritized by impact.
- Work order backlog: counts by priority.
- Trend charts: consumption, loss/waste, compliance.
- Performance summary: resolution time, SLA metrics.

## Tasks
1. `[d]` Confirm exact role names for Admin/Backoffice/Manager.
2. `[d]` Validate data availability for each proposed widget.
3. `[d]` Define minimal data endpoints for each widget.
4. `[d]` Wire role-based dashboard layout and widget visibility.
5. `[d]` Add chart components where needed (heatmap/trends).
6. `[ ]` QA: verify correct role gating and performance.
