import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { randomBytes } from 'crypto'
import {
  SupabaseUserService,
  SupabaseAdminService,
} from '../supabase/supabase.service'
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
  view_count: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** camelCase DTO key -> snake_case DB column mapping */
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
}

/** Map a snake_case DB row to camelCase for the frontend */
function mapRow(row: InvitationRow) {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    status: row.status,
    templateId: row.template_id,
    groomName: row.groom_name,
    brideName: row.bride_name,
    weddingDate: row.wedding_date,
    weddingTime: row.wedding_time,
    venueName: row.venue_name,
    venueAddress: row.venue_address,
    invitationMessage: row.invitation_message,
    thankYouText: row.thank_you_text,
    viewCount: row.view_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

/** Select clause for all invitation columns */
const SELECT_ALL =
  'id, user_id, slug, status, template_id, groom_name, bride_name, ' +
  'wedding_date, wedding_time, venue_name, venue_address, ' +
  'invitation_message, thank_you_text, view_count, created_at, updated_at, deleted_at'

@Injectable()
export class InvitationsService {
  constructor(
    private readonly supabaseUser: SupabaseUserService,
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

  async listByUser(userId: string) {
    const { data, error } = await this.supabaseUser.client
      .from('invitations')
      .select(SELECT_ALL)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw new InternalServerErrorException(error.message)

    return ((data as unknown as InvitationRow[]) ?? []).map(mapRow)
  }

  async create(userId: string, dto: CreateInvitationDto) {
    const { data, error } = await this.supabaseUser.client
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
    const { data, error } = await this.supabaseUser.client
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

    const { data, error } = await this.supabaseUser.client
      .from('invitations')
      .update(updateObj)
      .eq('id', id)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
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
      const { data, error } = await this.supabaseUser.client
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

    const { data, error } = await this.supabaseUser.client
      .from('invitations')
      .update({ status: 'draft' })
      .eq('id', id)
      .select(SELECT_ALL)
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return mapRow(data as unknown as InvitationRow)
  }
}
