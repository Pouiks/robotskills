'use client'

import Image from 'next/image'
import { Download, Tag, ShieldCheck } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CompatibilityBadge } from './compatibility-badge'
import { Link } from '@/i18n/navigation'
import type { SkillWithDetails } from '@/types'
import type { UserRobot } from '@/server/robots'

interface SkillCardProps {
  skill: SkillWithDetails
  userRobots?: UserRobot[]
}

export function SkillCard({ skill, userRobots = [] }: SkillCardProps) {
  const locale = useLocale()
  const t = useTranslations('skills')

  // Un skill publié avec une version publique est considéré comme certifié OEM
  const isCertified = skill.status === 'published' && skill.latestVersion !== null

  // Sélectionner le contenu selon la locale
  const name = locale === 'en' && skill.nameEn ? skill.nameEn : skill.name
  const shortDescription =
    locale === 'en' && skill.shortDescriptionEn
      ? skill.shortDescriptionEn
      : skill.shortDescription

  function formatPrice(priceCents: number): string {
    if (priceCents === 0) return locale === 'en' ? 'Free' : 'Gratuit'
    return `${(priceCents / 100).toFixed(2).replace('.', ',')} €`
  }

  return (
    <Link href={`/skills/${skill.slug}`}>
      <Card className="h-full card-hover overflow-hidden group">
        <CardContent className="p-0">
          {/* Header avec icône centrée */}
          <div className="relative bg-gradient-to-br from-muted/50 to-muted p-6 flex justify-center">
            {/* Prix en haut à droite */}
            <div className="absolute top-3 right-3">
              <span
                className={`text-sm font-bold px-2.5 py-1 rounded-full ${
                  skill.isFree
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {formatPrice(skill.priceCents)}
              </span>
            </div>

            {/* Badge certifié en haut à gauche */}
            {isCertified && (
              <div className="absolute top-3 left-3">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0"
                >
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {locale === 'en' ? 'Certified' : 'Certifié'}
                </Badge>
              </div>
            )}

            {/* Icône */}
            <div className="h-20 w-20 rounded-2xl bg-background shadow-sm flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              {skill.iconPath ? (
                <Image
                  src={skill.iconPath}
                  alt={name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <div className="text-3xl font-bold text-muted-foreground">{name.charAt(0)}</div>
              )}
            </div>
          </div>

          {/* Contenu */}
          <div className="p-4 space-y-3">
            {/* Nom */}
            <h3 className="font-semibold text-base leading-tight line-clamp-2 min-h-[2.5rem]">
              {name}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
              {shortDescription || t('noDescription')}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {skill.category && (
                  <Badge variant="outline" className="capitalize text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {skill.category}
                  </Badge>
                )}
                {/* Badge de compatibilité avec les robots de l'utilisateur */}
                {userRobots.length > 0 && (
                  <CompatibilityBadge compatibleOems={skill.compatibleOems} userRobots={userRobots} />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Download className="h-3.5 w-3.5" />
                <span>{skill.downloadCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
