import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

// SUPABASE_JWT_SECRET is server/Edge-only — NEVER NEXT_PUBLIC_
const JWT_SECRET = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!)

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    })
    return payload
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('auth-token')?.value
  const path = req.nextUrl.pathname

  const isAppRoute = path.startsWith('/dashboard') || path.startsWith('/thep-cuoi')
  const isAdminRoute = path.startsWith('/admin')

  // Public pages, auth pages, site pages — no auth check
  if (!isAppRoute && !isAdminRoute) return NextResponse.next()

  // No token — redirect to login
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/dang-nhap'
    url.searchParams.set('from', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  const payload = await verifyToken(token)

  // Token expired or invalid — clear cookie and redirect to login
  if (!payload) {
    const url = req.nextUrl.clone()
    url.pathname = '/dang-nhap'
    const response = NextResponse.redirect(url)
    response.cookies.delete('auth-token')
    return response
  }

  // Admin route guard — only app_role=admin may access /admin
  if (isAdminRoute && payload['app_role'] !== 'admin') {
    // User is authenticated but not admin — redirect to dashboard, not to login
    return NextResponse.redirect(new URL('/dashboard?error=forbidden', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$|w/).*)'],
}
