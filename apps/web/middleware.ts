import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

// SUPABASE_JWT_SECRET is server/Edge-only — NEVER NEXT_PUBLIC_
const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!)

export const config = {
  matcher: ['/dashboard/:path*', '/thep-cuoi/:path*', '/admin/:path*'],
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/dang-nhap'
    url.searchParams.set('from', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  try {
    console.log('[middleware] JWT_SECRET defined:', !!process.env.SUPABASE_JWT_SECRET)
    console.log('[middleware] JWT_SECRET length:', process.env.SUPABASE_JWT_SECRET?.length)
    console.log('[middleware] token length:', token.length)
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    })

    // Admin route guard — only app_role=admin may access /admin
    if (req.nextUrl.pathname.startsWith('/admin') && payload['app_role'] !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  } catch (err) {
    console.error('[middleware] JWT verify failed:', err)
    // Token expired or invalid — redirect to login
    const url = req.nextUrl.clone()
    url.pathname = '/dang-nhap'
    const response = NextResponse.redirect(url)
    response.cookies.delete('auth-token')
    return response
  }
}
