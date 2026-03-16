'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import {
  FileText,
  ExternalLink,
  Shield,
  ShieldCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import type { AdminInvitation } from '@repo/types'
import { apiFetch } from '@/lib/api'

const STATUS_OPTIONS = [
  { value: '', label: 'Tat ca' },
  { value: 'draft', label: 'Nhap' },
  { value: 'published', label: 'Da xuat ban' },
  { value: 'save_the_date', label: 'Save the Date' },
  { value: 'expired', label: 'Het han' },
]

const PLAN_OPTIONS = [
  { value: '', label: 'Tat ca' },
  { value: 'free', label: 'Mien phi' },
  { value: 'premium', label: 'Premium' },
]

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: { label: 'Nhap', className: 'bg-gray-100 text-gray-600' },
  published: { label: 'Da xuat ban', className: 'bg-green-100 text-green-700' },
  save_the_date: { label: 'Save the Date', className: 'bg-blue-100 text-blue-700' },
  expired: { label: 'Het han', className: 'bg-red-100 text-red-600' },
}

const PLAN_BADGES: Record<string, { label: string; className: string }> = {
  free: { label: 'Free', className: 'bg-gray-100 text-gray-600' },
  premium: { label: 'Premium', className: 'bg-amber-100 text-amber-700' },
}

