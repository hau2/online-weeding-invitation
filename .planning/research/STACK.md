# Stack Research

**Domain:** Vietnamese Wedding Invitation SaaS (Next.js + NestJS + Supabase)
**Researched:** 2026-03-14
**Confidence:** HIGH (core stack), MEDIUM (animation specifics), HIGH (tooling)

---

## Core Technologies (User-Specified — Fixed)

These are not under consideration. Research focuses on the ecosystem around them.

| Technology | Version | Purpose | Notes |
|------------|---------|---------|-------|
| Next.js | 16.x (latest stable: 16.1.6) | Frontend framework, SSR/SSG, routing | App Router (not Pages Router) — use for all new work |
| NestJS | 11.x (latest: 11.1.16) | Backend REST API | v11 has improved startup performance for large module graphs |
| Supabase | supabase-js 2.x (latest: 2.99.0) | Database (PostgreSQL), Auth, Storage | Single provider for all backend primitives |
| React | 19.x | UI runtime | Next.js 16 requires React 19 minimum |
| TypeScript | 5.x | Type safety across entire stack | Share types between frontend and backend via shared package |

---

## Recommended Stack: Supporting Libraries

### 1. Animation — Envelope Opening, Transitions, Page Effects

**Use: `framer-motion` (motion) ^12.x**

- Version: 12.36.0 (latest as of March 2026, actively maintained)
- Install: `npm install framer-motion`
- Why: The envelope opening sequence is a multi-stage orchestrated animation (scale → rotate → open flap → reveal content). Framer Motion's `variants`, `AnimatePresence`, and `useAnimate` handle this with declarative React-first API. GSAP could do the same but requires manual imperative code and React integration hooks. Framer Motion's `layout` prop handles the card expansion after envelope opens with zero extra code. It runs at 120fps via hybrid engine (Web Animations API + JS fallback). React 19 compatible.
- Confidence: HIGH — verified as latest via WebSearch (March 2026)

**Do NOT use:** GSAP for the envelope/page animations. GSAP is superior for complex SVG/canvas/timeline sequences, but the envelope open is pure React DOM animation — Framer Motion is faster to build and easier to maintain here. Revisit GSAP only if you need frame-accurate multi-element SVG timeline work.

**Do NOT use:** `react-spring` — lower ecosystem momentum, less documentation for complex orchestration patterns compared to Framer Motion in 2025-2026.

### 2. Particle / Petal Effects — Falling Petals, Confetti Burst

**Use: `canvas-confetti` ^1.9.x for burst effects + custom CSS animation for persistent falling petals**

- Version: canvas-confetti 1.9.4 (latest)
- Install: `npm install canvas-confetti` + `npm install -D @types/canvas-confetti`
- Why: canvas-confetti is ~14KB uncompressed, renders on a canvas overlay (no DOM thrash), and supports custom shapes including petal-like shapes via `scalar` and `shapes`. For the envelope-open burst moment, fire once and forget — no persistent state needed. Far lighter than tsParticles for a one-shot effect.
- Confidence: MEDIUM — based on WebSearch, npm page blocked, version from community sources

**For persistent falling petals (ambient background effect):**
Use CSS `@keyframes` animation with `position: fixed` elements spawned by a small custom React hook. Generating 15-20 `<div>` elements with randomized `animation-delay` and `animation-duration` via Tailwind arbitrary values covers the petal effect without any JS library. This is zero-bundle approach and performs better on low-end Android phones common in Vietnam.

**Do NOT use:** `@tsparticles/react` for this project. tsParticles is powerful but adds ~200KB (with plugins) and has initialization complexity. The wedding invitation petal effect is simple enough that a lightweight solution is preferable given the 3G/4G performance requirement.

**Do NOT use:** `react-confetti` — DOM-based (divs), poor performance on mobile.

### 3. QR Code Generation — Invitation QR

**Use: `qrcode.react` ^4.x**

- Version: 4.2.0 (latest)
- Install: `npm install qrcode.react`
- Why: Exports `QRCodeSVG` and `QRCodeCanvas` components. SVG output can be serialized to a string for download. 1200+ dependent npm packages, actively maintained. The `imageSettings` prop allows embedding a logo in the center of the QR. For the "download QR" feature in the dashboard, use `QRCodeSVG` → `XMLSerializer` → Blob → download link pattern. No backend needed for QR generation — pure client-side.
- Confidence: HIGH — version confirmed from npm community sources

