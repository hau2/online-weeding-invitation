---
phase: 05-public-invitation-page
plan: 02
subsystem: infra
tags: [isr, revalidation, next.js, nestjs, og-meta, zalo, seo]

# Dependency graph
requires:
  - phase: 04-media-upload-pipeline
    provides: publish/unpublish service methods in InvitationsService
provides:
  - ISR on-demand revalidation route handler at /api/revalidate
  - NestJS triggerRevalidation() integration in publish/unpublish
  - htmlLimitedBots config for Zalo/Facebook/Googlebot OG tag rendering
affects: [05-public-invitation-page]

# Tech tracking
tech-stack:
  added: []
  patterns: [on-demand ISR revalidation via route handler, htmlLimitedBots for social crawlers]

key-files:
  created:
    - apps/web/app/api/revalidate/route.ts
  modified:
    - apps/api/src/invitations/invitations.service.ts
    - apps/api/src/invitations/__tests__/invitations.service.spec.ts
    - apps/web/next.config.ts

key-decisions:
  - "triggerRevalidation is non-blocking with try/catch and logger.warn -- revalidation failure never blocks publish/unpublish"
  - "Revalidation skipped silently when REVALIDATION_SECRET not configured (dev mode)"
  - "ConfigService injected into InvitationsService for NEXT_PUBLIC_URL and REVALIDATION_SECRET"

patterns-established:
  - "ISR revalidation: NestJS POST to /api/revalidate with x-revalidation-secret header after data mutations"
  - "htmlLimitedBots: regex in next.config.ts for crawlers needing blocking metadata"

requirements-completed: [PUBL-09, PUBL-10]

# Metrics
duration: 5min
completed: 2026-03-15
---

# Phase 5 Plan 02: ISR Revalidation & OG Meta Summary

**On-demand ISR revalidation route with NestJS trigger and htmlLimitedBots for Zalo/Facebook crawler OG tag rendering**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-15T11:39:39Z
- **Completed:** 2026-03-15T11:45:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created POST /api/revalidate route handler with secret-based auth and revalidateTag call
- Added triggerRevalidation() private method to InvitationsService with non-blocking error handling
- Wired revalidation into both publish paths (first publish + re-publish) and unpublish
- Configured htmlLimitedBots regex for Googlebot, facebookexternalhit, and Zalo crawlers

## Task Commits

Each task was committed atomically:

1. **Task 1: ISR revalidation route handler and NestJS trigger** - `19c203b` (feat)
2. **Task 2: Configure htmlLimitedBots for Zalo crawler** - `4e37f98` (feat)

## Files Created/Modified
- `apps/web/app/api/revalidate/route.ts` - ISR revalidation POST endpoint with secret validation
- `apps/api/src/invitations/invitations.service.ts` - Added triggerRevalidation(), ConfigService injection, Logger, wired into publish/unpublish
- `apps/api/src/invitations/__tests__/invitations.service.spec.ts` - Added ConfigService mock to test factory
- `apps/web/next.config.ts` - Added htmlLimitedBots regex for social crawlers

## Decisions Made
- triggerRevalidation is non-blocking (try/catch + logger.warn) so publish/unpublish always succeeds even if Next.js is unreachable
- Revalidation skipped silently when REVALIDATION_SECRET is not configured, enabling zero-config dev mode
- ConfigService (already global via ConfigModule.forRoot) injected into InvitationsService for env var access

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added ConfigService mock to existing test suite**
- **Found during:** Task 1 (ISR revalidation route handler and NestJS trigger)
- **Issue:** InvitationsService constructor now requires ConfigService, but test's makeService() only passed supabaseAdmin mock
- **Fix:** Added makeConfigMock() returning { get: vi.fn().mockReturnValue(undefined) } and passed to makeService()
- **Files modified:** apps/api/src/invitations/__tests__/invitations.service.spec.ts
- **Verification:** All 28 tests pass (0 failures)
- **Committed in:** 19c203b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** ConfigService mock was necessary for test compatibility. No scope creep.

## Issues Encountered
None

## User Setup Required
None - REVALIDATION_SECRET and NEXT_PUBLIC_URL are optional env vars. Without them, revalidation is silently skipped (suitable for dev). For production, add to .env:
- `REVALIDATION_SECRET` - shared secret between NestJS and Next.js
- `NEXT_PUBLIC_URL` - Next.js app URL (e.g., https://example.com)

## Next Phase Readiness
- ISR revalidation infrastructure ready for Plan 05-03 (public invitation page)
- htmlLimitedBots configured for OG meta tag testing with Zalo debug tool
- Public page can use `next: { tags: ['invitation-${slug}'] }` in fetch calls for cache tagging

## Self-Check: PASSED

- All 4 files exist on disk
- Both task commits verified in git log (19c203b, 4e37f98)

---
*Phase: 05-public-invitation-page*
*Completed: 2026-03-15*
