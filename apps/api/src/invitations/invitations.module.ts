import { Module } from '@nestjs/common'
import { InvitationsController } from './invitations.controller'
import { PublicInvitationsController } from './public-invitations.controller'
import { InvitationsService } from './invitations.service'
import { SupabaseModule } from '../supabase/supabase.module'

@Module({
  imports: [SupabaseModule],
  controllers: [InvitationsController, PublicInvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
