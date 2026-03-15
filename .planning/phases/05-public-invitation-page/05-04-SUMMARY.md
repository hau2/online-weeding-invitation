---
phase: 05-public-invitation-page
plan: 04
subsystem: ui
tags: [framer-motion, css-animation, canvas-confetti, envelope, petals]

# Dependency graph
requires:
  - phase: 05-03
    provides: InvitationShell with envelopeOpened state placeholder
provides:
  - EnvelopeAnimation component with multi-stage framer-motion reveal
  - FallingPetals CSS-only overlay with template-specific colors
  - Guest name personalization via ?to= query parameter
affects: [05-05-music-player, 05-06-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [framer-motion useAnimation orchestration, deterministic PRNG for SSR-safe random values, CSS keyframes GPU-accelerated animation]

key-files:
  created:
    - apps/web/app/w/[slug]/EnvelopeAnimation.tsx
    - apps/web/app/w/[slug]/FallingPetals.tsx
  modified:
    - apps/web/app/w/[slug]/InvitationShell.tsx
    - apps/web/__tests__/components/EnvelopeAnimation.test.tsx

key-decisions:
  - "window.location.search for ?to= parsing instead of useSearchParams -- avoids Next.js router dependency in tests and keeps guest name purely client-side"
  - "Deterministic seeded PRNG for petal randomization -- prevents React hydration mismatch from Math.random()"
  - "Unicode U+56CD for traditional wax seal, heart for modern/minimalist"

patterns-established:
  - "Seeded PRNG pattern: use deterministic pseudo-random values for SSR-compatible randomized UI elements"
  - "framer-motion useAnimation: orchestrate multi-stage animations with sequential await on controls.start()"

requirements-completed: [PUBL-03, PUBL-04, PUBL-10]

# Metrics
duration: 4min
completed: 2026-03-15
---

# Phase 5 Plan 04: Envelope Animation & Falling Petals Summary

**Multi-stage envelope reveal with framer-motion orchestration and CSS-only falling petals overlay**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T13:12:24Z
- **Completed:** 2026-03-15T13:16:38Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- EnvelopeAnimation with sealed state, flap lift, card slide, envelope fade, and confetti burst
- Template-specific envelope colors (red/gold traditional, white/rose modern, cream/ivory minimalist)
- Wax seal with double-happiness character or heart, skip button with 44px+ tap target
- Guest name personalization via ?to= URL parameter with HTML sanitization
- FallingPetals with 18 CSS-animated petals using deterministic PRNG for consistent SSR
- Performance gate measuring frame times and halving confetti particles if frames exceed 20ms
- 11 comprehensive tests for EnvelopeAnimation, all passing

## Task Commits

Each task was committed atomically:

1. **Task 1: EnvelopeAnimation component (TDD)**
   - `d42dec5` test(05-04): add failing tests for EnvelopeAnimation component
   - `d1b4422` feat(05-04): implement EnvelopeAnimation with framer-motion orchestration
2. **Task 2: FallingPetals CSS-only overlay** - `ebccd4f` feat(05-04): add FallingPetals CSS-only overlay with template colors

## Files Created/Modified
- `apps/web/app/w/[slug]/EnvelopeAnimation.tsx` - Multi-stage envelope reveal with framer-motion, confetti, skip button
- `apps/web/app/w/[slug]/FallingPetals.tsx` - CSS-only petal overlay with template-specific colors
- `apps/web/app/w/[slug]/InvitationShell.tsx` - Wired EnvelopeAnimation replacing placeholder button, added ?to= guest name parsing
- `apps/web/__tests__/components/EnvelopeAnimation.test.tsx` - 11 tests covering sealed state, colors, guest name, skip, wax seal

## Decisions Made
- Used `window.location.search` instead of Next.js `useSearchParams()` for ?to= parsing -- avoids router context dependency in tests and keeps guest name processing purely client-side as specified
- Used deterministic seeded PRNG (seed=42, LCG algorithm) for petal randomization to prevent React hydration mismatch from `Math.random()` during SSR
- Used Unicode U+56CD (double happiness) for traditional template wax seal, heart symbol for modern/minimalist

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed InvitationShell searchParams null in tests**
- **Found during:** Task 2 (FallingPetals)
- **Issue:** useSearchParams() returns null in test environment without Next.js router context, breaking 3 existing InvitationContent tests
- **Fix:** Replaced useSearchParams() with window.location.search for client-side ?to= parsing
- **Files modified:** apps/web/app/w/[slug]/InvitationShell.tsx
- **Verification:** All 75 tests pass
- **Committed in:** ebccd4f (Task 2 commit)

**2. [Rule 1 - Bug] Replaced Math.random() with deterministic PRNG in FallingPetals**
- **Found during:** Task 2 (FallingPetals)
- **Issue:** Math.random() during render causes React hydration mismatch between server and client
- **Fix:** Implemented seeded PRNG with pre-computed values at module level
- **Files modified:** apps/web/app/w/[slug]/FallingPetals.tsx
- **Verification:** Component renders consistently without hydration warnings
- **Committed in:** ebccd4f (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bug fixes)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- EnvelopeAnimation ready for integration with MusicPlayer (Plan 05-05) -- onOpen callback triggers music start
- FallingPetals ready for integration into InvitationShell (Plan 05-06) -- enabled prop controls visibility
- All components exported and tested

## Self-Check: PASSED

All files verified present. All commit hashes verified in git log.

---
*Phase: 05-public-invitation-page*
*Completed: 2026-03-15*
