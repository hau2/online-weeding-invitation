'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { THEMES, type ThemeId } from '@/components/templates/themes'
import { ArrowLeft, ArrowRight, Lightbulb, Search, Info, Star, Lock, Crown, Eye } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Theme options with Stitch-style metadata                          */
/* ------------------------------------------------------------------ */
const THEME_OPTIONS: Array<{
  id: ThemeId
  label: string
  description: string
  style: string
  color: string
  isFree: boolean
  isNew?: boolean
}> = [
  { id: 'modern-red', label: 'Hiện Đại Đỏ', description: 'Năng động, trẻ trung', style: 'Hiện đại, Tươi sáng', color: '#ec1349', isFree: true, isNew: true },
  { id: 'soft-pink', label: 'Hồng Đào', description: 'Ngọt ngào, lãng mạn', style: 'Nhẹ nhàng, Lãng mạn', color: '#E88D8D', isFree: true },
  { id: 'brown-gold', label: 'Nâu Vàng', description: 'Sang trọng, cổ điển', style: 'Ấm áp, Cổ điển', color: '#8B6F47', isFree: false },
  { id: 'olive-green', label: 'Xanh Olive', description: 'Tự nhiên, thanh lịch', style: 'Tự nhiên, Thanh lịch', color: '#6B7A3C', isFree: true },
  { id: 'minimalist-bw', label: 'Tối Giản', description: 'Đơn giản, tinh tế', style: 'Tối giản, Hiện đại', color: '#171717', isFree: false },
  { id: 'classic-red-gold', label: 'Đỏ Vàng Cổ Điển', description: 'Truyền thống, ấm áp', style: 'Truyền thống, Quý phái', color: '#8B1A1A', isFree: true },
]

type FilterTab = 'all' | 'free' | 'vip' | 'traditional' | 'modern'

const FILTER_TABS: Array<{ id: FilterTab; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'free', label: 'Miễn phí' },
  { id: 'vip', label: 'VIP' },
  { id: 'traditional', label: 'Truyền thống' },
  { id: 'modern', label: 'Hiện đại' },
]

/* Map themes to categories for filtering */
const THEME_CATEGORIES: Record<ThemeId, { traditional: boolean; modern: boolean }> = {
  'modern-red': { traditional: false, modern: true },
  'soft-pink': { traditional: false, modern: true },
  'brown-gold': { traditional: true, modern: false },
  'olive-green': { traditional: false, modern: true },
  'minimalist-bw': { traditional: false, modern: true },
  'classic-red-gold': { traditional: true, modern: false },
}

