'use client'

import { Check, X, Package, Shield, Building2, FileCode, Image as ImageIcon, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { WizardData } from '../skill-wizard'

interface StepReviewProps {
  data: WizardData
}

export function StepReview({ data }: StepReviewProps) {
  const isComplete =
    data.identity !== null &&
    data.assets !== null &&
    data.compatibility !== null &&
    data.permissions !== null &&
    data.package !== null

  // Check for high-risk items that need attention
  const hasHighRiskPermissions = data.permissions?.permissions.some(
    p => ['manipulation', 'emergency'].includes(p.name)
  ) ?? false
  
  const hasNetworkPermission = data.permissions?.permissions.some(p => p.name === 'network') ?? false
  const hasEndpoints = (data.permissions?.dataUsage?.endpoints?.length ?? 0) > 0
  const networkWarning = hasNetworkPermission && !hasEndpoints

  const sections = [
    {
      title: 'Identité',
      icon: Package,
      complete: data.identity !== null,
      items: data.identity
        ? [
            { label: 'Nom', value: data.identity.name },
            { label: 'Slug', value: data.identity.slug },
            { label: 'Catégorie', value: data.identity.category },
            { label: 'Éditeur', value: data.identity.publisherName },
            { label: 'Description', value: data.identity.shortDescription?.substring(0, 50) + '...' },
          ]
        : [],
    },
    {
      title: 'Médias',
      icon: ImageIcon,
      complete: data.assets !== null,
      items: data.assets
        ? [
            { label: 'Icône', value: data.assets.iconPath ? '✓ Présente' : '✗ Manquante', ok: !!data.assets.iconPath },
            { label: 'Screenshots', value: `${data.assets.screenshots.length}/3 minimum`, ok: data.assets.screenshots.length >= 3 },
            { label: 'Vidéo', value: data.assets.videoUrl ? '✓ Ajoutée' : 'Aucune (optionnel)', ok: true },
          ]
        : [],
    },
    {
      title: 'Compatibilité',
      icon: Building2,
      complete: data.compatibility !== null,
      items: data.compatibility
        ? [
            { 
              label: 'OEMs compatibles', 
              value: `${data.compatibility.targetOemIds?.length || 1} constructeur(s)`,
              ok: (data.compatibility.targetOemIds?.length || 0) > 0 || !!data.compatibility.targetOemId
            },
            { 
              label: 'Firmware min', 
              value: data.compatibility.minFirmwareVersion || 'Toutes versions',
              ok: true
            },
          ]
        : [],
    },
    {
      title: 'Permissions & Données',
      icon: Shield,
      complete: data.permissions !== null,
      items: data.permissions
        ? [
            { 
              label: 'Permissions', 
              value: `${data.permissions.permissions.length} permission(s)`,
              ok: true
            },
            { 
              label: 'Haut risque', 
              value: hasHighRiskPermissions ? '⚠️ Oui' : 'Non',
              ok: !hasHighRiskPermissions
            },
            { 
              label: 'Collecte données', 
              value: data.permissions.dataUsage.collectsData ? 'Oui (déclarée)' : 'Non',
              ok: true
            },
            ...(hasNetworkPermission ? [{
              label: 'Endpoints réseau',
              value: hasEndpoints ? `${data.permissions.dataUsage?.endpoints?.length} déclaré(s)` : '✗ Non déclarés',
              ok: hasEndpoints
            }] : [])
          ]
        : [],
    },
    {
      title: 'Package & Version',
      icon: FileCode,
      complete: data.package !== null,
      items: data.package
        ? [
            { label: 'Version', value: `v${data.package.version}`, ok: true },
            { 
              label: 'Niveau de risque', 
              value: data.package.riskLevel,
              ok: data.package.riskLevel !== 'high'
            },
            { 
              label: 'Package', 
              value: data.package.packagePath ? '✓ Uploadé' : '✗ Manquant',
              ok: !!data.package.packagePath
            },
            { 
              label: 'Checksum', 
              value: data.package.packageChecksum ? '✓ Calculé' : '✗ Manquant',
              ok: !!data.package.packageChecksum
            },
          ]
        : [],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Récapitulatif & Soumission</h2>
        <p className="text-sm text-muted-foreground">
          Vérifiez les informations avant de soumettre votre skill pour validation.
        </p>
      </div>

      {/* App Store Preview */}
      {data.identity && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Aperçu Store</p>
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                {data.assets?.iconPath ? (
                  <img src={data.assets.iconPath} alt="Icon" className="w-full h-full object-cover" />
                ) : (
                  <Package className="h-10 w-10 text-primary/60" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{data.identity.name}</h3>
                  <Badge variant="outline" className="text-xs">v{data.package?.version || '1.0.0'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {data.identity.shortDescription}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{data.identity.publisherName}</span>
                  <span>•</span>
                  <Badge variant="outline" className="capitalize text-xs">{data.identity.category}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Banner */}
      <div
        className={`rounded-lg p-4 ${
          isComplete
            ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800'
        }`}
      >
        <div className="flex items-center gap-3">
          {isComplete ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Prêt pour soumission
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Toutes les informations requises sont renseignées.
                </p>
              </div>
            </>
          ) : (
            <>
              <X className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Informations incomplètes
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Complétez toutes les étapes pour pouvoir soumettre.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Warnings */}
      {(hasHighRiskPermissions || networkWarning) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Points d&apos;attention</AlertTitle>
          <AlertDescription className="text-sm space-y-1">
            {hasHighRiskPermissions && (
              <p>• Permissions à haut risque demandées - nécessite une justification détaillée</p>
            )}
            {networkWarning && (
              <p>• Permission réseau sans endpoints déclarés - risque de rejet</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={section.title} className="rounded-lg border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                section.complete ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <section.icon className={`h-4 w-4 ${
                  section.complete ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                }`} />
              </div>
              <h3 className="font-medium flex-1">{section.title}</h3>
              {section.complete ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-gray-400" />
              )}
            </div>
            {section.complete ? (
              <div className="grid gap-2 ml-11">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={`font-medium ${
                      'ok' in item && !item.ok ? 'text-orange-600 dark:text-orange-400' : ''
                    }`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground ml-11">
                Retournez à cette étape pour la compléter.
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Submission Process */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-4">Processus de validation</h4>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">1</div>
              <div className="w-0.5 h-8 bg-border" />
            </div>
            <div className="pb-6">
              <p className="font-medium">Validation automatique</p>
              <p className="text-sm text-muted-foreground">Vérification du manifest, package, permissions</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">2</div>
              <div className="w-0.5 h-8 bg-border" />
            </div>
            <div className="pb-6">
              <p className="font-medium">Review OEM</p>
              <p className="text-sm text-muted-foreground">Examen par le constructeur ciblé</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">3</div>
            </div>
            <div>
              <p className="font-medium">Publication</p>
              <p className="text-sm text-muted-foreground">Disponible dans le store après approbation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
