# PLAN: Billing overview period filters + seed invoices
#
# Scope: `wm-web` billing overview table filters/sorting + seed data + dashboard nav structure.
#
# Goal
# - Add periodEnd date range filters to Billing Overview (keep createdAt filters).
# - Enable sorting by Period column using `periodEnd` and make it the default sort.
# - Seed invoices for an additional consumer (Petra Milosavljevic) with 10 paid + 1 issued + 1 draft.
# - Group Billing navigation with subitems for Tariffs and Invoice Line Items.
#
# Constraints
# - Follow `wm-web/AGENT.md` conventions.
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
#
#
## Decisions
- Default sort: `periodEnd` desc.
- Keep createdAt filters alongside periodEnd filters.
- Seed target: Petra Milosavljevic with 12 invoices (10 paid, 1 issued, 1 draft).
- InvoiceLineItem fields: name, description, isPercentage, value, createdAt, updatedAt.
#
#
## Tasks
### Navigation
1. `[d]` Update dashboard nav config so Billing is the parent item with subitems:
   - Tariffs
   - Invoice Line Items (new placeholder route or planned route)
2. `[d]` Ensure permissions stay consistent (billing list for parent, tariffs list for Tariffs).
3. `[d]` Add/confirm route placeholder for Invoice Line Items if not yet implemented.
#
### UI (Billing Overview)
4. `[d]` Update filters state/type to include `periodEndStart` and `periodEndEnd` (names TBD).
5. `[d]` Add periodEnd date inputs to `billing-table-toolbar.tsx`.
6. `[d]` Add filter chips for periodEnd range in `billing-table-filters-result.tsx`.
7. `[d]` Enable sorting on the Period column and map sort to `periodEnd`.
8. `[d]` Change default sort to `periodEnd` desc.
9. `[d]` Keep createdAt filters and their defaults as-is.
#
### API + Repo
10. `[d]` Extend `useGetInvoices` query params for periodEnd range.
11. `[d]` Parse new query params in `app/api/billing/route.ts`.
12. `[d]` Extend `InvoiceListParams` and `BillingRepository.listInvoices`:
   - periodEnd range filter (gte/lte)
   - orderBy = `period` or `periodEnd` maps to `periodEnd`
#
### i18n
13. `[d]` Add translations for periodEnd filter labels/tags (all locales).
#
### Seed data
14. `[d]` Extend `seedInvoices()` to create 12 invoices for Petra Milosavljevic:
   - 10 paid, 1 issued, 1 draft
   - Use her meter + readings similar to Marko flow
#
### Manual verification checklist
15. `[t]` Period column sorts by periodEnd (asc/desc).
16. `[t]` PeriodEnd filters return expected rows while createdAt filters still work.
17. `[t]` Billing overview shows Petra invoices with expected statuses.
