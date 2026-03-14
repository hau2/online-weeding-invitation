# Phase 2: App Shell - Research

**Researched:** 2026-03-14
**Domain:** Next.js route groups + middleware guards, shadcn/ui Sidebar, NestJS invitations CRUD, framer-motion card animations, admin layout skeleton
**Confidence:** HIGH (Next.js + shadcn/ui + NestJS patterns verified against official docs and Context7 equivalents)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Card grid layout for invitations — visual cards with wedding aesthetic
- Each card shows: couple names + wedding date, template thumbnail, status badge + creation date, view count
- Status badges: colored — Nháp (gray), Đã xuất bản (green), Hết hạn (red)
- Empty state: illustrated CTA with wedding illustration + "Tạo thiệp cưới đầu tiên của bạn" button
- User app: sidebar + top bar layout (left sidebar for navigation, top bar for user menu)
- Mobile: hamburger menu (classic ≡ icon, slide-out menu)
- User profile menu: extended — Tài khoản, Gói dịch vụ, Hỗ trợ, Đăng xuất
- Admin visual style: professional/neutral — clean white/gray theme, separate from pink wedding theme
- Admin sidebar: icon + text for each of 8 fixed menu items
- Admin dashboard: stats cards + charts (top row stat cards for users/invitations/revenue, charts below)
- Action buttons: icon button row at bottom of each card (edit, view public page) — compact
- NO invitation QR code — users share the public page via link (Zalo, Facebook), not QR
- The only QR in the system is the bank gift QR that users upload
- "Xem QR" button removed from dashboard — replaced with "Xem trang" (view page)
- Create flow: quick setup wizard — pick template → enter couple names → go to editor
- Cards should animate in on page load (framer-motion, consistent with Phase 1 design decisions)
- Admin panel should feel like a separate internal tool — clearly different visual identity
- The create wizard should be quick (2–3 steps max)

### Claude's Discretion
- Exact sidebar width and collapse behavior on desktop
- Dashboard card grid column count (responsive breakpoints)
- Admin chart library choice
- Mobile hamburger menu animation style
- Exact icon choices for action buttons

### Deferred Ideas (OUT OF SCOPE)
- PUBL-02 (Fixed QR code for invitation URL) needs to be removed or updated — user confirmed NO invitation QR. Only bank gift QR exists. This affects Phase 5 planning.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DASH-01 | User can view list of their invitations with status (Nháp/Đã xuất bản/Hết hạn) | NestJS `GET /invitations` endpoint with user_id filter + status field; React card grid with status badge component |
| DASH-02 | User can create a new invitation | NestJS `POST /invitations` endpoint + Next.js wizard dialog (2-step: template → names → redirect to editor) |
| DASH-03 | User can access edit and view public page from dashboard | Icon button row on each card; edit routes to `/(app)/thep-cuoi/[id]`; view page opens `/w/[slug]` in new tab |
| SYST-04 | Public pages are read-only for guests | Middleware ensures unauthenticated users cannot reach `/(app)/*`; public `/w/[slug]` has no auth requirement |
| ADMN-01 | Admin panel at `/admin` with separate layout (not shared with user UI) | `/(admin)` route group with its own `layout.tsx`; middleware role check returning 403 for non-admin sessions |
</phase_requirements>

---

## Summary

Phase 2 builds the navigable skeleton on top of the Phase 1 foundation. Three parallel workstreams converge: (1) Next.js route group middleware that enforces authentication for `/(app)/*` and role-based access for `/(admin)/*`; (2) the user-facing app shell — a sidebar + topbar layout with responsive mobile sheet, invitation card grid dashboard, and a 2-step create wizard; and (3) the NestJS invitations module that backs the dashboard with a `GET /invitations` list endpoint (filtered by owner, supports status filter) and a `POST /invitations` create endpoint.

The key tension in this phase is maintaining a clear visual identity split: the `/(app)` layout uses the warm pink/rose wedding palette established in Phase 1, while the `/(admin)` layout uses a neutral white/gray theme with no pink. This is enforced via separate `layout.tsx` files in each route group — shadcn/ui's `SidebarProvider` wraps each layout independently, and Tailwind CSS variables or a separate theme class are applied at the layout root.

