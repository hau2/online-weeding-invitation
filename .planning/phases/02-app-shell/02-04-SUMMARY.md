---
phase: 02-app-shell
plan: 04
subsystem: api
tags: [nestjs, supabase, jwt, jose, cookie-parser, class-validator, invitations, ownership-enforcement]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: NestJS project structure, SupabaseModule (AdminService + UserService), AuthModule with JWT signing
provides:
  - GET /invitations endpoint (list by owner, soft-delete exclusion)
  - POST /invitations endpoint (create draft with ownership from JWT)
  - Cookie-based JwtGuard using jose for session verification
  - CurrentUser decorator with JwtPayload interface
  - CreateInvitationDto with validation (no userId field)
  - InvitationsModule registered in AppModule
affects: [02-app-shell, 03-editor, 04-publish]

# Tech tracking
tech-stack:
  added: [jose, cookie-parser]
  patterns: [cookie-based-jwt-guard, snake-to-camel-mapping, ownership-from-jwt-only]

key-files:
  created:
    - apps/api/src/common/guards/jwt.guard.ts
    - apps/api/src/invitations/invitations.service.ts
    - apps/api/src/invitations/invitations.controller.ts
    - apps/api/src/invitations/invitations.module.ts
    - apps/api/src/invitations/dto/create-invitation.dto.ts
    - apps/api/src/invitations/__tests__/invitations.service.spec.ts
  modified:
    - apps/api/src/common/decorators/current-user.decorator.ts
    - apps/api/src/main.ts
    - apps/api/src/app.module.ts
    - apps/api/package.json

key-decisions:
  - "Cookie-based JwtGuard (jose) in common/guards/ separate from Passport-based guard in auth/guards/ -- each module uses the appropriate strategy"
  - "InvitationRow interface with explicit cast for Supabase untyped client -- avoids GenericStringError TS build failures"
  - "SUPABASE_JWT_SECRET env var reused (not JWT_SECRET) for consistency with existing auth module"
  - "mapRow helper function extracts snake_case-to-camelCase mapping to avoid duplication between list and create"

patterns-established:
  - "Cookie-based JwtGuard: reads httpOnly session cookie, verifies with jose, populates req.user"
  - "Ownership enforcement: userId always from @CurrentUser().sub, never from request body"
  - "DB row mapping: typed InvitationRow interface + mapRow() for snake_case to camelCase conversion"
  - "DTO validation: class-validator decorators with Vietnamese error messages, whitelist mode strips unknown fields"

requirements-completed: [DASH-01, DASH-02]

# Metrics
duration: 5min
completed: 2026-03-14
---

# Phase 2 Plan 04: Invitations API Summary

**NestJS invitations module with GET/POST endpoints, cookie-based JwtGuard using jose, ownership enforcement via JWT sub claim, and 8 unit tests**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-14T15:35:56Z
- **Completed:** 2026-03-14T15:41:23Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Cookie-based JwtGuard using jose that reads httpOnly session cookie and verifies JWT
- GET /invitations returns only authenticated user's invitations (excludes soft-deleted, ordered by created_at DESC)
- POST /invitations creates draft invitation with user_id from JWT (never from request body)
- CreateInvitationDto validates brideName, groomName, templateId with class-validator (no userId field)
- InvitationsModule registered in AppModule, routes active
- 8 unit tests covering ownership filtering, camelCase mapping, error handling, and create behavior

## Task Commits

Each task was committed atomically:

1. **Task 1: JwtGuard, CurrentUser decorator, CreateInvitationDto** - `6345f9f` (feat)
2. **Task 2 RED: Failing tests for InvitationsService** - `c942d7a` (test)
3. **Task 2 GREEN: InvitationsService, Controller, Module, AppModule** - `30852e3` (feat)

## Files Created/Modified
- `apps/api/src/common/guards/jwt.guard.ts` - Cookie-based JWT guard using jose (separate from Passport guard in auth/)
- `apps/api/src/common/decorators/current-user.decorator.ts` - Updated with JwtPayload interface export
- `apps/api/src/invitations/invitations.service.ts` - listByUser and create with ownership enforcement
- `apps/api/src/invitations/invitations.controller.ts` - GET and POST endpoints protected by JwtGuard
- `apps/api/src/invitations/invitations.module.ts` - Module wiring controller, service, SupabaseModule
- `apps/api/src/invitations/dto/create-invitation.dto.ts` - Validation DTO with no userId field
- `apps/api/src/invitations/__tests__/invitations.service.spec.ts` - 8 unit tests
- `apps/api/src/main.ts` - Added cookie-parser middleware
- `apps/api/src/app.module.ts` - Added InvitationsModule import
- `apps/api/package.json` - Added jose, cookie-parser dependencies

## Decisions Made
- Cookie-based JwtGuard (jose) in common/guards/ is separate from the Passport-based guard in auth/guards/ -- each serves a different authentication flow (cookie vs Bearer token)
- Used SUPABASE_JWT_SECRET (not JWT_SECRET) for consistency with the existing auth module
- Created InvitationRow interface to type-cast Supabase client responses, avoiding GenericStringError TypeScript build failures without requiring generated Supabase types
- Extracted mapRow() helper to DRY the snake_case-to-camelCase conversion between listByUser and create

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added InvitationRow interface for TypeScript build**
- **Found during:** Task 2 (InvitationsService implementation)
- **Issue:** Supabase client without generated types returns GenericStringError, causing 17 TS2339 errors on row property access
- **Fix:** Defined InvitationRow interface and cast data responses, extracted mapRow() helper
- **Files modified:** apps/api/src/invitations/invitations.service.ts
- **Verification:** pnpm --filter api build exits 0, all tests still pass
- **Committed in:** 30852e3

**2. [Rule 3 - Blocking] Used SUPABASE_JWT_SECRET instead of JWT_SECRET**
- **Found during:** Task 1 (JwtGuard implementation)
- **Issue:** Plan specified JWT_SECRET but existing codebase uses SUPABASE_JWT_SECRET consistently
- **Fix:** Used SUPABASE_JWT_SECRET in the new JwtGuard for consistency
- **Files modified:** apps/api/src/common/guards/jwt.guard.ts
- **Verification:** Build passes, env var matches existing auth module
- **Committed in:** 6345f9f

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary for build correctness and env var consistency. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Invitations API ready for dashboard frontend (Plan 02-02) to consume
- GET /invitations and POST /invitations endpoints registered and tested
- Cookie-based auth guard pattern established for future protected API modules
- Editor phase (Phase 3) can extend InvitationsService with update/delete operations

## Self-Check: PASSED

All 8 created/modified files verified on disk. All 3 task commits (6345f9f, c942d7a, 30852e3) verified in git log.

---
*Phase: 02-app-shell*
*Completed: 2026-03-14*
