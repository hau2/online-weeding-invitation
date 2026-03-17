# Phase 11: Custom Theme Builder - Research

**Researched:** 2026-03-18
**Domain:** Admin theme builder, JSONB config storage, Supabase Storage image upload, live preview rendering, theme resolution pipeline
**Confidence:** HIGH

## Summary

Phase 11 extends the existing data-driven theme system (6 hardcoded `ThemeConfig` objects rendered by `SharedTemplate`) to support admin-created custom themes stored in a `custom_themes` database table with JSONB config. The architecture is straightforward: a new DB table stores full `ThemeConfig` as JSONB, the `getTheme()` resolver is extended with an async DB fallback, and a new admin builder page provides a split-panel form+preview UI for creating/editing themes.

All core building blocks already exist: `ThemeConfig` interface (20+ visual fields), `SharedTemplate` rendering any config, `TemplateSelector` grid in the editor, admin CRUD patterns with `SupabaseAdminService`, image upload via NestJS proxy to Supabase Storage, and the Stitch admin design system from Phase 15. The main new work is the `custom_themes` table migration, CRUD API endpoints, the builder form with color pickers and live preview, background image upload to a new `theme-assets` bucket, extending `getTheme()` for DB lookups, and updating `TemplateSelector` to fetch published custom themes.

**Primary recommendation:** Build bottom-up: migration and types first, then API CRUD, then `getTheme()` extension with API endpoint for public resolution, then the admin builder UI with live preview, then `TemplateSelector` integration. The background image rendering in `SharedTemplate` is a small CSS change that can ship with the builder.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Single-page form with live preview (split-panel layout, similar to invitation editor)
- Admin always starts by cloning an existing theme (built-in or custom) -- no blank canvas
- Clone pre-fills all fields; admin edits what they want to change
- Left panel: grouped form sections (info, colors, petals, nav style, background image)
- Right panel: live preview showing a sample invitation with the current settings
- Buttons: "Luu nhap" (save draft) and "Xuat ban" (publish)
- Admin-controlled ThemeConfig fields: theme name, primaryColor, backgroundColor, surfaceColor, textColor, mutedTextColor, background image upload, petal colors (4 hex) + petal enabled toggle, nav style (colored/mono), footerBg color + footerTextColor
- Typography fields (headingWeight, bodyWeight, letterSpacing, textTransform) inherited from base theme, NOT exposed to admin
- Native HTML color picker swatch + hex text input for each color field, no external color picker library
- 4 separate color swatches for petal colors with the same pattern
- Background image stored in Supabase Storage `theme-assets` bucket (PNG/JPG/WebP)
- Background image serves as full page background behind all sections
- ThemeConfig gets new `backgroundImageUrl?: string` field
- SharedTemplate renders background image as fixed/cover background when present
- New `custom_themes` database table with: id (uuid PK), slug (text UNIQUE), name (text), base_theme (text), config (JSONB), background_image_url (text nullable), thumbnail_url (text nullable), status (text CHECK draft|published|disabled), created_at, updated_at timestamps
- Hardcoded themes stay in code (no migration needed for existing 6)
- API endpoint GET /themes/:slug returns ThemeConfig for custom themes
- Resolution order: check hardcoded THEMES record first, if not found fetch from DB via API
- Custom theme config merged with base theme defaults for any missing fields
- Public page resolves custom theme at ISR/server-render time
- Theme lifecycle: Draft (editable, not in selector), Published (in selector), Disabled (hidden from selector but still renders on existing invitations)
- Custom themes appear in same grid after built-in themes, no visual distinction
- Thumbnails auto-generated from theme colors: primary color header bar + background color body + text sample
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

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Supabase JS | existing | DB operations, Storage uploads | Already used throughout, SupabaseAdminService pattern |
| NestJS | existing | API endpoints with JwtGuard + AdminGuard | Class-level guards on AdminController established |
| Next.js 15 | existing | Admin pages, ISR for public page | Existing SSR/ISR patterns |
| sharp | existing | Background image compression | Already used for photo/avatar processing |
| magic-bytes.js | existing | MIME validation for uploads | Established pattern in music/photo upload |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| class-validator | existing | DTO validation for theme CRUD | NestJS DTO pattern already established |
| lucide-react | existing | Icons in admin UI | All admin pages use lucide icons |
| sonner | existing | Toast notifications | Admin feedback pattern |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native HTML color input | react-colorful or react-color | CONTEXT.md explicitly locks native HTML picker + hex input |
| Canvas thumbnail generation | Server-side screenshot | Auto-generated color swatch thumbnails are simpler, always in sync |
| Separate theme microservice | Extending AdminService | Single-module approach consistent with existing admin patterns |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
supabase/migrations/
  014_custom_themes.sql              # custom_themes table + theme-assets bucket

