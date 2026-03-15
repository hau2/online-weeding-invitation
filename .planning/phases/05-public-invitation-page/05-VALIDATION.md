---
phase: 05
slug: public-invitation-page
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x |
| **Config file (web)** | `apps/web/vitest.config.ts` |
| **Config file (api)** | `apps/api/vitest.config.ts` |
| **Quick run command (web)** | `cd apps/web && pnpm vitest run --reporter=verbose` |
| **Quick run command (api)** | `cd apps/api && pnpm vitest run --reporter=verbose` |
| **Full suite command** | `pnpm -r run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command for the modified app
- **After every plan wave:** Run `pnpm -r run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-00-01 | 00 | 0 | PUBL-01,PUBL-11 | unit (API) | `cd apps/api && pnpm vitest run src/invitations/__tests__/public-invitations.spec.ts -x` | ❌ W0 | ⬜ pending |
| 05-00-02 | 00 | 0 | PUBL-02 | unit (API) | `cd apps/api && pnpm vitest run src/invitations/__tests__/qr-generation.spec.ts -x` | ❌ W0 | ⬜ pending |
| 05-00-03 | 00 | 0 | PUBL-03,PUBL-04 | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/EnvelopeAnimation.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-00-04 | 00 | 0 | PUBL-05 | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/GuestName.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-00-05 | 00 | 0 | PUBL-06 | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/InvitationContent.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-00-06 | 00 | 0 | PUBL-07 | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/CountdownTimer.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-00-07 | 00 | 0 | PUBL-08 | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/MusicPlayer.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-00-08 | 00 | 0 | PUBL-12 | unit (component) | `cd apps/web && pnpm vitest run __tests__/components/ThankYouPage.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/api/src/invitations/__tests__/public-invitations.spec.ts` — stubs for PUBL-01, PUBL-11
- [ ] `apps/api/src/invitations/__tests__/qr-generation.spec.ts` — stubs for PUBL-02
- [ ] `apps/web/__tests__/components/EnvelopeAnimation.test.tsx` — stubs for PUBL-03, PUBL-04
- [ ] `apps/web/__tests__/components/GuestName.test.tsx` — stubs for PUBL-05
- [ ] `apps/web/__tests__/components/InvitationContent.test.tsx` — stubs for PUBL-06
- [ ] `apps/web/__tests__/components/CountdownTimer.test.tsx` — stubs for PUBL-07
- [ ] `apps/web/__tests__/components/MusicPlayer.test.tsx` — stubs for PUBL-08
- [ ] `apps/web/__tests__/components/ThankYouPage.test.tsx` — stubs for PUBL-12
- [ ] `cd apps/api && pnpm add qrcode && pnpm add -D @types/qrcode` — qrcode dependency

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| OG meta tags render in Zalo/Facebook | PUBL-09 | Social crawler behavior cannot be unit tested | Share link in Zalo + Facebook Debugger, verify preview image and title |
| PUBL-10 mobile-first <1MB | PUBL-10 | Bundle size verification needs production build | Phase 9 performance audit |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
