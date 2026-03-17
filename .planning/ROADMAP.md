# Roadmap: Thiệp Cưới Online (Vietnamese Online Wedding Invitation)

## Overview

This roadmap builds a self-service SaaS platform for Vietnamese couples to create, share, and monetize online wedding invitations. The build sequence prioritizes correctness over speed: auth and security boundaries first, then invitation data, then media, then the public-facing experience that guests actually see, then the Save-the-Date teaser feature, then monetization, then admin tooling, then system-wide polish. Each phase delivers a coherent, independently verifiable capability. The product's differentiating moments — the envelope opening animation, VietQR bank display, and `?to=Name` guest personalization — arrive in Phase 5, built on top of a correctly-secured, fully-tested foundation.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Monorepo, Supabase schema with RLS, NestJS auth module, and shared TypeScript types (completed 2013-03-14)
- [x] **Phase 2: App Shell** - Next.js route groups, auth middleware, dashboard UI, and admin layout skeleton (completed 2013-03-14)
- [ ] **Phase 3: Invitation Editor Core** - Invitation CRUD, real-time preview, 3 templates, auto-save, and publish control
- [ ] **Phase 4: Media Upload Pipeline** - Photo gallery with drag-drop reordering, music selection/upload, bank QR upload, and server-side compression
- [ ] **Phase 5: Public Invitation Page** - Public `/w/{slug}` page, QR generation, envelope animation, guest personalization, OG tags, and auto-expiry
- [x] **Phase 6: Save-the-Date** - Teaser page feature for publishing couple names and date before the full invitation is ready (completed 2013-03-15)
- [ ] **Phase 7: Monetization** - Free/Premium tiers, watermark enforcement, admin payment QR, and manual Premium grant workflow
- [ ] **Phase 8: Admin Panel** - All 8 admin sections: users, invitations, themes, music library, plans, payments, system settings
- [ ] **Phase 9: Polish and Performance** - 3G optimization, auto-expiry cron, elderly UX, animation fallbacks, and production hardening
- [ ] **Phase 11: Custom Theme Builder** - Data-driven template system allowing admin to create new themes from the admin panel without code changes
- [ ] **Phase 12: Security Hardening** - Rate limiting, anti-spam, storage abuse prevention, content protection, input sanitization, and API security

## Phase Details

### Phase 1: Foundation
**Goal**: The project is runnable, Supabase is configured with RLS-enabled schema, NestJS serves authenticated requests, and TypeScript types are shared end-to-end
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, SYST-01, SYST-03
**Success Criteria** (what must be TRUE):
  1. User can register a new account with email or phone number plus password
  2. User can log in and their session persists across browser refresh without re-entering credentials
  3. User can log out from any page and their session is immediately invalidated
  4. User can request a password reset link and successfully set a new password via that link
  5. An authenticated user cannot access or modify another user's data (returns 403 or equivalent)
**Plans**: 5 plans

Plans:
- [ ] 01-01-PLAN.md — pnpm monorepo scaffold with Turborepo, apps/web (Next.js 16), apps/api (NestJS 11), packages/types
- [ ] 01-02-PLAN.md — Supabase schema (users, invitations, password_reset_tokens), RLS policies, NestJS two-client Supabase module, Vitest setup
- [ ] 01-03-PLAN.md — NestJS auth module: register/login/logout/reset endpoints, JwtGuard, AdminGuard, unit tests
- [ ] 01-04-PLAN.md — Next.js auth pages wired to NestJS endpoints, httpOnly cookie session, middleware route guard
- [ ] 01-05-PLAN.md — Vietnamese UI baseline: Be Vietnam Pro font, Tailwind v4 CSS-first config, soft pink/rose palette

### Phase 2: App Shell
**Goal**: The application has a navigable shell with protected route groups, a functioning dashboard where users see their invitations, and an admin layout that enforces role separation
**Depends on**: Phase 1
**Requirements**: DASH-01, DASH-02, DASH-03, SYST-04, ADMN-01
**Success Criteria** (what must be TRUE):
  1. Authenticated user lands on a dashboard showing their invitation list with status labels (Nháp / Đã xuất bản / Hết hạn)
  2. User can tap "Tạo mới" to create a new invitation and be taken to the editor
  3. Each invitation card has working buttons to enter the editor and view the public page — NO QR code button (share via link only)
  4. Unauthenticated user accessing any `/app/*` route is redirected to the login page
  5. Accessing `/admin` without admin role returns 403 — guest and user sessions cannot reach admin pages