The middleware architecture requires careful handling of the 403 case for admin routes. The project uses custom NestJS JWT (jose-issued tokens in HttpOnly cookies), so the middleware reads and decrypts the cookie using the same jose `jwtVerify` pattern established in Phase 1. Admin access returns a 403 response (not a redirect to login) because the user is already authenticated — they just lack the admin role.

**Primary recommendation:** Build middleware first (so all subsequent work is protected), then the app shell layout, then the NestJS invitations module, then the dashboard page consuming the API. Admin layout comes last as it shares the same middleware logic but needs no API calls in Phase 2.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.x (App Router) | Route groups, layouts, middleware | Established in Phase 1; route groups are the only way to have separate layouts per section |
| @shadcn/ui (Sidebar) | October 2024 release | Collapsible sidebar with mobile Sheet fallback | Built-in cookie persistence, mobile sheet, keyboard shortcut — avoids building custom state management |
| framer-motion | 11.x | Card stagger animations, page reveals | Established in Phase 1; variants + `staggerChildren` is the standard pattern |
| jose | 5.x | JWT verify in Edge Runtime middleware | Established in Phase 1; only Edge-compatible JWT library |
| lucide-react | latest | Icon library for sidebar nav + action buttons | Pairs with shadcn/ui; consistent icon set |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| class-variance-authority (cva) | 0.7.x | Status badge variants (gray/green/red) | Already included with shadcn/ui setup; use for the Nháp/Đã xuất bản/Hết hạn badge |
| @nestjs/common | 10.x | Guards, decorators, controllers | NestJS invitations module ownership enforcement |
| class-validator + class-transformer | latest | DTO validation in NestJS | Already established in Phase 1 auth module |
| recharts | 2.x | Admin stats charts | Lightweight, React-native, easy to integrate with Tailwind; good default for admin dashboards — subject to Claude's Discretion |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui Sidebar | Custom sidebar with Headless UI | shadcn/ui Sidebar handles mobile sheet, cookie persistence, keyboard shortcut out of the box. Custom build adds 2-4 hours for equivalent behavior |
| recharts | chart.js + react-chartjs-2 | recharts is React-first, tree-shakeable, Tailwind-friendly. chart.js has a larger bundle and imperative API. For Phase 2 (skeleton only), recharts is simpler |
| recharts | Tremor | Tremor is higher-level but adds a full component library dependency. Since shadcn/ui is already the UI layer, recharts integrates more naturally |

**Installation (Phase 2 additions):**
```bash
# In apps/web
npx shadcn@latest add sidebar sheet dialog
pnpm add framer-motion lucide-react  # if not already from Phase 1
pnpm add recharts

# In apps/api (already installed from Phase 1, but confirm)
pnpm add class-validator class-transformer
```

---

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
apps/web/app/
├── (app)/
│   ├── layout.tsx              # SidebarProvider + AppSidebar + TopBar (pink/rose theme)
│   ├── dashboard/
│   │   └── page.tsx            # Server Component: fetch invitation list, pass to grid
│   └── thep-cuoi/
│       └── moi/
│           └── page.tsx        # Create wizard entry point (redirect to editor after creation)
├── (admin)/
│   ├── layout.tsx              # AdminSidebarProvider + AdminSidebar (neutral white/gray)
│   └── admin/
│       └── page.tsx            # Admin dashboard skeleton (stats cards + chart placeholders)
middleware.ts                   # Auth + role guard (reads HttpOnly cookie, verifies with jose)

apps/web/components/
├── app/
│   ├── AppSidebar.tsx          # SidebarProvider wrapper with nav items
│   ├── TopBar.tsx              # User profile dropdown
│   ├── InvitationCard.tsx      # Single card (names, thumbnail, badge, action buttons)
│   ├── InvitationGrid.tsx      # motion.div stagger container
│   ├── StatusBadge.tsx         # cva variants: Nháp | Đã xuất bản | Hết hạn
│   ├── EmptyState.tsx          # Wedding illustration + CTA
│   └── CreateWizard.tsx        # Dialog with 2 steps: template picker → couple names
└── admin/
    ├── AdminSidebar.tsx        # Separate sidebar with neutral theme
    └── StatCard.tsx            # Admin dashboard stat card skeleton

