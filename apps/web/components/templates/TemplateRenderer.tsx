'use client'

import type { TemplateId } from '@repo/types'
import type { TemplateProps } from './types'
import { TemplateTraditional } from './TemplateTraditional'
import { TemplateModern } from './TemplateModern'
import { TemplateMinimalist } from './TemplateMinimalist'

const TEMPLATES: Record<TemplateId, React.ComponentType<TemplateProps>> = {
  traditional: TemplateTraditional,
  modern: TemplateModern,
  minimalist: TemplateMinimalist,
}

export function TemplateRenderer({ invitation, className }: TemplateProps) {
  const Component = TEMPLATES[invitation.templateId] ?? TemplateTraditional
  return <Component invitation={invitation} className={className} />
}
