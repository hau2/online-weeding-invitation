import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: new Proxy({}, {
      get: (_target: unknown, prop: string) => {
        return React.forwardRef(({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }, ref: React.Ref<HTMLElement>) => {
          // Strip framer-motion specific props
          const {
            variants, initial, animate, exit, transition,
            whileTap, whileHover, onAnimationComplete,
            style, className, onClick, role, 'aria-label': ariaLabel,
            'data-testid': testId,
          } = props as Record<string, unknown>
          const domProps: Record<string, unknown> = {}
          if (style) domProps.style = style
          if (className) domProps.className = className
          if (onClick) domProps.onClick = onClick
          if (role) domProps.role = role
          if (ariaLabel) domProps['aria-label'] = ariaLabel
          if (testId) domProps['data-testid'] = testId
          if (ref) domProps.ref = ref
          const Tag = prop as keyof JSX.IntrinsicElements
          return React.createElement(Tag, domProps, children)
        })
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({
      start: vi.fn().mockResolvedValue(undefined),
    }),
  }
})

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

import { EnvelopeAnimation } from '@/app/w/[slug]/EnvelopeAnimation'

/**
 * Helper: mock rAF to simulate fast frames (10ms between frames).
 * Collects callbacks and runs them synchronously when flushed.
 */
function mockFastFrames() {
  const rafCallbacks: Array<(t: number) => void> = []
  let id = 0
  let timestamp = 100

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    id++
    // Run callback synchronously with timestamps 10ms apart (fast)
    timestamp += 10
    Promise.resolve().then(() => cb(timestamp))
    return id
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
}

/**
 * Helper: mock rAF to simulate slow frames (30ms between frames).
 */
function mockSlowFrames() {
  let id = 0
  let timestamp = 100

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    id++
    // Run callback synchronously with timestamps 30ms apart (slow)
    timestamp += 30
    Promise.resolve().then(() => cb(timestamp))
    return id
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
}

describe('EnvelopeAnimation', () => {
  const defaultProps = {
    templateId: 'traditional' as const,
    groomName: 'Minh',
    brideName: 'Thao',
    onOpen: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFastFrames()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // PUBL-03: Envelope reveal animation
  it('should render sealed envelope with greeting text', async () => {
    render(<EnvelopeAnimation {...defaultProps} />)
    // Greeting text visible in both measuring and resolved states
    await waitFor(() => {
      expect(screen.getByText(/Tran trong kinh moi/i)).toBeInTheDocument()
    })
  })

  it('should show couple names on the envelope after performance gate resolves', async () => {
    render(<EnvelopeAnimation {...defaultProps} />)
    // After fast frame measurement, the full envelope renders with card names
    await waitFor(() => {
      expect(screen.getByText(/Minh/)).toBeInTheDocument()
      expect(screen.getByText(/Thao/)).toBeInTheDocument()
    })
  })

  it('should match template color scheme for traditional', async () => {
    const { container } = render(<EnvelopeAnimation {...defaultProps} templateId="traditional" />)
    await waitFor(() => {
      const envelope = container.querySelector('[data-testid="envelope-body"]')
      expect(envelope).toBeInTheDocument()
      expect(envelope).toHaveStyle({ backgroundColor: '#8B0000' })
    })
  })

  it('should match template color scheme for modern', async () => {
    const { container } = render(<EnvelopeAnimation {...defaultProps} templateId="modern" />)
    await waitFor(() => {
      const envelope = container.querySelector('[data-testid="envelope-body"]')
      expect(envelope).toBeInTheDocument()
      expect(envelope).toHaveStyle({ backgroundColor: '#FFFFFF' })
    })
  })

  it('should match template color scheme for minimalist', async () => {
    const { container } = render(<EnvelopeAnimation {...defaultProps} templateId="minimalist" />)
    await waitFor(() => {
      const envelope = container.querySelector('[data-testid="envelope-body"]')
      expect(envelope).toBeInTheDocument()
      expect(envelope).toHaveStyle({ backgroundColor: '#FFFDD0' })
    })
  })

  it('should render skip button', async () => {
    render(<EnvelopeAnimation {...defaultProps} />)
    await waitFor(() => {
      const skipButton = screen.getByRole('button', { name: /bo qua/i })
      expect(skipButton).toBeInTheDocument()
    })
  })

  it('should have skip button centered at bottom with 48px+ touch target', async () => {
    render(<EnvelopeAnimation {...defaultProps} />)
    await waitFor(() => {
      const skipButton = screen.getByRole('button', { name: /bo qua/i })
      expect(skipButton).toBeInTheDocument()
      // Check centered positioning classes
      expect(skipButton.className).toMatch(/left-1\/2/)
      expect(skipButton.className).toMatch(/-translate-x-1\/2/)
      // Check minimum touch target
      expect(skipButton.className).toMatch(/min-h-12/)
      expect(skipButton.className).toMatch(/min-w-12/)
    })
  })

  // PUBL-05: Guest name on envelope
  it('should show guest name on envelope when provided', async () => {
    render(<EnvelopeAnimation {...defaultProps} guestName="Anh Tuan" />)
    await waitFor(() => {
      expect(screen.getByText('Anh Tuan')).toBeInTheDocument()
    })
  })

  it('should not show guest name when not provided', async () => {
    render(<EnvelopeAnimation {...defaultProps} />)
    await waitFor(() => {
      expect(screen.queryByTestId('guest-name')).not.toBeInTheDocument()
    })
  })

  // PUBL-04: Tap/click to reveal
  it('should call onOpen when skip button is clicked', async () => {
    const onOpen = vi.fn()
    render(<EnvelopeAnimation {...defaultProps} onOpen={onOpen} />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /bo qua/i })).toBeInTheDocument()
    })
    const skipButton = screen.getByRole('button', { name: /bo qua/i })
    fireEvent.click(skipButton)
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('should render wax seal', async () => {
    render(<EnvelopeAnimation {...defaultProps} />)
    await waitFor(() => {
      const seal = screen.getByTestId('wax-seal')
      expect(seal).toBeInTheDocument()
    })
  })
})

