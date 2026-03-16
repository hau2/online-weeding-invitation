'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Check, X, Clock, Receipt, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Invitation } from '@repo/types'
import { apiFetch } from '@/lib/api'

export default function AdminPaymentsPage() {
  const [pending, setPending] = useState<Invitation[]>([])
  const [history, setHistory] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [pendingRes, historyRes] = await Promise.all([
      apiFetch<Invitation[]>('/invitations/admin/pending-upgrades', {
        credentials: 'include',
      }),
      apiFetch<Invitation[]>('/invitations/admin/upgrade-history', {
        credentials: 'include',
      }),
    ])

    if (pendingRes.data) setPending(pendingRes.data)
    if (historyRes.data) setHistory(historyRes.data)

    // If history endpoint doesn't exist yet, just ignore the error
    setLoading(false)
  }

  async function handleApprove(id: string) {
    setProcessingId(id)
    const { error } = await apiFetch<Invitation>(`/invitations/admin/${id}/approve-upgrade`, {
      method: 'POST',
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
      setProcessingId(null)
      return
    }
    toast.success('Da xac nhan nang cap')
    setPending((prev) => prev.filter((inv) => inv.id !== id))
    setProcessingId(null)
    // Refresh history
    const historyRes = await apiFetch<Invitation[]>('/invitations/admin/upgrade-history', {
      credentials: 'include',
    })
    if (historyRes.data) setHistory(historyRes.data)
  }

  async function handleReject(id: string) {
    setProcessingId(id)
    const { error } = await apiFetch<Invitation>(`/invitations/admin/${id}/reject-upgrade`, {
      method: 'POST',
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
      setProcessingId(null)
      return
    }
    toast.success('Da tu choi yeu cau')
    setPending((prev) => prev.filter((inv) => inv.id !== id))
    setProcessingId(null)
    // Refresh history
    const historyRes = await apiFetch<Invitation[]>('/invitations/admin/upgrade-history', {
      credentials: 'include',
    })
    if (historyRes.data) setHistory(historyRes.data)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function truncateId(id: string) {
    return id.length > 8 ? `${id.slice(0, 8)}...` : id
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Receipt className="size-5 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">Thanh toan</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-1">
        <Receipt className="size-5 text-gray-700" />
        <h1 className="text-xl font-semibold text-gray-900">Thanh toan</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">Yeu cau nang cap dang cho xu ly</p>

      {/* Pending upgrades */}
      {pending.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center mb-8">
          <Clock className="size-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Khong co yeu cau nao dang cho xu ly</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {pending.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {inv.groomName || 'Chu re'} &amp; {inv.brideName || 'Co dau'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                    {inv.slug && <span className="font-mono">{inv.slug}</span>}
                    <span title={inv.id}>ID: {truncateId(inv.id)}</span>
                    <span>User: {truncateId(inv.userId)}</span>
                    <span>{formatDate(inv.updatedAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="bg-green-500 text-white hover:bg-green-600 gap-1"
                    onClick={() => handleApprove(inv.id)}
                    disabled={processingId === inv.id}
                  >
                    {processingId === inv.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Check className="size-3.5" />
                    )}
                    Xac nhan
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 gap-1"
                    onClick={() => handleReject(inv.id)}
                    disabled={processingId === inv.id}
                  >
                    <X className="size-3.5" />
                    Tu choi
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History section */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Lich su</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">Chua co lich su duyet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-lg border border-gray-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    {inv.groomName || 'Chu re'} &amp; {inv.brideName || 'Co dau'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-0.5">
                    {inv.slug && <span className="font-mono">{inv.slug}</span>}
                    <span>{formatDate(inv.updatedAt)}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {inv.plan === 'premium' ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      Da duyet
                    </span>
                  ) : inv.paymentStatus === 'rejected' ? (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                      Tu choi
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                      {inv.plan}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
