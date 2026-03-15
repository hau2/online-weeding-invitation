---
phase: 06-save-the-date
plan: 01
subsystem: api
tags: [nestjs, supabase, state-machine, save-the-date, invitation-status]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Supabase schema with invitations table including status CHECK constraint"
  - phase: 03-invitation-editor-core
    provides: "InvitationsService CRUD + publish/unpublish, shared types, FIELD_MAP pattern"
  - phase: 05-public-invitation-page
    provides: "findBySlug public endpoint, slug generation, QR code generation, revalidation"
provides:
  - "save_the_date as valid InvitationStatus in shared types"
  - "teaserMessage field on Invitation type and DB column"
  - "POST /invitations/:id/publish-save-the-date endpoint"
  - "findBySlug serves both published and save_the_date with isSaveTheDate flag"
  - "Full state machine: draft->save_the_date, save_the_date->draft, save_the_date->published, draft->published"
affects: [06-save-the-date, frontend-save-the-date-page]

# Tech tracking
tech-stack:
  added: []
  patterns: [save-the-date-state-machine, isSaveTheDate-flag-for-frontend-routing]

key-files:
  created:
    - supabase/migrations/007_teaser_message.sql
  modified:
    - packages/types/src/invitation.ts
    - apps/api/src/invitations/dto/update-invitation.dto.ts
    - apps/api/src/invitations/invitations.service.ts
    - apps/api/src/invitations/invitations.controller.ts

key-decisions:
  - "publishSaveTheDate only allows draft->save_the_date transition; published invitations cannot go back to save_the_date"
  - "save_the_date teasers skip music URL resolution and expiry calculation (teasers don't expire)"
  - "isSaveTheDate boolean flag in findBySlug response enables frontend routing between teaser and full invitation views"

patterns-established:
  - "State machine validation: publishSaveTheDate checks status before transition, rejects published->save_the_date"
  - "Conditional response enrichment: findBySlug skips music/expiry for save_the_date, includes isSaveTheDate flag"

requirements-completed: [SAVE-01, SAVE-02]

# Metrics
duration: 3min
completed: 2026-03-15
---

# Phase 6 Plan 01: Save-the-Date Backend Summary

**save_the_date status added to invitation state machine with publishSaveTheDate endpoint, teaser_message DB column, and dual-status public slug lookup**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-15T18:33:50Z
- **Completed:** 2026-03-15T18:36:41Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Extended InvitationStatus type with save_the_date and Invitation interface with teaserMessage field
- Created DB migration adding teaser_message column to invitations table
- Added publishSaveTheDate service method with minimum field validation (names + ceremony date)
- Updated findBySlug to serve both published and save_the_date invitations with isSaveTheDate flag
- Added POST :id/publish-save-the-date controller endpoint with proper route ordering

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend shared types and add DB migration for teaserMessage** - `5027e4c` (feat)
2. **Task 2: NestJS state machine -- publishSaveTheDate endpoint + updated findBySlug** - `85ec357` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `packages/types/src/invitation.ts` - Added save_the_date to InvitationStatus, teaserMessage to Invitation interface
- `supabase/migrations/007_teaser_message.sql` - Migration adding teaser_message TEXT column with empty string default
- `apps/api/src/invitations/dto/update-invitation.dto.ts` - Added teaserMessage field with @IsOptional + @IsString validation
- `apps/api/src/invitations/invitations.service.ts` - Added publishSaveTheDate method, updated findBySlug for dual-status lookup, added teaser_message to row/map/select
- `apps/api/src/invitations/invitations.controller.ts` - Added POST :id/publish-save-the-date endpoint before :id/publish

## Decisions Made
- publishSaveTheDate only allows draft->save_the_date transition; throws BadRequestException if invitation is already published (prevents regression from full publish to teaser)
- save_the_date teasers skip music URL resolution and expiry calculation since teasers are lightweight previews that should not expire
- isSaveTheDate boolean flag added to findBySlug response to enable frontend routing between teaser view and full invitation view
- publish method unchanged since it already handles both slug-exists (save_the_date->published) and no-slug (draft->published) paths correctly
- unpublish method unchanged since it already sets status to draft regardless of current status

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Backend state machine complete for save-the-date flow
- Frontend save-the-date teaser page (Plan 06-02) can now use isSaveTheDate flag from findBySlug to route to teaser view
- teaserMessage field available for auto-save via existing PATCH endpoint

## Self-Check: PASSED

All 5 modified/created files verified on disk. Both task commits (5027e4c, 85ec357) confirmed in git log.

---
*Phase: 06-save-the-date*
*Completed: 2026-03-15*
