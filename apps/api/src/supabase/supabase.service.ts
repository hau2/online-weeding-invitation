import { Injectable, Scope, Inject } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Request } from 'express'

/**
 * Singleton admin client — uses service role key, bypasses RLS.
 * Use only for: auth operations (login fetches user by email), admin operations.
 * NEVER share this client with user-facing endpoints that should be RLS-scoped.
 */
@Injectable()
export class SupabaseAdminService {
  readonly client: SupabaseClient

  constructor(private readonly config: ConfigService) {
    this.client = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    )
  }
}

/**
 * Per-request user client — uses anon key + Bearer JWT from request headers.
 * Respects RLS: user can only see their own rows.
 * Scope.REQUEST ensures this is never shared across concurrent requests.
 */
@Injectable({ scope: Scope.REQUEST })
export class SupabaseUserService {
  readonly client: SupabaseClient

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly config: ConfigService,
  ) {
    // Extract Bearer JWT from Authorization header
    const token = request.headers.authorization?.replace('Bearer ', '') ?? ''
    this.client = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    )
  }
}
