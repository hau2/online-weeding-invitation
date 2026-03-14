import { cn } from '@/lib/utils'

// Heading — uses Playfair Display, suitable for invitation titles
export function Heading({
  as: Tag = 'h2',
  className,
  children,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  className?: string
  children: React.ReactNode
}) {
  return (
    <Tag className={cn('font-heading font-semibold tracking-tight', className)}>
      {children}
    </Tag>
  )
}

// ScriptText — uses Dancing Script for couple names and decorative wedding text
export function ScriptText({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <span className={cn('font-script', className)}>
      {children}
    </span>
  )
}

// BodyText — uses Be Vietnam Pro (default body font)
export function BodyText({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p className={cn('font-sans leading-relaxed', className)}>
      {children}
    </p>
  )
}
