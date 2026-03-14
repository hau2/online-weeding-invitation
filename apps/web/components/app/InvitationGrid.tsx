'use client'
import { motion, type Variants } from 'framer-motion'
import { type Invitation } from '@repo/types'
import { InvitationCard } from './InvitationCard'
import { EmptyState } from './EmptyState'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

interface InvitationGridProps {
  invitations: Invitation[]
  onCreateClick?: () => void
}

export function InvitationGrid({ invitations, onCreateClick }: InvitationGridProps) {
  if (invitations.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {invitations.map((inv) => (
        <motion.div key={inv.id} variants={item}>
          <InvitationCard invitation={inv} />
        </motion.div>
      ))}
    </motion.div>
  )
}
