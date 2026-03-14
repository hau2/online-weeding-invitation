export type InvitationStatus = 'draft' | 'published' | 'expired'
export type TemplateId = 'traditional' | 'modern' | 'minimalist'

export interface Invitation {
  id: string
  userId: string
  slug: string | null
  status: InvitationStatus
  templateId: TemplateId
  groomName: string
  brideName: string
  weddingDate: string | null
  weddingTime: string | null
  venueName: string
  venueAddress: string
  invitationMessage: string
  thankYouText: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
