# Phase 2: App Shell - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the navigable application shell: Next.js route groups with auth middleware, user dashboard showing invitation list, admin layout skeleton with role-based access control. Also includes NestJS invitations module for CRUD + listing with ownership enforcement.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Layout
- Card grid layout for invitations — visual cards with wedding aesthetic
- Each card shows: couple names + wedding date, template thumbnail, status badge + creation date, view count
- Status badges: colored — Nháp (gray), Đã xuất bản (green), Hết hạn (red)
- Empty state: illustrated CTA with wedding illustration + "Tạo thiệp cưới đầu tiên của bạn" button — warm and inviting

### Navigation & Shell
- User app: sidebar + top bar layout (left sidebar for navigation, top bar for user menu)
- Mobile: hamburger menu (classic ≡ icon, slide-out menu)
- User profile menu: extended — Tài khoản, Gói dịch vụ, Hỗ trợ, Đăng xuất

### Admin Layout
- Visual style: professional/neutral — clean white/gray theme, separate from the pink wedding theme
- Sidebar: icon + text for each of the 8 fixed menu items (per FS)
- Admin dashboard: stats cards + charts (top row stat cards for users/invitations/revenue, charts below)

### Invitation Actions
- Action buttons: icon button row at bottom of each card (edit, view public page) — compact
- NO invitation QR code — users share the public page via link (Zalo, Facebook), not QR
- The only QR in the system is the bank gift QR that users upload
- "Xem QR" button removed from dashboard — replaced with "Chia sẻ" (share link) or just "Xem trang" (view page)
- Create flow: quick setup wizard — pick template → enter couple names → go to editor

### Claude's Discretion
- Exact sidebar width and collapse behavior on desktop
- Dashboard card grid column count (responsive breakpoints)
- Admin chart library choice
- Mobile hamburger menu animation style
- Exact icon choices for action buttons

</decisions>

<specifics>
## Specific Ideas

- Dashboard should feel like a personal wedding planning space — not a generic SaaS dashboard
- Cards should animate in on page load (framer-motion, consistent with Phase 1 design decisions)
- Admin panel should feel like a separate internal tool — clearly different visual identity from the user-facing wedding app
- The create wizard should be quick (2-3 steps max) — couples are excited to start, don't slow them down

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 1 establishes: shadcn/ui components, Be Vietnam Pro font, Tailwind v4, soft pink/rose palette
- Phase 1 establishes: NestJS auth module with JWT, Supabase schema with RLS

### Established Patterns
- Phase 1: centered card layout for auth pages
- Phase 1: toast notifications for feedback
- Phase 1: framer-motion for animations
- Phase 1: custom NestJS JWT auth (jose for Edge Runtime verification in middleware)

### Integration Points
- Next.js route groups: (site), (auth), (app), (admin) — middleware guards for (app) and (admin)
- NestJS invitations module connects to existing auth module for ownership enforcement
- Dashboard reads from NestJS invitation list endpoint
- Admin role check uses the role column on users table from Phase 1

</code_context>

<deferred>
## Deferred Ideas

- PUBL-02 (Fixed QR code for invitation URL) needs to be removed or updated — user confirmed NO invitation QR. Only bank gift QR exists. This affects Phase 5 planning.

</deferred>

---

*Phase: 02-app-shell*
*Context gathered: 2026-03-14*
