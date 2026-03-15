import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { randomBytes } from 'crypto'
import * as sharp from 'sharp'
import { filetypemime } from 'magic-bytes.js'
import type { Invitation, SystemMusicTrack } from '@repo/types'
import { SupabaseAdminService } from '../supabase/supabase.service'
import { CreateInvitationDto } from './dto/create-invitation.dto'
import { UpdateInvitationDto } from './dto/update-invitation.dto'

/** DB row shape (snake_case) for the invitations table */
interface InvitationRow {
  id: string
  user_id: string
  slug: string | null
  status: string
  template_id: string
  groom_name: string
  bride_name: string
  wedding_date: string | null
  wedding_time: string | null
  venue_name: string
  venue_address: string
  invitation_message: string
  thank_you_text: string
  photo_urls: string[]
  music_track_id: string | null
  bank_qr_url: string | null
  bank_name: string
  bank_account_holder: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** DB row shape for system_music_tracks */
interface MusicTrackRow {
  id: string
  title: string
  artist: string
  url: string
  duration: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/**
 * camelCase DTO key -> snake_case DB column mapping.
 * NOTE: photoUrls and bankQrUrl are intentionally excluded.
 * These are managed by dedicated upload endpoints, not the generic PATCH.
 * Adding photoUrls to FIELD_MAP would allow arbitrary URL injection.
 */
const FIELD_MAP: Record<string, string> = {
  groomName: 'groom_name',
  brideName: 'bride_name',
  weddingDate: 'wedding_date',
  weddingTime: 'wedding_time',
  venueName: 'venue_name',
  venueAddress: 'venue_address',
  invitationMessage: 'invitation_message',
  thankYouText: 'thank_you_text',
  templateId: 'template_id',
  musicTrackId: 'music_track_id',
  bankName: 'bank_name',
  bankAccountHolder: 'bank_account_holder',
}

/** Map a snake_case DB row to camelCase for the frontend */
function mapRow(row: InvitationRow): Invitation {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    status: row.status as Invitation['status'],
    templateId: row.template_id as Invitation['templateId'],
    groomName: row.groom_name,
    brideName: row.bride_name,
    weddingDate: row.wedding_date,
    weddingTime: row.wedding_time,
    venueName: row.venue_name,
    venueAddress: row.venue_address,
    invitationMessage: row.invitation_message,
    thankYouText: row.thank_you_text,
    photoUrls: row.photo_urls ?? [],
    musicTrackId: row.music_track_id,
    bankQrUrl: row.bank_qr_url,
    bankName: row.bank_name,
    bankAccountHolder: row.bank_account_holder,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

/** Map a snake_case music track row to camelCase */
function mapMusicTrackRow(row: MusicTrackRow): SystemMusicTrack {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    url: row.url,
    duration: row.duration,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Select clause for all invitation columns */
const SELECT_ALL =
  'id, user_id, slug, status, template_id, groom_name, bride_name, ' +
  'wedding_date, wedding_time, venue_name, venue_address, ' +
  'invitation_message, thank_you_text, photo_urls, music_track_id, ' +
  'bank_qr_url, bank_name, bank_account_holder, ' +
  'created_at, updated_at, deleted_at'

/** Allowed image MIME types for upload validation */
const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

@Injectable()
export class InvitationsService {
  constructor(
    private readonly supabaseAdmin: SupabaseAdminService,
  ) {}

  /**
   * Generate a URL-safe slug from bride + groom names.
   * Format: bridename-groomname-XXXX (4-char base64url random suffix)
   */
  private generateSlug(brideName: string, groomName: string): string {
    const normalize = (name: string) =>
      name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // strip Vietnamese diacritics
        .replace(/[^\w\s-]/g, '') // strip non-word chars (keep spaces/hyphens)
        .trim()
        .replace(/\s+/g, '-') // spaces to hyphens
        .toLowerCase()
        .slice(0, 20) // limit per name

    const suffix = randomBytes(3)
      .toString('base64url')
      .slice(0, 4)
      .toLowerCase()

    return `${normalize(brideName)}-${normalize(groomName)}-${suffix}`
  }

  /**
   * Validate magic bytes and compress image to WebP.
   * Throws BadRequestException for invalid image types.
   */
  private async processImage(buffer: Buffer): Promise<Buffer> {
    const detectedMimes = filetypemime(buffer)
    const isValidImage = detectedMimes.some((mime: string) =>
      ALLOWED_IMAGE_MIMES.has(mime),
    )

    if (!isValidImage) {
      throw new BadRequestException(
        'Dinh dang anh khong hop le. Chi chap nhan JPEG, PNG hoac WebP.',
      )
    }

    return sharp(buffer)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer()
  }

  /**
   * Extract the storage path from a Supabase public URL.
   * URL format: https://{host}/storage/v1/object/public/{bucket}/{path}
   */
  private extractStoragePath(publicUrl: string, bucket: string): string {
    const marker = `/storage/v1/object/public/${bucket}/`
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) {
      // Fallback: try to extract path after bucket name
      const parts = publicUrl.split(`/${bucket}/`)
      return parts.length > 1 ? parts[parts.length - 1] : ''
    }
    return publicUrl.slice(idx + marker.length)
  }

  async listByUser(userId: string) {
    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .select(SELECT_ALL)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw new InternalServerErrorException(error.message)

    return ((data as unknown as InvitationRow[]) ?? []).map(mapRow)
  }

  async create(userId: string, dto: CreateInvitationDto) {
    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .insert({
        user_id: userId, // ALWAYS from JWT, never from dto
        bride_name: dto.brideName,
        groom_name: dto.groomName,
        template_id: dto.templateId,
        status: 'draft',
        venue_name: '',
        venue_address: '',
        invitation_message: '',
        thank_you_text: '',
      })
      .select()
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Get a single invitation by ID, scoped to the requesting user.
   * Returns 404 for non-existent OR non-owned invitations (no existence leaking).
   */
  async findOne(userId: string, id: string) {
    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .select(SELECT_ALL)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      throw new NotFoundException('Khong tim thay thiep cuoi')
    }

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Partial update -- only sends provided fields to DB.
   * Verifies ownership via findOne first.
   */
  async update(userId: string, id: string, dto: UpdateInvitationDto) {
    // Verify ownership (throws NotFoundException if not found/not owner)
    await this.findOne(userId, id)

    // Build snake_case update object from only present DTO fields
    const updateObj: Record<string, unknown> = {}
    for (const [camelKey, snakeKey] of Object.entries(FIELD_MAP)) {
      const value = (dto as Record<string, unknown>)[camelKey]
      if (value !== undefined) {
        updateObj[snakeKey] = value
      }
    }

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update(updateObj)
      .eq('id', id)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Upload photos to an invitation.
   * Validates ownership, enforces 10-photo limit, compresses to WebP.
   */
  async uploadPhotos(
    userId: string,
    invitationId: string,
    files: Express.Multer.File[],
  ): Promise<Invitation> {
    const invitation = await this.findOne(userId, invitationId)
    const existingCount = invitation.photoUrls.length

    if (existingCount + files.length > 10) {
      throw new BadRequestException(
        `Toi da 10 anh. Hien tai da co ${existingCount} anh.`,
      )
    }

    const newUrls: string[] = []
    const timestamp = Date.now()

    for (let i = 0; i < files.length; i++) {
      const compressed = await this.processImage(files[i].buffer)
      const storagePath = `${invitationId}/${timestamp}-${i}.webp`

      const { error: uploadError } = await this.supabaseAdmin.client.storage
        .from('invitation-photos')
        .upload(storagePath, compressed, {
          contentType: 'image/webp',
          upsert: false,
        })

      if (uploadError) {
        throw new InternalServerErrorException(
          `Khong the tai anh len: ${uploadError.message}`,
        )
      }

      const { data: urlData } = this.supabaseAdmin.client.storage
        .from('invitation-photos')
        .getPublicUrl(storagePath)

      newUrls.push(urlData.publicUrl)
    }

    const updatedPhotoUrls = [...invitation.photoUrls, ...newUrls]

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ photo_urls: updatedPhotoUrls })
      .eq('id', invitationId)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Delete a photo at a given index from an invitation.
   * Removes from storage and updates the photo_urls array.
   */
  async deletePhoto(
    userId: string,
    invitationId: string,
    photoIndex: number,
  ): Promise<Invitation> {
    const invitation = await this.findOne(userId, invitationId)
    const photoUrls = [...invitation.photoUrls]

    if (photoIndex < 0 || photoIndex >= photoUrls.length) {
      throw new BadRequestException('Vi tri anh khong hop le.')
    }

    const removedUrl = photoUrls[photoIndex]
    const storagePath = this.extractStoragePath(removedUrl, 'invitation-photos')

    if (storagePath) {
      await this.supabaseAdmin.client.storage
        .from('invitation-photos')
        .remove([storagePath])
    }

    photoUrls.splice(photoIndex, 1)

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ photo_urls: photoUrls })
      .eq('id', invitationId)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Upload a bank QR image for an invitation.
   * Replaces existing QR if present (deletes old file from storage).
   */
  async uploadBankQr(
    userId: string,
    invitationId: string,
    file: Express.Multer.File,
  ): Promise<Invitation> {
    const invitation = await this.findOne(userId, invitationId)

    const compressed = await this.processImage(file.buffer)

    // Delete old QR if exists
    if (invitation.bankQrUrl) {
      const oldPath = this.extractStoragePath(invitation.bankQrUrl, 'bank-qr')
      if (oldPath) {
        await this.supabaseAdmin.client.storage
          .from('bank-qr')
          .remove([oldPath])
      }
    }

    const storagePath = `${invitationId}/bank-qr.webp`

    const { error: uploadError } = await this.supabaseAdmin.client.storage
      .from('bank-qr')
      .upload(storagePath, compressed, {
        contentType: 'image/webp',
        upsert: true,
      })

    if (uploadError) {
      throw new InternalServerErrorException(
        `Khong the tai anh QR len: ${uploadError.message}`,
      )
    }

    const { data: urlData } = this.supabaseAdmin.client.storage
      .from('bank-qr')
      .getPublicUrl(storagePath)

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ bank_qr_url: urlData.publicUrl })
      .eq('id', invitationId)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Update photo order for an invitation.
   * Validates that the incoming array contains exactly the same URLs as existing.
   * This is a dedicated endpoint because photoUrls is excluded from FIELD_MAP
   * to prevent arbitrary URL injection via the generic PATCH.
   */
  async updatePhotoOrder(
    userId: string,
    invitationId: string,
    photoUrls: string[],
  ): Promise<Invitation> {
    const invitation = await this.findOne(userId, invitationId)

    // Validate same set of URLs (different order allowed)
    const currentSet = new Set(invitation.photoUrls)
    const newSet = new Set(photoUrls)

    if (
      currentSet.size !== newSet.size ||
      photoUrls.length !== invitation.photoUrls.length ||
      !photoUrls.every((url) => currentSet.has(url))
    ) {
      throw new BadRequestException('Danh sach anh khong hop le.')
    }

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ photo_urls: photoUrls })
      .eq('id', invitationId)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * List all active system music tracks ordered by sort_order.
   */
  async listMusicTracks(): Promise<SystemMusicTrack[]> {
    const { data, error } = await this.supabaseAdmin.client
      .from('system_music_tracks')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw new InternalServerErrorException(error.message)

    return ((data as unknown as MusicTrackRow[]) ?? []).map(mapMusicTrackRow)
  }

