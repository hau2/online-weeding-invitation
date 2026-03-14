import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InvitationsService } from '../invitations.service'

function makeSupabaseMock(returnData: any, error: any = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: returnData, error }),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: returnData, error }),
  }
  return { from: vi.fn(() => chain), _chain: chain }
}

describe('InvitationsService', () => {
  describe('listByUser', () => {
    it('filters by userId and excludes deleted records', async () => {
      const mockRow = {
        id: 'inv-1',
        user_id: 'user-a',
        slug: null,
        status: 'draft',
        template_id: 'traditional',
        groom_name: 'Thao',
        bride_name: 'Minh',
        wedding_date: null,
        wedding_time: null,
        venue_name: '',
        venue_address: '',
        invitation_message: '',
        thank_you_text: '',
        view_count: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        deleted_at: null,
      }
      const supabaseMock = makeSupabaseMock([mockRow])
      const service = new InvitationsService({ client: supabaseMock } as any)

      const result = await service.listByUser('user-a')

      expect(supabaseMock.from).toHaveBeenCalledWith('invitations')
      expect(supabaseMock._chain.eq).toHaveBeenCalledWith(
        'user_id',
        'user-a',
      )
      expect(supabaseMock._chain.is).toHaveBeenCalledWith('deleted_at', null)
      expect(result).toHaveLength(1)
      expect(result[0].groomName).toBe('Thao')
      expect(result[0].brideName).toBe('Minh')
    })

    it('returns empty array when user has no invitations', async () => {
      const supabaseMock = makeSupabaseMock([])
      const service = new InvitationsService({ client: supabaseMock } as any)
      const result = await service.listByUser('user-no-invitations')
      expect(result).toEqual([])
    })

    it('maps snake_case DB columns to camelCase', async () => {
      const mockRow = {
        id: 'inv-2',
        user_id: 'user-a',
        slug: 'my-wedding',
        status: 'published',
        template_id: 'modern',
        groom_name: 'Duc',
        bride_name: 'Lan',
        wedding_date: '2026-06-15',
        wedding_time: '10:00',
        venue_name: 'Grand Hotel',
        venue_address: '123 Street',
        invitation_message: 'Welcome!',
        thank_you_text: 'Thanks!',
        view_count: 42,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
        deleted_at: null,
      }
      const supabaseMock = makeSupabaseMock([mockRow])
      const service = new InvitationsService({ client: supabaseMock } as any)

      const result = await service.listByUser('user-a')

      expect(result[0].userId).toBe('user-a')
      expect(result[0].templateId).toBe('modern')
      expect(result[0].groomName).toBe('Duc')
      expect(result[0].brideName).toBe('Lan')
      expect(result[0].weddingDate).toBe('2026-06-15')
      expect(result[0].weddingTime).toBe('10:00')
      expect(result[0].venueName).toBe('Grand Hotel')
      expect(result[0].venueAddress).toBe('123 Street')
      expect(result[0].invitationMessage).toBe('Welcome!')
      expect(result[0].thankYouText).toBe('Thanks!')
      expect(result[0].viewCount).toBe(42)
    })

    it('orders by created_at descending', async () => {
      const supabaseMock = makeSupabaseMock([])
      const service = new InvitationsService({ client: supabaseMock } as any)
      await service.listByUser('user-a')
      expect(supabaseMock._chain.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      })
    })

    it('throws InternalServerErrorException on Supabase error', async () => {
      const supabaseMock = makeSupabaseMock(null, {
        message: 'DB connection failed',
      })
      const service = new InvitationsService({ client: supabaseMock } as any)
      await expect(service.listByUser('user-a')).rejects.toThrow(
        'DB connection failed',
      )
    })
  })

  describe('create', () => {
    it('sets user_id from parameter, not from dto', async () => {
      const newRow = {
        id: 'inv-new',
        user_id: 'user-a',
        slug: null,
        status: 'draft',
        template_id: 'modern',
        groom_name: 'Thao',
        bride_name: 'Minh',
        wedding_date: null,
        wedding_time: null,
        venue_name: '',
        venue_address: '',
        invitation_message: '',
        thank_you_text: '',
        view_count: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        deleted_at: null,
      }
      const supabaseMock = makeSupabaseMock(newRow)
      // Override chain for insert->select->single path
      supabaseMock._chain.insert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: newRow, error: null }),
        }),
      })
      const service = new InvitationsService({ client: supabaseMock } as any)

      const result = await service.create('user-a', {
        brideName: 'Minh',
        groomName: 'Thao',
        templateId: 'modern',
      })

      const insertCall = supabaseMock._chain.insert.mock.calls[0][0]
      expect(insertCall.user_id).toBe('user-a') // from parameter
      expect(insertCall.status).toBe('draft') // always draft on create
      expect(result.id).toBe('inv-new')
    })

    it('returns the full created invitation in camelCase', async () => {
      const newRow = {
        id: 'inv-new',
        user_id: 'user-a',
        slug: null,
        status: 'draft',
        template_id: 'traditional',
        groom_name: 'Hung',
        bride_name: 'Mai',
        wedding_date: null,
        wedding_time: null,
        venue_name: '',
        venue_address: '',
        invitation_message: '',
        thank_you_text: '',
        view_count: 0,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        deleted_at: null,
      }
      const supabaseMock = makeSupabaseMock(newRow)
      supabaseMock._chain.insert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: newRow, error: null }),
        }),
      })
      const service = new InvitationsService({ client: supabaseMock } as any)

      const result = await service.create('user-a', {
        brideName: 'Mai',
        groomName: 'Hung',
        templateId: 'traditional',
      })

      expect(result.userId).toBe('user-a')
      expect(result.groomName).toBe('Hung')
      expect(result.brideName).toBe('Mai')
      expect(result.templateId).toBe('traditional')
      expect(result.status).toBe('draft')
      expect(result.createdAt).toBe('2026-01-01T00:00:00Z')
    })

    it('throws InternalServerErrorException on Supabase insert error', async () => {
      const supabaseMock = makeSupabaseMock(null, {
        message: 'Insert failed',
      })
      supabaseMock._chain.insert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
        }),
      })
      const service = new InvitationsService({ client: supabaseMock } as any)
      await expect(
        service.create('user-a', {
          brideName: 'Mai',
          groomName: 'Hung',
          templateId: 'modern',
        }),
      ).rejects.toThrow('Insert failed')
    })
  })
})
