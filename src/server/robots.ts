'use server'

import { createClient } from '@/lib/supabase/server'

// ============================================
// TYPES
// ============================================

export interface OemWithModels {
  id: string
  brandName: string
  models: {
    id: string
    modelName: string
    modelCode: string | null
  }[]
}

export interface UserRobot {
  id: string
  name: string | null
  serialNumber: string
  status: 'unpaired' | 'pending' | 'paired' | 'revoked'
  pairedAt: string | null
  model: {
    id: string
    modelName: string
    modelCode: string | null
    capabilities: Record<string, unknown> | null
  }
  oem: {
    id: string
    brandName: string
  }
}

export async function getUserRobots(): Promise<UserRobot[]> {
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

  // Requête avec les bons noms de colonnes selon le schéma
  const { data, error } = await supabase
    .from('robots')
    .select(`
      id,
      nickname,
      robot_identifier,
      status,
      paired_at,
      robot_models (
        id,
        model_name,
        model_code,
        capabilities
      ),
      oems (
        id,
        brand_name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Si erreur de requête, logger et retourner vide
  if (error) {
    console.error('Error fetching robots:', error)
    return []
  }

  // Si pas de données, retourner simplement un tableau vide (pas d'erreur)
  if (!data || data.length === 0) {
    return []
  }

  // Type pour les données brutes de Supabase
  interface RobotData {
    id: string
    nickname: string | null
    robot_identifier: string
    status: string
    paired_at: string | null
    robot_models: {
      id: string
      model_name: string
      model_code: string | null
      capabilities: Record<string, unknown> | null
    } | null
    oems: {
      id: string
      brand_name: string
    } | null
  }

  // Filtrer les robots qui ont bien les relations chargées
  return (data as unknown as RobotData[])
    .filter((robot) => robot.robot_models !== null && robot.oems !== null)
    .map((robot) => ({
      id: robot.id,
      name: robot.nickname,
      serialNumber: robot.robot_identifier,
      status: robot.status as 'unpaired' | 'pending' | 'paired' | 'revoked',
      pairedAt: robot.paired_at,
      model: {
        id: robot.robot_models!.id,
        modelName: robot.robot_models!.model_name,
        modelCode: robot.robot_models!.model_code,
        capabilities: robot.robot_models!.capabilities,
      },
      oem: {
        id: robot.oems!.id,
        brandName: robot.oems!.brand_name,
      },
    }))
}

export async function getCompatibleRobots(skillId: string): Promise<UserRobot[]> {
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

  // Récupérer tous les robots de l'utilisateur
  const robots = await getUserRobots()
  
  // Pour le moment, on considère tous les robots paired comme compatibles
  // Dans une vraie implémentation, on vérifierait les skill_packages et les capabilities
  return robots.filter((robot) => robot.status === 'paired')
}

export async function checkUserOwnsSkill(skillId: string): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return false
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // Vérifier si l'utilisateur a déjà téléchargé ce skill
  const { count } = await supabase
    .from('downloads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('skill_version_id', skillId)

  return (count ?? 0) > 0
}

// ============================================
// DELETE ROBOT
// ============================================

export async function deleteRobot(robotId: string): Promise<{ success: boolean; error?: string }> {
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

  // Vérifier que le robot appartient à l'utilisateur
  const { data: robot, error: fetchError } = await supabase
    .from('robots')
    .select('id, user_id')
    .eq('id', robotId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !robot) {
    return { success: false, error: 'Robot non trouvé ou non autorisé' }
  }

  // Supprimer les installations associées d'abord (cascade devrait le faire mais on s'assure)
  await supabase
    .from('installations')
    .delete()
    .eq('robot_id', robotId)

  // Supprimer les pairing requests associées
  await supabase
    .from('robot_pairing_requests')
    .delete()
    .eq('robot_id', robotId)

  // Supprimer le robot
  const { error: deleteError } = await supabase
    .from('robots')
    .delete()
    .eq('id', robotId)
    .eq('user_id', user.id)

  if (deleteError) {
    console.error('Error deleting robot:', deleteError)
    return { success: false, error: 'Erreur lors de la suppression' }
  }

  return { success: true }
}

// ============================================
// GET OEMS WITH MODELS
// ============================================

export async function getOemsWithModels(): Promise<OemWithModels[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return []
  }

  const supabase = await createClient()

  // Récupérer les OEMs avec leurs modèles
  const { data: oems, error } = await supabase
    .from('oems')
    .select(`
      id,
      brand_name,
      robot_models (
        id,
        model_name,
        model_code
      )
    `)
    .order('brand_name')

  if (error) {
    console.error('Error fetching OEMs:', error)
    return []
  }

  interface OemData {
    id: string
    brand_name: string
    robot_models: {
      id: string
      model_name: string
      model_code: string | null
    }[]
  }

  return (oems as unknown as OemData[]).map((oem) => ({
    id: oem.id,
    brandName: oem.brand_name,
    models: oem.robot_models || [],
  })).map((oem) => ({
    ...oem,
    models: oem.models.map((m) => ({
      id: m.id,
      modelName: m.model_name,
      modelCode: m.model_code,
    })),
  }))
}

// ============================================
// CREATE ROBOT
// ============================================

export interface CreateRobotInput {
  oemId: string
  modelId: string
  serialNumber: string
  nickname?: string
}

export async function createRobot(input: CreateRobotInput): Promise<{ 
  success: boolean
  robotId?: string 
  pairingCode?: string
  error?: string 
}> {
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

  // Vérifier que l'OEM existe
  const { data: oem, error: oemError } = await supabase
    .from('oems')
    .select('id')
    .eq('id', input.oemId)
    .single()

  if (oemError || !oem) {
    return { success: false, error: 'Constructeur non trouvé' }
  }

  // Vérifier que le modèle existe et appartient à cet OEM
  const { data: model, error: modelError } = await supabase
    .from('robot_models')
    .select('id')
    .eq('id', input.modelId)
    .eq('oem_id', input.oemId)
    .single()

  if (modelError || !model) {
    return { success: false, error: 'Modèle non trouvé' }
  }

  // Vérifier si ce robot_identifier n'existe pas déjà pour cet OEM
  const { data: existing } = await supabase
    .from('robots')
    .select('id')
    .eq('oem_id', input.oemId)
    .eq('robot_identifier', input.serialNumber)
    .single()

  if (existing) {
    return { success: false, error: 'Ce numéro de série est déjà enregistré' }
  }

  // Créer le robot avec status 'pending'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: robot, error: createError } = await (supabase as any)
    .from('robots')
    .insert({
      user_id: user.id,
      oem_id: input.oemId,
      robot_model_id: input.modelId,
      robot_identifier: input.serialNumber,
      nickname: input.nickname || null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (createError || !robot) {
    console.error('Error creating robot:', createError)
    return { success: false, error: 'Erreur lors de la création du robot' }
  }

  const robotData = robot as { id: string }

  // Générer un code de pairing aléatoire
  const pairingCode = generatePairingCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  // Créer la requête de pairing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: pairingError } = await (supabase as any)
    .from('robot_pairing_requests')
    .insert({
      robot_id: robotData.id,
      challenge: crypto.randomUUID(),
      code: pairingCode,
      expires_at: expiresAt.toISOString(),
    })

  if (pairingError) {
    console.error('Error creating pairing request:', pairingError)
    // On supprime le robot créé si le pairing a échoué
    await supabase.from('robots').delete().eq('id', robotData.id)
    return { success: false, error: 'Erreur lors de l\'initialisation de l\'appairage' }
  }

  return { 
    success: true, 
    robotId: robotData.id,
    pairingCode 
  }
}

function generatePairingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 3; i++) {
    if (i > 0) code += '-'
    for (let j = 0; j < 3; j++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
  }
  return code
}

// ============================================
// CONFIRM PAIRING
// ============================================

export async function confirmPairing(robotId: string): Promise<{ 
  success: boolean
  error?: string 
}> {
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

  // Vérifier que le robot appartient à l'utilisateur et est en status pending
  const { data: robotRaw, error: fetchError } = await supabase
    .from('robots')
    .select('id, status')
    .eq('id', robotId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !robotRaw) {
    return { success: false, error: 'Robot non trouvé' }
  }

  const robot = robotRaw as { id: string; status: string }

  if (robot.status !== 'pending') {
    return { success: false, error: 'Robot non en attente d\'appairage' }
  }

  // Vérifier qu'il y a une requête de pairing valide
  const { data: pairingRequestRaw } = await supabase
    .from('robot_pairing_requests')
    .select('id, expires_at')
    .eq('robot_id', robotId)
    .is('confirmed_at', null)
    .single()

  if (!pairingRequestRaw) {
    return { success: false, error: 'Aucune requête d\'appairage active' }
  }

  const pairingRequest = pairingRequestRaw as { id: string; expires_at: string }

  // Vérifier si pas expiré
  if (new Date(pairingRequest.expires_at) < new Date()) {
    return { success: false, error: 'Le code d\'appairage a expiré' }
  }

  // Marquer la requête comme confirmée
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: confirmError } = await (supabase as any)
    .from('robot_pairing_requests')
    .update({
      confirmed_at: new Date().toISOString(),
      confirmed_by: 'user_manual', // Dans un vrai système, ce serait confirmé par le robot
    })
    .eq('id', pairingRequest.id)

  if (confirmError) {
    console.error('Error confirming pairing:', confirmError)
    return { success: false, error: 'Erreur lors de la confirmation' }
  }

  // Mettre à jour le status du robot
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from('robots')
    .update({
      status: 'paired',
      paired_at: new Date().toISOString(),
    })
    .eq('id', robotId)

  if (updateError) {
    console.error('Error updating robot status:', updateError)
    return { success: false, error: 'Erreur lors de la mise à jour du robot' }
  }

  return { success: true }
}
