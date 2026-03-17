'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { apiFetch, apiUpload } from '@/lib/api'
import { SharedTemplate } from '@/components/templates/SharedTemplate'
import { buildThemeConfig } from '@/components/templates/themes'
import type { ThemeConfig } from '@/components/templates/themes'
import type { CustomTheme } from '@repo/types'
import type { Invitation } from '@repo/types'
import { plusJakartaSans } from '@/lib/fonts'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Sample Invitation for live preview                                 */
/* ------------------------------------------------------------------ */

const SAMPLE_INVITATION: Invitation = {
  id: 'sample-preview',
  userId: '',
  slug: 'preview',
  status: 'published',
  templateId: 'custom-preview',
  groomName: 'Minh Quan',
  brideName: 'Thuy Linh',
  groomFather: 'Nguyen Van Hung',
  groomMother: 'Tran Thi Hoa',
  groomCeremonyDate: '2026-06-15',
  groomCeremonyTime: '10:00',
  groomVenueName: 'Nha hang Galaxy',
  groomVenueAddress: '123 Nguyen Hue, TP.HCM',
  brideFather: 'Le Van Thanh',
  brideMother: 'Pham Thi Mai',
  brideCeremonyDate: '2026-06-14',
  brideCeremonyTime: '09:00',
  brideVenueName: 'Trung tam Tiec cuoi Diamond',
  brideVenueAddress: '456 Le Loi, TP.HCM',
  ceremonyProgram: [
    { time: '10:00', title: 'Don khach', description: 'Tiep don quan khach' },
    { time: '10:30', title: 'Le thanh hon', description: 'Nghi le chinh thuc' },
    { time: '11:00', title: 'Tiec mung', description: 'Tiep dai tiec mung' },
  ],
  loveStory: [
    { date: '2020-03-15', title: 'Lan dau gap go', description: 'Chung toi gap nhau tai quan ca phe nho o Sai Gon' },
    { date: '2022-09-20', title: 'Cau hon', description: 'Anh cau hon em duoi anh hoang hon o bien Da Nang' },
  ],
  venueMapUrl: '',
  groomAvatarUrl: null,
  brideAvatarUrl: null,
  groomNickname: 'Quan',
  brideNickname: 'Linh',
  invitationMessage: 'Tran trong kinh moi quy khach den du buoi tiec chung vui cung gia dinh chung toi.',
  thankYouText: 'Cam on ban da den chung vui cung chung toi!',
  teaserMessage: 'Save the Date!',
  photoUrls: [],
  musicTrackId: null,
  bankQrUrl: null,
  bankName: 'Vietcombank',
  bankAccountHolder: 'Nguyen Minh Quan',
  bankAccountNumber: '0123456789',
  brideBankQrUrl: null,
  brideBankName: 'Techcombank',
  brideBankAccountHolder: 'Le Thuy Linh',
  brideBankAccountNumber: '9876543210',
  plan: 'premium',
  paymentStatus: 'none',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
}

/* ------------------------------------------------------------------ */
/*  ColorField component                                               */
/* ------------------------------------------------------------------ */

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (hex: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-[#e6dbde] cursor-pointer p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value)
        }}
        className="w-24 rounded-lg border border-[#e6dbde] px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
        placeholder="#000000"
      />
      <span className="text-xs text-[#89616b]">{label}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Status badge config                                                */
