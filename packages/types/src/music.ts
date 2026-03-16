export interface SystemMusicTrack {
  id: string
  title: string
  artist: string
  url: string
  duration: number
  isActive: boolean
  usageCount?: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}
