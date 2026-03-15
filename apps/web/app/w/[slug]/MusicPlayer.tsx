'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play } from 'lucide-react'

interface MusicPlayerProps {
  musicUrl: string
  autoStart?: boolean
}

export function MusicPlayer({ musicUrl, autoStart = false }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const howlRef = useRef<any>(null)
  const hasAutoStarted = useRef(false)

  const initAndPlay = useCallback(async () => {
    if (howlRef.current) {
      howlRef.current.play()
      return
    }

    const { Howl, Howler } = await import('howler')

    // WKWebView compatibility (iOS in-app browsers like Zalo)
    try {
      ;(Howler as any).ctx?.resume()
    } catch {}

    const howl = new Howl({
      src: [musicUrl],
      html5: true,
      loop: true,
      volume: 0.5,
    })

    howl.on('play', () => setIsPlaying(true))
    howl.on('pause', () => setIsPlaying(false))

    howlRef.current = howl
    howl.play()
  }, [musicUrl])

  // Auto-start effect: plays when autoStart becomes true (e.g., after envelope tap)
  useEffect(() => {
    if (autoStart && !hasAutoStarted.current) {
      hasAutoStarted.current = true
      initAndPlay()
    }
  }, [autoStart, initAndPlay])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      howlRef.current?.unload()
    }
  }, [])

  const handleToggle = useCallback(async () => {
    if (!howlRef.current) {
      await initAndPlay()
      return
    }

    if (isPlaying) {
      howlRef.current.pause()
    } else {
      howlRef.current.play()
    }
  }, [isPlaying, initAndPlay])

  // Don't render if no music URL
  if (!musicUrl) return null

  return (
    <button
      onClick={handleToggle}
      aria-label={isPlaying ? 'Tam dung nhac' : 'Phat nhac'}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
    >
      {isPlaying ? (
        <div data-testid="equalizer-bars" className="flex items-end gap-[3px]">
          <span
            className="w-[3px] rounded-full bg-rose-500"
            style={{
              height: '14px',
              animation: 'equalizer 0.4s ease-in-out infinite alternate',
            }}
          />
          <span
            className="w-[3px] rounded-full bg-rose-500"
            style={{
              height: '18px',
              animation: 'equalizer 0.6s ease-in-out infinite alternate',
              animationDelay: '0.2s',
            }}
          />
          <span
            className="w-[3px] rounded-full bg-rose-500"
            style={{
              height: '12px',
              animation: 'equalizer 0.5s ease-in-out infinite alternate',
              animationDelay: '0.4s',
            }}
          />
        </div>
      ) : (
        <Play className="h-5 w-5 text-rose-500" fill="currentColor" />
      )}

    </button>
  )
}
