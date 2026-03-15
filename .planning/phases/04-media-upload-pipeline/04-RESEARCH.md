# Phase 4: Media Upload Pipeline - Research

**Researched:** 2026-03-15
**Domain:** File upload, image processing, drag-reorder, audio preview, Supabase Storage
**Confidence:** HIGH

## Summary

Phase 4 adds three media accordion sections to the existing invitation editor: photo gallery (upload, compress, reorder), system music picker (admin-managed library), and bank QR upload with bank info fields. All uploads flow through NestJS (never direct browser-to-Supabase), are validated with magic-byte MIME checking, and photos are auto-optimized to WebP via sharp.

The existing codebase has strong foundations: `SupabaseAdminService` for storage operations, `EditorForm` with accordion layout, `useAutoSave` for persisting changes, `apiFetch` for API calls, and `framer-motion` for animations. The main additions are: `sharp` for server-side image processing, `@dnd-kit/core` + `@dnd-kit/sortable` for grid drag reorder (framer-motion Reorder does NOT support 2D grids), `howler` for audio preview, and `magic-bytes.js` for MIME validation.

**Primary recommendation:** Build three new API endpoints (POST photos, POST bank-qr, DELETE photo) that accept multipart uploads, validate via magic bytes, compress via sharp, store in Supabase Storage, and return public URLs. The frontend adds three accordion sections to EditorForm, uses @dnd-kit for photo grid reordering, and howler.js for 30-second music preview. New DB columns store photo URLs (jsonb array), music track ID (FK), bank QR URL, bank name, and account holder.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 3 new accordion sections below existing text sections:
  - **Anh cuoi** (4/6): photo gallery upload and reorder
  - **Nhac nen** (5/6): system music library picker
  - **QR Ngan hang** (6/6): bank QR image upload + bank info fields
- Up to 10 photos per invitation
- Grid of square thumbnails (2-3 columns) with drag handles for reordering
- X button on each thumbnail to delete
- + button to add more photos
- Drop zone: the entire accordion section becomes a drop target with overlay "Tha anh vao day"
- Upload progress: overlay progress bar on each thumbnail while uploading
- Max 5MB per photo (raw), auto-compressed to WebP server-side
- Vertical scroll gallery on public page: photos stack vertically, each full-width
- **System library only** -- no user music uploads (admin manages tracks via admin panel)
- Simple list of tracks with play/pause icon for 30-second preview
- 3-5 curated tracks initially (romantic piano, traditional Vietnamese, modern instrumental)
- Selected track highlighted, click to select/deselect
- Preview plays in editor using howler.js, stops after 30 seconds
- Single bank QR image upload (PNG or JPG), max 5MB
- Dedicated "Mung cuoi" section on public page: card-style frame with QR centered
- Two optional text fields below QR upload: "Ten ngan hang" and "Chu tai khoan"
- Per-file limits: 5MB per photo, 5MB bank QR
- No total storage quota for now
- Magic-byte MIME validation (not just file extension)
- Vietnamese error messages for oversized/wrong-type files

### Claude's Discretion
- Exact thumbnail grid sizing and spacing
- Photo compression quality setting (WebP quality 75 suggested in roadmap)
- Drag handle icon and animation for reordering
- System music track selection (which specific tracks to include)
- Bank QR crop hint UX details
- How to handle upload failures (retry UI)