  /**
   * Publish an invitation.
   * - First publish: generates slug via admin client (bypasses RLS for slug write)
   * - Re-publish: just sets status, preserves existing slug
   * - Slug collision: retries up to 3 times with new random suffix
   */
  async publish(userId: string, id: string) {
    const invitation = await this.findOne(userId, id)

    // If slug already exists, just update status (use user client, no slug change)
    if (invitation.slug) {
      const { data, error } = await this.supabaseAdmin.client
        .from('invitations')
        .update({ status: 'published' })
        .eq('id', id)
        .select(SELECT_ALL)
        .single()

      if (error) throw new InternalServerErrorException(error.message)
      return mapRow(data as unknown as InvitationRow)
    }

    // First publish: generate slug and update via admin client
    const maxAttempts = 3
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const slug = this.generateSlug(invitation.brideName, invitation.groomName)

      const { data, error } = await this.supabaseAdmin.client
        .from('invitations')
        .update({ slug, status: 'published' })
        .eq('id', id)
        .select(SELECT_ALL)
        .single()

      if (!error && data) {
        return mapRow(data as unknown as InvitationRow)
      }

      // If it's a unique constraint violation on slug, retry
      if (error?.code === '23505' && attempt < maxAttempts - 1) {
        continue
      }

      throw new InternalServerErrorException(
        error?.message ?? 'Khong the xuat ban thiep cuoi',
      )
    }

    // Should not reach here, but satisfy TypeScript
    throw new InternalServerErrorException('Khong the tao slug duy nhat')
  }

  /**
   * Unpublish -- sets status back to draft without clearing slug.
   */
  async unpublish(userId: string, id: string) {
    // Verify ownership
    await this.findOne(userId, id)

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ status: 'draft' })
      .eq('id', id)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
  }
}
