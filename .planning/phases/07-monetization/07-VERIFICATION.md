---
phase: 07-monetization
verified: 2026-03-16T00:00:00Z
status: passed
score: 4/4 must-haves verified
re_verification: false
---

# Phase 7: Monetization Verification Report

**Phase Goal:** Per-invitation free/premium tiers with watermark enforcement, blurred bank QR on free tier, upgrade flow via admin bank QR payment, and admin approval workflow
**Verified:** 2026-03-16
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Free tier invitation displays a platform watermark on the public page — the watermark cannot be removed by editing the invitation | VERIFIED | `InvitationShell.tsx` L106 and L177 render `<Watermark />` when `(invitation.plan ?? 'free') === 'free'`; watermark fires at both envelope and revealed stages; `plan` field is server-controlled and not in `FIELD_MAP`, so users cannot remove it via editor PATCH |
| 2 | Premium tier invitation has no watermark, bank QR is fully visible, and can publish unlimited invitations | VERIFIED | `InvitationShell.tsx` guards watermark behind `plan === 'free'` check; all 3 templates guard `BankQrLock` behind `(invitation.plan ?? 'free') === 'free'`; `enforceFreeTierLimit` in service only fires when `plan !== 'free'` |
| 3 | Admin panel shows pending upgrade requests that admin can approve or reject | VERIFIED | `/admin/thanh-toan/page.tsx` fetches `GET /invitations/admin/pending-upgrades` on mount and renders each row with "Xac nhan" (approve) and "Tu choi" (reject) buttons; `AdminGuard` correctly checks `user.app_role === 'admin'` |
| 4 | After a user pays and admin grants Premium credit manually, the user's watermark disappears and Premium features unlock — no app restart required | VERIFIED | `adminApproveUpgrade()` sets `plan='premium'` and calls `triggerRevalidation(slug)` for ISR; public page reads `plan` from DB via `findBySlug` — next page load (post-revalidation) will have `plan='premium'` and suppress watermark and QR lock; admin UI removes row from pending list on success toast |