### Deferred Ideas (OUT OF SCOPE)
- User music upload -- deferred due to storage/database concerns
- Per-invitation storage quota -- not needed now
- Photo cropping/editing in browser -- just upload as-is, server compresses
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EDIT-04 | User can upload multiple photos with drag-drop reordering | @dnd-kit/core + @dnd-kit/sortable for grid drag, NestJS FileInterceptor for upload, Supabase Storage for persistence, jsonb photo_urls column for order |
| EDIT-05 | System auto-optimizes uploaded photos for mobile | sharp library: resize to 1200px max width, convert to WebP quality 75, process server-side in NestJS pipe |
| EDIT-06 | User can choose background music from system library | system_music table (admin-managed), howler.js for 30-sec preview in editor, music_track_id FK on invitations |
| EDIT-07 | User can upload their bank QR image for gift money display | Same upload pipeline as photos (FileInterceptor + sharp + magic-bytes), separate bank-qr storage path, bankName + bankAccountHolder text fields |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sharp | ^0.34.5 | Server-side image resize + WebP conversion | Fastest Node.js image processor, uses libvips, CJS compatible, well-maintained |
| @dnd-kit/core | ^6.3.1 | Drag-and-drop foundation | Only mature React DnD library supporting 2D grid reordering |
| @dnd-kit/sortable | ^10.0.0 | Sortable preset on top of @dnd-kit/core | Purpose-built for reorderable lists/grids |
| howler | ^2.2.4 | Audio playback for music preview | Lightweight (7KB gzipped), cross-browser, simple API |
| magic-bytes.js | ^1.13.0 | Magic-byte MIME validation | CJS compatible (unlike file-type which is ESM-only), detects true file type from binary header |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/howler | ^2.2.12 | TypeScript types for howler.js | Always -- project uses TypeScript |
| @dnd-kit/utilities | ^3.2.2 | CSS transform utilities for dnd-kit | For CSS.Transform.toString() in sortable items |

### Already Installed (Reuse)
| Library | Version | Purpose | Where Used in Phase 4 |
|---------|---------|---------|----------------------|
| framer-motion | ^12.0.0 | Layout animations, fade transitions | Animate photo grid additions/removals, NOT for drag reorder |
| lucide-react | ^0.577.0 | Icons | GripVertical (drag handle), X (delete), Plus (add), Play/Pause, Upload, Image |
| sonner | ^2.0.7 | Toast notifications | Upload errors, success feedback |
| @nestjs/platform-express | ^11.0.0 | Multer file upload interceptors | FileInterceptor, FilesInterceptor, UploadedFile, UploadedFiles |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @dnd-kit/sortable | framer-motion Reorder | Reorder.Group does NOT support 2D grid layouts (only single axis) -- confirmed bug #2089, #1986 |
| @dnd-kit/sortable | @dnd-kit/react (v0.3.2) | Pre-1.0, experimental, not production-ready |
| magic-bytes.js | file-type | file-type is ESM-only, incompatible with NestJS CJS (same issue as nanoid v4+) |
| sharp | jimp | 4-5x slower than sharp; sharp uses native libvips |
| howler | HTML5 Audio | howler handles cross-browser quirks, format fallbacks, and provides a cleaner API |

**Installation:**
```bash
# API (NestJS)
cd apps/api && pnpm add sharp magic-bytes.js && pnpm add -D @types/multer

# Web (Next.js)
cd apps/web && pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities howler && pnpm add -D @types/howler
```

## Architecture Patterns

### Recommended Project Structure
```
apps/api/src/
  invitations/
    invitations.controller.ts    # Add upload endpoints
    invitations.service.ts       # Add media methods
    dto/
      update-invitation.dto.ts   # Add media fields
  common/
    pipes/
      image-optimization.pipe.ts # NEW: sharp resize + WebP
      magic-byte-validation.pipe.ts # NEW: validate MIME via magic bytes

apps/web/
  app/(app)/thep-cuoi/[id]/
    EditorForm.tsx               # Extend with 3 new accordion sections
    EditorShell.tsx              # Pass media data to preview
    PhotoGallery.tsx             # NEW: upload grid + dnd-kit reorder
    MusicPicker.tsx              # NEW: system music list + howler preview
    BankQrUpload.tsx             # NEW: QR image upload + bank fields
  lib/
    api.ts                       # Add apiUpload() for FormData

packages/types/src/
  invitation.ts                  # Add photoUrls, musicTrackId, bankQrUrl, bankName, bankAccountHolder
  music.ts                       # NEW: SystemMusicTrack interface

supabase/migrations/
  002_media_columns.sql          # NEW: Add columns + storage buckets + system_music table
```

