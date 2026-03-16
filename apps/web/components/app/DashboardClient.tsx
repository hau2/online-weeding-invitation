'use client'
import { useState } from 'react'
import { type Invitation } from '@repo/types'
import { InvitationGrid } from './InvitationGrid'
import { CreateWizard } from './CreateWizard'
import { Plus, Award, Globe, Timer } from 'lucide-react'

interface DashboardClientProps {
  invitations: Invitation[]
}

export function DashboardClient({ invitations }: DashboardClientProps) {
  const [wizardOpen, setWizardOpen] = useState(false)

  const publishedCount = invitations.filter(
    (i) => i.status === 'published' || i.status === 'save_the_date'
  ).length

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* Page Title & Primary Action — Stitch style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#181113]">
            Thiệp cưới của bạn
          </h1>
          <p className="text-[#89616b] mt-1">
            Dưới đây là tổng quan về các thiệp cưới của bạn.
          </p>
        </div>
        <button
          onClick={() => setWizardOpen(true)}
          className="flex items-center gap-2 bg-[#ec1349] hover:bg-[#d01140] text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-[#ec1349]/20 transition-all active:scale-95"
        >
          <Plus className="size-5" />
          <span>Tạo thiệp mới</span>
        </button>
      </div>

      {/* Stats Cards — Stitch style: 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Current plan */}
        <div className="bg-white p-5 rounded-xl border border-[#e6dbde] shadow-sm flex flex-col justify-between h-32 hover:border-[#ec1349]/30 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-[#5e4d52] text-sm font-medium">Gói hiện tại</p>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Award className="size-5" />
            </div>
          </div>
          <p className="text-[#181113] text-2xl font-bold">Thanh toán theo lượt</p>
        </div>
        {/* Card 2: Published invitations */}
        <div className="bg-white p-5 rounded-xl border border-[#e6dbde] shadow-sm flex flex-col justify-between h-32 hover:border-[#ec1349]/30 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-[#5e4d52] text-sm font-medium">Thiệp đang public</p>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Globe className="size-5" />
            </div>
          </div>
          <p className="text-[#181113] text-2xl font-bold">{publishedCount}</p>
        </div>
        {/* Card 3: Expiring soon */}
        <div className="bg-white p-5 rounded-xl border border-[#e6dbde] shadow-sm flex flex-col justify-between h-32 hover:border-[#ec1349]/30 transition-colors">
          <div className="flex justify-between items-start">
            <p className="text-[#5e4d52] text-sm font-medium">Thiệp sắp hết hạn</p>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Timer className="size-5" />
            </div>
          </div>
          <p className="text-[#181113] text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Invitation list section — Stitch style header */}
      <div className="bg-transparent rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#181113]">Danh sách thiệp cưới</h3>
          <button className="text-[#ec1349] text-sm font-bold hover:underline">
            Xem tất cả
          </button>
        </div>

        <InvitationGrid
          invitations={invitations}
          onCreateClick={() => setWizardOpen(true)}
        />
      </div>

      {/* Footer Help Section — Stitch style */}
      <div className="flex justify-center">
        <div className="bg-[#ec1349]/5 rounded-xl p-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left max-w-2xl w-full">
          <div className="p-3 bg-white rounded-full shadow-sm shrink-0">
            <svg className="size-6 text-[#ec1349]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#181113]">Cần hỗ trợ thiết kế thiệp?</h4>
            <p className="text-sm text-[#5e4d52]">
              Đội ngũ hỗ trợ của chúng tôi sẵn sàng giúp bạn 24/7 để có một tấm thiệp ưng ý nhất.
            </p>
          </div>
          <button className="px-4 py-2 bg-white border border-[#e6dbde] rounded-lg text-sm font-bold text-[#181113] hover:bg-gray-50 transition-colors shrink-0">
            Chat ngay
          </button>
        </div>
      </div>

      <CreateWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  )
}
