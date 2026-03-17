# Phase 10: Agent Tier and Storage Management - Research

**Researched:** 2026-03-17
**Domain:** User tier system, quota management, cron-based cleanup, Supabase storage operations
**Confidence:** HIGH

## Summary

Phase 10 adds a new "Agent" user tier for printing vendors, quota enforcement at publish time, draft auto-deletion after 30 days, and an admin storage cleanup button. The implementation extends existing patterns: the `users` table gets agent-related columns, `enforceFreeTierLimit` gains agent-aware quota logic, the `ExpiryCronService` pattern is reused for draft cleanup, and the admin settings page gains a storage cleanup section.

The codebase is well-structured for these changes. The `enforceFreeTierLimit` method is already a centralized publish gate. The `ExpiryCronService` pattern provides a proven cron template. Admin user management (detail dialog, role changes) already exists and just needs agent-specific controls. Storage cleanup reuses the bucket-listing pattern from `deleteUser`.

**Primary recommendation:** Add agent tier columns directly to the `users` table (not a separate table), extend `enforceFreeTierLimit` to handle agent quota counting, create a `DraftCleanupCronService` parallel to `ExpiryCronService`, and add a `clearExpiredStorage` method to `AdminService`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Agent Tier Model:** Printing vendors create invitations on behalf of couples. Manual monthly bank transfer, admin activates/renews. All agent invitations are automatically Premium. 20 published invitations per monthly cycle. On expiry, published invitations KEEP Premium forever -- agent just cannot publish NEW ones.
- **Draft Auto-Delete:** 30 days from createdAt (not updatedAt). Warning badge on dashboard within 7 days. Daily cron job. Deleted drafts also remove media from Supabase Storage.
- **Published Link Expiration:** No changes needed -- existing Phase 9 grace period system handles this.
- **Storage Cleanup (Admin):** "Doc dep luu tru" section on /admin/cai-dat. Clear Storage button removes media for expired or soft-deleted invitations. Does NOT touch active/published invitations. Show storage usage before/after with confirmation dialog.
- **Quota Mechanics:** Only published/save_the_date count toward 20/month. 30-day cycle from admin-set start date (per-agent individual cycle). Block publish with Vietnamese message. No rollover.
- **Admin Management:** Grant agent tier from user detail page dropdown (User -> Agent). Admin sets subscription start date. Manual "Gia han" (Renew) button resets quota to 20, extends by 30 days. Quota usage visible in user detail dialog.
- **Agent Dashboard Experience:** Quota progress bar "12/20 thiep da xuat ban" with days remaining. Greeting "Xin chao, [Name] (Dai ly)".

### Claude's Discretion
- DB schema for agent tier (user-level columns vs separate table)
- Cron job implementation for draft auto-delete (extend existing Phase 9 cron or separate)
- Exact quota tracking approach (count query vs cached counter)
- Dashboard quota bar component design
- Storage cleanup confirmation dialog design
- How to handle edge case: admin downgrades agent mid-cycle
- Warning badge styling and countdown calculation
- Agent tier payment flow (reuse existing upgrade page or separate)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

This is a new feature phase. Requirements are derived from CONTEXT.md decisions:

