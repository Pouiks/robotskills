import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { getMe } from '@/server/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMe()

  if (!user) {
    const locale = await getLocale()
    redirect(`/${locale}/login?redirect=/dashboard`)
  }

  return <>{children}</>
}
