# Requirements: Wedding Invitation Online (Thiệp Cưới Online)

**Defined:** 2026-03-14
**Core Value:** Couples can create and share a stunning online wedding invitation with a single QR code, and guests can view it and send gift money — all without any intermediary.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can sign up with email or phone number + password
- [ ] **AUTH-02**: User can log in and session persists across browser refresh
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: User can reset password via email link

### Dashboard

- [ ] **DASH-01**: User can view list of their invitations with status (Draft/Published/Expired)
- [ ] **DASH-02**: User can create a new invitation
- [ ] **DASH-03**: User can access edit, view QR, and view public page from dashboard

### Editor

- [ ] **EDIT-01**: User can enter bride/groom names, wedding date/time, venue address, invitation message, and thank-you text
- [ ] **EDIT-02**: User sees real-time preview while editing
- [ ] **EDIT-03**: Editor auto-saves as draft
- [ ] **EDIT-04**: User can upload multiple photos with drag-drop reordering
- [ ] **EDIT-05**: System auto-optimizes uploaded photos for mobile
- [ ] **EDIT-06**: User can choose background music from system library or upload own file
- [ ] **EDIT-07**: User can upload their bank QR image for gift money display
- [ ] **EDIT-08**: User can select from 3 templates (Traditional/Modern/Minimalist) with instant preview
- [ ] **EDIT-09**: User can preview the complete invitation before publishing
- [ ] **EDIT-10**: User can publish/unpublish invitation

### Public Page

- [ ] **PUBL-01**: Published invitation accessible at `/w/{slug}` without login
- [ ] **PUBL-02**: Fixed QR code generated for the invitation URL (never changes after publish)
- [ ] **PUBL-03**: Rich envelope opening animation with particles, petals, and smooth transitions on first visit
- [ ] **PUBL-04**: Guest taps envelope to reveal full invitation (gesture unlocks audio)
- [ ] **PUBL-05**: Personalized greeting via URL parameter `?to=Name`
- [ ] **PUBL-06**: Displays all invitation details: names, photos, message, date/time, venue, bank QR, music, thank-you
- [ ] **PUBL-07**: Wedding date countdown timer
- [ ] **PUBL-08**: Background music with explicit play/pause toggle (no autoplay)
- [ ] **PUBL-09**: Zalo/Facebook OG meta tags for proper link preview
- [ ] **PUBL-10**: Mobile-first, loads fast on 3G/4G (<1MB page weight)
- [ ] **PUBL-11**: Auto-expires after wedding date + configurable grace period
- [ ] **PUBL-12**: Switches to thank-you page after wedding date instead of just expiring

### Save-the-Date

- [ ] **SAVE-01**: User can publish a teaser "save the date" page before full invitation is ready
- [ ] **SAVE-02**: Save-the-date page shows couple names, date, and teaser message only

### Monetization

- [ ] **PLAN-01**: Free tier available with platform watermark on public page
- [ ] **PLAN-02**: Premium tier removes watermark, unlocks more templates and photo slots
- [ ] **PLAN-03**: Admin configures their own bank QR in admin panel for platform payment
- [ ] **PLAN-04**: User scans admin QR to pay, admin manually grants Premium credit

### Admin

- [ ] **ADMN-01**: Admin panel at `/admin` with separate layout (not shared with user UI)
- [ ] **ADMN-02**: Admin dashboard with read-only stats (total users, invitations, revenue, charts)
- [ ] **ADMN-03**: Admin can view/search users, lock/unlock accounts, reset quota, assign/change plans
- [ ] **ADMN-04**: Admin can view invitations list, view public link, disable/enable for violations (never edit content)
- [ ] **ADMN-05**: Admin can manage theme metadata (enable/disable, name, tag, thumbnail)
- [ ] **ADMN-06**: Admin can manage system music library (upload mp3, enable/disable, view usage count)
- [ ] **ADMN-07**: Inactive system music hidden from editor but still plays on existing invitations
- [ ] **ADMN-08**: Admin can configure service plans (Basic/Pro/Promax) with permission settings
- [ ] **ADMN-09**: Admin can view payment transactions, mark refunds, add internal notes
- [ ] **ADMN-10**: Admin can configure system settings (expiry durations, bank list, system fonts, upload limits)

### System

