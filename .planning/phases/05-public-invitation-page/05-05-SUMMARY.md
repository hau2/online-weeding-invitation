---
phase: 05-public-invitation-page
plan: 05
subsystem: ui
tags: [howler.js, countdown, music-player, sanitization, flip-clock, vietnam-timezone]

# Dependency graph
requires:
  - phase: 05-public-invitation-page
    provides: InvitationShell component with envelope state management
provides:
  - MusicPlayer floating component with howler.js dynamic import
  - CountdownTimer flip-clock with Vietnam timezone
  - parseGuestName utility with XSS sanitization
affects: [05-public-invitation-page, 06-rsvp-gifting]

# Tech tracking
tech-stack:
  added: []
  patterns: [dynamic-import-howler, vietnam-timezone-offset, html-tag-stripping]

key-files:
  created:
    - apps/web/app/w/[slug]/MusicPlayer.tsx
    - apps/web/app/w/[slug]/CountdownTimer.tsx
    - apps/web/app/w/[slug]/utils.ts
  modified:
    - apps/web/app/globals.css
    - apps/web/__tests__/components/MusicPlayer.test.tsx
    - apps/web/__tests__/components/CountdownTimer.test.tsx
    - apps/web/__tests__/components/GuestName.test.tsx

key-decisions:
  - "Equalizer and flip keyframes in globals.css rather than styled-jsx for consistency with project CSS approach"
  - "parseGuestName in shared utils.ts (not inline in component) for reuse by EnvelopeAnimation and InvitationShell"
  - "FlipCard sub-component with CSS perspective for 3D digit flip on value change"

patterns-established:
  - "Dynamic import('howler') pattern: avoids SSR issues, adds Howler.ctx.resume() for WKWebView"
  - "Vietnam timezone via explicit +07:00 offset string: reliable without Intl timezone support"
  - "HTML tag stripping via regex for client-side input sanitization"

requirements-completed: [PUBL-05, PUBL-07, PUBL-08]

# Metrics
duration: 4min
completed: 2026-03-15
---

# Phase 5 Plan 05: Interactive Features Summary

**Floating music player with howler.js, flip-clock countdown timer with Vietnam timezone, and guest name parsing with XSS sanitization**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T13:12:20Z
- **Completed:** 2026-03-15T13:16:38Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- MusicPlayer with floating 48px button, equalizer bars animation, and howler.js dynamic import with WKWebView compatibility
- CountdownTimer flip-clock showing days/hours/minutes/seconds with template-aware styling and Vietnam timezone
- parseGuestName utility with HTML stripping, whitespace trimming, and 50-char truncation
- Full TDD coverage: 17 tests across 3 test files (6 MusicPlayer + 5 CountdownTimer + 6 GuestName)

## Task Commits

Each task was committed atomically (TDD: test then feat):

1. **Task 1: MusicPlayer floating button with howler.js**
   - `ab7eaf1` (test) - Failing tests for floating button, no autoplay, toggle, aria-label
   - `e8c0347` (feat) - MusicPlayer implementation with howler.js dynamic import

2. **Task 2: CountdownTimer flip-clock and guest name parsing**
   - `ed5a45e` (test) - Failing tests for countdown timer and parseGuestName
   - `31c8cb5` (feat) - CountdownTimer and parseGuestName utility implementation

## Files Created/Modified
- `apps/web/app/w/[slug]/MusicPlayer.tsx` - Floating music player with howler.js, equalizer bars, play/pause toggle
- `apps/web/app/w/[slug]/CountdownTimer.tsx` - Flip-clock countdown with template-aware styling and Vietnam timezone
- `apps/web/app/w/[slug]/utils.ts` - parseGuestName utility with sanitization
- `apps/web/app/globals.css` - Added equalizer and flip keyframe animations
- `apps/web/__tests__/components/MusicPlayer.test.tsx` - 6 tests for MusicPlayer
- `apps/web/__tests__/components/CountdownTimer.test.tsx` - 5 tests for CountdownTimer
- `apps/web/__tests__/components/GuestName.test.tsx` - 6 tests for parseGuestName

## Decisions Made
- Equalizer and flip keyframes placed in globals.css rather than styled-jsx to match project's CSS-first approach (Tailwind v4)
- parseGuestName extracted to shared `utils.ts` for reuse by both EnvelopeAnimation and InvitationShell
- FlipCard sub-component uses CSS perspective for 3D depth effect on digit changes
- Template-aware countdown styling: gold text on dark (traditional), white on gray (modern), dark on light (minimalist)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Pre-existing test failures (3):** InvitationContent.test.tsx fails because Plan 05-04 updated InvitationShell to use `useSearchParams()` but the test doesn't mock it. Logged to deferred-items.md. Not caused by Plan 05-05 changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- MusicPlayer ready for integration with InvitationShell (autoStart wired to envelope open state)
- CountdownTimer ready for embedding in template content flow
- parseGuestName available for personalized greeting display
- Plan 05-06 can wire these components into the full page assembly

## Self-Check: PASSED

All 7 created/modified files verified present. All 4 commit hashes (ab7eaf1, e8c0347, ed5a45e, 31c8cb5) verified in git log.

---
*Phase: 05-public-invitation-page*
*Completed: 2026-03-15*
