---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: completed
stopped_at: Completed 08-05-PLAN.md
last_updated: "2026-03-16T06:31:32.743Z"
last_activity: "2026-03-16 — Plan 08-05 complete: revenue stat card and live music usage counts (gap closure)"
progress:
  total_phases: 11
  completed_phases: 9
  total_plans: 39
  completed_plans: 39
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14)

**Core value:** Couples can create and share a stunning online wedding invitation with a single QR code, and guests can view it and send gift money — all without any intermediary.
**Current focus:** Phase 8 (Admin Panel) in progress

## Current Position

Phase: 8 of 9 (Admin Panel)
Plan: 5 of 5 in phase 8 (08-05 complete)
Status: Phase 8 Complete
Last activity: 2026-03-16 — Plan 08-05 complete: revenue stat card and live music usage counts (gap closure)

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 16
- Average duration: 11 min
- Total execution time: ~2.9 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 5/5 | ~96 min | ~19 min |
| 02-app-shell | 4/4 | 26 min | 7 min |
| 03-invitation-editor-core | 5/5 | ~15 min | ~3 min |
| 04-media-upload-pipeline | 2/4 | 10 min | 5 min |

**Recent Trend:**
- Last 5 plans: 3 min (03-03), 3 min (03-04), 2 min (03-05), 2 min (04-00), 8 min (04-01)
- Trend: accelerating

