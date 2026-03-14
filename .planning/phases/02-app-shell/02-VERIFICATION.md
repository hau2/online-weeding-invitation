---
phase: 02-app-shell
verified: 2026-03-14T23:25:00Z
status: gaps_found
score: 4/5 success criteria verified
gaps:
  - truth: "POST /invitations and GET /invitations work end-to-end from the frontend"
    status: failed
    reason: "Cookie name mismatch: API JwtGuard reads req.cookies['session'] but the frontend sends the cookie as 'auth-token'. Every real request from the dashboard or CreateWizard will receive a 401 Unauthorized from the API."
    artifacts:
      - path: "apps/api/src/common/guards/jwt.guard.ts"
        issue: "Line 27 reads req.cookies?.['session'] — should be 'auth-token' to match Phase 1's established cookie name"
    missing:
      - "Change the cookie name in JwtGuard from 'session' to 'auth-token' to match the middleware.ts and dashboard/page.tsx cookie name"
human_verification:
  - test: "Admin role enforcement — 403 vs redirect"
    expected: "ROADMAP success criterion says 'returns 403' but implementation redirects to /dashboard?error=forbidden. Verify this is acceptable to the product owner."
    why_human: "The behavior achieves the security goal (non-admin cannot reach /admin) but the mechanism differs from the roadmap wording. A redirect is better UX than a 403, and it was documented as an intentional deviation in 02-01-SUMMARY.md. Human confirmation that this deviation is accepted closes this item."
  - test: "Visual separation of app shell (rose/pink) vs admin shell (gray/white)"
    expected: "No pink/rose colors appear on /admin. No gray/white theme bleeds into /dashboard. Sidebar collapse works on both shells."
    why_human: "Theme separation and visual identity cannot be verified programmatically — requires browser inspection."
  - test: "CreateWizard end-to-end flow (after cookie fix)"
    expected: "After fixing the JwtGuard cookie name, clicking Tao moi, selecting a template, entering bride/groom names, and submitting should POST to /invitations and redirect to /thep-cuoi/[returned-id]"
    why_human: "Requires running API server and browser session. Verifies the full create-invitation user journey."
---

# Phase 2: App Shell Verification Report

**Phase Goal:** Build the authenticated app shell with sidebar navigation, user dashboard showing invitation list with create wizard, and admin dashboard skeleton with stat cards.
**Verified:** 2026-03-14T23:25:00Z
**Status:** gaps_found — 1 blocker (cookie name mismatch breaks API integration)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Authenticated user lands on dashboard showing invitation list with status labels (Nháp / Đã xuất bản / Hết hạn) | PARTIAL | Dashboard page exists and is wired. StatusBadge renders correct labels. BUT: dashboard fetches from NestJS using `auth-token` cookie while JwtGuard reads `session` cookie — returns empty array instead of real data in production. |
| 2 | User can tap "Tạo mới" to create a new invitation and be taken to the editor | PARTIAL | CreateWizard exists, is wired to DashboardClient, POSTs to `/invitations`. BUT: CreateWizard uses `credentials: 'include'` which sends `auth-token` cookie; API JwtGuard reads `session` — request will return 401 in production. |
| 3 | Each invitation card has edit and view-public-page buttons — NO QR code button | VERIFIED | InvitationCard.tsx confirmed: edit button links to `/thep-cuoi/[id]`, view-page button opens `/w/[slug]` in new tab, and the comment on line 74 explicitly notes "NO QR". No QR-related code exists anywhere in the dashboard. |
| 4 | Unauthenticated user accessing any app route is redirected to login page | VERIFIED | middleware.ts checks `isAppRoute` (covers `/dashboard` and `/thep-cuoi`) and `isAdminRoute`, redirects to `/dang-nhap` when no `auth-token` cookie present. 12 middleware unit tests pass covering this logic. |
| 5 | Accessing /admin without admin role is blocked | VERIFIED | middleware.ts checks `payload['app_role'] !== 'admin'` and redirects to `/dashboard?error=forbidden`. Documented intentional deviation: redirect rather than raw 403, which is better UX. Security outcome is identical — non-admin users cannot access `/admin`. |

**Score:** 3/5 criteria fully verified, 2/5 partial (same root cause: cookie name mismatch)

---

## Required Artifacts

