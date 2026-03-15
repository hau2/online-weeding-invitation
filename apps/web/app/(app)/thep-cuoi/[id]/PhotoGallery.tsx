'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { apiUpload, apiFetch } from '@/lib/api'
import type { Invitation } from '@repo/types'

interface PhotoGalleryProps {
  invitationId: string
  photoUrls: string[]
  onChange: (photoUrls: string[]) => void
}

function SortablePhoto({
  url,
  index,
  onDelete,
  isDeleting,
}: {
  url: string
  index: number
  onDelete: (index: number) => void
  isDeleting: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square rounded-lg overflow-hidden group"
    >
      <Image
        src={url}
        alt={`Anh cuoi ${index + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 33vw, 120px"
      />

      {/* Drag handle */}
      <button
        type="button"
        className="absolute top-1 left-1 p-1 rounded bg-white/70 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      {/* Delete button */}
      <button
        type="button"
        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(index)}
        disabled={isDeleting}
      >
        <X className="size-3" />
      </button>

      {/* Deleting overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Loader2 className="size-5 text-white animate-spin" />
        </div>
      )}
    </div>
  )
}

export function PhotoGallery({
  invitationId,
  photoUrls,
  onChange,
}: PhotoGalleryProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previousOrderRef = useRef<string[]>(photoUrls)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const atLimit = photoUrls.length >= 10

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      if (fileArray.length === 0) return

      if (photoUrls.length + fileArray.length > 10) {
        toast.error(`Chi duoc tai toi da 10 anh. Hien da co ${photoUrls.length} anh.`)
        return
      }

      setIsUploading(true)
      const formData = new FormData()
      fileArray.forEach((file) => formData.append('photos', file))

      const { data, error } = await apiUpload<Invitation>(
        `/invitations/${invitationId}/photos`,
        formData,
      )

      setIsUploading(false)

      if (error) {
        toast.error(error)
        return
      }

      if (data) {
        onChange(data.photoUrls)
      }
    },
    [invitationId, photoUrls.length, onChange],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleUpload(e.target.files)
        // Reset input so the same file can be selected again
        e.target.value = ''
      }
    },
    [handleUpload],
  )

  const handleNativeDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        handleUpload(files)
      }
    },
    [handleUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = photoUrls.indexOf(active.id as string)
      const newIndex = photoUrls.indexOf(over.id as string)

      if (oldIndex === -1 || newIndex === -1) return

      const newOrder = arrayMove(photoUrls, oldIndex, newIndex)
      previousOrderRef.current = photoUrls
      onChange(newOrder)

      const { error } = await apiFetch<Invitation>(
        `/invitations/${invitationId}/photo-order`,
        { method: 'PATCH', body: { photoUrls: newOrder } },
      )

      if (error) {
        toast.error(error)
        onChange(previousOrderRef.current)
      }
    },
    [photoUrls, invitationId, onChange],
  )

  const handleDelete = useCallback(
    async (index: number) => {
      setDeletingIndex(index)

      const { data, error } = await apiFetch<Invitation>(
        `/invitations/${invitationId}/photos/${index}`,
        { method: 'DELETE' },
      )

      setDeletingIndex(null)

      if (error) {
        toast.error(error)
        return
      }

      if (data) {
        onChange(data.photoUrls)
      }
    },
    [invitationId, onChange],
  )

  return (
    <div
      className="relative"
      onDrop={handleNativeDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Drop zone overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-20 bg-rose-50/80 border-2 border-dashed border-rose-400 rounded-lg flex items-center justify-center">
          <p className="text-rose-600 font-medium text-sm">Tha anh vao day</p>
        </div>
      )}

      {/* Thumbnail grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={photoUrls} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-2">
            {photoUrls.map((url, index) => (
              <SortablePhoto
                key={url}
                url={url}
                index={index}
                onDelete={handleDelete}
                isDeleting={deletingIndex === index}
              />
            ))}

            {/* Upload button / uploading indicator */}
            {!atLimit && (
              <button
                type="button"
                className="aspect-square rounded-lg border-2 border-dashed border-rose-200 hover:border-rose-400 flex flex-col items-center justify-center text-rose-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <Plus className="size-6" />
                )}
              </button>
            )}

            {atLimit && (
              <div className="col-span-3 text-center text-xs text-gray-400 py-1">
                Da dat toi da 10 anh
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
