---
phase: 07-monetization
plan: 01
subsystem: api
tags: [nestjs, supabase, monetization, free-tier, premium, upgrade-workflow]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Supabase schema, NestJS CRUD, JwtGuard, AdminGuard"
  - phase: 03-invitation-editor-core
    provides: "InvitationRow, mapRow, FIELD_MAP, publish/unpublish endpoints"
  - phase: 06-save-the-date
    provides: "publishSaveTheDate, save_the_date status"
provides:
  - "InvitationPlan and PaymentStatus shared types"
  - "plan and paymentStatus fields on Invitation interface"
  - "Free-tier publish limit enforcement (max 1 live invitation)"
  - "POST :id/request-upgrade endpoint for user upgrade requests"
  - "Admin endpoints: GET admin/pending-upgrades, POST admin/:id/approve-upgrade, POST admin/:id/reject-upgrade"
  - "DB migration 008 for plan and payment_status columns"
affects: [07-monetization, 08-admin-panel]

# Tech tracking
tech-stack:
  added: []
  patterns: ["enforceFreeTierLimit guard pattern before publish", "admin routes placed before :id param routes"]

key-files:
  created:
    - "supabase/migrations/008_invitation_plan.sql"
    - "apps/api/src/invitations/dto/request-upgrade.dto.ts"
  modified:
    - "packages/types/src/invitation.ts"
    - "apps/api/src/invitations/invitations.service.ts"
    - "apps/api/src/invitations/invitations.controller.ts"

key-decisions:
  - "enforceFreeTierLimit as private reusable method called by both publish() and publishSaveTheDate()"
  - "Admin routes placed in existing InvitationsController (not separate controller) with method-level AdminGuard"
  - "Admin routes use path prefix 'admin/' before :id param to avoid NestJS UUID parse conflict"
  - "DB migration file created but requires manual SQL execution (no Supabase CLI auth available)"

patterns-established:
  - "Free-tier limit check: count live invitations excluding current, enforce before publish"
  - "Admin upgrade workflow: pending -> approved (premium) or rejected via separate endpoints"

requirements-completed: [PLAN-01, PLAN-02, PLAN-04]

# Metrics
duration: 7min
completed: 2026-03-16
---

# Phase 7 Plan 01: Monetization Data Foundation Summary

**Per-invitation plan/paymentStatus types, free-tier publish limit enforcement, and admin upgrade approve/reject endpoints**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-16T03:53:31Z
- **Completed:** 2026-03-16T04:01:19Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Extended Invitation type with InvitationPlan (free/premium) and PaymentStatus (none/pending/rejected) fields
- Free-tier users limited to 1 live invitation (published or save_the_date) with Vietnamese error message
- User can request upgrade via POST :id/request-upgrade (sets payment_status to pending)
- Admin can list pending upgrades, approve (sets plan=premium, triggers ISR revalidation), or reject
- DB migration 008 prepared for plan and payment_status columns

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend shared types and DB schema for plan + paymentStatus** - `8ba4600` (feat)
2. **Task 2: NestJS plan enforcement + upgrade workflow endpoints** - `241f46b` (feat)

## Files Created/Modified
- `packages/types/src/invitation.ts` - Added InvitationPlan, PaymentStatus types and plan/paymentStatus fields
- `apps/api/src/invitations/invitations.service.ts` - InvitationRow, mapRow, enforceFreeTierLimit, requestUpgrade, adminApproveUpgrade, adminRejectUpgrade, adminListPendingUpgrades
- `apps/api/src/invitations/invitations.controller.ts` - Admin endpoints (pending-upgrades, approve, reject) + user request-upgrade endpoint
- `apps/api/src/invitations/dto/request-upgrade.dto.ts` - Empty DTO for upgrade request
- `supabase/migrations/008_invitation_plan.sql` - ALTER TABLE for plan and payment_status columns

## Decisions Made
- enforceFreeTierLimit implemented as private reusable method rather than duplicating logic in publish() and publishSaveTheDate()
- Admin routes added to existing InvitationsController with method-level @UseGuards(AdminGuard), not a separate controller -- follows project pattern of class-level JwtGuard + method-level AdminGuard
- Admin route paths use 'admin/' prefix (e.g., 'admin/pending-upgrades') placed before ':id' routes to prevent NestJS from treating 'admin' as a UUID parameter
- DB migration SQL file created but not applied -- Supabase CLI not authenticated in this environment

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Supabase CLI not authenticated (`supabase link` fails due to missing access token), and no psql client or database URL available. Migration SQL file (008_invitation_plan.sql) was created but needs to be applied manually via the Supabase Dashboard SQL Editor or by running `supabase login` and `supabase db push`.

## User Setup Required

**Database migration requires manual execution.** Run the following SQL in the Supabase Dashboard SQL Editor:

```sql
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'none';
```

## Next Phase Readiness
- Types, service methods, and API endpoints ready for UI plans (07-02, 07-03)
- DB migration must be applied before testing the API
- Admin panel (Phase 8) can now wire up the pending-upgrades list and approve/reject actions

## Self-Check: PASSED

All 6 files verified present. Both task commits (8ba4600, 241f46b) confirmed in git log.

---
*Phase: 07-monetization*
*Completed: 2026-03-16*
