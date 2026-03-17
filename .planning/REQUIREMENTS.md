# Requirements: Wedding Invitation Online (Thiệp Cưới Online)

**Defined:** 2026-03-14
**Core Value:** Couples can create and share a stunning online wedding invitation with a single QR code, and guests can view it and send gift money — all without any intermediary.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: User can sign up with email or phone number + password
- [x] **AUTH-02**: User can log in and session persists across browser refresh
- [x] **AUTH-03**: User can log out from any page
- [x] **AUTH-04**: User can reset password via email link

### Dashboard

- [x] **DASH-01**: User can view list of their invitations with status (Draft/Published/Expired)
- [x] **DASH-02**: User can create a new invitation
- [x] **DASH-03**: User can access edit, view QR, and view public page from dashboard

### Editor

- [x] **EDIT-01**: User can enter bride/groom names, wedding date/time, venue address, invitation message, and thank-you text
- [x] **EDIT-02**: User sees real-time preview while editing
- [x] **EDIT-03**: Editor auto-saves as draft
- [x] **EDIT-04**: User can upload multiple photos with drag-drop reordering
- [x] **EDIT-05**: System auto-optimizes uploaded photos for mobile
- [x] **EDIT-06**: User can choose background music from system library or upload own file
- [x] **EDIT-07**: User can upload their bank QR image for gift money display
- [x] **EDIT-08**: User can select from 3 templates (Traditional/Modern/Minimalist) with instant preview
- [x] **EDIT-09**: User can preview the complete invitation before publishing
- [x] **EDIT-10**: User can publish/unpublish invitation

### Public Page

- [x] **PUBL-01**: Published invitation accessible at `/w/{slug}` without login
- [x] **PUBL-02**: Fixed QR code generated for the invitation URL (never changes after publish)
- [x] **PUBL-03**: Rich envelope opening animation with particles, petals, and smooth transitions on first visit
- [x] **PUBL-04**: Guest taps envelope to reveal full invitation (gesture unlocks audio)
- [x] **PUBL-05**: Personalized greeting via URL parameter `?to=Name`
- [x] **PUBL-06**: Displays all invitation details: names, photos, message, date/time, venue, bank QR, music, thank-you
- [x] **PUBL-07**: Wedding date countdown timer
- [x] **PUBL-08**: Background music with explicit play/pause toggle (no autoplay)
- [x] **PUBL-09**: Zalo/Facebook OG meta tags for proper link preview
- [x] **PUBL-10**: Mobile-first, loads fast on 3G/4G (<1MB page weight)
- [x] **PUBL-11**: Auto-expires after wedding date + configurable grace period
- [x] **PUBL-12**: Switches to thank-you page after wedding date instead of just expiring

### Save-the-Date

- [x] **SAVE-01**: User can publish a teaser "save the date" page before full invitation is ready
- [x] **SAVE-02**: Save-the-date page shows couple names, date, and teaser message only

### Monetization

- [x] **PLAN-01**: Free tier available with platform watermark on public page
- [x] **PLAN-02**: Premium tier removes watermark, unlocks more templates and photo slots
- [x] **PLAN-03**: Admin configures their own bank QR in admin panel for platform payment
- [x] **PLAN-04**: User scans admin QR to pay, admin manually grants Premium credit

### Admin

- [x] **ADMN-01**: Admin panel at `/admin` with separate layout (not shared with user UI)
- [x] **ADMN-02**: Admin dashboard with read-only stats (total users, invitations, revenue, charts)
- [x] **ADMN-03**: Admin can view/search users, lock/unlock accounts, reset quota, assign/change plans
- [x] **ADMN-04**: Admin can view invitations list, view public link, disable/enable for violations (never edit content)
- [x] **ADMN-05**: Admin can manage theme metadata (enable/disable, name, tag, thumbnail)
- [x] **ADMN-06**: Admin can manage system music library (upload mp3, enable/disable, view usage count)
- [x] **ADMN-07**: Inactive system music hidden from editor but still plays on existing invitations
- [x] **ADMN-08**: Admin can configure service plans (Basic/Pro/Promax) with permission settings
- [x] **ADMN-09**: Admin can view payment transactions, mark refunds, add internal notes
- [x] **ADMN-10**: Admin can configure system settings (expiry durations, bank list, system fonts, upload limits)

### System

