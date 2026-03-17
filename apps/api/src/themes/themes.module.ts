import { Module } from '@nestjs/common'
import { ThemesController } from './themes.controller'
import { ThemesService } from './themes.service'
import { SupabaseModule } from '../supabase/supabase.module'

@Module({
  imports: [SupabaseModule],
  controllers: [ThemesController],
  providers: [ThemesService],
  exports: [ThemesService],
})
export class ThemesModule {}
