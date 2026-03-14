import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CreateWizard } from '@/components/app/CreateWizard'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

describe('CreateWizard', () => {
  it('shows template options on step 1', () => {
    render(<CreateWizard open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText('Truy\u1ec1n th\u1ed1ng')).toBeInTheDocument()
    expect(screen.getByText('Hi\u1ec7n \u0111\u1ea1i')).toBeInTheDocument()
    expect(screen.getByText('T\u1ed1i gi\u1ea3n')).toBeInTheDocument()
  })

  it('"Ti\u1ebfp theo" is disabled until template is selected', () => {
    render(<CreateWizard open={true} onOpenChange={vi.fn()} />)
    const nextBtn = screen.getByRole('button', { name: 'Ti\u1ebfp theo' })
    expect(nextBtn).toBeDisabled()
  })

  it('advances to step 2 after template selection', () => {
    render(<CreateWizard open={true} onOpenChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Truy\u1ec1n th\u1ed1ng'))
    fireEvent.click(screen.getByRole('button', { name: 'Ti\u1ebfp theo' }))
    expect(screen.getByText('T\u00ean c\u00f4 d\u00e2u')).toBeInTheDocument()
    expect(screen.getByText('T\u00ean ch\u00fa r\u1ec3')).toBeInTheDocument()
  })

  it('"T\u1ea1o thi\u1ec7p" is disabled until both names are filled', () => {
    render(<CreateWizard open={true} onOpenChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Truy\u1ec1n th\u1ed1ng'))
    fireEvent.click(screen.getByRole('button', { name: 'Ti\u1ebfp theo' }))
    const createBtn = screen.getByRole('button', { name: 'T\u1ea1o thi\u1ec7p' })
    expect(createBtn).toBeDisabled()
  })
})
