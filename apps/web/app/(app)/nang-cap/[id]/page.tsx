'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import type { Invitation } from '@repo/types'

interface PaymentConfig {
  bankName: string
  bankQrUrl: string
  bankAccountHolder: string
  pricePerInvitation: number
}

const BENEFITS = [
  'Khong co watermark tren thiep cuoi',
  'Ma QR ngan hang hien thi day du',
  'Xuat ban khong gioi han so luong thiep',
]

export default function UpgradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const [invRes, configRes] = await Promise.all([
        apiFetch<Invitation>(`/invitations/${id}`, { credentials: 'include' }),
        apiFetch<PaymentConfig>('/invitations/payment-config', { credentials: 'include' }),
      ])
      if (invRes.error || !invRes.data) {
        toast.error(invRes.error ?? 'Khong the tai thong tin thiep')
        router.push('/dashboard')
        return
      }
      setInvitation(invRes.data)
      if (configRes.data) setPaymentConfig(configRes.data)
      setLoading(false)
    }
    fetchData()
  }, [id, router])

  const handleRequestUpgrade = async () => {
    setSubmitting(true)
    const { error } = await apiFetch<Invitation>(`/invitations/${id}/request-upgrade`, {
      method: 'POST',
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
      setSubmitting(false)
      return
    }
    toast.success('Da gui yeu cau. Vui long cho admin xac nhan.')
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f6] flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[#ec1349]" />
      </div>
    )
  }

  if (!invitation) return null

  // Already premium
  if (invitation.plan === 'premium') {
    return (
      <div className="min-h-screen bg-[#f8f6f6] px-4 py-8">
        <div className="max-w-lg mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#ec1349] hover:text-[#d01140] mb-6">
            <ArrowLeft className="size-4" />
            Quay lai
          </Link>
          <div className="bg-white rounded-xl shadow-sm border border-[#e6dbde] p-8 text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-[#ec1349]/10 mb-4">
              <Sparkles className="size-8 text-[#ec1349]" />
            </div>
            <h1 className="text-xl font-semibold text-[#181113] mb-2">Thiep nay da la Premium</h1>
            <p className="text-sm text-[#5e4d52]">Ban da co the su dung day du tinh nang.</p>
          </div>
        </div>
      </div>
    )
  }

  const isPending = invitation.paymentStatus === 'pending'
  const transferContent = `THIEP ${invitation.slug ?? invitation.id.slice(-8).toUpperCase()}`

  return (
    <div className="min-h-screen bg-[#f8f6f6] px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#ec1349] hover:text-[#d01140] mb-6">
          <ArrowLeft className="size-4" />
          Quay lai
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-[#e6dbde] overflow-hidden">
          {/* Header */}
          <div className="bg-[#ec1349] px-6 py-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-5" />
              <h1 className="text-lg font-semibold">Nang cap len Premium</h1>
            </div>
            <p className="text-3xl font-bold">{new Intl.NumberFormat('vi-VN').format(paymentConfig?.pricePerInvitation ?? 99000)} VND <span className="text-base font-normal opacity-80">/ thiep</span></p>
          </div>

          {/* Benefits */}
          <div className="px-6 py-5 border-b border-[#e6dbde]">
            <h2 className="text-sm font-bold text-[#181113] mb-3">Quyen loi Premium:</h2>
            <ul className="space-y-2.5">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-[#5e4d52]">
                  <Check className="size-4 text-[#ec1349] shrink-0 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment section */}
          <div className="px-6 py-5 border-b border-[#e6dbde]">
            <h2 className="text-sm font-bold text-[#181113] mb-3">Chuyen khoan theo thong tin ben duoi:</h2>

            {/* Admin QR */}
            <div className="flex flex-col items-center mb-4">
              {paymentConfig?.bankQrUrl ? (
                <img
                  src={paymentConfig.bankQrUrl}
                  alt="QR thanh toan"
                  className="w-48 h-48 object-contain rounded-xl border border-[#e6dbde]"
                />
              ) : (
                <div className="w-48 h-48 bg-[#f8f6f6] rounded-xl border border-[#e6dbde] flex items-center justify-center text-sm text-[#89616b]">
                  QR thanh toan se duoc cap nhat
                </div>
              )}
            </div>

            {/* Bank info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#89616b]">Ngan hang:</span>
                <span className="font-medium text-[#181113]">{paymentConfig?.bankName || 'Dang cap nhat'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89616b]">Chu tai khoan:</span>
                <span className="font-medium text-[#181113]">{paymentConfig?.bankAccountHolder || 'Dang cap nhat'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89616b]">Noi dung CK:</span>
                <span className="font-bold text-[#ec1349]">{transferContent}</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="px-6 py-5">
            {isPending ? (
              <div className="text-center">
                <p className="text-sm text-[#ec1349] font-medium mb-2">Yeu cau nang cap dang cho xu ly</p>
                <Button disabled className="w-full bg-[#ec1349]/10 text-[#ec1349] cursor-not-allowed">
                  Da gui yeu cau
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleRequestUpgrade}
                disabled={submitting}
                className="w-full bg-[#ec1349] hover:bg-[#d01140] text-white rounded-lg h-11 font-bold shadow-lg shadow-[#ec1349]/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Dang gui...
                  </>
                ) : (
                  'Toi da thanh toan'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
