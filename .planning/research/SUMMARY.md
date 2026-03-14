# Project Research Summary

**Project:** Vietnamese Online Wedding Invitation SaaS (Thiệp Cưới Online)
**Domain:** Vietnamese wedding invitation platform — SaaS, mobile-first, 3G-optimized
**Researched:** 2026-03-14
**Confidence:** HIGH

---

## Executive Summary

This is a mobile-first, Vietnamese-market SaaS platform for creating and sharing digital wedding invitations. The product is meaningfully differentiated from Western competitors (Joy, Zola, Paperless Post) by targeting features that are invisible to global platforms but essential in Vietnam: VietQR bank transfer display, Zalo link preview optimization, a rich envelope-opening animation as the primary UX moment, and a music library tuned to wedding taste. The recommended architecture is a Next.js 16 (App Router, ISR) frontend, NestJS 11 backend, and Supabase for auth/database/storage — a well-documented stack with high community consensus in 2025-2026. The build is structured as a pnpm monorepo with shared TypeScript types between frontend and backend.

The strongest differentiating bets are: (1) the envelope opening animation as a culturally resonant "wow factor" that sets this product apart from plain HTML invitations; (2) VietQR bank QR display, which no self-service platform currently offers; and (3) the `?to=Name` guest personalization, which maps directly onto Vietnamese hierarchical address culture and Zalo's link-sharing behavior. The product must ship as fully self-service with zero manual ordering steps — this alone beats the primary Vietnamese competitor (thesimple.vn). The free tier with watermark is the standard go-to-market for this market segment; manual payment confirmation via admin bank QR is sufficient for v1.

The critical risks are technical, not product: mobile audio autoplay is silently blocked by all major mobile browsers (design the envelope-tap as the audio unlock gate from day one), Supabase RLS must be enabled and tested before any CRUD endpoints are built (the CVE-2025-48757 event caused 170+ apps to expose entire databases), and the envelope animation must be performance-gated for low-end Android phones that dominate the Vietnamese market (Xiaomi Redmi, Samsung Galaxy A-series). These three issues share a common failure mode: they work perfectly in a developer environment and fail silently in production for real users.

---

## Key Findings

### Recommended Stack

The user-specified stack (Next.js 16 + NestJS 11 + Supabase + React 19 + TypeScript 5) is the right choice and well-supported. Surrounding library choices are well-researched: `framer-motion` ^12 for the envelope animation (React 19 compatible, declarative orchestration), `canvas-confetti` for one-shot particle bursts plus CSS keyframes for persistent falling petals (zero-library, better on 3G), `howler.js` directly for background music (not `use-sound`, which lacks persistent music lifecycle control), `@dnd-kit/sortable` for photo reordering (replaces deprecated `react-beautiful-dnd`), `react-dropzone` ^15 for upload UI, `qrcode.react` ^4 for SVG/Canvas QR generation, `zustand` ^5 + `@tanstack/react-query` ^5 for state management, and `next/font` with Be Vietnam Pro / Playfair Display / Dancing Script for self-hosted Vietnamese typography. All upstream packages require Node 20+ (Supabase JS v2.79+ drops Node 18). Development tooling: pnpm workspaces, Turborepo, Vitest (unit), Playwright (E2E).

**Core technologies:**
- **Next.js 16 (App Router, ISR):** Frontend + public invitation pages — ISR caches invitation HTML at CDN edge for 3G performance
- **NestJS 11:** Backend REST API — all business logic, file proxying, auth guard, plan enforcement; NOT Next.js API routes
- **Supabase (PostgreSQL + Auth + Storage):** Single provider for database (with RLS), auth (JWT), and binary assets (4 separate buckets by content type)
- **framer-motion ^12:** Envelope orchestration animation — `AnimatePresence` + `variants` handle multi-stage reveal; React 19 compatible
- **howler.js ^2:** Background music — handles Web Audio API unlock gate (user gesture required), loop, volume, and cross-mount persistence
- **sharp ^0.33 + multer (NestJS):** Server-side image compression pipeline — resize to 1200px max, WebP at quality 75 before Supabase Storage write
- **Tailwind CSS v4 + shadcn/ui:** Dashboard and admin panel UI; custom Tailwind for invitation template aesthetics

