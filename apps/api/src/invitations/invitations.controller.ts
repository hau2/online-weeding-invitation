import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { InvitationsService } from './invitations.service'
import { CreateInvitationDto } from './dto/create-invitation.dto'
import { JwtGuard } from '../common/guards/jwt.guard'
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator'

@Controller('invitations')
@UseGuards(JwtGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.invitationsService.listByUser(user.sub)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateInvitationDto) {
    return this.invitationsService.create(user.sub, dto)
  }
}
