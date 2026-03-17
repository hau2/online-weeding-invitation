---
phase: 11-custom-theme-builder
plan: 02
subsystem: ui, frontend
tags: [react, nextjs, theme-config, custom-themes, template-selector, editor-preview, background-image]

# Dependency graph
requires:
  - phase: 11-custom-theme-builder
    provides: "Plan 01: custom_themes table, public GET /themes and GET /themes/:slug endpoints, findBySlug themeConfig resolution, TemplateId widened to string"
  - phase: 09.1-public-page-redesign
    provides: ThemeConfig interface, SharedTemplate rendering, getTheme() resolver, FooterSection, InvitationShell
provides:
  - buildThemeConfig helper for casting raw JSONB config into ThemeConfig with defaults
  - backgroundImageUrl field on ThemeConfig interface
  - Public page custom theme resolution via themeConfig prop from API
  - SharedTemplate background image rendering as fixed layer (iOS Safari compatible)
  - FooterSection dual-format handling (hex colors for custom, Tailwind classes for built-in)
  - TemplateSelector fetches and displays published custom themes with color swatch thumbnails
  - EditorPreview resolves custom themes via public API for live preview
affects: [11-custom-theme-builder, public-page, editor, template-selector]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "buildThemeConfig: cast raw JSONB to ThemeConfig with modern-red defaults"
    - "Dual-format footerBg: detect hex (#) vs Tailwind class (bg-) for inline style vs className"
    - "Background image as position:fixed div (not CSS background-attachment:fixed) for iOS Safari"
    - "Custom themes in TemplateSelector via public GET /themes (no auth required)"
    - "EditorPreview custom theme resolution via public GET /themes/:slug with useState/useEffect"

key-files:
  created: []
  modified:
    - apps/web/components/templates/themes/index.ts
    - apps/web/components/templates/SharedTemplate.tsx
    - apps/web/components/templates/sections/FooterSection.tsx
    - apps/web/components/templates/index.ts
    - apps/web/app/w/[slug]/page.tsx
    - apps/web/app/w/[slug]/InvitationShell.tsx
    - apps/web/app/w/[slug]/ThankYouPage.tsx
    - apps/web/app/w/[slug]/SaveTheDatePage.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/TemplateSelector.tsx
    - apps/web/app/(app)/thep-cuoi/[id]/EditorPreview.tsx

key-decisions:
  - "buildThemeConfig uses modern-red as defaults for any missing fields in raw JSONB config"
  - "Background image uses position:fixed div instead of background-attachment:fixed for iOS Safari compatibility"
  - "FooterSection detects hex vs Tailwind class via startsWith('#') for dual-format footerBg"
  - "Custom themes fetched from public GET /themes endpoint (no auth) so non-admin users can see them in TemplateSelector"
  - "EditorPreview uses SharedTemplate directly instead of TemplateRenderer for custom theme support"

patterns-established:
  - "themeConfig prop pattern: server-side page.tsx passes API themeConfig to client components"
  - "Custom theme resolution: if themeConfig prop present use buildThemeConfig, else fall back to getTheme"
  - "Auto-generated color swatch thumbnails: primary color top third + background color bottom two-thirds + text color name"

requirements-completed: [CT-06, CT-07, CT-08]

# Metrics
duration: 4min
completed: 2026-03-18
---

# Phase 11 Plan 02: Frontend Custom Theme Rendering Pipeline Summary

**Custom theme resolution pipeline wiring public pages, SharedTemplate background image rendering, dual-format FooterSection, and TemplateSelector with auto-generated color swatch thumbnails from public API**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-17T18:43:38Z
- **Completed:** 2026-03-17T18:48:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Public invitation pages resolve and render custom themes from API themeConfig prop via buildThemeConfig helper
- SharedTemplate renders background images as fixed full-page layer (iOS Safari compatible, no background-attachment:fixed)
- FooterSection handles both hex colors (custom themes) and Tailwind classes (built-in themes) for footerBg
- TemplateSelector fetches published custom themes from public GET /themes and renders color swatch thumbnails
- EditorPreview resolves custom themes via public GET /themes/:slug for real-time preview updates

## Task Commits

Each task was committed atomically:

1. **Task 1: Theme resolution pipeline + SharedTemplate background image + FooterSection dual-format** - `e445c42` (feat)
2. **Task 2: TemplateSelector fetches and displays custom themes with auto-generated thumbnails** - `5712cf5` (feat)

## Files Created/Modified
- `apps/web/components/templates/themes/index.ts` - Added backgroundImageUrl to ThemeConfig, buildThemeConfig helper
- `apps/web/components/templates/SharedTemplate.tsx` - Background image rendering as fixed layer
- `apps/web/components/templates/sections/FooterSection.tsx` - Dual-format footerBg (hex vs Tailwind class)
- `apps/web/components/templates/index.ts` - Re-exported buildThemeConfig
- `apps/web/app/w/[slug]/page.tsx` - Extended PublicInvitation type with themeConfig, passed to child components
- `apps/web/app/w/[slug]/InvitationShell.tsx` - Custom theme resolution via buildThemeConfig
- `apps/web/app/w/[slug]/ThankYouPage.tsx` - Custom theme resolution via buildThemeConfig
- `apps/web/app/w/[slug]/SaveTheDatePage.tsx` - Custom theme resolution via buildThemeConfig
- `apps/web/app/(app)/thep-cuoi/[id]/TemplateSelector.tsx` - Fetches custom themes from public API, renders color swatches
- `apps/web/app/(app)/thep-cuoi/[id]/EditorPreview.tsx` - Custom theme resolution via public API with useState/useEffect

## Decisions Made
- buildThemeConfig uses modern-red as defaults for any missing fields (safe fallback for incomplete configs)
- Background image uses position:fixed div (not CSS background-attachment:fixed) per RESEARCH.md pitfall 5 for iOS Safari
- FooterSection detects format via startsWith('#') to handle both hex and Tailwind class footerBg values
- EditorPreview uses SharedTemplate directly instead of TemplateRenderer to pass resolved custom theme
- Custom themes fetched from unauthenticated public endpoint so non-admin users can browse and select themes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Frontend rendering pipeline complete for custom themes
- Ready for admin builder UI (plan 11-03) which provides the theme creation/editing interface
- End-to-end flow ready: admin creates theme (Plan 01 API) -> user selects theme (Plan 02 TemplateSelector) -> guest views theme (Plan 02 public page rendering)

## Self-Check: PASSED

All 10 modified files verified present. Both task commits (e445c42, 5712cf5) verified in git log.

---
*Phase: 11-custom-theme-builder*
*Completed: 2026-03-18*
