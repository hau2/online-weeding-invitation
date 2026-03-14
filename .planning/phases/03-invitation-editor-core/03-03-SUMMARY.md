---
phase: 03-invitation-editor-core
plan: 03
subsystem: ui
tags: [react, nextjs, auto-save, debounce, accordion, phone-mockup, template-selector]

# Dependency graph
requires:
  - phase: 03-invitation-editor-core/03-01
    provides: "CRUD API endpoints (GET/PATCH /invitations/:id)"
  - phase: 03-invitation-editor-core/03-02
    provides: "TemplateRenderer, 3 template components, TemplateProps type"
provides:
  - "Editor page at /thep-cuoi/[id] with server-side data fetching"
  - "EditorShell: side-by-side layout with shared invitation state"
  - "EditorForm: accordion form with all invitation fields"
  - "EditorPreview: phone mockup rendering TemplateRenderer"
  - "TemplateSelector: thumbnail strip for template switching"
  - "useAutoSave hook: 800ms debounced PATCH with SaveStatus tracking"
  - "Wave 0 test stubs for 6 Phase 3 frontend components"
affects: [03-invitation-editor-core/03-04, 04-publish-share]

# Tech tracking
tech-stack:
  added: []
  patterns: [useAutoSave-debounce-hook, shared-local-state-for-realtime-preview, phone-mockup-css-frame]

key-files:
  created:
    - apps/web/app/(app)/thep-cuoi/[id]/page.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/EditorPreview.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/TemplateSelector.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/useAutoSave.ts
    - apps/web/__tests__/hooks/useAutoSave.test.ts
    - apps/web/__tests__/components/EditorForm.test.tsx
    - apps/web/__tests__/components/EditorPreview.test.tsx
    - apps/web/__tests__/components/TemplateSelector.test.tsx
    - apps/web/__tests__/components/templates.test.tsx
    - apps/web/__tests__/components/FullPreviewDialog.test.tsx
  modified: []

key-decisions:
  - "useRef for latestData in useAutoSave prevents stale closure in debounced callback"
  - "SaveStatus auto-resets to idle after 2s so indicator fades naturally"
  - "Preview renders from local useState, never re-fetches -- zero network delay"
  - "Phone mockup hidden on mobile, replaced with simple bordered preview"

patterns-established:
  - "useAutoSave pattern: debounced PATCH with ref-based latest data and SaveStatus enum"
  - "Editor page pattern: server component fetches data, client EditorShell manages local state"
  - "Phone mockup pattern: CSS-only bezel with notch, overflow-y-auto screen area"

requirements-completed: [EDIT-01, EDIT-02, EDIT-03, EDIT-08]

# Metrics
duration: 3min
completed: 2026-03-14
---

# Phase 3 Plan 3: Editor Page Summary

**Side-by-side editor with accordion form, phone mockup live preview, template selector, and 800ms debounced auto-save hook with 8 unit tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-14T22:33:11Z
- **Completed:** 2026-03-14T22:36:30Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments
- Complete editor page at /thep-cuoi/[id] with server-side invitation fetching and notFound() handling
- useAutoSave hook with 800ms debounce, useRef for stale closure prevention, SaveStatus tracking, and toast.error on failure -- 8 unit tests all passing
- EditorShell with responsive layout (side-by-side desktop, stacked mobile), auto-sidebar-collapse, and save status indicator
- EditorForm with 3 accordion sections (couple, ceremony, message) covering all Invitation fields with null/empty string conversion for date/time
- EditorPreview with CSS phone mockup frame rendering TemplateRenderer from live local state
- TemplateSelector with 3 gradient thumbnails and active ring state
- Wave 0 test stubs for 6 Phase 3 frontend components (21 it.todo() placeholders)

## Task Commits

Each task was committed atomically:

1. **Task 0: Wave 0 test stubs** - `e411e12` (test)
2. **Task 1: useAutoSave hook and page.tsx** - `44619fd` (feat)
3. **Task 2: EditorShell, EditorForm, EditorPreview, TemplateSelector** - `42d8d87` (feat)

**Plan metadata:** (pending) (docs: complete plan)

## Files Created/Modified
- `apps/web/app/(app)/thep-cuoi/[id]/page.tsx` - Server component fetching invitation data
- `apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx` - Client layout with shared state and sidebar collapse
- `apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx` - Accordion form with all invitation fields
- `apps/web/app/(app)/thep-cuoi/[id]/EditorPreview.tsx` - Phone mockup rendering TemplateRenderer
- `apps/web/app/(app)/thep-cuoi/[id]/TemplateSelector.tsx` - Thumbnail strip for template switching
- `apps/web/app/(app)/thep-cuoi/[id]/useAutoSave.ts` - 800ms debounced PATCH hook with status tracking
- `apps/web/__tests__/hooks/useAutoSave.test.ts` - 8 unit tests for useAutoSave
- `apps/web/__tests__/components/EditorForm.test.tsx` - Wave 0 test stub (5 todos)
- `apps/web/__tests__/components/EditorPreview.test.tsx` - Wave 0 test stub (2 todos)
- `apps/web/__tests__/components/TemplateSelector.test.tsx` - Wave 0 test stub (3 todos)
- `apps/web/__tests__/components/templates.test.tsx` - Wave 0 test stub (8 todos)
- `apps/web/__tests__/components/FullPreviewDialog.test.tsx` - Wave 0 test stub (3 todos)

## Decisions Made
- useRef for latestData in useAutoSave prevents stale closure in debounced callback -- the timer callback reads from ref, not the closure value
- SaveStatus auto-resets to idle after 2s so the "Da luu" indicator fades naturally without user interaction
- Preview renders from local useState (not API re-fetch) ensuring zero network delay for real-time feel
- Phone mockup hidden on mobile (<lg breakpoint) replaced with simple bordered preview for usability on small screens

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Editor page fully functional for Plan 03-04 (FullPreviewDialog, polish, E2E)
- Wave 0 test stubs ready for implementation in Plan 03-04
- All editor components export cleanly for Phase 4 publish/share integration

## Self-Check: PASSED

All 12 created files verified on disk. All 3 task commits (e411e12, 44619fd, 42d8d87) verified in git log.

---
*Phase: 03-invitation-editor-core*
*Completed: 2026-03-14*
