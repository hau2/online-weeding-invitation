---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: completed
stopped_at: Completed 03-05-PLAN.md
last_updated: "2026-03-15T01:02:09.629Z"
last_activity: "2026-03-15 — Plan 03-05 complete: Always-visible preview button in editor topbar closes EDIT-09 gap"
progress:
  total_phases: 9
  completed_phases: 3
  total_plans: 14
  completed_plans: 14
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14)

**Core value:** Couples can create and share a stunning online wedding invitation with a single QR code, and guests can view it and send gift money — all without any intermediary.
**Current focus:** Phase 3 — Invitation Editor Core

## Current Position

Phase: 3 of 9 (Invitation Editor Core) -- COMPLETE
Plan: 5 of 5 in current phase (03-01 + 03-02 + 03-03 + 03-04 + 03-05 complete)
Status: Phase Complete
Last activity: 2026-03-15 — Plan 03-05 complete: Always-visible preview button in editor topbar closes EDIT-09 gap

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 14
- Average duration: 12 min
- Total execution time: ~2.7 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 5/5 | ~96 min | ~19 min |
| 02-app-shell | 4/4 | 26 min | 7 min |
| 03-invitation-editor-core | 5/5 | ~15 min | ~3 min |

**Recent Trend:**
- Last 5 plans: 3 min (03-02), 4 min (03-01), 3 min (03-03), 3 min (03-04), 2 min (03-05)
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

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: Zalo OG crawler behavior is not officially documented — validate early in Phase 5 by sharing a test link in Zalo before finalizing OG implementation
- [Research]: iOS Safari audio unlock in Zalo WKWebView (in-app browser) may differ from Safari — requires real-device testing, cannot reproduce in emulators
- [Research]: Animation performance floor on real low-end Android (Xiaomi Redmi 9, Samsung Galaxy A14) unknown — build performance gate and CSS fallback in Phase 5

## Session Continuity

Last session: 2026-03-15T01:01:23Z
Stopped at: Completed 03-05-PLAN.md
Resume file: None
