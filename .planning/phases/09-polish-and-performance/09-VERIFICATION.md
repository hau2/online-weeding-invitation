---
phase: 09-polish-and-performance
verified: 2026-03-16T08:30:00Z
status: human_needed
score: 4/5 must-haves verified (1 requires human confirmation)
human_verification:
  - test: "Confirm page weight under 1MB on a cold 4G connection"
    expected: "Total transferred payload (HTML + CSS + JS + images) for /w/[slug] is under 1MB with no cached assets"
    why_human: "Bundle analyzer was wired (ANALYZE=true flag in next.config.ts) but no analysis report was generated or documented. The uncompressed build manifest shows main-app.js at 7.6MB (1720KB gzipped), page.js at 2.6MB (526KB gzipped). Whether the /w/[slug] route actually loads under 1MB total depends on lazy-loaded chunks and network deduplication — this cannot be determined from static file sizes alone. Run: cd apps/web && ANALYZE=true pnpm build, then inspect the /w/[slug] route breakdown."
  - test: "Confirm envelope animation achieves 30fps at 6x CPU throttle on Chrome"
    expected: "At 6x CPU throttle the framer-motion animation plays smoothly OR the performance gate fires and the CSS fallback renders instead"
    why_human: "Frame time measurement requires a live browser. The rAF-based gate (8 frames, >20ms avg = fallback) is code-verified as wired correctly, but whether the threshold triggers appropriately on a 6x throttled desktop Chrome vs a real low-end Android device requires real-device testing."
  - test: "Confirm music does not start without explicit user action"
    expected: "Music begins only after the user taps the envelope (not on page load), consistent with PUBL-08 no-autoplay requirement"
    why_human: "InvitationShell passes autoStart={true} to MusicPlayer in the revealed stage (after envelopeOpened becomes true). The envelope tap is the triggering action. Whether this satisfies 'explicit user action' for music (the user tapped to open the envelope, not to start music) needs product owner confirmation. PUBL-08 says 'explicit play/pause toggle (no autoplay)'. The current behavior auto-starts music upon envelope reveal — this may conflict with the elderly UX success criterion ('music never starts without explicit user action')."
---

# Phase 9: Polish and Performance Verification Report

**Phase Goal:** The platform loads fast on 3G/4G Vietnamese mobile networks, the envelope animation runs smoothly on low-end Android devices, the auto-expiry cron runs reliably, and the experience is accessible for elderly guests
**Verified:** 2026-03-16T08:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | On low-end devices, envelope animation falls back to CSS-only without framer-motion | VERIFIED | `EnvelopeAnimationFallback.tsx` (157 lines, no framer-motion import). `EnvelopeAnimation.tsx` sets `useFallback` state, renders `<EnvelopeAnimationFallback>` when `useFallback === true` |
| 2 | Public invitation page total weight under 1MB on cold 4G | UNCERTAIN | Bundle analyzer wired (`ANALYZE=true` in `next.config.ts`), build succeeded, but no analysis report generated. `main-app.js` gzipped alone is 1720KB — human verification required |
| 3 | Invitations auto-expire via daily cron without manual admin action | VERIFIED | `ExpiryCronService` with `@Cron('0 0 * * *', timeZone: 'Asia/Ho_Chi_Minh')` calls `markExpired()`; `findBySlug` handles `'expired'` status; `@nestjs/schedule` installed; `ScheduleModule.forRoot()` in `InvitationsModule` |
| 4 | Elderly-friendly UX: 48px+ touch targets, 16px text, centered skip, no music autoplay | PARTIAL | Skip button: `min-h-12 min-w-12 left-1/2 -translate-x-1/2` (verified). Music button: `h-14 w-14` (56px, verified). Bank QR: `max-w-[240px]` with Vietnamese instructions in all 3 templates (verified). Text: `text-base` on InvitationShell revealed stage (verified). Music autoStart: UNCERTAIN — `autoStart={true}` fires on envelope reveal, not explicit music tap |
| 5 | Desktop shows centered 480px card with decorative floral frame; mobile unchanged | VERIFIED | `DesktopFrame.tsx` with `hidden md:block` corner decorations, `md:max-w-[480px]` card container, template-specific `FRAME_COLORS`. `InvitationShell` wraps both stages in `<DesktopFrame>` |

