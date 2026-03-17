'use client'
import { type Invitation } from '@repo/types'
import { StatusBadge } from './StatusBadge'
import { toast } from 'sonner'
import { Edit2, Copy, Eye, Sparkles, MoreVertical, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const TEMPLATE_THUMBNAILS: Record<string, React.ReactNode> = {
  traditional: (
    <svg viewBox="0 0 400 160" className="w-full h-full" aria-hidden>
      <rect width="400" height="160" fill="#fdf2f8" />
      <circle cx="200" cy="80" r="30" fill="#fbcfe8" opacity="0.6" />
      <circle cx="200" cy="80" r="15" fill="#f9a8d4" opacity="0.8" />
      <circle cx="140" cy="60" r="10" fill="#fce7f3" opacity="0.5" />
      <circle cx="260" cy="60" r="10" fill="#fce7f3" opacity="0.5" />
    </svg>
  ),
  modern: (
    <svg viewBox="0 0 400 160" className="w-full h-full" aria-hidden>
      <rect width="400" height="160" fill="#f8fafc" />
      <line x1="80" y1="60" x2="320" y2="60" stroke="#94a3b8" strokeWidth="2" />
      <line x1="120" y1="80" x2="280" y2="80" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="140" y1="100" x2="260" y2="100" stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  ),
  minimalist: (
    <svg viewBox="0 0 400 160" className="w-full h-full" aria-hidden>
      <rect width="400" height="160" fill="#fffbf0" />
      <line x1="160" y1="80" x2="240" y2="80" stroke="#d4b896" strokeWidth="2" />
    </svg>
  ),
}

interface InvitationCardProps {
  invitation: Invitation
  isAgent?: boolean
}

export function InvitationCard({ invitation, isAgent }: InvitationCardProps) {
  const formattedDate = invitation.groomCeremonyDate
    ? new Date(invitation.groomCeremonyDate).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : 'Ch\u01b0a c\u00f3 ng\u00e0y'

  const formattedCreated = new Date(invitation.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  const canViewPublic = (invitation.status === 'published' || invitation.status === 'save_the_date') && invitation.slug
  const isDraft = invitation.status === 'draft'

  // Draft auto-delete warning: 30 days from createdAt
  const draftDaysLeft = isDraft
    ? 30 - Math.floor((Date.now() - new Date(invitation.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const showDraftWarning = draftDaysLeft !== null && draftDaysLeft <= 7
  const showDraftDanger = draftDaysLeft !== null && draftDaysLeft <= 0

  const copyUrl = async (side: 'groom' | 'bride') => {
    const url = `${window.location.origin}/w/${invitation.slug}?side=${side}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success(side === 'groom' ? 'Da sao chep link nha trai' : 'Da sao chep link nha gai')
    } catch {
      toast.error('Khong the sao chep')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#e6dbde] shadow-sm overflow-hidden hover:shadow-md transition-all group">
      {/* Card thumbnail with status overlay — Stitch style */}
      <div className="h-40 w-full bg-[#f4f0f1] relative overflow-hidden">
        {TEMPLATE_THUMBNAILS[invitation.templateId] ?? TEMPLATE_THUMBNAILS.traditional}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <StatusBadge status={invitation.status} />
          {showDraftDanger && (
            <span className="inline-flex items-center gap-1 bg-[#ec1349]/10 text-[#ec1349] rounded-md px-2 py-0.5 text-xs font-medium">
              <AlertTriangle className="size-3" />
              Sắp bị xóa
            </span>
          )}
          {showDraftWarning && !showDraftDanger && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md px-2 py-0.5 text-xs font-medium">
              <AlertTriangle className="size-3" />
              Sẽ bị xóa sau {draftDaysLeft} ngày
            </span>
          )}
        </div>
        {invitation.plan === 'premium' && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 shadow-sm">
              <Sparkles className="size-3" />
              Premium
            </span>
          </div>
        )}
      </div>

      {/* Card content — Stitch style */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-[#181113] text-lg leading-tight line-clamp-1">
              {invitation.brideName} & {invitation.groomName}
            </h4>
            <p className="text-xs text-[#89616b] mt-0.5">
              ID: #{invitation.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <button className="text-[#5e4d52] hover:text-[#ec1349] p-1 rounded-full hover:bg-gray-100">
            <MoreVertical className="size-5" />
          </button>
        </div>

        {/* Details — Stitch style */}
        <div className="space-y-2 mt-4 text-sm text-[#5e4d52]">
          <div className="flex justify-between">
            <span>Ngày tạo:</span>
            <span className="font-medium text-[#181113]">{formattedCreated}</span>
          </div>
          <div className="flex justify-between">
            <span>Ngày lễ:</span>
            <span className="font-medium text-[#181113]">{formattedDate}</span>
          </div>
          {invitation.paymentStatus === 'pending' && (
            <div className="flex justify-between">
              <span>Thanh toán:</span>
              <span className="font-medium text-amber-600 italic">Chờ xác nhận</span>
            </div>
          )}
          {invitation.paymentStatus === 'rejected' && (
            <div className="flex justify-between">
              <span>Thanh toán:</span>
              <span className="font-medium text-red-600 italic">Từ chối</span>
            </div>
          )}
        </div>

        {/* Action buttons — Stitch style */}
        <div className="mt-5 pt-4 border-t border-[#e6dbde] flex flex-col gap-2">
          <Button
            render={<Link href={`/thep-cuoi/${invitation.id}`} />}
            nativeButton={false}
            variant="ghost"
            size="lg"
            className="w-full h-11 py-2.5 px-4 text-base font-bold text-[#ec1349] bg-[#ec1349]/5 hover:bg-[#ec1349]/10 rounded-lg transition-colors justify-center"
          >
            <Edit2 className="size-4 mr-2" />
            Chỉnh sửa
          </Button>

          {canViewPublic ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1 h-11 py-2.5 px-4 text-base font-bold text-[#5e4d52] bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors justify-center"
                onClick={() => copyUrl('groom')}
              >
                <Copy className="size-4 mr-1.5" />
                Nhà trai
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="flex-1 h-11 py-2.5 px-4 text-base font-bold text-[#5e4d52] bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors justify-center"
                onClick={() => copyUrl('bride')}
              >
                <Copy className="size-4 mr-1.5" />
                Nhà gái
              </Button>
            </div>
          ) : isDraft && !isAgent && invitation.plan !== 'premium' && invitation.paymentStatus !== 'pending' ? (
            <Button
              render={<Link href={`/nang-cap/${invitation.id}`} />}
              nativeButton={false}
              variant="ghost"
              size="lg"
              className="w-full h-11 py-2.5 px-4 text-base font-bold text-white bg-[#ec1349] hover:bg-[#d01140] rounded-lg transition-colors shadow-md shadow-[#ec1349]/20 justify-center"
            >
              Thanh toán & Publish
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="lg"
              className="w-full h-11 py-2.5 px-4 text-base font-bold text-[#5e4d52] bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors justify-center"
              disabled
            >
              <Eye className="size-4 mr-2" />
              Xem
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
