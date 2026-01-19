'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { CurrentUser, UserOrganization, Profile, UserRoles } from '@/types'

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

interface MembershipWithOrg {
  org_id: string
  role: 'owner' | 'admin' | 'reviewer' | 'member'
  organizations: {
    id: string
    name: string
    slug: string
    type: 'oem' | 'studio'
  } | null
}

export async function getMe(): Promise<CurrentUser | null> {
  // Si Supabase n'est pas configuré, retourner null
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Récupérer le profil
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Profile | null

  // Récupérer les rôles
  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const roles = rolesData as UserRoles | null

  // Récupérer les memberships d'organisations
  const { data: membershipsData } = await supabase
    .from('organization_members')
    .select(
      `
      org_id,
      role,
      organizations (
        id,
        name,
        slug,
        type
      )
    `
    )
    .eq('user_id', user.id)

  const memberships = membershipsData as MembershipWithOrg[] | null

  const organizations: UserOrganization[] =
    memberships?.map((m) => {
      const org = m.organizations
      return {
        orgId: org?.id ?? '',
        orgName: org?.name ?? '',
        orgSlug: org?.slug ?? '',
        orgType: org?.type ?? 'oem',
        role: m.role,
      }
    }).filter(o => o.orgId) ?? []

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    displayName: profile?.display_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    isDeveloper: roles?.is_developer ?? false,
    isAdmin: roles?.is_admin ?? false,
    organizations,
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signInWithOtp(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updateProfile(data: {
  displayName?: string
  avatarUrl?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const updateData: Record<string, string> = {}
  if (data.displayName !== undefined) {
    updateData.display_name = data.displayName
  }
  if (data.avatarUrl !== undefined) {
    updateData.avatar_url = data.avatarUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData as never)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: 'Aucun fichier fourni' }
  }

  // Valider le type de fichier
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Type de fichier non autorisé. Utilisez PNG, JPEG ou WebP.' }
  }

  // Valider la taille (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { error: 'Le fichier est trop volumineux. Maximum 2MB.' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/avatar.${fileExt}`

  // Upload vers Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    return { error: uploadError.message }
  }

  // Obtenir l'URL publique
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Mettre à jour le profil avec la nouvelle URL
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: urlData.publicUrl } as never)
    .eq('id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  return { success: true, url: urlData.publicUrl }
}
