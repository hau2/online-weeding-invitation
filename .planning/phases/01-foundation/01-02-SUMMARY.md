---
phase: 01-foundation
plan: "02"
subsystem: database
tags: [supabase, postgresql, rls, nestjs, vitest, two-client-pattern]

# Dependency graph
requires: []
provides:
  - "PostgreSQL schema with 3 RLS-enabled tables: users, invitations (shell), password_reset_tokens"
  - "NestJS SupabaseAdminService (singleton, service role, bypasses RLS)"
  - "NestJS SupabaseUserService (REQUEST-scoped, Bearer JWT, respects RLS)"
  - "SupabaseModule exporting both services for injection across app"
  - "Vitest test infrastructure with reflect-metadata setup"
  - "Wave 0 test stubs for auth (auth.service.spec.ts) and RLS (rls.e2e.spec.ts)"
affects:
  - 01-03-auth-module
  - 02-app-shell
  - 03-invitation-management
  - 04-invitation-public-page

# Tech tracking
tech-stack:
  added:
    - "@supabase/supabase-js ^2.99.0 — Supabase JS client (both admin and user clients)"
    - "vitest ^2.0.0 — test runner replacing Jest"
    - "@nestjs/config ^3.0.0 — env var injection into services"
  patterns:
    - "Two-client Supabase pattern: SupabaseAdminService (singleton) + SupabaseUserService (REQUEST-scoped)"
    - "RLS policy pattern: USING (auth.uid() = id AND deleted_at IS NULL) for soft-delete-aware access"
    - "Partial unique index on nullable column: WHERE slug IS NOT NULL"
    - "Wave 0 test stubs: placeholder tests that pass today, replaced with real tests in later plans"

key-files:
  created:
    - supabase/migrations/001_foundation_schema.sql
    - supabase/seed.sql
    - supabase/config.toml
    - apps/api/src/supabase/supabase.service.ts
    - apps/api/src/supabase/supabase.module.ts
    - apps/api/vitest.config.ts
    - apps/api/test/setup.ts
    - apps/api/test/auth/auth.service.spec.ts
    - apps/api/test/rls.e2e.spec.ts
  modified: []

key-decisions:
  - "SupabaseUserService is REQUEST-scoped (not singleton) to prevent JWT leakage between concurrent requests"
  - "password_reset_tokens has RLS enabled but zero user-facing policies — service role is the only accessor"
  - "Slug uniqueness enforced at DB level with partial unique index (WHERE slug IS NOT NULL) not app logic"
  - "Wave 0 RLS tests use it.todo() — require live Supabase connection, implemented in later integration phase"

patterns-established:
  - "Two-client injection: inject SupabaseAdminService for system ops, SupabaseUserService for user-scoped queries"
  - "RLS USING clause always includes deleted_at IS NULL for soft-delete awareness"
  - "ConfigService.getOrThrow() pattern — fails fast at startup if env vars are missing"

requirements-completed: [SYST-03]

# Metrics
duration: 4min
completed: 2026-03-14
---

# Phase 1 Plan 02: Supabase Schema and NestJS Two-Client Module Summary

**RLS-enabled PostgreSQL schema (3 tables) with NestJS two-client Supabase pattern (admin singleton + REQUEST-scoped user client) and Vitest test infrastructure**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-14T13:30:20Z
- **Completed:** 2026-03-14T13:34:21Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Created full Phase 1 PostgreSQL schema with RLS on users, invitations, and password_reset_tokens tables — 6 policies total using auth.uid() sub claim
- Built NestJS two-client Supabase pattern: SupabaseAdminService (singleton, service role) and SupabaseUserService (REQUEST-scoped, user JWT), both injectable via SupabaseModule
- Established Vitest test infrastructure with 9 passing Wave 0 stubs and 4 pending RLS integration todos

## Task Commits

Each task was committed atomically:

1. **Task 1: Write Supabase PostgreSQL schema migration with RLS policies** - `601ed9b` (feat)
2. **Task 2: NestJS Supabase module (two-client pattern) and Vitest test infrastructure** - `877e32c` (feat)

**Plan metadata:** committed separately (docs)

## Files Created/Modified

- `supabase/migrations/001_foundation_schema.sql` - Full Phase 1 schema: users + invitations (shell) + password_reset_tokens, 3x RLS, 6 policies, 7 indexes, set_updated_at() triggers
- `supabase/seed.sql` - Commented placeholder for dev seed data
- `supabase/config.toml` - Minimal Supabase local dev config (project_id only)
- `apps/api/src/supabase/supabase.service.ts` - SupabaseAdminService (singleton) and SupabaseUserService (REQUEST-scoped) implementations
- `apps/api/src/supabase/supabase.module.ts` - NestJS module exporting both services
- `apps/api/vitest.config.ts` - Vitest config: node environment, reflect-metadata setup file, includes test/**/*.spec.ts
- `apps/api/test/setup.ts` - Global beforeAll setting default env vars for test environment
- `apps/api/test/auth/auth.service.spec.ts` - Wave 0 stubs: 9 placeholder assertions for register/login/logout/resetPassword (to be implemented in plan 01-03)
- `apps/api/test/rls.e2e.spec.ts` - Wave 0 RLS todos: 4 it.todo() requiring live Supabase (SYST-03)

## Decisions Made

- SupabaseUserService uses `Scope.REQUEST` (not default singleton) to guarantee a fresh client per HTTP request — prevents JWT from leaking between concurrent user requests in NestJS DI container
- `password_reset_tokens` has RLS enabled but zero user-facing SELECT/UPDATE/DELETE policies — service role bypasses RLS and is the only client that touches this table; prevents token enumeration attacks
- Partial unique index `WHERE slug IS NOT NULL` enforces slug uniqueness at DB level without blocking rows where slug is NULL (draft invitations)
- Wave 0 RLS tests use `it.todo()` rather than skipped/disabled tests — clearly signals intent, shows up in test output, replaced with real tests when live Supabase is configured

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — `pnpm --filter api test` passed on first run after install. Peer warnings from @nestjs/jwt and @nestjs/config targeting NestJS v8-10 against installed v11 are non-blocking (tests still pass).

## User Setup Required

**External services require manual configuration.** The migration SQL must be applied to Supabase Cloud:

1. Create a new Supabase project at https://supabase.com/dashboard
2. Get env vars from Project Settings -> Data API:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (anon/public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key)
   - `SUPABASE_JWT_SECRET` (JWT Secret — must be HS256 HMAC, not asymmetric)
3. Open SQL Editor -> New query and paste contents of `supabase/migrations/001_foundation_schema.sql` then execute
4. Confirm JWT signing uses HS256 (legacy JWT Secret) — new 2025 projects may default to asymmetric keys

## Next Phase Readiness

- Schema is ready for NestJS auth module (plan 01-03) which will use SupabaseAdminService to write users and password_reset_tokens
- SupabaseModule is ready for injection into AuthModule
- Wave 0 test stubs in auth.service.spec.ts will be filled in during plan 01-03
- RLS integration tests (rls.e2e.spec.ts) require live Supabase — implement after environment is configured

---
*Phase: 01-foundation*
*Completed: 2026-03-14*
