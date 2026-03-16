import { describe, it, expect } from 'vitest'
import { existsSync } from 'fs'
import { join } from 'path'

describe('FullPreviewDialog', () => {
  it('has been replaced by dedicated preview page route', () => {
    const oldPath = join(
      __dirname,
      '../../app/(app)/thep-cuoi/[id]/FullPreviewDialog.tsx',
    )
    expect(existsSync(oldPath)).toBe(false)
  })

  it('preview page.tsx exists as replacement', () => {
    const newPath = join(
      __dirname,
      '../../app/(app)/thep-cuoi/[id]/preview/page.tsx',
    )
    expect(existsSync(newPath)).toBe(true)
  })

  it('PreviewShell.tsx exists as replacement', () => {
    const shellPath = join(
      __dirname,
      '../../app/(app)/thep-cuoi/[id]/preview/PreviewShell.tsx',
    )
    expect(existsSync(shellPath)).toBe(true)
  })
})
