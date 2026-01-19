'use client'

import { Bot, Check, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { UserRobot } from '@/server/robots'

interface CompatibilityBadgeProps {
  compatibleOems?: { id: string; brandName: string }[]
  userRobots: UserRobot[]
  showDetails?: boolean
}

export function CompatibilityBadge({ 
  compatibleOems = [], 
  userRobots,
  showDetails = false,
}: CompatibilityBadgeProps) {
  // Si le skill n'a pas de compatibilité déclarée
  const hasNoCompatibilityDeclared = compatibleOems.length === 0

  // Trouver les robots compatibles (seulement ceux dont l'OEM est dans la liste)
  const compatibleRobots = userRobots.filter((robot) =>
    compatibleOems.some((oem) => oem.id === robot.oem.id)
  )

  const hasCompatibleRobots = compatibleRobots.length > 0
  const allRobotsCompatible = compatibleRobots.length === userRobots.length && userRobots.length > 0

  if (showDetails) {
    // Si l'utilisateur n'a pas de robots
    if (userRobots.length === 0) {
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Compatibilité
          </h4>
          <p className="text-sm text-muted-foreground">
            Ajoutez un robot pour vérifier la compatibilité.
          </p>
          {compatibleOems.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Compatible avec : {compatibleOems.map((o) => o.brandName).join(', ')}
            </p>
          )}
        </div>
      )
    }

    // Si pas de compatibilité déclarée
    if (hasNoCompatibilityDeclared) {
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Compatibilité
          </h4>
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Ce skill n&apos;a pas déclaré sa compatibilité OEM.
          </p>
        </div>
      )
    }

    // Version détaillée pour la page single
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Compatibilité avec vos robots
        </h4>
        <div className="space-y-1">
          {userRobots.map((robot) => {
            const isCompatible = compatibleOems.some((oem) => oem.id === robot.oem.id)
            return (
              <div
                key={robot.id}
                className={`flex items-center justify-between text-sm p-2 rounded-md ${
                  isCompatible 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Bot className="h-3.5 w-3.5" />
                  {robot.name || robot.model.modelName}
                  <span className="text-muted-foreground text-xs">
                    ({robot.oem.brandName})
                  </span>
                </span>
                {isCompatible ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
              </div>
            )
          })}
        </div>
        {!hasCompatibleRobots && compatibleOems.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Ce skill est compatible avec : {compatibleOems.map((o) => o.brandName).join(', ')}
          </p>
        )}
      </div>
    )
  }

  // Version badge compact pour les cards

  // Déterminer le style et le contenu du badge
  let badgeClass = ''
  let badgeContent = ''
  let tooltipTitle = ''
  let tooltipContent: React.ReactNode = null

  if (userRobots.length === 0) {
    // Pas de robots enregistrés
    badgeClass = 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    badgeContent = 'Ajoutez un robot'
    tooltipTitle = 'Aucun robot enregistré'
    tooltipContent = compatibleOems.length > 0 
      ? <p className="text-xs">Compatible avec : {compatibleOems.map((o) => o.brandName).join(', ')}</p>
      : <p className="text-xs text-muted-foreground">Compatibilité non spécifiée</p>
  } else if (hasNoCompatibilityDeclared) {
    // Skill sans compatibilité déclarée
    badgeClass = 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    badgeContent = 'Non spécifié'
    tooltipTitle = 'Compatibilité non déclarée'
    tooltipContent = <p className="text-xs text-muted-foreground">Ce skill n&apos;a pas déclaré ses OEMs compatibles.</p>
  } else if (hasCompatibleRobots) {
    // Robots compatibles
    badgeClass = 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800'
    badgeContent = allRobotsCompatible 
      ? `${compatibleRobots.length} robot${compatibleRobots.length > 1 ? 's' : ''}`
      : `${compatibleRobots.length}/${userRobots.length}`
    tooltipTitle = 'Compatible avec vos robots :'
    tooltipContent = (
      <ul className="text-xs space-y-0.5">
        {compatibleRobots.map((robot) => (
          <li key={robot.id} className="flex items-center gap-1.5">
            <Check className="h-3 w-3 text-green-500" />
            {robot.name || robot.model.modelName}
          </li>
        ))}
      </ul>
    )
  } else {
    // Pas de robots compatibles
    badgeClass = 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800'
    badgeContent = 'Non compatible'
    tooltipTitle = 'Non compatible avec vos robots'
    tooltipContent = (
      <p className="text-xs text-muted-foreground">
        Compatible avec : {compatibleOems.map((o) => o.brandName).join(', ')}
      </p>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`cursor-default ${badgeClass}`}>
            <Bot className="h-3 w-3 mr-1" />
            <span>{badgeContent}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1.5">
            <p className="font-medium text-sm">{tooltipTitle}</p>
            {tooltipContent}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
