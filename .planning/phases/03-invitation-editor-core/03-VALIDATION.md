---
phase: 3
slug: invitation-editor-core
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-14
updated: 2026-03-15
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x (API: node env, Web: jsdom env) |
| **Config file (API)** | `apps/api/vitest.config.ts` |
| **Config file (Web)** | `apps/web/vitest.config.ts` |
| **Quick run command (API)** | `cd apps/api && npx vitest run --reporter=verbose` |
| **Quick run command (Web)** | `cd apps/web && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd apps/api && npx vitest run && cd ../../apps/web && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command for changed app (`cd apps/api && npx vitest run` or `cd apps/web && npx vitest run`)
- **After every plan wave:** Run full suite across both apps
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | EDIT-08 | unit (web) | `cd apps/web && npx vitest run __tests__/components/templates.test.tsx` | Created by 03-03 Task 0 | pending |
| 03-02-01 | 02 | 1 | EDIT-01 | unit (web) | `cd apps/web && npx vitest run __tests__/components/EditorForm.test.tsx` | Created by 03-03 Task 0 | pending |
| 03-02-02 | 02 | 1 | EDIT-03 | unit (web) | `cd apps/web && npx vitest run __tests__/hooks/useAutoSave.test.ts` | Created by 03-03 Task 0, filled by 03-03 Task 1 | pending |
| 03-02-03 | 02 | 1 | EDIT-03 | unit (api) | `cd apps/api && npx vitest run src/invitations/__tests__/invitations.service.spec.ts` | Partial | pending |
| 03-03-01 | 03 | 1 | EDIT-02 | unit (web) | `cd apps/web && npx vitest run __tests__/components/EditorPreview.test.tsx` | Created by 03-03 Task 0 | pending |
| 03-04-01 | 04 | 2 | EDIT-08 | unit (web) | `cd apps/web && npx vitest run __tests__/components/TemplateSelector.test.tsx` | Created by 03-03 Task 0 | pending |
| 03-05-01 | 05 | 2 | EDIT-10 | unit (api) | `cd apps/api && npx vitest run src/invitations/__tests__/invitations.service.spec.ts` | Partial | pending |
| 03-05-02 | 05 | 2 | SYST-02 | unit (api) | `cd apps/api && npx vitest run src/invitations/__tests__/invitations.service.spec.ts` | No — Wave 0 | pending |
| 03-06-01 | 06 | 2 | EDIT-09 | unit (web) | `cd apps/web && npx vitest run __tests__/components/FullPreviewDialog.test.tsx` | Created by 03-03 Task 0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

All Wave 0 test stubs are created by **Plan 03-03, Task 0** before any implementation tasks run:

- [x] `apps/web/__tests__/hooks/useAutoSave.test.ts` — stubs for EDIT-03 (filled with real tests by 03-03 Task 1)
- [x] `apps/web/__tests__/components/EditorForm.test.tsx` — stubs for EDIT-01
- [x] `apps/web/__tests__/components/EditorPreview.test.tsx` — stubs for EDIT-02
- [x] `apps/web/__tests__/components/TemplateSelector.test.tsx` — stubs for EDIT-08
- [x] `apps/web/__tests__/components/templates.test.tsx` — stubs for EDIT-08 (render)
- [x] `apps/web/__tests__/components/FullPreviewDialog.test.tsx` — stubs for EDIT-09
- [ ] `apps/api/src/invitations/__tests__/invitations.service.spec.ts` — needs: update, publish, unpublish, slug immutability tests (extends existing file, handled by Plan 03-01 Task 1)

*Existing infrastructure covers test framework setup (Vitest already configured in both apps).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Phone mockup frame renders correctly | EDIT-02 | CSS visual layout | Inspect editor page: preview should appear in a phone-shaped frame |
| Template visual identity matches spec | EDIT-08 | Visual design accuracy | Compare each template against CONTEXT.md descriptions (gold/red, rose gold, cream) |
| Sidebar auto-collapses on editor open | UX | Layout behavior | Navigate to editor, verify sidebar collapses to icons-only |
| Responsive stacked layout on mobile | UX | Viewport-specific | Resize to mobile width, verify form stacks above preview |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (Plan 03-03 Task 0 creates all 6 stubs)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (revision 2026-03-15)
