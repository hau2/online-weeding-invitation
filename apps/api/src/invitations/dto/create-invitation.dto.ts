import { IsString, IsNotEmpty, IsIn } from 'class-validator'

export class CreateInvitationDto {
  @IsString()
  @IsNotEmpty({ message: 'Ten co dau khong duoc de trong' })
  brideName: string

  @IsString()
  @IsNotEmpty({ message: 'Ten chu re khong duoc de trong' })
  groomName: string

  @IsString()
  @IsIn(['traditional', 'modern', 'minimalist', 'modern-red', 'soft-pink', 'brown-gold', 'olive-green', 'minimalist-bw', 'classic-red-gold'], {
    message: 'Giao dien khong hop le',
  })
  templateId: string

  // NOTE: No userId field -- NEVER accept userId from the client body.
  // Ownership is always derived from @CurrentUser() which reads the verified JWT payload.
}
