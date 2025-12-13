# Plan – Split Accounts Service into Repository + Service

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Introduce a repository layer for Accounts (Prisma-only data access) and keep business logic in the service layer.
- Maintain current API shape for `/api/accounts` consumers.

## Tasks
1. `[d]` Create `src/repositories/accountRepository.ts` with Prisma CRUD methods (list with filters/pagination, findById, create/update helpers as needed).
2. `[d]` Refactor `AccountsService` to delegate DB calls to the repository; keep validation, token issuing, and orchestration there.
3. `[d]` Update API routes to use the refactored service (no direct Prisma usage).
4. `[d]` Adjust types/mappers if needed to keep `AccountRow` shape unchanged for the UI.
5. `[d]` Quick QA: list/filter/pagination still work; verify register/verify flows still behave.
