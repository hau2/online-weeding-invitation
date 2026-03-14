import { IsEmail } from 'class-validator'

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string
}
