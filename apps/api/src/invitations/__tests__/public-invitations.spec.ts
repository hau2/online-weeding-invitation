import { describe, it } from 'vitest'

describe('Public Invitations API', () => {
  describe('GET /invitations/public/:slug', () => {
    // PUBL-01: Public access by slug
    it.todo('should return published invitation by slug without authentication')
    it.todo('should return 404 for non-existent slug')
    it.todo('should return 404 for unpublished/draft invitation slug')

    // PUBL-11: Expiration & grace period
    it.todo('should return expired state with thank-you content after grace period')
    it.todo('should return normal invitation during grace period')

    // PUBL-06: Invitation content
    it.todo('should include music track URL when musicTrackId is set')
  })
})
