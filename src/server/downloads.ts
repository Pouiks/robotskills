'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface DownloadResult {
  success: boolean
  error?: string
  downloadUrl?: string
  paymentRequired?: boolean
}

export interface Purchase {
  id: string
  skillId: string
  skillName: string
  priceCents: number
  purchasedAt: string
  status: 'pending' | 'completed' | 'refunded'
}

// Vérifier si l'utilisateur a déjà acheté ce skill
export async function checkPurchase(skillId: string): Promise<{ purchased: boolean; downloadedVersions: string[] }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { purchased: false, downloadedVersions: [] }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { purchased: false, downloadedVersions: [] }
  }

  // Récupérer tous les téléchargements de l'utilisateur pour ce skill
  const { data: downloads } = await supabase
    .from('downloads')
    .select(`
      id,
      skill_version_id,
      skill_versions!inner (
        id,
        skill_id
      )
    `)
    .eq('user_id', user.id)
    .eq('skill_versions.skill_id', skillId)

  if (!downloads || downloads.length === 0) {
    return { purchased: false, downloadedVersions: [] }
  }

  const downloadedVersions = downloads.map((d: { skill_version_id: string }) => d.skill_version_id)
  return { purchased: true, downloadedVersions }
}

// Simuler un paiement
export async function simulatePurchase(
  skillId: string,
  skillVersionId: string,
  priceCents: number
): Promise<{ success: boolean; error?: string; transactionId?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: false, error: 'Configuration manquante' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Vous devez être connecté pour acheter' }
  }

  // Simulation: attendre 1 seconde pour simuler un paiement
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Générer un ID de transaction simulé
  const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`

  // Enregistrer le téléchargement dans la base de données
  const { error } = await supabase.from('downloads').insert({
    user_id: user.id,
    skill_version_id: skillVersionId,
    // Note: On pourrait ajouter une table purchases pour les vrais paiements
  } as never)

  if (error) {
    console.error('Error recording purchase:', error)
    return { success: false, error: 'Erreur lors de l\'enregistrement de l\'achat' }
  }

  revalidatePath(`/skills`)
  revalidatePath('/dashboard/library')

  return { success: true, transactionId }
}

// Télécharger un skill (après achat ou si gratuit)
export async function downloadSkill(
  skillVersionId: string,
  robotId: string
): Promise<DownloadResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: false, error: 'Configuration manquante' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Vous devez être connecté pour télécharger' }
  }

  // Vérifier que le robot appartient à l'utilisateur
  const { data: robot } = await supabase
    .from('robots')
    .select('id, status')
    .eq('id', robotId)
    .eq('user_id', user.id)
    .single()

  if (!robot) {
    return { success: false, error: 'Robot non trouvé' }
  }

  const robotData = robot as { id: string; status: string }
  if (robotData.status !== 'paired') {
    return { success: false, error: 'Le robot doit être appairé pour installer des skills' }
  }

  // Récupérer les infos du skill
  const { data: skillVersion } = await supabase
    .from('skill_versions')
    .select(`
      id,
      package_path,
      skills (
        id,
        price_cents,
        is_free
      )
    `)
    .eq('id', skillVersionId)
    .single()

  if (!skillVersion) {
    return { success: false, error: 'Version du skill non trouvée' }
  }

  const skill = (skillVersion as { skills: { id: string; price_cents: number; is_free: boolean } }).skills

  // Si payant, vérifier que l'utilisateur a acheté
  if (!skill.is_free) {
    const { purchased } = await checkPurchase(skill.id)
    if (!purchased) {
      return { success: false, paymentRequired: true, error: 'Achat requis' }
    }
  }

  // Enregistrer le téléchargement si pas déjà fait
  const { data: existingDownload } = await supabase
    .from('downloads')
    .select('id')
    .eq('user_id', user.id)
    .eq('skill_version_id', skillVersionId)
    .single()

  if (!existingDownload) {
    await supabase.from('downloads').insert({
      user_id: user.id,
      skill_version_id: skillVersionId,
    } as never)
  }

  // Enregistrer l'installation sur le robot
  const { error: installError } = await supabase.from('installations').upsert({
    robot_id: robotId,
    skill_version_id: skillVersionId,
    status: 'installed',
    installed_at: new Date().toISOString(),
  } as never, {
    onConflict: 'robot_id,skill_version_id',
  })

  if (installError) {
    console.error('Error recording installation:', installError)
    // On continue quand même car le téléchargement peut fonctionner
  }

  // Générer une URL de téléchargement signée (simulée)
  // Dans une vraie implémentation, on utiliserait Supabase Storage
  const skillVersionData = skillVersion as { id: string; package_path: string | null }
  const downloadUrl = skillVersionData.package_path || `/api/download/${skillVersionId}`

  revalidatePath('/dashboard/library')
  revalidatePath('/dashboard/robots')

  return { success: true, downloadUrl }
}

// Récupérer les achats de l'utilisateur
export async function getUserPurchases(): Promise<Purchase[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data } = await supabase
    .from('downloads')
    .select(`
      id,
      created_at,
      skill_versions (
        id,
        skills (
          id,
          name,
          price_cents
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!data) return []

  return data.map((d: {
    id: string
    created_at: string
    skill_versions: {
      id: string
      skills: {
        id: string
        name: string
        price_cents: number
      }
    }
  }) => ({
    id: d.id,
    skillId: d.skill_versions.skills.id,
    skillName: d.skill_versions.skills.name,
    priceCents: d.skill_versions.skills.price_cents,
    purchasedAt: d.created_at,
    status: 'completed' as const,
  }))
}
