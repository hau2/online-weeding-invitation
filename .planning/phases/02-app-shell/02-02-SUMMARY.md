---
phase: 02-app-shell
plan: 02
subsystem: ui
tags: [react, framer-motion, cva, shadcn-ui, dashboard, invitation-card, create-wizard, vitest]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Tailwind v4 rose palette, Be Vietnam Pro font, shadcn/ui base setup, auth-token cookie pattern"
  - phase: 02-app-shell
    plan: 01
    provides: "Route groups, middleware auth guard, SidebarProvider + AppSidebar layout, Vitest web config"
  - phase: 02-app-shell
    plan: 04
    provides: "NestJS GET/POST /invitations endpoints with ownership enforcement"
provides:
  - "Dashboard page (Server Component) that fetches invitation list from NestJS API"
  - "InvitationCard with status badge, edit link, view-page button (NO QR)"
  - "InvitationGrid with framer-motion stagger animation (70ms between cards)"
  - "StatusBadge with cva variants: draft/gray, published/green, expired/red"
  - "EmptyState with wedding envelope SVG illustration and CTA"
  - "CreateWizard 2-step dialog: template picker then couple names, POST /invitations"
  - "DashboardClient wrapper managing wizard open state"
affects: [03-invitation-editor, 05-public-page]

# Tech tracking
tech-stack:
  added: []
  patterns: ["cva status badge variants", "framer-motion Variants type annotation for staggerChildren", "base-ui render prop with nativeButton={false} for Link-as-Button", "Server Component fetch with auth-token cookie forwarding"]

key-files:
  created:
    - apps/web/components/app/StatusBadge.tsx
    - apps/web/components/app/InvitationCard.tsx
    - apps/web/components/app/InvitationGrid.tsx
    - apps/web/components/app/EmptyState.tsx
    - apps/web/components/app/CreateWizard.tsx
    - apps/web/components/app/DashboardClient.tsx
    - apps/web/__tests__/components/InvitationCard.test.tsx
    - apps/web/__tests__/components/InvitationGrid.test.tsx
    - apps/web/__tests__/components/CreateWizard.test.tsx
  modified:
    - apps/web/app/(app)/dashboard/page.tsx
    - apps/web/vitest.config.ts

key-decisions:
  - "Cookie name adapted to auth-token (Phase 1 pattern) instead of plan's session cookie"
  - "base-ui render prop with nativeButton={false} for Button rendered as Link -- avoids console warning"
  - "framer-motion Variants type annotation required for ease property -- plain object widens string to non-assignable type"

patterns-established:
  - "cva badge variants: define LABELS record + cva variants object for Vietnamese status labels"
  - "Server Component data fetching: cookies() -> forward auth-token to NestJS API"
  - "Client/Server split: Server Component fetches data, passes to 'use client' DashboardClient for interactivity"

requirements-completed: [DASH-01, DASH-02, DASH-03]

# Metrics
duration: 7min
completed: 2026-03-14
---

# Phase 2 Plan 02: Dashboard Page and Components Summary

**Invitation card grid dashboard with cva status badges, framer-motion stagger animation, empty state CTA, and 2-step CreateWizard dialog**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-14T15:50:48Z
- **Completed:** 2026-03-14T15:58:04Z
- **Tasks:** 2 (both TDD: RED + GREEN)
- **Files modified:** 11

