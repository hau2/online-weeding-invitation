---
phase: 05-public-invitation-page
plan: 01
subsystem: api
tags: [nestjs, qrcode, supabase-storage, public-endpoint, expiry-logic]

# Dependency graph
requires:
  - phase: 03-invitation-editor-core
    provides: "InvitationsService with publish/unpublish, slug generation"
  - phase: 04-media-upload-pipeline
    provides: "Supabase Storage upload patterns, InvitationRow with bank QR"
provides:
  - "PublicInvitationsController with GET /invitations/public/:slug"
  - "findBySlug service method with 7-day grace period expiry logic"
  - "generateQrCode service method with Supabase Storage upload"
  - "qr_code_url column in InvitationRow/mapRow/SELECT_ALL"
  - "qrCodeUrl field in @repo/types Invitation interface"
affects: [05-public-invitation-page, 06-sharing-social]

# Tech tracking
tech-stack:
  added: [qrcode (already installed)]
  patterns: [separate-public-controller, non-blocking-qr-generation, grace-period-expiry]

key-files:
  created:
    - apps/api/src/invitations/public-invitations.controller.ts
    - apps/api/src/invitations/__tests__/public-invitations.spec.ts
    - apps/api/src/invitations/__tests__/qr-generation.spec.ts
  modified:
    - apps/api/src/invitations/invitations.service.ts
    - apps/api/src/invitations/invitations.module.ts
    - packages/types/src/invitation.ts

key-decisions:
  - "PublicInvitationsController is a separate controller (not in existing JwtGuard-protected controller) for clean auth separation"
  - "QR generation failure is non-blocking (try/catch with logger.warn) to never block publish flow"
  - "Expiry uses UTC+7 end-of-day calculation (23:59:59+07:00) plus 7-day grace period"
  - "qr_code_url added to SELECT_ALL, InvitationRow, mapRow for all queries (handles null gracefully)"

patterns-established:
  - "Separate controller pattern: unauthenticated endpoints in their own controller to avoid @UseGuards bypass risks"
  - "Non-blocking side effects: QR generation and ISR revalidation wrapped in try/catch, logged on failure"
  - "Public endpoint enrichment: findBySlug resolves musicUrl from system_music_tracks and adds expired flag"

requirements-completed: [PUBL-01, PUBL-02, PUBL-11, PUBL-12]

# Metrics
duration: 8min
completed: 2026-03-15
---

# Phase 5 Plan 01: Public API Layer Summary

**Public NestJS endpoint for unauthenticated invitation access by slug, with QR code PNG generation at publish time and 7-day grace period expiry logic**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-15T12:06:00Z
- **Completed:** 2026-03-15T13:02:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Public GET /invitations/public/:slug endpoint returns published invitation without JWT authentication
- QR code PNG (512px, high error correction) generated on first publish and stored to Supabase Storage qr-codes bucket
- Expiry logic: wedding_date + 7 days grace period calculates in UTC+7; returns expired: true after grace period
- Music URL resolved from system_music_tracks when musicTrackId is set (enriched response for public page)

## Task Commits

Each task was committed atomically:

1. **Task 1: Public endpoint -- findBySlug with expiry logic**
   - `7b7f999` (test) - Failing tests for findBySlug
   - `4b4b518` (feat) - Implementation: findBySlug, PublicInvitationsController, qr_code_url column
2. **Task 2: QR code generation at publish time**
   - `25a2dfe` (test) - Failing tests for QR generation
   - `cb0f2c1` (feat) - Implementation: generateQrCode wired into publish flow

## Files Created/Modified
- `apps/api/src/invitations/public-invitations.controller.ts` - Unauthenticated controller with GET public/:slug
- `apps/api/src/invitations/invitations.service.ts` - findBySlug, generateQrCode methods, qr_code_url support
- `apps/api/src/invitations/invitations.module.ts` - Registered PublicInvitationsController
- `apps/api/src/invitations/__tests__/public-invitations.spec.ts` - 9 tests for findBySlug/expiry/musicUrl
- `apps/api/src/invitations/__tests__/qr-generation.spec.ts` - 5 tests for QR generation flow
- `packages/types/src/invitation.ts` - Added qrCodeUrl optional field

## Decisions Made
- PublicInvitationsController is a separate controller class, not a method in the existing JwtGuard-protected InvitationsController. This prevents accidentally exposing authenticated endpoints if someone adds a new method.
- QR generation failure is completely non-blocking: wrapped in try/catch, logs a warning, but publish succeeds regardless. QR can be regenerated later if needed.
- Expiry uses end-of-day in Vietnam timezone (UTC+7) as the wedding date reference point, since weddings happen during the day and the grace period should start after the day ends.
- ISR revalidation and QR generation both follow the non-blocking side-effect pattern.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. The qr-codes Supabase Storage bucket should be created via Supabase dashboard before first publish (the code handles missing bucket gracefully by logging a warning).

## Next Phase Readiness
- Public API endpoint ready for Next.js ISR page to consume at /w/[slug]
- QR code generation functional; couples get a scannable QR on first publish
- Expiry logic enables thank-you page rendering on the frontend
- musicUrl enrichment enables the public page music player

## Self-Check: PASSED

All 6 files verified present. All 4 commits verified in git history.

---
*Phase: 05-public-invitation-page*
*Completed: 2026-03-15*
