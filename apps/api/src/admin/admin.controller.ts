import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AdminService } from './admin.service'
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto'
import { UpdateThemeDto } from './dto/update-theme.dto'
import { JwtGuard } from '../common/guards/jwt.guard'
import { AdminGuard } from '../auth/guards/admin.guard'
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator'

@Controller('admin')
@UseGuards(JwtGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ================================================================
  // Dashboard Stats
  // ================================================================

  @Get('stats')
  getStats() {
    return this.adminService.getStats()
  }

  // ================================================================
  // User Management
  // ================================================================

  @Get('users')
  listUsers(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listUsers(
      search,
      status,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    )
  }

  @Get('users/:id')
  getUserDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getUserDetail(id)
  }

  @Post('users/:id/lock')
  @HttpCode(HttpStatus.OK)
  lockUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.lockUser(id)
  }

  @Post('users/:id/unlock')
  @HttpCode(HttpStatus.OK)
  unlockUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.unlockUser(id)
  }

  @Delete('users/:id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteUser(id)
  }

  @Post('users/:id/role')
  @HttpCode(HttpStatus.OK)
  changeUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { role: 'user' | 'admin' },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.adminService.changeUserRole(id, body.role, user.sub)
  }

  // ================================================================
  // Invitation Management
  // ================================================================

  @Get('invitations')
  listInvitations(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('plan') plan?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.listInvitations(
      search,
      status,
      plan,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    )
  }

  @Get('invitations/:id')
  getInvitationDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getInvitationDetail(id)
  }

  @Post('invitations/:id/disable')
  @HttpCode(HttpStatus.OK)
  disableInvitation(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.disableInvitation(id)
  }

  @Post('invitations/:id/enable')
  @HttpCode(HttpStatus.OK)
  enableInvitation(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.enableInvitation(id)
  }

  // ================================================================
  // Music Track Management
  // ================================================================

  @Get('music-tracks')
  listMusicTracks() {
    return this.adminService.listMusicTracks()
  }

  @Post('music-tracks')
  @UseInterceptors(FileInterceptor('file'))
  uploadMusicTrack(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: { title: string; artist: string },
  ) {
    return this.adminService.uploadMusicTrack(file, body.title, body.artist)
  }

  @Post('music-tracks/:id/toggle')
  @HttpCode(HttpStatus.OK)
  toggleMusicTrack(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.toggleMusicTrack(id)
  }

  @Delete('music-tracks/:id')
  deleteMusicTrack(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteMusicTrack(id)
  }

  // ================================================================
  // Theme Management
  // ================================================================

  @Get('themes')
  listThemes() {
    return this.adminService.listThemes()
  }

  @Post('themes/:id/toggle')
  @HttpCode(HttpStatus.OK)
  toggleTheme(@Param('id') id: string) {
    return this.adminService.toggleTheme(id)
  }

  @Put('themes/:id')
  @UseInterceptors(FileInterceptor('thumbnail'))
  updateTheme(
    @Param('id') id: string,
    @Body() dto: UpdateThemeDto,
    @UploadedFile() thumbnailFile?: Express.Multer.File,
  ) {
    return this.adminService.updateTheme(id, dto, thumbnailFile)
  }

  // ================================================================
  // System Settings
  // ================================================================

  @Get('system-settings')
  getSystemSettings() {
    return this.adminService.getSystemSettings()
  }

  @Put('system-settings')
  updateSystemSettings(@Body() dto: UpdateSystemSettingsDto) {
    return this.adminService.updateSystemSettings(dto)
  }

  @Post('system-settings/bank-qr')
  @UseInterceptors(FileInterceptor('file'))
  uploadBankQrImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.adminService.uploadBankQrImage(file)
  }
}
