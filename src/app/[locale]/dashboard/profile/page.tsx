import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { getMe } from '@/server/auth'
import { ProfilePageClient } from './profile-client'

export async function generateMetadata() {
  const t = await getTranslations('profilePage')
  return {
    title: t('title'),
  }
}

export default async function ProfilePage() {
  const user = await getMe()

  if (!user) {
    redirect('/login')
  }

  return <ProfilePageClient user={user} />
}
