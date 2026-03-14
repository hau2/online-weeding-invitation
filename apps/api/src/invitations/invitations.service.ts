import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { SupabaseUserService } from '../supabase/supabase.service'
import { CreateInvitationDto } from './dto/create-invitation.dto'

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

@Injectable()
export class InvitationsService {
  constructor(private readonly supabaseUser: SupabaseUserService) {}

  async listByUser(userId: string) {
    const { data, error } = await this.supabaseUser.client
      .from('invitations')
      .select(
        'id, user_id, slug, status, template_id, groom_name, bride_name, ' +
          'wedding_date, wedding_time, venue_name, venue_address, ' +
          'invitation_message, thank_you_text, view_count, created_at, updated_at, deleted_at',
      )
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
}
