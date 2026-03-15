import { describe, it } from 'vitest'

describe('BankQrUpload', () => {
  // EDIT-07a: Upload
  it.todo('renders upload zone when no bankQrUrl exists')
  it.todo('renders QR preview image when bankQrUrl exists')
  it.todo('calls apiUpload with FormData on file select')
  it.todo('calls onChange with bankQrUrl on successful upload')

  // EDIT-07b: Bank fields
  it.todo('renders "Ten ngan hang" input with current bankName value')
  it.todo('renders "Chu tai khoan" input with current bankAccountHolder value')
  it.todo('calls onChange with bankName on bank name input change')
  it.todo('calls onChange with bankAccountHolder on account holder input change')
})
