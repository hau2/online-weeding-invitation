'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Users, Search, Lock, Unlock, Trash2, Eye, Loader2,
  ChevronLeft, ChevronRight, ShieldCheck, ShieldOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { UserDetailDialog } from '@/components/admin/UserDetailDialog'
import { apiFetch } from '@/lib/api'
import type { AdminUser } from '@repo/types'

type StatusFilter = 'all' | 'active' | 'locked'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Tat ca' },
  { value: 'active', label: 'Hoat dong' },
  { value: 'locked', label: 'Da khoa' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  // User detail dialog
  const [detailUserId, setDetailUserId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Debounced search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', String(limit))
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (statusFilter !== 'all') params.set('status', statusFilter)

    const { data, error } = await apiFetch<{ data: AdminUser[]; total: number }>(
      `/admin/users?${params.toString()}`,
      { credentials: 'include' },
    )

    if (error) {
      toast.error(error)
    } else if (data) {
      setUsers(data.data)
      setTotal(data.total)
    }
    setLoading(false)
  }, [page, debouncedSearch, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // --- Actions ---

  async function handleLockToggle(user: AdminUser) {
    setProcessingId(user.id)
    const endpoint = user.isLocked
      ? `/admin/users/${user.id}/unlock`
      : `/admin/users/${user.id}/lock`

    const { error } = await apiFetch(endpoint, {
      method: 'POST',
      credentials: 'include',
    })

    if (error) {
      toast.error(error)
    } else {
      toast.success(user.isLocked ? 'Da mo khoa tai khoan' : 'Da khoa tai khoan')
      await fetchUsers()
    }
    setProcessingId(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)

    const { error } = await apiFetch(`/admin/users/${deleteTarget.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (error) {
      toast.error(error)
    } else {
      toast.success('Da xoa nguoi dung')
      setDeleteTarget(null)
      await fetchUsers()
    }
    setDeleting(false)
  }

  async function handleRoleChange(user: AdminUser, newRole: 'admin' | 'user') {
    setProcessingId(user.id)

    const { error } = await apiFetch(`/admin/users/${user.id}/role`, {
      method: 'POST',
      credentials: 'include',
      body: { role: newRole },
    })

    if (error) {
      toast.error(error)
    } else {
      toast.success(`Da chuyen vai tro thanh ${newRole}`)
      await fetchUsers()
    }
    setProcessingId(null)
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <h1 className="text-2xl font-bold text-[#181113] mb-6">Nguoi dung</h1>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#89616b]" />
          <input
            type="text"
            placeholder="Tim kiem theo email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#e6dbde] rounded-lg bg-white focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value)
                setPage(1)
              }}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === opt.value
                  ? 'bg-[#ec1349] text-white'
                  : 'bg-white border border-[#e6dbde] text-[#89616b] hover:bg-[#f8f6f6]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-[#ec1349]" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e6dbde] p-12 text-center">
          <Users className="size-10 text-[#e6dbde] mx-auto mb-3" />
          <p className="text-sm text-[#89616b]">Khong tim thay nguoi dung nao</p>
        </div>
      ) : (
        <>
          {/* User list */}
          <div className="bg-white rounded-xl border border-[#e6dbde] overflow-hidden divide-y divide-[#f4f0f1]">
            {users.map((user) => (
              <div
                key={user.id}
                className="px-6 py-4 hover:bg-[#f8f6f6] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#181113] truncate">
                      {user.email}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {/* Role badge */}
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-[#f4f0f1] text-[#89616b]'
                      }`}>
                        {user.role}
                      </span>
                      {/* Status badge */}
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isLocked
                          ? 'bg-[#ec1349]/10 text-[#ec1349]'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.isLocked ? 'Da khoa' : 'Hoat dong'}
                      </span>
                      {/* Invitation count */}
                      <span className="text-xs text-[#89616b]">
                        {user.invitationCount} thiep
                      </span>
                      {/* Created date */}
                      <span className="text-xs text-[#89616b]">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 flex-wrap">
                    {/* Lock/Unlock */}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleLockToggle(user)}
                      disabled={processingId === user.id}
                      title={user.isLocked ? 'Mo khoa' : 'Khoa'}
                      className="hover:bg-[#f4f0f1]"
                    >
                      {processingId === user.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : user.isLocked ? (
                        <Unlock className="size-3.5 text-green-600" />
                      ) : (
                        <Lock className="size-3.5 text-orange-500" />
                      )}
                    </Button>

                    {/* View detail */}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setDetailUserId(user.id)
                        setDetailOpen(true)
                      }}
                      title="Xem chi tiet"
                      className="hover:bg-[#f4f0f1]"
                    >
                      <Eye className="size-3.5 text-[#89616b]" />
                    </Button>

                    {/* Role change */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRoleChange(user, user.role === 'admin' ? 'user' : 'admin')}
                      disabled={processingId === user.id}
                      title={user.role === 'admin' ? 'Chuyen thanh user' : 'Chuyen thanh admin'}
                      className="text-xs gap-1 hover:bg-[#f4f0f1]"
                    >
                      {user.role === 'admin' ? (
                        <>
                          <ShieldOff className="size-3.5 text-[#89616b]" />
                          <span className="hidden sm:inline">User</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="size-3.5 text-blue-500" />
                          <span className="hidden sm:inline">Admin</span>
                        </>
                      )}
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(user)}
                      className="text-red-500 hover:bg-red-50"
                      title="Xoa"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
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
              <span className="text-sm text-[#89616b]">
                {page} / {totalPages}
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Xac nhan xoa</DialogTitle>
            <DialogDescription>
              Ban co chac muon xoa vinh vien nguoi dung nay? Tat ca thiep cuoi va hinh anh se bi xoa.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-[#f8f6f6] rounded-lg p-3 text-sm text-[#181113]">
            {deleteTarget?.email}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Huy
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1"
            >
              {deleting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              Xoa vinh vien
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User detail dialog */}
      <UserDetailDialog
        userId={detailUserId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
