import { Injectable, NotFoundException } from '@nestjs/common'
import { SupabaseAdminService } from '../supabase/supabase.service'
import { BUILTIN_THEMES, LEGACY_MAP, type ThemeConfig } from '../admin/builtin-themes'

@Injectable()
export class ThemesService {
  constructor(private readonly supabaseAdmin: SupabaseAdminService) {}

  /**
   * List published custom themes for the public template selector.
   * Returns slug, name, and config (for color-based thumbnails).
   */
  async listPublished(): Promise<
    { slug: string; name: string; config: Record<string, unknown> }[]
  > {
    const client = this.supabaseAdmin.client

    const { data, error } = await client
      .from('custom_themes')
      .select('slug, name, config')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) return []

    return (
      (data as unknown as { slug: string; name: string; config: Record<string, unknown> }[]) ?? []
    )
  }

  /**
   * Get the full ThemeConfig for any theme (custom or built-in).
   * Used by EditorPreview for live custom theme preview.
   */
  async getThemeConfig(slug: string): Promise<ThemeConfig> {
    // Check built-in themes first (including legacy mapping)
    const resolved = LEGACY_MAP[slug] ?? slug
    const builtin = BUILTIN_THEMES[resolved]
    if (builtin) return builtin

    // Query custom theme from DB
    const client = this.supabaseAdmin.client
    const { data, error } = await client
      .from('custom_themes')
      .select('config')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      throw new NotFoundException('Khong tim thay giao dien')
    }

    return (data as unknown as { config: ThemeConfig }).config
  }
}
