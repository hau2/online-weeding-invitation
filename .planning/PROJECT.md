# Wedding Invitation Online (Thiệp Cưới Online)

## What This Is

A self-service SaaS platform for Vietnamese couples to create beautiful online wedding invitations, share them via a fixed QR code, and display their bank transfer QR for wedding gift money. Couples handle everything themselves — no manual support needed. The platform does not process payments or hold money; it only displays the couple's own bank QR image.

## Core Value

Couples can create and share a stunning online wedding invitation with a single QR code, and guests can view it and send gift money — all without any intermediary.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Landing page introducing the service with demo invitation and CTA
- [ ] User registration/login with email or phone + password
- [ ] Dashboard to manage invitations (list, create, edit, view QR, view public page)
- [ ] Invitation editor with real-time preview (bride/groom names, date/time, venue, invitation message)
- [ ] Photo gallery upload with drag-drop reordering and auto-optimization
- [ ] Background music config (upload or choose from system library, explicit play/pause toggle)
- [ ] Bank QR image upload for wedding gift money display on invitation
- [ ] Template selection (3 templates: Traditional, Modern, Minimalist) with instant preview
- [ ] Publish/unpublish invitation — generates fixed QR and public URL `/w/{slug}`
- [ ] Public invitation page with rich envelope opening animation (particles, petals, transitions), then tap to view full details
- [ ] Guest name personalization via URL parameter (`/w/{slug}?to=Tên+Khách`)
- [ ] Public page displays: couple names, photos, invitation message, date/time, venue, bank QR, background music, thank you message
- [ ] Mobile-first, fast loading on 3G/4G, accessible for elderly users
- [ ] Auto-expire invitations after wedding date + grace period
- [ ] Pricing tiers: Free (with watermark) and Premium (no watermark, more templates, more photos)
- [ ] Platform payment via admin's QR — user scans admin QR to pay, admin manually grants Premium credit
- [ ] Admin panel (separate layout at `/admin`) with 8 sections: Dashboard, Users, Invitations, Themes, System Music, Service Plans, Payments, System Settings
- [ ] Admin: read-only view of invitations, disable/enable for violations, never edit content
- [ ] Admin: manage system music library (upload mp3, enable/disable, inactive music still plays on existing invitations)
- [ ] Admin: manage themes metadata (enable/disable, no code upload)
- [ ] Admin: manage service plans (Basic/Pro/Promax) with permission config
- [ ] Admin: payment tracking (view transactions, mark refunds manually, add internal notes)
- [ ] Admin: system settings (invitation expiry durations, bank list for QR, system fonts, upload size limits)
- [ ] Vietnamese-only UI (100% tiếng Việt)
- [ ] Beautiful, youthful UI with rich animations throughout — downloadable images/fonts for dynamic feel

### Out of Scope

- Real-time chat — not core to wedding invitations
- Video posts — storage/bandwidth costs too high for v1
- OAuth login (Google, GitHub) — email/phone sufficient for Vietnam market
- Native mobile app — web-first, mobile-optimized
- Online payment gateway integration — admin manually verifies payments
- Per-guest personalized QR codes — one fixed QR per wedding
- Admin editing invitation content — user is single source of truth
- Generating bank QR from account details — users upload their own QR image

## Context

- **Market**: Vietnam — couples typically share wedding invitations via Zalo/Facebook. QR bank transfers are ubiquitous (VietQR/NAPAS standard).
- **Users**: Vietnamese couples (20s-30s), tech-savvy enough to use a web form. Guests include elderly relatives — public page must be simple and fast.
- **Payment model**: Admin configures their own bank QR in admin panel. Users scan it to pay for Premium. Admin manually grants credit. No payment gateway.
- **Two QR types in system**: (1) Invitation QR — fixed URL QR for sharing the invitation, (2) Gift QR — couple's bank QR image uploaded for guests to transfer money.
- **Envelope UX**: Public invitation opens with a rich envelope animation (particle effects, falling petals, smooth transitions) before revealing the full invitation details.
- **Guest personalization**: URL parameter `?to=Name` shows personalized greeting. Couple shares different links to different guests.

## Constraints

- **Tech stack**: Next.js (frontend) + NestJS (backend API) + Supabase (database, auth, storage)
- **Language**: Vietnamese-only UI, no i18n needed for v1
- **Platform**: Web only, mobile-first responsive design
- **Performance**: Must load fast on 3G/4G Vietnamese mobile networks
- **Security**: Users can only edit their own invitations, public pages are read-only
- **Admin boundary**: Admin never edits invitation content — user's editor is the single source of truth

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + NestJS + Supabase | User's preferred stack, good fit for SaaS with auth/storage needs | — Pending |
| Upload bank QR image (not generate) | Simpler implementation, users already have QR from banking apps | — Pending |
| URL parameter for guest names | Simple to implement, couple can share different links per guest via Zalo | — Pending |
| Rich envelope animation on open | Wow factor — differentiate from plain invitation pages | — Pending |
| Manual payment (admin QR) | No payment gateway complexity for v1, admin manually grants Premium | — Pending |
| Auto-expire invitations | Keep system clean, reduce storage costs over time | — Pending |
| 3 templates for v1 | Traditional/Modern/Minimalist covers the main Vietnamese wedding styles | — Pending |

---
*Last updated: 2026-03-14 after initialization*
