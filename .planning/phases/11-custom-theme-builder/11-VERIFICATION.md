---
phase: 11-custom-theme-builder
verified: 2026-03-18T00:00:00Z
status: passed
score: 17/17 must-haves verified
---

# Phase 11: Custom Theme Builder Verification Report

**Phase Goal:** Admin can create, edit, and publish new invitation themes from the admin panel using a data-driven template system — configurable layouts, color palettes, fonts, and section ordering — without writing React code
**Verified:** 2026-03-18
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | custom_themes table exists with correct schema | VERIFIED | `supabase/migrations/014_custom_themes.sql` — all 10 columns, 2 indexes, trigger, RLS, storage bucket |
| 2 | Admin can create a custom theme by cloning a base theme | VERIFIED | `admin.service.ts:1075` createCustomTheme — resolves base config, generates slug, deep-clones, inserts draft |
| 3 | Admin can update config fields and upload background image | VERIFIED | `admin.service.ts:1130` updateCustomTheme — parses JSON config, sharp resize/WebP, uploads to theme-assets bucket |
| 4 | Admin can publish, disable, and manage lifecycle | VERIFIED | `admin.service.ts:1268,1303` publishCustomTheme + disableCustomTheme + controller endpoints wired |
| 5 | GET /themes returns published custom themes (no auth) | VERIFIED | `themes.controller.ts:19` @Get() listPublished — unguarded, queries status='published' |
| 6 | GET /themes/:slug returns ThemeConfig for any theme (no auth) | VERIFIED | `themes.controller.ts:28` @Get(':slug') — resolves built-in from BUILTIN_THEMES then custom from DB |
| 7 | template_id CHECK constraint dropped | VERIFIED | `014_custom_themes.sql:50` ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_template_id_check |
| 8 | TemplateId widened to string | VERIFIED | `packages/types/src/invitation.ts:5` export type TemplateId = string with comment listing old literals |
| 9 | CustomTheme and CustomThemeListItem types exported | VERIFIED | `packages/types/src/admin.ts:82-105` both interfaces with all required fields |
| 10 | Public invitation page resolves custom theme from API themeConfig | VERIFIED | `page.tsx:18` PublicInvitation extends with themeConfig; InvitationShell/ThankYouPage/SaveTheDatePage all use buildThemeConfig when themeConfig is present |
| 11 | TemplateSelector shows published custom themes after built-in themes | VERIFIED | `TemplateSelector.tsx:59-75` useEffect fetches `/themes`, renders color swatch thumbnails after built-in grid |
| 12 | SharedTemplate renders backgroundImageUrl as fixed full-page background | VERIFIED | `SharedTemplate.tsx:49-58` fixed inset-0 -z-10 div with CSS background-image (not background-attachment:fixed) |
| 13 | FooterSection handles both hex and Tailwind class footerBg | VERIFIED | `FooterSection.tsx:17-22` isHex = footerBg.startsWith('#'), inline style vs className conditional |
| 14 | EditorPreview resolves custom themes via public API | VERIFIED | `EditorPreview.tsx:24-39` useEffect checks THEMES[themeId], fetches /themes/:slug for custom themes |
| 15 | Admin can view themes list with built-in and custom sections | VERIFIED | `giao-dien/page.tsx` two sections — "Giao dien mac dinh" and "Giao dien tuy chinh", "Tao moi" button |
| 16 | Admin can create theme via clone dialog | VERIFIED | `giao-dien/page.tsx:153-173` handleCreate — POST /admin/custom-themes, redirect to /admin/giao-dien/[slug] |
| 17 | Theme builder has split-panel with live preview | VERIFIED | `giao-dien/[slug]/page.tsx` 55% form left + 45% preview right, SharedTemplate renders from local config state |

