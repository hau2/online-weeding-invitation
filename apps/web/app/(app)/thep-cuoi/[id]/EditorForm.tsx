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
import { TemplateSelector } from './TemplateSelector'
import { CeremonyProgramEditor } from './CeremonyProgramEditor'
import { AvatarUpload } from './AvatarUpload'
import { toast } from 'sonner'
import {
  Heart,
  Clock,
  MapPin,
  ImageIcon,
  Music,
  Gift,
  Palette,
  MessageSquare,
  CalendarHeart,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
} from 'lucide-react'

interface EditorFormProps {
  invitationId: string
  values: Invitation
  onChange: (changes: Partial<Invitation>) => void
  onAvatarUploaded: (field: 'groomAvatarUrl' | 'brideAvatarUrl', url: string) => void
}

const SECTION_ICONS = {
  couple: { icon: Heart, color: 'bg-red-50 text-red-500' },
  schedule: { icon: Clock, color: 'bg-blue-50 text-blue-500' },
  venue: { icon: MapPin, color: 'bg-green-50 text-green-500' },
  photos: { icon: ImageIcon, color: 'bg-purple-50 text-purple-500' },
  music: { icon: Music, color: 'bg-amber-50 text-amber-500' },
  gift: { icon: Gift, color: 'bg-pink-50 text-pink-500' },
  theme: { icon: Palette, color: 'bg-indigo-50 text-indigo-500' },
  message: { icon: MessageSquare, color: 'bg-teal-50 text-teal-500' },
  savedate: { icon: CalendarHeart, color: 'bg-orange-50 text-orange-500' },
} as const