packages/types/src/
  admin.ts                           # CustomTheme, CustomThemeListItem types

apps/api/src/admin/
  admin.controller.ts                # Extended with custom theme CRUD endpoints
  admin.service.ts                   # Extended with custom theme methods
  dto/create-custom-theme.dto.ts     # Validation DTO for theme creation
  dto/update-custom-theme.dto.ts     # Validation DTO for theme updates

apps/api/src/invitations/
  invitations.service.ts             # No changes (template_id stays as-is)

apps/web/components/templates/themes/
  index.ts                           # getTheme() extended with async variant getThemeAsync()

apps/web/app/(admin)/admin/giao-dien/
  page.tsx                           # Theme list (existing + custom) with "Tao moi" button
  [slug]/page.tsx                    # Theme builder (split-panel form + preview)

apps/web/app/(app)/thep-cuoi/[id]/
  TemplateSelector.tsx               # Extended to fetch + display custom themes
```

### Pattern 1: JSONB ThemeConfig Storage
**What:** Store the complete ThemeConfig object as JSONB in `custom_themes.config` column. The `backgroundImageUrl` field lives both in the JSONB config and as a top-level column for easier querying.
**When to use:** Any time the config shape matches an existing TypeScript interface.
**Example:**
```typescript
// DB row shape
interface CustomThemeRow {
  id: string
  slug: string
  name: string
  base_theme: string
  config: ThemeConfig  // Full JSONB blob
  background_image_url: string | null
  thumbnail_url: string | null
  status: 'draft' | 'published' | 'disabled'
  created_at: string
  updated_at: string
}
```

### Pattern 2: Theme Resolution Pipeline
**What:** Two-tier resolution: synchronous for built-in themes, async API call for custom themes. Public page server component fetches theme config at render time.
**When to use:** Any theme ID not found in the hardcoded THEMES record.
**Example:**
```typescript
// Synchronous for built-in themes (existing behavior)
export function getTheme(templateId: string): ThemeConfig {
  const themeId = LEGACY_MAP[templateId] ?? templateId
  return THEMES[themeId as ThemeId] ?? THEMES['modern-red']
}

// New: API endpoint returns ThemeConfig for any theme (custom or built-in)
// GET /themes/:slug -> ThemeConfig JSON
// InvitationShell and TemplateRenderer can call this for custom themes

