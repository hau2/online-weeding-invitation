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

const TEMPLATES: Array<{ id: TemplateId; label: string; description: string }> = [
  { id: 'traditional', label: 'Truy\u1ec1n th\u1ed1ng', description: 'Hoa v\u0103n c\u1ed5 \u0111i\u1ec3n, \u1ea5m \u00e1p' },
  { id: 'modern', label: 'Hi\u1ec7n \u0111\u1ea1i', description: 'T\u1ed1i gi\u1ea3n, thanh l\u1ecbch' },
  { id: 'minimalist', label: 'T\u1ed1i gi\u1ea3n', description: '\u0110\u01a1n gi\u1ea3n, tinh t\u1ebf' },
]

interface CreateWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWizard({ open, onOpenChange }: CreateWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null)
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-rose-800">
            {step === 1 ? 'Ch\u1ecdn giao di\u1ec7n thi\u1ec7p' : 'Th\u00f4ng tin c\u1eb7p \u0111\u00f4i'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid grid-cols-3 gap-3 py-4">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl.id)}
                className={cn(
                  'rounded-xl border-2 p-3 text-left transition-all',
                  selectedTemplate === tpl.id
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 hover:border-rose-200'
                )}
              >
                <div className="aspect-[4/3] bg-gray-50 rounded-lg mb-2" />
                <p className="text-xs font-medium text-gray-800">{tpl.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{tpl.description}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="brideName" className="text-rose-700">{"T\u00ean c\u00f4 d\u00e2u"}</Label>
              <Input
                id="brideName"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                placeholder="Nguy\u1ec5n Th\u1ecb Minh"
                className="border-rose-200 focus:ring-rose-300"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="groomName" className="text-rose-700">{"T\u00ean ch\u00fa r\u1ec3"}</Label>
              <Input
                id="groomName"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                placeholder="Tr\u1ea7n V\u0103n Th\u1ea3o"
                className="border-rose-200 focus:ring-rose-300"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 2 && (
            <Button variant="ghost" onClick={() => setStep(1)} disabled={loading}>
              Quay l\u1ea1i
            </Button>
          )}
          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedTemplate}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {"Ti\u1ebfp theo"}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!brideName.trim() || !groomName.trim() || loading}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {loading ? '\u0110ang t\u1ea1o...' : 'T\u1ea1o thi\u1ec7p'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
