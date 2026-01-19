import { type NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { routing } from '@/i18n/navigation'

// Create the intl middleware
const intlMiddleware = createIntlMiddleware(routing)

// Paths that should be excluded from i18n (no locale prefix)
const i18nExcludedPaths = [
  '/api',
  '/auth',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/site.webmanifest',
]

// Check if path should be excluded from i18n
function shouldExcludeFromI18n(pathname: string): boolean {
  return i18nExcludedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`) || pathname.startsWith(path)
  )
}

// Extract locale from pathname
function getLocaleFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/)
  return match ? match[1] : null
}

// Remove locale from pathname for route checking
function removeLocaleFromPathname(pathname: string): string {
  const locale = getLocaleFromPathname(pathname)
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/'
  }
  return pathname
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip i18n for excluded paths (API, auth callbacks, static files)
  if (shouldExcludeFromI18n(pathname)) {
    return NextResponse.next()
  }

  // Apply i18n middleware first
  const intlResponse = intlMiddleware(request)

  // If intl middleware wants to redirect, do it
  if (intlResponse.status !== 200) {
    return intlResponse
  }

  // Now apply Supabase auth logic
  let supabaseResponse = intlResponse

  // Skip auth if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // We need to create a new response with the updated request
          supabaseResponse = NextResponse.next({
            request,
          })
          // Copy headers from intl response
          intlResponse.headers.forEach((value, key) => {
            supabaseResponse.headers.set(key, value)
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get pathname without locale for route checking
  const pathnameWithoutLocale = removeLocaleFromPathname(pathname)
  const locale = getLocaleFromPathname(pathname) || 'fr'

  // Protected paths (without locale prefix)
  const protectedPaths = ['/dashboard', '/dev', '/oem', '/admin']
  // Public exceptions within protected areas
  const publicPaths = ['/dev/join', '/dev-login']

  const isProtectedPath = protectedPaths.some((path) =>
    pathnameWithoutLocale.startsWith(path)
  )
  const isPublicException = publicPaths.some((path) =>
    pathnameWithoutLocale === path
  )

  // Redirect to login if not authenticated and trying to access protected path
  if (!user && isProtectedPath && !isPublicException) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/login`
    url.searchParams.set('redirect', pathnameWithoutLocale)
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if authenticated and on login page
  if (user && pathnameWithoutLocale === '/login') {
    const redirect = request.nextUrl.searchParams.get('redirect') || '/dashboard'
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}${redirect}`
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - Static files with extensions
     */
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
