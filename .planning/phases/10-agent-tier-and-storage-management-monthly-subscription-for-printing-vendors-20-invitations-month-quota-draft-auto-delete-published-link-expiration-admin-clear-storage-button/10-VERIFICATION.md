---
phase: 10-agent-tier-and-storage-management
verified: 2026-03-18T00:00:00Z
status: passed
score: 13/13 must-haves verified
re_verification: false
---

# Phase 10: Agent Tier and Storage Management — Verification Report

**Phase Goal:** Add "Agent" user tier for printing vendors (monthly subscription via manual bank transfer, 20 Premium invitations/month, admin grants/renews with admin-specified start date). Draft auto-delete after 30 days from createdAt. Admin Clear Storage button for expired/deleted media cleanup. Agent quota enforcement at publish time.
**Verified:** 2026-03-18
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Agent tier columns exist in users table with CHECK constraint | VERIFIED | `013_agent_tier.sql`: ALTER TABLE adds `tier TEXT NOT NULL DEFAULT 'user' CHECK (tier IN ('user', 'agent'))`, `subscription_start`, `subscription_end` |
| 2 | GET /auth/me returns user profile with tier, subscription dates, quota used, quota limit, days remaining | VERIFIED | `auth.controller.ts` line 31-34: `@Get('me')` with `CookieJwtGuard` calls `authService.getProfile(user.sub)`. `auth.service.ts` lines 174-256: full `getProfile` implementation returns `UserProfile` with all fields |
| 3 | Agent with active subscription can publish up to 20 invitations per cycle; attempt #21 is rejected with Vietnamese error | VERIFIED | `invitations.service.ts` lines 977-1011: `enforcePublishLimit` checks `user.tier === 'agent'`, verifies subscription active, computes cycle start, counts published invitations, throws `'Da dat gioi han 20 thiep/thang. Vui long cho chu ky moi.'` at count >= 20 |
| 4 | Agent with expired subscription cannot publish new invitations | VERIFIED | `invitations.service.ts` lines 979-983: throws `'Goi dai ly da het han. Vui long gia han de tiep tuc xuat ban.'` when `subscription_end < now` |
| 5 | Agent-published invitations are automatically set to plan='premium' | VERIFIED | `invitations.service.ts` lines 1077, 1148: `effectivePlan` computed as `'premium'` when `tier === 'agent'`; used in both `publishSaveTheDate` and `publish` update calls |
| 6 | Regular free-tier enforcement still works unchanged | VERIFIED | `invitations.service.ts` lines 1013-1031: after agent check returns, free-tier logic `if (plan !== 'free') return` with count >= 1 block is fully intact |
| 7 | Draft auto-delete cron runs daily and removes drafts older than 30 days from createdAt that have never been published (slug IS NULL) | VERIFIED | `draft-cleanup-cron.service.ts`: `@Cron('0 1 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })` calls `deleteExpiredDrafts()`. Service queries `status=draft, slug IS NULL, deleted_at IS NULL, created_at < thirtyDaysAgo` and hard-deletes each record |
| 8 | Deleted drafts have their media removed from Supabase Storage | VERIFIED | `invitations.service.ts` lines 1560-1582: `deleteInvitationMedia` iterates `['invitation-photos', 'bank-qr', 'qr-codes']` buckets, lists and removes files per invitation; called in `deleteExpiredDrafts` before each hard delete |
| 9 | Admin can grant agent tier with admin-specified subscription start date; can renew and revoke | VERIFIED | `admin.controller.ts` lines 95-113: `POST /admin/users/:id/grant-agent` (body with optional `subscriptionStart`), `POST /admin/users/:id/renew-agent`, `POST /admin/users/:id/revoke-agent`. `admin.service.ts` lines 954-1045: full implementations with date computation, renewal from now, tier reset on revoke |
| 10 | Admin can clear storage for expired/soft-deleted invitations without touching active media | VERIFIED | `admin.controller.ts` line 120-123: `POST /admin/clear-storage`. `admin.service.ts` lines 1053-1101: queries `status=expired OR deleted_at IS NOT NULL` only, cleans 3 storage buckets per invitation |
| 11 | Agent user sees quota progress bar on dashboard with days remaining and Dai ly indicator | VERIFIED | `AgentQuotaBar.tsx`: full progress bar component with `published/limit`, `daysRemaining`, expiry state. `DashboardClient.tsx` lines 54-61: conditionally renders `AgentQuotaBar` when `isAgent`. Lines 30-38: "Dai ly" badge and agent-specific greeting |
| 12 | All users see draft warning badge when draft is within 7 days of 30-day auto-delete | VERIFIED | `InvitationCard.tsx` lines 54-88: `draftDaysLeft` computed from `createdAt`, `showDraftWarning` at <= 7 days (amber badge with days count), `showDraftDanger` at <= 0 (red badge "Sap bi xoa") |
| 13 | Admin settings page has Clear Storage section with confirmation dialog | VERIFIED | `cai-dat/page.tsx` lines 29-31, 124-135, 371-410: state variables, `handleClearStorage` POSTing to `/admin/clear-storage`, Section 5 "Doc dep luu tru" with inline confirmation dialog and result display |