- [x] **SYST-01**: Vietnamese-only UI throughout the platform
- [x] **SYST-02**: Slug permanently locked after first publish (cannot be changed)
- [x] **SYST-03**: User can only edit their own invitations
- [x] **SYST-04**: Public pages are read-only for guests

### Agent Tier & Storage Management

- [x] **AGT-01**: Agent tier columns exist on users table with subscription tracking (tier, subscription_start, subscription_end)
- [x] **AGT-02**: Admin can grant, renew, and revoke agent tier from the user detail dialog
- [x] **AGT-03**: Agent quota enforcement at publish time (20 published invitations per 30-day cycle)
- [x] **AGT-04**: Agent dashboard shows quota progress bar (X/20) with days remaining and "Dai ly" indicator
- [x] **AGT-05**: Drafts older than 30 days from createdAt (never published) are auto-deleted daily with their media
- [x] **AGT-06**: Dashboard shows warning badges on draft cards within 7 days of auto-deletion
- [x] **AGT-07**: Admin can clear storage for expired/soft-deleted invitations from system settings page
- [x] **AGT-08**: GET /auth/me endpoint returns user profile including tier, subscription, and quota info

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
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| SYST-01 | Phase 1 | Complete |
| SYST-03 | Phase 1 | Complete |
| DASH-01 | Phase 2 | Complete |
| DASH-02 | Phase 2 | Complete |
| DASH-03 | Phase 2 | Complete |
| SYST-04 | Phase 2 | Complete |
| ADMN-01 | Phase 2 | Complete |
| EDIT-01 | Phase 3 | Complete |
| EDIT-02 | Phase 3 | Complete |
| EDIT-03 | Phase 3 | Complete |
| EDIT-08 | Phase 3 | Complete |
| EDIT-09 | Phase 3 | Complete |
| EDIT-10 | Phase 3 | Complete |
| SYST-02 | Phase 3 | Complete |
| EDIT-04 | Phase 4 | Complete |
| EDIT-05 | Phase 4 | Complete |
| EDIT-06 | Phase 4 | Complete |
| EDIT-07 | Phase 4 | Complete |
| PUBL-01 | Phase 5 | Complete |
| PUBL-02 | Phase 5 | Complete |
| PUBL-03 | Phase 5 | Complete |
| PUBL-04 | Phase 5 | Complete |
| PUBL-05 | Phase 5 | Complete |
| PUBL-06 | Phase 5 | Complete |
| PUBL-07 | Phase 5 | Complete |
| PUBL-08 | Phase 5 | Complete |
| PUBL-09 | Phase 5 | Complete |
| PUBL-10 | Phase 9 | Complete |
| PUBL-11 | Phase 5 | Complete |
| PUBL-12 | Phase 5 | Complete |
| SAVE-01 | Phase 6 | Complete |
| SAVE-02 | Phase 6 | Complete |
| PLAN-01 | Phase 7 | Complete |
| PLAN-02 | Phase 7 | Complete |
| PLAN-03 | Phase 7 | Complete |
| PLAN-04 | Phase 7 | Complete |
| ADMN-02 | Phase 8 | Complete |
| ADMN-03 | Phase 8 | Complete |
| ADMN-04 | Phase 8 | Complete |
| ADMN-05 | Phase 8 | Complete |
| ADMN-06 | Phase 8 | Complete |
| ADMN-07 | Phase 8 | Complete |
| ADMN-08 | Phase 8 | Complete |
| ADMN-09 | Phase 8 | Complete |
| ADMN-10 | Phase 8 | Complete |
| AGT-01 | Phase 10 | Planned |
| AGT-02 | Phase 10 | Planned |
| AGT-03 | Phase 10 | Planned |
| AGT-04 | Phase 10 | Planned |
| AGT-05 | Phase 10 | Planned |
| AGT-06 | Phase 10 | Planned |
| AGT-07 | Phase 10 | Planned |
| AGT-08 | Phase 10 | Planned |

**Coverage:**
- v1 requirements: 57 total
- Mapped to phases: 57
- Unmapped: 0

Note: PUBL-10 (mobile-first, <1MB page weight) is assigned to Phase 9 (Polish and Performance) because the <1MB target requires the full production asset pipeline — lazy loading, code splitting, WebP serving, and bundle analysis — which can only be measured accurately against the complete application. The feature is delivered incrementally across all phases but the acceptance criterion is verified in Phase 9.

---
*Requirements defined: 2026-03-14*
*Last updated: 2026-03-17 — Phase 10 Agent Tier requirements added*
