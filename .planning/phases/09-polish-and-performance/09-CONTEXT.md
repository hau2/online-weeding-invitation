# Phase 9: Polish and Performance - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Optimize the public invitation page for 3G/4G Vietnamese mobile networks (<1MB page weight), ensure smooth envelope animation on low-end Android with graceful fallback, implement auto-expiry cron job, add elderly-friendly UX improvements (touch targets, skip button, text sizing), and create a polished desktop layout with decorative framing. This phase does NOT add new features — it polishes and hardens what exists.

</domain>

<decisions>
## Implementation Decisions

### Animation Fallback Strategy
- Simple fade reveal as fallback: envelope image fades in, tap fades out to reveal invitation. No particles, no 3D transforms.
- Falling petals play during envelope stage only, then stop after reveal — reduces GPU load while reading content
- Detection via frame-time measurement: run 5-10 frames, if average >20ms switch to CSS-only fallback (from Phase 5 decision)
- Silent fallback — no indicator to the guest, they just see a simpler but still beautiful experience

### Elderly-Friendly UX
- Always-visible "Bo qua" skip button at bottom of envelope screen from the start — no delay
- Music play/pause floating button increased to 56px with clear equalizer bars for easy discovery
- Base body text on public page bumped from 14px to 16px, headings scale proportionally
- Bank QR displayed at larger size (240px+) with Vietnamese instruction text: "Mo ung dung ngan hang > Quet ma QR"
- All touch targets minimum 48px per accessibility guidelines

### Desktop Layout
- Centered card layout (max-width ~480px) with decorative floral/botanical frame on sides
- Floral watercolor-style corners and vine borders, template-specific colors (gold for Traditional, pastel for Modern, minimal for Minimalist)
- Envelope animation stays phone-sized (~400px), centered — feels like holding a real card
- Photo gallery keeps vertical stack inside centered card — same flow as mobile
- Decorative frame visible behind envelope during opening stage

### Auto-Expiry Behavior
- No notification to couples before expiry — invitation silently switches to thank-you page
- NestJS @Cron scheduled task runs daily at midnight Vietnam time (UTC+7)
- Cron marks expired invitations, triggers ISR revalidation for each
- Permanent expiry — once expired, invitation cannot be reactivated by couple or admin
- 7-day grace period after the latest ceremony date (already the default in code)

### Claude's Discretion
- Exact floral frame SVG/CSS design and color mapping per template
- Bundle analysis tooling and code splitting strategy
- WebP serving configuration via Supabase transforms
- Critical CSS inlining approach
- Specific lazy loading thresholds
- iOS Safari / Zalo WKWebView audio testing checklist details
- Zalo OG tag validation approach

</decisions>

<specifics>
## Specific Ideas

- The desktop decorative frame should feel like a real wedding invitation sitting on a table — watercolor florals, not hard geometric borders
- Frame elements should be template-specific: gold/burgundy florals for Traditional, soft pastel blooms for Modern, thin botanical line art for Minimalist
- The elderly UX improvements should be invisible to young users — not a separate "elderly mode", just better defaults
- Bank QR instruction text should be in plain Vietnamese that a grandparent would understand

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `EnvelopeAnimation.tsx` (262 lines): framer-motion multi-stage animation — needs performance gate added
- `FallingPetals.tsx` (122 lines): CSS keyframe animation — can be conditionally stopped after reveal
- `MusicPlayer.tsx` (112 lines): floating button — needs size increase for elderly UX
- `CountdownTimer.tsx` (159 lines): flip-clock animation — already dynamically imported
- `InvitationShell.tsx` (182 lines): orchestrates all components — desktop responsive wrapper goes here
- `TEMPLATE_COLORS` record: maps templateId to color palette — reuse for frame color mapping

### Established Patterns
- `next/dynamic` with `ssr: false` already used for all interactive public page components
- Template-specific styling via TEMPLATE_COLORS mapping (used in ThankYouPage, SaveTheDatePage)
- ISR revalidation via `triggerRevalidation(slug)` — reuse in cron for expired invitations
- `@nestjs/schedule` not yet installed but NestJS supports `@Cron` decorator natively

### Integration Points
- Cron job connects to existing `InvitationsService` — needs new `markExpired()` method
- Desktop frame wraps around existing InvitationShell — CSS/Tailwind responsive classes
- Performance gate hooks into EnvelopeAnimation component initialization
- Text size changes in template components and InvitationShell

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-polish-and-performance*
*Context gathered: 2026-03-16*
