import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Invitation } from '@repo/types'

// Mock next/font/google -- prevents font function calls from throwing in test
vi.mock('next/font/google', () => ({
  Be_Vietnam_Pro: () => ({ variable: '--font-be-vietnam-pro', className: 'mock-font' }),
  Playfair_Display: () => ({ variable: '--font-heading', className: 'mock-font' }),
  Dancing_Script: () => ({ variable: '--font-script', className: 'mock-font' }),
  Plus_Jakarta_Sans: () => ({ variable: '--font-display', className: 'mock-font' }),
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
  status: 'expired',
  templateId: 'traditional',
  groomName: 'Minh',
  brideName: 'Thao',
  weddingDate: '2026-06-15',
  weddingTime: '11:00',
  venueName: 'Nha hang ABC',
  venueAddress: '123 Nguyen Hue, Q1',
  venueMapUrl: '',
  invitationMessage: 'Tran trong kinh moi quy khach',
  thankYouText: 'Xin cam on tat ca moi nguoi da den chung vui cung chung toi.',
  photoUrls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
  musicTrackId: 'track-1',
  bankQrUrl: 'https://example.com/bank-qr.png',
  bankName: 'Vietcombank',
  bankAccountHolder: 'Nguyen Van Minh',
  brideBankQrUrl: null,
  brideBankName: '',
  brideBankAccountHolder: '',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
  qrCodeUrl: null,
  expired: true,
  musicUrl: 'https://example.com/music.mp3',
} as any

describe('ThankYouPage', () => {
  it('should display couple names as heading', async () => {
    const { ThankYouPage } = await import('@/app/w/[slug]/ThankYouPage')
    render(<ThankYouPage invitation={mockInvitation} />)

    expect(screen.getByText(/Minh/)).toBeInTheDocument()
    expect(screen.getByText(/Thao/)).toBeInTheDocument()
  })

  it('should display thankYouText from invitation', async () => {
    const { ThankYouPage } = await import('@/app/w/[slug]/ThankYouPage')
    render(<ThankYouPage invitation={mockInvitation} />)

    expect(
      screen.getByText(/Xin cam on tat ca moi nguoi da den chung vui cung chung toi/)
    ).toBeInTheDocument()
  })

  it('should display default thank-you text when thankYouText is empty', async () => {
    const { ThankYouPage } = await import('@/app/w/[slug]/ThankYouPage')
    const invitationNoText = { ...mockInvitation, thankYouText: '' }
    render(<ThankYouPage invitation={invitationNoText} />)

    expect(
      screen.getByText(/Xin chan thanh cam on quy khach da den chung vui cung chung toi/)
    ).toBeInTheDocument()
  })

  it('should render first photo when available', async () => {
    const { ThankYouPage } = await import('@/app/w/[slug]/ThankYouPage')
    render(<ThankYouPage invitation={mockInvitation} />)

    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', expect.stringContaining('photo1'))
  })

  it('should not render photo when photoUrls is empty', async () => {
    const { ThankYouPage } = await import('@/app/w/[slug]/ThankYouPage')
    const invitationNoPhotos = { ...mockInvitation, photoUrls: [] }
    render(<ThankYouPage invitation={invitationNoPhotos} />)

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('should not render bank QR code', async () => {
    const { ThankYouPage } = await import('@/app/w/[slug]/ThankYouPage')
    render(<ThankYouPage invitation={mockInvitation} />)

    // Bank QR URL is set on the invitation but should not be displayed
    expect(screen.queryByText(/Vietcombank/)).not.toBeInTheDocument()
    expect(screen.queryByAltText(/QR/i)).not.toBeInTheDocument()
  })

  it('should not render countdown timer', async () => {
    const { ThankYouPage } = await import('@/app/w/[slug]/ThankYouPage')
    render(<ThankYouPage invitation={mockInvitation} />)

    // No countdown elements
    expect(screen.queryByText(/Ngay/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Gio/)).not.toBeInTheDocument()
  })
})