### Pattern 1: Server-Side Upload Pipeline
**What:** Browser sends FormData to NestJS -> NestJS validates magic bytes -> sharp optimizes -> Supabase Storage upload -> return public URL
**When to use:** All file uploads (photos and bank QR)
**Example:**
```typescript
// Source: NestJS docs + sharp docs
// apps/api/src/invitations/invitations.controller.ts

@Post(':id/photos')
@UseInterceptors(FilesInterceptor('photos', 10))  // max 10 files
@UseGuards(JwtGuard)
async uploadPhotos(
  @CurrentUser() user: JwtPayload,
  @Param('id', ParseUUIDPipe) id: string,
  @UploadedFiles(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
      ],
    }),
  )
  files: Express.Multer.File[],
) {
  return this.invitationsService.uploadPhotos(user.sub, id, files)
}
```

### Pattern 2: Image Optimization Pipe
**What:** NestJS pipe that validates magic bytes + converts to WebP using sharp
**When to use:** Processing uploaded images before storage
**Example:**
```typescript
// Source: sharp docs + magic-bytes.js docs
import sharp from 'sharp'
import { filetypemime } from 'magic-bytes.js'

// In the service method:
async processImage(buffer: Buffer): Promise<Buffer> {
  // 1. Validate magic bytes
  const mimes = filetypemime(buffer)
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!mimes.some(m => allowed.includes(m))) {
    throw new BadRequestException('Dinh dang anh khong hop le. Chi chap nhan JPEG, PNG hoac WebP.')
  }

  // 2. Resize + convert to WebP
  return sharp(buffer)
    .resize(1200, null, { withoutEnlargement: true }) // max 1200px width
    .webp({ quality: 75 })
    .toBuffer()
}
```

### Pattern 3: Supabase Storage Upload via Admin Client
**What:** Use SupabaseAdminService (service role) to upload to storage buckets
**When to use:** All storage operations (bypasses RLS on storage)
**Example:**
```typescript
// Source: Supabase JS docs
// Established project pattern: all uploads go through NestJS, never direct browser->Supabase

const filePath = `${invitationId}/${Date.now()}-${index}.webp`
const { error } = await this.supabaseAdmin.client.storage
  .from('invitation-photos')
  .upload(filePath, optimizedBuffer, {
    contentType: 'image/webp',
    upsert: false,
  })

// Get public URL
const { data } = this.supabaseAdmin.client.storage
  .from('invitation-photos')
  .getPublicUrl(filePath)

return data.publicUrl
```

### Pattern 4: FormData Upload from Frontend
**What:** Extend apiFetch or create apiUpload for multipart/form-data
**When to use:** Sending files from browser to NestJS
**Example:**
```typescript
// apps/web/lib/api.ts -- new function alongside existing apiFetch
export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      body: formData,  // NO Content-Type header -- browser sets multipart boundary
      credentials: 'include',
    })
    const json = await response.json()
    if (!response.ok) {
      const message = typeof json.message === 'string'
        ? json.message
        : Array.isArray(json.message)
          ? json.message.join('; ')
          : 'Co loi xay ra. Vui long thu lai.'
      return { data: null, error: message }
    }
    return { data: json as T, error: null }
  } catch {
    return { data: null, error: 'Khong the ket noi den may chu. Vui long thu lai.' }
  }
}
```

