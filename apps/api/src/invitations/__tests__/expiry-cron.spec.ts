import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InvitationsService } from '../invitations.service'
import { ExpiryCronService } from '../expiry/expiry-cron.service'

/**
 * Build a Supabase admin mock with configurable query responses.
 * Supports chaining: from().select().eq().is() etc.
 */
function makeSupabaseMock() {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockReturnThis(),
  }
  return { from: vi.fn(() => chain), _chain: chain }
}

function makeConfigMock() {
  return { get: vi.fn().mockReturnValue(undefined) }
}

function makeService(mock: ReturnType<typeof makeSupabaseMock>) {
  return new InvitationsService(
    { client: mock } as any,
    makeConfigMock() as any,
  )
}

/** Helper to create a date string N days ago in YYYY-MM-DD format */
function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

/** Helper to create a date string N days in the future in YYYY-MM-DD format */
function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

describe('markExpired', () => {
  it('marks a published invitation as expired when ceremony date + 7 days has passed', async () => {
    const mock = makeSupabaseMock()

    // select() query returns one expired invitation
    const expiredInvitation = {
      id: 'inv-1',
      slug: 'test-slug',
      groom_ceremony_date: daysAgo(10), // 10 days ago, past 7-day grace
      bride_ceremony_date: null,
    }

    // First call: select published invitations
    // The chain goes: from().select().eq().is() -> resolves with data
    mock._chain.is = vi.fn().mockResolvedValueOnce({
      data: [expiredInvitation],
      error: null,
    }).mockReturnThis()

    // Update call: from().update().eq() -> resolves
    mock._chain.eq = vi.fn()
      .mockReturnThis() // for eq('status', 'published') in select chain
    // Override update to return a resolvable chain
    mock._chain.update = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    const service = makeService(mock)
    const count = await service.markExpired()

    expect(count).toBe(1)
    // Verify update was called with expired status
    expect(mock._chain.update).toHaveBeenCalledWith({ status: 'expired' })
  })

  it('does NOT expire a published invitation when ceremony date + 7 days has NOT passed', async () => {
    const mock = makeSupabaseMock()

    const recentInvitation = {
      id: 'inv-2',
      slug: 'recent-slug',
      groom_ceremony_date: daysAgo(3), // only 3 days ago, within grace period
      bride_ceremony_date: null,
    }

    mock._chain.is = vi.fn().mockResolvedValueOnce({
      data: [recentInvitation],
      error: null,
    }).mockReturnThis()

    const service = makeService(mock)
    const count = await service.markExpired()

    expect(count).toBe(0)
    // Update should NOT have been called
    expect(mock._chain.update).not.toHaveBeenCalled()
  })

  it('uses the LATER of groom/bride ceremony dates for dual-family invitations', async () => {
    const mock = makeSupabaseMock()

    // Groom date expired (10 days ago) but bride date is recent (3 days ago)
    // Should NOT expire since the later date hasn't passed grace period
    const dualInvitation = {
      id: 'inv-3',
      slug: 'dual-slug',
      groom_ceremony_date: daysAgo(10), // past grace
      bride_ceremony_date: daysAgo(3),  // within grace
    }

    mock._chain.is = vi.fn().mockResolvedValueOnce({
      data: [dualInvitation],
      error: null,
    }).mockReturnThis()

    const service = makeService(mock)
    const count = await service.markExpired()

    expect(count).toBe(0)
    expect(mock._chain.update).not.toHaveBeenCalled()
  })

  it('triggers revalidation for each expired slug', async () => {
    const mock = makeSupabaseMock()

    const expiredInvitation = {
      id: 'inv-4',
      slug: 'revalidate-slug',
      groom_ceremony_date: daysAgo(10),
      bride_ceremony_date: null,
    }

    mock._chain.is = vi.fn().mockResolvedValueOnce({
      data: [expiredInvitation],
      error: null,
    }).mockReturnThis()

    mock._chain.update = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })

    // Use config that returns revalidation secret so triggerRevalidation runs
    const configGet = vi.fn().mockImplementation((key: string) => {
      if (key === 'NEXT_PUBLIC_URL') return 'http://localhost:3000'
      if (key === 'REVALIDATION_SECRET') return 'test-secret'
      return undefined
    })

    // Mock global fetch for revalidation
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 200 }),
    )

    const service = new InvitationsService(
      { client: mock } as any,
      { get: configGet } as any,
    )
    const count = await service.markExpired()

    expect(count).toBe(1)
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:3000/api/revalidate',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ slug: 'revalidate-slug' }),
      }),
    )

    fetchSpy.mockRestore()
  })

  it('skips invitations with no ceremony dates', async () => {
    const mock = makeSupabaseMock()

    const noDatesInvitation = {
      id: 'inv-5',
      slug: 'no-dates-slug',
      groom_ceremony_date: null,
      bride_ceremony_date: null,
    }

    mock._chain.is = vi.fn().mockResolvedValueOnce({
      data: [noDatesInvitation],
      error: null,
    }).mockReturnThis()

    const service = makeService(mock)
    const count = await service.markExpired()

    expect(count).toBe(0)
    expect(mock._chain.update).not.toHaveBeenCalled()
  })

  it('returns 0 when no published invitations exist', async () => {
    const mock = makeSupabaseMock()

    mock._chain.is = vi.fn().mockResolvedValueOnce({
      data: [],
      error: null,
    }).mockReturnThis()

    const service = makeService(mock)
    const count = await service.markExpired()

    expect(count).toBe(0)
  })

  it('handles database errors gracefully and returns 0', async () => {
    const mock = makeSupabaseMock()

    mock._chain.is = vi.fn().mockResolvedValueOnce({
      data: null,
      error: { message: 'DB error' },
    }).mockReturnThis()

    const service = makeService(mock)
    const count = await service.markExpired()

    expect(count).toBe(0)
  })
})

describe('ExpiryCronService', () => {
  it('handleExpiry calls markExpired and logs the count', async () => {
    const mockInvitationsService = {
      markExpired: vi.fn().mockResolvedValue(3),
    }

    const cronService = new ExpiryCronService(
      mockInvitationsService as any,
    )

    await cronService.handleExpiry()

    expect(mockInvitationsService.markExpired).toHaveBeenCalledTimes(1)
  })

  it('handleExpiry works when no invitations are expired', async () => {
    const mockInvitationsService = {
      markExpired: vi.fn().mockResolvedValue(0),
    }

    const cronService = new ExpiryCronService(
      mockInvitationsService as any,
    )

    await cronService.handleExpiry()

    expect(mockInvitationsService.markExpired).toHaveBeenCalledTimes(1)
  })
})
