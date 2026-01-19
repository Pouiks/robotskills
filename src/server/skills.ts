'use server'

import { createClient } from '@/lib/supabase/server'
import type { SkillWithDetails } from '@/types'

// Types pour les résultats de requête
interface SkillQueryResult {
  id: string
  name: string
  slug: string
  short_description: string | null
  description_md: string | null
  category: string | null
  icon_path: string | null
  status: string
  created_at: string
  price_cents: number
  is_free: boolean
  // Champs i18n
  name_en: string | null
  short_description_en: string | null
  description_md_en: string | null
  profiles: { display_name: string | null } | null
  skill_assets: {
    id: string
    type: string
    path: string
    sort_order: number
  }[]
  skill_versions: {
    id: string
    version: string
    release_notes: string | null
    risk_level: string
    visibility: string
    manifest: Record<string, unknown> | null
  }[]
  skill_oem_compatibility?: {
    oems: { id: string; brand_name: string }
  }[]
}

export async function getPublishedSkills(options?: {
  category?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<{ skills: SkillWithDetails[]; total: number }> {
  // Si Supabase n'est pas configuré, retourner une liste vide
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { skills: [], total: 0 }
  }

  const supabase = await createClient()
  const { category, search, limit = 20, offset = 0 } = options ?? {}

  // Query de base pour les skills publiés avec compatibilité OEM
  let query = supabase
    .from('skills')
    .select(
      `
      id,
      name,
      slug,
      short_description,
      description_md,
      category,
      icon_path,
      status,
      created_at,
      price_cents,
      is_free,
      name_en,
      short_description_en,
      description_md_en,
      profiles!skills_owner_user_id_fkey (
        display_name
      ),
      skill_assets (
        id,
        type,
        path,
        sort_order
      ),
      skill_versions (
        id,
        version,
        release_notes,
        risk_level,
        visibility,
        manifest
      ),
      skill_oem_compatibility (
        oems (
          id,
          brand_name
        )
      )
    `,
      { count: 'exact' }
    )
    .eq('status', 'published')

  if (category) {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,short_description.ilike.%${search}%`)
  }

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching skills:', error)
    return { skills: [], total: 0 }
  }

  const results = (data ?? []) as unknown as SkillQueryResult[]

  // Transformer les données
  const skills: SkillWithDetails[] = results.map((skill) => {
    const ownerProfile = skill.profiles
    const versions = skill.skill_versions ?? []

    // Trouver la dernière version publique
    const publicVersions = versions.filter((v) => v.visibility === 'public')
    const latestVersion = publicVersions.length > 0 ? publicVersions[0] : null

    // Extraire les OEMs compatibles (déclarés par le développeur)
    const compatibilityData = skill.skill_oem_compatibility ?? []
    const compatibleOems = compatibilityData
      .filter((c) => c.oems !== null)
      .map((c) => ({
        id: c.oems.id,
        brandName: c.oems.brand_name,
      }))

    return {
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      shortDescription: skill.short_description,
      descriptionMd: skill.description_md,
      category: skill.category,
      iconPath: skill.icon_path,
      status: skill.status as 'draft' | 'published' | 'suspended',
      createdAt: skill.created_at,
      priceCents: skill.price_cents ?? 0,
      isFree: skill.is_free ?? true,
      ownerName: ownerProfile?.display_name ?? null,
      assets: (skill.skill_assets ?? []).map((a) => ({
        id: a.id,
        type: a.type as 'screenshot' | 'video' | 'banner',
        path: a.path,
        sortOrder: a.sort_order,
      })),
      latestVersion: latestVersion
        ? {
            id: latestVersion.id,
            version: latestVersion.version,
            releaseNotes: latestVersion.release_notes,
            riskLevel: latestVersion.risk_level as 'low' | 'medium' | 'high',
            manifest: latestVersion.manifest ?? null,
          }
        : null,
      downloadCount: 0, // TODO: calculer via agrégation
      compatibleOems,
      // Champs i18n
      nameEn: skill.name_en,
      shortDescriptionEn: skill.short_description_en,
      descriptionMdEn: skill.description_md_en,
    }
  })

  return { skills, total: count ?? 0 }
}

export async function getSkillBySlug(slug: string): Promise<SkillWithDetails | null> {
  // Si Supabase n'est pas configuré, retourner null
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('skills')
    .select(
      `
      id,
      name,
      slug,
      short_description,
      description_md,
      category,
      icon_path,
      status,
      created_at,
      price_cents,
      is_free,
      name_en,
      short_description_en,
      description_md_en,
      profiles!skills_owner_user_id_fkey (
        display_name
      ),
      skill_assets (
        id,
        type,
        path,
        sort_order
      ),
      skill_versions (
        id,
        version,
        release_notes,
        risk_level,
        visibility,
        manifest
      ),
      skill_oem_compatibility (
        oems (
          id,
          brand_name
        )
      )
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return null
  }

  const skill = data as unknown as SkillQueryResult
  const ownerProfile = skill.profiles
  const versions = skill.skill_versions ?? []

  const publicVersions = versions.filter((v) => v.visibility === 'public')
  const latestVersion = publicVersions.length > 0 ? publicVersions[0] : null

  // Extraire les OEMs compatibles (déclarés par le développeur)
  const compatibilityData = skill.skill_oem_compatibility ?? []
  const compatibleOems = compatibilityData
    .filter((c) => c.oems !== null)
    .map((c) => ({
      id: c.oems.id,
      brandName: c.oems.brand_name,
    }))

  // Compter les téléchargements
  const { count: downloadCount } = await supabase
    .from('downloads')
    .select('*', { count: 'exact', head: true })
    .in(
      'skill_version_id',
      versions.map((v) => v.id)
    )

  return {
    id: skill.id,
    name: skill.name,
    slug: skill.slug,
    shortDescription: skill.short_description,
    descriptionMd: skill.description_md,
    category: skill.category,
    iconPath: skill.icon_path,
    status: skill.status as 'draft' | 'published' | 'suspended',
    createdAt: skill.created_at,
    priceCents: skill.price_cents ?? 0,
    isFree: skill.is_free ?? true,
    ownerName: ownerProfile?.display_name ?? null,
    assets: (skill.skill_assets ?? [])
      .map((a) => ({
        id: a.id,
        type: a.type as 'screenshot' | 'video' | 'banner',
        path: a.path,
        sortOrder: a.sort_order,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    latestVersion: latestVersion
      ? {
          id: latestVersion.id,
          version: latestVersion.version,
          releaseNotes: latestVersion.release_notes,
          riskLevel: latestVersion.risk_level as 'low' | 'medium' | 'high',
          manifest: (latestVersion as { manifest?: Record<string, unknown> }).manifest ?? null,
        }
      : null,
    downloadCount: downloadCount ?? 0,
    compatibleOems,
    // Champs i18n
    nameEn: skill.name_en,
    shortDescriptionEn: skill.short_description_en,
    descriptionMdEn: skill.description_md_en,
  }
}

// ============================================
// GESTION DE LA COMPATIBILITÉ OEM
// ============================================

export async function getAvailableOems(): Promise<{ id: string; brandName: string }[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('oems')
    .select('id, brand_name')
    .order('brand_name')

  if (error) {
    console.error('Error fetching OEMs:', error)
    return []
  }

  interface OemRow {
    id: string
    brand_name: string
  }

  return ((data ?? []) as OemRow[]).map((oem) => ({
    id: oem.id,
    brandName: oem.brand_name,
  }))
}

export async function updateSkillCompatibility(
  skillId: string,
  oemIds: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: false, error: 'Configuration manquante' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Vérifier que le skill appartient à l'utilisateur
  const { data: skill, error: skillError } = await supabase
    .from('skills')
    .select('id, owner_user_id')
    .eq('id', skillId)
    .single()

  if (skillError || !skill) {
    return { success: false, error: 'Skill non trouvé' }
  }

  const skillData = skill as { id: string; owner_user_id: string }

  if (skillData.owner_user_id !== user.id) {
    return { success: false, error: 'Non autorisé' }
  }

  // Supprimer les anciennes entrées
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('skill_oem_compatibility')
    .delete()
    .eq('skill_id', skillId)

  // Insérer les nouvelles entrées
  if (oemIds.length > 0) {
    const insertData = oemIds.map((oemId) => ({
      skill_id: skillId,
      oem_id: oemId,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from('skill_oem_compatibility')
      .insert(insertData)

    if (insertError) {
      console.error('Error inserting compatibility:', insertError)
      return { success: false, error: 'Erreur lors de la mise à jour' }
    }
  }

  return { success: true }
}

export async function getSkillCompatibility(skillId: string): Promise<string[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('skill_oem_compatibility')
    .select('oem_id')
    .eq('skill_id', skillId)

  if (error) {
    console.error('Error fetching compatibility:', error)
    return []
  }

  return (data ?? []).map((row) => (row as { oem_id: string }).oem_id)
}