### Pattern 5: dnd-kit Sortable Grid
**What:** @dnd-kit/core + @dnd-kit/sortable for 2D grid reordering
**When to use:** Photo thumbnail grid reorder
**Example:**
```typescript
// Source: @dnd-kit docs
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortablePhoto({ url, id, onDelete }: { url: string; id: string; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} className="relative aspect-square">
      <img src={url} className="w-full h-full object-cover rounded-lg" />
      <button {...attributes} {...listeners} className="absolute top-1 left-1">
        <GripVertical className="size-4" />
      </button>
      <button onClick={onDelete} className="absolute top-1 right-1">
        <X className="size-4" />
      </button>
    </div>
  )
}

// In PhotoGallery parent:
// Use rectSortingStrategy for grid layout (NOT verticalListSortingStrategy)
<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={photoIds} strategy={rectSortingStrategy}>
    <div className="grid grid-cols-3 gap-2">
      {photos.map(p => <SortablePhoto key={p.id} ... />)}
    </div>
  </SortableContext>
</DndContext>
```

### Pattern 6: Howler.js 30-Second Preview
**What:** Play system music track for 30 seconds in editor
**When to use:** Music picker section
**Example:**
```typescript
// Source: howler.js docs
import { Howl } from 'howler'

// In MusicPicker component:
const soundRef = useRef<Howl | null>(null)
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

function handlePreview(trackUrl: string) {
  // Stop any existing preview
  if (soundRef.current) {
    soundRef.current.stop()
    soundRef.current.unload()
  }
  if (timerRef.current) clearTimeout(timerRef.current)

  const sound = new Howl({ src: [trackUrl], html5: true })
  soundRef.current = sound
  sound.play()

  // Stop after 30 seconds
  timerRef.current = setTimeout(() => {
    sound.stop()
  }, 30_000)
}

// Cleanup on unmount
useEffect(() => {
  return () => {
    soundRef.current?.unload()
    if (timerRef.current) clearTimeout(timerRef.current)
  }
}, [])
```

### Anti-Patterns to Avoid
- **Direct browser-to-Supabase upload:** Violates project decision (all uploads through NestJS). Would expose Supabase keys to client and skip server-side validation.
- **Trusting Content-Type header for MIME validation:** Multer derives type from file extension which users can spoof. Must use magic-byte validation.
- **Using framer-motion Reorder for grid:** Reorder.Group only supports single-axis (x or y), not 2D grids. Confirmed bugs #2089 and #1986 on GitHub.
- **Using file-type package:** ESM-only, incompatible with NestJS CJS build (same issue as nanoid v4+).
- **Storing photos as base64 in DB:** Use Supabase Storage with URL references in the DB column.
- **Not cleaning up Howl instances:** Memory leak if you create Howl objects without calling `.unload()` on unmount or preview switch.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image resize + format conversion | Custom canvas/ffmpeg pipeline | `sharp` | Handles EXIF rotation, color profiles, ICC, memory limits; 4-5x faster than alternatives |
| Drag-and-drop grid reorder | Custom pointer event tracking | `@dnd-kit/sortable` with `rectSortingStrategy` | Touch support, keyboard accessibility, collision detection, smooth animations |
| Magic byte detection | Manual buffer slice comparison | `magic-bytes.js` | Covers 100+ file signatures, handles edge cases like JPEG variants |
| Audio playback with format fallback | Raw HTMLAudioElement | `howler.js` | Cross-browser quirks (Safari codec issues, Web Audio API fallbacks, mobile restrictions) |
| File upload multipart parsing | Custom body parser | NestJS `FileInterceptor` (Multer) | Battle-tested, memory management, streaming support |

**Key insight:** Image processing and audio playback have massive cross-browser and cross-platform edge cases. Sharp handles EXIF orientation, ICC color profiles, and animated formats. Howler handles Safari audio context restrictions and format fallbacks. These are not worth building custom.

## Common Pitfalls

### Pitfall 1: Content-Type Header Not Set for FormData
**What goes wrong:** Adding `Content-Type: application/json` header when sending FormData breaks multipart boundary detection.
**Why it happens:** The existing `apiFetch` always sets `Content-Type: application/json`. If you try to reuse it for FormData, Multer can't parse the body.
**How to avoid:** Create a separate `apiUpload()` function that does NOT set Content-Type header -- the browser automatically sets `multipart/form-data` with correct boundary.
**Warning signs:** 400 errors from NestJS, "Unexpected field" or empty files.

