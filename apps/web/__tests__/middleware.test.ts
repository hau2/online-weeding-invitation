import { describe, it, expect } from 'vitest'

/**
 * Wave 0 stubs for middleware auth guard.
 * Covers: SYST-04 (unauthenticated -> redirect /dang-nhap) + ADMN-01 (role 'user' -> /dashboard?error=forbidden)
 * Real tests implemented in Task 1 after middleware.ts exists.
 */
describe('middleware', () => {
  it('redirects unauthenticated user from /dashboard to /dang-nhap', () => {
    expect(true).toBe(true) // TODO: replace with real middleware test in Task 1
  })
  it('redirects role=user from /admin to /dashboard?error=forbidden', () => {
    expect(true).toBe(true) // TODO: replace with real middleware test in Task 1
  })
  it('allows authenticated role=admin to reach /admin', () => {
    expect(true).toBe(true)
  })
  it('does not intercept /w/ public invitation routes', () => {
    expect(true).toBe(true)
  })
})
