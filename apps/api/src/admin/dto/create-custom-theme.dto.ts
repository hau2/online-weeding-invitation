import { IsString, MaxLength } from 'class-validator'

export class CreateCustomThemeDto {
  @IsString()
  @MaxLength(100)
  name: string

  @IsString()
  baseTheme: string
}
