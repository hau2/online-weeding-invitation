'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import type { Invitation } from '@repo/types'

const ADMIN_BANK_QR = process.env.NEXT_PUBLIC_ADMIN_BANK_QR ?? ''
const ADMIN_BANK_NAME = process.env.NEXT_PUBLIC_ADMIN_BANK_NAME ?? 'Dang cap nhat'
const ADMIN_BANK_HOLDER = process.env.NEXT_PUBLIC_ADMIN_BANK_HOLDER ?? 'Dang cap nhat'

const BENEFITS = [
  'Khong co watermark tren thiep cuoi',
  'Ma QR ngan hang hien thi day du',
  'Xuat ban khong gioi han so luong thiep',
]

export default function UpgradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchInvitation() {
      const { data, error } = await apiFetch<Invitation>(`/invitations/${id}`, {
        credentials: 'include',
      })
      if (error || !data) {
        toast.error(error ?? 'Khong the tai thong tin thiep')
        router.push('/dashboard')
        return
      }
      setInvitation(data)
      setLoading(false)
    }
    fetchInvitation()
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
      <div className="min-h-screen bg-rose-50/50 flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-rose-400" />
      </div>
    )
  }

  if (!invitation) return null

  // Already premium
  if (invitation.plan === 'premium') {
    return (
      <div className="min-h-screen bg-rose-50/50 px-4 py-8">
        <div className="max-w-lg mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-700 mb-6">
            <ArrowLeft className="size-4" />
            Quay lai
          </Link>
          <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8 text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-purple-100 mb-4">
              <Sparkles className="size-8 text-purple-600" />
            </div>
            <h1 className="text-xl font-semibold text-rose-900 mb-2">Thiep nay da la Premium</h1>
            <p className="text-sm text-gray-500">Ban da co the su dung day du tinh nang.</p>
          </div>
        </div>
      </div>
    )
  }

  const isPending = invitation.paymentStatus === 'pending'
  const transferContent = `THIEP ${invitation.slug ?? invitation.id.slice(-8).toUpperCase()}`

  return (
    <div className="min-h-screen bg-rose-50/50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-700 mb-6">
          <ArrowLeft className="size-4" />
          Quay lai
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-5" />
              <h1 className="text-lg font-semibold">Nang cap len Premium</h1>
            </div>
            <p className="text-3xl font-bold">99.000 VND <span className="text-base font-normal opacity-80">/ thiep</span></p>
          </div>

          {/* Benefits */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Quyen loi Premium:</h2>
            <ul className="space-y-2.5">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="size-4 text-green-500 shrink-0 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment section */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Chuyen khoan theo thong tin ben duoi:</h2>

            {/* Admin QR */}
            <div className="flex flex-col items-center mb-4">
              {ADMIN_BANK_QR ? (
                <img
                  src={ADMIN_BANK_QR}
                  alt="QR thanh toan"
                  className="w-48 h-48 object-contain rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-gray-400">
                  QR thanh toan se duoc cap nhat
                </div>
              )}
            </div>

            {/* Bank info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ngan hang:</span>
                <span className="font-medium text-gray-800">{ADMIN_BANK_NAME}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Chu tai khoan:</span>
                <span className="font-medium text-gray-800">{ADMIN_BANK_HOLDER}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Noi dung CK:</span>
                <span className="font-medium text-rose-600">{transferContent}</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="px-6 py-5">
            {isPending ? (
              <div className="text-center">
                <p className="text-sm text-amber-600 font-medium mb-2">Yeu cau nang cap dang cho xu ly</p>
                <Button disabled className="w-full bg-amber-100 text-amber-700 cursor-not-allowed">
                  Da gui yeu cau
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleRequestUpgrade}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600"
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
