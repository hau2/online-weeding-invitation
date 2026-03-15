---
phase: 04-media-upload-pipeline
plan: 02
subsystem: ui
tags: [dnd-kit, howler, react, next-image, drag-drop, file-upload, accordion, music-preview]

# Dependency graph
requires:
  - phase: 04-media-upload-pipeline
    provides: "Upload endpoints (photos, bank-qr, photo-order, music-tracks), apiUpload utility, Invitation type with media fields"
  - phase: 03-invitation-editor-core
    provides: "EditorForm accordion structure, EditorShell state management, useAutoSave hook"
provides:
  - "PhotoGallery component with drag-drop reorder via @dnd-kit, file upload, delete, 10-photo limit"
  - "MusicPicker component with howler.js 30-sec preview, track selection toggle"
  - "BankQrUpload component with single image upload, bank name and account holder fields"
  - "EditorForm expanded to 6 accordion sections integrating all media components"
affects: [05-public-invitation-page]

# Tech tracking
tech-stack:
  added: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities", "howler", "@types/howler"]
  patterns: ["Dynamic import for howler.js (SSR-safe)", "Native drag events for file drop zone + dnd-kit for sortable reorder (separate concerns)", "SortableContext with URL strings as IDs", "useRef for Howl instance to avoid state serialization issues"]

key-files:
  created:
    - "apps/web/app/(app)/thep-cuoi/[id]/PhotoGallery.tsx"
    - "apps/web/app/(app)/thep-cuoi/[id]/MusicPicker.tsx"
    - "apps/web/app/(app)/thep-cuoi/[id]/BankQrUpload.tsx"
  modified:
    - "apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx"
    - "apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx"
    - "apps/web/package.json"

key-decisions:
  - "Dynamic import('howler') instead of top-level import to avoid SSR/Node.js Audio context errors"
  - "Native drag events (onDrop/onDragOver) for file drops, dnd-kit for thumbnail reorder -- separate concerns, no conflict"
  - "Photo URLs used directly as dnd-kit sortable IDs (each URL is unique within an invitation)"
  - "MusicPicker uses useRef for Howl instance and timeout to prevent memory leaks and stale closures"
  - "Reorder optimistically updates UI then PATCHes to dedicated photo-order endpoint; reverts on error"

patterns-established:
  - "File drop zone overlay pattern: track dragOver state, show overlay text, reset on leave/drop"
  - "Sortable grid pattern: DndContext + SortableContext + useSortable + arrayMove for drag-to-reorder"
  - "Audio preview pattern: dynamic Howl import, useRef for instance, 30-sec timeout, cleanup on unmount"

requirements-completed: [EDIT-04, EDIT-06, EDIT-07]

# Metrics
duration: 5min
completed: 2026-03-15
---

# Phase 4 Plan 02: Media Editor Components Summary

**PhotoGallery with dnd-kit drag-reorder, MusicPicker with howler.js 30-sec preview, BankQrUpload with bank info fields, integrated as 6-section EditorForm accordion**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-15T02:20:46Z
- **Completed:** 2026-03-15T02:25:31Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- PhotoGallery with sortable thumbnail grid (3 cols), drag handle, delete button, file upload via click/drag-drop, "Tha anh vao day" overlay, upload spinner, 10-photo limit
- Photo reorder calls dedicated PATCH :id/photo-order endpoint with optimistic UI update and error rollback
- MusicPicker fetches system tracks, renders play/pause with howler.js dynamic import, 30-sec auto-stop, toggle selection, animated equalizer indicator
- BankQrUpload handles single image upload with preview, "Ten ngan hang" and "Chu tai khoan" text inputs auto-saving via onChange
- EditorForm expanded from 3 to 6 accordion sections numbered 1/6 through 6/6
- EditorShell passes invitationId to EditorForm for direct upload API calls

## Task Commits

Each task was committed atomically:

1. **Task 1: PhotoGallery component with drag-drop reorder, upload, and delete** - `04b0431` (feat)
2. **Task 2: MusicPicker, BankQrUpload components, and EditorForm integration** - `5794f02` (feat)

## Files Created/Modified
- `apps/web/app/(app)/thep-cuoi/[id]/PhotoGallery.tsx` - Sortable photo grid with upload, delete, reorder, drop zone overlay
- `apps/web/app/(app)/thep-cuoi/[id]/MusicPicker.tsx` - System music track list with howler.js preview and selection
- `apps/web/app/(app)/thep-cuoi/[id]/BankQrUpload.tsx` - Single QR image upload with bank name and account holder fields
- `apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx` - 6-section accordion form with 3 existing + 3 new media sections
- `apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx` - Passes invitationId prop to EditorForm
- `apps/web/package.json` - Added @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities, howler, @types/howler
- `pnpm-lock.yaml` - Updated lockfile

## Decisions Made
- Dynamic `import('howler')` instead of top-level import to avoid SSR/Node.js Audio context errors in Next.js
- Native drag events (onDrop/onDragOver) for file drops, dnd-kit for thumbnail reorder -- separate concerns, no conflict
- Photo URLs used directly as dnd-kit sortable IDs (each URL is unique within an invitation)
- MusicPicker uses useRef for Howl instance and timeout to prevent memory leaks and stale closures
- Reorder optimistically updates UI then PATCHes to dedicated photo-order endpoint; reverts on error

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Re-added packages removed by pnpm during dependency resolution**
- **Found during:** Task 1 (dependency installation)
- **Issue:** pnpm add for new packages removed existing dependencies (canvas-confetti, recharts, next-themes, and all devDependencies) from the lockfile
- **Fix:** Re-added all removed packages with explicit pnpm add commands
- **Files modified:** apps/web/package.json, pnpm-lock.yaml
- **Verification:** TypeScript compiles cleanly, all 37 tests pass
- **Committed in:** 04b0431 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Package manager artifact -- no scope creep.

## Issues Encountered
- Pre-existing TS errors in test files (vitest/testing-library not in tsc path) and middleware.test.ts (TS2367 type comparison) -- not caused by this plan's changes, left as-is

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 3 media editor components ready for visual testing in the invitation editor
- Template components need extending in Plan 03 to render photos, music player, and bank QR on the public invitation page
- No system music tracks exist yet in the database -- admin needs to seed tracks for MusicPicker to display

## Self-Check: PASSED

All files verified present. Both task commits (04b0431, 5794f02) confirmed in git history.
