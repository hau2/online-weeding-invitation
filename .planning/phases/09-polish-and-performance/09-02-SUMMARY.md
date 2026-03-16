---
phase: 09-polish-and-performance
plan: 02
subsystem: api
tags: [nestjs-schedule, cron, expiry, isr-revalidation]

# Dependency graph
requires:
  - phase: 05-public-invitation-page
    provides: "findBySlug with expiry check, triggerRevalidation, ThankYouPage"
  - phase: 05.1-dual-family-ceremony
    provides: "dual ceremony dates (groom/bride), later-date expiry logic"
provides:
  - "ExpiryCronService with daily midnight UTC+7 auto-expiry"
  - "markExpired() method on InvitationsService for batch expiry processing"
  - "findBySlug handles 'expired' status from cron alongside runtime safety net"
affects: [public-invitation-page, admin-panel]

# Tech tracking
tech-stack:
  added: ["@nestjs/schedule"]
  patterns: ["cron-based batch processing with ISR revalidation"]

key-files:
  created:
    - "apps/api/src/invitations/expiry/expiry-cron.service.ts"
    - "apps/api/src/invitations/__tests__/expiry-cron.spec.ts"
  modified:
    - "apps/api/src/invitations/invitations.service.ts"
    - "apps/api/src/invitations/invitations.module.ts"
    - "apps/api/src/invitations/__tests__/public-invitations.spec.ts"

key-decisions:
  - "markExpired queries all published invitations and computes expiry server-side rather than using a DB-level date comparison -- keeps expiry logic in one place"
  - "findBySlug trusts cron-set 'expired' status directly but retains runtime date check as safety net for un-processed invitations"
  - "Expired invitations no longer count toward free-tier limit (enforceFreeTierLimit unchanged)"

patterns-established:
  - "Cron service pattern: separate @Injectable service with @Cron decorator, delegates to domain service method"
  - "Dual-status expiry: cron marks status + runtime safety net in findBySlug"

requirements-completed: [PUBL-10]

# Metrics
duration: 4min
completed: 2026-03-16
---

# Phase 9 Plan 02: Auto-Expiry Cron Summary

**Daily cron at midnight UTC+7 marks published invitations as expired after ceremony date + 7-day grace, triggers ISR revalidation for ThankYouPage**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-16T07:26:12Z
- **Completed:** 2026-03-16T07:30:40Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- ExpiryCronService runs daily at midnight Vietnam time via @nestjs/schedule
- markExpired() batch-processes all published invitations past ceremony date + 7-day grace period
- findBySlug includes 'expired' status in query and returns expired: true for cron-expired invitations
- 9 unit tests covering expiry logic, dual dates, revalidation, and cron wrapper

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @nestjs/schedule and create expiry cron service with markExpired** - `9b595b0` (feat)
2. **Task 2: Unit tests for expiry cron service and markExpired** - `a688841` (test)

## Files Created/Modified
- `apps/api/src/invitations/expiry/expiry-cron.service.ts` - Daily cron service calling markExpired()
- `apps/api/src/invitations/__tests__/expiry-cron.spec.ts` - 9 unit tests for expiry logic
- `apps/api/src/invitations/invitations.service.ts` - markExpired() method, findBySlug with 'expired' status
- `apps/api/src/invitations/invitations.module.ts` - ScheduleModule.forRoot() + ExpiryCronService registration
- `apps/api/src/invitations/__tests__/public-invitations.spec.ts` - Fixed mocks for .in() chain and watermark query
- `apps/api/package.json` - Added @nestjs/schedule dependency

## Decisions Made
- markExpired queries all published invitations and computes expiry in application code rather than DB date comparison, keeping expiry logic consolidated
- findBySlug trusts cron-set 'expired' status directly but retains runtime date-based check as safety net
- Expired invitations excluded from free-tier limit (enforceFreeTierLimit unchanged -- correct behavior)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed existing test mocks for .in() chain and watermark query**
- **Found during:** Task 1 (after adding .in('status', [...]) to findBySlug)
- **Issue:** public-invitations.spec.ts mock chain lacked .in() method; mock .single() returned same data for all calls causing watermark config parse error
- **Fix:** Added .in to mock chains, switched to .mockResolvedValueOnce() for sequential .single() calls
- **Files modified:** apps/api/src/invitations/__tests__/public-invitations.spec.ts
- **Verification:** All 9 public-invitations tests pass
- **Committed in:** 9b595b0 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Test mock fix was necessary for correctness after adding .in() to findBySlug. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Auto-expiry cron is fully functional and tested
- Public invitation pages will show ThankYouPage for expired invitations
- Ready for Phase 09 Plan 03

---
*Phase: 09-polish-and-performance*
*Completed: 2026-03-16*
