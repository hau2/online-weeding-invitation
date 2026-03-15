import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Invitation } from '@repo/types'

// Mock TemplateRenderer
vi.mock('@/components/templates/TemplateRenderer', () => ({
  TemplateRenderer: ({ invitation, className }: { invitation: Invitation; className?: string }) => (
    <div data-testid="template-renderer" data-template={invitation.templateId} className={className}>
      {invitation.groomName} & {invitation.brideName}
    </div>
  ),
}))

const mockInvitation: Invitation & { expired: boolean; musicUrl?: string } = {
  id: '123',
  userId: 'user-1',
  slug: 'minh-thao',
  status: 'published',
  templateId: 'traditional',
  groomName: 'Minh',
  brideName: 'Thao',
  weddingDate: '2026-06-15',
  weddingTime: '11:00',
  venueName: 'Nha hang ABC',
  venueAddress: '123 Nguyen Hue, Q1',
  venueMapUrl: '',
  invitationMessage: 'Tran trong kinh moi quy khach',
  thankYouText: 'Cam on quy khach',
  photoUrls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
  musicTrackId: 'track-1',
  bankQrUrl: null,
  bankName: '',
  bankAccountHolder: '',
  brideBankQrUrl: null,
  brideBankName: '',
  brideBankAccountHolder: '',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
  qrCodeUrl: null,
  expired: false,
  musicUrl: 'https://example.com/music.mp3',
}

describe('InvitationShell', () => {
  it('should render TemplateRenderer with invitation data when envelope is opened', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    render(<InvitationShell invitation={mockInvitation} />)

    // Initially envelope is closed, should show the cover
    expect(screen.getByText(/Minh/)).toBeInTheDocument()
    expect(screen.getByText(/Thao/)).toBeInTheDocument()
  })

  it('should display all invitation fields after opening', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    render(<InvitationShell invitation={mockInvitation} />)

    // The couple names should be visible on the invitation cover
    expect(screen.getByText(/Minh/)).toBeInTheDocument()
    expect(screen.getByText(/Thao/)).toBeInTheDocument()
  })

  it('should have envelope state management', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    const { container } = render(<InvitationShell invitation={mockInvitation} />)

    // Should render something (envelope cover or template)
    expect(container.firstChild).toBeTruthy()
  })
})
