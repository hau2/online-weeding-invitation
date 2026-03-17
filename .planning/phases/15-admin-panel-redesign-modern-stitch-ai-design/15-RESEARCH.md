# Phase 15: Admin Panel Redesign - Modern Stitch AI Design - Research

**Researched:** 2026-03-17
**Domain:** CSS/Tailwind visual restyling of admin panel to Stitch AI design system
**Confidence:** HIGH

## Summary

This phase is a purely visual restyling effort applying the Stitch AI design system (established in Phases 13-14) to all admin panel pages. No new functionality, API changes, or database migrations are needed. The existing admin pages use a generic gray/white color scheme with `gray-*` Tailwind classes throughout. The target is to replace these with the Stitch palette: `#ec1349` (primary rose), `#181113` (dark text), `#89616b` (muted text), `#e6dbde` (borders), `#f4f0f1` (hover bg), `#f8f6f6` (content area bg), using Plus Jakarta Sans font consistently.

The codebase already has all necessary infrastructure: Plus Jakarta Sans is loaded globally (`--font-display`), the Stitch color tokens are established in the user-facing app, and the AppSidebar provides a direct reference for the AdminSidebar redesign. The work is mechanical: update Tailwind utility classes across 10 files (1 layout, 1 sidebar component, 3 shared admin components, 8 page files minus the overlap with dashboard which is 1 file, plus the pages that are separate files).

