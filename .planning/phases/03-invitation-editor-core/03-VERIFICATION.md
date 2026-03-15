---
phase: 03-invitation-editor-core
verified: 2026-03-15T05:50:00Z
status: gaps_found
score: 4/5 success criteria verified
re_verification: false
gaps:
  - truth: "User can preview the complete invitation as a guest would see it before publishing"
    status: failed
    reason: "FullPreviewDialog exists but is only accessible via the dropdown in PublishButton, which only renders when invitation.status === 'published'. Draft invitations have no UI trigger to open the full preview dialog. EDIT-09 requires preview BEFORE publishing."
    artifacts:
      - path: "apps/web/app/(app)/thep-cuoi/[id]/PublishButton.tsx"
        issue: "DropdownMenu with 'Xem truoc' option is gated on {isPublished && ...} at line 158. Draft invitations cannot reach the full preview."
      - path: "apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx"
        issue: "setShowFullPreview(true) only wired to PublishButton's onPreview prop — no independent trigger for draft state."
    missing:
      - "Add a standalone 'Xem truoc toan bo' button in the editor topbar (or as a second dropdown trigger) that is visible regardless of publication status and calls setShowFullPreview(true) directly."
human_verification:
  - test: "Open editor for a published invitation and click the 'Da xuat ban' button or its dropdown"
    expected: "Confirmation dialog appears with the existing slug URL. On confirm, invitation re-publishes without changing the slug."
    why_human: "Cannot verify slug immutability on re-publish through static analysis — requires actual API interaction."
  - test: "On first publish, verify the confetti animation fires"
    expected: "Two canvas-confetti bursts appear (100 particles, then 60 at 250ms delay)"
    why_human: "canvas-confetti is dynamically imported client-side; cannot verify animation fires programmatically."
  - test: "Type in any field and wait 800ms"
    expected: "Save indicator shows 'Dang luu...' then 'Da luu', then fades after 2 seconds"
    why_human: "Requires real browser interaction to verify the timing and visual feedback."
  - test: "Resize browser to below lg breakpoint (< 1024px)"
    expected: "Phone mockup is hidden; template renders in a simple bordered container; layout stacks vertically"
    why_human: "Responsive layout requires real browser rendering."
  - test: "Open editor and observe sidebar"
    expected: "Sidebar auto-collapses to icons-only on mount"
    why_human: "Sidebar state behavior requires browser rendering."
---

# Phase 3: Invitation Editor Core — Verification Report

**Phase Goal:** A couple can fill in all invitation text fields, select a template, see a live preview that matches the final public page, and publish or unpublish their invitation
**Verified:** 2026-03-15T05:50:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can enter bride/groom names, wedding date/time, venue address, invitation message, and thank-you text — all fields save automatically without a save button | VERIFIED | EditorForm.tsx has 3 accordion sections with all fields; useAutoSave.ts implements 800ms debounced PATCH; 8 passing unit tests confirm debounce, status transitions, stale closure prevention |
| 2 | As the user types, the preview pane updates in real time using the actual template component (not a simplified version) | VERIFIED | EditorPreview.tsx renders `<TemplateRenderer invitation={invitation} />` from EditorShell's local useState — zero network delay, no refetch |
| 3 | User can switch between Traditional, Modern, and Minimalist templates and immediately see the preview change | VERIFIED | TemplateSelector.tsx has 3 clickable thumbnails; onSelect triggers handleChange({templateId}) in EditorShell which updates local state; TemplateRenderer maps templateId to correct component |
| 4 | User can preview the complete invitation as a guest would see it before publishing | FAILED | FullPreviewDialog exists and renders TemplateRenderer, but the only UI trigger (dropdown "Xem truoc") is gated on `isPublished`. A draft invitation has no way to open the full preview dialog. EDIT-09 requires "before publishing." |
| 5 | User can publish the invitation (generating the slug) and unpublish it — the slug never changes after first publish | VERIFIED | PublishButton.tsx calls POST /invitations/:id/publish and /unpublish; service.publish() checks `if (invitation.slug)` and only writes slug on first publish; 20 passing API unit tests including slug immutability test |

**Score:** 4/5 truths verified

### Required Artifacts

