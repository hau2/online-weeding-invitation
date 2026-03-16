# Phase 13: Editor UI Redesign - Modern Stitch AI Design - Research

**Researched:** 2026-03-16
**Domain:** React editor UI redesign, accordion forms, preview routing, DB migration, NestJS DTO updates
**Confidence:** HIGH

## Summary

This phase redesigns the invitation editor to match Stitch AI reference designs. The existing editor already uses an accordion-based layout (`@base-ui/react` Accordion) with 10 sections and a side-by-side form/preview layout. The redesign involves: (1) restyling the existing accordion sections and top bar to match Stitch's clean white/red design, (2) adding 4 new data fields requiring DB migration, API DTO updates, and type changes, (3) restructuring sections to match the new order (couple info with avatars/nicknames, time/schedule with ceremony program, venue with maps, photos, music, gift money, theme, message, save-the-date), (4) converting the FullPreviewDialog into a dedicated preview page with phone/desktop/share tabs, (5) redesigning the top bar with center mobile/desktop toggle and right-side save/preview/publish buttons.

The codebase is well-established with consistent patterns: Supabase + NestJS backend, `useAutoSave` hook for debounced PATCH, `FIELD_MAP` for camelCase-to-snake_case mapping, dedicated upload endpoints for images (bank QR pattern reusable for avatars), and `@base-ui/react` Accordion component already in use. The existing EditorForm (443 lines) needs major restructuring but all sub-components (PhotoGallery, MusicPicker, BankQrUpload, TemplateSelector) are reusable as-is within the new section layout.

**Primary recommendation:** Split into 5-6 plans: DB migration + types/DTO first, then top bar redesign, then accordion section restyling with new fields, then ceremony program editor, then avatar upload, then preview page. Keep existing sub-component logic intact -- only restyle wrappers and rearrange section order.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Collapsible accordion sections with icons (not a single long form)
- Multiple sections can be open simultaneously (not exclusive)
- Left panel: scrollable form sections; Right panel: live preview (fixed position)
- Sections in order: (1) Couple info with avatars/nicknames, (2) Time & Schedule with ceremony program, (3) Venue with Google Maps link, (4) Photo gallery, (5) Background music, (6) Gift money/QR Code, (7) Template & Theme, (8) Invitation message + thank you, (9) Save the Date
- Ceremony program: JSONB field `ceremony_program: [{time, title, description}]` -- dynamic list
- Groom/Bride avatars: `groom_avatar_url` and `bride_avatar_url` (image URLs from Supabase storage)
- Groom/Bride nicknames: `groom_nickname` and `bride_nickname` (string)
- Full-page preview at dedicated route (not dialog), with Phone/Desktop/Share Link tabs
- Preview page has "Quay lai chinh sua" + "Xuat ban ngay" buttons
- Top bar: Left (back + title), Center (mobile/desktop toggle), Right (save + preview + publish)
- Auto-save indicator "Da luu" / "Dang luu..." near save button
- Match Stitch design exactly (clean white, red accent, Plus Jakarta Sans)

### Claude's Discretion
- Exact accordion animation (CSS transition vs framer-motion)
- Form field validation UX (inline vs toast)
- Ceremony program max items limit
- Avatar image dimensions and cropping UI
- Preview page route path
- Mobile responsive behavior for editor (single column vs hidden preview)
- Google Maps link preview/copy button implementation

### Deferred Ideas (OUT OF SCOPE)
- Dashboard redesign -- Phase 14
- Admin panel redesign -- Phase 15
- RSVP / attendance system -- v2
- Invitation analytics -- v2
</user_constraints>

## Standard Stack

