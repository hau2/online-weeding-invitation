import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { SupabaseAdminService } from '../supabase/supabase.service'
import type { AuthResponse, MessageResponse, UserProfile } from '@repo/types'

@Injectable()
export class AuthService {
  private readonly resend: Resend

  constructor(
    private readonly supabaseAdmin: SupabaseAdminService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.resend = new Resend(this.config.get<string>('RESEND_API_KEY'))
  }

  async register(email: string, password: string): Promise<AuthResponse> {
    // Check if email already exists (admin client — bypasses RLS)
    const { data: existing } = await this.supabaseAdmin.client
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .is('deleted_at', null)
      .maybeSingle()

    if (existing) {
      throw new ConflictException('Email đã được sử dụng')
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const { data: user, error } = await this.supabaseAdmin.client
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: 'user',
      })
      .select('id, email, role')
      .single()

    if (error || !user) {
      console.error('[AuthService] Register insert failed:', error)
      throw new ConflictException('Không thể tạo tài khoản. Vui lòng thử lại.')
    }

    const token = this.signToken(user.id, user.email, user.role)
    return { access_token: token, user: { id: user.id, email: user.email, role: user.role } }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Admin client: fetch user including password_hash (not returned to client)
    const { data: user } = await this.supabaseAdmin.client
      .from('users')
      .select('id, email, password_hash, role, deleted_at')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (!user || user.deleted_at) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ')
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash)
    if (!passwordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ')
    }

    const token = this.signToken(user.id, user.email, user.role)
    return { access_token: token, user: { id: user.id, email: user.email, role: user.role } }
  }

  logout(): MessageResponse {
    // JWT is stateless — client clears httpOnly cookie (managed by Next.js layer)
    return { message: 'Đăng xuất thành công' }
  }

  async requestPasswordReset(email: string): Promise<MessageResponse> {
    // Always return same message — do not reveal if email exists
    const { data: user } = await this.supabaseAdmin.client
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .is('deleted_at', null)
      .maybeSingle()

    if (user) {
      const rawToken = randomUUID()
      const tokenHash = await bcrypt.hash(rawToken, 10)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await this.supabaseAdmin.client.from('password_reset_tokens').insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      })

      const webUrl = this.config.get<string>('WEB_URL', 'http://localhost:3000')
      const resetLink = `${webUrl}/xac-nhan-mat-khau?token=${rawToken}`

      try {
        const emailFrom = this.config.get<string>('EMAIL_FROM', 'no-reply@thiepcoionline.vn')
        await this.resend.emails.send({
          from: emailFrom,
          to: user.email,
          subject: 'Đặt lại mật khẩu — Thiệp Cưới Online',
          html: `
            <p>Xin chào,</p>
            <p>Nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn. Liên kết có hiệu lực trong 1 giờ.</p>
            <p><a href="${resetLink}">Đặt lại mật khẩu</a></p>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
          `,
        })
      } catch {
        // Log email failure but do not expose it to caller
        console.error('[AuthService] Failed to send reset email')
      }
    }

    return { message: 'Nếu email tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu.' }
  }

  async confirmPasswordReset(rawToken: string, newPassword: string): Promise<MessageResponse> {
    // Fetch recent unexpired, unused tokens
    const { data: tokens } = await this.supabaseAdmin.client
      .from('password_reset_tokens')
      .select('id, token_hash, expires_at, used_at, user_id')
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    type TokenRecord = { id: string; token_hash: string; expires_at: string; used_at: string | null; user_id: string }
    // Find matching token by bcrypt comparison
    let matchedToken: TokenRecord | null = null
    for (const t of tokens ?? []) {
      const matches = await bcrypt.compare(rawToken, t.token_hash)
      if (matches) {
        matchedToken = t
        break
      }
    }

    if (!matchedToken) {
      throw new BadRequestException('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    await this.supabaseAdmin.client
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', matchedToken.user_id)

    await this.supabaseAdmin.client
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', matchedToken.id)

    return { message: 'Mật khẩu đã được đặt lại thành công' }
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const { data: user, error } = await this.supabaseAdmin.client
      .from('users')
      .select('id, email, role, tier, subscription_start, subscription_end')
      .eq('id', userId)
      .is('deleted_at', null)
      .single()

    if (error || !user) {
      throw new NotFoundException('Khong tim thay tai khoan')
    }

    const row = user as unknown as {
      id: string
      email: string
      role: string
      tier: string
      subscription_start: string | null
      subscription_end: string | null
    }

    // Non-agent users: return minimal profile
    if (row.tier !== 'agent') {
      return {
        id: row.id,
        email: row.email,
        role: row.role as 'user' | 'admin',
        tier: 'user',
        subscriptionStart: null,
        subscriptionEnd: null,
        quotaUsed: 0,
        quotaLimit: 0,
        daysRemaining: null,
      }
    }

    // Agent tier: compute cycle and quota
    const now = new Date()
    const subscriptionEnd = row.subscription_end ? new Date(row.subscription_end) : null
    const subscriptionStart = row.subscription_start ? new Date(row.subscription_start) : null

    // Days remaining until subscription ends
    let daysRemaining: number | null = null
    if (subscriptionEnd) {
      daysRemaining = Math.max(
        0,
        Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      )
    }

    // Compute current cycle start: advance subscription_start by 30-day periods
    let quotaUsed = 0
    if (subscriptionStart && subscriptionEnd && subscriptionEnd > now) {
      const cycleStart = new Date(subscriptionStart.getTime())
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
      while (cycleStart.getTime() + thirtyDaysMs <= now.getTime()) {
        cycleStart.setTime(cycleStart.getTime() + thirtyDaysMs)
      }

      const { count, error: countError } = await this.supabaseAdmin.client
        .from('invitations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['published', 'save_the_date'])
        .is('deleted_at', null)
        .gte('created_at', cycleStart.toISOString())

      if (countError) throw new InternalServerErrorException(countError.message)
      quotaUsed = count ?? 0
    }

    return {
      id: row.id,
      email: row.email,
      role: row.role as 'user' | 'admin',
      tier: 'agent',
      subscriptionStart: row.subscription_start,
      subscriptionEnd: row.subscription_end,
      quotaUsed,
      quotaLimit: 20,
      daysRemaining,
    }
  }

  private signToken(userId: string, email: string, appRole: string): string {
    return this.jwtService.sign({
      sub: userId,
      role: 'authenticated',   // Required: Supabase RLS checks this Postgres role
      email,
      app_role: appRole,       // Custom claim: 'user' | 'admin'
      aud: 'authenticated',
    })
  }
}
