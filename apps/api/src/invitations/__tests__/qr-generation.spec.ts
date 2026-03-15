import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InvitationsService } from '../invitations.service'

// Mock QRCode module (CJS: import * as QRCode => QRCode.toBuffer)
vi.mock('qrcode', () => ({
  toBuffer: vi.fn().mockResolvedValue(Buffer.from('fake-png-data')),
}))

/** Base mock row for a draft invitation (no slug yet) */
const draftRow = {
  id: 'inv-1',
  user_id: 'user-a',
  slug: null,
  status: 'draft',
  template_id: 'traditional',
  groom_name: 'Thao',
  bride_name: 'Minh',
  groom_father: '',
  groom_mother: '',
  groom_ceremony_date: '2026-12-25',
  groom_ceremony_time: '10:00',
  groom_venue_name: 'Grand Hotel',
  groom_venue_address: '123 Street',
  bride_father: '',
  bride_mother: '',
  bride_ceremony_date: null,
  bride_ceremony_time: null,
  bride_venue_name: '',
  bride_venue_address: '',
  love_story: [],
  venue_map_url: '',
  invitation_message: 'Welcome!',
  thank_you_text: 'Thanks!',
  photo_urls: [],
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

/** Row after first publish with slug assigned */
const publishedRowWithSlug = {
  ...draftRow,
  slug: 'minh-thao-a1b2',
  status: 'published',
}

/** Row after QR upload -- qr_code_url is set */
const publishedRowWithQr = {
  ...publishedRowWithSlug,
  qr_code_url: 'https://storage.example.com/storage/v1/object/public/qr-codes/inv-1/qr.png',
}

/** Row that already has slug (re-publish scenario) */
const existingSlugRow = {
  ...draftRow,
  slug: 'minh-thao-a1b2',
  status: 'draft', // was unpublished
}

const republishedRow = {
  ...existingSlugRow,
  status: 'published',
}

function buildStorageMock() {
  const uploadFn = vi.fn().mockResolvedValue({ error: null })
  const getPublicUrlFn = vi.fn().mockReturnValue({
    data: {
      publicUrl:
        'https://storage.example.com/storage/v1/object/public/qr-codes/inv-1/qr.png',
    },
  })

  return {
    from: vi.fn().mockReturnValue({
      upload: uploadFn,
      getPublicUrl: getPublicUrlFn,
    }),
    _upload: uploadFn,
    _getPublicUrl: getPublicUrlFn,
  }
}

function buildSupabaseMock(storageMock: ReturnType<typeof buildStorageMock>) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn(),
    update: vi.fn(),
  }

  return {
    from: vi.fn(() => chain),
    storage: storageMock,
    _chain: chain,
  }
}

function makeService(
  mock: ReturnType<typeof buildSupabaseMock>,
  siteUrl = 'https://wedding.example.com',
) {
  return new InvitationsService(
    { client: mock } as any,
    { get: vi.fn().mockReturnValue(siteUrl) } as any,
  )
}

describe('QR Code Generation', () => {
  // PUBL-02: QR code for invitation URL
  it('generates QR code PNG and uploads to Supabase Storage on first publish', async () => {
    const storageMock = buildStorageMock()
    const mock = buildSupabaseMock(storageMock)

    // findOne call: returns draft (no slug)
    mock._chain.single.mockResolvedValueOnce({ data: draftRow, error: null })

    // publish update call: returns published row with slug
    mock._chain.update.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: publishedRowWithSlug,
            error: null,
          }),
        }),
      }),
    })

    const service = makeService(mock)
    const result = await service.publish('user-a', 'inv-1')

    // Verify QR was uploaded to storage
    expect(storageMock.from).toHaveBeenCalledWith('qr-codes')
    expect(storageMock._upload).toHaveBeenCalledWith(
      'inv-1/qr.png',
      expect.any(Buffer),
      expect.objectContaining({
        contentType: 'image/png',
        upsert: true,
      }),
    )
  })

  it('uses SITE_URL env var to build QR code URL', async () => {
    const QRCode = await import('qrcode')
    const toBufferSpy = vi.spyOn(QRCode as any, 'toBuffer')

    const storageMock = buildStorageMock()
    const mock = buildSupabaseMock(storageMock)

    mock._chain.single.mockResolvedValueOnce({ data: draftRow, error: null })
    mock._chain.update.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: publishedRowWithSlug,
            error: null,
          }),
        }),
      }),
    })

    const service = makeService(mock, 'https://my-wedding.vn')
    await service.publish('user-a', 'inv-1')

    // The QR code URL should include SITE_URL/w/{slug}
    expect(toBufferSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://my-wedding.vn/w/'),
      expect.any(Object),
    )
  })

  it('does NOT regenerate QR if slug already exists on re-publish', async () => {
    const storageMock = buildStorageMock()
    const mock = buildSupabaseMock(storageMock)

    // findOne returns row with existing slug
    mock._chain.single.mockResolvedValueOnce({
      data: existingSlugRow,
      error: null,
    })

    // Re-publish just updates status
    mock._chain.update.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: republishedRow,
            error: null,
          }),
        }),
      }),
    })

    const service = makeService(mock)
    await service.publish('user-a', 'inv-1')

    // Storage should NOT be called — no QR generation on re-publish
    expect(storageMock._upload).not.toHaveBeenCalled()
  })

  it('saves qr_code_url to the invitation row after upload', async () => {
    const storageMock = buildStorageMock()
    const mock = buildSupabaseMock(storageMock)

    mock._chain.single.mockResolvedValueOnce({ data: draftRow, error: null })

    // Track the update calls to verify qr_code_url is stored
    const updateEqFn = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: publishedRowWithSlug,
          error: null,
        }),
      }),
    })

    mock._chain.update.mockReturnValue({ eq: updateEqFn })

    const service = makeService(mock)
    await service.publish('user-a', 'inv-1')

    // There should be at least one update call that sets qr_code_url
    const updateCalls = mock._chain.update.mock.calls
    const qrUpdateCall = updateCalls.find(
      (call: any[]) => call[0]?.qr_code_url !== undefined,
    )
    expect(qrUpdateCall).toBeDefined()
  })

  it('QR generation failure does NOT block publish', async () => {
    const storageMock = buildStorageMock()
    // Make upload fail
    storageMock._upload.mockResolvedValue({ error: { message: 'Upload failed' } })

    const mock = buildSupabaseMock(storageMock)

    mock._chain.single.mockResolvedValueOnce({ data: draftRow, error: null })

    const updateEqFn = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: publishedRowWithSlug,
          error: null,
        }),
      }),
    })
    mock._chain.update.mockReturnValue({ eq: updateEqFn })

    const service = makeService(mock)

    // Publish should succeed even though QR upload failed
    const result = await service.publish('user-a', 'inv-1')
    expect(result.status).toBe('published')
  })
})
