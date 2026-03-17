import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator'

export class UpdateCustomThemeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  /** JSON string of the ThemeConfig, parsed server-side.
   * Comes as string when sent with FormData (background image upload). */
  @IsOptional()
  @IsString()
  config?: string

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'published', 'disabled'])
  status?: string
}
