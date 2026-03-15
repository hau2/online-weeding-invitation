---
phase: 03-invitation-editor-core
verified: 2026-03-15T02:00:00Z
status: passed
score: 5/5 success criteria verified
re_verification: true
  previous_status: gaps_found
  previous_score: 4/5
  gaps_closed:
    - "User can preview the complete invitation as a guest would see it before publishing (EDIT-09)"
  gaps_remaining: []
  regressions: []
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
  - test: "Click 'Xem truoc' button on a DRAFT invitation (not yet published)"
    expected: "FullPreviewDialog opens immediately, showing the complete invitation rendered through TemplateRenderer — same as the public guest view"
    why_human: "Requires browser rendering to confirm dialog opens and TemplateRenderer renders correctly for draft state."
---

# Phase 3: Invitation Editor Core — Re-Verification Report

**Phase Goal:** A couple can fill in all invitation text fields, select a template, see a live preview that matches the final public page, and publish or unpublish their invitation
**Verified:** 2026-03-15T02:00:00Z
**Status:** passed
**Re-verification:** Yes — after gap closure (plan 03-05, commit 0c6f998)

## Gap Closure Result

**Previous status:** gaps_found (4/5 truths verified)
**Previous gap:** Truth #4 / EDIT-09 — `FullPreviewDialog` only accessible when published; draft invitations had no UI trigger.
**Fix applied:** Plan 03-05 added a standalone "Xem truoc" button (Eye icon) in `EditorShell` topbar. The button is always visible regardless of `invitation.status` and calls `setShowFullPreview(true)` directly. The `onPreview` prop was removed entirely from `PublishButton`.

## Gap Closure Verification

### Specific checks for the closed gap

| Check | Expected | Result |
|-------|----------|--------|
| `EditorShell.tsx` imports `Eye` from `lucide-react` | Line with `Eye` in import | CONFIRMED (line 5) |
| `EditorShell.tsx` renders standalone button with `onClick={() => setShowFullPreview(true)}` | Line 79 | CONFIRMED |
| Button text is "Xem truoc" with `Eye` icon, always in topbar | Lines 75–83 | CONFIRMED — no conditional gate |
| No `isPublished` condition wraps the preview button in `EditorShell` | Zero matches | CONFIRMED — grep returned nothing |
| `onPreview` prop absent from `PublishButton.tsx` interface | Zero matches | CONFIRMED — grep exit code 1 |
| `onPreview` prop absent from `EditorShell.tsx` `<PublishButton>` usage | Zero matches | CONFIRMED — grep exit code 1 |
| "Xem truoc" dropdown item removed from `PublishButton.tsx` | Zero matches | CONFIRMED — grep exit code 1 |
| "Huy xuat ban" dropdown still present in `PublishButton.tsx` | Line 170 | CONFIRMED — unpublish action preserved |
| `isPublished` gate still wraps the dropdown in `PublishButton.tsx` | Line 155 | CONFIRMED — dropdown only renders for published state |
| `FullPreviewDialog` bound to `open={showFullPreview}` in `EditorShell.tsx` | Line 93 | CONFIRMED |
| Unused `Eye` and `DropdownMenuSeparator` removed from `PublishButton.tsx` | Neither present | CONFIRMED |
| Commit `0c6f998` exists in git log | Yes | CONFIRMED — feat(03-05): add standalone preview button |

**Gap closure verdict: CLOSED.** The EDIT-09 gap is fully resolved. Any invitation, draft or published, can now trigger the full preview dialog via the always-visible topbar button.

