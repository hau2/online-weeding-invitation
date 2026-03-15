import { describe, it, expect, vi } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { InvitationsService } from '../invitations.service'

/**
 * Build a chainable Supabase mock that supports
 * from('invitations') and from('system_music_tracks') queries.
 */
function buildSupabaseChain(returnData: any, error: any = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: returnData, error }),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: returnData, error }),
    update: vi.fn().mockReturnThis(),
  }
  return { from: vi.fn(() => chain), _chain: chain }
}

/** Standard published invitation row */
const publishedRow = {
  id: 'inv-1',
  user_id: 'user-a',
  slug: 'minh-thao-a1b2',
  status: 'published',
  template_id: 'traditional',
  groom_name: 'Thao',
  bride_name: 'Minh',
  wedding_date: '2026-12-25',
  wedding_time: '10:00',
  venue_name: 'Grand Hotel',
  venue_address: '123 Street',
  venue_map_url: '',
  invitation_message: 'Welcome!',
  thank_you_text: 'Thank you for coming!',
  photo_urls: ['photo1.jpg'],
  music_track_id: null,
  bank_qr_url: null,
  bank_name: '',
  bank_account_holder: '',
  bride_bank_qr_url: null,
  bride_bank_name: '',
  bride_bank_account_holder: '',
  qr_code_url: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  deleted_at: null,
}

function makeService(mock: ReturnType<typeof buildSupabaseChain>) {
  return new InvitationsService(
    { client: mock } as any,
    { get: vi.fn().mockReturnValue('http://localhost:3000') } as any,
  )
}

describe('Public Invitations API', () => {
  describe('GET /invitations/public/:slug', () => {
    // PUBL-01: Public access by slug
    it('returns published invitation by slug without authentication', async () => {
      const mock = buildSupabaseChain(null)
      mock._chain.single = vi
        .fn()
        .mockResolvedValue({ data: publishedRow, error: null })
      const service = makeService(mock)

      const result = await service.findBySlug('minh-thao-a1b2')

      expect(mock.from).toHaveBeenCalledWith('invitations')
      expect(mock._chain.eq).toHaveBeenCalledWith('slug', 'minh-thao-a1b2')
      expect(mock._chain.eq).toHaveBeenCalledWith('status', 'published')
      expect(mock._chain.is).toHaveBeenCalledWith('deleted_at', null)
      expect(result.groomName).toBe('Thao')
      expect(result.brideName).toBe('Minh')
      expect(result.slug).toBe('minh-thao-a1b2')
      expect(result.expired).toBe(false)
    })

    it('returns 404 for non-existent slug', async () => {
      const mock = buildSupabaseChain(null)
      mock._chain.single = vi
        .fn()
        .mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } })
      const service = makeService(mock)

      await expect(service.findBySlug('nonexistent-slug')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('returns 404 for unpublished/draft invitation slug', async () => {
      const mock = buildSupabaseChain(null)
      // Query filters by status='published', so draft returns nothing
      mock._chain.single = vi
        .fn()
        .mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } })
      const service = makeService(mock)

      await expect(service.findBySlug('draft-slug-1234')).rejects.toThrow(
        NotFoundException,
      )
    })

    // PUBL-11: Expiration & grace period
    it('returns expired state with thank-you content after grace period', async () => {
      // Wedding was 10 days ago — past 7-day grace period
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 10)
      const expiredRow = {
        ...publishedRow,
        wedding_date: pastDate.toISOString().split('T')[0],
      }
      const mock = buildSupabaseChain(null)
      mock._chain.single = vi
        .fn()
        .mockResolvedValue({ data: expiredRow, error: null })
      const service = makeService(mock)

      const result = await service.findBySlug('minh-thao-a1b2')

      expect(result.expired).toBe(true)
      expect(result.thankYouText).toBe('Thank you for coming!')
    })

    it('returns normal invitation during grace period', async () => {
      // Wedding was 3 days ago — within 7-day grace period
      const recentDate = new Date()
      recentDate.setDate(recentDate.getDate() - 3)
      const recentRow = {
        ...publishedRow,
        wedding_date: recentDate.toISOString().split('T')[0],
      }
      const mock = buildSupabaseChain(null)
      mock._chain.single = vi
        .fn()
        .mockResolvedValue({ data: recentRow, error: null })
      const service = makeService(mock)

      const result = await service.findBySlug('minh-thao-a1b2')

      expect(result.expired).toBe(false)
    })

    it('returns expired: false when wedding is in the future', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      const futureRow = {
        ...publishedRow,
        wedding_date: futureDate.toISOString().split('T')[0],
      }
      const mock = buildSupabaseChain(null)
      mock._chain.single = vi
        .fn()
        .mockResolvedValue({ data: futureRow, error: null })
      const service = makeService(mock)

      const result = await service.findBySlug('minh-thao-a1b2')

      expect(result.expired).toBe(false)
    })

    it('returns expired: false when no wedding date is set', async () => {
      const noDateRow = {
        ...publishedRow,
        wedding_date: null,
      }
      const mock = buildSupabaseChain(null)
      mock._chain.single = vi
        .fn()
        .mockResolvedValue({ data: noDateRow, error: null })
      const service = makeService(mock)

      const result = await service.findBySlug('minh-thao-a1b2')

      expect(result.expired).toBe(false)
    })

    // PUBL-06: Invitation content
    it('includes music track URL when musicTrackId is set', async () => {
      const rowWithMusic = {
        ...publishedRow,
        music_track_id: 'track-1',
      }
      const trackRow = {
        id: 'track-1',
        title: 'Love Song',
        artist: 'Artist',
        url: 'https://storage.example.com/music/love-song.mp3',
        duration: 180,
        is_active: true,
        sort_order: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }

      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        single: vi.fn(),
        update: vi.fn().mockReturnThis(),
      }

      let callCount = 0
      chain.single.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: rowWithMusic, error: null })
        }
        return Promise.resolve({ data: trackRow, error: null })
      })

      const mock = { from: vi.fn(() => chain), _chain: chain }
      const service = makeService(mock)

      const result = await service.findBySlug('minh-thao-a1b2')

      expect(result.musicUrl).toBe('https://storage.example.com/music/love-song.mp3')
    })

    it('includes qrCodeUrl when stored in the row', async () => {
      const rowWithQr = {
        ...publishedRow,
        qr_code_url: 'https://storage.example.com/qr-codes/inv-1/qr.png',
      }
      const mock = buildSupabaseChain(null)
      mock._chain.single = vi
        .fn()
        .mockResolvedValue({ data: rowWithQr, error: null })
      const service = makeService(mock)

      const result = await service.findBySlug('minh-thao-a1b2')

      expect(result.qrCodeUrl).toBe('https://storage.example.com/qr-codes/inv-1/qr.png')
    })
  })
})
