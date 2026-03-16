# Phase 9: Polish and Performance - Research

**Researched:** 2026-03-16
**Domain:** Frontend performance optimization, CSS animation fallbacks, NestJS cron scheduling, accessibility/UX
**Confidence:** HIGH

## Summary

Phase 9 polishes the existing public invitation page to meet the PUBL-10 acceptance criterion (<1MB page weight on 4G) and adds four distinct deliverables: (1) animation performance gate with CSS-only fallback for low-end Android, (2) auto-expiry cron job via `@nestjs/schedule`, (3) elderly-friendly UX improvements (touch targets, text sizing, skip button, bank QR instructions), and (4) decorative desktop floral frame around the centered invitation card.

The existing codebase is well-structured for these changes. `EnvelopeAnimation.tsx` already has `measureFrameTime` / `frameTimesRef` infrastructure for performance detection -- it just needs the threshold gate and CSS fallback path. `InvitationShell.tsx` already uses `next/dynamic` with `ssr: false` for all interactive components. The `FallingPetals.tsx` already accepts an `enabled` prop. The `triggerRevalidation` helper is already used throughout `InvitationsService` and can be called from the cron. `@nestjs/schedule` is not yet installed but is fully compatible with NestJS 11.

**Primary recommendation:** Split work into 5 sub-plans: (1) performance gate + CSS fallback in EnvelopeAnimation, (2) elderly-friendly UX pass across all public page components, (3) auto-expiry cron job in NestJS, (4) desktop decorative frame wrapper, (5) bundle analysis + page weight verification.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Animation Fallback Strategy:** Simple fade reveal as fallback: envelope image fades in, tap fades out to reveal invitation. No particles, no 3D transforms. Falling petals play during envelope stage only, then stop after reveal. Detection via frame-time measurement: run 5-10 frames, if average >20ms switch to CSS-only fallback. Silent fallback -- no indicator to the guest.
- **Elderly-Friendly UX:** Always-visible "Bo qua" skip button at bottom of envelope screen from the start. Music play/pause floating button increased to 56px with clear equalizer bars. Base body text bumped from 14px to 16px, headings scale proportionally. Bank QR displayed at 240px+ with Vietnamese instruction text. All touch targets minimum 48px.
- **Desktop Layout:** Centered card layout (max-width ~480px) with decorative floral/botanical frame on sides. Template-specific colors. Envelope stays phone-sized (~400px), centered. Photo gallery keeps vertical stack. Decorative frame visible behind envelope.
- **Auto-Expiry Behavior:** No notification before expiry. NestJS @Cron scheduled task daily at midnight Vietnam time (UTC+7). Cron marks expired invitations, triggers ISR revalidation. Permanent expiry. 7-day grace period (already default in code).

### Claude's Discretion
- Exact floral frame SVG/CSS design and color mapping per template
- Bundle analysis tooling and code splitting strategy
- WebP serving configuration via Supabase transforms
- Critical CSS inlining approach
- Specific lazy loading thresholds
- iOS Safari / Zalo WKWebView audio testing checklist details
- Zalo OG tag validation approach

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PUBL-10 | Mobile-first, loads fast on 3G/4G (<1MB page weight) | Bundle analysis via `@next/bundle-analyzer`, code splitting via `next/dynamic` (already in place), image lazy loading, WebP (already served by sharp pipeline), font subsetting audit |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @nestjs/schedule | ^6.1.1 | Cron job scheduling for auto-expiry | Official NestJS module, compatible with NestJS 11, uses `@Cron` decorator |
| @next/bundle-analyzer | ^15.x | Bundle size analysis for page weight verification | Official Next.js plugin, generates interactive treemap of client/server bundles |
| framer-motion | ^12.0.0 (existing) | Animation -- needs performance gate added | Already in project, used by EnvelopeAnimation |
| Tailwind CSS | v4 (existing) | CSS-only fallback animations, responsive desktop frame | Already in project, CSS-first config via @theme |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| cron (transitive) | via @nestjs/schedule | Cron expression parsing | Installed automatically with @nestjs/schedule |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @next/bundle-analyzer | source-map-explorer | bundle-analyzer is official Next.js tool with better integration |
| @nestjs/schedule | node-cron standalone | @nestjs/schedule integrates with NestJS DI, supports timeZone option natively |
| CSS-only floral frame | SVG image files | SVG files add to page weight; CSS pseudo-elements and gradients achieve similar watercolor effect at zero network cost |