/* ------------------------------------------------------------------ */

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: { label: 'Nhap', className: 'bg-gray-100 text-gray-600' },
  published: { label: 'Da xuat ban', className: 'bg-green-100 text-green-700' },
  disabled: { label: 'Vo hieu hoa', className: 'bg-red-100 text-red-600' },
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function ThemeBuilderPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const [theme, setTheme] = useState<CustomTheme | null>(null)
  const [config, setConfig] = useState<ThemeConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Background image upload
  const [backgroundImageFile, setBackgroundImageFile] = useState<File | null>(null)
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadTheme() {
      setLoading(true)
      const { data, error } = await apiFetch<CustomTheme>(
        `/admin/custom-themes/${params.slug}`,
        { credentials: 'include' },
      )
      if (error) {
        toast.error(error)
        setLoading(false)
        return
      }
      if (data) {
        setTheme(data)
        const parsed = buildThemeConfig(data.config)
        // Ensure name from theme record is used
        parsed.name = data.name
        // If backgroundImageUrl exists on the theme, set it
        if (data.backgroundImageUrl) {
          parsed.backgroundImageUrl = data.backgroundImageUrl
        }
        setConfig(parsed)
      }
      setLoading(false)
    }
    loadTheme()
  }, [params.slug])

  /* ---------- Config update helpers ---------- */

  function updateConfig<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function updatePetalColor(index: number, hex: string) {
    setConfig((prev) => {
      if (!prev) return prev
      const colors = [...prev.petalColors]
      colors[index] = hex
      return { ...prev, petalColors: colors }
    })
  }

  function handleBackgroundFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBackgroundImageFile(file)
    setBackgroundPreview(URL.createObjectURL(file))
  }

  function removeBackgroundImage() {
    setBackgroundImageFile(null)
    setBackgroundPreview(null)
    updateConfig('backgroundImageUrl', undefined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ---------- Save logic ---------- */

  async function handleSave(publish = false) {
    if (!theme || !config) return
    setSaving(true)

    const formData = new FormData()
    // Build config JSON for the server -- include all ThemeConfig fields
    const configPayload: Record<string, unknown> = { ...config }
    formData.append('config', JSON.stringify(configPayload))
    formData.append('name', config.name)
    if (publish) formData.append('status', 'published')
    if (backgroundImageFile) formData.append('backgroundImage', backgroundImageFile)

    const { data, error } = await apiUpload<CustomTheme>(
      `/admin/custom-themes/${theme.id}`,
      formData,
      'PUT',
    )
    if (error) {
      toast.error(error)
      setSaving(false)
      return
    }

    if (publish && data) {
      await apiFetch(`/admin/custom-themes/${theme.id}/publish`, {
        method: 'POST',
        credentials: 'include',
      })
    }

    toast.success(publish ? 'Da xuat ban giao dien!' : 'Da luu nhap')

    // Refresh theme data after save
    if (data) {
      setTheme(data)
      const parsed = buildThemeConfig(data.config)
      parsed.name = data.name
      if (data.backgroundImageUrl) {
        parsed.backgroundImageUrl = data.backgroundImageUrl
      }
      setConfig(parsed)
      setBackgroundImageFile(null)
      setBackgroundPreview(null)
    }

    setSaving(false)
  }

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-[#ec1349]" />
        </div>
      </div>
    )
  }

  if (!theme || !config) {
    return (
      <div className="p-6">
        <p className="text-[#89616b]">Khong tim thay giao dien.</p>
        <Link href="/admin/giao-dien" className="text-[#ec1349] text-sm mt-2 inline-block">
          Quay lai
        </Link>
      </div>
    )
  }

  const badge = STATUS_BADGES[theme.status] ?? STATUS_BADGES.draft
  const currentBgImage = backgroundPreview ?? config.backgroundImageUrl ?? null

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* ===== LEFT PANEL: Form (55%) ===== */}
      <div className="w-[55%] flex flex-col border-r border-[#e6dbde] bg-[#f8f6f6]">
        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Back link */}
          <Link
            href="/admin/giao-dien"
            className="inline-flex items-center gap-1.5 text-sm text-[#89616b] hover:text-[#181113]"
          >
            <ArrowLeft className="size-4" />
            Quay lai danh sach
          </Link>

          {/* Section 1: Thong tin */}
          <section className="bg-white rounded-xl border border-[#e6dbde] p-5">
            <h2 className="text-sm font-semibold text-[#181113] mb-4">Thong tin</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#89616b] block mb-1">Ten giao dien</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig('name', e.target.value)}
                  className="w-full rounded-lg border border-[#e6dbde] px-3 py-2 text-sm focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349]"
                />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs text-[#89616b] block mb-1">Giao dien goc</label>
                  <span className="text-sm text-[#181113]">{theme.baseTheme}</span>
                </div>
                <div>
                  <label className="text-xs text-[#89616b] block mb-1">Trang thai</label>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Mau sac */}
          <section className="bg-white rounded-xl border border-[#e6dbde] p-5">
            <h2 className="text-sm font-semibold text-[#181113] mb-4">Mau sac</h2>
            <div className="space-y-3">
              <ColorField label="Mau chinh" value={config.primaryColor} onChange={(v) => updateConfig('primaryColor', v)} />
              <ColorField label="Mau nen" value={config.backgroundColor} onChange={(v) => updateConfig('backgroundColor', v)} />
              <ColorField label="Mau be mat" value={config.surfaceColor} onChange={(v) => updateConfig('surfaceColor', v)} />
              <ColorField label="Mau chu" value={config.textColor} onChange={(v) => updateConfig('textColor', v)} />
              <ColorField label="Mau chu phu" value={config.mutedTextColor} onChange={(v) => updateConfig('mutedTextColor', v)} />
            </div>
          </section>

          {/* Section 3: Canh hoa */}
          <section className="bg-white rounded-xl border border-[#e6dbde] p-5">
            <h2 className="text-sm font-semibold text-[#181113] mb-4">Canh hoa</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.petalEnabled}
                  onChange={(e) => updateConfig('petalEnabled', e.target.checked)}
                  className="w-4 h-4 rounded border-[#e6dbde] text-[#ec1349] focus:ring-[#ec1349]"
                />
                <span className="text-sm text-[#181113]">Kich hoat canh hoa</span>
              </label>
              {config.petalEnabled && (
                <div className="space-y-2 pl-7">
                  {config.petalColors.slice(0, 4).map((color, i) => (
                    <ColorField
                      key={i}
                      label={`Canh hoa ${i + 1}`}
                      value={color}
                      onChange={(v) => updatePetalColor(i, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Thanh dieu huong */}
          <section className="bg-white rounded-xl border border-[#e6dbde] p-5">
            <h2 className="text-sm font-semibold text-[#181113] mb-4">Thanh dieu huong</h2>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="navStyle"
                  checked={config.navStyle === 'colored'}
                  onChange={() => updateConfig('navStyle', 'colored')}
                  className="w-4 h-4 text-[#ec1349] focus:ring-[#ec1349]"
                />
                <span className="text-sm text-[#181113]">Mau sac</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="navStyle"
                  checked={config.navStyle === 'mono'}
                  onChange={() => updateConfig('navStyle', 'mono')}
                  className="w-4 h-4 text-[#ec1349] focus:ring-[#ec1349]"
                />
                <span className="text-sm text-[#181113]">Don sac</span>
              </label>
            </div>
          </section>

          {/* Section 5: Chan trang */}
          <section className="bg-white rounded-xl border border-[#e6dbde] p-5">
            <h2 className="text-sm font-semibold text-[#181113] mb-4">Chan trang</h2>
            <div className="space-y-3">
              <ColorField label="Mau nen chan trang" value={config.footerBg.startsWith('#') ? config.footerBg : '#ffffff'} onChange={(v) => updateConfig('footerBg', v)} />
              <ColorField label="Mau chu chan trang" value={config.footerTextColor} onChange={(v) => updateConfig('footerTextColor', v)} />
            </div>
          </section>

          {/* Section 6: Hinh nen */}
          <section className="bg-white rounded-xl border border-[#e6dbde] p-5">
            <h2 className="text-sm font-semibold text-[#181113] mb-4">Hinh nen</h2>
            <div className="space-y-3">
              {currentBgImage ? (
                <div className="relative inline-block">
                  <img
                    src={currentBgImage}
                    alt="Background preview"
                    className="w-32 h-20 object-cover rounded-lg border border-[#e6dbde]"
                  />
                  <button
                    onClick={removeBackgroundImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-[#89616b]">
                  <ImageIcon className="size-4" />
                  Chua co hinh nen
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleBackgroundFileChange}
                  className="block w-full text-xs text-[#89616b] file:mr-2 file:rounded-lg file:border-0 file:bg-[#f4f0f1] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#181113] hover:file:bg-[#e6dbde]"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sticky bottom bar */}
        <div className="sticky bottom-0 border-t border-[#e6dbde] bg-white px-6 py-4 flex items-center justify-between">
          <Link
            href="/admin/giao-dien"
            className="text-sm text-[#89616b] hover:text-[#181113]"
          >
            Quay lai
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Luu nhap
            </Button>
            <Button
              className="bg-[#ec1349] text-white hover:bg-red-600 gap-1.5"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Xuat ban
            </Button>
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL: Live Preview (45%) ===== */}
      <div className="w-[45%] bg-[#f0eced] flex items-center justify-center p-6 overflow-y-auto">
        {/* Phone mockup frame */}
        <div className="relative w-[280px] h-[580px] bg-white rounded-[32px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15),0_0_0_10px_#181113] overflow-hidden border-[6px] border-[#181113] shrink-0">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#181113] rounded-b-xl z-20" />
          {/* Screen */}
          <div
            className={cn(
              'w-full h-full overflow-y-auto bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
              plusJakartaSans.variable,
              'font-[family-name:var(--font-display)]',
            )}
          >
            <SharedTemplate
              invitation={SAMPLE_INVITATION}
              theme={config}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