### Expected Features

**Must have (table stakes) — all required for v1 launch:**
- Invitation editor: couple names, date, venue, message, thank-you text
- 3 templates: Traditional (red/gold), Modern, Minimalist — all tuned to Vietnamese aesthetics
- Photo gallery with drag-drop upload (up to plan limit), auto-optimized for 3G
- Background music: system library selection + custom upload, explicit play/pause toggle
- Bank QR image upload and tasteful display on public page (opt-in, labelled "Mừng cưới")
- Public shareable URL at `/w/{slug}` — slug locked permanently on first publish
- Invitation QR code (generated once at publish, stored as static PNG in Supabase Storage)
- Rich envelope opening animation with particles/petals — skip option for elderly users
- Guest name personalization via `?to=Name` URL parameter (client-side, no editor change needed)
- Zalo/Facebook OG meta tags (server-rendered — required for Zalo link crawler to pick up preview)
- Wedding date countdown, venue display
- Publish/unpublish control; auto-expire with configurable grace period after wedding date
- Mobile-first, <1MB page weight, <2s FMP on 4G — 320px minimum width, 48px minimum touch targets
- Free tier with watermark; Premium tier removes watermark, adds photos, adds templates
- User account (email/phone + password); no OAuth in v1
- Dashboard: list invitations, edit, view QR, plan status
- Admin panel: users, invitations (view/disable only), music library, plans, payments, system settings
- Admin bank QR for manual payment + manual Premium grant workflow
- Vietnamese-only UI (tiếng Việt throughout)

**Should have (competitive differentiators):**
- Bank QR display is a genuine differentiator — no global platform does this self-service
- Envelope animation distinguishes from plain HTML invitations and local competitors
- `?to=Name` personalization maps onto Vietnamese hierarchical addressing (Chú, Bác, Bạn)
- Zalo OG optimization is table stakes disguised as a technical detail — 79M MAU in Vietnam
- System music library removes friction for couples without a music file

**Defer to v1.x / v2+:**
- RSVP / attendance tracking — phone calls are culturally normal; add when couples explicitly request
- Payment gateway (VNPay, MoMo) — manual admin grant sufficient for early-stage volume
- OAuth login (Zalo, Google) — add when signup friction is proven to cause churn
- Invitation analytics (view counts) — defer until users ask "is anyone opening this?"
- Bulk guest link generator (`?to=` for a list) — add when couples complain about manual creation
- Native mobile app — mobile-first web is sufficient; PWA if offline needed

**Explicit anti-features (never build in v1):**
- Real-time guest chat — moderation, WebSocket complexity, not core to invitation
- Generate VietQR from account number — requires bank API, account validation; couples upload their own
- Video uploads — storage/encoding cost disproportionate
- Per-guest unique QR codes — massive scope increase; use `?to=Name` instead

### Architecture Approach

The architecture is a pnpm monorepo with two apps (`apps/web` for Next.js, `apps/api` for NestJS) and a shared `packages/types` package for TypeScript interfaces. The Next.js app uses four route groups: `(site)` for static marketing pages, `(auth)` for login/register, `(app)` for authenticated dashboard, and `(admin)` for the admin panel. The public invitation page lives at `app/w/[slug]/page.tsx` with ISR (`revalidate = false`, on-demand revalidation triggered by NestJS after publish/unpublish). All DB mutations and file operations go through NestJS — the browser Supabase client is used only for session management; the NestJS backend holds the service role key for admin operations and a per-request user JWT client for regular operations. Frontend never uploads directly to Supabase Storage. Four separate Supabase Storage buckets (`invitation-photos`, `invitation-music`, `bank-qr-images`, `system-music`) enforce different access policies per asset type. The invitation editor uses local React state with debounced auto-save (800ms) to NestJS; the preview pane renders from local state with zero network round-trips.

