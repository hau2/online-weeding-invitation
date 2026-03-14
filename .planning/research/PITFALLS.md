# Pitfalls Research

**Domain:** Vietnamese Wedding Invitation SaaS (Next.js + NestJS + Supabase)
**Researched:** 2026-03-14
**Confidence:** HIGH (critical pitfalls verified against official docs and multiple sources)

---

## Critical Pitfalls

### Pitfall 1: Audio Autoplay Blocked by All Mobile Browsers

**What goes wrong:**
Background music silently fails to play on every mobile browser — iOS Safari, Chrome on Android, and especially WeChat browser (dominant in Vietnam for QR sharing). The invitation loads, the animation runs, but no sound plays. Users have no indication why. Couples who specifically configured music experience this as a broken feature.

**Why it happens:**
All modern browsers enforce an autoplay policy: audio cannot play without a prior user gesture on the page. The `autoplay` HTML attribute is ignored for audio with sound. This is not a bug — it is intentional browser behavior that has been hardened every year since 2018. Developers test on desktop where a small amount of prior site interaction unlocks autoplay, and miss the mobile failure entirely.

**How to avoid:**
Never attempt silent autoplay. Design the envelope-opening animation to require a tap/click to begin — this user gesture simultaneously triggers the animation AND unlocks audio. Show an explicit, visible music icon that pulses or indicates music is ready to play. On the public invitation page, the "tap to open envelope" interaction IS the audio unlock gate. Store play/pause preference in sessionStorage so it persists across soft navigations but resets on fresh load.

**Warning signs:**
- Music plays in local dev on Chrome desktop but not when tested on a real phone
- Any code path that calls `audio.play()` without being directly inside a `click` or `touchend` event handler
- Using `<audio autoplay>` tag without a `muted` attribute

**Phase to address:**
Public invitation page phase (envelope animation + music integration). Audio unlock must be architected into the envelope-open interaction from day one, not retrofitted.

---

### Pitfall 2: Supabase RLS Disabled or Wrong — Invitation Data Exposed

**What goes wrong:**
A user can read, modify, or delete another user's invitation by guessing or brute-forcing invitation IDs. In a wedding invitation product this is especially sensitive — couples trust the platform with their photos, bank QR images, and personal details.

**Why it happens:**
Supabase tables have RLS disabled by default. In January 2025, 170+ apps built with Lovable (CVE-2025-48757) exposed entire databases because RLS was never enabled. The second failure mode is enabling RLS but writing no policies — this denies all access including the owner. The third failure mode is writing policies that check `user_metadata` claims (which users can self-modify) instead of `auth.uid()`.

**How to avoid:**
Enable RLS on every table in the `public` schema immediately when the table is created, before any data is written. Policy template for invitations:
```sql
-- Owner can do anything with their own invitations
CREATE POLICY "owner_all" ON invitations
  FOR ALL USING (auth.uid() = user_id);

-- Public can read published invitations (for /w/{slug} page)
CREATE POLICY "public_read_published" ON invitations
  FOR SELECT USING (is_published = true);
```
Use `auth.uid()` exclusively — never `user_metadata`. Never expose `service_role` key to client code or frontend environment variables. Use the NestJS backend to call Supabase with the service role only for admin operations, always with explicit authorization checks in NestJS guards before touching the service role client.

**Warning signs:**
- Supabase dashboard shows "RLS Disabled" badge on any table
- `SUPABASE_SERVICE_ROLE_KEY` appearing in `NEXT_PUBLIC_*` environment variables
- RLS policies referencing `auth.jwt() -> 'user_metadata'`
- Testing RLS using the Supabase SQL editor (it bypasses RLS — always test via the client SDK)

**Phase to address:**
Auth + database schema phase. RLS policies must be written and tested before any CRUD endpoints are built. Include an RLS test suite that hits the API as a second user and verifies 403/404 responses.

---

### Pitfall 3: Particle/Petal Canvas Animation Kills Low-End Android Phones

**What goes wrong:**
The envelope opening animation — particles, falling petals, smooth transitions — runs at 60fps on developer machines but drops to 5-10fps on low-end Android phones (Xiaomi Redmi, Samsung Galaxy A-series) which represent a large portion of the Vietnamese market. The whole page becomes unresponsive during the animation. Battery drains visibly. This is the flagship UX feature; if it janks, the wow factor becomes a bad impression.

