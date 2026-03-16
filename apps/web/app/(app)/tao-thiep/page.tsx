'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { THEMES, type ThemeId } from '@/components/templates/themes'
import { ArrowRight, Lightbulb } from 'lucide-react'

const THEME_OPTIONS: Array<{ id: ThemeId; label: string; description: string; color: string }> = [
  { id: 'modern-red', label: 'Hien Dai Do', description: 'Nang dong, tre trung', color: '#ec1349' },
  { id: 'soft-pink', label: 'Hong Dao', description: 'Ngot ngao, lang man', color: '#E88D8D' },
  { id: 'brown-gold', label: 'Nau Vang', description: 'Sang trong, co dien', color: '#8B6F47' },
  { id: 'olive-green', label: 'Xanh Olive', description: 'Tu nhien, thanh lich', color: '#6B7A3C' },
  { id: 'minimalist-bw', label: 'Toi Gian', description: 'Don gian, tinh te', color: '#171717' },
  { id: 'classic-red-gold', label: 'Do Vang Co Dien', description: 'Truyen thong, am ap', color: '#8B1A1A' },
]

export default function CreateWizardPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<ThemeId | null>(null)
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

  return (
    <div className="min-h-[calc(100vh-2rem)]">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#89616b] mb-6">
        <Link href="/dashboard" className="hover:text-[#181113] transition-colors">Tong quan</Link>
        <span>/</span>
        <span className="text-[#181113] font-medium">Tao thiep moi</span>
      </nav>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#181113] tracking-tight">Tao thiep cuoi cua ban</h1>
        <p className="text-[#89616b] mt-1">Hoan thanh cac buoc don gian ben duoi de co mot tam thiep cuoi tuyet dep.</p>
      </div>

      {/* Step indicator */}
      <div className="bg-white rounded-2xl border border-[#e6dbde] shadow-sm overflow-hidden max-w-[800px]">
        <div className="px-6 pt-5 pb-4 border-b border-[#e6dbde]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#89616b]">
              Buoc {step} tren 2
            </p>
            <span className="text-xs font-semibold text-[#89616b] bg-[#f4f0f1] rounded-full px-3 py-1">
              {progress}% Hoan thanh
            </span>
          </div>
          <div className="h-1.5 bg-[#f4f0f1] rounded-full overflow-hidden">
            <div className="h-full bg-[#ec1349] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex mt-3 gap-4">
            <button
              onClick={() => step === 2 && setStep(1)}
              className={`text-sm font-medium transition-colors ${step === 1 ? 'text-[#ec1349]' : 'text-[#89616b] hover:text-[#181113]'}`}
            >
              1. Chon giao dien
            </button>
            <button
              disabled={!selectedTemplate}
              className={`text-sm font-medium transition-colors ${step === 2 ? 'text-[#ec1349]' : 'text-[#89616b]'}`}
            >
              2. Thong tin cap doi
            </button>
          </div>
        </div>

        {/* Step content */}
        {step === 1 ? (
          <div className="p-6">
            <h2 className="text-lg font-bold text-[#181113] mb-1">Chon giao dien</h2>
            <p className="text-sm text-[#89616b] mb-5">Chon mot giao dien phu hop voi phong cach cua ban</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {THEME_OPTIONS.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                      isSelected
                        ? 'border-[#ec1349] bg-[#ec1349]/5 shadow-md'
                        : 'border-[#e6dbde] hover:border-[#ec1349]/40 hover:shadow-sm'
                    }`}
                  >
                    {/* Color preview */}
                    <div
                      className="w-full aspect-[4/3] rounded-lg mb-3 relative overflow-hidden"
                      style={{ backgroundColor: tpl.color + '15' }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full" style={{ backgroundColor: tpl.color, opacity: 0.8 }} />
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 size-6 rounded-full bg-[#ec1349] flex items-center justify-center">
                          <svg className="size-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#181113]">{tpl.label}</p>
                    <p className="text-xs text-[#89616b] mt-0.5">{tpl.description}</p>
                    {isSelected ? (
                      <div className="mt-3 bg-[#ec1349] text-white rounded-lg py-1.5 text-xs font-bold">Da chon</div>
                    ) : (
                      <div className="mt-3 border border-[#e6dbde] text-[#89616b] rounded-lg py-1.5 text-xs font-medium hover:border-[#ec1349] hover:text-[#ec1349] transition-colors">Chon giao dien</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <h2 className="text-lg font-bold text-[#181113] mb-1">Thong tin cap doi</h2>
            <p className="text-sm text-[#89616b] mb-5">Nhap ten co dau va chu re</p>

            <div className="space-y-5 max-w-md">
              <div>
                <label className="block text-sm font-semibold text-[#181113] mb-1.5">
                  Ten chu re <span className="text-[#ec1349]">*</span>
                </label>
                <input
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  placeholder="Nguyen Van A"
                  className="w-full h-11 px-4 rounded-lg border border-[#e6dbde] text-[#181113] placeholder:text-[#c4b5ba] focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#181113] mb-1.5">
                  Ten co dau <span className="text-[#ec1349]">*</span>
                </label>
                <input
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  placeholder="Tran Thi B"
                  className="w-full h-11 px-4 rounded-lg border border-[#e6dbde] text-[#181113] placeholder:text-[#c4b5ba] focus:outline-none focus:border-[#ec1349] focus:ring-1 focus:ring-[#ec1349] transition-colors"
                />
              </div>

              {/* Tip */}
              <div className="flex items-start gap-3 bg-[#fff5f7] rounded-lg p-4">
                <Lightbulb className="size-5 text-[#ec1349] shrink-0 mt-0.5" />
                <p className="text-sm text-[#5e4d52]">Ban co the thay doi ten sau khi tao thiep trong trang chinh sua.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#faf8f9] border-t border-[#e6dbde]">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              disabled={loading}
              className="h-10 px-5 rounded-lg border border-[#e6dbde] text-sm font-medium text-[#89616b] hover:bg-white hover:text-[#181113] transition-colors"
            >
              Quay lai
            </button>
          )}
          {step === 1 && (
            <Link
              href="/dashboard"
              className="h-10 px-5 rounded-lg border border-[#e6dbde] text-sm font-medium text-[#89616b] hover:bg-white hover:text-[#181113] transition-colors inline-flex items-center"
            >
              Huy bo
            </Link>
          )}
          {step === 1 ? (
            <button
              onClick={() => selectedTemplate && setStep(2)}
              disabled={!selectedTemplate}
              className="h-10 px-6 rounded-lg bg-[#ec1349] hover:bg-[#d01140] text-white text-sm font-bold inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Tiep tuc
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!brideName.trim() || !groomName.trim() || loading}
              className="h-10 px-6 rounded-lg bg-[#ec1349] hover:bg-[#d01140] text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? 'Dang tao...' : 'Tao thiep'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
