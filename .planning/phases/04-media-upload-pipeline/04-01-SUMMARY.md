---
phase: 04-media-upload-pipeline
plan: 01
subsystem: api
tags: [sharp, multer, supabase-storage, webp, magic-bytes, nestjs, file-upload]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "SupabaseAdminService, NestJS app structure, Invitation CRUD"
  - phase: 03-invitation-editor-core
    provides: "Editor form, auto-save, FIELD_MAP pattern"
provides:
  - "5 NestJS upload/media endpoints (photos, delete photo, bank QR, photo order, music tracks)"
  - "Database migration with media columns, system_music_tracks table, 3 storage buckets"
  - "Invitation type extended with photoUrls, musicTrackId, bankQrUrl, bankName, bankAccountHolder"
  - "SystemMusicTrack type in packages/types"
  - "apiUpload<T> utility for FormData uploads"
  - "Sharp WebP image compression pipeline with magic-byte validation"
affects: [04-media-upload-pipeline, 05-public-invitation-page]

# Tech tracking
tech-stack:
  added: [sharp, magic-bytes.js, "@types/multer"]
  patterns: ["Dedicated upload endpoints separate from FIELD_MAP auto-save", "Magic-byte MIME validation before processing", "WebP compression pipeline (1200px max, quality 75)", "Storage path extraction from Supabase public URLs"]

key-files:
  created:
    - "supabase/migrations/002_media_columns.sql"
    - "packages/types/src/music.ts"
  modified:
    - "apps/api/src/invitations/invitations.service.ts"
    - "apps/api/src/invitations/invitations.controller.ts"
    - "apps/api/src/invitations/dto/update-invitation.dto.ts"
    - "packages/types/src/invitation.ts"
    - "packages/types/src/index.ts"
    - "apps/web/lib/api.ts"

key-decisions:
  - "photoUrls and bankQrUrl excluded from FIELD_MAP to prevent arbitrary URL injection via generic PATCH"
  - "Dedicated PATCH :id/photo-order endpoint for drag-reorder persistence"
  - "GET music-tracks route placed before :id param route to avoid NestJS route conflict"
  - "Bank QR upload uses upsert:true to replace existing file at same path"
  - "Photo order validation requires exact same URL set (prevents URL injection via reorder endpoint)"

patterns-established:
  - "Upload endpoints use FilesInterceptor/FileInterceptor with ParseFilePipe MaxFileSizeValidator"
  - "processImage validates magic bytes then compresses via sharp to WebP"
  - "extractStoragePath parses Supabase public URL to get storage path for deletion"
  - "apiUpload sends FormData without Content-Type header (browser sets multipart boundary)"

requirements-completed: [EDIT-04, EDIT-05, EDIT-07]

# Metrics
duration: 8min
completed: 2026-03-15
---

# Phase 4 Plan 01: Media Upload Pipeline Backend Summary

**NestJS upload endpoints with sharp WebP compression, magic-byte validation, dedicated photo-order persistence, system music tracks query, and apiUpload utility for FormData**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-15T02:07:58Z
- **Completed:** 2026-03-15T02:16:14Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Database migration adding 5 media columns to invitations, system_music_tracks table, and 3 storage buckets with RLS policies
- 5 new NestJS endpoints: POST photos (multi-file), DELETE photo by index, POST bank-qr, PATCH photo-order, GET music-tracks
- Sharp image pipeline: magic-byte validation (JPEG/PNG/WebP only), resize to 1200px max width, WebP quality 75
- Photo reorder via dedicated endpoint (photoUrls excluded from FIELD_MAP to prevent URL injection)
- apiUpload<T> utility for frontend FormData uploads without Content-Type header

## Task Commits

Each task was committed atomically:

1. **Task 1: Database migration, shared types, and install dependencies** - `2da79d8` (feat)
2. **Task 2: NestJS upload endpoints with sharp compression, magic-byte validation, photo-order endpoint, and apiUpload utility** - `fd39ddb` (feat)

