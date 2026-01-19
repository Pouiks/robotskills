'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { 
  SkillIdentityInput, 
  SkillAssetsInput,
  SkillCompatibilityInput,
  SkillPermissionsInput,
  SkillPackageInput,
  SubmissionStatus,
  PlatformReviewResult,
  OemDecisionInput,
} from '@/lib/validators/submission'
import { 
  skillIdentitySchema,
  skillAssetsSchema,
  skillCompatibilitySchema,
  skillPermissionsSchema,
  skillPackageSchema,
  canTransition,
  oemDecisionSchemaSimple,
  manifestSchema,
} from '@/lib/validators/submission'

// ============================================
// TYPES
// ============================================

export interface DevSkill {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  category: string | null
  iconPath: string | null
  status: 'draft' | 'published' | 'suspended'
  createdAt: string
  versionsCount: number
  latestVersion: string | null
  submissionsCount: number
}

export interface DevSubmission {
  id: string
  skillVersionId: string
  skillName: string
  skillSlug: string
  version: string
  status: SubmissionStatus
  targetOemName: string | null
  platformReviewNotes: string | null
  oemReviewNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface SubmissionDetail extends DevSubmission {
  skillId: string
  iconPath: string | null
  shortDescription: string | null
  descriptionMd: string | null
  manifest: Record<string, unknown>
  releaseNotes: string | null
  riskLevel: string
  permissionsRequested: string[]
  permissionsJustification: Record<string, string>
  dataUsage: Record<string, unknown>
  packagePath: string | null
  packageSize: number | null
  platformReviewResult: PlatformReviewResult | null
  platformReviewAt: string | null
  oemReviewedBy: string | null
  oemReviewedAt: string | null
  submitterName: string | null
}

// ============================================
// SKILL DETAIL TYPE
// ============================================

export interface SkillDetail {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  descriptionMd: string | null
  category: string | null
  iconPath: string | null
  status: 'draft' | 'published' | 'suspended'
  supportUrl: string | null
  privacyUrl: string | null
  termsUrl: string | null
  publisherName: string | null
  createdAt: string
  updatedAt: string
  versions: {
    id: string
    version: string
    releaseNotes: string | null
    riskLevel: string
    visibility: string
    createdAt: string
  }[]
  assets: {
    id: string
    type: string
    path: string
    sortOrder: number
  }[]
  submissions: {
    id: string
    version: string
    status: string
    targetOemName: string | null
    createdAt: string
  }[]
}

// ============================================
// GET SKILL DETAIL (for dev portal)
// ============================================

export async function getSkillDetail(skillId: string): Promise<SkillDetail | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: skill, error } = await supabase
    .from('skills')
    .select(`
      id,
      name,
      slug,
      short_description,
      description_md,
      category,
      icon_path,
      status,
      support_url,
      privacy_url,
      terms_url,
      publisher_name,
      created_at,
      updated_at,
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
        created_at,
        submissions (
          id,
          status,
          created_at,
          oems (
            brand_name
          )
        )
      )
    `)
    .eq('id', skillId)
    .eq('owner_user_id', user.id)
    .single()

  if (error || !skill) {
    console.error('Error fetching skill detail:', error)
    return null
  }

  const s = skill as unknown as {
    id: string
    name: string
    slug: string
    short_description: string | null
    description_md: string | null
    category: string | null
    icon_path: string | null
    status: string
    support_url: string | null
    privacy_url: string | null
    terms_url: string | null
    publisher_name: string | null
    created_at: string
    updated_at: string
    skill_assets: { id: string; type: string; path: string; sort_order: number }[]
    skill_versions: {
      id: string
      version: string
      release_notes: string | null
      risk_level: string
      visibility: string
      created_at: string
      submissions: {
        id: string
        status: string
        created_at: string
        oems: { brand_name: string } | null
      }[]
    }[]
  }

  // Flatten submissions from versions
  const allSubmissions = s.skill_versions.flatMap((v) =>
    (v.submissions || []).map((sub) => ({
      id: sub.id,
      version: v.version,
      status: sub.status,
      targetOemName: sub.oems?.brand_name ?? null,
      createdAt: sub.created_at,
    }))
  )

  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    shortDescription: s.short_description,
    descriptionMd: s.description_md,
    category: s.category,
    iconPath: s.icon_path,
    status: s.status as 'draft' | 'published' | 'suspended',
    supportUrl: s.support_url,
    privacyUrl: s.privacy_url,
    termsUrl: s.terms_url,
    publisherName: s.publisher_name,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    versions: s.skill_versions.map((v) => ({
      id: v.id,
      version: v.version,
      releaseNotes: v.release_notes,
      riskLevel: v.risk_level,
      visibility: v.visibility,
      createdAt: v.created_at,
    })),
    assets: (s.skill_assets || []).map((a) => ({
      id: a.id,
      type: a.type,
      path: a.path,
      sortOrder: a.sort_order,
    })),
    submissions: allSubmissions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  }
}

