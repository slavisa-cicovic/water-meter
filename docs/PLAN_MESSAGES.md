# PLAN_MESSAGES

## Goal
Implement a minimal mobile <-> web messaging flow with unread message notifications and a simple thread view.

## Scope
- Mobile (`wm-mobile`): rename `send-message-screen` to `messages-screen`, show latest thread, send/receive messages.
- Web (`wm-web`): backend endpoint at `/app/api/mobile/messages`, unread count for notifications popover, messages view (thread + history fetch).
- Roles: `backoffice` can reply by default; `admin` can be granted permission via role settings.

## Assumptions
- One thread per mobile user (consumer or staff_field) with web backoffice/admin.
- Web can fetch older messages; mobile only receives the latest ~10 from mobile + ~10 from web.
- Unread count is for message items (not threads).
- Message sender on web is tracked; mobile does not need sender identity.
- Older messages are soft-deleted by a scheduled job.
- No new libraries without confirmation.

## Plan
1. [ ] Define message models and API response shape (thread + messages + unreadCount).
2. [ ] Add `wm-web/src/app/api/mobile/messages/route.ts`:
  - `GET` for latest thread/messages + unread count for the authenticated mobile user.
  - `POST` to create a new mobile message.
3. [ ] Add web API for message threads + history fetch + reply (path TBD if not already present).
4. [ ] Extend notifications summary endpoint to include unread message count.
5. [ ] Update web notification popover to show unread message item and link to messages view.
6. [ ] Add web messages view (thread list + details) and hook into account details.
7. [ ] Rename mobile screen `send-message-screen` to `messages-screen` and wire to new API.
8. [ ] Manual verification: mobile send/receive, web reply, unread count, and message visibility rules.