---

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can enter bride/groom names, wedding date/time, venue address, invitation message, and thank-you text — all fields save automatically without a save button | VERIFIED | EditorForm.tsx has 3 accordion sections with all fields; useAutoSave.ts implements 800ms debounced PATCH; 8 passing unit tests |
| 2 | As the user types, the preview pane updates in real time using the actual template component (not a simplified version) | VERIFIED | EditorPreview.tsx renders `<TemplateRenderer invitation={invitation} />` from EditorShell's local useState — zero network delay |
| 3 | User can switch between Traditional, Modern, and Minimalist templates and immediately see the preview change | VERIFIED | TemplateSelector.tsx has 3 clickable thumbnails; onSelect triggers handleChange({templateId}) which updates local state; TemplateRenderer maps templateId to correct component |
| 4 | User can preview the complete invitation as a guest would see it before publishing | VERIFIED | Standalone "Xem truoc" button (Eye icon) in EditorShell topbar at lines 75–83; always visible, no publication-state gate; opens FullPreviewDialog via setShowFullPreview(true); dialog renders TemplateRenderer |
| 5 | User can publish the invitation (generating the slug) and unpublish it — the slug never changes after first publish | VERIFIED | PublishButton.tsx calls POST /invitations/:id/publish and /unpublish; service.publish() checks `if (invitation.slug)` and only writes slug on first publish; 20 passing API unit tests including slug immutability |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Plan | Lines | Status | Notes |
|----------|------|-------|--------|-------|
| `apps/api/src/invitations/dto/update-invitation.dto.ts` | 03-01 | — | VERIFIED | Unchanged from initial verification |
| `apps/api/src/invitations/invitations.controller.ts` | 03-01 | — | VERIFIED | Unchanged from initial verification |
| `apps/api/src/invitations/invitations.service.ts` | 03-01 | — | VERIFIED | Unchanged from initial verification |
| `apps/web/components/templates/types.ts` | 03-02 | — | VERIFIED | Unchanged |
| `apps/web/components/templates/TemplateTraditional.tsx` | 03-02 | — | VERIFIED | Unchanged |
| `apps/web/components/templates/TemplateModern.tsx` | 03-02 | — | VERIFIED | Unchanged |
| `apps/web/components/templates/TemplateMinimalist.tsx` | 03-02 | — | VERIFIED | Unchanged |
| `apps/web/components/templates/TemplateRenderer.tsx` | 03-02 | — | VERIFIED | Unchanged |
| `apps/web/components/templates/index.ts` | 03-02 | — | VERIFIED | Unchanged |
| `apps/web/app/(app)/thep-cuoi/[id]/page.tsx` | 03-03 | 33 | VERIFIED | Unchanged |
| `apps/web/app/(app)/thep-cuoi/[id]/EditorShell.tsx` | 03-03, 03-05 | 115 | VERIFIED | Modified: Eye import added, standalone preview button added at lines 75–83, onPreview removed from PublishButton usage |
| `apps/web/app/(app)/thep-cuoi/[id]/EditorForm.tsx` | 03-03 | 136 | VERIFIED | Unchanged |
| `apps/web/app/(app)/thep-cuoi/[id]/EditorPreview.tsx` | 03-03 | 33 | VERIFIED | Unchanged |
| `apps/web/app/(app)/thep-cuoi/[id]/TemplateSelector.tsx` | 03-03 | 68 | VERIFIED | Unchanged |
| `apps/web/app/(app)/thep-cuoi/[id]/useAutoSave.ts` | 03-03 | 68 | VERIFIED | Unchanged |
| `apps/web/app/(app)/thep-cuoi/[id]/PublishButton.tsx` | 03-04, 03-05 | 298 | VERIFIED | Modified: onPreview prop removed; "Xem truoc" dropdown item removed; unused Eye + DropdownMenuSeparator imports removed; "Huy xuat ban" dropdown retained |
| `apps/web/app/(app)/thep-cuoi/[id]/FullPreviewDialog.tsx` | 03-04 | 35 | VERIFIED | Unchanged — no modifications needed |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `EditorShell.tsx` topbar button | `FullPreviewDialog.tsx` | `onClick={() => setShowFullPreview(true)}` | WIRED | Line 79: direct state call; dialog bound at lines 91–95 |
| `EditorShell.tsx` | `PublishButton.tsx` | rendered in topbar without onPreview | WIRED | Lines 84–88: PublishButton rendered with only onPublished + onUnpublished props |
| `invitations.controller.ts` | `invitations.service.ts` | DI injection | WIRED | Unchanged from initial verification |
| `TemplateRenderer.tsx` | Template components | TEMPLATES record | WIRED | Unchanged from initial verification |
| `EditorShell.tsx` | `EditorForm.tsx + EditorPreview.tsx` | useState<Invitation> | WIRED | Unchanged from initial verification |
| `EditorForm.tsx` | `useAutoSave.ts` | save() on field change | WIRED | Unchanged from initial verification |
| `EditorPreview.tsx` | `TemplateRenderer` | render with invitation prop | WIRED | Unchanged from initial verification |
| `page.tsx` | `/invitations/:id` API | server fetch with auth cookie | WIRED | Unchanged from initial verification |
| `PublishButton.tsx` | `POST /invitations/:id/publish` | apiFetch | WIRED | Unchanged from initial verification |
| `PublishButton.tsx` | `POST /invitations/:id/unpublish` | apiFetch | WIRED | Unchanged from initial verification |
| `FullPreviewDialog.tsx` | `TemplateRenderer` | render with invitation prop | WIRED | Unchanged from initial verification |

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|------------|----------------|-------------|--------|----------|
| EDIT-01 | 03-03 | User can enter bride/groom names, wedding date/time, venue address, invitation message, thank-you text | SATISFIED | EditorForm.tsx has all fields in 3 accordion sections |
| EDIT-02 | 03-03 | User sees real-time preview while editing | SATISFIED | EditorPreview renders from local useState; never re-fetches from API |
| EDIT-03 | 03-01, 03-03 | Editor auto-saves as draft | SATISFIED | useAutoSave.ts implements 800ms debounce; PATCH /invitations/:id in service |
| EDIT-08 | 03-02, 03-03 | User can select from 3 templates with instant preview | SATISFIED | TemplateSelector + TemplateRenderer + template switch updates local state immediately |
| EDIT-09 | 03-04, 03-05 | User can preview the complete invitation before publishing | SATISFIED | Standalone "Xem truoc" button (Eye icon) in EditorShell topbar always visible; calls setShowFullPreview(true); opens FullPreviewDialog which renders TemplateRenderer — accessible from both draft and published state |
| EDIT-10 | 03-01, 03-04 | User can publish/unpublish invitation | SATISFIED | PublishButton calls POST /:id/publish and POST /:id/unpublish; published-state dropdown retains "Huy xuat ban" action |
| SYST-02 | 03-01, 03-04 | Slug permanently locked after first publish | SATISFIED | service.publish() generates slug only when `invitation.slug` is null; 20 passing tests including "does not overwrite existing slug" |

