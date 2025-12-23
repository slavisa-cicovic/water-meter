# PLAN: Breadcrumbs + description across views
#
# Scope: `wm-web` (Next.js 15 + MUI), UI views (meters, billing, accounts, etc.)
#
# Goal
# - Replace header stacks with `CustomBreadcrumbs` across major views.
# - Add a `description` prop to `CustomBreadcrumbs` so each view can render a subtitle consistently.
#
# Constraints
# - Follow existing `CustomBreadcrumbs` patterns.
# - Keep layout consistent with current list/detail views.
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
1. `[d]` Update `CustomBreadcrumbs` to accept `description?: string` and render it below the heading.
2. `[d]` Update meters list view to use `CustomBreadcrumbs` with:
   - heading: "Meters"
   - description: "Manage water meters and their consumer assignments."
   - action: "New meter" button
3. `[d]` Add breadcrumbs to billing views:
   - Billing overview (heading + links)
   - Invoice detail (include invoice id)
4. `[d]` Add breadcrumbs to account detail view (include account name or id).
5. `[d]` Add breadcrumbs to meter detail / create view.
6. `[d]` Optional: align styles (icon + action placement) to match existing list views.
#
