# Architecture Research

**Domain:** Vietnamese Wedding Invitation SaaS
**Researched:** 2026-03-14
**Confidence:** HIGH (Next.js + NestJS + Supabase patterns are well-documented; wedding-specific nuances are MEDIUM)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                       │
├──────────────────┬──────────────────┬──────────────────┬────────────┤
│  Landing Page    │  Dashboard /     │  Public          │  Admin     │
│  (marketing,     │  Editor          │  Invitation      │  Panel     │
│   static SSG)    │  (auth required) │  /w/{slug}       │  /admin/*  │
│                  │                  │  (SSR/ISR)       │            │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴─────┬──────┘
         │                  │                   │               │
         │ HTTP/REST        │ HTTP/REST         │ HTTP/REST     │ HTTP/REST
         │                  │                   │               │
┌────────▼──────────────────▼───────────────────▼───────────────▼──────┐
│                        NestJS API (apps/api)                          │
├─────────────┬──────────────┬─────────────┬──────────────┬────────────┤
│  auth/      │  invitations/│  media/     │  qr/         │  admin/    │
│  module     │  module      │  module     │  module      │  module    │
│             │              │             │              │            │
│  - register │  - CRUD      │  - upload   │  - generate  │  - users   │
│  - login    │  - publish   │  - optimize │  - serve PNG │  - plans   │
│  - session  │  - expire    │  - delete   │              │  - payments│
└─────────────┴──────┬───────┴──────┬──────┴──────────────┴────────────┘
                     │              │
         ┌───────────▼──────────────▼───────────┐
         │            SUPABASE                   │
         ├──────────────┬────────────────────────┤
         │  PostgreSQL  │  Storage Buckets        │
         │  (+ RLS)     │                         │
         │              │  - photos/              │
         │  - users     │  - music/               │
         │  - invita-   │  - bank-qr/             │
         │    tions     │  - system-music/        │
         │  - themes    │                         │
         │  - plans     │  CDN (global edge)      │
         │  - payments  │                         │
         └──────────────┴────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| Landing page | Marketing, demo invitation showcase, CTA to register | Next.js App Router, SSG, route group `(site)` |
| Auth routes | Email/phone+password register, login, session | Supabase Auth via NestJS; Next.js `(auth)` route group |
| Dashboard | List invitations, create/edit, view QR, plan status | Next.js App Router, `(app)` route group, server components |
| Invitation editor | Live form with split-pane real-time preview | Client Component (`"use client"`), local state + debounced auto-save to API |
| Public invitation page | Envelope animation, full details, bank QR display | Next.js `app/w/[slug]/page.tsx`, ISR (revalidate on publish), heavy animation client-side |
| Admin panel | User/invitation/plan/payment management | Next.js `(admin)` route group, separate layout, role-guard middleware |
| NestJS API | All business logic, data validation, file proxying | NestJS modules, Supabase JS client, JWT guard from Supabase tokens |
| Supabase DB | Primary data store with RLS enforcement | PostgreSQL, RLS policies on every table |
| Supabase Storage | Binary assets (photos, music, QRs) | Buckets: `invitation-photos`, `invitation-music`, `bank-qr-images`, `system-music` |
| QR module | Generate PNG QR from invitation URL at publish time | `qrcode` npm library in NestJS, stored to Supabase Storage |

## Recommended Project Structure

### Monorepo Root

```
/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api/                    # NestJS backend
├── packages/
│   ├── types/                  # Shared TypeScript interfaces (Invitation, User, Plan…)
│   ├── config/                 # Shared ESLint, TypeScript configs
│   └── ui/                     # Optional: shared React component primitives
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### Next.js App (apps/web)

```
apps/web/
├── app/
│   ├── (site)/                 # Public marketing — SSG
│   │   ├── layout.tsx          # Site header/footer
│   │   ├── page.tsx            # Landing page
│   │   └── demo/page.tsx       # Demo invitation (static)
│   ├── (auth)/                 # Auth flows — no nav chrome
│   │   ├── layout.tsx
│   │   ├── dang-ky/page.tsx    # Register
│   │   └── dang-nhap/page.tsx  # Login
│   ├── (app)/                  # Authenticated dashboard
│   │   ├── layout.tsx          # Sidebar + auth guard
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Invitation list
│   │   └── thep-cuoi/
│   │       ├── moi/page.tsx    # Create invitation
│   │       └── [id]/
│   │           ├── page.tsx    # Edit/editor
│   │           └── xem/page.tsx # Preview + QR page
│   ├── (admin)/                # Admin panel — separate layout
│   │   ├── layout.tsx          # Admin sidebar, role check
│   │   └── admin/
│   │       ├── page.tsx        # Admin dashboard
│   │       ├── nguoi-dung/     # Users
│   │       ├── thep-cuoi/      # Invitations
│   │       ├── goi-dich-vu/    # Plans
│   │       ├── thanh-toan/     # Payments
│   │       ├── nhac-he-thong/  # System music
│   │       ├── giao-dien/      # Themes
│   │       └── cai-dat/        # System settings
│   └── w/
│       └── [slug]/
│           └── page.tsx        # Public invitation — ISR
├── components/
│   ├── editor/                 # Editor-specific components
│   │   ├── EditorForm.tsx
│   │   ├── PreviewPane.tsx
│   │   └── TemplateSelector.tsx
│   ├── invitation/             # Public invitation renderers
│   │   ├── EnvelopeAnimation.tsx
│   │   ├── InvitationTraditional.tsx
│   │   ├── InvitationModern.tsx
│   │   └── InvitationMinimalist.tsx
│   ├── ui/                     # Generic UI primitives
│   └── admin/                  # Admin-specific components
├── lib/
│   ├── api.ts                  # Typed fetch client → NestJS API
│   ├── supabase.ts             # Supabase browser client (auth only)
│   └── hooks/                  # React hooks
└── middleware.ts               # Auth guard redirect for (app) and (admin) routes
```

### NestJS API (apps/api)

```
apps/api/src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts      # POST /auth/register, /auth/login
│   ├── auth.service.ts         # Validates with Supabase Auth
│   └── jwt.guard.ts            # Validates Supabase JWT on protected routes
├── invitations/
│   ├── invitations.module.ts
│   ├── invitations.controller.ts
│   ├── invitations.service.ts  # CRUD, publish (triggers QR gen), expire logic
│   └── dto/
│       ├── create-invitation.dto.ts
│       └── update-invitation.dto.ts
├── media/
│   ├── media.module.ts
│   ├── media.controller.ts     # POST /media/upload, DELETE /media/:id
│   └── media.service.ts        # Streams to Supabase Storage, returns CDN URL
├── qr/
│   ├── qr.module.ts
│   └── qr.service.ts           # qrcode lib → PNG buffer → Supabase Storage
├── admin/
│   ├── admin.module.ts
│   ├── users.controller.ts
│   ├── invitations.controller.ts
│   ├── plans.controller.ts
│   ├── payments.controller.ts
│   ├── music.controller.ts
│   └── settings.controller.ts
├── plans/
│   ├── plans.module.ts
│   └── plans.service.ts        # Permission checks for Free vs Premium
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── guards/
│   │   ├── jwt.guard.ts
│   │   └── admin-role.guard.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   └── filters/
│       └── http-exception.filter.ts
├── config/
│   └── supabase.config.ts      # Supabase admin client (service role key)
└── main.ts
```

### Structure Rationale

- **Route groups `(site)/(auth)/(app)/(admin)`:** Each has its own `layout.tsx`, enabling completely different chrome (marketing nav vs dashboard sidebar vs admin sidebar) without URL impact.
- **`app/w/[slug]/`:** Flat path (`/w/thien-va-bich-2026`) is clean, shareable via Zalo, and ISR-cacheable at the edge.
- **`packages/types`:** Invitation, User, Plan interfaces shared between Next.js and NestJS avoids type drift and is the primary benefit of the monorepo.
- **`lib/api.ts` in web:** Single typed fetch wrapper; all NestJS calls go through it. Never call Supabase DB directly from Next.js client components — all DB access via NestJS API to keep RLS bypass (service role) server-side only.
- **`media/` module in NestJS:** Frontend never uploads directly to Supabase Storage from the browser. Files go through NestJS → Supabase Storage. This enforces size limits, virus scanning hooks, and per-plan quota checks before the file is committed.

## Architectural Patterns

### Pattern 1: Editor Local State + Debounced Auto-Save

**What:** The invitation editor holds all form state in React `useState` locally. A debounced effect (800ms) fires a `PATCH /invitations/:id` to NestJS whenever state changes. The preview pane renders from local state — zero network round-trips for preview.

**When to use:** Any form with live preview where the preview is derived entirely from local inputs (no external data needed).

**Trade-offs:** Preview is always current. Auto-save means no explicit "Save" button needed, reducing friction. Risk: unsaved changes on network error — mitigated with an "Unsaved changes" indicator and manual save fallback.

```typescript
// components/editor/EditorForm.tsx (Client Component)
const [fields, setFields] = useState<InvitationDraft>(initial)
const debouncedSave = useDebouncedCallback(async (data) => {
  await api.patch(`/invitations/${id}`, data)
}, 800)

const update = (patch: Partial<InvitationDraft>) => {
  const next = { ...fields, ...patch }
  setFields(next)
  debouncedSave(next)
}
// PreviewPane receives fields directly — no fetch needed
```

### Pattern 2: ISR for Public Invitation Pages

**What:** `/w/[slug]` uses Next.js Incremental Static Regeneration. The page is generated statically on first request and cached at the CDN edge. `revalidate` is set per-invitation at publish time via on-demand revalidation (`revalidatePath`/`revalidateTag`).

**When to use:** Pages that are read-heavy (many guests open one invitation), content changes infrequently (only when owner edits and republishes), and 3G performance is critical.

**Trade-offs:** Guests see cached HTML in milliseconds — ideal for elderly users on slow connections. Trade-off: unpublish/republish takes ~1-5 seconds for CDN propagation. Acceptable given the use case.

```typescript
// app/w/[slug]/page.tsx
export const revalidate = false  // only revalidate on-demand

export default async function PublicInvitationPage({ params }) {
  const invitation = await fetchPublicInvitation(params.slug)
  if (!invitation || !invitation.published) notFound()
  return <InvitationShell invitation={invitation} />
}
```

### Pattern 3: NestJS Supabase Service-Role Client (Server-Only)

**What:** NestJS holds the Supabase `SERVICE_ROLE` key (bypasses RLS) in server memory. All DB mutations and file operations go through NestJS, which enforces ownership checks in application code before touching Supabase. The browser/Next.js client only holds the `ANON` key for reading Supabase Auth session state.

**When to use:** Any time you need to bypass RLS for admin operations or cross-user queries while maintaining security boundaries in application code.

**Trade-offs:** Single point of enforcement (NestJS) simplifies auditing. Prevents clients from ever holding admin credentials. Adds one network hop (browser → Next.js → NestJS → Supabase) for mutations — acceptable for SaaS, not for real-time games.

### Pattern 4: Route Group Middleware Guards

**What:** `apps/web/middleware.ts` intercepts all requests. If path matches `/(app)/**` or `/admin/**`, it checks for a valid Supabase session cookie. If absent, redirect to `/dang-nhap`. Admin routes additionally verify `is_admin` claim in the JWT.

**When to use:** Any Next.js app with mixed public/private routes.

```typescript
// middleware.ts
export const config = { matcher: ['/dashboard/:path*', '/thep-cuoi/:path*', '/admin/:path*'] }

export async function middleware(req: NextRequest) {
  const session = await getSupabaseSession(req)
  if (!session) return NextResponse.redirect('/dang-nhap')
  if (req.nextUrl.pathname.startsWith('/admin') && !session.user.is_admin) {
    return NextResponse.redirect('/dashboard')
  }
}
```

## Data Flow

### Invitation Creation and Edit Flow

```
User fills editor form
    ↓
EditorForm (Client Component) — local useState update → immediate preview render
    ↓ (debounced 800ms)
PATCH /api/invitations/:id  (with JWT Bearer token)
    ↓
NestJS InvitationsService — ownership check (user_id === JWT sub)
    ↓
Supabase PostgreSQL UPDATE invitations SET ... WHERE id = :id AND user_id = :userId
    ↓
200 OK → EditorForm shows "Saved" indicator
```

### Publish Flow (QR Generation)

```
User clicks "Publish"
    ↓
POST /api/invitations/:id/publish
    ↓
NestJS: validate invitation complete, check plan limits
    ↓
NestJS QrService.generate(publicUrl)   ← qrcode lib → PNG buffer
    ↓
Supabase Storage upload → invitation-qr/{id}.png
    ↓
NestJS: UPDATE invitations SET published=true, qr_url=..., slug=... WHERE id=...
    ↓
NestJS calls Next.js revalidation endpoint: POST /api/revalidate?slug=...
    ↓
Next.js ISR cache for /w/{slug} invalidated → next request regenerates fresh
    ↓
Return { publicUrl, qrUrl } to client
```

### File Upload Flow

```
User selects photo/audio/bank-QR in editor
    ↓
Browser → POST /api/media/upload (multipart, JWT auth)
    ↓
NestJS MediaService:
  - validate file type & size (per plan limits from config)
  - stream to Supabase Storage bucket
  - return CDN URL
    ↓
EditorForm receives CDN URL → stores in local state → debounced save persists URL to invitation record
```

### Public Page Guest View Flow

```
Guest receives Zalo link: /w/thien-va-bich-2026?to=Ong+Nguyen+Van+A
    ↓
Next.js edge: serve ISR-cached HTML (fast, no origin hit if cached)
    ↓
Browser renders EnvelopeAnimation (Client Component, loads Framer Motion lazily)
    ↓
Guest taps envelope → animation plays → full invitation reveals
    ↓
URL param `?to=` read client-side → personalized greeting rendered
    ↓
Background music: audio element with explicit play/pause toggle (no autoplay — mobile browsers block it)
```

### Admin Payment Grant Flow

```
User scans admin bank QR → transfers payment externally
    ↓
User reports payment in dashboard (reference number)
    ↓
Admin sees pending payment in /admin/thanh-toan
    ↓
Admin clicks "Confirm" → POST /api/admin/payments/:id/confirm
    ↓
NestJS AdminService: UPDATE users SET plan='premium', plan_expires=... WHERE id=...
    ↓
User's next dashboard load shows Premium status (no real-time needed, F5 suffices)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture as-is. Single NestJS instance, Supabase free tier, Vercel hobby/pro. |
| 1k-10k users | Add Redis caching for invitation reads in NestJS (reduce Supabase reads on viral wedding days). Enable Supabase Smart CDN for storage. Move to Supabase Pro for connection pooling (PgBouncer). |
| 10k-100k users | NestJS horizontal scaling (2-3 instances behind load balancer). ISR cache warm-up job for newly published invitations. Separate read replica for admin queries. |
| 100k+ users | Re-evaluate: public invitation pages are already static (ISR handles scale well). NestJS API becomes the bottleneck — consider splitting media upload into a dedicated service. |

### Scaling Priorities

1. **First bottleneck — viral wedding day:** Many guests (50-200) open one invitation simultaneously. ISR cache handles this well; the invitation HTML is served from CDN without hitting the origin. Risk is only on first uncached request after publish — acceptable.
2. **Second bottleneck — Supabase connection limits:** Free tier has 60 connection limit. At ~200 concurrent dashboard users, PgBouncer (Supabase Pro) becomes necessary.
3. **Third bottleneck — Supabase Storage egress:** Photos and music files served on invitation pages. Mitigate with Supabase CDN caching headers (`Cache-Control: public, max-age=31536000`) and WebP auto-conversion from Supabase Image Transformations.

## Anti-Patterns

### Anti-Pattern 1: Calling Supabase Directly from Next.js Client Components

**What people do:** Import `createBrowserClient` from `@supabase/ssr` in client components, run DB queries directly from the browser.

**Why it's wrong:** Exposes schema to the client, makes RLS the only security layer (easy to misconfigure), bypasses plan-limit checks in NestJS, creates two sources of truth for business logic.

**Do this instead:** All DB reads/writes via NestJS REST API. Browser Supabase client is used only for session management (auth state, refresh tokens). NestJS uses the service role key server-side.

### Anti-Pattern 2: Storing Full Invitation Data in Next.js API Routes

**What people do:** Use Next.js `app/api/` routes to proxy all Supabase calls, putting business logic in route handlers.

**Why it's wrong:** Next.js API routes are stateless thin proxies, not a business logic layer. They have cold-start penalties on serverless, no dependency injection, limited testability, and no module system. NestJS exists specifically to handle this properly.

**Do this instead:** Next.js API routes for one purpose only: ISR revalidation webhook (triggered by NestJS). All other backend work in NestJS.

### Anti-Pattern 3: Autoplay Background Music

**What people do:** Set `<audio autoplay>` on the public invitation page.

**Why it's wrong:** All modern mobile browsers (iOS Safari, Chrome Android) block autoplay with sound. Users (especially elderly guests) will see a broken/silent experience with no feedback.

**Do this instead:** Show an explicit, visually prominent play button on the envelope animation screen. The tap-to-open gesture can simultaneously trigger audio play (user gesture unlocks audio context). Include a sticky mute/unmute button throughout the page.

### Anti-Pattern 4: Generating QR Codes on Every Page Load

**What people do:** Call a QR generation endpoint from the dashboard/public page on each render.

**Why it's wrong:** Wastes CPU and bandwidth. QR code for a fixed URL never changes after publish.

**Do this instead:** Generate QR PNG once at publish time, store in Supabase Storage, serve the static image URL. Only regenerate if the slug changes (which it should not after publish).

### Anti-Pattern 5: Single Storage Bucket for All Assets

**What people do:** Put all uploads (photos, music, bank QR, system music) in one bucket.

**Why it's wrong:** Cannot apply different access policies per asset type. Bank QR images should be public (guests need to see them). System music can be public. User photo galleries should restrict access. One bucket cannot have mixed policies.

**Do this instead:** Separate buckets: `invitation-photos` (public read, owner write), `invitation-music` (public read, owner write), `bank-qr-images` (public read, owner write), `system-music` (public read, admin write).

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | NestJS validates JWT from `Authorization: Bearer` header using Supabase's JWKS endpoint. Browser uses `@supabase/ssr` for session cookie management. | Do not duplicate auth logic — NestJS trusts Supabase-issued JWTs entirely. |
| Supabase Storage | NestJS uses `@supabase/supabase-js` with service role key to upload files. Returns CDN URLs to client. | Enable Supabase Image Transformations for `invitation-photos` bucket for automatic WebP + resize. |
| Supabase PostgreSQL | NestJS uses `@supabase/supabase-js` for DB queries (or Drizzle/TypeORM if preferred). RLS on all tables as defense-in-depth, but NestJS enforces ownership first. | Always index `user_id`, `slug` columns referenced in RLS policies. |
| `qrcode` npm | NestJS `QrService` uses `qrcode.toBuffer()` to generate PNG in memory, then uploads buffer to Supabase Storage. | No external QR API needed. ~50ms per generation. |
| Next.js on-demand revalidation | NestJS calls `fetch('http://web-internal/api/revalidate', { method: 'POST', headers: { 'x-revalidate-token': SECRET } })` after publish/unpublish. | Keep revalidation endpoint internal (token-protected). |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Next.js web ↔ NestJS API | HTTP REST (JSON). JWT passed in `Authorization` header. | CORS configured in NestJS to accept from web origin only. |
| NestJS ↔ Supabase DB | `@supabase/supabase-js` admin client (service role). | Never expose service role key to browser. |
| NestJS ↔ Supabase Storage | `@supabase/supabase-js` admin client for upload. Public CDN URLs returned. | Signed URLs not needed for public buckets. |
| Editor form ↔ Preview pane | React props (in-memory). No network. | Both in same Client Component tree. |
| Next.js middleware ↔ Supabase Auth | Cookie-based session validation via `@supabase/ssr` `createServerClient`. | Middleware runs at edge — keep it lightweight (no DB queries). |

## Suggested Build Order

The dependency graph drives the following sequence:

```
Phase 1: Foundation
  Monorepo setup (Turborepo + pnpm) → Supabase project + schema → NestJS skeleton + auth module
  ↓
Phase 2: Core User Flows
  Next.js app shell + route groups → Auth pages (register/login) → Dashboard skeleton
  ↓
Phase 3: Invitation CRUD
  NestJS invitations module → Editor UI (form + preview) → Template rendering (3 themes)
  ↓
Phase 4: Media + Assets
  NestJS media module → Photo upload + gallery → Music upload + playback → Bank QR upload
  ↓
Phase 5: Publish + Public Page
  QR generation service → Publish/unpublish endpoint → Public /w/[slug] page → ISR setup → Envelope animation
  ↓
Phase 6: Monetization
  Plans table + permission checks → Watermark logic (Free tier) → Manual payment tracking UI
  ↓
Phase 7: Admin Panel
  Admin route group + role guard → All 8 admin sections → System music library → Settings
  ↓
Phase 8: Polish + Performance
  3G optimization (image WebP, lazy music, code splitting) → Auto-expiry cron → Final animation polish
```

**Ordering rationale:**
- Auth and DB schema must exist before any feature that stores data.
- Invitation CRUD before media because the invitation record holds foreign keys to media assets.
- Media before Publish because published invitations display photos/music.
- Public page after Publish (needs the published state and QR URL).
- Admin after core user flows — admin manages users and invitations that must already exist.
- Polish last — performance tuning requires real content to measure against.

## Sources

- [MakerKit Next.js + Supabase Architecture Docs](https://makerkit.dev/docs/next-supabase/architecture/architecture) — layered SaaS structure, route groups, separation of concerns (HIGH confidence)
- [Next.js App Router Official Docs](https://nextjs.org/docs/app) — route groups, layouts, ISR, Server/Client Components (HIGH confidence)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage) — bucket architecture, RLS, Image Transformations, CDN (HIGH confidence)
- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — policy patterns for SaaS (HIGH confidence)
- [NestJS Module Architecture Best Practices](https://arnab-k.medium.com/best-practices-for-structuring-a-nestjs-application-b3f627548220) — module/service/controller separation (MEDIUM confidence)
- [qrcode npm package](https://www.npmjs.com/package/qrcode) — QR generation in Node.js, `toBuffer()` API (HIGH confidence)
- [Turborepo + pnpm Monorepo for NestJS + Next.js](https://medium.com/@alan.nguyen2050/setup-monorepo-for-nestjs-api-nextjs-fe-05e82945a8b5) — monorepo setup pattern (MEDIUM confidence)
- [Why Next.js API Routes Aren't a Backend Replacement](https://medium.com/@shreyanbharadwaj/why-api-routes-in-next-js-arent-a-backend-replacement-and-how-to-use-them-safely-e29816fa2ddd) — anti-pattern rationale (MEDIUM confidence)
- [Next.js ISR and CDN Caching Strategy](https://makerkit.dev/blog/tutorials/nextjs-when-to-use-ssr) — when to use SSG vs ISR vs SSR (HIGH confidence)

---
*Architecture research for: Vietnamese Wedding Invitation SaaS (Next.js + NestJS + Supabase)*
*Researched: 2026-03-14*
