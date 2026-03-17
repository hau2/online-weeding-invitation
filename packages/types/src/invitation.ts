export type InvitationStatus = 'draft' | 'published' | 'save_the_date' | 'expired'
// Widened to string to support custom theme slugs (e.g. "hoa-hong-do-a3f1").
// Built-in theme IDs: 'traditional', 'modern', 'minimalist',
// 'modern-red', 'soft-pink', 'brown-gold', 'olive-green', 'minimalist-bw', 'classic-red-gold'
export type TemplateId = string
export type InvitationPlan = 'free' | 'premium'
export type PaymentStatus = 'none' | 'pending' | 'rejected' | 'refunded'

export interface LoveStoryMilestone {
  date: string
  title: string
  description: string
}

export interface CeremonyProgramEvent {
  time: string
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
  ceremonyProgram: CeremonyProgramEvent[]
  loveStory: LoveStoryMilestone[]
  venueMapUrl: string
  groomAvatarUrl: string | null
  brideAvatarUrl: string | null
  groomNickname: string
  brideNickname: string
  invitationMessage: string
  thankYouText: string
  teaserMessage: string
  photoUrls: string[]
  musicTrackId: string | null
  bankQrUrl: string | null
  bankName: string
  bankAccountHolder: string
  bankAccountNumber: string
  brideBankQrUrl: string | null
  brideBankName: string
  brideBankAccountHolder: string
  brideBankAccountNumber: string
  plan: InvitationPlan
  paymentStatus: PaymentStatus
  createdAt: string
  updatedAt: string
  adminNotes?: string
  isDisabled?: boolean
  deletedAt: string | null
  qrCodeUrl?: string | null
}
