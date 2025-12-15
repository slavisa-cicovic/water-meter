# PLAN: Header AccountPopover + LanguagePopover + NotificationPopover
#
# Scope: `wm-web` (Next.js 15 + MUI), header currently has only a Settings button.
#
# Goal
# - Add `AccountPopover`, `LanguagePopover`, and `NotificationPopover` to the header.
# - All popovers MUST use the existing `CustomPopover`.
# - Place popover components in `wm-web/src/layouts/_common/`.
# - Implement `Logout` fully; keep `Profile` and `Contact support` as placeholders for now.
#
# Constraints
# - Continue development (no redesign / no layout refactor).
# - Follow `wm-web/AGENT.md`:
#   - TypeScript, function components
#   - absolute imports from `src/`
#   - no default exports (named exports only)
#   - do not add new libraries without confirmation
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
## Tasks
### Discovery
- `[d]` Identify the header component where the Settings button is rendered.
- `[d]` Review `CustomPopover` API and existing usage patterns in the codebase.
- `[d]` Identify current i18n/lang state management (where language is read/written).
#
### AccountPopover
- `[d]` Create `wm-web/src/layouts/_common/account-popover.tsx` using `CustomPopover`.
- `[d]` UI: show an account button (avatar/icon/label) consistent with existing header styling.
- `[ ]` Menu items:
  - `[d]` Profile (placeholder; e.g. `console.info` or no-op handler)
  - `[d]` Contact support (placeholder; e.g. `console.info` or no-op handler)
  - `[d]` Logout (fully implemented)
- `[d]` Logout behavior:
  - call `useAuthContext().logout()`
  - clear session/persistent token state (handled by auth logout)
  - redirect to login route (`paths.auth.login`)
  - close the popover after action
#
### LanguagePopover
- `[d]` Create `wm-web/src/layouts/_common/language-popover.tsx` using `CustomPopover`.
- `[d]` Show current language in the header (icon/label consistent with existing UI).
- `[d]` Provide a short list of languages available today (based on existing locale setup).
- `[d]` Persist selection using the existing language storage mechanism (no new storage keys).
#
### NotificationPopover
- `[d]` Create `wm-web/src/layouts/_common/notification-popover.tsx` using `CustomPopover`.
- `[d]` Show a notifications button in the header (badge count if there are unread items).
- `[d]` Provide placeholder notification items (no backend integration yet).
#
### Integration
- `[d]` Render `LanguagePopover`, `NotificationPopover`, `SettingsButton`, `AccountPopover` in the header.
- `[d]` Ensure header layout does not shift unexpectedly (minimal spacing changes only).
#
### Tests
- `[d]` Add a unit test verifying logout triggers `AuthProvider.logout` and redirects.
- `[d]` Add a unit test verifying language selection updates the configured locale state.
#
### Manual verification checklist
- `[t]` Account menu opens/closes correctly; click outside closes it.
- `[t]` Notifications menu opens/closes correctly; click outside closes it.
- `[t]` Logout logs out and redirects to `/auth/login`.
- `[t]` Logout clears auth header and token storage (no “still logged in” on refresh).
- `[t]` Language menu changes the UI language and persists across refresh.