const LIMIT = 20

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<AdminInvitation[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedInvitation, setSelectedInvitation] = useState<Record<string, unknown> | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchInvitations = useCallback(async (s: string, status: string, plan: string, p: number) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (s) params.set('search', s)
    if (status) params.set('status', status)
    if (plan) params.set('plan', plan)
    params.set('page', String(p))
    params.set('limit', String(LIMIT))

    const { data, error } = await apiFetch<{ data: AdminInvitation[]; total: number }>(
      `/admin/invitations?${params.toString()}`,
      { credentials: 'include' },
    )

    if (error) {
      toast.error(error)
    } else if (data) {
      setInvitations(data.data)
      setTotal(data.total)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchInvitations(search, statusFilter, planFilter, page)
  }, [statusFilter, planFilter, page, fetchInvitations]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearchChange(value: string) {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchInvitations(value, statusFilter, planFilter, 1)
    }, 300)
  }

  async function handleToggleDisable(inv: AdminInvitation) {
    setProcessingId(inv.id)
    const action = inv.isDisabled ? 'enable' : 'disable'
    const { error } = await apiFetch(`/admin/invitations/${inv.id}/${action}`, {
      method: 'POST',
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
    } else {
      toast.success(inv.isDisabled ? 'Da kich hoat lai' : 'Da vo hieu hoa')
      fetchInvitations(search, statusFilter, planFilter, page)
    }
    setProcessingId(null)
  }

  async function handleRowClick(inv: AdminInvitation) {
    setDetailLoading(true)
    setDialogOpen(true)
    const { data, error } = await apiFetch<Record<string, unknown>>(
      `/admin/invitations/${inv.id}`,
      { credentials: 'include' },
    )
    if (error) {
      toast.error(error)
      setDialogOpen(false)
    } else if (data) {
      setSelectedInvitation(data)
    }
    setDetailLoading(false)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const totalPages = Math.ceil(total / LIMIT)

  if (loading && invitations.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="size-5 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">Thiep cuoi</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="size-5 text-gray-700" />
        <h1 className="text-xl font-semibold text-gray-900">Thiep cuoi</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">Quan ly va giam sat tat ca thiep cuoi</p>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Tim theo ten hoac slug..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-700 outline-none focus:border-gray-400"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }}
          className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-700 outline-none focus:border-gray-400"
        >
          {PLAN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Invitation List */}
      {invitations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <FileText className="size-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Khong tim thay thiep cuoi nao</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleRowClick(inv)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {inv.groomName || 'Chu re'} &amp; {inv.brideName || 'Co dau'}
                      </p>
                      {STATUS_BADGES[inv.status] && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGES[inv.status].className}`}>
                          {STATUS_BADGES[inv.status].label}
                        </span>
                      )}
                      {PLAN_BADGES[inv.plan] && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PLAN_BADGES[inv.plan].className}`}>
                          {PLAN_BADGES[inv.plan].label}
                        </span>
                      )}
                      {inv.isDisabled && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                          Da vo hieu hoa
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                      <span className="truncate max-w-[180px]" title={inv.userEmail}>{inv.userEmail}</span>
                      {inv.slug && <span className="font-mono">{inv.slug}</span>}
                      <span>{formatDate(inv.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {inv.slug && !inv.isDisabled && (
                      <a
                        href={`/w/${inv.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <ExternalLink className="size-3.5" />
                        Xem
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={inv.isDisabled ? 'text-green-600 hover:bg-green-50 gap-1' : 'text-red-600 hover:bg-red-50 gap-1'}
                      onClick={() => handleToggleDisable(inv)}
                      disabled={processingId === inv.id}
                    >
                      {processingId === inv.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : inv.isDisabled ? (
                        <ShieldCheck className="size-3.5" />
                      ) : (
                        <Shield className="size-3.5" />
                      )}
                      {inv.isDisabled ? 'Kich hoat' : 'Vo hieu hoa'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="gap-1"
              >
                <ChevronLeft className="size-3.5" />
                Trang truoc
              </Button>
              <span className="text-xs text-gray-500">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="gap-1"
              >
                Trang sau
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Read-only Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiet thiep cuoi</DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-gray-400" />
            </div>
          ) : selectedInvitation ? (
            <div className="space-y-3 text-sm">
              <DetailRow label="Chu re" value={String(selectedInvitation.groom_name || selectedInvitation.groomName || '—')} />
              <DetailRow label="Co dau" value={String(selectedInvitation.bride_name || selectedInvitation.brideName || '—')} />
              <DetailRow label="Bo me chu re" value={String(selectedInvitation.groom_father_name || '—')} secondary={String(selectedInvitation.groom_mother_name || '')} />
              <DetailRow label="Bo me co dau" value={String(selectedInvitation.bride_father_name || '—')} secondary={String(selectedInvitation.bride_mother_name || '')} />
              <DetailRow label="Le cuoi chu re" value={formatCeremonyDate(selectedInvitation.groom_ceremony_date as string | null)} />
              <DetailRow label="Dia diem (chu re)" value={String(selectedInvitation.groom_venue || '—')} />
              <DetailRow label="Le cuoi co dau" value={formatCeremonyDate(selectedInvitation.bride_ceremony_date as string | null)} />
              <DetailRow label="Dia diem (co dau)" value={String(selectedInvitation.bride_venue || '—')} />
              <DetailRow label="Cau chuyen tinh yeu" value={Array.isArray(selectedInvitation.love_story) ? `${(selectedInvitation.love_story as unknown[]).length} moc thoi gian` : '—'} />
              <DetailRow label="Loi nhan" value={String(selectedInvitation.message || '—')} />
              <DetailRow label="Loi cam on" value={String(selectedInvitation.thank_you_text || '—')} />
              <DetailRow label="Slug" value={String(selectedInvitation.slug || '—')} mono />
              <DetailRow label="Giao dien" value={String(selectedInvitation.template_id || selectedInvitation.templateId || '—')} />
              <DetailRow label="Anh" value={Array.isArray(selectedInvitation.photo_urls) ? `${(selectedInvitation.photo_urls as unknown[]).length} anh` : '0 anh'} />
              <DetailRow label="Nhac" value={String(selectedInvitation.music_track_id || '—')} />
              <DetailRow label="Ma QR ngan hang" value={selectedInvitation.bank_qr_url ? 'Co' : 'Khong'} />
              <DetailRow label="Goi" value={String(selectedInvitation.plan || 'free')} />
              <DetailRow label="Thanh toan" value={String(selectedInvitation.payment_status || '—')} />
              <DetailRow label="Trang thai" value={String(selectedInvitation.status || '—')} />
              <DetailRow label="Vo hieu hoa" value={selectedInvitation.is_disabled ? 'Co' : 'Khong'} />
              <DetailRow label="Ghi chu admin" value={String(selectedInvitation.admin_notes || '—')} />
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Dong
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailRow({ label, value, secondary, mono }: { label: string; value: string; secondary?: string; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1">
      <span className="text-gray-500 w-36 shrink-0">{label}:</span>
      <div>
        <span className={`text-gray-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
        {secondary && <span className="text-gray-500 ml-1">/ {secondary}</span>}
      </div>
    </div>
  )
}

function formatCeremonyDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
