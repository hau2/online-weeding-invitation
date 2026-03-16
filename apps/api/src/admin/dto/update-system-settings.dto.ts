import { IsOptional, IsNumber, IsString, ValidateNested, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

class PaymentConfigDto {
  @IsOptional()
  @IsString()
  bankQrUrl?: string | null

  @IsOptional()
  @IsString()
  bankName?: string

  @IsOptional()
  @IsString()
  bankAccountHolder?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerInvitation?: number
}

class WatermarkConfigDto {
  @IsOptional()
  @IsString()
  text?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  opacity?: number
}

class ExpiryConfigDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  gracePeriodDays?: number
}

class UploadLimitsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxPhotoSizeMb?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxPhotosPerInvitation?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxPhotosPremium?: number
}

export class UpdateSystemSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentConfigDto)
  paymentConfig?: PaymentConfigDto

  @IsOptional()
  @ValidateNested()
  @Type(() => WatermarkConfigDto)
  watermarkConfig?: WatermarkConfigDto

  @IsOptional()
  @ValidateNested()
  @Type(() => ExpiryConfigDto)
  expiryConfig?: ExpiryConfigDto

  @IsOptional()
  @ValidateNested()
  @Type(() => UploadLimitsDto)
  uploadLimits?: UploadLimitsDto
}
