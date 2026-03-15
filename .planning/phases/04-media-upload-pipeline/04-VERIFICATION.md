---
phase: 04-media-upload-pipeline
verified: 2026-03-15T04:00:00Z
status: gaps_found
score: 13/14 must-haves verified
gaps:
  - truth: "Photo order changes persist via dedicated PATCH :id/photo-order endpoint (not through FIELD_MAP auto-save)"
    status: partial
    reason: "PhotoGallery.tsx calls apiFetch for both DELETE photo and PATCH photo-order without passing credentials:'include', so cookies (JWT) will not be sent in the cross-origin dev setup (localhost:3000 -> localhost:4000). Both calls will return 401 Unauthorized."
    artifacts:
      - path: "apps/web/app/(app)/thep-cuoi/[id]/PhotoGallery.tsx"
        issue: "apiFetch at lines 200-203 (PATCH photo-order) and lines 217-220 (DELETE photo) omit credentials:'include'. Every other apiFetch call in the editor (useAutoSave, MusicPicker, PublishButton) passes credentials:'include'."
    missing:
      - "Add credentials:'include' to the apiFetch PATCH photo-order call at line 200"
      - "Add credentials:'include' to the apiFetch DELETE photos/:index call at line 217"
human_verification:
  - test: "Upload a photo in the editor, then drag it to reorder"
    expected: "Photo moves immediately, reorder persists after page refresh"
    why_human: "End-to-end storage write (Supabase) and CORS cookie behavior cannot be verified statically"
  - test: "Select a background music track and save"
    expected: "Selected track highlighted with checkmark; music persists after page refresh"
    why_human: "Requires running app with Supabase connection and seeded music tracks"
  - test: "Upload a bank QR image and enter bank name"
    expected: "QR image preview appears; bank name and holder text save; QR renders in invitation preview"
    why_human: "Requires live Supabase storage upload"
  - test: "Upload a photo and check that the editor preview shows it"
    expected: "Photo appears in template gallery section immediately after upload"
    why_human: "Requires live upload and state propagation through onChange chain"
---

# Phase 4: Media Upload Pipeline Verification Report

**Phase Goal:** A couple can upload and reorder wedding photos, select background music from system library, and upload their bank QR image — all assets are server-validated, compressed, and stored securely

**Verified:** 2026-03-15T04:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Test stub files exist for all 4 phase requirements before production code | VERIFIED | All 6 files present with correct `describe` blocks |
| 2 | System music tracks are queryable via GET /invitations/music-tracks endpoint | VERIFIED | Controller line 50-53, Service line 473-483 |
| 3 | Invitation type includes photoUrls, musicTrackId, bankQrUrl, bankName, bankAccountHolder | VERIFIED | packages/types/src/invitation.ts lines 18-22 |
| 4 | User can upload photos and bank QR images from the browser to the server | VERIFIED | PhotoGallery.tsx apiUpload call line 133, BankQrUpload.tsx apiUpload call line 39 |
| 5 | Bank QR upload endpoint validates magic bytes, compresses, stores in Supabase Storage | VERIFIED | processImage() lines 164-180, uploadBankQr() lines 383-431 |
| 6 | Photo delete endpoint removes file from storage and URL from array | VERIFIED | deletePhoto() lines 344-377 with storage.remove() |
| 7 | Photo reorder endpoint persists new URL order without FIELD_MAP | VERIFIED | updatePhotoOrder() lines 439-468; photoUrls excluded from FIELD_MAP (lines 59-72) |
| 8 | User can drag-drop or click to upload photos, see upload progress, and reorder thumbnails | VERIFIED | PhotoGallery.tsx full implementation (304 lines) with dnd-kit + drag overlay |
| 9 | User can delete individual photos from the gallery grid | VERIFIED | handleDelete callback lines 213-234, DELETE endpoint wired |
| 10 | User can browse system music tracks with howler.js preview and select one | VERIFIED | MusicPicker.tsx full implementation (199 lines) with dynamic Howl import |
| 11 | User can upload a bank QR image and enter bank name and account holder fields | VERIFIED | BankQrUpload.tsx full implementation (138 lines) |
| 12 | All three media sections appear as accordion items 4/6, 5/6, 6/6 in EditorForm | VERIFIED | EditorForm.tsx lines 149-189, 6 AccordionItems numbered correctly |
| 13 | Photos and bank QR render in all 3 templates conditionally | VERIFIED | All 3 templates contain photoUrls.map and bankQrUrl conditionals |
| 14 | Photo delete/reorder calls send JWT cookie to cross-origin API | FAILED | PhotoGallery.tsx apiFetch calls at lines 200 and 217 omit credentials:'include' |