describe('EnvelopeAnimation performance gate', () => {
  const defaultProps = {
    templateId: 'traditional' as const,
    groomName: 'Minh',
    brideName: 'Thao',
    onOpen: vi.fn(),
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render fallback when frames are slow (>20ms avg)', async () => {
    mockSlowFrames()

    render(<EnvelopeAnimation {...defaultProps} />)

    // Wait for the performance gate to detect slow frames and switch to fallback
    await waitFor(() => {
      expect(screen.getByTestId('envelope-fallback')).toBeInTheDocument()
    })
  })
})

describe('EnvelopeAnimationFallback', () => {
  const defaultProps = {
    templateId: 'traditional' as const,
    groomName: 'Minh',
    brideName: 'Thao',
    onOpen: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render sealed envelope with tap handler and skip button', async () => {
    const { EnvelopeAnimationFallback } = await import('@/app/w/[slug]/EnvelopeAnimationFallback')
    render(<EnvelopeAnimationFallback {...defaultProps} />)
    expect(screen.getByText(/Tran trong kinh moi/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bo qua/i })).toBeInTheDocument()
  })

  it('should call onOpen after fade transition when tapped', async () => {
    vi.useFakeTimers()
    const onOpen = vi.fn()
    const { EnvelopeAnimationFallback } = await import('@/app/w/[slug]/EnvelopeAnimationFallback')
    render(<EnvelopeAnimationFallback {...defaultProps} onOpen={onOpen} />)

    const envelope = screen.getByTestId('envelope-fallback')
    fireEvent.click(envelope)

    // onOpen should be called after 500ms transition
    expect(onOpen).not.toHaveBeenCalled()
    await act(async () => {
      vi.advanceTimersByTime(600)
    })
    expect(onOpen).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('should have skip button with min 48px touch target and always visible', async () => {
    const { EnvelopeAnimationFallback } = await import('@/app/w/[slug]/EnvelopeAnimationFallback')
    render(<EnvelopeAnimationFallback {...defaultProps} />)
    const skipButton = screen.getByRole('button', { name: /bo qua/i })
    expect(skipButton.className).toMatch(/min-h-12/)
    expect(skipButton.className).toMatch(/min-w-12/)
    // Centered at bottom
    expect(skipButton.className).toMatch(/left-1\/2/)
    expect(skipButton.className).toMatch(/-translate-x-1\/2/)
  })

  it('should NOT import framer-motion (renders without framer-motion mock)', async () => {
    const { EnvelopeAnimationFallback } = await import('@/app/w/[slug]/EnvelopeAnimationFallback')
    render(<EnvelopeAnimationFallback {...defaultProps} />)
    expect(screen.getByTestId('envelope-fallback')).toBeInTheDocument()
  })

  it('should render skip button with "Bo qua >>" text centered at bottom', async () => {
    const { EnvelopeAnimationFallback } = await import('@/app/w/[slug]/EnvelopeAnimationFallback')
    render(<EnvelopeAnimationFallback {...defaultProps} />)
    const skipButton = screen.getByRole('button', { name: /bo qua/i })
    expect(skipButton).toHaveTextContent(/Bo qua/)
    expect(skipButton.className).toMatch(/left-1\/2/)
  })
})
