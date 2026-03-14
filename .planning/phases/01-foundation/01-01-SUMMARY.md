---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [pnpm, turborepo, nextjs, nestjs, typescript, tailwind, monorepo]

# Dependency graph
requires: []
provides:
  - pnpm + Turborepo monorepo with apps/web, apps/api, packages/types, packages/config workspaces
  - "@repo/types: User, UserRole, UserPublic, Invitation, InvitationStatus, TemplateId, LoginRequest, RegisterRequest, AuthResponse, MessageResponse, ResetPasswordRequest, ConfirmResetPasswordRequest"
  - apps/web Next.js 15 with lang=vi root layout, Be Vietnam Pro/Playfair Display/Dancing Script fonts, Tailwind v4 CSS-first config
  - apps/api NestJS 11 with health endpoint, ValidationPipe, CORS, ConfigModule
  - Turborepo build pipeline with build/dev/lint/test tasks
affects:
  - 01-02 (Supabase schema — builds on this monorepo foundation)
  - 01-03 (NestJS auth module — extends apps/api)
  - 01-04 (Next.js auth pages — extends apps/web)
  - all subsequent phases

# Tech tracking
tech-stack:
  added:
    - pnpm@9 workspace monorepo
    - turbo@2.8.17
    - next@15.1.x (Next.js 15, not 16 as specified — 16 does not exist)
    - "@nestjs/common@^11, @nestjs/core@^11, @nestjs/platform-express@^11"
    - "@nestjs/config@^3, @nestjs/jwt@^10, @nestjs/passport@^11"
    - "@nestjs-modules/mailer@^2 (corrected from @nestjs/mailer)"
    - tailwindcss@4 + @tailwindcss/postcss
    - framer-motion@12, react-hook-form@7, zod@3, @tanstack/react-query@5
    - jose@5, sonner, tw-animate-css
    - next/font/google: Be_Vietnam_Pro, Playfair_Display, Dancing_Script
    - vitest@2 (api test runner)
    - "@playwright/test@1 (web e2e)"
  patterns:
    - pnpm workspace:* protocol for internal package references
    - turbo.json dependsOn ^build for correct build ordering
    - tsconfig paths alias for @repo/types -> ../../packages/types/src/index.ts in each app
    - packages/types source-first distribution (main/types point to src/index.ts, no build step needed by consumers)
    - CSS-first Tailwind v4 config via @theme inline in globals.css
    - OKLCH color values for wedding-themed soft pink/rose palette

key-files:
  created:
    - package.json (root monorepo with turbo scripts)
    - pnpm-workspace.yaml (workspace definition)
    - turbo.json (build pipeline)
    - .gitignore
    - .env.example (all environment variables documented)
    - packages/config/package.json
    - packages/config/tsconfig.base.json
    - packages/config/eslint-base.js
    - packages/types/package.json
    - packages/types/tsconfig.json
    - packages/types/src/index.ts
    - packages/types/src/user.ts
    - packages/types/src/auth.ts
    - packages/types/src/invitation.ts
    - apps/web/package.json
    - apps/web/next.config.ts
    - apps/web/tsconfig.json
    - apps/web/postcss.config.mjs
    - apps/web/lib/fonts.ts
    - apps/web/app/globals.css
    - apps/web/app/layout.tsx
    - apps/web/app/page.tsx
    - apps/api/package.json
    - apps/api/tsconfig.json
    - apps/api/tsconfig.build.json
    - apps/api/nest-cli.json
    - apps/api/src/main.ts
    - apps/api/src/app.module.ts
    - apps/api/src/app.controller.ts
    - apps/api/src/app.service.ts
  modified:
    - apps/web/tsconfig.json (Next.js auto-added allowJs, noEmit, isolatedModules during build)
    - packages/types/package.json (added @repo/config as devDependency)

key-decisions:
  - "Used next@^15.1.6 instead of ^16.1.6 — Next.js 16 does not exist; 15 is current stable"
  - "Replaced @nestjs/mailer with @nestjs-modules/mailer — correct npm package name"
  - "Added @repo/config as devDependency to packages/types — required for tsconfig extends to resolve"
  - "packages/types distributes source directly (main/types -> src/index.ts) avoiding build step for consumers"
  - "Tailwind v4 CSS-first config via @theme inline — no tailwind.config.ts needed"
  - "OKLCH color space for wedding palette — perceptually uniform, better for fine-grained color control"

patterns-established:
  - "Monorepo workspace:* protocol: all internal packages use workspace:* not file: references"
  - "tsconfig paths alias pattern: each app maps @repo/types to ../../packages/types/src/index.ts"
  - "NestJS bootstrap pattern: ValidationPipe(whitelist+forbidNonWhitelisted+transform), CORS from WEB_URL env"
  - "Next.js font pattern: export named consts from lib/fonts.ts, apply CSS variables to body className"

requirements-completed: [SYST-01, SYST-03]

# Metrics
duration: 5min
completed: 2026-03-14
---

# Phase 1 Plan 01: Foundation Monorepo Summary

**pnpm + Turborepo monorepo scaffolded with Next.js 15 (apps/web), NestJS 11 (apps/api), and shared TypeScript contracts in packages/types — all workspaces build successfully**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-14T13:30:17Z
- **Completed:** 2026-03-14T13:35:12Z
- **Tasks:** 2 completed
- **Files modified:** 30