// New: async variant for server components / getTheme fallback
export async function getThemeAsync(templateId: string): Promise<ThemeConfig> {
  // 1. Check hardcoded THEMES first (fast path)
  const themeId = LEGACY_MAP[templateId] ?? templateId
  if (THEMES[themeId as ThemeId]) return THEMES[themeId as ThemeId]

  // 2. Fetch from API for custom themes
  const res = await fetch(`${API_URL}/themes/${templateId}`)
  if (res.ok) return res.json()

  // 3. Fallback
  return THEMES['modern-red']
}
```

### Pattern 3: Clone-and-Edit Theme Creation
**What:** Admin picks a base theme (built-in or existing custom), API deep-clones the ThemeConfig JSONB, creates a draft record. Admin then edits fields via the builder form.
**When to use:** Every new custom theme starts this way -- no blank canvas.
**Example:**
```typescript
// POST /admin/custom-themes { baseTheme: 'modern-red', name: 'Hoa hong do' }
// Service:
// 1. Resolve base theme config (built-in or custom)
// 2. Deep clone config, set new name/id
// 3. Generate slug from name
// 4. Insert into custom_themes with status='draft'
// 5. Return the new record
```

### Pattern 4: Split-Panel Builder UI
**What:** Admin builder page with left form panel (grouped sections) and right preview panel (SharedTemplate with sample data). Form changes update local state immediately, preview re-renders in real-time.
**When to use:** The single builder page at `/admin/giao-dien/[slug]`.
**Example:**
```typescript
// Left panel: ~50-60% width, scrollable form sections
// Right panel: ~40-50% width, fixed/sticky SharedTemplate preview
// Similar to the editor's EditorPreview pattern but for theme config instead of invitation data