/* ------------------------------------------------------------------ */
/*  Step Indicator Component                                           */
/* ------------------------------------------------------------------ */
function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const percent = currentStep === 1 ? 33 : currentStep === 2 ? 66 : 100
  const steps = [
    { num: 1, label: 'Tên thiệp' },
    { num: 2, label: 'Chọn mẫu' },
    { num: 3, label: 'Cặp đôi' },
  ]

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-[#f4f0f1]">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[#ec1349] text-xs font-bold uppercase tracking-wider mb-1">
              Bước {currentStep} trên 3
            </p>
            <p className="text-[#181113] text-base font-bold">
              {currentStep === 1 ? 'Thông tin cơ bản' : currentStep === 2 ? 'Chọn giao diện' : 'Thông tin cặp đôi'}
            </p>
          </div>
          <span className="text-[#89616b] text-xs font-medium bg-[#f4f0f1] px-2 py-1 rounded">
            {percent}% Hoàn thành
          </span>
        </div>
        <div className="w-full bg-[#f4f0f1] rounded-full h-2 overflow-hidden">
          <div
            className="bg-[#ec1349] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="hidden sm:flex justify-between text-xs text-[#89616b]">
          {steps.map((s) => (
            <span
              key={s.num}
              className={s.num === currentStep ? 'text-[#ec1349] font-bold' : s.num < currentStep ? 'text-[#181113] font-medium' : ''}
            >
              {s.num}. {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Name the invitation                                      */
/* ------------------------------------------------------------------ */
function Step1({
  invitationName,
  setInvitationName,
  onCancel,
  onNext,
}: {
  invitationName: string
  setInvitationName: (v: string) => void
  onCancel: () => void
  onNext: () => void
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#f4f0f1] overflow-hidden">
      <div className="p-6 md:p-8 flex flex-col gap-8">
        {/* Section header */}
        <div className="flex flex-col gap-1 border-b border-[#f4f0f1] pb-4">
          <h3 className="text-lg font-bold text-[#181113]">Đặt tên cho dự án</h3>
          <p className="text-sm text-[#89616b]">
            Tên này chỉ dùng để bạn quản lý, khách mời sẽ không nhìn thấy.
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#181113]" htmlFor="invitationName">
            Tên thiệp (nội bộ) <span className="text-[#ec1349]">*</span>
          </label>
          <div className="relative">
            <input
              id="invitationName"
              name="invitationName"
              type="text"
              value={invitationName}
              onChange={(e) => setInvitationName(e.target.value)}
              placeholder="Ví dụ: Đám cưới Tùng & Chi - 2024"
              className="w-full rounded-lg border border-[#e6dbde] bg-transparent px-4 py-3 text-base text-[#181113] placeholder:text-[#89616b]/70 focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] focus:outline-none transition-all"
            />
            <div className="absolute right-3 top-3 text-[#89616b]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </div>
          </div>
          <p className="text-xs text-[#89616b] mt-1 flex gap-1 items-center">
            <Info className="size-3.5 shrink-0" />
            Bạn có thể đổi tên này bất cứ lúc nào trong phần cài đặt.
          </p>
        </div>

        {/* Tip box */}
        <div className="bg-[#fff5f7] rounded-lg p-4 flex gap-4 items-start border border-[#ec1349]/10">
          <div className="bg-white p-2 rounded-full text-[#ec1349] shrink-0 shadow-sm">
            <Lightbulb className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#181113] mb-1">Mẹo nhỏ</h4>
            <p className="text-sm text-[#57484b]">
              Hãy đặt tên bao gồm &ldquo;Năm&rdquo; hoặc &ldquo;Địa điểm&rdquo; nếu bạn tạo nhiều thiệp khác nhau để dễ phân biệt.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#faf8f9] px-6 md:px-8 py-4 border-t border-[#f4f0f1] flex justify-end items-center gap-4">
        <button
          onClick={onCancel}
          className="text-sm font-bold text-[#57484b] hover:text-[#181113] px-4 py-2 transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          onClick={onNext}
          disabled={!invitationName.trim()}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#ec1349] hover:bg-[#d60b3f] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 text-sm font-bold transition-all shadow-md shadow-[#ec1349]/20 hover:shadow-lg hover:shadow-[#ec1349]/30 active:scale-95"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Choose template                                           */
/* ------------------------------------------------------------------ */
function Step2({
  selectedTemplate,
  setSelectedTemplate,
  onBack,
  onNext,
}: {
  selectedTemplate: ThemeId | null
  setSelectedTemplate: (id: ThemeId) => void
  onBack: () => void
  onNext: () => void
}) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredThemes = useMemo(() => {
    return THEME_OPTIONS.filter((theme) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (
          !theme.label.toLowerCase().includes(q) &&
          !theme.description.toLowerCase().includes(q) &&
          !theme.style.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      // Tab filter
      if (activeFilter === 'free') return theme.isFree
      if (activeFilter === 'vip') return !theme.isFree
      if (activeFilter === 'traditional') return THEME_CATEGORIES[theme.id].traditional
      if (activeFilter === 'modern') return THEME_CATEGORIES[theme.id].modern
      return true
    })
  }, [activeFilter, searchQuery])

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-[#f4f0f1]">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89616b]">
            <Search className="size-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên (VD: Hồng Đào, Tối Giản...)"
            className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#f8f6f6] border-none text-[#181113] placeholder-[#89616b] focus:ring-2 focus:ring-[#ec1349]/20 text-sm font-medium"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 items-center scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`whitespace-nowrap h-9 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                activeFilter === tab.id
                  ? 'bg-[#181113] text-white shadow-md shadow-black/10'
                  : 'bg-[#f4f0f1] text-[#5d4046] hover:bg-[#eae6e7]'
              }`}
            >
              {tab.id === 'vip' && <Star className="size-3.5 text-yellow-500" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThemes.map((theme) => {
          const isVip = !theme.isFree
          const isSelected = selectedTemplate === theme.id

          return (
            <div
              key={theme.id}
              className={`group flex flex-col bg-white rounded-2xl overflow-hidden border shadow-sm transition-all duration-300 ${
                isSelected
                  ? 'border-[#ec1349] shadow-xl shadow-[#ec1349]/10 -translate-y-1 ring-2 ring-[#ec1349]/20'
                  : isVip
                    ? 'border-[#f4f0f1] relative'
                    : 'border-[#f4f0f1] hover:shadow-xl hover:shadow-[#ec1349]/10 hover:-translate-y-1'
              }`}
            >
              {/* VIP overlay */}
              {isVip && (
                <div className="absolute inset-0 z-10 bg-white/40 pointer-events-none group-hover:bg-white/10 transition-colors" />
              )}

              {/* Theme preview */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
                <div
                  className={`w-full h-full transition-transform duration-700 ${isVip ? 'grayscale-[30%]' : 'group-hover:scale-110'}`}
                  style={{
                    background: `linear-gradient(135deg, ${theme.color}15 0%, ${theme.color}30 50%, ${theme.color}10 100%)`,
                  }}
                >
                  {/* Theme color preview circles */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div
                        className="size-20 rounded-full shadow-lg"
                        style={{ backgroundColor: theme.color, opacity: 0.9 }}
                      />
                      <div className="flex gap-2">
                        {THEMES[theme.id].petalColors.slice(0, 3).map((c, i) => (
                          <div
                            key={i}
                            className="size-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* VIP lock overlay */}
                {isVip && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 size-12 rounded-full bg-gray-900/80 text-white flex items-center justify-center backdrop-blur-sm shadow-xl">
                    <Lock className="size-5" />
                  </div>
                )}

                {/* Badges */}
                {theme.isNew && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-[#181113] shadow-sm z-20">
                    Mới nhất
                  </div>
                )}
                {isVip ? (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full text-xs font-bold shadow-sm z-20 flex items-center gap-1">
                    <Crown className="size-3" /> VIP
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold shadow-sm z-20">
                    Miễn phí
                  </div>
                )}

                {/* Selected check overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-[#ec1349]/20 flex items-center justify-center z-20">
                    <div className="size-16 rounded-full bg-[#ec1349] text-white flex items-center justify-center shadow-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                  </div>
                )}

                {/* Hover preview button (non-VIP only) */}
                {!isVip && !isSelected && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
                    <button className="flex items-center gap-2 bg-white text-[#181113] px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-50 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="size-4" /> Xem trước
                    </button>
                  </div>
                )}
              </div>

              {/* Card info */}
              <div className={`p-4 flex flex-col gap-3 ${isVip ? 'relative z-20 bg-white' : ''}`}>
                <div>
                  <h3 className={`font-bold text-lg ${isVip ? 'text-[#5d4046]' : 'text-[#181113]'}`}>
                    {theme.label}
                  </h3>
                  <p className="text-xs text-[#89616b] font-medium mt-1">
                    Phong cách: {theme.style}
                  </p>
                </div>
                {isVip ? (
                  <button className="w-full mt-auto py-2.5 rounded-lg bg-[#f4f0f1] text-[#89616b] font-bold text-sm hover:bg-[#e0dadc] transition-all flex items-center justify-center gap-2">
                    <Lock className="size-4" /> Nâng cấp để mở
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedTemplate(theme.id)}
                    className={`w-full mt-auto py-2.5 rounded-lg font-bold text-sm transition-all ${
                      isSelected
                        ? 'bg-[#ec1349] text-white shadow-lg shadow-[#ec1349]/20'
                        : 'bg-[#ec1349] text-white shadow-lg shadow-[#ec1349]/20 hover:bg-[#ec1349]/90 active:scale-[0.98]'
                    }`}
                  >
                    {isSelected ? 'Đã chọn' : 'Chọn giao diện'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* No results */}
      {filteredThemes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#89616b] text-sm">Không tìm thấy giao diện phù hợp.</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="bg-white rounded-xl px-6 md:px-8 py-4 border border-[#f4f0f1] shadow-sm flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-[#57484b] hover:text-[#181113] px-4 py-2 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Quay lại
        </button>
        <button
          onClick={onNext}
          disabled={!selectedTemplate}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#ec1349] hover:bg-[#d60b3f] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 text-sm font-bold transition-all shadow-md shadow-[#ec1349]/20 hover:shadow-lg hover:shadow-[#ec1349]/30 active:scale-95"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Couple names                                              */
/* ------------------------------------------------------------------ */
function Step3({
  brideName,
  setBrideName,
  groomName,
  setGroomName,
  loading,
  onBack,
  onSubmit,
}: {
  brideName: string
  setBrideName: (v: string) => void
  groomName: string
  setGroomName: (v: string) => void
  loading: boolean
  onBack: () => void
  onSubmit: () => void
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#f4f0f1] overflow-hidden">
      <div className="p-6 md:p-8 flex flex-col gap-8">
        {/* Section header */}
        <div className="flex flex-col gap-1 border-b border-[#f4f0f1] pb-4">
          <h3 className="text-lg font-bold text-[#181113]">Thông tin cặp đôi</h3>
          <p className="text-sm text-[#89616b]">
            Nhập tên cô dâu và chú rể để hoàn tất thiệp cưới.
          </p>
        </div>

        {/* Bride name */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#181113]" htmlFor="brideName">
            Tên cô dâu <span className="text-[#ec1349]">*</span>
          </label>
          <input
            id="brideName"
            name="brideName"
            type="text"
            value={brideName}
            onChange={(e) => setBrideName(e.target.value)}
            placeholder="Nguyễn Thị Minh"
            className="w-full rounded-lg border border-[#e6dbde] bg-transparent px-4 py-3 text-base text-[#181113] placeholder:text-[#89616b]/70 focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] focus:outline-none transition-all"
          />
        </div>

        {/* Groom name */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[#181113]" htmlFor="groomName">
            Tên chú rể <span className="text-[#ec1349]">*</span>
          </label>
          <input
            id="groomName"
            name="groomName"
            type="text"
            value={groomName}
            onChange={(e) => setGroomName(e.target.value)}
            placeholder="Trần Văn Thảo"
            className="w-full rounded-lg border border-[#e6dbde] bg-transparent px-4 py-3 text-base text-[#181113] placeholder:text-[#89616b]/70 focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] focus:outline-none transition-all"
          />
        </div>

        {/* Tip box */}
        <div className="bg-[#fff5f7] rounded-lg p-4 flex gap-4 items-start border border-[#ec1349]/10">
          <div className="bg-white p-2 rounded-full text-[#ec1349] shrink-0 shadow-sm">
            <Lightbulb className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#181113] mb-1">Lưu ý</h4>
            <p className="text-sm text-[#57484b]">
              Tên cặp đôi sẽ được hiển thị trên thiệp cưới. Bạn có thể chỉnh sửa sau trong phần quản lý thiệp.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#faf8f9] px-6 md:px-8 py-4 border-t border-[#f4f0f1] flex justify-between items-center">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-bold text-[#57484b] hover:text-[#181113] px-4 py-2 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="size-4" />
          Quay lại
        </button>
        <button
          onClick={onSubmit}
          disabled={!brideName.trim() || !groomName.trim() || loading}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#ec1349] hover:bg-[#d60b3f] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 text-sm font-bold transition-all shadow-md shadow-[#ec1349]/20 hover:shadow-lg hover:shadow-[#ec1349]/30 active:scale-95"
        >
          {loading ? (
            <>
              <svg className="animate-spin size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Đang tạo...</span>
            </>
          ) : (
            <span>Tạo thiệp</span>
          )}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */
export default function CreateWizardPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [invitationName, setInvitationName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<ThemeId | null>(null)
  const [brideName, setBrideName] = useState('')
  const [groomName, setGroomName] = useState('')
  const [loading, setLoading] = useState(false)

  function handleCancel() {
    router.push('/dashboard')
  }

  async function handleSubmit() {
    if (!selectedTemplate || !brideName.trim() || !groomName.trim()) return
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
      const res = await fetch(`${apiUrl}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          templateId: selectedTemplate,
          brideName: brideName.trim(),
          groomName: groomName.trim(),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Không thể tạo thiệp')
      }
      const invitation = await res.json()
      router.push(`/thep-cuoi/${invitation.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`mx-auto flex flex-col gap-6 ${step === 2 ? 'max-w-[1200px]' : 'max-w-3xl'}`}>
      {/* Breadcrumb */}
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link href="/dashboard" className="text-[#89616b] hover:text-[#ec1349] transition-colors">
          Tổng quan
        </Link>
        <span className="text-[#89616b]">/</span>
        <Link href="/dashboard" className="text-[#89616b] hover:text-[#ec1349] transition-colors">
          Thiệp cưới của tôi
        </Link>
        <span className="text-[#89616b]">/</span>
        <span className="text-[#181113] font-medium">Tạo thiệp mới</span>
      </nav>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-[#181113]">
          {step === 1
            ? 'Bắt đầu tạo thiệp cưới của bạn'
            : step === 2
              ? 'Thư viện giao diện'
              : 'Hoàn tất tạo thiệp'}
        </h1>
        <p className="text-[#89616b] text-sm md:text-base">
          {step === 1
            ? 'Hoàn thành các bước đơn giản bên dưới để có một tấm thiệp cưới tuyệt đẹp.'
            : step === 2
              ? 'Hơn 50+ mẫu thiệp cưới được thiết kế riêng cho các cặp đôi Việt Nam. Từ truyền thống đến hiện đại, tất cả đều sẵn sàng cho bạn.'
              : 'Nhập thông tin cặp đôi để hoàn tất thiệp cưới của bạn.'}
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Step content */}
      {step === 1 && (
        <Step1
          invitationName={invitationName}
          setInvitationName={setInvitationName}
          onCancel={handleCancel}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <Step3
          brideName={brideName}
          setBrideName={setBrideName}
          groomName={groomName}
          setGroomName={setGroomName}
          loading={loading}
          onBack={() => setStep(2)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