**Do NOT use:** `react-qr-code` — also good, but `qrcode.react` has 3x more dependents and the dual SVG/Canvas API gives more flexibility for the download flow. `next-qrcode` is 2 years stale (last published).

### 4. Audio Playback — Background Music

**Use: `howler.js` ^2.x directly (not `use-sound`)**

- Version: howler.js 2.2.x (latest stable)
- Install: `npm install howler` + `npm install -D @types/howler`
- Why: `use-sound` is a React wrapper around howler but is designed for short sound effects, not persistent background music with play/pause/volume controls across the session. The wedding invitation needs: (1) music that survives component re-mounts as the user scrolls, (2) explicit user-initiated play to comply with mobile autoplay policy (tap-to-enter on envelope = the interaction moment), (3) volume fade-in/out. Howler handles all this natively with its Web Audio API path.
- Critical constraint: Mobile browsers (iOS Safari, Android Chrome) block autoplay until a user gesture. The envelope tap interaction IS the user gesture — trigger `howler.play()` in the envelope open handler. Never attempt autoplay on page load.
- Confidence: MEDIUM — howler version from official site, mobile policy verified via MDN references in search results

**Do NOT use:** `use-sound` — wrapper adds overhead and hides the lifecycle control needed for background music. `react-use-audio-player` is a viable alternative but has lower ecosystem momentum.

**Do NOT use:** HTML5 `<audio>` element directly — it doesn't support audio sprites, crossfade, or the reliable unlock mechanism howler provides.

### 5. File Upload (Photos) — Drag-Drop + Preview

**Use: `react-dropzone` ^15.x**

- Version: 15.0.0 (latest, published ~1 month ago as of March 2026)
- Install: `npm install react-dropzone`
- Why: Standard hook-based HTML5 file drop zone. `useDropzone` gives full control over the drop target, accepted file types (`image/*`), max file size validation, and preview URL generation via `URL.createObjectURL`. Used by 4,000+ packages. The hook is headless — you style the drop zone with Tailwind, no fighting CSS-in-JS.
- Confidence: HIGH — version confirmed from search results

### 6. Photo Gallery Reordering — Drag-Drop Sort

**Use: `@dnd-kit/core` + `@dnd-kit/sortable` ^6.x**

