---
phase: 01-foundation
verified: 2026-03-14T22:30:00Z
status: gaps_found
score: 4/5 success criteria verified
gaps:
  - truth: "pnpm --filter api test exits 0 (unit tests pass)"
    status: failed
    reason: "auth.service.spec.ts imports MailerService from @nestjs-modules/mailer which was removed when Resend SDK replaced it in plan 01-04. Package is no longer installed — Vitest cannot resolve the import and the entire test suite fails to load."
    artifacts:
      - path: "apps/api/test/auth/auth.service.spec.ts"
        issue: "Line 4: `import { MailerService } from '@nestjs-modules/mailer'` — package not installed; auth.service.ts no longer uses MailerService (uses Resend SDK directly). The mock provider is stale."
    missing:
      - "Remove `import { MailerService } from '@nestjs-modules/mailer'` and the MailerService mock provider block from auth.service.spec.ts (AuthService no longer injects MailerService at all)"
human_verification:
  - test: "End-to-end auth flow in browser"
    expected: "Register creates account, login sets httpOnly cookie, session persists on refresh, logout clears cookie and redirects, middleware blocks unauthenticated dashboard access, all UI text in Vietnamese, auth errors appear as sonner toasts"
    why_human: "JWT cookie httpOnly attribute, framer-motion page transition quality, Vietnamese text rendering with Be Vietnam Pro font, and toast notification behaviour cannot be verified programmatically"
  - test: "Password reset email delivery"
    expected: "Visiting /dat-lai-mat-khau, submitting valid email, receiving Resend email with Vietnamese reset link, visiting /xac-nhan-mat-khau?token=X with valid token sets new password"
    why_human: "Requires live Supabase + RESEND_API_KEY configured in .env; full email delivery path cannot be verified in codebase scan"
---

# Phase 1: Foundation Verification Report

**Phase Goal:** The project is runnable, Supabase is configured with RLS-enabled schema, NestJS serves authenticated requests, and TypeScript types are shared end-to-end
**Verified:** 2026-03-14T22:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP Success Criteria)

| #   | Truth                                                                              | Status     | Evidence                                                                                                            |
| --- | ---------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | User can register a new account with email/phone + password                        | VERIFIED   | `POST /auth/register` in AuthController; AuthService.register() hashes with bcrypt(10), inserts into users table, returns JWT + UserPublic |
| 2   | User can log in and session persists across browser refresh without re-entering credentials | VERIFIED | loginAction server action sets httpOnly `auth-token` cookie (maxAge 7d); middleware reads cookie and calls jwtVerify — no re-login on refresh |
| 3   | User can log out from any page and session is immediately invalidated              | VERIFIED   | logoutAction deletes `auth-token` cookie and calls redirect('/dang-nhap'); dashboard page has logout form action wired to logoutAction |
| 4   | User can request a password reset link and successfully set a new password         | VERIFIED   | `/dat-lai-mat-khau` and `/xac-nhan-mat-khau` pages exist and are wired; requestPasswordReset stores bcrypt token hash, sends Resend email, always returns 200; confirmPasswordReset validates token, updates password, marks used |
| 5   | An authenticated user cannot access or modify another user's data (403)           | VERIFIED   | RLS policies on invitations table enforce `auth.uid() = user_id`; AdminGuard throws ForbiddenException('Bạn không có quyền truy cập trang này') for non-admin; SupabaseUserService is REQUEST-scoped and forwards user JWT — RLS enforced at DB level |

**Score:** 4/5 success criteria fully verified at code level. Truth #4 and #5 have RLS test stubs (it.todo) that cannot be run automatically without live Supabase — this is expected and documented. One test infrastructure gap exists (see Gaps below).

---

### Required Artifacts