**Installation:**
```bash
cd apps/api && pnpm add @nestjs/schedule
cd apps/web && pnpm add -D @next/bundle-analyzer
```

## Architecture Patterns

### Recommended Changes to Existing Structure
```
apps/api/src/
├── invitations/
│   ├── invitations.service.ts        # ADD: markExpired() method
│   ├── expiry/
│   │   └── expiry-cron.service.ts    # NEW: @Cron task, calls markExpired + triggerRevalidation
│   └── invitations.module.ts         # MODIFY: import ScheduleModule.forRoot()
apps/web/app/w/[slug]/
├── EnvelopeAnimation.tsx             # MODIFY: add performance gate, CSS fallback path
├── EnvelopeAnimationFallback.tsx     # NEW: CSS-only fade animation (no framer-motion)
├── FallingPetals.tsx                 # MODIFY: stop after reveal via enabled prop
├── MusicPlayer.tsx                   # MODIFY: increase button to 56px
├── InvitationShell.tsx               # MODIFY: desktop frame wrapper, text size bump
├── DesktopFrame.tsx                  # NEW: decorative floral frame component
apps/web/components/templates/
├── TemplateTraditional.tsx           # MODIFY: bank QR 240px+, instruction text
├── TemplateModern.tsx                # MODIFY: same
├── TemplateMinimalist.tsx            # MODIFY: same
apps/web/
├── next.config.ts                    # MODIFY: add bundle analyzer wrapper
```

### Pattern 1: Performance Gate with CSS Fallback
**What:** Before running framer-motion envelope animation, measure frame time for 5-10 rAF frames. If average > 20ms (< 50fps), render CSS-only fade fallback instead.
**When to use:** On component mount, before the first interactive animation frame.
**Example:**
```typescript
// In EnvelopeAnimation.tsx
const [useFallback, setUseFallback] = useState<boolean | null>(null)

useEffect(() => {
  let frameCount = 0
  const frameTimes: number[] = []
  let lastTime = performance.now()
  let rafId: number

  const measure = () => {
    const now = performance.now()
    frameTimes.push(now - lastTime)
    lastTime = now
    frameCount++

    if (frameCount >= 8) {
      const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
      setUseFallback(avg > 20) // > 20ms = below 50fps
      return
    }
    rafId = requestAnimationFrame(measure)
  }
  rafId = requestAnimationFrame(measure)
  return () => cancelAnimationFrame(rafId)
}, [])

if (useFallback === null) return <LoadingPlaceholder /> // measuring...
if (useFallback) return <EnvelopeAnimationFallback {...props} />
// else: render full framer-motion animation
```

### Pattern 2: CSS-Only Fallback Animation
**What:** Simple fade-in envelope image, tap fades out to reveal. No particles, no 3D transforms, no framer-motion.
**When to use:** When performance gate detects low-end device.
**Example:**
```typescript
// EnvelopeAnimationFallback.tsx -- pure CSS transitions
function EnvelopeAnimationFallback({ onOpen, ...props }) {
  const [opened, setOpened] = useState(false)

  const handleOpen = () => {
    setOpened(true)
    setTimeout(onOpen, 500) // wait for CSS fade-out transition
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500"
      style={{ opacity: opened ? 0 : 1 }}
    >
      {/* Static envelope image, no 3D transforms */}
      <div onClick={handleOpen} role="button" aria-label="Mo thiep cuoi">
        {/* Simplified envelope render */}
      </div>
      <button onClick={handleOpen} className="absolute bottom-8 ...">
        Bo qua >>
      </button>
    </div>
  )
}
```

