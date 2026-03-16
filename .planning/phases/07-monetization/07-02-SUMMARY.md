---
phase: 07-monetization
plan: 02
subsystem: ui
tags: [watermark, monetization, free-tier, premium, bank-qr, templates, react]

# Dependency graph
requires:
  - phase: 07-monetization
    provides: "InvitationPlan type, plan field on Invitation interface"
  - phase: 05-public-invitation
    provides: "InvitationShell, TemplateRenderer, all 3 templates with bank QR sections"
provides:
  - "Watermark overlay component for free-tier invitations"
  - "BankQrLock blur+lock component for free-tier bank QR images"
  - "Conditional watermark rendering in InvitationShell (envelope + revealed stages)"
  - "Conditional bank QR lock in all 3 templates (Traditional, Modern, Minimalist)"
  - "Conditional footer branding text (free only)"
affects: [07-monetization, 08-admin-panel]

# Tech tracking
tech-stack:
  added: []
  patterns: ["(invitation.plan ?? 'free') === 'free' pattern for backwards-compatible plan check", "DOM-based watermark with rotation/scale for tamper resistance"]

key-files:
  created:
    - "apps/web/app/w/[slug]/Watermark.tsx"
    - "apps/web/app/w/[slug]/BankQrLock.tsx"
  modified:
    - "apps/web/app/w/[slug]/InvitationShell.tsx"
    - "apps/web/components/templates/TemplateTraditional.tsx"
    - "apps/web/components/templates/TemplateModern.tsx"
    - "apps/web/components/templates/TemplateMinimalist.tsx"

key-decisions:
  - "Watermark uses DOM text elements (not CSS background-image or SVG data URI) for tamper resistance"
  - "BankQrLock wraps children with blur-md + Lock icon overlay using lucide-react"
  - "(invitation.plan ?? 'free') === 'free' pattern handles undefined plan for old data"
  - "Footer branding text removed entirely for premium tier (not just made subtle)"

patterns-established:
  - "Free-tier conditional rendering: (invitation.plan ?? 'free') === 'free' ? <FreeComponent> : <PremiumComponent>"
  - "Watermark rendered at both envelope and revealed stages to prevent screenshot bypass"

requirements-completed: [PLAN-01, PLAN-02]

# Metrics
duration: 5min
completed: 2026-03-16
---

# Phase 7 Plan 02: Watermark & Bank QR Lock Summary

**Diagonal repeating "ThiepCuoiOnline.vn" watermark overlay and blurred bank QR with lock icon for free-tier monetization UI**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-16T04:04:28Z
- **Completed:** 2026-03-16T04:10:01Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Watermark component renders 20 rows x 6 columns of diagonal "ThiepCuoiOnline.vn" text with fixed positioning, pointer-events-none, z-50, and DOM-based rendering for tamper resistance
- BankQrLock wraps bank QR images with blur-md CSS filter and centered Lock icon with Vietnamese upgrade prompt
- All 3 templates (Traditional, Modern, Minimalist) conditionally wrap both groom and bride bank QR images with BankQrLock for free-tier invitations
- InvitationShell renders Watermark overlay during both envelope stage and revealed stage for free-tier
- Footer branding text conditionally hidden for premium-tier invitations

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Watermark and BankQrLock components** - `795a1ea` (feat)
2. **Task 2: Wire watermark into InvitationShell and QR lock into all 3 templates** - `639e8a9` (feat)

## Files Created/Modified
- `apps/web/app/w/[slug]/Watermark.tsx` - Diagonal repeating text watermark overlay, fixed inset-0 z-50, pointer-events-none, 20x6 grid with CSS rotate(-30deg) scale(1.5)
- `apps/web/app/w/[slug]/BankQrLock.tsx` - Blur+lock overlay wrapper for bank QR images, uses lucide-react Lock icon
- `apps/web/app/w/[slug]/InvitationShell.tsx` - Imports Watermark, conditionally renders at envelope and revealed stages, conditional footer text
- `apps/web/components/templates/TemplateTraditional.tsx` - Imports BankQrLock, conditionally wraps groom and bride bank QR images
- `apps/web/components/templates/TemplateModern.tsx` - Imports BankQrLock, conditionally wraps groom and bride bank QR images
- `apps/web/components/templates/TemplateMinimalist.tsx` - Imports BankQrLock, conditionally wraps groom and bride bank QR images

## Decisions Made
- Watermark uses actual DOM text elements rather than CSS background-image or SVG data URIs -- DOM elements are harder to block with ad blockers or CSS overrides
- BankQrLock uses lucide-react Lock icon (already in project dependencies) for consistent icon styling
- Used `(invitation.plan ?? 'free') === 'free'` nullish coalescing pattern so old invitation data without a plan field defaults to free tier
- Footer branding text removed entirely for premium tier rather than making it more subtle -- clean premium experience
- Watermark rendered during both envelope and revealed stages so screenshots at any point show the watermark

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing Next.js build failures (PageNotFoundError for `/`, `/dang-nhap`, `/dang-ky`, `/admin`, etc.) unrelated to this plan's changes. Verified no TypeScript errors in any of the 6 files modified by this plan via `tsc --noEmit` check.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Watermark and QR lock visuals ready for testing with real invitation data
- Plan 07-03 (Upgrade CTA / payment flow UI) can build on this foundation
- Admin panel (Phase 8) can display plan status on invitation rows

## Self-Check: PASSED

All 7 files verified present. Both task commits (795a1ea, 639e8a9) confirmed in git log.

---
*Phase: 07-monetization*
*Completed: 2026-03-16*