// ============================================
// GET DEV'S SKILLS
// ============================================

export async function getDevSkills(): Promise<DevSkill[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('skills')
    .select(`
      id,
      name,
      slug,
      short_description,
      category,
      icon_path,
      status,
      created_at,
      skill_versions (
        id,
        version
      ),
      submissions:skill_versions(
        submissions(id)
      )
    `)
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching dev skills:', error)
    return []
  }

  return (data as unknown as Array<{
    id: string
    name: string
    slug: string
    short_description: string | null
    category: string | null
    icon_path: string | null
    status: string
    created_at: string
    skill_versions: { id: string; version: string }[]
  }>).map((skill) => ({
    id: skill.id,
    name: skill.name,
    slug: skill.slug,
    shortDescription: skill.short_description,
    category: skill.category,
    iconPath: skill.icon_path,
    status: skill.status as 'draft' | 'published' | 'suspended',
    createdAt: skill.created_at,
    versionsCount: skill.skill_versions?.length ?? 0,
    latestVersion: skill.skill_versions?.[0]?.version ?? null,
    submissionsCount: 0, // TODO: compute from nested
  }))
}

// ============================================
// GET DEV'S SUBMISSIONS
// ============================================

export async function getDevSubmissions(): Promise<DevSubmission[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id,
      skill_version_id,
      status,
      platform_review_notes,
      oem_review_notes,
      created_at,
      updated_at,
      skill_versions!inner (
        version,
        skills!inner (
          name,
          slug
        )
      ),
      oems (
        brand_name
      )
    `)
    .eq('submitted_by', user.id)
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching dev submissions:', error)
    return []
  }

  return (data as unknown as Array<{
    id: string
    skill_version_id: string
    status: string
    platform_review_notes: string | null
    oem_review_notes: string | null
    created_at: string
    updated_at: string
    skill_versions: {
      version: string
      skills: {
        name: string
        slug: string
      }
    }
    oems: { brand_name: string } | null
  }>).map((sub) => ({
    id: sub.id,
    skillVersionId: sub.skill_version_id,
    skillName: sub.skill_versions.skills.name,
    skillSlug: sub.skill_versions.skills.slug,
    version: sub.skill_versions.version,
    status: sub.status as SubmissionStatus,
    targetOemName: sub.oems?.brand_name ?? null,
    platformReviewNotes: sub.platform_review_notes,
    oemReviewNotes: sub.oem_review_notes,
    createdAt: sub.created_at,
    updatedAt: sub.updated_at,
  }))
}

// ============================================
// GET SUBMISSION DETAIL
// ============================================

export async function getSubmissionDetail(submissionId: string): Promise<SubmissionDetail | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id,
      skill_version_id,
      status,
      platform_review_notes,
      platform_review_result,
      platform_review_at,
      oem_review_notes,
      oem_reviewed_by,
      oem_reviewed_at,
      created_at,
      updated_at,
      skill_versions!inner (
        id,
        version,
        manifest,
        release_notes,
        risk_level,
        permissions_requested,
        permissions_justification,
        data_usage,
        skills!inner (
          id,
          name,
          slug,
          short_description,
          description_md,
          icon_path
        ),
        skill_packages (
          storage_path,
          size_bytes
        )
      ),
      oems (
        brand_name
      ),
      profiles!submissions_submitted_by_fkey (
        display_name
      )
    `)
    .eq('id', submissionId)
    .single()

  if (error || !data) {
    console.error('Error fetching submission detail:', error)
    return null
  }

  const sub = data as unknown as {
    id: string
    skill_version_id: string
    status: string
    platform_review_notes: string | null
    platform_review_result: PlatformReviewResult | null
    platform_review_at: string | null
    oem_review_notes: string | null
    oem_reviewed_by: string | null
    oem_reviewed_at: string | null
    created_at: string
    updated_at: string
    skill_versions: {
      id: string
      version: string
      manifest: Record<string, unknown>
      release_notes: string | null
      risk_level: string
      permissions_requested: string[]
      permissions_justification: Record<string, string>
      data_usage: Record<string, unknown>
      skills: {
        id: string
        name: string
        slug: string
        short_description: string | null
        description_md: string | null
        icon_path: string | null
      }
      skill_packages: { storage_path: string; size_bytes: number }[]
    }
    oems: { brand_name: string } | null
    profiles: { display_name: string | null }
  }

  return {
    id: sub.id,
    skillVersionId: sub.skill_version_id,
    skillId: sub.skill_versions.skills.id,
    skillName: sub.skill_versions.skills.name,
    skillSlug: sub.skill_versions.skills.slug,
    version: sub.skill_versions.version,
    status: sub.status as SubmissionStatus,
    targetOemName: sub.oems?.brand_name ?? null,
    platformReviewNotes: sub.platform_review_notes,
    oemReviewNotes: sub.oem_review_notes,
    createdAt: sub.created_at,
    updatedAt: sub.updated_at,
    iconPath: sub.skill_versions.skills.icon_path,
    shortDescription: sub.skill_versions.skills.short_description,
    descriptionMd: sub.skill_versions.skills.description_md,
    manifest: sub.skill_versions.manifest,
    releaseNotes: sub.skill_versions.release_notes,
    riskLevel: sub.skill_versions.risk_level,
    permissionsRequested: sub.skill_versions.permissions_requested ?? [],
    permissionsJustification: sub.skill_versions.permissions_justification ?? {},
    dataUsage: sub.skill_versions.data_usage ?? {},
    packagePath: sub.skill_versions.skill_packages?.[0]?.storage_path ?? null,
    packageSize: sub.skill_versions.skill_packages?.[0]?.size_bytes ?? null,
    platformReviewResult: sub.platform_review_result,
    platformReviewAt: sub.platform_review_at,
    oemReviewedBy: sub.oem_reviewed_by,
    oemReviewedAt: sub.oem_reviewed_at,
    submitterName: sub.profiles?.display_name ?? null,
  }
}

