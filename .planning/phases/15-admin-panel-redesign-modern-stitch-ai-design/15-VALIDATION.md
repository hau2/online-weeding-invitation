---
phase: 15
slug: admin-panel-redesign-modern-stitch-ai-design
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library (jsdom) |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `cd apps/web && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd apps/web && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/web && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd apps/web && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | VISUAL-01 | smoke | `cd apps/web && npx vitest run` | Existing | ⬜ pending |
| 15-01-02 | 01 | 1 | VISUAL-02 | smoke | `cd apps/web && npx vitest run` | Existing | ⬜ pending |
| 15-02-01 | 02 | 1 | VISUAL-03 | smoke | `cd apps/web && npx vitest run` | Existing | ⬜ pending |
| 15-02-02 | 02 | 1 | VISUAL-04 | lint-check | `grep -r "gray-" apps/web/app/\(admin\)/ apps/web/components/admin/` | Manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. This phase is visual-only restyling with no new testable logic. Regression is caught by existing test suite.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| AdminSidebar dark Stitch style | VISUAL-01 | Visual appearance | Verify dark #181113 bg, #ec1349 active indicator, branding + Admin badge |
| StatCard accent icons | VISUAL-02 | Visual appearance | Verify colored icon circles, #181113 values, #89616b labels |
| Data tables in Stitch cards | VISUAL-03 | Visual appearance | Verify white rounded-xl cards, pill badges, search inputs |
| Settings cards layout | VISUAL-04 | Visual appearance | Verify per-section cards with save buttons |
| No gray-* residual classes | VISUAL-04 | Class audit | Run grep to confirm no gray-* classes remain in admin files |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
