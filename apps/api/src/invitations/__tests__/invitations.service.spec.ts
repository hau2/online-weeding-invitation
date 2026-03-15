import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotFoundException } from '@nestjs/common'
import { InvitationsService } from '../invitations.service'

function makeSupabaseMock(returnData: any, error: any = null) {
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

/** Standard mock row representing a draft invitation */
const baseMockRow = {
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

/**
 * Creates a service with both supabaseUser and supabaseAdmin mocks.
 * The userMock is used for reads (findOne, list), the adminMock for slug writes.
 */
function makeService(
  userMock: ReturnType<typeof makeSupabaseMock>,
  adminMock?: ReturnType<typeof makeSupabaseMock>,
) {
  return new InvitationsService(
    { client: userMock } as any,
    { client: adminMock ?? makeSupabaseMock(null) } as any,
  )
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
      const service = makeService(supabaseMock)

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
      const service = makeService(supabaseMock)
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
      const service = makeService(supabaseMock)

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
      const service = makeService(supabaseMock)
      await service.listByUser('user-a')
      expect(supabaseMock._chain.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      })
    })

    it('throws InternalServerErrorException on Supabase error', async () => {
      const supabaseMock = makeSupabaseMock(null, {
        message: 'DB connection failed',
      })
      const service = makeService(supabaseMock)
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
      const service = makeService(supabaseMock)

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
      const service = makeService(supabaseMock)

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
      const service = makeService(supabaseMock)
      await expect(
        service.create('user-a', {
          brideName: 'Mai',
          groomName: 'Hung',
          templateId: 'modern',
        }),
      ).rejects.toThrow('Insert failed')
    })
  })

  describe('findOne', () => {
    it('returns mapped invitation for owner', async () => {
      const userMock = makeSupabaseMock(null)
      // findOne uses select().eq(id).eq(user_id).is(deleted_at).single()
      userMock._chain.single = vi
        .fn()
        .mockResolvedValue({ data: baseMockRow, error: null })
      const service = makeService(userMock)

      const result = await service.findOne('user-a', 'inv-1')

      expect(userMock.from).toHaveBeenCalledWith('invitations')
      expect(userMock._chain.eq).toHaveBeenCalledWith('id', 'inv-1')
      expect(userMock._chain.eq).toHaveBeenCalledWith('user_id', 'user-a')
      expect(userMock._chain.is).toHaveBeenCalledWith('deleted_at', null)
      expect(result.id).toBe('inv-1')
      expect(result.groomName).toBe('Thao')
      expect(result.brideName).toBe('Minh')
    })

    it('throws NotFoundException when invitation does not exist', async () => {
      const userMock = makeSupabaseMock(null)
      userMock._chain.single = vi
        .fn()
        .mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } })
      const service = makeService(userMock)

      await expect(service.findOne('user-a', 'inv-missing')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('throws NotFoundException when user is not the owner', async () => {
      const userMock = makeSupabaseMock(null)
      userMock._chain.single = vi
        .fn()
        .mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } })
      const service = makeService(userMock)

      await expect(
        service.findOne('user-other', 'inv-1'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('partial update works and maps camelCase to snake_case', async () => {
      const updatedRow = {
        ...baseMockRow,
        venue_name: 'Grand Hotel',
        venue_address: '123 Le Loi',
        updated_at: '2026-01-02T00:00:00Z',
      }
      const userMock = makeSupabaseMock(null)
      // findOne path: select->eq->eq->is->single
      userMock._chain.single = vi
        .fn()
        .mockResolvedValueOnce({ data: baseMockRow, error: null }) // findOne
        .mockResolvedValueOnce({ data: updatedRow, error: null }) // update
      userMock._chain.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
          }),
        }),
      })
      const service = makeService(userMock)

      const result = await service.update('user-a', 'inv-1', {
        venueName: 'Grand Hotel',
        venueAddress: '123 Le Loi',
      })

      expect(result.venueName).toBe('Grand Hotel')
      expect(result.venueAddress).toBe('123 Le Loi')
    })

    it('returns full mapped result after partial update', async () => {
      const updatedRow = {
        ...baseMockRow,
        groom_name: 'Duc',
        updated_at: '2026-01-02T00:00:00Z',
      }
      const userMock = makeSupabaseMock(null)
      userMock._chain.single = vi
        .fn()
        .mockResolvedValueOnce({ data: baseMockRow, error: null })
      userMock._chain.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
          }),
        }),
      })
      const service = makeService(userMock)

      const result = await service.update('user-a', 'inv-1', {
        groomName: 'Duc',
      })

      expect(result.groomName).toBe('Duc')
      expect(result.id).toBe('inv-1')
      expect(result.brideName).toBe('Minh')
    })

    it('throws NotFoundException for non-owner', async () => {
      const userMock = makeSupabaseMock(null)
      userMock._chain.single = vi
        .fn()
        .mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'not found' } })
      const service = makeService(userMock)

      await expect(
        service.update('user-other', 'inv-1', { groomName: 'Hacker' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('publish', () => {
    it('generates slug on first publish and sets status to published', async () => {
      const publishedRow = {
        ...baseMockRow,
        slug: 'minh-thao-a1b2',
        status: 'published',
      }
      const userMock = makeSupabaseMock(null)
      userMock._chain.single = vi
        .fn()
        .mockResolvedValueOnce({ data: baseMockRow, error: null }) // findOne

      const adminMock = makeSupabaseMock(null)
      adminMock._chain.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: publishedRow, error: null }),
          }),
        }),
      })
      const service = makeService(userMock, adminMock)

      const result = await service.publish('user-a', 'inv-1')

      expect(result.status).toBe('published')
      expect(result.slug).toBeTruthy()
      expect(typeof result.slug).toBe('string')
    })

    it('preserves existing slug on re-publish', async () => {
      const existingRow = {
        ...baseMockRow,
        slug: 'minh-thao-a1b2',
        status: 'draft', // was unpublished
      }
      const republishedRow = {
        ...existingRow,
        status: 'published',
      }
      const userMock = makeSupabaseMock(null)
      userMock._chain.single = vi
        .fn()
        .mockResolvedValueOnce({ data: existingRow, error: null }) // findOne
      userMock._chain.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: republishedRow, error: null }),
          }),
        }),
      })
      const service = makeService(userMock)

      const result = await service.publish('user-a', 'inv-1')

      expect(result.status).toBe('published')
      expect(result.slug).toBe('minh-thao-a1b2') // unchanged
    })

    it('sets status to published', async () => {
      const publishedRow = {
        ...baseMockRow,
        slug: 'minh-thao-xyz1',
        status: 'published',
      }
      const userMock = makeSupabaseMock(null)
      userMock._chain.single = vi
        .fn()
        .mockResolvedValueOnce({ data: baseMockRow, error: null })

      const adminMock = makeSupabaseMock(null)
      adminMock._chain.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: publishedRow, error: null }),
          }),
        }),
      })
      const service = makeService(userMock, adminMock)

      const result = await service.publish('user-a', 'inv-1')
      expect(result.status).toBe('published')
    })
  })

  describe('unpublish', () => {
    it('sets status to draft and preserves slug', async () => {
      const publishedRow = {
        ...baseMockRow,
        slug: 'minh-thao-a1b2',
        status: 'published',
      }
      const unpublishedRow = {
        ...publishedRow,
        status: 'draft',
      }
      const userMock = makeSupabaseMock(null)
      userMock._chain.single = vi
        .fn()
        .mockResolvedValueOnce({ data: publishedRow, error: null }) // findOne
      userMock._chain.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: unpublishedRow, error: null }),
          }),
        }),
      })
      const service = makeService(userMock)

      const result = await service.unpublish('user-a', 'inv-1')

      expect(result.status).toBe('draft')
      expect(result.slug).toBe('minh-thao-a1b2') // slug preserved
    })

    it('no-op on already draft invitation', async () => {
      const draftRow = { ...baseMockRow, status: 'draft', slug: 'minh-thao-a1b2' }
      const userMock = makeSupabaseMock(null)
      userMock._chain.single = vi
        .fn()
        .mockResolvedValueOnce({ data: draftRow, error: null }) // findOne
      userMock._chain.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: draftRow, error: null }),
          }),
        }),
      })
      const service = makeService(userMock)

      const result = await service.unpublish('user-a', 'inv-1')

      expect(result.status).toBe('draft')
      expect(result.slug).toBe('minh-thao-a1b2')
    })
  })

  describe('slug immutability', () => {
    it('publish on invitation with existing slug does not overwrite it', async () => {
      const existingSlug = 'original-slug-x1y2'
      const rowWithSlug = {
        ...baseMockRow,
        slug: existingSlug,
        status: 'draft',
      }
      const republished = {
        ...rowWithSlug,
        status: 'published',
      }
      const userMock = makeSupabaseMock(null)
      userMock._chain.single = vi
        .fn()
        .mockResolvedValueOnce({ data: rowWithSlug, error: null }) // findOne

      // When slug already exists, update goes through user client (not admin)
      userMock._chain.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: republished, error: null }),
          }),
        }),
      })

      const adminMock = makeSupabaseMock(null)
      const service = makeService(userMock, adminMock)

      const result = await service.publish('user-a', 'inv-1')

      expect(result.slug).toBe(existingSlug) // slug NOT changed
      expect(result.status).toBe('published')
      // admin client should NOT have been used for update since slug already exists
      expect(adminMock.from).not.toHaveBeenCalled()
    })
  })

  describe('uploadPhotos', () => {
    it.todo('uploads files to Supabase Storage and appends URLs to photo_urls')
    it.todo('enforces 10-photo maximum including existing photos')
    it.todo('throws NotFoundException for non-owner')
    it.todo('processes each file through processImage before upload')
  })

  describe('deletePhoto', () => {
    it.todo('removes photo URL at given index from photo_urls array')
    it.todo('removes file from Supabase Storage')
    it.todo('throws BadRequestException for out-of-bounds index')
    it.todo('throws NotFoundException for non-owner')
  })

  describe('uploadBankQr', () => {
    it.todo('uploads QR image and sets bank_qr_url on invitation')
    it.todo('deletes old QR file when replacing with new one')
    it.todo('throws NotFoundException for non-owner')
  })

  describe('updatePhotoOrder', () => {
    it.todo('updates photo_urls array with new order')
    it.todo('validates all URLs are existing Supabase Storage URLs')
    it.todo('throws NotFoundException for non-owner')
  })

  describe('listMusicTracks', () => {
    it.todo('returns active tracks ordered by sort_order')
    it.todo('maps snake_case columns to camelCase SystemMusicTrack')
  })
})
