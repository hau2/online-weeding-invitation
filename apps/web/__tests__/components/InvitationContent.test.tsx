import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Invitation } from '@repo/types'

// Track which dynamic component is loaded via loader function
let dynamicCallIndex = 0

// Mock next/dynamic -- in InvitationShell the order is:
// 1. EnvelopeAnimation, 2. FallingPetals, 3. MusicPlayer, 4. CountdownTimer
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (_loader: () => Promise<any>, _opts?: any) => {
    const idx = dynamicCallIndex++
    const MockComponent = (props: any) => {
      switch (idx) {
        case 0: // EnvelopeAnimation
          return (
            <div data-testid="envelope-animation" onClick={props.onOpen}>
              <span>{props.groomName} & {props.brideName}</span>
              {props.guestName && <span>{props.guestName}</span>}
            </div>
          )
        case 1: // FallingPetals
          return props.enabled ? <div data-testid="falling-petals" /> : null
        case 2: // MusicPlayer
          return <div data-testid="music-player" />
        case 3: // CountdownTimer
          return <div data-testid="countdown-timer" />
        default:
          return <div data-testid="dynamic-unknown" />
      }
    }
    MockComponent.displayName = `DynamicMock_${idx}`
    return MockComponent
  },
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, transition, ...rest } = props
      return <div {...rest}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn() }),
}))

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
  beforeEach(() => {
    // Reset the dynamic call index before each test
    dynamicCallIndex = 0
  })

  it('should render envelope with couple names when not opened', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    render(<InvitationShell invitation={mockInvitation} />)

    // Initially envelope is closed, should show the cover with names
    expect(screen.getByText(/Minh/)).toBeInTheDocument()
    expect(screen.getByText(/Thao/)).toBeInTheDocument()
  })

  it('should display template content after opening envelope', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    render(<InvitationShell invitation={mockInvitation} />)

    // Click the envelope to open
    const envelope = screen.getByTestId('envelope-animation')
    fireEvent.click(envelope)

    // After opening, template renderer should be visible
    expect(screen.getByTestId('template-renderer')).toBeInTheDocument()
    expect(screen.getByText(/Minh & Thao/)).toBeInTheDocument()
  })

  it('should have envelope state management', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    const { container } = render(<InvitationShell invitation={mockInvitation} />)

    // Should render something (envelope cover or template)
    expect(container.firstChild).toBeTruthy()
  })

  it('should show falling petals and music player after opening', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    render(<InvitationShell invitation={mockInvitation} />)

    // Open the envelope
    fireEvent.click(screen.getByTestId('envelope-animation'))

    // After opening, petals and music player should appear
    expect(screen.getByTestId('falling-petals')).toBeInTheDocument()
    expect(screen.getByTestId('music-player')).toBeInTheDocument()
  })

  it('should show countdown timer when wedding date exists', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    render(<InvitationShell invitation={mockInvitation} />)

    // Open the envelope
    fireEvent.click(screen.getByTestId('envelope-animation'))

    // Countdown timer should be present
    expect(screen.getByTestId('countdown-timer')).toBeInTheDocument()
  })

  it('should show footer watermark after opening', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    render(<InvitationShell invitation={mockInvitation} />)

    // Open the envelope
    fireEvent.click(screen.getByTestId('envelope-animation'))

    // Footer watermark should be present
    expect(screen.getByText(/ThiepCuoiOnline.vn/)).toBeInTheDocument()
  })
})
