---
phase: 09-polish-and-performance
plan: 01
subsystem: ui
tags: [animation, accessibility, css, framer-motion, performance, elderly-ux]

# Dependency graph
requires:
  - phase: 05-public-invitation-page
    provides: EnvelopeAnimation, MusicPlayer, template components
provides:
  - EnvelopeAnimationFallback CSS-only component for low-end devices
  - Performance gate measuring rAF frame times before animation
  - 56px music button with larger equalizer bars
  - 240px bank QR with Vietnamese instruction text in all templates
  - 48px minimum touch targets on public page
affects: [09-polish-and-performance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "rAF frame-time measurement for performance gating (8 frames, >20ms avg = fallback)"
    - "CSS-only animation fallback without framer-motion for low-end devices"

key-files:
  created:
    - apps/web/app/w/[slug]/EnvelopeAnimationFallback.tsx
  modified:
    - apps/web/app/w/[slug]/EnvelopeAnimation.tsx
    - apps/web/app/w/[slug]/MusicPlayer.tsx
    - apps/web/components/templates/TemplateTraditional.tsx
    - apps/web/components/templates/TemplateModern.tsx
    - apps/web/components/templates/TemplateMinimalist.tsx
    - apps/web/__tests__/components/EnvelopeAnimation.test.tsx

key-decisions:
  - "Performance gate uses rAF timestamps (not performance.now) for frame measurement accuracy"
  - "Static sealed envelope shown during measurement phase to avoid blank screen"
  - "Bank QR container widened to max-w-[280px] to accommodate 240px QR images"

patterns-established:
  - "Performance gate pattern: measure N rAF frames on mount, set useFallback state based on average"
  - "CSS-only fallback pattern: same visual structure using CSS transitions instead of framer-motion"

requirements-completed: [PUBL-10]

# Metrics
duration: 8min
completed: 2026-03-16
---

# Phase 9 Plan 01: Performance Gate and Elderly-Friendly UX Summary

**CSS-only envelope fallback with rAF performance gate, 56px music button, and 240px bank QR with Vietnamese instructions across all templates**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-16T07:26:00Z
- **Completed:** 2026-03-16T07:34:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created EnvelopeAnimationFallback component using pure CSS transitions (no framer-motion dependency)
- Added performance gate to EnvelopeAnimation that measures 8 rAF frame times and switches to fallback when average >20ms
- Increased music button to 56px (h-14 w-14) with wider equalizer bars (w-[4px]) and larger Play icon (h-6 w-6)
- Enlarged bank QR images from 140px to 240px with Vietnamese instruction text in all 3 templates
- Centered skip button at bottom with 48px+ touch target in both regular and fallback envelope

## Task Commits

Each task was committed atomically:

1. **Task 1: Performance gate and CSS-only fallback** - `c313fb4` (test: RED phase) + `09853a7` (feat: GREEN phase)
2. **Task 2: Elderly-friendly music player and bank QR** - `28a3657` (feat)

## Files Created/Modified
- `apps/web/app/w/[slug]/EnvelopeAnimationFallback.tsx` - CSS-only fallback envelope with fade transition
- `apps/web/app/w/[slug]/EnvelopeAnimation.tsx` - Added performance gate and fallback import
- `apps/web/app/w/[slug]/MusicPlayer.tsx` - 56px button, wider equalizer bars, larger play icon
- `apps/web/components/templates/TemplateTraditional.tsx` - 240px bank QR with Vietnamese instructions
- `apps/web/components/templates/TemplateModern.tsx` - 240px bank QR with Vietnamese instructions
- `apps/web/components/templates/TemplateMinimalist.tsx` - 240px bank QR with Vietnamese instructions
- `apps/web/__tests__/components/EnvelopeAnimation.test.tsx` - 17 tests covering performance gate and fallback

## Decisions Made
- Performance gate uses rAF callback timestamps (DOMHighResTimeStamp) rather than performance.now() for accurate frame time measurement
- Static sealed envelope shown during the measurement phase (useFallback === null) so user never sees a blank screen
- Bank QR container widened from max-w-[200px] to max-w-[280px] to accommodate larger 240px QR images with padding

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Git stash operation conflicted with .next build artifacts during pre-existing test verification, requiring re-application of Task 2 changes. No code was lost.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Envelope animation performance gate ready for real-device testing on low-end Android
- All elderly-friendly UX improvements applied consistently across templates
- Ready for Plan 02 (auto-expiry cron) and Plan 03 (desktop layout)

## Self-Check: PASSED

All 7 files verified present. All 3 commits verified in git log.

---
*Phase: 09-polish-and-performance*
*Completed: 2026-03-16*
