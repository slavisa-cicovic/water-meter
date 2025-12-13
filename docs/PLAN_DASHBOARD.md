# Plan – Minimal Dashboard Page

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Add a lightweight dashboard landing page with a single card and short text, focused on fast load and layout fit.

## Tasks
1. `[d]` Create/confirm route `src/app/dashboard/page.tsx` uses the dashboard layout.
2. `[d]` Add minimal UI: Container + Card with heading and supporting text/CTA; no data fetch.
3. `[d]` Ensure layout spacing fits existing header/sidebar; remove unnecessary animations.
4. `[h]` Optionally wrap with auth guard if required by existing patterns.
5. `[d]` Quick QA: verify renders in dev/build without API calls and loads quickly.
