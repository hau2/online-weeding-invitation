---
phase: 08-admin-panel
verified: 2026-03-16T05:49:51Z
status: gaps_found
score: 3/5 success criteria verified
gaps:
  - truth: "Admin dashboard shows real-time read-only stats: total users, total invitations, active invitations, and revenue summary"
    status: partial
    reason: "Dashboard has 5 stat cards (totalUsers, totalInvitations, publishedInvitations, premiumInvitations, storageEstimateMb) but revenue summary is absent. ADMN-02 explicitly requires revenue. The AdminStats interface has no revenue field and getStats() does not compute revenue from payment records."
    artifacts:
      - path: "apps/web/app/(admin)/admin/page.tsx"
        issue: "No revenue stat card. Five stat cards present but none show revenue."
      - path: "apps/api/src/admin/admin.service.ts"
        issue: "getStats() does not compute revenue. AdminStats interface has no revenueTotal or similar field."
    missing:
      - "Add revenueTotal (or equivalent) to AdminStats interface in packages/types/src/admin.ts"
      - "Compute revenue in AdminService.getStats() by counting premium invitations * pricePerInvitation (from system_settings) or counting by payment_status"
      - "Add a Revenue stat card to the dashboard page"
  - truth: "Admin can manage the system music library: upload new MP3 files, enable/disable tracks; disabled tracks remain audible on existing invitations that already selected them"
    status: partial
    reason: "Upload, toggle, and ADMN-07 contract (inactive still plays) all work correctly. However, the displayed usage_count is always 0 because the usage_count column in system_music_tracks is never updated by any code path. The UI shows '0 thiep dang su dung' for every track regardless of actual usage. ADMN-06 requires admin to 'view usage count'."
    artifacts:
      - path: "supabase/migrations/009_admin_panel.sql"
        issue: "Adds usage_count column but no trigger or UPDATE statement to maintain it."
      - path: "apps/api/src/admin/admin.service.ts"
        issue: "listMusicTracks() returns t.usage_count from DB column which is always 0. No code path increments/decrements this column."
    missing:
      - "Either: (a) Add a DB trigger on invitations INSERT/UPDATE/DELETE to increment/decrement usage_count on system_music_tracks when music_track_id changes, OR"
      - "(b) Change AdminService.listMusicTracks() to join with a live count subquery from invitations table instead of reading the stored column"
      - "Note: deleteMusicTrack() already uses a live count correctly for the safety guard — the same approach should be used for the display"
human_verification:
  - test: "Navigate to /admin after logging in as admin"
    expected: "Dashboard loads with 5 stat cards showing real numbers and a 30-day line chart"
    why_human: "Verifying real data flows from the database in a running environment"
  - test: "Navigate to /admin/nhac, select a music track that an invitation is using, attempt delete"
    expected: "Backend should reject with error; UI should ideally pre-warn (but currently does not due to stale usage_count)"
    why_human: "Need a real invitation with a music_track_id set to test the live count guard"
  - test: "Disable an invitation from /admin/thiep-cuoi, then visit its public URL"
    expected: "Public page returns 404"
    why_human: "Requires running Next.js with ISR revalidation active"
  - test: "Upload a new MP3 file at /admin/nhac"
    expected: "Track appears in list with title, artist, toggle button, and 0 usage count"
    why_human: "Requires Supabase storage bucket 'system-music' to be configured"
---

# Phase 8: Admin Panel Verification Report

