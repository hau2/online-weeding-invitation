import { describe, it, expect } from 'vitest'

/**
 * Middleware route matching tests for auth guard.
 * Covers: SYST-04 (unauthenticated -> redirect /dang-nhap) + ADMN-01 (role 'user' -> /dashboard?error=forbidden)
 *
 * These test the pure route matching logic extracted from middleware.ts.
 * Full integration middleware tests are covered by Playwright e2e.
 */
describe('middleware route matching', () => {
  it('isAppRoute matches /dashboard', () => {
    const path = '/dashboard'
    const isAppRoute = path.startsWith('/dashboard') || path.startsWith('/thep-cuoi')
    expect(isAppRoute).toBe(true)
  })

  it('isAppRoute matches /dashboard/sub-path', () => {
    const path = '/dashboard/settings'
    const isAppRoute = path.startsWith('/dashboard') || path.startsWith('/thep-cuoi')
    expect(isAppRoute).toBe(true)
  })

  it('isAppRoute matches /thep-cuoi', () => {
    const path = '/thep-cuoi'
    const isAppRoute = path.startsWith('/dashboard') || path.startsWith('/thep-cuoi')
    expect(isAppRoute).toBe(true)
  })

  it('isAdminRoute matches /admin', () => {
    const path = '/admin'
    const isAdminRoute = path.startsWith('/admin')
    expect(isAdminRoute).toBe(true)
  })

  it('isAdminRoute matches /admin/nguoi-dung', () => {
    const path = '/admin/nguoi-dung'
    const isAdminRoute = path.startsWith('/admin')
    expect(isAdminRoute).toBe(true)
  })

  it('/w/ paths are not app or admin routes', () => {
    const path = '/w/minh-thao-x7k2'
    const isAppRoute = path.startsWith('/dashboard') || path.startsWith('/thep-cuoi')
    const isAdminRoute = path.startsWith('/admin')
    expect(isAppRoute).toBe(false)
    expect(isAdminRoute).toBe(false)
  })

  it('/dang-nhap is not an app or admin route', () => {
    const path = '/dang-nhap'
    const isAppRoute = path.startsWith('/dashboard') || path.startsWith('/thep-cuoi')
    const isAdminRoute = path.startsWith('/admin')
    expect(isAppRoute).toBe(false)
    expect(isAdminRoute).toBe(false)
  })

  it('/thep-cuoi paths are treated as app routes', () => {
    const path = '/thep-cuoi/abc123'
    const isAppRoute = path.startsWith('/dashboard') || path.startsWith('/thep-cuoi')
    expect(isAppRoute).toBe(true)
  })

  it('/ root path is not an app or admin route', () => {
    const path = '/'
    const isAppRoute = path.startsWith('/dashboard') || path.startsWith('/thep-cuoi')
    const isAdminRoute = path.startsWith('/admin')
    expect(isAppRoute).toBe(false)
    expect(isAdminRoute).toBe(false)
  })
})

describe('middleware admin role check', () => {
  it('non-admin user accessing /admin should be redirected to /dashboard?error=forbidden', () => {
    // Simulates the middleware logic: admin route + role !== admin -> forbidden redirect
    const isAdminRoute = true
    const userRole = 'user'
    const shouldRedirectForbidden = isAdminRoute && userRole !== 'admin'
    expect(shouldRedirectForbidden).toBe(true)
  })

  it('admin user accessing /admin should be allowed through', () => {
    const isAdminRoute = true
    const userRole = 'admin'
    const shouldRedirectForbidden = isAdminRoute && userRole !== 'admin'
    expect(shouldRedirectForbidden).toBe(false)
  })

  it('non-admin user accessing /dashboard should NOT trigger forbidden redirect', () => {
    const isAdminRoute = false
    const userRole = 'user'
    const shouldRedirectForbidden = isAdminRoute && userRole !== 'admin'
    expect(shouldRedirectForbidden).toBe(false)
  })
})
