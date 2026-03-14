import { describe, it } from 'vitest'

/**
 * Wave 0 RLS integration test stubs.
 * These require a live Supabase connection — skipped until real Supabase is configured.
 * Requirement: SYST-03 — User can only access their own invitations.
 * Run: pnpm --filter api test -- rls.e2e
 */
describe('RLS: Cross-user data access', () => {
  it.todo("user A cannot read user B's invitation via user-scoped client")
  it.todo("user A cannot update user B's invitation via user-scoped client")
  it.todo('service role client can read any user\'s invitation')
  it.todo('deleted invitation (deleted_at IS NOT NULL) is not returned by SELECT policy')
})