**Orphaned requirements:** None — all 7 Phase 3 requirements are claimed in plans.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `apps/web/app/(app)/thep-cuoi/[id]/page.tsx` | 12 | Hardcoded `localhost:3001` for server-side fetch | Warning | Pre-existing project-wide pattern (consistent with dashboard/page.tsx from Phase 2). Not introduced or worsened by Phase 3. |

No new anti-patterns introduced by plan 03-05 changes. No stubs, empty implementations, or TODO/FIXME comments found.

### Regression Check (plan 03-05 scope)

Plan 03-05 touched exactly 2 files. Regression checks confirm:

- `EditorShell.tsx` (115 lines): all previously-verified wiring intact — useState, handleChange, useAutoSave, EditorForm, EditorPreview, TemplateSelector, PublishButton, FullPreviewDialog all present and connected.
- `PublishButton.tsx` (298 lines): all publish/unpublish flows intact — confirmation dialog, celebration dialog, unpublish dialog, apiFetch calls to `/publish` and `/unpublish` all present; "Huy xuat ban" dropdown retained; only the now-redundant "Xem truoc" item and `onPreview` prop removed.

**No regressions detected.**

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

#### 5. Draft preview (new — from closed gap)

**Test:** Open editor for a draft invitation (never published). Click the "Xem truoc" button in the topbar.
**Expected:** FullPreviewDialog opens immediately showing the complete invitation rendered through TemplateRenderer — the same view a guest would see at the public URL.
**Why human:** Requires browser rendering to confirm the dialog opens and TemplateRenderer correctly renders draft-state invitation data.

---

_Verified: 2026-03-15T02:00:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification after: plan 03-05 (commit 0c6f998)_