### Core (already installed -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@base-ui/react` | (installed) | Accordion primitive | Already in use for current EditorForm accordion -- base-nova style |
| `framer-motion` | ^12.0.0 | Accordion animation, transitions | Already installed; used in sidebar and InvitationGrid |
| `lucide-react` | (installed) | Section icons, UI icons | Project standard for all icons |
| `next` | ^15.1.6 | App router, preview page routing | Core framework |
| `react` | ^19.0.0 | UI components | Core framework |
| `sonner` | latest | Toast notifications | Project standard for all toasts |
| `@dnd-kit/core` + `@dnd-kit/sortable` | (installed) | Photo gallery drag-drop reorder | Already used in PhotoGallery |
| `sharp` | (API side) | Avatar image compression to WebP | Already used for photo and QR processing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `class-validator` | (API) | DTO validation decorators | New ceremony_program + nickname fields |
| `class-transformer` | (API) | Nested DTO type transformation | CeremonyProgramEventDto nested validation |
| `tailwindcss` v4 | (installed) | CSS-first styling | All component styles |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| framer-motion for accordion | CSS `data-open`/`data-closed` animation (already in accordion.tsx) | CSS is already working via `animate-accordion-down`/`up`; framer-motion adds smooth height animation but accordion component already handles it natively. **Recommendation: Keep existing CSS animation from @base-ui accordion -- it already works.** |
| Separate preview page | Keep dialog approach | User explicitly decided on dedicated route, not dialog |

**Installation:** No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Current Editor Architecture (to understand before modifying)
```
apps/web/app/(app)/thep-cuoi/[id]/
  page.tsx              -- RSC: fetches invitation, renders EditorShell
  EditorShell.tsx       -- Client: top bar + layout (form | preview)
  EditorForm.tsx        -- Client: accordion form with 10 sections
  EditorPreview.tsx     -- Client: phone + desktop mockup rendering
  FullPreviewDialog.tsx -- Client: dialog with side-filtered preview (TO BE REPLACED)
  PublishButton.tsx     -- Client: publish/unpublish flow with dialogs
  TemplateSelector.tsx  -- Client: 6-theme grid selector
  PhotoGallery.tsx      -- Client: drag-drop photo upload/reorder
  MusicPicker.tsx       -- Client: track list with preview playback
  BankQrUpload.tsx      -- Client: dual (groom/bride) QR upload
  UpgradeButton.tsx     -- Client: premium upgrade link
  useAutoSave.ts        -- Hook: debounced PATCH with status indicator
```

### Target Editor Architecture
```
apps/web/app/(app)/thep-cuoi/[id]/
  page.tsx              -- RSC: unchanged (fetch + EditorShell)
  EditorShell.tsx       -- REDESIGN: new top bar layout, center toggle, sidebar behavior
  EditorForm.tsx        -- MAJOR REWRITE: 9 sections, new order, new fields, icon headers
  EditorPreview.tsx     -- MINOR: add mode prop for phone-only vs desktop-only inline preview
  PublishButton.tsx     -- ADAPT: move into top bar, adapt styling (red filled)
  TemplateSelector.tsx  -- REUSE: becomes section 7 content
  PhotoGallery.tsx      -- REUSE: becomes section 4 content (unchanged)
  MusicPicker.tsx       -- REUSE: becomes section 5 content (unchanged)
  BankQrUpload.tsx      -- REUSE: becomes section 6 content (unchanged)
  UpgradeButton.tsx     -- REUSE: stays in top bar (unchanged)
  useAutoSave.ts        -- EXTEND: add new fields to exclusion list (avatars)
  CeremonyProgramEditor.tsx -- NEW: timeline editor for ceremony events
  AvatarUpload.tsx      -- NEW: circular image upload for groom/bride avatars
  preview/
    page.tsx            -- NEW: RSC full-page preview with tabs
    PreviewShell.tsx    -- NEW: Client component for tab switching + actions

apps/api/src/invitations/
  dto/update-invitation.dto.ts  -- ADD: new fields
  invitations.service.ts        -- ADD: avatar upload methods, extend FIELD_MAP/mapRow/SELECT_ALL
  invitations.controller.ts     -- ADD: avatar upload endpoints

packages/types/src/invitation.ts -- ADD: new fields to interface

supabase/migrations/
  012_editor_new_fields.sql      -- NEW: ceremony_program, avatars, nicknames columns
```

