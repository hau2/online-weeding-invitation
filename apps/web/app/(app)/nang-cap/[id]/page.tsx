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
    <div className="min-h-[calc(100vh-2rem)] bg-[#f8f6f6] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-[#89616b] hover:text-[#181113] mb-8 transition-colors">
          <ArrowLeft className="size-4" />
          Quay lai trang chu
        </Link>

        {/* Hero header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-[#ec1349]/10 mb-4">
            <Sparkles className="size-8 text-[#ec1349]" />
          </div>
          <h1 className="text-2xl font-bold text-[#181113] tracking-tight mb-2">Nang cap len Premium</h1>
          <p className="text-[#89616b]">Mo khoa toan bo tinh nang de thiep cuoi cua ban tro nen hoan hao</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left — Benefits card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e6dbde] overflow-hidden">
            <div className="bg-gradient-to-br from-[#ec1349] to-[#d01140] px-6 py-6 text-white">
              <p className="text-sm font-medium opacity-80 mb-1">Premium</p>
              <p className="text-4xl font-bold tracking-tight">{new Intl.NumberFormat('vi-VN').format(paymentConfig?.pricePerInvitation ?? 99000)}<span className="text-lg font-normal opacity-70 ml-1">VND</span></p>
              <p className="text-sm opacity-70 mt-1">cho moi thiep cuoi</p>
            </div>
            <div className="px-6 py-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#89616b] mb-4">Quyen loi bao gom</h2>
              <ul className="space-y-3">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-sm text-[#181113]">
                    <div className="flex items-center justify-center size-5 rounded-full bg-[#ec1349]/10 shrink-0 mt-0.5">
                      <Check className="size-3 text-[#ec1349]" />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — Payment card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e6dbde] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e6dbde]">
              <h2 className="text-sm font-bold text-[#181113]">Thong tin chuyen khoan</h2>
              <p className="text-xs text-[#89616b] mt-1">Quet ma QR hoac chuyen khoan thu cong</p>
            </div>

            {/* QR Code */}
            <div className="px-6 py-5 flex flex-col items-center border-b border-[#e6dbde]">
              {paymentConfig?.bankQrUrl ? (
                <img
                  src={paymentConfig.bankQrUrl}
                  alt="QR thanh toan"
                  className="w-44 h-44 object-contain rounded-xl border border-[#e6dbde] shadow-sm"
                />
              ) : (
                <div className="w-44 h-44 bg-[#f8f6f6] rounded-xl border border-[#e6dbde] flex items-center justify-center text-sm text-[#89616b]">
                  Chua co QR
                </div>
              )}
            </div>

            {/* Bank details */}
            <div className="px-6 py-4 space-y-3 text-sm border-b border-[#e6dbde]">
              <div className="flex justify-between items-center">
                <span className="text-[#89616b]">Ngan hang</span>
                <span className="font-semibold text-[#181113]">{paymentConfig?.bankName || '---'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#89616b]">Chu TK</span>
                <span className="font-semibold text-[#181113]">{paymentConfig?.bankAccountHolder || '---'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#89616b]">Noi dung CK</span>
                <span className="font-bold text-[#ec1349] bg-[#ec1349]/5 px-2 py-0.5 rounded">{transferContent}</span>
              </div>
            </div>

            {/* Action */}
            <div className="px-6 py-5">
              {isPending ? (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-[#ec1349] font-medium bg-[#ec1349]/5 rounded-lg px-4 py-2 mb-3">
                    <Loader2 className="size-3.5 animate-spin" />
                    Dang cho admin xac nhan
                  </div>
                  <button disabled className="w-full bg-[#e6dbde] text-[#89616b] rounded-lg h-11 font-bold cursor-not-allowed">
                    Da gui yeu cau
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRequestUpgrade}
                  disabled={submitting}
                  className="w-full bg-[#ec1349] hover:bg-[#d01140] text-white rounded-lg h-12 font-bold text-base shadow-lg shadow-[#ec1349]/20 transition-all hover:shadow-xl hover:shadow-[#ec1349]/30 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Dang gui...
                    </span>
                  ) : (
                    'Toi da thanh toan'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