**Why it happens:**
Canvas 2D with many individual particles is CPU-bound. Lottie JSON animations generate 40% higher CPU load than CSS/sprite alternatives on low-end devices. Using `box-shadow`, `filter: blur()`, or animating `width`/`height`/`top`/`left` forces constant layout recalculation (reflow) — the most expensive browser operation. Painting complex gradients per frame on canvas burns CPU. Exceeding the 16ms frame budget (for 60fps) causes visible stuttering.

**How to avoid:**
Restrict all animations to GPU-accelerated CSS properties: `transform` and `opacity` only. For particle effects, use CSS keyframe animations on absolutely-positioned DOM elements rather than Canvas, unless particle count exceeds ~50. For canvas, use `requestAnimationFrame` and draw only changed regions (dirty-rect rendering). Implement a performance detection gate: measure frame time in the first 3 frames; if average exceeds 20ms, reduce particle density by 50% and disable blur effects. Test on real devices — Chrome DevTools CPU throttle (6x slowdown) approximates low-end Android. Use `will-change: transform` on animated elements to promote them to their own GPU compositing layer.

**Warning signs:**
- Animation CSS uses `transition: all` (animates every property)
- Canvas redraws the full 100vw × 100vh frame every tick
- `filter: blur()` or `box-shadow` on animated elements
- No performance testing on any device other than developer laptop
- Framer Motion bundle imported globally rather than dynamically imported

**Phase to address:**
Public invitation page (envelope animation). Build performance budget checkpoints into the acceptance criteria: animation must sustain 30fps minimum on a simulated 6x CPU throttle in Chrome DevTools.

---

### Pitfall 4: File Uploads Bypass Server-Side Validation — Storage Abuse

**What goes wrong:**
Users upload files that are not images (executables, HTML files, oversized videos) into photo gallery and bank QR buckets. Free-tier users upload hundreds of photos, burning through storage quota and egress bandwidth. Without server enforcement, front-end limits are trivially bypassed.

**Why it happens:**
Developers validate file type and size in the React component (client side) and treat this as sufficient. But any user can call the Supabase Storage API directly with a crafted request, bypassing the UI entirely. Supabase's global upload limit takes precedence over bucket limits, but bucket limits must still be explicitly configured. Without NestJS backend upload proxying, there is no server-enforced validation layer.

**How to avoid:**
All uploads must go through NestJS, not directly from the browser to Supabase Storage. NestJS validates: MIME type (check file magic bytes, not just extension), file size (enforce per plan: e.g., 2MB per photo for Free, 5MB for Premium), total storage per user (query current storage usage before accepting upload), and file count per invitation (e.g., max 5 photos for Free, 20 for Premium). After validation, NestJS uploads to Supabase using the service role client and returns the public/signed URL. Configure Supabase bucket-level size limits as a defense-in-depth backstop.

**Warning signs:**
- `supabase.storage.from('photos').upload()` called directly from Next.js frontend code
- File type validated only by checking `file.type` (user-controllable MIME string) in the browser
- No per-user storage quota tracking in the database
- Free and Premium users share the same storage bucket without path-level segregation

**Phase to address:**
File upload feature phase. Design the NestJS upload endpoint as the single upload entry point before building any frontend upload UI.

---

### Pitfall 5: Uploading Original Photos — No Compression Pipeline

**What goes wrong:**
Guests on 3G view a photo gallery where each image is 4-8MB (original smartphone JPEG). The page appears to load quickly (HTML arrives fast) but images take 30-60 seconds to appear on a 3G connection. The bank QR image may load after the guest has already given up. This directly breaks the core product promise of "fast loading on 3G/4G."

**Why it happens:**
Developers build upload and storage first, display second. Storing originals is easy; resizing requires a processing step. The mistake is treating photo upload as "done" once the file lands in Supabase Storage without a compression/resize pipeline. Next.js `<Image>` optimization only applies to images served via the Next.js server — not to Supabase Storage URLs used directly.