**Score:** 13/14 truths verified

---

## Required Artifacts

### Plan 04-00 (Wave 0 Test Stubs)

| Artifact | Provides | Status | Details |
|----------|---------|--------|---------|
| `apps/web/__tests__/components/PhotoGallery.test.tsx` | Stub tests for EDIT-04 photo gallery | VERIFIED | `describe('PhotoGallery')` present, 11 it.todo stubs |
| `apps/web/__tests__/components/MusicPicker.test.tsx` | Stub tests for EDIT-06 music picker | VERIFIED | `describe('MusicPicker')` present, 8 it.todo stubs |
| `apps/web/__tests__/components/BankQrUpload.test.tsx` | Stub tests for EDIT-07 bank QR upload | VERIFIED | `describe('BankQrUpload')` present, 8 it.todo stubs |
| `apps/web/__tests__/components/templates.test.tsx` | Stub tests for template photo/QR rendering | VERIFIED | `describe('Template photo gallery and bank QR rendering')` present |
| `apps/api/src/invitations/pipes/image-optimization.pipe.spec.ts` | Stub tests for EDIT-05 processImage | VERIFIED | `describe('processImage (image optimization)')` present, 10 it.todo stubs |
| `apps/api/src/invitations/__tests__/invitations.service.spec.ts` | Extended with media upload test stubs | VERIFIED | uploadPhotos, deletePhoto, uploadBankQr, updatePhotoOrder, listMusicTracks describes present at lines 505-536 |

### Plan 04-01 (Backend Foundation)

| Artifact | Provides | Status | Details |
|----------|---------|--------|---------|
| `supabase/migrations/002_media_columns.sql` | Media columns, system_music_tracks table, 3 storage buckets | VERIFIED | All 5 media columns, system_music_tracks, invitation-photos/bank-qr/system-music buckets, RLS policies |
| `packages/types/src/invitation.ts` | Extended Invitation interface with media fields | VERIFIED | photoUrls, musicTrackId, bankQrUrl, bankName, bankAccountHolder at lines 18-22 |
| `packages/types/src/music.ts` | SystemMusicTrack interface | VERIFIED | Full 10-field interface |
| `packages/types/src/index.ts` | Re-exports music types | VERIFIED | `export * from './music'` at line 4 |
| `apps/api/src/invitations/invitations.service.ts` | 5 upload methods + processImage | VERIFIED | uploadPhotos (285), deletePhoto (344), uploadBankQr (383), updatePhotoOrder (439), listMusicTracks (473), processImage (164) — all fully implemented with DB writes |
| `apps/api/src/invitations/invitations.controller.ts` | 5 new endpoints with Multer interceptors | VERIFIED | POST :id/photos (75), DELETE :id/photos/:index (95), POST :id/bank-qr (107), PATCH :id/photo-order (129), GET music-tracks (50) — all wired to service methods |
| `apps/web/lib/api.ts` | apiUpload function for FormData uploads | VERIFIED | Lines 44-68, no Content-Type header, credentials:'include' |

### Plan 04-02 (UI Components)