### Pattern 3: Auto-Expiry Cron Service
**What:** NestJS scheduled task that runs daily at midnight UTC+7 to mark expired invitations.
**When to use:** Always running in production as a background task.
**Example:**
```typescript
// expiry-cron.service.ts
import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InvitationsService } from '../invitations.service'

@Injectable()
export class ExpiryCronService {
  private readonly logger = new Logger(ExpiryCronService.name)

  constructor(private readonly invitations: InvitationsService) {}

  // Midnight UTC+7 = 17:00 UTC previous day
  @Cron('0 17 * * *', { name: 'auto-expire-invitations', timeZone: 'Asia/Ho_Chi_Minh' })
  async handleExpiry() {
    this.logger.log('Running auto-expiry check...')
    const count = await this.invitations.markExpired()
    this.logger.log(`Marked ${count} invitations as expired`)
  }
}
```

### Pattern 4: Desktop Decorative Frame
**What:** Centered card (max-width ~480px) with CSS decorative floral corners and borders visible on desktop (hidden on mobile).
**When to use:** Applied at InvitationShell level, wrapping the entire invitation content.
**Example:**
```typescript
// DesktopFrame.tsx
function DesktopFrame({ templateId, children }) {
  const frameColors = FRAME_COLORS[templateId] // reuse TEMPLATE_COLORS pattern

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 py-8 md:py-12">
      {/* Frame container -- only visible on md+ */}
      <div className="relative w-full max-w-[480px]">
        {/* Corner florals via CSS pseudo-elements or positioned divs */}
        <div className="hidden md:block absolute -top-6 -left-6 w-24 h-24"
          style={{ /* floral corner SVG or CSS gradient */ }}
        />
        {/* ... other corners */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Loading framer-motion on fallback path:** The CSS fallback must NOT import framer-motion. Use a separate component file so tree-shaking excludes it.
- **Blocking ISR revalidation in cron:** Each revalidation call should be non-blocking (fire-and-forget with try/catch), or the cron could time out on 100+ expired invitations.
- **Using `next/image` for photos that are already WebP:** The project serves photos from Supabase Storage already compressed to WebP via sharp. Adding `next/image` would add a double-compression step and increase server load. Native `<img>` with `loading="lazy"` is correct here.
- **Global font-size change affecting dashboard:** The 14px-to-16px bump should be scoped to the public invitation page only (not the admin/editor UI).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cron scheduling | Custom setInterval loop | `@nestjs/schedule` with `@Cron` decorator | Timezone support, process lifecycle management, restart-safe |
| Bundle analysis | Manual webpack inspection | `@next/bundle-analyzer` | Visual treemap, automatic report generation, route-level breakdown |
| Touch target sizing | Manual pixel calculations | Tailwind min-h/min-w classes (e.g., `min-h-12 min-w-12`) | Consistent, responsive, maintainable |
| Performance detection | Navigator.hardwareConcurrency guessing | Frame-time measurement via rAF + performance.now() | Actually measures real rendering performance, not proxy metrics |

**Key insight:** This phase modifies existing code more than it creates new code. The biggest risk is regressions to the working public page, not missing features.

## Common Pitfalls

### Pitfall 1: Performance gate runs after component is visible
**What goes wrong:** If the measuring loop takes 200ms+ on a very slow device, the user sees a flash of loading state.
**Why it happens:** 8 frames at 60fps = 133ms, but on a throttled device it could be 400ms+.
**How to avoid:** Show the sealed envelope (static) while measuring. The envelope is just CSS/HTML -- it renders instantly. Only the opening animation needs the gate.
**Warning signs:** Flash of blank screen on low-end devices.

### Pitfall 2: Cron marks invitations expired but ISR cache serves stale page
**What goes wrong:** DB says expired, but the cached page still shows the full invitation.
**Why it happens:** `triggerRevalidation` fires but Next.js ISR cache may take a few seconds to update. Also, `triggerRevalidation` can fail silently.
**How to avoid:** The runtime `expired` flag in `findBySlug` already computes expiry -- the cron is an optimization that also updates the DB status column for dashboard display. Both mechanisms should coexist: the cron updates DB status, and the runtime check in findBySlug remains as a safety net.
**Warning signs:** Invitation shows on public page but dashboard shows "expired" status.

### Pitfall 3: Desktop frame breaks mobile layout
**What goes wrong:** Fixed-width frame or padding squeezes content on mobile.
**Why it happens:** Frame CSS applies at all breakpoints.
**How to avoid:** Use `hidden md:block` for all decorative frame elements. The `max-w-[480px]` wrapper should only apply at `md:` breakpoint. On mobile, render full-width as before.
**Warning signs:** Content overflow or horizontal scroll on mobile.

### Pitfall 4: Font size bump cascading to wrong areas
**What goes wrong:** Bumping base text to 16px affects the admin panel or editor.
**Why it happens:** If size is changed in globals.css or layout.tsx body.
**How to avoid:** Scope the size change to the public page only. Add a CSS class or Tailwind utility to the InvitationShell wrapper: `text-base` (which is 16px in Tailwind). The template components already use specific text-sm/text-xs classes -- only the base body text needs the bump.
**Warning signs:** Editor/dashboard text looks different after changes.

### Pitfall 5: Bank QR image at 240px+ exceeds container on small screens
**What goes wrong:** QR image overflows its card container on 320px-wide screens.
**Why it happens:** Fixed width 240px + padding > 320px viewport.
**How to avoid:** Use `w-full max-w-[240px]` instead of fixed `w-[240px]`. The image scales down on tiny screens but hits 240px on normal phones.
**Warning signs:** Horizontal scroll or clipping on old Android phones.

### Pitfall 6: Falling petals still running after reveal wastes GPU
**What goes wrong:** 18 CSS-animated petal elements continue running while the user reads the invitation content.
**Why it happens:** `FallingPetals` `enabled` prop is currently always `true` in InvitationShell.
**How to avoid:** Pass `enabled={!envelopeOpened || false}` -- but per CONTEXT.md decision, petals play during envelope stage only, then stop. So: `enabled={!envelopeOpened}`.
**Warning signs:** Janky scrolling on revealed invitation content, visible in Chrome DevTools Layers panel.

## Code Examples

### Auto-Expiry markExpired Method (for InvitationsService)
```typescript
// Add to invitations.service.ts
/**
 * Mark published invitations as expired when their latest ceremony date
 * + grace period has passed. Returns the count of newly expired invitations.
 * Called by the expiry cron job.
 */
