---
phase: 13-editor-ui-redesign-modern-stitch-ai-design
plan: 03
subsystem: ui
tags: [react, accordion, lucide-react, stitch-design, editor, preview-mode]

# Dependency graph
requires:
  - phase: 13-editor-ui-redesign-modern-stitch-ai-design
    plan: 02
    provides: "CeremonyProgramEditor + AvatarUpload components"
  - phase: 09.1-public-page-redesign
    provides: "EditorPreview dual mockup, TemplateSelector, SharedTemplate"
provides:
  - "Redesigned EditorShell top bar with center mobile/desktop toggle and Stitch-style action buttons"
  - "EditorPreview mode prop for single-mockup display (phone/desktop/both)"
  - "EditorForm with 9 icon-based accordion sections in locked order"
  - "New fields editable: avatars, nicknames, ceremony program"
  - "onAvatarUploaded callback prop for avatar upload bypass of auto-save"
affects: [13-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SectionHeader component pattern: colored circle + icon + label for accordion triggers"
    - "INPUT_CLASS constant for consistent neutral gray form styling"
    - "previewMode state in EditorShell controlling EditorPreview single-mockup display"

key-files:
  created: []
  modified:
    - apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/EditorPreview.tsx

key-decisions:
  - "TemplateSelector moved from preview panel into EditorForm section 7 -- single scrollable form contains all settings"
  - "EditorPreview mode prop defaults to 'both' for backward compatibility with preview page"
  - "onAvatarUploaded callback bypasses onChange/auto-save since avatars are upload-managed"

patterns-established:
  - "Icon-based accordion section pattern: SECTION_ICONS map + SectionHeader component for consistent visual hierarchy"
  - "Neutral gray form styling: INPUT_CLASS constant replaces per-field rose classes"

requirements-completed: [EDIT-UI-01, EDIT-UI-06]

# Metrics
duration: 3min
completed: 2026-03-16
---

# Phase 13 Plan 03: EditorShell + EditorForm Redesign Summary

**Stitch-style top bar with mobile/desktop toggle and 9 icon-based accordion form sections with avatars, nicknames, and ceremony program**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-16T15:02:31Z
- **Completed:** 2026-03-16T15:05:55Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- EditorShell top bar redesigned: back + "Trinh chinh sua thiep" + save indicator | center mobile/desktop toggle | "Di luu" ghost + "Xem truoc" outlined + publish buttons
- EditorPreview accepts mode prop to show phone-only, desktop-only, or both mockups
- EditorForm rewritten from 10 rose-themed sections to 9 icon-based accordion sections in Stitch order
- New fields editable: groom/bride avatars (circular upload), nicknames, ceremony program events
- TemplateSelector moved from preview panel into form section 7 ("Giao dien & Theme")
- Google Maps URL field with copy button and "Mo Google Maps" external link

## Task Commits

Each task was committed atomically:

1. **Task 1: EditorShell top bar redesign + EditorPreview mode prop** - `9cf3e47` (feat)
2. **Task 2: EditorForm 9-section accordion rewrite with new fields** - `08e0164` (feat)

## Files Created/Modified
- `apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx` - Redesigned top bar with center toggle, "Di luu" ghost button, previewMode state, onAvatarUploaded callback
- `apps/web/app/(app)/thep-cuoi/[id]/EditorPreview.tsx` - Added mode prop (phone/desktop/both), "Live Preview" label, neutral gray mobile border
- `apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx` - 9 icon-based accordion sections, SECTION_ICONS map, SectionHeader component, AvatarUpload/CeremonyProgramEditor/TemplateSelector integration

## Decisions Made
- TemplateSelector moved from preview panel into EditorForm section 7 -- keeps all editing controls in the left form panel
- EditorPreview mode prop defaults to 'both' for backward compat (PreviewShell from Plan 04 uses its own mockups)
- onAvatarUploaded callback prop added to EditorForm -- avatars bypass onChange/auto-save since they're upload-managed (consistent with bankQrUrl pattern)
- "Di luu" button triggers save({}) which goes through useAutoSave debounce -- complements auto-save with manual trigger
- Love story milestones moved into section 8 ("Loi moi") as sub-section instead of standalone section

## Deviations from Plan

None - plan executed exactly as written. FullPreviewDialog removal was already done in Plan 04 (Rule 3 auto-fix documented there).

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- EditorShell and EditorForm fully redesigned per Stitch reference
- All 9 form sections functional with icon headers and neutral gray styling
- Preview mode toggle works with EditorPreview mode prop
- Plan 05 (polish, responsive, final touches) can proceed

## Self-Check: PASSED

- FOUND: EditorShell.tsx (modified)
- FOUND: EditorForm.tsx (modified)
- FOUND: EditorPreview.tsx (modified)
- FOUND: 9cf3e47 (Task 1 commit)
- FOUND: 08e0164 (Task 2 commit)

---
*Phase: 13-editor-ui-redesign-modern-stitch-ai-design*
*Completed: 2026-03-16*
