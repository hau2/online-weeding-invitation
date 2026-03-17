import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomBytes } from 'crypto'
import * as QRCode from 'qrcode'
import * as sharp from 'sharp'
import { filetypemime } from 'magic-bytes.js'
import type { CeremonyProgramEvent, Invitation, LoveStoryMilestone, SystemMusicTrack } from '@repo/types'
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
  groom_father: string
  groom_mother: string
  groom_ceremony_date: string | null
  groom_ceremony_time: string | null
  groom_venue_name: string
  groom_venue_address: string
  bride_father: string
  bride_mother: string
  bride_ceremony_date: string | null
  bride_ceremony_time: string | null
  bride_venue_name: string
  bride_venue_address: string
  love_story: unknown[]
  venue_map_url: string
  invitation_message: string
  thank_you_text: string
  photo_urls: string[]
  music_track_id: string | null
  bank_qr_url: string | null
  bank_name: string
  bank_account_holder: string
  bank_account_number: string
  bride_bank_qr_url: string | null
  bride_bank_name: string
  bride_bank_account_holder: string
  bride_bank_account_number: string
  ceremony_program: unknown[]
  teaser_message: string
  groom_avatar_url: string | null
  bride_avatar_url: string | null
  groom_nickname: string
  bride_nickname: string
  plan: string
  payment_status: string
  admin_notes: string
  is_disabled: boolean
  qr_code_url: string | null
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
  groomFather: 'groom_father',
  groomMother: 'groom_mother',
  groomCeremonyDate: 'groom_ceremony_date',
  groomCeremonyTime: 'groom_ceremony_time',
  groomVenueName: 'groom_venue_name',
  groomVenueAddress: 'groom_venue_address',
  brideFather: 'bride_father',
  brideMother: 'bride_mother',
  brideCeremonyDate: 'bride_ceremony_date',
  brideCeremonyTime: 'bride_ceremony_time',
  brideVenueName: 'bride_venue_name',
  brideVenueAddress: 'bride_venue_address',
  loveStory: 'love_story',
  venueMapUrl: 'venue_map_url',
  invitationMessage: 'invitation_message',
  thankYouText: 'thank_you_text',
  templateId: 'template_id',
  musicTrackId: 'music_track_id',
  bankName: 'bank_name',
  bankAccountHolder: 'bank_account_holder',
  bankAccountNumber: 'bank_account_number',
  brideBankName: 'bride_bank_name',
  brideBankAccountHolder: 'bride_bank_account_holder',
  brideBankAccountNumber: 'bride_bank_account_number',
  teaserMessage: 'teaser_message',
  ceremonyProgram: 'ceremony_program',
  groomNickname: 'groom_nickname',
  brideNickname: 'bride_nickname',
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
    groomFather: row.groom_father,
    groomMother: row.groom_mother,
    groomCeremonyDate: row.groom_ceremony_date,
    groomCeremonyTime: row.groom_ceremony_time,
    groomVenueName: row.groom_venue_name,
    groomVenueAddress: row.groom_venue_address,
    brideFather: row.bride_father,
    brideMother: row.bride_mother,
    brideCeremonyDate: row.bride_ceremony_date,
    brideCeremonyTime: row.bride_ceremony_time,
    brideVenueName: row.bride_venue_name,
    brideVenueAddress: row.bride_venue_address,
    ceremonyProgram: row.ceremony_program as CeremonyProgramEvent[],
    loveStory: row.love_story as LoveStoryMilestone[],
    venueMapUrl: row.venue_map_url,
    groomAvatarUrl: row.groom_avatar_url,
    brideAvatarUrl: row.bride_avatar_url,
    groomNickname: row.groom_nickname,
    brideNickname: row.bride_nickname,
    invitationMessage: row.invitation_message,
    thankYouText: row.thank_you_text,
    teaserMessage: row.teaser_message,
    photoUrls: row.photo_urls ?? [],
    musicTrackId: row.music_track_id,
    bankQrUrl: row.bank_qr_url,
    bankName: row.bank_name,
    bankAccountHolder: row.bank_account_holder,
    bankAccountNumber: row.bank_account_number,
    brideBankQrUrl: row.bride_bank_qr_url,
    brideBankName: row.bride_bank_name,
    brideBankAccountHolder: row.bride_bank_account_holder,
    brideBankAccountNumber: row.bride_bank_account_number,
    plan: row.plan as Invitation['plan'],
    paymentStatus: row.payment_status as Invitation['paymentStatus'],
    adminNotes: row.admin_notes,
    isDisabled: row.is_disabled,
    qrCodeUrl: row.qr_code_url,
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
  'groom_father, groom_mother, groom_ceremony_date, groom_ceremony_time, ' +
  'groom_venue_name, groom_venue_address, ' +
  'bride_father, bride_mother, bride_ceremony_date, bride_ceremony_time, ' +
  'bride_venue_name, bride_venue_address, ' +
  'ceremony_program, love_story, venue_map_url, ' +
  'groom_avatar_url, bride_avatar_url, groom_nickname, bride_nickname, ' +
  'invitation_message, thank_you_text, teaser_message, photo_urls, music_track_id, ' +
  'bank_qr_url, bank_name, bank_account_holder, bank_account_number, ' +
  'bride_bank_qr_url, bride_bank_name, bride_bank_account_holder, bride_bank_account_number, ' +
  'plan, payment_status, admin_notes, is_disabled, ' +
  'qr_code_url, created_at, updated_at, deleted_at'

