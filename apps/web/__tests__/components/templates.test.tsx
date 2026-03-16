import { describe, it } from 'vitest'

describe('SharedTemplate (via TemplateRenderer)', () => {
  it.todo('renders SharedTemplate with correct theme for modern-red')
  it.todo('renders SharedTemplate with correct theme for minimalist-bw')
  it.todo('renders SharedTemplate with correct theme for legacy templateId traditional')
  it.todo('falls back to modern-red theme for unknown templateId')
})

describe('SharedTemplate sections', () => {
  it.todo('renders hero section with couple names')
  it.todo('renders photo gallery when photoUrls is non-empty')
  it.todo('renders no gallery section when photoUrls is empty')
  it.todo('renders bank QR section when bankQrUrl exists')
  it.todo('renders no bank QR section when bankQrUrl is null')
  it.todo('renders love story timeline when loveStory has milestones')
  it.todo('renders venue section when venue data exists')
  it.todo('renders footer with couple names')
})