### Pitfall 2: Supabase Storage Bucket Not Created Before Upload
**What goes wrong:** `.upload()` returns error if bucket doesn't exist.
**Why it happens:** Unlike tables, storage buckets aren't auto-created. They must be provisioned via SQL migration or dashboard.
**How to avoid:** Create buckets in migration: `INSERT INTO storage.buckets (id, name, public) VALUES ('invitation-photos', 'invitation-photos', true);`
**Warning signs:** "Bucket not found" errors on first upload attempt.

### Pitfall 3: Photo Order Mismatch After Reorder
**What goes wrong:** Photos appear in wrong order on public page.
**Why it happens:** Storing photo URLs as separate rows loses ordering. Or using a JSON array but not persisting after drag-end.
**How to avoid:** Store `photo_urls` as a JSONB array on the invitations table. The array index IS the order. On drag-end, call `arrayMove()` and immediately persist the new array via auto-save.
**Warning signs:** Photos render in upload-time order instead of user-arranged order.

### Pitfall 4: sharp EXIF Orientation Not Handled
**What goes wrong:** Photos appear rotated after processing.
**Why it happens:** Phone cameras store rotation in EXIF metadata. If sharp doesn't auto-rotate, the image renders sideways.
**How to avoid:** sharp auto-rotates by default when using `.resize()`. Do NOT call `.rotate(0)` explicitly as it disables auto-rotation. Verify by testing with phone-taken portrait photos.
**Warning signs:** Portrait photos display in landscape after upload.

### Pitfall 5: Howler Audio Not Unloaded on Component Unmount
**What goes wrong:** Audio continues playing after navigating away from editor.
**Why it happens:** Howl instances are not garbage collected. They keep playing until explicitly stopped.
**How to avoid:** Use `useEffect` cleanup to call `sound.unload()`. Also stop on preview switch and track selection change.
**Warning signs:** Hearing music after leaving the editor page.

### Pitfall 6: Max 10 Photos Not Enforced Server-Side
**What goes wrong:** Users bypass client-side limit and upload more than 10 photos.
**Why it happens:** Only checking in the UI. Malicious or buggy clients can send more.
**How to avoid:** In the upload endpoint, check existing photo count + new files <= 10 BEFORE processing. Return 400 with Vietnamese error message.
**Warning signs:** Invitations with >10 photos in the database.

### Pitfall 7: Large File Blocks Event Loop During sharp Processing
**What goes wrong:** API becomes unresponsive while processing a 5MB image.
**Why it happens:** sharp uses native libvips which is async, but multiple concurrent uploads can still create pressure.
**How to avoid:** sharp's `.toBuffer()` is already async and uses libuv thread pool. For extra safety, limit concurrent uploads per request with `FilesInterceptor('photos', 10)` (already capped).
**Warning signs:** Slow response times during photo upload.

### Pitfall 8: apiFetch Forces JSON.stringify on FormData
**What goes wrong:** FormData gets serialized to `"[object FormData]"` string.
**Why it happens:** The existing `apiFetch` does `body: body !== undefined ? JSON.stringify(body) : undefined`.
**How to avoid:** The new `apiUpload()` passes FormData directly as body without JSON.stringify, and omits Content-Type header.
**Warning signs:** Server receives empty/corrupted upload data.

## Code Examples

