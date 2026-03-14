import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StatusBadge } from '@/components/app/StatusBadge'
import { InvitationCard } from '@/components/app/InvitationCard'
import type { Invitation } from '@repo/types'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
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
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    deletedAt: null,
    ...overrides,
  }
}

describe('StatusBadge', () => {
  it('renders "Nhap" with draft status', () => {
    render(<StatusBadge status="draft" />)
    const badge = screen.getByText('Nháp')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toMatch(/gray/)
  })

  it('renders "Da xuat ban" with published status', () => {
    render(<StatusBadge status="published" />)
    const badge = screen.getByText('Đã xuất bản')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toMatch(/green/)
  })

  it('renders "Het han" with expired status', () => {
    render(<StatusBadge status="expired" />)
    const badge = screen.getByText('Hết hạn')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toMatch(/red/)
  })
})

describe('InvitationCard', () => {
  it('renders bride and groom names', () => {
    render(<InvitationCard invitation={makeInvitation({ brideName: 'Minh', groomName: 'Thao' })} />)
    expect(screen.getByText(/Minh/)).toBeInTheDocument()
    expect(screen.getByText(/Thao/)).toBeInTheDocument()
  })

  it('renders "Chua co ngay" when wedding date is null', () => {
    render(<InvitationCard invitation={makeInvitation({ weddingDate: null })} />)
    expect(screen.getByText('Chưa có ngày')).toBeInTheDocument()
  })

  it('renders formatted date when wedding date is present', () => {
    render(<InvitationCard invitation={makeInvitation({ weddingDate: '2026-06-15T00:00:00Z' })} />)
    // Vietnamese date format: dd/mm/yyyy
    expect(screen.getByText('15/06/2026')).toBeInTheDocument()
  })

  it('renders an Edit button linking to /thep-cuoi/[id]', () => {
    render(<InvitationCard invitation={makeInvitation({ id: 'inv-123' })} />)
    const editLink = screen.getByText('Chỉnh sửa').closest('a')
    expect(editLink).toHaveAttribute('href', '/thep-cuoi/inv-123')
  })

  it('renders a disabled "Xem trang" button for draft invitations', () => {
    render(<InvitationCard invitation={makeInvitation({ status: 'draft', slug: null })} />)
    const viewBtn = screen.getByText('Xem trang').closest('button')
    expect(viewBtn).toBeDisabled()
  })

  it('renders an enabled "Xem trang" button for published invitations with slug', () => {
    render(<InvitationCard invitation={makeInvitation({ status: 'published', slug: 'minh-thao-abc' })} />)
    const viewBtn = screen.getByText('Xem trang').closest('button')
    expect(viewBtn).not.toBeDisabled()
  })

  it('does NOT render any QR code button', () => {
    render(<InvitationCard invitation={makeInvitation()} />)
    expect(screen.queryByText(/QR/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/qr/i)).not.toBeInTheDocument()
  })
})
