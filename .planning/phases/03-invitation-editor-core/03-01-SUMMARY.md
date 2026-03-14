---
phase: 03-invitation-editor-core
plan: 01
subsystem: api
tags: [nestjs, supabase, crud, dto, slug, class-validator, mapped-types]

requires:
  - phase: 02-app-shell
    provides: "InvitationsController with list/create, SupabaseModule with admin+user clients, JwtGuard, CurrentUser decorator"
provides:
  - "GET /invitations/:id endpoint for single invitation retrieval"
  - "PATCH /invitations/:id endpoint for partial auto-save updates"
  - "POST /invitations/:id/publish with slug generation (locked on first publish)"
  - "POST /invitations/:id/unpublish to revert status without clearing slug"
  - "UpdateInvitationDto with PartialType for optional field validation"
  - "findOne, update, publish, unpublish service methods"
affects: [03-invitation-editor-core, 05-public-invitation-page, 08-admin-analytics]

tech-stack:
  added: ["@nestjs/mapped-types"]
  patterns: ["camelCase-to-snake_case dynamic field mapping for partial updates", "admin client for slug writes bypassing RLS", "crypto.randomBytes for slug suffix generation"]

key-files:
  created:
    - "apps/api/src/invitations/dto/update-invitation.dto.ts"
  modified:
    - "apps/api/src/invitations/invitations.service.ts"
    - "apps/api/src/invitations/invitations.controller.ts"
    - "apps/api/src/invitations/__tests__/invitations.service.spec.ts"

key-decisions:
  - "SupabaseAdminService used for slug writes to bypass RLS -- user client cannot write to slug column"
  - "crypto.randomBytes for slug suffix instead of nanoid -- nanoid v4+ is ESM-only, incompatible with NestJS CJS"
  - "Dynamic FIELD_MAP for camelCase-to-snake_case conversion -- only sends present fields to avoid nullifying undefined ones"
  - "ParseUUIDPipe on all :id params for input validation at controller level"

patterns-established:
  - "Dynamic partial update pattern: iterate FIELD_MAP, include only defined DTO keys in Supabase update object"
  - "Slug immutability: generate once on first publish, never overwrite on re-publish"
  - "Admin client for privileged writes: use SupabaseAdminService when RLS prevents user-scoped write"

requirements-completed: [EDIT-03, EDIT-10, SYST-02]

duration: 4min
completed: 2026-03-14
---

# Phase 3 Plan 01: CRUD & Publish Endpoints Summary

**NestJS PATCH/GET/publish/unpublish endpoints with UpdateInvitationDto, slug generation via crypto.randomBytes, and 20 unit tests**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-14T22:25:43Z
- **Completed:** 2026-03-14T22:29:42Z
- **Tasks:** 2
- **Files modified:** 5 (including package.json/lockfile)

## Accomplishments
- UpdateInvitationDto with PartialType for class-validator PATCH validation
- findOne/update/publish/unpublish service methods with ownership checks
- Slug generation with diacritics normalization and collision retry (up to 3 attempts)
- 4 new controller endpoints wired with ParseUUIDPipe and JwtGuard
- 12 new unit tests (20 total) all passing

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): failing tests** - `4070f7d` (test)
2. **Task 1 (GREEN): UpdateInvitationDto + service methods** - `b6fa8f3` (feat)
3. **Task 2: Controller endpoints** - `bdf8695` (feat)

_Note: Task 1 was TDD with RED-GREEN commits. No REFACTOR needed._

## Files Created/Modified
- `apps/api/src/invitations/dto/update-invitation.dto.ts` - PartialType DTO with class-validator decorators and Vietnamese error messages
- `apps/api/src/invitations/invitations.service.ts` - Added findOne, update, publish, unpublish methods; injected SupabaseAdminService; added generateSlug with diacritics normalization
- `apps/api/src/invitations/invitations.controller.ts` - Added GET/:id, PATCH/:id, POST/:id/publish, POST/:id/unpublish with ParseUUIDPipe
- `apps/api/src/invitations/__tests__/invitations.service.spec.ts` - 12 new tests for findOne, update, publish, unpublish, slug immutability
- `apps/api/package.json` - Added @nestjs/mapped-types dependency

## Decisions Made
- Used SupabaseAdminService for slug writes to bypass RLS (user client cannot write slug column)
- Used crypto.randomBytes for slug suffix (nanoid v4+ is ESM-only, incompatible with NestJS CJS)
- Built FIELD_MAP constant for camelCase-to-snake_case dynamic mapping in partial updates
- ParseUUIDPipe applied on all :id route params for early input validation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing @nestjs/mapped-types dependency**
- **Found during:** Task 2 (controller endpoints, TypeScript compilation check)
- **Issue:** @nestjs/mapped-types not in package.json, PartialType import failing TypeScript compilation
- **Fix:** Ran `pnpm add @nestjs/mapped-types --filter api`
- **Files modified:** apps/api/package.json, pnpm-lock.yaml
- **Verification:** TypeScript compiles cleanly, all 28 tests pass
- **Committed in:** bdf8695 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential dependency for PartialType. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 CRUD+publish endpoints ready for frontend editor consumption (Phase 03 Plan 02+)
- Slug generation locked on first publish per SYST-02 requirement
- Auto-save target (PATCH) ready for debounced editor saves

## Self-Check: PASSED

All 4 source files verified on disk. All 3 commits (4070f7d, b6fa8f3, bdf8695) verified in git log.

---
*Phase: 03-invitation-editor-core*
*Completed: 2026-03-14*
