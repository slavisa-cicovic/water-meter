# PLAN: Readings history enhancements (AccountEditForm)
#
# Scope: `wm-web` (AccountEditForm staff_field view), readings domain.
#
# Goal
# - Improve the readings history table for staff_field accounts:
#   1) Show meter serial number instead of meterId
#   2) Add a "Consumption" column (difference from previous reading)
#   3) Show whether a reading was edited and by whom
# - Default date filter to Jan 1 → Dec 31 (current year)
#
# Constraints
# - Follow existing UI patterns (tables, filters).
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
1. `[d]` Extend readings API response:
   - include meter serial number (join meter)
   - include edit info (latest edit + editor role/id)
2. `[d]` Update `useGetReadings` mapping if needed.
3. `[d]` Update AccountEditForm readings table:
   - replace meterId with serialNumber
   - add consumption column (difference vs previous reading in table)
   - add edited info column (e.g. "Edited by staff_backoffice")
   - add column headers
4. `[d]` Set default date filter to Jan 1 → Dec 31 (current year).
5. `[d]` Optional tests (smoke) for readings history rendering.
#
