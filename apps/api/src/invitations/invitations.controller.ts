import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { InvitationsService } from './invitations.service'
import { CreateInvitationDto } from './dto/create-invitation.dto'
import { UpdateInvitationDto } from './dto/update-invitation.dto'
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

  /**
   * List all active system music tracks.
   * MUST be defined BEFORE the :id param route to avoid route conflict.
   */
  @Get('music-tracks')
  listMusicTracks() {
    return this.invitationsService.listMusicTracks()
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.invitationsService.findOne(user.sub, id)
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvitationDto,
  ) {
    return this.invitationsService.update(user.sub, id, dto)
  }

  /**
   * Upload photos to an invitation (max 10 files, 5MB each).
   */
  @Post(':id/photos')
  @UseInterceptors(FilesInterceptor('photos', 10))
  uploadPhotos(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.invitationsService.uploadPhotos(user.sub, id, files)
  }

  /**
   * Delete a photo at a given index from an invitation.
   */
  @Delete(':id/photos/:index')
  deletePhoto(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('index', ParseIntPipe) index: number,
  ) {
    return this.invitationsService.deletePhoto(user.sub, id, index)
  }

  /**
   * Upload a bank QR image for an invitation (single file, 5MB max).
   */
  @Post(':id/bank-qr')
  @UseInterceptors(FileInterceptor('file'))
  uploadBankQr(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.invitationsService.uploadBankQr(user.sub, id, file)
  }

  /**
   * Upload a bride-side bank QR image (single file, 5MB max).
   */
  @Post(':id/bride-bank-qr')
  @UseInterceptors(FileInterceptor('file'))
  uploadBrideBankQr(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.invitationsService.uploadBrideBankQr(user.sub, id, file)
  }

  /**
   * Update photo order for an invitation.
   * Dedicated endpoint because photoUrls is excluded from FIELD_MAP
   * to prevent arbitrary URL injection via generic PATCH auto-save.
   */
  @Patch(':id/photo-order')
  updatePhotoOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { photoUrls: string[] },
  ) {
    return this.invitationsService.updatePhotoOrder(
      user.sub,
      id,
      body.photoUrls,
    )
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  publish(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.invitationsService.publish(user.sub, id)
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  unpublish(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.invitationsService.unpublish(user.sub, id)
  }
}
