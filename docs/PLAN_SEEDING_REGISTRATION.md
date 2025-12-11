# Plan – Seed Registration Data

## Goals
- Populate MySQL with fake accounts to exercise registration flows, verification, UI states, and guards.
- Cover consumers and staff with mixed verification statuses and audit logs.

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Tasks
1. `[d]` Configure Prisma seeding: add `"prisma": { "seed": "ts-node prisma/seed.ts" }` (or JS equivalent) and npm script `"prisma:seed": "prisma db seed"`.
2. `[d]` Create `prisma/seed.ts` that imports `@prisma/client` and clears existing seed data (optional) before inserting fixtures.
3. `[d]` Seed consumers (~10): unique email/phone, householdSize >=1, mixed `verificationStatus` (pending/verified/rejected), plain-text passwords (per current choice).
4. `[d]` Seed staff (~5): roles split between field/backoffice, unique email/phone, mixed statuses, plain-text passwords.
5. `[d]` Seed verification logs: at least one verified log and one rejected log per applicable account; use placeholder `reviewerId`.
6. `[d]` Validate seed via API/UI: accounts list shows data and logs; guard accepts verified tokens and rejects unverified/none.
