# Phase 10: Agent Tier and Storage Management - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a new "Agent" user tier for printing vendors who create invitations on behalf of couples. Agents pay a monthly subscription (manual bank transfer, admin grants), get 20 Premium-quality invitations per month. Also: draft auto-delete after 30 days from creation, admin Clear Storage button for expired/deleted media cleanup. Published link expiration uses existing Phase 9 grace period system (no changes needed).

</domain>

<decisions>
## Implementation Decisions

### Agent Tier Model
- **Who:** Printing vendors (wedding printing shops) who create invitations ON BEHALF of couples. Couples don't have their own accounts — the agent manages everything.
- **Subscription:** Manual monthly bank transfer to admin's QR, admin manually activates/renews (same payment model as existing premium)
- **Quality:** All agent-created invitations are automatically Premium (no watermark, full bank QR visible). The subscription fee covers this.
- **Quota:** 20 published invitations per monthly cycle
- **On expiry:** Already-published invitations KEEP Premium status forever. Agent just can't publish NEW ones until renewed. Protects end-user couples.
- **InvitationPlan type extension:** `'free' | 'premium' | 'agent'` — or agent invitations may simply be marked `'premium'` with the agent tier tracked at user level

### Draft Auto-Delete
- Drafts auto-deleted **30 days from createdAt timestamp** (not updatedAt)
- User must be informed: dashboard warning badge on draft cards when within 7 days of deletion: "Se bi xoa sau X ngay"
- Cron job (similar to Phase 9 expiry cron) runs daily to clean up expired drafts
- Deleted drafts also have their media (photos, avatars, QR) removed from Supabase Storage

### Published Link Expiration
- **No changes needed** — existing Phase 9 grace period system handles this (cron job + configurable grace period in system_settings)

### Storage Cleanup (Admin)
- "Doc dep luu tru" section on System Settings page (/admin/cai-dat)
- Clear Storage button removes photos, music uploads, avatars, and QR images for invitations that are expired or soft-deleted
- Does NOT touch active/published invitations' media
- Show storage usage before/after with confirmation dialog

### Quota Mechanics
- **What counts:** Only published invitations (status = published or save_the_date) count toward the 20/month quota. Drafts don't count.
- **Cycle reset:** 30 days from admin-set subscription start date (per-agent individual cycle, not calendar month)
- **At limit:** Block publish with clear Vietnamese message: "Da dat gioi han 20 thiep/thang. Vui long cho chu ky moi." Agent can still create/edit drafts.
- **No rollover:** Unused quota expires at cycle end. Fresh 20 each cycle.

### Admin Management
- Grant Agent tier from existing user detail page in /admin/nguoi-dung (dropdown: User -> Agent)
- Admin sets subscription start date when granting
- Manual "Gia han" (Renew) button in user detail: resets quota to 20, extends subscription by 30 days from current date
- Agent quota usage visible in user detail dialog

### Agent Dashboard Experience
- Agent sees quota progress bar on their dashboard: "12/20 thiep da xuat ban" with days remaining until cycle reset
- Dashboard greeting may differ: "Xin chao, [Name] (Dai ly)" to indicate agent status

### Claude's Discretion
- DB schema for agent tier (user-level columns vs separate table)
- Cron job implementation for draft auto-delete (extend existing Phase 9 cron or separate)
- Exact quota tracking approach (count query vs cached counter)
- Dashboard quota bar component design
- Storage cleanup confirmation dialog design
- How to handle edge case: admin downgrades agent mid-cycle
- Warning badge styling and countdown calculation
- Agent tier payment flow (reuse existing upgrade page or separate)

</decisions>

<specifics>
## Specific Ideas

- Printing vendors are a real customer segment in Vietnam — they create invitations for couples as part of their printing services
- Manual bank transfer + admin approval is consistent with existing Phase 7 payment model — no need for a separate payment gateway
- 30-day draft deletion from createdAt (not updatedAt) is intentional — prevents users from "poking" drafts to keep them alive indefinitely
- Already-published invitations keeping Premium on agent expiry protects the couples who received the invitation link

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `InvitationPlan` type (`'free' | 'premium'`): extend with agent awareness
- `enforceFreeTierLimit` in invitations.service.ts: extend for agent quota enforcement
- Phase 9 cron job (`@nestjs/schedule`): extend or add new cron for draft cleanup
- Admin user detail dialog: add tier management controls
- System Settings page: add storage cleanup section
- Existing payment workflow (Phase 7): reuse for agent subscription payments

### Established Patterns
- `markExpired` cron pattern from Phase 9 — reuse for draft auto-delete
- `system_settings` key-value store — could store agent pricing config
- `AdminGuard` + user management endpoints already exist
- `StatusBadge` component for dashboard status indicators
- `apiFetch` for API calls with credentials

### Integration Points
- `packages/types/src/invitation.ts`: may need new user-level type for agent status
- `apps/api/src/invitations/invitations.service.ts`: quota enforcement at publish time
- `apps/api/src/admin/admin.controller.ts`: agent grant/renew endpoints
- `apps/web/app/(app)/dashboard/`: quota bar component for agent users
- `apps/web/app/(admin)/admin/cai-dat/page.tsx`: storage cleanup section
- `supabase/migrations/`: new columns for agent tier (user table) and draft expiry tracking

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-agent-tier-and-storage-management*
*Context gathered: 2026-03-17*
