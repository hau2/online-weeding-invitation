'use client'
import { type Invitation } from '@repo/types'
import { StatusBadge } from './StatusBadge'
import { Edit2, ExternalLink, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const TEMPLATE_THUMBNAILS: Record<string, React.ReactNode> = {
  traditional: (
    <svg viewBox="0 0 80 56" className="w-full h-full" aria-hidden>
      {/* Floral placeholder */}
      <rect width="80" height="56" fill="#fdf2f8" rx="4" />
      <circle cx="40" cy="28" r="12" fill="#fbcfe8" opacity="0.6" />
      <circle cx="40" cy="28" r="6" fill="#f9a8d4" opacity="0.8" />
    </svg>
  ),
  modern: (
    <svg viewBox="0 0 80 56" className="w-full h-full" aria-hidden>
      <rect width="80" height="56" fill="#f8fafc" rx="4" />
      <line x1="16" y1="20" x2="64" y2="20" stroke="#94a3b8" strokeWidth="2" />
      <line x1="24" y1="28" x2="56" y2="28" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="28" y1="36" x2="52" y2="36" stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  ),
  minimalist: (
    <svg viewBox="0 0 80 56" className="w-full h-full" aria-hidden>
      <rect width="80" height="56" fill="#fffbf0" rx="4" />
      <line x1="32" y1="28" x2="48" y2="28" stroke="#d4b896" strokeWidth="2" />
    </svg>
  ),
}

interface InvitationCardProps {
  invitation: Invitation
}

export function InvitationCard({ invitation }: InvitationCardProps) {
  const formattedDate = invitation.groomCeremonyDate
    ? new Date(invitation.groomCeremonyDate).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      })
    : 'Ch\u01b0a c\u00f3 ng\u00e0y'

  const formattedCreated = new Date(invitation.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  const canViewPublic = invitation.status === 'published' && invitation.slug

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="aspect-[16/11] bg-rose-50 overflow-hidden">
        {TEMPLATE_THUMBNAILS[invitation.templateId] ?? TEMPLATE_THUMBNAILS.traditional}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-rose-900 leading-tight">
            {invitation.brideName} &amp; {invitation.groomName}
          </h3>
          <StatusBadge status={invitation.status} />
        </div>

        <p className="text-xs text-gray-500">{formattedDate}</p>
        <p className="text-xs text-gray-400">{"T\u1ea1o l\u00fac: "}{formattedCreated}</p>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Eye className="size-3" />
          <span>{"0 l\u01b0\u1ee3t xem"}</span>
        </div>

        {/* Action buttons -- compact icon row at bottom (LOCKED: edit + view page only, NO QR) */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-rose-50">
          <Button render={<Link href={`/thep-cuoi/${invitation.id}`} />} nativeButton={false} variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 gap-1.5 text-xs flex-1">
            <Edit2 className="size-3.5" />
            {"Ch\u1ec9nh s\u1eeda"}
          </Button>

          {canViewPublic ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:bg-rose-50 gap-1.5 text-xs flex-1"
              onClick={() => window.open(`/w/${invitation.slug}`, '_blank')}
            >
              <ExternalLink className="size-3.5" />
              Xem trang
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="text-gray-300 gap-1.5 text-xs flex-1" disabled>
              <ExternalLink className="size-3.5" />
              Xem trang
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
