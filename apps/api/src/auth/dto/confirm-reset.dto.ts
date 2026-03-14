import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator'

export class ConfirmResetDto {
  @IsString()
  @IsNotEmpty()
  token: string

  @IsString()
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  @MaxLength(100)
  newPassword: string
}
