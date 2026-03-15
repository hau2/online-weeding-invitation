---
phase: 4
slug: media-upload-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 4 — Validation Strategy

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
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command for changed app
- **After every plan wave:** Run full suite across both apps
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | EDIT-05 | unit (api) | `cd apps/api && npx vitest run src/invitations/pipes/image-optimization.pipe.spec.ts` | No — Wave 0 | pending |
| 04-01-02 | 01 | 1 | EDIT-04 | unit (api) | `cd apps/api && npx vitest run src/invitations/__tests__/invitations.service.spec.ts` | Partial | pending |
| 04-02-01 | 02 | 1 | EDIT-06 | unit (api) | `cd apps/api && npx vitest run src/invitations/__tests__/invitations.service.spec.ts` | Partial | pending |
| 04-03-01 | 03 | 2 | EDIT-04 | unit (web) | `cd apps/web && npx vitest run __tests__/components/PhotoGallery.test.tsx` | No — Wave 0 | pending |
| 04-04-01 | 04 | 2 | EDIT-06 | unit (web) | `cd apps/web && npx vitest run __tests__/components/MusicPicker.test.tsx` | No — Wave 0 | pending |
| 04-05-01 | 05 | 2 | EDIT-07 | unit (web) | `cd apps/web && npx vitest run __tests__/components/BankQrUpload.test.tsx` | No — Wave 0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/__tests__/components/PhotoGallery.test.tsx` — stubs for EDIT-04
- [ ] `apps/web/__tests__/components/MusicPicker.test.tsx` — stubs for EDIT-06
- [ ] `apps/web/__tests__/components/BankQrUpload.test.tsx` — stubs for EDIT-07
- [ ] `apps/api/src/invitations/pipes/image-optimization.pipe.spec.ts` — stubs for EDIT-05
- [ ] `apps/api/src/invitations/__tests__/invitations.service.spec.ts` — extend with media upload tests

*Existing Vitest infrastructure covers framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-drop reorder visual feedback | EDIT-04 | DnD requires pointer events | Upload 3+ photos, drag to reorder, verify visual feedback |
| Photo drop zone overlay appears | EDIT-04 | Drag event detection | Drag image file over the photo section, verify overlay |
| Upload progress bar animation | EDIT-04 | Visual timing | Upload a photo, verify progress bar fills during upload |
| WebP quality acceptable | EDIT-05 | Visual quality judgment | Upload a photo, view compressed result, check quality |
| Music preview playback | EDIT-06 | Audio output | Click play on a track, verify 30s preview plays |
| Bank QR readable after upload | EDIT-07 | QR scan verification | Upload a QR, verify it's readable by a QR scanner app |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
