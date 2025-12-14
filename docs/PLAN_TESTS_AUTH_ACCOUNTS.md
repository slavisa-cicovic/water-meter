# Plan – Tests for Auth & Accounts

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Add a minimal automated test setup to cover auth/token utils and key accounts APIs (login/me/accounts list).
- Use lightweight tools (Vitest/Jest + supertest or similar) and, if needed, a Prisma SQLite test db.

## Tasks
1. `[d]` Test setup: add test runner config (Vitest), TS support, and npm scripts.
2. `[d]` Unit tests for token utils (`TokenService`, `isValidToken`): verify signed token round-trip, `exp` handling, and malformed token behavior.
3. `[d]` Auth API tests: `/api/auth/login` (valid/invalid credentials), `/api/auth/me` (valid/invalid/missing token).
4. `[d]` Accounts API tests: `/api/accounts` guard (role allowed/forbidden), filters/pagination shape; `/api/accounts/[id]` visibility per role.
5. `[d]` (Optional) Service-layer tests for `AccountsService.list/findById` with role constraints using test DB or mocked repo.
6. `[d]` CI-ready script: add `npm run test:ci` (vitest run --coverage); tests run headlessly without network.
