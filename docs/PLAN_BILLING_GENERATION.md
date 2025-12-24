# PLAN: Invoice generation from readings
#
# Scope: `wm-web` billing generation service + job handler.
#
# Goal
# - Generate draft invoices using reading deltas (readAt-based periods).
# - Support multi-consumer meters (household-size split).
# - Flag edge cases for backoffice review (no new invoice statuses).
#
# Constraints
# - Use `readAt` for periodStart/periodEnd (periodEnd must be in current month).
# - Consumption <= 0 remains valid but must be flagged for review; if backoffice confirms, invoice can be marked paid with a note about prepayment.
# - If householdSize is null/0, invoice must be flagged for review.
# - If no reading in the current month, invoice must be flagged for review.
# - Tariff selection stays as-is (groupCode + period).
# - Additional configurable fees (water charges, etc.) are on hold.
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
1. `[d]` Define invoice generation rules:
   - current reading = latest without paid invoice link
   - previous reading = latest with paid invoice (or 0 if none)
   - periodStart/periodEnd from reading.readAt (periodEnd must be current month)
2. `[d]` Implement billing generator:
   - create draft invoices (consumption + VAT lines)
   - household split by householdSize for multi-consumer meters; if single consumer, treat householdSize=1
   - flag null/0 householdSize only for multi-consumer meters
   - flag consumption <= 0 invoices for review
   - flag no-reading-in-current-month invoices for review
3. `[d]` Update invoice model/DTOs to support review flags + notes (if needed).
4. `[d]` Add job handler wiring for scheduled generation.
5. `[h]` Add configurable fees beyond VAT (water charges, etc.).
6. `[r]` Quick QA: edge cases for zero/negative consumption and household split.
#
