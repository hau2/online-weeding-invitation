# Phase 13: Editor UI Redesign - Modern Stitch AI Design - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign the invitation editor pages to match stitch-editor-page.md reference designs. Restructure the editor form into collapsible accordion sections, redesign the top bar, add full-page preview with phone/desktop tabs, add new data fields (ceremony program, groom/bride avatars, nicknames). Follow Stitch AI design principles (Plus Jakarta Sans, modern components, clean layout). Includes DB migration for new fields and API DTO updates.

</domain>

<decisions>
## Implementation Decisions

### Editor Form Layout
- Collapsible accordion sections with icons (not a single long form)
- Multiple sections can be open simultaneously (not exclusive)
- Left panel: scrollable form sections; Right panel: live preview (fixed position)
- Sections in order:
  1. Thong tin Co dau - Chu re (Couple info) — with avatar upload, name, nickname
  2. Thoi gian & Lich trinh (Time & Schedule) — ceremony dates + ceremony program events
  3. Dia diem to chuc (Venue) — venue name, address, Google Maps link with preview
  4. Album anh (Photo gallery) — drag-drop photo upload
  5. Nhac nen (Background music) — music selection
  6. Mung cuoi / QR Code (Gift money) — bank QR upload + account details
  7. Giao dien & Theme (Template & Theme) — 6 theme grid selector
  8. Loi moi (Invitation message) + Thank you text
  9. Save the Date settings

### New Data Fields
- **Ceremony program**: New JSONB field `ceremony_program: [{time: string, title: string, description: string}]` — dynamic list with add/remove in editor. Renders in TimelineSection on public page alongside love_story.
- **Groom/Bride avatars**: New fields `groom_avatar_url` and `bride_avatar_url` (image URLs from Supabase storage). Avatar upload circles in Couple Info section.
- **Groom/Bride nicknames**: New fields `groom_nickname` and `bride_nickname` (string). Displayed below full names in editor and optionally on public page.
- Requires: DB migration, API DTO updates, types extension, editor form updates, public page rendering updates

### Preview & Publish Flow
- Full-page preview: clicking "Xem truoc" navigates to a dedicated preview page (new route, not a dialog)
- Preview page has tabs: "Dien thoai" (Phone mockup), "May tinh" (Desktop mockup), "Chia se lien ket" (Share link with QR)
- "Quay lai chinh sua" (Back to edit) and "Xuat ban ngay" (Publish now) buttons
- Publish stays as a button action (in top bar + preview page) with confirmation dialog showing QR + share link
- No separate publish page

### Top Bar
- Match Stitch design exactly:
  - Left: Back arrow + "Trinh chinh sua thiep" title
  - Center: Mobile/Desktop preview toggle (switches right-panel preview between phone and desktop mockup)
  - Right: "Di luu" (save, subtle) + "Xem truoc" (preview, outlined) + "Xuat ban" (publish, red filled)
- Auto-save indicator: subtle "Da luu" / "Dang luu..." text near save button in top bar

### Claude's Discretion
- Exact accordion animation (CSS transition vs framer-motion)
- Form field validation UX (inline vs toast)
- Ceremony program max items limit
- Avatar image dimensions and cropping UI
- Preview page route path
- Mobile responsive behavior for editor (single column vs hidden preview)
- Google Maps link preview/copy button implementation

</decisions>

<specifics>
## Specific Ideas

- "Design principle should follow Stitch" — match stitch-editor-page.md reference screens exactly
- Stitch editor screenshots show: clean white left panel, red accent color for primary actions, chevron icons for accordion, heart icon for couple section
- The ceremony program editor shows a timeline-style list with event icon, time picker, venue input per event, and "+ Them su kien" (Add event) button
- Avatar upload shows circular image placeholders with camera icon overlay
- Preview page shows large centered phone mockup with device chrome, scrollable

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EditorForm.tsx`: current long-form editor — needs major restructure into accordion sections
- `EditorPreview.tsx`: dual mobile/desktop mockup from Phase 9.1 — reuse for inline preview, adapt for full-page preview
- `TemplateSelector.tsx`: 6 theme grid from Phase 9.1 — reuse as a section
- `MusicPicker.tsx`: music selection UI — reuse as a section
- `PhotoUpload.tsx` / drag-drop components: reuse for photo section
- `BankQrUpload.tsx`: QR upload — reuse for gift money section
- `PublishButton.tsx`: current publish flow — adapt for new top bar placement
- `useAutoSave` hook: keep for auto-save behavior
- Plus Jakarta Sans font already configured

### Established Patterns
- `'use client'` for interactive editor components
- Auto-save via debounced PATCH to API
- Form state managed via useState in EditorForm
- API DTOs with class-validator decorators
- Supabase Storage for image uploads via NestJS proxy

### Integration Points
- `apps/web/app/(app)/thep-cuoi/[id]/page.tsx` — editor page entry point
- `apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx` — top bar wrapper
- `apps/api/src/invitations/dto/update-invitation.dto.ts` — needs new fields
- `packages/types/src/invitation.ts` — needs new fields in Invitation interface
- New preview route: `apps/web/app/(app)/thep-cuoi/[id]/preview/page.tsx`
- DB migration for new columns (ceremony_program, avatars, nicknames)

</code_context>

<deferred>
## Deferred Ideas

- Dashboard redesign — Phase 14
- Admin panel redesign — Phase 15
- RSVP / attendance system — v2
- Invitation analytics — v2

</deferred>

---

*Phase: 13-editor-ui-redesign-modern-stitch-ai-design*
*Context gathered: 2026-03-16*
