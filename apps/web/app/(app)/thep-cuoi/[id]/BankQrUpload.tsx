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
  bankAccountNumber: string
  brideBankQrUrl: string | null
  brideBankName: string
  brideBankAccountHolder: string
  brideBankAccountNumber: string
  onChange: (changes: Partial<Invitation>) => void
}

function QrSide({
  label,
  invitationId,
  endpoint,
  qrUrl,
  qrUrlKey,
  bankNameValue,
  bankNameKey,
  bankAccountValue,
  bankAccountKey,
  bankAccountNumberValue,
  bankAccountNumberKey,
  onChange,
}: {
  label: string
  invitationId: string
  endpoint: string
  qrUrl: string | null
  qrUrlKey: keyof Invitation
  bankNameValue: string
  bankNameKey: keyof Invitation
  bankAccountValue: string
  bankAccountKey: keyof Invitation
  bankAccountNumberValue: string
  bankAccountNumberKey: keyof Invitation
  onChange: (changes: Partial<Invitation>) => void
}) {
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
        onChange({ [qrUrlKey]: data[qrUrlKey] } as Partial<Invitation>)
      }

      e.target.value = ''
    },
    [invitationId, endpoint, qrUrlKey, onChange],
  )

  return (
    <div className="flex-1 space-y-3">
      <p className="text-xs font-semibold text-rose-800 text-center">{label}</p>

      <div className="flex flex-col items-center">
        {qrUrl ? (
          <div className="space-y-2 flex flex-col items-center">
            <div className="relative w-36 h-36 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={qrUrl}
                alt={`QR ${label}`}
                fill
                className="object-contain"
                sizes="144px"
              />
            </div>
            <button
              type="button"
              className="text-xs text-rose-600 hover:text-rose-700 font-medium"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? 'Dang tai len...' : 'Thay doi'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="w-full py-6 border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-lg flex flex-col items-center justify-center text-rose-400 hover:text-rose-600 transition-colors disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="size-6 animate-spin" />
            ) : (
              <>
                <Upload className="size-6 mb-1" />
                <span className="text-xs font-medium">Tai anh QR</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="space-y-2">
        <div className="space-y-1">
          <Label className="text-rose-700 text-xs">Ngan hang</Label>
          <Input
            placeholder="VD: Vietcombank"
            className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200 text-sm h-8"
            value={bankNameValue}
            onChange={(e) => onChange({ [bankNameKey]: e.target.value } as Partial<Invitation>)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-rose-700 text-xs">Chu tai khoan</Label>
          <Input
            placeholder="VD: NGUYEN VAN A"
            className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200 text-sm h-8"
            value={bankAccountValue}
            onChange={(e) => onChange({ [bankAccountKey]: e.target.value } as Partial<Invitation>)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-rose-700 text-xs">So tai khoan</Label>
          <Input
            placeholder="VD: 0123456789"
            className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200 text-sm h-8"
            value={bankAccountNumberValue}
            onChange={(e) => onChange({ [bankAccountNumberKey]: e.target.value } as Partial<Invitation>)}
          />
        </div>
      </div>
    </div>
  )
}

export function BankQrUpload({
  invitationId,
  bankQrUrl,
  bankName,
  bankAccountHolder,
  bankAccountNumber,
  brideBankQrUrl,
  brideBankName,
  brideBankAccountHolder,
  brideBankAccountNumber,
  onChange,
}: BankQrUploadProps) {
  return (
    <div className="flex gap-4">
      <QrSide
        label="Nha trai"
        invitationId={invitationId}
        endpoint="bank-qr"
        qrUrl={bankQrUrl}
        qrUrlKey="bankQrUrl"
        bankNameValue={bankName}
        bankNameKey="bankName"
        bankAccountValue={bankAccountHolder}
        bankAccountKey="bankAccountHolder"
        bankAccountNumberValue={bankAccountNumber}
        bankAccountNumberKey="bankAccountNumber"
        onChange={onChange}
      />
      <div className="w-px bg-rose-100" />
      <QrSide
        label="Nha gai"
        invitationId={invitationId}
        endpoint="bride-bank-qr"
        qrUrl={brideBankQrUrl}
        qrUrlKey="brideBankQrUrl"
        bankNameValue={brideBankName}
        bankNameKey="brideBankName"
        bankAccountValue={brideBankAccountHolder}
        bankAccountKey="brideBankAccountHolder"
        bankAccountNumberValue={brideBankAccountNumber}
        bankAccountNumberKey="brideBankAccountNumber"
        onChange={onChange}
      />
    </div>
  )
}
