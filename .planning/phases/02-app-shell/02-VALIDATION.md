---
phase: 2
slug: app-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (api, from Phase 1) + Vitest + React Testing Library (web) |
| **Config file** | `apps/api/vitest.config.ts` (exists), `apps/web/vitest.config.ts` (Wave 0) |
| **Quick run command** | `pnpm --filter web test -- --testPathPattern=dashboard` |
| **Full suite command** | `pnpm turbo test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter web test` or `pnpm --filter api test` (depending on changed app)
- **After every plan wave:** Run `pnpm turbo test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | SYST-04, ADMN-01 | integration | `pnpm --filter web test -- middleware` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | DASH-01 | unit | `pnpm --filter web test -- InvitationGrid` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | DASH-02 | unit | `pnpm --filter web test -- CreateWizard` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | DASH-03 | unit | `pnpm --filter web test -- InvitationCard` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | ADMN-01 | smoke | `pnpm --filter web build` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 1 | DASH-01, DASH-02 | unit | `pnpm --filter api test -- invitations.service` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/vitest.config.ts` — Vitest + React Testing Library config for Next.js
- [ ] `apps/web/test/setup.ts` — RTL setup with jest-dom matchers
- [ ] `apps/web/__tests__/middleware.test.ts` — middleware redirect tests (SYST-04 + ADMN-01)
- [ ] `apps/web/__tests__/components/InvitationGrid.test.tsx` — card grid rendering (DASH-01)
- [ ] `apps/web/__tests__/components/InvitationCard.test.tsx` — action buttons (DASH-03)
- [ ] `apps/web/__tests__/components/CreateWizard.test.tsx` — create flow (DASH-02)
- [ ] `apps/api/src/invitations/__tests__/invitations.service.spec.ts` — ownership enforcement (DASH-01 + DASH-02)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Card grid visual layout matches design | DASH-01 | Visual aesthetics cannot be automated | Open /dashboard, verify card grid with pink theme |
| Hamburger menu on mobile | DASH-03 | Mobile responsive behavior | Resize browser to 375px, verify hamburger appears |
| Admin neutral theme separation | ADMN-01 | Visual comparison | Open /admin, verify no pink/rose colors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
