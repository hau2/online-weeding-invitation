---
phase: 02-app-shell
plan: 01
subsystem: ui
tags: [next.js, middleware, jose, jwt, shadcn-ui, sidebar, route-groups, vitest]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "NestJS auth module, jose JWT, auth-token cookie, SUPABASE_JWT_SECRET, Tailwind v4 rose palette"
provides:
  - "middleware.ts auth guard with verifyToken helper and admin role check"
  - "Four route groups: (site), (auth), (app), (admin) with nested layouts"
  - "AppSidebar with rose/pink theme and 2 nav items"
  - "AdminSidebar with gray theme and 8 admin nav items"
  - "TopBar with 4-item user profile dropdown"
  - "Vitest web config with jsdom + React Testing Library"
  - "/api/auth/logout route handler for cookie-based logout"
affects: [02-02-dashboard, 02-03-admin-dashboard, 03-invitation-editor]

# Tech tracking
tech-stack:
  added: [vitest, "@vitejs/plugin-react", jsdom, "@testing-library/react", "@testing-library/jest-dom", "@testing-library/user-event", "shadcn/ui sidebar", "shadcn/ui sheet", "shadcn/ui dialog", "shadcn/ui dropdown-menu", "shadcn/ui tooltip"]
  patterns: ["base-ui render prop pattern (replaces Radix asChild)", "SidebarProvider + SidebarInset layout", "negative-lookahead middleware matcher"]

key-files:
  created:
    - apps/web/vitest.config.ts
    - apps/web/test/setup.ts
    - apps/web/__tests__/middleware.test.ts
    - apps/web/app/(site)/layout.tsx
    - apps/web/app/(site)/page.tsx
    - apps/web/app/(admin)/layout.tsx
    - apps/web/app/(admin)/admin/page.tsx
    - apps/web/app/api/auth/logout/route.ts
    - apps/web/components/app/AppSidebar.tsx
    - apps/web/components/app/TopBar.tsx
    - apps/web/components/admin/AdminSidebar.tsx
    - apps/web/components/ui/sidebar.tsx
    - apps/web/components/ui/sheet.tsx
    - apps/web/components/ui/dialog.tsx
    - apps/web/components/ui/dropdown-menu.tsx
    - apps/web/components/ui/tooltip.tsx
    - apps/web/hooks/use-mobile.ts
  modified:
    - apps/web/middleware.ts
    - apps/web/app/(app)/layout.tsx
    - apps/web/app/(app)/dashboard/page.tsx
    - apps/web/package.json

key-decisions:
  - "Adapted plan to Phase 1 patterns: auth-token cookie name, SUPABASE_JWT_SECRET env var, app_role JWT field"
  - "base-ui render prop pattern used instead of Radix asChild -- shadcn/ui v4 uses @base-ui/react"
  - "SidebarProvider cookieName prop not supported in this shadcn version -- using default cookie name for both app and admin"
  - "@vitejs/plugin-react downgraded to v4 for Vite 5 compatibility (vitest@2 bundles vite@5)"
  - "Preserved Phase 1 auth layout (framer-motion AnimatePresence) instead of replacing with plan's simpler version"
  - "Admin role forbidden redirects to /dashboard?error=forbidden (not 403 JSON) for better UX"

patterns-established:
  - "SidebarProvider + SidebarInset layout: wrap route group layout with SidebarProvider, use SidebarInset for main content"
  - "render prop for shadcn/ui buttons: use render={<Link href={...} />} instead of asChild pattern"
  - "Middleware route classification: isAppRoute + isAdminRoute booleans for clear intent"

requirements-completed: [SYST-04, ADMN-01]

# Metrics
duration: 9min
completed: 2026-03-14
---

# Phase 2 Plan 01: Route Groups, Middleware, and App Shell Summary

**Next.js route groups with jose middleware auth guard, shadcn/ui Sidebar-based app shell (rose theme), and admin layout (gray theme) with Vitest web config**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-14T15:36:39Z
- **Completed:** 2026-03-14T15:46:12Z
- **Tasks:** 3 (Task 0 + Task 1 TDD + Task 2)
- **Files modified:** 22

## Accomplishments
- Middleware auth guard with jose jwtVerify protects /(app) and /(admin) routes, excludes /w/ public paths and static assets
- Four route groups established: (site) for marketing, (auth) for login/register, (app) for user dashboard, (admin) for admin panel
- App shell layout with shadcn/ui Sidebar (collapsible, rose/pink theme) and TopBar (4-item user dropdown)
- Admin shell layout with neutral gray sidebar (8 fixed menu items) -- visually distinct from user app
- Vitest + React Testing Library configured for web app with 12 passing middleware tests

## Task Commits

Each task was committed atomically:

1. **Task 0: Vitest web config and test scaffolds** - `9c8d9e3` (chore)
2. **Task 1 RED: Middleware route matching tests** - `a5315aa` (test)
3. **Task 1 GREEN + Task 2: Route groups, middleware, layouts, components** - `500c4c9` (feat)

_Note: Task 1 GREEN and Task 2 were committed together due to interleaved execution with another plan session._

