'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import type { Invitation } from '@repo/types'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave(invitationId: string, delay = 800) {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestDataRef = useRef<Partial<Invitation>>({})
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [])

  const save = useCallback(
    (data: Partial<Invitation>) => {
      // Update latest data ref (prevents stale closure)
      latestDataRef.current = { ...latestDataRef.current, ...data }

      // Clear existing debounce timer
      if (timerRef.current) clearTimeout(timerRef.current)

      // Set new debounce timer
      timerRef.current = setTimeout(async () => {
        // Exclude fields managed by dedicated upload endpoints (not PATCH)
        const { photoUrls, bankQrUrl, brideBankQrUrl, ...payload } = latestDataRef.current
        latestDataRef.current = {}

        // Nothing to save after filtering
        if (Object.keys(payload).length === 0) return

        setStatus('saving')

        const { error } = await apiFetch<Invitation>(
          `/invitations/${invitationId}`,
          {
            method: 'PATCH',
            body: payload,
            credentials: 'include',
          },
        )

        if (error) {
          setStatus('error')
          toast.error(error)
        } else {
          setStatus('saved')
        }

        // Clear any previous reset timer
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current)

        // Auto-reset to idle after 2 seconds
        resetTimerRef.current = setTimeout(() => {
          setStatus('idle')
        }, 2000)
      }, delay)
    },
    [invitationId, delay],
  )

  return { save, status }
}
