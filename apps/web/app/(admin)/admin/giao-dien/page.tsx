'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Palette, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiFetch, apiUpload } from '@/lib/api'
import type { ThemeInfo } from '@repo/types'

/** Colored placeholder when thumbnail is null */
const THEME_COLORS: Record<string, string> = {
  traditional: 'bg-rose-100 text-rose-700',
  modern: 'bg-sky-100 text-sky-700',
  minimalist: 'bg-gray-100 text-gray-600',
}

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<ThemeInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editTag, setEditTag] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchThemes()
  }, [])

  async function fetchThemes() {
    setLoading(true)
    const { data, error } = await apiFetch<ThemeInfo[]>('/admin/themes', {
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
    } else if (data) {
      setThemes(data)
    }
    setLoading(false)
  }

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
      // Use FormData for thumbnail upload
      const formData = new FormData()
      formData.append('name', editName)
      formData.append('tag', editTag)
      formData.append('thumbnail', editFile)

      const { data, error } = await apiUpload<ThemeInfo>(
        `/admin/themes/${id}`,
        formData,
        'PUT',
      )
      if (error) {
        toast.error(error)
        setSaving(false)
        return
      }
      if (data) {
        setThemes((prev) => prev.map((t) => (t.id === data.id ? data : t)))
      }
    } else {
      // JSON body for name/tag only
      const { data, error } = await apiFetch<ThemeInfo>(`/admin/themes/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: { name: editName, tag: editTag },
      })
      if (error) {
        toast.error(error)
        setSaving(false)
        return
      }
      if (data) {
        setThemes((prev) => prev.map((t) => (t.id === data.id ? data : t)))
      }
    }

    toast.success('Da cap nhat giao dien')
    setSaving(false)
    cancelEditing()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="size-5 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">Giao dien</h1>
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
        <Palette className="size-5 text-gray-700" />
        <h1 className="text-xl font-semibold text-gray-900">Giao dien</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Giao dien da vo hieu hoa se khong hien thi trong trinh chon mau cho nguoi dung.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Thumbnail or placeholder */}
            {theme.thumbnail ? (
              <img
                src={theme.thumbnail}
                alt={theme.name}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div
                className={`w-full h-40 flex items-center justify-center text-lg font-medium ${THEME_COLORS[theme.id] ?? 'bg-gray-100 text-gray-500'}`}
              >
                {theme.name}
              </div>
            )}

            <div className="p-4">
              {editingId === theme.id ? (
                /* ---------- Edit mode ---------- */
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Ten</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Tag</label>
                    <input
                      type="text"
                      value={editTag}
                      onChange={(e) => setEditTag(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Hinh thu nho</label>
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
                      className="block w-full text-xs text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-gray-900 text-white hover:bg-gray-800 gap-1"
                      onClick={() => handleSave(theme.id)}
                      disabled={saving}
                    >
                      {saving && <Loader2 className="size-3 animate-spin" />}
                      Luu
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditing}
                      disabled={saving}
                    >
                      Huy
                    </Button>
                  </div>
                </div>
              ) : (
                /* ---------- Display mode ---------- */
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{theme.name}</h3>
                      <span className="text-xs text-gray-500">{theme.tag}</span>
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
    </div>
  )
}