**Plans**: 4 plans

Plans:
- [ ] 02-01-PLAN.md — Next.js route groups (site/auth/app/admin), middleware auth guard, AppSidebar, AdminSidebar, TopBar, Vitest web config
- [ ] 02-02-PLAN.md — Dashboard page with invitation card grid, StatusBadge, EmptyState, CreateWizard (2-step), framer-motion stagger animations
- [ ] 02-03-PLAN.md — Admin dashboard skeleton: stat cards + recharts chart placeholders, neutral gray theme (checkpoint for visual verify)
- [ ] 02-04-PLAN.md — NestJS invitations module: GET /invitations + POST /invitations with JwtGuard, ownership enforcement, DTO validation

### Phase 3: Invitation Editor Core
**Goal**: A couple can fill in all invitation text fields, select a template, see a live preview that matches the final public page, and publish or unpublish their invitation
**Depends on**: Phase 2
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-08, EDIT-09, EDIT-10, SYST-02
**Success Criteria** (what must be TRUE):
  1. User can enter bride/groom names, wedding date/time, venue address, invitation message, and thank-you text — all fields save automatically without a save button
  2. As the user types, the preview pane updates in real time using the actual template component (not a simplified version)
  3. User can switch between Traditional, Modern, and Minimalist templates and immediately see the preview change
  4. User can preview the complete invitation as a guest would see it before publishing
  5. User can publish the invitation (generating the slug) and unpublish it — the slug never changes after first publish
**Plans**: 5 plans

Plans:
- [ ] 03-01-PLAN.md — NestJS API: GET /:id, PATCH /:id (auto-save target), POST publish/unpublish with slug generation and lock
- [ ] 03-02-PLAN.md — 3 template components (Traditional/Modern/Minimalist) + TemplateRenderer + shadcn accordion/textarea install
- [ ] 03-03-PLAN.md — Editor page: side-by-side form + live preview, accordion sections, 800ms debounced auto-save, template selector
- [ ] 03-04-PLAN.md — Publish/unpublish UI with confirmation dialogs, confetti celebration, and full-page preview dialog
- [ ] 03-05-PLAN.md — Gap closure: add standalone preview button visible for draft invitations (EDIT-09 fix)

### Phase 4: Media Upload Pipeline
**Goal**: A couple can upload and reorder wedding photos, select background music from the system library, and upload their bank QR image — all assets are server-validated, compressed to WebP, and stored securely in Supabase Storage
**Depends on**: Phase 3
**Requirements**: EDIT-04, EDIT-05, EDIT-06, EDIT-07
**Success Criteria** (what must be TRUE):
  1. User can upload multiple photos (drag-drop or file picker), reorder them by dragging, and delete individual photos — the gallery order is saved and reflects on the public page
  2. Uploaded photos are automatically optimized (resized to 1200px max width, converted to WebP) without any action from the user
  3. User can select a background music track from the system library or upload their own MP3 file
  4. User can upload their bank QR image (PNG or JPG) and it appears in the invitation for guests to scan
  5. All uploads are rejected if the file exceeds the plan's storage quota — user sees a clear error in Vietnamese
**Plans**: 4 plans

Plans:
- [ ] 04-00-PLAN.md — Wave 0: test stub scaffolds for all phase requirements (PhotoGallery, MusicPicker, BankQrUpload, image-optimization, service media methods)
- [ ] 04-01-PLAN.md — DB migration (media columns + system_music_tracks + storage buckets), shared types extension, NestJS upload/delete/photo-order endpoints with sharp + magic-bytes, apiUpload utility
- [ ] 04-02-PLAN.md — PhotoGallery (dnd-kit grid reorder + upload + delete), MusicPicker (howler.js 30s preview), BankQrUpload, EditorForm 6-section integration
- [ ] 04-03-PLAN.md — Template extension: add photo gallery and bank QR rendering to all 3 templates (Traditional, Modern, Minimalist)

