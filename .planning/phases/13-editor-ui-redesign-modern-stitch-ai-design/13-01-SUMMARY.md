---
phase: 13-editor-ui-redesign-modern-stitch-ai-design
plan: 01
subsystem: database, api, types, testing
tags: [supabase, nestjs, class-validator, vitest, jsonb, typescript]

# Dependency graph
requires:
  - phase: 05.1-dual-family-ceremony
    provides: "love_story JSONB column pattern, LoveStoryMilestone type"
  - phase: 04-media-upload-pipeline
    provides: "FIELD_MAP exclusion pattern for upload-managed URLs"
provides:
  - "ceremony_program JSONB column for wedding day schedule"
  - "groom_avatar_url / bride_avatar_url columns for couple photos"
  - "groom_nickname / bride_nickname columns"
  - "CeremonyProgramEvent TypeScript interface"
  - "CeremonyProgramEventDto with validation (max 10 events)"
  - "Wave 0 test stubs for EditorForm, CeremonyProgramEditor, AvatarUpload, PreviewShell, EditorShell"
affects: [13-02, 13-03, 13-04, 13-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "JSONB NOT NULL DEFAULT '[]' for ceremony_program (same as love_story)"
    - "Avatar URLs excluded from FIELD_MAP and useAutoSave (upload-managed, same as bankQrUrl)"

key-files:
  created:
    - supabase/migrations/012_editor_new_fields.sql
    - apps/web/__tests__/components/CeremonyProgramEditor.test.tsx
    - apps/web/__tests__/components/AvatarUpload.test.tsx
    - apps/web/__tests__/components/PreviewShell.test.tsx
    - apps/web/__tests__/components/EditorShell.test.tsx
  modified:
    - packages/types/src/invitation.ts
    - apps/api/src/invitations/dto/update-invitation.dto.ts
    - apps/api/src/invitations/invitations.service.ts
    - apps/web/app/(app)/thep-cuoi/[id]/useAutoSave.ts
    - apps/web/__tests__/components/EditorForm.test.tsx
    - apps/web/__tests__/components/InvitationCard.test.tsx
    - apps/web/__tests__/components/InvitationContent.test.tsx

key-decisions:
  - "Avatar URLs excluded from FIELD_MAP and useAutoSave -- managed by dedicated upload endpoints"
  - "bank_account_number and bride_bank_account_number added to SELECT_ALL (were missing)"
  - "CeremonyProgramEvent placed before loveStory in Invitation interface for logical grouping"

patterns-established:
  - "Avatar URL exclusion pattern: same as bankQrUrl/brideBankQrUrl -- not in FIELD_MAP, not in DTO, excluded from useAutoSave destructure"

requirements-completed: [EDIT-UI-02, EDIT-UI-07, EDIT-UI-08]

# Metrics
duration: 4min
completed: 2026-03-16
---

# Phase 13 Plan 01: Foundation Summary

**5 new DB columns (ceremony_program, avatars, nicknames), extended Invitation type/DTO/service, Wave 0 test stubs for 5 editor components**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-16T14:40:55Z
- **Completed:** 2026-03-16T14:44:52Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Migration 012 adds ceremony_program (JSONB), groom/bride avatar URLs, groom/bride nicknames
- CeremonyProgramEvent interface and CeremonyProgramEventDto with full validation (max 10 events, title 100 chars, description 300 chars)
- All 4 sync points in invitations.service.ts updated: InvitationRow, FIELD_MAP, mapRow, SELECT_ALL
- Fixed pre-existing gap: bank_account_number and bride_bank_account_number added to SELECT_ALL
- 28 test todos across 5 component stubs ready for Phase 13 development

## Task Commits

Each task was committed atomically:

1. **Task 1: DB migration + types + API DTO/service + useAutoSave** - `0e49c9f` (feat)
2. **Task 2: Wave 0 test stubs for Phase 13 components** - `262a0d1` (test)

## Files Created/Modified
- `supabase/migrations/012_editor_new_fields.sql` - 5 new columns for editor redesign
- `packages/types/src/invitation.ts` - CeremonyProgramEvent interface + 5 new Invitation fields
- `apps/api/src/invitations/dto/update-invitation.dto.ts` - CeremonyProgramEventDto + nickname validation
- `apps/api/src/invitations/invitations.service.ts` - InvitationRow/FIELD_MAP/mapRow/SELECT_ALL synced
- `apps/web/app/(app)/thep-cuoi/[id]/useAutoSave.ts` - Avatar URL exclusions added
- `apps/web/__tests__/components/EditorForm.test.tsx` - Updated with 7 todos for 9-section redesign
- `apps/web/__tests__/components/CeremonyProgramEditor.test.tsx` - 6 todos for event CRUD
- `apps/web/__tests__/components/AvatarUpload.test.tsx` - 4 todos for avatar upload
- `apps/web/__tests__/components/PreviewShell.test.tsx` - 5 todos for preview tabs
- `apps/web/__tests__/components/EditorShell.test.tsx` - 6 todos for editor topbar

## Decisions Made
- Avatar URLs excluded from FIELD_MAP and useAutoSave -- follows established pattern from bankQrUrl (upload-managed fields)
- Fixed bank_account_number and bride_bank_account_number missing from SELECT_ALL while updating it
- CeremonyProgramEvent placed before loveStory in Invitation interface for logical grouping with ceremony data

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test mock data missing new Invitation fields**
- **Found during:** Task 1 (after adding fields to Invitation interface)
- **Issue:** InvitationCard.test.tsx and InvitationContent.test.tsx mock objects missing ceremonyProgram, groomAvatarUrl, brideAvatarUrl, groomNickname, brideNickname
- **Fix:** Added all 5 new fields to mock data in both test files
- **Files modified:** apps/web/__tests__/components/InvitationCard.test.tsx, apps/web/__tests__/components/InvitationContent.test.tsx
- **Verification:** TypeScript compilation passes without errors from these files
- **Committed in:** 0e49c9f (Task 1 commit)

**2. [Rule 1 - Bug] Fixed InvitationCard mock missing pre-existing fields**
- **Found during:** Task 1 (test mock incomplete)
- **Issue:** InvitationCard.test.tsx mock was missing bankAccountNumber, brideBankAccountNumber, teaserMessage, plan, paymentStatus fields
- **Fix:** Added all missing fields to makeInvitation helper
- **Files modified:** apps/web/__tests__/components/InvitationCard.test.tsx
- **Verification:** TypeScript compilation passes
- **Committed in:** 0e49c9f (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes necessary for TypeScript compilation after interface change. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All types, API support, and DB columns in place for Phase 13 Plans 02-05
- Wave 0 test stubs ready to be filled as components are built
- Pre-existing TypeScript errors in other files (CountdownTimer, InvitationGrid, middleware) are unrelated and do not block Phase 13

---
*Phase: 13-editor-ui-redesign-modern-stitch-ai-design*
*Completed: 2026-03-16*
