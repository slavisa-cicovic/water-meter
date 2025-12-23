# PLAN: Billing model (meter/account invoices + tariffs)
#
# Scope: `wm-web` (Next.js 15 full-stack), Prisma (MySQL), readings domain already exists.
#
# Goal
# - Introduce billing that supports:
#   - Invoice per meter when meter has a single payer account (1 meter ↔ 1 account)
#   - Invoice per account when multiple accounts share a meter (N accounts ↔ 1 meter)
#   - Consumption split by household size for shared meters
# - Support invoice items (consumption, ad hoc fees, VAT) and total payable amount.
# - Persist tariff snapshots on invoices (limits + multipliers) for audit stability.
# - Keep tariffs editable (back-office), but start with a minimal data model.
#
# Constraints
# - Follow `wm-web/AGENT.md` conventions (types/service/repo/api/validation separation).
# - No new libraries.
# - Defer complex tariff rules; model should allow future expansion.
#
#
## Status legend (pick one per task)
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold
#
#
## Decisions (make early)
- `[ ]` Invoice scope:
  - If meter has 1 account → invoice per meter (payer is that account).
  - If meter is shared → invoice per account using household share.
- `[ ]` Consumption baseline:
  - `delta = last_billed_reading.value - previous_reading.value`
  - For shared meters: `account_share = householdSize / totalHouseholdSizeForMeter`.
- `[ ]` Tariff scope (MVP):
  - Editable records with season/group applicability.
  - For now, pick a single applicable tariff for calculation.
- `[ ]` Invoice composition:
  - `InvoiceLine` items: `consumption`, `fee`, `vat`
  - Summary fields: `subtotal`, `vatRate`, `vatAmount`, `totalAmount`
  - `tariffSnapshot` stored on invoice (limits + multipliers)
#
#
## Tasks
### Prisma (schema + migration)
1. `[ ]` Add models:
   - `Tariff`:
     - `id`, `name`, `basePrice`, `greenLimit`, `blueLimit`
     - `blueMultiplier`, `redMultiplier`
     - `validFrom`, `validTo?`, `groupCode?` (for meter group applicability)
     - `createdAt`, `updatedAt`
   - `Invoice`:
     - `id`, `accountId`, `meterId?`, `periodStart`, `periodEnd`
     - `status` (draft/issued/paid/void)
     - `consumption`, `unitPrice`, `subtotal`
     - `vatRate`, `vatAmount`, `totalAmount`
     - `tariffId?`, `tariffSnapshot` (JSON)
     - `createdAt`, `updatedAt`
   - `InvoiceLine`:
     - `id`, `invoiceId`, `type` (consumption/fee/vat)
     - `description?`, `quantity?`, `unitPrice?`, `amount`
   - `InvoiceReadingLink` (optional):
     - `invoiceId`, `readingId`, `role` (start/end)
2. `[ ]` Create migration SQL for MySQL.
#
### Types + validation
3. `[ ]` Add `wm-web/src/types/billings.ts`:
   - `Invoice`, `InvoiceStatus`, `Tariff`, create/update inputs
4. `[ ]` Add `wm-web/src/validation/billings.ts`:
   - validate period range, required fields, positive amounts
#
### Repository + service
5. `[ ]` Add `wm-web/src/repositories/billingRepository.ts`:
   - CRUD for tariffs/invoices, query by account/meter/period
6. `[ ]` Add `wm-web/src/services/billingService.ts`:
   - generate invoices for a period
   - resolve readings (last billed + previous)
   - apply shared meter split by household size
   - apply tariff (MVP single tariff selection)
   - build invoice lines (consumption + optional fee + VAT)
#
### API routes
7. `[ ]` Add `wm-web/src/app/api/billing/route.ts`:
   - `GET` list (filters: accountId, meterId, period)
   - `POST` generate for period
8. `[ ]` Add `wm-web/src/app/api/billing/tariffs/route.ts`:
   - `GET` list, `POST` create, `PUT` update
9. `[ ]` Protect routes with back-office/admin guard.
#
### Seed data
10. `[ ]` Update `wm-web/prisma/seed.ts`:
   - seed at least one tariff (with limits/multipliers)
   - generate invoices for a sample period using existing readings
#
### Tests
11. `[ ]` Add service tests:
   - single meter → invoice per meter
   - shared meter → invoices per account with household split
   - tariff applied to total
   - VAT and fee lines included in totals
12. `[ ]` Add API tests for billing endpoints
#
### Manual verification checklist
13. `[t]` Generate invoices for a month and verify totals.
14. `[t]` Shared meter invoices match household share.
15. `[t]` Tariff edit affects generated invoices.