### Phase 5: Public Invitation Page
**Goal**: Guests can open the invitation URL, experience the envelope opening animation, see all invitation details, hear music they control, view the bank QR, and share the link with proper Zalo/Facebook preview
**Depends on**: Phase 4
**Requirements**: PUBL-01, PUBL-02, PUBL-03, PUBL-04, PUBL-05, PUBL-06, PUBL-07, PUBL-08, PUBL-09, PUBL-10, PUBL-11, PUBL-12
**Success Criteria** (what must be TRUE):
  1. Navigating to `/w/{slug}` without being logged in shows the invitation — no login required
  2. The page opens with a rich envelope animation (particles, falling petals, transitions); tapping the envelope reveals the full invitation and unlocks audio
  3. Adding `?to=TênKhách` to the URL shows a personalized greeting with the guest's name
  4. The full invitation displays couple names, photos, message, date/time, venue, countdown timer, bank QR image, and thank-you text
  5. Background music plays only after the guest taps the envelope (no autoplay); a visible play/pause button lets guests control it
  6. Sharing the link on Zalo or Facebook shows the couple's photo as the preview image with the invitation title
  7. After the wedding date plus the configured grace period, the URL switches to a thank-you page rather than going to a 404
**Plans**: 7 plans

Plans:
- [ ] 05-00-PLAN.md — Wave 0: test stubs for all PUBL requirements + install qrcode dependency
- [ ] 05-01-PLAN.md — Public NestJS endpoint (findBySlug with expiry logic) + QR code generation at publish time
- [ ] 05-02-PLAN.md — ISR revalidation route handler + NestJS revalidation trigger + htmlLimitedBots for Zalo
- [ ] 05-03-PLAN.md — Public page shell at /w/[slug] with generateMetadata OG tags, ThankYouPage, InvitationShell skeleton
- [ ] 05-04-PLAN.md — EnvelopeAnimation (framer-motion multi-stage reveal, confetti burst) + FallingPetals (CSS keyframes)
- [ ] 05-05-PLAN.md — MusicPlayer (howler.js floating button, equalizer bars) + CountdownTimer (flip-clock) + guest name parsing
- [ ] 05-06-PLAN.md — Wire all components into InvitationShell + visual checkpoint

### Phase 05.1: Dual-family ceremony info — groom and bride family details, parents names, dual ceremony venues and times (INSERTED)

**Goal:** Vietnamese invitations display culturally correct dual-family ceremony information with per-family parent names, venues, dates/times, a love story timeline, and side-specific URLs so each family receives only their relevant details
**Requirements**: DUAL-SCHEMA, DUAL-API, DUAL-EDITOR, DUAL-TEMPLATES, DUAL-LOVESTORY, DUAL-URL, DUAL-DASHBOARD
**Depends on:** Phase 5
**Success Criteria** (what must be TRUE):
  1. Each family side (Nha trai / Nha gai) has independent father, mother, ceremony date/time, and venue fields in the database and editor
  2. Love story timeline supports up to 5 milestones (date + title + description) stored as JSONB
  3. All 3 templates render parents names, per-family ceremony details, and love story timeline with template-appropriate styling
  4. Visiting /w/{slug}?side=groom shows only groom family info, and ?side=bride shows only bride family info (default = groom)
  5. Dashboard shows two copy-link buttons (Link nha trai / Link nha gai) per published invitation
  6. Post-publish celebration dialog displays both family-specific URLs
**Plans:** 4/4 plans complete

Plans:
- [ ] 05.1-01-PLAN.md — DB migration (per-family columns + love_story JSONB, migrate old data, drop old columns), shared types update, NestJS service/DTO update
- [ ] 05.1-02-PLAN.md — Editor form: replace single ceremony section with Nha trai + Nha gai + love story sections (9 total)
- [ ] 05.1-03-PLAN.md — Template rendering: parents names, love story timeline, per-family ceremony details in all 3 templates
- [ ] 05.1-04-PLAN.md — Public page dual-URL system (?side=groom/bride) + dashboard dual copy-link buttons + celebration dialog

### Phase 6: Save-the-Date
**Goal**: A couple can publish a lightweight teaser page with just their names and wedding date before the full invitation is ready, using the same permanent URL
**Depends on**: Phase 5
**Requirements**: SAVE-01, SAVE-02
**Success Criteria** (what must be TRUE):
  1. User can enable "save the date" mode from the dashboard and publish it independently of the full invitation
  2. Guests visiting the URL during save-the-date mode see only the couple names, wedding date, and teaser message — no envelope animation, no full invitation details
  3. When the couple later publishes the full invitation at the same URL, the teaser is replaced and existing QR codes continue to work
