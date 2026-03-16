---
phase: 08-admin-panel
plan: 04
subsystem: ui
tags: [react, next.js, admin, themes, settings, payments, csv-export]

# Dependency graph
requires:
  - phase: 08-admin-panel
    provides: AdminModule with 21 API endpoints, SystemSettings/ThemeInfo types, system_settings table
  - phase: 07-monetization
    provides: Premium plan, payment_status, upgrade endpoints
provides:
  - Themes management page with toggle and inline metadata editing
  - Service plans configuration page with free vs premium comparison
  - System settings page with payment, watermark, expiry, and upload limits config
  - Enhanced payments page with refund marking, admin notes, and CSV export
  - apiUpload method parameter for PUT FormData uploads
affects: [admin-panel complete, end-to-end admin functionality]

# Tech tracking
tech-stack:
  added: []
  patterns: [inline card editing with edit/save/cancel, client-side CSV generation with BOM, expandable notes sections]

key-files:
  created:
    - apps/web/app/(admin)/admin/giao-dien/page.tsx
    - apps/web/app/(admin)/admin/goi-dich-vu/page.tsx
    - apps/web/app/(admin)/admin/cai-dat/page.tsx
  modified:
    - apps/web/app/(admin)/admin/thanh-toan/page.tsx
    - apps/web/lib/api.ts
    - apps/api/src/invitations/invitations.service.ts

key-decisions:
  - "apiUpload extended with optional method parameter for PUT FormData (theme thumbnail update)"
  - "CSV export uses BOM prefix for Excel UTF-8 compatibility with Vietnamese characters"
  - "Notes section uses expandable/collapsible pattern per history item to save vertical space"
  - "Theme placeholder colors match template identity (rose/sky/gray for traditional/modern/minimalist)"

patterns-established:
  - "Inline card editing: display mode with Edit button, edit mode with Save/Cancel, file input for thumbnails"
  - "Client-side CSV export: URL.createObjectURL + anchor click + revokeObjectURL pattern"
  - "Expandable notes: Set<string> tracking expanded IDs, per-item input state with Record<string, string>"

requirements-completed: [ADMN-05, ADMN-08, ADMN-09, ADMN-10]

# Metrics
duration: 4min
completed: 2026-03-16
---

# Phase 8 Plan 04: Remaining Admin Pages Summary

**Four admin pages: themes management with metadata editing, service plans config, system settings with bank QR upload, and enhanced payments with refund/notes/CSV export**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-16T05:37:51Z
- **Completed:** 2026-03-16T05:42:48Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Built themes management page with 3-column card grid, enable/disable toggles, and inline metadata editing (name, tag, thumbnail upload)
- Built service plans page showing free vs premium tier comparison with editable upload limits
- Built system settings page with 4 config sections: payment (bank QR upload), watermark, expiry, upload limits
- Enhanced payments page with refund marking, expandable admin notes, CSV export, and timeline-like status badges

## Task Commits

Each task was committed atomically:

1. **Task 1: Themes page + Service plans page** - `335f261` (feat)
2. **Task 2: System settings page** - `86ba3d8` (feat)
3. **Task 3: Enhanced payments with refund, notes, CSV** - `53c7378` (feat)

## Files Created/Modified
- `apps/web/app/(admin)/admin/giao-dien/page.tsx` - Themes management with toggle and inline metadata editing
- `apps/web/app/(admin)/admin/goi-dich-vu/page.tsx` - Service plans free vs premium comparison and limits editor
- `apps/web/app/(admin)/admin/cai-dat/page.tsx` - System settings with payment, watermark, expiry, upload limits
- `apps/web/app/(admin)/admin/thanh-toan/page.tsx` - Enhanced payments with refund, notes, CSV export
- `apps/web/lib/api.ts` - Added method parameter to apiUpload for PUT FormData
- `apps/api/src/invitations/invitations.service.ts` - Updated upgrade history query to include refunded items

## Decisions Made
- Extended apiUpload with optional method parameter rather than creating a separate apiPut function -- keeps the API surface minimal
- CSV export includes BOM prefix (\uFEFF) for proper Vietnamese character display in Excel
- Theme placeholder colors (rose/sky/gray) match template identity colors established in Phase 3
- Notes section uses expandable per-row pattern to keep history list scannable

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated adminListUpgradeHistory to include refunded items**
- **Found during:** Task 3
- **Issue:** The query `.or('plan.eq.premium,payment_status.eq.rejected')` did not include refunded items, so they would not appear in history
- **Fix:** Added `payment_status.eq.refunded` to the OR clause
- **Files modified:** apps/api/src/invitations/invitations.service.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 53c7378 (Task 3 commit)

**2. [Rule 3 - Blocking] Added method parameter to apiUpload for PUT requests**
- **Found during:** Task 1
- **Issue:** apiUpload hardcoded POST method but theme metadata update uses PUT endpoint
- **Fix:** Added optional `method` parameter defaulting to 'POST'
- **Files modified:** apps/web/lib/api.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 335f261 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes required for correct API communication. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 8 admin sidebar links now lead to fully functional pages
- Admin panel complete: dashboard, users, invitations, music, themes, service plans, payments, settings
- Ready for Phase 9 (polish and deployment preparation)

## Self-Check: PASSED

All 6 files verified present. All 3 task commits verified in git log.

---
*Phase: 08-admin-panel*
*Completed: 2026-03-16*
