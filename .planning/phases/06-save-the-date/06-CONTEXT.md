# Phase 6: Save-the-Date - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

A couple can publish a lightweight teaser page ("Save the Date") before the full invitation is ready. Uses the same permanent URL — slug is generated on save-the-date publish. When the full invitation is later published, it replaces the teaser seamlessly. Requires adding `save_the_date` status to the invitation state machine.

</domain>

<decisions>
## Implementation Decisions

### Teaser Page Content
- Shows: couple names, wedding date, first photo from gallery (if uploaded), teaser message (optional)
- Includes flip-clock countdown timer (reuse existing CountdownTimer component)
- No envelope animation on teaser — loads directly
- No music player on teaser — lightweight and fast
- No falling petals on teaser
- No family info, no bank QR, no love story — those are full invitation only
- Page uses the selected template's colors (Traditional = red/gold, Modern = white/rose, Minimalist = cream)
- OG meta tags work the same as full invitation (couple photo, names, date)

### Activation Flow
- "Save the Date" button in the editor topbar, next to the existing Publish button
- Minimum required: groom name + bride name + at least one ceremony date
- Teaser message and photo are optional
- Publishing save-the-date generates the slug immediately (permanent URL)
- Same slug lock behavior — once generated, never changes
- QR code is also generated at this point (same publish flow as full invitation)

### Status Badge
- New InvitationStatus value: `'save_the_date'` alongside `'draft' | 'published' | 'expired'`
- Dashboard shows distinct badge in unique color (e.g., blue/teal) — "Save the Date"
- State transitions:
  - draft → save_the_date (publish save-the-date)
  - save_the_date → draft (unpublish — URL returns 404, slug stays locked)
  - save_the_date → published (publish full invitation — replaces teaser)
  - draft → published (skip save-the-date entirely, normal publish)
  - published → draft (unpublish full invitation)

### Transition to Full Invitation
- Publishing full invitation from save_the_date status shows confirmation dialog: "Điều này sẽ thay thế Save the Date bằng thiệp cưới đầy đủ. Tiếp tục?"
- On confirm: status changes to `published`, same URL now shows full invitation with envelope
- ISR revalidation triggered to update the cached page

### Public Page Behavior
- `/w/{slug}` with status `save_the_date`: renders SaveTheDatePage component (no InvitationShell, no envelope)
- `/w/{slug}` with status `published`: renders full invitation (existing behavior)
- `?side=` parameter ignored on save-the-date pages (no family-specific content)
- `?to=Name` personalization still works on save-the-date (greeting on the page)

### Claude's Discretion
- SaveTheDatePage component layout and styling details
- Exact "Save the Date" button placement and styling in editor topbar
- Badge color choice for save_the_date status
- How the teaser message field appears in the editor (new accordion section or inline)
- Error handling when required fields are missing

</decisions>

<specifics>
## Specific Ideas

- Save-the-date is a lightweight teaser — couples share this while still preparing the full invitation
- Same URL means QR codes printed early still work when the full invitation is published
- Countdown timer on teaser builds anticipation — guests know the date is set
- Keep teaser fast-loading — no heavy animations, no music, just content

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CountdownTimer` component: reuse for teaser countdown (already supports template colors)
- `TemplateRenderer`: not used on teaser (teaser has its own simpler layout)
- `generateMetadata` in `/w/[slug]/page.tsx`: reuse for OG tags
- `InvitationStatus` type: extend with `'save_the_date'`
- `PublishButton.tsx`: extend with save-the-date publish flow
- `StatusBadge` component: add new badge variant

### Established Patterns
- framer-motion for animations (can use fade-in on teaser)
- Template-specific colors via `Record<TemplateId, {...}>` pattern
- Publish flow: slug generation + QR generation + confirmation dialog
- ISR revalidation via `/api/revalidate` route handler

### Integration Points
- `packages/types/src/invitation.ts`: add `'save_the_date'` to InvitationStatus
- `apps/api/src/invitations/invitations.service.ts`: update publish logic for save_the_date status
- `apps/web/app/w/[slug]/page.tsx`: conditional rendering based on status
- `apps/web/app/(app)/thep-cuoi/[id]/PublishButton.tsx`: add save-the-date button
- `apps/web/components/app/InvitationCard.tsx`: add new status badge
- `apps/web/components/app/StatusBadge.tsx`: new badge variant

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-save-the-date*
*Context gathered: 2026-03-16*
