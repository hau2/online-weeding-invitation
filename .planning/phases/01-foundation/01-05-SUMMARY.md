---
phase: 01-foundation
plan: 05
subsystem: ui
tags: [tailwind, tailwind-v4, next-font, typography, design-system, vietnamese, rose-palette, sonner, tw-animate-css, clsx, tailwind-merge]

# Dependency graph
requires:
  - phase: 01-01
    provides: pnpm monorepo scaffold with apps/web Next.js app structure
provides:
  - Tailwind v4 CSS-first configuration via @import tailwindcss and @theme inline
  - Be Vietnam Pro font (300-700, Vietnamese + Latin subsets) via next/font/google
  - Playfair Display serif font (400-700, normal + italic) for invitation headings
  - Dancing Script cursive font (400-700) for decorative wedding elements
  - Soft pink/rose OKLCH color palette (rose-50..900, gold-200..600, cream-50..200)
  - Semantic CSS variables (background, foreground, primary, muted, border, ring)
  - Radius design tokens (--radius, --radius-sm, --radius-lg, --radius-xl)
  - tw-animate-css animation utilities
  - Sonner Toaster wrapper in root layout for toast notifications
  - Typography components (Heading, ScriptText, BodyText)
  - cn() utility via clsx + tailwind-merge
  - Root layout with lang="vi" (SYST-01) and suppressHydrationWarning
affects: [02-app-shell, 03-invitation-editor, 04-invitation-viewer, 05-public-page, all-ui-phases]

# Tech tracking
tech-stack:
  added:
    - tw-animate-css (animation utilities, Tailwind v4 compatible)
    - Be Vietnam Pro via next/font/google
    - Playfair Display via next/font/google
    - Dancing Script via next/font/google
    - clsx@^2.0.0 (className construction)
    - tailwind-merge@^2.0.0 (Tailwind class deduplication)
    - sonner (Toaster wrapper component)
  patterns:
    - Tailwind v4 CSS-first: @import "tailwindcss" + @theme inline (no tailwind.config.ts)
    - OKLCH color values for perceptually uniform palette
    - next/font variable pattern: export const font = Font({ variable: '--font-name' })
    - cn() utility for conditional className merging throughout UI
    - Sonner toast pattern: <Toaster richColors position="top-center" /> in root layout

key-files:
  created:
    - apps/web/components/ui/sonner.tsx
    - apps/web/components/ui/typography.tsx
    - apps/web/lib/utils.ts
  modified:
    - apps/web/app/globals.css
    - apps/web/lib/fonts.ts
    - apps/web/app/layout.tsx
    - apps/web/package.json

key-decisions:
  - "Be Vietnam Pro uses weight 300-700 (not just 400+700) to support light UI text and medium button labels"
  - "Playfair Display includes italic style variant for invitation template cursive headings"
  - "OKLCH color space chosen for perceptually uniform palette — equal lightness steps look visually equal"
  - "Sonner wrapped in components/ui/sonner.tsx (not imported directly) to allow future customization"
  - "cn() utility placed in lib/utils.ts — shadcn/ui convention, needed before plan 01-04 runs shadcn init"

patterns-established:
  - "Font pattern: next/font exports with .variable used as CSS custom property on body"
  - "Color naming: semantic vars (--color-primary) reference palette vars (--color-rose-500)"
  - "Tailwind v4: all theme customization in globals.css @theme block, no tailwind.config.ts"
  - "Typography components: Heading/ScriptText/BodyText as thin wrappers setting font class"

requirements-completed: [SYST-01]

# Metrics
duration: 2min
completed: 2026-03-14
---

# Phase 1 Plan 5: Vietnamese Design System Summary

**Tailwind v4 CSS-first design baseline with Be Vietnam Pro font, OKLCH rose/gold palette, tw-animate-css, and Sonner toasts in Vietnamese lang="vi" root layout**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-14T13:38:07Z
- **Completed:** 2026-03-14T13:40:01Z
- **Tasks:** 1 of 1
- **Files modified:** 7 (3 created, 4 updated)

## Accomplishments

- Replaced scaffold globals.css with full Tailwind v4 @theme inline: OKLCH rose palette (50-900), gold accents (200-600), cream backgrounds, semantic tokens, radius tokens, focus ring styles
- Upgraded fonts.ts to full three-typeface config: Be Vietnam Pro (300-700), Playfair Display (400-700 normal+italic), Dancing Script (400-700)
- Updated layout.tsx: Vietnamese lang="vi", suppressHydrationWarning, font-sans on body, Toaster component
- Created three new files: sonner.tsx wrapper, typography.tsx (Heading/ScriptText/BodyText), utils.ts (cn helper)

## Task Commits