### Pattern 1: Section Icon Headers (Stitch Design)
**What:** Each accordion section gets a colored icon and clean header per Stitch screenshots
**When to use:** All 9 accordion sections
**Example:**
```typescript
// From Stitch reference: heart icon for couple, clock for time, map pin for venue
<AccordionTrigger className="text-gray-800 font-semibold text-sm hover:no-underline">
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
      <Heart className="size-3.5 text-red-500" />
    </div>
    <span>Thong tin Co dau - Chu re</span>
  </div>
</AccordionTrigger>
```

### Pattern 2: Avatar Upload (follows Bank QR upload pattern)
**What:** Circular image upload with camera overlay, stored in Supabase Storage
**When to use:** Groom and bride avatar fields in Couple Info section
**Example (API endpoint, following bank-qr pattern):**
```typescript
// Controller: POST :id/groom-avatar (same as bank-qr endpoint pattern)
@Post(':id/groom-avatar')
@UseInterceptors(FileInterceptor('file'))
uploadGroomAvatar(
  @CurrentUser() user: JwtPayload,
  @Param('id', ParseUUIDPipe) id: string,
  @UploadedFile(...) file: Express.Multer.File,
) {
  return this.invitationsService.uploadGroomAvatar(user.sub, id, file)
}
// Service: same pattern as uploadBankQr -- processImage, upload to 'avatars' bucket, update column
```

### Pattern 3: Ceremony Program JSONB (follows love_story pattern exactly)
**What:** Dynamic list of events stored as JSONB array
**When to use:** Ceremony program section
**Example (follows LoveStoryMilestone pattern):**
```typescript
// Type:
export interface CeremonyProgramEvent {
  time: string
  title: string
  description: string
}

// DTO (follows LoveStoryMilestoneDto):
class CeremonyProgramEventDto {
  @IsString() time: string
  @IsString() @MaxLength(100) title: string
  @IsString() @MaxLength(300) description: string
}

// In InvitationFieldsDto:
@IsOptional()
@IsArray()
@ArrayMaxSize(10)
@ValidateNested({ each: true })
@Type(() => CeremonyProgramEventDto)
ceremonyProgram: CeremonyProgramEventDto[]
```

### Pattern 4: DB Migration (follows existing migration conventions)
**What:** Add new columns with safe defaults
**Example:**
```sql
-- Migration 012: Editor redesign new fields
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS ceremony_program JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS groom_avatar_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bride_avatar_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS groom_nickname TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bride_nickname TEXT NOT NULL DEFAULT '';
```

### Pattern 5: Full-Page Preview Route
**What:** Dedicated Next.js page with tabs instead of dialog
**When to use:** Replacing FullPreviewDialog
**Example:**
```
apps/web/app/(app)/thep-cuoi/[id]/preview/page.tsx  -- RSC: fetch invitation
apps/web/app/(app)/thep-cuoi/[id]/preview/PreviewShell.tsx -- Client: tabs + actions
```

