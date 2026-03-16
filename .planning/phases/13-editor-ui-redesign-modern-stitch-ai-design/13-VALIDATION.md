---
phase: 13
slug: editor-ui-redesign-modern-stitch-ai-design
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x with jsdom (web) + Vitest (api) |
| **Config file** | `apps/web/vitest.config.ts`, `apps/api/vitest.config.ts` |
| **Quick run command** | `cd apps/web && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd apps/web && npx vitest run && cd ../../apps/api && npx vitest run` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/web && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd apps/web && npx vitest run && cd ../../apps/api && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | EDIT-UI-02 | unit | `tsc --noEmit` | N/A | ⬜ pending |
| 13-01-02 | 01 | 1 | EDIT-UI-03,04 | unit | `npx vitest run` | ❌ W0 | ⬜ pending |
| 13-02-01 | 02 | 2 | EDIT-UI-01 | unit | `npx vitest run __tests__/components/EditorForm.test.tsx` | ✅ (update) | ⬜ pending |
| 13-02-02 | 02 | 2 | EDIT-UI-06 | unit | `npx vitest run __tests__/components/EditorShell.test.tsx` | ❌ W0 | ⬜ pending |
| 13-03-01 | 03 | 3 | EDIT-UI-05 | unit | `npx vitest run __tests__/components/PreviewShell.test.tsx` | ❌ W0 | ⬜ pending |
| 13-03-02 | 03 | 3 | EDIT-UI-08 | unit | `cd apps/api && npx vitest run` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/__tests__/components/CeremonyProgramEditor.test.tsx` — stubs for EDIT-UI-03
- [ ] `apps/web/__tests__/components/AvatarUpload.test.tsx` — stubs for EDIT-UI-04
- [ ] `apps/web/__tests__/components/PreviewShell.test.tsx` — stubs for EDIT-UI-05
- [ ] `apps/web/__tests__/components/EditorShell.test.tsx` — stubs for EDIT-UI-06
- [ ] Update `apps/web/__tests__/components/EditorForm.test.tsx` — update for 9-section accordion

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DB migration adds 5 columns | EDIT-UI-07 | DDL operation | Run `supabase db push`, verify columns in DB |
| Accordion animations smooth | EDIT-UI-01 | Visual | Open editor, expand/collapse sections |
| Avatar circular crop display | EDIT-UI-04 | Visual | Upload avatar, verify circular display |
| Preview page responsive | EDIT-UI-05 | Visual | Switch Phone/Desktop tabs, verify mockups |
| Stitch design match | All | Visual | Compare with stitch-editor-page.md screenshots |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
