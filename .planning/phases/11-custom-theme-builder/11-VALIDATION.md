---
phase: 11
slug: custom-theme-builder
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (apps/api + apps/web) |
| **Config file** | `apps/api/vitest.config.ts`, `apps/web/vitest.config.ts` |
| **Quick run command** | `cd apps/api && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd apps/api && npx vitest run && cd ../../apps/web && npx vitest run` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/api && npx vitest run --reporter=verbose`
- **After every plan wave:** Run full suite (api + web)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | CT-01, CT-10 | migration | Manual SQL review | N/A | ⬜ pending |
| 11-01-02 | 01 | 1 | CT-02..05 | unit | `cd apps/api && npx vitest run src/admin/__tests__/custom-themes.spec.ts` | Wave 0 | ⬜ pending |
| 11-02-01 | 02 | 1 | CT-06 | unit | `cd apps/web && npx vitest run __tests__/components/themes.test.tsx` | Extend | ⬜ pending |
| 11-02-02 | 02 | 1 | CT-08 | unit | `cd apps/web && npx vitest run __tests__/components/shared-template.test.tsx` | Extend | ⬜ pending |
| 11-03-01 | 03 | 2 | CT-09 | unit | `cd apps/web && npx vitest run __tests__/components/ThemeBuilder.test.tsx` | Wave 0 | ⬜ pending |
| 11-03-02 | 03 | 2 | CT-07 | unit | `cd apps/web && npx vitest run __tests__/components/TemplateSelector.test.tsx` | Extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/api/src/admin/__tests__/custom-themes.spec.ts` — stubs for CT-02..05 (CRUD + API)
- [ ] `apps/web/__tests__/components/ThemeBuilder.test.tsx` — stubs for CT-09 (builder form)
- [ ] Extend `apps/web/__tests__/components/themes.test.tsx` — CT-06 (async custom theme resolution)
- [ ] Extend `apps/web/__tests__/components/TemplateSelector.test.tsx` — CT-07 (custom themes in grid)
- [ ] Extend `apps/web/__tests__/components/shared-template.test.tsx` — CT-08 (backgroundImageUrl)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Theme builder live preview updates | CT-09 | Visual real-time rendering | Edit color fields, verify preview updates instantly |
| Background image renders as full-page bg | CT-08 | Visual rendering on real device | Upload image, verify it covers page behind sections |
| Custom theme in template selector grid | CT-07 | Visual layout | Publish custom theme, verify it appears after built-in themes |
| iOS Safari background-image rendering | CT-08 | Device-specific | Test on real iOS device |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