## Files Created/Modified
- `supabase/migrations/002_media_columns.sql` - Media columns, system_music_tracks table, storage buckets, RLS policies
- `packages/types/src/invitation.ts` - Extended with photoUrls, musicTrackId, bankQrUrl, bankName, bankAccountHolder
- `packages/types/src/music.ts` - SystemMusicTrack interface
- `packages/types/src/index.ts` - Re-export music types
- `apps/api/src/invitations/invitations.service.ts` - 5 new methods, processImage, extractStoragePath, extended InvitationRow/FIELD_MAP/SELECT_ALL/mapRow
- `apps/api/src/invitations/invitations.controller.ts` - 5 new endpoints with Multer interceptors and ParseFilePipe validators
- `apps/api/src/invitations/dto/update-invitation.dto.ts` - Added musicTrackId, bankName, bankAccountHolder with validators
- `apps/web/lib/api.ts` - Added apiUpload<T> function for FormData uploads
- `apps/api/src/invitations/__tests__/invitations.service.spec.ts` - Updated mocks for new fields and single-client constructor
- `apps/web/__tests__/components/InvitationCard.test.tsx` - Added media fields to test mock
- `apps/web/__tests__/components/InvitationGrid.test.tsx` - Added media fields to test mock
- `apps/api/test/setup.ts` - Added vitest import for beforeAll
- `apps/api/package.json` - Added sharp, magic-bytes.js, @types/multer

## Decisions Made
- photoUrls and bankQrUrl excluded from FIELD_MAP to prevent arbitrary URL injection via generic PATCH endpoint
- Dedicated PATCH :id/photo-order endpoint for drag-reorder persistence instead of using auto-save
- GET music-tracks route placed before :id param route to avoid NestJS route conflict
- Bank QR upload uses upsert:true to replace existing file at same path without manual delete+upload
- Photo order validation checks exact same URL set to prevent URL injection via reorder endpoint
- Used @repo/types alias (not @online-weeding/types) matching existing tsconfig paths

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test mocks missing new media fields**
- **Found during:** Task 2 (TypeScript compilation check)
- **Issue:** Test mock rows in invitations.service.spec.ts, InvitationCard.test.tsx, and InvitationGrid.test.tsx did not include the 5 new media fields (photoUrls, musicTrackId, bankQrUrl, bankName, bankAccountHolder), causing TS2322 type errors
- **Fix:** Added media field defaults to all makeInvitation helpers and baseMockRow
- **Files modified:** apps/api/src/invitations/__tests__/invitations.service.spec.ts, apps/web/__tests__/components/InvitationCard.test.tsx, apps/web/__tests__/components/InvitationGrid.test.tsx
- **Verification:** TypeScript compiles cleanly, all 28 tests pass
- **Committed in:** fd39ddb (Task 2 commit)

**2. [Rule 1 - Bug] Fixed test constructor signature after single-client refactor**
- **Found during:** Task 2 (TypeScript compilation check)
- **Issue:** invitations.service.spec.ts created InvitationsService with 2 arguments (userMock, adminMock) but constructor now takes only 1 (supabaseAdmin). Tests also referenced non-existent viewCount field.
- **Fix:** Updated makeService to accept single mock, fixed publish/slug tests to use single mock, replaced viewCount assertion with photoUrls assertion
- **Files modified:** apps/api/src/invitations/__tests__/invitations.service.spec.ts
- **Verification:** All 28 tests pass
- **Committed in:** fd39ddb (Task 2 commit)

**3. [Rule 3 - Blocking] Added missing vitest import in test/setup.ts**
- **Found during:** Task 2 (TypeScript compilation check)
- **Issue:** apps/api/test/setup.ts used beforeAll() without importing from vitest, causing TS2304 error
- **Fix:** Added `import { beforeAll } from 'vitest'`
- **Files modified:** apps/api/test/setup.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** fd39ddb (Task 2 commit)

**4. [Rule 1 - Bug] Fixed @online-weeding/types import alias**
- **Found during:** Task 2 (implementation)
- **Issue:** Plan referenced @online-weeding/types but tsconfig paths uses @repo/types alias
- **Fix:** Changed import to `@repo/types`
- **Files modified:** apps/api/src/invitations/invitations.service.ts
- **Committed in:** fd39ddb (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (3 bugs, 1 blocking)
**Impact on plan:** All auto-fixes necessary for type correctness after extending the Invitation interface. No scope creep.

## Issues Encountered
- Pre-existing TS2367 error in apps/web/__tests__/middleware.test.ts (comparing "user" and "admin" types) -- not caused by this plan's changes, left as-is

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Upload endpoints ready for frontend consumption in Plans 02 (PhotoGallery, MusicPicker) and 03 (BankQrUpload)
- apiUpload utility ready for FormData uploads from React components
- System music tracks table ready for admin seeding (no tracks yet -- will be added in admin panel or migration)

## Self-Check: PASSED

All files verified present. Both task commits (2da79d8, fd39ddb) confirmed in git history.

---
*Phase: 04-media-upload-pipeline*
*Completed: 2026-03-15*
