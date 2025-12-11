# Prisma Migration Plan — Registration Use Case

## Goals
- Move registration (consumer/staff) off the in-memory store onto MySQL via Prisma.
- Keep existing API shapes (`{ success, data?, error? }`) and verification flows.

## Schema design
- `[d]` Enums: `AccountRole` (`consumer`, `staff_field`, `staff_backoffice`), `VerificationStatus` (`pending`, `verified`, `rejected`), `StaffRole` (`field`, `backoffice`).
- `[d]` Models: `Account` (id uuid, names, email unique, phone unique nullable, address, passwordHash, role, verificationStatus, timestamps); `ConsumerProfile` (accountId unique fk, householdSize >=1); `StaffProfile` (accountId unique fk, staffRole); `VerificationLog` (id uuid, accountId fk, reviewerId, status, note?, reviewedAt).
- `[d]` Indexes/constraints: unique on `Account.email`, unique on `Account.phone` (nullable), unique on `ConsumerProfile.accountId`, unique on `StaffProfile.accountId`.

## Steps
1. `[d]` Add Prisma tooling: add deps `prisma` (dev) and `@prisma/client`; create `prisma/schema.prisma` with MySQL provider and `env("DATABASE_URL")`.
2. `[d]` Define schema: add enums/models above; set relations and cascading rules (delete profiles/logs when account deleted if desired).
3. `[d]` Run migration: `npx prisma migrate dev --name init_accounts` (uses `DATABASE_URL` from `.env.local`); then `npx prisma generate`.
4. `[d]` Refactor services: update `AccountsService` to Prisma (create account + profile + verification log), enforce duplicate checks via Prisma errors, issue tokens unchanged.
5. `[d]` API routes: point `/api/accounts/*` handlers to Prisma-backed service; keep `{ success, data?, error?, details? }` contract and status codes.
6. `[d]` Auth/verification guard: use Prisma lookup for account and verification status in `authGuard`.
7. `[h]` Optional hardening: hash passwords (e.g., bcrypt) will be implemented later; make `reviewerId` a fk to `Account` for back-office admins; seed script for initial admin.