**Score:** 13/13 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/013_agent_tier.sql` | Agent tier columns on users table | VERIFIED | EXISTS, SUBSTANTIVE, WIRED — tier CHECK constraint + subscription columns + index |
| `packages/types/src/user.ts` | UserTier type and UserProfile interface | VERIFIED | EXISTS, SUBSTANTIVE — `UserTier`, `UserProfile` both exported |
| `packages/types/src/admin.ts` | AdminUser extended with tier/subscription | VERIFIED | EXISTS, SUBSTANTIVE — `tier: string`, `subscriptionStart`, `subscriptionEnd` on `AdminUser` |
| `apps/api/src/auth/auth.controller.ts` | GET /auth/me endpoint | VERIFIED | EXISTS, SUBSTANTIVE, WIRED — `@Get('me')` with `CookieJwtGuard` calls `authService.getProfile` |
| `apps/api/src/auth/auth.service.ts` | getProfile method | VERIFIED | EXISTS, SUBSTANTIVE — full implementation with cycle computation, quota counting |
| `apps/api/src/invitations/invitations.service.ts` | enforcePublishLimit, deleteExpiredDrafts, deleteInvitationMedia | VERIFIED | EXISTS, SUBSTANTIVE — all three methods present and fully implemented |
| `apps/api/src/invitations/expiry/draft-cleanup-cron.service.ts` | DraftCleanupCronService | VERIFIED | EXISTS, SUBSTANTIVE, WIRED — registered in `invitations.module.ts` providers |
| `apps/api/src/invitations/invitations.module.ts` | DraftCleanupCronService registered | VERIFIED | EXISTS, SUBSTANTIVE — both `ExpiryCronService` and `DraftCleanupCronService` in providers |
| `apps/api/src/admin/admin.controller.ts` | grant-agent, renew-agent, revoke-agent, clear-storage endpoints | VERIFIED | EXISTS, SUBSTANTIVE, WIRED — all 4 endpoints present, calling correct service methods |
| `apps/api/src/admin/admin.service.ts` | grantAgentTier, renewAgentSubscription, revokeAgentTier, clearExpiredStorage | VERIFIED | EXISTS, SUBSTANTIVE — all 4 methods fully implemented |
| `apps/web/components/app/AgentQuotaBar.tsx` | Agent quota progress bar component | VERIFIED | EXISTS, SUBSTANTIVE, WIRED — imported and used in `DashboardClient.tsx` |
| `apps/web/app/(app)/dashboard/page.tsx` | Server-side user profile fetch | VERIFIED | EXISTS, SUBSTANTIVE, WIRED — `getUserProfile` fetches `/auth/me`, passed to `DashboardClient` |
| `apps/web/components/app/DashboardClient.tsx` | Agent-aware dashboard | VERIFIED | EXISTS, SUBSTANTIVE, WIRED — accepts `userProfile` prop, renders `AgentQuotaBar` conditionally |
| `apps/web/components/app/InvitationCard.tsx` | Draft warning badge | VERIFIED | EXISTS, SUBSTANTIVE — warning badge with days countdown, danger badge, both rendered |
| `apps/web/components/admin/UserDetailDialog.tsx` | Agent tier controls | VERIFIED | EXISTS, SUBSTANTIVE, WIRED — tier badge, grant/renew/revoke buttons, date input, all wired to API endpoints |
| `apps/web/app/(admin)/admin/cai-dat/page.tsx` | Storage cleanup section | VERIFIED | EXISTS, SUBSTANTIVE, WIRED — "Doc dep luu tru" section with confirmation dialog calling `/admin/clear-storage` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `auth.controller.ts` | `auth.service.ts` | `getProfile` method call | WIRED | Line 34: `return this.authService.getProfile(user.sub)` |
| `invitations.service.ts` | supabase users table | tier check in `enforcePublishLimit` | WIRED | Lines 962-966: `.from('users').select('tier, subscription_start, subscription_end')` |
| `draft-cleanup-cron.service.ts` | `invitations.service.ts` | `deleteExpiredDrafts` call | WIRED | Line 24: `await this.invitationsService.deleteExpiredDrafts()` |
| `admin.controller.ts` | `admin.service.ts` | `grantAgentTier`, `clearExpiredStorage` | WIRED | Lines 101, 107, 113, 123: all 4 new endpoints call correct service methods |
| `UserDetailDialog.tsx` | `/admin/users/:id/grant-agent` | apiFetch POST with `subscriptionStart` body | WIRED | Line 164-167: `apiFetch(`/admin/users/${userId}/grant-agent`, { method: 'POST', body: { subscriptionStart: grantStartDate || undefined } })` |
| `UserDetailDialog.tsx` | `/admin/users/:id/renew-agent` and `/admin/users/:id/revoke-agent` | apiFetch POST calls | WIRED | Lines 185, 205 |
| `cai-dat/page.tsx` | `/admin/clear-storage` | apiFetch POST call | WIRED | Line 127: `apiFetch<...>('/admin/clear-storage', { method: 'POST', credentials: 'include' })` |
| `dashboard/page.tsx` | `/auth/me` | server-side fetch for user profile | WIRED | Lines 30-35: `fetch(`${apiUrl}/auth/me`, ...)` in `getUserProfile()` |
| `DashboardClient.tsx` | `AgentQuotaBar.tsx` | conditional render when `tier='agent'` | WIRED | Lines 54-61: `{isAgent && userProfile ? <AgentQuotaBar ... />}` |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| AGT-01 | 10-01 | Agent tier columns on users table with subscription tracking | SATISFIED | `013_agent_tier.sql`: tier, subscription_start, subscription_end with CHECK constraint |
| AGT-02 | 10-02, 10-03 | Admin can grant, renew, and revoke agent tier from user detail dialog | SATISFIED | Backend: 3 admin endpoints. Frontend: `UserDetailDialog.tsx` with date input and all 3 action handlers |
| AGT-03 | 10-01 | Agent quota enforcement at publish time (20/cycle) | SATISFIED | `enforcePublishLimit` in `invitations.service.ts` with 30-day rolling cycle logic |
| AGT-04 | 10-04 | Agent dashboard shows quota progress bar with days remaining and Dai ly indicator | SATISFIED | `AgentQuotaBar.tsx` + `DashboardClient.tsx` conditional render |
| AGT-05 | 10-02 | Drafts older than 30 days from createdAt (never published) auto-deleted daily with media | SATISFIED | `DraftCleanupCronService` + `deleteExpiredDrafts` + `deleteInvitationMedia` |
| AGT-06 | 10-04 | Dashboard shows warning badges on draft cards within 7 days of auto-deletion | SATISFIED | `InvitationCard.tsx` with amber warning (<=7 days) and red danger (<=0 days) badges |
| AGT-07 | 10-02, 10-03 | Admin can clear storage for expired/soft-deleted invitations from settings | SATISFIED | `clearExpiredStorage` backend + "Doc dep luu tru" section in `cai-dat/page.tsx` |
| AGT-08 | 10-01, 10-04 | GET /auth/me returns user profile including tier, subscription, and quota info | SATISFIED | `auth.controller.ts` endpoint + `auth.service.ts` `getProfile` method; fetched server-side in dashboard page |

All 8 AGT requirements satisfied. No orphaned requirements.

---

### Commit Verification

All 8 task commits documented in summaries verified in git log:

| Commit | Plan | Task |
|--------|------|------|
| `444408f` | 10-01 | Agent tier schema, shared types, GET /auth/me |
| `87f36ea` | 10-01 | Agent-aware quota enforcement at publish time |
| `4c4d41b` | 10-02 | Draft auto-delete cron and deleteExpiredDrafts |
| `c373118` | 10-02 | Admin agent grant/renew/revoke and storage cleanup |
| `2bf6c48` | 10-03 | Agent tier controls in UserDetailDialog |
| `030ead9` | 10-03 | Storage cleanup section in admin settings |
| `89455e6` | 10-04 | AgentQuotaBar component and dashboard profile fetch |
| `bbdaf69` | 10-04 | Agent dashboard UI and draft warning badges |

---

### Anti-Patterns Found

No anti-patterns found. No TODO/FIXME/PLACEHOLDER comments in any phase 10 files. No stub implementations (empty returns, console.log-only handlers, or static responses). No orphaned artifacts.

---

### Human Verification Required

#### 1. Agent quota enforcement at publish attempt #21

**Test:** Log in as an agent user with active subscription and 20 already-published invitations. Attempt to publish invitation #21.
**Expected:** Publish blocked with Vietnamese error message "Da dat gioi han 20 thiep/thang. Vui long cho chu ky moi."
**Why human:** Cannot simulate DB state with 20 published invitations programmatically without running the app.

#### 2. Draft auto-delete warning badge display

**Test:** Create a draft invitation. Manually set `created_at` to 24 days ago in database. Reload dashboard.
**Expected:** Invitation card shows amber badge "Se bi xoa sau 6 ngay".
**Why human:** Requires database manipulation and visual confirmation in the browser.

#### 3. Admin grant agent tier with custom start date

**Test:** In admin panel, open a user detail dialog. Enter a start date 15 days in the past as the subscription start. Click "Cap dai ly".
**Expected:** User's subscription end should be start_date + 30 days (i.e., 15 days from now). Quota cycle should reflect the custom start date.
**Why human:** Requires admin UI interaction and visual confirmation of subscription dates.

#### 4. Storage cleanup result display

**Test:** Create and soft-delete an invitation with uploaded photos. Open admin settings. Click "Doc dep luu tru" then confirm.
**Expected:** After cleanup, green success box shows "Da doc dep X thiep, giai phong ~Y MB".
**Why human:** Requires file uploads in storage to be present for cleanup to count freed MB.

---

### Gaps Summary

No gaps found. All 13 observable truths are verified. All 16 artifacts exist, are substantive (not stubs), and are properly wired. All 8 AGT requirements are satisfied with implementation evidence. All 8 task commits exist in git log. No anti-patterns detected.

---

_Verified: 2026-03-18_
_Verifier: Claude (gsd-verifier)_
