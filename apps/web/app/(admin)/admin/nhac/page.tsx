'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  Music,
  Eye,
  EyeOff,
  Trash,
  Loader2,
  Upload,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import type { AdminMusicTrack } from '@repo/types'
import { apiFetch, apiUpload } from '@/lib/api'

export default function AdminMusicPage() {
  const [tracks, setTracks] = useState<AdminMusicTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadArtist, setUploadArtist] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchTracks()
  }, [])

  async function fetchTracks() {
    setLoading(true)
    const { data, error } = await apiFetch<AdminMusicTrack[]>('/admin/music-tracks', {
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
    } else if (data) {
      setTracks(data)
    }
    setLoading(false)
  }

  async function handleUpload() {
    if (!uploadFile) {
      toast.error('Vui long chon file MP3')
      return
    }
    if (!uploadTitle.trim()) {
      toast.error('Vui long nhap ten bai hat')
      return
    }
    if (uploadFile.size > 10 * 1024 * 1024) {
      toast.error('File qua lon. Toi da 10MB.')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('title', uploadTitle.trim())
    formData.append('artist', uploadArtist.trim())

    const { error } = await apiUpload<AdminMusicTrack>('/admin/music-tracks', formData)

    if (error) {
      toast.error(error)
    } else {
      toast.success('Da tai len thanh cong')
      setUploadTitle('')
      setUploadArtist('')
      setUploadFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchTracks()
    }
    setUploading(false)
  }

  async function handleToggle(track: AdminMusicTrack) {
    setProcessingId(track.id)
    const { error } = await apiFetch(`/admin/music-tracks/${track.id}/toggle`, {
      method: 'POST',
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
    } else {
      toast.success(track.isActive ? 'Da vo hieu hoa' : 'Da kich hoat')
      fetchTracks()
    }
    setProcessingId(null)
  }

  async function handleDelete(trackId: string) {
    setProcessingId(trackId)
    const { error } = await apiFetch(`/admin/music-tracks/${trackId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (error) {
      toast.error(error)
    } else {
      toast.success('Da xoa bai hat')
      fetchTracks()
    }
    setDeleteConfirmId(null)
    setProcessingId(null)
  }

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading && tracks.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Music className="size-5 text-gray-700" />
          <h1 className="text-xl font-semibold text-gray-900">Thu vien nhac</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-1">
        <Music className="size-5 text-gray-700" />
        <h1 className="text-xl font-semibold text-gray-900">Thu vien nhac</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">Quan ly nhac nen cho thiep cuoi</p>

      {/* Upload Section */}
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Upload className="size-4" />
          Tai len bai hat moi
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Ten bai hat *"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            className="sm:max-w-[200px]"
          />
          <Input
            placeholder="Nghe si (tuy chon)"
            value={uploadArtist}
            onChange={(e) => setUploadArtist(e.target.value)}
            className="sm:max-w-[200px]"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,audio/mpeg"
            onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200"
          />
          <Button
            onClick={handleUpload}
            disabled={uploading || !uploadFile || !uploadTitle.trim()}
            className="gap-1 shrink-0"
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            Tai len
          </Button>
        </div>
        {uploadFile && (
          <p className="text-xs text-gray-400 mt-2">
            File: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(1)} MB)
          </p>
        )}
      </div>

      {/* Track List */}
      {tracks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Music className="size-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chua co bai hat nao trong thu vien</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block size-2.5 rounded-full ${track.isActive ? 'bg-green-500' : 'bg-red-400'}`}
                      title={track.isActive ? 'Dang hoat dong' : 'Da vo hieu hoa'}
                    />
                    <p className="text-sm font-medium text-gray-900 truncate">{track.title}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                    {track.artist && <span className="text-gray-500">{track.artist}</span>}
                    <span>{formatDuration(track.duration)}</span>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {track.usageCount} thiep dang su dung
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={track.isActive ? 'text-orange-600 hover:bg-orange-50 gap-1' : 'text-green-600 hover:bg-green-50 gap-1'}
                    onClick={() => handleToggle(track)}
                    disabled={processingId === track.id}
                  >
                    {processingId === track.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : track.isActive ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                    {track.isActive ? 'Vo hieu hoa' : 'Kich hoat'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 gap-1"
                    onClick={() => setDeleteConfirmId(track.id)}
                    disabled={track.usageCount > 0 || processingId === track.id}
                    title={track.usageCount > 0 ? `Khong the xoa -- dang duoc su dung boi ${track.usageCount} thiep` : 'Xoa bai hat'}
                  >
                    <Trash className="size-3.5" />
                    Xoa
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADMN-07 contract note */}
      <div className="flex items-start gap-2 mt-6 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
        <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Luu y: Bai hat da vo hieu hoa van phat tren cac thiep dang su dung. Chi an khoi trinh chon nhac.
        </p>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xac nhan xoa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Ban co chac muon xoa bai hat nay? Hanh dong nay khong the hoan tac.
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Huy
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={processingId === deleteConfirmId}
              className="gap-1"
            >
              {processingId === deleteConfirmId ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash className="size-3.5" />
              )}
              Xoa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
