---
phase: 13-editor-ui-redesign-modern-stitch-ai-design
plan: 04
subsystem: ui
tags: [preview, tabs, device-mockup, timeline, ceremony-program, avatar, next.js]

# Dependency graph
requires:
  - phase: 13-02
    provides: CeremonyProgramEditor + avatar upload endpoints
provides:
  - Dedicated preview page route at /thep-cuoi/[id]/preview
  - PreviewShell with phone/desktop/share tabs and side filtering
  - TimelineSection extended with ceremony program rendering
  - HeroSection extended with avatar display
affects: [13-editor-ui-redesign-modern-stitch-ai-design]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Device mockup preview: phone (280px, notch) and desktop (680px, browser chrome) reusable patterns"
    - "Side filtering via useMemo with groom/bride field nullification"
    - "Tab-based preview UI with pill toggle for sub-filtering"

key-files:
  created:
    - apps/web/app/(app)/thep-cuoi/[id]/preview/page.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/preview/PreviewShell.tsx
  modified:
    - apps/web/components/templates/sections/TimelineSection.tsx
    - apps/web/components/templates/sections/HeroSection.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx
    - apps/web/__tests__/components/FullPreviewDialog.test.tsx
    - apps/web/__tests__/components/sections.test.tsx

key-decisions:
  - "EditorShell updated to link to preview page (Rule 3 - blocking: FullPreviewDialog deleted would break import)"
  - "PreviewShell manages its own invitation state for publish callbacks"
  - "Avatar display added to HeroSection (existing component, not new section)"

patterns-established:
  - "Preview page pattern: RSC fetches + client shell with tabs"
  - "Dual timeline sub-sections: same section wrapper, different icon types"

requirements-completed: [EDIT-UI-05]

# Metrics
duration: 4min
completed: 2026-03-16
---

# Phase 13 Plan 04: Preview Page + Ceremony Program Summary

**Dedicated full-page preview route with phone/desktop/share tabs, ceremony program timeline with Clock icons, and HeroSection avatar display**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-16T14:55:24Z
- **Completed:** 2026-03-16T14:59:26Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created dedicated preview page route replacing FullPreviewDialog with phone mockup, desktop mockup, and share link tabs
- Extended TimelineSection to render ceremony program events with Clock icons alongside love story Heart icons
- Added groom/bride avatar display in HeroSection as circular images above couple names
- EditorShell simplified: single "Xem truoc" Link replaces two Eye buttons

## Task Commits

Each task was committed atomically:

1. **Task 1: Preview page route with PreviewShell tabs and mockups** - `5379075` (feat)
2. **Task 2: TimelineSection ceremony program rendering + HeroSection avatars** - `65b140d` (feat)

## Files Created/Modified
- `apps/web/app/(app)/thep-cuoi/[id]/preview/page.tsx` - RSC preview page with cookie-based invitation fetch
- `apps/web/app/(app)/thep-cuoi/[id]/preview/PreviewShell.tsx` - Client component with 3 tabs, side toggle, device mockups
- `apps/web/components/templates/sections/TimelineSection.tsx` - Extended with ceremony program timeline (Clock icons)
- `apps/web/components/templates/sections/HeroSection.tsx` - Added avatar display for groom/bride
- `apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx` - Replaced FullPreviewDialog usage with Link to preview page
- `apps/web/app/(app)/thep-cuoi/[id]/FullPreviewDialog.tsx` - Deleted (replaced by preview route)
- `apps/web/__tests__/components/FullPreviewDialog.test.tsx` - Updated to verify replacement
- `apps/web/__tests__/components/sections.test.tsx` - Added ceremony program todo tests

## Decisions Made
- EditorShell updated in this plan (not Plan 03) to avoid broken import when deleting FullPreviewDialog (Rule 3 auto-fix)
- PreviewShell manages its own invitation state to support publish/unpublish callbacks from embedded PublishButton
- Avatar display placed in HeroSection (above couple names) as it's the natural visual location
- Desktop mockup widened to 680px (vs 580px in EditorPreview) for better standalone preview experience

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated EditorShell to remove FullPreviewDialog import**
- **Found during:** Task 1 (deleting FullPreviewDialog.tsx)
- **Issue:** Deleting FullPreviewDialog.tsx would break EditorShell which imports it; Plan says Plan 03 handles this but Plan 03 hasn't run
- **Fix:** Removed import, state vars, and rendering of FullPreviewDialog; replaced two Eye buttons with single "Xem truoc" Link
- **Files modified:** apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx
- **Verification:** Full test suite passes (96 tests, 0 failures)
- **Committed in:** 5379075 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix necessary to prevent build breakage. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Preview page ready for visual verification at /thep-cuoi/[id]/preview
- TimelineSection now renders both love story and ceremony program
- HeroSection displays avatars when uploaded
- Plan 03 (EditorShell redesign) can skip FullPreviewDialog removal since already done here

## Self-Check: PASSED

All files verified present, FullPreviewDialog.tsx confirmed deleted, both task commits found.

---
*Phase: 13-editor-ui-redesign-modern-stitch-ai-design*
*Completed: 2026-03-16*