**How to avoid:**
Use Supabase Storage's built-in image transformation API (`?width=800&quality=75&format=webp`) on all image URLs served to the public invitation page. This is available on paid Supabase plans and applies server-side transforms without storing multiple copies. For the NestJS upload pipeline, use `sharp` to resize photos to max 1200px wide and convert to WebP at quality 75 before storing. Gallery thumbnails should request `?width=400`. The bank QR image should be stored at display size (max 400×400) since it needs to be legible but not large. Set appropriate `Cache-Control` headers on all Supabase Storage assets.

**Warning signs:**
- Supabase Storage URLs in the public page without any transform parameters
- Photo upload stores the original binary unchanged
- Gallery component uses `<img>` tags instead of Next.js `<Image>` (which has built-in lazy loading and sizing)
- No WebP conversion in the upload pipeline
- Testing page load time only on WiFi during development

**Phase to address:**
File upload phase (compression pipeline) and public invitation page phase (image serving with transforms + lazy loading). Treat 3G load time as a first-class acceptance criterion, not an afterthought.

---

### Pitfall 6: Invitation QR Code Points to a Mutable URL

**What goes wrong:**
A couple prints the QR code on their paper invitations or wedding backdrop. Later, the slug is changed (or the system regenerates it), invalidating all printed QR codes. Guests scan the QR after the wedding and land on a 404 or the wrong invitation.

**Why it happens:**
Developers use the slug as the only identifier in QR codes and allow slug editing. Or the slug is auto-generated from couple names and regenerated on name change. QR codes are assumed to be a digital artifact only, so mutability seems harmless.

**How to avoid:**
Once an invitation is published and a QR code is generated, the slug is permanently locked. The `slug` column must be set to immutable in the database (no UPDATE allowed via RLS or NestJS validation) after first publish. Display a clear warning in the editor: "Sau khi xuất bản, đường dẫn QR không thể thay đổi." If a user unpublishes and republishes, preserve the existing slug — never regenerate. The QR code image itself should be generated from the stable `/w/{slug}` URL, not from any internal ID.

**Warning signs:**
- The invitation edit form allows changing the slug after publish
- QR code is regenerated any time invitation data changes
- No database constraint or NestJS guard preventing slug mutation post-publish

**Phase to address:**
Invitation publish/QR generation phase. Slug immutability must be enforced at the database constraint level (not just application logic) so it cannot be accidentally bypassed.

---

### Pitfall 7: SSR Hydration Mismatches from Client-Only Animation State

**What goes wrong:**
The public invitation page (`/w/{slug}`) is server-side rendered. Animation state — envelope open/closed, particle positions, music playing — is determined by client-side JavaScript. React throws hydration errors because server-rendered HTML shows the "envelope closed" state but the client immediately transitions to a different state. In production, this causes content flicker, broken animations, or suppressed errors that hide real bugs.

**Why it happens:**
Next.js App Router renders pages on the server by default. Any component that reads `window`, `document`, `localStorage`, or uses `Math.random()` for initial render state produces different output on server vs. client, causing a hydration mismatch.

**How to avoid:**
Mark all animation-bearing components as `'use client'`. Use `dynamic(() => import('./EnvelopeAnimation'), { ssr: false })` for the envelope component — it should never server-render at all. The server renders only the static shell (page metadata, OG tags, couple names for SEO). The envelope animation mounts client-side only. Never initialize animation state from browser APIs during the first render; use `useEffect` for any client-only state.

**Warning signs:**
- Console shows "Warning: Text content did not match" or "Hydration failed" in development
- Animation component references `window` or `document` at module scope
- Using `Math.random()` for particle initial positions in the render function (not in `useEffect`)
- `suppressHydrationWarning` used as a quick fix rather than fixing the root cause

**Phase to address:**
Public invitation page phase. Establish SSR/CSR boundary architecture before writing animation code.

---

### Pitfall 8: CDN Cache Staleness After File Replacement

**What goes wrong:**
A couple uploads a new profile photo or corrects their bank QR image. The upload succeeds in Supabase Storage (same filename, same path), but guests continue seeing the old image for up to 60 seconds — or until the CDN edge cache expires, which can be much longer if `Cache-Control: max-age` is set aggressively. This is particularly bad for the bank QR: a guest scans an old QR and sends money to the wrong account.

**Why it happens:**
Supabase Storage CDN caches assets by URL. Uploading a new file to the same path does not immediately invalidate CDN caches at all edge nodes — propagation takes up to 60 seconds. If the app constructs image URLs without cache-busting query parameters, the stale CDN copy is served.