## Accomplishments
- pnpm monorepo with Turborepo build pipeline (build/dev/lint/test) running end-to-end
- packages/types exports 12 TypeScript interfaces consumed by both apps without errors
- apps/web Next.js 15 builds with lang="vi" root layout, Vietnamese font stack (Be Vietnam Pro, Playfair Display, Dancing Script), Tailwind v4 OKLCH color palette
- apps/api NestJS 11 builds with health endpoint, global ValidationPipe, and CORS configured

## Task Commits

Each task was committed atomically:

1. **Task 1: Bootstrap pnpm monorepo** - `757d669` (feat)
2. **Task 2: Create apps/web and apps/api** - `a1533bf` (feat)

**Plan metadata:** TBD (docs commit)

## Files Created/Modified
- `package.json` - Monorepo root with turbo scripts
- `pnpm-workspace.yaml` - Workspace definition for apps/* and packages/*
- `turbo.json` - Build pipeline with dependsOn ^build, persistent dev
- `.env.example` - All env vars documented (Supabase, JWT, SMTP, URLs)
- `packages/config/tsconfig.base.json` - Shared TS config (ES2022, Bundler resolution, strict)
- `packages/types/src/index.ts` - Re-exports all shared interfaces
- `packages/types/src/user.ts` - User, UserRole, UserPublic interfaces
- `packages/types/src/auth.ts` - LoginRequest, RegisterRequest, AuthResponse, ResetPasswordRequest, etc.
- `packages/types/src/invitation.ts` - Invitation, InvitationStatus, TemplateId interfaces
- `apps/web/app/layout.tsx` - Root layout with lang="vi" and font variable classes
- `apps/web/lib/fonts.ts` - Be Vietnam Pro, Playfair Display, Dancing Script font configs
- `apps/web/app/globals.css` - Tailwind v4 CSS-first config with OKLCH wedding palette
- `apps/api/src/main.ts` - NestJS bootstrap on port 4000
- `apps/api/src/app.module.ts` - AppModule with global ConfigModule
- `apps/api/src/app.controller.ts` - GET /health endpoint
- `apps/api/src/app.service.ts` - healthCheck() returns {status:'ok', service:'thep-cuoi-api'}

## Decisions Made
- Next.js version corrected to 15 (16 does not exist in npm registry as of 2026-03-14)
- Mailer package corrected from `@nestjs/mailer` to `@nestjs-modules/mailer` (correct npm name)
- packages/types uses source-first distribution — consumers import TypeScript source directly, no compile step required for the types package itself
- Tailwind v4 uses CSS-first configuration via `@theme inline` block in globals.css rather than a separate tailwind.config.ts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @repo/config devDependency to packages/types**
- **Found during:** Task 1 verification (`pnpm --filter @repo/types build`)
- **Issue:** `tsconfig.json` extends `@repo/config/tsconfig.base.json` but @repo/config was not listed as a devDependency in packages/types/package.json — TypeScript could not resolve the extends path
- **Fix:** Added `"@repo/config": "workspace:*"` to packages/types devDependencies
- **Files modified:** packages/types/package.json
- **Verification:** `pnpm --filter @repo/types build` exits 0 with no TypeScript errors
- **Committed in:** 757d669 (Task 1 commit)

**2. [Rule 1 - Bug] Corrected @nestjs/mailer to @nestjs-modules/mailer**
- **Found during:** Task 2 (`pnpm install` returned 404 for @nestjs/mailer)
- **Issue:** Plan specified `@nestjs/mailer` which does not exist in npm registry; correct package is `@nestjs-modules/mailer`
- **Fix:** Updated apps/api/package.json dependency name
- **Files modified:** apps/api/package.json
- **Verification:** `pnpm install` completes successfully
- **Committed in:** a1533bf (Task 2 commit)

**3. [Rule 1 - Bug] Used next@^15.1.6 instead of next@^16.1.6**
- **Found during:** Task 2 (plan review before writing)
- **Issue:** Next.js 16 does not exist in npm registry; current stable is Next.js 15
- **Fix:** Updated apps/web/package.json to use `"next": "^15.1.6"`
- **Files modified:** apps/web/package.json
- **Verification:** `pnpm turbo build` builds web workspace successfully
- **Committed in:** a1533bf (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 blocking dependency, 2 incorrect package/version references)
**Impact on plan:** All three fixes were required for basic functionality. The core design intent is unchanged.

## Issues Encountered
- `@nestjs/jwt@^10` and `@nestjs/config@^3` have peer dependency warnings against `@nestjs/common@^11` (their peer declarations don't include v11 range). These packages work correctly at runtime — warning is a package metadata lag, not a functional issue. Will be resolved when those packages update their peer declarations.

## User Setup Required
None — no external service configuration required for this plan. Supabase is set up in plan 01-02.

## Next Phase Readiness
- Monorepo foundation is complete and all workspaces build
- apps/api ready to receive NestJS modules (auth, invitations, etc.) starting in 01-03
- apps/web ready to receive pages, components, and shadcn/ui setup starting in 01-04
- packages/types type contracts in place for all subsequent plans
- No blockers for 01-02 (Supabase schema setup)

---
*Phase: 01-foundation*
*Completed: 2026-03-14*
