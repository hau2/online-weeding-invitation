import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { SupabaseAdminService } from '../supabase/supabase.service'
import type { AuthResponse, MessageResponse } from '@repo/types'

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseAdmin: SupabaseAdminService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
  ) {}

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
        await this.mailerService.sendMail({
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

    // Find matching token by bcrypt comparison
    let matchedToken: (typeof tokens)[0] | null = null
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