**Plans**: 2 plans

Plans:
- [ ] 06-01-PLAN.md — Shared types + DB migration (teaserMessage field), NestJS state machine (publishSaveTheDate endpoint, updated findBySlug for save_the_date status)
- [ ] 06-02-PLAN.md — SaveTheDatePage component, public page routing, editor Save-the-Date button, dashboard badge + InvitationCard update

### Phase 7: Monetization
**Goal**: Per-invitation free/premium tiers with watermark enforcement, blurred bank QR on free tier, upgrade flow via admin bank QR payment, and admin approval workflow
**Depends on**: Phase 6
**Requirements**: PLAN-01, PLAN-02, PLAN-03, PLAN-04
**Success Criteria** (what must be TRUE):
  1. Free tier invitation displays a platform watermark on the public page — the watermark cannot be removed by editing the invitation
  2. Premium tier invitation has no watermark, bank QR is fully visible, and can publish unlimited invitations
  3. Admin panel shows pending upgrade requests that admin can approve or reject
  4. After a user pays and admin grants Premium credit manually, the user's watermark disappears and Premium features unlock — no app restart required
**Plans**: 3 plans

Plans:
- [ ] 07-01-PLAN.md — DB schema (plan + payment_status columns), shared types (InvitationPlan, PaymentStatus), NestJS plan enforcement (free tier publish limit), upgrade request + admin approve/reject endpoints
- [ ] 07-02-PLAN.md — Watermark diagonal overlay component + BankQrLock blur component, wired into InvitationShell and all 3 templates for free tier
- [ ] 07-03-PLAN.md — Upgrade page (/nang-cap/[id]) with admin QR + payment instructions, UpgradeButton in editor/dashboard, admin payments page (/admin/thanh-toan)

### Phase 8: Admin Panel
**Goal**: Admin has a fully functional panel to oversee users, invitations, music library, themes, service plans, payment transactions, and system configuration
**Depends on**: Phase 7
**Requirements**: ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09, ADMN-10
**Success Criteria** (what must be TRUE):
  1. Admin dashboard shows real-time read-only stats: total users, total invitations, active invitations, and revenue summary
  2. Admin can search users by name/email, view their invitations, lock/unlock accounts, and assign or change a user's plan
  3. Admin can view any invitation and disable it for violations — the public page becomes inaccessible — or re-enable it; admin cannot edit invitation content
  4. Admin can manage the system music library: upload new MP3 files, enable/disable tracks; disabled tracks remain audible on existing invitations that already selected them
  5. Admin can configure service plan permissions (photo limits, template access, watermark) and update payment transaction records with refund status and notes
**Plans**: 5 plans

Plans:
- [ ] 08-01-PLAN.md — DB migration (system_settings, is_locked, is_disabled, usage_count, admin_notes), shared types (admin.ts), NestJS AdminModule with all admin endpoints, payments enhancement API
- [ ] 08-02-PLAN.md — Dashboard overview page (real stats + 30-day line chart), Users management page (search, filter, lock/unlock, delete, role change, detail view)
- [ ] 08-03-PLAN.md — Invitations management page (search, filter, read-only view, disable/enable), Music library page (upload MP3, toggle, delete, usage count)
- [ ] 08-04-PLAN.md — Themes page (enable/disable), Service plans page (limit config), System settings page (bank QR, watermark, expiry, upload limits), Payments enhancement (refund, notes, CSV)
- [ ] 08-05-PLAN.md — Gap closure: add revenue stat to dashboard (ADMN-02), fix music track live usage count (ADMN-06)

