import { Module } from '@nestjs/common'
import { SupabaseAdminService, SupabaseUserService } from './supabase.service'

@Module({
  providers: [SupabaseAdminService, SupabaseUserService],
  exports: [SupabaseAdminService, SupabaseUserService],
})
export class SupabaseModule {}