| Artifact | Provides | Status | Details |
|----------|---------|--------|---------|
| `apps/web/app/(app)/thep-cuoi/[id]/PhotoGallery.tsx` | Photo grid with drag-drop reorder, upload, delete | VERIFIED (304 lines, >100 min) | dnd-kit SortableContext, apiUpload for upload, handleDelete, handleDragEnd — all fully implemented. CAVEAT: apiFetch calls missing credentials |
| `apps/web/app/(app)/thep-cuoi/[id]/MusicPicker.tsx` | Music track list with howler.js preview and selection | VERIFIED (199 lines, >60 min) | Dynamic Howl import, 30s auto-stop, toggle selection, cleanup on unmount |
| `apps/web/app/(app)/thep-cuoi/[id]/BankQrUpload.tsx` | Single image upload with bank name/holder fields | VERIFIED (138 lines, >50 min) | apiUpload to bank-qr endpoint, two Input fields wired to onChange |
| `apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx` | 6-section accordion with media components | VERIFIED | PhotoGallery, MusicPicker, BankQrUpload imported and used; sections numbered 1/6-6/6 |
| `apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx` | Passes invitationId to EditorForm | VERIFIED | Line 101: `<EditorForm invitationId={invitation.id} .../>` |

### Plan 04-03 (Template Extensions)

