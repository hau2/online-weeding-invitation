---
phase: 01-foundation
plan: 03
subsystem: auth
tags: [jwt, bcrypt, nestjs, passport, class-validator, swc, vitest]

# Dependency graph
requires:
  - phase: 01-02
    provides: SupabaseAdminService and SupabaseUserService (supabase.module.ts)

provides:
  - NestJS AuthModule with register/login/logout/password-reset endpoints
  - JWT tokens signed with SUPABASE_JWT_SECRET (HS256), Supabase-compatible payload
  - JwtGuard and AdminGuard for protecting routes
  - HttpExceptionFilter for consistent Vietnamese error responses
  - CurrentUser parameter decorator
  - Unit tests for all AuthService methods (8 passing)

affects:
  - 01-04 (Next.js auth pages wire to these endpoints)
  - all future feature modules that use JwtGuard or AdminGuard

# Tech tracking
tech-stack:
  added:
    - "@nestjs/jwt ^10 — JWT signing and verification"
    - "@nestjs/passport ^11 — Passport integration"
    - "passport-jwt ^4 — JWT strategy"
    - "@nestjs-modules/mailer ^2 — transactional email"
    - "bcrypt ^5 — password hashing (saltRounds=10)"
    - "class-validator + class-transformer — DTO validation"
    - "unplugin-swc + @swc/core — emitDecoratorMetadata support in Vitest"
  patterns:
    - "Admin client (service role) for all auth DB operations — user-scoped client never used in auth module"
    - "JWT payload shape: { sub, role: authenticated, email, app_role, aud: authenticated }"
    - "Vietnamese error messages in all exceptions and DTOs"
    - "Email enumeration prevention: same 200 response regardless of email existence"

key-files:
  created:
    - apps/api/src/auth/auth.service.ts
    - apps/api/src/auth/auth.controller.ts
    - apps/api/src/auth/auth.module.ts
    - apps/api/src/auth/dto/register.dto.ts
    - apps/api/src/auth/dto/login.dto.ts
    - apps/api/src/auth/dto/reset-password.dto.ts
    - apps/api/src/auth/dto/confirm-reset.dto.ts
    - apps/api/src/auth/strategies/jwt.strategy.ts
    - apps/api/src/auth/guards/jwt.guard.ts
    - apps/api/src/auth/guards/admin.guard.ts
    - apps/api/src/common/decorators/current-user.decorator.ts
    - apps/api/src/common/filters/http-exception.filter.ts
  modified:
    - apps/api/src/app.module.ts
    - apps/api/src/supabase/supabase.service.ts
    - apps/api/test/auth/auth.service.spec.ts
    - apps/api/vitest.config.ts
    - apps/api/package.json

key-decisions:
  - "unplugin-swc added to Vitest config to enable emitDecoratorMetadata — required for NestJS DI reflection in Vitest 2.x"
  - "import type for express in supabase.service.ts — Vite cannot bundle CJS express; type-only import avoids resolution"
  - "TokenRecord explicit type in confirmPasswordReset — Supabase client infers nullable array type; explicit type satisfies strictNullChecks"
  - "JwtGuard handleRequest uses generic TUser to satisfy IAuthGuard base type in NestJS 11"
  - "password_reset_tokens fetched with limit(20) then bcrypt compared in-loop — avoids timing attack via index enumeration"

patterns-established:
  - "Mock supabase chain as fresh object per test (buildSupabaseChain factory) — vi.clearAllMocks() wipes .mockReturnThis() state"
  - "All Vietnamese error messages in exception constructors, not DTOs alone"
  - "AuthModule exports JwtModule + JwtStrategy so other modules can use JwtGuard without re-importing JWT config"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04]

# Metrics
duration: 8min
completed: 2026-03-14
---

# Phase 1 Plan 3: Auth Module Summary