// ============================================
// CREATE SKILL (Step 1)
// ============================================

export async function createSkill(data: SkillIdentityInput): Promise<{ success: boolean; error?: string; skillId?: string }> {
  const validation = skillIdentitySchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Check if user is developer
  const { data: roles } = await supabase
    .from('user_roles')
    .select('is_developer')
    .eq('user_id', user.id)
    .single()

  const rolesData = roles as { is_developer: boolean } | null
  if (!rolesData?.is_developer) {
    return { success: false, error: 'Vous devez être développeur pour créer un skill' }
  }

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from('skills')
    .select('id')
    .eq('slug', data.slug)
    .single()

  if (existing) {
    return { success: false, error: 'Ce slug est déjà utilisé' }
  }

  const { data: skill, error } = await supabase
    .from('skills')
    .insert({
      owner_user_id: user.id,
      name: data.name,
      slug: data.slug,
      category: data.category,
      publisher_name: data.publisherName,
      short_description: data.shortDescription,
      description_md: data.descriptionMd,
      support_url: data.supportUrl || null,
      privacy_url: data.privacyUrl || null,
      terms_url: data.termsUrl || null,
      status: 'draft',
    } as never)
    .select('id')
    .single()

  if (error || !skill) {
    console.error('Error creating skill:', error)
    return { success: false, error: 'Erreur lors de la création du skill' }
  }

  revalidatePath('/dev/skills')
  return { success: true, skillId: (skill as { id: string }).id }
}

