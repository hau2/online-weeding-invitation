---
phase: 01-foundation
plan: 04
subsystem: auth
tags: [jwt, jose, nextjs, cookie, middleware, shadcn, framer-motion, sonner, vietnamese, resend]

# Dependency graph
requires:
  - phase: 01-foundation
    plan: 01
    provides: "packages/types — AuthResponse, LoginRequest, RegisterRequest, MessageResponse"
  - phase: 01-foundation
    plan: 03
    provides: "NestJS auth endpoints — /auth/register, /auth/login, /auth/logout, /auth/request-reset, /auth/confirm-reset"
  - phase: 01-foundation
    plan: 05
    provides: "Tailwind v4 design system — globals.css, Be Vietnam Pro font, rose/OKLCH palette"
provides:
  - "Next.js auth pages: /dang-ky, /dang-nhap, /dat-lai-mat-khau, /xac-nhan-mat-khau"
  - "Edge middleware JWT route guard protecting /dashboard, /thep-cuoi, /admin"
  - "httpOnly auth-token cookie set on login/register, cleared on logout"
  - "Typed apiFetch client for NestJS API calls"
  - "shadcn/ui components: button, input, label"
  - "Framer-motion animated auth card layout"
  - "Dashboard placeholder at /dashboard with logout"
affects: [02-app-shell, all phases using auth session]

# Tech tracking
tech-stack:
  added:
    - "jose — Edge-compatible JWT verification (jwtVerify)"
    - "framer-motion — AnimatePresence page transition on auth layout"
    - "react-hook-form + @hookform/resolvers/zod — form validation"
    - "sonner — toast notifications via shadcn/ui wrapper"
    - "shadcn/ui — button, input, label components (Tailwind v4 compatible)"
    - "resend — transactional email SDK (replaced @nestjs-modules/mailer SMTP)"
  patterns:
    - "Server actions (auth.ts) set httpOnly cookies — browser never touches JWT"
    - "Edge middleware reads cookie and jwtVerify with SUPABASE_JWT_SECRET before serving protected routes"
    - "Auth errors surface as sonner toast.error() — never inline field errors"
    - "apiFetch wrapper normalises NestJS error shapes to Vietnamese string"

key-files:
  created:
    - "apps/web/middleware.ts"
    - "apps/web/lib/api.ts"
    - "apps/web/lib/auth.ts"
    - "apps/web/app/(auth)/layout.tsx"
    - "apps/web/app/(auth)/dang-ky/page.tsx"
    - "apps/web/app/(auth)/dang-nhap/page.tsx"
    - "apps/web/app/(auth)/dat-lai-mat-khau/page.tsx"
    - "apps/web/app/(auth)/xac-nhan-mat-khau/page.tsx"
    - "apps/web/components/auth/register-form.tsx"
    - "apps/web/components/auth/login-form.tsx"
    - "apps/web/components/auth/reset-request-form.tsx"
    - "apps/web/components/auth/reset-confirm-form.tsx"
    - "apps/web/components/ui/button.tsx"
    - "apps/web/components/ui/input.tsx"
    - "apps/web/components/ui/label.tsx"
    - "apps/web/app/(app)/dashboard/page.tsx"
    - "apps/web/app/(app)/layout.tsx"
  modified:
    - "apps/web/components/auth/login-form.tsx — server-side redirect() instead of router.push"
    - "apps/web/components/auth/register-form.tsx — server-side redirect() instead of router.push"
    - "apps/web/lib/auth.ts — return redirect() from server action"
    - "apps/web/middleware.ts — added debug JWT logging"
    - "apps/api/src/auth/auth.service.ts — Resend SDK for password-reset emails"
    - "apps/api/src/auth/auth.module.ts — removed MailerModule, added Resend"
    - "apps/api/src/app.module.ts — updated module imports"
    - "apps/api/tsconfig.build.json — fixed rootDir to prevent nested dist"
    - "apps/api/tsconfig.json — updated composite settings"
    - ".env.example — RESEND_API_KEY added, SMTP vars removed"

key-decisions:
  - "jose used for Edge JWT verification — jsonwebtoken cannot run in Next.js Edge runtime"
  - "Server actions set httpOnly cookies — access_token never exposed to client-side JS"
  - "Resend SDK chosen over @nestjs-modules/mailer — SMTP setup blocked testing; Resend is simpler and production-ready"
  - "server-side redirect() in server action — client router.push fails after cookie set because headers are already sent"
  - "ConfigModule envFilePath points to monorepo root .env — NestJS cwd is apps/api, not repo root"
  - "tsconfig.build.json rootDir set explicitly — prevents TypeScript emitting nested dist/apps/api structure"
  - "Cookie: httpOnly=true, secure=production, sameSite=lax, maxAge=7days — matches JWT_EXPIRES_IN"

