---
phase: 10
slug: agent-tier-and-storage-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 10 — Validation Strategy

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
| 10-00-01 | 00 | 0 | AGT-02..08 | stub | `cd apps/api && npx vitest run` | Wave 0 | ⬜ pending |
| 10-01-01 | 01 | 1 | AGT-01 | migration | Manual SQL review | N/A | ⬜ pending |
| 10-01-02 | 01 | 1 | AGT-02 | unit | `cd apps/api && npx vitest run src/admin/__tests__/agent-management.spec.ts` | Wave 0 | ⬜ pending |
| 10-02-01 | 02 | 1 | AGT-03 | unit | `cd apps/api && npx vitest run src/invitations/__tests__/agent-quota.spec.ts` | Wave 0 | ⬜ pending |
| 10-02-02 | 02 | 1 | AGT-04 | unit | `cd apps/api && npx vitest run src/auth/__tests__/profile.spec.ts` | Wave 0 | ⬜ pending |
| 10-03-01 | 03 | 2 | AGT-05 | unit | `cd apps/api && npx vitest run src/invitations/__tests__/draft-cleanup.spec.ts` | Wave 0 | ⬜ pending |
| 10-03-02 | 03 | 2 | AGT-07 | unit | `cd apps/api && npx vitest run src/admin/__tests__/storage-cleanup.spec.ts` | Wave 0 | ⬜ pending |
| 10-04-01 | 04 | 2 | AGT-06 | unit | `cd apps/web && npx vitest run` | Wave 0 | ⬜ pending |
| 10-04-02 | 04 | 2 | AGT-08 | unit | `cd apps/web && npx vitest run` | Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/api/src/admin/__tests__/agent-management.spec.ts` — stubs for AGT-02 (admin grant/renew agent tier)
- [ ] `apps/api/src/invitations/__tests__/agent-quota.spec.ts` — stubs for AGT-03 (agent quota enforcement at publish)
- [ ] `apps/api/src/auth/__tests__/profile.spec.ts` — stubs for AGT-04 (/me endpoint returns agent profile)
- [ ] `apps/api/src/invitations/__tests__/draft-cleanup.spec.ts` — stubs for AGT-05 (draft auto-delete cron)
- [ ] `apps/api/src/admin/__tests__/storage-cleanup.spec.ts` — stubs for AGT-07 (admin clear storage)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Agent quota bar on dashboard | AGT-06 | Visual component | Verify progress bar shows "X/20 thiep da xuat ban" with days remaining |
| Agent greeting | AGT-08 | Visual component | Verify "Xin chao, [Name] (Dai ly)" shown for agent users |
| Draft warning badge | AGT-06 | Visual component | Verify warning badge appears within 7 days of deletion |
| Clear Storage confirmation dialog | AGT-07 | Visual component | Verify dialog shows storage before/after estimate |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
