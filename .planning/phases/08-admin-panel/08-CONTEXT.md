# Phase 8: Admin Panel - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete admin panel with 8 sections: dashboard stats, user management, invitations oversight, music library, themes, service plans config, payments (enhance existing), and system settings. Admin can oversee all platform data, manage users, configure system behavior. Admin cannot edit invitation content — read-only view only.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Overview
- Stat cards showing: total users, total invitations (with breakdown by status), total Premium upgrades, storage usage estimate
- One line chart: invitations created over last 30 days (recharts, already installed)
- Cards replace current em-dash placeholders from Phase 2
- Real data from NestJS admin endpoints

### User Management
- User list with search by name/email, filter by status (active/locked), sort by created date
- Actions per user:
  - Lock/unlock account (blocks login, published invitations stay live)
  - View user's invitations (expandable list with status, plan, links)
  - Delete user — **hard delete**: permanently removes user + all invitations + all uploaded media from Supabase Storage. Irreversible.
  - Change role: promote user → admin or demote admin → user
- User detail view shows: email, phone, created date, invitation count, plan distribution

### Invitations Section
- List all invitations with search/filter (by couple names, slug, status, plan)
- Read-only view of any invitation — admin cannot edit content
- Disable/enable toggle for violations — disabled invitation's public page returns 404
- Link to public page for each published invitation
- Show plan status (Free/Premium) and payment status

### Music Library
- Upload new MP3 files to `system-music` Supabase Storage bucket
- List all tracks with title, artist, duration, usage count, active/inactive status
- Enable/disable toggle — disabled tracks hidden from editor picker but still play on existing invitations that selected them (ADMN-07 contract)
- Delete unused tracks (only if usage count = 0)

### Themes Section
- List theme metadata: name, tag, thumbnail, active status
- Enable/disable toggle — disabled themes hidden from template selector
- Edit name/tag/thumbnail — no code upload, just metadata management
- Note: currently only 3 templates, this section manages their visibility

### Payments Section (Enhance Phase 7)
- Already built in Phase 7: pending list + approve/reject + revoke + history
- Phase 8 adds: refund marking, internal notes per transaction, export to CSV
- Transaction detail view with timeline (requested → approved/rejected → revoked)

### System Settings
- Stored in `system_settings` database table (key-value pairs)
- Admin UI page at `/admin/cai-dat` with form sections:
  - **Payment config**: admin bank QR image upload, bank name, account holder, price per invitation (replaces env vars)
  - **Watermark config**: watermark text (default "ThiepCuoiOnline.vn"), opacity level
  - **Invitation expiry**: default grace period in days (currently hardcoded 7 days)
  - **Upload limits**: max photo file size (MB), max photos per invitation for Premium
- Changes save to DB and take effect immediately (NestJS reads from system_settings on each relevant request or caches with short TTL)
- Once system_settings is populated, the app reads from DB instead of env vars/hardcoded values

### Claude's Discretion
- Admin dashboard layout and card design
- Search/filter UI components and debounce timing
- Music upload progress indicator
- Theme thumbnail upload handling
- CSV export format for payments
- system_settings table schema (key TEXT PRIMARY KEY, value JSONB)
- Cache TTL for system settings reads
- Pagination approach for user/invitation lists (offset or cursor)
- How to handle admin deleting themselves (prevent or allow)

</decisions>

<specifics>
## Specific Ideas

- Admin panel is the operational backbone — admin needs to oversee everything without editing invitation content
- Hard delete for users is intentional — keeps storage clean, no zombie data
- System settings table replaces scattered env vars and hardcoded values — single source of truth
- Music library's "inactive still plays" contract is critical — don't break existing invitations
- Payments section enhancement builds on Phase 7's foundation — don't rebuild, extend

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Admin layout + sidebar at `apps/web/app/(admin)/` (Phase 2)
- `AdminSidebar.tsx` with navigation links
- recharts for charts (Phase 2, already installed)
- Admin stat card placeholders (Phase 2)
- `AdminGuard` with `app_role` check (Phase 7 fix)
- Admin payments page at `/admin/thanh-toan` (Phase 7)
- `system_music_tracks` table + `system-music` bucket (Phase 4)
- `apiFetch` utility for API calls

### Established Patterns
- Admin routes use `@UseGuards(AdminGuard)` on controller methods
- `SupabaseAdminService` (service role) for all DB/storage operations
- shadcn/ui components for forms (Input, Button, Dialog, etc.)
- Toast notifications via Sonner
- `class-validator` DTOs for input validation

### Integration Points
- `apps/web/app/(admin)/admin/` — add new pages for each section
- `apps/api/src/invitations/invitations.controller.ts` — admin endpoints (some exist from Phase 7)
- New `apps/api/src/admin/` module for user management and system settings
- `supabase/migrations/` — system_settings table, is_locked column on users
- `AdminSidebar.tsx` — add navigation links for all 8 sections

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-admin-panel*
*Context gathered: 2026-03-16*