async markExpired(): Promise<number> {
  // Calculate cutoff date: 7 days ago from now
  const graceDays = 7
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - graceDays)
  const cutoffStr = cutoffDate.toISOString().split('T')[0]

  // Find published invitations where BOTH ceremony dates are before cutoff
  // (or only one is set and it's before cutoff)
  const { data, error } = await this.supabaseAdmin.client
    .from('invitations')
    .select('id, slug, groom_ceremony_date, bride_ceremony_date')
    .eq('status', 'published')
    .is('deleted_at', null)

  if (error || !data) return 0

  const toExpire = (data as any[]).filter(row => {
    const dates = [row.groom_ceremony_date, row.bride_ceremony_date]
      .filter((d): d is string => d !== null)
    if (dates.length === 0) return false
    const latest = dates.sort().pop()!
    return latest < cutoffStr
  })

  let count = 0
  for (const row of toExpire) {
    const { error: updateError } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ status: 'expired' })
      .eq('id', row.id)

    if (!updateError) {
      count++
      if (row.slug) {
        await this.triggerRevalidation(row.slug)
      }
    }
  }
  return count
}
```

### Performance Gate Integration Point
```typescript
// Existing code in EnvelopeAnimation.tsx already has:
const frameTimesRef = useRef<number[]>([])
const lastFrameRef = useRef<number>(0)
const measureFrameTime = useCallback(() => { ... }, [])

// The gate adds a pre-measurement phase BEFORE the existing animation
// The existing getConfettiParticleCount() already reduces confetti on slow frames
// This pattern extends that to a full fallback switch
```

### Desktop Frame Color Mapping (extends TEMPLATE_COLORS pattern)
```typescript
const FRAME_COLORS: Record<TemplateId, {
  corner: string; vine: string; bg: string
}> = {
  traditional: { corner: '#d4a843', vine: '#8B0000', bg: '#FFF8F0' },
  modern:      { corner: '#B76E79', vine: '#FFB7C5', bg: '#FFF5F7' },
  minimalist:  { corner: '#A0A0A0', vine: '#D5D0C4', bg: '#FAFAF8' },
}
```

### Bundle Analyzer Setup
```typescript
// next.config.ts
import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  // existing config...
}

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false, // don't auto-open browser
})

