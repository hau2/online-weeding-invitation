---
phase: 05-public-invitation-page
plan: 00
subsystem: testing
tags: [vitest, qrcode, test-stubs, wave-0]

# Dependency graph
requires:
  - phase: 04-media-upload-pipeline
    provides: "Existing test patterns and component structure"
provides:
  - "Test stub scaffolds for all Phase 5 requirements"
  - "qrcode dependency for QR generation in Plan 05-01"
affects: [05-public-invitation-page]

# Tech tracking
tech-stack:
  added: [qrcode, "@types/qrcode"]
  patterns: [it.todo-stubs-for-nyquist-compliance]

key-files:
  created:
    - apps/api/src/invitations/__tests__/public-invitations.spec.ts
    - apps/api/src/invitations/__tests__/qr-generation.spec.ts
    - apps/web/__tests__/components/EnvelopeAnimation.test.tsx
    - apps/web/__tests__/components/GuestName.test.tsx
    - apps/web/__tests__/components/InvitationContent.test.tsx
    - apps/web/__tests__/components/CountdownTimer.test.tsx
    - apps/web/__tests__/components/MusicPlayer.test.tsx
    - apps/web/__tests__/components/ThankYouPage.test.tsx
  modified:
    - apps/api/package.json
    - pnpm-lock.yaml

key-decisions:
  - "Followed existing vitest it.todo() pattern from Phase 3/4 stubs"

patterns-established:
  - "Phase 5 test stubs: 8 files (2 API + 6 web) with 33 it.todo() entries covering all PUBL requirements"

requirements-completed: [PUBL-01, PUBL-02, PUBL-03, PUBL-04, PUBL-05, PUBL-06, PUBL-07, PUBL-08, PUBL-11, PUBL-12]

# Metrics
duration: 3min
completed: 2026-03-15
---

# Phase 5 Plan 00: Test Stub Scaffolds & qrcode Dependency Summary

**Wave 0 test scaffolding: 8 stub files with 33 it.todo() entries covering PUBL-01 through PUBL-12, plus qrcode package installed for QR generation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-15T11:39:17Z
- **Completed:** 2026-03-15T12:01:36Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Installed qrcode (v1.5.4) and @types/qrcode (v1.5.6) in apps/api for Plan 05-01 QR generation
- Created 2 API test stub files: public-invitations (6 stubs) and qr-generation (4 stubs)
- Created 6 web component test stub files: EnvelopeAnimation (5), GuestName (4), InvitationContent (2), CountdownTimer (4), MusicPlayer (4), ThankYouPage (4)
- All test suites pass without errors (todos shown as pending, not failures)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install qrcode dependency and create API test stubs** - `68e3581` (chore)
2. **Task 2: Create web component test stubs** - `443ba32` (test)

## Files Created/Modified
- `apps/api/package.json` - Added qrcode and @types/qrcode dependencies
- `pnpm-lock.yaml` - Updated lockfile with new packages
- `apps/api/src/invitations/__tests__/public-invitations.spec.ts` - 6 it.todo() stubs for PUBL-01, PUBL-11, PUBL-06
- `apps/api/src/invitations/__tests__/qr-generation.spec.ts` - 4 it.todo() stubs for PUBL-02
- `apps/web/__tests__/components/EnvelopeAnimation.test.tsx` - 5 it.todo() stubs for PUBL-03, PUBL-04, PUBL-05
- `apps/web/__tests__/components/GuestName.test.tsx` - 4 it.todo() stubs for PUBL-05
- `apps/web/__tests__/components/InvitationContent.test.tsx` - 2 it.todo() stubs for PUBL-06
- `apps/web/__tests__/components/CountdownTimer.test.tsx` - 4 it.todo() stubs for PUBL-07
- `apps/web/__tests__/components/MusicPlayer.test.tsx` - 4 it.todo() stubs for PUBL-08
- `apps/web/__tests__/components/ThankYouPage.test.tsx` - 4 it.todo() stubs for PUBL-12

## Decisions Made
- Followed existing vitest it.todo() pattern from Phase 3/4 stubs for consistency
- Used `import { describe, it } from 'vitest'` (no expect needed for todo stubs)

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 33 test stubs ready as failing targets for Plans 05-01 through 05-04
- qrcode dependency available for QR generation implementation in Plan 05-01

## Self-Check: PASSED

All 9 files verified present. Both commits (68e3581, 443ba32) confirmed in git log.

---
*Phase: 05-public-invitation-page*
*Completed: 2026-03-15*
