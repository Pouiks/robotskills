import { redirect } from 'next/navigation'
import { getMe } from '@/server/auth'
import { ProfilePageClient } from './profile-client'

export const metadata = {
  title: 'Mon Profil',
}

export default async function ProfilePage() {
  const user = await getMe()

  if (!user) {
    redirect('/login')
  }

  return <ProfilePageClient user={user} />
}
