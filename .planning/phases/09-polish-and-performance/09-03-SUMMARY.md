---
phase: 09-polish-and-performance
plan: 03
subsystem: ui
tags: [desktop-frame, floral-decorations, bundle-analyzer, performance, falling-petals]

# Dependency graph
requires:
  - phase: 09-01
    provides: performance gate, elderly UX improvements, CSS fallback
provides:
  - DesktopFrame component with template-specific floral decorations for desktop viewports
  - Bundle analyzer integration for page weight verification
  - FallingPetals running throughout entire invitation (envelope + revealed)
affects: [10-agent-tier]

# Tech tracking
tech-stack:
  added: ["@next/bundle-analyzer"]
  patterns: ["DesktopFrame wrapper with hidden md:block decorations", "FRAME_COLORS record per templateId"]

key-files:
  created:
    - apps/web/app/w/[slug]/DesktopFrame.tsx
  modified:
    - apps/web/app/w/[slug]/InvitationShell.tsx
    - apps/web/next.config.ts

key-decisions:
  - "FallingPetals runs during both envelope and revealed stages per user request (overrides original plan to stop after reveal)"
  - "DesktopFrame uses inline SVG botanical art with soft opacity gradients for watercolor floral feel"
  - "Bundle analyzer gated behind ANALYZE=true env var, not active in normal builds"

patterns-established:
  - "FRAME_COLORS record: template-specific color palette for frame decorations (same pattern as TEMPLATE_COLORS)"
  - "DesktopFrame wraps all InvitationShell content for consistent desktop presentation"

requirements-completed: [PUBL-10]

# Metrics
duration: 5min
completed: 2026-03-16
---

# Phase 9 Plan 03: Desktop Frame and Bundle Analyzer Summary

**DesktopFrame with template-specific floral corners/vine borders for desktop viewports, @next/bundle-analyzer for page weight verification, and FallingPetals continuing throughout entire invitation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-16T07:30:00Z
- **Completed:** 2026-03-16T07:35:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- DesktopFrame component renders decorative floral corners and vine borders on md+ breakpoints with template-specific color palettes
- Desktop shows centered 480px card with decorative frame; mobile shows full-width layout unchanged
- FallingPetals now runs throughout entire invitation (both envelope and revealed stages) per user feedback
- Base text size set to 16px on public invitation page for elderly readability
- @next/bundle-analyzer installed and wired into next.config.ts behind ANALYZE=true flag
- Production build verified successfully

## Task Commits

Each task was committed atomically:

1. **Task 1: Desktop frame component and InvitationShell wiring** - `4e8e875` (feat)
2. **Task 2: Bundle analyzer setup and page weight verification** - `d79b4d4` (chore)
3. **Task 3: Visual verification - FallingPetals change** - `4feb665` (feat)

**Plan metadata:** [pending] (docs: complete plan)

## Files Created/Modified
- `apps/web/app/w/[slug]/DesktopFrame.tsx` - Decorative floral frame wrapper for desktop viewports with FRAME_COLORS per template
- `apps/web/app/w/[slug]/InvitationShell.tsx` - Wrapped in DesktopFrame, text-base class, FallingPetals in both stages
- `apps/web/next.config.ts` - Bundle analyzer integration with ANALYZE=true toggle

## Decisions Made
- FallingPetals runs during both envelope and revealed stages per user request during visual checkpoint (overrides original plan to stop after reveal for GPU savings)
- DesktopFrame uses inline SVG with soft opacity gradients for botanical watercolor feel
- Bundle analyzer gated behind ANALYZE=true environment variable, not active in normal builds
- Static import for DesktopFrame (CSS-only, no heavy JS requiring dynamic import)

## Deviations from Plan

### User-Requested Changes

**1. FallingPetals continues in revealed stage**
- **Found during:** Task 3 (visual verification checkpoint)
- **Issue:** Original plan specified petals stop/unmount after envelope reveal to reduce GPU load
- **Change:** User requested petals continue throughout invitation for better visual effect
- **Fix:** Added FallingPetals component to revealed stage content wrapper in addition to envelope stage
- **Files modified:** apps/web/app/w/[slug]/InvitationShell.tsx
- **Committed in:** 4feb665

---

**Total deviations:** 1 user-requested change
**Impact on plan:** Minor scope change from user feedback. Petals now run in both stages instead of only envelope stage.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 9 (Polish and Performance) is fully complete
- All three plans delivered: performance gate with CSS fallback (09-01), auto-expiry cron (09-02), desktop frame and bundle analyzer (09-03)
- Ready for Phase 10 (Agent Tier and Storage Management) if planned

## Self-Check: PASSED

All files verified present: DesktopFrame.tsx, InvitationShell.tsx, next.config.ts, 09-03-SUMMARY.md
All commits verified: 4e8e875, d79b4d4, 4feb665

---
*Phase: 09-polish-and-performance*
*Completed: 2026-03-16*