// ============================================
// UPDATE SKILL ASSETS (Step 2)
// ============================================

export async function updateSkillAssets(
  skillId: string, 
  data: SkillAssetsInput
): Promise<{ success: boolean; error?: string }> {
  const validation = skillAssetsSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Update icon
  const { error: iconError } = await supabase
    .from('skills')
    .update({ icon_path: data.iconPath } as never)
    .eq('id', skillId)
    .eq('owner_user_id', user.id)

  if (iconError) {
    return { success: false, error: 'Erreur lors de la mise à jour de l\'icône' }
  }

  // Delete existing screenshots
  await supabase
    .from('skill_assets')
    .delete()
    .eq('skill_id', skillId)
    .eq('type', 'screenshot')

  // Insert new screenshots
  if (data.screenshots.length > 0) {
    const assets = data.screenshots.map((path, index) => ({
      skill_id: skillId,
      type: 'screenshot' as const,
      path,
      sort_order: index,
    }))

    const { error: assetsError } = await supabase
      .from('skill_assets')
      .insert(assets as never)

    if (assetsError) {
      console.error('Error inserting assets:', assetsError)
      return { success: false, error: 'Erreur lors de l\'ajout des screenshots' }
    }
  }

  // Add banner if provided
  if (data.bannerPath) {
    await supabase
      .from('skill_assets')
      .delete()
      .eq('skill_id', skillId)
      .eq('type', 'banner')

    await supabase
      .from('skill_assets')
      .insert({
        skill_id: skillId,
        type: 'banner',
        path: data.bannerPath,
        sort_order: 0,
      } as never)
  }

  revalidatePath('/dev/skills')
  return { success: true }
}

// ============================================
// CREATE VERSION + SUBMISSION
// ============================================

