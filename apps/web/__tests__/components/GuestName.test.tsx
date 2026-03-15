import { describe, it, expect } from 'vitest'
import { parseGuestName } from '@/app/w/[slug]/utils'

describe('parseGuestName', () => {
  it('should extract guest name from ?to= param', () => {
    const params = new URLSearchParams('to=Nguyen Van A')
    expect(parseGuestName(params)).toBe('Nguyen Van A')
  })

  it('should return null when no ?to= param', () => {
    const params = new URLSearchParams('')
    expect(parseGuestName(params)).toBeNull()
  })

  it('should truncate name at 50 characters', () => {
    const longName = 'A'.repeat(60)
    const params = new URLSearchParams(`to=${longName}`)
    expect(parseGuestName(params)).toBe('A'.repeat(50))
  })

  it('should strip HTML tags from name', () => {
    const params = new URLSearchParams('to=<script>alert("xss")</script>Nguyen')
    expect(parseGuestName(params)).toBe('alert("xss")Nguyen')
  })

  it('should trim whitespace', () => {
    const params = new URLSearchParams('to=  Nguyen Van A  ')
    expect(parseGuestName(params)).toBe('Nguyen Van A')
  })

  it('should return null if name is empty after sanitization', () => {
    const params = new URLSearchParams('to=<script></script>')
    expect(parseGuestName(params)).toBeNull()
  })
})