**Phase Goal:** Admin has a fully functional panel to oversee users, invitations, music library, themes, service plans, payment transactions, and system configuration
**Verified:** 2026-03-16T05:49:51Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Admin dashboard shows real-time read-only stats including revenue summary | PARTIAL | 5 of 6 required stats present; revenue absent from AdminStats interface and getStats(). ADMN-02 gap. |
| 2 | Admin can search users, view invitations, lock/unlock, assign/change plan | VERIFIED | apps/web/app/(admin)/admin/nguoi-dung/page.tsx (395 lines). All CRUD operations wired to /admin/users/* endpoints. |
| 3 | Admin can view any invitation, disable/enable it; public page becomes inaccessible | VERIFIED | apps/web/app/(admin)/admin/thiep-cuoi/page.tsx (379 lines). findBySlug returns 404 when is_disabled=true. ISR revalidation triggered on toggle. |
| 4 | Admin can manage system music library: upload MP3, enable/disable; disabled tracks still play | PARTIAL | Upload and toggle work. ADMN-07 contract confirmed (editor filters is_active=true; findBySlug does not). However usage_count column is never updated — displayed count is always 0. ADMN-06 "view usage count" is inaccurate. |
| 5 | Admin can configure service plan permissions and update payment transactions with refund status and notes | VERIFIED | /admin/goi-dich-vu configures photo limits via system_settings. /admin/thanh-toan supports mark-refund (POST /invitations/admin/:id/mark-refund), notes (PATCH /invitations/admin/:id/notes), and CSV export. |

**Score:** 3/5 truths fully verified (2 partial)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/009_admin_panel.sql` | system_settings table, is_locked, is_disabled, admin_notes columns | VERIFIED | 66 lines. All required tables and columns present with defaults. |
| `packages/types/src/admin.ts` | Admin-specific shared types | VERIFIED | 76 lines. AdminStats, AdminUser, AdminInvitation, SystemSettings, ThemeInfo, AdminMusicTrack all defined. |
| `apps/api/src/admin/admin.controller.ts` | All admin API endpoints | VERIFIED | 222 lines. 21 endpoints. Class-level JwtGuard + AdminGuard. |
| `apps/api/src/admin/admin.service.ts` | All admin business logic | VERIFIED | 1017 lines. All methods implemented with real DB queries via SupabaseAdminService. |
| `apps/web/app/(admin)/admin/page.tsx` | Dashboard with real stats | VERIFIED | 81 lines. Fetches from /admin/stats. Missing revenue card. |
| `apps/web/app/(admin)/admin/nguoi-dung/page.tsx` | Users management page | VERIFIED | 395 lines. Search, filter, pagination, lock/unlock, delete, role change. |
| `apps/web/components/admin/UserDetailDialog.tsx` | User detail with invitations list | VERIFIED | 195 lines. Shows user info and their invitations. |
| `apps/web/app/(admin)/admin/thiep-cuoi/page.tsx` | Invitations management page | VERIFIED | 379 lines. Search/filter/disable/enable/read-only detail. |
| `apps/web/app/(admin)/admin/nhac/page.tsx` | Music library management page | VERIFIED | 304 lines. Upload/toggle/delete wired. usage_count always 0. |
| `apps/web/app/(admin)/admin/giao-dien/page.tsx` | Themes management page | VERIFIED | 276 lines. Toggle + inline metadata editing (name, tag, thumbnail). |
| `apps/web/app/(admin)/admin/goi-dich-vu/page.tsx` | Service plans configuration page | VERIFIED | 182 lines. Reads and updates uploadLimits from system_settings. |
| `apps/web/app/(admin)/admin/cai-dat/page.tsx` | System settings page | VERIFIED | 327 lines. All 4 config sections with bank QR upload. |
| `apps/web/app/(admin)/admin/thanh-toan/page.tsx` | Enhanced payments page | VERIFIED | 444 lines. Refund marking, admin notes, CSV export. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `apps/web/app/(admin)/admin/page.tsx` | `/admin/stats` | `apiFetch` in useEffect | WIRED | Line 17: `apiFetch<AdminStats>('/admin/stats', ...)` |
| `apps/web/app/(admin)/admin/nguoi-dung/page.tsx` | `/admin/users` | `apiFetch` with search/filter params | WIRED | Line 77: `/admin/users?${params.toString()}` |
| `apps/web/app/(admin)/admin/thiep-cuoi/page.tsx` | `/admin/invitations` | `apiFetch` with search/filter params | WIRED | Line 81: `/admin/invitations?${params.toString()}` |
| `apps/web/app/(admin)/admin/nhac/page.tsx` | `/admin/music-tracks` | `apiFetch` and `apiUpload` | WIRED | Lines 46 and 77 |
| `apps/web/app/(admin)/admin/giao-dien/page.tsx` | `/admin/themes` | `apiFetch GET`, `POST toggle`, `PUT metadata` | WIRED | Lines 35, 49, 87-103 |
| `apps/web/app/(admin)/admin/goi-dich-vu/page.tsx` | `/admin/system-settings` | `apiFetch GET and PUT for uploadLimits` | WIRED | Lines 26 and 42 |
| `apps/web/app/(admin)/admin/cai-dat/page.tsx` | `/admin/system-settings` | `apiFetch GET and PUT` | WIRED | Lines 39 and 106 |
| `apps/web/app/(admin)/admin/thanh-toan/page.tsx` | `/invitations/admin/*` | `apiFetch` for all operations | WIRED | Lines 38, 53, 61, 78, 95, 111, 128 |
| `apps/api/src/admin/admin.controller.ts` | `apps/api/src/admin/admin.service.ts` | NestJS DI | WIRED | Constructor injection confirmed |
| `apps/api/src/admin/admin.service.ts` | `supabaseAdmin.client` | SupabaseAdminService injection | WIRED | Line 85: `private readonly supabaseAdmin: SupabaseAdminService` |
| `apps/api/src/app.module.ts` | `apps/api/src/admin/admin.module.ts` | imports array | WIRED | Line 9: `import { AdminModule }`, Line 17: in imports array |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| ADMN-02 | 08-01, 08-02 | Admin dashboard with read-only stats (total users, invitations, revenue, charts) | PARTIAL | totalUsers/totalInvitations/published/premium/storage present. Revenue absent. One chart only. |
| ADMN-03 | 08-01, 08-02 | Admin can view/search users, lock/unlock, reset quota, assign/change plans | PARTIAL | Search/view/lock/unlock/delete/role-change all implemented. "Reset quota" deliberately omitted (plan notes: no per-user quota exists in this design). |
| ADMN-04 | 08-01, 08-03 | Admin can view invitations, view public link, disable/enable for violations | VERIFIED | Full invitations page with search/filter/disable/enable. findBySlug returns 404 for disabled. |
| ADMN-05 | 08-01, 08-04 | Admin can manage theme metadata (enable/disable, name, tag, thumbnail) | VERIFIED | /admin/giao-dien has toggle + inline metadata editing for name/tag/thumbnail. |
| ADMN-06 | 08-01, 08-03 | Admin can manage system music library (upload mp3, enable/disable, view usage count) | PARTIAL | Upload and toggle work. Usage count is always 0 (column not maintained). |
| ADMN-07 | 08-01, 08-03 | Inactive system music hidden from editor but still plays on existing invitations | VERIFIED | listMusicTracks filters is_active=true. findBySlug music lookup has no is_active filter. |
| ADMN-08 | 08-01, 08-04 | Admin can configure service plans (Basic/Pro/Promax) with permission settings | PARTIAL | Only free/premium model implemented (not Basic/Pro/Promax). Photo limits configurable. Template access and watermark per-plan not configurable. Plan notes this is intentional scope reduction. |
| ADMN-09 | 08-01, 08-04 | Admin can view payment transactions, mark refunds, add internal notes | VERIFIED | mark-refund and notes endpoints in invitations controller. Payments page has refund button, notes section, CSV export. |
| ADMN-10 | 08-01, 08-04 | Admin can configure system settings (expiry durations, bank list, system fonts, upload limits) | VERIFIED | /admin/cai-dat configures payment, watermark, expiry, upload limits. "System fonts" not present in system_settings but is not covered anywhere in the implementation — this was likely OOS for this phase. |

**Orphaned Requirements (in REQUIREMENTS.md but not addressed in plans):** None — all 9 requirements are claimed by plans.

**Scope deviations acknowledged in plans:**
- ADMN-03 "reset quota": Plans explicitly note this is N/A because the app uses per-invitation free/premium, not per-user quotas.
- ADMN-08 "Basic/Pro/Promax": Plans explicitly note this is simplified to free/premium per the Phase 7 monetization design.
- ADMN-10 "system fonts": Not implemented in system_settings (neither migration nor UI). Silent omission.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `supabase/migrations/009_admin_panel.sql` | 55 | `usage_count` column added but no trigger or UPDATE to maintain it | Warning | Music track usage counts always show 0 in admin UI |
| `apps/api/src/admin/admin.service.ts` | 589, 668 | `usageCount: t.usage_count` reads stale column (always 0) | Warning | ADMN-06 "view usage count" displays inaccurate data |
| `apps/web/app/(admin)/admin/nhac/page.tsx` | 252 | `disabled={track.usageCount > 0}` delete guard always false in UI | Warning | UI never pre-disables delete button for in-use tracks (backend still guards correctly) |

No PLACEHOLDER/TODO stubs found in production code. TypeScript compiles cleanly in both `apps/api` and `packages/types`. Web app TypeScript errors are all in pre-existing test files (`__tests__/`), not in Phase 8 code.

---

### Human Verification Required

#### 1. Dashboard Revenue (Gap)
**Test:** Log in as admin, navigate to `/admin`, inspect the stat cards
**Expected:** If revenue were present, a "Doanh thu" card would appear
**Why human:** Gap confirmed programmatically (no revenue in AdminStats), but human confirmation needed that this is a real functional omission vs. intentional deferral

#### 2. Real-Time Stats Accuracy
**Test:** Create a new user and invitation in the app, then refresh the admin dashboard
**Expected:** totalUsers and totalInvitations increment immediately
**Why human:** Requires a running environment with database

#### 3. Invitation Disable/Enable + Public Page 404
**Test:** Disable an invitation from `/admin/thiep-cuoi`. Open its public URL in an incognito browser.
**Expected:** Public page returns 404 (not found)
**Why human:** ISR revalidation requires running Next.js app with REVALIDATION_SECRET configured

#### 4. Music Track Usage Count Accuracy (Gap)
**Test:** Select a music track on an invitation, save. Navigate to `/admin/nhac`.
**Expected per requirement:** Track should show "1 thiep dang su dung"
**Actual:** Track shows "0 thiep dang su dung" (column never updated)
**Why human:** Confirms the programmatically-detected gap in a real environment

#### 5. Theme Metadata Persistence
**Test:** Edit a theme name at `/admin/giao-dien`, save, reload the page
**Expected:** New name persists
**Why human:** Requires running Supabase instance to verify JSONB write-back

---

### Gaps Summary

Two gaps block full goal achievement:

**Gap 1: Revenue summary absent from admin dashboard (ADMN-02)**
The `AdminStats` interface and `getStats()` method have no revenue field. The dashboard stat cards show totalUsers, totalInvitations, publishedInvitations, premiumInvitations, and storageEstimateMb — but ADMN-02 explicitly requires "revenue" stats. A revenue calculation (e.g., count premium invitations * price from system_settings, or a revenue sum from a future transactions table) needs to be added to the stats API and dashboard UI.

**Gap 2: Music track usage_count column is never updated (ADMN-06)**
The migration adds `usage_count` to `system_music_tracks` but no trigger or application code updates it when invitations select or deselect a music track. The admin UI always shows "0 thiep dang su dung" for every track. The delete safety guard in the backend correctly uses a live count query (not the column), so data integrity is preserved — but the display is inaccurate, breaking the "view usage count" capability in ADMN-06.

**Scope deviations noted but not gaps** (acknowledged in plans, not blocking):
- ADMN-03 "reset quota" — deliberately not implemented; no per-user quota system exists
- ADMN-08 "Basic/Pro/Promax" — simplified to free/premium per Phase 7 design
- ADMN-10 "system fonts" — not implemented; silent omission but likely out of scope for this phase

---

_Verified: 2026-03-16T05:49:51Z_
_Verifier: Claude (gsd-verifier)_
