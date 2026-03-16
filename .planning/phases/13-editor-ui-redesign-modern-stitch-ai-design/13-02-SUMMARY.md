---
phase: 13-editor-ui-redesign-modern-stitch-ai-design
plan: 02
subsystem: ui, api
tags: [react, nestjs, sharp, supabase-storage, webp, lucide-react]

# Dependency graph
requires:
  - phase: 13-editor-ui-redesign-modern-stitch-ai-design
    plan: 01
    provides: "CeremonyProgramEvent type, avatar DB columns, FIELD_MAP exclusions"
  - phase: 04-media-upload-pipeline
    provides: "BankQrUpload upload pattern, processImage/extractStoragePath helpers"
provides:
  - "CeremonyProgramEditor component for dynamic wedding day schedule editing"
  - "AvatarUpload component for circular groom/bride photo upload"
  - "POST :id/groom-avatar and POST :id/bride-avatar API endpoints"
  - "processAvatarImage helper (400x400 WebP square crop)"
affects: [13-03, 13-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "processAvatarImage: 400x400 cover crop at quality 80 (distinct from processImage 1200-wide)"
    - "Avatar storage in invitation-photos bucket at {id}/groom-avatar.webp path (reuses existing bucket)"

key-files:
  created:
    - apps/web/app/(app)/thep-cuoi/[id]/CeremonyProgramEditor.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/AvatarUpload.tsx
  modified:
    - apps/api/src/invitations/invitations.controller.ts
    - apps/api/src/invitations/invitations.service.ts

key-decisions:
  - "processAvatarImage separate from processImage -- 400x400 cover crop vs 1200-wide resize"
  - "Avatar storage reuses invitation-photos bucket rather than new avatars bucket -- simpler, no new bucket policy"
  - "AvatarUpload uses regular img tag (not next/image) to avoid Supabase domain config issues"

patterns-established:
  - "Avatar upload pattern: dedicated endpoint, circular UI, 400x400 WebP crop, invitation-photos bucket"

requirements-completed: [EDIT-UI-03, EDIT-UI-04]

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 13 Plan 02: Sub-Components Summary

**CeremonyProgramEditor (dynamic event list, max 10) and AvatarUpload (circular 400x400 WebP upload) with dedicated API endpoints**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T14:48:25Z
- **Completed:** 2026-03-16T14:51:10Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- CeremonyProgramEditor: dynamic event list with add/remove/edit, max 10 events, Clock icon + index, neutral gray Stitch styling
- AvatarUpload: circular 80px container, camera overlay on hover, loading spinner, error toast via sonner
- Two new API endpoints (POST groom-avatar, POST bride-avatar) following exact BankQrUpload pattern
- processAvatarImage helper: sharp 400x400 cover crop to WebP at quality 80, magic-byte MIME validation

## Task Commits

Each task was committed atomically:

1. **Task 1: CeremonyProgramEditor component** - `7dc2c56` (feat)
2. **Task 2: AvatarUpload component + API avatar upload endpoints** - `8f1eef1` (feat)

## Files Created/Modified
- `apps/web/app/(app)/thep-cuoi/[id]/CeremonyProgramEditor.tsx` - Dynamic ceremony event editor with add/remove/edit (110 lines)
- `apps/web/app/(app)/thep-cuoi/[id]/AvatarUpload.tsx` - Circular avatar upload with camera overlay (102 lines)
- `apps/api/src/invitations/invitations.controller.ts` - POST :id/groom-avatar and POST :id/bride-avatar routes
- `apps/api/src/invitations/invitations.service.ts` - uploadGroomAvatar, uploadBrideAvatar methods + processAvatarImage helper

## Decisions Made
- processAvatarImage is a separate method from processImage: avatars need 400x400 cover crop (square) vs general images at 1200-wide
- Avatars stored in existing invitation-photos bucket at {id}/groom-avatar.webp path -- no new bucket policy needed
- AvatarUpload uses regular `<img>` tag instead of next/image to avoid Supabase URL domain config issues (follows template pattern)
- WebP quality 80 for avatars (vs 75 for general photos) since small 400x400 images benefit from slightly higher quality

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both components ready for Plan 03 EditorForm rewrite (accordion sections integration)
- CeremonyProgramEditor accepts events array + onChange callback, directly composable into accordion section
- AvatarUpload accepts invitationId + endpoint, ready for Couple Info section
- All API endpoints tested and working (51 API tests pass, 93 web tests pass)

## Self-Check: PASSED

- FOUND: CeremonyProgramEditor.tsx
- FOUND: AvatarUpload.tsx
- FOUND: 7dc2c56 (Task 1 commit)
- FOUND: 8f1eef1 (Task 2 commit)

---
*Phase: 13-editor-ui-redesign-modern-stitch-ai-design*
*Completed: 2026-03-16*
