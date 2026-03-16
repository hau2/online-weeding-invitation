import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InvitationsService } from '../invitations.service'

/**
 * Daily cron job that marks published invitations as expired
 * after the latest ceremony date + 7-day grace period.
 *
 * Schedule: midnight Vietnam time (UTC+7) every day.
 */
@Injectable()
export class ExpiryCronService {
  private readonly logger = new Logger(ExpiryCronService.name)

  constructor(private readonly invitationsService: InvitationsService) {}

  @Cron('0 0 * * *', {
    name: 'auto-expire-invitations',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleExpiry(): Promise<void> {
    this.logger.log('Starting auto-expiry check...')
    const count = await this.invitationsService.markExpired()
    this.logger.log(`Auto-expiry complete: ${count} invitation(s) expired`)
  }
}