### Anti-Patterns to Avoid
- **Breaking auto-save by adding image URLs to FIELD_MAP:** Avatar URLs (like photoUrls and bankQrUrl) must be excluded from FIELD_MAP and use dedicated upload endpoints. Never allow arbitrary URL injection via the generic PATCH.
- **Building the ceremony program editor from scratch:** Follow the exact same pattern as the love story milestone editor (array copy + onChange, add/remove buttons, index-based field updates). Do not invent a new state management approach.
- **Changing the accordion primitive:** The existing `@base-ui/react` Accordion already supports multiple open panels (its default behavior). Do not switch to a different accordion library.
- **Replacing EditorPreview with something new:** The existing phone+desktop dual mockup component already works. For the inline preview toggle, add a `mode` prop to show one mockup at a time. For the full-page preview, reuse TemplateRenderer directly.
- **Modifying existing sub-components (PhotoGallery, MusicPicker, BankQrUpload):** These components are self-contained with their own upload logic. Only re-parent them into new accordion sections -- do not refactor their internals.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accordion animation | Custom collapse/expand | `@base-ui/react` Accordion (already in use) | Built-in `data-open`/`data-closed` CSS animations already work |
| Image compression | Custom resize logic | `sharp` via existing `processImage()` method | Handles MIME validation, WebP conversion, dimension limits |
| Drag-drop reorder | Custom drag handlers | `@dnd-kit` (already in PhotoGallery) | Battle-tested, accessible, works with React 19 |
| Preview device mockup | Custom phone/desktop chrome | Existing `EditorPreview` component | Already has notch, browser chrome, responsive layout |
| Form debounce auto-save | Custom timer logic | Existing `useAutoSave` hook | Handles debounce, stale closure prevention, status indicator |
| Toast notifications | Custom alert system | Sonner via `toast.error/success` | Project-wide standard |

**Key insight:** Almost every building block exists. This phase is primarily a UI restructuring and styling exercise with 4 new data fields. The only truly new components are CeremonyProgramEditor (follows love_story pattern) and AvatarUpload (follows bank-qr pattern).

## Common Pitfalls

### Pitfall 1: SELECT_ALL, InvitationRow, mapRow, FIELD_MAP Sync
**What goes wrong:** Adding new DB columns but forgetting to update one of the 4 interconnected places: SELECT_ALL string, InvitationRow interface, mapRow function, FIELD_MAP record. Any mismatch causes runtime errors or missing data.
**Why it happens:** These 4 locations in `invitations.service.ts` must stay in sync, and there are no compile-time checks that the SELECT_ALL string matches InvitationRow.
**How to avoid:** Update all 4 in the same commit. Use a checklist: (1) SELECT_ALL += new columns, (2) InvitationRow += new properties, (3) mapRow += new mappings, (4) FIELD_MAP += camelCase-to-snake_case entries (except avatar URLs which use upload endpoints).
**Warning signs:** Invitation data loads but new fields are `undefined` on the frontend.

### Pitfall 2: Avatar URLs Must Not Be in FIELD_MAP
**What goes wrong:** If `groomAvatarUrl`/`brideAvatarUrl` are added to FIELD_MAP, users could inject arbitrary URLs via the generic PATCH endpoint, bypassing image validation and storage upload.
**Why it happens:** Tempting to treat avatar URLs like simple string fields (similar to nicknames).
**How to avoid:** Follow the exact same pattern as `bankQrUrl` and `photoUrls`: dedicated upload endpoints, excluded from FIELD_MAP, excluded from useAutoSave's payload.
**Warning signs:** Avatar URLs can be set to arbitrary values without file upload.

### Pitfall 3: useAutoSave Exclusion List
**What goes wrong:** The useAutoSave hook destructures `{ photoUrls, bankQrUrl, brideBankQrUrl, ...payload }` to exclude upload-managed fields. If new avatar URL fields aren't added to this exclusion, the auto-save will try to PATCH them (and they won't be in FIELD_MAP, so they'll be silently ignored -- but it's still wrong practice).
**Why it happens:** The exclusion list is a manual destructure in useAutoSave.ts.
**How to avoid:** Add `groomAvatarUrl` and `brideAvatarUrl` to the exclusion destructure in useAutoSave.
**Warning signs:** No visible error, but unnecessary data sent in PATCH requests.

### Pitfall 4: Accordion defaultValue Array
**What goes wrong:** The current `<Accordion defaultValue={['couple', 'groom-family', 'bride-family', 'love-story']}>` auto-opens 4 sections. After redesign with new section values, forgetting to update defaultValue means some sections silently collapse.
**Why it happens:** defaultValue is a string array that must match AccordionItem `value` props.
**How to avoid:** Update defaultValue to match new section value names.
**Warning signs:** Sections render but are all collapsed on load.

