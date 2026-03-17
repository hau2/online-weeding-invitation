import { Controller, Get, Param } from '@nestjs/common'
import { ThemesService } from './themes.service'

/**
 * Public controller for unauthenticated access to theme data.
 * Separate from AdminController to avoid JwtGuard + AdminGuard.
 * Same unguarded pattern as PublicInvitationsController.
 */
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  /**
   * GET /themes
   * Returns published custom themes (no auth required).
   * Used by TemplateSelector to show custom themes to non-admin users.
   */
  @Get()
  listPublished() {
    return this.themesService.listPublished()
  }

  /**
   * GET /themes/:slug
   * Returns the full ThemeConfig for any theme (custom or built-in).
   * Used by EditorPreview for live custom theme preview (no auth required).
   */
  @Get(':slug')
  getThemeConfig(@Param('slug') slug: string) {
    return this.themesService.getThemeConfig(slug)
  }
}
