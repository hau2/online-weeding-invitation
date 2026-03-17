import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InvitationsService } from '../invitations.service'

/**
 * Daily cron job that hard-deletes draft invitations older than 30 days
 * (from createdAt) that have never been published (slug IS NULL).
 * Also removes associated media from Supabase Storage.
 *
 * Schedule: 1 AM Vietnam time (UTC+7) every day -- offset from expiry cron at midnight.
 */
@Injectable()
export class DraftCleanupCronService {
  private readonly logger = new Logger(DraftCleanupCronService.name)

  constructor(private readonly invitationsService: InvitationsService) {}

  @Cron('0 1 * * *', {
    name: 'auto-delete-drafts',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDraftCleanup(): Promise<void> {
    this.logger.log('Starting draft auto-delete check...')
    const count = await this.invitationsService.deleteExpiredDrafts()
    this.logger.log(`Draft auto-delete complete: ${count} draft(s) deleted`)
  }
}