**How to avoid:**
Append a version token to all stored file URLs: store `updated_at` timestamp (or a UUID version field) in the database alongside the file path, and construct the URL as `{storage_url}?v={updated_at_timestamp}`. When a file is replaced, update `updated_at` in the database — this changes the URL, bypassing the CDN cache for the new version. Never reuse the same filename for updated files without this version parameter strategy. For bank QR images, treat any replacement as especially urgent and document this behavior in the admin panel.

**Warning signs:**
- Supabase Storage object URLs served to the frontend without any query parameter
- File replacement in the editor does not update any database version/timestamp field
- No cache-busting strategy documented in the codebase

**Phase to address:**
File upload phase (design URL versioning strategy) and invitation editor phase (ensure replacement triggers version update).

---

### Pitfall 9: NestJS Service Role Key Used for All Supabase Operations

**What goes wrong:**
The NestJS backend uses the Supabase service role client for every database query — user data reads, invitation fetches, everything. This bypasses RLS entirely, making the NestJS authorization layer the only security boundary. Any NestJS guard bug, missing middleware, or unprotected endpoint becomes a direct data access vulnerability with no database-level safety net.

**Why it happens:**
Using the service role is simpler — no JWT forwarding needed. Developers start with service role for convenience during development and never switch to per-user JWT clients.

**How to avoid:**
Use two Supabase clients in NestJS: (1) a per-request user client initialized with the user's JWT (forwarded from the Authorization header) for all user-data operations — this client respects RLS and scopes queries automatically; (2) a service role client only for truly administrative operations (e.g., admin panel queries, system-level tasks). Create the user client with `Scope.REQUEST` injection in NestJS to ensure it is not shared across concurrent requests. This provides defense-in-depth: even if a NestJS guard is bypassed, RLS blocks the data access.

**Warning signs:**
- Single Supabase client instance created in a module (not per-request)
- All NestJS controllers using the same service role client regardless of operation type
- No JWT forwarding from the incoming request to the Supabase client

**Phase to address:**
Auth and backend API foundation phase. Establish the two-client pattern as the standard before building any API endpoints.

---

### Pitfall 10: Free-Tier Storage Abuse from Unlimited Uploads

**What goes wrong:**
Free-tier users upload thousands of images across multiple invitations (or create many invitations). Supabase Storage egress costs spike unexpectedly. The platform's free tier becomes financially unsustainable before paying users subsidize it.

**Why it happens:**
Storage limits are defined in the product spec (e.g., "5 photos max for Free") but enforced only in the frontend UI. Backend validation is skipped because it feels like over-engineering for an MVP. No one tracks per-user storage consumption until the bill arrives.

**How to avoid:**
Enforce storage limits in NestJS before accepting any upload. Maintain a `user_storage_bytes` counter in the database, updated transactionally with each upload and deletion. Reject uploads that would exceed plan limits before writing to Supabase Storage. Enforce invitation count limits per user per plan. Set Supabase bucket-level max file size as a hard backstop. Log and alert on egress anomalies.

**Warning signs:**
- No `user_storage_bytes` or equivalent usage tracking in the database schema
- Frontend photo count limit (`max 5 photos`) with no server-side validation
- New user can create unlimited invitations

