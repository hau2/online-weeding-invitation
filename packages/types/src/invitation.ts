export type InvitationStatus = 'draft' | 'published' | 'expired'
export type TemplateId = 'traditional' | 'modern' | 'minimalist'

export interface LoveStoryMilestone {
  date: string
  title: string
  description: string
}

export interface Invitation {
  id: string
  userId: string
  slug: string | null
  status: InvitationStatus
  templateId: TemplateId
  groomName: string
  brideName: string
  groomFather: string
  groomMother: string
  groomCeremonyDate: string | null
  groomCeremonyTime: string | null
  groomVenueName: string
  groomVenueAddress: string
  brideFather: string
  brideMother: string
  brideCeremonyDate: string | null
  brideCeremonyTime: string | null
  brideVenueName: string
  brideVenueAddress: string
  loveStory: LoveStoryMilestone[]
  venueMapUrl: string
  invitationMessage: string
  thankYouText: string
  photoUrls: string[]
  musicTrackId: string | null
  bankQrUrl: string | null
  bankName: string
  bankAccountHolder: string
  brideBankQrUrl: string | null
  brideBankName: string
  brideBankAccountHolder: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  qrCodeUrl?: string | null
}