apps/api/src/
└── invitations/
    ├── invitations.module.ts
    ├── invitations.controller.ts   # GET /invitations, POST /invitations
    ├── invitations.service.ts      # listByUser(userId), create(userId, dto)
    └── dto/
        └── create-invitation.dto.ts
```

### Pattern 1: Route Group Middleware Guard

**What:** `middleware.ts` runs on every request. Uses `jose` `jwtVerify` to decode the HttpOnly session cookie. Redirects to `/dang-nhap` if no valid session for `/(app)/*`. Returns 403 for `/admin/*` when session exists but role is not `admin`.

**When to use:** Every request matching app or admin paths.

**Key implementation detail:** The middleware must NOT match static assets. The `matcher` config excludes `_next/static`, `_next/image`, and file extensions to avoid running auth logic on CSS/JS files.

```typescript
// apps/web/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('session')?.value
  const path = req.nextUrl.pathname

  const isAppRoute = path.startsWith('/dashboard') || path.startsWith('/thep-cuoi')
  const isAdminRoute = path.startsWith('/admin')

  if (!isAppRoute && !isAdminRoute) return NextResponse.next()

  if (!token) {
    return NextResponse.redirect(new URL('/dang-nhap', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, secret)

    if (isAdminRoute && payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/dang-nhap', req.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|w/).*)'],
}
```

**Note on Next.js 16:** The Next.js docs mention renaming `middleware.ts` to `proxy.ts` for Next.js 16+. Verify the exact Next.js version in Phase 1's `package.json` — if on Next.js 15.x, the file is still `middleware.ts`.

### Pattern 2: shadcn/ui Sidebar with Mobile Sheet

**What:** `SidebarProvider` wraps the `(app)/layout.tsx`. The `Sidebar` component uses `collapsible="icon"` on desktop (collapses to icon-only strip) and automatically switches to a `Sheet` on mobile (the hamburger ≡ trigger toggles it).

**When to use:** Any route within `/(app)/`.

```typescript
// components/app/AppSidebar.tsx
'use client'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarHeader, SidebarFooter, SidebarTrigger
} from '@/components/ui/sidebar'
import { LayoutDashboard, PlusCircle } from 'lucide-react'

const navItems = [
  { label: 'Bảng điều khiển', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Thiệp cưới', href: '/thep-cuoi', icon: PlusCircle },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r border-rose-100">
      <SidebarHeader>
        {/* Logo / brand mark */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild>
                  <a href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

```typescript
// app/(app)/layout.tsx
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app/AppSidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 min-h-screen bg-rose-50/30">
        <div className="flex items-center gap-2 p-4 border-b bg-white">
          <SidebarTrigger />
          {/* TopBar: user menu */}
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}
```

**Admin layout uses a separate `SidebarProvider`** with a neutral `bg-gray-50` root, no pink colors, and the 8 admin menu items — completely isolated from the user layout.

### Pattern 3: Staggered Card Grid Animation

**What:** `motion.div` container with `staggerChildren` variant orchestrates each `InvitationCard` animating in with a fade + slide-up effect. Consistent with Phase 1's framer-motion approach.

**When to use:** Dashboard grid load, and any list that populates on mount.

```typescript
// Source: framer.com/motion/stagger (official docs)
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,  // 70ms between each card
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

// InvitationGrid.tsx
export function InvitationGrid({ invitations }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {invitations.map(inv => (
        <motion.div key={inv.id} variants={item}>
          <InvitationCard invitation={inv} />
        </motion.div>
      ))}
    </motion.div>
  )
}
```

