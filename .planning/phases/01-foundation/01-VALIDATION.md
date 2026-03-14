---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (NestJS unit tests) + Playwright (e2e) |
| **Config file** | `apps/api/vitest.config.ts` — Wave 0 installs |
| **Quick run command** | `pnpm --filter api test` |
| **Full suite command** | `pnpm turbo test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter api test`
- **After every plan wave:** Run `pnpm turbo test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | — | smoke | `pnpm turbo build` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | SYST-03 | integration | `pnpm --filter api test -- rls.e2e` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | AUTH-01 | unit | `pnpm --filter api test -- auth.service` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | AUTH-02 | unit | `pnpm --filter api test -- auth.service` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 2 | AUTH-03 | unit | `pnpm --filter api test -- auth.service` | ❌ W0 | ⬜ pending |
| 01-03-04 | 03 | 2 | AUTH-04 | unit | `pnpm --filter api test -- auth.service` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 3 | AUTH-01 | e2e | `pnpm --filter web test:e2e -- auth` | ❌ W0 | ⬜ pending |
| 01-04-02 | 04 | 3 | AUTH-02 | e2e | `pnpm --filter web test:e2e -- auth` | ❌ W0 | ⬜ pending |
| 01-05-01 | 05 | 1 | SYST-01 | smoke | Manual inspection — HTML lang="vi" | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/api/vitest.config.ts` — Vitest configuration for NestJS
- [ ] `apps/api/test/auth/auth.service.spec.ts` — Unit test stubs for register, login, logout, reset
- [ ] `apps/api/test/rls.e2e.spec.ts` — RLS integration test (cross-user data access)
- [ ] `apps/api/test/setup.ts` — Test database seeding + teardown helpers
- [ ] `pnpm --filter api add -D vitest @nestjs/testing` — Framework install

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| HTML lang="vi" on all pages | SYST-01 | Static attribute check, no dynamic behavior | Inspect `<html>` tag in browser DevTools |
| Toast notifications for auth errors | AUTH-01..04 | Visual UX verification | Trigger invalid login, check toast appears in Vietnamese |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
