# PLAN: In-app job scheduler (admin-configurable, multi-instance safe)
#
# Scope: `wm-web` backend + admin UI for job scheduling.
#
# Goal
# - Provide admin UI to configure human-friendly schedules and retry counts.
# - Run jobs inside the app with DB-backed locking so multiple instances are safe.
# - Allow ad-hoc "Run now" from UI.
#
# Constraints
# - MySQL storage.
# - Human schedule UI (no cron input).
# - Expect multiple app instances; single execution guaranteed per job run.
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
1. `[d]` Define schedule types + config model:
   - weekly (every Mon/Tue/... at HH:MM)
   - monthly (first Mon/Tue/... of month at HH:MM)
   - yearly (first Mon/Tue/... of year at HH:MM)
   - retry policy (maxAttempts, backoffSeconds)
2. `[d]` Add MySQL tables (Prisma):
   - JobDefinition (name, type, scheduleConfig, enabled, retry, nextRunAt)
   - JobRun (jobId, runAt, status, attempts, error)
   - JobLock (jobId, lockedUntil, lockedBy) or optimistic update strategy
3. `[d]` Implement scheduler loop:
   - poll due jobs, acquire DB lock, execute handler, update nextRunAt
   - write JobRun logs and retry on failure
4. `[d]` Admin UI:
   - list job definitions + status + nextRunAt
   - create/edit form for human schedules + retry count
   - actions column with "Run now"
5. `[d]` Implement job handlers (start with placeholder + billing generation hook).
6. `[r]` Quick QA: multi-instance lock behavior, "run now", retry counts.
#
