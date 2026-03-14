import {
  IsString,
  IsOptional,
  IsDateString,
  Matches,
  IsIn,
} from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'

/**
 * Base class with all editable invitation fields.
 * Each field has a validator + Vietnamese error message.
 */
class InvitationFieldsDto {
  @IsString({ message: 'Ten chu re phai la chuoi ky tu' })
  groomName: string

  @IsString({ message: 'Ten co dau phai la chuoi ky tu' })
  brideName: string

  @IsOptional()
  @IsDateString({}, { message: 'Ngay cuoi khong hop le (YYYY-MM-DD)' })
  weddingDate: string | null

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Gio cuoi khong hop le (HH:MM)' })
  weddingTime: string | null

  @IsString({ message: 'Ten dia diem phai la chuoi ky tu' })
  venueName: string

  @IsString({ message: 'Dia chi phai la chuoi ky tu' })
  venueAddress: string

  @IsString({ message: 'Loi moi phai la chuoi ky tu' })
  invitationMessage: string

  @IsString({ message: 'Loi cam on phai la chuoi ky tu' })
  thankYouText: string

  @IsString({ message: 'Giao dien phai la chuoi ky tu' })
  @IsIn(['traditional', 'modern', 'minimalist'], {
    message: 'Giao dien khong hop le',
  })
  templateId: 'traditional' | 'modern' | 'minimalist'
}

/**
 * PartialType makes every field optional, allowing partial PATCH updates.
 * class-validator will only validate fields that are present.
 */
export class UpdateInvitationDto extends PartialType(InvitationFieldsDto) {}
