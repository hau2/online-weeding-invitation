# Phase 5: Public Invitation Page - Research

**Researched:** 2026-03-15
**Domain:** Public-facing SSR page with animations, audio playback, OG meta tags, QR generation, ISR
**Confidence:** HIGH

## Summary

Phase 5 builds the guest-facing public invitation page at `/w/[slug]`. This is the most technically diverse phase so far: it combines server-side rendering for OG meta tags and SEO crawlers, client-side animation orchestration (envelope reveal, falling petals, confetti), audio playback with iOS gesture-unlock, a flip-clock countdown timer, QR code generation on the NestJS side, and ISR with on-demand revalidation.

The project already has the key libraries installed: framer-motion v12, howler.js v2.2.4, canvas-confetti v1.9.4. The TemplateRenderer and three template components (Traditional/Modern/Minimalist) are ready to render invitation content from `Invitation` props. The NestJS API has all the CRUD endpoints but currently lacks a public (unauthenticated) endpoint to fetch an invitation by slug.

**Primary recommendation:** Build this phase in layers: (1) public NestJS endpoint + ISR page shell with OG meta, (2) envelope animation + audio unlock, (3) petals + confetti effects, (4) music player, (5) guest name personalization, (6) countdown timer, (7) QR generation service, (8) post-wedding expiry logic. Each layer is independently testable.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Envelope animation: realistic textured envelope with flap, wax seal, template-matching colors (Traditional=red/gold, Modern=white/rose gold, Minimalist=cream/ivory). On tap: flap lifts, card slides up, envelope fades, invitation fills screen
- Falling petals: CSS keyframes throughout the page as guest scrolls, no JS animation loop
- Music player: floating circular play/pause button fixed bottom-right, animated equalizer bars when playing, howler.js for playback, music unlocked only after envelope tap gesture
- Guest name: `?to=Name` displayed on envelope as "Tran trong kinh moi [Name]", max 50 chars, strip HTML/script, client-side only
- Countdown timer: flip-clock style with animated flipping digits, four units (Ngay/Gio/Phut/Giay), embedded in content flow
- Post-wedding: 7-day default grace period, thank-you page with couple names + thankYouText + first photo, no envelope animation on thank-you page, NestJS checks expiry on request
- OG meta: server-rendered og:image (couple's first photo), og:title with couple names, og:description with date and venue

### Claude's Discretion
- Exact envelope dimensions, seal design, paper texture approach
- Petal density, animation speed, and color per template
- Flip-clock animation implementation details
- OG image dimensions and fallback image
- ISR revalidation strategy details
- Error states (invitation not found, unpublished)
- Skip button placement and styling for envelope animation
- Floating music button exact size, position offset, and shadow

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PUBL-01 | Published invitation accessible at `/w/{slug}` without login | Next.js ISR page at `app/w/[slug]/page.tsx`, public NestJS endpoint, middleware exclusion |
| PUBL-02 | Fixed QR code generated for invitation URL (never changes after publish) | `qrcode` npm package on NestJS, generates PNG at publish time, stores to Supabase Storage |
| PUBL-03 | Rich envelope opening animation with particles, petals, transitions | framer-motion v12 orchestration, CSS keyframes petals, canvas-confetti burst |
| PUBL-04 | Guest taps envelope to reveal full invitation (gesture unlocks audio) | framer-motion tap handler triggers reveal sequence + howler.js AudioContext unlock |
| PUBL-05 | Personalized greeting via `?to=Name` | Client-side useSearchParams(), sanitization, conditional rendering on envelope |
| PUBL-06 | Displays all invitation details | Reuse TemplateRenderer with Invitation props from server fetch |
| PUBL-07 | Wedding date countdown timer | Client-side flip-clock component with CSS 3D transforms + setInterval |
| PUBL-08 | Background music with play/pause toggle (no autoplay) | howler.js v2.2.4 with dynamic import, autoUnlock after tap gesture |
| PUBL-09 | Zalo/Facebook OG meta tags for proper link preview | generateMetadata with dynamic openGraph, htmlLimitedBots config for Zalo crawler |
| PUBL-10 | Mobile-first, fast on 3G/4G (<1MB page weight) | Deferred to Phase 9, but Phase 5 uses dynamic imports, lazy loading, CSS-only petals |
| PUBL-11 | Auto-expires after wedding date + configurable grace period | NestJS checks expiry on public endpoint request, returns expired state |
| PUBL-12 | Switches to thank-you page after wedding date | Conditional rendering based on expired state from API response |

</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | ^12.0.0 | Envelope animation orchestration | Already used throughout app; variants + gesture handlers for multi-stage reveal |
| howler.js | 2.2.4 | Background music playback | Already used in MusicPicker; handles Web Audio API unlock, loop, cross-browser |
| canvas-confetti | ^1.9.4 | Confetti burst on envelope open | Already dynamically imported in Phase 3 publish celebration |
| next | ^15.1.6 | ISR, generateMetadata, dynamic routes | Project framework; ISR + on-demand revalidation for public pages |

### New Dependencies Required
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| qrcode | ^1.5.4 | QR code PNG generation | NestJS generates QR at publish time, stores PNG to Supabase Storage |

### Already Available (No Install Needed)
| Library | Purpose |
|---------|---------|
| lucide-react | Icons for play/pause, skip button |
| @repo/types | Invitation type definition |
| sharp (api) | Image processing if QR needs optimization |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| qrcode | qr-code-styling | More customizable styling, but heavier; plain QR is sufficient for invitation URL |
| howler.js | Web Audio API directly | More control but need to handle browser quirks manually; howler already proven in project |
| CSS keyframe petals | canvas-based petals | Canvas gives more control but requires JS animation loop, worse on low-end 3G devices |

**Installation (NestJS API only):**
```bash
cd apps/api && pnpm add qrcode && pnpm add -D @types/qrcode
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/app/w/[slug]/
  page.tsx              # Server component: fetch data, generateMetadata, render shell
  EnvelopeAnimation.tsx # 'use client' — framer-motion orchestration (dynamically imported)
  InvitationContent.tsx # 'use client' — TemplateRenderer + countdown + music player
  FallingPetals.tsx     # 'use client' — CSS keyframes petal overlay
  MusicPlayer.tsx       # 'use client' — howler.js floating button
  CountdownTimer.tsx    # 'use client' — flip-clock countdown
  ThankYouPage.tsx      # 'use client' — post-wedding display

apps/web/app/api/revalidate/route.ts  # Route Handler for on-demand ISR revalidation

apps/api/src/invitations/
  invitations.controller.ts  # Add public GET /invitations/public/:slug (no auth)
  invitations.service.ts     # Add findBySlug() + generateQrCode() methods
```

### Pattern 1: ISR Public Page with generateMetadata
**What:** Server component fetches invitation data, generates OG metadata, renders client shell
**When to use:** Every `/w/[slug]` page request
**Example:**
```typescript
// Source: Next.js official docs — generateMetadata + ISR
// apps/web/app/w/[slug]/page.tsx

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

// ISR: revalidate every 1 hour as fallback, on-demand revalidation on publish
export const revalidate = 3600

async function getInvitation(slug: string) {
  const res = await fetch(`${API_URL}/invitations/public/${slug}`, {
    next: { tags: [`invitation-${slug}`] },
  })
  if (!res.ok) return null
  return res.json()
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const invitation = await getInvitation(slug)
  if (!invitation) return {}

  const ogImage = invitation.photoUrls?.[0] ?? '/default-og.jpg'
  const title = `Thiep cuoi ${invitation.groomName} & ${invitation.brideName}`

  return {
    title: { absolute: title },
    description: `${invitation.weddingDate ? new Date(invitation.weddingDate).toLocaleDateString('vi-VN') : ''} - ${invitation.venueName}`,
    openGraph: {
      title,
      description: `Tran trong kinh moi`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
      locale: 'vi_VN',
    },
  }
}

export default async function PublicInvitationPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const invitation = await getInvitation(slug)
  if (!invitation) notFound()

  // Check expiry state from API response
  if (invitation.expired) {
    return <ThankYouPage invitation={invitation} />
  }

  return <InvitationShell invitation={invitation} />
}
```

### Pattern 2: On-Demand ISR Revalidation via Route Handler
**What:** NestJS calls Next.js route handler after publish/unpublish to invalidate cached page
**When to use:** After each publish or unpublish action
**Example:**
```typescript
// apps/web/app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidation-secret')
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await request.json()
  revalidateTag(`invitation-${slug}`)
  return NextResponse.json({ revalidated: true })
}
```

### Pattern 3: Envelope Animation Orchestration with framer-motion
**What:** Multi-stage animation sequence: envelope appears -> tap -> flap opens -> card slides out -> envelope fades -> invitation fills screen
**When to use:** First visit to public page
**Example:**
```typescript
// framer-motion variant-based orchestration
// Source: framer-motion docs — variants, staggerChildren, delayChildren

const envelopeVariants = {
  sealed: { scale: 1 },
  opening: {
    transition: { staggerChildren: 0.3, delayChildren: 0.2 }
  },
  revealed: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.5 }
  }
}

const flapVariants = {
  sealed: { rotateX: 0 },
  opening: { rotateX: -180, transition: { duration: 0.8, ease: 'easeInOut' } }
}

const cardVariants = {
  sealed: { y: 0 },
  opening: { y: -200, transition: { duration: 0.6, delay: 0.4 } },
  revealed: { y: 0, scale: 1 }
}
```

### Pattern 4: howler.js Audio Unlock via Gesture
**What:** Audio playback starts only after user taps envelope; howler's AudioContext is unlocked by the gesture
**When to use:** Music player initialization
**Example:**
```typescript
// Dynamic import howler to avoid SSR
const handleEnvelopeTap = async () => {
  const { Howl } = await import('howler')
  const music = new Howl({
    src: [musicUrl],
    html5: true,
    loop: true,
    volume: 0.5,
  })
  music.play()
  setMusicInstance(music)
  setIsPlaying(true)
}
```

### Pattern 5: CSS-Only Falling Petals
**What:** Pure CSS keyframe animations for falling flower petals — no JS animation loop
**When to use:** Romantic atmosphere overlay on public page
**Example:**
```css
/* Petal elements created via repeated divs with different animation-delay */
@keyframes petal-fall {
  0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 0.8; }
  100% { transform: translateY(110vh) translateX(80px) rotate(360deg); opacity: 0; }
}

.petal {
  position: fixed;
  width: 12px;
  height: 16px;
  background: radial-gradient(ellipse, rgba(255,182,193,0.8), rgba(255,105,180,0.3));
  border-radius: 50% 0 50% 0;
  animation: petal-fall linear infinite;
  pointer-events: none;
  z-index: 1;
}
```

### Pattern 6: Flip-Clock Countdown
**What:** CSS 3D transforms create mechanical digit flip effect
**When to use:** Countdown to wedding date embedded in invitation content
**Example:**
```typescript
// Each digit card has a top half and bottom half
// On change: top half flips down with rotateX(-90deg) revealing new digit
// CSS perspective + backface-visibility create the 3D flip illusion

const FlipCard = ({ digit, label }: { digit: string; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="relative h-16 w-12 [perspective:200px]">
      {/* Static top showing current digit */}
      <div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-md bg-gray-800">
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-3xl font-bold text-white">
          {digit}
        </span>
      </div>
      {/* Static bottom showing current digit */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden rounded-b-md bg-gray-900">
        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-3xl font-bold text-white">
          {digit}
        </span>
      </div>
    </div>
    <span className="mt-1 text-xs uppercase tracking-wide">{label}</span>
  </div>
)
```

### Anti-Patterns to Avoid
- **Playing audio on page load:** Browser autoplay policies will block it. Always gate behind user gesture (envelope tap). howler.js autoUnlock helps but requires user interaction first.
- **Using `getServerSideProps` instead of ISR:** This would SSR every request. ISR caches the page and only regenerates on-demand or after revalidation period.
- **Animating petals with JS requestAnimationFrame:** CSS keyframes are GPU-accelerated and don't block the main thread. JS animation loops drain battery and struggle on 3G devices.
- **Sending `?to=` value to the server:** The guest name is a privacy concern. Parse it client-side only with `useSearchParams()`, never store or log it.
- **Using `next/image` for OG meta `og:image`:** OG crawlers need a direct absolute URL to the image file, not a Next.js optimized image URL. Use the raw Supabase Storage public URL.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QR code generation | Custom QR matrix renderer | `qrcode` npm package | Error correction, encoding modes, output formats all handled |
| Audio playback + mobile unlock | Raw Web Audio API + custom unlock listeners | howler.js v2.2.4 | Cross-browser AudioContext management, autoUnlock, HTML5 fallback |
| Multi-stage animation sequencing | Manual CSS transition chaining with timeouts | framer-motion variants + staggerChildren | Interruptible, composable, handles layout animation |
| Confetti burst | Canvas particle system | canvas-confetti | Optimized for short bursts, auto-cleanup, small bundle |
| ISR revalidation | Custom cache invalidation system | Next.js revalidateTag / revalidatePath | Built into framework, handles stale-while-revalidate correctly |
| OG meta tag generation | Manual `<meta>` tag injection | Next.js generateMetadata | Type-safe, SSR-aware, handles streaming metadata for bots |

**Key insight:** The project already has framer-motion, howler.js, and canvas-confetti installed. The only new dependency is `qrcode` for server-side QR generation. Resist adding new animation or audio libraries.

## Common Pitfalls

### Pitfall 1: Streaming Metadata Invisible to Zalo/Facebook Crawlers
**What goes wrong:** Next.js 15.2+ streams metadata by default, inserting OG tags after initial HTML. Facebook (`facebookexternalhit`) and Zalo crawlers are "HTML-limited bots" that don't execute JavaScript — they only read the initial HTML `<head>`.
**Why it happens:** Next.js defaults to streaming metadata for performance, but social crawlers need tags in the initial response.
**How to avoid:** Next.js automatically detects known HTML-limited bots (including `facebookexternalhit`) and blocks metadata streaming for them. For Zalo, the crawler user-agent contains `Zalo/` — add it to `htmlLimitedBots` in `next.config.ts` if not already recognized:
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  htmlLimitedBots: /Googlebot|facebookexternalhit|Zalo\//i,
  // ... existing config
}
```
**Warning signs:** Sharing a link on Zalo shows a blank preview or generic fallback image.

### Pitfall 2: iOS Audio Playback in Zalo In-App Browser (WKWebView)
**What goes wrong:** Audio plays fine in Safari but fails silently in Zalo's in-app browser (WKWebView).
**Why it happens:** WKWebView has stricter autoplay policies than Safari. howler.js `autoUnlock` may not trigger correctly in some WKWebView contexts. The AudioContext can enter an "interrupted" state after app backgrounding.
**How to avoid:** Always use `html5: true` in howler.js Howl config for better WKWebView compatibility. Gate audio behind an explicit user tap (envelope open). Add a manual `Howler.ctx?.resume()` call before playing if context state is "suspended" or "interrupted".
**Warning signs:** Music plays in Safari but not when opening the link from within Zalo chat.

### Pitfall 3: Middleware Blocking Public Routes
**What goes wrong:** Navigating to `/w/slug-name` redirects to login page.
**Why it happens:** The existing middleware at `apps/web/middleware.ts` uses a matcher config. Currently it matches `/dashboard/:path*`, `/thep-cuoi/:path*`, `/admin/:path*`. The `/w/` route is NOT in the matcher, so it will NOT be intercepted. But if someone adds a catch-all matcher later, it could break.
**How to avoid:** Verify the middleware matcher does NOT include `/w/*`. The current config is correct by exclusion — the matcher only lists authenticated routes. Document this clearly.
**Warning signs:** 302 redirect from `/w/slug` to `/dang-nhap`.

### Pitfall 4: OG Image URL Must Be Absolute
**What goes wrong:** Zalo/Facebook preview shows broken image icon.
**Why it happens:** OG crawlers need fully qualified absolute URLs (e.g., `https://example.com/image.jpg`). Relative paths like `/image.jpg` don't work. Supabase Storage public URLs are already absolute, but if using a default fallback image, it must also be absolute.
**How to avoid:** Set `metadataBase` in the root layout or the public page layout. Use full Supabase public URLs for og:image. For default/fallback images, use `metadataBase` to compose absolute URLs.
**Warning signs:** Preview shows site title but missing or broken image.

### Pitfall 5: `canvas-confetti` Default Export Issue in Next.js
**What goes wrong:** Build error: `'canvas-confetti' does not contain a default export`.
**Why it happens:** canvas-confetti uses CJS exports. Next.js App Router may not resolve the default export correctly.
**How to avoid:** Use dynamic `import()` and access the module correctly:
```typescript
const confettiModule = await import('canvas-confetti')
const confetti = confettiModule.default ?? confettiModule
confetti({ particleCount: 100, spread: 70 })
```
**Warning signs:** Build-time or runtime import error.

### Pitfall 6: Race Condition Between Animation End and Music Start
**What goes wrong:** Music starts playing before envelope animation completes, or doesn't start at all.
**Why it happens:** framer-motion `onAnimationComplete` fires per-variant per-element. If you listen on the wrong element, the callback fires too early or never.
**How to avoid:** Use `useAnimate` or `AnimationPlaybackControls` from framer-motion to precisely sequence: envelope tap -> wait for flap open -> start music -> slide card. Or use a state machine approach where each animation stage sets state that triggers the next.
**Warning signs:** Audio plays while envelope is still visible, or never plays.

### Pitfall 7: Countdown Timer Timezone Issues
**What goes wrong:** Countdown shows wrong time remaining for guests in different timezones.
**Why it happens:** Wedding date stored as date string (e.g., "2026-06-15") without timezone. JavaScript `new Date("2026-06-15")` uses UTC at midnight, but the wedding is in Vietnam timezone (UTC+7).
**How to avoid:** Combine weddingDate + weddingTime into a specific moment in ICT/Vietnam timezone. Use explicit timezone offset when calculating the target timestamp:
```typescript
// Compose target date in Vietnam timezone
const targetStr = `${weddingDate}T${weddingTime || '00:00'}:00+07:00`
const targetMs = new Date(targetStr).getTime()
```
**Warning signs:** Countdown shows 7 hours off from expected.

### Pitfall 8: QR Code URL Stability
**What goes wrong:** QR code points to a URL that changes after re-publish.
**Why it happens:** If QR generation uses the invitation ID or a changing URL pattern.
**How to avoid:** Slug is permanently locked at DB constraint level after first publish (already enforced). QR URL is always `{SITE_URL}/w/{slug}`. Generate QR once at first publish. On re-publish, skip QR generation if slug already exists.
**Warning signs:** Physical printed QR code stops working.

## Code Examples

### Public NestJS Endpoint (No Auth)
```typescript
// Source: Existing invitations.controller.ts pattern
// Add to invitations.controller.ts — BEFORE @UseGuards(JwtGuard) class decorator

@Controller('invitations')
export class InvitationsController {
  // ... existing @UseGuards(JwtGuard) methods ...

  /**
   * Public endpoint — no JWT required.
   * Returns published invitation by slug, or expired state with thank-you content.
   */
  @Get('public/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.invitationsService.findBySlug(slug)
  }
}
```

Note: The public endpoint must either be in a separate controller without `@UseGuards(JwtGuard)` at the class level, or use a `@Public()` decorator to bypass the guard. Since the existing controller has `@UseGuards(JwtGuard)` as a class-level decorator, the cleanest approach is a separate `PublicInvitationsController`.

### QR Code Generation in NestJS
```typescript
// Source: qrcode npm package docs
import * as QRCode from 'qrcode'

