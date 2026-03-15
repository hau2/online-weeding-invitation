---
phase: 03-invitation-editor-core
plan: 05
subsystem: ui
tags: [react, lucide, preview, editor-topbar]

# Dependency graph
requires:
  - phase: 03-invitation-editor-core
    provides: FullPreviewDialog component, EditorShell topbar, PublishButton dropdown
provides:
  - Always-visible full preview button in editor topbar (closes EDIT-09 gap)
affects: [05-public-invitation-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Standalone topbar actions decoupled from publish-state dropdown"

key-files:
  created: []
  modified:
    - apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/PublishButton.tsx

key-decisions:
  - "Preview button lives in EditorShell topbar, not in PublishButton dropdown -- always visible regardless of publish status"
  - "Removed onPreview prop entirely from PublishButton -- single responsibility, PublishButton only handles publish/unpublish"

patterns-established:
  - "Editor topbar actions: standalone buttons for always-available actions, dropdown only for state-specific actions"

requirements-completed: [EDIT-09]

# Metrics
duration: 2min
completed: 2026-03-15
---

# Phase 3 Plan 5: Preview Button Gap Closure Summary

**Always-visible Eye preview button in editor topbar closes EDIT-09 gap -- drafts and published invitations can now trigger FullPreviewDialog**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-15T00:59:39Z
- **Completed:** 2026-03-15T01:01:23Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- Added standalone preview button with Eye icon and "Xem truoc" text to editor topbar, visible for all invitation statuses
- Removed onPreview prop and "Xem truoc" dropdown item from PublishButton, keeping only "Huy xuat ban" in published-state dropdown
- Cleaned up unused imports (Eye, DropdownMenuSeparator) from PublishButton

## Task Commits

Each task was committed atomically:

1. **Task 1: Add standalone preview button to editor topbar and clean up PublishButton dropdown** - `0c6f998` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified
- `apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx` - Added Eye icon import, Button import, standalone preview button in topbar; removed onPreview prop from PublishButton usage
- `apps/web/app/(app)/thep-cuoi/[id]/PublishButton.tsx` - Removed onPreview prop from interface and destructured props; removed "Xem truoc" dropdown item and separator; cleaned unused Eye and DropdownMenuSeparator imports

## Decisions Made
- Preview button placed in EditorShell topbar (not PublishButton) so it is always visible regardless of publish status -- this directly closes the EDIT-09 gap where draft invitations had no way to open full preview
- Removed onPreview prop entirely from PublishButton rather than keeping it unused -- cleaner API surface with single responsibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Cleaned up unused imports in PublishButton**
- **Found during:** Task 1
- **Issue:** After removing the "Xem truoc" dropdown item, `Eye` icon and `DropdownMenuSeparator` imports became unused
- **Fix:** Removed unused `Eye` from lucide-react import and `DropdownMenuSeparator` from dropdown-menu import
- **Files modified:** apps/web/app/(app)/thep-cuoi/[id]/PublishButton.tsx
- **Verification:** No unused import warnings
- **Committed in:** 0c6f998 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical - unused import cleanup)
**Impact on plan:** Minor cleanup beyond plan spec. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- EDIT-09 verification gap is closed: full preview accessible from both draft and published invitations
- Phase 3 should now pass 5/5 truths in verification
- No blockers for subsequent phases

## Self-Check: PASSED

- FOUND: EditorShell.tsx
- FOUND: PublishButton.tsx
- FOUND: 03-05-SUMMARY.md
- FOUND: commit 0c6f998

---
*Phase: 03-invitation-editor-core*
*Completed: 2026-03-15*