export async function createVersionAndSubmit(
  skillId: string,
  packageData: SkillPackageInput,
  permissionsData: SkillPermissionsInput,
  compatibilityData: SkillCompatibilityInput
): Promise<{ success: boolean; error?: string; submissionId?: string }> {
  // Validate all inputs
  const pkgValidation = skillPackageSchema.safeParse(packageData)
  if (!pkgValidation.success) {
    return { success: false, error: pkgValidation.error.issues[0].message }
  }

  const permValidation = skillPermissionsSchema.safeParse(permissionsData)
  if (!permValidation.success) {
    return { success: false, error: permValidation.error.issues[0].message }
  }

  const compatValidation = skillCompatibilitySchema.safeParse(compatibilityData)
  if (!compatValidation.success) {
    return { success: false, error: compatValidation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Verify skill ownership
  const { data: skill } = await supabase
    .from('skills')
    .select('id, owner_user_id')
    .eq('id', skillId)
    .eq('owner_user_id', user.id)
    .single()

  if (!skill) {
    return { success: false, error: 'Skill non trouvé ou non autorisé' }
  }

  // Check version doesn't already exist
  const { data: existingVersion } = await supabase
    .from('skill_versions')
    .select('id')
    .eq('skill_id', skillId)
    .eq('version', packageData.version)
    .single()

  if (existingVersion) {
    return { success: false, error: 'Cette version existe déjà' }
  }

  // Build permissions justification map
  const permissionsJustification: Record<string, string> = {}
  permissionsData.permissions.forEach((p) => {
    permissionsJustification[p.name] = p.justification
  })

  // Create version
  const { data: version, error: versionError } = await supabase
    .from('skill_versions')
    .insert({
      skill_id: skillId,
      version: packageData.version,
      manifest: packageData.manifest,
      release_notes: packageData.releaseNotes,
      risk_level: packageData.riskLevel,
      visibility: 'private',
      min_firmware_version: compatibilityData.minFirmwareVersion || null,
      permissions_requested: permissionsData.permissions.map((p) => p.name),
      permissions_justification: permissionsJustification,
      data_usage: {
        collects_data: permissionsData.dataUsage.collectsData,
        data_types: permissionsData.dataUsage.dataTypes || [],
        retention_days: permissionsData.dataUsage.retentionDays,
        shares_with_third_parties: permissionsData.dataUsage.sharesWithThirdParties,
        endpoints: permissionsData.dataUsage.endpoints || [],
      },
    } as never)
    .select('id')
    .single()

  if (versionError || !version) {
    console.error('Error creating version:', versionError)
    return { success: false, error: 'Erreur lors de la création de la version' }
  }

  const versionId = (version as { id: string }).id

  // Create package record
  const { error: pkgError } = await supabase
    .from('skill_packages')
    .insert({
      skill_version_id: versionId,
      storage_path: packageData.packagePath,
      checksum_sha256: packageData.packageChecksum,
      size_bytes: packageData.packageSize,
    } as never)

  if (pkgError) {
    console.error('Error creating package:', pkgError)
    // Don't fail completely, package can be re-uploaded
  }

  // Create submission
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .insert({
      skill_version_id: versionId,
      submitted_by: user.id,
      target_oem_id: compatibilityData.targetOemId,
      status: 'draft',
    } as never)
    .select('id')
    .single()

  if (subError || !submission) {
    console.error('Error creating submission:', subError)
    return { success: false, error: 'Erreur lors de la création de la soumission' }
  }

  revalidatePath('/dev/skills')
  revalidatePath('/dev/submissions')

  return { success: true, submissionId: (submission as { id: string }).id }
}

// ============================================
// SUBMIT FOR REVIEW
// ============================================

export async function submitForReview(
  submissionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Verify ownership and current status
  const { data: submission } = await supabase
    .from('submissions')
    .select('id, status, submitted_by')
    .eq('id', submissionId)
    .eq('submitted_by', user.id)
    .single()

  if (!submission) {
    return { success: false, error: 'Soumission non trouvée' }
  }

  const sub = submission as { id: string; status: string; submitted_by: string }

  if (!canTransition(sub.status as SubmissionStatus, 'submitted')) {
    return { success: false, error: 'Transition de statut invalide' }
  }

  // Update status
  const { error } = await supabase
    .from('submissions')
    .update({ status: 'submitted', updated_at: new Date().toISOString() } as never)
    .eq('id', submissionId)

  if (error) {
    return { success: false, error: 'Erreur lors de la soumission' }
  }

  // Trigger platform review (in a real app, this would be async/queue)
  await runPlatformReview(submissionId)

  revalidatePath('/dev/submissions')
  return { success: true }
}

// ============================================
// PLATFORM REVIEW (Auto)
// ============================================

// High-risk permissions that require 'high' risk level
const HIGH_RISK_PERMISSIONS = ['manipulation', 'emergency']
const MEDIUM_RISK_PERMISSIONS = ['camera', 'microphone', 'navigation']

async function runPlatformReview(submissionId: string): Promise<void> {
  const supabase = await createClient()

  // Get submission with version details
  const { data: submission } = await supabase
    .from('submissions')
    .select(`
      id,
      skill_versions!inner (
        manifest,
        permissions_requested,
        permissions_justification,
        data_usage,
        risk_level,
        skill_packages (
          storage_path,
          size_bytes,
          checksum_sha256
        )
      )
    `)
    .eq('id', submissionId)
    .single()

  if (!submission) return

  const sub = submission as unknown as {
    id: string
    skill_versions: {
      manifest: Record<string, unknown>
      permissions_requested: string[]
      permissions_justification: Record<string, string>
      data_usage: { endpoints?: string[]; collectsData?: boolean } | null
      risk_level: string
      skill_packages: { storage_path: string; size_bytes: number; checksum_sha256: string }[]
    }
  }

  const checks: PlatformReviewResult['checks'] = []
  let allPassed = true
  let hasWarnings = false

  // Check 1: Manifest validation
  const manifestResult = manifestSchema.safeParse(sub.skill_versions.manifest)
  checks.push({
    name: 'Manifest valide',
    passed: manifestResult.success,
    message: manifestResult.success 
      ? 'Le manifest est conforme au schema' 
      : `Manifest invalide: ${manifestResult.error?.issues[0]?.message}`,
  })
  if (!manifestResult.success) allPassed = false

  // Check 2: Package exists
  const hasPackage = sub.skill_versions.skill_packages?.length > 0
  checks.push({
    name: 'Package présent',
    passed: hasPackage,
    message: hasPackage ? 'Le package est présent' : 'Aucun package trouvé',
  })
  if (!hasPackage) allPassed = false

  // Check 3: Package size (max 100MB)
  const packageSize = sub.skill_versions.skill_packages?.[0]?.size_bytes ?? 0
  const sizeOk = packageSize > 0 && packageSize < 100 * 1024 * 1024
  checks.push({
    name: 'Taille du package',
    passed: sizeOk,
    message: sizeOk 
      ? `Taille acceptable (${(packageSize / 1024 / 1024).toFixed(2)} MB)` 
      : packageSize === 0 ? 'Taille inconnue' : 'Package trop volumineux (max 100MB)',
  })
  if (!sizeOk) allPassed = false

  // Check 4: Checksum present
  const hasChecksum = !!sub.skill_versions.skill_packages?.[0]?.checksum_sha256
  checks.push({
    name: 'Checksum SHA256',
    passed: hasChecksum,
    message: hasChecksum ? 'Checksum présent pour vérification d\'intégrité' : 'Checksum manquant',
  })
  if (!hasChecksum) allPassed = false

  // Check 5: Permissions declared match manifest
  const manifestPerms = (sub.skill_versions.manifest?.permissions as string[]) ?? []
  const declaredPerms = sub.skill_versions.permissions_requested ?? []
  const permsMatch = manifestPerms.every((p) => declaredPerms.includes(p))
  checks.push({
    name: 'Cohérence permissions',
    passed: permsMatch,
    message: permsMatch 
      ? 'Les permissions déclarées correspondent au manifest' 
      : 'Le manifest déclare des permissions non listées dans la soumission',
  })
  if (!permsMatch) allPassed = false

  // Check 6: All permissions have justifications
  const allPermsJustified = declaredPerms.every((p) => {
    const just = sub.skill_versions.permissions_justification?.[p]
    return just && just.trim().length >= 10
  })
  checks.push({
    name: 'Justifications permissions',
    passed: allPermsJustified,
    message: allPermsJustified 
      ? 'Toutes les permissions sont justifiées' 
      : 'Certaines permissions manquent de justification détaillée',
  })
  if (!allPermsJustified) allPassed = false

  // Check 7: Risk level coherence with permissions
  const riskLevel = sub.skill_versions.risk_level
  const hasHighRiskPerm = declaredPerms.some((p) => HIGH_RISK_PERMISSIONS.includes(p))
  const hasMediumRiskPerm = declaredPerms.some((p) => MEDIUM_RISK_PERMISSIONS.includes(p))
  
  let riskCoherent = true
  let riskMessage = ''
  
  if (hasHighRiskPerm && riskLevel !== 'high') {
    riskCoherent = false
    riskMessage = `Permission à haut risque (${declaredPerms.filter(p => HIGH_RISK_PERMISSIONS.includes(p)).join(', ')}) nécessite un niveau "high"`
  } else if (hasMediumRiskPerm && riskLevel === 'low') {
    // Warning but not blocking
    riskMessage = `Attention: permissions sensibles avec niveau "low" - sera examiné attentivement par l'OEM`
    hasWarnings = true
  } else {
    riskMessage = `Niveau de risque "${riskLevel}" cohérent avec les permissions demandées`
  }
  
  checks.push({
    name: 'Cohérence niveau de risque',
    passed: riskCoherent,
    message: riskMessage,
  })
  if (!riskCoherent) allPassed = false

  // Check 8: Network endpoints declared if network permission
  const hasNetworkPerm = declaredPerms.includes('network')
  const endpoints = sub.skill_versions.data_usage?.endpoints || []
  
  if (hasNetworkPerm) {
    const hasEndpoints = endpoints.length > 0
    checks.push({
      name: 'Endpoints réseau déclarés',
      passed: hasEndpoints,
      message: hasEndpoints 
        ? `${endpoints.length} endpoint(s) déclaré(s): ${endpoints.slice(0, 3).join(', ')}${endpoints.length > 3 ? '...' : ''}`
        : 'Permission réseau demandée mais aucun endpoint déclaré',
    })
    if (!hasEndpoints) allPassed = false
  }

  // Check 9: Data collection disclosure
  const collectsData = sub.skill_versions.data_usage?.collectsData ?? false
  if (collectsData) {
    checks.push({
      name: 'Déclaration collecte données',
      passed: true,
      message: 'Collecte de données déclarée - sera vérifiée par l\'OEM',
    })
  }

  // Build result
  const failedChecks = checks.filter((c) => !c.passed)
  const result: PlatformReviewResult = {
    passed: allPassed,
    checks,
    timestamp: new Date().toISOString(),
  }

  // Build detailed notes
  let notes = ''
  if (allPassed) {
    notes = hasWarnings 
      ? '✓ Validation automatique réussie avec avertissements. Transmis à l\'OEM pour review.'
      : '✓ Validation automatique réussie. Transmis à l\'OEM pour review.'
  } else {
    notes = `✗ Validation automatique échouée.\n\nProblèmes détectés (${failedChecks.length}):\n`
    failedChecks.forEach((check, i) => {
      notes += `${i + 1}. ${check.name}: ${check.message}\n`
    })
    notes += '\nCorrigez ces erreurs et soumettez à nouveau.'
  }

  // Update submission
  const newStatus = allPassed ? 'oem_review' : 'changes_requested'

  await supabase
    .from('submissions')
    .update({
      status: newStatus,
      platform_review_result: result,
      platform_review_at: new Date().toISOString(),
      platform_review_notes: notes,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', submissionId)

  // Log audit event
  await supabase
    .from('audit_events')
    .insert({
      event_type: 'submission.platform_reviewed',
      entity_type: 'submission',
      entity_id: submissionId,
      payload: {
        passed: allPassed,
        checks_count: checks.length,
        failed_checks: failedChecks.map((c) => c.name),
        new_status: newStatus,
      },
    } as never)
}

// ============================================
// OEM DECISION
// ============================================

export async function makeOemDecision(
  input: OemDecisionInput
): Promise<{ success: boolean; error?: string }> {
  const validation = oemDecisionSchemaSimple.safeParse(input)
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // Get submission and verify OEM membership
  const { data: submission } = await supabase
    .from('submissions')
    .select('id, status, target_oem_id')
    .eq('id', input.submissionId)
    .single()

  if (!submission) {
    return { success: false, error: 'Soumission non trouvée' }
  }

  const sub = submission as { id: string; status: string; target_oem_id: string | null }

  if (sub.status !== 'oem_review') {
    return { success: false, error: 'Cette soumission n\'est pas en attente de review OEM' }
  }

  // Verify user is member of target OEM
  if (sub.target_oem_id) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('org_id', sub.target_oem_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'admin', 'reviewer'].includes((membership as { role: string }).role)) {
      return { success: false, error: 'Vous n\'êtes pas autorisé à reviewer cette soumission' }
    }
  }

  // Map decision to status
  const statusMap: Record<string, SubmissionStatus> = {
    approved: 'approved',
    rejected: 'rejected',
    changes_requested: 'changes_requested',
  }

  const newStatus = statusMap[input.decision]

  // Update submission
  const { error: updateError } = await supabase
    .from('submissions')
    .update({
      status: newStatus,
      oem_reviewed_by: user.id,
      oem_reviewed_at: new Date().toISOString(),
      oem_review_notes: input.notes || null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', input.submissionId)

  if (updateError) {
    return { success: false, error: 'Erreur lors de la mise à jour' }
  }

  // Create oem_reviews record
  await supabase
    .from('oem_reviews')
    .insert({
      submission_id: input.submissionId,
      oem_org_id: sub.target_oem_id,
      reviewer_user_id: user.id,
      decision: input.decision,
      notes: input.notes || null,
    } as never)

  // If approved, update skill_version visibility and skill status
  if (input.decision === 'approved') {
    // Get skill_version_id
    const { data: subData } = await supabase
      .from('submissions')
      .select('skill_version_id')
      .eq('id', input.submissionId)
      .single()

    if (subData) {
      const versionId = (subData as { skill_version_id: string }).skill_version_id

      // Update version visibility
      await supabase
        .from('skill_versions')
        .update({ visibility: 'public' } as never)
        .eq('id', versionId)

      // Get skill_id and update skill status
      const { data: versionData } = await supabase
        .from('skill_versions')
        .select('skill_id')
        .eq('id', versionId)
        .single()

      if (versionData) {
        await supabase
          .from('skills')
          .update({ status: 'published' } as never)
          .eq('id', (versionData as { skill_id: string }).skill_id)
      }
    }
  }

  revalidatePath('/oem/submissions')
  revalidatePath('/dev/submissions')
  revalidatePath('/store')

  return { success: true }
}

// ============================================
// GET OEM SUBMISSIONS (for OEM portal)
// ============================================

export async function getOemSubmissions(oemOrgId: string): Promise<DevSubmission[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Verify membership
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('org_id', oemOrgId)
    .eq('user_id', user.id)
    .single()

  if (!membership) return []

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id,
      skill_version_id,
      status,
      platform_review_notes,
      oem_review_notes,
      created_at,
      updated_at,
      skill_versions!inner (
        version,
        skills!inner (
          name,
          slug
        )
      ),
      oems (
        brand_name
      )
    `)
    .eq('target_oem_id', oemOrgId)
    .in('status', ['oem_review', 'approved', 'rejected', 'changes_requested'])
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching OEM submissions:', error)
    return []
  }

  return (data as unknown as Array<{
    id: string
    skill_version_id: string
    status: string
    platform_review_notes: string | null
    oem_review_notes: string | null
    created_at: string
    updated_at: string
    skill_versions: {
      version: string
      skills: {
        name: string
        slug: string
      }
    }
    oems: { brand_name: string } | null
  }>).map((sub) => ({
    id: sub.id,
    skillVersionId: sub.skill_version_id,
    skillName: sub.skill_versions.skills.name,
    skillSlug: sub.skill_versions.skills.slug,
    version: sub.skill_versions.version,
    status: sub.status as SubmissionStatus,
    targetOemName: sub.oems?.brand_name ?? null,
    platformReviewNotes: sub.platform_review_notes,
    oemReviewNotes: sub.oem_review_notes,
    createdAt: sub.created_at,
    updatedAt: sub.updated_at,
  }))
}
