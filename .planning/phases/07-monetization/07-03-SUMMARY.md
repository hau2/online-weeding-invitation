---
phase: 07-monetization
plan: 03
subsystem: ui
tags: [nextjs, react, monetization, upgrade-flow, admin-panel, payments]

# Dependency graph
requires:
  - phase: 07-monetization
    provides: "InvitationPlan/PaymentStatus types, plan/paymentStatus fields, upgrade/admin API endpoints"
  - phase: 02-app-shell
    provides: "AdminSidebar with thanh-toan route, base-ui Button, dashboard layout"
  - phase: 03-invitation-editor-core
    provides: "EditorShell topbar, InvitationCard, StatusBadge components"
provides:
  - "UpgradeButton component for editor topbar"
  - "Upgrade page at /nang-cap/[id] with price, benefits, bank QR, payment button"
  - "Plan/payment badges on InvitationCard (Premium, Cho xac nhan, Tu choi)"
  - "Nang cap button on InvitationCard for free invitations"
  - "Admin payments page at /admin/thanh-toan with approve/reject"
  - "Admin upgrade history endpoint and UI"
  - "AdminGuard fix for app_role JWT field"
affects: [08-admin-panel]

# Tech tracking
tech-stack:
  added: []
  patterns: ["env-var based admin bank QR config for Phase 7 (before System Settings in Phase 8)", "plan-aware conditional rendering in editor topbar and dashboard cards"]

key-files:
  created:
    - "apps/web/app/(app)/thep-cuoi/[id]/UpgradeButton.tsx"
    - "apps/web/app/(app)/nang-cap/[id]/page.tsx"
    - "apps/web/app/(admin)/admin/thanh-toan/page.tsx"
  modified:
    - "apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx"
    - "apps/web/components/app/InvitationCard.tsx"
    - "apps/api/src/auth/guards/admin.guard.ts"
    - "apps/api/src/invitations/invitations.service.ts"
    - "apps/api/src/invitations/invitations.controller.ts"

key-decisions:
  - "UpgradeButton shows disabled amber badge for pending state, gradient button for upgrade action"
  - "Plan badges rendered inline in InvitationCard header, not extending StatusBadge (separate concerns)"
  - "Upgrade page uses env vars (NEXT_PUBLIC_ADMIN_BANK_QR/NAME/HOLDER) for admin bank info -- Phase 8 will add admin UI for these"
  - "AdminGuard fixed to check app_role instead of role -- Supabase JWT role is 'authenticated', app_role is 'admin'"
  - "Admin upgrade-history endpoint added to support history section on payments page"

patterns-established:
  - "Env-var-based admin config: NEXT_PUBLIC_ADMIN_BANK_QR, NEXT_PUBLIC_ADMIN_BANK_NAME, NEXT_PUBLIC_ADMIN_BANK_HOLDER"
  - "Plan-aware UI rendering: check invitation.plan and invitation.paymentStatus for conditional display"

requirements-completed: [PLAN-03, PLAN-04]

# Metrics
duration: 7min
completed: 2026-03-16
---

# Phase 7 Plan 03: Upgrade Flow UI and Admin Payments Summary

**Upgrade button in editor/dashboard, upgrade page with bank QR and payment request, admin payments page with approve/reject workflow**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-16T04:04:50Z
- **Completed:** 2026-03-16T04:12:35Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- UpgradeButton in editor topbar shows gradient "Nang cap" button for free invitations, amber "Cho xac nhan" badge when pending
- InvitationCard displays plan badges (Premium purple, Cho xac nhan amber, Tu choi red) and "Nang cap" action button
- Upgrade page at /nang-cap/[id] shows price (99.000 VND), benefits list, admin bank QR, transfer instructions, and "Toi da thanh toan" button
- Admin payments page at /admin/thanh-toan lists pending upgrade requests with approve/reject actions and upgrade history
- AdminGuard fixed to check app_role instead of role for correct JWT validation

## Task Commits

Each task was committed atomically:

1. **Task 1: Upgrade page + UpgradeButton + InvitationCard/StatusBadge updates** - `f562f55` (feat)
2. **Task 2: Admin payments page at /admin/thanh-toan** - `1227155` (feat)

## Files Created/Modified
- `apps/web/app/(app)/thep-cuoi/[id]/UpgradeButton.tsx` - Editor topbar upgrade button (plan-aware, links to upgrade page)
- `apps/web/app/(app)/nang-cap/[id]/page.tsx` - Upgrade page with price, benefits, admin bank QR, payment request button
- `apps/web/app/(admin)/admin/thanh-toan/page.tsx` - Admin payments page listing pending upgrades with approve/reject
- `apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx` - Added UpgradeButton to topbar between spacer and preview buttons
- `apps/web/components/app/InvitationCard.tsx` - Added plan/payment badges and Nang cap button
- `apps/api/src/auth/guards/admin.guard.ts` - Fixed to check app_role instead of role
- `apps/api/src/invitations/invitations.service.ts` - Added adminListUpgradeHistory method
- `apps/api/src/invitations/invitations.controller.ts` - Added admin/upgrade-history GET endpoint

## Decisions Made
- UpgradeButton uses gradient (amber-to-rose) styling for prominence, amber badge for pending state -- visually distinct from other topbar buttons
- Plan badges are inline spans in InvitationCard, not extending StatusBadge -- StatusBadge is specifically for InvitationStatus, plan/payment are separate concerns
- Upgrade page uses env vars (NEXT_PUBLIC_ADMIN_BANK_QR, NEXT_PUBLIC_ADMIN_BANK_NAME, NEXT_PUBLIC_ADMIN_BANK_HOLDER) for admin bank info -- simple configuration before Phase 8 System Settings UI
- AdminGuard fixed from checking `user.role` (which is 'authenticated' from Supabase) to `user.app_role` (which is 'admin') -- this was a latent bug that would have blocked all admin API calls

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] AdminGuard checking wrong JWT field**
- **Found during:** Task 2 (Admin payments page)
- **Issue:** AdminGuard checked `user.role` which is 'authenticated' (Supabase default), not 'admin'. The correct field is `user.app_role`.
- **Fix:** Changed `user.role !== 'admin'` to `user.app_role !== 'admin'` in admin.guard.ts
- **Files modified:** apps/api/src/auth/guards/admin.guard.ts
- **Verification:** API build passes, type check correct
- **Committed in:** 1227155 (Task 2 commit)

**2. [Rule 2 - Missing Critical] Admin upgrade history endpoint**
- **Found during:** Task 2 (Admin payments page)
- **Issue:** Plan specified showing upgrade history on admin page, but no API endpoint existed to fetch it
- **Fix:** Added `adminListUpgradeHistory()` service method and `GET admin/upgrade-history` controller route
- **Files modified:** apps/api/src/invitations/invitations.service.ts, apps/api/src/invitations/invitations.controller.ts
- **Verification:** API build passes
- **Committed in:** 1227155 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug fix, 1 missing critical)
**Impact on plan:** Both fixes necessary for correct admin functionality. AdminGuard bug would have blocked all admin operations. History endpoint needed for complete admin payments UI. No scope creep.

## Issues Encountered
None

## User Setup Required
For the upgrade page to show bank QR and info, set these environment variables:
- `NEXT_PUBLIC_ADMIN_BANK_QR` - URL to admin bank QR image
- `NEXT_PUBLIC_ADMIN_BANK_NAME` - Bank name (e.g., "Vietcombank")
- `NEXT_PUBLIC_ADMIN_BANK_HOLDER` - Account holder name

Without these, the upgrade page shows placeholder text.

## Next Phase Readiness
- Complete upgrade user journey functional: free invitation -> Nang cap button -> upgrade page -> payment request -> admin approval
- Admin payments section ready with pending list and history
- Phase 8 (Admin Panel) can replace env vars with admin-configurable System Settings

## Self-Check: PASSED

---
*Phase: 07-monetization*
*Completed: 2026-03-16*