### Pitfall 5: Preview Page Under (app) Group Layout
**What goes wrong:** The preview page at `thep-cuoi/[id]/preview/page.tsx` will inherit the `(app)/layout.tsx` which includes sidebar, header with SidebarTrigger, and 3.5rem header height. The preview page should feel full-screen.
**Why it happens:** Next.js nested layouts cascade.
**How to avoid:** Either (a) override the main area styles in the preview page to hide sidebar chrome, or (b) use CSS to go full-width within the existing layout, or (c) accept the sidebar layout and just replace the content area (simplest -- the EditorShell already collapses the sidebar on mount with `setOpen(false)`).
**Warning signs:** Preview page has unexpected sidebar/header chrome.

### Pitfall 6: Ceremony Program Rendering on Public Page
**What goes wrong:** Adding ceremony_program to the editor but forgetting to render it on the public invitation page (TimelineSection or new CeremonySection).
**Why it happens:** The CONTEXT.md says ceremony program "renders in TimelineSection on public page alongside love_story."
**How to avoid:** Extend TimelineSection (or create CeremonySection) to render ceremony_program events. This should be included in the same plan as the ceremony program editor.
**Warning signs:** Users fill in ceremony program but it doesn't appear on the public invitation.

## Code Examples

### Top Bar Redesign (Stitch reference)
```typescript
// Based on editor1.png screenshot:
// Left: back arrow + "Trinh chinh sua thiep"
// Center: [Mobile | Desktop] toggle (outlined/filled)
// Right: "Di luu" (ghost) + "Xem truoc" (outlined) + "Xuat ban" (red filled)

<div className="flex items-center h-14 px-4 border-b bg-white">
  {/* Left */}
  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
    <ArrowLeft className="size-5" />
  </Link>
  <h1 className="ml-3 text-sm font-semibold text-gray-800">Trinh chinh sua thiep</h1>
  <SaveIndicator status={status} />

  {/* Center */}
  <div className="flex-1 flex justify-center">
    <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
      <button className={cn('px-3 py-1 text-xs rounded-md', previewMode === 'mobile' && 'bg-red-500 text-white')}>
        Mobile
      </button>
      <button className={cn('px-3 py-1 text-xs rounded-md', previewMode === 'desktop' && 'bg-red-500 text-white')}>
        Desktop
      </button>
    </div>
  </div>

  {/* Right */}
  <div className="flex items-center gap-2">
    <UpgradeButton ... />
    <Button variant="ghost" size="sm">Di luu</Button>
    <Button variant="outline" size="sm">Xem truoc</Button>
    <Button size="sm" className="bg-red-500 text-white hover:bg-red-600">Xuat ban</Button>
  </div>
</div>
```

### Ceremony Program Editor (follows love_story pattern)
```typescript
// Follows same pattern as loveStory editor in current EditorForm
const ceremonyProgram = values.ceremonyProgram ?? []

function handleAddEvent() {
  if (ceremonyProgram.length >= 10) return
  onChange({ ceremonyProgram: [...ceremonyProgram, { time: '', title: '', description: '' }] })
}

function handleRemoveEvent(index: number) {
  onChange({ ceremonyProgram: ceremonyProgram.filter((_, i) => i !== index) })
}

function handleEventChange(index: number, field: keyof CeremonyProgramEvent, value: string) {
  onChange({ ceremonyProgram: ceremonyProgram.map((e, i) => i === index ? { ...e, [field]: value } : e) })
}
```

### Avatar Upload Component (follows BankQrUpload pattern)
```typescript
// Circular upload with camera overlay
<div className="flex flex-col items-center gap-2">
  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
    {avatarUrl ? (
      <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
    ) : (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <Camera className="size-6 text-gray-400" />
      </div>
    )}
    <button onClick={() => fileInputRef.current?.click()}
      className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
      <Camera className="size-4 text-white opacity-0 hover:opacity-100" />
    </button>
  </div>
  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
</div>
```

