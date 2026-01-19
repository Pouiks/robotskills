import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { defaultLocale } from '@/i18n/config'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/dashboard'

  // Default locale for redirects
  const locale = defaultLocale

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to the locale-prefixed dashboard
      return NextResponse.redirect(`${origin}/${locale}${redirect}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_failed`)
}