| Artifact | Plan | Min Lines | Actual Lines | Status | Details |
|----------|------|-----------|--------------|--------|---------|
| `apps/api/src/invitations/dto/update-invitation.dto.ts` | 03-01 | — | 53 | VERIFIED | PartialType with class-validator decorators, Vietnamese error messages |
| `apps/api/src/invitations/invitations.controller.ts` | 03-01 | — | 72 | VERIFIED | GET/:id, PATCH/:id, POST/:id/publish, POST/:id/unpublish with JwtGuard |
| `apps/api/src/invitations/invitations.service.ts` | 03-01 | — | 261 | VERIFIED | findOne, update, publish, unpublish with FIELD_MAP and slug generation |
| `apps/web/components/templates/types.ts` | 03-02 | — | 6 | VERIFIED | TemplateProps interface importing Invitation from @repo/types |
| `apps/web/components/templates/TemplateTraditional.tsx` | 03-02 | — | 137 | VERIFIED | Ornate gold/burgundy design, all fields rendered, Vietnamese placeholders |
| `apps/web/components/templates/TemplateModern.tsx` | 03-02 | — | 122 | VERIFIED | White/rose-gold design, all fields rendered |
| `apps/web/components/templates/TemplateMinimalist.tsx` | 03-02 | — | 106 | VERIFIED | Cream/typography design, all fields rendered |
| `apps/web/components/templates/TemplateRenderer.tsx` | 03-02 | — | 19 | VERIFIED | TEMPLATES record maps templateId to component with fallback to Traditional |
| `apps/web/components/templates/index.ts` | 03-02 | — | 9 | VERIFIED | Barrel exports TemplateProps, TemplateRenderer, all 3 templates, TemplateId |
| `apps/web/app/(app)/thep-cuoi/[id]/page.tsx` | 03-03 | 15 | 33 | VERIFIED | Server component, reads auth-token cookie, fetches with no-store, calls notFound() |
| `apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx` | 03-03 | 60 | 106 | VERIFIED | Client component, useState<Invitation>, sidebar collapse, responsive layout, integrated PublishButton+FullPreviewDialog |
| `apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx` | 03-03 | 80 | 136 | VERIFIED | 3 accordion sections, all invitation fields, null/empty string handling |
| `apps/web/app/(app)/thep-cuoi/[id]/EditorPreview.tsx` | 03-03 | 30 | 33 | VERIFIED | Phone mockup frame on desktop, simple border on mobile, TemplateRenderer rendered |
| `apps/web/app/(app)/thep-cuoi/[id]/TemplateSelector.tsx` | 03-03 | 25 | 68 | VERIFIED | 3 gradient thumbnails with active ring state, calls onSelect |
| `apps/web/app/(app)/thep-cuoi/[id]/useAutoSave.ts` | 03-03 | 30 | 68 | VERIFIED | 800ms debounce, useRef for stale closure, SaveStatus enum, toast.error on failure |
| `apps/web/app/(app)/thep-cuoi/[id]/PublishButton.tsx` | 03-04 | 100 | 306 | VERIFIED | Full lifecycle: confirmation dialog, celebration with canvas-confetti, unpublish dialog, copy URL |
| `apps/web/app/(app)/thep-cuoi/[id]/FullPreviewDialog.tsx` | 03-04 | 30 | 35 | VERIFIED | Dialog rendering TemplateRenderer at full size, scrollable |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `invitations.controller.ts` | `invitations.service.ts` | DI injection | WIRED | Lines 43, 52, 61, 70 call `this.invitationsService.findOne/update/publish/unpublish` |
| `invitations.service.ts` | `SupabaseAdminService` | DI injection for slug write | WIRED | Line 218 uses `this.supabaseAdmin.client` for first-publish slug write |
| `TemplateRenderer.tsx` | `TemplateTraditional/Modern/Minimalist` | TEMPLATES record | WIRED | `TEMPLATES[invitation.templateId] ?? TemplateTraditional` at line 16 |
| `types.ts` | `@repo/types Invitation` | import type | WIRED | `import type { Invitation } from '@repo/types'` at line 1 |
| `EditorShell.tsx` | `EditorForm.tsx + EditorPreview.tsx` | useState<Invitation> | WIRED | Line 30: `useState<Invitation>(initial)`, passed to both components |
| `EditorForm.tsx` | `useAutoSave.ts` | save() on field change | WIRED | EditorShell.handleChange calls `save(changes)` at line 43 |
| `EditorPreview.tsx` | `TemplateRenderer` | render with invitation prop | WIRED | Lines 20 and 28: `<TemplateRenderer invitation={invitation} />` |
| `page.tsx` | `/invitations/:id` API | server fetch with auth cookie | WIRED | Line 12: `fetch(\`http://localhost:3001/invitations/${id}\`, {headers: {Cookie: ...}})` |
| `PublishButton.tsx` | `POST /invitations/:id/publish` | apiFetch | WIRED | Line 61-63: `apiFetch<Invitation>(\`/invitations/${invitation.id}/publish\`, {method: 'POST'})` |
| `PublishButton.tsx` | `POST /invitations/:id/unpublish` | apiFetch | WIRED | Line 109-111: `apiFetch<Invitation>(\`/invitations/${invitation.id}/unpublish\`, {method: 'POST'})` |
| `FullPreviewDialog.tsx` | `TemplateRenderer` | render with invitation prop | WIRED | Line 30: `<TemplateRenderer invitation={invitation} />` |
| `EditorShell.tsx` | `PublishButton.tsx + FullPreviewDialog.tsx` | rendered in topbar | WIRED | Lines 74 and 82: both rendered in topbar area |

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|------------|----------------|-------------|--------|----------|
| EDIT-01 | 03-03 | User can enter bride/groom names, wedding date/time, venue address, invitation message, thank-you text | SATISFIED | EditorForm.tsx has all fields in 3 accordion sections |
| EDIT-02 | 03-03 | User sees real-time preview while editing | SATISFIED | EditorPreview renders from local useState; never re-fetches from API |
| EDIT-03 | 03-01, 03-03 | Editor auto-saves as draft | SATISFIED | useAutoSave.ts implements 800ms debounce; PATCH /invitations/:id in service |
| EDIT-08 | 03-02, 03-03 | User can select from 3 templates with instant preview | SATISFIED | TemplateSelector + TemplateRenderer + template switch updates local state immediately |
| EDIT-09 | 03-04 | User can preview the complete invitation before publishing | BLOCKED | FullPreviewDialog only accessible when `isPublished`. Draft state has no preview trigger. |
| EDIT-10 | 03-01, 03-04 | User can publish/unpublish invitation | SATISFIED | PublishButton calls POST /:id/publish and POST /:id/unpublish; API service methods implemented and tested |
| SYST-02 | 03-01, 03-04 | Slug permanently locked after first publish | SATISFIED | service.publish() generates slug only when `invitation.slug` is null; 20 passing tests including "does not overwrite existing slug" |