| ID | Description | Research Support |
|----|-------------|-----------------|
| AGT-01 | Agent tier on users table with subscription tracking | DB schema design, user-level columns |
| AGT-02 | Admin can grant/renew agent tier from user detail | Extend AdminService + AdminController + UserDetailDialog |
| AGT-03 | Agent quota enforcement at publish time (20/cycle) | Extend enforceFreeTierLimit with cycle-aware counting |
| AGT-04 | Agent dashboard with quota progress bar | New /me endpoint + DashboardClient agent section |
| AGT-05 | Draft auto-delete cron (30 days from createdAt) | New DraftCleanupCronService following ExpiryCronService pattern |
| AGT-06 | Draft warning badge on dashboard (7 days before deletion) | Frontend calculation from createdAt |
| AGT-07 | Admin Clear Storage button for expired/deleted media | New AdminService method + settings page section |
| AGT-08 | Agent greeting on dashboard ("Dai ly" indicator) | Frontend conditional rendering from /me response |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @nestjs/schedule | (already installed) | Cron jobs for draft cleanup | Same pattern as ExpiryCronService |
| @supabase/supabase-js | (already installed) | Storage operations for cleanup | Already used throughout |
| Supabase PostgreSQL | (already provisioned) | Schema migration for agent columns | All data in same DB |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | (already installed) | Icons for quota bar, warning badge | Agent dashboard UI |
| sonner | (already installed) | Toast notifications for admin actions | Confirmation feedback |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| User-level columns | Separate agent_subscriptions table | Separate table adds join complexity for a 1:1 relationship; columns on users table are simpler and the agent data is tightly coupled to user identity |
| Count query for quota | Cached counter column | Count query is simpler and consistent with existing enforceFreeTierLimit pattern; at 20 invitations per agent, the count query is trivial |
| Separate cron service | Extend ExpiryCronService | Separate service follows single-responsibility; ExpiryCronService handles expiry only |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
supabase/migrations/
  013_agent_tier.sql                    # Agent columns on users table

apps/api/src/
  invitations/
    expiry/
      expiry-cron.service.ts            # EXISTING -- no changes
      draft-cleanup-cron.service.ts     # NEW -- draft auto-delete cron
    invitations.service.ts              # MODIFY -- extend enforceFreeTierLimit
    invitations.module.ts               # MODIFY -- register DraftCleanupCronService
  admin/
    admin.service.ts                    # MODIFY -- agent grant/renew, storage cleanup
    admin.controller.ts                 # MODIFY -- new endpoints
  auth/
    auth.service.ts                     # MODIFY -- include user tier in /me response

packages/types/src/
  user.ts                               # MODIFY -- add UserTier type, agent fields
  admin.ts                              # MODIFY -- extend AdminUser with agent fields

apps/web/
  components/app/
    DashboardClient.tsx                 # MODIFY -- agent quota bar, warning badges
    AgentQuotaBar.tsx                   # NEW -- quota progress component
  components/admin/
    UserDetailDialog.tsx                # MODIFY -- agent controls
  app/(admin)/admin/cai-dat/page.tsx    # MODIFY -- storage cleanup section