- Version: @dnd-kit/core ~6.x (latest)
- Install: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- Why: `react-beautiful-dnd` was **officially deprecated by Atlassian in 2022** — do not use it. `@dnd-kit` is its modern replacement: 10KB core, zero dependencies, supports mouse/touch/keyboard, works with grid layouts (react-beautiful-dnd doesn't support grids well). The `SortableContext` + `useSortable` hook pattern works cleanly with a photo array.
- Confidence: HIGH — deprecation status confirmed in multiple 2025 sources

**Do NOT use:** `react-beautiful-dnd` — deprecated since 2022, no active maintenance.
**Do NOT use:** `react-dnd` — lower-level, more boilerplate, designed for complex drag-between-containers use cases, overkill for a photo sort grid.

### 7. Form Management & Validation

**Use: `react-hook-form` ^7.x + `zod` ^3.x (frontend) | `class-validator` + `class-transformer` (NestJS DTOs)**

Frontend:
- Install: `npm install react-hook-form zod @hookform/resolvers`
- Why: react-hook-form minimizes re-renders (uncontrolled inputs), Zod provides TypeScript-first schema validation that can be shared as types across frontend/backend. The `zodResolver` from `@hookform/resolvers` bridges the two with one line.

NestJS backend:
- Install: `npm install class-validator class-transformer`
- Why: NestJS ValidationPipe natively uses class-validator + class-transformer via decorators on DTOs. `nestjs-zod` exists but lacks official NestJS support (tracked in nestjs/nest #15988). Stick with class-validator for NestJS DTOs — it's the documented, officially supported path. Note: these packages are slow to update, but NestJS ValidationPipe integration means the API is stable.
- Confidence: MEDIUM — nestjs-zod limitation confirmed via search results referencing GitHub issue

### 8. State Management

**Use: `zustand` ^5.x (client state) + `@tanstack/react-query` ^5.x (server state)**

- Install: `npm install zustand @tanstack/react-query`
- Why: Zustand holds UI state (current invitation editor state, preview mode toggle, audio playing state). TanStack Query handles API calls to NestJS — caching, background refresh, optimistic updates for the invitation editor. This combination has become the consensus 2025 React state management pattern, replacing Redux for most SaaS apps. Together they add ~30KB vs Redux Toolkit's ~40KB with significantly less boilerplate.
- Confidence: HIGH — confirmed across multiple 2025 developer community sources

**Do NOT use:** Redux/Redux Toolkit — correct tool for large teams with complex shared state, overkill for a solo SaaS.

### 9. UI Components & Styling

**Use: Tailwind CSS v4.x + shadcn/ui (latest)**

- Install: `npm install tailwindcss @tailwindcss/postcss` + shadcn CLI
- Why: Tailwind v4 is confirmed compatible with shadcn/ui (CLI updated for Tailwind v4). shadcn/ui components are copy-paste (not a dependency), meaning you own the code and can customize heavily for the wedding aesthetic. Next.js 16 + React 19 + Tailwind v4 + shadcn is the documented standard stack in 2025-2026. Admin panel forms, modals, and tables come from shadcn components; invitation template styles are fully custom Tailwind.
- Confidence: HIGH — confirmed in multiple 2025 sources including shadcn docs

### 10. Vietnamese Typography

**Use: `next/font` with Google Fonts — Be Vietnam Pro (body) + Playfair Display (elegant headings) + Dancing Script (romantic script accents)**

```typescript
// app/layout.tsx
import { Be_Vietnam_Pro, Playfair_Display, Dancing_Script } from 'next/font/google'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
})

const playfairDisplay = Playfair_Display({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '700'],
  variable: '--font-heading',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-script',
})
```

- Why: `next/font` automatically self-hosts Google Fonts at build time — zero external DNS lookups at runtime (critical for 3G performance). Layout shift is eliminated via the CSS `size-adjust` fallback mechanism. Be Vietnam Pro was designed specifically for Vietnamese diacritics by Vietnamese designers and is the correct choice for body text. Playfair Display supports Vietnamese and has the elegant serif look appropriate for wedding formal text. Dancing Script for couple names and romantic accents.
- `subsets: ['vietnamese']` is required — it loads the precomposed diacritical glyphs (ắ, ộ, ử etc.) that Vietnamese requires.
- Confidence: HIGH — `next/font` behavior verified via Next.js official docs; font Vietnamese support confirmed via multiple Vietnamese design sources

**Do NOT use:** CDN links to Google Fonts (e.g., `<link href="https://fonts.googleapis.com/...">`) — these add 150-300ms latency on Vietnamese mobile networks for the DNS + TLS handshake to Google servers, and they are privacy-tracking mechanisms.

### 11. Image Optimization (Backend + Frontend)

**Backend — NestJS upload pipeline:**
- Use: `multer` (NestJS FileInterceptor, built-in) + `sharp` ^0.33.x
- Install: `npm install sharp` (multer is bundled with NestJS)
- Why: On upload, pipe the buffer through sharp to: resize to max 2000px on longest side, convert to WebP at quality 80, strip EXIF metadata (privacy). Do this before writing to Supabase Storage. Sharp is the fastest Node.js image processing library (libvips-based, 4-5x faster than ImageMagick).
- Confidence: HIGH — standard NestJS pattern with extensive documentation

**Frontend — display:**
- Use: Next.js `<Image>` component (built-in `next/image`) with Supabase Storage as image source
- Why: `next/image` handles lazy loading, responsive `srcset`, and AVIF/WebP format negotiation automatically. Configure `remotePatterns` in `next.config.ts` to allow your Supabase storage domain. Supabase Storage's built-in image transformations (Pro plan feature) can serve as an alternative CDN transform layer, but since we pre-process with sharp on upload, the stored files are already optimized — `next/image` alone is sufficient on the Free tier.

### 12. NestJS — Supabase Auth Integration

**Use: `@nestjs/passport` + `passport-jwt` + `@supabase/supabase-js` for JWT verification**

- Install: `npm install @nestjs/passport passport passport-jwt @supabase/supabase-js`
- Pattern: NestJS extracts `Authorization: Bearer <token>` from request, verifies against `SUPABASE_JWT_SECRET` (from project settings), attaches decoded user to `request.user`. The Supabase client on the backend uses the service role key for admin operations (storage writes, cross-user queries for admin panel).
- Key: Use `@Injectable({ scope: Scope.REQUEST })` for the Supabase client service so it's created per request and auth context is correctly scoped.
- Confidence: MEDIUM — pattern confirmed from multiple community tutorials and GitHub repos, not official NestJS documentation

---

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Turbopack | Next.js dev bundler | Enabled by default in Next.js 16; no config needed |
| TypeScript 5.x | Type safety | Strict mode on; share `types/` package between Next.js and NestJS |
| ESLint + Prettier | Code quality | Use `@typescript-eslint/eslint-plugin` + `eslint-config-next` |
| Vitest | Unit testing | For NestJS services and utility functions; Jest-compatible API |
| Playwright | E2E testing | Test critical paths: invitation create → publish → public page view |
| pnpm | Package manager | Faster than npm, native workspace support for monorepo setup |

---

## Installation

```bash
# Frontend (Next.js app)
npm install framer-motion canvas-confetti qrcode.react howler react-dropzone \
  @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities \
  react-hook-form zod @hookform/resolvers \
  zustand @tanstack/react-query \
  @supabase/supabase-js

# Dev dependencies (frontend)
npm install -D @types/canvas-confetti @types/howler tailwindcss @tailwindcss/postcss

# Backend (NestJS app)
npm install sharp multer @nestjs/passport passport passport-jwt \
  class-validator class-transformer @supabase/supabase-js

# Dev dependencies (backend)
npm install -D @types/multer @types/passport-jwt @types/sharp
```

---

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| Animation | framer-motion | GSAP | If building complex SVG animation timelines or canvas sequences — not needed here |
| Animation | framer-motion | react-spring | If team has existing react-spring expertise — API is more physics-focused, less intuitive for sequences |
| Particle effects | canvas-confetti + CSS | @tsparticles/react | If you need interactive, persistent, user-configurable particle backgrounds |
| QR Code | qrcode.react | react-qr-code | Functionally equivalent — react-qr-code is fine if already installed elsewhere |
| Drag-drop sort | @dnd-kit | hello-pangea/dnd | If your team knows react-beautiful-dnd API — hello-pangea is a maintained fork, but @dnd-kit is the future |
| State: server | @tanstack/react-query | SWR | SWR is simpler but has less features (no mutations, no optimistic updates built-in) |
| State: client | zustand | jotai | jotai is fine for atomic state, zustand is better for slice-based store with invitation editor state |
| Font hosting | next/font | self-hosted static files | Only if you need a custom font not on Google Fonts |
| Backend validation | class-validator | nestjs-zod | When/if NestJS officially integrates Zod (tracked in nestjs/nest#15988) |
| Image processing | sharp | Supabase image transforms | Supabase transforms are simpler to implement but require Pro plan ($25/mo) and add per-image cost |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-beautiful-dnd` | Officially deprecated by Atlassian in 2022, no active maintenance | `@dnd-kit/sortable` |
| `next-qrcode` | Last published 2 years ago, stale | `qrcode.react` |
| `@tsparticles/react` (full) | ~200KB with plugins, overkill for a one-shot petal burst on 3G | `canvas-confetti` + CSS keyframes |
| Google Fonts CDN `<link>` tags | 150-300ms latency from DNS + TLS to Google servers on Vietnamese mobile networks | `next/font/google` (self-hosted at build time) |
| `use-sound` | Built for short sound effects, not persistent background music with lifecycle control | `howler.js` directly |
| `react-confetti` | DOM-based (creates divs), poor performance on mobile | `canvas-confetti` (canvas-based) |
| Redux Toolkit | Excessive boilerplate and bundle size for a single-developer SaaS | `zustand` + `@tanstack/react-query` |
| Pages Router | Legacy Next.js routing — App Router is standard in Next.js 15/16 | App Router (`/app` directory) |
| `nestjs-zod` | No official NestJS support, tracked in open GitHub issue | `class-validator` + `class-transformer` for NestJS DTOs |
| OAuth (Google/GitHub) | Out of scope per PROJECT.md | Email/password via Supabase Auth |
| Video upload | Storage/bandwidth cost too high for v1 per PROJECT.md | Not implemented |

---

## Stack Patterns by Variant

**If building invitation public page (performance-critical, 3G/4G):**
- Use Next.js Static Generation (`generateStaticParams`) for slug-based pages OR ISR with short revalidation
- Inline critical CSS for the envelope animation — avoid FOUC on slow connections
- Trigger music playback from the envelope-tap gesture — this satisfies mobile autoplay policy
- Load canvas-confetti dynamically (`next/dynamic` with `ssr: false`) — don't include in initial JS bundle

**If building invitation editor (dashboard, not performance-critical):**
- Use TanStack Query for auto-saving with `useMutation` and optimistic updates
- Use Zustand for the editor's local draft state (unsaved changes)
- Use `@dnd-kit/sortable` for the photo gallery reorder
- Use `react-dropzone` + `multer`/`sharp` pipeline for photo uploads

**If building admin panel:**
- Use shadcn/ui `DataTable` (wraps TanStack Table) for the user/invitation/payment lists
- Admin panel is a separate Next.js layout — no animations, no music, pure data UI
- Admin auth: same JWT flow as user auth, but check `is_admin` claim in the JWT or a separate RLS-guarded `profiles` table column

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `framer-motion@12.x` | React 19, Next.js 16 | Verified compatible |
| `@dnd-kit/core@6.x` | React 19 | Peer dep allows React 18+, works with React 19 |
| `react-dropzone@15.x` | React 19 | Latest release 1 month ago confirms active maintenance |
| `qrcode.react@4.x` | React 18/19 | Published a year ago but API is stable |
| `howler@2.x` | All browsers | Web Audio API with HTML5 Audio fallback for IE/Edge legacy |
| `class-validator` | NestJS 11 | No updates in 2+ years but NestJS dependency is stable |
| `@supabase/supabase-js@2.x` | NestJS 11, Next.js 16 | Dropped Node.js 18 support in v2.79.0 — requires Node 20+ |
| `tailwindcss@4.x` | Next.js 16, shadcn/ui | shadcn CLI updated for Tailwind v4 |
| `sharp@0.33.x` | Node 20+ | libvips-based, install may need build tools on some CI environments |

---

## Sources

- WebSearch (March 2026) — framer-motion 12.36.0 version confirmation
- WebSearch (March 2026) — Next.js 16.1.6 stable, React 19 requirement
- WebSearch (March 2026) — NestJS 11.1.16 latest stable
- WebSearch (March 2026) — @supabase/supabase-js 2.99.0 latest
- WebSearch (March 2026) — react-dropzone 15.0.0 published ~1 month ago
- WebSearch (March 2026) — @dnd-kit deprecation of react-beautiful-dnd confirmed (Atlassian 2022)
- WebSearch (March 2026) — qrcode.react 4.2.0 with SVG/Canvas dual API
- WebSearch (March 2026) — canvas-confetti 1.9.4 lightweight canvas-based
- [Supabase Image Transformations Docs](https://supabase.com/docs/guides/storage/serving/image-transformations) — WebP-only format, Pro plan requirement
- [Next.js Font Optimization Docs](https://nextjs.org/docs/app/getting-started/fonts) — self-hosting behavior, layout shift prevention
- [Motion docs](https://motion.dev/docs/react) — framer-motion React integration
- WebSearch — NestJS Supabase JWT pattern from community tutorials
- WebSearch — howler.js autoplay policy: mobile requires user gesture, no workaround
- WebSearch — nestjs/nest#15988 confirms nestjs-zod lacks official support
- [Google Fonts — Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) — Vietnamese diacritics support
- WebSearch — Tailwind v4 + shadcn/ui compatibility confirmed (CLI updated)

---

*Stack research for: Vietnamese Wedding Invitation SaaS (Next.js + NestJS + Supabase)*
*Researched: 2026-03-14*