### Plan 02-01 Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `apps/web/middleware.ts` | VERIFIED | Uses `jwtVerify` from jose, reads `auth-token` cookie, guards `/dashboard`, `/thep-cuoi`, `/admin` routes with negative-lookahead matcher excluding `/w/` and static assets. |
| `apps/web/app/(app)/layout.tsx` | VERIFIED | Wraps with `SidebarProvider > AppSidebar + SidebarInset > header(SidebarTrigger + TopBar) + main`. Rose theme. No `html`/`body` tags (correct nested layout). |
| `apps/web/components/app/AppSidebar.tsx` | VERIFIED | Exports `AppSidebar`. Uses rose/pink palette. 2 nav items (`/dashboard`, `/thep-cuoi`). Collapsible icon mode. Uses `render` prop pattern (base-ui deviation, correctly adapted). |
| `apps/web/components/app/TopBar.tsx` | VERIFIED | Exports `TopBar`. 4 dropdown items: Tài khoản, Gói dịch vụ, Hỗ trợ, Đăng xuất. Logout calls `/api/auth/logout`. |
| `apps/web/components/admin/AdminSidebar.tsx` | VERIFIED | 8 nav items. Gray/white palette. No rose/pink colors. |
| `apps/web/app/(admin)/layout.tsx` | VERIFIED | Separate SidebarProvider, gray theme, imports AdminSidebar. |
| `apps/web/app/(auth)/layout.tsx` | VERIFIED | Centered rose-50 background layout. Uses framer-motion AnimatePresence (Phase 1 pattern preserved). |
| `apps/web/vitest.config.ts` | VERIFIED | jsdom environment, React plugin, `@repo/types` alias, `__tests__/**` include pattern. |
| `apps/web/__tests__/middleware.test.ts` | VERIFIED | 12 tests pass — route matching logic and admin role guard logic. |
| `apps/web/app/api/auth/logout/route.ts` | VERIFIED | POST handler that deletes `auth-token` cookie and returns `{ ok: true }`. |

### Plan 02-02 Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `apps/web/app/(app)/dashboard/page.tsx` | PARTIAL | Server Component that reads `auth-token` cookie and forwards to NestJS. Logic is correct but the API will reject requests because JwtGuard reads `session` cookie instead. Falls back to empty array gracefully. |
| `apps/web/components/app/InvitationCard.tsx` | VERIFIED | Exports `InvitationCard`. Renders couple names, date, status badge, template SVG thumbnails, edit button (`/thep-cuoi/[id]`), conditional view-page button (`/w/[slug]`). No QR code button. |
| `apps/web/components/app/InvitationGrid.tsx` | VERIFIED | Exports `InvitationGrid`. framer-motion stagger (70ms, `staggerChildren: 0.07`). Renders `EmptyState` when `invitations.length === 0`. |
| `apps/web/components/app/StatusBadge.tsx` | VERIFIED | Exports `StatusBadge`. cva variants: `draft` → gray/Nháp, `published` → green/Đã xuất bản, `expired` → red/Hết hạn. |
| `apps/web/components/app/EmptyState.tsx` | VERIFIED | SVG envelope illustration, "Tạo thiệp cưới đầu tiên của bạn" CTA button, accepts `onCreateClick` callback. |
| `apps/web/components/app/CreateWizard.tsx` | PARTIAL | 2-step dialog, 3 template options, couple name fields, POSTs to `http://localhost:3001/invitations`. Cookie mismatch means POST will return 401 in production. |
| `apps/web/components/app/DashboardClient.tsx` | VERIFIED | Client wrapper with wizard state, "Tạo mới" button, wires `InvitationGrid` and `CreateWizard`. |

### Plan 02-03 Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `apps/web/app/(admin)/admin/page.tsx` | VERIFIED | 4 stat cards (users, invitations, active, revenue), `AdminDashboardCharts` below. All gray/neutral colors — no pink. |
| `apps/web/components/admin/StatCard.tsx` | VERIFIED | Exports `StatCard`. Neutral gray palette (`bg-white`, `border-gray-200`, `text-gray-*`). Supports icon, value, description, optional trend. |
| `apps/web/components/admin/AdminDashboardCharts.tsx` | VERIFIED | Exports `AdminDashboardCharts`. Recharts `BarChart` with placeholder data + revenue placeholder. Gray colors throughout. |