| Artifact | Provides | Status | Details |
|----------|---------|--------|---------|
| `apps/web/components/templates/TemplateTraditional.tsx` | Photo gallery and bank QR sections | VERIFIED | Lines 124-147 (photo gallery), 150-180 (bank QR), conditional rendering, lazy loading |
| `apps/web/components/templates/TemplateModern.tsx` | Photo gallery and bank QR sections | VERIFIED | Lines 111-130 (photo gallery), 133-159 (bank QR), conditional rendering, lazy loading |
| `apps/web/components/templates/TemplateMinimalist.tsx` | Photo gallery and bank QR sections | VERIFIED | Lines 98-117 (photo gallery), 120-146 (bank QR), conditional rendering, lazy loading |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `invitations.controller.ts` | `invitations.service.ts` | uploadPhotos/deletePhoto/uploadBankQr/updatePhotoOrder calls | WIRED | Lines 89, 101, 121, 135 |
| `invitations.service.ts` | `supabaseAdmin.client.storage` | storage.from('invitation-photos'/.upload/.remove | WIRED | Lines 306-323, 358-363, 404-419 |
| `apps/web/lib/api.ts` | NestJS upload endpoints | fetch with FormData body | WIRED | apiUpload at lines 44-68 |
| `PhotoGallery.tsx` | `/invitations/:id/photos` (upload) | apiUpload with FormData field 'photos' | WIRED | Line 133-136 |
| `PhotoGallery.tsx` | `/invitations/:id/photo-order` | apiFetch PATCH | WIRED (missing credentials) | Line 201, but no `credentials:'include'` — see gap |
| `PhotoGallery.tsx` | `/invitations/:id/photos/:index` (DELETE) | apiFetch DELETE | WIRED (missing credentials) | Line 217, but no `credentials:'include'` — see gap |
| `MusicPicker.tsx` | `/invitations/music-tracks` | apiFetch GET with credentials:'include' | WIRED | Lines 28-31 |
| `BankQrUpload.tsx` | `/invitations/:id/bank-qr` | apiUpload FormData field 'file' | WIRED | Lines 39-41 |
| `EditorForm.tsx` | `PhotoGallery`, `MusicPicker`, `BankQrUpload` | Component imports and props wiring | WIRED | Lines 13-15 (imports), 154-188 (usage) |
| `EditorShell.tsx` | `EditorForm` | invitationId prop | WIRED | Line 101 |
| `TemplateTraditional.tsx` | `Invitation.photoUrls` | invitation.photoUrls.map rendering | WIRED | Line 136 |
| `TemplateTraditional.tsx` | `Invitation.bankQrUrl` | Conditional rendering of Mung cuoi section | WIRED | Line 150 |

---

## Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| EDIT-04 | 04-00, 04-01, 04-02, 04-03 | User can upload multiple photos with drag-drop reordering | SATISFIED | PhotoGallery component with dnd-kit, upload endpoint POST :id/photos, photo-order endpoint |
| EDIT-05 | 04-00, 04-01 | System auto-optimizes uploaded photos for mobile | SATISFIED | processImage() validates magic bytes, resizes to 1200px max, converts to WebP quality 75 |
| EDIT-06 | 04-00, 04-02 | User can choose background music from system library | SATISFIED | MusicPicker fetches system tracks, howler.js 30-sec preview, toggle selection wired through onChange |
| EDIT-07 | 04-00, 04-01, 04-02, 04-03 | User can upload their bank QR image for gift money display | SATISFIED | BankQrUpload component, POST :id/bank-qr endpoint, bank info fields, template rendering |

Note: REQUIREMENTS.md marks all four as complete (Phase 4, checked). Plan 04-03 SUMMARY erroneously lists EDIT-05 in requirements-completed but 04-03-PLAN.md correctly scopes it to template rendering (EDIT-04 and EDIT-07) — EDIT-05 was delivered in 04-01. This is a documentation inconsistency only; the actual EDIT-05 implementation is verified in invitations.service.ts.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `apps/web/app/(app)/thep-cuoi/[id]/PhotoGallery.tsx` | 200-203 | `apiFetch` without `credentials:'include'` for PATCH photo-order | Blocker | JWT cookie not sent cross-origin; 401 response breaks reorder persistence |
| `apps/web/app/(app)/thep-cuoi/[id]/PhotoGallery.tsx` | 217-220 | `apiFetch` without `credentials:'include'` for DELETE photos/:index | Blocker | JWT cookie not sent cross-origin; 401 response breaks photo deletion |

Evidence: `api.ts` line 1 shows `const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'`. The `.env.local` file confirms `NEXT_PUBLIC_API_URL=http://localhost:4000`. The web app runs on a different port (3000), making this cross-origin. Every other authenticated `apiFetch` call in the editor (`useAutoSave` line 44, `MusicPicker` line 30, `PublishButton` lines 60 and 108) explicitly passes `credentials:'include'`. The two PhotoGallery `apiFetch` calls are inconsistent and will fail authentication.

---

## Human Verification Required

### 1. Photo Upload and Reorder Flow

**Test:** Open the editor, upload 2 photos, then drag the second photo to be first.
**Expected:** Photos upload with spinner, appear in grid, reorder updates immediately, and order persists after page refresh.
**Why human:** End-to-end Supabase Storage writes and JWT cookie behavior across ports cannot be verified statically.

### 2. Music Track Selection

**Test:** Open the "Nhac nen (5/6)" accordion section. If music tracks exist, click Play then click a track to select it.
**Expected:** Track plays for 30 seconds then stops; selected track gets rose background and checkmark; selection persists after refresh.
**Why human:** Requires live database with seeded music tracks (none seeded in migration) and audio playback.

### 3. Bank QR Upload and Template Preview

**Test:** Upload a bank QR image, enter bank name and account holder, then observe the invitation preview panel.
**Expected:** QR image appears in preview within the "Mung cuoi" section with bank info below.
**Why human:** Requires live Supabase Storage upload and state propagation through the editor preview.

### 4. Image Compression Verification

**Test:** Upload a large JPEG photo (> 1200px wide) and inspect the stored file's dimensions and format.
**Expected:** Stored file is WebP format, <= 1200px width, approximately 75% quality.
**Why human:** Requires inspecting actual Supabase Storage objects after upload.

---

## Gaps Summary

One gap blocks complete goal achievement:

**PhotoGallery apiFetch calls missing credentials** — The two `apiFetch` calls in `PhotoGallery.tsx` for photo deletion and photo reorder do not pass `credentials: 'include'`. Since the app is cross-origin in both development (`localhost:3000` -> `localhost:4000`) and typical production configurations, HTTP-only cookies (JWT) will not be forwarded. The JwtGuard will reject these requests with 401. The fix is two-line: add `credentials: 'include'` to the options object on lines 200 and 217 of `PhotoGallery.tsx`.

This gap is isolated: upload (apiUpload hardcodes credentials), music selection (passes credentials), bank QR (apiUpload hardcodes credentials), and auto-save (passes credentials) all work correctly.

---

_Verified: 2026-03-15T04:00:00Z_
_Verifier: Claude (gsd-verifier)_