```

### Pattern 1: Agent Tier as User-Level Columns
**What:** Add agent-related columns directly to the `users` table rather than a separate table.
**When to use:** When the relationship is 1:1 and the data is tightly coupled to the user entity.
**Rationale:** The agent tier data (subscription_start, subscription_end, published_count_in_cycle) only makes sense in the context of a single user. A separate table would require joins everywhere and add no normalization benefit since agent tier cannot be shared across users.

**Schema:**
```sql
-- Add to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'user'
  CHECK (tier IN ('user', 'agent'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ DEFAULT NULL;
```

**Key point:** `tier` is separate from `role` (which controls admin access). A user can be `role=user, tier=agent` or `role=admin, tier=user`. They are orthogonal concerns.

### Pattern 2: Quota Enforcement via Count Query
**What:** Count published invitations within the agent's current cycle at publish time.
**When to use:** Always for agent quota enforcement.
**Why count query:** The existing `enforceFreeTierLimit` already uses a count query. The max is 20 invitations, so the query is trivial. A cached counter would introduce cache invalidation complexity (unpublish, admin changes, etc.) for negligible performance gain.

**Example:**
```typescript
// In enforceFreeTierLimit, extended for agent tier
if (userTier === 'agent') {
  const { count, error } = await this.supabaseAdmin.client
    .from('invitations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['published', 'save_the_date'])
    .is('deleted_at', null)
    .gte('created_at', cycleStart.toISOString())
    .neq('id', currentInvitationId)

  if ((count ?? 0) >= 20) {
    throw new BadRequestException(
      'Da dat gioi han 20 thiep/thang. Vui long cho chu ky moi.'
    )
  }
  return // Agent quota OK
}
```

### Pattern 3: Draft Cleanup Cron (Parallel to ExpiryCronService)
**What:** A separate `DraftCleanupCronService` that runs daily to delete drafts older than 30 days and their associated media.
**When to use:** Daily at midnight Vietnam time (same schedule as expiry cron).
**Why separate:** Single-responsibility principle. Expiry handles published->expired transitions. Draft cleanup handles draft deletion + media removal. Different concerns, different failure modes.

**Example:**
```typescript
@Injectable()
export class DraftCleanupCronService {
  private readonly logger = new Logger(DraftCleanupCronService.name)

  constructor(private readonly invitationsService: InvitationsService) {}

  @Cron('0 1 * * *', {  // 1 AM Vietnam time (offset from expiry at midnight)
    name: 'auto-delete-drafts',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDraftCleanup(): Promise<void> {
    this.logger.log('Starting draft auto-delete...')
    const count = await this.invitationsService.deleteExpiredDrafts()
    this.logger.log(`Draft cleanup complete: ${count} draft(s) deleted`)
  }
}
```

### Pattern 4: Storage Cleanup (Admin Action)
**What:** Admin triggers cleanup of media for expired and soft-deleted invitations.
**When to use:** Manual admin action from settings page.
**Why manual:** Storage cleanup is a heavy operation (listing all objects in multiple buckets). Running it as a cron would be wasteful since expired invitations accumulate slowly. Admin control is appropriate.

**Example flow:**
1. Admin clicks "Doc dep luu tru" button
2. Frontend shows confirmation dialog with estimated cleanup size
3. Backend queries expired + deleted invitations
4. For each: list and remove files from invitation-photos, bank-qr, qr-codes buckets
5. Return count of cleaned invitations and estimated freed storage

### Pattern 5: /me Endpoint for User Profile
**What:** New `GET /auth/me` endpoint returns current user profile including tier, subscription dates, and quota usage.
**When to use:** Dashboard needs to know user tier for conditional rendering (quota bar, greeting, warning badges).
**Why needed:** Currently the frontend only gets user info from the JWT payload (sub, email, role, app_role). Agent tier data (subscription dates, quota) is not in the JWT and should not be -- it changes frequently and JWTs are immutable until refresh.

**Example:**
```typescript
// In auth.controller.ts or a new user.controller.ts
@Get('me')
@UseGuards(JwtGuard)
async getProfile(@CurrentUser() user: JwtPayload) {
  return this.authService.getProfile(user.sub)
}
```

### Anti-Patterns to Avoid
- **Storing tier in JWT:** Agent tier can change (admin grants/revokes) and quota data is dynamic. JWT is immutable until refresh. Use /me endpoint instead.
- **Caching quota count:** At 20 max, a count query is trivial. Caching introduces invalidation complexity when invitations are unpublished, deleted, or admin changes tier.
- **Combining expiry and draft cleanup in one cron:** Different concerns, different failure modes. Keep them separate.
- **Hard-coding 30 days / 20 quota:** Use system_settings or constants that can be adjusted. Store `agent_config` in system_settings table (similar to `expiry_config`).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cron scheduling | Custom setInterval | @nestjs/schedule `@Cron` decorator | Already used for expiry; handles timezone, error recovery |
| Storage file listing | Custom S3 API calls | Supabase client `.storage.from(bucket).list(prefix)` | Already used in deleteUser; handles pagination |
| Date/cycle calculation | Custom date math | Simple Date arithmetic with getTime() | Existing markExpired pattern uses same approach |
| Progress bar UI | Custom SVG/canvas | Tailwind utility classes (bg-gradient, w-[X%]) | Consistent with existing Stitch design system |

**Key insight:** Every pattern needed for Phase 10 already exists in the codebase. The agent tier is an extension of existing user management, quota is an extension of enforceFreeTierLimit, draft cleanup is a parallel of ExpiryCronService, and storage cleanup reuses the deleteUser media cleanup pattern.

## Common Pitfalls

### Pitfall 1: Cycle Boundary Race Condition
**What goes wrong:** Agent publishes invitation #20, then immediately tries #21 before the cycle resets.
**Why it happens:** If quota check and publish are not atomic, two concurrent requests could both pass the quota check.
**How to avoid:** The existing enforceFreeTierLimit already uses a count query that includes `deleted_at IS NULL` and excludes the current invitation. Since Supabase uses PostgreSQL with MVCC, two concurrent requests will both see the same count. The worst case is one extra invitation sneaking through, which is acceptable for a manual-approval business. For strictness, use a Supabase RPC function with row-level locking, but this is overkill for 20/month quota.
**Warning signs:** More than 20 published invitations in a single agent cycle.

### Pitfall 2: Draft Cleanup Deleting Media for Re-publishable Drafts
**What goes wrong:** A draft that was previously published (has a slug) gets auto-deleted, but its media should be kept because the public URL is still accessible.
**Why it happens:** Unpublishing sets status back to 'draft' without clearing slug. If the draft sits for 30 days, the cron would delete it and its media.
**How to avoid:** Draft cleanup should only target drafts that have NEVER been published (slug IS NULL). Drafts with slugs were previously published and should be excluded from auto-delete, OR the 30-day timer should only apply to drafts that have never been published.
**Warning signs:** Public URLs returning 404 for previously-published invitations.

### Pitfall 3: Storage Cleanup Removing Active Media
**What goes wrong:** Admin cleanup accidentally removes photos for an active invitation.
**Why it happens:** Querying for "expired or deleted" invitations misses edge cases (e.g., invitation just got re-published).
**How to avoid:** Only clean media for invitations where `status = 'expired' OR deleted_at IS NOT NULL`. Double-check with a fresh query at deletion time. Log every deletion for audit.
**Warning signs:** Active invitation pages showing broken images.

### Pitfall 4: Agent Tier vs Role Confusion
**What goes wrong:** Code checks `role === 'agent'` instead of `tier === 'agent'`, or vice versa.
**Why it happens:** The existing `role` column controls admin access (`user` | `admin`). Adding `tier` introduces a second axis. Developers may confuse them.
**How to avoid:** Clear naming: `role` for admin access, `tier` for subscription level. Document the distinction. The JWT `app_role` remains `user` or `admin` -- tier is NOT in the JWT.
**Warning signs:** Agents getting admin access, or admins losing admin privileges when granted agent tier.

### Pitfall 5: createdAt vs updatedAt for Draft Expiry
**What goes wrong:** Using updatedAt for draft expiry calculation, allowing users to "poke" drafts to keep them alive.
**Why it happens:** Developer habit of using updatedAt for "last activity" checks.
**How to avoid:** CONTEXT.md explicitly states 30 days from `createdAt`. The cron query must use `created_at` column.
**Warning signs:** Drafts never expiring because auto-save updates `updated_at` on every edit.

### Pitfall 6: Missing /me Endpoint for Dashboard
**What goes wrong:** Dashboard cannot determine user tier and cannot show quota bar or agent greeting.
**Why it happens:** Currently no /me endpoint exists. JWT only contains sub, email, role, app_role.
**How to avoid:** Create a `GET /auth/me` endpoint that returns user profile including tier, subscription dates, and published count in current cycle. Dashboard calls this on mount.
**Warning signs:** Dashboard showing incorrect tier info or no quota bar for agents.

## Code Examples

### DB Migration: Agent Columns on Users Table
```sql
-- Migration 013: Agent tier columns
-- Tier is separate from role: role controls admin access, tier controls subscription level

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'user'
  CHECK (tier IN ('user', 'agent'));

-- Agent subscription tracking
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ DEFAULT NULL;

-- Index for admin queries filtering by tier
CREATE INDEX IF NOT EXISTS idx_users_tier ON public.users(tier) WHERE tier != 'user';
```

### Extended enforceFreeTierLimit
```typescript
// Source: extending existing invitations.service.ts pattern
private async enforcePublishLimit(
  userId: string,
  currentInvitationId: string,
  plan: string,
): Promise<void> {
  // Fetch user tier info
  const { data: user, error: userError } = await this.supabaseAdmin.client
    .from('users')
    .select('tier, subscription_start, subscription_end')
    .eq('id', userId)
    .single()

  if (userError) throw new InternalServerErrorException(userError.message)

  const userRow = user as unknown as {
    tier: string
    subscription_start: string | null
    subscription_end: string | null
  }

  // Agent tier: check 20/cycle quota
  if (userRow.tier === 'agent') {
    // Check subscription is active
    if (!userRow.subscription_end || new Date(userRow.subscription_end) < new Date()) {
      throw new BadRequestException(
        'Goi dai ly da het han. Vui long gia han de tiep tuc xuat ban.'
      )
    }

    const cycleStart = new Date(userRow.subscription_start!)
    // Find the current cycle start (advance by 30-day periods)
    const now = new Date()
    while (cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000 <= now.getTime()) {
      cycleStart.setTime(cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000)
    }

    const { count, error } = await this.supabaseAdmin.client
      .from('invitations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['published', 'save_the_date'])
      .is('deleted_at', null)
      .gte('created_at', cycleStart.toISOString())
      .neq('id', currentInvitationId)

    if (error) throw new InternalServerErrorException(error.message)

    if ((count ?? 0) >= 20) {
      throw new BadRequestException(
        'Da dat gioi han 20 thiep/thang. Vui long cho chu ky moi.'
      )
    }
    return // Agent can publish (auto-premium)
  }

  // Regular user: existing free tier check
  if (plan !== 'free') return

  const { count, error } = await this.supabaseAdmin.client
    .from('invitations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['published', 'save_the_date'])
    .is('deleted_at', null)
    .neq('id', currentInvitationId)

  if (error) throw new InternalServerErrorException(error.message)

  if ((count ?? 0) >= 1) {
    throw new BadRequestException(
      'Ban chi co the xuat ban 1 thiep mien phi. Vui long nang cap len Premium de xuat ban them.'
    )
  }
}
```

### Draft Cleanup Service
```typescript
// Source: parallel to apps/api/src/invitations/expiry/expiry-cron.service.ts
@Injectable()
export class DraftCleanupCronService {
  private readonly logger = new Logger(DraftCleanupCronService.name)

  constructor(private readonly invitationsService: InvitationsService) {}

  @Cron('0 1 * * *', {
    name: 'auto-delete-drafts',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDraftCleanup(): Promise<void> {
    this.logger.log('Starting draft auto-delete...')
    const count = await this.invitationsService.deleteExpiredDrafts()
    this.logger.log(`Draft cleanup complete: ${count} draft(s) deleted`)
  }
}
```

### deleteExpiredDrafts Method (InvitationsService)
```typescript
async deleteExpiredDrafts(): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Only delete drafts that have NEVER been published (slug IS NULL)
  const { data, error } = await this.supabaseAdmin.client
    .from('invitations')
    .select('id, photo_urls, bank_qr_url, bride_bank_qr_url, groom_avatar_url, bride_avatar_url, qr_code_url')
    .eq('status', 'draft')
    .is('slug', null)  // Never-published drafts only
    .is('deleted_at', null)
    .lt('created_at', thirtyDaysAgo)

  if (error || !data || data.length === 0) return 0

  let deletedCount = 0
  for (const row of data as unknown as Array<{
    id: string
    photo_urls: string[]
    bank_qr_url: string | null
    bride_bank_qr_url: string | null
    groom_avatar_url: string | null
    bride_avatar_url: string | null
    qr_code_url: string | null
  }>) {
    // Delete media from storage
    await this.deleteInvitationMedia(row.id)

    // Hard delete the draft (not soft-delete -- it's already a draft being cleaned up)
    const { error: delError } = await this.supabaseAdmin.client
      .from('invitations')
      .delete()
      .eq('id', row.id)

    if (!delError) deletedCount++
  }

  return deletedCount
}
```

### Admin Storage Cleanup
```typescript
// Source: extending admin.service.ts, reusing deleteUser media pattern
async clearExpiredStorage(): Promise<{ cleanedInvitations: number; estimatedFreedMb: number }> {
  const client = this.supabaseAdmin.client

  // Find expired + soft-deleted invitations
  const { data, error } = await client
    .from('invitations')
    .select('id')
    .or('status.eq.expired,deleted_at.not.is.null')

  if (error) throw new InternalServerErrorException(error.message)
  if (!data || data.length === 0) return { cleanedInvitations: 0, estimatedFreedMb: 0 }

  let cleanedCount = 0
  const buckets = ['invitation-photos', 'bank-qr', 'qr-codes']

  for (const row of data as unknown as { id: string }[]) {
    for (const bucket of buckets) {
      const { data: files } = await client.storage.from(bucket).list(row.id)
      if (files && files.length > 0) {
        await client.storage
          .from(bucket)
          .remove(files.map((f) => `${row.id}/${f.name}`))
      }
    }
    cleanedCount++
  }

  return {
    cleanedInvitations: cleanedCount,
    estimatedFreedMb: Math.round(cleanedCount * 1.5 * 10) / 10,
  }
}
```

### Agent Quota Bar Component
```typescript
// Source: new component following existing DashboardClient stat card pattern
interface AgentQuotaBarProps {
  published: number
  limit: number
  daysRemaining: number
}

function AgentQuotaBar({ published, limit, daysRemaining }: AgentQuotaBarProps) {
  const pct = Math.min((published / limit) * 100, 100)

  return (
    <div className="bg-white p-5 rounded-xl border border-[#e6dbde] shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[#5e4d52] text-sm font-medium">Quota thang nay</p>
        <span className="text-xs text-[#89616b]">{daysRemaining} ngay con lai</span>
      </div>
      <p className="text-[#181113] text-2xl font-bold mb-3">
        {published}/{limit} thiep da xuat ban
      </p>
      <div className="w-full h-2 bg-[#f4f0f1] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ec1349] to-[#ff6b8a] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No user tier | Adding tier column | Phase 10 | Users table gains 'user'/'agent' tier |
| No /me endpoint | Adding GET /auth/me | Phase 10 | Dashboard can access full user profile |
| No draft expiry | 30-day auto-delete | Phase 10 | Reduces stale data and storage usage |
| Drafts kept forever | Hard-delete + media removal | Phase 10 | Storage freed proactively |
| Manual storage cleanup | Admin Clear Storage button | Phase 10 | Admin can reclaim expired invitation media |

**Unchanged:**
- Published link expiration: Phase 9 system works as-is
- InvitationPlan type ('free' | 'premium'): Agent invitations are `plan='premium'` at publish time
- Payment model: Same manual bank transfer + admin grant

## Open Questions

1. **Agent invitation plan value at creation time**
   - What we know: Agent invitations are "automatically Premium" per CONTEXT.md
   - What's unclear: Should plan be set to 'premium' at creation (before publish) or only at publish time?
   - Recommendation: Set `plan='premium'` at publish time for agents (not at creation). This way drafts remain 'free' and only become premium when published, consistent with how the existing system works. The agent tier at user level is what determines auto-premium, not the invitation's plan field at creation.

2. **Agent downgrade mid-cycle behavior**
   - What we know: Admin can change user tier from agent to user.
   - What's unclear: What happens to already-published agent invitations and remaining quota?
   - Recommendation: Published invitations keep their premium status (they are already `plan='premium'`). The user simply loses the ability to publish more under agent quota. If the admin grants agent again later, start a fresh cycle.

3. **Dashboard user info source**
   - What we know: No /me endpoint exists. JWT only has sub, email, role, app_role.
   - What's unclear: Should we add a /me endpoint or embed tier info in the invitations list response?
   - Recommendation: Add a `GET /auth/me` endpoint. This is cleaner than embedding user-level data in the invitations response. The endpoint returns `{ id, email, role, tier, subscriptionStart, subscriptionEnd, quotaUsed, quotaLimit, daysRemaining }`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (via vitest.config.ts in apps/api) |
| Config file | apps/api/vitest.config.ts |
| Quick run command | `cd apps/api && npx vitest run --reporter=verbose` |
| Full suite command | `cd apps/api && npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AGT-01 | Agent columns exist in migration | manual | Migration SQL review | N/A |
| AGT-02 | Admin grant/renew agent tier | unit | `cd apps/api && npx vitest run src/admin/__tests__/agent-management.spec.ts -x` | Wave 0 |
| AGT-03 | Agent quota enforcement at publish | unit | `cd apps/api && npx vitest run src/invitations/__tests__/agent-quota.spec.ts -x` | Wave 0 |
| AGT-04 | /me endpoint returns agent profile | unit | `cd apps/api && npx vitest run src/auth/__tests__/profile.spec.ts -x` | Wave 0 |
| AGT-05 | Draft auto-delete cron | unit | `cd apps/api && npx vitest run src/invitations/__tests__/draft-cleanup.spec.ts -x` | Wave 0 |
| AGT-06 | Draft warning badge calculation | unit | Frontend test (optional) | Wave 0 |
| AGT-07 | Admin clear storage | unit | `cd apps/api && npx vitest run src/admin/__tests__/storage-cleanup.spec.ts -x` | Wave 0 |
| AGT-08 | Agent greeting conditional | unit | Frontend test (optional) | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd apps/api && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd apps/api && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/api/src/admin/__tests__/agent-management.spec.ts` -- covers AGT-02
- [ ] `apps/api/src/invitations/__tests__/agent-quota.spec.ts` -- covers AGT-03
- [ ] `apps/api/src/auth/__tests__/profile.spec.ts` -- covers AGT-04
- [ ] `apps/api/src/invitations/__tests__/draft-cleanup.spec.ts` -- covers AGT-05
- [ ] `apps/api/src/admin/__tests__/storage-cleanup.spec.ts` -- covers AGT-07

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of all relevant files:
  - `supabase/migrations/001_foundation_schema.sql` -- users and invitations table schema
  - `supabase/migrations/008_invitation_plan.sql` -- plan column
  - `supabase/migrations/009_admin_panel.sql` -- is_locked, system_settings, storage buckets
  - `apps/api/src/invitations/invitations.service.ts` -- enforceFreeTierLimit, markExpired, publish
  - `apps/api/src/invitations/expiry/expiry-cron.service.ts` -- cron pattern
  - `apps/api/src/admin/admin.service.ts` -- user management, storage operations
  - `apps/api/src/admin/admin.controller.ts` -- admin endpoints
  - `apps/api/src/auth/auth.service.ts` -- JWT signing, user login/register
  - `packages/types/src/user.ts` -- UserRole type
  - `packages/types/src/admin.ts` -- AdminUser, SystemSettings
  - `packages/types/src/invitation.ts` -- InvitationPlan, Invitation
  - `apps/web/components/app/DashboardClient.tsx` -- dashboard layout
  - `apps/web/components/admin/UserDetailDialog.tsx` -- user detail dialog
  - `apps/web/app/(admin)/admin/cai-dat/page.tsx` -- settings page

### Secondary (MEDIUM confidence)
- NestJS @nestjs/schedule documentation -- cron pattern, timezone support (verified by existing ExpiryCronService)
- Supabase Storage API -- `.list()`, `.remove()` (verified by existing deleteUser and deletePhoto methods)

### Tertiary (LOW confidence)
- None -- all findings are verified against existing codebase patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use
- Architecture: HIGH -- all patterns are extensions of existing codebase patterns
- Pitfalls: HIGH -- derived from direct code analysis of edge cases
- Validation: MEDIUM -- test file structure follows existing pattern but specific test content needs to be written

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable -- all patterns are internal codebase patterns)