function ThemeBuilder({ theme }: { theme: CustomThemeRow }) {
  const [config, setConfig] = useState<ThemeConfig>(theme.config)

  // Sample invitation data for preview (static, not from DB)
  const sampleInvitation = useMemo(() => buildSampleInvitation(), [])

  return (
    <div className="flex gap-6">
      <div className="flex-1 overflow-y-auto">
        <ThemeBuilderForm config={config} onChange={setConfig} />
      </div>
      <div className="w-[400px] sticky top-0">
        <SharedTemplate invitation={sampleInvitation} theme={config} />
      </div>
    </div>
  )
}
```

### Pattern 5: Background Image in SharedTemplate
**What:** When `ThemeConfig.backgroundImageUrl` is present, SharedTemplate renders a fixed, cover background behind all content. This is a page-level background, not per-section.
**When to use:** Any theme (custom or built-in if extended later) with a background image.
**Example:**
```typescript
// In SharedTemplate's root div, add:
{theme.backgroundImageUrl && (
  <div
    className="fixed inset-0 -z-10"
    style={{
      backgroundImage: `url(${theme.backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}
  />
)}
```

### Pattern 6: Auto-Generated Color Swatch Thumbnails
**What:** Instead of screenshots, generate simple CSS-based thumbnails from theme colors. Primary color header bar + background color body + text color sample. Rendered client-side via inline styles.
**When to use:** TemplateSelector grid items for custom themes.
**Example:**
```typescript
function ThemeThumbnail({ config }: { config: ThemeConfig }) {
  return (
    <div className="w-full aspect-[3/4] rounded-md overflow-hidden border-2">
      <div className="h-1/3" style={{ backgroundColor: config.primaryColor }} />
      <div className="h-2/3 flex items-center justify-center p-2"
           style={{ backgroundColor: config.backgroundColor }}>
        <span className="text-xs font-medium" style={{ color: config.textColor }}>
          {config.name}
        </span>
      </div>
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Modifying hardcoded theme files for custom themes:** Custom themes are DB-only. Never generate .ts files from admin input.
- **Synchronous DB calls in getTheme():** The existing synchronous `getTheme()` stays synchronous for built-in themes. Custom theme resolution must be async via API or server-side fetch.
- **Storing Tailwind classes in custom theme config:** Custom themes should use hex colors and simple values. Tailwind classes like `bg-white` in footerBg work for built-in themes but custom themes should use hex `#ffffff` and render with inline styles. The `footerBg` field for custom themes should store a hex color, not a Tailwind class.
- **Direct browser-to-Supabase uploads:** All uploads go through NestJS proxy (established pattern from Phase 4).
- **Removing the template_id CHECK constraint immediately:** Instead, either drop the CHECK entirely or alter it to allow any text value, since custom theme slugs are arbitrary strings.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image compression | Custom compression | sharp (existing) | Already handles JPEG/PNG/WebP with quality control |
| MIME validation | Extension-based check | magic-bytes.js (existing) | Magic byte validation prevents disguised file attacks |
| Color validation | Custom regex | Simple hex regex `/^#[0-9a-fA-F]{6}$/` | Only 6-digit hex needed, no need for a library |
| Slug generation | Complex algorithm | Normalize name + random suffix (existing pattern) | InvitationsService.generateSlug pattern works |
| Theme config defaults | Manual field checking | Object spread with base theme | `{ ...baseThemeConfig, ...customOverrides }` handles missing fields |
| Live preview | Custom rendering engine | SharedTemplate (existing) | Already renders any ThemeConfig -- just pass the config object |

**Key insight:** The entire rendering pipeline already exists. SharedTemplate + ThemeConfig is the exact abstraction needed. The builder just needs to produce valid ThemeConfig objects and persist them.

## Common Pitfalls

### Pitfall 1: template_id CHECK Constraint Blocks Custom Theme Slugs
**What goes wrong:** The `invitations` table has a CHECK constraint that only allows the 9 known template_id values. When a user selects a custom theme, the slug (e.g., "hoa-hong-do-a3f1") will fail the CHECK.
**Why it happens:** Migration 011 hardcoded the allowed values in a CHECK constraint.
**How to avoid:** The migration MUST either drop the CHECK constraint entirely or alter it to be more permissive. Recommended: drop the constraint since theme validation now happens at the application level (getTheme resolves or falls back).
**Warning signs:** INSERT/UPDATE on invitations with custom theme slug fails with CHECK violation.

### Pitfall 2: footerBg Uses Tailwind Classes in Built-in Themes
**What goes wrong:** Built-in themes store `footerBg` as Tailwind classes like `bg-white` or `bg-neutral-900`. Custom themes would need to store hex colors since admin enters colors via picker. SharedTemplate's FooterSection must handle both formats.
**Why it happens:** Phase 9.1 used Tailwind class strings for theme config fields.
**How to avoid:** For custom themes, store footerBg as a hex color string. In FooterSection, detect whether footerBg starts with `bg-` (Tailwind class) or `#` (hex color) and render accordingly. Built-in themes continue to work unchanged.
**Warning signs:** Footer background color not rendering for custom themes.

### Pitfall 3: Synchronous getTheme() Cannot Fetch from DB
**What goes wrong:** The existing `getTheme()` is synchronous and used in multiple places (`InvitationShell`, `TemplateRenderer`, `ThankYouPage`, `SaveTheDatePage`). It cannot make async API calls.
**Why it happens:** Theme resolution was designed for a fixed set of in-memory themes.
**How to avoid:** Two approaches -- (a) the public page server component (`page.tsx`) pre-fetches the theme config from API and passes it down as a prop, or (b) the API's `findBySlug` response includes the resolved ThemeConfig. Approach (b) is cleaner: API resolves theme config and returns it alongside invitation data, so the client never needs async theme resolution.
**Warning signs:** Custom theme invitations showing fallback modern-red instead of their actual theme.

### Pitfall 4: TemplateId Type Union Breaks with Custom Slugs
**What goes wrong:** `TemplateId` in `packages/types` is a union of 9 literal strings. Custom theme slugs are arbitrary strings that don't match this union. TypeScript errors everywhere.
**Why it happens:** The type was designed for a fixed set of templates.
**How to avoid:** Either widen `TemplateId` to `string` (simplest) or make the invitation's `templateId` field accept `TemplateId | string` and cast appropriately. Recommendation: widen to `string` since the set is now open-ended. The `Invitation.templateId` type becomes `string`.
**Warning signs:** TypeScript errors when setting templateId to a custom theme slug.

### Pitfall 5: Background Image Not Fixed on Mobile Safari
**What goes wrong:** `background-attachment: fixed` does not work on iOS Safari (WebKit limitation). The background image will scroll with content instead of staying fixed.
**Why it happens:** iOS Safari does not support `background-attachment: fixed` on non-root elements.
**How to avoid:** Use a `position: fixed` div with `inset: 0` and `z-index: -1` instead of CSS background-attachment. This renders the image as a separate fixed layer.
**Warning signs:** Background image scrolls with content on iPhone/iPad.

### Pitfall 6: ISR Caching Shows Stale Theme After Edit
**What goes wrong:** After admin edits a custom theme, public pages using that theme still show the old version due to ISR caching.
**Why it happens:** ISR revalidation is tag-based per invitation slug, not per theme.
**How to avoid:** When a custom theme is updated, trigger ISR revalidation for all invitations using that theme. Or, fetch theme config fresh in the API (not cached in Next.js) and let ISR handle the page-level cache. Since the API call to `findBySlug` resolves theme config server-side, ISR revalidation of the invitation page will pick up theme changes within the revalidation window (1 hour default).
**Warning signs:** Theme color changes not reflecting on public pages for up to 1 hour.

### Pitfall 7: Large JSONB Config Without Validation
**What goes wrong:** Admin submits malformed config (missing required fields, invalid color format, XSS in text fields). SharedTemplate renders broken or unsafe content.
**Why it happens:** JSONB accepts any valid JSON -- no schema enforcement at DB level.
**How to avoid:** Validate ThemeConfig at the API level using a DTO with class-validator decorators. Validate hex colors with regex, string lengths, enum values for navStyle. Merge with base theme defaults server-side to ensure completeness.
**Warning signs:** Custom themes rendering with missing colors or broken layouts.

## Code Examples

Verified patterns from existing codebase:

### Migration Pattern (from 009_admin_panel.sql)
```sql
-- custom_themes table
CREATE TABLE IF NOT EXISTS public.custom_themes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  base_theme           TEXT NOT NULL,
  config               JSONB NOT NULL DEFAULT '{}'::jsonb,
  background_image_url TEXT DEFAULT NULL,
  thumbnail_url        TEXT DEFAULT NULL,
  status               TEXT NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft', 'published', 'disabled')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.custom_themes ENABLE ROW LEVEL SECURITY;
-- No user-facing RLS policies -- service role only (same as system_settings)

CREATE INDEX idx_custom_themes_status ON public.custom_themes(status);
CREATE INDEX idx_custom_themes_slug ON public.custom_themes(slug);

-- Trigger for updated_at (reuse existing function)
CREATE TRIGGER custom_themes_updated_at
  BEFORE UPDATE ON public.custom_themes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket for theme background images
INSERT INTO storage.buckets (id, name, public)
  VALUES ('theme-assets', 'theme-assets', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for theme assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'theme-assets');

-- Drop template_id CHECK constraint (custom themes have arbitrary slugs)
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_template_id_check;
```

### Admin CRUD Endpoint Pattern (from existing admin.controller.ts)
```typescript
// In AdminController -- follows existing patterns:
@Post('custom-themes')
@UseInterceptors(FileInterceptor('backgroundImage'))
createCustomTheme(
  @Body() dto: CreateCustomThemeDto,
  @UploadedFile() backgroundImageFile?: Express.Multer.File,
) {
  return this.adminService.createCustomTheme(dto, backgroundImageFile)
}

@Put('custom-themes/:id')
@UseInterceptors(FileInterceptor('backgroundImage'))
updateCustomTheme(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: UpdateCustomThemeDto,
  @UploadedFile() backgroundImageFile?: Express.Multer.File,
) {
  return this.adminService.updateCustomTheme(id, dto, backgroundImageFile)
}
```

### Storage Upload Pattern (from admin.service.ts uploadMusicTrack)
```typescript
// Background image upload follows the same pattern:
const storagePath = `${themeId}/background.webp`
const { error: uploadError } = await client.storage
  .from('theme-assets')
  .upload(storagePath, processedBuffer, {
    contentType: 'image/webp',
    upsert: true,  // Replace existing
  })
const { data: urlData } = client.storage
  .from('theme-assets')
  .getPublicUrl(storagePath)
```

### Color Picker Pattern (native HTML, per CONTEXT.md)
```typescript
function ColorField({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (hex: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-[#e6dbde] cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
            onChange(e.target.value)
          }
        }}
        className="w-24 rounded-lg border border-[#e6dbde] px-3 py-1.5 text-sm font-mono"
        placeholder="#000000"
      />
      <span className="text-xs text-[#89616b]">{label}</span>
    </div>
  )
}
```

### Theme Resolution at API Level (recommended approach)
```typescript
// In InvitationsService.findBySlug, after mapping the invitation:
// Resolve theme config for the response
let themeConfig = null
// Check if it's a custom theme (not in hardcoded list)
if (!BUILTIN_THEME_IDS.includes(row.template_id)) {
  const { data: customTheme } = await client
    .from('custom_themes')
    .select('config')
    .eq('slug', row.template_id)
    .single()
  if (customTheme) {
    themeConfig = customTheme.config
  }
}
// Return alongside invitation: { ...mapped, themeConfig }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded ThemeConfig in .ts files | Same + JSONB custom themes in DB | Phase 11 | Themes become admin-extensible |
| Fixed TemplateId union type | Open `string` type for templateId | Phase 11 | Allows arbitrary custom theme slugs |
| Synchronous getTheme() only | getTheme() + API-resolved for custom | Phase 11 | Public pages resolve custom themes server-side |
| theme_config in system_settings JSONB | Metadata stays in system_settings, full configs in custom_themes table | Phase 11 | Proper relational storage for complex configs |

**Deprecated/outdated:**
- template_id CHECK constraint on invitations: Must be dropped. Custom theme slugs are arbitrary.
- TemplateId union type: Must be widened to `string` or replaced.

## Open Questions

1. **Should the API resolve ThemeConfig and include it in findBySlug response, or should the client fetch it separately?**
   - What we know: findBySlug already enriches the response with musicUrl, watermarkText, etc. Adding themeConfig follows the same pattern.
   - What's unclear: Whether including the full ThemeConfig in every findBySlug response adds too much payload for built-in themes that the client already has.
   - Recommendation: Include themeConfig in findBySlug response ONLY for custom themes (non-built-in). Client checks if themeConfig is present in the response; if yes, use it; if no, resolve locally from hardcoded THEMES. This keeps built-in theme resolution fast and avoids bloating the response.

2. **How to handle footerBg format difference between built-in (Tailwind class) and custom (hex color)?**
   - What we know: Built-in themes use `bg-white`, `bg-neutral-900`, `bg-amber-50` for footerBg. Custom themes will store `#ffffff`, `#171717`, etc.
   - What's unclear: Whether to migrate built-in themes to hex or handle both formats.
   - Recommendation: Handle both formats in FooterSection. Detect hex (`#`) vs Tailwind class (`bg-`) and apply via style vs className respectively. Don't modify built-in themes.

3. **Theme slug generation algorithm?**
   - Recommendation: Reuse the same normalize + random suffix pattern from InvitationsService.generateSlug. Normalize theme name (strip Vietnamese diacritics, lowercase, hyphenate) + 4-char random suffix. Example: "Hoa hong do" -> "hoa-hong-do-a3f1".

4. **Background image compression strategy?**
   - Recommendation: Reuse `sharp` pipeline. Resize to max 1920px width (full-page background), convert to WebP quality 80. Same pattern as processImage but with larger max width.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest (existing in both apps/api and apps/web) |
| Config file | `apps/api/vitest.config.ts` and `apps/web/vitest.config.ts` |
| Quick run command | `cd apps/api && npx vitest run --reporter=verbose` |
| Full suite command | `cd apps/api && npx vitest run && cd ../../apps/web && npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CT-01 | custom_themes table created with correct schema | migration | Manual SQL verification | N/A |
| CT-02 | Admin can create custom theme by cloning base theme | unit | `cd apps/api && npx vitest run src/admin/__tests__/custom-themes.spec.ts -x` | Wave 0 |
| CT-03 | Admin can update custom theme config and background image | unit | `cd apps/api && npx vitest run src/admin/__tests__/custom-themes.spec.ts -x` | Wave 0 |
| CT-04 | Admin can publish/disable custom themes | unit | `cd apps/api && npx vitest run src/admin/__tests__/custom-themes.spec.ts -x` | Wave 0 |
| CT-05 | GET /themes/:slug returns ThemeConfig for custom themes | unit | `cd apps/api && npx vitest run src/admin/__tests__/custom-themes.spec.ts -x` | Wave 0 |
| CT-06 | getTheme resolves custom themes via API fallback | unit | `cd apps/web && npx vitest run __tests__/components/themes.test.tsx -x` | Extend existing |
| CT-07 | TemplateSelector shows custom themes after built-in ones | unit | `cd apps/web && npx vitest run __tests__/components/TemplateSelector.test.tsx -x` | Extend existing |
| CT-08 | ThemeConfig.backgroundImageUrl renders as fixed background | unit | `cd apps/web && npx vitest run __tests__/components/shared-template.test.tsx -x` | Extend existing |
| CT-09 | Theme builder form updates config in real-time | unit | `cd apps/web && npx vitest run __tests__/components/ThemeBuilder.test.tsx -x` | Wave 0 |
| CT-10 | Template ID CHECK constraint dropped (custom slugs accepted) | migration | Manual SQL verification | N/A |

### Sampling Rate
- **Per task commit:** `cd apps/api && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd apps/api && npx vitest run && cd ../../apps/web && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/api/src/admin/__tests__/custom-themes.spec.ts` -- covers CT-02, CT-03, CT-04, CT-05
- [ ] `apps/web/__tests__/components/ThemeBuilder.test.tsx` -- covers CT-09
- [ ] Extend `apps/web/__tests__/components/themes.test.tsx` -- covers CT-06 (async getTheme)
- [ ] Extend `apps/web/__tests__/components/TemplateSelector.test.tsx` -- covers CT-07 (custom themes in grid)
- [ ] Extend `apps/web/__tests__/components/shared-template.test.tsx` -- covers CT-08 (backgroundImageUrl)

## Sources

### Primary (HIGH confidence)
- Existing codebase: `apps/web/components/templates/themes/index.ts` -- ThemeConfig interface, getTheme(), THEMES record
- Existing codebase: `apps/web/components/templates/SharedTemplate.tsx` -- rendering pipeline
- Existing codebase: `apps/api/src/admin/admin.service.ts` -- admin CRUD patterns, storage upload
- Existing codebase: `apps/api/src/admin/admin.controller.ts` -- FileInterceptor, ParseFilePipe, guard patterns
- Existing codebase: `supabase/migrations/009_admin_panel.sql` -- table creation, RLS, storage bucket patterns
- Existing codebase: `apps/web/app/(app)/thep-cuoi/[id]/TemplateSelector.tsx` -- template selection grid
- Existing codebase: `apps/web/app/w/[slug]/InvitationShell.tsx` -- theme resolution in public page
- Existing codebase: `apps/web/app/w/[slug]/page.tsx` -- ISR pattern, server-side data fetching

### Secondary (MEDIUM confidence)
- iOS Safari background-attachment:fixed limitation is well-documented across MDN and CSS spec discussions

### Tertiary (LOW confidence)
- None -- all findings based on direct codebase analysis

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in use, no new dependencies
- Architecture: HIGH -- extending existing patterns (admin CRUD, theme config, storage upload)
- Pitfalls: HIGH -- identified from direct code inspection (CHECK constraint, footerBg format, sync getTheme, TemplateId type)
- UI patterns: HIGH -- CONTEXT.md provides detailed specifications, Stitch admin design system established

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable -- internal architecture, no external API changes)