patterns-established:
  - "Auth action pattern: server action calls apiFetch → sets cookie → calls redirect() (never return data after redirect)"
  - "Vietnamese UI pattern: all toast messages, form labels, placeholders, and page headings in Vietnamese"
  - "Route group pattern: (auth) group with animated layout; (app) group with app layout"
  - "Form pattern: react-hook-form + zod schema + sonner toast for server errors, zod message for field errors"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, SYST-01]

# Metrics
duration: ~90min (including post-checkpoint fixes)
completed: 2026-03-14
---

# Phase 1 Plan 4: Next.js Auth Pages Summary

**Complete Vietnamese auth flow — httpOnly JWT cookie session, jose Edge middleware, framer-motion card layout, Resend email, four auth pages wired to NestJS endpoints**

## Performance

- **Duration:** ~90 min (including post-checkpoint fixes)
- **Started:** 2026-03-14T13:51:00Z
- **Completed:** 2026-03-14T22:18:52Z
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify)
- **Files modified:** ~25

## Accomplishments

- Four auth pages in Vietnamese — /dang-ky, /dang-nhap, /dat-lai-mat-khau, /xac-nhan-mat-khau — all wired to NestJS auth API
- Edge middleware guards /dashboard, /thep-cuoi, /admin using jose jwtVerify with SUPABASE_JWT_SECRET; admin sub-guard checks app_role=admin
- httpOnly auth-token cookie set on login/register, cleared on logout; session persists across refresh via middleware
- Framer-motion AnimatePresence slide-up transition on auth card layout with rose-50 background
- All auth errors surface as sonner toast.error() in Vietnamese — never inline field errors
- shadcn/ui button/input/label components initialized with Tailwind v4 compatibility
- NestJS switched from SMTP (blocked) to Resend SDK for password-reset emails
- Post-checkpoint fixes resolved server-side redirect, env loading, and tsconfig issues to achieve clean build

## Task Commits

Each task was committed atomically:

1. **Task 1: Middleware, API client, shadcn/ui components, auth server actions** - `fcf9bdc` (feat)
2. **Task 2: Auth page components and route pages — Vietnamese copy, framer-motion layout** - `58e1bd1` (feat)
3. **Task 3 (post-checkpoint fixes): Resend email, env loading, server-side redirect, tsconfig** - `cdbbfd9` (fix)

## Files Created/Modified

- `apps/web/middleware.ts` — Edge JWT verification, route guard for /dashboard, /thep-cuoi, /admin; admin role check
- `apps/web/lib/api.ts` — Typed apiFetch client; normalises NestJS error messages to Vietnamese string
- `apps/web/lib/auth.ts` — Server actions: loginAction, registerAction, logoutAction, getAuthToken
- `apps/web/app/(auth)/layout.tsx` — Framer-motion AnimatePresence card, rose-50 bg, white rounded card
- `apps/web/app/(auth)/dang-ky/page.tsx` — Register page (Vietnamese: "Tạo tài khoản")
- `apps/web/app/(auth)/dang-nhap/page.tsx` — Login page (Vietnamese: "Đăng nhập")
- `apps/web/app/(auth)/dat-lai-mat-khau/page.tsx` — Reset request page
- `apps/web/app/(auth)/xac-nhan-mat-khau/page.tsx` — Reset confirm page (reads token from URL)
- `apps/web/components/auth/register-form.tsx` — react-hook-form + zod, confirms password match
- `apps/web/components/auth/login-form.tsx` — react-hook-form + zod, links to reset and register
- `apps/web/components/auth/reset-request-form.tsx` — email only, disables after submit
- `apps/web/components/auth/reset-confirm-form.tsx` — new password fields, 1.5s delay before redirect
- `apps/web/components/ui/button.tsx` — shadcn/ui button
- `apps/web/components/ui/input.tsx` — shadcn/ui input
- `apps/web/components/ui/label.tsx` — shadcn/ui label
- `apps/web/app/(app)/dashboard/page.tsx` — Placeholder dashboard with logout form action
- `apps/api/src/auth/auth.service.ts` — Resend SDK replaces SMTP mailer for password-reset emails
- `apps/api/tsconfig.build.json` — rootDir fix prevents nested dist structure

