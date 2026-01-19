'use client'

import { useEffect } from 'react'
import { trackPageVisit } from '@/server/stats'

export function VisitorTracker() {
  useEffect(() => {
    // Track la visite au chargement de la page (une seule fois)
    trackPageVisit().catch(console.error)
  }, [])

  // Ce composant ne rend rien visuellement
  return null
}
