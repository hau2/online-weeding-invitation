import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { filetypemime } from 'magic-bytes.js'
import type {
  AdminStats,
  AdminUser,
  AdminInvitation,
  AdminMusicTrack,
  SystemSettings,
  ThemeInfo,
} from '@repo/types'
import { SupabaseAdminService } from '../supabase/supabase.service'
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto'

/** DB row shape for users table */
interface UserRow {
  id: string
  email: string
  role: string
  tier: string
  is_locked: boolean
  subscription_start: string | null
  subscription_end: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/** DB row shape for invitations (admin view, minimal) */
interface AdminInvitationRow {
  id: string
  user_id: string
  slug: string | null
  status: string
  template_id: string
  groom_name: string
  bride_name: string
  plan: string
  payment_status: string
  is_disabled: boolean
  admin_notes: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  users?: { email: string }
}

/** DB row shape for system_music_tracks (admin view with usage_count) */
interface AdminMusicTrackRow {
  id: string
  title: string
  artist: string
  url: string
  duration: number
  is_active: boolean
  usage_count: number
  sort_order: number
  created_at: string
  updated_at: string
}

/** system_settings row shape */
interface SettingsRow {
  key: string
  value: Record<string, unknown>
  updated_at: string
}

/** Map key name to camelCase property name for SystemSettings */
const SETTINGS_KEY_MAP: Record<string, keyof SystemSettings> = {
  payment_config: 'paymentConfig',
  watermark_config: 'watermarkConfig',
  expiry_config: 'expiryConfig',
  upload_limits: 'uploadLimits',
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(
    private readonly supabaseAdmin: SupabaseAdminService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Trigger ISR revalidation for a public invitation page.
   * Non-blocking: logs warning on failure.
   */
  private async triggerRevalidation(slug: string): Promise<void> {
    const nextUrl =
      this.config.get<string>('NEXT_PUBLIC_URL') ?? 'http://localhost:3000'
    const secret = this.config.get<string>('REVALIDATION_SECRET')

    if (!secret) return

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

  // ================================================================
  // Dashboard Stats
  // ================================================================

  async getStats(): Promise<AdminStats> {
    const client = this.supabaseAdmin.client

    const [usersRes, invitationsRes, publishedRes, premiumRes, chartRes, paymentSettingsRes] =
      await Promise.all([
        client
          .from('users')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null),
        client
          .from('invitations')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null),
        client
          .from('invitations')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')
          .is('deleted_at', null),
        client
          .from('invitations')
          .select('id', { count: 'exact', head: true })
          .eq('plan', 'premium')
          .is('deleted_at', null),
        // Invitations created in last 30 days for chart
        client
          .from('invitations')
          .select('created_at')
          .is('deleted_at', null)
          .gte(
            'created_at',
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          )
          .order('created_at', { ascending: true }),
        // Fetch pricePerInvitation from payment_config settings
        client
          .from('system_settings')
          .select('value')
          .eq('key', 'payment_config')
          .single(),
      ])

    // Group chart data by date
    const chartMap = new Map<string, number>()
    if (chartRes.data) {
      for (const row of chartRes.data as unknown as { created_at: string }[]) {
        const date = row.created_at.slice(0, 10) // YYYY-MM-DD
        chartMap.set(date, (chartMap.get(date) ?? 0) + 1)
      }
    }

    // Fill in missing days with 0
    const chartData: { date: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().slice(0, 10)
      chartData.push({ date: dateStr, count: chartMap.get(dateStr) ?? 0 })
    }

    // Storage estimate: use invitation count * average photo assumption
    // More accurate listing would be expensive, so we estimate:
    // avg ~3 photos per invitation * ~0.5MB each = ~1.5MB per invitation
    const invCount = invitationsRes.count ?? 0
    const storageEstimateMb = Math.round(invCount * 1.5 * 10) / 10

    // Compute revenue: premiumCount * pricePerInvitation
    const premiumCount = premiumRes.count ?? 0
    const paymentConfig = paymentSettingsRes.data
      ? (paymentSettingsRes.data as unknown as SettingsRow).value as { pricePerInvitation?: number }
      : null
    const pricePerInvitation = paymentConfig?.pricePerInvitation ?? 50000
    const revenueTotal = premiumCount * pricePerInvitation

    return {
      totalUsers: usersRes.count ?? 0,
      totalInvitations: invCount,
      publishedInvitations: publishedRes.count ?? 0,
      premiumInvitations: premiumCount,
      storageEstimateMb,
      revenueTotal,
      chartData,
    }
  }

  // ================================================================
  // User Management
  // ================================================================

  async listUsers(
    search?: string,
    status?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: AdminUser[]; total: number }> {
    const client = this.supabaseAdmin.client
    const offset = (page - 1) * limit

    let query = client
      .from('users')
      .select('id, email, role, tier, is_locked, subscription_start, subscription_end, created_at, updated_at', {
        count: 'exact',
      })
      .is('deleted_at', null)

    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    if (status === 'locked') {
      query = query.eq('is_locked', true)
    } else if (status === 'active') {
      query = query.eq('is_locked', false)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw new InternalServerErrorException(error.message)

    const users = data as unknown as UserRow[]

    // Get invitation counts for each user
    const userIds = users.map((u) => u.id)
    const invCounts = new Map<string, number>()

    if (userIds.length > 0) {
      const { data: invData } = await client
        .from('invitations')
        .select('user_id')
        .in('user_id', userIds)
        .is('deleted_at', null)

      if (invData) {
        for (const row of invData as unknown as { user_id: string }[]) {
          invCounts.set(row.user_id, (invCounts.get(row.user_id) ?? 0) + 1)
        }
      }
    }

    return {
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        tier: u.tier,
        isLocked: u.is_locked,
        invitationCount: invCounts.get(u.id) ?? 0,
        subscriptionStart: u.subscription_start,
        subscriptionEnd: u.subscription_end,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      })),
      total: count ?? 0,
    }
  }

  async getUserDetail(userId: string) {
    const client = this.supabaseAdmin.client

    const { data: user, error: userError } = await client
      .from('users')
      .select('id, email, role, tier, is_locked, subscription_start, subscription_end, created_at, updated_at')
      .eq('id', userId)
      .is('deleted_at', null)
      .single()

    if (userError || !user) {
      throw new NotFoundException('Khong tim thay nguoi dung')
    }

    const u = user as unknown as UserRow

    // Get user's invitations
    const { data: invitations } = await client
      .from('invitations')
      .select(
        'id, slug, status, template_id, groom_name, bride_name, plan, payment_status, is_disabled, created_at, updated_at',
      )
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    return {
      id: u.id,
      email: u.email,
      role: u.role,
      tier: u.tier,
      isLocked: u.is_locked,
      subscriptionStart: u.subscription_start,
      subscriptionEnd: u.subscription_end,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
      invitations: ((invitations as unknown as AdminInvitationRow[]) ?? []).map(
        (inv) => ({
          id: inv.id,
          slug: inv.slug,
          status: inv.status,
          templateId: inv.template_id,
          groomName: inv.groom_name,
          brideName: inv.bride_name,
          plan: inv.plan,
          paymentStatus: inv.payment_status,
          isDisabled: inv.is_disabled,
          createdAt: inv.created_at,
          updatedAt: inv.updated_at,
        }),
      ),
    }
  }

  async lockUser(userId: string) {
    const client = this.supabaseAdmin.client

    const { error } = await client
      .from('users')
      .update({ is_locked: true })
      .eq('id', userId)
      .is('deleted_at', null)

    if (error) throw new InternalServerErrorException(error.message)

    return { locked: true }
  }

  async unlockUser(userId: string) {
    const client = this.supabaseAdmin.client

    const { error } = await client
      .from('users')
      .update({ is_locked: false })
      .eq('id', userId)
      .is('deleted_at', null)

    if (error) throw new InternalServerErrorException(error.message)

    return { locked: false }
  }

  async deleteUser(userId: string) {
    const client = this.supabaseAdmin.client

    // 1. Fetch all user's invitations to get IDs
    const { data: invitations, error: invError } = await client
      .from('invitations')
      .select('id')
      .eq('user_id', userId)

    if (invError) throw new InternalServerErrorException(invError.message)

    const invIds = ((invitations as unknown as { id: string }[]) ?? []).map(
      (i) => i.id,
    )

    // 2. Delete media from storage for each invitation
    for (const invId of invIds) {
      // Delete from invitation-photos bucket
      const { data: photos } = await client.storage
        .from('invitation-photos')
        .list(invId)
      if (photos && photos.length > 0) {
        await client.storage
          .from('invitation-photos')
          .remove(photos.map((f) => `${invId}/${f.name}`))
      }

      // Delete from bank-qr bucket
      const { data: bankQrs } = await client.storage
        .from('bank-qr')
        .list(invId)
      if (bankQrs && bankQrs.length > 0) {
        await client.storage
          .from('bank-qr')
          .remove(bankQrs.map((f) => `${invId}/${f.name}`))
      }

      // Delete from qr-codes bucket
      const { data: qrCodes } = await client.storage
        .from('qr-codes')
        .list(invId)
      if (qrCodes && qrCodes.length > 0) {
        await client.storage
          .from('qr-codes')
          .remove(qrCodes.map((f) => `${invId}/${f.name}`))
      }
    }

    // 3. Hard delete all invitations (ON DELETE CASCADE handles FK)
    if (invIds.length > 0) {
      const { error: delInvError } = await client
        .from('invitations')
        .delete()
        .eq('user_id', userId)

      if (delInvError)
        throw new InternalServerErrorException(delInvError.message)
    }

    // 4. Hard delete the user
    const { error: delUserError } = await client
      .from('users')
      .delete()
      .eq('id', userId)

    if (delUserError)
      throw new InternalServerErrorException(delUserError.message)

    return { deleted: true }
  }

  async changeUserRole(
    userId: string,
    role: 'user' | 'admin',
    currentAdminId: string,
  ) {
    if (userId === currentAdminId) {
      throw new BadRequestException(
        'Khong the thay doi vai tro cua chinh minh',
      )
    }

    const client = this.supabaseAdmin.client

    const { data, error } = await client
      .from('users')
      .update({ role })
      .eq('id', userId)
      .is('deleted_at', null)
      .select('id, email, role')
      .single()

    if (error || !data) {
      throw new NotFoundException('Khong tim thay nguoi dung')
    }

    return data
  }

  // ================================================================
  // Invitation Management
  // ================================================================

  async listInvitations(
    search?: string,
    status?: string,
    plan?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: AdminInvitation[]; total: number }> {
    const client = this.supabaseAdmin.client
    const offset = (page - 1) * limit

    let query = client
      .from('invitations')
      .select(
        'id, user_id, slug, status, template_id, groom_name, bride_name, plan, payment_status, is_disabled, created_at, updated_at, users!inner(email)',
        { count: 'exact' },
      )
      .is('deleted_at', null)

    if (search) {
      query = query.or(
        `groom_name.ilike.%${search}%,bride_name.ilike.%${search}%,slug.ilike.%${search}%`,
      )
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (plan) {
      query = query.eq('plan', plan)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw new InternalServerErrorException(error.message)

    return {
      data: ((data as unknown as AdminInvitationRow[]) ?? []).map((inv) => ({
        id: inv.id,
        userId: inv.user_id,
        userEmail:
          (inv.users as unknown as { email: string })?.email ?? '',
        slug: inv.slug,
        status: inv.status,
        templateId: inv.template_id,
        groomName: inv.groom_name,
        brideName: inv.bride_name,
        plan: inv.plan,
        paymentStatus: inv.payment_status,
        isDisabled: inv.is_disabled,
        createdAt: inv.created_at,
        updatedAt: inv.updated_at,
      })),
      total: count ?? 0,
    }
  }

  async getInvitationDetail(invitationId: string) {
    const client = this.supabaseAdmin.client

    const { data, error } = await client
      .from('invitations')
      .select('*, users!inner(email)')
      .eq('id', invitationId)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      throw new NotFoundException('Khong tim thay thiep cuoi')
    }

    return data
  }

  async disableInvitation(invitationId: string) {
    const client = this.supabaseAdmin.client

    const { data, error } = await client
      .from('invitations')
      .update({ is_disabled: true })
      .eq('id', invitationId)
      .is('deleted_at', null)
      .select('id, slug, is_disabled')
      .single()

    if (error || !data) {
      throw new NotFoundException('Khong tim thay thiep cuoi')
    }

    const row = data as unknown as { id: string; slug: string | null; is_disabled: boolean }

    if (row.slug) {
      await this.triggerRevalidation(row.slug)
    }

    return { id: row.id, isDisabled: true }
  }

  async enableInvitation(invitationId: string) {
    const client = this.supabaseAdmin.client

    const { data, error } = await client
      .from('invitations')
      .update({ is_disabled: false })
      .eq('id', invitationId)
      .is('deleted_at', null)
      .select('id, slug, is_disabled')
      .single()

    if (error || !data) {
      throw new NotFoundException('Khong tim thay thiep cuoi')
    }

    const row = data as unknown as { id: string; slug: string | null; is_disabled: boolean }

    if (row.slug) {
      await this.triggerRevalidation(row.slug)
    }

    return { id: row.id, isDisabled: false }
  }

  // ================================================================
  // Music Track Management
  // ================================================================

  async listMusicTracks(): Promise<AdminMusicTrack[]> {
    const client = this.supabaseAdmin.client

    const { data, error } = await client
      .from('system_music_tracks')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw new InternalServerErrorException(error.message)

    // Fetch live usage counts from invitations table (not stale DB column)
    const { data: usageData } = await client
      .from('invitations')
      .select('music_track_id')
      .is('deleted_at', null)
      .not('music_track_id', 'is', null)

    // Build Map<trackId, count> from usage data
    const usageMap = new Map<string, number>()
    if (usageData) {
      for (const row of usageData as unknown as { music_track_id: string }[]) {
        usageMap.set(row.music_track_id, (usageMap.get(row.music_track_id) ?? 0) + 1)
      }
    }

    return ((data as unknown as AdminMusicTrackRow[]) ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      url: t.url,
      duration: t.duration,
      isActive: t.is_active,
      usageCount: usageMap.get(t.id) ?? 0,
      sortOrder: t.sort_order,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }))
  }

  async uploadMusicTrack(
    file: Express.Multer.File,
    title: string,
    artist: string,
  ): Promise<AdminMusicTrack> {
    // Validate MP3 magic bytes
    const detectedMimes = filetypemime(file.buffer)
    const isMP3 = detectedMimes.some(
      (mime: string) => mime === 'audio/mpeg',
    )
    if (!isMP3) {
      throw new BadRequestException(
        'Dinh dang tep khong hop le. Chi chap nhan MP3.',
      )
    }

    const client = this.supabaseAdmin.client
    const timestamp = Date.now()
    const storagePath = `${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const { error: uploadError } = await client.storage
      .from('system-music')
      .upload(storagePath, file.buffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      })

    if (uploadError) {
      throw new InternalServerErrorException(
        `Khong the tai nhac len: ${uploadError.message}`,
      )
    }

    const { data: urlData } = client.storage
      .from('system-music')
      .getPublicUrl(storagePath)

    // Get max sort_order
    const { data: maxSort } = await client
      .from('system_music_tracks')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const nextSort =
      ((maxSort as unknown as { sort_order: number })?.sort_order ?? 0) + 1

    const { data, error } = await client
      .from('system_music_tracks')
      .insert({
        title,
        artist,
        url: urlData.publicUrl,
        duration: 0, // Duration parsed client-side or set later
        is_active: true,
        sort_order: nextSort,
        usage_count: 0,
      })
      .select('*')
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    const t = data as unknown as AdminMusicTrackRow
    return {
      id: t.id,
      title: t.title,
      artist: t.artist,
      url: t.url,
      duration: t.duration,
      isActive: t.is_active,
      usageCount: t.usage_count,
      sortOrder: t.sort_order,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }
  }

  async toggleMusicTrack(trackId: string) {
    const client = this.supabaseAdmin.client

    // Get current state
    const { data: current, error: fetchError } = await client
      .from('system_music_tracks')
      .select('is_active')
      .eq('id', trackId)
      .single()

    if (fetchError || !current) {
      throw new NotFoundException('Khong tim thay bai nhac')
    }

    const isActive = !(current as unknown as { is_active: boolean }).is_active

    const { data, error } = await client
      .from('system_music_tracks')
      .update({ is_active: isActive })
      .eq('id', trackId)
      .select('id, is_active')
      .single()

    if (error) throw new InternalServerErrorException(error.message)

    return data
  }

  async deleteMusicTrack(trackId: string) {
    const client = this.supabaseAdmin.client

    // Check usage count
    const { count, error: countError } = await client
      .from('invitations')
      .select('id', { count: 'exact', head: true })
      .eq('music_track_id', trackId)
      .is('deleted_at', null)

    if (countError) throw new InternalServerErrorException(countError.message)

    if ((count ?? 0) > 0) {
      throw new BadRequestException(
        `Khong the xoa bai nhac dang duoc su dung boi ${count} thiep cuoi`,
      )
    }

    // Get track URL for storage deletion
    const { data: track, error: fetchError } = await client
      .from('system_music_tracks')
      .select('url')
      .eq('id', trackId)
      .single()

    if (fetchError || !track) {
      throw new NotFoundException('Khong tim thay bai nhac')
    }

    // Delete from storage
    const url = (track as unknown as { url: string }).url
    const marker = '/storage/v1/object/public/system-music/'
    const idx = url.indexOf(marker)
    if (idx !== -1) {
      const storagePath = url.slice(idx + marker.length)
      await client.storage.from('system-music').remove([storagePath])
    }

    // Delete from DB
    const { error: delError } = await client
      .from('system_music_tracks')
      .delete()
      .eq('id', trackId)

    if (delError) throw new InternalServerErrorException(delError.message)

    return { deleted: true }
  }

  // ================================================================
  // Theme Management
  // ================================================================

  async listThemes(): Promise<ThemeInfo[]> {
    const client = this.supabaseAdmin.client

    const { data, error } = await client
      .from('system_settings')
      .select('value')
      .eq('key', 'theme_config')
      .single()

    if (error || !data) {
      throw new InternalServerErrorException(
        'Khong the doc cau hinh giao dien',
      )
    }

    const themeConfig = (data as unknown as SettingsRow).value as Record<
      string,
      { name: string; tag: string; thumbnail: string | null; isActive: boolean }
    >

    return Object.entries(themeConfig).map(([id, theme]) => ({
      id,
      name: theme.name,
      tag: theme.tag,
      thumbnail: theme.thumbnail,
      isActive: theme.isActive,
    }))
  }

  async toggleTheme(themeId: string) {
    const client = this.supabaseAdmin.client

    const { data, error } = await client
      .from('system_settings')
      .select('value')
      .eq('key', 'theme_config')
      .single()

    if (error || !data) {
      throw new InternalServerErrorException(
        'Khong the doc cau hinh giao dien',
      )
    }

    const themeConfig = (data as unknown as SettingsRow).value as Record<
      string,
      { name: string; tag: string; thumbnail: string | null; isActive: boolean }
    >

    if (!themeConfig[themeId]) {
      throw new NotFoundException('Khong tim thay giao dien')
    }

    themeConfig[themeId].isActive = !themeConfig[themeId].isActive

    const { error: updateError } = await client
      .from('system_settings')
      .update({ value: themeConfig })
      .eq('key', 'theme_config')

    if (updateError)
      throw new InternalServerErrorException(updateError.message)

    return {
      id: themeId,
      isActive: themeConfig[themeId].isActive,
    }
  }

  async updateTheme(
    themeId: string,
    updates: { name?: string; tag?: string; thumbnail?: string },
    thumbnailFile?: Express.Multer.File,
  ) {
    const client = this.supabaseAdmin.client

    const { data, error } = await client
      .from('system_settings')
      .select('value')
      .eq('key', 'theme_config')
      .single()

    if (error || !data) {
      throw new InternalServerErrorException(
        'Khong the doc cau hinh giao dien',
      )
    }

    const themeConfig = (data as unknown as SettingsRow).value as Record<
      string,
      { name: string; tag: string; thumbnail: string | null; isActive: boolean }
    >

    if (!themeConfig[themeId]) {
      throw new NotFoundException('Khong tim thay giao dien')
    }

    // Update metadata fields
    if (updates.name !== undefined) {
      themeConfig[themeId].name = updates.name
    }
    if (updates.tag !== undefined) {
      themeConfig[themeId].tag = updates.tag
    }

    // Handle thumbnail upload if file provided
    if (thumbnailFile) {
      const ext = thumbnailFile.originalname.split('.').pop() ?? 'jpg'
      const storagePath = `theme-thumbnails/${themeId}.${ext}`

      const { error: uploadError } = await client.storage
        .from('system-settings')
        .upload(storagePath, thumbnailFile.buffer, {
          contentType: thumbnailFile.mimetype,
          upsert: true,
        })

      if (uploadError) {
        throw new InternalServerErrorException(
          `Khong the tai hinh len: ${uploadError.message}`,
        )
      }

      const { data: urlData } = client.storage
        .from('system-settings')
        .getPublicUrl(storagePath)

      themeConfig[themeId].thumbnail = urlData.publicUrl
    } else if (updates.thumbnail !== undefined) {
      // Accept URL string from body
      themeConfig[themeId].thumbnail = updates.thumbnail || null
    }

    const { error: updateError } = await client
      .from('system_settings')
      .update({ value: themeConfig })
      .eq('key', 'theme_config')

    if (updateError)
      throw new InternalServerErrorException(updateError.message)

    return {
      id: themeId,
      name: themeConfig[themeId].name,
      tag: themeConfig[themeId].tag,
      thumbnail: themeConfig[themeId].thumbnail,
      isActive: themeConfig[themeId].isActive,
    }
  }

  // ================================================================
  // System Settings
  // ================================================================

  async getSystemSettings(): Promise<SystemSettings> {
    const client = this.supabaseAdmin.client

    const { data, error } = await client.from('system_settings').select('*')

    if (error) throw new InternalServerErrorException(error.message)

    const rows = (data as unknown as SettingsRow[]) ?? []

    const settings: Record<string, unknown> = {}
    for (const row of rows) {
      const camelKey = SETTINGS_KEY_MAP[row.key]
      if (camelKey) {
        settings[camelKey] = row.value
      }
    }

    return settings as unknown as SystemSettings
  }

  async updateSystemSettings(dto: UpdateSystemSettingsDto) {
    const client = this.supabaseAdmin.client

    const updates: Promise<unknown>[] = []

    if (dto.paymentConfig) {
      updates.push(this.mergeSettingsKey(client, 'payment_config', dto.paymentConfig as unknown as Record<string, unknown>))
    }
    if (dto.watermarkConfig) {
      updates.push(this.mergeSettingsKey(client, 'watermark_config', dto.watermarkConfig as unknown as Record<string, unknown>))
    }
    if (dto.expiryConfig) {
      updates.push(this.mergeSettingsKey(client, 'expiry_config', dto.expiryConfig as unknown as Record<string, unknown>))
    }
    if (dto.uploadLimits) {
      updates.push(this.mergeSettingsKey(client, 'upload_limits', dto.uploadLimits as unknown as Record<string, unknown>))
    }

    await Promise.all(updates)

    return this.getSystemSettings()
  }

  /**
   * Merge partial updates into a system_settings key.
   * Reads existing value, deep-merges new fields, writes back.
   */
  private async mergeSettingsKey(
    client: InstanceType<typeof SupabaseAdminService>['client'],
    key: string,
    partial: Record<string, unknown>,
  ) {
    const { data, error: readError } = await client
      .from('system_settings')
      .select('value')
      .eq('key', key)
      .single()

    if (readError) throw new InternalServerErrorException(readError.message)

    const existing = (data as unknown as SettingsRow)?.value ?? {}
    const merged = { ...existing }

    // Only set fields that are not undefined
    for (const [k, v] of Object.entries(partial)) {
      if (v !== undefined) {
        merged[k] = v
      }
    }

    const { error: writeError } = await client
      .from('system_settings')
      .update({ value: merged })
      .eq('key', key)

    if (writeError) throw new InternalServerErrorException(writeError.message)
  }

  async uploadBankQrImage(file: Express.Multer.File) {
    const client = this.supabaseAdmin.client

    const storagePath = `bank-qr/admin-bank-qr.${file.originalname.split('.').pop() ?? 'jpg'}`

    const { error: uploadError } = await client.storage
      .from('system-settings')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      })

    if (uploadError) {
      throw new InternalServerErrorException(
        `Khong the tai anh QR len: ${uploadError.message}`,
      )
    }

    const { data: urlData } = client.storage
      .from('system-settings')
      .getPublicUrl(storagePath)

    // Update payment_config.bankQrUrl
    await this.mergeSettingsKey(client, 'payment_config', {
      bankQrUrl: urlData.publicUrl,
    })

    return { bankQrUrl: urlData.publicUrl }
  }
}