### Database Migration for Media Columns + Storage Buckets
```sql
-- Source: Supabase docs + established project migration pattern

-- Add media columns to invitations table
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS music_track_id UUID DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bank_qr_url TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bank_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bank_account_holder TEXT NOT NULL DEFAULT '';

-- System music library table (admin-managed)
CREATE TABLE IF NOT EXISTS public.system_music_tracks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  artist     TEXT NOT NULL DEFAULT '',
  url        TEXT NOT NULL,
  duration   INTEGER NOT NULL DEFAULT 0,  -- seconds
  is_active  BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.system_music_tracks ENABLE ROW LEVEL SECURITY;

-- Anyone can read active tracks (public page needs this)
CREATE POLICY "system_music_select_active" ON public.system_music_tracks
  FOR SELECT USING (is_active = true);

-- FK from invitations to system_music_tracks
ALTER TABLE public.invitations
  ADD CONSTRAINT fk_invitations_music_track
  FOREIGN KEY (music_track_id) REFERENCES public.system_music_tracks(id)
  ON DELETE SET NULL;

-- Trigger for system_music_tracks updated_at
CREATE TRIGGER system_music_tracks_updated_at
  BEFORE UPDATE ON public.system_music_tracks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage buckets (public for serving via getPublicUrl)
INSERT INTO storage.buckets (id, name, public)
VALUES ('invitation-photos', 'invitation-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('bank-qr', 'bank-qr', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('system-music', 'system-music', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: service role handles all uploads (NestJS backend)
-- Public read for serving assets
CREATE POLICY "public_read_invitation_photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'invitation-photos');

CREATE POLICY "public_read_bank_qr"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'bank-qr');

CREATE POLICY "public_read_system_music"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'system-music');

-- Seed initial music tracks (3 curated tracks)
-- Actual mp3 files managed by admin; these are placeholders
-- Admin panel (Phase 8) will provide UI for managing tracks
```

### Updated Invitation Type
```typescript
// packages/types/src/invitation.ts
export interface Invitation {
  id: string
  userId: string
  slug: string | null
  status: InvitationStatus
  templateId: TemplateId
  groomName: string
  brideName: string
  weddingDate: string | null
  weddingTime: string | null
  venueName: string
  venueAddress: string
  invitationMessage: string
  thankYouText: string
  // NEW media fields
  photoUrls: string[]
  musicTrackId: string | null
  bankQrUrl: string | null
  bankName: string
  bankAccountHolder: string
  // timestamps
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
```

### Updated FIELD_MAP and InvitationRow
```typescript
// apps/api/src/invitations/invitations.service.ts
// Add to existing FIELD_MAP:
const FIELD_MAP: Record<string, string> = {
  // ... existing fields ...
  photoUrls: 'photo_urls',
  musicTrackId: 'music_track_id',
  bankQrUrl: 'bank_qr_url',
  bankName: 'bank_name',
  bankAccountHolder: 'bank_account_holder',
}

// Add to InvitationRow:
interface InvitationRow {
  // ... existing fields ...
  photo_urls: string[] // JSONB
  music_track_id: string | null
  bank_qr_url: string | null
  bank_name: string
  bank_account_holder: string
}

// Add to mapRow():
function mapRow(row: InvitationRow) {
  return {
    // ... existing mappings ...
    photoUrls: row.photo_urls ?? [],
    musicTrackId: row.music_track_id,
    bankQrUrl: row.bank_qr_url,
    bankName: row.bank_name,
    bankAccountHolder: row.bank_account_holder,
  }
}

// Add to SELECT_ALL:
const SELECT_ALL =
  'id, user_id, slug, status, template_id, groom_name, bride_name, ' +
  'wedding_date, wedding_time, venue_name, venue_address, ' +
  'invitation_message, thank_you_text, ' +
  'photo_urls, music_track_id, bank_qr_url, bank_name, bank_account_holder, ' +
  'created_at, updated_at, deleted_at'
```