**Score:** 17/17 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/014_custom_themes.sql` | custom_themes table, theme-assets bucket, DROP CHECK | VERIFIED | All columns, CHECK, RLS, indexes, trigger, storage insert, storage policy, ALTER TABLE |
| `packages/types/src/admin.ts` | CustomTheme and CustomThemeListItem types | VERIFIED | Both interfaces present with all required fields |
| `packages/types/src/invitation.ts` | TemplateId = string | VERIFIED | `export type TemplateId = string` with backward-compat comment |
| `apps/api/src/admin/builtin-themes.ts` | 6 built-in theme configs for API use | VERIFIED | All 6 themes, LEGACY_MAP, BUILTIN_IDS, resolveBuiltinTheme() |
| `apps/api/src/admin/dto/create-custom-theme.dto.ts` | CreateCustomThemeDto | VERIFIED | name + baseTheme with validators |
| `apps/api/src/admin/dto/update-custom-theme.dto.ts` | UpdateCustomThemeDto | VERIFIED | name, config (JSON string), status with @IsIn |
| `apps/api/src/themes/themes.controller.ts` | Public ThemesController, GET /themes, GET /themes/:slug | VERIFIED | Unguarded, two endpoints wired to ThemesService |
| `apps/api/src/themes/themes.service.ts` | listPublished + getThemeConfig | VERIFIED | Queries custom_themes, resolves built-in via BUILTIN_THEMES before DB |
| `apps/api/src/themes/themes.module.ts` | ThemesModule with SupabaseModule | VERIFIED | Imports SupabaseModule, exports ThemesService |
| `apps/api/src/app.module.ts` | ThemesModule registered | VERIFIED | ThemesModule in @Module imports array |
| `apps/api/src/admin/admin.controller.ts` | 7 custom theme CRUD endpoints | VERIFIED | All 7 endpoints (list, get, create, update, publish, disable, delete) in Custom Theme Management section |
| `apps/api/src/admin/admin.service.ts` | All service methods implemented | VERIFIED | All 7 methods at lines 1036-1361 with real DB queries, not stubs |
| `apps/api/src/invitations/invitations.service.ts` | findBySlug returns themeConfig | VERIFIED | Line 442 signature includes themeConfig; lines 519-543 resolve custom theme and include in response |
| `apps/web/components/templates/themes/index.ts` | buildThemeConfig helper, backgroundImageUrl on ThemeConfig | VERIFIED | buildThemeConfig at line 94, backgroundImageUrl?: string on interface at line 45 |
| `apps/web/components/templates/SharedTemplate.tsx` | Background image fixed layer | VERIFIED | Lines 49-58: fixed inset-0 -z-10 div rendered when theme.backgroundImageUrl present |
| `apps/web/components/templates/sections/FooterSection.tsx` | Dual-format footerBg | VERIFIED | isHex check, conditional className vs inline style |
| `apps/web/app/w/[slug]/page.tsx` | themeConfig passed to child components | VERIFIED | PublicInvitation type includes themeConfig; passed to InvitationShell, ThankYouPage, SaveTheDatePage |
| `apps/web/app/w/[slug]/InvitationShell.tsx` | buildThemeConfig used for custom themes | VERIFIED | Line 52: buildThemeConfig(themeConfig) when themeConfig present, else getTheme() |
| `apps/web/app/w/[slug]/ThankYouPage.tsx` | Custom theme resolution | VERIFIED | Line 22: same pattern as InvitationShell |
| `apps/web/app/w/[slug]/SaveTheDatePage.tsx` | Custom theme resolution | VERIFIED | Line 25: same pattern as InvitationShell |
| `apps/web/app/(app)/thep-cuoi/[id]/TemplateSelector.tsx` | Fetches and renders custom themes | VERIFIED | useEffect fetches /themes, color swatch thumbnails rendered after built-in grid |
| `apps/web/app/(app)/thep-cuoi/[id]/EditorPreview.tsx` | Custom theme resolution via API | VERIFIED | useEffect resolves custom themes via /themes/:slug |
| `apps/web/app/(admin)/admin/giao-dien/page.tsx` | Themes list with "Tao moi" clone dialog | VERIFIED | Two sections, clone dialog (newThemeName, newBaseTheme state), POST /admin/custom-themes |
| `apps/web/app/(admin)/admin/giao-dien/[slug]/page.tsx` | Split-panel theme builder | VERIFIED | 55/45 split, 6 form sections, SharedTemplate live preview from config state |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `admin.controller.ts` | `admin.service.ts` | 7 custom-theme CRUD methods | WIRED | All 7 endpoints call corresponding service methods |
| `admin.service.ts` | `custom_themes` table | SupabaseAdminService queries | WIRED | `from('custom_themes')` in listCustomThemes, getCustomTheme, createCustomTheme, updateCustomTheme, publishCustomTheme, disableCustomTheme, deleteCustomTheme |
| `themes.controller.ts` | `themes.service.ts` | listPublished, getThemeConfig | WIRED | Constructor injection, both methods called |
| `app.module.ts` | `ThemesModule` | @Module imports | WIRED | ThemesModule registered in AppModule |
| `page.tsx (w/[slug])` | `InvitationShell` | themeConfig prop | WIRED | `<InvitationShell invitation={invitation} themeConfig={invitation.themeConfig} />` |
| `InvitationShell.tsx` | `SharedTemplate` | resolved theme prop | WIRED | Line 52 resolves theme, passed to SharedTemplate and StickyNav |
| `TemplateSelector.tsx` | `GET /themes` | fetch in useEffect | WIRED | `fetch(\`${API_URL}/themes\`)` on mount, results stored in customThemes state and rendered |
| `EditorPreview.tsx` | `GET /themes/:slug` | fetch in useEffect | WIRED | `fetch(\`${API_URL}/themes/${invitation.templateId}\`)` for non-built-in themes |
| `giao-dien/page.tsx` | `/admin/custom-themes` | apiFetch for list, create | WIRED | listCustomThemes on mount, POST on handleCreate |
| `giao-dien/[slug]/page.tsx` | `/admin/custom-themes/:id` | apiFetch get, apiUpload update | WIRED | GET on mount, PUT on handleSave |
| `giao-dien/[slug]/page.tsx` | `SharedTemplate` | live preview with config state | WIRED | `<SharedTemplate invitation={SAMPLE_INVITATION} theme={config} />` using local state |
| `giao-dien/[slug]/page.tsx` | `buildThemeConfig` | converts JSONB to ThemeConfig | WIRED | `buildThemeConfig(data.config)` on load, updateConfig() for real-time state |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CT-01 | 11-01 | custom_themes table with correct schema | SATISFIED | `014_custom_themes.sql` — all columns, status CHECK, indexes, trigger, RLS |
| CT-02 | 11-01 | Admin can create a custom theme by cloning | SATISFIED | `admin.service.ts:1075` createCustomTheme clones base config, generates slug |
| CT-03 | 11-01 | Admin can update config and upload background image | SATISFIED | `admin.service.ts:1130` updateCustomTheme parses config JSON, processes image with sharp |
| CT-04 | 11-01 | Admin can publish and disable custom themes | SATISFIED | `admin.service.ts:1268,1303` publishCustomTheme + disableCustomTheme |
| CT-05 | 11-01 | GET /themes/:slug returns ThemeConfig (public) | SATISFIED | `themes.service.ts:35` getThemeConfig — built-in first, then custom_themes DB query |
| CT-06 | 11-02 | Public page resolves and renders custom themes | SATISFIED | `page.tsx`, `InvitationShell.tsx`, `ThankYouPage.tsx`, `SaveTheDatePage.tsx` — all use buildThemeConfig when themeConfig present |
| CT-07 | 11-02 | TemplateSelector shows published custom themes | SATISFIED | `TemplateSelector.tsx:59-75` — fetches /themes, renders color swatches after built-in |
| CT-08 | 11-02 | SharedTemplate renders backgroundImageUrl as fixed layer | SATISFIED | `SharedTemplate.tsx:49-58` — fixed inset-0 div, no background-attachment:fixed (iOS Safari safe) |
| CT-09 | 11-03 | Theme builder split-panel with live preview | SATISFIED | `giao-dien/[slug]/page.tsx` — 6 form sections, SharedTemplate right panel, real-time config state |
| CT-10 | 11-01 | template_id CHECK constraint dropped | SATISFIED | `014_custom_themes.sql:50` — ALTER TABLE invitations DROP CONSTRAINT |

All 10 requirements mapped to Phase 11 plans are SATISFIED.

---

### Anti-Patterns Found

No blocker or warning anti-patterns detected.

Scanned for: TODO/FIXME/placeholder comments, `return null` stubs, empty handlers, console.log-only implementations across all 24 artifacts. None found in core custom theme builder paths.

One design-level note (informational only): the builder page's "Xuat ban" button calls `updateCustomTheme` (PUT) which sets `status='published'` in the update, then separately calls `publishCustomTheme` (POST /:id/publish). This double-call is slightly redundant — the PUT already sets the status — but the second call triggers ISR revalidation, which is intentional behavior. No correctness issue.

---

### Human Verification Required

The following items require visual/browser verification and cannot be verified programmatically:

#### 1. Live preview real-time updates

**Test:** On `/admin/giao-dien/[slug]`, change the primaryColor via the color picker.
**Expected:** The SharedTemplate phone mockup on the right updates the primary color immediately without any save or debounce.
**Why human:** React state flow is wired correctly in code but actual rendering can only be confirmed in browser.

#### 2. Background image fixed positioning on iOS Safari

**Test:** On a published invitation that uses a custom theme with backgroundImageUrl, open the page on an iOS device or Safari browser and scroll.
**Expected:** The background image stays fixed/pinned as content scrolls over it. The image does NOT jump or create a parallax scroll bug.
**Why human:** The `position: fixed` div approach is coded correctly but iOS Safari rendering bugs require device testing.

#### 3. TemplateSelector custom themes visible to non-admin users

**Test:** Log out of admin. Create an invitation as a regular user. Open the TemplateSelector (template tab in editor).
**Expected:** Published custom themes appear as color swatch thumbnails after the 6 built-in themes. No auth error in console.
**Why human:** The public endpoint works without auth in code, but CORS and API_URL configuration in the deployed environment must be verified.

#### 4. Color picker hex input partial typing

**Test:** In the builder page, click the hex text input for primaryColor. Delete characters one by one until the field shows just `#`.
**Expected:** The input accepts partial hex input (e.g., `#e`, `#ec`, `#ec1`) without throwing an error or resetting to the previous value.
**Why human:** The regex `/^#[0-9a-fA-F]{0,6}$/` allows this but input focus/blur behavior needs visual confirmation.

---

## Commit Verification

All 6 commits documented in SUMMARY files verified present in git history:
- `8c7a97a` feat(11-01): DB migration, shared types, and TemplateId widening
- `d20313d` feat(11-01): admin CRUD, public themes endpoints, findBySlug theme resolution
- `e445c42` feat(11-02): theme resolution pipeline, background image, and dual-format footer
- `5712cf5` feat(11-02): TemplateSelector custom themes and EditorPreview custom theme resolution
- `9090e39` feat(11-03): redesign admin themes page with built-in + custom theme sections and clone dialog
- `45c8fc6` feat(11-03): add split-panel theme builder with live SharedTemplate preview

---

## Summary

Phase 11 goal is fully achieved. All three plans delivered their stated outputs:

**Plan 01 (Data Layer + API):** Migration creates the custom_themes table with correct schema. All 7 admin CRUD endpoints are substantive (real DB queries, not stubs). The 2 public theme endpoints are unguarded. findBySlug correctly includes themeConfig for custom theme invitations. TemplateId is widened to string. CustomTheme/CustomThemeListItem types are exported.

**Plan 02 (Frontend Rendering Pipeline):** buildThemeConfig helper correctly casts raw JSONB with modern-red defaults. SharedTemplate renders background images as a position:fixed div (iOS Safari safe). FooterSection correctly detects hex vs Tailwind class via startsWith('#'). TemplateSelector fetches and renders custom themes from the public endpoint. EditorPreview resolves custom themes asynchronously via public API.

**Plan 03 (Admin Builder UI):** The themes list page shows both sections with status badges and the "Tao moi" clone dialog. The theme builder page has a real split-panel layout (55/45), 6 complete form sections (Info, Colors, Petals, Nav, Footer, Background Image), native color pickers with hex inputs, and a live SharedTemplate preview wired directly to local config state with zero debounce.

---

_Verified: 2026-03-18_
_Verifier: Claude (gsd-verifier)_