export default analyzer(nextConfig)
```

Run with: `ANALYZE=true pnpm --filter web build`

### Elderly-Friendly Skip Button (current vs target)
```typescript
// CURRENT (EnvelopeAnimation.tsx line 251-258):
<button
  onClick={handleSkip}
  aria-label="Bo qua"
  className="absolute bottom-8 right-8 rounded-full px-4 py-3 text-xs ..."
  style={{ minWidth: 44, minHeight: 44 }}
>

// TARGET:
<button
  onClick={handleSkip}
  aria-label="Bo qua"
  className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full px-6 py-3 text-sm font-medium ..."
  style={{ minWidth: 48, minHeight: 48 }}
>
  Bo qua >>
</button>
// Centered at bottom, always visible from start, larger text, 48px touch target
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| UA sniffing for device capability | Frame-time measurement via rAF | 2023+ | Actually measures real performance, not proxy |
| @nestjs/schedule v4 | @nestjs/schedule v6 | 2024 | NestJS 11 support, improved timeZone handling |
| next/image for all images | Native img for pre-optimized WebP | 2024+ | Avoids double-compression overhead |
| Separate elderly/accessibility mode | Inclusive defaults (larger targets for everyone) | WCAG 2.2 (2023) | Better UX for all users, no mode switching |

**Deprecated/outdated:**
- `navigator.hardwareConcurrency` as a performance proxy: Unreliable, does not measure actual rendering speed
- `@nestjs/schedule` v4.x: Incompatible with NestJS 11; use v6.x+

## Open Questions

1. **Cron: should status column get a new "expired" value or reuse existing statuses?**
   - What we know: Current statuses are `draft`, `published`, `save_the_date`. The `expired` flag in `findBySlug` is computed at runtime, not stored.
   - What's unclear: Whether adding `status = 'expired'` breaks existing queries that filter on `status IN ('published', 'save_the_date')`.
   - Recommendation: Add `'expired'` as a new status value. The cron updates `status` to `'expired'`. The `findBySlug` runtime check remains as a safety net. Dashboard queries already show status as a badge, so this gives accurate state. The `findBySlug` query currently filters `.in('status', ['published', 'save_the_date'])` -- expired invitations would no longer match, which is correct behavior (returns 404, same as the current `expired: true` redirect to ThankYouPage). But we need to also include `'expired'` in the findBySlug query and return the ThankYouPage for expired status.

2. **Floral frame: CSS-only or inline SVG?**
   - What we know: CSS gradients and pseudo-elements can create soft watercolor-like effects. SVG gives more detailed botanical shapes.
   - What's unclear: How realistic the "watercolor floral" aesthetic can look with pure CSS.
   - Recommendation: Use a hybrid approach -- CSS pseudo-elements for subtle gradient washes, and small inline SVG paths for botanical line-art corners. Total SVG payload should be < 2KB (simple path data, not rasterized images). This keeps page weight low while achieving the desired aesthetic.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x + @testing-library/react (web), Vitest 2.x + unplugin-swc (api) |
