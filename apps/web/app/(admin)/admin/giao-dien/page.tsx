'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Palette,
  Pencil,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiFetch, apiUpload } from '@/lib/api'
import type { ThemeInfo, CustomThemeListItem } from '@repo/types'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Colored placeholder when built-in theme thumbnail is null */
const THEME_COLORS: Record<string, string> = {
  traditional: 'bg-rose-100 text-rose-700',
  modern: 'bg-sky-100 text-sky-700',
  minimalist: 'bg-[#f4f0f1] text-[#89616b]',
}

/** Built-in themes available as clone sources */
const BUILT_IN_THEMES = [
  { id: 'modern-red', name: 'Hien dai - Do' },
  { id: 'soft-pink', name: 'Hong Pastel' },
  { id: 'brown-gold', name: 'Nau Vang' },
  { id: 'olive-green', name: 'Xanh Olive' },
  { id: 'minimalist-bw', name: 'Toi gian' },
  { id: 'classic-red-gold', name: 'Co dien - Do Vang' },
]

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: { label: 'Nhap', className: 'bg-gray-100 text-gray-600' },
  published: { label: 'Da xuat ban', className: 'bg-green-100 text-green-700' },
  disabled: { label: 'Vo hieu hoa', className: 'bg-red-100 text-red-600' },
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function AdminThemesPage() {
  const router = useRouter()
  const [themes, setThemes] = useState<ThemeInfo[]>([])
  const [customThemes, setCustomThemes] = useState<CustomThemeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Inline editing state for built-in themes
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editTag, setEditTag] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  // "Tao moi" dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newThemeName, setNewThemeName] = useState('')
  const [newBaseTheme, setNewBaseTheme] = useState('modern-red')
  const [creating, setCreating] = useState(false)

  // Custom theme action states
  const [actionId, setActionId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchAllThemes()
  }, [])

  async function fetchAllThemes() {
    setLoading(true)
    const [builtInResult, customResult] = await Promise.all([
      apiFetch<ThemeInfo[]>('/admin/themes', { credentials: 'include' }),
      apiFetch<CustomThemeListItem[]>('/admin/custom-themes', { credentials: 'include' }),
    ])
    if (builtInResult.error) toast.error(builtInResult.error)
    else if (builtInResult.data) setThemes(builtInResult.data)
    if (customResult.error) toast.error(customResult.error)
    else if (customResult.data) setCustomThemes(customResult.data)
    setLoading(false)
  }

  /* ---------- Built-in theme actions ---------- */

  async function handleToggle(id: string) {
    setTogglingId(id)
    const { data, error } = await apiFetch<{ id: string; isActive: boolean }>(
      `/admin/themes/${id}/toggle`,
      { method: 'POST', credentials: 'include' },
    )
    if (error) {
      toast.error(error)
    } else if (data) {
      setThemes((prev) =>
        prev.map((t) => (t.id === data.id ? { ...t, isActive: data.isActive } : t)),
      )
      toast.success(data.isActive ? 'Da kich hoat giao dien' : 'Da vo hieu hoa giao dien')
    }
    setTogglingId(null)
  }

  function startEditing(theme: ThemeInfo) {
    setEditingId(theme.id)
    setEditName(theme.name)
    setEditTag(theme.tag)
    setEditFile(null)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditName('')
    setEditTag('')
    setEditFile(null)
  }

  async function handleSave(id: string) {
    setSaving(true)
    if (editFile) {
      const formData = new FormData()
      formData.append('name', editName)
      formData.append('tag', editTag)
      formData.append('thumbnail', editFile)
      const { data, error } = await apiUpload<ThemeInfo>(
        `/admin/themes/${id}`,
        formData,
        'PUT',
      )
      if (error) { toast.error(error); setSaving(false); return }
      if (data) setThemes((prev) => prev.map((t) => (t.id === data.id ? data : t)))
    } else {
      const { data, error } = await apiFetch<ThemeInfo>(`/admin/themes/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: { name: editName, tag: editTag },
      })
      if (error) { toast.error(error); setSaving(false); return }
      if (data) setThemes((prev) => prev.map((t) => (t.id === data.id ? data : t)))
    }
    toast.success('Da cap nhat giao dien')
    setSaving(false)
    cancelEditing()
  }

  /* ---------- Custom theme actions ---------- */

  async function handleCreate() {
    if (!newThemeName.trim()) { toast.error('Vui long nhap ten giao dien'); return }
    setCreating(true)
    const { data, error } = await apiFetch<{ id: string; slug: string }>(
      '/admin/custom-themes',
      {
        method: 'POST',
        credentials: 'include',
        body: { name: newThemeName, baseTheme: newBaseTheme },
      },
    )
    if (error) { toast.error(error); setCreating(false); return }
    if (data) {
      toast.success('Da tao giao dien moi!')
      setShowCreateDialog(false)
      setNewThemeName('')
      setNewBaseTheme('modern-red')
      setCreating(false)
      router.push(`/admin/giao-dien/${data.slug}`)
    }
  }

  async function handleCustomAction(id: string, action: 'publish' | 'disable') {
    setActionId(id)
    const endpoint = action === 'publish' ? 'publish' : 'disable'
    const { error } = await apiFetch(`/admin/custom-themes/${id}/${endpoint}`, {
      method: 'POST',
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
    } else {
      toast.success(action === 'publish' ? 'Da xuat ban giao dien!' : 'Da vo hieu hoa giao dien!')
      await fetchAllThemes()
    }
    setActionId(null)
  }

  async function handleDelete(id: string) {
    setActionId(id)
    const { error } = await apiFetch(`/admin/custom-themes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
    } else {
      toast.success('Da xoa giao dien')
      setCustomThemes((prev) => prev.filter((t) => t.id !== id))
    }
    setActionId(null)
    setShowDeleteConfirm(null)
  }

  function getActionLabel(status: string) {
    if (status === 'published') return 'Vo hieu hoa'
    if (status === 'disabled') return 'Kich hoat'
    return 'Xuat ban'
  }

  function getActionType(status: string): 'publish' | 'disable' {
    return status === 'published' ? 'disable' : 'publish'
  }

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#181113] mb-6">Giao dien</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-[#ec1349]" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#181113]">Giao dien</h1>
        <Button
          className="bg-[#ec1349] text-white hover:bg-red-600 gap-1.5"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="size-4" />
          Tao moi
        </Button>
      </div>

      {/* ---- Section: Built-in themes ---- */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[#181113] mb-4">Giao dien mac dinh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="bg-white rounded-xl border border-[#e6dbde] overflow-hidden"
            >
              {theme.thumbnail ? (
                <img src={theme.thumbnail} alt={theme.name} className="w-full h-40 object-cover" />
              ) : (
                <div
                  className={`w-full h-40 flex items-center justify-center text-lg font-medium ${THEME_COLORS[theme.id] ?? 'bg-[#f4f0f1] text-[#89616b]'}`}
                >
                  {theme.name}
                </div>
              )}
              <div className="p-4">
                {editingId === theme.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#89616b] block mb-1">Ten</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-[#e6dbde] px-3 py-1.5 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#89616b] block mb-1">Tag</label>
                      <input
                        type="text"
                        value={editTag}
                        onChange={(e) => setEditTag(e.target.value)}
                        className="w-full rounded-lg border border-[#e6dbde] px-3 py-1.5 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#89616b] block mb-1">Hinh thu nho</label>
                      {theme.thumbnail && (
                        <img
                          src={theme.thumbnail}
                          alt="Current thumbnail"
                          className="w-16 h-16 object-cover rounded mb-1"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                        className="block w-full text-xs text-[#89616b] file:mr-2 file:rounded-lg file:border-0 file:bg-[#f4f0f1] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#181113] hover:file:bg-[#e6dbde]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-[#ec1349] text-white hover:bg-red-600 gap-1"
                        onClick={() => handleSave(theme.id)}
                        disabled={saving}
                      >
                        {saving && <Loader2 className="size-3 animate-spin" />}
                        Luu
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={saving}>
                        Huy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-[#181113]">{theme.name}</h3>
                        <span className="text-xs text-[#89616b]">{theme.tag}</span>
                      </div>
                      <span
                        className={`inline-block size-2.5 rounded-full mt-1.5 ${theme.isActive ? 'bg-green-500' : 'bg-red-400'}`}
                        title={theme.isActive ? 'Dang kich hoat' : 'Da vo hieu hoa'}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => startEditing(theme)}
                      >
                        <Pencil className="size-3" />
                        Edit
                      </Button>
                      <Button
                        variant={theme.isActive ? 'ghost' : 'default'}
                        size="sm"
                        className={
                          theme.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }
                        onClick={() => handleToggle(theme.id)}
                        disabled={togglingId === theme.id}
                      >
                        {togglingId === theme.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : theme.isActive ? (
                          'Vo hieu hoa'
                        ) : (
                          'Kich hoat'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Section: Custom themes ---- */}
      <section>
        <h2 className="text-lg font-semibold text-[#181113] mb-4">Giao dien tuy chinh</h2>
        {customThemes.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e6dbde] p-8 text-center">
            <Palette className="size-10 mx-auto text-[#e6dbde] mb-3" />
            <p className="text-sm text-[#89616b]">
              Chua co giao dien tuy chinh nao. Nhan &quot;Tao moi&quot; de bat dau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customThemes.map((ct) => {
              const config = (ct as unknown as { config?: Record<string, unknown> }).config
              const primaryColor = (config?.primaryColor as string) ?? '#ec1349'
              const bgColor = (config?.backgroundColor as string) ?? '#f8f6f6'
              const textColor = (config?.textColor as string) ?? '#181113'
              const badge = STATUS_BADGES[ct.status] ?? STATUS_BADGES.draft

              return (
                <div
                  key={ct.id}
                  className="bg-white rounded-xl border border-[#e6dbde] overflow-hidden"
                >
                  {/* Auto-generated color swatch thumbnail */}
                  <div className="w-full h-40 flex flex-col">
                    <div
                      className="h-1/3"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div
                      className="h-2/3 flex items-center justify-center"
                      style={{ backgroundColor: bgColor }}
                    >
                      <span
                        className="text-sm font-medium truncate px-3"
                        style={{ color: textColor }}
                      >
                        {ct.name}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-[#181113]">{ct.name}</h3>
                        <span className="text-xs text-[#89616b]">
                          Dua tren: {ct.baseTheme}
                        </span>
                      </div>
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => router.push(`/admin/giao-dien/${ct.slug}`)}
                      >
                        <Pencil className="size-3" />
                        Chinh sua
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={
                          ct.status === 'published'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }
                        onClick={() => handleCustomAction(ct.id, getActionType(ct.status))}
                        disabled={actionId === ct.id}
                      >
                        {actionId === ct.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          getActionLabel(ct.status)
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => setShowDeleteConfirm(ct.id)}
                        disabled={actionId === ct.id}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Delete confirmation inline */}
                  {showDeleteConfirm === ct.id && (
                    <div className="border-t border-[#e6dbde] p-4 bg-red-50">
                      <p className="text-xs text-red-700 mb-2">
                        Ban co chac chan muon xoa giao dien nay?
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-red-600 text-white hover:bg-red-700 gap-1"
                          onClick={() => handleDelete(ct.id)}
                          disabled={actionId === ct.id}
                        >
                          {actionId === ct.id && <Loader2 className="size-3 animate-spin" />}
                          Xoa
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          Huy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ---- "Tao moi" Clone Dialog (overlay) ---- */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-[#e6dbde] shadow-xl w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#181113]">Tao giao dien moi</h3>
              <button
                onClick={() => { setShowCreateDialog(false); setNewThemeName(''); setCreating(false) }}
                className="text-[#89616b] hover:text-[#181113]"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#181113] block mb-1.5">
                  Ten giao dien
                </label>
                <input
                  type="text"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="VD: Hoa hong do"
                  className="w-full rounded-lg border border-[#e6dbde] px-3 py-2 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#181113] block mb-1.5">
                  Giao dien goc (clone tu)
                </label>
                <select
                  value={newBaseTheme}
                  onChange={(e) => setNewBaseTheme(e.target.value)}
                  className="w-full rounded-lg border border-[#e6dbde] px-3 py-2 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] bg-white"
                >
                  <optgroup label="Giao dien mac dinh">
                    {BUILT_IN_THEMES.map((bt) => (
                      <option key={bt.id} value={bt.id}>
                        {bt.name}
                      </option>
                    ))}
                  </optgroup>
                  {customThemes.filter((ct) => ct.status === 'published').length > 0 && (
                    <optgroup label="Giao dien tuy chinh">
                      {customThemes
                        .filter((ct) => ct.status === 'published')
                        .map((ct) => (
                          <option key={ct.slug} value={ct.slug}>
                            {ct.name}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => { setShowCreateDialog(false); setNewThemeName(''); setCreating(false) }}
              >
                Huy
              </Button>
              <Button
                className="bg-[#ec1349] text-white hover:bg-red-600 gap-1.5"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating && <Loader2 className="size-4 animate-spin" />}
                Tao
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
