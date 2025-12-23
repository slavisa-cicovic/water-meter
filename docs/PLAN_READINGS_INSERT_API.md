# PLAN: Readings insert API (create readings)
#
# Scope: `wm-web` (Next.js 15 API + services), readings domain.
#
# Goal
# - Provide a client API helper for creating readings.
# - Ensure validation errors and role restrictions surface cleanly to the UI.
#
# Constraints
# - Follow `wm-web/AGENT.md` conventions.
# - No new libraries.
# - Keep response handling consistent with existing API helpers.
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
1. `[d]` Add client API helper in `wm-web/src/api/readings.ts`:
   - `createReading(payload)` that POSTs to `/api/readings`
2. `[d]` Add minimal unit test (optional) for helper error mapping.
3. `[d]` Document usage in a comment or internal note if needed.
4. `[d]` Add a curl example to `docs/dev_helpers.md` for inserting a reading.
#
