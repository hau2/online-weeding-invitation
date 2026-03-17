---
phase: 10-agent-tier-and-storage-management
plan: 02
subsystem: api, cron
tags: [nestjs, cron, agent-tier, storage-cleanup, draft-auto-delete, admin]

# Dependency graph
requires:
  - phase: 10-agent-tier-and-storage-management-plan-01
    provides: "Agent tier DB schema, UserTier type, subscription columns on users table"
  - phase: 09-expiry
    provides: "ExpiryCronService pattern, @nestjs/schedule integration"
provides:
  - "DraftCleanupCronService: daily cron deleting never-published drafts older than 30 days"
  - "deleteInvitationMedia: reusable helper to clean storage buckets for an invitation"
  - "Admin grant-agent, renew-agent, revoke-agent endpoints"
  - "Admin clear-storage endpoint for expired/deleted invitation media cleanup"
affects: [10-03, 10-04, admin-panel]

# Tech tracking
tech-stack:
  added: []
  patterns: ["DraftCleanupCronService follows ExpiryCronService pattern at 1 AM offset", "deleteInvitationMedia as reusable storage cleanup helper"]

key-files:
  created:
    - "apps/api/src/invitations/expiry/draft-cleanup-cron.service.ts"
  modified:
    - "apps/api/src/invitations/invitations.service.ts"
    - "apps/api/src/invitations/invitations.module.ts"
    - "apps/api/src/admin/admin.controller.ts"
    - "apps/api/src/admin/admin.service.ts"

key-decisions:
  - "DraftCleanupCronService at 1 AM Vietnam time to offset from ExpiryCronService at midnight"
  - "deleteInvitationMedia is public on InvitationsService for reuse by cron; also used internally"
  - "clearExpiredStorage queries both expired status and soft-deleted invitations"

patterns-established:
  - "deleteInvitationMedia: iterate buckets array with try/catch per bucket for non-blocking cleanup"
  - "Agent management endpoints grouped under users/:id/ prefix with specific action paths"

requirements-completed: [AGT-02, AGT-05, AGT-07]

# Metrics
duration: 2min
completed: 2026-03-17
---

# Phase 10 Plan 02: Draft Auto-Delete Cron, Admin Agent Management, and Storage Cleanup Summary

**Daily draft cleanup cron at 1 AM deleting never-published drafts older than 30 days with storage media removal, plus admin endpoints for agent grant/renew/revoke and expired storage cleanup**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-17T16:51:48Z
- **Completed:** 2026-03-17T16:53:57Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- DraftCleanupCronService runs daily at 1 AM Vietnam time, deletes never-published drafts older than 30 days (from createdAt) with slug IS NULL
- deleteInvitationMedia helper removes files from invitation-photos, bank-qr, qr-codes buckets with per-bucket error isolation
- Admin can grant agent tier with custom subscription start date, renew subscription (resets cycle from now), or revoke agent tier
- Admin can clear storage for expired/soft-deleted invitation media via POST /admin/clear-storage

## Task Commits

Each task was committed atomically:

1. **Task 1: Draft auto-delete cron and deleteExpiredDrafts method** - `4c4d41b` (feat)
2. **Task 2: Admin agent grant/renew endpoints and storage cleanup** - `c373118` (feat)

## Files Created/Modified
- `apps/api/src/invitations/expiry/draft-cleanup-cron.service.ts` - Daily cron job for draft auto-delete
- `apps/api/src/invitations/invitations.service.ts` - Added deleteExpiredDrafts and deleteInvitationMedia methods
- `apps/api/src/invitations/invitations.module.ts` - Registered DraftCleanupCronService in providers
- `apps/api/src/admin/admin.controller.ts` - 4 new endpoints: grant-agent, renew-agent, revoke-agent, clear-storage
- `apps/api/src/admin/admin.service.ts` - grantAgentTier, renewAgentSubscription, revokeAgentTier, clearExpiredStorage methods

## Decisions Made
- DraftCleanupCronService scheduled at 1 AM to offset from ExpiryCronService at midnight -- avoids overlapping workloads
- deleteInvitationMedia made public (not private) on InvitationsService since both the cron job and admin cleanup need it
- clearExpiredStorage queries `status.eq.expired OR deleted_at IS NOT NULL` to catch both expired and soft-deleted invitations
- Agent revoke only changes tier and clears subscription dates -- published invitations keep premium plan to protect couples

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Draft auto-delete and admin agent management endpoints complete
- Plan 10-03 can build frontend dashboard quota bar and draft warning badge
- Plan 10-04 can build admin UI for agent tier management and storage cleanup

## Self-Check: PASSED

All 5 created/modified files verified on disk. Both task commits (4c4d41b, c373118) verified in git log.

---
*Phase: 10-agent-tier-and-storage-management*
*Completed: 2026-03-17*
