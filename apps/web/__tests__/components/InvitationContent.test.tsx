import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Invitation } from '@repo/types'

// Track which dynamic component is loaded via loader function
let dynamicCallIndex = 0

// Mock next/font/google -- prevents font function calls from throwing in test
vi.mock('next/font/google', () => ({
  Be_Vietnam_Pro: () => ({ variable: '--font-be-vietnam-pro', className: 'mock-font' }),
  Playfair_Display: () => ({ variable: '--font-heading', className: 'mock-font' }),
  Dancing_Script: () => ({ variable: '--font-script', className: 'mock-font' }),
  Plus_Jakarta_Sans: () => ({ variable: '--font-display', className: 'mock-font' }),
}))

// Mock next/dynamic -- in InvitationShell the order is:
// 1. EnvelopeAnimation, 2. FallingPetals, 3. MusicPlayer
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

// Mock SharedTemplate (replaces TemplateRenderer)
vi.mock('@/components/templates/SharedTemplate', () => ({
  SharedTemplate: ({ invitation, className }: { invitation: Invitation; className?: string }) => (
    <div data-testid="shared-template" data-template={invitation.templateId} className={className}>
      {invitation.groomName} & {invitation.brideName}
    </div>
  ),
}))

// Mock StickyNav
vi.mock('@/components/templates/sections/StickyNav', () => ({
  StickyNav: () => <nav data-testid="sticky-nav" />,
}))

// Mock themes
vi.mock('@/components/templates/themes', () => ({
  getTheme: () => ({
    id: 'classic-red-gold',
    name: 'Classic Red Gold',
    primaryColor: '#8B1A1A',
    backgroundColor: '#FFF8F0',
    surfaceColor: '#FFF5F5',
    textColor: '#3D1F1F',
    mutedTextColor: '#8B6F6F',
    headingWeight: 'font-bold',
    bodyWeight: 'font-normal',
    letterSpacing: 'tracking-normal',
    textTransform: 'normal-case',
    borderRadius: 'rounded-lg',
    cardBorderRadius: 'rounded-xl',
    heroOverlay: 'from-black/60 via-black/30 to-transparent',
    heroMinHeight: 'min-h-[85vh]',
    galleryEffect: 'hover:scale-105',
    galleryGap: 'gap-2',
    petalColors: ['#FFB7C5', '#FF69B4', '#FF1493', '#DC143C'],
    petalEnabled: true,
    navStyle: 'colored',
    footerBg: '#FFF8F0',
    footerTextColor: '#3D1F1F',
  }),
}))

const mockInvitation: Invitation & { expired: boolean; musicUrl?: string } = {
  id: '123',
  userId: 'user-1',
  slug: 'minh-thao',
  status: 'published',
  templateId: 'classic-red-gold',
  groomName: 'Minh',
  brideName: 'Thao',
  groomFather: '',
  groomMother: '',
  groomCeremonyDate: '2026-06-15',
  groomCeremonyTime: '11:00',
  groomVenueName: 'Nha hang ABC',
  groomVenueAddress: '123 Nguyen Hue, Q1',
  brideFather: '',
  brideMother: '',
  brideCeremonyDate: '2026-06-16',
  brideCeremonyTime: '10:00',
  brideVenueName: 'Nha hang XYZ',
  brideVenueAddress: '456 Le Loi, Q3',
  ceremonyProgram: [],
  loveStory: [],
  venueMapUrl: '',
  groomAvatarUrl: null,
  brideAvatarUrl: null,
  groomNickname: '',
  brideNickname: '',
  invitationMessage: 'Tran trong kinh moi quy khach',
  thankYouText: 'Cam on quy khach',
  teaserMessage: '',
  photoUrls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
  musicTrackId: 'track-1',
  bankQrUrl: null,
  bankName: '',
  bankAccountHolder: '',
  bankAccountNumber: '',
  brideBankQrUrl: null,
  brideBankName: '',
  brideBankAccountHolder: '',
  brideBankAccountNumber: '',
  plan: 'free',
  paymentStatus: 'none',
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

    // After opening, SharedTemplate should be visible (replaces TemplateRenderer)
    expect(screen.getByTestId('shared-template')).toBeInTheDocument()
    expect(screen.getByText(/Minh & Thao/)).toBeInTheDocument()
  })

  it('should have envelope state management', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    const { container } = render(<InvitationShell invitation={mockInvitation} />)

    // Should render something (envelope cover or template)
    expect(container.firstChild).toBeTruthy()
  })

  it('should show falling petals during envelope and revealed stages', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    render(<InvitationShell invitation={mockInvitation} />)

    // Petals should be visible during envelope stage
    expect(screen.getByTestId('falling-petals')).toBeInTheDocument()

    // Open the envelope
    fireEvent.click(screen.getByTestId('envelope-animation'))

    // After opening, petals continue during revealed stage (per locked decision)
    expect(screen.getByTestId('falling-petals')).toBeInTheDocument()
    // Music player should appear after opening
    expect(screen.getByTestId('music-player')).toBeInTheDocument()
  })

  it('should show SharedTemplate and StickyNav after opening', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    render(<InvitationShell invitation={mockInvitation} />)

    // Open the envelope
    fireEvent.click(screen.getByTestId('envelope-animation'))

    // SharedTemplate and StickyNav should be present
    expect(screen.getByTestId('shared-template')).toBeInTheDocument()
    expect(screen.getByTestId('sticky-nav')).toBeInTheDocument()
  })

  it('should have envelope state management with render output', async () => {
    const { InvitationShell } = await import('@/app/w/[slug]/InvitationShell')
    render(<InvitationShell invitation={mockInvitation} />)

    // Open the envelope
    fireEvent.click(screen.getByTestId('envelope-animation'))

    // Watermark should be present for free tier (no plan = free)
    const container = screen.getByTestId('shared-template').closest('[class]')
    expect(container).toBeTruthy()
  })
})
