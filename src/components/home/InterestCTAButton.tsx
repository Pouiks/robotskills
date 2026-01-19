'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackInterestClick } from '@/server/stats'

interface InterestCTAButtonProps {
  href: string
  children: React.ReactNode
  source?: string
}

export function InterestCTAButton({ href, children, source = 'hero_cta' }: InterestCTAButtonProps) {
  const router = useRouter()

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    
    // Track le clic en arrière-plan (non bloquant)
    trackInterestClick(source).catch(console.error)
    
    // Navigation immédiate
    router.push(href)
  }

  return (
    <Button size="lg" onClick={handleClick}>
      {children}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  )
}