### DB Migration Pattern
```sql
-- supabase/migrations/012_editor_new_fields.sql
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS ceremony_program JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS groom_avatar_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bride_avatar_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS groom_nickname TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bride_nickname TEXT NOT NULL DEFAULT '';
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Rose-themed accordion with section numbers (1/10, 2/10...) | Icon-prefixed sections with clean labels per Stitch design | This phase | Sections match stitch-editor-page.md reference |
| FullPreviewDialog (modal overlay) | Dedicated preview page with tabs | This phase | Better UX, matches Stitch preview screen |
| Single long-form editor sections (couple info split: couple + groom family + bride family) | Consolidated sections (couple = both + avatars + nicknames) | This phase | From 10 sections to 9, more logical grouping |
| No ceremony program field | JSONB ceremony_program with dynamic editor | This phase | New feature for event timeline |
| No avatars or nicknames | Avatar upload + nickname fields | This phase | Enhanced couple profile |

## Stitch Design Analysis (from screenshots)

### editor1.png - Time & Schedule section
- Left panel: white background, clean borders
- Section headers with red circular icons (heart, clock, map pin)
- Chevron up/down for open/closed state
- Time inputs with clock icon and time picker
- Ceremony events as cards with icon + time + venue
- "+ Them su kien" add button in text style
- Right panel: phone mockup with "Live Preview" label, no desktop mockup inline

### editor2.png - Couple Info section expanded
- Groom section: circular avatar placeholder (pink/red), "Ho va ten" (full name) input, "Ten than mat (biet danh)" nickname input
- Bride section: same layout
- "Loi gioi / Gioi thieu" text area for couple bio
- Collapsed sections below: Time & Schedule, Venue, Gift Money, Template & Theme

### editor3.png - Desktop preview mode
- Same left panel as editor1
- Right panel shows desktop mockup (wider, browser chrome with dots)
- "Live Preview" label above
- Preview shows full invitation rendering

### preview.png - Full preview page
- Top bar: heart icon + "Xem truoc thiep" title (left), "Quay lai chinh sua" + "Xuat ban ngay" (red) buttons (right)
- Tab bar below: "Dien thoai" (active, underlined), "May tinh", "Chia se lien ket"
- Large centered phone mockup with device chrome, scrollable invitation content
- Clean gray background

## Recommendations (Claude's Discretion Areas)

### Accordion Animation
**Recommendation:** Keep existing CSS animation from `@base-ui/react` accordion. The `data-open:animate-accordion-down` / `data-closed:animate-accordion-up` is already smooth. No need for framer-motion complexity.
**Confidence:** HIGH -- existing animation works, no user complaints.

### Form Field Validation UX
**Recommendation:** Use inline validation with red border + helper text for individual fields. Use toast only for cross-field errors (e.g., "Vui long nhap ten co dau va chu re truoc khi xuat ban"). This matches the existing pattern in PublishButton.
**Confidence:** MEDIUM -- aligns with current toast pattern but inline is better UX.

### Ceremony Program Max Items
**Recommendation:** 10 events maximum. Vietnamese wedding ceremonies typically have 5-8 events (ruoc dau, le gia tien, le cuoi, tiec cuoi, etc.). 10 gives headroom.
**Confidence:** MEDIUM -- based on domain knowledge of Vietnamese wedding ceremonies.

### Avatar Image Dimensions
**Recommendation:** Process avatars with `sharp.resize(400, 400, { fit: 'cover' })` for consistent square output. No client-side cropping UI -- just upload and server crops center. Avatar display at 80x80 CSS pixels (160x160 retina). 400px source is sufficient.
**Confidence:** HIGH -- follows existing processImage pattern, just with square dimensions.

### Preview Page Route Path
**Recommendation:** `/thep-cuoi/[id]/preview` -- nested under existing editor route. Clean, intuitive, inherits (app) layout group.
**Confidence:** HIGH -- follows Next.js nested routing conventions.

### Mobile Responsive Behavior
**Recommendation:** On mobile (< lg breakpoint), hide preview panel entirely and show only form. The "Xem truoc" button navigates to the preview page for mobile users. This follows the existing pattern where phone mockup is hidden on mobile.
**Confidence:** HIGH -- aligns with current behavior (`lg:flex-row`, preview hidden on mobile).

### Google Maps Link Implementation
**Recommendation:** Input field + copy button + "Mo Google Maps" link button. No embedded map preview (adds complexity, privacy concerns, API key requirements). Simple text input with link validation.
**Confidence:** HIGH -- minimal complexity, good UX.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + jsdom |
| Config file | `apps/web/vitest.config.ts` |
| Quick run command | `cd apps/web && npx vitest run --reporter=verbose` |
| Full suite command | `cd apps/web && npx vitest run && cd ../../apps/api && npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-UI-01 | EditorForm renders 9 accordion sections with correct order and icons | unit | `cd apps/web && npx vitest run __tests__/components/EditorForm.test.tsx -x` | Yes (needs update -- currently has 5 todo tests for old 3-section structure) |
| EDIT-UI-02 | New fields (ceremonyProgram, avatars, nicknames) are in Invitation type | unit | `tsc --noEmit` (type check) | N/A -- type-level |
| EDIT-UI-03 | CeremonyProgramEditor adds/removes/edits events | unit | `cd apps/web && npx vitest run __tests__/components/CeremonyProgramEditor.test.tsx -x` | No -- Wave 0 |
| EDIT-UI-04 | AvatarUpload uploads and displays circular image | unit | `cd apps/web && npx vitest run __tests__/components/AvatarUpload.test.tsx -x` | No -- Wave 0 |
| EDIT-UI-05 | Preview page renders with Phone/Desktop/Share tabs | unit | `cd apps/web && npx vitest run __tests__/components/PreviewShell.test.tsx -x` | No -- Wave 0 |
| EDIT-UI-06 | Top bar has correct layout: back + title + toggle + save + preview + publish | unit | `cd apps/web && npx vitest run __tests__/components/EditorShell.test.tsx -x` | No -- Wave 0 (EditorShell not yet tested) |
| EDIT-UI-07 | DB migration adds 5 new columns | manual-only | `supabase db push` -- verify columns exist | N/A |
| EDIT-UI-08 | API DTO validates new fields | unit | `cd apps/api && npx vitest run` | Existing service tests cover DTO validation pattern |

