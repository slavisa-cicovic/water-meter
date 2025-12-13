# Plan – Auth Login with JWT Backend

## Status legend
- `[ ]` not started
- `[p]` in progress
- `[d]` done
- `[b]` blocked
- `[r]` in review
- `[t]` testing/QA
- `[h]` on hold

## Goals
- Implement login against our JWT backend (no Auth0), using the existing auth context in `src/auth/context/jwt`.
- Wire the UI (`login-view.tsx`) to call the service, handle tokens, and surface errors.

## Tasks
1. `[d]` Backend contract: payload `{ identifier, password }` to `/api/auth/login`; response `{ accessToken, user }` (refresh TBD). Documented in plan.
2. `[d]` Implement `login` call in JWT service (`src/auth/context/jwt`): POST to `/api/auth/login`, parse tokens/user, normalize error messages.
3. `[d]` Add token persistence in context (`auth-provider.tsx`): store access token via `setSession`/sessionStorage; expose `login`.
4. `[d]` Update `login-view.tsx` submit handler to use `login`, show loading, inline error, and redirect on success.
5. `[h]` Handle refresh token strategy: ensure refresh handling is in place (reuse existing utilities) or mark as follow-up.
6. `[ ]` Add minimal tests/QA notes (manual steps) for login success/failure, invalid credentials, and token persistence.
7. `[ ]` Update docs/plan status and note any config/env requirements (e.g., API base URL).

## Notes
- Assumed backend `/api/auth/login` accepts either email or username in `identifier` and returns `{ accessToken, user }`. No refresh token handling yet; setSession sets Authorization header + expiry timer using `exp`.
