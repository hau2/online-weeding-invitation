'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'
import { apiUpload } from '@/lib/api'
import type { Invitation } from '@repo/types'

interface AvatarUploadProps {
  invitationId: string
  avatarUrl: string | null
  label: string
  endpoint: 'groom-avatar' | 'bride-avatar'
  onUploaded: (url: string) => void
}

export function AvatarUpload({
  invitationId,
  avatarUrl,
  label,
  endpoint,
  onUploaded,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const { data, error } = await apiUpload<Invitation>(
        `/invitations/${invitationId}/${endpoint}`,
        formData,
      )

      setIsUploading(false)

      if (error) {
        toast.error(error)
        return
      }

      if (data) {
        const url =
          endpoint === 'groom-avatar'
            ? data.groomAvatarUrl
            : data.brideAvatarUrl
        if (url) onUploaded(url)
      }

      e.target.value = ''
    },
    [invitationId, endpoint, onUploaded],
  )

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 group cursor-pointer"
      >
        {avatarUrl ? (
          <>
            <img
              src={avatarUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isUploading ? (
                <Camera className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {isUploading ? (
              <Camera className="w-6 h-6 text-gray-400 animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-gray-400" />
            )}
          </div>
        )}
      </button>

      <span className="text-xs text-gray-500">{label}</span>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}
