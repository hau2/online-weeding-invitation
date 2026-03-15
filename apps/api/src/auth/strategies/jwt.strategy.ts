import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

export interface JwtPayload {
  sub: string
  role: string       // 'authenticated' — Supabase role
  email: string
  app_role: string   // 'user' | 'admin' — our custom claim
  aud: string
  iat: number
  exp: number
}

function extractJwt(req: Request): string | null {
  // Try cookie first (frontend sends auth-token cookie via credentials: 'include')
  const fromCookie = req?.cookies?.['auth-token']
  if (fromCookie) return fromCookie

  // Fall back to Authorization: Bearer <token> header
  const auth = req?.headers?.authorization
  if (auth && auth.startsWith('Bearer ') && auth.length > 7) {
    return auth.slice(7)
  }

  return null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: extractJwt,
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('SUPABASE_JWT_SECRET'),
      algorithms: ['HS256'],
    })
  }

  async validate(payload: JwtPayload) {
    // Returned value is attached to request.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.app_role,
    }
  }
}
