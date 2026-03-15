import { describe, it } from 'vitest'

describe('QR Code Generation', () => {
  // PUBL-02: QR code for invitation URL
  it.todo('should generate QR code PNG buffer for invitation URL')
  it.todo('should upload QR to Supabase Storage')
  it.todo('should not regenerate QR if slug already exists on re-publish')
  it.todo('should use SITE_URL env var for QR URL')
})