**Orphaned requirements:** None — all 7 Phase 3 requirements are claimed in plans.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `apps/web/app/(app)/thep-cuoi/[id]/page.tsx` | 12 | Hardcoded `localhost:3001` for server-side fetch | Warning | API runs on port 4000 (via `process.env.PORT ?? 4000`). This pattern is consistent with `dashboard/page.tsx` (Phase 2), so it is a project-wide issue, not a Phase 3 regression. Runtime will fail unless API is manually started on port 3001. |
| `apps/web/__tests__/middleware.test.ts` | 77, 91 | Pre-existing TS2367 type error | Info | Pre-existing from Phase 2 (commit a5315aa). Tests still pass; TypeScript error is in test-only comparison logic. Not a Phase 3 issue. |

No stubs, empty implementations, or `TODO/FIXME` comments found in Phase 3 code.

### Test Results

| Suite | Result |
|-------|--------|
| API: invitations.service.spec.ts | 20/20 passing — findOne, update, publish, unpublish, slug immutability |
| Web: useAutoSave.test.ts | 8/8 passing — debounce, status transitions, stale closure, unmount cleanup |
| Web: Wave 0 stubs (5 files) | 21 todos pending — correctly shows as skipped, not failing |
| Web: All other existing tests | 37/37 passing (InvitationCard, InvitationGrid, CreateWizard, middleware) |

### Human Verification Required

#### 1. Re-publish slug preservation

**Test:** Open editor for a published invitation. Click the "Da xuat ban" button, confirm in the dialog. Check the URL displayed in the dialog.
**Expected:** The same slug URL as before re-publish is shown — slug unchanged.
**Why human:** Cannot verify slug immutability on re-publish without API interaction.

#### 2. First-publish confetti celebration

**Test:** Create a new (never published) invitation, fill bride/groom names, click "Xuat ban" and confirm.
**Expected:** Celebration dialog opens with confetti bursting twice. Public URL is displayed with a copy button.
**Why human:** `canvas-confetti` is dynamically imported and fires client-side only. Cannot verify animation through static analysis.

#### 3. Auto-save visual feedback

**Test:** Open editor, type in any field, then stop typing for 800ms.
**Expected:** "Dang luu..." appears in topbar, transitions to "Da luu" (green), then fades to nothing after 2 seconds.
**Why human:** Requires real browser interaction to verify visual timing.

#### 4. Responsive layout

**Test:** Open editor on a viewport below 1024px width.
**Expected:** Phone mockup is hidden; form stacks above template preview (no side-by-side); sidebar collapses to icons on mount.
**Why human:** Responsive Tailwind breakpoints require browser rendering.

### Gaps Summary

**1 gap blocks EDIT-09 (User can preview the complete invitation before publishing).**

The `FullPreviewDialog` component is fully implemented and renders the template correctly. The gap is purely in the wiring: the only UI trigger that opens the dialog (`onPreview` callback) is inside the `DropdownMenu` that is conditionally rendered with `{isPublished && <DropdownMenu>...}`. A user editing a draft invitation cannot access the full preview.

The fix is minimal — add a standalone preview button or trigger in EditorShell's topbar that calls `setShowFullPreview(true)` regardless of publication state. The underlying `FullPreviewDialog` component requires no changes.

**Note:** The port inconsistency (`localhost:3001` in server components vs API running on `localhost:4000`) is flagged as a warning but is a pre-existing Phase 2 pattern, not a Phase 3 introduction. It should be tracked as a project-wide issue for Phase 9 hardening.

---

_Verified: 2026-03-15T05:50:00Z_
_Verifier: Claude (gsd-verifier)_
