import { describe, it } from 'vitest'

describe('Template components', () => {
  describe('TemplateTraditional', () => {
    it.todo('renders bride and groom names')
    it.todo('shows placeholder text for empty fields')
  })
  describe('TemplateModern', () => {
    it.todo('renders bride and groom names')
    it.todo('shows placeholder text for empty fields')
  })
  describe('TemplateMinimalist', () => {
    it.todo('renders bride and groom names')
    it.todo('shows placeholder text for empty fields')
  })
  describe('TemplateRenderer', () => {
    it.todo('renders the correct template for templateId')
    it.todo('falls back to Traditional for unknown templateId')
  })
})

describe('Template photo gallery and bank QR rendering', () => {
  describe('TemplateTraditional', () => {
    it.todo('renders photo gallery section when photoUrls is non-empty')
    it.todo('renders no photo section when photoUrls is empty')
    it.todo('renders "Mung cuoi" bank QR section when bankQrUrl exists')
    it.todo('renders no bank QR section when bankQrUrl is null')
    it.todo('displays bankName and bankAccountHolder below QR image')
  })

  describe('TemplateModern', () => {
    it.todo('renders photo gallery section when photoUrls is non-empty')
    it.todo('renders no photo section when photoUrls is empty')
    it.todo('renders "Mung cuoi" bank QR section when bankQrUrl exists')
    it.todo('renders no bank QR section when bankQrUrl is null')
    it.todo('displays bankName and bankAccountHolder below QR image')
  })

  describe('TemplateMinimalist', () => {
    it.todo('renders photo gallery section when photoUrls is non-empty')
    it.todo('renders no photo section when photoUrls is empty')
    it.todo('renders "Mung cuoi" bank QR section when bankQrUrl exists')
    it.todo('renders no bank QR section when bankQrUrl is null')
    it.todo('displays bankName and bankAccountHolder below QR image')
  })
})
