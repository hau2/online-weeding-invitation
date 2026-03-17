---
phase: 11-custom-theme-builder
plan: 01
subsystem: api, database
tags: [nestjs, supabase, custom-themes, jsonb, sharp, storage, crud]

# Dependency graph
requires:
  - phase: 09.1-public-page-redesign
    provides: ThemeConfig interface, SharedTemplate rendering, getTheme() resolver
  - phase: 08-admin-panel
    provides: AdminController, AdminService, admin CRUD patterns
provides:
  - custom_themes database table with JSONB config storage
  - 7 admin CRUD endpoints for custom theme lifecycle management
  - 2 public theme endpoints (GET /themes, GET /themes/:slug) without auth
  - Built-in theme configs duplicated for API (builtin-themes.ts)
  - findBySlug resolves and returns themeConfig for custom theme invitations
  - TemplateId widened to string for arbitrary custom theme slugs
  - CustomTheme and CustomThemeListItem types in @repo/types
  - theme-assets storage bucket for background images
affects: [11-custom-theme-builder, template-selector, editor-preview, public-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "JSONB ThemeConfig storage in custom_themes table"
    - "Public unguarded ThemesController (same pattern as PublicInvitationsController)"
    - "Vietnamese slug generation with diacritics normalization + 4-char hex suffix"
    - "Built-in themes duplicated in API to avoid cross-app imports"

key-files:
  created:
    - supabase/migrations/014_custom_themes.sql
    - apps/api/src/admin/builtin-themes.ts
    - apps/api/src/admin/dto/create-custom-theme.dto.ts
    - apps/api/src/admin/dto/update-custom-theme.dto.ts
    - apps/api/src/themes/themes.controller.ts
    - apps/api/src/themes/themes.service.ts
    - apps/api/src/themes/themes.module.ts
  modified:
    - packages/types/src/invitation.ts
    - packages/types/src/admin.ts
    - apps/api/src/admin/admin.controller.ts
    - apps/api/src/admin/admin.service.ts
    - apps/api/src/app.module.ts
    - apps/api/src/invitations/invitations.service.ts

key-decisions:
  - "Built-in theme configs duplicated in apps/api/src/admin/builtin-themes.ts to avoid cross-app imports between API and Web"
  - "TemplateId widened from union of 9 literals to plain string to support arbitrary custom theme slugs"
  - "Vietnamese diacritics normalization via character map (not NFD decomposition) for deterministic slug generation"
  - "findBySlug returns themeConfig only for custom themes (not built-in) to keep payload small"
  - "Custom theme footerBg validated to accept both hex colors and Tailwind bg- classes"
  - "Public ThemesController follows same unguarded pattern as PublicInvitationsController"

patterns-established:
  - "JSONB ThemeConfig pattern: full theme config stored as JSONB, queried and returned as-is"
  - "Custom theme clone-and-edit: always start from a base theme config, deep clone, customize"
  - "Theme resolution pipeline: check built-in THEMES first, then query custom_themes DB table"
  - "Background image upload: sharp resize 1920px max width, WebP quality 80, stored in theme-assets bucket"

requirements-completed: [CT-01, CT-02, CT-03, CT-04, CT-05, CT-10]

# Metrics
duration: 4min
completed: 2026-03-18
---

# Phase 11 Plan 01: Custom Theme Builder - Data Layer and API Summary

**custom_themes table with JSONB config, 7 admin CRUD endpoints, 2 public theme endpoints, and findBySlug theme resolution for custom theme invitations**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-17T18:35:44Z
- **Completed:** 2026-03-17T18:40:27Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Database migration creates custom_themes table, theme-assets bucket, and drops template_id CHECK constraint
- Full admin CRUD: list, get by slug, create (clone base), update (config + background image), publish (with ISR revalidation), disable, delete (with usage check)
- Public GET /themes returns published custom themes for template selector; GET /themes/:slug returns ThemeConfig for any theme
- findBySlug resolves custom theme configs server-side and includes them in API response

## Task Commits

Each task was committed atomically:

1. **Task 1: DB migration + shared types + TemplateId widening** - `8c7a97a` (feat)
2. **Task 2: NestJS admin CRUD + public themes endpoints + findBySlug resolution** - `d20313d` (feat)

## Files Created/Modified
- `supabase/migrations/014_custom_themes.sql` - custom_themes table, theme-assets bucket, DROP CHECK constraint
- `packages/types/src/invitation.ts` - TemplateId widened to string
- `packages/types/src/admin.ts` - CustomTheme, CustomThemeListItem interfaces added
- `apps/api/src/admin/builtin-themes.ts` - 6 built-in theme configs duplicated for API use
- `apps/api/src/admin/dto/create-custom-theme.dto.ts` - Validation DTO for theme creation
- `apps/api/src/admin/dto/update-custom-theme.dto.ts` - Validation DTO for theme updates
- `apps/api/src/admin/admin.controller.ts` - 7 custom theme CRUD endpoints added
- `apps/api/src/admin/admin.service.ts` - Custom theme service methods, slug generation, image upload
- `apps/api/src/themes/themes.controller.ts` - Public unguarded controller: GET /themes, GET /themes/:slug
- `apps/api/src/themes/themes.service.ts` - listPublished and getThemeConfig methods
- `apps/api/src/themes/themes.module.ts` - ThemesModule with SupabaseModule import
- `apps/api/src/app.module.ts` - ThemesModule registered
- `apps/api/src/invitations/invitations.service.ts` - findBySlug extended with themeConfig resolution

## Decisions Made
- Built-in theme configs duplicated in builtin-themes.ts rather than importing from web app (avoids cross-app dependency)
- TemplateId changed from union of 9 string literals to plain string (backward compatible, all existing code works)
- Vietnamese diacritics normalization uses explicit character map for predictable slug generation
- findBySlug returns themeConfig only for non-built-in themes to avoid payload bloat
- Custom theme footerBg accepts both hex colors and Tailwind bg- classes (built-in themes use Tailwind, custom themes use hex)
- Public ThemesController is unguarded (same pattern as PublicInvitationsController) for frontend consumption

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required. Migration needs to be run against the database.

## Next Phase Readiness
- Data layer and API complete, ready for admin UI builder (plan 11-02)
- Built-in themes constant available in API for theme cloning
- Public /themes endpoints ready for TemplateSelector integration
- findBySlug ready to serve custom theme configs to public pages

## Self-Check: PASSED

All 14 files verified present. Both task commits (8c7a97a, d20313d) verified in git log.

---
*Phase: 11-custom-theme-builder*
*Completed: 2026-03-18*
