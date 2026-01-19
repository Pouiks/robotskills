'use server'

import { createClient } from '@/lib/supabase/server'
import { requireDeveloper } from './developer'

// ============================================
// CONSTANTS
// ============================================

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']

const MAX_ICON_SIZE = 512 * 1024 // 512KB
const MAX_SCREENSHOT_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_PACKAGE_SIZE = 100 * 1024 * 1024 // 100MB

// ============================================
// TYPES
// ============================================

export interface UploadResult {
  success: boolean
  error?: string
  path?: string
  url?: string
}

// ============================================
// VALIDATE FILE
// ============================================

function validateFile(
  file: File,
  allowedTypes: string[],
  maxSize: number
): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}` 
    }
  }

  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1)
    return { 
      valid: false, 
      error: `Fichier trop volumineux. Taille maximum: ${maxMB}MB` 
    }
  }

  return { valid: true }
}

// ============================================
// VERIFY SKILL OWNERSHIP
// ============================================

async function verifySkillOwnership(
  skillId: string
): Promise<{ authorized: boolean; error?: string; userId?: string }> {
  const devCheck = await requireDeveloper()
  if (!devCheck.authorized || !devCheck.userId) {
    return { authorized: false, error: devCheck.error || 'Non authentifié' }
  }

  const supabase = await createClient()
  
  const { data: skill, error } = await supabase
    .from('skills')
    .select('id')
    .eq('id', skillId)
    .eq('owner_user_id', devCheck.userId)
    .single()

  if (error || !skill) {
    return { authorized: false, error: 'Skill non trouvé ou non autorisé' }
  }

  return { authorized: true, userId: devCheck.userId }
}

// ============================================
// UPLOAD SKILL ICON
// ============================================

export async function uploadSkillIcon(
  skillId: string,
  formData: FormData
): Promise<UploadResult> {
  const ownership = await verifySkillOwnership(skillId)
  if (!ownership.authorized) {
    return { success: false, error: ownership.error }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { success: false, error: 'Aucun fichier fourni' }
  }

  // Validate
  const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_ICON_SIZE)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  const supabase = await createClient()
  
  // Generate filename
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const fileName = `${skillId}/icon.${ext}`

  // Upload
  const { error: uploadError } = await supabase.storage
    .from('skill-icons')
    .upload(fileName, file, { 
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    console.error('Error uploading icon:', uploadError)
    return { success: false, error: 'Erreur lors de l\'upload de l\'icône' }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('skill-icons')
    .getPublicUrl(fileName)

  // Update skill record
  const { error: updateError } = await supabase
    .from('skills')
    .update({ icon_path: urlData.publicUrl } as never)
    .eq('id', skillId)

  if (updateError) {
    console.error('Error updating skill icon path:', updateError)
  }

  return { 
    success: true, 
    path: fileName,
    url: urlData.publicUrl,
  }
}

// ============================================
// UPLOAD SCREENSHOT
// ============================================

export async function uploadScreenshot(
  skillId: string,
  formData: FormData,
  sortOrder: number = 0
): Promise<UploadResult> {
  const ownership = await verifySkillOwnership(skillId)
  if (!ownership.authorized) {
    return { success: false, error: ownership.error }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { success: false, error: 'Aucun fichier fourni' }
  }

  // Validate
  const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_SCREENSHOT_SIZE)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  const supabase = await createClient()
  
  // Generate unique filename
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const timestamp = Date.now()
  const fileName = `${skillId}/screenshots/${timestamp}.${ext}`

  // Upload
  const { error: uploadError } = await supabase.storage
    .from('skill-assets')
    .upload(fileName, file, { 
      upsert: false, // Don't overwrite existing
      contentType: file.type,
    })

  if (uploadError) {
    console.error('Error uploading screenshot:', uploadError)
    return { success: false, error: 'Erreur lors de l\'upload du screenshot' }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('skill-assets')
    .getPublicUrl(fileName)

  // Insert into skill_assets
  const { error: insertError } = await supabase
    .from('skill_assets')
    .insert({
      skill_id: skillId,
      type: 'screenshot',
      path: urlData.publicUrl,
      sort_order: sortOrder,
    } as never)

  if (insertError) {
    console.error('Error inserting skill asset:', insertError)
    // Try to delete the uploaded file
    await supabase.storage.from('skill-assets').remove([fileName])
    return { success: false, error: 'Erreur lors de l\'enregistrement du screenshot' }
  }

  return { 
    success: true, 
    path: fileName,
    url: urlData.publicUrl,
  }
}

// ============================================
// DELETE SCREENSHOT
// ============================================

export async function deleteScreenshot(
  skillId: string,
  assetId: string
): Promise<{ success: boolean; error?: string }> {
  const ownership = await verifySkillOwnership(skillId)
  if (!ownership.authorized) {
    return { success: false, error: ownership.error }
  }

  const supabase = await createClient()

  // Get asset info
  const { data: asset, error: fetchError } = await supabase
    .from('skill_assets')
    .select('path')
    .eq('id', assetId)
    .eq('skill_id', skillId)
    .single()

  if (fetchError || !asset) {
    return { success: false, error: 'Asset non trouvé' }
  }

  // Extract storage path from URL
  const assetData = asset as { path: string }
  const url = new URL(assetData.path)
  const storagePath = url.pathname.split('/skill-assets/')[1]

  // Delete from storage
  if (storagePath) {
    await supabase.storage.from('skill-assets').remove([storagePath])
  }

  // Delete from database
  const { error: deleteError } = await supabase
    .from('skill_assets')
    .delete()
    .eq('id', assetId)

  if (deleteError) {
    console.error('Error deleting asset:', deleteError)
    return { success: false, error: 'Erreur lors de la suppression' }
  }

  return { success: true }
}

// ============================================
// UPLOAD SKILL PACKAGE
// ============================================

export async function uploadSkillPackage(
  skillId: string,
  versionId: string,
  formData: FormData
): Promise<UploadResult & { checksum?: string; sizeBytes?: number }> {
  const ownership = await verifySkillOwnership(skillId)
  if (!ownership.authorized) {
    return { success: false, error: ownership.error }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { success: false, error: 'Aucun fichier fourni' }
  }

  // Validate type
  const allowedTypes = ['application/zip', 'application/x-zip-compressed']
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.zip')) {
    return { success: false, error: 'Le package doit être un fichier ZIP' }
  }

  // Validate size
  if (file.size > MAX_PACKAGE_SIZE) {
    return { success: false, error: 'Package trop volumineux. Maximum: 100MB' }
  }

  const supabase = await createClient()

  // Calculate checksum
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  // Generate filename
  const fileName = `${versionId}/package.zip`

  // Upload
  const { error: uploadError } = await supabase.storage
    .from('skill-packages')
    .upload(fileName, file, { 
      upsert: true,
      contentType: 'application/zip',
    })

  if (uploadError) {
    console.error('Error uploading package:', uploadError)
    return { success: false, error: 'Erreur lors de l\'upload du package' }
  }

  return { 
    success: true, 
    path: fileName,
    checksum,
    sizeBytes: file.size,
  }
}

// ============================================
// GET SIGNED URL FOR PACKAGE
// ============================================

export async function getPackageSignedUrl(
  versionId: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<{ success: boolean; error?: string; url?: string }> {
  const devCheck = await requireDeveloper()
  if (!devCheck.authorized) {
    return { success: false, error: devCheck.error }
  }

  const supabase = await createClient()

  // Verify user owns this version's skill
  const { data: version, error: fetchError } = await supabase
    .from('skill_versions')
    .select('skill_id, skills!inner(owner_user_id)')
    .eq('id', versionId)
    .single()

  if (fetchError || !version) {
    return { success: false, error: 'Version non trouvée' }
  }

  const versionData = version as { skill_id: string; skills: { owner_user_id: string } }
  if (versionData.skills.owner_user_id !== devCheck.userId) {
    return { success: false, error: 'Non autorisé' }
  }

  // Generate signed URL
  const fileName = `${versionId}/package.zip`
  const { data, error: signError } = await supabase.storage
    .from('skill-packages')
    .createSignedUrl(fileName, expiresIn)

  if (signError || !data) {
    console.error('Error creating signed URL:', signError)
    return { success: false, error: 'Erreur lors de la génération de l\'URL' }
  }

  return { success: true, url: data.signedUrl }
}

// ============================================
// GET MULTIPLE SCREENSHOTS URLS
// ============================================

export async function getSkillAssets(skillId: string): Promise<{
  icon: string | null
  screenshots: { id: string; url: string; sortOrder: number }[]
}> {
  const supabase = await createClient()

  const { data: skill } = await supabase
    .from('skills')
    .select('icon_path')
    .eq('id', skillId)
    .single()

  const { data: assets } = await supabase
    .from('skill_assets')
    .select('id, path, sort_order')
    .eq('skill_id', skillId)
    .eq('type', 'screenshot')
    .order('sort_order')

  return {
    icon: (skill as { icon_path: string | null } | null)?.icon_path ?? null,
    screenshots: (assets as { id: string; path: string; sort_order: number }[] || []).map((a) => ({
      id: a.id,
      url: a.path,
      sortOrder: a.sort_order,
    })),
  }
}
