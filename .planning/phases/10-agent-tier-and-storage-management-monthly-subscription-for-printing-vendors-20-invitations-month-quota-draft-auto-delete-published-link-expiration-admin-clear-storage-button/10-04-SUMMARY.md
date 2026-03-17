---
phase: 10-agent-tier-and-storage-management
plan: 04
subsystem: ui, dashboard
tags: [agent-tier, quota-bar, dashboard, draft-warning, react, nextjs]

# Dependency graph
requires:
  - phase: 10-agent-tier-and-storage-management
    plan: 01
    provides: "UserProfile type, GET /auth/me endpoint, agent tier schema"
provides:
  - "AgentQuotaBar component showing X/20 published with days remaining"
  - "Agent-aware dashboard greeting with Dai ly badge"
  - "Draft auto-delete warning badges on InvitationCard (all users)"
  - "Server-side user profile fetch on dashboard page"
affects: [dashboard, invitation-cards]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Conditional stat card replacement based on user tier", "Draft age calculation from createdAt for warning badges"]

key-files:
  created:
    - "apps/web/components/app/AgentQuotaBar.tsx"
  modified:
    - "apps/web/app/(app)/dashboard/page.tsx"
    - "apps/web/components/app/DashboardClient.tsx"
    - "apps/web/components/app/InvitationCard.tsx"

key-decisions:
  - "AgentQuotaBar replaces plan stat card (not added alongside) to maintain 3-column grid"
  - "Draft warning badges apply to ALL users, not just agents, per CONTEXT.md"
  - "Warning threshold is 7 days before 30-day auto-delete; danger badge at 0 or fewer days"
  - "User profile fetched in parallel with invitations via Promise.all for no added latency"

patterns-established:
  - "Tier-conditional rendering: isAgent derived from userProfile?.tier === 'agent' for all agent-specific UI"
  - "Draft days-left calculation: 30 - floor((now - createdAt) / day) reusable for any draft age concern"

requirements-completed: [AGT-04, AGT-06, AGT-08]

# Metrics
duration: 3min
completed: 2026-03-17
---

# Phase 10 Plan 04: Agent Dashboard UI and Draft Warning Badges Summary

**Agent quota progress bar replacing plan card on dashboard, Dai ly badge in greeting, and draft auto-delete warning badges on all users' invitation cards**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-17T16:56:35Z
- **Completed:** 2026-03-17T16:59:36Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- AgentQuotaBar component with progress bar, near-limit red warning, and expiry status for agent tier users
- Dashboard server component fetches user profile in parallel with invitations (no latency increase)
- Agent users see quota bar instead of "Thanh toan theo luot" plan card, with "Dai ly" badge in greeting
- All users see draft warning badges when drafts are within 7 days of 30-day auto-delete (amber for warning, red for imminent)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fetch user profile and create AgentQuotaBar component** - `89455e6` (feat)
2. **Task 2: Dashboard agent UI and draft warning badges** - `bbdaf69` (feat)

## Files Created/Modified
- `apps/web/components/app/AgentQuotaBar.tsx` - Agent quota progress bar with Stitch styling, near-limit and expiry states
- `apps/web/app/(app)/dashboard/page.tsx` - Added getUserProfile server function, parallel fetch with Promise.all
- `apps/web/components/app/DashboardClient.tsx` - Agent-aware greeting, Dai ly badge, conditional AgentQuotaBar vs plan card
- `apps/web/components/app/InvitationCard.tsx` - Draft auto-delete warning badges with days remaining countdown

## Decisions Made
- AgentQuotaBar replaces the "Goi hien tai" stat card entirely when user is agent, maintaining the 3-column grid layout without adding a 4th card
- Draft warning badges use AlertTriangle icon from lucide-react for visual consistency with the design system
- Warning threshold set at 7 days (amber badge), danger at 0 or fewer days (red badge using ec1349 accent)
- User profile fetch uses same cookie-based pattern as getInvitations for consistency; returns null on failure for graceful degradation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added userProfile prop to DashboardClient in Task 1**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** Dashboard page passes userProfile prop to DashboardClient, but the component interface did not accept it yet (Task 2 was supposed to add it)
- **Fix:** Added UserProfile import and userProfile prop to DashboardClientProps interface in Task 1 to allow compilation
- **Files modified:** apps/web/components/app/DashboardClient.tsx
- **Verification:** `npx tsc --noEmit` passes with only pre-existing test file errors
- **Committed in:** 89455e6 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to maintain per-task compilation. The prop interface addition was simply moved from Task 2 to Task 1. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 plans in Phase 10 are now complete
- Agent tier system is fully operational: schema, types, /me endpoint, quota enforcement, admin management, draft auto-delete cron, storage cleanup, and dashboard UI
- Agent users see quota progress on dashboard; all users see draft expiry warnings

## Self-Check: PASSED
