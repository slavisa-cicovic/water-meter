# Plan – Accounts Refactoring

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Align accounts UI/data fetching with domain patterns (SWR hooks + clear loading/error/content blocks).
- Centralize backend calls in `src/api/accounts.ts`.
- Improve validation (Yup + RHF) where forms are used.

## Tasks
1. `[d]` Add accounts hooks in `src/api/accounts.ts` (e.g., `useGetAccounts`, `useGetAccount`) wrapping SWR + `fetcher`, returning `{ data, loading, error, validating, empty, mutate }`.
2. `[d]` Update accounts list view to use the new hook, show skeleton/error/content similar to `domain-edit-view`, and refresh via `mutate` after actions.
3. `[d]` Update account detail view to use `useGetAccount` with skeleton/error/content blocks mirroring domain detail.
4. `[d]` Add skeleton/empty components for accounts (list/detail) if missing, reusing existing table skeletons where possible.
5. `[d]` Wire verification actions through `AccountsApi` (no fetch logic in views); ensure status updates trigger `mutate`.
6. `[h]` Improve forms/validation: adopt RHF + Yup resolver (or enhance existing validation) for registration/verification-related forms; surface errors in UI consistently. (On hold: no accounts forms exist yet; revisit when forms are added.)
7. `[d]` Clean up endpoints config to include accounts detail route used by hooks.
