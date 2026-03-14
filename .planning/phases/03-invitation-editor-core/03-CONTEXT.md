# Phase 3: Invitation Editor Core - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Invitation CRUD editor with all text fields, 3 template options with live preview, debounced auto-save, and publish/unpublish control with permanent slug lock. Media uploads (photos, music, bank QR) are Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Editor Layout
- Side-by-side on desktop: form on the left, live preview on the right
- Preview renders inside a phone-shaped mockup frame — shows exactly how guests see it on mobile
- On mobile: stacked layout — form on top, preview scrolls below
- Sidebar auto-collapses to icons-only when editor opens — maximizes form + preview space
- User can manually re-expand sidebar

### Template Visual Identity
- **Truyền thống (Traditional):** Ornate gold & red — rich gold ornaments, deep red/burgundy, double happiness motifs (囍), decorative borders. Formal and festive Vietnamese wedding style.
- **Hiện đại (Modern):** Clean white + rose gold — minimalist layout with generous whitespace, rose gold accents, modern sans-serif typography. Instagram-worthy aesthetic.
- **Tối giản (Minimalist):** Pure typography — almost no decorative elements. Beautiful typography hierarchy on cream/off-white. Thin lines as dividers. Lets the words breathe.
- Template selector in editor: thumbnail strip above the preview pane. Small clickable thumbnails, instant template switch on click.

### Form Organization
- Collapsible accordion sections:
  - **Cặp đôi** (1/3): bride name, groom name
  - **Lễ cưới** (2/3): wedding date, wedding time, venue name, venue address
  - **Lời mời** (3/3): invitation message (textarea), thank-you text (textarea)
- All sections expandable, current section highlighted
- Single date + single time field (no dual ceremony times)
- Invitation message and thank-you text use plain textarea — template handles formatting
- WYSIWYG effect comes from the live preview pane, not from rich text editing

### Auto-save Behavior
- 800ms debounced auto-save to NestJS (from roadmap)
- Feedback: subtle status text in topbar — "Đang lưu..." / "Đã lưu"
- No save button — everything auto-saves

### Publish Flow
- Publish button: prominent rose/pink button in the editor's TopBar, always visible
- First publish confirmation: dialog shows generated URL (e.g., /w/minh-thao-x7k2), warns that link is permanent, confirm with "Xuất bản" button
- Post-publish: celebration dialog with confetti/animation, shows public URL with copy button, "Chia sẻ ngay" action
- Unpublish: hidden in ⋮ (more) dropdown menu next to Publish button, with confirmation dialog
- After published: Publish button changes to indicate published state

### Claude's Discretion
- Exact accordion animation and transition styles
- Phone mockup frame design details
- Template thumbnail appearance in selector strip
- Confetti animation implementation for post-publish celebration
- Exact field validation rules and error display
- TopBar layout for editor context (back button, save status, publish button placement)
- How to handle incomplete required fields when publishing

</decisions>

<specifics>
## Specific Ideas

- Template components are shared between editor preview and public page (Phase 5) — build them as reusable React components that accept invitation data as props
- The phone mockup in preview should feel premium — couples will judge the product by how the preview looks
- Auto-save should feel invisible — no friction, no "unsaved changes" warnings
- Celebration moment on first publish should feel special — this is when the couple's invitation becomes real

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/types/src/invitation.ts`: Invitation interface with all fields (groomName, brideName, weddingDate, weddingTime, venueName, venueAddress, invitationMessage, thankYouText, templateId)
- `apps/web/components/ui/`: shadcn/ui components (button, dialog, input, label, skeleton, dropdown-menu, sheet, tooltip)
- `apps/web/components/app/CreateWizard.tsx`: 2-step wizard with template selector grid + name inputs — routes to `/thep-cuoi/{id}` after creation
- `apps/web/lib/api.ts`: `apiFetch<T>()` helper for NestJS API calls with error handling

### Established Patterns
- framer-motion for animations (Phase 1+2 decision, used in dashboard cards)
- shadcn/ui components with rose/pink theming (border-rose-200, bg-rose-50, text-rose-800)
- Toast notifications via Sonner for errors
- Cookie-based auth with `credentials: 'include'` for NestJS API calls
- `@repo/types` imported via tsconfig paths alias (no build step)

### Integration Points
- NestJS invitations controller needs PATCH endpoint for auto-save updates
- NestJS invitations controller needs publish/unpublish endpoints (slug generation + lock)
- Editor page at `/thep-cuoi/[id]` route within (app) route group
- Sidebar component (`AppSidebar.tsx`) needs collapse state management for editor context
- Template components will be consumed by Phase 5 public page — design for reuse

</code_context>

<deferred>
## Deferred Ideas

- PUBL-02 (Fixed QR code for invitation URL) — confirmed removed in Phase 2 context. No invitation QR. Users share via link only.
- Dual ceremony times (lễ vu quy + lễ thành hôn) — could be a future enhancement if users request it. Current model: single date + single time.

</deferred>

---

*Phase: 03-invitation-editor-core*
*Context gathered: 2026-03-14*
