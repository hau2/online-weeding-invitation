---
phase: 09
slug: polish-and-performance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 09 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.x |
| **Config file** | apps/web/vitest.config.ts, apps/api/vitest.config.ts |
| **Quick run command** | `npx tsc --noEmit -p apps/api/tsconfig.json && npx tsc --noEmit -p apps/web/tsconfig.json` |
| **Full suite command** | `pnpm --filter @repo/api test && pnpm --filter @repo/web test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit` for changed app
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | PUBL-10 | build | `npx tsc --noEmit -p apps/web/tsconfig.json` | ✅ | ⬜ pending |
| 09-02-01 | 02 | 1 | PUBL-10 | build | `npx tsc --noEmit -p apps/web/tsconfig.json` | ✅ | ⬜ pending |
| 09-03-01 | 03 | 1 | PUBL-10 | build+unit | `npx tsc --noEmit -p apps/api/tsconfig.json` | ✅ | ⬜ pending |
| 09-04-01 | 04 | 2 | PUBL-10 | build | `npx tsc --noEmit -p apps/web/tsconfig.json` | ✅ | ⬜ pending |
| 09-05-01 | 05 | 2 | PUBL-10 | manual | N/A — real device | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test stubs needed — this phase is primarily about optimization, UX polish, and cron scheduling.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| <1MB page weight | PUBL-10 | Requires real build + network analysis | Run `next build`, check `.next/analyze` output |
| 30fps envelope animation | PUBL-10 | Requires Chrome DevTools Performance tab | Open `/w/{slug}` at 6x CPU throttle, measure frame times |
| iOS Safari audio in Zalo | PUBL-10 | Requires real iPhone + Zalo app | Share link in Zalo, tap envelope, verify audio plays |
| Zalo OG preview | PUBL-10 | Requires real Zalo share | Share invitation URL, verify preview image + title |
| Desktop floral frame | PUBL-10 | Visual quality assessment | Open on 1920x1080 screen, verify frame aesthetics |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