async generateQrCode(slug: string): Promise<Buffer> {
  const url = `${this.config.get('SITE_URL')}/w/${slug}`
  const buffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'H', // High — survives up to 30% damage
    color: { dark: '#000000', light: '#FFFFFF' },
  })
  return buffer
}
```

### Revalidation Trigger from NestJS
```typescript
// In NestJS publish/unpublish service methods:
async triggerRevalidation(slug: string): Promise<void> {
  const nextUrl = this.config.get('NEXT_PUBLIC_URL')
  const secret = this.config.get('REVALIDATION_SECRET')
  try {
    await fetch(`${nextUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidation-secret': secret,
      },
      body: JSON.stringify({ slug }),
    })
  } catch {
    // Non-blocking: revalidation failure doesn't block publish
    // Page will still serve stale content and refresh on next request
  }
}
```

### Music Player Component Pattern
```typescript
// Source: Existing MusicPicker.tsx howler.js pattern
'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'

interface MusicPlayerProps {
  musicUrl: string
  autoStart?: boolean // true after envelope tap
}

export function MusicPlayer({ musicUrl, autoStart }: MusicPlayerProps) {
  const howlRef = useRef<import('howler').Howl | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const initAndPlay = useCallback(async () => {
    if (howlRef.current) {
      howlRef.current.play()
      setIsPlaying(true)
      return
    }

    const { Howl } = await import('howler')
    const howl = new Howl({
      src: [musicUrl],
      html5: true,
      loop: true,
      volume: 0.5,
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
    })
    howlRef.current = howl
    howl.play()
  }, [musicUrl])

  // Auto-start after envelope tap
  useEffect(() => {
    if (autoStart) initAndPlay()
  }, [autoStart, initAndPlay])

  // Cleanup
  useEffect(() => {
    return () => {
      howlRef.current?.unload()
    }
  }, [])

  const toggle = useCallback(() => {
    if (!howlRef.current) return
    if (isPlaying) {
      howlRef.current.pause()
    } else {
      howlRef.current.play()
    }
  }, [isPlaying])

  return (
    <button
      onClick={toggle}
      className="fixed bottom-6 right-6 z-50 size-12 rounded-full bg-white/90 shadow-lg backdrop-blur"
      aria-label={isPlaying ? 'Tam dung nhac' : 'Phat nhac'}
    >
      {isPlaying ? <Pause className="size-5 mx-auto" /> : <Play className="size-5 mx-auto ml-1" />}
    </button>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getServerSideProps` for dynamic pages | ISR with `revalidate` + `revalidateTag` | Next.js 13+ App Router | Cached pages, on-demand invalidation |
| `Howler.mobileAutoEnable` | `Howler.autoUnlock` | howler.js 2.2.0+ | Audio locking not mobile-only; renamed property |
| Manual `<meta>` tags in `<Head>` | `generateMetadata` / `metadata` export | Next.js 13.2+ | Type-safe, SSR-aware, streaming support |
| `unstable_revalidate` | `revalidateTag` / `revalidatePath` | Next.js 14+ stable | Production-ready on-demand ISR |
| Blocking metadata for all bots | Streaming metadata with htmlLimitedBots | Next.js 15.2+ | Faster TTFB; only HTML-limited bots get blocking |
| framer-motion (package name) | motion (npm rename) | Late 2024 | v12 still uses `framer-motion` import but package is moving to `motion` |

**Deprecated/outdated:**
- `Howler.mobileAutoEnable`: renamed to `Howler.autoUnlock`
- `themeColor` in Next.js metadata: use `generateViewport` instead
- `next/head` for metadata: use `generateMetadata` export in App Router

## Open Questions

1. **Zalo Crawler User-Agent Detection**
   - What we know: Zalo's crawler/bot uses a user-agent containing `Zalo/` (e.g., `Zalo/195.1 CFNetwork/...`). Zalo follows standard OG protocol. Zalo provides a debug tool at `https://developers.zalo.me/tools/debug-sharing`.
   - What's unclear: Whether Next.js's built-in `htmlLimitedBots` list already includes `Zalo/`. If not, we need to add it to ensure OG tags are in initial HTML.
   - Recommendation: Add `Zalo\/` to `htmlLimitedBots` regex in `next.config.ts` to be safe. Test with Zalo debug tool after deployment.

2. **iOS WKWebView Audio in Zalo App**
   - What we know: howler.js autoUnlock works in Safari. WKWebView (Zalo in-app browser) has stricter policies. AudioContext can enter "interrupted" state.
   - What's unclear: Exact behavior of howler.js autoUnlock inside Zalo's WKWebView. Cannot test without real device + Zalo app.
   - Recommendation: Use `html5: true` mode. Gate behind envelope tap gesture. Add manual `Howler.ctx?.resume()` as fallback. Mark as "requires real-device testing" in verification.

3. **Envelope Animation Performance on Low-End Android**
   - What we know: Performance gate should halve particle density if frame time > 20ms. CSS-only fallback for very low-end devices.
   - What's unclear: Actual frame times on Xiaomi Redmi 9, Samsung Galaxy A14 with framer-motion + CSS petals + confetti simultaneously.
   - Recommendation: Build performance gate in Phase 5. Full low-end device testing deferred to Phase 9 (Polish and Performance).

4. **Public Endpoint Architecture**
   - What we know: Current `InvitationsController` has `@UseGuards(JwtGuard)` at class level. Public endpoint cannot live under same class decorator.
   - What's unclear: Whether to use a `@Public()` custom decorator with guard override, or create a separate `PublicInvitationsController`.
   - Recommendation: Create a separate `PublicInvitationsController` — cleaner separation, no risk of accidentally exposing authenticated endpoints.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x |
| Config file (web) | `apps/web/vitest.config.ts` |
| Config file (api) | `apps/api/vitest.config.ts` |
| Quick run command (web) | `cd apps/web && pnpm vitest run --reporter=verbose` |
| Quick run command (api) | `cd apps/api && pnpm vitest run --reporter=verbose` |
| Full suite command | `pnpm -r run test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PUBL-01 | Public page accessible without auth | unit (API) + unit (component) | `cd apps/api && pnpm vitest run src/invitations/__tests__/public-invitations.spec.ts -x` | No -- Wave 0 |
| PUBL-02 | QR code generated at publish time | unit (API) | `cd apps/api && pnpm vitest run src/invitations/__tests__/qr-generation.spec.ts -x` | No -- Wave 0 |
| PUBL-03 | Envelope animation renders | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/EnvelopeAnimation.test.tsx -x` | No -- Wave 0 |
| PUBL-04 | Envelope tap triggers reveal | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/EnvelopeAnimation.test.tsx -x` | No -- Wave 0 |
| PUBL-05 | Guest name personalization | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/GuestName.test.tsx -x` | No -- Wave 0 |
| PUBL-06 | Full invitation details display | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/InvitationContent.test.tsx -x` | No -- Wave 0 |
| PUBL-07 | Countdown timer | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/CountdownTimer.test.tsx -x` | No -- Wave 0 |
| PUBL-08 | Music player with play/pause | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/MusicPlayer.test.tsx -x` | No -- Wave 0 |
| PUBL-09 | OG meta tags | manual-only | Test with Facebook Debugger + Zalo Debug Sharing tool | N/A |
| PUBL-11 | Auto-expiry logic | unit (API) | `cd apps/api && pnpm vitest run src/invitations/__tests__/public-invitations.spec.ts -x` | No -- Wave 0 |
| PUBL-12 | Thank-you page switch | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/ThankYouPage.test.tsx -x` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `cd apps/web && pnpm vitest run --reporter=verbose` or `cd apps/api && pnpm vitest run --reporter=verbose` (depending on which app was modified)
- **Per wave merge:** `pnpm -r run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/web/__tests__/components/EnvelopeAnimation.test.tsx` -- covers PUBL-03, PUBL-04
- [ ] `apps/web/__tests__/components/MusicPlayer.test.tsx` -- covers PUBL-08
- [ ] `apps/web/__tests__/components/CountdownTimer.test.tsx` -- covers PUBL-07
- [ ] `apps/web/__tests__/components/GuestName.test.tsx` -- covers PUBL-05
- [ ] `apps/web/__tests__/components/InvitationContent.test.tsx` -- covers PUBL-06
- [ ] `apps/web/__tests__/components/ThankYouPage.test.tsx` -- covers PUBL-12
- [ ] `apps/api/src/invitations/__tests__/public-invitations.spec.ts` -- covers PUBL-01, PUBL-11
- [ ] `apps/api/src/invitations/__tests__/qr-generation.spec.ts` -- covers PUBL-02
- [ ] Framework install: `cd apps/api && pnpm add qrcode && pnpm add -D @types/qrcode` -- qrcode dependency

## Sources

### Primary (HIGH confidence)
- [Next.js ISR Guide](https://nextjs.org/docs/app/guides/incremental-static-regeneration) -- ISR setup, revalidateTag, revalidatePath, caveats
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) -- openGraph metadata, streaming metadata, htmlLimitedBots, params typing
- [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) -- POST webhook handler for revalidation
- Existing codebase: `apps/web/app/(app)/thep-cuoi/[id]/MusicPicker.tsx` -- howler.js dynamic import pattern
- Existing codebase: `apps/web/components/templates/TemplateRenderer.tsx` -- template rendering pattern
- Existing codebase: `apps/web/middleware.ts` -- auth matcher excludes `/w/*` routes
- Existing codebase: `apps/api/src/invitations/invitations.service.ts` -- publish/slug logic, mapRow pattern

### Secondary (MEDIUM confidence)
- [howler.js GitHub Issues](https://github.com/goldfire/howler.js/issues/505) -- autoUnlock behavior, iOS WKWebView caveats
- [howler.js GitHub Issues #1057](https://github.com/goldfire/howler.js/issues/1057) -- iOS HTML5 audio unlocking
- [qrcode npm](https://www.npmjs.com/package/qrcode) -- QR generation API, toBuffer/toFile methods
- [canvas-confetti GitHub Issue #222](https://github.com/catdad/canvas-confetti/issues/222) -- Next.js default export workaround
- [OG Image Best Practices 2025](https://www.krumzi.com/blog/open-graph-image-sizes-for-social-media-the-complete-2025-guide) -- 1200x630 standard, JPEG/PNG format
- [Zalo Debug Sharing tool](https://developers.zalo.me/tools/debug-sharing) -- Test OG tags for Zalo

### Tertiary (LOW confidence)
- Zalo crawler user-agent `Zalo/` pattern -- from user-agents.net single source, needs real-device validation
- WKWebView audio behavior in Zalo app -- from GitHub issues, not officially documented by Zalo
- Low-end Android animation performance -- cannot verify without real device testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all key libraries already installed and proven in project
- Architecture: HIGH -- ISR, generateMetadata, Route Handlers are well-documented Next.js patterns
- Pitfalls: MEDIUM -- iOS WKWebView and Zalo crawler behavior need real-device validation
- QR generation: HIGH -- qrcode npm is mature, well-documented, straightforward API
- Animation orchestration: HIGH -- framer-motion variants pattern is well-documented
- OG meta tags: MEDIUM -- Zalo-specific behavior not officially documented

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (30 days -- stable technologies, main uncertainty is Zalo-specific behavior)
