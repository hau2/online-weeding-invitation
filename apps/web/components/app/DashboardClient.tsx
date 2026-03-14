'use client'
import { useState } from 'react'
import { type Invitation } from '@repo/types'
import { InvitationGrid } from './InvitationGrid'
import { CreateWizard } from './CreateWizard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface DashboardClientProps {
  invitations: Invitation[]
}

export function DashboardClient({ invitations }: DashboardClientProps) {
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-rose-900">
            {"Thi\u1ec7p c\u01b0\u1edbi c\u1ee7a b\u1ea1n"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{invitations.length} {" thi\u1ec7p"}</p>
        </div>
        <Button
          onClick={() => setWizardOpen(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white gap-2 rounded-full"
        >
          <Plus className="size-4" />
          {"T\u1ea1o m\u1edbi"}
        </Button>
      </div>

      <InvitationGrid
        invitations={invitations}
        onCreateClick={() => setWizardOpen(true)}
      />

      <CreateWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  )
}
