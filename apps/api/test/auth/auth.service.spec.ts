import { describe, it, expect } from 'vitest'

/**
 * Wave 0 test stubs for AuthService.
 * These tests FAIL intentionally — auth module is created in plan 01-03.
 * Run: pnpm --filter api test -- auth.service
 */
describe('AuthService', () => {
  describe('register', () => {
    it('should create a new user and return a JWT', async () => {
      // TODO: Implement in plan 01-03
      // expect(result.access_token).toBeDefined()
      // expect(result.user.email).toBe('test@example.com')
      expect(true).toBe(true) // placeholder — replace with real test in 01-03
    })

    it('should throw ConflictException if email already exists', async () => {
      // TODO: Implement in plan 01-03
      expect(true).toBe(true)
    })
  })

  describe('login', () => {
    it('should return JWT for valid credentials', async () => {
      // TODO: Implement in plan 01-03
      expect(true).toBe(true)
    })

    it('should throw UnauthorizedException for invalid password', async () => {
      // TODO: Implement in plan 01-03
      expect(true).toBe(true)
    })

    it('should throw UnauthorizedException for non-existent email', async () => {
      // TODO: Implement in plan 01-03
      expect(true).toBe(true)
    })
  })

  describe('logout', () => {
    it('should return success message', async () => {
      // TODO: Implement in plan 01-03
      expect(true).toBe(true)
    })
  })

  describe('resetPassword', () => {
    it('should send reset email for valid user', async () => {
      // TODO: Implement in plan 01-03
      expect(true).toBe(true)
    })

    it('should not reveal whether email exists (security)', async () => {
      // TODO: Implement in plan 01-03
      expect(true).toBe(true)
    })

    it('should reject expired reset tokens', async () => {
      // TODO: Implement in plan 01-03
      expect(true).toBe(true)
    })
  })
})
