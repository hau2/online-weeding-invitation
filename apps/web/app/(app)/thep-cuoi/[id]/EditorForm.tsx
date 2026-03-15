'use client'

import type { Invitation } from '@repo/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { PhotoGallery } from './PhotoGallery'
import { MusicPicker } from './MusicPicker'
import { BankQrUpload } from './BankQrUpload'

interface EditorFormProps {
  invitationId: string
  values: Invitation
  onChange: (changes: Partial<Invitation>) => void
}

export function EditorForm({ invitationId, values, onChange }: EditorFormProps) {
  return (
    <Accordion
      defaultValue={[
        'couple',
        'ceremony',
        'message',
        'photos',
        'music',
        'bankqr',
      ]}
    >
      {/* Section 1: Couple */}
      <AccordionItem value="couple">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Cap doi (1/6)
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Ten chu re</Label>
              <Input
                placeholder="Nhap ten chu re"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.groomName}
                onChange={(e) => onChange({ groomName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Ten co dau</Label>
              <Input
                placeholder="Nhap ten co dau"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.brideName}
                onChange={(e) => onChange({ brideName: e.target.value })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 2: Ceremony */}
      <AccordionItem value="ceremony">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Le cuoi (2/6)
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Ngay cuoi</Label>
              <Input
                type="date"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.weddingDate ?? ''}
                onChange={(e) =>
                  onChange({ weddingDate: e.target.value || null })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Gio cuoi</Label>
              <Input
                type="time"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.weddingTime ?? ''}
                onChange={(e) =>
                  onChange({ weddingTime: e.target.value || null })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Ten dia diem</Label>
              <Input
                placeholder="Nhap ten dia diem"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.venueName}
                onChange={(e) => onChange({ venueName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Dia chi</Label>
              <Input
                placeholder="Nhap dia chi"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.venueAddress}
                onChange={(e) => onChange({ venueAddress: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Google Maps URL</Label>
              <Input
                placeholder="Dan link Google Maps vao day"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.venueMapUrl}
                onChange={(e) => onChange({ venueMapUrl: e.target.value })}
              />
              {values.venueMapUrl && (
                <p className="text-xs text-gray-400">Ban do se hien thi tren thiep moi</p>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 3: Message */}
      <AccordionItem value="message">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Loi moi (3/6)
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Loi moi</Label>
              <Textarea
                placeholder="Nhap loi moi"
                rows={4}
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.invitationMessage}
                onChange={(e) =>
                  onChange({ invitationMessage: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Loi cam on</Label>
              <Textarea
                placeholder="Nhap loi cam on"
                rows={3}
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.thankYouText}
                onChange={(e) => onChange({ thankYouText: e.target.value })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 4: Photos */}
      <AccordionItem value="photos">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Anh cuoi (4/6)
        </AccordionTrigger>
        <AccordionContent>
          <PhotoGallery
            invitationId={invitationId}
            photoUrls={values.photoUrls}
            onChange={(photoUrls) => onChange({ photoUrls })}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Section 5: Music */}
      <AccordionItem value="music">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Nhac nen (5/6)
        </AccordionTrigger>
        <AccordionContent>
          <MusicPicker
            selectedTrackId={values.musicTrackId}
            onSelect={(musicTrackId) => onChange({ musicTrackId })}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Section 6: Bank QR */}
      <AccordionItem value="bankqr">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          QR Ngan hang (6/6)
        </AccordionTrigger>
        <AccordionContent>
          <BankQrUpload
            invitationId={invitationId}
            bankQrUrl={values.bankQrUrl}
            bankName={values.bankName}
            bankAccountHolder={values.bankAccountHolder}
            brideBankQrUrl={values.brideBankQrUrl}
            brideBankName={values.brideBankName}
            brideBankAccountHolder={values.brideBankAccountHolder}
            onChange={onChange}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
