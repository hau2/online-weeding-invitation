import {
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
  Matches,
  IsIn,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import { PartialType } from '@nestjs/mapped-types'

/** Nested DTO for a single love story milestone */
class LoveStoryMilestoneDto {
  @IsString({ message: 'Ngay cau chuyen phai la chuoi ky tu' })
  date: string

  @IsString({ message: 'Tieu de cau chuyen phai la chuoi ky tu' })
  @MaxLength(100, { message: 'Tieu de khong qua 100 ky tu' })
  title: string

  @IsString({ message: 'Mo ta cau chuyen phai la chuoi ky tu' })
  @MaxLength(300, { message: 'Mo ta khong qua 300 ky tu' })
  description: string
}

/**
 * Base class with all editable invitation fields.
 * Each field has a validator + Vietnamese error message.
 */
class InvitationFieldsDto {
  @IsString({ message: 'Ten chu re phai la chuoi ky tu' })
  groomName: string

  @IsString({ message: 'Ten co dau phai la chuoi ky tu' })
  brideName: string

  @IsString({ message: 'Ten cha chu re phai la chuoi ky tu' })
  groomFather: string

  @IsString({ message: 'Ten me chu re phai la chuoi ky tu' })
  groomMother: string

  @IsOptional()
  @IsDateString({}, { message: 'Ngay le nha trai khong hop le (YYYY-MM-DD)' })
  groomCeremonyDate: string | null

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Gio le nha trai khong hop le (HH:MM)' })
  groomCeremonyTime: string | null

  @IsString({ message: 'Ten dia diem nha trai phai la chuoi ky tu' })
  groomVenueName: string

  @IsString({ message: 'Dia chi nha trai phai la chuoi ky tu' })
  groomVenueAddress: string

  @IsString({ message: 'Ten cha co dau phai la chuoi ky tu' })
  brideFather: string

  @IsString({ message: 'Ten me co dau phai la chuoi ky tu' })
  brideMother: string

  @IsOptional()
  @IsDateString({}, { message: 'Ngay le nha gai khong hop le (YYYY-MM-DD)' })
  brideCeremonyDate: string | null

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Gio le nha gai khong hop le (HH:MM)' })
  brideCeremonyTime: string | null

  @IsString({ message: 'Ten dia diem nha gai phai la chuoi ky tu' })
  brideVenueName: string

  @IsString({ message: 'Dia chi nha gai phai la chuoi ky tu' })
  brideVenueAddress: string

  @IsOptional()
  @IsArray({ message: 'Cau chuyen tinh yeu phai la mang' })
  @ArrayMaxSize(5, { message: 'Toi da 5 cot moc tinh yeu' })
  @ValidateNested({ each: true })
  @Type(() => LoveStoryMilestoneDto)
  loveStory: LoveStoryMilestoneDto[]

  @IsString({ message: 'Duong dan ban do phai la chuoi ky tu' })
  venueMapUrl: string

  @IsString({ message: 'Loi moi phai la chuoi ky tu' })
  invitationMessage: string

  @IsString({ message: 'Loi cam on phai la chuoi ky tu' })
  thankYouText: string

  @IsString({ message: 'Giao dien phai la chuoi ky tu' })
  @IsIn(['traditional', 'modern', 'minimalist'], {
    message: 'Giao dien khong hop le',
  })
  templateId: 'traditional' | 'modern' | 'minimalist'

  @IsOptional()
  @IsUUID('4', { message: 'ID nhac khong hop le' })
  musicTrackId: string | null

  @IsString({ message: 'Ten ngan hang phai la chuoi ky tu' })
  bankName: string

  @IsString({ message: 'Chu tai khoan phai la chuoi ky tu' })
  bankAccountHolder: string

  @IsString({ message: 'Ten ngan hang co dau phai la chuoi ky tu' })
  brideBankName: string

  @IsString({ message: 'Chu tai khoan co dau phai la chuoi ky tu' })
  brideBankAccountHolder: string
}

/**
 * PartialType makes every field optional, allowing partial PATCH updates.
 * class-validator will only validate fields that are present.
 */
export class UpdateInvitationDto extends PartialType(InvitationFieldsDto) {}
