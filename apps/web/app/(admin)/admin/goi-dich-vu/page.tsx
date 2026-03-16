'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import type { SystemSettings } from '@repo/types'

export default function AdminServicePlansPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [maxPhotos, setMaxPhotos] = useState(10)
  const [maxPhotosPremium, setMaxPhotosPremium] = useState(20)
  const [maxPhotoSizeMb, setMaxPhotoSizeMb] = useState(5)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    const { data, error } = await apiFetch<SystemSettings>('/admin/system-settings', {
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
    } else if (data) {
      setSettings(data)
      setMaxPhotos(data.uploadLimits.maxPhotosPerInvitation)
      setMaxPhotosPremium(data.uploadLimits.maxPhotosPremium)
      setMaxPhotoSizeMb(data.uploadLimits.maxPhotoSizeMb)
    }
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await apiFetch<SystemSettings>('/admin/system-settings', {
      method: 'PUT',
      credentials: 'include',
      body: {
        uploadLimits: {
          maxPhotosPerInvitation: maxPhotos,
          maxPhotosPremium,
          maxPhotoSizeMb,
        },
      },
    })
    if (error) {
      toast.error(error)
    } else {
      toast.success('Da luu cau hinh')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="size-5 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">Goi dich vu</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  const limits = settings?.uploadLimits

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="size-5 text-gray-700" />
        <h1 className="text-xl font-semibold text-gray-900">Goi dich vu</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">So sanh goi va cau hinh gioi han</p>

      {/* Tier comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Free tier */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mien phi</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex justify-between">
              <span>So anh toi da</span>
              <span className="font-medium">{limits?.maxPhotosPerInvitation ?? '---'} anh</span>
            </li>
            <li className="flex justify-between">
              <span>Tat ca giao dien</span>
              <span className="font-medium text-green-600">Co</span>
            </li>
            <li className="flex justify-between">
              <span>Watermark</span>
              <span className="font-medium text-amber-600">Co</span>
            </li>
            <li className="flex justify-between">
              <span>Thiep da xuat ban</span>
              <span className="font-medium">Toi da 1</span>
            </li>
          </ul>
        </div>

        {/* Premium tier */}
        <div className="bg-white rounded-xl border-2 border-amber-300 p-5">
          <h3 className="text-lg font-semibold text-amber-700 mb-4">Premium</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex justify-between">
              <span>So anh toi da</span>
              <span className="font-medium">{limits?.maxPhotosPremium ?? '---'} anh</span>
            </li>
            <li className="flex justify-between">
              <span>Tat ca giao dien</span>
              <span className="font-medium text-green-600">Co</span>
            </li>
            <li className="flex justify-between">
              <span>Watermark</span>
              <span className="font-medium text-green-600">Khong</span>
            </li>
            <li className="flex justify-between">
              <span>Thiep da xuat ban</span>
              <span className="font-medium">Khong gioi han</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Edit limits form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Chinh sua gioi han</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">So anh toi da (Mien phi)</label>
            <input
              type="number"
              min={1}
              value={maxPhotos}
              onChange={(e) => setMaxPhotos(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">So anh toi da (Premium)</label>
            <input
              type="number"
              min={1}
              value={maxPhotosPremium}
              onChange={(e) => setMaxPhotosPremium(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Kich thuoc anh toi da (MB)</label>
            <input
              type="number"
              min={1}
              value={maxPhotoSizeMb}
              onChange={(e) => setMaxPhotoSizeMb(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button
            className="bg-gray-900 text-white hover:bg-gray-800 gap-1"
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            Luu cau hinh
          </Button>
        </div>
      </div>
    </div>
  )
}
