'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { THEMES, type ThemeId } from '@/components/templates/themes'

const THEME_OPTIONS: Array<{ id: ThemeId; label: string; style: string; color: string }> = [
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
  const [selectedTemplate, setSelectedTemplate] = useState<ThemeId | null>(null)
  const [brideName, setBrideName] = useState('')
  const [groomName, setGroomName] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="flex flex-1 flex-col h-full min-w-0 bg-white -m-8">
      {/* Header with step indicator — exact Stitch header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-[#f4f0f1] bg-white sticky top-0 z-30">
        <div className="hidden md:flex items-center gap-4">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            {step === 2 ? (
              <div className="flex items-center justify-center size-6 rounded-full bg-green-500 text-white text-xs font-bold">
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            ) : (
              <div className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs font-bold shadow-md shadow-primary/30">1</div>
            )}
            <span className={`text-sm font-${step === 1 ? 'bold text-primary' : 'medium text-[#181113]'}`}>
              Chon giao dien
            </span>
          </div>

          <div className="w-8 h-[1px] bg-[#f4f0f1]" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            {step === 2 ? (
              <div className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs font-bold shadow-md shadow-primary/30">2</div>
            ) : (
              <div className="flex items-center justify-center size-6 rounded-full border border-[#f4f0f1] bg-white text-[#89616b] text-xs font-bold">2</div>
            )}
            <span className={`text-sm ${step === 2 ? 'font-bold text-primary' : 'font-medium text-[#89616b]'}`}>
              Thong tin cap doi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-bold text-[#57484b] hover:text-[#181113] transition-colors">
            Huy bo
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-[#fbf9fa] p-4 md:p-8 lg:px-12">
        {step === 1 ? (
          /* Step 1: Choose template — exact Stitch layout */
          <div className="mx-auto max-w-[1200px] flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-[#181113] tracking-tight mb-2">Chon giao dien</h1>
                <p className="text-[#89616b] text-base font-medium max-w-xl">Chon mot mau thiep cuoi phu hop voi phong cach cua ban. Tat ca deu mien phi va co the tuy chinh sau.</p>
              </div>
            </div>

            {/* Theme grid — exact Stitch card layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
              {THEME_OPTIONS.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id
                return (
                  <div
                    key={tpl.id}
                    className={`group flex flex-col bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
                      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-[#f4f0f1]'
                    }`}
                    onClick={() => setSelectedTemplate(tpl.id)}
                  >
                    {/* Color preview area — aspect-[3/4] like Stitch thumbnail */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: tpl.color + '12' }}>
                      <div className="w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                        <div className="size-20 rounded-full opacity-60" style={{ backgroundColor: tpl.color }} />
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-primary text-white rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Da chon
                        </div>
                      )}
                      {/* Hover preview overlay — exact Stitch */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="flex items-center gap-2 bg-white text-[#181113] px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-50 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          Xem truoc
                        </span>
                      </div>
                    </div>
                    {/* Card info — exact Stitch padding and typography */}
                    <div className="p-4 flex flex-col gap-3">
                      <div>
                        <h3 className="font-bold text-[#181113] text-lg">{tpl.label}</h3>
                        <p className="text-xs text-[#89616b] font-medium mt-1">Phong cach: {tpl.style}</p>
                      </div>
                      <button
                        className={`w-full mt-auto py-2.5 rounded-lg font-bold text-sm transition-all active:scale-[0.98] ${
                          isSelected
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90'
                        }`}
                      >
                        {isSelected ? 'Da chon' : 'Chon giao dien'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Fixed bottom action bar */}
            {selectedTemplate && (
              <div className="sticky bottom-0 bg-white border-t border-[#f4f0f1] px-6 py-4 -mx-4 md:-mx-8 lg:-mx-12 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-[#d60b3f] text-white px-6 py-2.5 text-sm font-bold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                >
                  <span>Tiep tuc</span>
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Couple names — exact Stitch card layout from step1.html */
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            <nav className="flex flex-wrap gap-2 text-sm">
              <Link href="/dashboard" className="text-[#89616b] hover:text-primary transition-colors">Tong quan</Link>
              <span className="text-[#89616b]">/</span>
              <span className="text-[#181113] font-medium">Thong tin cap doi</span>
            </nav>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-[#181113]">Thong tin cap doi</h1>
              <p className="text-[#89616b] text-sm md:text-base">Nhap ten co dau va chu re de bat dau tao thiep.</p>
            </div>

            {/* Form card — exact Stitch white card */}
            <div className="bg-white rounded-xl shadow-sm border border-[#f4f0f1] overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col gap-8">
                {/* Groom name */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181113]" htmlFor="groomName">
                    Ten chu re <span className="text-primary">*</span>
                  </label>
                  <input
                    id="groomName"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    placeholder="Vi du: Nguyen Van A"
                    className="w-full rounded-lg border border-[#e6dbde] bg-transparent px-4 py-3 text-base text-[#181113] placeholder:text-[#89616b]/70 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>

                {/* Bride name */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-[#181113]" htmlFor="brideName">
                    Ten co dau <span className="text-primary">*</span>
                  </label>
                  <input
                    id="brideName"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    placeholder="Vi du: Tran Thi B"
                    className="w-full rounded-lg border border-[#e6dbde] bg-transparent px-4 py-3 text-base text-[#181113] placeholder:text-[#89616b]/70 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>

                {/* Tip — exact Stitch style */}
                <div className="bg-[#fff5f7] rounded-lg p-4 flex gap-4 items-start border border-primary/10">
                  <div className="bg-white p-2 rounded-full text-primary shrink-0 shadow-sm">
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#181113] mb-1">Meo nho</h4>
                    <p className="text-sm text-[#57484b]">Ban co the thay doi ten bat cu luc nao trong trang chinh sua thiep.</p>
                  </div>
                </div>
              </div>

              {/* Footer — exact Stitch */}
              <div className="bg-[#faf8f9] px-6 md:px-8 py-4 border-t border-[#f4f0f1] flex justify-end items-center gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm font-bold text-[#57484b] hover:text-[#181113] px-4 py-2 transition-colors"
                >
                  Quay lai
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!brideName.trim() || !groomName.trim() || loading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-[#d60b3f] text-white px-6 py-2.5 text-sm font-bold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Dang tao...' : 'Tao thiep'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
