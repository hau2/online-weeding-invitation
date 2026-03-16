import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateThemeDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string

  @IsOptional()
  @IsString()
  @MaxLength(30)
  tag?: string

  @IsOptional()
  @IsString()
  thumbnail?: string
}
