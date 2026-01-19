import { redirect } from 'next/navigation'
import { getMe } from '@/server/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMe()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  return <>{children}</>
}
