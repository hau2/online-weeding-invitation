# Phase 15: Admin Panel Redesign - Modern Stitch AI Design - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Restyle all admin panel pages (dashboard, users, invitations, themes, music, plans, payments, settings) and admin sidebar/layout to match the Stitch AI design system established in Phases 13-14. This is purely visual restyling — no new functionality, no API changes, no DB migrations. All 8 admin sections plus the layout/sidebar get the Stitch treatment.

</domain>

<decisions>
## Implementation Decisions

### Sidebar & Layout
- Admin sidebar matches user-facing AppSidebar Stitch style: dark #181113 background, #ec1349 active indicator, Plus Jakarta Sans font
- Sidebar header shows platform branding (Thiep Cuoi Online) with a small "Admin" badge below it
- Header bar is minimal: sidebar toggle + page title only (no breadcrumb, no search, no notifications)
- Content area background: #f8f6f6 (Stitch warm off-white)
- Page titles: text-2xl font-bold text-[#181113] with Plus Jakarta Sans, no subtitle

### Data Tables & Lists
- Every list page wraps its table in a white Stitch card (rounded-xl, border-[#e6dbde])
- Table headers use #89616b text, rows have hover:bg-[#f8f6f6]
- Search bars: Stitch input pattern (border-[#e6dbde], focus:border-[#ec1349], rounded-lg)
- Filter tabs/buttons use Stitch palette colors
- Status badges: rounded-full pill badges with colored backgrounds (green for active/published, #ec1349 for locked/disabled, amber for pending, gray for draft)
- Row action buttons: icon-only ghost buttons with Stitch warm hover (#f4f0f1), destructive actions hover red (hover:bg-red-50)

### Stat Cards & Charts
- Dashboard stat cards: white rounded-xl cards with border-[#e6dbde], icon in small colored circle (each card different Stitch-palette color), value in bold #181113, label in #89616b
- Chart section wrapped in its own white Stitch card with card header ("Thong ke 30 ngay")
- Recharts line chart: primary line #ec1349, grid lines #e6dbde, axis labels #89616b

### Form Pages & Dialogs
- Settings page: each config section in its own white Stitch card with card header, save button per card
- Detail/edit dialogs: white bg, rounded-xl, border-[#e6dbde], header with #181113 title, Stitch buttons
- Primary action buttons: bg-[#ec1349] hover:bg-red-600 text-white rounded-lg h-10 px-6 font-bold (same as user-facing)
- Destructive buttons: outlined red variant
- Toggle switches: #ec1349 when active, gray when inactive
- All inputs use Stitch input pattern: border-[#e6dbde] focus:border-[#ec1349] rounded-lg h-12

### Claude's Discretion
- Exact spacing and padding within cards
- StatCard icon circle color assignments per stat type
- Settings card grouping (which settings go in which card)
- Pagination component styling details
- Mobile responsive behavior for admin pages
- Dialog width/height per dialog type
- Loading skeleton design for admin pages

</decisions>

<specifics>
## Specific Ideas

- "Same Stitch system as Phases 13-14" — unified look across the entire platform, admin included
- Sidebar should feel like a natural extension of the user-facing AppSidebar, not a different app
- All component patterns already established: Stitch button, Stitch input, Stitch card, Stitch label — just apply them consistently to admin pages

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Stitch color palette: #ec1349, #181113, #89616b, #e6dbde, #f4f0f1, #f8f6f6
- Plus Jakarta Sans font configured globally
- AppSidebar: dark Stitch sidebar pattern to mirror for AdminSidebar
- StatCard component (apps/web/components/admin/StatCard.tsx): needs Stitch restyling
- AdminDashboardCharts component: needs Stitch chart theme
- UserDetailDialog component: needs Stitch dialog styling
- All 8 admin page files under apps/web/app/(admin)/admin/

### Established Patterns
- Stitch button: `bg-[#ec1349] hover:bg-red-600 text-white rounded-lg h-10 px-6 font-bold`
- Stitch input: `border-[#e6dbde] focus:border-[#ec1349] rounded-lg h-12`
- Stitch card: `bg-white rounded-xl border-[#e6dbde] shadow-sm`
- Stitch label: `text-xs font-semibold text-[#89616b]`
- SidebarProvider/SidebarInset layout pattern from shadcn/ui

### Integration Points
- `apps/web/app/(admin)/layout.tsx` — admin layout (header + sidebar)
- `apps/web/components/admin/AdminSidebar.tsx` — sidebar nav
- `apps/web/components/admin/StatCard.tsx` — dashboard stat cards
- `apps/web/components/admin/AdminDashboardCharts.tsx` — dashboard charts
- 8 page files: page.tsx, nguoi-dung, thiep-cuoi, nhac, giao-dien, goi-dich-vu, thanh-toan, cai-dat

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-admin-panel-redesign-modern-stitch-ai-design*
*Context gathered: 2026-03-17*