| Config file | `apps/web/vitest.config.ts`, `apps/api/vitest.config.ts` |
| Quick run command | `cd apps/web && pnpm vitest run --reporter=verbose` |
| Full suite command | `pnpm test` (turbo runs all workspace tests) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PUBL-10-perf | Performance gate detects slow device and renders fallback | unit | `cd apps/web && pnpm vitest run __tests__/components/EnvelopeAnimation.test.tsx -x` | Partial (existing test covers EnvelopeAnimation but not fallback gate) |
| PUBL-10-fallback | CSS fallback renders without framer-motion imports | unit | `cd apps/web && pnpm vitest run __tests__/components/EnvelopeAnimationFallback.test.tsx -x` | No -- Wave 0 |
| PUBL-10-elderly | Skip button always visible, 48px+ touch targets, 16px base text | unit | `cd apps/web && pnpm vitest run __tests__/components/InvitationShell.test.tsx -x` | No -- Wave 0 |
| PUBL-10-bankqr | Bank QR at 240px+ with Vietnamese instruction text | unit | `cd apps/web && pnpm vitest run __tests__/components/templates.test.tsx -x` | Partial (templates.test.tsx exists but does not test QR size) |
| PUBL-10-music | Music button 56px with clear equalizer bars | unit | `cd apps/web && pnpm vitest run __tests__/components/MusicPlayer.test.tsx -x` | Partial (MusicPlayer.test.tsx exists) |
| PUBL-10-cron | Cron marks expired invitations and triggers revalidation | unit | `cd apps/api && pnpm vitest run src/invitations/__tests__/expiry-cron.spec.ts -x` | No -- Wave 0 |
| PUBL-10-desktop | Desktop frame renders on md+ breakpoint only | unit | `cd apps/web && pnpm vitest run __tests__/components/DesktopFrame.test.tsx -x` | No -- Wave 0 |
| PUBL-10-weight | Total page weight < 1MB | manual | `ANALYZE=true pnpm --filter web build` then inspect report | N/A (manual verification) |

### Sampling Rate
- **Per task commit:** `cd apps/web && pnpm vitest run --reporter=verbose` (web tests only, < 15s)
- **Per wave merge:** `pnpm test` (all workspaces)
- **Phase gate:** Full suite green + manual page weight verification via bundle analyzer

### Wave 0 Gaps
- [ ] `apps/web/__tests__/components/EnvelopeAnimationFallback.test.tsx` -- covers PUBL-10-fallback
- [ ] `apps/web/__tests__/components/InvitationShell.test.tsx` -- covers PUBL-10-elderly (skip button, text size, petals stop)
- [ ] `apps/web/__tests__/components/DesktopFrame.test.tsx` -- covers PUBL-10-desktop
- [ ] `apps/api/src/invitations/__tests__/expiry-cron.spec.ts` -- covers PUBL-10-cron

## Sources

### Primary (HIGH confidence)
- Existing codebase: `EnvelopeAnimation.tsx` (262 lines), `FallingPetals.tsx` (122 lines), `MusicPlayer.tsx` (112 lines), `InvitationShell.tsx` (182 lines), `invitations.service.ts` (1223 lines) -- directly inspected
- [NestJS Task Scheduling docs](https://docs.nestjs.com/techniques/task-scheduling) -- @Cron decorator setup, ScheduleModule.forRoot(), timeZone support
- [@nestjs/schedule npm](https://www.npmjs.com/package/@nestjs/schedule) -- v6.1.1 latest, compatible with NestJS 11
- [@next/bundle-analyzer npm](https://www.npmjs.com/package/@next/bundle-analyzer) -- official Next.js bundle analysis tool
- [WCAG 2.2 Success Criterion 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) -- 24px minimum, 48px recommended for motor-impaired users
- [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) -- frame timing measurement API

### Secondary (MEDIUM confidence)
- [Motion.dev performance guide](https://motion.dev/docs/performance) -- framer-motion hardware acceleration behavior
- [Next.js Lazy Loading guide](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading) -- next/dynamic with ssr:false pattern

### Tertiary (LOW confidence)
- CSS watercolor floral effects -- achievability assessment based on general CSS gradient capabilities, not verified with specific implementation. Recommend inline SVG for botanical detail.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- @nestjs/schedule is the official NestJS scheduling solution; @next/bundle-analyzer is the official Next.js tool; both verified via npm/docs
- Architecture: HIGH -- changes extend existing patterns already in the codebase (TEMPLATE_COLORS, next/dynamic, triggerRevalidation)
- Pitfalls: HIGH -- identified from direct code inspection of existing components and their integration points
- Desktop frame aesthetics: MEDIUM -- CSS/SVG approach is sound but exact visual quality requires iteration

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable dependencies, no fast-moving changes expected)
