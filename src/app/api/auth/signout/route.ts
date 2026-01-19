import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { defaultLocale } from '@/i18n/config'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return NextResponse.redirect(new URL(`/${defaultLocale}/login`, baseUrl))
}