### Plan 02-04 Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `apps/api/src/invitations/invitations.module.ts` | VERIFIED | Exports `InvitationsModule`. Imports `SupabaseModule`, registers `InvitationsController` and `InvitationsService`. |
| `apps/api/src/invitations/invitations.controller.ts` | VERIFIED | `@Controller('invitations')` with `@UseGuards(JwtGuard)` at class level. GET `/invitations` → `listByUser(user.sub)`. POST `/invitations` → `create(user.sub, dto)`. |
| `apps/api/src/invitations/invitations.service.ts` | VERIFIED | `listByUser` filters `.eq('user_id', userId).is('deleted_at', null)`. `create` always uses `user_id: userId` (from JWT, never from DTO). `mapRow()` handles snake_case to camelCase. |
| `apps/api/src/invitations/dto/create-invitation.dto.ts` | VERIFIED | `brideName`, `groomName`, `templateId` with class-validator. **No `userId` field** (critical security property confirmed). |
| `apps/api/src/common/guards/jwt.guard.ts` | STUB | Exists and compiles. BUT reads `req.cookies?.['session']` (line 27) while the frontend uses `auth-token`. This breaks every protected API call from the frontend. |
| `apps/api/src/common/decorators/current-user.decorator.ts` | VERIFIED | Exports `CurrentUser` decorator and `JwtPayload` interface. Attaches `sub`, `email`, `role`, `app_role`. |
| `apps/api/src/invitations/__tests__/invitations.service.spec.ts` | VERIFIED | 8 tests covering: ownership filter, empty result, camelCase mapping, created_at ordering, error handling, user_id-from-param, full camelCase create response, insert error. All pass. |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `middleware.ts` | `SUPABASE_JWT_SECRET` | `TextEncoder + jose jwtVerify` | VERIFIED | `new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!)` confirmed on line 5. `jwtVerify` called on line 9. |
| `app/(app)/layout.tsx` | `components/app/AppSidebar.tsx` | `SidebarProvider` wrapping `AppSidebar` | VERIFIED | `import { AppSidebar }` on line 2, rendered inside `SidebarProvider` on line 8. |
| `dashboard/page.tsx` | `http://localhost:3001/invitations` | server-side fetch with cookie forwarding | VERIFIED (conditional) | Fetch is present and correctly forwards `auth-token`. API endpoint exists. Will return 401 due to JwtGuard cookie mismatch. |
| `CreateWizard.tsx` | `http://localhost:3001/invitations` | POST fetch in `handleSubmit` | VERIFIED (conditional) | `fetch('http://localhost:3001/invitations', { method: 'POST', credentials: 'include' })` on line 46. Will return 401 due to JwtGuard cookie mismatch. |
| `InvitationCard.tsx` | `/thep-cuoi/[id]` and `/w/[slug]` | `render={<Link>}` and `window.open` | VERIFIED | Edit button: `render={<Link href={'/thep-cuoi/${invitation.id}'} />}`. View button: `window.open('/w/${invitation.slug}', '_blank')`. |
| `invitations.controller.ts` | `jwt.guard.ts` | `@UseGuards(JwtGuard)` | VERIFIED | `@UseGuards(JwtGuard)` on line 19 at class level, covers both GET and POST. |
| `invitations.service.ts` | `SupabaseUserService` | inject and call `.from('invitations').select()` | VERIFIED | Constructor injects `SupabaseUserService`. `supabaseUser.client.from('invitations')` called in both `listByUser` and `create`. |
| `app.module.ts` | `invitations.module.ts` | `imports` array | VERIFIED | `InvitationsModule` imported on line 8, added to `imports: [ConfigModule, AuthModule, InvitationsModule]`. |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DASH-01 | 02-02, 02-04 | User can view list of their invitations with status | PARTIAL | Frontend dashboard + StatusBadge confirmed working. API GET /invitations exists with ownership filter. Cookie name mismatch means real data will not flow. |
| DASH-02 | 02-02, 02-04 | User can create a new invitation | PARTIAL | CreateWizard and POST /invitations both implemented. Cookie name mismatch means POST will return 401 in production. |
| DASH-03 | 02-02 | User can access edit and view public page from dashboard | VERIFIED | InvitationCard has edit link (`/thep-cuoi/[id]`) and view-page button (`/w/[slug]`). No QR button present. |
| SYST-04 | 02-01 | Public pages are read-only for guests | VERIFIED | Middleware matcher excludes `/w/` paths from auth check via negative-lookahead pattern. Public invitation pages are never gated. |
| ADMN-01 | 02-01, 02-03 | Admin panel at `/admin` with separate layout | VERIFIED | Separate `(admin)` route group with distinct `AdminSidebar` (gray theme), `SidebarProvider`, and `AdminDashboardPage` with stat cards. Visually and structurally isolated from user app. |