## Files Created/Modified
- `apps/web/vitest.config.ts` - Vitest config with jsdom, path aliases, React plugin
- `apps/web/test/setup.ts` - Test setup with jest-dom matchers
- `apps/web/__tests__/middleware.test.ts` - 12 tests for route matching and admin role guard logic
- `apps/web/middleware.ts` - Updated auth guard: verifyToken helper, admin -> /dashboard?error=forbidden, negative-lookahead matcher
- `apps/web/app/(site)/layout.tsx` - Minimal wrapper layout for marketing pages
- `apps/web/app/(site)/page.tsx` - Landing page (moved from app/page.tsx)
- `apps/web/app/(app)/layout.tsx` - App shell: SidebarProvider + AppSidebar + TopBar + SidebarInset
- `apps/web/app/(app)/dashboard/page.tsx` - Dashboard placeholder (Plan 02-02 fills)
- `apps/web/app/(admin)/layout.tsx` - Admin shell: SidebarProvider + AdminSidebar + SidebarInset (gray theme)
- `apps/web/app/(admin)/admin/page.tsx` - Admin dashboard placeholder (Plan 02-03 fills)
- `apps/web/app/api/auth/logout/route.ts` - Cookie-clearing logout route handler
- `apps/web/components/app/AppSidebar.tsx` - Rose/pink sidebar with 2 nav items, collapsible="icon"
- `apps/web/components/app/TopBar.tsx` - User profile dropdown with 4 items
- `apps/web/components/admin/AdminSidebar.tsx` - Gray sidebar with 8 admin nav items
- `apps/web/components/ui/sidebar.tsx` - shadcn/ui Sidebar component (base-ui variant)
- `apps/web/package.json` - Added vitest, testing-library, test scripts

## Decisions Made

1. **Adapted to Phase 1 auth patterns:** Plan specified `session` cookie and `JWT_SECRET` env var, but Phase 1 established `auth-token` cookie and `SUPABASE_JWT_SECRET`. Matched Phase 1 for consistency.

2. **base-ui render prop instead of Radix asChild:** The installed shadcn/ui version (base-nova style) uses `@base-ui/react` which exposes `render` prop instead of Radix's `asChild` pattern. All sidebar menu buttons use `render={<Link href={...} />}`.

3. **Removed cookieName prop:** Plan specified `cookieName="admin-sidebar:state"` for admin SidebarProvider, but this version of shadcn/ui doesn't support that prop. Both app and admin use the default cookie name. This is acceptable since the route groups are completely separate.

4. **Preserved Phase 1 auth layout:** Plan wanted to replace the existing (auth) layout with a simpler stub. The Phase 1 version includes framer-motion AnimatePresence and is higher quality. Kept it unchanged.

5. **Admin forbidden -> redirect instead of 403:** Non-admin users accessing /admin are redirected to `/dashboard?error=forbidden` rather than getting a raw 403 JSON response, matching the research recommendation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] @vitejs/plugin-react version incompatibility**
- **Found during:** Task 0 (Vitest config)
- **Issue:** @vitejs/plugin-react@6 requires Vite 8, but vitest@2 bundles Vite 5. ESM module load error.
- **Fix:** Downgraded to @vitejs/plugin-react@^4.0.0 which is compatible with Vite 5
- **Files modified:** apps/web/package.json
- **Verification:** `pnpm --filter web test` exits 0
- **Committed in:** 9c8d9e3 (Task 0 commit)

**2. [Rule 3 - Blocking] shadcn/ui base-nova uses render prop instead of asChild**
- **Found during:** Task 1 (Build failure)
- **Issue:** Plan used `asChild` prop on SidebarMenuButton, but the installed shadcn/ui (base-nova style) uses `@base-ui/react` which exposes `render` prop instead
- **Fix:** Changed all `asChild` + child Link pattern to `render={<Link href={...} />}` pattern
- **Files modified:** components/app/AppSidebar.tsx, components/admin/AdminSidebar.tsx
- **Verification:** `pnpm --filter web build` exits 0
- **Committed in:** 500c4c9

**3. [Rule 3 - Blocking] SidebarProvider cookieName prop not supported**
- **Found during:** Task 1 (Build failure)
- **Issue:** Plan specified `cookieName="admin-sidebar:state"` but this shadcn/ui version's SidebarProvider does not accept that prop
- **Fix:** Removed cookieName prop, using default cookie name for both sidebars
- **Files modified:** apps/web/app/(admin)/layout.tsx
- **Verification:** `pnpm --filter web build` exits 0
- **Committed in:** 500c4c9

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All auto-fixes necessary for the code to compile. No scope creep.

## Issues Encountered
- None beyond the blocking issues documented as deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Route groups and middleware guard ready for Plan 02-02 (Dashboard page) and Plan 02-03 (Admin dashboard)
- AppSidebar and TopBar in place; dashboard page is a placeholder awaiting Plan 02-02 card grid implementation
- Admin layout ready for Plan 02-03 stat cards and charts
- Vitest web config ready for component tests in subsequent plans

## Self-Check: PASSED

All 15 key files verified present. All 3 commit hashes verified in git log.

---
*Phase: 02-app-shell*
*Completed: 2026-03-14*