### Phase 9: Polish and Performance
**Goal**: The platform loads fast on 3G/4G Vietnamese mobile networks, the envelope animation runs smoothly on low-end Android devices, the auto-expiry cron runs reliably, and the experience is accessible for elderly guests
**Depends on**: Phase 8
**Requirements**: PUBL-10
**Success Criteria** (what must be TRUE):
  1. Public invitation page loads under 1MB total page weight on a cold 4G connection with no cached assets
  2. Envelope animation achieves minimum 30fps at 6x CPU throttle on Chrome; on lower-performing devices the animation gracefully falls back to CSS-only transitions
  3. Invitations auto-expire on schedule — the public URL switches to the thank-you page within the configured grace period after the wedding date without manual admin action
  4. Elderly-friendly UX: all touch targets are at least 48px, text is legible at default zoom, the envelope has a visible "Bỏ qua" skip button, and music never starts without explicit user action
  5. Public invitation page has a polished desktop layout — wider content area, decorative framing or side elements, responsive envelope animation that uses available screen space on desktop while maintaining the mobile-first card view on phones
**Plans**: 3 plans

Plans:
- [ ] 09-01-PLAN.md — Performance gate + CSS-only fallback for envelope animation, elderly-friendly music player (56px), bank QR 240px+ with Vietnamese instructions
- [ ] 09-02-PLAN.md — Auto-expiry cron job via @nestjs/schedule (midnight UTC+7), markExpired method, findBySlug expired status handling
- [ ] 09-03-PLAN.md — Desktop decorative floral frame, InvitationShell wiring (petals stop, 16px text), bundle analyzer setup, visual checkpoint

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 5.1 -> 6 -> 7 -> 8 -> 9 -> 9.1 -> 10 -> 11 -> 12 -> 13 -> 14 -> 15

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 5/5 | Complete   | 2013-03-14 |
| 2. App Shell | 4/4 | Complete   | 2013-03-14 |
| 3. Invitation Editor Core | 5/5 | Complete | 2013-03-14 |
| 4. Media Upload Pipeline | 0/4 | Not started | - |
| 5. Public Invitation Page | 7/7 | Complete | 2013-03-16 |
| 5.1 Dual-Family Ceremony | 4/4 | Complete | 2013-03-16 |
| 6. Save-the-Date | 2/2 | Complete   | 2013-03-15 |
| 7. Monetization | 0/3 | Not started | - |
| 8. Admin Panel | 4/5 | In Progress|  |
| 9. Polish and Performance | 3/3 | Complete | 2013-03-16 |
| 9.1 Public Page Redesign | 5/5 | Complete | 2026-03-16 |
| 10. Agent Tier and Storage | 0/0 | Not started | - |
| 11. Custom Theme Builder | 0/0 | Not started | - |
| 12. Security Hardening | 0/0 | Not started | - |
| 13. Editor UI Redesign | 5/5 | Complete    | 2026-03-16 |
| 14. Dashboard & Auth Redesign | 2/2 | Complete    | 2026-03-17 |
| 15. Admin Panel Redesign | 0/4 | Not started | - |

### Phase 09.1: Public Page Redesign - Modern Full-Width Templates (INSERTED)

**Goal:** Replace narrow 420px card-style templates with 6 modern full-width designs matching Stitch AI reference. Build shared layout + theme config system with hero sections, sticky nav, photo grids, venue/map cards, and micro-interactions. Architecture extensible for admin-created themes.
**Requirements**: THEME-01, THEME-02, TMPL-01, TMPL-02, TMPL-03, TMPL-04, TMPL-05, TMPL-06, SHELL-01, COMPAT-01, EDITOR-01
**Depends on:** Phase 9
**Success Criteria** (what must be TRUE):
  1. All 6 themes render correctly with theme-specific colors, typography, and visual effects
  2. SharedTemplate composes 8 sections (Hero, StickyNav, Countdown, Timeline, Gallery, Venue, BankQR, Footer) with theme config
  3. InvitationShell renders full-width template after envelope opens (no DesktopFrame)
  4. Legacy templateId values (traditional/modern/minimalist) auto-map to new themes without DB migration
  5. Editor shows 6 themes in visual grid with accurate preview
  6. Plus Jakarta Sans font renders on public pages with Vietnamese diacritics support
**Plans:** 5/5 plans complete

