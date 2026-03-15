import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// Mock howler
const mockPlay = vi.fn()
const mockPause = vi.fn()
const mockUnload = vi.fn()
const mockPlaying = vi.fn().mockReturnValue(false)
let onPlayCallback: (() => void) | null = null
let onPauseCallback: (() => void) | null = null

const MockHowl = vi.fn().mockImplementation(() => ({
  play: mockPlay,
  pause: mockPause,
  unload: mockUnload,
  playing: mockPlaying,
  on: vi.fn((event: string, cb: () => void) => {
    if (event === 'play') onPlayCallback = cb
    if (event === 'pause') onPauseCallback = cb
  }),
}))

vi.mock('howler', () => ({
  Howl: MockHowl,
  Howler: { ctx: { resume: vi.fn() } },
}))

import { MusicPlayer } from '@/app/w/[slug]/MusicPlayer'

describe('MusicPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    onPlayCallback = null
    onPauseCallback = null
  })

  it('should render floating play/pause button', () => {
    render(<MusicPlayer musicUrl="https://example.com/song.mp3" />)
    const button = screen.getByRole('button', { name: /phat nhac/i })
    expect(button).toBeInTheDocument()
  })

  it('should not autoplay on mount when autoStart is false', () => {
    render(<MusicPlayer musicUrl="https://example.com/song.mp3" autoStart={false} />)
    expect(MockHowl).not.toHaveBeenCalled()
    expect(mockPlay).not.toHaveBeenCalled()
  })

  it('should show play icon when paused', () => {
    render(<MusicPlayer musicUrl="https://example.com/song.mp3" />)
    // Play icon (SVG from lucide-react) should be visible
    const button = screen.getByRole('button', { name: /phat nhac/i })
    expect(button).toBeInTheDocument()
    // Should not have equalizer bars initially
    expect(screen.queryByTestId('equalizer-bars')).not.toBeInTheDocument()
  })

  it('should toggle play/pause on click', async () => {
    render(<MusicPlayer musicUrl="https://example.com/song.mp3" />)
    const button = screen.getByRole('button', { name: /phat nhac/i })

    // First click should initialize and play
    await act(async () => {
      fireEvent.click(button)
    })
    expect(MockHowl).toHaveBeenCalled()
    expect(mockPlay).toHaveBeenCalled()
  })

  it('should change aria-label based on play state', async () => {
    render(<MusicPlayer musicUrl="https://example.com/song.mp3" />)

    // Initially shows "Phat nhac"
    expect(screen.getByRole('button', { name: /phat nhac/i })).toBeInTheDocument()

    // Click to play
    const button = screen.getByRole('button', { name: /phat nhac/i })
    await act(async () => {
      fireEvent.click(button)
    })

    // Simulate howler calling onplay
    await act(async () => {
      onPlayCallback?.()
    })

    // Now should show "Tam dung nhac"
    expect(screen.getByRole('button', { name: /tam dung nhac/i })).toBeInTheDocument()
  })

  it('should render null when no musicUrl', () => {
    const { container } = render(<MusicPlayer musicUrl="" />)
    expect(container.firstChild).toBeNull()
  })
})