- [ ] **SYST-01**: Vietnamese-only UI throughout the platform
- [ ] **SYST-02**: Slug permanently locked after first publish (cannot be changed)
- [ ] **SYST-03**: User can only edit their own invitations
- [ ] **SYST-04**: Public pages are read-only for guests

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Social & Engagement

- **SOCL-01**: RSVP / attendance confirmation system
- **SOCL-02**: Invitation analytics (view count, open rate)
- **SOCL-03**: Bulk guest link generator (pre-fill ?to=Name for a list)

### Platform Expansion

- **EXPN-01**: Online payment gateway integration (VNPay, MoMo)
- **EXPN-02**: OAuth login (Zalo, Google)
- **EXPN-03**: More templates (5-10 total)
- **EXPN-04**: Per-guest unique links with tracking
- **EXPN-05**: PWA / native mobile app

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time guest chat / comments | Requires moderation, WebSocket infra; not core to invitations |
| Video uploads / video invitation | Storage/bandwidth costs disproportionate for v1 |
| Generate bank QR from account details | Requires bank API integration; users already have QR from banking apps |
| Per-guest unique QR codes | Massive scope increase; one fixed QR is the product promise |
| Admin editing invitation content | User is single source of truth; admin read-only |
| Native mobile app | Web-first, mobile-optimized is sufficient |
| Registry / gift wishlist | Western feature; Vietnamese gift culture is cash via bank transfer |
| Multi-event invitations | Complex scheduling; tea ceremony handled separately |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| SYST-01 | Phase 1 | Pending |
| SYST-03 | Phase 1 | Pending |
| DASH-01 | Phase 2 | Pending |
| DASH-02 | Phase 2 | Pending |
| DASH-03 | Phase 2 | Pending |
| SYST-04 | Phase 2 | Pending |
| ADMN-01 | Phase 2 | Pending |
| EDIT-01 | Phase 3 | Pending |
| EDIT-02 | Phase 3 | Pending |
| EDIT-03 | Phase 3 | Pending |
| EDIT-08 | Phase 3 | Pending |
| EDIT-09 | Phase 3 | Pending |
| EDIT-10 | Phase 3 | Pending |
| SYST-02 | Phase 3 | Pending |
| EDIT-04 | Phase 4 | Pending |
| EDIT-05 | Phase 4 | Pending |
| EDIT-06 | Phase 4 | Pending |
| EDIT-07 | Phase 4 | Pending |
| PUBL-01 | Phase 5 | Pending |
| PUBL-02 | Phase 5 | Pending |
| PUBL-03 | Phase 5 | Pending |
| PUBL-04 | Phase 5 | Pending |
| PUBL-05 | Phase 5 | Pending |
| PUBL-06 | Phase 5 | Pending |
| PUBL-07 | Phase 5 | Pending |
| PUBL-08 | Phase 5 | Pending |
| PUBL-09 | Phase 5 | Pending |
| PUBL-10 | Phase 9 | Pending |
| PUBL-11 | Phase 5 | Pending |
| PUBL-12 | Phase 5 | Pending |
| SAVE-01 | Phase 6 | Pending |
| SAVE-02 | Phase 6 | Pending |
| PLAN-01 | Phase 7 | Pending |
| PLAN-02 | Phase 7 | Pending |
| PLAN-03 | Phase 7 | Pending |
| PLAN-04 | Phase 7 | Pending |
| ADMN-02 | Phase 8 | Pending |
| ADMN-03 | Phase 8 | Pending |
| ADMN-04 | Phase 8 | Pending |
| ADMN-05 | Phase 8 | Pending |
| ADMN-06 | Phase 8 | Pending |
| ADMN-07 | Phase 8 | Pending |
| ADMN-08 | Phase 8 | Pending |
| ADMN-09 | Phase 8 | Pending |
| ADMN-10 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 49 total
- Mapped to phases: 49
- Unmapped: 0

Note: PUBL-10 (mobile-first, <1MB page weight) is assigned to Phase 9 (Polish and Performance) because the <1MB target requires the full production asset pipeline — lazy loading, code splitting, WebP serving, and bundle analysis — which can only be measured accurately against the complete application. The feature is delivered incrementally across all phases but the acceptance criterion is verified in Phase 9.

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-14 — traceability populated after roadmap creation*
