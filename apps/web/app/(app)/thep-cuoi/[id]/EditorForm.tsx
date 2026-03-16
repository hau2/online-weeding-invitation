'use client'

import type { Invitation, LoveStoryMilestone } from '@repo/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  couple: { icon: Heart },
  schedule: { icon: Clock },
  venue: { icon: MapPin },
  photos: { icon: ImageIcon },
  music: { icon: Music },
  gift: { icon: Gift },
  theme: { icon: Palette },
  message: { icon: MessageSquare },
  savedate: { icon: CalendarHeart },
} as const

function SectionHeader({ sectionKey, label }: { sectionKey: keyof typeof SECTION_ICONS; label: string }) {
  const { icon: Icon } = SECTION_ICONS[sectionKey]
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-[#89616b] group-data-[open]:bg-[#ec1349]/10 group-data-[open]:text-[#ec1349] transition-colors">
        <Icon className="size-5" />
      </span>
      <p className="text-[#181113] text-base font-bold leading-normal">{label}</p>
    </div>
  )
}

const INPUT_CLASS = 'rounded-lg border-[#e6dbde] bg-white h-10 px-3 text-sm focus-visible:border-[#ec1349] focus-visible:ring-1 focus-visible:ring-[#ec1349] outline-none transition-all placeholder:text-gray-400'

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
    <Accordion defaultValue={['couple', 'schedule']} className="flex flex-col gap-4">
      {/* Section 1: Thong tin Co dau - Chu re */}
      <AccordionItem value="couple" className="group rounded-xl border border-[#e6dbde] bg-white overflow-hidden shadow-sm not-last:border-b-0">
        <AccordionTrigger className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-sm hover:no-underline [&>svg]:text-[#89616b] [&>svg]:size-5">
          <SectionHeader sectionKey="couple" label="Thong tin Co dau - Chu re" />
        </AccordionTrigger>
        <AccordionContent className="border-t border-[#e6dbde]">
          <div className="p-5 flex flex-col gap-6">
            {/* Chu re */}
            <div>
              <h4 className="text-sm font-bold text-[#181113] mb-3 uppercase tracking-wider">Chu re</h4>
              <div className="flex gap-4">
                <div className="w-24 shrink-0">
                  <AvatarUpload
                    invitationId={invitationId}
                    avatarUrl={values.groomAvatarUrl ?? null}
                    label="Chu re"
                    endpoint="groom-avatar"
                    onUploaded={(url) => onAvatarUploaded('groomAvatarUrl', url)}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold text-[#89616b] mb-1 block">Ho va ten</span>
                    <Input
                      placeholder="Nguyen Van A"
                      className={INPUT_CLASS}
                      value={values.groomName}
                      onChange={(e) => onChange({ groomName: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-[#89616b] mb-1 block">Ten than mat (Biet danh)</span>
                    <Input
                      placeholder="Vi du: Ken"
                      className={INPUT_CLASS}
                      value={values.groomNickname ?? ''}
                      onChange={(e) => onChange({ groomNickname: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="h-px bg-[#f4f0f1]" />
            {/* Co dau */}
            <div>
              <h4 className="text-sm font-bold text-[#181113] mb-3 uppercase tracking-wider">Co dau</h4>
              <div className="flex gap-4">
                <div className="w-24 shrink-0">
                  <AvatarUpload
                    invitationId={invitationId}
                    avatarUrl={values.brideAvatarUrl ?? null}
                    label="Co dau"
                    endpoint="bride-avatar"
                    onUploaded={(url) => onAvatarUploaded('brideAvatarUrl', url)}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <label className="block">
                    <span className="text-xs font-semibold text-[#89616b] mb-1 block">Ho va ten</span>
                    <Input
                      placeholder="Nguyen Thi B"
                      className={INPUT_CLASS}
                      value={values.brideName}
                      onChange={(e) => onChange({ brideName: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-[#89616b] mb-1 block">Ten than mat (Biet danh)</span>
                    <Input
                      placeholder="Vi du: Cherry"
                      className={INPUT_CLASS}
                      value={values.brideNickname ?? ''}
                      onChange={(e) => onChange({ brideNickname: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 2: Thoi gian & Lich trinh */}
      <AccordionItem value="schedule" className="group rounded-xl border border-[#e6dbde] bg-white overflow-hidden shadow-sm not-last:border-b-0">
        <AccordionTrigger className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-sm hover:no-underline [&>svg]:text-[#89616b] [&>svg]:size-5">
          <SectionHeader sectionKey="schedule" label="Thoi gian & Lich trinh" />
        </AccordionTrigger>
        <AccordionContent className="border-t border-[#e6dbde]">
          <div className="p-5 flex flex-col gap-5">
            {/* Sub-section: Nha trai */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#181113] uppercase tracking-wider">Nha trai</h4>
              <label className="block">
                <span className="text-xs font-semibold text-[#89616b] mb-1 block">Cha</span>
                <Input
                  placeholder="Nhap ten cha chu re"
                  className={INPUT_CLASS}
                  value={values.groomFather}
                  onChange={(e) => onChange({ groomFather: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-[#89616b] mb-1 block">Me</span>
                <Input
                  placeholder="Nhap ten me chu re"
                  className={INPUT_CLASS}
                  value={values.groomMother}
                  onChange={(e) => onChange({ groomMother: e.target.value })}
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-[#89616b] mb-1 block">Ngay le</span>
                  <Input
                    type="date"
                    className={INPUT_CLASS}
                    value={values.groomCeremonyDate ?? ''}
                    onChange={(e) => onChange({ groomCeremonyDate: e.target.value || null })}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-[#89616b] mb-1 block">Gio le</span>
                  <Input
                    type="time"
                    className={INPUT_CLASS}
                    value={values.groomCeremonyTime ?? ''}
                    onChange={(e) => onChange({ groomCeremonyTime: e.target.value || null })}
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold text-[#89616b] mb-1 block">Ten dia diem</span>
                <Input
                  placeholder="Nhap ten dia diem"
                  className={INPUT_CLASS}
                  value={values.groomVenueName}
                  onChange={(e) => onChange({ groomVenueName: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-[#89616b] mb-1 block">Dia chi</span>
                <Input
                  placeholder="Nhap dia chi"
                  className={INPUT_CLASS}
                  value={values.groomVenueAddress}
                  onChange={(e) => onChange({ groomVenueAddress: e.target.value })}
                />
              </label>
            </div>

            <div className="h-px bg-[#f4f0f1]" />

            {/* Sub-section: Nha gai */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#181113] uppercase tracking-wider">Nha gai</h4>
              <label className="block">
                <span className="text-xs font-semibold text-[#89616b] mb-1 block">Cha</span>
                <Input
                  placeholder="Nhap ten cha co dau"
                  className={INPUT_CLASS}
                  value={values.brideFather}
                  onChange={(e) => onChange({ brideFather: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-[#89616b] mb-1 block">Me</span>
                <Input
                  placeholder="Nhap ten me co dau"
                  className={INPUT_CLASS}
                  value={values.brideMother}
                  onChange={(e) => onChange({ brideMother: e.target.value })}
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-[#89616b] mb-1 block">Ngay le</span>
                  <Input
                    type="date"
                    className={INPUT_CLASS}
                    value={values.brideCeremonyDate ?? ''}
                    onChange={(e) => onChange({ brideCeremonyDate: e.target.value || null })}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-[#89616b] mb-1 block">Gio le</span>
                  <Input
                    type="time"
                    className={INPUT_CLASS}
                    value={values.brideCeremonyTime ?? ''}
                    onChange={(e) => onChange({ brideCeremonyTime: e.target.value || null })}
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs font-semibold text-[#89616b] mb-1 block">Ten dia diem</span>
                <Input
                  placeholder="Nhap ten dia diem"
                  className={INPUT_CLASS}
                  value={values.brideVenueName}
                  onChange={(e) => onChange({ brideVenueName: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-[#89616b] mb-1 block">Dia chi</span>
                <Input
                  placeholder="Nhap dia chi"
                  className={INPUT_CLASS}
                  value={values.brideVenueAddress}
                  onChange={(e) => onChange({ brideVenueAddress: e.target.value })}
                />
              </label>
            </div>

            <div className="h-px bg-[#f4f0f1]" />

            {/* Sub-section: Ceremony Program */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#181113] uppercase tracking-wider">Lich trinh le cuoi</h4>
              <CeremonyProgramEditor
                events={values.ceremonyProgram ?? []}
                onChange={(events) => onChange({ ceremonyProgram: events })}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 3: Dia diem to chuc */}
      <AccordionItem value="venue" className="group rounded-xl border border-[#e6dbde] bg-white overflow-hidden shadow-sm not-last:border-b-0">
        <AccordionTrigger className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-sm hover:no-underline [&>svg]:text-[#89616b] [&>svg]:size-5">
          <SectionHeader sectionKey="venue" label="Dia diem to chuc" />
        </AccordionTrigger>
        <AccordionContent className="border-t border-[#e6dbde]">
          <div className="p-5 flex flex-col gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-[#89616b] mb-1 block">Link Google Maps (Iframe hoac Link)</span>
              <div className="flex gap-2">
                <Input
                  placeholder="https://maps.google.com/..."
                  className={`flex-1 ${INPUT_CLASS}`}
                  value={values.venueMapUrl}
                  onChange={(e) => onChange({ venueMapUrl: e.target.value })}
                />
                <button
                  type="button"
                  onClick={handleCopyMapUrl}
                  disabled={!values.venueMapUrl}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-[#ec1349] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Sao chep URL"
                  aria-label="Sao chep URL"
                >
                  <Copy className="size-5" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 italic">
                Dan link chia se tu Google Maps de hien thi ban do.
              </p>
            </label>
            {values.venueMapUrl && (
              <a
                href={values.venueMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#ec1349] hover:underline transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Mo Google Maps
              </a>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 4: Album anh */}
      <AccordionItem value="photos" className="group rounded-xl border border-[#e6dbde] bg-white overflow-hidden shadow-sm not-last:border-b-0">
        <AccordionTrigger className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-sm hover:no-underline [&>svg]:text-[#89616b] [&>svg]:size-5">
          <SectionHeader sectionKey="photos" label="Album anh" />
        </AccordionTrigger>
        <AccordionContent className="border-t border-[#e6dbde]">
          <div className="p-5">
            <PhotoGallery
              invitationId={invitationId}
              photoUrls={values.photoUrls}
              onChange={(photoUrls) => onChange({ photoUrls })}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 5: Nhac nen */}
      <AccordionItem value="music" className="group rounded-xl border border-[#e6dbde] bg-white overflow-hidden shadow-sm not-last:border-b-0">
        <AccordionTrigger className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-sm hover:no-underline [&>svg]:text-[#89616b] [&>svg]:size-5">
          <SectionHeader sectionKey="music" label="Nhac nen" />
        </AccordionTrigger>
        <AccordionContent className="border-t border-[#e6dbde]">
          <div className="p-5">
            <MusicPicker
              selectedTrackId={values.musicTrackId}
              onSelect={(musicTrackId) => onChange({ musicTrackId })}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 6: Mung cuoi / QR Code */}
      <AccordionItem value="gift" className="group rounded-xl border border-[#e6dbde] bg-white overflow-hidden shadow-sm not-last:border-b-0">
        <AccordionTrigger className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-sm hover:no-underline [&>svg]:text-[#89616b] [&>svg]:size-5">
          <SectionHeader sectionKey="gift" label="Mung cuoi (QR Code)" />
        </AccordionTrigger>
        <AccordionContent className="border-t border-[#e6dbde]">
          <div className="p-5">
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
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 7: Giao dien & Theme */}
      <AccordionItem value="theme" className="group rounded-xl border border-[#e6dbde] bg-white overflow-hidden shadow-sm not-last:border-b-0">
        <AccordionTrigger className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-sm hover:no-underline [&>svg]:text-[#89616b] [&>svg]:size-5">
          <SectionHeader sectionKey="theme" label="Giao dien & Theme" />
        </AccordionTrigger>
        <AccordionContent className="border-t border-[#e6dbde]">
          <div className="p-5">
            <TemplateSelector
              currentTemplate={values.templateId}
              onSelect={(templateId) => onChange({ templateId })}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 8: Loi moi */}
      <AccordionItem value="message" className="group rounded-xl border border-[#e6dbde] bg-white overflow-hidden shadow-sm not-last:border-b-0">
        <AccordionTrigger className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-sm hover:no-underline [&>svg]:text-[#89616b] [&>svg]:size-5">
          <SectionHeader sectionKey="message" label="Loi moi" />
        </AccordionTrigger>
        <AccordionContent className="border-t border-[#e6dbde]">
          <div className="p-5 flex flex-col gap-5">
            <label className="block">
              <span className="text-xs font-semibold text-[#89616b] mb-1 block">Loi ngo / Gioi thieu</span>
              <Textarea
                placeholder="Nhap loi chao mung khach moi..."
                rows={4}
                className={`${INPUT_CLASS} min-h-[80px] p-3 resize-y`}
                value={values.invitationMessage}
                onChange={(e) => onChange({ invitationMessage: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[#89616b] mb-1 block">Loi cam on</span>
              <Textarea
                placeholder="Nhap loi cam on"
                rows={3}
                className={`${INPUT_CLASS} min-h-[60px] p-3 resize-y`}
                value={values.thankYouText}
                onChange={(e) => onChange({ thankYouText: e.target.value })}
              />
            </label>

            <div className="h-px bg-[#f4f0f1]" />

            {/* Love story sub-section */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#181113] uppercase tracking-wider">
                Cau chuyen tinh yeu{' '}
                <span className="font-normal text-[#89616b] normal-case text-xs">
                  ({loveStory.length}/5 moc)
                </span>
              </h4>
              {loveStory.map((milestone, index) => (
                <div
                  key={index}
                  className="relative border border-dashed border-[#e6dbde] rounded-lg p-3 bg-gray-50 space-y-3"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Xoa moc ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <label className="block">
                    <span className="text-xs font-semibold text-[#89616b] mb-1 block">Moc thoi gian</span>
                    <Input
                      placeholder="VD: 2020 hoac 15/06/2020"
                      className={INPUT_CLASS}
                      value={milestone.date}
                      onChange={(e) => handleMilestoneChange(index, 'date', e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-[#89616b] mb-1 block">Tieu de</span>
                    <Input
                      placeholder="VD: Lan dau gap nhau"
                      maxLength={100}
                      className={INPUT_CLASS}
                      value={milestone.title}
                      onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-[#89616b] mb-1 block">Mo ta</span>
                    <Textarea
                      placeholder="VD: Gap nhau tai quan ca phe..."
                      rows={2}
                      maxLength={300}
                      className={`${INPUT_CLASS} min-h-[60px] p-3 resize-y`}
                      value={milestone.description}
                      onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                    />
                  </label>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddMilestone}
                disabled={loveStory.length >= 5}
                className="w-full py-2 border border-[#e6dbde] rounded-lg text-sm font-medium text-[#ec1349] hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Them moc
              </button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Section 9: Save the Date */}
      <AccordionItem value="savedate" className="group rounded-xl border border-[#e6dbde] bg-white overflow-hidden shadow-sm not-last:border-b-0">
        <AccordionTrigger className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-sm hover:no-underline [&>svg]:text-[#89616b] [&>svg]:size-5">
          <SectionHeader sectionKey="savedate" label="Save the Date" />
        </AccordionTrigger>
        <AccordionContent className="border-t border-[#e6dbde]">
          <div className="p-5 flex flex-col gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-[#89616b] mb-1 block">Loi nhan Save the Date</span>
              <Textarea
                placeholder="VD: Chung toi sap ket hon! Thiep cuoi se duoc gui sau."
                rows={3}
                className={`${INPUT_CLASS} min-h-[80px] p-3 resize-y`}
                value={values.teaserMessage}
                onChange={(e) => onChange({ teaserMessage: e.target.value })}
              />
              <p className="text-[10px] text-gray-400 mt-1 italic">
                Loi nhan nay se hien thi tren trang Save the Date (tuy chon)
              </p>
            </label>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