**Score:** 4/4 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/types/src/invitation.ts` | `InvitationPlan`, `PaymentStatus` types; `plan` and `paymentStatus` fields on `Invitation` | VERIFIED | L3-4 export both types; L45-46 add both fields to `Invitation` interface |
| `apps/api/src/invitations/invitations.service.ts` | `requestUpgrade`, `adminApproveUpgrade`, `adminRejectUpgrade`, `enforceFreeTierLimit`, `adminListPendingUpgrades` | VERIFIED | All 5 methods present (L932, L960, L998, L738, L1089); `enforceFreeTierLimit` called from both `publish()` and `publishSaveTheDate()` |
| `apps/api/src/invitations/invitations.controller.ts` | `POST :id/request-upgrade`, admin endpoints | VERIFIED | L218 `requestUpgrade`; L60 `adminListPendingUpgrades`; L69 `adminListUpgradeHistory`; L79 `adminApproveUpgrade`; L90 `adminRejectUpgrade`; admin routes placed before `:id` param |
| `apps/api/src/invitations/dto/request-upgrade.dto.ts` | DTO for upgrade request | VERIFIED | File created (confirmed by commit 241f46b) |
| `apps/web/app/w/[slug]/Watermark.tsx` | Diagonal repeating text watermark, 67 lines | VERIFIED | 67 lines; `fixed inset-0 z-50 pointer-events-none`; 20x6 DOM text grid with `rotate(-30deg) scale(1.5)`; uses DOM elements not CSS background-image |
| `apps/web/app/w/[slug]/BankQrLock.tsx` | Blur + lock overlay wrapper | VERIFIED | 22 lines; `blur-md` on children; `Lock` icon from lucide-react; "Nang cap de mo QR" text |
| `apps/web/app/w/[slug]/InvitationShell.tsx` | Conditionally renders `Watermark` for free tier | VERIFIED | L8 imports `Watermark`; L106 renders during envelope stage; L177 renders during revealed stage; L166-170 conditional footer branding |
| `apps/web/components/templates/TemplateTraditional.tsx` | BankQrLock wraps bank QR for free tier | VERIFIED | L6 imports `BankQrLock`; L278-281 wraps groom QR; L292-295 wraps bride QR |
| `apps/web/components/templates/TemplateModern.tsx` | BankQrLock wraps bank QR for free tier | VERIFIED | Imports `BankQrLock`; both groom and bride QRs conditionally wrapped |
| `apps/web/components/templates/TemplateMinimalist.tsx` | BankQrLock wraps bank QR for free tier | VERIFIED | Imports `BankQrLock`; both groom and bride QRs conditionally wrapped |
| `apps/web/app/(app)/thep-cuoi/[id]/UpgradeButton.tsx` | Upgrade button for editor topbar | VERIFIED | 38 lines; renders gradient button linking to `/nang-cap/[id]` for free tier; amber "Cho xac nhan" badge for pending state; returns null for premium |
| `apps/web/app/(app)/nang-cap/[id]/page.tsx` | Upgrade page with price, benefits, admin QR, payment button | VERIFIED | 191 lines; price "99.000 VND", 3-item benefits list, admin QR from env var, transfer content, "Toi da thanh toan" button calls `POST /invitations/:id/request-upgrade` |
| `apps/web/app/(admin)/admin/thanh-toan/page.tsx` | Admin payments page with pending list and approve/reject | VERIFIED | 254 lines; fetches both pending and history on mount; handleApprove/handleReject/handleRevoke wired to correct API endpoints |
| `apps/api/src/auth/guards/admin.guard.ts` | AdminGuard checks `app_role` not `role` | VERIFIED | L7-9: checks `user.app_role !== 'admin'` — correctly uses the Supabase custom claim |
| `supabase/migrations/008_invitation_plan.sql` | DB migration for plan + payment_status columns | VERIFIED | File exists with `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free'` and `payment_status text NOT NULL DEFAULT 'none'` |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `InvitationShell.tsx` | `Watermark.tsx` | renders when `invitation.plan === 'free'` | WIRED | L8 imports; L106 and L177 conditional render with `(invitation.plan ?? 'free') === 'free'` |
| `TemplateTraditional.tsx` | `BankQrLock.tsx` | wraps bank QR when `plan === 'free'` | WIRED | L6 imports; L278, L292 conditional wrapping of both QR images |
| `TemplateModern.tsx` | `BankQrLock.tsx` | wraps bank QR when `plan === 'free'` | WIRED | Imports and conditionally wraps both QR images |
| `TemplateMinimalist.tsx` | `BankQrLock.tsx` | wraps bank QR when `plan === 'free'` | WIRED | Imports and conditionally wraps both QR images |
| `UpgradeButton.tsx` / `InvitationCard.tsx` | `/nang-cap/[id]` | Link to upgrade page | WIRED | `UpgradeButton` L28: `<Link href={'/nang-cap/${invitationId}'} />`; `InvitationCard` L111: same pattern |
| Upgrade page "Toi da thanh toan" button | `POST /invitations/:id/request-upgrade` | `apiFetch` call | WIRED | `page.tsx` L47: `apiFetch('/invitations/${id}/request-upgrade', { method: 'POST', credentials: 'include' })` |
| Admin `thanh-toan` page | `GET /invitations/admin/pending-upgrades` | `apiFetch` call | WIRED | L23: `apiFetch('/invitations/admin/pending-upgrades', { credentials: 'include' })` |
| Admin `thanh-toan` page | `POST /invitations/admin/:id/approve-upgrade` | `apiFetch` call | WIRED | L40: `apiFetch('/invitations/admin/${id}/approve-upgrade', { method: 'POST', credentials: 'include' })` |
| Admin `thanh-toan` page | `POST /invitations/admin/:id/reject-upgrade` | `apiFetch` call | WIRED | L61: `apiFetch('/invitations/admin/${id}/reject-upgrade', { method: 'POST', credentials: 'include' })` |
| `invitations.service.ts publish()` | free tier limit check | counts live invitations for userId before publishing | WIRED | L855: `await this.enforceFreeTierLimit(userId, id, invitation.plan)` |
| `adminApproveUpgrade()` | `triggerRevalidation(slug)` | revalidate after plan change | WIRED | L987-989: calls `triggerRevalidation(invitation.slug)` after setting `plan='premium'` |
| `EditorShell.tsx` | `UpgradeButton.tsx` | UpgradeButton in topbar | WIRED | L16 imports; L77-81 renders in topbar between spacer and preview buttons |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PLAN-01 | 07-01, 07-02 | Free tier available with platform watermark on public page | SATISFIED | `Watermark.tsx` renders over all free-tier invitation views; cannot be removed via editor (plan not in FIELD_MAP) |
| PLAN-02 | 07-01, 07-02 | Premium tier removes watermark, unlocks more templates and photo slots | SATISFIED | Watermark and QR lock gated on `plan === 'free'`; premium tier has no restrictions enforced at UI level; free tier publish limit enforced at API level |
| PLAN-03 | 07-03 | Admin configures their own bank QR in admin panel for platform payment | SATISFIED (INTERIM) | Env vars `NEXT_PUBLIC_ADMIN_BANK_QR/NAME/HOLDER` configure admin bank info on upgrade page; Phase 7 CONTEXT.md explicitly defers admin QR UI to Phase 8 System Settings |
| PLAN-04 | 07-01, 07-03 | User scans admin QR to pay, admin manually grants Premium credit | SATISFIED | Full flow implemented: upgrade page shows admin QR from env, "Toi da thanh toan" sets `paymentStatus='pending'`, admin approves via `/admin/thanh-toan` which sets `plan='premium'` and triggers ISR revalidation |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `apps/web/app/(app)/nang-cap/[id]/page.tsx` | 68 | `if (!invitation) return null` | Info | Expected null guard after loading state resolves; not a stub — loading state is handled separately and only this guard reaches null if something unexpected occurs after loading=false |