**NestJS HS256 JWT auth module with bcrypt hashing, five endpoints, JwtGuard/AdminGuard, and 8 passing Vitest unit tests — all messages in Vietnamese**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-14T13:38:23Z
- **Completed:** 2026-03-14T13:46:00Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments

- POST /auth/register creates user with bcrypt (saltRounds=10), returns JWT + UserPublic
- POST /auth/login validates bcrypt, returns JWT; no email enumeration (same 401 for wrong pass or missing user)
- POST /auth/logout stateless 200 with Vietnamese message
- POST /auth/request-reset stores bcrypt token hash, sends email, always returns 200
- POST /auth/confirm-reset validates token from DB, updates password_hash, marks token used
- JwtGuard and AdminGuard ready for all protected routes
- HttpExceptionFilter normalizes all errors with statusCode, message, timestamp, path
- 8 unit tests passing (TDD: RED then GREEN)

## Task Commits

Each task was committed atomically:

1. **Task 1: AuthService, DTOs, JwtStrategy, CurrentUser, HttpExceptionFilter, tests** - `bd1de66` (feat)
2. **Task 2: AuthController, AuthModule, JwtGuard, AdminGuard, AppModule** - `acdf48a` (feat)

**Plan metadata:** (final docs commit — see below)

_Note: Task 1 followed TDD — test file written first (RED), then implementation (GREEN)_

## Files Created/Modified

- `apps/api/src/auth/auth.service.ts` — register, login, logout, requestPasswordReset, confirmPasswordReset
- `apps/api/src/auth/auth.controller.ts` — five POST endpoints wired to AuthService
- `apps/api/src/auth/auth.module.ts` — JwtModule + PassportModule + MailerModule from env config
- `apps/api/src/auth/dto/register.dto.ts` — email + password with Vietnamese validation
- `apps/api/src/auth/dto/login.dto.ts` — email + password
- `apps/api/src/auth/dto/reset-password.dto.ts` — email
- `apps/api/src/auth/dto/confirm-reset.dto.ts` — token + newPassword
- `apps/api/src/auth/strategies/jwt.strategy.ts` — PassportStrategy extracting Bearer, validates with SUPABASE_JWT_SECRET
- `apps/api/src/auth/guards/jwt.guard.ts` — extends AuthGuard('jwt'), Vietnamese unauthorized message
- `apps/api/src/auth/guards/admin.guard.ts` — checks app_role === admin
- `apps/api/src/common/decorators/current-user.decorator.ts` — extracts request.user
- `apps/api/src/common/filters/http-exception.filter.ts` — consistent JSON error format
- `apps/api/src/app.module.ts` — AuthModule imported, HttpExceptionFilter as APP_FILTER
- `apps/api/src/supabase/supabase.service.ts` — fixed: `import type` for express
- `apps/api/test/auth/auth.service.spec.ts` — replaced Wave 0 stubs with 8 real unit tests
- `apps/api/vitest.config.ts` — added unplugin-swc for NestJS DI reflection

## Decisions Made

- **unplugin-swc for Vitest**: NestJS DI uses TypeScript decorator metadata (`emitDecoratorMetadata`) which standard Vite/esbuild doesn't emit. Added `unplugin-swc` + `@swc/core` as devDependencies and configured in vitest.config.ts. Tests now correctly resolve DI providers.
- **type-only express import**: `supabase.service.ts` used `import { Request } from 'express'`. Express is a transitive dep not directly accessible in pnpm. Changed to `import type` so Vite skips runtime resolution. No behavior change — Request is only used as a type annotation.
- **TokenRecord explicit type**: Supabase JS client infers `data` as the query result type but indexing the nullable array type with `[0]` fails in TS strict mode. Used explicit `TokenRecord` type instead.
- **Generic TUser on JwtGuard.handleRequest**: NestJS 11's `IAuthGuard` defines `handleRequest<TUser>(...): TUser`. Without the generic, TS 5.5 rejects the override. Fixed by matching the signature.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added unplugin-swc to enable NestJS DI in Vitest**
- **Found during:** Task 1 (TDD GREEN phase)
- **Issue:** NestJS `@Injectable()` DI uses `reflect-metadata` `design:paramtypes` which is only emitted with `emitDecoratorMetadata`. Vite/esbuild does not emit this, so injected dependencies were `undefined` at runtime.
- **Fix:** Installed `unplugin-swc` + `@swc/core` as devDependencies; added `swc.vite()` plugin to vitest.config.ts
- **Files modified:** apps/api/vitest.config.ts, apps/api/package.json, pnpm-lock.yaml
- **Verification:** All 8 tests pass with proper DI resolution
- **Committed in:** bd1de66 (Task 1)

