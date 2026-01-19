'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { randomBytes, createHash } from 'crypto'

// ============================================
// SERVICE CLIENT (elevated privileges)
// ============================================

function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ============================================
// TYPES
// ============================================

export interface DeveloperLicense {
  id: string
  userId: string
  issuedAt: string
  revokedAt: string | null
  lifetime: boolean
  isValid: boolean
}

export interface ActivationResult {
  success: boolean
  error?: string
  token?: string // Only returned ONCE at activation
  license?: DeveloperLicense
}

// ============================================
// HELPERS
// ============================================

/**
 * Generate a secure random token
 */
function generateToken(): string {
  // Format: DEV-XXXX-XXXX-XXXX-XXXX (readable format)
  const bytes = randomBytes(16)
  const hex = bytes.toString('hex').toUpperCase()
  return `DEV-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`
}

/**
 * Hash a token using SHA256
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// ============================================
// GET DEVELOPER LICENSE
// ============================================

export async function getDeveloperLicense(): Promise<DeveloperLicense | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('developer_licenses')
    .select('id, user_id, issued_at, revoked_at, lifetime')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  const license = data as {
    id: string
    user_id: string
    issued_at: string
    revoked_at: string | null
    lifetime: boolean
  }

  return {
    id: license.id,
    userId: license.user_id,
    issuedAt: license.issued_at,
    revokedAt: license.revoked_at,
    lifetime: license.lifetime,
    isValid: license.revoked_at === null && license.lifetime === true,
  }
}

// ============================================
// REQUIRE DEVELOPER (Server-side Guard)
// ============================================

export async function requireDeveloper(): Promise<{
  authorized: boolean
  error?: string
  userId?: string
}> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { authorized: false, error: 'Service non configuré' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { authorized: false, error: 'Non authentifié' }
  }

  // Check for valid developer license
  const { data: license, error } = await supabase
    .from('developer_licenses')
    .select('id, revoked_at, lifetime')
    .eq('user_id', user.id)
    .single()

  if (error || !license) {
    return { authorized: false, error: 'Licence développeur requise' }
  }

  const licenseData = license as { id: string; revoked_at: string | null; lifetime: boolean }

  if (licenseData.revoked_at !== null) {
    return { authorized: false, error: 'Licence développeur révoquée' }
  }

  if (!licenseData.lifetime) {
    return { authorized: false, error: 'Licence développeur expirée' }
  }

  return { authorized: true, userId: user.id }
}

// ============================================
// ACTIVATE DEVELOPER PROGRAM
// ============================================

export async function activateDeveloperProgram(): Promise<ActivationResult> {
  // 1. Vérifier que l'utilisateur est authentifié (client normal)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: false, error: 'Service non configuré' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Non authentifié' }
  }

  // 2. Obtenir le client service (privilèges élevés) pour les opérations admin
  const serviceClient = getServiceClient()
  if (!serviceClient) {
    console.error('Service role key not configured')
    return { success: false, error: 'Configuration serveur manquante' }
  }

  // 3. Vérifier si l'utilisateur a déjà une licence (avec service client)
  const { data: existingLicense } = await serviceClient
    .from('developer_licenses')
    .select('id, revoked_at')
    .eq('user_id', user.id)
    .single()

  if (existingLicense) {
    // Vérifier si la licence est révoquée (pourrait être réactivée)
    if (existingLicense.revoked_at === null) {
      return { success: false, error: 'Vous avez déjà une licence développeur active' }
    }
    // Si révoquée, on pourrait permettre une réactivation (non implémenté dans ce POC)
    return { success: false, error: 'Votre licence a été révoquée. Contactez le support.' }
  }

  // 4. SIMULATION DE VÉRIFICATION DE PAIEMENT
  // Dans un vrai système:
  // - Vérifier le paiement Stripe/autre
  // - Vérifier que la transaction est valide
  // - Vérifier que le montant correspond
  const paymentVerified = true // Simulé pour POC
  const paymentReference = `POC_SIM_${Date.now()}`

  if (!paymentVerified) {
    return { success: false, error: 'Paiement non vérifié' }
  }

  // 5. Générer le token développeur
  const token = generateToken()
  const tokenHash = hashToken(token)

  // 6. Créer la licence avec le SERVICE CLIENT (bypass RLS)
  const { data: newLicense, error: licenseError } = await serviceClient
    .from('developer_licenses')
    .insert({
      user_id: user.id,
      token_hash: tokenHash,
      lifetime: true,
      payment_reference: paymentReference,
    })
    .select('id, user_id, issued_at, revoked_at, lifetime')
    .single()

  if (licenseError) {
    console.error('Error creating developer license:', licenseError)
    return { success: false, error: 'Erreur lors de la création de la licence' }
  }

  // 7. Mettre à jour user_roles (avec service client)
  const { error: rolesError } = await serviceClient
    .from('user_roles')
    .upsert({
      user_id: user.id,
      is_developer: true,
    }, {
      onConflict: 'user_id',
    })

  if (rolesError) {
    console.error('Error updating user roles:', rolesError)
    // Ne pas échouer complètement, la licence est créée
  }

  // 8. Logger l'événement d'audit (avec service client)
  await serviceClient
    .from('audit_events')
    .insert({
      actor_user_id: user.id,
      event_type: 'developer_license.created',
      entity_type: 'developer_license',
      entity_id: newLicense.id,
      payload: {
        method: 'simulation',
        payment_reference: paymentReference,
      },
    })

  return {
    success: true,
    token, // Retourné UNE SEULE FOIS - ne sera plus jamais affiché
    license: {
      id: newLicense.id,
      userId: newLicense.user_id,
      issuedAt: newLicense.issued_at,
      revokedAt: newLicense.revoked_at,
      lifetime: newLicense.lifetime,
      isValid: true,
    },
  }
}

// ============================================
// VERIFY TOKEN (for API use cases)
// ============================================

export async function verifyDeveloperToken(token: string): Promise<{
  valid: boolean
  userId?: string
}> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { valid: false }
  }

  const supabase = await createClient()
  const tokenHash = hashToken(token)

  const { data, error } = await supabase
    .from('developer_licenses')
    .select('user_id, revoked_at, lifetime')
    .eq('token_hash', tokenHash)
    .single()

  if (error || !data) {
    return { valid: false }
  }

  const license = data as { user_id: string; revoked_at: string | null; lifetime: boolean }

  if (license.revoked_at !== null || !license.lifetime) {
    return { valid: false }
  }

  return { valid: true, userId: license.user_id }
}
