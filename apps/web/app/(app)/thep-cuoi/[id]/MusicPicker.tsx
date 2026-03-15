'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Check, Music } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import type { SystemMusicTrack } from '@repo/types'

interface MusicPickerProps {
  selectedTrackId: string | null
  onSelect: (trackId: string | null) => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function MusicPicker({ selectedTrackId, onSelect }: MusicPickerProps) {
  const [tracks, setTracks] = useState<SystemMusicTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null)
  const howlRef = useRef<import('howler').Howl | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function fetchTracks() {
      const { data } = await apiFetch<SystemMusicTrack[]>(
        '/invitations/music-tracks',
        { credentials: 'include' },
      )
      if (data) {
        setTracks(data)
      }
      setLoading(false)
    }
    fetchTracks()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.unload()
        howlRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  const stopPlayback = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.stop()
      howlRef.current.unload()
      howlRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setPlayingTrackId(null)
  }, [])

  const handlePlay = useCallback(
    async (track: SystemMusicTrack) => {
      // If already playing this track, pause it
      if (playingTrackId === track.id) {
        stopPlayback()
        return
      }

      // Stop any current playback
      stopPlayback()

      // Dynamic import howler to avoid SSR issues
      const { Howl } = await import('howler')

      const howl = new Howl({
        src: [track.url],
        html5: true,
        onend: () => {
          setPlayingTrackId(null)
          howlRef.current = null
        },
      })

      howlRef.current = howl
      howl.play()
      setPlayingTrackId(track.id)

      // Auto-stop after 30 seconds
      timeoutRef.current = setTimeout(() => {
        stopPlayback()
      }, 30_000)
    },
    [playingTrackId, stopPlayback],
  )

  const handleSelect = useCallback(
    (trackId: string) => {
      if (selectedTrackId === trackId) {
        onSelect(null)
      } else {
        onSelect(trackId)
      }
    },
    [selectedTrackId, onSelect],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400">
        <Music className="size-5 animate-pulse" />
        <span className="ml-2 text-sm">Dang tai nhac...</span>
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Chua co nhac nen nao. Quan tri vien se them nhac som.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {tracks.map((track) => {
        const isPlaying = playingTrackId === track.id
        const isSelected = selectedTrackId === track.id

        return (
          <div
            key={track.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              isSelected
                ? 'bg-rose-50 border border-rose-200'
                : 'hover:bg-gray-50 border border-transparent'
            }`}
            onClick={() => handleSelect(track.id)}
          >
            {/* Play/Pause button */}
            <button
              type="button"
              className={`shrink-0 size-8 rounded-full flex items-center justify-center transition-colors ${
                isPlaying
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-rose-600'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                handlePlay(track)
              }}
            >
              {isPlaying ? (
                <Pause className="size-3.5" />
              ) : (
                <Play className="size-3.5 ml-0.5" />
              )}
            </button>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {track.title}
              </p>
              {track.artist && (
                <p className="text-xs text-gray-500 truncate">{track.artist}</p>
              )}
            </div>

            {/* Duration */}
            <span className="text-xs text-gray-400 shrink-0">
              {formatDuration(track.duration)}
            </span>

            {/* Playing indicator */}
            {isPlaying && (
              <div className="flex items-end gap-0.5 shrink-0">
                <span className="w-0.5 h-3 bg-rose-500 rounded-full animate-pulse" />
                <span className="w-0.5 h-2 bg-rose-500 rounded-full animate-pulse [animation-delay:150ms]" />
                <span className="w-0.5 h-3.5 bg-rose-500 rounded-full animate-pulse [animation-delay:300ms]" />
              </div>
            )}

            {/* Selected checkmark */}
            {isSelected && !isPlaying && (
              <Check className="size-4 text-rose-500 shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}
