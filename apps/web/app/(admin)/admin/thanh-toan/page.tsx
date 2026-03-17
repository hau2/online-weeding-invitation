'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Check,
  X,
  Clock,
  Loader2,
  DollarSign,
  Download,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Invitation } from '@repo/types'
import { apiFetch } from '@/lib/api'

export default function AdminPaymentsPage() {
  const [pending, setPending] = useState<Invitation[]>([])
  const [history, setHistory] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')

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
    const rows = filteredHistory.map((inv) => [
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

  // Filter by payment content (THIEP {slug}), couple names, or slug
  function matchesSearch(inv: Invitation) {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const transferContent = `thiep ${inv.slug ?? inv.id.slice(-8)}`.toLowerCase()
    return (
      transferContent.includes(q) ||
      (inv.groomName ?? '').toLowerCase().includes(q) ||
      (inv.brideName ?? '').toLowerCase().includes(q) ||
      (inv.slug ?? '').toLowerCase().includes(q) ||
      inv.id.toLowerCase().includes(q)
    )
  }

  const filteredPending = pending.filter(matchesSearch)
  const filteredHistory = history.filter(matchesSearch)

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#181113] mb-6">Thanh toan</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-[#ec1349]" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-[#181113] mb-6">Thanh toan</h1>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#89616b]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tim theo noi dung CK, ten, slug..."
          className="w-full rounded-lg border border-[#e6dbde] pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
        />
      </div>

      {/* Pending upgrades */}
      {filteredPending.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e6dbde] p-8 text-center mb-8">
          <Clock className="size-8 text-[#e6dbde] mx-auto mb-3" />
          <p className="text-sm text-[#89616b]">Khong co yeu cau nao dang cho xu ly</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {filteredPending.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-xl border border-[#e6dbde] p-4 hover:bg-[#f8f6f6] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#181113]">
                    {inv.groomName || 'Chu re'} &amp; {inv.brideName || 'Co dau'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#89616b] mt-1">
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
          <h2 className="text-sm font-semibold text-[#89616b]">Lich su</h2>
          {filteredHistory.length > 0 && (
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
        {filteredHistory.length === 0 ? (
          <p className="text-sm text-[#89616b]">{searchQuery ? 'Khong tim thay ket qua.' : 'Chua co lich su duyet.'}</p>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-lg border border-[#e6dbde] px-4 py-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#181113]">
                      {inv.groomName || 'Chu re'} &amp; {inv.brideName || 'Co dau'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#89616b] mt-0.5">
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
                      <span className="inline-flex items-center rounded-full bg-[#f4f0f1] px-2.5 py-0.5 text-xs font-medium text-[#89616b]">
                        {inv.plan}
                      </span>
                    )}

                    {/* Notes toggle */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-[#89616b] hover:text-[#181113]"
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
                  <div className="mt-3 pt-3 border-t border-[#f4f0f1]">
                    <label className="text-xs font-semibold text-[#89616b] block mb-1">Ghi chu noi bo</label>
                    {inv.adminNotes && (
                      <p className="text-xs text-[#89616b] bg-[#f8f6f6] rounded px-2 py-1 mb-2">
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
                        className="flex-1 rounded-lg border border-[#e6dbde] px-3 py-1.5 text-xs focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
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