**Phase to address:**
Pricing/plan enforcement phase (backend), but per-user storage tracking must be designed into the database schema in the foundation phase — retrofitting is painful.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Validate file type/size only in frontend | Faster dev | Storage abuse, security bypass | Never |
| Service role client for all NestJS DB calls | Simpler code | RLS is completely bypassed | Never |
| Use original filenames for replaced files | Simple storage paths | CDN cache staleness, stale bank QR served to guests | Never |
| Hardcode slug as mutable | Editor flexibility | Printed QR codes break on slug change | Never |
| Ship animation without mobile performance testing | Faster iteration | Flagship feature jank on low-end Android | Never |
| `audio.play()` on page load | Music starts immediately | Silently fails on all mobile browsers | Never |
| Store full-resolution photos without compression | Simple upload pipeline | 30-60s image load on 3G | MVP only if no premium users yet |
| Single NestJS Supabase client (not per-request) | Less boilerplate | Potential state bleed across concurrent requests | Never |
| No per-user storage quota tracking | Faster MVP | Storage costs spiral on free tier | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Auth + NestJS | Validate JWT using only the secret without checking `aud` and `exp` claims | Use `@supabase/ssr` or a Passport strategy that fully validates JWT; check expiry on every request |
| Supabase Storage (public bucket) | Assume public bucket URL is safe for all content | Bank QR and personal photos should be in private bucket with signed URLs or public bucket with user-controlled paths; never expose other users' files |
| Supabase Storage CDN | Replace file at same path expecting immediate cache update | Append `?v={timestamp}` to URLs; update version field in DB on every file replacement |
| Supabase RLS + service role | Test data access policies via Supabase SQL editor | SQL editor bypasses RLS; always test policies via the client SDK simulating a user session |
| Next.js Image + Supabase Storage | Use raw Supabase URL in `<img>` tag | Use Next.js `<Image>` with `remotePatterns` configured for the Supabase domain; request transform params for sizing |
| Background music on mobile | `<audio autoplay src="...">` | Require explicit user tap to start audio; use `audio.play()` inside the envelope-open click handler |
| NestJS Supabase client scope | `@Injectable()` singleton Supabase client | `@Injectable({ scope: Scope.REQUEST })` for per-user clients; singleton only for service role admin client |
| Supabase new API keys (2025) | Using legacy `anon`/`service_role` JWT strings | New projects use `sb_publishable_*` and `sb_secret_*` keys; check Supabase dashboard for correct key names |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Canvas particle animation on mobile | Animation drops to <15fps; phone gets warm; page unresponsive during animation | Restrict to CSS `transform`/`opacity`; implement frame-time performance gate to reduce density; test with 6x CPU throttle | Any low-end Android (Xiaomi Redmi, Samsung A-series) — large segment of Vietnamese market |
| Uncompressed photo gallery | Images load 30-60s on 3G; LCP fails; guests leave before seeing content | Sharp compression in NestJS upload pipeline; Supabase image transform API for serving; lazy loading with blur placeholder | Any user on 3G — 10%+ of Vietnamese mobile users |
| All photos marked as priority in Next.js Image | Browser downloads all gallery images simultaneously; slow initial load | Only first visible photo has `priority`; rest use default lazy loading | Galleries with 5+ photos |
| Framer Motion loaded on every page | Large JS bundle delays interactivity on mobile | Dynamic import animation components; use `ssr: false`; consider CSS-only animations for simpler effects | Low-bandwidth connections where JS parse time dominates |
| No index on RLS policy columns | Queries slow as invitation count grows; `auth.uid()` comparisons full-scan | Index `user_id` on invitations, `owner_id` on storage objects | ~1,000+ invitations in the database |
| Private Supabase Storage bucket for public invitation assets | Every guest view triggers an authenticated CDN miss (no cache sharing between users) | Use public bucket for invitation photos; signed URL only for truly private pre-publish assets | Any invitation with multiple guests — cache miss per user |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| RLS disabled on any table | Any authenticated user can read/write all rows | Enable RLS on table creation; dashboard audit before every deploy |
| `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*` env vars | Client-side code bypasses RLS entirely; full database access from browser | Service role key lives only in NestJS server environment variables; never in Next.js public env |
| Slug enumeration on public pages | Attacker enumerates slugs to discover and read other couples' invitations | Slugs must be long (8+ chars, random alphanumeric), not sequential numbers; rate-limit `/w/{slug}` endpoint |
| Bank QR image served without path isolation | User A can guess User B's bank QR URL | Store files under `/{user_id}/{invitation_id}/bank-qr.jpg` paths; RLS on storage objects enforces owner-only access |
| Admin panel accessible without role check | Anyone who discovers `/admin` URL has full admin access | NestJS guard checks `role: 'admin'` claim in JWT on every `/admin/*` route; Next.js middleware redirects unauthenticated requests |
| `user_metadata` used in RLS policies | User can modify their own metadata to impersonate roles or bypass policies | Use only `auth.uid()` and `auth.role()` in RLS; never `auth.jwt() -> 'user_metadata'` |
| Invitation content not sanitized before display | Stored XSS via invitation message field renders malicious scripts to guests | Sanitize all user-input fields server-side before storage; use React's JSX rendering (auto-escapes) for display |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No explicit music play/pause toggle | Guests (especially elderly) cannot stop unexpected audio; accessibility failure | Prominent, always-visible play/pause button on public page; music does NOT auto-start even after user unlocks it; only starts if user explicitly clicks play |
| Animation too slow / no skip option | Elderly guests get stuck waiting for the envelope animation to finish before seeing invitation details | Provide "Bỏ qua" (skip) button visible from the start; animation completes in max 3 seconds |
| Small tap targets on public page | Elderly users cannot reliably tap QR copy, venue map link, or music toggle | Minimum 48×48px touch targets on all interactive elements; generous padding |
| Guest name in URL not validated | `?to=<script>` or `?to=AAAA...` (10,000 chars) causes issues | Sanitize and truncate `?to` parameter server-side; max 100 chars; strip all HTML tags before rendering |
| Editor preview does not match public page | Couple designs an invitation in editor but guests see a different layout | Editor preview must render the exact same template component as the public page; share the template React component between both |
| Invitation expires without warning | Couple shares QR, wedding passes, invitation silently 404s for late-viewing guests | Send email notification 7 days before expiry; display expiry date prominently in dashboard; grace period of 30 days after wedding date |
| No confirmation on publish | Couple accidentally publishes incomplete invitation; QR slug is now locked | Require explicit "Xuất bản và khóa đường dẫn" confirmation dialog with checklist before first publish |