/** Allowed image MIME types for upload validation */
const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name)

  constructor(
    private readonly supabaseAdmin: SupabaseAdminService,
    private readonly config: ConfigService,
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
   * Process avatar image: validate MIME, resize to 400x400 square crop, convert to WebP.
   */
  private async processAvatarImage(buffer: Buffer): Promise<Buffer> {
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
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
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

  /**
   * Trigger on-demand ISR revalidation for a public invitation page.
   * Non-blocking: logs a warning on failure but does not throw.
   */
  private async triggerRevalidation(slug: string): Promise<void> {
    const nextUrl =
      this.config.get<string>('NEXT_PUBLIC_URL') ?? 'http://localhost:3000'
    const secret = this.config.get<string>('REVALIDATION_SECRET')

    if (!secret) {
      // Dev mode — no secret configured, skip silently
      return
    }

    try {
      await fetch(`${nextUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidation-secret': secret,
        },
        body: JSON.stringify({ slug }),
      })
    } catch (err) {
      this.logger.warn(
        `ISR revalidation failed for slug "${slug}": ${err instanceof Error ? err.message : err}`,
      )
    }
  }

  /**
   * Generate a QR code PNG for the public invitation URL and upload to Supabase Storage.
   * Stores the public URL in the invitation's qr_code_url column.
   * Failure is non-blocking: logs a warning but does not throw.
   */
  async generateQrCode(invitationId: string, slug: string): Promise<void> {
    try {
      const siteUrl =
        this.config.get<string>('SITE_URL') ?? 'http://localhost:3000'
      const url = `${siteUrl}/w/${slug}`

      const buffer = await QRCode.toBuffer(url, {
        type: 'png',
        width: 512,
        margin: 2,
        errorCorrectionLevel: 'H',
      })

      const storagePath = `${invitationId}/qr.png`

      const { error: uploadError } =
        await this.supabaseAdmin.client.storage
          .from('qr-codes')
          .upload(storagePath, buffer, {
            contentType: 'image/png',
            upsert: true,
          })

      if (uploadError) {
        this.logger.warn(
          `QR upload failed for invitation ${invitationId}: ${uploadError.message}`,
        )
        return
      }

      const { data: urlData } = this.supabaseAdmin.client.storage
        .from('qr-codes')
        .getPublicUrl(storagePath)

      // Store the public URL in the invitation row
      await this.supabaseAdmin.client
        .from('invitations')
        .update({ qr_code_url: urlData.publicUrl })
        .eq('id', invitationId)
    } catch (err) {
      this.logger.warn(
        `QR generation failed for invitation ${invitationId}: ${err instanceof Error ? err.message : err}`,
      )
    }
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
        plan: 'free',
        payment_status: 'none',
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
   * Public: find a published or save_the_date invitation by slug (no auth required).
   * Returns 404 for draft/deleted/nonexistent slugs.
   * Includes expiry flag, isSaveTheDate flag, and resolved musicUrl when applicable.
   */
  async findBySlug(slug: string): Promise<Invitation & { expired: boolean; isSaveTheDate: boolean; musicUrl?: string }> {
    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .select(SELECT_ALL)
      .eq('slug', slug)
      .in('status', ['published', 'save_the_date', 'expired'])
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      throw new NotFoundException('Khong tim thay thiep cuoi')
    }

    const row = data as unknown as InvitationRow

    // Disabled invitations return 404 on public page
    if (row.is_disabled) {
      throw new NotFoundException('Khong tim thay thiep cuoi')
    }

    const mapped = mapRow(row)
    const isSaveTheDate = row.status === 'save_the_date'

    // Determine expiry status:
    // - Teasers (save_the_date) never expire
    // - If cron already marked as 'expired', trust it
    // - Otherwise, runtime date check remains as a safety net for invitations the cron hasn't processed yet
    let expired = false
    if (!isSaveTheDate) {
      if (row.status === 'expired') {
        expired = true
      } else {
        // Runtime safety net: compute expiry from ceremony dates + 7-day grace period
        const dates = [row.groom_ceremony_date, row.bride_ceremony_date].filter(
          (d): d is string => d !== null,
        )
        if (dates.length > 0) {
          const latestDate = dates.sort().pop()!
          const ceremonyStr = `${latestDate}T23:59:59+07:00`
          const ceremonyMs = new Date(ceremonyStr).getTime()
          const gracePeriodMs = 7 * 24 * 60 * 60 * 1000
          expired = Date.now() > ceremonyMs + gracePeriodMs
        }
      }
    }

    // Resolve music URL if musicTrackId is set (skip for save_the_date teasers)
    let musicUrl: string | undefined
    if (!isSaveTheDate && row.music_track_id) {
      const { data: trackData } = await this.supabaseAdmin.client
        .from('system_music_tracks')
        .select('url')
        .eq('id', row.music_track_id)
        .single()

      if (trackData) {
        musicUrl = (trackData as unknown as { url: string }).url
      }
    }

    // Fetch watermark config for free-tier invitations
    let watermarkText: string | undefined
    let watermarkOpacity: number | undefined
    if (row.plan !== 'premium') {
      const { data: wmData } = await this.supabaseAdmin.client
        .from('system_settings')
        .select('value')
        .eq('key', 'watermark_config')
        .single()
      if (wmData) {
        const wmConfig = (wmData as { value: Record<string, unknown> }).value
        watermarkText = (wmConfig.text as string) ?? undefined
        watermarkOpacity = (wmConfig.opacity as number) ?? undefined
      }
    }

    return {
      ...mapped,
      expired,
      isSaveTheDate,
      ...(musicUrl ? { musicUrl } : {}),
      ...(watermarkText ? { watermarkText } : {}),
      ...(watermarkOpacity !== undefined ? { watermarkOpacity } : {}),
    }
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
   * Upload a bride-side bank QR image for an invitation.
   */
  async uploadBrideBankQr(
    userId: string,
    invitationId: string,
    file: Express.Multer.File,
  ): Promise<Invitation> {
    const invitation = await this.findOne(userId, invitationId)

    const compressed = await this.processImage(file.buffer)

    if (invitation.brideBankQrUrl) {
      const oldPath = this.extractStoragePath(invitation.brideBankQrUrl, 'bank-qr')
      if (oldPath) {
        await this.supabaseAdmin.client.storage
          .from('bank-qr')
          .remove([oldPath])
      }
    }

    const storagePath = `${invitationId}/bride-bank-qr.webp`

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
      .update({ bride_bank_qr_url: urlData.publicUrl })
      .eq('id', invitationId)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Upload a groom avatar image for an invitation.
   * Processed to 400x400 WebP square crop (fit: cover).
   */
  async uploadGroomAvatar(
    userId: string,
    invitationId: string,
    file: Express.Multer.File,
  ): Promise<Invitation> {
    const invitation = await this.findOne(userId, invitationId)

    const compressed = await this.processAvatarImage(file.buffer)

    // Delete old avatar if exists
    if (invitation.groomAvatarUrl) {
      const oldPath = this.extractStoragePath(
        invitation.groomAvatarUrl,
        'invitation-photos',
      )
      if (oldPath) {
        await this.supabaseAdmin.client.storage
          .from('invitation-photos')
          .remove([oldPath])
      }
    }

    const storagePath = `${invitationId}/groom-avatar.webp`

    const { error: uploadError } = await this.supabaseAdmin.client.storage
      .from('invitation-photos')
      .upload(storagePath, compressed, {
        contentType: 'image/webp',
        upsert: true,
      })

    if (uploadError) {
      throw new InternalServerErrorException(
        `Khong the tai anh avatar len: ${uploadError.message}`,
      )
    }

    const { data: urlData } = this.supabaseAdmin.client.storage
      .from('invitation-photos')
      .getPublicUrl(storagePath)

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ groom_avatar_url: urlData.publicUrl })
      .eq('id', invitationId)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Upload a bride avatar image for an invitation.
   * Processed to 400x400 WebP square crop (fit: cover).
   */
  async uploadBrideAvatar(
    userId: string,
    invitationId: string,
    file: Express.Multer.File,
  ): Promise<Invitation> {
    const invitation = await this.findOne(userId, invitationId)

    const compressed = await this.processAvatarImage(file.buffer)

    if (invitation.brideAvatarUrl) {
      const oldPath = this.extractStoragePath(
        invitation.brideAvatarUrl,
        'invitation-photos',
      )
      if (oldPath) {
        await this.supabaseAdmin.client.storage
          .from('invitation-photos')
          .remove([oldPath])
      }
    }

    const storagePath = `${invitationId}/bride-avatar.webp`

    const { error: uploadError } = await this.supabaseAdmin.client.storage
      .from('invitation-photos')
      .upload(storagePath, compressed, {
        contentType: 'image/webp',
        upsert: true,
      })

    if (uploadError) {
      throw new InternalServerErrorException(
        `Khong the tai anh avatar len: ${uploadError.message}`,
      )
    }

    const { data: urlData } = this.supabaseAdmin.client.storage
      .from('invitation-photos')
      .getPublicUrl(storagePath)

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ bride_avatar_url: urlData.publicUrl })
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
   * Get payment config from system_settings for the upgrade page.
   */
  async getPaymentConfig() {
    const { data, error } = await this.supabaseAdmin.client
      .from('system_settings')
      .select('value')
      .eq('key', 'payment_config')
      .single()

    if (error || !data) {
      return {
        bankName: '',
        bankQrUrl: '',
        bankAccountHolder: '',
        pricePerInvitation: 50000,
      }
    }

    const config = data.value as Record<string, unknown>
    return {
      bankName: (config.bankName as string) ?? '',
      bankQrUrl: (config.bankQrUrl as string) ?? '',
      bankAccountHolder: (config.bankAccountHolder as string) ?? '',
      pricePerInvitation: (config.pricePerInvitation as number) ?? 50000,
    }
  }

  /**
   * Enforce publish limits based on user tier.
   * - Agent tier: 20 published invitations per 30-day cycle, active subscription required.
   * - Free tier: max 1 live invitation.
   * - Premium (non-agent): no limit.
   */
  private async enforcePublishLimit(userId: string, currentInvitationId: string, plan: string): Promise<void> {
    // Fetch user tier info
    const { data: userRow, error: userError } = await this.supabaseAdmin.client
      .from('users')
      .select('tier, subscription_start, subscription_end')
      .eq('id', userId)
      .single()

    if (userError) throw new InternalServerErrorException(userError.message)

    const user = userRow as unknown as {
      tier: string
      subscription_start: string | null
      subscription_end: string | null
    }

    // Agent tier check
    if (user.tier === 'agent') {
      // Check subscription is active
      if (!user.subscription_end || new Date(user.subscription_end) < new Date()) {
        throw new BadRequestException(
          'Goi dai ly da het han. Vui long gia han de tiep tuc xuat ban.',
        )
      }

      // Compute current cycle start
      const cycleStart = new Date(user.subscription_start!)
      const now = new Date()
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
      while (cycleStart.getTime() + thirtyDaysMs <= now.getTime()) {
        cycleStart.setTime(cycleStart.getTime() + thirtyDaysMs)
      }

      const { count, error } = await this.supabaseAdmin.client
        .from('invitations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['published', 'save_the_date'])
        .is('deleted_at', null)
        .gte('created_at', cycleStart.toISOString())
        .neq('id', currentInvitationId)

      if (error) throw new InternalServerErrorException(error.message)

      if ((count ?? 0) >= 20) {
        throw new BadRequestException(
          'Da dat gioi han 20 thiep/thang. Vui long cho chu ky moi.',
        )
      }

      return // Agent can publish (auto-premium handled at publish site)
    }

    // Regular user: existing free tier check
    if (plan !== 'free') return

    const { count, error } = await this.supabaseAdmin.client
      .from('invitations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['published', 'save_the_date'])
      .is('deleted_at', null)
      .neq('id', currentInvitationId)

    if (error) throw new InternalServerErrorException(error.message)

    if ((count ?? 0) >= 1) {
      throw new BadRequestException(
        'Ban chi co the xuat ban 1 thiep mien phi. Vui long nang cap len Premium de xuat ban them.',
      )
    }
  }

  /**
   * Publish as save-the-date teaser.
   * - Only transitions from 'draft' status.
   * - Validates minimum fields: groomName, brideName, and at least one ceremony date.
   * - Free tier: enforces max 1 live invitation.
   * - First time: generates slug + QR code.
   * - Re-publish (slug exists): just updates status.
   */
  async publishSaveTheDate(userId: string, id: string) {
    const invitation = await this.findOne(userId, id)

    // Only allow transition from 'draft'
    if (invitation.status === 'published') {
      throw new BadRequestException(
        'Thiep da duoc xuat ban day du, khong the chuyen sang Save the Date',
      )
    }
    if (invitation.status !== 'draft') {
      throw new BadRequestException(
        'Chi co the xuat ban Save the Date tu trang thai nhap',
      )
    }

    // Validate minimum fields
    if (!invitation.groomName || !invitation.brideName) {
      throw new BadRequestException(
        'Can nhap ten chu re va co dau truoc khi xuat ban Save the Date',
      )
    }
    if (!invitation.groomCeremonyDate && !invitation.brideCeremonyDate) {
      throw new BadRequestException(
        'Can chon it nhat mot ngay le truoc khi xuat ban Save the Date',
      )
    }

    // Enforce publish limits (agent quota or free tier limit)
    await this.enforcePublishLimit(userId, id, invitation.plan)

    // Auto-premium for agent tier: agents always publish as premium
    const { data: stdUser } = await this.supabaseAdmin.client
      .from('users')
      .select('tier')
      .eq('id', userId)
      .single()
    const effectivePlan = (stdUser as unknown as { tier: string })?.tier === 'agent'
      ? 'premium'
      : invitation.plan

    // If slug already exists (previously published), just update status
    if (invitation.slug) {
      const { data, error } = await this.supabaseAdmin.client
        .from('invitations')
        .update({ status: 'save_the_date', plan: effectivePlan })
        .eq('id', id)
        .select(SELECT_ALL)
        .single()

      if (error) throw new InternalServerErrorException(error.message)

      await this.triggerRevalidation(invitation.slug)
      return mapRow(data as unknown as InvitationRow)
    }

    // First time: generate slug with retry
    const maxAttempts = 3
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const slug = this.generateSlug(invitation.brideName, invitation.groomName)

      const { data, error } = await this.supabaseAdmin.client
        .from('invitations')
        .update({ slug, status: 'save_the_date', plan: effectivePlan })
        .eq('id', id)
        .select(SELECT_ALL)
        .single()

      if (!error && data) {
        await this.generateQrCode(id, slug)
        await this.triggerRevalidation(slug)
        return mapRow(data as unknown as InvitationRow)
      }

      // If it's a unique constraint violation on slug, retry
      if (error?.code === '23505' && attempt < maxAttempts - 1) {
        continue
      }

      throw new InternalServerErrorException(
        error?.message ?? 'Khong the xuat ban Save the Date',
      )
    }

    // Should not reach here, but satisfy TypeScript
    throw new InternalServerErrorException('Khong the tao slug duy nhat')
  }

  /**
   * Publish an invitation.
   * - Allows transition from both 'draft' and 'save_the_date' statuses.
   * - Free tier: enforces max 1 live invitation.
   * - First publish: generates slug via admin client (bypasses RLS for slug write)
   * - Re-publish: just sets status, preserves existing slug
   * - Slug collision: retries up to 3 times with new random suffix
   */
  async publish(userId: string, id: string) {
    const invitation = await this.findOne(userId, id)

    // Enforce publish limits (agent quota or free tier limit)
    await this.enforcePublishLimit(userId, id, invitation.plan)

    // Auto-premium for agent tier: agents always publish as premium
    const { data: publishingUser } = await this.supabaseAdmin.client
      .from('users')
      .select('tier')
      .eq('id', userId)
      .single()
    const effectivePlan = (publishingUser as unknown as { tier: string })?.tier === 'agent'
      ? 'premium'
      : invitation.plan

    // If slug already exists, just update status (use user client, no slug change)
    if (invitation.slug) {
      const { data, error } = await this.supabaseAdmin.client
        .from('invitations')
        .update({ status: 'published', plan: effectivePlan })
        .eq('id', id)
        .select(SELECT_ALL)
        .single()

      if (error) throw new InternalServerErrorException(error.message)

      await this.triggerRevalidation(invitation.slug)
      return mapRow(data as unknown as InvitationRow)
    }

    // First publish: generate slug and update via admin client
    const maxAttempts = 3
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const slug = this.generateSlug(invitation.brideName, invitation.groomName)

      const { data, error } = await this.supabaseAdmin.client
        .from('invitations')
        .update({ slug, status: 'published', plan: effectivePlan })
        .eq('id', id)
        .select(SELECT_ALL)
        .single()

      if (!error && data) {
        // First publish: generate QR code (non-blocking on failure)
        await this.generateQrCode(id, slug)
        await this.triggerRevalidation(slug)
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
    const invitation = await this.findOne(userId, id)

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ status: 'draft' })
      .eq('id', id)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    if (invitation.slug) {
      await this.triggerRevalidation(invitation.slug)
    }

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * User requests an upgrade for a specific invitation.
   * Sets paymentStatus to 'pending'.
   */
  async requestUpgrade(userId: string, invitationId: string) {
    const invitation = await this.findOne(userId, invitationId)

    if (invitation.plan === 'premium') {
      throw new BadRequestException('Thiep nay da la Premium')
    }

    if (invitation.paymentStatus === 'pending') {
      throw new BadRequestException('Yeu cau nang cap dang cho xu ly')
    }

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ payment_status: 'pending' })
      .eq('id', invitationId)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Admin approves an upgrade request.
   * Sets plan to 'premium' and clears paymentStatus.
   * Triggers ISR revalidation if slug exists.
   */
  async adminApproveUpgrade(invitationId: string) {
    const { data: row, error: fetchError } = await this.supabaseAdmin.client
      .from('invitations')
      .select(SELECT_ALL)
      .eq('id', invitationId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !row) {
      throw new NotFoundException('Khong tim thay thiep cuoi')
    }

    const invitation = row as unknown as InvitationRow

    if (invitation.payment_status !== 'pending') {
      throw new BadRequestException('Khong co yeu cau nang cap cho xu ly')
    }

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ plan: 'premium', payment_status: 'none' })
      .eq('id', invitationId)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    if (invitation.slug) {
      await this.triggerRevalidation(invitation.slug)
    }

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Admin rejects an upgrade request.
   * Sets paymentStatus to 'rejected'.
   */
  async adminRejectUpgrade(invitationId: string) {
    const { data: row, error: fetchError } = await this.supabaseAdmin.client
      .from('invitations')
      .select(SELECT_ALL)
      .eq('id', invitationId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !row) {
      throw new NotFoundException('Khong tim thay thiep cuoi')
    }

    const invitation = row as unknown as InvitationRow

    if (invitation.payment_status !== 'pending') {
      throw new BadRequestException('Khong co yeu cau nang cap cho xu ly')
    }

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ payment_status: 'rejected' })
      .eq('id', invitationId)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Admin revokes Premium from an invitation (downgrade to free).
   * Use for mistakes or refunds. Triggers ISR revalidation.
   */
  async adminRevokePremium(invitationId: string) {
    const { data: row, error: fetchError } = await this.supabaseAdmin.client
      .from('invitations')
      .select(SELECT_ALL)
      .eq('id', invitationId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !row) {
      throw new NotFoundException('Khong tim thay thiep cuoi')
    }

    const invitation = row as unknown as InvitationRow

    if (invitation.plan !== 'premium') {
      throw new BadRequestException('Thiep cuoi nay khong phai Premium')
    }

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ plan: 'free', payment_status: 'none' })
      .eq('id', invitationId)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    if (invitation.slug) {
      await this.triggerRevalidation(invitation.slug)
    }

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Admin lists upgrade history (approved or rejected).
   * Returns invitations where plan='premium' OR payment_status='rejected',
   * ordered by updated_at descending, limited to 20.
   */
  async adminListUpgradeHistory() {
    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .select(SELECT_ALL)
      .is('deleted_at', null)
      .or('plan.eq.premium,payment_status.eq.rejected,payment_status.eq.refunded')
      .order('updated_at', { ascending: false })
      .limit(20)

    if (error) throw new InternalServerErrorException(error.message)

    return ((data as unknown as InvitationRow[]) ?? []).map(mapRow)
  }

  /**
   * Admin lists all invitations with pending upgrade requests.
   * Ordered by updated_at ascending (oldest first).
   */
  async adminListPendingUpgrades() {
    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .select(SELECT_ALL)
      .eq('payment_status', 'pending')
      .is('deleted_at', null)
      .order('updated_at', { ascending: true })

    if (error) throw new InternalServerErrorException(error.message)

    return ((data as unknown as InvitationRow[]) ?? []).map(mapRow)
  }

  /**
   * Admin marks an invitation as refunded.
   * Sets payment_status to 'refunded' and plan back to 'free'.
   * Only valid if current plan is 'premium'.
   * Triggers ISR revalidation if slug exists.
   */
  async adminMarkRefund(invitationId: string) {
    const { data: row, error: fetchError } = await this.supabaseAdmin.client
      .from('invitations')
      .select(SELECT_ALL)
      .eq('id', invitationId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !row) {
      throw new NotFoundException('Khong tim thay thiep cuoi')
    }

    const invitation = row as unknown as InvitationRow

    if (invitation.plan !== 'premium') {
      throw new BadRequestException(
        'Chi co the hoan tien cho thiep Premium',
      )
    }

    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ payment_status: 'refunded', plan: 'free' })
      .eq('id', invitationId)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    if (invitation.slug) {
      await this.triggerRevalidation(invitation.slug)
    }

    return mapRow(data as unknown as InvitationRow)
  }

  /**
   * Mark all published invitations as expired if their latest ceremony date
   * + 7-day grace period has passed.
   *
   * For each expired invitation:
   * - Updates status from 'published' to 'expired'
   * - Triggers ISR revalidation (non-blocking) so the public URL shows ThankYouPage
   *
   * Returns the count of newly expired invitations.
   */
  async markExpired(): Promise<number> {
    // Fetch all published, non-deleted invitations
    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .select('id, slug, groom_ceremony_date, bride_ceremony_date')
      .eq('status', 'published')
      .is('deleted_at', null)

    if (error) {
      this.logger.error(`markExpired: failed to fetch invitations: ${error.message}`)
      return 0
    }

    if (!data || data.length === 0) return 0

    const now = Date.now()
    const gracePeriodMs = 7 * 24 * 60 * 60 * 1000
    let expiredCount = 0

    for (const row of data as Array<{
      id: string
      slug: string | null
      groom_ceremony_date: string | null
      bride_ceremony_date: string | null
    }>) {
      // Compute expiry using the LATER of groom/bride ceremony dates + 7-day grace
      const dates = [row.groom_ceremony_date, row.bride_ceremony_date].filter(
        (d): d is string => d !== null,
      )

      if (dates.length === 0) continue // No ceremony dates, cannot determine expiry

      const latestDate = dates.sort().pop()!
      const ceremonyStr = `${latestDate}T23:59:59+07:00`
      const ceremonyMs = new Date(ceremonyStr).getTime()
      const isExpired = now > ceremonyMs + gracePeriodMs

      if (!isExpired) continue

      // Mark as expired
      const { error: updateError } = await this.supabaseAdmin.client
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', row.id)

      if (updateError) {
        this.logger.warn(`markExpired: failed to update invitation ${row.id}: ${updateError.message}`)
        continue
      }

      expiredCount++

      // Trigger ISR revalidation (non-blocking)
      if (row.slug) {
        try {
          await this.triggerRevalidation(row.slug)
        } catch (err) {
          this.logger.warn(
            `markExpired: revalidation failed for slug "${row.slug}": ${err instanceof Error ? err.message : err}`,
          )
        }
      }
    }

    return expiredCount
  }

  /**
   * Admin updates notes for an invitation.
   */
  async adminUpdateNotes(invitationId: string, notes: string) {
    const { data, error } = await this.supabaseAdmin.client
      .from('invitations')
      .update({ admin_notes: notes })
      .eq('id', invitationId)
      .is('deleted_at', null)
      .select(SELECT_ALL)
      .single()

    if (error || !data) {
      throw new NotFoundException('Khong tim thay thiep cuoi')
    }

    return mapRow(data as unknown as InvitationRow)
  }
}
