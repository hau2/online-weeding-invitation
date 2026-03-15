import { Controller, Get, Param } from '@nestjs/common'
import { InvitationsService } from './invitations.service'

/**
 * Public controller for unauthenticated access to published invitations.
 * Separate from InvitationsController to avoid the class-level @UseGuards(JwtGuard).
 */
@Controller('invitations')
export class PublicInvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  /**
   * GET /invitations/public/:slug
   * Returns a published invitation by slug without authentication.
   * Includes expiry flag and resolved music URL.
   */
  @Get('public/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.invitationsService.findBySlug(slug)
  }
}
