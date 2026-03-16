# Phase 7: Monetization - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Free/Premium tiers enforced per-invitation (pay-as-you-go model). Free invitations have watermark, blurred bank QR, limited photos and templates. Users pay per invitation via admin's bank QR, admin manually grants Premium. Includes upgrade page, payment notification flow, and admin payments section.

</domain>

<decisions>
## Implementation Decisions

### Pricing Model
- **Per-invitation** — each invitation has its own free/premium status
- Not per-account subscription — user pays to upgrade a specific invitation
- Admin grants Premium per invitation, not per user

### Free Tier Limits
- No photo limit (same as Premium)
- All templates available (same as Premium)
- Diagonal watermark overlay on public page: "ThiepCuoiOnline.vn" repeated semi-transparently
- Bank QR blurred with lock icon + "Nang cap de mo QR" text — guests can't scan
- **Only 1 published invitation** — if user already has 1 live invitation (status = published or save_the_date), they cannot publish another. Must upgrade the next one to Premium.
- Can create unlimited draft invitations — restriction is on publishing, not creating

### Premium Tier (per-invitation)
- No watermark
- Bank QR fully visible and scannable
- Can be published regardless of how many other invitations are live
- Unlocked instantly when admin grants

### Watermark Design
- Diagonal overlay: "ThiepCuoiOnline.vn" text repeated diagonally across invitation content
- Semi-transparent, cannot be removed by client-side CSS/JS manipulation
- Rendered server-side or as a positioned overlay with pointer-events: none
- Shows on all public page views for Free invitations

### Bank QR Lock (Free Tier)
- Bank QR image rendered with CSS blur filter
- Lock icon (🔒) overlay centered on blurred QR
- Text below: "Nang cap de mo QR"
- Applies to both groom and bride bank QR sections

### Upgrade Flow
- "Nang cap" button visible in editor topbar and dashboard card for Free invitations
- Clicking opens an upgrade page/dialog showing:
  1. Price (e.g., "99.000 VND / thiep")
  2. Admin's bank QR image for payment
  3. Bank name + account holder
  4. Transfer instructions with content format: "THIEP [invitation ID or slug]"
  5. "Toi da thanh toan" button
- Admin QR config comes from System Settings (Phase 8) — for Phase 7, use a placeholder or env var

### Payment Notification Flow
- User clicks "Toi da thanh toan":
  - Invitation gets a `payment_pending` flag
  - Toast: "Da gui yeu cau. Vui long cho admin xac nhan."
  - Dashboard badge shows "Cho xac nhan" (pending)
  - Admin sees the request in their payments section
- Admin verifies payment in their bank app, then clicks "Xac nhan" in admin panel
- Invitation upgrades to Premium immediately
- ISR revalidation triggered so public page updates (watermark removed, QR unlocked)

### Admin Payments Section
- Dedicated "Thanh toan" section in admin panel
- Lists all pending upgrade requests: user name, invitation ID/slug, timestamp
- Two actions per request: "Xac nhan" (approve) or "Tu choi" (reject)
- "Xac nhan" → invitation.plan = 'premium', ISR revalidation
- "Tu choi" → clears payment_pending flag, user sees "Tu choi" status
- History of past approvals/rejections visible

### Claude's Discretion
- Exact watermark opacity, font size, rotation angle
- Blur intensity for QR lock
- How plan enforcement integrates with existing photo upload (reject at API vs editor warning)
- Payment pending DB implementation (new column vs status field)
- Upgrade page layout and styling
- How to handle edge case: user downgrades (admin revokes Premium)
- Admin QR fallback for Phase 7 (before System Settings in Phase 8)

</decisions>

<specifics>
## Specific Ideas

- Pay-as-you-go per invitation is the right model for Vietnamese wedding market — most couples only need 1 invitation
- Diagonal watermark is the strongest anti-screenshot protection while still showing the invitation content
- Blurred QR is a strong upgrade incentive — guests can see the section exists but can't use it
- Manual payment via bank transfer (VietQR) is standard in Vietnam — no payment gateway needed
- "Toi da thanh toan" + admin approval is a simple but effective workflow for v1

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Invitation` type: add `plan` field ('free' | 'premium') and `paymentPending` flag
- `PublishButton.tsx`: extend with upgrade CTA
- `InvitationCard.tsx`: add upgrade button + payment status badge
- `StatusBadge.tsx`: add 'pending' badge variant
- Bank QR rendering in templates: already handles dual QR — add blur/lock overlay conditionally
- Admin layout at `/admin`: ready for new section

### Established Patterns
- Per-invitation fields (not per-user) — consistent with per-invitation premium
- ISR revalidation via `/api/revalidate` route handler
- apiFetch for API calls with credentials
- Template-specific styling via Record<TemplateId, ...>

### Integration Points
- `packages/types/src/invitation.ts`: add `plan`, `paymentPending` fields
- `apps/api/src/invitations/invitations.service.ts`: plan enforcement on photo upload, template selection
- `apps/web/components/templates/`: add watermark overlay + QR lock for free tier
- `apps/web/app/(admin)/`: new payments section
- `apps/api/src/invitations/invitations.controller.ts`: admin grant/reject endpoints

</code_context>

<deferred>
## Deferred Ideas

- Online payment gateway (VNPay, MoMo) — v2 feature, manual bank transfer is sufficient for v1
- Admin QR config UI — Phase 8 System Settings, use placeholder/env var for Phase 7
- Per-user plan (account subscription) — decided against, per-invitation model chosen

</deferred>

---

*Phase: 07-monetization*
*Context gathered: 2026-03-16*
