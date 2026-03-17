'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiFetch, apiUpload } from '@/lib/api'
import type { SystemSettings } from '@repo/types'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingQr, setUploadingQr] = useState(false)

  // Payment config
  const [bankQrUrl, setBankQrUrl] = useState<string | null>(null)
  const [bankName, setBankName] = useState('')
  const [bankAccountHolder, setBankAccountHolder] = useState('')
  const [pricePerInvitation, setPricePerInvitation] = useState(0)

  // Watermark config
  const [watermarkText, setWatermarkText] = useState('ThiepCuoiOnline.vn')
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.15)

  // Expiry config
  const [gracePeriodDays, setGracePeriodDays] = useState(30)

  // Storage cleanup
  const [cleaningStorage, setCleaningStorage] = useState(false)
  const [showCleanConfirm, setShowCleanConfirm] = useState(false)
  const [cleanResult, setCleanResult] = useState<{ cleanedInvitations: number; estimatedFreedMb: number } | null>(null)

  // Upload limits
  const [maxPhotoSizeMb, setMaxPhotoSizeMb] = useState(5)
  const [maxPhotosPerInvitation, setMaxPhotosPerInvitation] = useState(10)
  const [maxPhotosPremium, setMaxPhotosPremium] = useState(20)

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
      setLoading(false)
      return
    }
    if (data) {
      // Payment config
      setBankQrUrl(data.paymentConfig.bankQrUrl)
      setBankName(data.paymentConfig.bankName)
      setBankAccountHolder(data.paymentConfig.bankAccountHolder)
      setPricePerInvitation(data.paymentConfig.pricePerInvitation)
      // Watermark config
      setWatermarkText(data.watermarkConfig.text)
      setWatermarkOpacity(data.watermarkConfig.opacity)
      // Expiry config
      setGracePeriodDays(data.expiryConfig.gracePeriodDays)
      // Upload limits
      setMaxPhotoSizeMb(data.uploadLimits.maxPhotoSizeMb)
      setMaxPhotosPerInvitation(data.uploadLimits.maxPhotosPerInvitation)
      setMaxPhotosPremium(data.uploadLimits.maxPhotosPremium)
    }
    setLoading(false)
  }

  async function handleUploadBankQr(file: File) {
    setUploadingQr(true)
    const formData = new FormData()
    formData.append('file', file)
    const { data, error } = await apiUpload<{ bankQrUrl: string }>(
      '/admin/system-settings/bank-qr',
      formData,
    )
    if (error) {
      toast.error(error)
    } else if (data) {
      setBankQrUrl(data.bankQrUrl)
      toast.success('Da tai anh QR len')
    }
    setUploadingQr(false)
  }

  async function handleSave() {
    setSaving(true)
    const body: Partial<SystemSettings> = {
      paymentConfig: {
        bankQrUrl,
        bankName,
        bankAccountHolder,
        pricePerInvitation,
      },
      watermarkConfig: {
        text: watermarkText,
        opacity: watermarkOpacity,
      },
      expiryConfig: {
        gracePeriodDays,
      },
      uploadLimits: {
        maxPhotoSizeMb,
        maxPhotosPerInvitation,
        maxPhotosPremium,
      },
    }

    const { error } = await apiFetch<SystemSettings>('/admin/system-settings', {
      method: 'PUT',
      credentials: 'include',
      body,
    })
    if (error) {
      toast.error(error)
    } else {
      toast.success('Da luu cai dat he thong')
    }
    setSaving(false)
  }

  async function handleClearStorage() {
    setCleaningStorage(true)
    try {
      const { data, error } = await apiFetch<{ cleanedInvitations: number; estimatedFreedMb: number }>('/admin/clear-storage', {
        method: 'POST',
        credentials: 'include',
      })
      if (error) {
        toast.error(error)
      } else if (data) {
        setCleanResult(data)
        toast.success(`Da doc dep ${data.cleanedInvitations} thiep, giai phong ~${data.estimatedFreedMb}MB`)
      }
    } catch {
      toast.error('Loi khi doc dep luu tru')
    }
    setCleaningStorage(false)
    setShowCleanConfirm(false)
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#181113] mb-6">Cai dat he thong</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-[#ec1349]" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#181113] mb-6">Cai dat he thong</h1>

      <div className="space-y-6">
        {/* Section 1: Thanh toan */}
        <div className="bg-white rounded-xl border border-[#e6dbde] p-5">
          <h3 className="text-sm font-semibold text-[#89616b] mb-4">Thanh toan</h3>

          {/* Bank QR image */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-[#89616b] block mb-1">Anh QR ngan hang</label>
            <div className="flex items-start gap-4">
              {bankQrUrl ? (
                <img
                  src={bankQrUrl}
                  alt="Bank QR"
                  className="w-24 h-24 object-contain rounded border border-[#e6dbde]"
                />
              ) : (
                <div className="w-24 h-24 rounded border border-dashed border-[#e6dbde] flex items-center justify-center text-xs text-[#89616b]">
                  Chua co
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUploadBankQr(f)
                  }}
                  className="block text-xs text-[#89616b] file:mr-2 file:rounded-lg file:border-0 file:bg-[#f4f0f1] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#181113] hover:file:bg-[#e6dbde]"
                />
                {uploadingQr && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-[#89616b]">
                    <Loader2 className="size-3 animate-spin" /> Dang tai...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#89616b] block mb-1">Ten ngan hang</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-lg border border-[#e6dbde] px-3 py-1.5 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#89616b] block mb-1">Chu tai khoan</label>
              <input
                type="text"
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                className="w-full rounded-lg border border-[#e6dbde] px-3 py-1.5 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold text-[#89616b] block mb-1">Gia moi thiep (VND)</label>
            <input
              type="number"
              min={0}
              value={pricePerInvitation}
              onChange={(e) => setPricePerInvitation(Number(e.target.value))}
              className="w-full max-w-xs rounded-lg border border-[#e6dbde] px-3 py-1.5 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
            />
          </div>
          <p className="mt-3 text-xs text-[#89616b]">
            Thong tin nay se hien thi tren trang nang cap cua nguoi dung. Thay the cac bien moi
            truong NEXT_PUBLIC_ADMIN_BANK_*.
          </p>
          <div className="mt-4">
            <Button
              className="bg-[#ec1349] text-white hover:bg-red-600 font-bold gap-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Luu cai dat
            </Button>
          </div>
        </div>

        {/* Section 2: Watermark */}
        <div className="bg-white rounded-xl border border-[#e6dbde] p-5">
          <h3 className="text-sm font-semibold text-[#89616b] mb-4">Watermark</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#89616b] block mb-1">Noi dung watermark</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full rounded-lg border border-[#e6dbde] px-3 py-1.5 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#89616b] block mb-1">
                Do mo (opacity): {watermarkOpacity}
              </label>
              <input
                type="range"
                min={0.05}
                max={0.5}
                step={0.05}
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                className="w-full mt-1"
              />
              <div className="flex justify-between text-xs text-[#89616b]">
                <span>0.05</span>
                <span>0.5</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button
              className="bg-[#ec1349] text-white hover:bg-red-600 font-bold gap-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Luu cai dat
            </Button>
          </div>
        </div>

        {/* Section 3: Het han thiep */}
        <div className="bg-white rounded-xl border border-[#e6dbde] p-5">
          <h3 className="text-sm font-semibold text-[#89616b] mb-4">Het han thiep</h3>
          <div>
            <label className="text-xs font-semibold text-[#89616b] block mb-1">
              So ngay gia han sau ngay cuoi (ngay)
            </label>
            <input
              type="number"
              min={0}
              value={gracePeriodDays}
              onChange={(e) => setGracePeriodDays(Number(e.target.value))}
              className="w-full max-w-xs rounded-lg border border-[#e6dbde] px-3 py-1.5 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
            />
          </div>
          <p className="mt-2 text-xs text-[#89616b]">
            Sau ngay cuoi + so ngay gia han, thiep se chuyen sang trang cam on.
          </p>
          <div className="mt-4">
            <Button
              className="bg-[#ec1349] text-white hover:bg-red-600 font-bold gap-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Luu cai dat
            </Button>
          </div>
        </div>

        {/* Section 4: Gioi han tai len */}
        <div className="bg-white rounded-xl border border-[#e6dbde] p-5">
          <h3 className="text-sm font-semibold text-[#89616b] mb-4">Gioi han tai len</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#89616b] block mb-1">
                Kich thuoc anh toi da (MB)
              </label>
              <input
                type="number"
                min={1}
                value={maxPhotoSizeMb}
                onChange={(e) => setMaxPhotoSizeMb(Number(e.target.value))}
                className="w-full rounded-lg border border-[#e6dbde] px-3 py-1.5 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#89616b] block mb-1">
                So anh toi da (Mien phi)
              </label>
              <input
                type="number"
                min={1}
                value={maxPhotosPerInvitation}
                onChange={(e) => setMaxPhotosPerInvitation(Number(e.target.value))}
                className="w-full rounded-lg border border-[#e6dbde] px-3 py-1.5 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#89616b] block mb-1">
                So anh toi da (Premium)
              </label>
              <input
                type="number"
                min={1}
                value={maxPhotosPremium}
                onChange={(e) => setMaxPhotosPremium(Number(e.target.value))}
                className="w-full rounded-lg border border-[#e6dbde] px-3 py-1.5 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              className="bg-[#ec1349] text-white hover:bg-red-600 font-bold gap-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Luu cai dat
            </Button>
          </div>
        </div>

        {/* Section 5: Doc dep luu tru */}
        <div className="bg-white rounded-xl border border-[#e6dbde] p-5">
          <h3 className="text-sm font-semibold text-[#89616b] mb-4">Doc dep luu tru</h3>
          <p className="text-sm text-[#89616b] mb-4">
            Xoa anh, nhac, avatar va QR cua cac thiep cuoi da het han hoac da xoa. Khong anh huong den thiep dang hoat dong.
          </p>

          {cleanResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
              Da doc dep {cleanResult.cleanedInvitations} thiep, giai phong ~{cleanResult.estimatedFreedMb}MB
            </div>
          )}

          {!showCleanConfirm ? (
            <Button
              className="bg-[#ec1349] text-white hover:bg-red-600 font-bold gap-1.5"
              onClick={() => setShowCleanConfirm(true)}
            >
              <Trash2 className="size-3.5" />
              Doc dep luu tru
            </Button>
          ) : (
            <div className="bg-[#f8f6f6] border border-[#e6dbde] rounded-lg p-4">
              <p className="text-sm font-medium text-[#181113] mb-3">
                Ban co chac chan muon xoa media cua cac thiep da het han va da xoa?
              </p>
              <p className="text-xs text-[#89616b] mb-3">
                Hanh dong nay khong the hoan tac. Chi xoa media cua thiep het han hoac da xoa.
              </p>
              <div className="flex gap-2">
                <Button
                  className="bg-[#ec1349] text-white hover:bg-red-600 font-bold gap-1"
                  onClick={handleClearStorage}
                  disabled={cleaningStorage}
                >
                  {cleaningStorage && <Loader2 className="size-3.5 animate-spin" />}
                  Xac nhan doc dep
                </Button>
                <Button
                  variant="outline"
                  className="border-[#e6dbde] text-[#181113] font-bold"
                  onClick={() => setShowCleanConfirm(false)}
                  disabled={cleaningStorage}
                >
                  Huy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
