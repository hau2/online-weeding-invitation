---
phase: 06-save-the-date
plan: 02
subsystem: ui
tags: [react, nextjs, save-the-date, teaser-page, framer-motion, countdown, template-colors]

# Dependency graph
requires:
  - phase: 06-save-the-date
    provides: "save_the_date status, teaserMessage field, publishSaveTheDate endpoint, isSaveTheDate flag in findBySlug"
  - phase: 05-public-invitation-page
    provides: "CountdownTimer component, parseGuestName utility, InvitationShell, ThankYouPage"
  - phase: 03-invitation-editor-core
    provides: "EditorShell, EditorForm accordion pattern, PublishButton, auto-save mechanism"
provides:
  - "SaveTheDatePage teaser component with couple names, date, countdown, optional photo and teaser message"
  - "Public page routing: isSaveTheDate -> SaveTheDatePage, expired -> ThankYouPage, else -> InvitationShell"
  - "Save the Date button in editor for draft invitations"
  - "save_the_date -> published transition with confirmation dialog"
  - "StatusBadge teal variant for save_the_date status"
  - "Copy-link buttons enabled for save_the_date invitations on dashboard"
  - "teaserMessage editor field in EditorForm"
affects: [public-invitation-page, dashboard, editor]

# Tech tracking
tech-stack:
  added: []
  patterns: [template-colors-record-for-teaser, getLaterDate-ceremony-date-selection]

key-files:
  created:
    - apps/web/app/w/[slug]/SaveTheDatePage.tsx
  modified:
    - apps/web/app/w/[slug]/page.tsx
    - apps/web/components/app/StatusBadge.tsx
    - apps/web/components/app/InvitationCard.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/PublishButton.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx

key-decisions:
  - "SaveTheDatePage uses template-specific TEMPLATE_COLORS record (same pattern as ThankYouPage) for consistent per-template theming"
  - "getLaterDate helper picks the later of groom/bride ceremony dates for countdown timer display"
  - "Save the Date button shown as outlined teal variant next to rose Xuat ban button for visual distinction"
  - "EditorForm sections renumbered from 9 to 10 with new Save the Date section at position 6"

patterns-established:
  - "Template color records for teaser pages: bg, text, heading, accent, muted, photoBorder"
  - "Dual-button publish UI: outlined Save the Date + solid Xuat ban for draft status"
  - "Transition dialog pattern: confirmation before state machine transitions"

requirements-completed: [SAVE-01, SAVE-02]

# Metrics
duration: 3min
completed: 2026-03-15
---

# Phase 6 Plan 02: Save-the-Date Frontend Summary

**SaveTheDatePage teaser with template colors, editor publish button with transition dialogs, teal dashboard badge, and teaserMessage editor field**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-15T18:39:31Z
- **Completed:** 2026-03-15T18:43:21Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created SaveTheDatePage component with template-specific colors, couple names, date, countdown, optional photo and teaser message
- Added isSaveTheDate routing in public page to render teaser vs full invitation
- Extended PublishButton with Save the Date publish flow, save_the_date->published transition confirmation dialog, and save_the_date-aware unpublish dialog
- Added teal save_the_date badge variant to StatusBadge using InvitationStatus type
- Enabled copy-link buttons on InvitationCard for save_the_date status
- Added teaserMessage field in EditorForm as accordion section (6/10)

## Task Commits

Each task was committed atomically:

1. **Task 1: SaveTheDatePage component + public page routing** - `30a878d` (feat)
2. **Task 2: Editor Save-the-Date button + dashboard badge + InvitationCard update** - `01f9896` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `apps/web/app/w/[slug]/SaveTheDatePage.tsx` - Teaser page with template colors, couple names, date, countdown, optional photo/teaser message, ?to= personalization
- `apps/web/app/w/[slug]/page.tsx` - Added isSaveTheDate routing before expired check, updated PublicInvitation type
- `apps/web/components/app/StatusBadge.tsx` - Added save_the_date teal badge variant, switched to InvitationStatus type
- `apps/web/components/app/InvitationCard.tsx` - Enabled copy-link buttons for save_the_date status
- `apps/web/app/(app)/thep-cuoi/[id]/PublishButton.tsx` - Save the Date button for drafts, transition dialog for save_the_date->published, save_the_date-aware unpublish
- `apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx` - teaserMessage textarea field, section numbering updated to 10

## Decisions Made
- SaveTheDatePage uses template-specific TEMPLATE_COLORS record consistent with ThankYouPage pattern for per-template theming
- getLaterDate helper picks the later of groom/bride ceremony dates for the countdown timer display on save-the-date page
- Save the Date button shown as outlined teal variant next to the solid rose Xuat ban button for clear visual distinction between teaser and full publish
- EditorForm sections renumbered from 9 to 10 to accommodate new Save the Date section at position 6 (after Loi moi, before Anh cuoi)
- Celebration dialog with confetti fires on both first save-the-date publish and save_the_date->published transition

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Save-the-date frontend complete end-to-end
- Full state machine transitions work: draft->save_the_date, save_the_date->draft, save_the_date->published, draft->published
- Phase 06 (Save-the-Date) is fully complete -- backend (Plan 01) and frontend (Plan 02) both done

## Self-Check: PASSED

All 6 created/modified files verified on disk. Both task commits (30a878d, 01f9896) confirmed in git log.

---
*Phase: 06-save-the-date*
*Completed: 2026-03-15*
