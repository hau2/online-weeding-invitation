---
phase: 10-agent-tier-and-storage-management
plan: 01
subsystem: api, database, auth
tags: [agent-tier, subscription, quota, nestjs, supabase, jwt]

# Dependency graph
requires:
  - phase: 07-monetization
    provides: "enforceFreeTierLimit, InvitationPlan type, premium/free tier system"
  - phase: 01-foundation
    provides: "JWT auth, SupabaseAdminService, cookie-based JwtGuard"
provides:
  - "Agent tier DB schema (tier, subscription_start, subscription_end columns)"
  - "UserTier and UserProfile shared types"
  - "GET /auth/me profile endpoint with agent quota info"
  - "Agent-aware publish quota enforcement (20/cycle)"
  - "Agent auto-premium at publish time"
affects: [10-02, 10-03, 10-04, admin-panel, dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Agent tier orthogonal to role (user/admin vs user/agent)", "Cycle-based quota with 30-day rolling window from subscription_start"]

key-files:
  created:
    - "supabase/migrations/013_agent_tier.sql"
  modified:
    - "packages/types/src/user.ts"
    - "packages/types/src/admin.ts"
    - "apps/api/src/auth/auth.controller.ts"
    - "apps/api/src/auth/auth.service.ts"
    - "apps/api/src/invitations/invitations.service.ts"
    - "apps/api/src/admin/admin.service.ts"

key-decisions:
  - "Tier is orthogonal to role: role controls admin access (user/admin), tier controls subscription level (user/agent)"
  - "Tier is NOT stored in JWT -- queried from DB at runtime for profile and publish enforcement"
  - "Agent quota uses 30-day rolling cycle from subscription_start, advancing by 30-day periods"
  - "Agent auto-premium sets plan='premium' at publish time, not at draft creation"
  - "CookieJwtGuard (jose-based) used for /me endpoint, separate from Passport-based JwtGuard for auth endpoints"

patterns-established:
  - "enforcePublishLimit: unified method for both agent and free-tier publish enforcement"
  - "effectivePlan pattern: user tier lookup determines plan override at publish time"

requirements-completed: [AGT-01, AGT-03, AGT-04, AGT-08]

# Metrics
duration: 5min
completed: 2026-03-17
---

# Phase 10 Plan 01: Agent Tier Backend Foundation Summary

**Agent tier DB schema with subscription columns, GET /auth/me profile endpoint returning quota info, and agent-aware 20/cycle publish enforcement with auto-premium**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-17T16:42:57Z
- **Completed:** 2026-03-17T16:48:30Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Migration 013_agent_tier.sql adds tier column with CHECK constraint and subscription date columns to users table
- GET /auth/me endpoint returns full UserProfile with quotaUsed, quotaLimit, daysRemaining for agents
- enforcePublishLimit handles both agent (20/cycle) and free-tier (1 live) quota enforcement
- Agent-published invitations automatically set to plan='premium' at publish time (both publish and publishSaveTheDate)

## Task Commits

Each task was committed atomically:

1. **Task 1: DB migration, shared types, and /me endpoint** - `444408f` (feat)
2. **Task 2: Agent-aware quota enforcement at publish time** - `87f36ea` (feat)

## Files Created/Modified
- `supabase/migrations/013_agent_tier.sql` - Agent tier columns on users table with CHECK constraint
- `packages/types/src/user.ts` - Added UserTier type and UserProfile interface
- `packages/types/src/admin.ts` - Added tier, subscriptionStart, subscriptionEnd to AdminUser
- `apps/api/src/auth/auth.controller.ts` - Added GET /me endpoint with CookieJwtGuard
- `apps/api/src/auth/auth.service.ts` - Added getProfile method with agent cycle quota computation
- `apps/api/src/invitations/invitations.service.ts` - Renamed to enforcePublishLimit, added agent quota and auto-premium
- `apps/api/src/admin/admin.service.ts` - Updated user queries to include tier/subscription fields

## Decisions Made
- Tier is orthogonal to role: role controls admin access (user/admin), tier controls subscription level (user/agent). They serve different purposes and coexist independently.
- Tier is NOT in JWT -- queried at runtime from DB. This avoids JWT bloat and ensures tier changes take immediate effect without re-login.
- CookieJwtGuard (jose-based from common/guards/) used for /me endpoint, aliased as CookieJwtGuard to coexist with Passport-based JwtGuard already used for logout.
- Agent auto-premium applies at publish time only. Drafts remain plan='free' until published, matching the context decision that subscription fee covers premium quality.
- Cycle computation advances subscription_start forward by 30-day periods until the next advance would be in the future -- ensures correct cycle boundary regardless of how many months have elapsed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated admin service to include tier/subscription fields**
- **Found during:** Task 1 (after adding tier/subscription to AdminUser type)
- **Issue:** AdminUser type gained 3 new required fields (tier, subscriptionStart, subscriptionEnd) but admin.service.ts was not selecting or mapping them, causing TypeScript compilation failure
- **Fix:** Added tier, subscription_start, subscription_end to SELECT queries in listUsers and getUserDetail; added fields to mapping functions
- **Files modified:** apps/api/src/admin/admin.service.ts
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** 444408f (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary for TypeScript compilation after type changes. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Agent tier backend foundation complete: schema, types, /me endpoint, quota enforcement all in place
- Plan 10-02 can build admin UI for agent management (grant tier, renew subscription)
- Plan 10-03 can build draft auto-delete cron
- Plan 10-04 can build storage cleanup and dashboard quota bar

## Self-Check: PASSED

All 6 created/modified files verified on disk. Both task commits (444408f, 87f36ea) verified in git log.

---
*Phase: 10-agent-tier-and-storage-management*
*Completed: 2026-03-17*