**Responsive grid breakpoints (Claude's Discretion):** 1 col → sm:2 → lg:3 → xl:4 is a reasonable wedding card grid that avoids cards becoming too small.

### Pattern 4: NestJS Invitations Module — Ownership Enforcement

**What:** The `InvitationsService` always filters by `user_id` from the JWT payload, never from query params. The JWT guard (`JwtGuard`) already established in Phase 1 populates `req.user`. The `@CurrentUser()` decorator extracts the authenticated user.

**When to use:** Every endpoint in `InvitationsController` that reads or writes invitation data.

```typescript
// apps/api/src/invitations/invitations.controller.ts
@Controller('invitations')
@UseGuards(JwtGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.invitationsService.listByUser(user.sub)
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateInvitationDto) {
    return this.invitationsService.create(user.sub, dto)
  }
}

// apps/api/src/invitations/invitations.service.ts
async listByUser(userId: string) {
  const { data, error } = await this.supabase
    .from('invitations')
    .select('id, title, bride_name, groom_name, wedding_date, status, view_count, template_id, slug, created_at, thumbnail_url')
    .eq('user_id', userId)
    .is('deleted_at', null)          // soft delete filter
    .order('created_at', { ascending: false })

  if (error) throw new InternalServerErrorException(error.message)
  return data
}

async create(userId: string, dto: CreateInvitationDto) {
  const { data, error } = await this.supabase
    .from('invitations')
    .insert({
      user_id: userId,
      bride_name: dto.brideName,
      groom_name: dto.groomName,
      template_id: dto.templateId,
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw new InternalServerErrorException(error.message)
  return data
}
```

### Pattern 5: Create Wizard (2-Step Dialog)

**What:** shadcn/ui `Dialog` with local `step` state (1 = pick template, 2 = enter couple names). On step 2 submit, calls `POST /invitations`, then `router.push` to editor with returned invitation ID.

**When to use:** "Tạo mới" button on dashboard.

```typescript
// components/app/CreateWizard.tsx — Dialog with 2 steps
'use client'
const [step, setStep] = useState<1 | 2>(1)
const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

// Step 1: Template picker (3 cards: Traditional / Modern / Minimalist)
// Step 2: Form with brideName + groomName fields
// On submit: POST /api/invitations → redirect to /thep-cuoi/[id]
```

**Keep wizard to 2 steps**: Phase 1 research identified template picking as a first decision. Couple names are the minimum needed to create a record. The editor handles everything else.

### Anti-Patterns to Avoid

- **Auth check only in middleware:** Middleware is an optimistic check. NestJS must also enforce ownership on every endpoint. A user who manipulates their JWT sub claim would otherwise access others' invitations.
- **Layout-level auth checks in Next.js:** Per official Next.js docs, layouts do NOT re-render on navigation (partial rendering), so auth checks in `layout.tsx` can be stale. Use middleware for redirect logic and per-page DAL calls for data authorization.
- **Admin theme bleeding into app theme:** Do not share a root `layout.tsx` between `(app)` and `(admin)`. Each route group has its own `layout.tsx` with its own `SidebarProvider`, color variables, and font weights.
- **Calling `/admin/*` endpoints without role guard in NestJS:** Middleware handles the UI layer; NestJS must have a separate `AdminRoleGuard` that checks `role === 'admin'` from the JWT payload for all admin API routes.
- **Generating invitation QR codes in Phase 2:** Per user decision, there is NO invitation QR. The REQUIREMENTS.md PUBL-02 is deferred/removed. Do not add any QR-related code or UI in this phase.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive sidebar with mobile hamburger | Custom CSS drawer + React portal | shadcn/ui `Sidebar` + `Sheet` | Mobile sheet, cookie state persistence, keyboard shortcut, RTL support — all included |
| Card stagger animation timing | CSS animation delays on each card | framer-motion `staggerChildren` variant | Respects reduced-motion preference, plays well with AnimatePresence, consistent with Phase 1 |
| Status badge color variants | Inline Tailwind conditional classes | cva (class-variance-authority) | Type-safe variant API, co-located styles, same pattern used by all shadcn/ui components |
| Multi-step wizard step state | Redux/Zustand for 2-step flow | Local `useState` in Dialog component | 2 steps do not warrant external state. Local state is simpler and avoids over-engineering |
| Admin charts | D3 custom charts | recharts | Pre-built responsive chart components that accept simple data arrays; Phase 2 only needs placeholder/skeleton charts |

**Key insight:** shadcn/ui's Sidebar (released October 2024) eliminates the most complex hand-rolled problem in dashboard UIs — the responsive sidebar with mobile fallback, persistent state, and keyboard shortcut. Using it directly saves significant time and produces better accessibility outcomes.

---

## Common Pitfalls

### Pitfall 1: Middleware Matches Static Assets
**What goes wrong:** `middleware.ts` runs on every request including `_next/static`, `_next/image`, and favicon. Auth cookie check on every image request wastes CPU and can cause hydration errors.
**Why it happens:** Default middleware has no matcher — matches everything.
**How to avoid:** Always configure `matcher` to exclude static assets:
```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|w/).*)'],
}
```
Note the `w/` exclusion — public invitation pages at `/w/[slug]` must never require auth.
**Warning signs:** Images 404ing, infinite redirect loops.

### Pitfall 2: Multiple Root Layouts Cause Full Page Reloads
**What goes wrong:** If `(app)` and `(admin)` each have their own `<html>` + `<body>` (i.e., multiple root layouts), navigating between them triggers a full page reload in Next.js App Router.
**Why it happens:** Multiple root layouts are only suitable when the sections are completely separate domains (e.g., marketing site vs. app).
**How to avoid:** Have a single root `app/layout.tsx` with `<html>` + `<body>`. The `(app)/layout.tsx` and `(admin)/layout.tsx` are nested layouts, not root layouts — they do not include `<html>` or `<body>` tags.
**Warning signs:** Full page flicker when navigating from `/dashboard` to `/admin`.

### Pitfall 3: Admin 403 vs. Redirect Logic
**What goes wrong:** Returning `NextResponse.redirect('/dang-nhap')` for admin route when user is authenticated but not admin. This is confusing UX — the user is already logged in.
**Why it happens:** Copy-pasting the unauthenticated redirect logic for the role check.
**How to avoid:** Two distinct responses in middleware:
  - No session → `NextResponse.redirect('/dang-nhap')`
  - Session exists but role !== 'admin' → `NextResponse.json({ error: 'Forbidden' }, { status: 403 })` or redirect to `/dashboard` with a query param.
**Warning signs:** Logged-in users with role 'user' seeing the login page when accidentally navigating to `/admin`.

### Pitfall 4: Invitation Ownership Bypass via POST Body
**What goes wrong:** `InvitationsController.create()` accepts `user_id` in the request body. Attacker sends a different user's ID.
**Why it happens:** Copying patterns from tutorials that accept user_id from the client.
**How to avoid:** NEVER accept `user_id` from the request body. Always derive it from `@CurrentUser()` which comes from the verified JWT payload. The DTO for create invitation should NOT include a `userId` field.
**Warning signs:** `CreateInvitationDto` has a `userId` property.

### Pitfall 5: Sidebar Cookie State Conflict
**What goes wrong:** shadcn/ui `SidebarProvider` uses a cookie (`sidebar:state`) to persist open/closed state. If both `(app)` and `(admin)` use the same cookie name, state from the user app bleeds into the admin sidebar.
**Why it happens:** Default cookie name is the same for all `SidebarProvider` instances.
**How to avoid:** Provide a distinct cookie name for the admin sidebar:
```typescript
// app/(admin)/layout.tsx
<SidebarProvider cookieName="admin-sidebar:state">
```
**Warning signs:** Admin sidebar starts collapsed because the user app collapsed it.

### Pitfall 6: Soft Delete Not Applied to List Query
**What goes wrong:** Dashboard shows deleted invitations that were soft-deleted with `deleted_at` timestamp.
**Why it happens:** Forgetting to add `.is('deleted_at', null)` to the list query.
**How to avoid:** Add the soft-delete filter to every `SELECT` query in `InvitationsService`. Consider a base query builder helper that always applies this filter.
**Warning signs:** Deleted invitations reappearing in the dashboard.

---

## Code Examples

Verified patterns from official sources and Phase 1 research:

### jose JWT verify in Edge Runtime (middleware)
```typescript
// Source: Next.js official authentication guide (nextjs.org/docs/app/guides/authentication)
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    })
    return payload
  } catch {
    return null
  }
}
```

### shadcn/ui Sidebar SidebarProvider (layout pattern)
```typescript
// Source: ui.shadcn.com/docs/components/sidebar
// SidebarProvider manages open/collapsed state + persists in cookie
<SidebarProvider defaultOpen={true}>
  <YourSidebar />
  <SidebarInset>
    <header>
      <SidebarTrigger />
    </header>
    <main>{children}</main>
  </SidebarInset>
</SidebarProvider>
```

### framer-motion staggered grid
```typescript
// Source: framer.com/motion/stagger (official Framer Motion docs)
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

<motion.ul variants={containerVariants} initial="hidden" animate="show">
  {items.map(item => (
    <motion.li key={item.id} variants={cardVariants}>
      <Card {...item} />
    </motion.li>
  ))}
</motion.ul>
```

### NestJS @CurrentUser decorator (established in Phase 1)
```typescript
// apps/api/src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user  // populated by JwtGuard
  },
)
```

### Status badge with cva
```typescript
// components/app/StatusBadge.tsx
import { cva } from 'class-variance-authority'

const badge = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    status: {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-green-100 text-green-700',
      expired: 'bg-red-100 text-red-600',
    },
  },
})

const LABELS = { draft: 'Nháp', published: 'Đã xuất bản', expired: 'Hết hạn' }

export function StatusBadge({ status }: { status: 'draft' | 'published' | 'expired' }) {
  return <span className={badge({ status })}>{LABELS[status]}</span>
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hand-rolled responsive sidebar | shadcn/ui `Sidebar` component | October 2024 | Sidebar with mobile sheet, cookie persistence, keyboard shortcut included out-of-the-box |
| `middleware.ts` | `proxy.ts` (Next.js 16 rename) | Next.js 16 | File rename only — logic identical. Must verify actual Next.js version in package.json |
| Separate layout files causing full reload | Single root layout + nested group layouts | App Router (stable) | Route groups with nested layouts avoid full-reload between app sections |

**Deprecated/outdated:**
- `getServerSideProps` for auth checks: Replaced by Server Components + DAL pattern in App Router
- Wrapping layout in client component just for sidebar state: Replaced by `SidebarProvider` which uses server-set cookies for initial state

---

## Open Questions

1. **Next.js version: 15 vs 16 (middleware.ts vs proxy.ts)**
   - What we know: Phase 1 establishes Next.js 16 per the ARCHITECTURE.md ("apps/web (Next.js 16)")
   - What's unclear: The Next.js auth guide (fetched at nextjs.org/docs, version 16.1.6, dated 2026-02-27) uses the file name `proxy.ts` in one code example but `middleware.ts` in another, suggesting a transitional state
   - Recommendation: Check `apps/web/package.json` during Phase 2 Wave 0. If Next.js >= 16, use `proxy.ts`. If 15.x, use `middleware.ts`. The logic is identical.

2. **Admin 403 response — redirect vs. JSON error page**
   - What we know: Returning `NextResponse.json({ error: 'Forbidden' }, { status: 403 })` from middleware is technically correct
   - What's unclear: Should non-admin users who access `/admin` see a styled 403 page or be silently redirected to `/dashboard`?
   - Recommendation: Redirect to `/dashboard` with `?error=forbidden` for better UX. A raw JSON 403 in middleware produces a blank page in the browser.

3. **Invitation thumbnail in dashboard card**
   - What we know: Cards show "template thumbnail" — but Phase 2 does not yet build the template system (Phase 3)
   - What's unclear: What to display as thumbnail before a template thumbnail exists?
   - Recommendation: Use a static SVG placeholder per template_id (e.g., a floral pattern for 'traditional', geometric for 'modern', minimal lines for 'minimalist'). Phase 3 replaces with real thumbnails.

4. **View count source**
   - What we know: Cards show view count. SYST-04 says public pages are read-only.
   - What's unclear: Phase 2 has no analytics module. Where does view_count come from?
   - Recommendation: Add a `view_count` integer column (default 0) to the `invitations` table in the Phase 2 schema migration. Public page view counting is Phase 5 scope. Dashboard just reads the column.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + React Testing Library (web); Jest (api) — to be bootstrapped in Wave 0 |
| Config file | `apps/web/jest.config.ts`, `apps/api/jest.config.ts` — none yet (Wave 0 gap) |
| Quick run command | `pnpm --filter web test -- --testPathPattern=dashboard` |
| Full suite command | `pnpm test` (Turborepo runs all packages) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Invitation list renders cards with status badges | unit (component) | `pnpm --filter web test -- InvitationGrid` | Wave 0 |
| DASH-01 | NestJS list endpoint returns only caller's invitations | unit (service) | `pnpm --filter api test -- invitations.service` | Wave 0 |
| DASH-02 | CreateWizard posts to /invitations and redirects | unit (component) | `pnpm --filter web test -- CreateWizard` | Wave 0 |
| DASH-02 | POST /invitations sets user_id from JWT, not body | unit (service) | `pnpm --filter api test -- invitations.service` | Wave 0 |
| DASH-03 | Action buttons render correct hrefs per invitation | unit (component) | `pnpm --filter web test -- InvitationCard` | Wave 0 |
| SYST-04 | Unauthenticated request to /dashboard redirects to /dang-nhap | integration (middleware) | `pnpm --filter web test -- middleware` | Wave 0 |
| ADMN-01 | Authenticated user with role 'user' accessing /admin returns 403/redirect | integration (middleware) | `pnpm --filter web test -- middleware` | Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm --filter web test -- --testPathPattern=<changed-component>`
- **Per wave merge:** `pnpm test` (full suite across web + api)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/web/jest.config.ts` + `apps/web/jest.setup.ts` — Jest + RTL configuration
- [ ] `apps/api/jest.config.ts` — NestJS Jest configuration (likely generated with `nest new`, verify)
- [ ] `apps/web/__tests__/middleware.test.ts` — covers SYST-04 + ADMN-01
- [ ] `apps/web/__tests__/components/InvitationGrid.test.tsx` — covers DASH-01
- [ ] `apps/web/__tests__/components/InvitationCard.test.tsx` — covers DASH-03
- [ ] `apps/web/__tests__/components/CreateWizard.test.tsx` — covers DASH-02
- [ ] `apps/api/src/invitations/__tests__/invitations.service.spec.ts` — covers DASH-01 + DASH-02 ownership

---

## Sources

### Primary (HIGH confidence)
- [Next.js Official Authentication Guide](https://nextjs.org/docs/app/guides/authentication) — middleware pattern, jose jwtVerify, role-based redirect vs 403, DAL pattern (fetched 2026-03-14, version 16.1.6)
- [Next.js Route Groups Official Docs](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) — route group behavior, multiple layout caveats, full-page reload warning (fetched 2026-03-14, version 16.1.6)
- [shadcn/ui Sidebar Component Docs](https://ui.shadcn.com/docs/components/sidebar) — SidebarProvider, collapsible modes, mobile Sheet behavior, cookie persistence, useSidebar hook (fetched 2026-03-14)
- [Framer Motion Stagger Docs](https://www.framer.com/motion/stagger/) — staggerChildren variant pattern, container + item variant structure (official Framer Motion docs)

### Secondary (MEDIUM confidence)
- [shadcn/ui October 2024 Sidebar Changelog](https://ui.shadcn.com/docs/changelog/2024-10-sidebar) — confirms Sidebar component released October 2024 with 25 sub-components
- [NestJS Guards Official Docs](https://docs.nestjs.com/guards) — JwtGuard pattern, `@UseGuards` decorator, request user population (official NestJS docs)
- [How to Use Middleware for Role Based Access Control in Next.js 15](https://www.jigz.dev/blogs/how-to-use-middleware-for-role-based-access-control-in-next-js-15-app-router) — matcher pattern, role extraction from JWT in middleware

### Tertiary (LOW confidence — flag for validation)
- [Next.js 16 proxy.ts rename](https://www.hashbuilds.com/articles/next-js-middleware-authentication-protecting-routes-in-2025) — WebSearch result mentions middleware.ts → proxy.ts rename in Next.js 16. Not verified against official changelog. Treat as LOW until confirmed against `package.json` version.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — shadcn/ui Sidebar, framer-motion, jose all verified against official docs; versions consistent with Phase 1 research
- Architecture patterns: HIGH — route groups + nested layouts are core Next.js App Router features; NestJS ownership pattern is standard service-layer enforcement
- Pitfalls: HIGH — middleware matcher gap, layout re-render behavior, and ownership bypass are all documented in official sources or have traceable root causes
- Test map: MEDIUM — greenfield project, no existing test infrastructure to validate against; test commands are standard Jest/pnpm patterns

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (shadcn/ui and Next.js are actively developed; re-verify if more than 30 days elapse before planning)
