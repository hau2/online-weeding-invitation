import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { jwtVerify } from 'jose'
import type { Request } from 'express'

/**
 * Cookie-based JWT guard using jose.
 * Reads the httpOnly 'session' cookie set by the Next.js frontend,
 * verifies the token, and attaches the payload to req.user.
 *
 * This is separate from the Passport-based JwtGuard in auth/guards/
 * which uses Bearer token extraction for the auth module.
 */
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()

    // Read the httpOnly session cookie
    const token = req.cookies?.['session']
    if (!token) {
      throw new UnauthorizedException('Phien dang nhap khong hop le')
    }

    const secret = new TextEncoder().encode(
      this.config.getOrThrow<string>('SUPABASE_JWT_SECRET'),
    )

    try {
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ['HS256'],
      })
      // Attach to request for @CurrentUser() to extract
      ;(req as any).user = {
        sub: payload.sub as string,
        email: payload.email as string,
        role: payload.role as string,
        app_role: payload.app_role as string,
      }
      return true
    } catch {
      throw new UnauthorizedException('Phien dang nhap da het han')
    }
  }
}