## Accomplishments
- Dashboard page fetches invitations from NestJS API via Server Component with auth-token cookie forwarding
- InvitationCard renders couple names, wedding date, template SVG thumbnail, status badge, edit + view-page buttons (NO QR button)
- InvitationGrid uses framer-motion staggerChildren (70ms) for fade+slide-up card entrance animation
- StatusBadge with cva variants renders Vietnamese labels: Nhap (gray), Da xuat ban (green), Het han (red)
- EmptyState with wedding envelope SVG illustration and "Tao thiep cuoi dau tien cua ban" CTA
- CreateWizard 2-step dialog: step 1 picks template (3 options), step 2 enters couple names, POST /invitations, redirect to editor
- 17 new component tests (29 total including middleware tests) all passing

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: StatusBadge, InvitationCard, InvitationGrid tests** - `348b192` (test)
2. **Task 1 GREEN: StatusBadge, InvitationCard, InvitationGrid, EmptyState components** - `97c0bdf` (feat)
3. **Task 2 RED: CreateWizard tests** - `c730cd8` (test)
4. **Task 2 GREEN: CreateWizard, DashboardClient, Dashboard page** - `60d61ae` (feat)

## Files Created/Modified
- `apps/web/components/app/StatusBadge.tsx` - cva-based status badge with 3 Vietnamese label variants
- `apps/web/components/app/InvitationCard.tsx` - Single invitation card with template SVG, status, actions
- `apps/web/components/app/InvitationGrid.tsx` - framer-motion stagger container for card grid
- `apps/web/components/app/EmptyState.tsx` - Wedding envelope SVG illustration with CTA button
- `apps/web/components/app/CreateWizard.tsx` - 2-step dialog: template picker then couple names form
- `apps/web/components/app/DashboardClient.tsx` - Client wrapper with wizard state and create button
- `apps/web/app/(app)/dashboard/page.tsx` - Server Component fetching from NestJS API
- `apps/web/__tests__/components/InvitationCard.test.tsx` - 10 tests for StatusBadge + InvitationCard
- `apps/web/__tests__/components/InvitationGrid.test.tsx` - 3 tests for grid rendering + empty state
- `apps/web/__tests__/components/CreateWizard.test.tsx` - 4 tests for wizard steps
- `apps/web/vitest.config.ts` - Added @repo/types alias for test resolution

## Decisions Made

1. **Cookie name adapted to auth-token:** Plan specified `session` cookie, but Phase 1 established `auth-token` as the cookie name. Used `auth-token` for consistency with existing middleware and auth flow.

2. **base-ui render prop with nativeButton={false}:** When rendering Button as a Link (for edit action), the `@base-ui/react` Button warns about non-button elements. Adding `nativeButton={false}` suppresses the warning correctly.

3. **framer-motion Variants type annotation:** The plain object `{ ease: 'easeOut' }` widens `ease` to `string`, which is not assignable to framer-motion's `Easing` type. Annotating the variants with `Variants` type resolves this.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] framer-motion Variants type error on ease property**
- **Found during:** Task 2 (build verification)
- **Issue:** `ease: 'easeOut'` in plain object widened to `string` type, not assignable to framer-motion's `Easing` union type
- **Fix:** Added `Variants` type import and annotation on container/item objects
- **Files modified:** apps/web/components/app/InvitationGrid.tsx
- **Verification:** `pnpm --filter web build` exits 0
- **Committed in:** 60d61ae (Task 2 commit)

**2. [Rule 3 - Blocking] base-ui Button render prop requires nativeButton={false}**
- **Found during:** Task 1 (test run showed console warning)
- **Issue:** Button with `render={<Link />}` triggers base-ui warning about non-native button
- **Fix:** Added `nativeButton={false}` prop to Button when used with render prop
- **Files modified:** apps/web/components/app/InvitationCard.tsx
- **Verification:** Warning eliminated, tests pass clean
- **Committed in:** 97c0bdf (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for clean build and test output. No scope creep.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Dashboard page fully functional: card grid, empty state, create wizard
- Ready for Phase 3 invitation editor (edit links point to /thep-cuoi/[id])
- View-page buttons ready for Phase 5 public page (links to /w/[slug])
- Template SVG thumbnails are placeholders; Phase 3 replaces with real template previews

## Self-Check: PASSED

All 11 key files verified present. All 4 commit hashes verified in git log.

---
*Phase: 02-app-shell*
*Completed: 2026-03-14*
