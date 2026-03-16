'use client'

import { useState, useEffect } from 'react'
import { Loader2, ExternalLink } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { apiFetch } from '@/lib/api'

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

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    published: 'bg-green-100 text-green-700',
    save_the_date: 'bg-blue-100 text-blue-700',
  }
  const labels: Record<string, string> = {
    draft: 'Nhap',
    published: 'Da xuat ban',
    save_the_date: 'Save the Date',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-gray-100 text-gray-600'}`}>
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
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
      Free
    </span>
  )
}

export function UserDetailDialog({ userId, open, onOpenChange }: UserDetailDialogProps) {
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiet nguoi dung</DialogTitle>
          <DialogDescription>Thong tin tai khoan va danh sach thiep cuoi</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-gray-400" />
          </div>
        ) : detail ? (
          <div className="space-y-4">
            {/* User info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-900 font-medium">{detail.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vai tro</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${detail.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                  {detail.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trang thai</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${detail.isLocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                  {detail.isLocked ? 'Da khoa' : 'Hoat dong'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngay tao</span>
                <span className="text-gray-700">{formatDate(detail.createdAt)}</span>
              </div>
            </div>

            {/* Invitations */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Thiep cuoi ({detail.invitations.length})
              </h4>
              {detail.invitations.length === 0 ? (
                <p className="text-xs text-gray-400">Chua co thiep cuoi nao.</p>
              ) : (
                <div className="space-y-2">
                  {detail.invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-gray-50 rounded-lg border border-gray-100 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
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
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                            >
                              <ExternalLink className="size-3" />
                              {inv.slug}
                            </a>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
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
          <p className="text-sm text-gray-400 text-center py-4">Khong the tai thong tin nguoi dung.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
