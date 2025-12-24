# PLAN: Billing generation overrides + audit
#
# Scope: `wm-web` billing generation + manual job run UI.
#
# Goal
# - Prevent duplicate invoices for the same meter + month.
# - Allow admin to manually override issued/paid invoices with explicit confirmation.
# - Log overrides for audit.
#
# Constraints
# - Only active meters are eligible.
# - "Same period" means same calendar month.
# - Scheduler runs never touch issued/paid invoices.
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
1. `[d]` Define duplicate detection:
   - same meterId + calendar month of periodEnd (or referenceDate)
   - skip if existing invoice in draft/issued/paid unless override flags allow
2. `[d]` Add override audit table (e.g. InvoiceOverrideLog):
   - invoiceId, adminId, prevStatus, newStatus, reason, jobRunId?, overriddenAt
3. `[d]` Manual run UX:
   - dialog warns about existing issued/paid invoices
   - two checkboxes: overwrite issued / overwrite paid
4. `[d]` Generation behavior:
   - scheduler: never touch issued/paid
   - manual: void issued/paid per checkboxes + create new draft
   - always operate on active meters only
5. `[r]` Quick QA: duplicate prevention + override logging.
#
