---
phase: 04-media-upload-pipeline
plan: 00
subsystem: testing
tags: [vitest, test-stubs, wave-0, nyquist]

# Dependency graph
requires:
  - phase: 03-invitation-editor-core
    provides: "Existing test patterns (EditorForm.test.tsx, invitations.service.spec.ts)"
provides:
  - "Test stub targets for EDIT-04 (photo gallery), EDIT-05 (image optimization), EDIT-06 (music picker), EDIT-07 (bank QR)"
  - "6 test files (4 new web, 1 new API pipe, 1 extended API service) all in pending/todo state"
affects: [04-media-upload-pipeline]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "it.todo() stubs for Nyquist Wave 0 test scaffolds"

key-files:
  created:
    - apps/web/__tests__/components/PhotoGallery.test.tsx
    - apps/web/__tests__/components/MusicPicker.test.tsx
    - apps/web/__tests__/components/BankQrUpload.test.tsx
    - apps/api/src/invitations/pipes/image-optimization.pipe.spec.ts
  modified:
    - apps/web/__tests__/components/templates.test.tsx
    - apps/api/src/invitations/__tests__/invitations.service.spec.ts

key-decisions:
  - "Extended existing templates.test.tsx rather than creating a separate file for photo/QR template stubs"
  - "Pre-existing 3 test failures in invitations.service.spec.ts confirmed out-of-scope (not caused by changes)"

patterns-established:
  - "it.todo() stubs created before production code for Nyquist compliance"

requirements-completed: [EDIT-04, EDIT-05, EDIT-06, EDIT-07]

# Metrics
duration: 2min
completed: 2026-03-15
---

# Phase 4 Plan 00: Test Stubs Summary

**Nyquist Wave 0 test scaffolds: 68 it.todo() stubs across 6 files covering photo gallery, image optimization, music picker, bank QR, and template rendering**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-15T02:07:40Z
- **Completed:** 2026-03-15T02:09:52Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created 4 new web component test stub files (PhotoGallery, MusicPicker, BankQrUpload) and extended templates.test.tsx
- Created new API pipe test stub for image optimization (processImage + magic-byte validation)
- Extended invitations.service.spec.ts with 16 todo stubs for media upload service methods
- All stubs register as todo/skipped with zero test failures introduced

## Task Commits

Each task was committed atomically:

1. **Task 1: Create web component test stubs** - `9c384cf` (test)
2. **Task 2: Create API test stubs** - `5361eb5` (test)

## Files Created/Modified
- `apps/web/__tests__/components/PhotoGallery.test.tsx` - 11 todo stubs for photo upload, rendering, reorder, delete (EDIT-04)
- `apps/web/__tests__/components/MusicPicker.test.tsx` - 8 todo stubs for track list, selection, preview (EDIT-06)
- `apps/web/__tests__/components/BankQrUpload.test.tsx` - 8 todo stubs for upload and bank fields (EDIT-07)
- `apps/web/__tests__/components/templates.test.tsx` - Extended with 15 todo stubs for photo gallery and bank QR rendering in all 3 templates
- `apps/api/src/invitations/pipes/image-optimization.pipe.spec.ts` - 10 todo stubs for processImage and magic-byte validation (EDIT-05)
- `apps/api/src/invitations/__tests__/invitations.service.spec.ts` - Extended with 16 todo stubs for uploadPhotos, deletePhoto, uploadBankQr, updatePhotoOrder, listMusicTracks

## Decisions Made
- Extended existing templates.test.tsx with a new `describe('Template photo gallery and bank QR rendering')` block rather than creating a completely separate file, since the plan specified this file and it already existed with template stubs
- Confirmed 3 pre-existing test failures in invitations.service.spec.ts (listByUser camelCase mapping, publish slug generation) are out of scope -- same failures occur without any changes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 subsequent plans (04-01, 04-02, 04-03) now have valid vitest test targets for their verify blocks
- Plans can implement production code and flip todo stubs to real tests incrementally

## Self-Check: PASSED

All 6 files verified present. Both task commits (9c384cf, 5361eb5) confirmed in git log.

---
*Phase: 04-media-upload-pipeline*
*Completed: 2026-03-15*