**2. [Rule 1 - Bug] Changed `import` to `import type` for express in supabase.service.ts**
- **Found during:** Task 1 (after adding unplugin-swc)
- **Issue:** `import { Request } from 'express'` caused Vite to try to bundle express as a runtime dependency. Express is a transitive pnpm dep not directly resolvable.
- **Fix:** Changed to `import type { Request } from 'express'`
- **Files modified:** apps/api/src/supabase/supabase.service.ts
- **Verification:** Test suite loads without errors; build still compiles correctly
- **Committed in:** bd1de66 (Task 1)

**3. [Rule 1 - Bug] Explicit TokenRecord type for confirmPasswordReset**
- **Found during:** Task 2 (build verification)
- **Issue:** `(typeof tokens)[0]` fails when tokens is `T[] | null` — TypeScript strict mode rejects indexing a nullable array type
- **Fix:** Defined explicit `TokenRecord` interface inline
- **Files modified:** apps/api/src/auth/auth.service.ts
- **Verification:** `nest build` exits 0
- **Committed in:** acdf48a (Task 2)

**4. [Rule 1 - Bug] Generic TUser on JwtGuard.handleRequest**
- **Found during:** Task 2 (build verification)
- **Issue:** NestJS 11 `IAuthGuard` base type defines `handleRequest<TUser>(...): TUser`. Concrete signature without generic is incompatible.
- **Fix:** Added `<TUser = unknown>` generic matching base class signature
- **Files modified:** apps/api/src/auth/guards/jwt.guard.ts
- **Verification:** `nest build` exits 0
- **Committed in:** acdf48a (Task 2)

---

**Total deviations:** 4 auto-fixed (1 blocking infra, 3 type/import bugs)
**Impact on plan:** All fixes necessary for correctness and build. No scope creep.

## Issues Encountered

- Vitest mock chain reset: `vi.clearAllMocks()` wipes `.mockReturnThis()` implementations. Fixed by using a factory function (`buildSupabaseChain()`) to create a fresh mock per `beforeEach`. This is now the established pattern for Supabase chain mocks.

## User Setup Required

The following environment variables must be set for AuthModule to start:

| Variable | Where to get it |
|---|---|
| `SUPABASE_JWT_SECRET` | Supabase Dashboard > Project Settings > API > JWT Secret |
| `JWT_EXPIRES_IN` | Optional, defaults to `7d` |
| `SMTP_HOST` | Email provider (e.g., smtp.gmail.com) |
| `SMTP_PORT` | Email provider (e.g., 587) |
| `SMTP_USER` | Email account username |
| `SMTP_PASS` | Email account app password |
| `EMAIL_FROM` | From address (e.g., no-reply@thiepcoionline.vn) |
| `WEB_URL` | Frontend URL for reset links (e.g., http://localhost:3000) |

## Next Phase Readiness

- Auth endpoints ready for plan 01-04 (Next.js auth pages)
- JwtGuard and AdminGuard available for any protected NestJS route
- HttpExceptionFilter globally registered — all future errors auto-formatted
- password_reset_tokens table already seeded in Supabase schema (plan 01-02)

---
*Phase: 01-foundation*
*Completed: 2026-03-14*
