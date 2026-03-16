'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { TemplateId } from '@repo/types'
import { THEMES, type ThemeId } from '@/components/templates/themes'

const THEME_OPTIONS: Array<{ id: ThemeId; label: string; description: string; color: string }> = [
  { id: 'modern-red', label: 'Hien dai Do', description: 'Nang dong, tre trung', color: '#ec1349' },
  { id: 'soft-pink', label: 'Hong Dao', description: 'Ngot ngao, lang man', color: '#e8917a' },
  { id: 'brown-gold', label: 'Nau Vang', description: 'Sang trong, co dien', color: '#8B6914' },
  { id: 'olive-green', label: 'Xanh Olive', description: 'Tu nhien, thanh lich', color: '#5a6b50' },
  { id: 'minimalist-bw', label: 'Toi gian', description: 'Don gian, tinh te', color: '#171717' },
  { id: 'classic-red-gold', label: 'Do Vang', description: 'Truyen thong, am ap', color: '#8B0000' },
]

interface CreateWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWizard({ open, onOpenChange }: CreateWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [brideName, setBrideName] = useState('')
  const [groomName, setGroomName] = useState('')
  const [loading, setLoading] = useState(false)

  function handleClose() {
    // Reset state on close
    setStep(1)
    setSelectedTemplate(null)
    setBrideName('')
    setGroomName('')
    onOpenChange(false)
  }

  async function handleSubmit() {
    if (!selectedTemplate || !brideName.trim() || !groomName.trim()) return
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
      const res = await fetch(`${apiUrl}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // sends httpOnly session cookie
        body: JSON.stringify({
          templateId: selectedTemplate,
          brideName: brideName.trim(),
          groomName: groomName.trim(),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Kh\u00f4ng th\u1ec3 t\u1ea1o thi\u1ec7p')
      }
      const invitation = await res.json()
      handleClose()
      router.push(`/thep-cuoi/${invitation.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '\u0110\u00e3 c\u00f3 l\u1ed7i x\u1ea3y ra. Vui l\u00f2ng th\u1eed l\u1ea1i.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('flex items-center justify-center size-7 rounded-full text-xs font-bold', step === 1 ? 'bg-[#ec1349] text-white' : 'bg-[#e6dbde] text-[#89616b]')}>1</div>
            <div className="h-px flex-1 bg-[#e6dbde]" />
            <div className={cn('flex items-center justify-center size-7 rounded-full text-xs font-bold', step === 2 ? 'bg-[#ec1349] text-white' : 'bg-[#e6dbde] text-[#89616b]')}>2</div>
          </div>
          <DialogTitle className="text-lg font-bold text-[#181113]">
            {step === 1 ? 'Chon giao dien thiep' : 'Thong tin cap doi'}
          </DialogTitle>
          <p className="text-sm text-[#89616b]">
            {step === 1 ? 'Chon mot giao dien phu hop voi phong cach cua ban' : 'Nhap ten co dau va chu re'}
          </p>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid grid-cols-3 gap-3 py-4">
            {THEME_OPTIONS.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={cn(
                  'rounded-xl border-2 p-4 text-center transition-all group',
                  selectedTemplate === tpl.id
                    ? 'border-[#ec1349] bg-[#ec1349]/5 shadow-md'
                    : 'border-[#e6dbde] hover:border-[#ec1349]/40 hover:shadow-sm'
                )}
              >
                <div className="aspect-square w-12 mx-auto rounded-full mb-3 transition-transform group-hover:scale-110" style={{ backgroundColor: tpl.color + '20', border: `2px solid ${tpl.color}` }}>
                  <div className="size-full rounded-full flex items-center justify-center">
                    <div className="size-4 rounded-full" style={{ backgroundColor: tpl.color }} />
                  </div>
                </div>
                <p className="text-sm font-bold text-[#181113]">{tpl.label}</p>
                <p className="text-xs text-[#89616b] mt-1">{tpl.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="brideName" className="text-[#181113] font-semibold">{"T\u00ean c\u00f4 d\u00e2u"}</Label>
              <Input
                id="brideName"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                placeholder="Nguy\u1ec5n Th\u1ecb Minh"
                className="border-[#e6dbde] focus:border-[#ec1349] focus:ring-[#ec1349]/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="groomName" className="text-[#181113] font-semibold">{"T\u00ean ch\u00fa r\u1ec3"}</Label>
              <Input
                id="groomName"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                placeholder="Tr\u1ea7n V\u0103n Th\u1ea3o"
                className="border-[#e6dbde] focus:border-[#ec1349] focus:ring-[#ec1349]/20"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 2 && (
            <Button variant="ghost" onClick={() => setStep(1)} disabled={loading} className="text-[#5e4d52] hover:bg-gray-50">
              Quay l\u1ea1i
            </Button>
          )}
          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedTemplate}
              className="bg-[#ec1349] hover:bg-[#d01140] text-white font-bold"
            >
              {"Ti\u1ebfp theo"}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!brideName.trim() || !groomName.trim() || loading}
              className="bg-[#ec1349] hover:bg-[#d01140] text-white font-bold"
            >
              {loading ? '\u0110ang t\u1ea1o...' : 'T\u1ea1o thi\u1ec7p'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
