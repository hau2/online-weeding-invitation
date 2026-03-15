# Phase 4: Media Upload Pipeline - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Upload, manage, and optimize wedding photos and bank QR image within the existing editor. Music is admin-managed system library only (no user uploads). Photos are auto-compressed to WebP. All media integrates into the existing template preview.

</domain>

<decisions>
## Implementation Decisions

### Editor Layout
- 3 new accordion sections below existing text sections:
  - **Ảnh cưới** (4/6): photo gallery upload and reorder
  - **Nhạc nền** (5/6): system music library picker
  - **QR Ngân hàng** (6/6): bank QR image upload + bank info fields

### Photo Gallery — Editor
- Up to 10 photos per invitation
- Grid of square thumbnails (2-3 columns) with drag handles for reordering
- X button on each thumbnail to delete
- + button to add more photos
- Drop zone: the entire accordion section becomes a drop target with overlay "Thả ảnh vào đây"
- Upload progress: overlay progress bar on each thumbnail while uploading
- Max 5MB per photo (raw), auto-compressed to WebP server-side

### Photo Gallery — Public Page
- Vertical scroll gallery: photos stack vertically, each full-width in the invitation flow
- Photos appear in the order set by the user in the editor

### Music Selection
- **System library only** — no user music uploads (admin manages tracks via admin panel)
- Simple list of tracks with play/pause icon for 30-second preview
- 3-5 curated tracks initially (romantic piano, traditional Vietnamese, modern instrumental)
- Selected track highlighted, click to select/deselect
- Preview plays in editor using howler.js, stops after 30 seconds

### Bank QR Display
- Single image upload (PNG or JPG), max 5MB
- Dedicated "Mừng cưới" section on public page: card-style frame with QR centered
- Two optional text fields below the QR upload: "Tên ngân hàng" and "Chủ tài khoản"
- Bank name and account holder display below QR on public invitation

### Upload Limits & Feedback
- Per-file limits: 5MB per photo, 5MB bank QR
- Max 10 photos per invitation
- No total storage quota for now (per-file limits are sufficient)
- Progress bar on each thumbnail during upload
- Vietnamese error messages for oversized/wrong-type files
- Magic-byte MIME validation (not just file extension)

### Claude's Discretion
- Exact thumbnail grid sizing and spacing
- Photo compression quality setting (WebP quality 75 suggested in roadmap)
- Drag handle icon and animation for reordering
- System music track selection (which specific tracks to include)
- Bank QR crop hint UX details
- How to handle upload failures (retry UI)

</decisions>

<specifics>
## Specific Ideas

- Music is admin-managed only because user uploads could stress the database — keep it curated
- Photos auto-compress to 1200px max width WebP (from roadmap)
- Bank QR section titled "Mừng cưới" — recognizable Vietnamese wedding gift convention
- Template components (Traditional/Modern/Minimalist) need extending to render photos, music player, and bank QR sections

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TemplateRenderer` + 3 template components: need extending with photo gallery, music, QR sections
- `useAutoSave` hook: can handle media URL updates after upload completes
- `apiFetch` utility: for upload API calls (will need FormData support)
- `SupabaseAdminService`: for storage bucket operations (upload, delete, list)
- framer-motion: for gallery animations and drag feedback
- shadcn/ui Dialog: for any upload/crop modals

### Established Patterns
- Two-client Supabase: SupabaseAdminService (service role) for all DB/storage operations
- FIELD_MAP for camelCase ↔ snake_case conversion in invitations service
- class-validator on all DTOs with Vietnamese error messages
- ValidationPipe with whitelist + forbidNonWhitelisted

### Integration Points
- `apps/api/src/invitations/invitations.service.ts`: extend with media methods
- `apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx`: add 3 new accordion sections
- `packages/types/src/invitation.ts`: add photoUrls, musicUrl, bankQrUrl, bankName, bankAccountHolder
- `supabase/migrations/`: new migration for columns + storage buckets
- Template components: extend to render media sections on public page

</code_context>

<deferred>
## Deferred Ideas

- User music upload — deferred due to storage/database concerns. Admin manages system library instead.
- Per-invitation storage quota — not needed now, add with monetization phase if needed.
- Photo cropping/editing in browser — just upload as-is, server compresses.

</deferred>

---

*Phase: 04-media-upload-pipeline*
*Context gathered: 2026-03-15*