**Primary recommendation:** Work page-by-page in logical groups: (1) layout + sidebar first (sets the frame), (2) dashboard with StatCard + Charts, (3) list pages (users, invitations, music, themes), (4) form/config pages (service plans, payments, settings). Each group can be independently verified.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Sidebar & Layout:**
- Admin sidebar matches user-facing AppSidebar Stitch style: dark #181113 background, #ec1349 active indicator, Plus Jakarta Sans font
- Sidebar header shows platform branding (Thiep Cuoi Online) with a small "Admin" badge below it
- Header bar is minimal: sidebar toggle + page title only (no breadcrumb, no search, no notifications)
- Content area background: #f8f6f6 (Stitch warm off-white)
- Page titles: text-2xl font-bold text-[#181113] with Plus Jakarta Sans, no subtitle

**Data Tables & Lists:**
- Every list page wraps its table in a white Stitch card (rounded-xl, border-[#e6dbde])
- Table headers use #89616b text, rows have hover:bg-[#f8f6f6]
- Search bars: Stitch input pattern (border-[#e6dbde], focus:border-[#ec1349], rounded-lg)
- Filter tabs/buttons use Stitch palette colors
- Status badges: rounded-full pill badges with colored backgrounds (green for active/published, #ec1349 for locked/disabled, amber for pending, gray for draft)
- Row action buttons: icon-only ghost buttons with Stitch warm hover (#f4f0f1), destructive actions hover red (hover:bg-red-50)

**Stat Cards & Charts:**
- Dashboard stat cards: white rounded-xl cards with border-[#e6dbde], icon in small colored circle (each card different Stitch-palette color), value in bold #181113, label in #89616b
- Chart section wrapped in its own white Stitch card with card header ("Thong ke 30 ngay")
- Recharts line chart: primary line #ec1349, grid lines #e6dbde, axis labels #89616b

**Form Pages & Dialogs:**
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | v4 | Utility-first CSS | Already used across entire project |
| Plus Jakarta Sans | Google Font | Stitch design system font | Already loaded via `--font-display` variable |
| Lucide React | latest | Icon library | Already used in all admin pages |
| recharts | latest | Dashboard charts | Already installed for AdminDashboardCharts |
| shadcn/ui (base-nova) | latest | Dialog, Button, Input, Sidebar components | Already installed and used |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | latest | Toast notifications | Already used for admin action feedback |
| @base-ui/react | latest | Underlying component lib for shadcn | Already used (render prop pattern) |

### No New Dependencies
This phase requires zero new package installations. All styling is done with existing Tailwind utilities and existing component library.

## Architecture Patterns

### Files to Modify (Complete List)

```
apps/web/
├── app/(admin)/
│   ├── layout.tsx                    # Admin layout (header + content bg)
│   └── admin/
│       ├── page.tsx                  # Dashboard
│       ├── nguoi-dung/page.tsx       # Users
│       ├── thiep-cuoi/page.tsx       # Invitations
│       ├── nhac/page.tsx             # Music
│       ├── giao-dien/page.tsx        # Themes
│       ├── goi-dich-vu/page.tsx      # Service plans
│       ├── thanh-toan/page.tsx       # Payments
│       └── cai-dat/page.tsx          # Settings
└── components/admin/
    ├── AdminSidebar.tsx              # Sidebar nav
    ├── StatCard.tsx                   # Dashboard stat cards
    ├── AdminDashboardCharts.tsx       # Dashboard charts
    └── UserDetailDialog.tsx           # User detail modal
```

**Total: 12 files to restyle. No new files created.**

### Pattern 1: Stitch Color Token Mapping

Every admin page currently uses generic gray Tailwind classes. The mapping is systematic:

| Current (gray) | Stitch Replacement | Usage |
|---|---|---|
| `text-gray-900` | `text-[#181113]` | Primary text, headings, values |
| `text-gray-700` | `text-[#181113]` | Secondary text (promote to primary) |
| `text-gray-500` | `text-[#89616b]` | Labels, descriptions, muted text |
| `text-gray-400` | `text-[#89616b]` | Timestamps, metadata |
| `border-gray-200` | `border-[#e6dbde]` | Card borders, table borders |
| `border-gray-100` | `border-[#e6dbde]` or `border-[#f4f0f1]` | Subtle borders |
| `bg-gray-50` | `bg-[#f8f6f6]` | Content area, hover states |
| `bg-gray-100` | `bg-[#f4f0f1]` | Icon circles, muted backgrounds |
| `hover:bg-gray-50` | `hover:bg-[#f8f6f6]` | Row hover |
| `hover:bg-gray-100` | `hover:bg-[#f4f0f1]` | Button hover |
| `bg-white` | `bg-white` | Cards (unchanged) |
| `bg-gray-900 text-white` | `bg-[#ec1349] text-white` | Primary action buttons |
| `focus:ring-gray-300` | `focus:border-[#ec1349]` | Input focus state |

### Pattern 2: AdminSidebar Dark Theme

The CONTEXT specifies a dark `#181113` background for AdminSidebar, distinct from the user-facing AppSidebar which uses `bg-white`. This is the key differentiation. The AppSidebar provides the structural pattern but AdminSidebar uses dark background with light text:

```typescript
// AdminSidebar dark Stitch pattern
<Sidebar collapsible="icon" className="border-r border-[#2a1f22] bg-[#181113]">
  <SidebarHeader className="border-b border-[#2a1f22] p-4">
    <span className="text-white font-bold text-lg font-[family-name:var(--font-display)]">
      Thiep Cuoi Online
    </span>
    <span className="text-[#89616b] text-xs font-medium">Admin</span>
  </SidebarHeader>
  <SidebarContent>
    <SidebarMenu>
      <SidebarMenuButton
        isActive={isActive}
        className={isActive
          ? 'bg-[#ec1349]/15 text-[#ec1349] font-bold'
          : 'text-[#b8a0a5] hover:bg-[#2a1f22] hover:text-white'
        }
      >
```

### Pattern 3: Stitch Card Wrapper

All list pages currently render items as standalone cards with `space-y-2`. The CONTEXT specifies wrapping in a single white Stitch card container:

```typescript
// Stitch card wrapper for list content
<div className="bg-white rounded-xl border border-[#e6dbde] overflow-hidden">
  {/* Optional card header */}
  <div className="px-6 py-4 border-b border-[#e6dbde]">
    <h3 className="text-sm font-semibold text-[#89616b] uppercase tracking-wide">
      Danh sach nguoi dung
    </h3>
  </div>
  {/* Table rows */}
  <div className="divide-y divide-[#f4f0f1]">
    {items.map(item => (
      <div className="px-6 py-4 hover:bg-[#f8f6f6] transition-colors">
        {/* row content */}
      </div>
    ))}
  </div>
</div>
```

### Pattern 4: Stitch StatCard

The current StatCard uses gray icon backgrounds. The Stitch version uses colored icon circles:

```typescript
// Stitch StatCard pattern
<div className="bg-white rounded-xl border border-[#e6dbde] p-6 shadow-sm">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-[#89616b]">{title}</p>
      <p className="text-3xl font-bold text-[#181113] mt-1">{value}</p>
    </div>
    <div className={cn("size-10 rounded-lg flex items-center justify-center", iconColorClass)}>
      <Icon className="size-5 text-white" />
    </div>
  </div>
</div>
```

Icon color assignments (Claude's discretion):
- Total users: `bg-blue-500`
- Total invitations: `bg-[#ec1349]`
- Published: `bg-green-500`
- Premium: `bg-amber-500`
- Revenue: `bg-purple-500`
- Storage: `bg-cyan-500`

### Pattern 5: Stitch Input

All native `<input>` elements throughout admin pages use inconsistent styling. Standardize to:

```typescript
// Stitch input pattern
className="w-full rounded-lg border border-[#e6dbde] px-3 py-2.5 text-sm text-[#181113]
  placeholder:text-[#89616b]
  focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]
  h-12"
```

### Pattern 6: Stitch Button

Replace all `bg-gray-900` primary buttons with Stitch primary:

```typescript
// Stitch primary button
className="bg-[#ec1349] hover:bg-red-600 text-white rounded-lg h-10 px-6 font-bold"

// Stitch destructive button (outlined)
className="border border-red-300 text-red-600 hover:bg-red-50 rounded-lg h-10 px-6 font-medium"
```

### Pattern 7: Stitch Status Badges

Current badges use various `bg-gray-100`, `bg-green-100` etc. Standardize:

```typescript
const STITCH_STATUS_BADGES: Record<string, string> = {
  draft: 'bg-[#f4f0f1] text-[#89616b]',
  published: 'bg-green-100 text-green-700',
  save_the_date: 'bg-blue-100 text-blue-700',
  expired: 'bg-[#ec1349]/10 text-[#ec1349]',
  active: 'bg-green-100 text-green-700',
  locked: 'bg-[#ec1349]/10 text-[#ec1349]',
  pending: 'bg-amber-100 text-amber-700',
}
```

### Anti-Patterns to Avoid
- **Mixing gray and Stitch colors:** After restyling, no `gray-*` references should remain in admin files. Every instance must be replaced with Stitch tokens.
- **Inconsistent font family:** Admin pages must use `font-[family-name:var(--font-display)]` on key headings to match Plus Jakarta Sans.
- **Different button patterns per page:** All primary buttons must use the exact same `bg-[#ec1349]` pattern.
- **Custom focus rings:** Never `focus:ring-2 focus:ring-gray-300`; always `focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark sidebar CSS | Custom dark mode | Inline Tailwind classes with hex colors | Stitch uses explicit hex, not Tailwind dark mode |
| Card components | New StitchCard wrapper | Direct Tailwind classes per CONTEXT spec | Adding abstraction slows this phase; apply classes directly |
| Badge components | Reusable StitchBadge | Per-page badge maps with direct classes | Each page has unique badge semantics |

**Key insight:** This is a restyling phase, not a refactoring phase. Apply Stitch tokens directly via Tailwind classes. Do not create new abstraction layers or shared components beyond what already exists (StatCard, AdminDashboardCharts, UserDetailDialog).

## Common Pitfalls

### Pitfall 1: Sidebar CSS Variable Conflicts
**What goes wrong:** The global CSS sets `--sidebar: #ffffff` and `--sidebar-foreground: #181113`. The admin sidebar wants `bg-[#181113]` (dark). Using CSS variables would conflict with the user-facing sidebar.
**Why it happens:** shadcn/ui Sidebar component reads `--sidebar` CSS variable.
**How to avoid:** Override directly on the AdminSidebar component with explicit `bg-[#181113]` class, NOT via CSS variables. The AdminSidebar already uses `className` prop on `<Sidebar>`, so inline classes take precedence.
**Warning signs:** Admin sidebar renders white instead of dark after changes.

### Pitfall 2: Missing Font Application
**What goes wrong:** Page titles and headings don't render in Plus Jakarta Sans.
**Why it happens:** The `--font-display` CSS variable is set but the admin layout doesn't apply it. Plus Jakarta Sans must be explicitly referenced.
**How to avoid:** Add `font-[family-name:var(--font-display)]` to the admin layout wrapper or to individual headings. The admin layout currently has no font specification.
**Warning signs:** Admin headings look different from the user-facing dashboard.

### Pitfall 3: Select Element Styling
**What goes wrong:** The `<select>` dropdowns on the invitations page don't match Stitch input styling.
**Why it happens:** Native `<select>` elements have limited CSS styling. The current admin pages use plain `<select>` with minimal styling.
**How to avoid:** Apply Stitch input border/focus classes to `<select>`. The native dropdown appearance will vary by browser but the container can match.
**Warning signs:** Selects have gray borders while inputs have Stitch borders.

### Pitfall 4: File Input Styling
**What goes wrong:** File inputs on music and themes pages don't match Stitch design.
**Why it happens:** `<input type="file">` uses `file:` pseudo-element styling. Current uses `file:bg-gray-100`.
**How to avoid:** Update file pseudo-element classes: `file:bg-[#f4f0f1] file:text-[#181113]`.
**Warning signs:** Upload buttons look gray while everything else is Stitch-colored.

### Pitfall 5: Dialog/Overlay Background
**What goes wrong:** Dialogs use default shadcn/ui styling which may not have Stitch borders.
**Why it happens:** shadcn DialogContent has its own border styling.
**How to avoid:** Add `border border-[#e6dbde]` to DialogContent className overrides. Check that dialog title uses `text-[#181113]` not default.
**Warning signs:** Dialogs look unstyled compared to the rest of the admin panel.

### Pitfall 6: Loading State Spinner Color
**What goes wrong:** Loading spinners remain gray (`text-gray-400`).
**Why it happens:** Every page has a loading state with `<Loader2 className="size-6 animate-spin text-gray-400" />`.
**How to avoid:** Replace `text-gray-400` with `text-[#ec1349]` for primary spinners, or `text-[#89616b]` for subtle spinners.
**Warning signs:** Loading states feel disconnected from the Stitch design.

## Code Examples

### Admin Layout (Stitch Version)
```typescript
// Source: CONTEXT.md decisions + AppSidebar reference
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex items-center gap-3 px-6 h-14 border-b border-[#e6dbde] bg-white">
          <SidebarTrigger className="text-[#89616b] hover:text-[#ec1349]" />
        </header>
        <main className="flex-1 bg-[#f8f6f6] min-h-[calc(100vh-3.5rem)] p-6 font-[family-name:var(--font-display)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### AdminSidebar (Dark Stitch Version)
```typescript
// Source: CONTEXT.md + AppSidebar pattern
<Sidebar collapsible="icon" className="border-r border-[#2a1f22] bg-[#181113]">
  <SidebarHeader className="border-b border-[#2a1f22] p-4">
    <div className="flex flex-col">
      <span className="text-white font-bold text-base">Thiep Cuoi Online</span>
      <span className="text-[#89616b] text-xs font-semibold uppercase tracking-wide mt-0.5">Admin</span>
    </div>
  </SidebarHeader>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel className="text-[#89616b] text-xs uppercase tracking-wide">
        Quan ly
      </SidebarGroupLabel>
      <SidebarMenu>
        {adminNavItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              render={<Link href={item.href} />}
              isActive={pathname === item.href}
              className={pathname === item.href
                ? 'bg-[#ec1349]/15 text-[#ec1349] font-bold rounded-lg'
                : 'text-[#b8a0a5] hover:bg-[#2a1f22] hover:text-white rounded-lg transition-colors'
              }
            >
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
```

### Recharts Stitch Theme
```typescript
// Source: CONTEXT.md chart decisions
<LineChart data={formattedData}>
  <CartesianGrid strokeDasharray="3 3" stroke="#e6dbde" />
  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#89616b' }} />
  <YAxis tick={{ fontSize: 11, fill: '#89616b' }} allowDecimals={false} />
  <Tooltip
    contentStyle={{
      fontSize: 12,
      borderRadius: 12,
      border: '1px solid #e6dbde',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    }}
  />
  <Line
    type="monotone"
    dataKey="count"
    stroke="#ec1349"
    strokeWidth={2}
    dot={{ r: 2, fill: '#ec1349' }}
    activeDot={{ r: 4, fill: '#ec1349' }}
  />
</LineChart>
```

### Page Title Pattern
```typescript
// Source: CONTEXT.md decisions
// BEFORE:
<h1 className="text-xl font-semibold text-gray-900">Nguoi dung</h1>
<p className="text-sm text-gray-500 mb-6">Quan ly tai khoan nguoi dung</p>

// AFTER (no subtitle per CONTEXT, but subtitle was user-discretion; keep as Stitch muted):
<h1 className="text-2xl font-bold text-[#181113]">Nguoi dung</h1>
```

## State of the Art

| Old Approach (Current) | Current Approach (Target) | Changed In | Impact |
|---|---|---|---|
| Generic gray Tailwind palette | Stitch hex color tokens | Phase 13 (public pages), Phase 14 (dashboard/auth) | Visual consistency across platform |
| White sidebar with gray active | Dark #181113 sidebar with #ec1349 active | Phase 15 (this phase) | Admin feels premium, distinct from user UI |
| `bg-gray-900` primary buttons | `bg-[#ec1349]` primary buttons | Phase 13 | Brand-consistent CTAs |
| `focus:ring-gray-300` inputs | `focus:border-[#ec1349]` inputs | Phase 13 | Consistent focus state |

**Already established (not deprecated):**
- AppSidebar white Stitch pattern (Phases 13-14) -- admin uses dark variant, not replacing this
- All shadcn/ui components remain -- just override className props

## Open Questions

1. **Header page title injection**
   - What we know: CONTEXT says header should show "sidebar toggle + page title only". Currently the header has no page title.
   - What's unclear: Whether the page title should be dynamically set per route in the layout header, or if it stays in the page content area.
   - Recommendation: Keep page titles in page content area (current pattern), not in the header bar. The header just has the sidebar toggle. This matches the user-facing AppLayout pattern where the header only has a toggle on mobile.

2. **Settings page save-per-card vs single save**
   - What we know: CONTEXT says "save button per card". Currently settings has one global save button.
   - What's unclear: This requires splitting the single `handleSave` into per-section saves, which is a minor functional change (not purely visual).
   - Recommendation: Add visual save buttons per card but keep them calling the same global save function. The UX improvement is visual grouping, not actually separate API calls.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + React Testing Library (jsdom) |
| Config file | `apps/web/vitest.config.ts` |
| Quick run command | `cd apps/web && npx vitest run --reporter=verbose` |
| Full suite command | `cd apps/web && npx vitest run` |

### Phase Requirements -> Test Map

This is a visual restyling phase with no functional changes. All existing tests should continue to pass unchanged. The primary validation is visual inspection, not automated testing.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VISUAL-01 | AdminSidebar renders with Stitch classes | smoke | `cd apps/web && npx vitest run --reporter=verbose` | N/A (no admin component tests exist) |
| VISUAL-02 | StatCard renders with Stitch colors | smoke | Existing suite passes | N/A |
| VISUAL-03 | All pages render without errors | smoke | Full test suite green | Existing tests cover rendering |
| VISUAL-04 | No gray-* classes remain in admin files | lint-check | `grep -r "gray-" apps/web/app/\(admin\)/ apps/web/components/admin/` should return empty | Manual |

### Sampling Rate
- **Per task commit:** `cd apps/web && npx vitest run --reporter=verbose` (ensure no breakage)
- **Per wave merge:** Full suite green
- **Phase gate:** Full suite green + visual inspection of each admin page

### Wave 0 Gaps
None -- existing test infrastructure covers regression detection. This phase is visual-only and does not introduce testable logic. Visual verification is done by human inspection (screenshot comparison).

## Sources

### Primary (HIGH confidence)
- **Project codebase** -- Direct reading of all 12 admin files, AppSidebar reference, globals.css, layout.tsx, fonts.ts
- **CONTEXT.md** -- User-locked decisions with exact hex colors, class patterns, and specifications
- **Phase 13-14 code** -- Established Stitch patterns in DashboardClient.tsx, AppSidebar.tsx, app layout

### Secondary (MEDIUM confidence)
- **Stitch design system** -- Color palette and patterns derived from Phases 13-14 implementation (no external docs needed)

### Tertiary (LOW confidence)
- None -- all findings based on direct codebase inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, no new dependencies
- Architecture: HIGH -- patterns directly observed in existing Phase 13-14 code and confirmed by CONTEXT.md
- Pitfalls: HIGH -- all identified from direct code reading (sidebar CSS variables, font application, select styling)

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable -- no external dependencies to change)