**No orphaned requirements.** All 5 Phase 2 requirements (DASH-01, DASH-02, DASH-03, SYST-04, ADMN-01) appear in at least one plan's `requirements` field, and all 5 are mapped to Phase 2 in REQUIREMENTS.md.

**Discrepancy note on DASH-03:** REQUIREMENTS.md text says "access edit, view QR, and view public page from dashboard" (includes QR). The ROADMAP success criteria explicitly removed QR from the dashboard scope: "NO QR code button (share via link only)". The implementation correctly follows the ROADMAP (no QR button). REQUIREMENTS.md has not been updated to reflect this scope change. This is a documentation gap, not an implementation gap.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `apps/api/src/common/guards/jwt.guard.ts` | 27 | Cookie name `'session'` hardcoded — should be `'auth-token'` | BLOCKER | Every authenticated API request from the frontend returns 401. Dashboard shows empty list. CreateWizard POST fails silently with toast error. |
| `apps/web/app/(admin)/admin/page.tsx` | 9,15 | Placeholder stat values (`'—'`) | INFO | Intentional — documented in plan as "Phase 8 replaces with real data". Not a blocker for this phase's goal. |
| `apps/web/components/admin/AdminDashboardCharts.tsx` | 34 | "Dữ liệu thực tế sẽ có ở Phase 8" text | INFO | Intentional placeholder. Phase 8 will replace. |

---

## Test Results

| Suite | Tests | Result |
|-------|-------|--------|
| `apps/web` — all test files | 29 tests | ALL PASS |
| `apps/api` — invitations.service.spec.ts | 8 tests | ALL PASS |
| `apps/api` — auth.service.spec.ts | 8 tests | ALL PASS |
| `pnpm --filter web build` | — | PASS (all routes compile) |
| `pnpm --filter api build` | — | PASS |

---

## Human Verification Required

### 1. Admin Role Block — Redirect vs 403

**Test:** Log in as a user with `app_role: 'user'`, then navigate to `http://localhost:3000/admin`.
**Expected:** Should be redirected to `/dashboard?error=forbidden`. The page must NOT load any admin UI.
**Why human:** The ROADMAP success criterion says "returns 403" but the implementation redirects (better UX). The 02-01-SUMMARY.md documented this as an intentional deviation. Confirm the product owner accepts redirect-based access denial in place of a 403 HTTP status.

### 2. Visual Theme Separation

**Test:** Open `/dashboard` and `/admin` side by side in the browser.
**Expected:** `/dashboard` uses rose/pink sidebar with "Thiệp Cưới" branding. `/admin` uses gray/white sidebar with "Admin Panel" branding. No color theme bleeds between the two shells. Sidebar collapse/expand works independently on both.
**Why human:** Color values and visual appearance cannot be verified by file inspection.

### 3. CreateWizard End-to-End (After Cookie Fix)

**Test:** After fixing JwtGuard cookie name: log in, go to dashboard, click "Tạo mới", select "Truyền thống", click "Tiếp theo", enter bride and groom names, click "Tạo thiệp".
**Expected:** New invitation is created, dialog closes, browser navigates to `/thep-cuoi/[new-id]`.
**Why human:** Requires live API server, database connection, and browser session. Tests verify the individual components but not the full server-round-trip flow.

---

## Gaps Summary

**One blocker** prevents goal achievement for DASH-01 (invitation list) and DASH-02 (create invitation):

The `JwtGuard` in `apps/api/src/common/guards/jwt.guard.ts` reads the cookie named `'session'` (line 27), but Phase 1 established `'auth-token'` as the cookie name throughout the codebase. The frontend middleware reads `'auth-token'`, the dashboard server component forwards `auth-token=${token}`, and the logout route deletes `'auth-token'`. The JwtGuard was written using the plan's original spec (which said `session`) rather than adapting to Phase 1's established cookie name — the same adaptation that was correctly applied in all the Next.js files.

**Fix required:** In `apps/api/src/common/guards/jwt.guard.ts`, change line 27 from:
```typescript
const token = req.cookies?.['session']
```
to:
```typescript
const token = req.cookies?.['auth-token']
```

This single-line fix unblocks both the GET /invitations dashboard data flow and the POST /invitations create wizard flow. No other changes are needed.

---

*Verified: 2026-03-14T23:25:00Z*
*Verifier: Claude (gsd-verifier)*
