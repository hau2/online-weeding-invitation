# Deferred Items - Phase 05

## Pre-existing Test Failures

### InvitationContent.test.tsx (3 failures)
- **Root cause:** Plan 05-04 updated InvitationShell to use `useSearchParams()` from `next/navigation`, but InvitationContent.test.tsx does not mock this hook
- **Error:** `TypeError: Cannot read properties of null (reading 'get')` at `searchParams.get('to')`
- **Fix needed:** Add `vi.mock('next/navigation', ...)` to InvitationContent.test.tsx
- **Scope:** Pre-existing, not caused by Plan 05-05 changes
