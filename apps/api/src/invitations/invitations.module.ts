import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { InvitationsController } from './invitations.controller'
import { PublicInvitationsController } from './public-invitations.controller'
import { InvitationsService } from './invitations.service'
import { ExpiryCronService } from './expiry/expiry-cron.service'
import { SupabaseModule } from '../supabase/supabase.module'

@Module({
  imports: [SupabaseModule, ScheduleModule.forRoot()],
  controllers: [InvitationsController, PublicInvitationsController],
  providers: [InvitationsService, ExpiryCronService],
})
export class InvitationsModule {}
