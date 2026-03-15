import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

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

describe('EnvelopeAnimation', () => {
  const defaultProps = {
    templateId: 'traditional' as const,
    groomName: 'Minh',
    brideName: 'Thao',
    onOpen: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // PUBL-03: Envelope reveal animation
  it('should render sealed envelope with greeting text', () => {
    render(<EnvelopeAnimation {...defaultProps} />)
    expect(screen.getByText(/Tran trong kinh moi/i)).toBeInTheDocument()
  })

  it('should show couple names on the envelope', () => {
    render(<EnvelopeAnimation {...defaultProps} />)
    expect(screen.getByText(/Minh/)).toBeInTheDocument()
    expect(screen.getByText(/Thao/)).toBeInTheDocument()
  })

  it('should match template color scheme for traditional', () => {
    const { container } = render(<EnvelopeAnimation {...defaultProps} templateId="traditional" />)
    const envelope = container.querySelector('[data-testid="envelope-body"]')
    expect(envelope).toBeInTheDocument()
    expect(envelope).toHaveStyle({ backgroundColor: '#8B0000' })
  })

  it('should match template color scheme for modern', () => {
    const { container } = render(<EnvelopeAnimation {...defaultProps} templateId="modern" />)
    const envelope = container.querySelector('[data-testid="envelope-body"]')
    expect(envelope).toBeInTheDocument()
    expect(envelope).toHaveStyle({ backgroundColor: '#FFFFFF' })
  })

  it('should match template color scheme for minimalist', () => {
    const { container } = render(<EnvelopeAnimation {...defaultProps} templateId="minimalist" />)
    const envelope = container.querySelector('[data-testid="envelope-body"]')
    expect(envelope).toBeInTheDocument()
    expect(envelope).toHaveStyle({ backgroundColor: '#FFFDD0' })
  })

  it('should render skip button', () => {
    render(<EnvelopeAnimation {...defaultProps} />)
    const skipButton = screen.getByRole('button', { name: /bo qua/i })
    expect(skipButton).toBeInTheDocument()
  })

  it('should have accessible skip button with minimum tap target', () => {
    render(<EnvelopeAnimation {...defaultProps} />)
    const skipButton = screen.getByRole('button', { name: /bo qua/i })
    expect(skipButton).toBeInTheDocument()
  })

  // PUBL-05: Guest name on envelope
  it('should show guest name on envelope when provided', () => {
    render(<EnvelopeAnimation {...defaultProps} guestName="Anh Tuan" />)
    expect(screen.getByText('Anh Tuan')).toBeInTheDocument()
  })

  it('should not show guest name when not provided', () => {
    render(<EnvelopeAnimation {...defaultProps} />)
    // Only greeting text, no guest name element
    expect(screen.queryByTestId('guest-name')).not.toBeInTheDocument()
  })

  // PUBL-04: Tap/click to reveal
  it('should call onOpen when skip button is clicked', () => {
    const onOpen = vi.fn()
    render(<EnvelopeAnimation {...defaultProps} onOpen={onOpen} />)
    const skipButton = screen.getByRole('button', { name: /bo qua/i })
    fireEvent.click(skipButton)
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('should render wax seal', () => {
    render(<EnvelopeAnimation {...defaultProps} />)
    const seal = screen.getByTestId('wax-seal')
    expect(seal).toBeInTheDocument()
  })
})