Plans:
- [ ] 09.1-01-PLAN.md — ThemeConfig type system, 6 theme configs, TemplateId extension, Plus Jakarta Sans font, Wave 0 test stubs
- [ ] 09.1-02-PLAN.md — 8 section components (Hero, StickyNav, Countdown, Timeline, Gallery, Venue, BankQR, Footer) + SharedTemplate layout
- [ ] 09.1-03-PLAN.md — InvitationShell rewire (remove DesktopFrame, full-width SharedTemplate), FallingPetals theme colors, ThankYouPage/SaveTheDatePage update
- [ ] 09.1-04-PLAN.md — TemplateRenderer rewrite (getTheme + SharedTemplate), TemplateSelector 6 themes, EditorPreview update, test updates
- [ ] 09.1-05-PLAN.md — Delete deprecated files (old templates, DesktopFrame), test cleanup, visual verification checkpoint

### Phase 10: Agent Tier and Storage Management — monthly subscription for printing vendors, 20 invitations/month quota, draft auto-delete, published link expiration, admin Clear Storage button

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 9
**Plans:** 3/4 plans executed

Plans:
- [ ] TBD (run /gsd:plan-phase 10 to break down)

### Phase 11: Custom Theme Builder

**Goal:** Admin can create, edit, and publish new invitation themes from the admin panel using a data-driven template system — configurable layouts, color palettes, fonts, and section ordering — without writing React code
**Requirements**: TBD
**Depends on:** Phase 9
**Success Criteria** (what must be TRUE):
  1. Admin can create a new theme by selecting a base layout, choosing a color palette, picking fonts, and configuring section visibility/order
  2. New themes appear in the user's template selector immediately after admin publishes them
  3. Existing hardcoded templates (Traditional, Modern, Minimalist) continue to work alongside data-driven themes
  4. Admin can preview a theme with sample data before publishing it to users
  5. Admin can edit or unpublish a theme — unpublished themes remain visible on invitations that already use them but are hidden from the selector
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 11 to break down)

### Phase 12: Security Hardening

**Goal:** The platform is resilient against spam, storage abuse, content theft, API abuse, and common web vulnerabilities — protecting both the business and users' personal wedding data
**Requirements**: TBD
**Depends on:** Phase 9
**Success Criteria** (what must be TRUE):
  1. API rate limiting enforced: auth endpoints (5/min), upload endpoints (10/min), publish (3/min) — excess requests return 429 with Vietnamese error
  2. Account creation requires email verification and optionally CAPTCHA — bots cannot mass-create accounts
  3. Supabase Storage buckets have strict policies: file type validation (images only in photo bucket, MP3 only in music bucket), max file size enforced server-side, signed URLs with expiration for private assets — direct bucket URLs cannot be used as public CDN
  4. Public invitation page has content protection: right-click disabled, CSS user-select none on key content, obfuscated class names in production, dynamic watermark positioning that breaks naive HTML copy-paste
  5. User-supplied text (couple names, messages, venue) is sanitized against XSS before rendering in templates and OG meta tags
  6. Slug generation uses non-enumerable random suffixes — sequential guessing of /w/{slug} URLs is not feasible
  7. Admin payment approval requires matching transfer amount and content code — admin sees bank transfer verification hints
  8. Session management: JWT tokens expire after configurable duration, refresh token rotation, concurrent session awareness
  9. Upload content moderation: NSFW/inappropriate image detection on photo uploads (basic hash-based or API-based), admin notification for flagged content
  10. Cross-user access automated tests verify no user can read/modify another user's invitations, photos, or payment status via API
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 12 to break down)

### Phase 13: Editor UI Redesign - Modern Stitch AI Design

**Goal:** Redesign the invitation editor to match Stitch AI reference with 9 collapsible accordion sections (icons, neutral styling), Stitch-style top bar (center preview toggle, right-side publish), new data fields (ceremony program, avatars, nicknames), dedicated full-page preview route with Phone/Desktop/Share tabs, and ceremony program rendering on public page
**Requirements**: EDIT-UI-01, EDIT-UI-02, EDIT-UI-03, EDIT-UI-04, EDIT-UI-05, EDIT-UI-06, EDIT-UI-07, EDIT-UI-08
**Depends on:** Phase 12
**Success Criteria** (what must be TRUE):
  1. EditorForm has 9 collapsible accordion sections with icon headers in correct order (couple, schedule, venue, photos, music, gift, theme, message, save-the-date)
  2. Top bar matches Stitch design: back + title left, Mobile/Desktop toggle center, save + preview + publish right
  3. New data fields (ceremony program, groom/bride avatars, groom/bride nicknames) are editable and persist through auto-save
  4. Dedicated preview page at /thep-cuoi/[id]/preview with Phone/Desktop/Share Link tabs
  5. Ceremony program events render on public invitation page alongside love story timeline
  6. All existing editor functionality preserved (auto-save, template selection, photo/music/QR upload)
