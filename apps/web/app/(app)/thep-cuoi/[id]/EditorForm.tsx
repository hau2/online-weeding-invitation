'use client'

import type { Invitation, LoveStoryMilestone } from '@repo/types'
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
import { Plus, Trash2 } from 'lucide-react'

interface EditorFormProps {
  invitationId: string
  values: Invitation
  onChange: (changes: Partial<Invitation>) => void
}

export function EditorForm({ invitationId, values, onChange }: EditorFormProps) {
  const loveStory = values.loveStory ?? []

  function handleAddMilestone() {
    if (loveStory.length >= 5) return
    const updated: LoveStoryMilestone[] = [
      ...loveStory,
      { date: '', title: '', description: '' },
    ]
    onChange({ loveStory: updated })
  }

  function handleRemoveMilestone(index: number) {
    const updated = loveStory.filter((_, i) => i !== index)
    onChange({ loveStory: updated })
  }

  function handleMilestoneChange(
    index: number,
    field: keyof LoveStoryMilestone,
    value: string,
  ) {
    const updated = loveStory.map((m, i) =>
      i === index ? { ...m, [field]: value } : m,
    )
    onChange({ loveStory: updated })
  }

  return (
    <Accordion
      defaultValue={[
        'couple',
        'groom-family',
        'bride-family',
        'love-story',
      ]}
    >
      {/* Section 1: Cap doi */}
      <AccordionItem value="couple">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Cap doi (1/10)
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

      {/* Section 2: Nha trai */}
      <AccordionItem value="groom-family">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Nha trai (2/10)
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Cha</Label>
              <Input
                placeholder="Nhap ten cha chu re"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.groomFather}
                onChange={(e) => onChange({ groomFather: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Me</Label>
              <Input
                placeholder="Nhap ten me chu re"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.groomMother}
                onChange={(e) => onChange({ groomMother: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Ngay le</Label>
              <Input
                type="date"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.groomCeremonyDate ?? ''}
                onChange={(e) =>
                  onChange({ groomCeremonyDate: e.target.value || null })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Gio le</Label>
              <Input
                type="time"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.groomCeremonyTime ?? ''}
                onChange={(e) =>
                  onChange({ groomCeremonyTime: e.target.value || null })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Ten dia diem</Label>
              <Input
                placeholder="Nhap ten dia diem"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.groomVenueName}
                onChange={(e) => onChange({ groomVenueName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Dia chi</Label>
              <Input
                placeholder="Nhap dia chi"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.groomVenueAddress}
                onChange={(e) =>
                  onChange({ groomVenueAddress: e.target.value })
                }
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 3: Nha gai */}
      <AccordionItem value="bride-family">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Nha gai (3/10)
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Cha</Label>
              <Input
                placeholder="Nhap ten cha co dau"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.brideFather}
                onChange={(e) => onChange({ brideFather: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Me</Label>
              <Input
                placeholder="Nhap ten me co dau"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.brideMother}
                onChange={(e) => onChange({ brideMother: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Ngay le</Label>
              <Input
                type="date"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.brideCeremonyDate ?? ''}
                onChange={(e) =>
                  onChange({ brideCeremonyDate: e.target.value || null })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Gio le</Label>
              <Input
                type="time"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.brideCeremonyTime ?? ''}
                onChange={(e) =>
                  onChange({ brideCeremonyTime: e.target.value || null })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Ten dia diem</Label>
              <Input
                placeholder="Nhap ten dia diem"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.brideVenueName}
                onChange={(e) => onChange({ brideVenueName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Dia chi</Label>
              <Input
                placeholder="Nhap dia chi"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.brideVenueAddress}
                onChange={(e) =>
                  onChange({ brideVenueAddress: e.target.value })
                }
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 4: Cau chuyen tinh yeu */}
      <AccordionItem value="love-story">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Cau chuyen tinh yeu (4/10){' '}
          <span className="font-normal text-xs text-gray-400 ml-1">
            ({loveStory.length}/5 moc)
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 py-2">
            {loveStory.map((milestone, index) => (
              <div
                key={index}
                className="relative border border-rose-100 rounded-lg p-3 space-y-3"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-rose-500 transition-colors"
                  aria-label={`Xoa moc ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-1.5">
                  <Label className="text-rose-700 text-xs">
                    Moc thoi gian
                  </Label>
                  <Input
                    placeholder="VD: 2020 hoac 15/06/2020"
                    className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                    value={milestone.date}
                    onChange={(e) =>
                      handleMilestoneChange(index, 'date', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-rose-700 text-xs">Tieu de</Label>
                  <Input
                    placeholder="VD: Lan dau gap nhau"
                    maxLength={100}
                    className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                    value={milestone.title}
                    onChange={(e) =>
                      handleMilestoneChange(index, 'title', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-rose-700 text-xs">Mo ta</Label>
                  <Textarea
                    placeholder="VD: Gap nhau tai quan ca phe..."
                    rows={2}
                    maxLength={300}
                    className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                    value={milestone.description}
                    onChange={(e) =>
                      handleMilestoneChange(
                        index,
                        'description',
                        e.target.value,
                      )
                    }
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddMilestone}
              disabled={loveStory.length >= 5}
              className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Them moc
            </button>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 5: Loi moi */}
      <AccordionItem value="message">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Loi moi (5/10)
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

      {/* Section 6: Save the Date */}
      <AccordionItem value="save-the-date">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Save the Date (6/10)
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Loi nhan Save the Date</Label>
              <Textarea
                placeholder="VD: Chung toi sap ket hon! Thiep cuoi se duoc gui sau."
                rows={3}
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.teaserMessage}
                onChange={(e) => onChange({ teaserMessage: e.target.value })}
              />
              <p className="text-xs text-gray-400">
                Loi nhan nay se hien thi tren trang Save the Date (tuy chon)
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 7: Anh cuoi */}
      <AccordionItem value="photos">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Anh cuoi (7/10)
        </AccordionTrigger>
        <AccordionContent>
          <PhotoGallery
            invitationId={invitationId}
            photoUrls={values.photoUrls}
            onChange={(photoUrls) => onChange({ photoUrls })}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Section 7: Nhac nen */}
      <AccordionItem value="music">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Nhac nen (8/10)
        </AccordionTrigger>
        <AccordionContent>
          <MusicPicker
            selectedTrackId={values.musicTrackId}
            onSelect={(musicTrackId) => onChange({ musicTrackId })}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Section 8: QR Ngan hang */}
      <AccordionItem value="bankqr">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          QR Ngan hang (9/10)
        </AccordionTrigger>
        <AccordionContent>
          <BankQrUpload
            invitationId={invitationId}
            bankQrUrl={values.bankQrUrl}
            bankName={values.bankName}
            bankAccountHolder={values.bankAccountHolder}
            bankAccountNumber={values.bankAccountNumber}
            brideBankQrUrl={values.brideBankQrUrl}
            brideBankName={values.brideBankName}
            brideBankAccountHolder={values.brideBankAccountHolder}
            brideBankAccountNumber={values.brideBankAccountNumber}
            onChange={onChange}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Section 9: Ban do */}
      <AccordionItem value="map">
        <AccordionTrigger className="text-rose-700 font-semibold text-sm">
          Ban do (10/10)
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-rose-700 text-xs">Google Maps URL</Label>
              <Input
                placeholder="Dan link Google Maps vao day"
                className="border-rose-200 focus-visible:border-rose-400 focus-visible:ring-rose-200"
                value={values.venueMapUrl}
                onChange={(e) => onChange({ venueMapUrl: e.target.value })}
              />
              {values.venueMapUrl && (
                <p className="text-xs text-gray-400">
                  Ban do se hien thi tren thiep moi
                </p>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
