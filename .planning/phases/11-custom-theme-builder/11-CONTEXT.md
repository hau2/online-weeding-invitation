# Phase 11: Custom Theme Builder - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin can create, edit, and publish new invitation themes from the admin panel using a data-driven system. A custom theme is a ThemeConfig (colors, background image, petals, nav style) stored in the database. Admin clones an existing theme, adjusts visual properties via a form with live preview, and publishes it. Published custom themes appear in the user's template selector alongside the 6 built-in themes. No React code needed per theme — SharedTemplate renders everything from ThemeConfig data.

</domain>

<decisions>
## Implementation Decisions

### Theme Creation Flow
- Single-page form with live preview (split-panel layout, similar to invitation editor)
- Admin always starts by cloning an existing theme (built-in or custom) — no blank canvas
- Clone pre-fills all fields; admin edits what they want to change
- Left panel: grouped form sections (info, colors, petals, nav style, background image)
- Right panel: live preview showing a sample invitation with the current settings
- Buttons: "Luu nhap" (save draft) and "Xuat ban" (publish)

### Admin-Controlled ThemeConfig Fields
- Theme name (text)
- Primary color (hex)
- Background color (hex)
- Surface color (hex)
- Text color (hex)
- Muted text color (hex)
- Background image upload (full page background, stored in Supabase Storage)
- Petal colors (4 fixed hex color swatches) + petal enabled toggle
- Nav style (colored / mono)
- Footer bg color (hex) + footer text color (hex)
- Typography fields (headingWeight, bodyWeight, letterSpacing, textTransform) inherited from base theme, NOT exposed to admin

### Color Picker
- Native HTML color picker swatch + hex text input for each color field
- No external color picker library needed
- 4 separate color swatches for petal colors with the same pattern

### Background Image
- Admin uploads image (PNG/JPG/WebP) stored in Supabase Storage `theme-assets` bucket
- Image serves as full page background behind all sections
- ThemeConfig gets new `backgroundImageUrl?: string` field
- SharedTemplate renders it as a fixed/cover background when present

### Theme Storage
- New `custom_themes` database table:
  - id: uuid PK
  - slug: text UNIQUE (auto-generated from name)
  - name: text
  - base_theme: text (which theme was cloned)
  - config: JSONB (full ThemeConfig object)
  - background_image_url: text (nullable)
  - thumbnail_url: text (nullable — for admin-uploaded thumbnails if needed)
  - status: text CHECK (draft | published | disabled)
  - created_at, updated_at timestamps
- Hardcoded themes stay in code (no migration needed for existing 6)

### Theme Resolution
- API endpoint GET /themes/:slug returns ThemeConfig for custom themes
- Resolution order: check hardcoded THEMES record first, if not found fetch from DB via API
- Custom theme config merged with base theme defaults for any missing fields
- Public page resolves custom theme at ISR/server-render time, passes ThemeConfig to SharedTemplate

### Theme Lifecycle
- **Draft**: Admin can edit, not visible in template selector
- **Published**: Visible in template selector, users can pick it
- **Disabled**: Hidden from selector, but still renders on invitations already using it (same pattern as music library ADMN-07)

### Template Selector Integration
- Custom themes appear in same grid after built-in themes, no visual distinction
- Thumbnails auto-generated from theme colors: primary color header bar + background color body + text sample in theme's text color
- No screenshot or manual thumbnail required
- TemplateSelector fetches published custom themes from API and appends to built-in list

### Claude's Discretion
- Exact split-panel layout proportions
- Background image compression/resizing before storage
- Theme slug generation algorithm
- JSONB config validation on save
- Sample invitation data for live preview
- Caching strategy for custom theme resolution (ISR revalidation vs in-memory)
- Migration details (indexes, constraints)
- Admin theme list page layout (table vs card grid)
- How to handle theme deletion (soft-delete or just disable)

</decisions>

<specifics>
## Specific Ideas

- "Admin can upload background theme image, admin can create the image from Gemini AI" — the platform doesn't generate images, but admin can use external AI tools to create background images and upload them
- Clone-and-edit is the safest creation flow — always starts from a known-good ThemeConfig
- Auto-generated color swatch thumbnails mean thumbnails are always in sync with theme config, no manual maintenance
- Disabled themes still render on existing invitations — protects couples who already published with that theme

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ThemeConfig` interface (20+ fields) already defined in `apps/web/components/templates/themes/index.ts`
- `getTheme()` resolver with fallback — extend to check DB
- `SharedTemplate` renders any ThemeConfig — no per-theme components needed
- 6 hardcoded themes as base themes for cloning
- `TemplateSelector` component in editor — extend to fetch custom themes
- Admin themes page `/admin/giao-dien` — currently manages metadata only, extend to full builder
- Supabase Storage upload pattern (via NestJS proxy) established in Phase 4
- Stitch admin design system established in Phase 15

### Established Patterns
- JSONB storage for complex config (system_settings, love_story, ceremony_program)
- ISR revalidation for public page updates
- `apiFetch` for admin API calls
- Native HTML inputs styled with Stitch patterns (Phase 15)
- Image upload via NestJS proxy to Supabase Storage

### Integration Points
- `apps/web/components/templates/themes/index.ts` — extend getTheme() for DB lookup
- `apps/web/components/templates/SharedTemplate.tsx` — add backgroundImageUrl rendering
- `apps/web/app/(admin)/admin/giao-dien/page.tsx` — replace with full theme builder
- `apps/api/src/admin/` — new theme CRUD endpoints
- `supabase/migrations/` — custom_themes table
- `packages/types/` — ThemeConfig type update (backgroundImageUrl), custom theme types

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-custom-theme-builder*
*Context gathered: 2026-03-18*