1. **Task 1: Tailwind v4 globals.css with rose palette, Be Vietnam Pro fonts, tw-animate-css** - `9ef6b0a` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `apps/web/app/globals.css` - Tailwind v4 @import, tw-animate-css, @theme inline with full rose/gold/cream OKLCH palette and semantic vars
- `apps/web/lib/fonts.ts` - Be Vietnam Pro (300-700 Vietnamese+Latin), Playfair Display (400-700 normal+italic), Dancing Script (400-700)
- `apps/web/app/layout.tsx` - lang="vi", suppressHydrationWarning, all three font variables on body, Sonner Toaster
- `apps/web/components/ui/sonner.tsx` - Sonner Toaster wrapper with CSS variable theming
- `apps/web/components/ui/typography.tsx` - Heading, ScriptText, BodyText components using font classes
- `apps/web/lib/utils.ts` - cn() via clsx + tailwind-merge
- `apps/web/package.json` - Added clsx@^2.0.0 and tailwind-merge@^2.0.0

## CSS Variable Reference (for downstream phases)

### Font variables (set on body via next/font .variable)
- `--font-be-vietnam-pro` — injected by beVietnamPro.variable
- `--font-heading` — injected by playfairDisplay.variable
- `--font-script` — injected by dancingScript.variable

### Tailwind font utilities
- `font-sans` → Be Vietnam Pro (via --font-sans)
- `font-heading` → Playfair Display (via --font-heading)
- `font-script` → Dancing Script (via --font-script)

### Color palette (all OKLCH)
- Rose: `--color-rose-50` through `--color-rose-900`
- Gold: `--color-gold-200` through `--color-gold-600`
- Cream: `--color-cream-50`, `--color-cream-100`, `--color-cream-200`

### Semantic tokens
- `--color-background` → cream-50 (page backgrounds)
- `--color-foreground` → dark rose-tinted (body text)
- `--color-primary` → rose-500 (primary actions)
- `--color-primary-foreground` → near-white (text on primary)
- `--color-muted` → rose-100 (muted backgrounds)
- `--color-muted-foreground` → mid-rose (secondary text)
- `--color-border` → rose-200 (borders)
- `--color-ring` → rose-400 (focus rings)

### Radius tokens
- `--radius` → 0.75rem (default)
- `--radius-sm` → 0.5rem
- `--radius-lg` → 1rem
- `--radius-xl` → 1.5rem

## Decisions Made

- Used weight 300-700 for Be Vietnam Pro to enable light (`font-light`) and medium (`font-medium`) text weights in invitation templates
- Included Playfair Display italic variant for romantic slanted headings in invitation cards
- OKLCH colorspace provides better perceptual uniformity than HSL — equal numeric lightness steps look equally spaced visually
- Sonner wrapped in thin component file rather than imported directly, enabling future theme customization without changing layout.tsx

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Created Sonner wrapper component**
- **Found during:** Task 1
- **Issue:** layout.tsx imports from `@/components/ui/sonner` but no such file existed — plan specified creating it but did not show the file in the action block
- **Fix:** Created `apps/web/components/ui/sonner.tsx` as a thin wrapper around Sonner with CSS variable theming
- **Files modified:** apps/web/components/ui/sonner.tsx (created)
- **Verification:** Build passes, layout.tsx import resolves
- **Committed in:** 9ef6b0a (Task 1 commit)

**2. [Rule 2 - Missing Critical] Created utils.ts before shadcn init runs**
- **Found during:** Task 1 (typography.tsx imports cn from @/lib/utils)
- **Issue:** utils.ts not yet created — plan 01-04 (shadcn init) may not have run; typography.tsx needs cn()
- **Fix:** Created apps/web/lib/utils.ts with cn() via clsx + tailwind-merge; added both to package.json
- **Files modified:** apps/web/lib/utils.ts (created), apps/web/package.json
- **Verification:** Build passes, TypeScript types resolve
- **Committed in:** 9ef6b0a (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 2 — missing critical files needed for build)
**Impact on plan:** Both fixes were anticipated by the plan ("verify utils.ts exists... create it if not") — executed exactly as intended.

## Issues Encountered

None — build passed on first attempt after all files created.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Design system baseline complete: all downstream phases can use `font-sans`, `font-heading`, `font-script`, color palette, and typography components
- cn() utility and Tailwind v4 CSS-first config available for all future UI work
- Toast notifications ready via Sonner Toaster in root layout
- Phase 01-04 (shadcn/ui) can safely run — it will find utils.ts already present and skip recreation

## Self-Check: PASSED

All created files confirmed present on disk. Task commit 9ef6b0a confirmed in git history.

---
*Phase: 01-foundation*
*Completed: 2026-03-14*
