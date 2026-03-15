# Phase 5: Public Invitation Page - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Public `/w/{slug}` page accessible without login. Includes envelope opening animation, full invitation display, background music player, guest name personalization via `?to=`, OG meta tags for Zalo/Facebook sharing, wedding countdown timer, and post-wedding thank-you page with auto-expiry. QR code generation for the invitation URL. ISR with on-demand revalidation.

</domain>

<decisions>
## Implementation Decisions

### Envelope Animation
- Realistic envelope with textured paper feel, flap, and 囍 wax seal
- Envelope style matches the chosen template: Traditional = red/gold, Modern = white/rose gold, Minimalist = cream/ivory
- On tap: flap lifts open, invitation card slides up out of the envelope, envelope fades away, full invitation expands to fill screen
- Falling petals (CSS keyframes) continue throughout the page as guest scrolls — dreamy, romantic atmosphere
- Envelope tap is the audio unlock gate (carried from Init decision)
- Performance gate: halve particle density if frame time exceeds 20ms; CSS-only fallback for low-end devices (Phase 9 polishes further)

### Music Player UX
- Floating circular play/pause button fixed to bottom-right corner
- Music loops continuously while guest views the invitation
- Animated equalizer bars inside the button when music is playing; paused state shows play icon
- Resume from current position when guest taps play again after pausing
- Music unlocked only after envelope tap gesture (no autoplay)
- howler.js for playback (already used in editor MusicPicker)

### Guest Name Personalization
- `?to=Name` value displayed on the envelope: "Trân trọng kính mời [Name]"
- Name used exactly as provided — no auto-capitalization (couple controls formatting)
- When no `?to=` parameter: show "Trân trọng kính mời" without a name below it (generic greeting)
- Sanitization: max 50 characters, strip HTML/script tags
- Client-side parsing only — ?to= value never sent to server or stored

### Countdown Timer
- Flip-clock style with animated flipping digits
- Four units: Ngày (days), Giờ (hours), Phút (minutes), Giây (seconds)
- Embedded within invitation content flow (not floating)
- Timer stops and hides after wedding date passes

### Post-Wedding Behavior
- 7-day default grace period after wedding date
- During grace period: invitation still shows normally (countdown shows 0 or hides)
- After grace period: switches to warm thank-you page
- Thank-you page content: couple names, thankYouText from invitation, first photo from gallery
- No envelope animation on thank-you page — skip straight to content
- No bank QR, no countdown on thank-you page
- NestJS checks expiry on page request; returns expired state with thank-you content

### OG Meta Tags
- Server-rendered og:image using couple's first photo (or default if no photos)
- og:title with couple names (e.g., "Thiệp cưới Minh & Thảo")
- og:description with wedding date and venue
- Optimized for Zalo and Facebook sharing previews

### Claude's Discretion
- Exact envelope dimensions, seal design, and paper texture approach
- Petal density, animation speed, and color per template
- Flip-clock animation implementation details
- OG image dimensions and fallback image
- ISR revalidation strategy details
- Error states (invitation not found, unpublished)
- Skip button placement and styling for envelope animation
- Floating music button exact size, position offset, and shadow

</decisions>

<specifics>
## Specific Ideas

- Envelope should feel like receiving a real thiệp cưới — the wow factor that differentiates this product
- Template components from Phase 3/4 are reused on the public page (TemplateRenderer accepts Invitation props)
- Petals throughout the page create a dreamy atmosphere — pure CSS for performance, no JS animation loop
- Music player should be unobtrusive but clearly visible — guests need to know they can control it
- Flip-clock countdown adds excitement and urgency — a wedding-specific touch
- Thank-you page should feel warm and complete, not like a dead page

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TemplateRenderer` + 3 template components (Traditional/Modern/Minimalist): render full invitation from `Invitation` props
- `howler.js`: already used in `MusicPicker.tsx` for editor preview — reuse for public page music player
- `canvas-confetti`: already dynamically imported in Phase 3 publish celebration — can reuse for envelope burst
- `framer-motion`: used throughout app for animations — use for envelope reveal orchestration
- `apiFetch` utility: for any client-side API calls
- `Invitation` type in `@repo/types`: has all needed fields (slug, photoUrls, musicTrackId, bankQrUrl, etc.)
- `InvitationStatus`: 'draft' | 'published' | 'expired' — already supports expiry

### Established Patterns
- `'use client'` directive on interactive components, server components for data fetching
- Dynamic imports via `next/dynamic` or `import()` for heavy client-side libraries (howler, canvas-confetti)
- Template-specific hex colors (burgundy/gold for Traditional, rose gold for Modern, gray/cream for Minimalist)
- Vietnamese placeholder text and `Intl.DateTimeFormat('vi-VN')` for date formatting
- Cookie-based auth with `credentials: 'include'` for authenticated API calls (not needed for public page)

### Integration Points
- New route: `apps/web/app/w/[slug]/page.tsx` — outside (app)/(auth)/(admin) route groups, no auth required
- Middleware at `apps/web/middleware.ts` — must allow `/w/*` routes through without auth redirect
- NestJS needs public endpoint to fetch invitation by slug (no JWT required)
- NestJS publish endpoint already generates slug — QR generation hooks into publish flow
- Supabase Storage for QR code image storage
- ISR with `revalidatePath` or `revalidateTag` triggered by NestJS on publish/unpublish

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-public-invitation-page*
*Context gathered: 2026-03-15*
