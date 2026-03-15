'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiUpload } from '@/lib/api'
import type { Invitation } from '@repo/types'

interface BankQrUploadProps {
  invitationId: string
  bankQrUrl: string | null
  bankName: string
  bankAccountHolder: string
  onChange: (changes: Partial<Invitation>) => void
}

export function BankQrUpload({
  invitationId,
  bankQrUrl,
  bankName,
  bankAccountHolder,
  onChange,
}: BankQrUploadProps) {
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
        `/invitations/${invitationId}/bank-qr`,
        formData,
      )

      setIsUploading(false)

      if (error) {
        toast.error(error)
        return
      }

      if (data) {
        onChange({ bankQrUrl: data.bankQrUrl })
      }

      // Reset input
      e.target.value = ''
    },
    [invitationId, onChange],
  )

  return (
    <div className="space-y-4">
      {/* QR Upload zone */}
      <div className="flex flex-col items-center">
        {bankQrUrl ? (
          <div className="space-y-2 flex flex-col items-center">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={bankQrUrl}
                alt="QR ngan hang"
                fill
                className="object-contain"
                sizes="192px"
              />
            </div>
            <button
              type="button"
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Dang tai len...' : 'Thay doi'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="w-full py-8 border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-lg flex flex-col items-center justify-center text-rose-400 hover:text-rose-600 transition-colors disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="size-8 animate-spin" />
            ) : (
              <>
                <Upload className="size-8 mb-2" />
                <span className="text-sm font-medium">
                  Tai anh QR ngan hang len
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Bank info fields */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-rose-700 text-xs">Ten ngan hang</Label>
          <Input
            placeholder="VD: Vietcombank, MB Bank..."
            className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
            value={bankName}
            onChange={(e) => onChange({ bankName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-rose-700 text-xs">Chu tai khoan</Label>
          <Input
            placeholder="VD: NGUYEN VAN A"
            className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
            value={bankAccountHolder}
            onChange={(e) => onChange({ bankAccountHolder: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
