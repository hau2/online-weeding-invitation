'use client'

import { useState, useEffect } from 'react'
import { Loader2, ExternalLink, Shield, RefreshCw, UserMinus, CalendarDays } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'

interface UserInvitation {
  id: string
  slug: string | null
  status: string
  templateId: string
  groomName: string
  brideName: string
  plan: string
  paymentStatus: string
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

interface UserDetail {
  id: string
  email: string
  role: string
  isLocked: boolean
  tier: string // 'user' | 'agent'
  subscriptionStart: string | null
  subscriptionEnd: string | null
  createdAt: string
  updatedAt: string
  invitations: UserInvitation[]
}

interface UserDetailDialogProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateNullable(dateStr: string | null) {
  if (!dateStr) return '---'
  return formatDate(dateStr)
}

function isExpired(dateStr: string | null) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    draft: 'bg-[#f4f0f1] text-[#89616b]',
    published: 'bg-green-100 text-green-700',
    save_the_date: 'bg-blue-100 text-blue-700',
  }
  const labels: Record<string, string> = {
    draft: 'Nhap',
    published: 'Da xuat ban',
    save_the_date: 'Save the Date',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-[#f4f0f1] text-[#89616b]'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function planBadge(plan: string) {
  if (plan === 'premium') {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        Premium
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[#f4f0f1] px-2 py-0.5 text-xs font-medium text-[#89616b]">
      Free
    </span>
  )
}

function tierBadge(tier: string) {
  if (tier === 'agent') {
    return (
      <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
        Dai ly
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[#f4f0f1] px-2 py-0.5 text-xs font-medium text-[#89616b]">
      Nguoi dung
    </span>
  )
}

function getTodayDateString() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function UserDetailDialog({ userId, open, onOpenChange }: UserDetailDialogProps) {
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [grantStartDate, setGrantStartDate] = useState<string>('')

  useEffect(() => {
    if (!userId || !open) {
      setDetail(null)
      return
    }

    async function fetchDetail() {
      setLoading(true)
      const { data, error } = await apiFetch<UserDetail>(`/admin/users/${userId}`, {
        credentials: 'include',
      })
      if (error) {
        setDetail(null)
      } else {
        setDetail(data)
      }
      setLoading(false)
    }
    fetchDetail()
  }, [userId, open])

  // Initialize grant start date to today when user is loaded and tier is 'user'
  useEffect(() => {
    if (detail && (detail.tier ?? 'user') === 'user') {
      setGrantStartDate(getTodayDateString())
    }
  }, [detail])

  async function refetchDetail() {
    if (!userId) return
    const { data } = await apiFetch<UserDetail>(`/admin/users/${userId}`, {
      credentials: 'include',
    })
    if (data) setDetail(data)
  }

  async function handleGrantAgent() {
    if (!userId) return
    setActionLoading('grant')
    try {
      const { error } = await apiFetch(`/admin/users/${userId}/grant-agent`, {
        method: 'POST',
        credentials: 'include',
        body: { subscriptionStart: grantStartDate || undefined },
      })
      if (error) {
        toast.error(error)
      } else {
        toast.success('Da cap quyen dai ly')
        await refetchDetail()
      }
    } catch {
      toast.error('Loi khi cap quyen dai ly')
    }
    setActionLoading(null)
  }

  async function handleRenewAgent() {
    if (!userId) return
    setActionLoading('renew')
    try {
      const { error } = await apiFetch(`/admin/users/${userId}/renew-agent`, {
        method: 'POST',
        credentials: 'include',
      })
      if (error) {
        toast.error(error)
      } else {
        toast.success('Da gia han dai ly')
        await refetchDetail()
      }
    } catch {
      toast.error('Loi khi gia han dai ly')
    }
    setActionLoading(null)
  }

  async function handleRevokeAgent() {
    if (!userId) return
    setActionLoading('revoke')
    try {
      const { error } = await apiFetch(`/admin/users/${userId}/revoke-agent`, {
        method: 'POST',
        credentials: 'include',
      })
      if (error) {
        toast.error(error)
      } else {
        toast.success('Da thu hoi quyen dai ly')
        await refetchDetail()
      }
    } catch {
      toast.error('Loi khi thu hoi quyen dai ly')
    }
    setActionLoading(null)
  }

  const userTier = detail?.tier ?? 'user'

  // Count published invitations for agent quota display
  const publishedCount = detail?.invitations.filter(
    (inv) => inv.status === 'published' || inv.status === 'save_the_date'
  ).length ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto border border-[#e6dbde]">
        <DialogHeader>
          <DialogTitle className="text-[#181113]">Chi tiet nguoi dung</DialogTitle>
          <DialogDescription>Thong tin tai khoan va danh sach thiep cuoi</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-[#ec1349]" />
          </div>
        ) : detail ? (
          <div className="space-y-4">
            {/* User info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#89616b]">Email</span>
                <span className="text-[#181113] font-medium">{detail.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89616b]">Vai tro</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${detail.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-[#f4f0f1] text-[#89616b]'}`}>
                  {detail.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#89616b]">Trang thai</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${detail.isLocked ? 'bg-[#ec1349]/10 text-[#ec1349]' : 'bg-green-100 text-green-700'}`}>
                  {detail.isLocked ? 'Da khoa' : 'Hoat dong'}
                </span>
              </div>
              {/* Tier badge */}
              <div className="flex justify-between">
                <span className="text-[#89616b]">Loai tai khoan</span>
                {tierBadge(userTier)}
              </div>
              {/* Agent subscription details */}
              {userTier === 'agent' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#89616b]">Bat dau</span>
                    <span className="text-[#181113]">{formatDateNullable(detail.subscriptionStart)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#89616b]">Het han</span>
                    <span className={isExpired(detail.subscriptionEnd) ? 'text-[#ec1349] font-medium' : 'text-[#181113]'}>
                      {formatDateNullable(detail.subscriptionEnd)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#89616b]">Thiep da xuat ban</span>
                    <span className="text-[#181113] font-medium">{publishedCount}/20</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-[#89616b]">Ngay tao</span>
                <span className="text-[#181113]">{formatDate(detail.createdAt)}</span>
              </div>
            </div>

            {/* Agent tier action buttons */}
            <div className="bg-[#f8f6f6] rounded-lg border border-[#f4f0f1] p-3">
              {userTier === 'user' ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="size-3.5 text-[#89616b]" />
                    <label className="text-xs font-semibold text-[#89616b]">Ngay bat dau</label>
                  </div>
                  <input
                    type="date"
                    value={grantStartDate}
                    onChange={(e) => setGrantStartDate(e.target.value)}
                    className="border border-[#e6dbde] rounded-lg px-3 py-1.5 text-sm text-[#181113] bg-white mb-3 w-full max-w-[200px] focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
                  />
                  <div>
                    <button
                      onClick={handleGrantAgent}
                      disabled={actionLoading === 'grant'}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#ec1349] px-3 py-1.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      {actionLoading === 'grant' ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Shield className="size-3.5" />
                      )}
                      Cap dai ly
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleRenewAgent}
                    disabled={actionLoading === 'renew'}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#ec1349] px-3 py-1.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {actionLoading === 'renew' ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="size-3.5" />
                    )}
                    Gia han
                  </button>
                  <button
                    onClick={handleRevokeAgent}
                    disabled={actionLoading === 'revoke'}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e6dbde] bg-white px-3 py-1.5 text-sm font-bold text-[#181113] hover:bg-[#f4f0f1] disabled:opacity-50"
                  >
                    {actionLoading === 'revoke' ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <UserMinus className="size-3.5" />
                    )}
                    Thu hoi
                  </button>
                </div>
              )}
            </div>

            {/* Invitations */}
            <div>
              <h4 className="text-sm font-semibold text-[#89616b] mb-2">
                Thiep cuoi ({detail.invitations.length})
              </h4>
              {detail.invitations.length === 0 ? (
                <p className="text-xs text-[#89616b]">Chua co thiep cuoi nao.</p>
              ) : (
                <div className="space-y-2">
                  {detail.invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-[#f8f6f6] rounded-lg border border-[#f4f0f1] p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#181113] truncate">
                            {inv.groomName || 'Chu re'} &amp; {inv.brideName || 'Co dau'}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {statusBadge(inv.status)}
                            {planBadge(inv.plan)}
                          </div>
                          {inv.slug && (
                            <a
                              href={`/${inv.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[#ec1349] hover:text-red-600 mt-1"
                            >
                              <ExternalLink className="size-3" />
                              {inv.slug}
                            </a>
                          )}
                        </div>
                        <span className="text-xs text-[#89616b] whitespace-nowrap">
                          {formatDate(inv.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#89616b] text-center py-4">Khong the tai thong tin nguoi dung.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
