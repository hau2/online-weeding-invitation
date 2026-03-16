---
phase: 08-admin-panel
plan: 05
subsystem: api, ui
tags: [admin, revenue, music-tracks, dashboard, supabase]

# Dependency graph
requires:
  - phase: 08-admin-panel
    provides: "AdminStats interface, getStats(), listMusicTracks(), admin dashboard stat cards"
provides:
  - "Revenue stat (revenueTotal) in AdminStats and dashboard"
  - "Live music track usage counts from invitations table"
affects: [08-admin-panel, verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Live count aggregation via batched query + JS Map instead of stale DB column"
    - "Intl.NumberFormat vi-VN for Vietnamese currency formatting"

key-files:
  created: []
  modified:
    - packages/types/src/admin.ts
    - apps/api/src/admin/admin.service.ts
    - apps/web/app/(admin)/admin/page.tsx

key-decisions:
  - "Revenue computed as premiumCount * pricePerInvitation from system_settings (not stored separately)"
  - "Music track usage counts fetched as single batched query, grouped in JS Map (same pattern as deleteMusicTrack live count)"

patterns-established:
  - "Batched live count: single SELECT from invitations + JS grouping instead of N+1 queries or stale column"

requirements-completed: [ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09, ADMN-10]

# Metrics
duration: 2min
completed: 2026-03-16
---

# Phase 8 Plan 5: Gap Closure Summary

**Revenue stat card on admin dashboard with VND formatting, and live music track usage counts replacing stale DB column**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-16T06:23:24Z
- **Completed:** 2026-03-16T06:25:27Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added `revenueTotal` field to AdminStats interface, computed from premiumCount * pricePerInvitation
- Dashboard now shows 6 stat cards including "Doanh thu" (Revenue) with VND currency formatting
- Music library page now shows accurate live usage counts per track from invitations table
- Delete button correctly disabled for in-use tracks (existing frontend code, now fed correct data)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add revenue to AdminStats and fix getStats() to compute revenue** - `f5f4ee4` (feat)
2. **Task 2: Add revenue stat card to admin dashboard** - `bb8cd71` (feat)

## Files Created/Modified
- `packages/types/src/admin.ts` - Added revenueTotal field to AdminStats interface
- `apps/api/src/admin/admin.service.ts` - getStats() computes revenue from settings; listMusicTracks() uses live count query
- `apps/web/app/(admin)/admin/page.tsx` - Added Doanh thu stat card, updated grid to 6 columns

## Decisions Made
- Revenue computed as premiumCount * pricePerInvitation from system_settings payment_config (not stored in a separate column or table)
- Music track usage counts fetched via single batched query from invitations table with JS Map grouping -- follows same pattern as existing deleteMusicTrack() live count check
- Default pricePerInvitation fallback of 50000 VND if payment_config not found

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 8 verification gaps closed: revenue stat visible, music usage counts accurate
- Phase 8 moves from 3/5 to 5/5 verified truths
- Ready for Phase 9+ or Phase 10

## Self-Check: PASSED

All files exist. All commits verified (f5f4ee4, bb8cd71).

---
*Phase: 08-admin-panel*
*Completed: 2026-03-16*