function SectionHeader({ sectionKey, label }: { sectionKey: keyof typeof SECTION_ICONS; label: string }) {
  const { icon: Icon, color } = SECTION_ICONS[sectionKey]
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center`}>
        <Icon className="size-3.5" />
      </div>
      <span>{label}</span>
    </div>
  )
}

const INPUT_CLASS = 'border-gray-200 focus-visible:border-gray-400 focus-visible:ring-gray-200'

export function EditorForm({ invitationId, values, onChange, onAvatarUploaded }: EditorFormProps) {
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

  async function handleCopyMapUrl() {
    if (!values.venueMapUrl) return
    try {
      await navigator.clipboard.writeText(values.venueMapUrl)
      toast.success('Da sao chep')
    } catch {
      toast.error('Khong the sao chep')
    }
  }

  return (
    <Accordion defaultValue={['couple', 'schedule']}>
      {/* Section 1: Thong tin Co dau - Chu re */}
      <AccordionItem value="couple">
        <AccordionTrigger className="text-gray-800 font-semibold text-sm hover:no-underline">
          <SectionHeader sectionKey="couple" label="Thong tin Co dau - Chu re" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 py-2">
            {/* Avatars side-by-side */}
            <div className="flex justify-center gap-6">
              <AvatarUpload
                invitationId={invitationId}
                avatarUrl={values.groomAvatarUrl ?? null}
                label="Chu re"
                endpoint="groom-avatar"
                onUploaded={(url) => onAvatarUploaded('groomAvatarUrl', url)}
              />
              <AvatarUpload
                invitationId={invitationId}
                avatarUrl={values.brideAvatarUrl ?? null}
                label="Co dau"
                endpoint="bride-avatar"
                onUploaded={(url) => onAvatarUploaded('brideAvatarUrl', url)}
              />
            </div>

            {/* Groom fields */}
            <div className="space-y-1.5">
              <Label className="text-gray-600 text-xs">Ten chu re</Label>
              <Input
                placeholder="Nhap ten chu re"
                className={INPUT_CLASS}
                value={values.groomName}
                onChange={(e) => onChange({ groomName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-600 text-xs">Biet danh chu re</Label>
              <Input
                placeholder="Ten than mat (biet danh)"
                className={INPUT_CLASS}
                value={values.groomNickname ?? ''}
                onChange={(e) => onChange({ groomNickname: e.target.value })}
              />
            </div>

            {/* Bride fields */}
            <div className="space-y-1.5">
              <Label className="text-gray-600 text-xs">Ten co dau</Label>
              <Input
                placeholder="Nhap ten co dau"
                className={INPUT_CLASS}
                value={values.brideName}
                onChange={(e) => onChange({ brideName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-600 text-xs">Biet danh co dau</Label>
              <Input
                placeholder="Ten than mat (biet danh)"
                className={INPUT_CLASS}
                value={values.brideNickname ?? ''}
                onChange={(e) => onChange({ brideNickname: e.target.value })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 2: Thoi gian & Lich trinh */}
      <AccordionItem value="schedule">
        <AccordionTrigger className="text-gray-800 font-semibold text-sm hover:no-underline">
          <SectionHeader sectionKey="schedule" label="Thoi gian & Lich trinh" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-5 py-2">
            {/* Sub-section: Nha trai */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Nha trai</h4>
              <div className="space-y-1.5">
                <Label className="text-gray-600 text-xs">Cha</Label>
                <Input
                  placeholder="Nhap ten cha chu re"
                  className={INPUT_CLASS}
                  value={values.groomFather}
                  onChange={(e) => onChange({ groomFather: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600 text-xs">Me</Label>
                <Input
                  placeholder="Nhap ten me chu re"
                  className={INPUT_CLASS}
                  value={values.groomMother}
                  onChange={(e) => onChange({ groomMother: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600 text-xs">Ngay le</Label>
                <Input
                  type="date"
                  className={INPUT_CLASS}
                  value={values.groomCeremonyDate ?? ''}
                  onChange={(e) => onChange({ groomCeremonyDate: e.target.value || null })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600 text-xs">Gio le</Label>
                <Input
                  type="time"
                  className={INPUT_CLASS}
                  value={values.groomCeremonyTime ?? ''}
                  onChange={(e) => onChange({ groomCeremonyTime: e.target.value || null })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600 text-xs">Ten dia diem</Label>
                <Input
                  placeholder="Nhap ten dia diem"
                  className={INPUT_CLASS}
                  value={values.groomVenueName}
                  onChange={(e) => onChange({ groomVenueName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600 text-xs">Dia chi</Label>
                <Input
                  placeholder="Nhap dia chi"
                  className={INPUT_CLASS}
                  value={values.groomVenueAddress}
                  onChange={(e) => onChange({ groomVenueAddress: e.target.value })}
                />
              </div>
            </div>

            {/* Sub-section: Nha gai */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Nha gai</h4>
              <div className="space-y-1.5">
                <Label className="text-gray-600 text-xs">Cha</Label>
                <Input
                  placeholder="Nhap ten cha co dau"
                  className={INPUT_CLASS}
                  value={values.brideFather}
                  onChange={(e) => onChange({ brideFather: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600 text-xs">Me</Label>
                <Input
                  placeholder="Nhap ten me co dau"
                  className={INPUT_CLASS}
                  value={values.brideMother}
                  onChange={(e) => onChange({ brideMother: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600 text-xs">Ngay le</Label>
                <Input
                  type="date"
                  className={INPUT_CLASS}
                  value={values.brideCeremonyDate ?? ''}
                  onChange={(e) => onChange({ brideCeremonyDate: e.target.value || null })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600 text-xs">Gio le</Label>
                <Input
                  type="time"
                  className={INPUT_CLASS}
                  value={values.brideCeremonyTime ?? ''}
                  onChange={(e) => onChange({ brideCeremonyTime: e.target.value || null })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600 text-xs">Ten dia diem</Label>
                <Input
                  placeholder="Nhap ten dia diem"
                  className={INPUT_CLASS}
                  value={values.brideVenueName}
                  onChange={(e) => onChange({ brideVenueName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600 text-xs">Dia chi</Label>
                <Input
                  placeholder="Nhap dia chi"
                  className={INPUT_CLASS}
                  value={values.brideVenueAddress}
                  onChange={(e) => onChange({ brideVenueAddress: e.target.value })}
                />
              </div>
            </div>

            {/* Sub-section: Ceremony Program */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Lich trinh le cuoi</h4>
              <CeremonyProgramEditor
                events={values.ceremonyProgram ?? []}
                onChange={(events) => onChange({ ceremonyProgram: events })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 3: Dia diem to chuc */}
      <AccordionItem value="venue">
        <AccordionTrigger className="text-gray-800 font-semibold text-sm hover:no-underline">
          <SectionHeader sectionKey="venue" label="Dia diem to chuc" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-gray-600 text-xs">Google Maps URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Dan link Google Maps vao day"
                  className={`flex-1 ${INPUT_CLASS}`}
                  value={values.venueMapUrl}
                  onChange={(e) => onChange({ venueMapUrl: e.target.value })}
                />
                <button
                  type="button"
                  onClick={handleCopyMapUrl}
                  disabled={!values.venueMapUrl}
                  className="shrink-0 p-2 text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                  aria-label="Sao chep URL"
                >
                  <Copy className="size-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Dan link Google Maps de hien thi ban do tren thiep moi
              </p>
            </div>
            {values.venueMapUrl && (
              <a
                href={values.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Mo Google Maps
              </a>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 4: Album anh */}
      <AccordionItem value="photos">
        <AccordionTrigger className="text-gray-800 font-semibold text-sm hover:no-underline">
          <SectionHeader sectionKey="photos" label="Album anh" />
        </AccordionTrigger>
        <AccordionContent>
          <PhotoGallery
            invitationId={invitationId}
            photoUrls={values.photoUrls}
            onChange={(photoUrls) => onChange({ photoUrls })}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Section 5: Nhac nen */}
      <AccordionItem value="music">
        <AccordionTrigger className="text-gray-800 font-semibold text-sm hover:no-underline">
          <SectionHeader sectionKey="music" label="Nhac nen" />
        </AccordionTrigger>
        <AccordionContent>
          <MusicPicker
            selectedTrackId={values.musicTrackId}
            onSelect={(musicTrackId) => onChange({ musicTrackId })}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Section 6: Mung cuoi / QR Code */}
      <AccordionItem value="gift">
        <AccordionTrigger className="text-gray-800 font-semibold text-sm hover:no-underline">
          <SectionHeader sectionKey="gift" label="Mung cuoi / QR Code" />
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

      {/* Section 7: Giao dien & Theme */}
      <AccordionItem value="theme">
        <AccordionTrigger className="text-gray-800 font-semibold text-sm hover:no-underline">
          <SectionHeader sectionKey="theme" label="Giao dien & Theme" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="py-2">
            <TemplateSelector
              currentTemplate={values.templateId}
              onSelect={(templateId) => onChange({ templateId })}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 8: Loi moi */}
      <AccordionItem value="message">
        <AccordionTrigger className="text-gray-800 font-semibold text-sm hover:no-underline">
          <SectionHeader sectionKey="message" label="Loi moi" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-gray-600 text-xs">Loi moi</Label>
              <Textarea
                placeholder="Nhap loi moi"
                rows={4}
                className={INPUT_CLASS}
                value={values.invitationMessage}
                onChange={(e) => onChange({ invitationMessage: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-600 text-xs">Loi cam on</Label>
              <Textarea
                placeholder="Nhap loi cam on"
                rows={3}
                className={INPUT_CLASS}
                value={values.thankYouText}
                onChange={(e) => onChange({ thankYouText: e.target.value })}
              />
            </div>

            {/* Love story sub-section */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Cau chuyen tinh yeu{' '}
                <span className="font-normal text-gray-400 normal-case">
                  ({loveStory.length}/5 moc)
                </span>
              </h4>
              {loveStory.map((milestone, index) => (
                <div
                  key={index}
                  className="relative border border-gray-200 rounded-lg p-3 space-y-3"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Xoa moc ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-1.5">
                    <Label className="text-gray-600 text-xs">Moc thoi gian</Label>
                    <Input
                      placeholder="VD: 2020 hoac 15/06/2020"
                      className={INPUT_CLASS}
                      value={milestone.date}
                      onChange={(e) => handleMilestoneChange(index, 'date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-600 text-xs">Tieu de</Label>
                    <Input
                      placeholder="VD: Lan dau gap nhau"
                      maxLength={100}
                      className={INPUT_CLASS}
                      value={milestone.title}
                      onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-600 text-xs">Mo ta</Label>
                    <Textarea
                      placeholder="VD: Gap nhau tai quan ca phe..."
                      rows={2}
                      maxLength={300}
                      className={INPUT_CLASS}
                      value={milestone.description}
                      onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddMilestone}
                disabled={loveStory.length >= 5}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
                Them moc
              </button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 9: Save the Date */}
      <AccordionItem value="savedate">
        <AccordionTrigger className="text-gray-800 font-semibold text-sm hover:no-underline">
          <SectionHeader sectionKey="savedate" label="Save the Date" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-gray-600 text-xs">Loi nhan Save the Date</Label>
              <Textarea
                placeholder="VD: Chung toi sap ket hon! Thiep cuoi se duoc gui sau."
                rows={3}
                className={INPUT_CLASS}
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
    </Accordion>
  )
}
