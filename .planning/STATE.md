---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 02-app-shell-04-PLAN.md
last_updated: "2026-03-14T15:41:23Z"
last_activity: "2026-03-14 — Plan 02-04 complete: NestJS invitations module with GET/POST, cookie-based JwtGuard, ownership enforcement, 8 unit tests"
progress:
  total_phases: 9
  completed_phases: 1
  total_plans: 9
  completed_plans: 6
  percent: 40
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14)

**Core value:** Couples can create and share a stunning online wedding invitation with a single QR code, and guests can view it and send gift money — all without any intermediary.
**Current focus:** Phase 2 — App Shell

## Current Position

Phase: 2 of 9 (App Shell)
Plan: 1 of 4 in current phase (02-04 complete)
Status: Executing
Last activity: 2026-03-14 — Plan 02-04 complete: NestJS invitations module with GET/POST, cookie-based JwtGuard, ownership enforcement, 8 unit tests

Progress: [████░░░░░░] 40%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 18 min
- Total execution time: ~1.8 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 5/5 | ~96 min | ~19 min |
| 02-app-shell | 1/4 | 5 min | 5 min |

**Recent Trend:**
- Last 5 plans: 2 min (01-05), 8 min (01-03), ~90 min (01-04), 5 min (02-04)
- Trend: —

*Updated after each plan completion*
| Phase 01-foundation P01 | 5 | 2 tasks | 30 files |
| Phase 01-foundation P05 | 2 | 1 task | 7 files |
| Phase 01-foundation P03 | 8min | 2 tasks | 16 files |
| Phase 01-foundation P04 | 90min | 3 tasks | 25 files |
| Phase 02-app-shell P04 | 5min | 2 tasks | 10 files |

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

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: Zalo OG crawler behavior is not officially documented — validate early in Phase 5 by sharing a test link in Zalo before finalizing OG implementation
- [Research]: iOS Safari audio unlock in Zalo WKWebView (in-app browser) may differ from Safari — requires real-device testing, cannot reproduce in emulators
- [Research]: Animation performance floor on real low-end Android (Xiaomi Redmi 9, Samsung Galaxy A14) unknown — build performance gate and CSS fallback in Phase 5

## Session Continuity

Last session: 2026-03-14T15:41:23Z
Stopped at: Completed 02-app-shell-04-PLAN.md
Resume file: None
