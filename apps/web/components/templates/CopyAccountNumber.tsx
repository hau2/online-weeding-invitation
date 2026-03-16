'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyAccountNumberProps {
  accountNumber: string
  className?: string
}

export function CopyAccountNumber({ accountNumber, className = '' }: CopyAccountNumberProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = accountNumber
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors min-h-[48px] px-3 py-2 rounded-lg hover:opacity-80 ${className}`}
    >
      <span className="font-mono tracking-wider">{accountNumber}</span>
      {copied ? (
        <Check className="size-3.5 shrink-0" />
      ) : (
        <Copy className="size-3.5 shrink-0" />
      )}
      <span className="text-[10px] opacity-70">{copied ? 'Da sao chep' : 'Sao chep'}</span>
    </button>
  )
}