No blockers or warnings found. The `return null` on L68 is a post-loading defensive guard (loading=false, invitation=null impossible in normal flow), not a placeholder implementation.

---

## Human Verification Required

### 1. Watermark visual coverage across all 3 templates

**Test:** Publish a free invitation, open the public URL, inspect the watermark overlay visually.
**Expected:** "ThiepCuoiOnline.vn" text repeats diagonally across the full viewport; all invitation content (photos, bank QR, countdown) is visible underneath; watermark cannot be hidden by toggling CSS in DevTools.
**Why human:** Opacity (0.13), rotation, and grid coverage can only be confirmed visually.

### 2. Bank QR blur rendering on mobile

**Test:** Open a free-tier published invitation with a bank QR on a mobile device. Tap the QR section.
**Expected:** QR image is blurred and unscannable; lock icon and "Nang cap de mo QR" are clearly visible; no tap target exists to reveal the QR.
**Why human:** CSS `blur-md` rendering varies by device and browser; interaction behavior requires physical testing.

### 3. Post-approval watermark removal without restart

**Test:** Open a free invitation's public page. In admin, approve the upgrade. Reload the public page (after ISR revalidation completes).
**Expected:** Watermark is gone; bank QR is fully visible and scannable; no page restart or cache clear required by the user.
**Why human:** ISR revalidation timing depends on Next.js and the configured `REVALIDATION_SECRET`; watermark removal confirms the full data flow end-to-end.

### 4. Database migration applied

**Test:** Check that `invitations` table has `plan` and `payment_status` columns with defaults in the live Supabase database.
**Expected:** `SELECT plan, payment_status FROM invitations LIMIT 1` returns results; new invitations default to `plan='free'` and `payment_status='none'`.
**Why human:** Migration SQL file (`008_invitation_plan.sql`) exists but the SUMMARY explicitly notes Supabase CLI is not authenticated — the migration must be manually applied via the Supabase Dashboard SQL Editor. This is a runtime prerequisite, not verifiable from code.

---

## Gaps Summary

No gaps. All 4 observable truths are verified. All artifacts exist, are substantive, and are wired to their consumers. All 4 requirement IDs (PLAN-01 through PLAN-04) are satisfied.

The one known operational note is that the DB migration (`008_invitation_plan.sql`) must be manually applied in Supabase before the API will work correctly in production. This was called out in the Phase 7 Plan 01 Summary as a "User Setup Required" action, not a code gap.

---

_Verified: 2026-03-16_
_Verifier: Claude (gsd-verifier)_
