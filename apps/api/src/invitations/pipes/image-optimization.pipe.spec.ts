import { describe, it } from 'vitest'

describe('processImage (image optimization)', () => {
  // EDIT-05a: Valid image processing
  it.todo('converts a valid JPEG buffer to WebP format')
  it.todo('resizes image to max 1200px width without enlargement')
  it.todo('produces WebP output at quality 75')
  it.todo('auto-rotates from EXIF metadata via sharp resize')

  // EDIT-05b: Magic-byte validation
  it.todo('accepts JPEG magic bytes (FF D8 FF)')
  it.todo('accepts PNG magic bytes (89 50 4E 47)')
  it.todo('accepts WebP magic bytes (52 49 46 46)')
  it.todo('rejects PDF file disguised with .jpg extension')
  it.todo('rejects empty buffer')
  it.todo('throws BadRequestException with Vietnamese message for invalid format')
})
