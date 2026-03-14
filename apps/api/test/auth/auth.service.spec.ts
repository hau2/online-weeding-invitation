import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { AuthService } from '../../src/auth/auth.service'
import { SupabaseAdminService } from '../../src/supabase/supabase.service'

// Build a fresh supabase chain mock each test — vi.clearAllMocks() wipes .mockReturnThis() state
function buildSupabaseChain() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    single: vi.fn(),
    maybeSingle: vi.fn(),
    limit: vi.fn(),
  }
  // All chainable methods return the chain object itself
  const chainable = ['from', 'select', 'insert', 'update', 'eq', 'is', 'gt', 'order']
  for (const method of chainable) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }
  // Terminal methods also return chain (so further chaining works)
  chain.limit = vi.fn().mockReturnValue(chain)
  return chain
}

let mockSupabaseChain: ReturnType<typeof buildSupabaseChain>

describe('AuthService', () => {
  let service: AuthService
  let jwtService: JwtService

  beforeEach(async () => {
    mockSupabaseChain = buildSupabaseChain()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseAdminService,
          useValue: { client: mockSupabaseChain },
        },
        {
          provide: JwtService,
          useValue: { sign: vi.fn().mockReturnValue('mock-jwt-token') },
        },
        {
          provide: MailerService,
          useValue: { sendMail: vi.fn().mockResolvedValue(undefined) },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn().mockReturnValue('http://localhost:3000'),
            getOrThrow: vi.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    jwtService = module.get<JwtService>(JwtService)
  })

  describe('register', () => {
    it('creates a new user and returns AuthResponse with JWT', async () => {
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null })
      mockSupabaseChain.single.mockResolvedValueOnce({
        data: { id: 'user-uuid', email: 'test@example.com', role: 'user' },
        error: null,
      })

      const result = await service.register('test@example.com', 'Password123')

      expect(result.access_token).toBe('mock-jwt-token')
      expect(result.user.email).toBe('test@example.com')
      expect(result.user.role).toBe('user')
    })

    it('throws ConflictException with Vietnamese message if email exists', async () => {
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
        data: { id: 'existing-uuid' },
        error: null,
      })

      await expect(service.register('test@example.com', 'Password123')).rejects.toThrow(
        ConflictException,
      )

      // Reset and re-mock for second call
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
        data: { id: 'existing-uuid' },
        error: null,
      })
      await expect(service.register('test@example.com', 'Password123')).rejects.toThrow(
        'Email đã được sử dụng',
      )
    })
  })

  describe('login', () => {
    it('returns AuthResponse for valid credentials', async () => {
      const { hash } = await import('bcrypt')
      const passwordHash = await hash('ValidPass123', 10)

      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
        data: {
          id: 'user-uuid',
          email: 'test@example.com',
          password_hash: passwordHash,
          role: 'user',
          deleted_at: null,
        },
        error: null,
      })

      const result = await service.login('test@example.com', 'ValidPass123')
      expect(result.access_token).toBe('mock-jwt-token')
    })

    it('throws UnauthorizedException for wrong password', async () => {
      const { hash } = await import('bcrypt')
      const passwordHash = await hash('ValidPass123', 10)

      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
        data: {
          id: 'user-uuid',
          email: 'test@example.com',
          password_hash: passwordHash,
          role: 'user',
          deleted_at: null,
        },
        error: null,
      })

      await expect(service.login('test@example.com', 'WrongPass')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('throws UnauthorizedException for non-existent email (same message — no enumeration)', async () => {
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null })

      await expect(service.login('unknown@example.com', 'AnyPass')).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  describe('logout', () => {
    it('returns Vietnamese success message', () => {
      const result = service.logout()
      expect(result.message).toBe('Đăng xuất thành công')
    })
  })

  describe('requestPasswordReset', () => {
    it('returns same message whether email exists or not', async () => {
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null })

      const result = await service.requestPasswordReset('unknown@example.com')
      expect(result.message).toContain('Nếu email tồn tại')
    })
  })

  describe('confirmPasswordReset', () => {
    it('throws BadRequestException for expired token', async () => {
      mockSupabaseChain.limit.mockResolvedValueOnce({ data: [] })

      await expect(service.confirmPasswordReset('invalid-token', 'NewPass123')).rejects.toThrow(
        BadRequestException,
      )
    })
  })
})