**Major components:**
1. **Next.js web app** — Route groups for site/auth/dashboard/admin; ISR for public invitation pages; middleware auth guard for protected routes
2. **NestJS API** — Modules: auth, invitations, media, qr, plans, admin; enforces all business logic, plan limits, file validation
3. **Supabase** — PostgreSQL with RLS on every table; Auth for JWT issuance; Storage with 4 typed buckets; CDN for asset serving
4. **EnvelopeAnimation component** — Client-only (`ssr: false`); framer-motion orchestration; audio unlock gate; performance-gated particle density
5. **InvitationTemplate components** — Shared between editor preview and public page to guarantee visual consistency (Traditional, Modern, Minimalist)
6. **QrService (NestJS)** — Generates PNG once at publish time, stores to Supabase Storage; slug immutable post-publish

### Critical Pitfalls

1. **Audio autoplay blocked on all mobile browsers** — Never call `audio.play()` on page load or without a user gesture. Design the envelope-tap as the audio unlock gate from day one. Test on real iPhone and Android, not Chrome desktop.

2. **Supabase RLS disabled or misconfigured** — Enable RLS on every table at creation time, before any CRUD endpoints are built. Use `auth.uid()` only in policies (never `user_metadata`). Run automated cross-user access tests (User B reads User A's invitation, expects 403). Never put `SUPABASE_SERVICE_ROLE_KEY` in any `NEXT_PUBLIC_*` env var.

3. **Envelope animation janks on low-end Android** — Animate only `transform` and `opacity` (GPU-accelerated). Implement a frame-time performance gate: if average frame exceeds 20ms in first 3 frames, halve particle density and disable blur effects. Test with Chrome 6x CPU throttle; pass 30fps minimum.

4. **Slug mutated post-publish invalidates printed QR codes** — Lock slug at database constraint level on first publish, not just application logic. Display explicit confirmation dialog before first publish: "Sau khi xuất bản, đường dẫn QR không thể thay đổi." Never regenerate slug on unpublish-republish cycles.

5. **File uploads bypass server-side validation** — All uploads go through NestJS, never directly from browser to Supabase Storage. NestJS validates MIME type (magic bytes, not `file.type`), file size, plan quota, and per-invitation file count. Maintain `user_storage_bytes` counter in database, updated transactionally.

---

## Implications for Roadmap

Based on the dependency graph in ARCHITECTURE.md and the pitfall prevention phases in PITFALLS.md, the following 8-phase build sequence is recommended. This order is driven by hard dependencies (auth before data, schema before CRUD, media before publish) and by risk mitigation (RLS before endpoints, performance architecture before animation code).

### Phase 1: Foundation
**Rationale:** Everything depends on this. Auth and schema must exist before any feature that stores data. Two-client NestJS pattern (user JWT + service role) must be established before any endpoints are built to prevent the service-role-bypass pitfall.
**Delivers:** Runnable monorepo, Supabase project with RLS-enabled schema, NestJS with auth module and JWT guard, shared TypeScript types package
**Addresses:** User registration and login (email/phone + password)
**Avoids:** RLS disabled pitfall (Pitfall 2), service role used for all ops pitfall (Pitfall 9)
**Research flag:** Standard patterns — skip phase research

### Phase 2: Core App Shell
**Rationale:** Route groups and auth middleware must exist before dashboard or editor work can begin. Middleware auth guard for `(app)` and `(admin)` routes must be established before any protected page is built.
**Delivers:** Next.js app with 4 route groups, middleware auth guard, dashboard skeleton, empty invitation list view
**Addresses:** User dashboard to manage invitations
**Avoids:** Admin panel accessible without role check (Security mistake in PITFALLS.md)
**Research flag:** Standard patterns — well-documented Next.js App Router patterns

### Phase 3: Invitation CRUD and Templates
**Rationale:** Invitation records must exist before media (photos/music) can be attached. All three templates must be built as shared React components so the editor preview matches the public page exactly — a pitfall if deferred.
**Delivers:** Invitation editor (form + live preview), 3 templates (Traditional, Modern, Minimalist), debounced auto-save to NestJS, preview pane using shared template components
**Addresses:** Invitation editor, template selection (3 designs), countdown timer, venue display
**Implements:** Editor local state + debounced auto-save pattern; shared template components between editor and public page
**Avoids:** Editor preview does not match public page (UX pitfall in PITFALLS.md)
**Research flag:** Standard patterns — well-documented; template design may need design research but no technical unknowns

### Phase 4: Media Upload Pipeline
**Rationale:** Media assets (photos, music, bank QR) attach to invitation records that must already exist. The NestJS upload endpoint must be the single entry point before any frontend upload UI is built — otherwise frontend-only validation becomes entrenched. Sharp compression pipeline and URL versioning strategy must be designed here, not retrofitted.
**Delivers:** NestJS media module, photo upload + gallery (drag-drop with `react-dropzone` + `@dnd-kit/sortable`), sharp compression pipeline (resize to 1200px, WebP q75), bank QR image upload, music file upload, URL versioning strategy (`?v={timestamp}`)
**Addresses:** Photo gallery, bank QR display, background music (upload path), storage quota enforcement per plan
**Implements:** 4 Supabase Storage buckets with typed access policies
**Avoids:** File uploads bypass server-side validation (Pitfall 4), no photo compression (Pitfall 5), CDN cache staleness on file replace (Pitfall 8), free-tier storage abuse (Pitfall 10)
**Research flag:** Standard patterns for NestJS/multer/sharp; Supabase bucket RLS policies may need verification during build

### Phase 5: Publish and Public Invitation Page
**Rationale:** Publishing depends on complete invitation data and media assets from Phases 3-4. The public page is the product's primary output — the page guests actually receive. This phase must get SSR/CSR architecture right before animation code is written, because fixing hydration mismatches after the fact is painful.
**Delivers:** QR generation service (once at publish, stored as PNG), publish/unpublish endpoint with slug locking, ISR public page at `/w/[slug]`, slug immutability constraint, envelope opening animation (framer-motion, `ssr: false`, performance-gated), falling petals (CSS keyframes), confetti burst (canvas-confetti via `next/dynamic`), background music player (howler.js, unlocked by envelope-tap gesture), guest name `?to=Name` personalization, Zalo/Facebook OG meta tags, wedding date countdown
**Addresses:** Public shareable URL, QR code, envelope animation, music, guest personalization, Zalo OG, countdown, auto-expire
**Implements:** ISR with on-demand revalidation triggered by NestJS; EnvelopeAnimation as client-only component
**Avoids:** Audio autoplay blocked (Pitfall 1), particle animation mobile jank (Pitfall 3), mutable slug (Pitfall 6), SSR hydration mismatch (Pitfall 7)
**Research flag:** NEEDS DEEPER RESEARCH — envelope animation performance on low-end Android, iOS Safari audio unlock behavior, Zalo OG tag crawler behavior are all areas with sparse documentation and real-device testing requirements

### Phase 6: Monetization and Plan Enforcement
**Rationale:** Free/Premium tier logic must be built as a coherent system before the admin panel that manages it. Plan enforcement in NestJS (quota checks, watermark logic) must be server-side, not just UI gating.
**Delivers:** Plans table and permission checks in NestJS, watermark rendering on Free tier public pages, Premium tier feature unlocks (more photos, more templates, no watermark), admin bank QR display for user payment, user payment reporting flow, manual Premium grant by admin
**Addresses:** Free/Premium tiers, watermark, manual payment workflow
**Avoids:** Free-tier storage abuse (Pitfall 10, server-side enforcement reinforced here)
**Research flag:** Standard patterns — well-documented for SaaS tier systems

### Phase 7: Admin Panel
**Rationale:** Admin panel manages users and invitations that must already exist. Role-guard middleware is already in place from Phase 2; this phase builds out the full admin interface.
**Delivers:** All 8 admin panel sections (users, invitations, plans, payments, system music library, themes, system settings, expiry configuration), admin role guard enforcement on all `/admin/*` routes, invitation enable/disable (never edit content), system music library management
**Addresses:** Admin panel for platform management
**Research flag:** Standard patterns — shadcn DataTable wrapping TanStack Table; admin UI is standard CRUD

### Phase 8: Polish and Performance
**Rationale:** Performance tuning requires real content to measure against. 3G optimization, auto-expiry cron, and final animation polish are applied to a complete working system.
**Delivers:** 3G performance optimization (image WebP serving via Supabase transforms, lazy music loading, code splitting, critical CSS inline), auto-expiry cron job (invitations expire after wedding date + configurable grace period), invitation expiry notification emails, final animation polish, "skip" button for elderly users, accessibility review (48px touch targets, large text, clear hierarchy), "Looks Done But Isn't" verification checklist from PITFALLS.md
**Addresses:** Mobile-first 3G performance, auto-expire, UX polish for elderly users
**Research flag:** Standard patterns — well-documented performance techniques; cron can be Supabase pg_cron or a NestJS scheduled task

### Phase Ordering Rationale

- Auth and schema before everything: every feature stores data; RLS must be in place before CRUD endpoints are built
- CRUD before media: invitation records hold foreign keys to media assets; can't attach photos to non-existent invitations
- Media before publish: published invitations display photos and music; uploading must work before publishing is possible
- Public page after publish: the page needs the published state, QR URL, and stable slug
- Monetization before admin: admin manages the plan system that must be defined first
- Admin after core user flows: admin manages users and invitations that must already exist
- Polish last: performance tuning needs real content; 3G measurement needs production-like assets

### Research Flags

**Phases needing deeper research during planning:**

- **Phase 5 (Public Invitation Page):** Envelope animation performance on real low-end Android devices, iOS Safari audio unlock behavior in the WebView context (used by many Zalo-opened links), and Zalo's OG tag crawler behavior are all areas with limited official documentation. Real-device testing will surface issues that desktop Chrome cannot simulate. Recommend `/gsd:research-phase` before building the animation component.

**Phases with standard patterns (skip research-phase):**

- **Phase 1 (Foundation):** Next.js + NestJS + Supabase monorepo setup is extensively documented
- **Phase 2 (App Shell):** Next.js App Router route groups and middleware are officially documented
- **Phase 3 (Invitation CRUD):** Standard NestJS CRUD + React form patterns; framer-motion is well-documented
- **Phase 4 (Media Upload):** NestJS multer + sharp + Supabase Storage has multiple community tutorials
- **Phase 6 (Monetization):** SaaS tier + watermark patterns are standard
- **Phase 7 (Admin Panel):** CRUD admin panels are well-documented; shadcn DataTable has official examples
- **Phase 8 (Polish):** Performance techniques are well-documented in Next.js and MDN docs

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core stack is user-specified; supporting libraries verified via WebSearch March 2026; version numbers confirmed from npm/official sources |
| Features | HIGH (core) / MEDIUM (Vietnam-specific) | Core features validated against Joy, Zola, Paperless Post; Vietnamese nuances (VietQR, Zalo behavior) sourced from VnExpress and community sources, not official API docs |
| Architecture | HIGH | Next.js App Router, ISR, NestJS module patterns are officially documented; Supabase RLS and Storage patterns sourced from official docs; monorepo pattern sourced from community tutorials (MEDIUM) |
| Pitfalls | HIGH | Critical pitfalls (RLS, autoplay, hydration) verified against official MDN, Next.js, and Supabase docs; CVE-2025-48757 is documented; CDN cache behavior sourced from Supabase official docs and GitHub discussions |

**Overall confidence:** HIGH

### Gaps to Address

- **Zalo OG crawler behavior:** Zalo's link preview crawler is not officially documented. The recommendation (server-rendered OG meta tags, couple photo as OG image) is based on standard OG tag practice and community reports. Validate early in Phase 5 by sharing a test invitation link in Zalo and confirming the preview renders correctly before finalizing the OG tag implementation.

- **iOS Safari audio unlock in Zalo WebView:** When guests open invitation links from Zalo, iOS opens them in Zalo's in-app browser (WKWebView), not Safari directly. Audio unlock behavior in WKWebView may differ from Safari. The envelope-tap pattern should be robust, but requires real-device testing with actual Zalo link shares — emulators cannot reproduce this accurately.

- **class-validator + NestJS long-term:** class-validator has not been updated in 2+ years. The NestJS team has an open issue tracking official Zod integration (nestjs/nest#15988). This is not a problem for v1, but watch for Zod becoming the official recommendation before v2 investment.

- **Supabase new API key format (2025):** Supabase migrated to `sb_publishable_*` and `sb_secret_*` key formats for new projects. Verify the Supabase project's key format matches the integration pattern used in NestJS — legacy JWT strings and new-format keys require different initialization code in `@supabase/supabase-js`.

- **Animation performance floor:** The 30fps minimum at 6x Chrome CPU throttle is the specified acceptance criterion, but real low-end Android (Xiaomi Redmi 9, Samsung Galaxy A14) may still underperform. Build the performance gate and fallback (CSS-only alternative) in Phase 5 before knowing the real floor. Be prepared to simplify the animation if device testing reveals the threshold is not met.

---

## Sources

### Primary (HIGH confidence)

- [Next.js App Router Official Docs](https://nextjs.org/docs/app) — route groups, ISR, Server/Client Components, hydration errors, `next/font`, `next/image`
- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS enable/disable, `auth.uid()` patterns, policy syntax
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage) — bucket architecture, CDN, Image Transformations, access control
- [Supabase Storage CDN Fundamentals](https://supabase.com/docs/guides/storage/cdn/fundamentals) — cache invalidation timing, staleness behavior
- [MDN Autoplay Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — browser autoplay policy, mobile restrictions
- [Chrome Autoplay Policy for Developers](https://developer.chrome.com/blog/autoplay) — Media Engagement Index, mobile behavior
- [Motion.dev Docs + Blog](https://motion.dev) — framer-motion 12.x React integration, animation performance tier list
- [MakerKit Next.js + Supabase Architecture Docs](https://makerkit.dev) — layered SaaS structure, route groups, ISR vs SSR decision
- [qrcode npm package](https://www.npmjs.com/package/qrcode) — `toBuffer()` API for NestJS QR generation
- [Google Fonts — Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) — Vietnamese diacritics support
- [CVE-2025-48757 / Lovable RLS Exposure](https://www.leanware.co/insights/supabase-best-practices) — real-world RLS failure case

### Secondary (MEDIUM confidence)

- WebSearch (March 2026) — version confirmations for framer-motion 12.36.0, Next.js 16.1.6, NestJS 11.1.16, supabase-js 2.99.0, react-dropzone 15.0.0, canvas-confetti 1.9.4, qrcode.react 4.2.0
- [Supabase + NestJS integration (Restack)](https://www.restack.io/docs/supabase-knowledge-supabase-nestjs-integration) — per-request Supabase client scope pattern
- [Turborepo + pnpm + NestJS + Next.js monorepo](https://medium.com/@alan.nguyen2050/setup-monorepo-for-nestjs-api-nextjs-fe-05e82945a8b5) — monorepo setup pattern
- [VnExpress: Bank QR on wedding invitations](https://vnexpress.net/nhan-thiep-cuoi-in-ma-qr-tai-khoan-ngan-hang-4701357.html) — cultural context for VietQR display
- [Zalo statistics 2025](https://www.salesmartly.com/en/blog/docs/what-is-zalo) — 79M MAU, primary Vietnamese messaging app
- nestjs/nest GitHub issue #15988 — nestjs-zod lacks official support; class-validator is the documented path
- Competitor analysis: Joy, Zola, Paperless Post, thesimple.vn — feature gap analysis

### Tertiary (LOW confidence)

- Community reports on Zalo OG tag crawler behavior — needs validation with real device testing in Phase 5
- iOS WKWebView audio unlock behavior in Zalo in-app browser — no official documentation; needs real-device testing

---

*Research completed: 2026-03-14*
*Ready for roadmap: yes*
