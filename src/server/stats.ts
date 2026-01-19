'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import crypto from 'crypto'

// Générer un fingerprint basé sur IP + User-Agent (anonymisé)
async function generateFingerprint(): Promise<string> {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'
  
  // Hash pour anonymiser
  const data = `${ip}-${userAgent}`
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32)
}

// Tracker une visite sur le site
export async function trackPageVisit() {
  try {
    const supabase = await createClient()
    const fingerprint = await generateFingerprint()
    
    // Vérifier si ce fingerprint a déjà visité récemment (dernières 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('page_visits')
      .select('id')
      .eq('fingerprint', fingerprint)
      .gte('visited_at', oneDayAgo)
      .limit(1)
      .single()
    
    // Si déjà visité dans les 24h, on n'ajoute pas
    if (existing) {
      return { success: true, duplicate: true }
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('page_visits')
      .insert({ fingerprint })
    
    if (error) {
      console.error('Error tracking page visit:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, duplicate: false }
  } catch (error) {
    console.error('Error in trackPageVisit:', error)
    return { success: false, error: 'Internal error' }
  }
}

// Tracker un clic d'intérêt
export async function trackInterestClick(source: string = 'hero_cta') {
  try {
    const supabase = await createClient()
    const fingerprint = await generateFingerprint()
    
    // Vérifier si ce fingerprint a déjà cliqué récemment (dernières 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('interest_clicks')
      .select('id')
      .eq('fingerprint', fingerprint)
      .gte('clicked_at', oneDayAgo)
      .limit(1)
      .single()
    
    // Si déjà cliqué dans les 24h, on n'ajoute pas un nouveau clic
    if (existing) {
      return { success: true, duplicate: true }
    }
    
    // Récupérer l'utilisateur si connecté
    const { data: { user } } = await supabase.auth.getUser()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('interest_clicks')
      .insert({
        fingerprint,
        source,
        user_id: user?.id || null,
      })
    
    if (error) {
      console.error('Error tracking interest click:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, duplicate: false }
  } catch (error) {
    console.error('Error in trackInterestClick:', error)
    return { success: false, error: 'Internal error' }
  }
}

// Récupérer les stats du site
export async function getSiteStats() {
  try {
    const supabase = await createClient()
    
    // Compter les clics d'intérêt (via la fonction RPC)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: interestCount, error: interestError } = await (supabase as any)
      .rpc('count_unique_interest_clicks')
    
    if (interestError) {
      console.error('Error counting interest clicks:', interestError)
    }
    
    // Récupérer la config (constructeurs contactés)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: configData } = await (supabase as any)
      .from('site_config')
      .select('key, value')
      .in('key', ['contacted_oems_count'])
    
    interface ConfigRow {
      key: string
      value: number | string
    }
    
    const contactedOems = (configData as ConfigRow[] | null)?.find(c => c.key === 'contacted_oems_count')?.value || 0
    
    // Compter les visiteurs uniques
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: visitorsCount, error: visitorsError } = await (supabase as any)
      .rpc('count_unique_visitors')
    
    if (visitorsError) {
      console.error('Error counting visitors:', visitorsError)
    }
    
    // Offset de base pour les visiteurs (valeur initiale de départ)
    const VISITORS_BASE_OFFSET = 3
    
    return {
      visitors: (typeof visitorsCount === 'number' ? visitorsCount : 0) + VISITORS_BASE_OFFSET,
      interestClicks: typeof interestCount === 'number' ? interestCount : 0,
      contactedOems: typeof contactedOems === 'number' ? contactedOems : parseInt(String(contactedOems)) || 0,
    }
  } catch (error) {
    console.error('Error getting site stats:', error)
    return {
      visitors: 3, // Valeur par défaut
      interestClicks: 0,
      contactedOems: 0,
    }
  }
}