### Sampling Rate
- **Per task commit:** `cd apps/web && npx vitest run --reporter=verbose`
- **Per wave merge:** Full suite (web + api)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/web/__tests__/components/CeremonyProgramEditor.test.tsx` -- covers EDIT-UI-03
- [ ] `apps/web/__tests__/components/AvatarUpload.test.tsx` -- covers EDIT-UI-04
- [ ] `apps/web/__tests__/components/PreviewShell.test.tsx` -- covers EDIT-UI-05
- [ ] Update `apps/web/__tests__/components/EditorForm.test.tsx` -- update todos for 9-section structure
- [ ] `apps/web/__tests__/components/EditorShell.test.tsx` -- covers EDIT-UI-06 (new file)

## Data Flow: New Fields End-to-End

For each new field, the complete change chain:

### ceremony_program
1. **DB:** `ceremony_program JSONB NOT NULL DEFAULT '[]'` -- migration 012
2. **Types:** `ceremonyProgram: CeremonyProgramEvent[]` in `Invitation` interface + new `CeremonyProgramEvent` interface
3. **API DTO:** `CeremonyProgramEventDto` nested class + field in `InvitationFieldsDto`
4. **API Service:** Add to `FIELD_MAP` (`ceremonyProgram: 'ceremony_program'`), `InvitationRow`, `mapRow`, `SELECT_ALL`
5. **Frontend Editor:** New `CeremonyProgramEditor` component, rendered in section 2
6. **Frontend Public:** Extend `TimelineSection` or new `CeremonySection` to render events

### groom_avatar_url / bride_avatar_url
1. **DB:** `groom_avatar_url TEXT DEFAULT NULL`, `bride_avatar_url TEXT DEFAULT NULL` -- migration 012
2. **Types:** `groomAvatarUrl: string | null`, `brideAvatarUrl: string | null` in `Invitation`
3. **API DTO:** NOT in InvitationFieldsDto (managed by upload endpoint)
4. **API Service:** Add to `InvitationRow`, `mapRow`, `SELECT_ALL`. NOT in `FIELD_MAP`. New upload methods (follow bank-qr pattern). Use 'avatars' Supabase bucket. Process with square crop (400x400).
5. **API Controller:** New `POST :id/groom-avatar` and `POST :id/bride-avatar` endpoints
6. **Frontend Editor:** New `AvatarUpload` component in section 1, useAutoSave exclusion list updated
7. **Frontend Public:** HeroSection or couple section shows avatars

### groom_nickname / bride_nickname
1. **DB:** `groom_nickname TEXT NOT NULL DEFAULT ''`, `bride_nickname TEXT NOT NULL DEFAULT ''` -- migration 012
2. **Types:** `groomNickname: string`, `brideNickname: string` in `Invitation`
3. **API DTO:** `@IsString() @MaxLength(50) groomNickname: string` (and bride) in `InvitationFieldsDto`
4. **API Service:** Add to `FIELD_MAP`, `InvitationRow`, `mapRow`, `SELECT_ALL`
5. **Frontend Editor:** Text input below full name in Couple Info section
6. **Frontend Public:** Display below full names (optional -- only if non-empty)

## Open Questions

1. **Supabase Storage Bucket for Avatars**
   - What we know: Bank QR uses 'bank-qr' bucket, photos use 'invitation-photos' bucket. Both already exist.
   - What's unclear: Whether to reuse 'invitation-photos' or create a new 'avatars' bucket.
   - Recommendation: Create new 'avatars' bucket for cleaner separation and potentially different access policies. Falls within established pattern of one bucket per image type.

2. **Ceremony Program on Public Page**
   - What we know: CONTEXT.md says "renders in TimelineSection on public page alongside love_story"
   - What's unclear: Whether ceremony program and love story should be separate sections or interleaved in a single timeline
   - Recommendation: Render as a separate sub-section below love story in TimelineSection, with a "Lich trinh le cuoi" heading. Keep them visually distinct.

3. **Side-Filtered Preview for Preview Page**
   - What we know: Current FullPreviewDialog filters by groom/bride side. The new preview page has Phone/Desktop/Share tabs but CONTEXT.md doesn't mention side filtering.
   - What's unclear: Whether the preview page should also have groom/bride side toggle
   - Recommendation: Add a subtle side toggle (groom/bride pills) on the preview page below the device tabs. Users need to preview both sides before publishing.

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis: all source files read directly
- Stitch editor screenshots: `/tmp/stitch-editor/editor1.png`, `editor2.png`, `editor3.png`, `preview.png`
- `13-CONTEXT.md`: user decisions and locked design choices

### Secondary (MEDIUM confidence)
- @base-ui/react Accordion behavior: inferred from existing `accordion.tsx` component code (supports multiple open by default)
- Migration pattern: inferred from existing 11 migrations in `supabase/migrations/`

### Tertiary (LOW confidence)
- None -- all findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use
- Architecture: HIGH -- follows exact patterns established in 9+ phases
- Pitfalls: HIGH -- derived from actual codebase patterns (FIELD_MAP sync, URL exclusion)
- New field data flow: HIGH -- follows established precedent (love_story for JSONB, bank-qr for upload)
- Stitch design matching: MEDIUM -- screenshots are reference, exact pixel values may need adjustment during implementation

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable -- no external dependencies changing)
