'use client'

import { useEffect, useState } from 'react'
import { Eye, Heart, Newspaper, Building2, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface StatsData {
  visitors: number
  interestClicks: number
  blogPosts: number
  contactedOems: number
}

interface DynamicStatsProps {
  initialStats: StatsData
}

export function DynamicStats({ initialStats }: DynamicStatsProps) {
  const [stats, setStats] = useState<StatsData>(initialStats)
  const [mounted, setMounted] = useState(false)
  const t = useTranslations('home.stats')

  const statConfig = [
    {
      key: 'visitors' as const,
      label: t('visitors'),
      icon: Eye,
      suffix: '',
      tooltip: t('visitorsTooltip'),
    },
    {
      key: 'interestClicks' as const,
      label: t('interested'),
      icon: Heart,
      suffix: '',
      tooltip: t('interestedTooltip'),
    },
    {
      key: 'blogPosts' as const,
      label: t('publishedArticles'),
      icon: Newspaper,
      suffix: '',
      tooltip: null,
    },
    {
      key: 'contactedOems' as const,
      label: t('contactedOems'),
      icon: Building2,
      suffix: '',
      tooltip: null,
    },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  // Afficher les stats avec animation au montage
  if (!mounted) {
    return (
      <section className="py-12 border-b">
        <div className="container">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>{t('launchPhase')}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {statConfig.map((stat) => (
              <div key={stat.key} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">-</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <TooltipProvider>
      <section className="py-12 border-b">
        <div className="container">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>{t('launchPhase')}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {statConfig.map((stat) => {
              const value = stats[stat.key]
              const IconComponent = stat.icon

              return (
                <div key={stat.key} className="text-center group">
                  <div className="flex justify-center mb-2">
                    {stat.tooltip ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <IconComponent className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{stat.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <IconComponent className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1 transition-all">
                    {value}
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </TooltipProvider>
  )
}