*Updated after each plan completion*
| Phase 01-foundation P01 | 5 | 2 tasks | 30 files |
| Phase 01-foundation P05 | 2 | 1 task | 7 files |
| Phase 01-foundation P03 | 8min | 2 tasks | 16 files |
| Phase 01-foundation P04 | 90min | 3 tasks | 25 files |
| Phase 02-app-shell P04 | 5min | 2 tasks | 10 files |
| Phase 02-app-shell P01 | 9min | 3 tasks | 22 files |
| Phase 02-app-shell P02 | 7min | 2 tasks | 11 files |
| Phase 02-app-shell P03 | 5min | 2 tasks | 5 files |
| Phase 03-invitation-editor-core P02 | 3min | 2 tasks | 9 files |
| Phase 03-invitation-editor-core P01 | 4min | 2 tasks | 5 files |
| Phase 03-invitation-editor-core P03 | 3min | 3 tasks | 12 files |
| Phase 03 P04 | 3min | 2 tasks | 3 files |
| Phase 03 P05 | 2min | 1 task | 2 files |
| Phase 04 P00 | 2min | 2 tasks | 6 files |
| Phase 04 P01 | 8min | 2 tasks | 14 files |
| Phase 04 P03 | 2min | 2 tasks | 3 files |
| Phase 04 P02 | 5min | 2 tasks | 8 files |
| Phase 05 P00 | 3min | 2 tasks | 10 files |
| Phase 05 P02 | 5min | 2 tasks | 4 files |
| Phase 05 P01 | 8min | 2 tasks | 6 files |
| Phase 05 P03 | 3min | 2 tasks | 5 files |
| Phase 05 P05 | 4min | 2 tasks | 7 files |
| Phase 05 P04 | 4min | 2 tasks | 4 files |
| Phase 05.1 P01 | 12min | 2 tasks | 7 files |
| Phase 05.1 P03 | 2min | 1 tasks | 3 files |
| Phase 05.1 P02 | 2 | 1 tasks | 1 files |
| Phase 05.1 P04 | 4 | 2 tasks | 7 files |
| Phase 05 P06 | 5min | 2 tasks | 4 files |
| Phase 06 P01 | 3min | 2 tasks | 5 files |
| Phase 06 P02 | 3min | 2 tasks | 6 files |
| Phase 07 P01 | 7min | 2 tasks | 5 files |
| Phase 07 P02 | 5min | 2 tasks | 6 files |
| Phase 07 P03 | 7min | 2 tasks | 8 files |
| Phase 08 P01 | 5 | 3 tasks | 14 files |
| Phase 08 P02 | 2min | 2 tasks | 4 files |
| Phase 08 P03 | 3 | 2 tasks | 2 files |
| Phase 08 P04 | 4min | 3 tasks | 6 files |
| Phase 08 P05 | 2min | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Two-client NestJS pattern (user JWT client + service role) established before any CRUD endpoints — prevents RLS bypass pitfall
- [Init]: Envelope-tap is the audio unlock gate — never call audio.play() on page load; design this from Phase 5 day one
- [Init]: Slug locked at DB constraint level on first publish — not just application logic; show confirmation dialog before first publish
- [Init]: All uploads go through NestJS — browser never uploads directly to Supabase Storage; magic-byte MIME validation required
- [Init]: Phase 5 (Public Invitation Page) flagged for deeper research — iOS WKWebView audio behavior and Zalo OG crawler are not officially documented
- [Phase 01-foundation]: SupabaseUserService is REQUEST-scoped to prevent JWT leakage between concurrent requests in NestJS DI
- [Phase 01-foundation]: password_reset_tokens has RLS enabled but zero user-facing policies — service role is sole accessor
- [Phase 01-foundation]: Slug uniqueness enforced at DB level with partial unique index WHERE slug IS NOT NULL
- [Phase 01-foundation]: Used next@^15.1.6 — Next.js 16 does not exist; 15 is current stable
- [Phase 01-foundation]: packages/types distributes source directly — consumers import TypeScript source via tsconfig paths alias, no build step needed
- [Phase 01-foundation]: Tailwind v4 CSS-first config via @theme inline in globals.css — no tailwind.config.ts required
- [Phase 01-foundation P05]: Be Vietnam Pro uses weight 300-700 (not just 400+700) to support light UI text and medium button labels
- [Phase 01-foundation P05]: OKLCH colorspace chosen for palette — perceptually uniform lightness steps look visually equal
- [Phase 01-foundation P05]: Sonner wrapped in components/ui/sonner.tsx (not imported directly) — enables future CSS-var theme customization
- [Phase 01-foundation]: unplugin-swc added to Vitest for emitDecoratorMetadata — NestJS DI requires decorator metadata reflection; esbuild does not emit it
- [Phase 01-foundation]: import type for express in supabase.service.ts — Vite cannot bundle transitive CJS deps; type-only import avoids resolution without behavior change
- [Phase 01-foundation]: JWT payload shape established: sub=userId, role=authenticated, app_role=user|admin, aud=authenticated — Supabase RLS compatible
- [Phase 01-foundation P04]: Server actions call redirect() directly after setting cookie — router.push() silently fails after headers are committed
- [Phase 01-foundation P04]: Resend SDK replaces @nestjs-modules/mailer — single API key, no SMTP config, unblocks local testing
- [Phase 01-foundation P04]: ConfigModule envFilePath set to ../../.env — NestJS cwd is apps/api, not monorepo root
- [Phase 01-foundation P04]: jose used for Edge JWT — jsonwebtoken cannot run in Next.js Edge runtime
- [Phase 02-app-shell P04]: Cookie-based JwtGuard (jose) in common/guards/ separate from Passport-based guard in auth/guards/ -- each serves different auth flow
- [Phase 02-app-shell P04]: InvitationRow interface with explicit cast for Supabase untyped client -- avoids GenericStringError TS build failures
- [Phase 02-app-shell P04]: SUPABASE_JWT_SECRET env var reused (not JWT_SECRET) for consistency with existing auth module
- [Phase 02-app-shell P04]: mapRow helper function extracts snake_case-to-camelCase mapping to avoid duplication between list and create
- [Phase 02-app-shell P01]: shadcn/ui base-nova style uses @base-ui/react render prop instead of Radix asChild -- all SidebarMenuButton uses render={<Link />}
- [Phase 02-app-shell P01]: @vitejs/plugin-react pinned to v4 for Vite 5 compatibility (vitest@2 bundles vite@5)
- [Phase 02-app-shell P01]: Admin forbidden redirects to /dashboard?error=forbidden (not 403 JSON) for better UX
- [Phase 02-app-shell P02]: Cookie name adapted to auth-token (Phase 1 pattern) for dashboard server-side fetch instead of plan's session cookie
- [Phase 02-app-shell P02]: base-ui render prop with nativeButton={false} for Button rendered as Link -- avoids console warning about non-native button
- [Phase 02-app-shell P02]: framer-motion Variants type annotation required for ease property -- plain object widens string literal to non-assignable type
- [Phase 02-app-shell P03]: recharts installed for admin charts -- lightweight, composable, works with RSC via 'use client' boundary
- [Phase 02-app-shell P03]: All stat values show em-dash placeholder -- real data wired in Phase 8
- [Phase 03-invitation-editor-core P01]: SupabaseAdminService used for slug writes to bypass RLS -- user client cannot write to slug column
- [Phase 03-invitation-editor-core P01]: crypto.randomBytes for slug suffix instead of nanoid -- nanoid v4+ ESM-only, incompatible with NestJS CJS
- [Phase 03-invitation-editor-core P01]: Dynamic FIELD_MAP for camelCase-to-snake_case -- only sends present fields to avoid nullifying undefined ones
- [Phase 03-invitation-editor-core P01]: ParseUUIDPipe on all :id params for input validation at controller level
- [Phase 03-invitation-editor-core P02]: Templates use hex colors for gold/burgundy -- wedding-specific colors not in Tailwind palette
- [Phase 03-invitation-editor-core P02]: Vietnamese placeholder text for empty fields (Chu re, Co dau, Chua chon ngay) for immediate visual context
- [Phase 03-invitation-editor-core P02]: Intl.DateTimeFormat vi-VN for locale-appropriate date rendering in templates
- [Phase 03-invitation-editor-core P03]: useRef for latestData in useAutoSave prevents stale closure in debounced callback
- [Phase 03-invitation-editor-core P03]: SaveStatus auto-resets to idle after 2s so indicator fades naturally
- [Phase 03-invitation-editor-core P03]: Preview renders from local useState, never re-fetches -- zero network delay for real-time feel
- [Phase 03-invitation-editor-core P03]: Phone mockup hidden on mobile, replaced with simple bordered preview
- [Phase 03]: canvas-confetti dynamically imported via import() to avoid SSR issues and keep initial bundle small
- [Phase 03]: onPreview callback prop removed -- standalone Eye button in EditorShell topbar replaces PublishButton dropdown trigger for FullPreviewDialog
- [Phase 03 P05]: Preview button lives in EditorShell topbar, not in PublishButton dropdown -- always visible regardless of publish status
- [Phase 04 P00]: Extended existing templates.test.tsx rather than creating a separate file for photo/QR template stubs
- [Phase 04 P00]: Pre-existing 3 test failures in invitations.service.spec.ts confirmed out-of-scope (not caused by Wave 0 changes)
- [Phase 04 P01]: photoUrls and bankQrUrl excluded from FIELD_MAP to prevent arbitrary URL injection via generic PATCH
- [Phase 04 P01]: Dedicated PATCH :id/photo-order endpoint for drag-reorder persistence (not through auto-save)
- [Phase 04 P01]: GET music-tracks route placed before :id param route to avoid NestJS route conflict
- [Phase 04 P01]: Bank QR upload uses upsert:true to replace existing file at same path
- [Phase 04 P01]: Photo order validation checks exact same URL set to prevent URL injection via reorder endpoint
- [Phase 04]: Photo gallery uses space-y-3 (Traditional/Modern) and space-y-4 (Minimalist) for vertical stacking
- [Phase 04]: Bank QR card styled per template palette: burgundy/gold border for Traditional, white shadow card for Modern, thin gray border for Minimalist
- [Phase 04]: Dynamic import('howler') instead of top-level import to avoid SSR/Node.js Audio context errors
- [Phase 04]: Native drag events for file drops, dnd-kit for thumbnail reorder -- separate concerns, no conflict
- [Phase 04]: Photo URLs used directly as dnd-kit sortable IDs (each URL is unique)
- [Phase 04]: Reorder optimistically updates UI then PATCHes to dedicated photo-order endpoint; reverts on error
- [Phase 05 P00]: Followed existing vitest it.todo() pattern from Phase 3/4 stubs for consistency
- [Phase 05]: triggerRevalidation is non-blocking with try/catch and logger.warn -- revalidation failure never blocks publish/unpublish
- [Phase 05]: Revalidation skipped silently when REVALIDATION_SECRET not configured (dev mode)
- [Phase 05]: ConfigService injected into InvitationsService for NEXT_PUBLIC_URL and REVALIDATION_SECRET
- [Phase 05]: PublicInvitationsController is separate from JwtGuard-protected controller for clean auth separation
- [Phase 05]: QR generation failure is non-blocking (try/catch with logger.warn) -- never blocks publish flow
- [Phase 05]: metadataBase from NEXT_PUBLIC_SITE_URL for absolute OG image URL composition
- [Phase 05]: Template-aware ThankYouPage colors via TEMPLATE_COLORS record mapping templateId to color palette
- [Phase 05]: InvitationShell uses simple "Mo thiep" button as placeholder for EnvelopeAnimation (Plan 05-04)
- [Phase 05]: Equalizer and flip keyframes in globals.css rather than styled-jsx for consistency with project CSS approach
- [Phase 05]: parseGuestName in shared utils.ts (not inline in component) for reuse by EnvelopeAnimation and InvitationShell
- [Phase 05]: FlipCard sub-component with CSS perspective for 3D digit flip on value change
- [Phase 05]: window.location.search for ?to= parsing instead of useSearchParams -- avoids Next.js router dependency in tests and keeps guest name purely client-side
- [Phase 05]: Deterministic seeded PRNG for petal randomization -- prevents React hydration mismatch from Math.random()
- [Phase 05]: Unicode U+56CD (double happiness) for traditional wax seal, heart for modern/minimalist
- [Phase 05.1]: Per-family column naming uses groom_*/bride_* prefix convention for dual-family ceremony fields
- [Phase 05.1]: love_story stored as JSONB NOT NULL DEFAULT '[]' -- no separate table for max 5 milestones
- [Phase 05.1]: Expiry uses later of groom/bride ceremony dates so neither side expires prematurely
- [Phase 05.1]: LoveStoryMilestoneDto: nested validation with @ValidateNested + @Type, max 5 milestones, title 100 chars, desc 300 chars
- [Phase 05.1]: Vietnamese honorifics Ong/Ba used for parents names display on formal invitation
- [Phase 05.1]: Love story timeline: vertical 2px line with 10px dot circles, template-specific palettes (gold/rose/gray)
- [Phase 05.1]: Love story editor uses immutable array copy + onChange for auto-save compatibility
- [Phase 05.1]: Ban do section uses shared venueMapUrl (not per-family) per deferred decision
- [Phase 05.1]: Side filtering done at InvitationShell level via useMemo -- templates receive pre-filtered data
- [Phase 05.1]: Default side is groom when no ?side= param provided
- [Phase 05.1]: OG metadata uses groom ceremony date/venue (server-side, no side param)
- [Phase 05.1]: Copy-link buttons replace single Xem trang view button on dashboard cards
- [Phase 05 P06]: Dynamic imports via next/dynamic with ssr:false for all interactive components to reduce initial bundle
- [Phase 05 P06]: Suspense boundary wrapping InvitationShell for Next.js useSearchParams requirement
- [Phase 05 P06]: Footer watermark placeholder text for Phase 7 monetization
- [Phase 06 P01]: publishSaveTheDate only allows draft->save_the_date; published invitations cannot regress to teaser
- [Phase 06 P01]: save_the_date teasers skip music URL resolution and expiry -- lightweight previews that don't expire
- [Phase 06 P01]: isSaveTheDate boolean flag in findBySlug response for frontend routing between teaser and full views
- [Phase 06 P02]: SaveTheDatePage uses template-specific TEMPLATE_COLORS record (same pattern as ThankYouPage) for consistent per-template theming
- [Phase 06 P02]: getLaterDate helper picks the later of groom/bride ceremony dates for countdown timer display
- [Phase 06 P02]: Save the Date button shown as outlined teal variant next to rose Xuat ban button for visual distinction
- [Phase 06 P02]: EditorForm sections renumbered from 9 to 10 with new Save the Date section at position 6
- [Phase 07 P01]: enforceFreeTierLimit as private reusable method called by both publish() and publishSaveTheDate()
- [Phase 07 P01]: Admin routes placed in existing InvitationsController with method-level AdminGuard (not separate controller)
- [Phase 07 P01]: Admin route paths use 'admin/' prefix placed before ':id' routes to prevent NestJS UUID parse conflict
- [Phase 07 P02]: Watermark uses DOM text elements (not CSS background-image or SVG data URI) for tamper resistance
- [Phase 07 P02]: (invitation.plan ?? 'free') === 'free' pattern handles undefined plan for backwards compatibility
- [Phase 07 P02]: Footer branding text removed entirely for premium tier (not just made subtle)
- [Phase 07 P02]: Watermark rendered during both envelope and revealed stages to prevent screenshot bypass
- [Phase 07]: UpgradeButton uses gradient amber-to-rose styling for visual prominence, amber badge for pending state
- [Phase 07]: Plan badges inline in InvitationCard header, not extending StatusBadge (separate concerns)
- [Phase 07]: Upgrade page uses NEXT_PUBLIC_ADMIN_BANK_QR/NAME/HOLDER env vars for admin bank info (Phase 8 adds UI)
- [Phase 07]: AdminGuard fixed: checks app_role (admin) instead of role (authenticated) to match JWT payload
- [Phase 07]: Admin upgrade-history endpoint added for complete admin payments UI with history section
- [Phase 08]: Storage estimate uses heuristic (invitationCount * 1.5MB) instead of listing all bucket objects
- [Phase 08]: Theme metadata stored in JSONB inside system_settings key-value store -- no separate themes table
- [Phase 08]: AdminModule uses class-level JwtGuard + AdminGuard; theme IDs are string slugs not UUIDs
- [Phase 08]: getInvitationDetail returns raw DB row shape (snake_case) -- detail dialog handles both field name conventions
- [Phase 08 P02]: Dashboard stat cards use xl:grid-cols-5 layout for 5 cards including storage estimate
- [Phase 08 P02]: Debounced user search (300ms) via useRef timer -- no external debounce library
- [Phase 08 P02]: Delete confirmation dialog warns about cascading photo/invitation deletion
- [Phase 08 P04]: apiUpload extended with optional method parameter for PUT FormData (theme thumbnail update)
- [Phase 08 P04]: CSV export uses BOM prefix for Excel UTF-8 compatibility with Vietnamese characters
- [Phase 08 P04]: Notes section uses expandable per-row pattern with Set<string> tracking expanded IDs
- [Phase 08 P04]: Theme placeholder colors match template identity (rose/sky/gray for traditional/modern/minimalist)
- [Phase 08]: Revenue computed as premiumCount * pricePerInvitation from system_settings (not stored separately)
- [Phase 08]: Music track usage counts fetched as single batched query from invitations + JS Map grouping (same pattern as deleteMusicTrack)

### Roadmap Evolution

- Phase 05.1 inserted after Phase 5: Dual-family ceremony info — groom/bride family details, parents names, dual ceremony venues and times (URGENT)
- Phase 10 added: Agent Tier and Storage Management — monthly subscription for printing vendors, 20 invitations/month quota, draft auto-delete, published link expiration, admin Clear Storage button

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: Zalo OG crawler behavior is not officially documented — validate early in Phase 5 by sharing a test link in Zalo before finalizing OG implementation
- [Research]: iOS Safari audio unlock in Zalo WKWebView (in-app browser) may differ from Safari — requires real-device testing, cannot reproduce in emulators
- [Research]: Animation performance floor on real low-end Android (Xiaomi Redmi 9, Samsung Galaxy A14) unknown — build performance gate and CSS fallback in Phase 5

## Session Continuity

Last session: 2026-03-16T06:26:47.548Z
Stopped at: Completed 08-05-PLAN.md
Resume file: None