### EditorForm Extension (3 New Accordion Sections)
```typescript
// apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx
// The numbering changes from (1/3), (2/3), (3/3) to (1/6)...(6/6)
// Add 3 new AccordionItem components after existing 3:

<AccordionItem value="photos">
  <AccordionTrigger className="text-rose-700 font-semibold text-sm">
    Anh cuoi (4/6)
  </AccordionTrigger>
  <AccordionContent>
    <PhotoGallery
      invitationId={values.id}
      photoUrls={values.photoUrls}
      onChange={(photoUrls) => onChange({ photoUrls })}
    />
  </AccordionContent>
</AccordionItem>

<AccordionItem value="music">
  <AccordionTrigger className="text-rose-700 font-semibold text-sm">
    Nhac nen (5/6)
  </AccordionTrigger>
  <AccordionContent>
    <MusicPicker
      selectedTrackId={values.musicTrackId}
      onSelect={(musicTrackId) => onChange({ musicTrackId })}
    />
  </AccordionContent>
</AccordionItem>

<AccordionItem value="bankqr">
  <AccordionTrigger className="text-rose-700 font-semibold text-sm">
    QR Ngan hang (6/6)
  </AccordionTrigger>
  <AccordionContent>
    <BankQrUpload
      invitationId={values.id}
      bankQrUrl={values.bankQrUrl}
      bankName={values.bankName}
      bankAccountHolder={values.bankAccountHolder}
      onChange={onChange}
    />
  </AccordionContent>
</AccordionItem>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side image resize (canvas) | Server-side sharp (WebP) | 2022+ | Consistent output quality, EXIF handling, no client CPU burden |
| react-beautiful-dnd | @dnd-kit/core + @dnd-kit/sortable | 2023+ | react-beautiful-dnd deprecated, @dnd-kit is the successor with React 18/19 support |
| Storing files in DB (base64) | Object storage (Supabase Storage) | Standard | Scalable, CDN-friendly, no DB bloat |
| Extension-based MIME check | Magic-byte validation | Security best practice | Prevents file extension spoofing attacks |

**Deprecated/outdated:**
- `react-beautiful-dnd`: Officially deprecated, no React 18/19 support. Use @dnd-kit instead.
- `file-type` (for NestJS): ESM-only since v17, not usable in CJS NestJS projects without workarounds.
- `@dnd-kit/react` (v0.x): Pre-1.0, experimental. Stick with `@dnd-kit/core` + `@dnd-kit/sortable` for production.

## Open Questions

1. **System music seed data**
   - What we know: 3-5 tracks needed (romantic piano, traditional Vietnamese, modern instrumental). Admin manages via admin panel (Phase 8).
   - What's unclear: Actual mp3 files to seed. Need royalty-free tracks.
   - Recommendation: Create the system_music_tracks table and seed with placeholder rows. Actual audio files can be added via Supabase dashboard or a seed script. Phase 8 will provide admin UI.

2. **Photo deletion cleanup**
   - What we know: When user deletes a photo, we remove it from the photo_urls array.
   - What's unclear: Should we also delete the file from Supabase Storage immediately, or defer cleanup?
   - Recommendation: Delete from storage immediately in the same API call. Simplest approach, no orphaned files.

3. **Public bucket vs signed URLs for photos**
   - What we know: Wedding photos and bank QR are displayed on the public invitation page (no auth required).
   - What's unclear: Whether to use public buckets (simpler) or signed URLs (more secure but complex).
   - Recommendation: Use public buckets. Wedding photos are meant to be publicly viewable. Signed URLs add unnecessary complexity and expire, breaking cached pages.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x (web: jsdom, api: node) |
| Config file | `apps/web/vitest.config.ts`, `apps/api/vitest.config.ts` |
| Quick run command | `cd apps/web && pnpm test` or `cd apps/api && pnpm test` |
| Full suite command | `pnpm test` (turbo runs both) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-04a | Photo upload creates FormData, calls API | unit | `cd apps/web && pnpm vitest run __tests__/components/PhotoGallery.test.tsx` | Wave 0 |
| EDIT-04b | Photo grid renders thumbnails in order | unit | `cd apps/web && pnpm vitest run __tests__/components/PhotoGallery.test.tsx` | Wave 0 |
| EDIT-04c | Drag reorder calls onChange with new order | unit | `cd apps/web && pnpm vitest run __tests__/components/PhotoGallery.test.tsx` | Wave 0 |
| EDIT-04d | Delete photo removes from grid and calls API | unit | `cd apps/web && pnpm vitest run __tests__/components/PhotoGallery.test.tsx` | Wave 0 |
| EDIT-05a | Image optimization pipe resizes to 1200px WebP | unit | `cd apps/api && pnpm vitest run src/invitations/pipes/image-optimization.pipe.spec.ts` | Wave 0 |
| EDIT-05b | Magic-byte validation rejects non-image files | unit | `cd apps/api && pnpm vitest run src/invitations/pipes/image-optimization.pipe.spec.ts` | Wave 0 |
| EDIT-06a | Music picker renders track list | unit | `cd apps/web && pnpm vitest run __tests__/components/MusicPicker.test.tsx` | Wave 0 |
| EDIT-06b | Music picker highlights selected track | unit | `cd apps/web && pnpm vitest run __tests__/components/MusicPicker.test.tsx` | Wave 0 |
| EDIT-07a | Bank QR upload renders preview after upload | unit | `cd apps/web && pnpm vitest run __tests__/components/BankQrUpload.test.tsx` | Wave 0 |
| EDIT-07b | Bank name/account fields update invitation | unit | `cd apps/web && pnpm vitest run __tests__/components/BankQrUpload.test.tsx` | Wave 0 |
| EDIT-07c | Upload endpoint validates and stores QR image | unit | `cd apps/api && pnpm vitest run src/invitations/invitations.service.spec.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `cd apps/web && pnpm vitest run` + `cd apps/api && pnpm vitest run`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/web/__tests__/components/PhotoGallery.test.tsx` -- covers EDIT-04
- [ ] `apps/web/__tests__/components/MusicPicker.test.tsx` -- covers EDIT-06
- [ ] `apps/web/__tests__/components/BankQrUpload.test.tsx` -- covers EDIT-07
- [ ] `apps/api/src/invitations/pipes/image-optimization.pipe.spec.ts` -- covers EDIT-05
- [ ] `apps/api/src/invitations/invitations.service.spec.ts` -- covers media service methods

## Sources

### Primary (HIGH confidence)
- [sharp official docs](https://sharp.pixelplumbing.com/) - resize API, WebP output, version 0.34.5
- [@dnd-kit docs](https://docs.dndkit.com/presets/sortable) - SortableContext, rectSortingStrategy
- [NestJS file upload docs](https://docs.nestjs.com/techniques/file-upload) - FileInterceptor, ParseFilePipe, MaxFileSizeValidator
- [Supabase Storage docs](https://supabase.com/docs/guides/storage/uploads/standard-uploads) - upload API, bucket creation, public URLs
- [Supabase Storage buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals) - public vs private, RLS policies
- [howler.js official](https://howlerjs.com/) - v2.2.4, API, cross-browser audio
- [magic-bytes.js GitHub](https://github.com/LarsKoelpin/magic-bytes) - CJS compatible (tsconfig module: commonjs), v1.13.0

### Secondary (MEDIUM confidence)
- [framer-motion Reorder grid bug #2089](https://github.com/framer/motion/issues/2089) - Confirmed: Reorder on both axes not working well
- [framer-motion Reorder grid bug #1986](https://github.com/framer/motion/issues/1986) - Confirmed: Grid reorder issues
- [Supabase bucket creation via SQL](https://github.com/orgs/supabase/discussions/3528) - INSERT INTO storage.buckets pattern
- [NestJS ESM compatibility issues](https://github.com/nestjs/nest/issues/7021) - file-type ESM-only incompatible

### Tertiary (LOW confidence)
- System music track seed data -- placeholder structure only, actual audio files TBD

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified (versions, CJS compatibility, API surface)
- Architecture: HIGH -- builds directly on established project patterns (SupabaseAdminService, FIELD_MAP, EditorForm accordion, apiFetch)
- Pitfalls: HIGH -- confirmed via official docs and GitHub issues (Reorder grid bug, file-type ESM, MIME spoofing)
- Validation: MEDIUM -- test structure follows existing patterns but actual test files need creation

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (30 days -- all libraries are stable/mature)