**Plans:** 5/5 plans complete

Plans:
- [ ] 13-01-PLAN.md — DB migration (5 new columns), types + API DTO/service update, Wave 0 test stubs
- [ ] 13-02-PLAN.md — CeremonyProgramEditor + AvatarUpload components, API avatar upload endpoints
- [ ] 13-03-PLAN.md — EditorShell top bar redesign, EditorForm 9-section accordion rewrite, EditorPreview mode prop
- [ ] 13-04-PLAN.md — Preview page route with PreviewShell tabs, TimelineSection ceremony program rendering
- [ ] 13-05-PLAN.md — Test cleanup, full suite verification, visual checkpoint

### Phase 14: Dashboard and Auth Redesign - Modern Stitch AI Design

**Goal:** Complete the Stitch AI design system across all remaining user-facing pages outside the editor and public invitation -- restyle ThankYouPage, SaveTheDatePage, UpgradePage, CreateWizard, and UpgradeButton to use the established Stitch palette (#ec1349, #181113, #e6dbde) consistently with the dashboard, sidebar, and auth pages already styled in Phase 13
**Requirements**: STITCH-THANKYOU, STITCH-PAYMENT, STITCH-WIZARD, STITCH-VERIFY
**Depends on:** Phase 13
**Success Criteria** (what must be TRUE):
  1. ThankYouPage (expired invitation) uses Stitch colors and Plus Jakarta Sans instead of theme-only styling
  2. SaveTheDatePage uses Stitch design language consistently
  3. UpgradePage uses Stitch card pattern with solid #ec1349 header (no amber-to-rose gradient)
  4. CreateWizard uses Stitch colors for buttons, inputs, and template selection
  5. All user-facing pages visually match one unified Stitch AI design system
**Plans:** 2/2 plans complete

Plans:
- [ ] 14-01-PLAN.md — Restyle ThankYouPage, SaveTheDatePage, UpgradePage, UpgradeButton, and CreateWizard to Stitch design system
- [ ] 14-02-PLAN.md — Build verification and visual checkpoint for all restyled pages

### Phase 15: Admin Panel Redesign - Modern Stitch AI Design

**Goal:** Restyle all admin panel pages (dashboard, users, invitations, themes, music, service plans, payments, settings) and admin sidebar/layout to match the Stitch AI design system -- dark #181113 sidebar, warm #f8f6f6 content area, #ec1349 accents, Stitch cards/inputs/buttons/badges across all 12 admin files. Purely visual restyling with no new functionality.
**Requirements**: ADMIN-LAYOUT, ADMIN-SIDEBAR, ADMIN-DASHBOARD, ADMIN-USERS, ADMIN-INVITATIONS, ADMIN-MUSIC, ADMIN-THEMES, ADMIN-PLANS, ADMIN-PAYMENTS, ADMIN-SETTINGS
**Depends on:** Phase 14
**Success Criteria** (what must be TRUE):
  1. Admin sidebar has dark #181113 background with #ec1349 active indicator, "Thiep Cuoi Online" branding with "Admin" badge
  2. Content area background is warm #f8f6f6, header has #e6dbde border and Stitch sidebar toggle
  3. Dashboard stat cards have colored icon circles, chart uses #ec1349 line color
  4. All list pages (users, invitations, music) wrap rows in white Stitch card containers with #e6dbde borders
  5. All inputs use #ec1349 focus states, all primary buttons use bg-[#ec1349]
  6. Settings page has per-section Stitch cards with individual save buttons
  7. No gray-* Tailwind classes remain in any admin file
**Plans:** 4 plans

Plans:
- [ ] 15-01-PLAN.md — Admin layout + sidebar dark Stitch theme, dashboard page + StatCard + chart Stitch colors
- [ ] 15-02-PLAN.md — Users page + UserDetailDialog + Invitations + Music + Themes pages Stitch restyling
- [ ] 15-03-PLAN.md — Service Plans + Payments + Settings pages Stitch restyling
- [ ] 15-04-PLAN.md — Build verification, gray-* audit, visual checkpoint
