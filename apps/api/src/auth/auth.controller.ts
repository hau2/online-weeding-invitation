import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { ConfirmResetDto } from './dto/confirm-reset.dto'
import { JwtGuard } from './guards/jwt.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password)
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  logout(@CurrentUser() _user: unknown) {
    return this.authService.logout()
  }

  @Post('request-reset')
  requestPasswordReset(@Body() dto: ResetPasswordDto) {
    return this.authService.requestPasswordReset(dto.email)
  }

  @Post('confirm-reset')
  confirmPasswordReset(@Body() dto: ConfirmResetDto) {
    return this.authService.confirmPasswordReset(dto.token, dto.newPassword)
  }
}
