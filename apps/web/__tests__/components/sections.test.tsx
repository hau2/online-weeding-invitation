import { describe, it } from 'vitest'

describe('HeroSection', () => {
  it.todo('renders first photo as background image')
  it.todo('shows couple names with heart separator')
  it.todo('displays parent names for both families')
  it.todo('shows Save The Date label and ceremony title')
  it.todo('renders CTA buttons')
  it.todo('shows fallback when no photos exist')
})

describe('CountdownSection', () => {
  it.todo('renders 4 card-box time units (Ngay, Gio, Phut, Giay)')
  it.todo('applies theme border-radius to cards')
  it.todo('uses theme primary color for numbers')
  it.todo('returns null when ceremony date is in the past')
})

describe('GallerySection', () => {
  it.todo('renders 2x3 grid of photos')
  it.todo('uses next/image with fill and object-cover')
  it.todo('applies theme gallery effect (grayscale for B&W)')
  it.todo('returns null when no photos exist')
})

describe('BankQrSection', () => {
  it.todo('renders groom-side bank QR card')
  it.todo('renders bride-side bank QR card')
  it.todo('applies BankQrLock for free tier')
  it.todo('shows account number with copy button')
  it.todo('returns null when no bank QR URLs exist')
})

describe('StickyNav', () => {
  it.todo('renders with hidden md:flex for desktop-only display')
  it.todo('contains section anchor links')
  it.todo('has backdrop-blur-md class')
  it.todo('applies theme nav style (colored vs mono)')
})

describe('VenueSection', () => {
  it.todo('renders venue info with map placeholder')
  it.todo('shows Chi duong button linking to venueMapUrl')
  it.todo('handles missing venue data gracefully')
})

describe('FooterSection', () => {
  it.todo('shows couple names and thank-you text')
  it.todo('applies theme footer background')
  it.todo('uses theme footer text color')
})

describe('TimelineSection', () => {
  it.todo('renders love story milestones in timeline format')
  it.todo('returns null when loveStory is empty')
})
