export interface AdminStats {
  totalUsers: number
  totalInvitations: number
  publishedInvitations: number
  premiumInvitations: number
  storageEstimateMb: number
  revenueTotal: number
  chartData: { date: string; count: number }[]
}

export interface AdminUser {
  id: string
  email: string
  role: string
  tier: string
  isLocked: boolean
  invitationCount: number
  subscriptionStart: string | null
  subscriptionEnd: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminInvitation {
  id: string
  userId: string
  userEmail: string
  slug: string | null
  status: string
  templateId: string
  groomName: string
  brideName: string
  plan: string
  paymentStatus: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

export interface SystemSettings {
  paymentConfig: {
    bankQrUrl: string | null
    bankName: string
    bankAccountHolder: string
    pricePerInvitation: number
  }
  watermarkConfig: {
    text: string
    opacity: number
  }
  expiryConfig: {
    gracePeriodDays: number
  }
  uploadLimits: {
    maxPhotoSizeMb: number
    maxPhotosPerInvitation: number
    maxPhotosPremium: number
  }
}

export interface AdminMusicTrack {
  id: string
  title: string
  artist: string
  url: string
  duration: number
  isActive: boolean
  usageCount: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ThemeInfo {
  id: string
  name: string
  tag: string
  thumbnail: string | null
  isActive: boolean
}

export interface CustomTheme {
  id: string
  slug: string
  name: string
  baseTheme: string
  config: Record<string, unknown>  // ThemeConfig stored as JSONB
  backgroundImageUrl: string | null
  thumbnailUrl: string | null
  status: 'draft' | 'published' | 'disabled'
  createdAt: string
  updatedAt: string
}

export interface CustomThemeListItem {
  id: string
  slug: string
  name: string
  baseTheme: string
  status: 'draft' | 'published' | 'disabled'
  backgroundImageUrl: string | null
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string
}
