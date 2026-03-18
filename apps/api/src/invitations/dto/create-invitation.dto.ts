import { IsString, IsNotEmpty } from 'class-validator'

export class CreateInvitationDto {
  @IsString()
  @IsNotEmpty({ message: 'Ten co dau khong duoc de trong' })
  brideName: string

  @IsString()
  @IsNotEmpty({ message: 'Ten chu re khong duoc de trong' })
  groomName: string

  @IsString()
  @IsNotEmpty({ message: 'Giao dien khong duoc de trong' })
  templateId: string

  // NOTE: No userId field -- NEVER accept userId from the client body.
  // Ownership is always derived from @CurrentUser() which reads the verified JWT payload.
}