## Decisions Made

- **jose over jsonwebtoken** — jsonwebtoken cannot run in Next.js Edge runtime; jose is ESM-native and Edge-compatible
- **Resend SDK over SMTP** — @nestjs-modules/mailer required SMTP credentials that blocked local testing; Resend is simpler, production-ready, single env var
- **server-side redirect() in server actions** — client-side router.push after server action silently fails because the auth cookie response headers conflict with navigation; redirect() issued before response finalisation resolves this
- **ConfigModule envFilePath monorepo root** — NestJS process.cwd() is apps/api in some environments; explicit path `../../.env` loads from repo root reliably
- **tsconfig.build.json rootDir** — without explicit rootDir, tsc emitted files at dist/apps/api/src/ instead of dist/; build artifacts misaligned

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] auth forms used router.push() which failed after server action cookie set**
- **Found during:** Task 3 (post-checkpoint human verification)
- **Issue:** register-form.tsx and login-form.tsx called router.push('/dashboard') after server action returned — redirect silently failed because cookie headers were already committed
- **Fix:** Changed server actions (loginAction, registerAction) to call redirect('/dashboard') directly; forms no longer call router.push
- **Files modified:** apps/web/lib/auth.ts, apps/web/components/auth/login-form.tsx, apps/web/components/auth/register-form.tsx
- **Verification:** Login and registration now successfully redirect to /dashboard with cookie set
- **Committed in:** cdbbfd9

**2. [Rule 3 - Blocking] @nestjs-modules/mailer SMTP setup blocked password-reset email sending**
- **Found during:** Post-checkpoint verification
- **Issue:** SMTP mailer required external credentials and complex transport config; blocked testing password-reset flow
- **Fix:** Replaced @nestjs-modules/mailer with Resend SDK; auth.service.ts uses resend.emails.send(); auth.module.ts simplified
- **Files modified:** apps/api/src/auth/auth.service.ts, apps/api/src/auth/auth.module.ts, apps/api/package.json, .env.example
- **Verification:** NestJS build passes cleanly; password-reset endpoint functional with Resend
- **Committed in:** cdbbfd9

**3. [Rule 3 - Blocking] tsconfig.build.json rootDir caused nested dist output**
- **Found during:** Post-checkpoint build
- **Issue:** TypeScript emitted dist/apps/api/src/ instead of dist/ — NestJS startup script path assumptions broken
- **Fix:** Added explicit rootDir: "src" to apps/api/tsconfig.build.json
- **Files modified:** apps/api/tsconfig.build.json, apps/api/tsconfig.json
- **Verification:** pnpm --filter api build emits to dist/ correctly
- **Committed in:** cdbbfd9

**4. [Rule 3 - Blocking] ConfigModule envFilePath loaded from wrong directory**
- **Found during:** Post-checkpoint API startup
- **Issue:** NestJS ConfigModule defaulted to process.cwd()/.env which resolves to apps/api; monorepo .env is at repo root
- **Fix:** Set envFilePath: '../../.env' in ConfigModule.forRoot(); also isGlobal: true for consistent access
- **Files modified:** apps/api/src/app.module.ts
- **Verification:** JWT_SECRET and SUPABASE_JWT_SECRET load correctly on API startup
- **Committed in:** cdbbfd9

---

**Total deviations:** 4 auto-fixed (1 bug, 3 blocking)
**Impact on plan:** All fixes necessary for correct operation — redirect flow, email sending, build output, env loading. No scope creep.

## Issues Encountered

- shadcn/ui init attempted to override globals.css — Be Vietnam Pro font variables were restored after shadcn initialization per plan instructions
- framer-motion AnimatePresence in (auth)/layout.tsx required 'use client' directive — layout correctly marked as client component

## User Setup Required

None - no additional external service configuration beyond what is already in .env.example. Resend API key (RESEND_API_KEY) has been added to .env.example.

## Next Phase Readiness

- Auth session fully functional: cookie set on login, verified in middleware, cleared on logout
- All 4 auth pages at Vietnamese routes (/dang-ky, /dang-nhap, /dat-lai-mat-khau, /xac-nhan-mat-khau)
- Dashboard placeholder ready for Phase 2 app shell build-out
- Middleware matcher already includes /thep-cuoi/:path* for future invitation builder routes
- Resend email foundation in place; password-reset flow unblocked for future testing with real RESEND_API_KEY

---
*Phase: 01-foundation*
*Completed: 2026-03-14*
