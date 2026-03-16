'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Check,
  X,
  Clock,
  Receipt,
  Loader2,
  DollarSign,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Invitation } from '@repo/types'
import { apiFetch } from '@/lib/api'

export default function AdminPaymentsPage() {
  const [pending, setPending] = useState<Invitation[]>([])
  const [history, setHistory] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Notes state
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [notesInput, setNotesInput] = useState<Record<string, string>>({})
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null)

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

    setLoading(false)
  }

  async function refreshHistory() {
    const historyRes = await apiFetch<Invitation[]>('/invitations/admin/upgrade-history', {
      credentials: 'include',
    })
    if (historyRes.data) setHistory(historyRes.data)
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
    await refreshHistory()
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
    await refreshHistory()
  }

  async function handleRevoke(id: string) {
    setProcessingId(id)
    const { error } = await apiFetch<Invitation>(`/invitations/admin/${id}/revoke-premium`, {
      method: 'POST',
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
      setProcessingId(null)
      return
    }
    toast.success('Da thu hoi Premium')
    setProcessingId(null)
    await refreshHistory()
  }

  async function handleMarkRefund(id: string) {
    setProcessingId(id)
    const { error } = await apiFetch<Invitation>(`/invitations/admin/${id}/mark-refund`, {
      method: 'POST',
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
      setProcessingId(null)
      return
    }
    toast.success('Da danh dau hoan tien')
    setProcessingId(null)
    await refreshHistory()
  }

  async function handleSaveNote(id: string) {
    setSavingNoteId(id)
    const notes = notesInput[id] ?? ''
    const { error } = await apiFetch<Invitation>(`/invitations/admin/${id}/notes`, {
      method: 'PATCH',
      credentials: 'include',
      body: { notes },
    })
    if (error) {
      toast.error(error)
    } else {
      toast.success('Da luu ghi chu')
      // Update local state
      setHistory((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, adminNotes: notes } : inv)),
      )
    }
    setSavingNoteId(null)
  }

  function toggleNotes(id: string) {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        // Initialize input from existing notes
        const inv = history.find((h) => h.id === id)
        if (inv) {
          setNotesInput((p) => ({ ...p, [id]: inv.adminNotes ?? '' }))
        }
      }
      return next
    })
  }

  function handleExportCsv() {
    const headers = ['ID', 'Chu re', 'Co dau', 'Slug', 'Goi', 'Trang thai thanh toan', 'Ngay cap nhat', 'Ghi chu']
    const rows = history.map((inv) => [
      inv.id,
      inv.groomName || '',
      inv.brideName || '',
      inv.slug || '',
      inv.plan,
      getPaymentStatusLabel(inv),
      formatDate(inv.updatedAt),
      (inv.adminNotes ?? '').replace(/"/g, '""'),
    ])

    const csvContent =
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join(
        '\n',
      )

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const today = new Date().toISOString().slice(0, 10)
    link.href = url
    link.download = `thanh-toan-${today}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function getPaymentStatusLabel(inv: Invitation): string {
    if (inv.paymentStatus === 'pending') return 'Dang cho'
    if (inv.paymentStatus === 'refunded') return 'Da hoan tien'
    if (inv.paymentStatus === 'rejected') return 'Tu choi'
    if (inv.plan === 'premium') return 'Da duyet'
    return inv.plan
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Lich su</h2>
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={handleExportCsv}
            >
              <Download className="size-3" />
              Xuat CSV
            </Button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">Chua co lich su duyet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-lg border border-gray-100 px-4 py-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      {inv.groomName || 'Chu re'} &amp; {inv.brideName || 'Co dau'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-0.5">
                      {inv.slug && <span className="font-mono">{inv.slug}</span>}
                      <span>{formatDate(inv.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Payment status badge */}
                    {inv.paymentStatus === 'refunded' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                        <DollarSign className="size-3" />
                        Da hoan tien
                      </span>
                    ) : inv.paymentStatus === 'pending' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                        <Clock className="size-3" />
                        Dang cho
                      </span>
                    ) : inv.paymentStatus === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                        <X className="size-3" />
                        Tu choi
                      </span>
                    ) : inv.plan === 'premium' ? (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <Check className="size-3" />
                          Da duyet
                        </span>
                        {/* Refund button for premium invitations */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:bg-amber-50 gap-1 text-xs"
                          onClick={() => handleMarkRefund(inv.id)}
                          disabled={processingId === inv.id}
                        >
                          {processingId === inv.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <DollarSign className="size-3" />
                          )}
                          Hoan tien
                        </Button>
                        {/* Revoke button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-orange-600 hover:bg-orange-50 gap-1 text-xs"
                          onClick={() => handleRevoke(inv.id)}
                          disabled={processingId === inv.id}
                        >
                          {processingId === inv.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <X className="size-3" />
                          )}
                          Thu hoi
                        </Button>
                      </>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                        {inv.plan}
                      </span>
                    )}

                    {/* Notes toggle */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => toggleNotes(inv.id)}
                      title="Ghi chu"
                    >
                      {expandedNotes.has(inv.id) ? (
                        <ChevronUp className="size-3.5" />
                      ) : (
                        <ChevronDown className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expandable notes section */}
                {expandedNotes.has(inv.id) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <label className="text-xs text-gray-500 block mb-1">Ghi chu noi bo</label>
                    {inv.adminNotes && (
                      <p className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 mb-2">
                        {inv.adminNotes}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={notesInput[inv.id] ?? ''}
                        onChange={(e) =>
                          setNotesInput((prev) => ({ ...prev, [inv.id]: e.target.value }))
                        }
                        placeholder="Nhap ghi chu..."
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                        onClick={() => handleSaveNote(inv.id)}
                        disabled={savingNoteId === inv.id}
                      >
                        {savingNoteId === inv.id && <Loader2 className="size-3 animate-spin" />}
                        Luu ghi chu
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
