---
phase: 03-invitation-editor-core
plan: 04
subsystem: ui
tags: [react, nextjs, publish, unpublish, confetti, dialog, preview, canvas-confetti]

# Dependency graph
requires:
  - phase: 03-invitation-editor-core/03-01
    provides: "CRUD API endpoints including POST /invitations/:id/publish and /unpublish"
  - phase: 03-invitation-editor-core/03-02
    provides: "TemplateRenderer component for full preview dialog"
  - phase: 03-invitation-editor-core/03-03
    provides: "EditorShell with topbar placeholder for publish button"
provides:
  - "PublishButton: full publish/unpublish lifecycle with confirmation dialogs and celebration"
  - "FullPreviewDialog: full-page preview overlay rendering TemplateRenderer read-only"
  - "EditorShell integration: publish button in topbar, preview dialog wiring"
affects: [04-media-uploads, 05-public-invitation-page]

# Tech tracking
tech-stack:
  added: [canvas-confetti]
  patterns: [dynamic-import-for-ssr-safety, callback-prop-wiring-between-siblings]

key-files:
  created:
    - apps/web/app/(app)/thep-cuoi/[id]/PublishButton.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/FullPreviewDialog.tsx
  modified:
    - apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx

key-decisions:
  - "canvas-confetti dynamically imported via import() to avoid SSR issues and keep initial bundle small"
  - "Two-burst confetti pattern (100 particles + 60 particles at 250ms delay) for satisfying celebration"
  - "onPreview callback prop connects PublishButton dropdown to FullPreviewDialog via EditorShell state"

patterns-established:
  - "Dynamic import pattern: import() inside async callback for client-only libraries"
  - "Sibling communication pattern: parent state + callback props to connect dropdown action to dialog open"

requirements-completed: [EDIT-09, EDIT-10, SYST-02]

# Metrics
duration: 3min
completed: 2026-03-14
---

# Phase 3 Plan 4: Publish Flow Summary

**Publish/unpublish buttons with confirmation dialogs, canvas-confetti celebration on first publish, and full-page preview dialog integrated into editor topbar**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-14T22:40:00Z
- **Completed:** 2026-03-14T22:43:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- PublishButton component with full lifecycle: validation, confirmation, publish API call, celebration with confetti, copy-URL, and unpublish via dropdown
- FullPreviewDialog rendering TemplateRenderer at full size in scrollable overlay for guest-view preview
- EditorShell integration wiring PublishButton and FullPreviewDialog into topbar with state callbacks

## Task Commits

Each task was committed atomically:

1. **Task 1: PublishButton with confirmation, celebration, and unpublish flow** - `e1d54d2` (feat)
2. **Task 2: FullPreviewDialog and EditorShell integration** - `aadfa89` (feat)

**Plan metadata:** (pending) (docs: complete plan)

## Files Created/Modified
- `apps/web/app/(app)/thep-cuoi/[id]/PublishButton.tsx` - Full publish/unpublish lifecycle with 3 dialogs (confirm, celebrate, unpublish)
- `apps/web/app/(app)/thep-cuoi/[id]/FullPreviewDialog.tsx` - Full-page preview overlay with TemplateRenderer
- `apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx` - Added PublishButton and FullPreviewDialog integration in topbar

## Decisions Made
- canvas-confetti dynamically imported via import() to avoid SSR issues and keep initial bundle small
- Two-burst confetti pattern (100 particles + 60 particles at 250ms delay) for a more satisfying celebration moment
- onPreview callback prop connects PublishButton's dropdown "Xem truoc" option to FullPreviewDialog via EditorShell's showFullPreview state
- Required field validation (brideName, groomName) checked before opening confirm dialog, with toast error

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 3 (Invitation Editor Core) fully complete
- All editor components ready for Phase 4 media uploads integration
- PublishButton ready for Phase 5 public invitation page (share flow enhancement)
- FullPreviewDialog reusable for any future preview contexts

## Self-Check: PASSED

All 2 created files and 1 modified file verified on disk. Both task commits (e1d54d2, aadfa89) verified in git log.

---
*Phase: 03-invitation-editor-core*
*Completed: 2026-03-14*