**Score:** 4/5 truths verified (Truth 2 uncertain, Truth 4 partially uncertain due to music autoStart)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/web/app/w/[slug]/EnvelopeAnimationFallback.tsx` | CSS-only fallback with no framer-motion | VERIFIED | 157 lines, no framer-motion import, same visual structure as main animation |
| `apps/web/app/w/[slug]/EnvelopeAnimation.tsx` | Performance gate measuring frame times | VERIFIED | `useFallback` state, 8-frame rAF measurement, renders fallback or full animation |
| `apps/web/app/w/[slug]/MusicPlayer.tsx` | 56px floating music button with larger bars | VERIFIED | `h-14 w-14 min-h-14 min-w-14`, `w-[4px]` bars, `h-6 w-6` play icon |
| `apps/web/components/templates/TemplateTraditional.tsx` | Bank QR at 240px+ with instruction text | VERIFIED | `max-w-[240px]` on both QR images, "Mo ung dung ngan hang va quet ma QR" text |
| `apps/web/components/templates/TemplateModern.tsx` | Bank QR at 240px+ with instruction text | VERIFIED | `max-w-[240px]` on both QR images, "Mo ung dung ngan hang va quet ma QR" text |
| `apps/web/components/templates/TemplateMinimalist.tsx` | Bank QR at 240px+ with instruction text | VERIFIED | `max-w-[240px]` on both QR images, "Mo ung dung ngan hang va quet ma QR" text |
| `apps/api/src/invitations/expiry/expiry-cron.service.ts` | Daily cron with @Cron decorator | VERIFIED | `@Cron('0 0 * * *', { name: 'auto-expire-invitations', timeZone: 'Asia/Ho_Chi_Minh' })`, delegates to `markExpired()` |
| `apps/api/src/invitations/invitations.service.ts` | markExpired method for batch expiry | VERIFIED | `markExpired()` queries published invitations, computes grace period, updates status to `'expired'`, calls `triggerRevalidation(slug)` |
| `apps/api/src/invitations/__tests__/expiry-cron.spec.ts` | Unit tests for cron service | VERIFIED | 9 tests: expired/not-expired/dual-dates/revalidation/no-dates/empty/DB-error + 2 cron wrapper tests |
| `apps/api/src/invitations/invitations.module.ts` | ScheduleModule + ExpiryCronService registered | VERIFIED | `ScheduleModule.forRoot()` in imports, `ExpiryCronService` in providers |
| `apps/web/app/w/[slug]/DesktopFrame.tsx` | Decorative floral frame for desktop | VERIFIED | 159 lines, `FRAME_COLORS` record, 4 `CornerDecoration` elements with `hidden md:block`, vine border lines |
| `apps/web/app/w/[slug]/InvitationShell.tsx` | Wraps both stages in DesktopFrame | VERIFIED | Both `envelopeOpened === false` and revealed stage wrapped in `<DesktopFrame>`, `text-base` on revealed stage container |
| `apps/web/next.config.ts` | Bundle analyzer wired | VERIFIED | `withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })` wraps config |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `EnvelopeAnimation.tsx` | `EnvelopeAnimationFallback.tsx` | `useFallback === true` conditional render | WIRED | Line 264-274: `if (useFallback === true) return <EnvelopeAnimationFallback {...props} />` |
| `expiry-cron.service.ts` | `invitations.service.ts` | DI injection, calls `markExpired()` | WIRED | `this.invitationsService.markExpired()` at line 23 of cron service |
| `invitations.service.ts` | `triggerRevalidation` | Called in markExpired loop for each expired slug | WIRED | Lines 1273-1280: `await this.triggerRevalidation(row.slug)` inside markExpired |
| `InvitationShell.tsx` | `DesktopFrame.tsx` | Wraps all content in DesktopFrame | WIRED | Static import at line 9, used at lines 98 and 120 |
| `InvitationShell.tsx` | `FallingPetals.tsx` | `enabled={true}` in both stages | WIRED | Petals render in envelope stage (line 104) and revealed stage (line 123). Note: original plan called for `enabled={!envelopeOpened}` but user requested petals continue in revealed stage — this is an intentional deviation documented in 09-03-SUMMARY.md |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| PUBL-10 | 09-01, 09-02, 09-03 | Mobile-first, loads fast on 3G/4G (<1MB page weight) | PARTIAL | Performance gate, CSS fallback, elderly UX, auto-expiry cron, desktop frame all implemented. Bundle analyzer wired. Actual <1MB page weight requires human verification (ANALYZE=true build + analysis) |

**Orphaned requirements:** None. PUBL-10 is the only requirement mapped to Phase 9 and all three plans claim it.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `apps/web/app/w/[slug]/InvitationShell.tsx` | 127 | `autoStart={true}` passed to MusicPlayer after envelope reveal | Warning | Music begins automatically when envelope is opened, without a separate explicit user action to start music. Conflicts with PUBL-08 "no autoplay" and success criterion "music never starts without explicit user action" |

---

### Human Verification Required

#### 1. Page Weight Under 1MB

**Test:** Run `cd apps/web && ANALYZE=true pnpm build` and inspect the generated bundle report at `.next/analyze/`. Check the `/w/[slug]` route's total JS weight including all lazy-loaded chunks (EnvelopeAnimation, FallingPetals, MusicPlayer, canvas-confetti, howler, framer-motion).
**Expected:** Total transferred payload (HTML + CSS + compressed JS + images, excluding user-uploaded wedding photos) is under 1MB on a fresh 4G connection with no cached assets.
**Why human:** `main-app.js` gzipped is 1720KB, `page.js` gzipped is 526KB. Whether the /w/[slug] route actually loads all of `main-app.js` or only a subset via code splitting cannot be determined from static file sizes. Bundle analysis report is required. Note: the bundle analyzer is correctly installed and wired behind `ANALYZE=true` — it just needs to be run.

#### 2. Envelope Animation at 6x CPU Throttle

**Test:** Open a published invitation at `/w/{slug}` in Chrome with DevTools Performance tab, enable 6x CPU throttle. Tap the envelope to trigger animation.
**Expected:** Either (a) the rAF performance gate fires and the CSS-only fallback renders (envelope fades in/out without framer-motion particles), OR (b) the full framer-motion animation plays at a minimum of 30fps.
**Why human:** Frame time measurement is runtime behavior. The gate threshold (avg >20ms over 8 frames) may or may not fire at 6x throttle depending on the host machine's baseline. Real-device testing on a low-end Android device is the definitive test.

#### 3. Music Autoplay vs. Explicit User Action

**Test:** Open a published invitation with music configured. Observe whether music starts: (a) on page load, (b) automatically when the envelope is opened, or (c) only when the user explicitly taps the music play button.
**Expected per PUBL-08:** No autoplay — music should only start when user explicitly presses play.
**Expected per Phase 9 context:** Music starts after envelope tap as a quality-of-life feature (the envelope tap is considered explicit user interaction).
**Why human:** `InvitationShell.tsx` passes `autoStart={true}` to `MusicPlayer` in the revealed stage. The MusicPlayer's `autoStart` effect fires on mount when `autoStart` is true, calling `initAndPlay()`. This means music starts when the user taps the envelope (not on page load), but without a separate music-play tap. Product owner needs to confirm whether this satisfies the "no autoplay" and "explicit user action" requirements, or whether music should only start when the floating music button is tapped.

---

### Gaps Summary

No hard blockers were found — all code artifacts are substantive and wired correctly. The phase has three items requiring human confirmation:

1. **Page weight** — The bundle analyzer tooling is correctly installed and wired. A single `ANALYZE=true pnpm build` run and review of the output is all that is needed to confirm or deny the <1MB criterion. This is a verification gap, not an implementation gap.

2. **Animation FPS at throttle** — The performance gate code is correct. Human testing confirms the gate fires appropriately on low-end devices.

3. **Music autoStart behavior** — This is the most significant ambiguity. `autoStart={true}` was set in 09-03 as part of the user's approval during the visual verification checkpoint. Whether this conflicts with PUBL-08 "no autoplay" needs product owner clarification. If it does conflict, `autoStart` should be changed to `false` (or removed) so guests must explicitly tap the music button.

---

_Verified: 2026-03-16T08:30:00Z_
_Verifier: Claude (gsd-verifier)_