#### Plan 01-01 (Monorepo Scaffold)

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `pnpm-workspace.yaml` | Workspace definition for apps/* and packages/* | VERIFIED | Contains `apps/*` and `packages/*` glob patterns |
| `turbo.json` | Build pipeline with build/dev/test/lint tasks | VERIFIED | All 4 tasks defined; build uses `dependsOn: ["^build"]` |
| `packages/types/src/index.ts` | Shared TypeScript type re-exports | VERIFIED | Exports from user, auth, invitation |
| `packages/types/src/user.ts` | User, UserRole, UserPublic interfaces | VERIFIED | All 3 exported |
| `packages/types/src/auth.ts` | LoginRequest, RegisterRequest, AuthResponse, etc. | VERIFIED | All 6 interfaces present |
| `packages/types/src/invitation.ts` | Invitation, InvitationStatus, TemplateId | VERIFIED | All types present |
| `apps/web/app/layout.tsx` | Root layout with lang=vi and Be Vietnam Pro font variable | VERIFIED | `lang="vi"`, `suppressHydrationWarning`, all three font variables applied to body, Toaster included |
| `apps/api/src/main.ts` | NestJS bootstrap on port 4000 | VERIFIED | `await app.listen(process.env.PORT ?? 4000)`, ValidationPipe, CORS configured |

#### Plan 01-02 (Supabase Schema + Two-Client)

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `supabase/migrations/001_foundation_schema.sql` | 3 tables with RLS, auth.uid() policies | VERIFIED | 3x `ENABLE ROW LEVEL SECURITY`, 6 RLS policies all using `auth.uid()`, partial unique index on slug, soft delete on all tables |
| `apps/api/src/supabase/supabase.service.ts` | SupabaseAdminService (singleton) + SupabaseUserService (REQUEST-scoped) | VERIFIED | SupabaseAdminService uses `SUPABASE_SERVICE_ROLE_KEY`; SupabaseUserService uses `Scope.REQUEST`, extracts Bearer token |
| `apps/api/src/supabase/supabase.module.ts` | NestJS module exporting both services | VERIFIED | Both services in providers and exports arrays |
| `apps/api/vitest.config.ts` | Vitest config with unplugin-swc for NestJS DI | VERIFIED | `swc.vite()` plugin added, `@repo/types` path alias configured |
| `apps/api/test/rls.e2e.spec.ts` | RLS integration test stubs | VERIFIED | 4 `it.todo()` stubs for cross-user access scenarios |

#### Plan 01-03 (NestJS Auth Module)

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `apps/api/src/auth/auth.service.ts` | register, login, logout, requestPasswordReset, confirmPasswordReset | VERIFIED | All 5 methods implemented with bcrypt, JWT signing via Supabase secret, Vietnamese error messages, Resend email SDK |
| `apps/api/src/auth/auth.controller.ts` | 5 POST endpoints | VERIFIED | All 5 routes: /auth/register, /auth/login, /auth/logout, /auth/request-reset, /auth/confirm-reset |
| `apps/api/src/auth/guards/jwt.guard.ts` | JwtGuard — validates Bearer JWT | VERIFIED | Extends AuthGuard('jwt'), throws Vietnamese 401 message |
| `apps/api/src/auth/guards/admin.guard.ts` | AdminGuard — checks app_role=admin | VERIFIED | Throws ForbiddenException with Vietnamese message |
| `apps/api/test/auth/auth.service.spec.ts` | 8 unit tests (GREEN state) | STUB/GAP | Test file fails to load — imports stale `@nestjs-modules/mailer` which was removed when Resend replaced it. Tests cannot run. |

#### Plan 01-04 (Next.js Auth Pages)

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `apps/web/middleware.ts` | Edge JWT verification with jose, route guard | VERIFIED | Uses `jwtVerify` from jose (not jsonwebtoken); guards /dashboard, /thep-cuoi, /admin; admin role check for /admin |
| `apps/web/lib/api.ts` | Typed fetch client for NestJS | VERIFIED | Normalises NestJS error shapes to Vietnamese string |
| `apps/web/lib/auth.ts` | Server actions for login/logout with httpOnly cookie | VERIFIED | `httpOnly: true`, `secure: production`, `sameSite: lax`, `maxAge: 7 days`; redirect() called server-side |
| `apps/web/app/(auth)/layout.tsx` | Framer-motion AnimatePresence card layout | VERIFIED | Uses AnimatePresence with motion.div, rose-50 bg, white card |
| `apps/web/app/(auth)/dang-ky/page.tsx` | Registration page with Vietnamese copy | VERIFIED | "Tạo tài khoản" heading, renders RegisterForm |
| `apps/web/app/(auth)/dang-nhap/page.tsx` | Login page with Vietnamese copy | VERIFIED | "Đăng nhập" heading, renders LoginForm |
| `apps/web/app/(auth)/dat-lai-mat-khau/page.tsx` | Reset request page | VERIFIED | Renders ResetRequestForm |
| `apps/web/app/(auth)/xac-nhan-mat-khau/page.tsx` | Reset confirm page (reads token from URL) | VERIFIED | Wrapped in Suspense, renders ResetConfirmForm which reads `useSearchParams` |

#### Plan 01-05 (Vietnamese Design System)

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `apps/web/app/globals.css` | Tailwind v4 @import, tw-animate-css, @theme inline rose palette | VERIFIED | `@import "tailwindcss"`, `@import "tw-animate-css"`, full OKLCH rose/gold/cream palette and semantic tokens; note: shadcn init added `@import "shadcn/tailwind.css"` and extra :root vars — not a problem |
| `apps/web/lib/fonts.ts` | Be Vietnam Pro, Playfair Display, Dancing Script exports | VERIFIED | All 3 exported with correct variable names and Vietnamese+Latin subsets |
| `apps/web/app/layout.tsx` | Root layout with lang=vi, fonts, Toaster | VERIFIED | `lang="vi"`, all three `.variable` classNames, `<Toaster richColors position="top-center" />` |
| `apps/web/components/ui/typography.tsx` | Heading, ScriptText, BodyText components | VERIFIED | All 3 components exported using font classes |

---

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `apps/web/package.json` | `packages/types` | `workspace:*` | WIRED | `"@repo/types": "workspace:*"` in dependencies |
| `apps/api/package.json` | `packages/types` | `workspace:*` | WIRED | `"@repo/types": "workspace:*"` in dependencies |
| `turbo.json` | build pipeline | `dependsOn: ["^build"]` | WIRED | `"dependsOn": ["^build"]` in build task |
| `apps/api/src/supabase/supabase.service.ts` | Supabase DB | `SUPABASE_SERVICE_ROLE_KEY` | WIRED | `config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY')` |
| `supabase/migrations/001_foundation_schema.sql` | `auth.uid()` | RLS USING clause | WIRED | 6 policy USING clauses reference `auth.uid()` |
| `apps/api/src/auth/auth.service.ts` | `SupabaseAdminService` | `supabaseAdmin.client.from('users')` | WIRED | Multiple `.from('users')` and `.from('password_reset_tokens')` calls |
| `apps/api/src/auth/auth.service.ts` | `@nestjs/jwt JwtService` | `jwtService.sign()` | WIRED | `this.jwtService.sign({sub, role, email, app_role, aud})` |
| `apps/api/src/auth/strategies/jwt.strategy.ts` | `SUPABASE_JWT_SECRET` | `secretOrKey` | WIRED | `config.getOrThrow<string>('SUPABASE_JWT_SECRET')` |
| `apps/web/lib/auth.ts` | `POST /auth/login` | `apiFetch('/auth/login')` + `Set-Cookie auth-token` | WIRED | `apiFetch('/auth/login')` called, response sets `auth-token` httpOnly cookie |
| `apps/web/middleware.ts` | `auth-token` cookie | `jose jwtVerify` | WIRED | `req.cookies.get('auth-token')?.value` → `jwtVerify(token, JWT_SECRET)` |
| `apps/web/components/auth/login-form.tsx` | `apps/web/lib/auth.ts` | `loginAction` import + call | WIRED | `import { loginAction } from '@/lib/auth'` and called in `onSubmit` |
| `apps/web/app/layout.tsx` | `apps/web/lib/fonts.ts` | `beVietnamPro.variable` on body | WIRED | All 3 font `.variable` classNames applied to body element |
| `apps/web/app/globals.css` | Tailwind v4 | `@import "tailwindcss"` | WIRED | CSS-first import confirmed, no `tailwind.config.ts` needed |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| AUTH-01 | 01-03, 01-04 | User can sign up with email/password | SATISFIED | `POST /auth/register` creates user with bcrypt hash; `/dang-ky` page wired to registerAction |
| AUTH-02 | 01-03, 01-04 | User can log in and session persists | SATISFIED | `POST /auth/login` returns JWT; loginAction sets httpOnly cookie; middleware verifies cookie on every protected request |
| AUTH-03 | 01-03, 01-04 | User can log out from any page | SATISFIED | logoutAction deletes cookie + redirects; `/dashboard` has logout form; JwtGuard on POST /auth/logout |
| AUTH-04 | 01-03, 01-04 | User can reset password via email link | SATISFIED | requestPasswordReset stores bcrypt token hash, sends Resend email, returns neutral 200; confirmPasswordReset validates token, updates password_hash, marks used |
| SYST-01 | 01-01, 01-04, 01-05 | Vietnamese-only UI throughout | SATISFIED | `lang="vi"` on html element; Be Vietnam Pro Vietnamese subset loaded; all page headings, form labels, error messages, and button text in Vietnamese; no English user-visible strings found in auth components |
| SYST-03 | 01-02 | User can only edit their own invitations | SATISFIED (schema-level) | RLS policies on invitations table: SELECT/INSERT/UPDATE/DELETE all enforce `auth.uid() = user_id`; SupabaseUserService forwards user JWT so RLS is enforced at DB query time; RLS integration tests are stubs (it.todo — require live Supabase, expected at this stage) |

All 6 required requirement IDs are accounted for. No orphaned requirements.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| `apps/api/test/auth/auth.service.spec.ts` | 4, 48-50 | `import { MailerService } from '@nestjs-modules/mailer'` — stale import; package removed when Resend replaced it | BLOCKER | `pnpm --filter api test` exits non-zero: "Failed to load url @nestjs-modules/mailer". All 8 auth unit tests cannot run |
| `apps/web/middleware.ts` | 22-24 | Debug `console.log` statements left in Edge middleware (JWT_SECRET defined, length, token length) | WARNING | Debug output on every authenticated request; not user-visible but noisy in production logs |

---

### Human Verification Required

#### 1. End-to-End Auth Flow

**Test:** Start `pnpm --filter api start` (port 4000) and `pnpm --filter web dev` (port 3000). Attempt the full auth flow: register at /dang-ky, login at /dang-nhap, refresh browser, logout from /dashboard, verify /dashboard redirects to /dang-nhap unauthenticated, try wrong password and confirm toast appears.
**Expected:** Registration and login redirect to /dashboard. Refresh does not re-prompt. Logout clears session. Middleware blocks unauthenticated access. All text is Vietnamese. Errors appear as sonner toast (not inline). Framer-motion slide-up animation plays on auth card.
**Why human:** Cookie httpOnly attribute (cannot be read by JS to verify), animation quality, Vietnamese font rendering with Be Vietnam Pro, and toast notification UX cannot be verified statically.

#### 2. Password Reset Email Delivery

**Test:** With valid `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, and `RESEND_API_KEY` configured, visit /dat-lai-mat-khau, enter a real email address, check inbox, click the reset link, set new password at /xac-nhan-mat-khau, verify redirect to /dang-nhap.
**Expected:** Email arrives with Vietnamese subject and reset link pointing to `/xac-nhan-mat-khau?token=...`. New password accepts login. Old password is rejected.
**Why human:** Requires live Supabase project with schema applied and a Resend account with valid API key — both are external services that cannot be verified in a codebase scan.

---

### Gaps Summary

One gap is blocking and must be fixed before declaring this phase complete:

**Test suite broken** — `apps/api/test/auth/auth.service.spec.ts` imports `MailerService` from `@nestjs-modules/mailer` at line 4. This package was correctly removed from `apps/api/package.json` when plan 01-04 switched from `@nestjs-modules/mailer` to the Resend SDK. However, the test file was not updated to remove the stale import and the corresponding mock provider (lines 48-50). Because `@nestjs-modules/mailer` is no longer installed, Vitest cannot load the test module and the entire `pnpm --filter api test` command exits with a non-zero status.

**Fix is minimal:** Delete the `MailerService` import and its mock provider from the `providers` array in the test's `beforeEach`. `AuthService` no longer injects `MailerService` — it instantiates `Resend` directly in its constructor — so the mock is simply unused and its import is the sole blocker.

The debug `console.log` statements in `middleware.ts` are a warning-level concern (noisy production logs) but do not block functionality.

All other phase-1 goals are strongly implemented: the monorepo scaffold is correct, the RLS-enabled schema is substantive and complete, NestJS serves all five authenticated auth endpoints, TypeScript types are shared end-to-end via the `@repo/types` workspace package, and the Vietnamese design system is active.

---

_Verified: 2026-03-14T22:30:00Z_
_Verifier: Claude (gsd-verifier)_