---

## "Looks Done But Isn't" Checklist

- [ ] **Music feature:** Plays on desktop Chrome dev environment but NOT tested on real iPhone/Android — verify music plays after tapping the envelope on both iOS Safari and Chrome Android
- [ ] **Photo upload:** Frontend shows success and displays thumbnail, but original file stored without compression — verify Supabase Storage object size via dashboard (should be <300KB per photo, not 4MB+)
- [ ] **RLS:** Tables created and CRUD endpoints work — but verify by calling the API authenticated as User B trying to read/edit User A's invitation; expect 403, not 200
- [ ] **QR code:** QR displays correctly in browser — but verify it scans with 5 different phones (low-end Android, iPhone, older Android) in varying lighting
- [ ] **Slug lock:** Slug appears non-editable in UI after publish — but verify the NestJS endpoint rejects a direct PATCH request to change the slug
- [ ] **Bank QR display:** QR image shows in editor preview — verify it is legible (not blurry) when displayed at 300×300px on a small phone screen
- [ ] **Auto-expiry:** Invitation page loads for active invitations — verify the page returns 410 Gone (not 404) for expired invitations and shows a graceful "đã kết thúc" message
- [ ] **Admin disable:** Admin disables an invitation — verify the public `/w/{slug}` page returns a clear unavailable message, not an error
- [ ] **Guest name XSS:** `?to=Khách Mời` works — verify `?to=<img src=x onerror=alert(1)>` does NOT execute JavaScript on the public page
- [ ] **Free tier limits:** UI blocks 6th photo upload for Free users — verify direct API call to NestJS upload endpoint also rejects it with a 403/422

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Audio autoplay not working | LOW | Add explicit play button; no data migration needed |
| RLS discovered disabled in production | HIGH | Enable RLS immediately; audit all existing data for unauthorized access; notify affected users; add RLS tests to CI |
| Slug changed post-publish (printed QRs broken) | HIGH | Cannot fix printed QRs; add redirect from old slug to new slug; implement slug immutability constraint to prevent recurrence |
| Uncompressed photos filling storage | MEDIUM | Write migration script to recompress existing photos via Sharp; update stored URLs; implement NestJS compression pipeline going forward |
| CDN cache serving stale bank QR | MEDIUM | Force cache bust by updating URL version parameter in database; notify affected couple to verify guests can see new QR |
| Service role key exposed in client code | CRITICAL | Rotate Supabase service role key immediately (Supabase dashboard); re-deploy with correct environment variables; audit access logs |
| Canvas animation janking on mobile | MEDIUM | Reduce particle count; switch to CSS-only alternative; implement perf gate; no data migration needed |
| Storage abuse from free-tier users | MEDIUM | Implement per-user quota tracking; enforce via NestJS; optionally backfill usage counters for existing users |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Audio autoplay blocked | Public invitation page (envelope + music) | Test music on real iPhone and Android after implementing envelope-tap unlock |
| RLS disabled / wrong | Auth + database schema foundation | Run automated integration test: authenticate as user B, attempt to read user A's invitation, assert 403 |
| Particle animation mobile jank | Public invitation page (animation) | Pass acceptance: 30fps minimum at 6x Chrome CPU throttle; test on physical low-end Android |
| No file server-side validation | File upload system | Attempt upload via curl bypassing UI; verify NestJS rejects oversized/wrong-type files |
| No photo compression | File upload system | Check stored file size in Supabase dashboard; assert <300KB per photo |
| Mutable slug post-publish | Invitation publish + QR generation | Attempt PATCH slug via API after publish; verify 400/403 response |
| SSR hydration mismatch | Public invitation page (architecture) | Zero hydration warnings in Next.js dev console; verify with React strict mode enabled |
| CDN cache staleness on file replace | File upload system + invitation editor | Replace bank QR; verify new image loads within 5 seconds (URL versioning must bypass cache) |
| Service role used for all NestJS ops | Auth + backend API foundation | Code review checklist: service role client only used in admin-specific service methods |
| Free-tier storage abuse | Pricing enforcement phase | Verify NestJS upload endpoint rejects 6th photo for Free user; verify invitation count limit enforced |

