import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { InvitationGrid } from '@/components/app/InvitationGrid'
import type { Invitation } from '@repo/types'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { variants, initial, animate, ...rest } = props
      return <div {...rest}>{children}</div>
    },
  },
}))

function makeInvitation(overrides: Partial<Invitation> = {}): Invitation {
  return {
    id: 'inv-001',
    userId: 'user-001',
    slug: null,
    status: 'draft',
    templateId: 'traditional',
    groomName: 'Thao',
    brideName: 'Minh',
    weddingDate: null,
    weddingTime: null,
    venueName: '',
    venueAddress: '',
    invitationMessage: '',
    thankYouText: '',
    photoUrls: [],
    musicTrackId: null,
    bankQrUrl: null,
    bankName: '',
    bankAccountHolder: '',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    deletedAt: null,
    ...overrides,
  }
}

describe('InvitationGrid', () => {
  it('renders 3 InvitationCard elements when given 3 invitations', () => {
    const invitations = [
      makeInvitation({ id: 'inv-1', brideName: 'Minh', groomName: 'Thao' }),
      makeInvitation({ id: 'inv-2', brideName: 'Lan', groomName: 'Tuan' }),
      makeInvitation({ id: 'inv-3', brideName: 'Hoa', groomName: 'Duc' }),
    ]

    render(<InvitationGrid invitations={invitations} />)

    expect(screen.getByText(/Minh/)).toBeInTheDocument()
    expect(screen.getByText(/Lan/)).toBeInTheDocument()
    expect(screen.getByText(/Hoa/)).toBeInTheDocument()
  })

  it('renders EmptyState when invitations is empty', () => {
    render(<InvitationGrid invitations={[]} />)

    expect(screen.getByText('Tạo thiệp cưới đầu tiên của bạn')).toBeInTheDocument()
  })

  it('calls onCreateClick from EmptyState when CTA is clicked', () => {
    const handleCreate = vi.fn()
    render(<InvitationGrid invitations={[]} onCreateClick={handleCreate} />)

    screen.getByText('Tạo thiệp cưới đầu tiên của bạn').click()
    expect(handleCreate).toHaveBeenCalledOnce()
  })
})
