---
phase: 11-custom-theme-builder
plan: 03
subsystem: ui, admin
tags: [react, nextjs, admin-panel, theme-builder, color-picker, live-preview, split-panel, shared-template]

# Dependency graph
requires:
  - phase: 11-custom-theme-builder
    provides: "Plan 01: custom_themes CRUD API endpoints, Plan 02: buildThemeConfig helper, SharedTemplate rendering, TemplateSelector custom themes"
  - phase: 09.1-public-page-redesign
    provides: SharedTemplate, ThemeConfig interface, getTheme() resolver
  - phase: 15-admin-panel-redesign
    provides: Stitch admin design system (dark sidebar, warm content, #ec1349 accent)
provides:
  - Admin themes list page showing built-in + custom themes with status badges and action buttons
  - "Tao moi" clone dialog to create new custom themes from any base theme
  - Split-panel theme builder page with left form (6 sections) and right live SharedTemplate preview
  - Native HTML color pickers + hex text inputs for all ThemeConfig color fields
  - Petal color configuration with enable/disable toggle
  - Nav style radio selection (colored/mono)
  - Footer color customization (background + text)
  - Background image upload with preview
  - Save draft and publish actions from builder page
  - Real-time preview updates as admin changes any field
affects: [admin-panel, custom-themes, template-selector]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ColorField component: native input[type=color] swatch + hex text input + label"
    - "Split-panel builder: scrollable form left (~55%) + sticky phone mockup preview right (~45%)"
    - "SAMPLE_INVITATION constant for live preview with Vietnamese placeholder data"
    - "FormData save with config JSON + optional background image file via apiUpload PUT"

key-files:
  created:
    - apps/web/app/(admin)/admin/giao-dien/[slug]/page.tsx
  modified:
    - apps/web/app/(admin)/admin/giao-dien/page.tsx

key-decisions:
  - "Native HTML input[type=color] for color pickers (no external library per CONTEXT.md)"
  - "SAMPLE_INVITATION constant with Vietnamese names and placeholder data for live preview"
  - "Phone mockup frame (280px wide) for right-panel preview matching EditorPreview pattern"
  - "ColorField regex validation allows partial hex input while typing (/^#[0-9a-fA-F]{0,6}$/)"

patterns-established:
  - "Admin builder split-panel: form sections left with sticky save bar, live preview right in phone mockup"
  - "Color swatch thumbnail: primaryColor top third + backgroundColor bottom two-thirds for theme cards"
  - "Clone-and-customize workflow: select base theme -> enter name -> create draft -> redirect to builder"

requirements-completed: [CT-09]

# Metrics
duration: 5min
completed: 2026-03-18
---

# Phase 11 Plan 03: Admin Theme Builder UI Summary

**Admin themes list page with built-in + custom theme grids, "Tao moi" clone dialog, and split-panel theme builder with native color pickers, petal/nav/footer config, background image upload, and live SharedTemplate preview**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-17T19:00:00Z
- **Completed:** 2026-03-17T19:05:51Z
- **Tasks:** 3 (2 auto + 1 visual verification checkpoint)
- **Files modified:** 2

## Accomplishments
- Admin themes list page redesigned with two sections: "Giao dien mac dinh" (built-in) and "Giao dien tuy chinh" (custom) with status badges (Nhap/Da xuat ban/Vo hieu hoa) and action buttons
- "Tao moi" clone dialog lets admin select a base theme and enter a name, creating a draft and redirecting to the builder
- Split-panel theme builder with 6 form sections (Info, Colors, Petals, Nav Style, Footer, Background Image) and live SharedTemplate phone mockup preview
- Real-time preview updates instantly as admin changes any color, toggle, or setting
- Save draft ("Luu nhap") and publish ("Xuat ban") buttons with FormData upload supporting config JSON + background image

## Task Commits

Each task was committed atomically:

1. **Task 1: Redesigned admin themes list page** - `9090e39` (feat)
2. **Task 2: Split-panel theme builder page** - `45c8fc6` (feat)
3. **Task 3: Visual verification checkpoint** - User approved (no code commit)

## Files Created/Modified
- `apps/web/app/(admin)/admin/giao-dien/page.tsx` - Rewritten themes list with built-in + custom sections, clone dialog, status badges, action buttons
- `apps/web/app/(admin)/admin/giao-dien/[slug]/page.tsx` - New split-panel theme builder with ColorField components, petal config, nav style, footer colors, background upload, live SharedTemplate preview

## Decisions Made
- Native HTML input[type=color] used for all color pickers (no external library, per CONTEXT.md directive)
- SAMPLE_INVITATION constant provides Vietnamese placeholder data for the live preview panel
- Phone mockup at 280px width matches the EditorPreview pattern for consistent preview experience
- ColorField hex input allows partial input while typing via regex /^#[0-9a-fA-F]{0,6}$/

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 11 (Custom Theme Builder) is now fully complete: data layer (Plan 01), rendering pipeline (Plan 02), and admin builder UI (Plan 03)
- End-to-end flow operational: admin creates theme in builder -> user selects theme in TemplateSelector -> guest views custom-themed invitation on public page
- Ready for Phase 12 (Security Hardening) or any remaining phases

## Self-Check: PASSED

All 2 task files verified present. Both task commits (9090e39, 45c8fc6) verified in git log. SUMMARY.md created successfully.

---
*Phase: 11-custom-theme-builder*
*Completed: 2026-03-18*