---

## Sources

- [Supabase RLS Row Level Security Official Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS enable/disable, policy syntax, auth.uid() patterns
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) — Bucket public/private, storage RLS policies
- [Supabase Storage CDN Fundamentals](https://supabase.com/docs/guides/storage/cdn/fundamentals) — Cache invalidation timing, CDN behavior
- [Supabase Storage Smart CDN](https://supabase.com/docs/guides/storage/cdn/smart-cdn) — Cache-busting strategies, signed URL caching
- [Supabase Storage Troubleshooting: Upload File Size Restrictions](https://supabase.com/docs/guides/troubleshooting/upload-file-size-restrictions-Y4wQLT) — Global vs bucket-level limits
- [Supabase Resumable Uploads](https://supabase.com/docs/guides/storage/uploads/resumable-uploads) — Recommended for files >6MB
- [Supabase JWT Signing Keys](https://supabase.com/docs/guides/auth/signing-keys) — 2025 key migration (sb_publishable_ / sb_secret_)
- [MDN Autoplay Guide for Media and Web Audio APIs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — Browser autoplay policy, mobile restrictions
- [Chrome Autoplay Policy for Developers](https://developer.chrome.com/blog/autoplay) — Media Engagement Index, mobile behavior
- [Motion.dev Web Animation Performance Tier List](https://motion.dev/blog/web-animation-performance-tier-list) — GPU-accelerated properties, CSS vs Canvas vs JS animation
- [Next.js Image Optimization — Official Docs](https://nextjs.org/docs/app/getting-started/images) — priority attribute, lazy loading defaults, remotePatterns
- [Next.js Hydration Error Reference](https://nextjs.org/docs/messages/react-hydration-error) — SSR/CSR boundary, dynamic with ssr: false
- [Supabase + NestJS Integration (Restack)](https://www.restack.io/docs/supabase-knowledge-supabase-nestjs-integration) — Per-request client scope pattern
- [CVE-2025-48757 / Lovable RLS Exposure (Leanware)](https://www.leanware.co/insights/supabase-best-practices) — Real-world RLS failure, 170+ apps exposed
- [Supabase CDN Cache-Busting Discussion](https://github.com/orgs/supabase/discussions/5737) — Same-path file replacement cache staleness
- [Medium: How We Boosted React Website Performance with Heavy Animations](https://medium.com/@ssd_design/how-to-improve-performance-on-a-react-website-with-heavy-design-and-animation-ae7d655da349) — Dynamic imports, bundle splitting for animation-heavy pages
- [MDN CSS and JavaScript Animation Performance](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance) — transform/opacity only, will-change, reflow triggers
- [NN/g: Usability for Older Adults](https://www.nngroup.com/articles/usability-for-senior-citizens/) — Touch target sizes, text contrast, clear instructions

---

*Pitfalls research for: Vietnamese Wedding Invitation SaaS (Thiệp Cưới Online)*
*Researched: 2026-03-14*
