'use client'

import type { TemplateProps } from './types'
import { getTheme } from './themes'
import { SharedTemplate } from './SharedTemplate'

export function TemplateRenderer({ invitation, className }: TemplateProps) {
  const theme = getTheme(invitation.templateId)
  return (
    <SharedTemplate
      invitation={invitation}
      theme={theme}
      className={className}
    />
  )
}
