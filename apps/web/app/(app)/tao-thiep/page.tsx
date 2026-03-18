'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

interface ThemeOption {
  id: string
  label: string
  style: string
  color: string
  isCustom?: boolean
}

const BUILTIN_THEMES: ThemeOption[] = [
  { id: 'modern-red', label: 'Hien Dai Do', style: 'Hien dai, Tuoi sang', color: '#ec1349' },
  { id: 'soft-pink', label: 'Hong Dao', style: 'Nhe nhang, Lang man', color: '#E88D8D' },
  { id: 'brown-gold', label: 'Nau Vang', style: 'Am ap, Co dien', color: '#8B6F47' },
  { id: 'olive-green', label: 'Xanh Olive', style: 'Tu nhien, Thanh lich', color: '#6B7A3C' },
  { id: 'minimalist-bw', label: 'Toi Gian', style: 'Toi gian, Hien dai', color: '#171717' },
  { id: 'classic-red-gold', label: 'Do Vang Co Dien', style: 'Truyen thong, Quy phai', color: '#8B1A1A' },
]

export default function CreateWizardPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [customThemes, setCustomThemes] = useState<ThemeOption[]>([])

  useEffect(() => {
    fetch(`${API_URL}/themes`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Array<{ slug: string; name: string; config: Record<string, unknown> }>) =>
        setCustomThemes(
          data.map((t) => ({
            id: t.slug,
            label: t.name,
            style: 'Tuy chinh',
            color: (t.config.primaryColor as string) ?? '#ec1349',
            isCustom: true,
          }))
        )
      )
      .catch(() => {})
  }, [])

  const allThemes = [...BUILTIN_THEMES, ...customThemes]
  const [brideName, setBrideName] = useState('')
  const [groomName, setGroomName] = useState('')
  const [loading, setLoading] = useState(false)

  const progress = step === 1 ? 50 : 100

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
        throw new Error(err.message ?? 'Khong the tao thiep')
      }
      const invitation = await res.json()
      router.push(`/thep-cuoi/${invitation.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Da co loi xay ra.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Step 1: Couple names (Stitch "Buoc 1" layout) ── */
  if (step === 1) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#f8f6f6] p-4 md:p-8 -m-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {/* Breadcrumb — exact Stitch */}
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link href="/dashboard" className="text-[#89616b] hover:text-primary transition-colors">Tong quan</Link>
            <span className="text-[#89616b]">/</span>
            <Link href="/dashboard" className="text-[#89616b] hover:text-primary transition-colors">Thiep cuoi cua toi</Link>
            <span className="text-[#89616b]">/</span>
            <span className="text-[#181113] font-medium">Tao thiep moi</span>
          </nav>

          {/* Title — exact Stitch */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#181113]">Bat dau tao thiep cuoi cua ban</h1>
            <p className="text-[#89616b] text-sm md:text-base">Hoan thanh cac buoc don gian ben duoi de co mot tam thiep cuoi tuyet dep.</p>
          </div>

          {/* Progress card — exact Stitch "BUOC 1 TREN 2" card */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#f4f0f1]">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Buoc 1 tren 2</p>
                  <p className="text-[#181113] text-base font-bold">Thong tin co ban</p>
                </div>
                <span className="text-[#89616b] text-xs font-medium bg-[#f4f0f1] px-2 py-1 rounded">{progress}% Hoan thanh</span>
              </div>
              <div className="w-full bg-[#f4f0f1] rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-xs text-[#89616b] hidden sm:flex">
                <span className="text-primary font-bold">1. Thong tin</span>
                <span>2. Chon mau</span>
              </div>
            </div>
          </div>

          {/* Form card — exact Stitch white card with form */}
          <div className="bg-white rounded-xl shadow-sm border border-[#f4f0f1] overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col gap-8">
              {/* Section header — exact Stitch */}
              <div className="flex flex-col gap-1 border-b border-[#f4f0f1] pb-4">
                <h3 className="text-lg font-bold text-[#181113]">Thong tin cap doi</h3>
                <p className="text-sm text-[#89616b]">Nhap ten chu re va co dau. Ban co the thay doi sau.</p>
              </div>

              {/* Groom name — exact Stitch input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#181113]" htmlFor="groomName">
                  Ten chu re <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="groomName"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    placeholder="Vi du: Nguyen Van A"
                    className="w-full rounded-lg border border-[#e6dbde] bg-transparent px-4 py-3 text-base text-[#181113] placeholder:text-[#89616b]/70 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                  <div className="absolute right-3 top-3 text-[#89616b]">
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                  </div>
                </div>
              </div>

              {/* Bride name — exact Stitch input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#181113]" htmlFor="brideName">
                  Ten co dau <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="brideName"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    placeholder="Vi du: Tran Thi B"
                    className="w-full rounded-lg border border-[#e6dbde] bg-transparent px-4 py-3 text-base text-[#181113] placeholder:text-[#89616b]/70 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                  <div className="absolute right-3 top-3 text-[#89616b]">
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                  </div>
                </div>
                <p className="text-xs text-[#89616b] mt-1 flex gap-1 items-center">
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Ban co the doi ten bat cu luc nao trong phan chinh sua.
                </p>
              </div>

              {/* Tip box — exact Stitch */}
              <div className="bg-[#fff5f7] rounded-lg p-4 flex gap-4 items-start border border-primary/10">
                <div className="bg-white p-2 rounded-full text-primary shrink-0 shadow-sm">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#181113] mb-1">Meo nho</h4>
                  <p className="text-sm text-[#57484b]">Hay nhap dung ten de hien thi tren thiep cuoi. Ten se xuat hien o phan tieu de chinh cua thiep.</p>
                </div>
              </div>
            </div>

            {/* Footer — exact Stitch bg-[#faf8f9] */}
            <div className="bg-[#faf8f9] px-6 md:px-8 py-4 border-t border-[#f4f0f1] flex justify-end items-center gap-4">
              <Link href="/dashboard" className="text-sm font-bold text-[#57484b] hover:text-[#181113] px-4 py-2 transition-colors">
                Huy bo
              </Link>
              <button
                onClick={() => {
                  if (groomName.trim() && brideName.trim()) setStep(2)
                  else toast.error('Vui long nhap ten chu re va co dau')
                }}
                disabled={!groomName.trim() || !brideName.trim()}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-[#d60b3f] text-white px-6 py-2.5 text-sm font-bold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Tiep tuc</span>
                <svg className="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Step 2: Choose template — same layout as Step 1 ── */
  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f6f6] p-4 md:p-8 -m-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* Breadcrumb — same as step 1 */}
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link href="/dashboard" className="text-[#89616b] hover:text-primary transition-colors">Tong quan</Link>
          <span className="text-[#89616b]">/</span>
          <Link href="/dashboard" className="text-[#89616b] hover:text-primary transition-colors">Thiep cuoi cua toi</Link>
          <span className="text-[#89616b]">/</span>
          <span className="text-[#181113] font-medium">Tao thiep moi</span>
        </nav>

        {/* Title — same as step 1 */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-[#181113]">Bat dau tao thiep cuoi cua ban</h1>
          <p className="text-[#89616b] text-sm md:text-base">Hoan thanh cac buoc don gian ben duoi de co mot tam thiep cuoi tuyet dep.</p>
        </div>

        {/* Progress card — BUOC 2 TREN 2, 100% */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#f4f0f1]">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Buoc 2 tren 2</p>
                <p className="text-[#181113] text-base font-bold">Chon giao dien</p>
              </div>
              <span className="text-[#89616b] text-xs font-medium bg-[#f4f0f1] px-2 py-1 rounded">100% Hoan thanh</span>
            </div>
            <div className="w-full bg-[#f4f0f1] rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-2 rounded-full transition-all duration-500 ease-out" style={{ width: '100%' }} />
            </div>
            <div className="flex justify-between text-xs text-[#89616b] hidden sm:flex">
              <span className="text-green-600 font-bold">1. Thong tin ✓</span>
              <span className="text-primary font-bold">2. Chon mau</span>
            </div>
          </div>
        </div>

        {/* Content card — template grid inside white card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#f4f0f1] overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col gap-6">
            {/* Section header */}
            <div className="flex flex-col gap-1 border-b border-[#f4f0f1] pb-4">
              <h3 className="text-lg font-bold text-[#181113]">Chon giao dien</h3>
              <p className="text-sm text-[#89616b]">Chon mot mau thiep cuoi phu hop voi phong cach cua ban.</p>
            </div>

            {/* Theme grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allThemes.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id
                return (
                  <div
                    key={tpl.id}
                    className={`group flex flex-col bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-[#f4f0f1]'
                    }`}
                    onClick={() => setSelectedTemplate(tpl.id)}
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: tpl.color + '12' }}>
                      <div className="w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                        <div className="size-16 rounded-full opacity-60" style={{ backgroundColor: tpl.color }} />
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-white rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
                          <svg className="size-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Da chon
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="flex items-center gap-1.5 bg-white text-[#181113] px-3 py-1.5 rounded-full font-bold text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          Xem truoc
                        </span>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col gap-2">
                      <div>
                        <h3 className="font-bold text-[#181113] text-sm">{tpl.label}</h3>
                        <p className="text-[10px] text-[#89616b] font-medium mt-0.5">Phong cach: {tpl.style}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedTemplate(tpl.id) }}
                        className="w-full py-2 rounded-lg bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
                      >
                        {isSelected ? 'Da chon' : 'Chon giao dien'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer — same style as step 1 */}
          <div className="bg-[#faf8f9] px-6 md:px-8 py-4 border-t border-[#f4f0f1] flex justify-end items-center gap-4">
            <button
              onClick={() => setStep(1)}
              className="text-sm font-bold text-[#57484b] hover:text-[#181113] px-4 py-2 transition-colors"
            >
              Quay lai
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedTemplate || loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-[#d60b3f] text-white px-6 py-2.5 text-sm font-bold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Dang tao...' : 'Tao thiep'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
