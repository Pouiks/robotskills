'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, CreditCard, Bot, Check, Loader2, AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import type { SkillWithDetails, CurrentUser } from '@/types'
import type { UserRobot } from '@/server/robots'
import { simulatePurchase, downloadSkill } from '@/server/downloads'

interface SkillDownloadCardProps {
  skill: SkillWithDetails
  user: CurrentUser | null
  userRobots: UserRobot[]
  isPurchased: boolean
}

function formatPrice(priceCents: number): string {
  if (priceCents === 0) return 'Gratuit'
  return `${(priceCents / 100).toFixed(2).replace('.', ',')} €`
}

export function SkillDownloadCard({ skill, user, userRobots, isPurchased }: SkillDownloadCardProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [selectedRobot, setSelectedRobot] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Robots appairés
  const pairedRobots = userRobots.filter((r) => r.status === 'paired')
  
  // Robots compatibles = appairés ET dont l'OEM est dans la liste de compatibilité du skill
  const skillOemIds = (skill.compatibleOems ?? []).map((oem) => oem.id)
  const hasNoCompatibilityDeclared = skillOemIds.length === 0
  const compatibleRobots = pairedRobots.filter((robot) => skillOemIds.includes(robot.oem.id))
  
  const hasCompatibleRobots = compatibleRobots.length > 0
  const hasPairedButIncompatible = pairedRobots.length > 0 && !hasCompatibleRobots && !hasNoCompatibilityDeclared
  const canDownload = skill.isFree || isPurchased || paymentSuccess

  const handleDownloadClick = () => {
    if (!user) return

    // Si l'utilisateur n'a pas de robots compatibles
    if (!hasCompatibleRobots) {
      toast.error('Vous devez d\'abord ajouter et appairer un robot', {
        action: {
          label: 'Ajouter',
          onClick: () => (window.location.href = '/dashboard/robots/new'),
        },
      })
      return
    }

    // Si payant et non acheté
    if (!skill.isFree && !isPurchased && !paymentSuccess) {
      setShowPaymentDialog(true)
      return
    }

    // Montrer le dialog de sélection de robot
    setShowDownloadDialog(true)
  }

  const handlePayment = async () => {
    if (!skill.latestVersion) return

    setIsProcessing(true)
    try {
      const result = await simulatePurchase(skill.id, skill.latestVersion.id, skill.priceCents)

      if (result.success) {
        setPaymentSuccess(true)
        toast.success('Paiement effectué avec succès !', {
          description: `Transaction: ${result.transactionId}`,
        })
        setShowPaymentDialog(false)
        // Ouvrir automatiquement le dialog de téléchargement
        setShowDownloadDialog(true)
      } else {
        toast.error(result.error || 'Erreur lors du paiement')
      }
    } catch {
      toast.error('Erreur lors du paiement')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (!skill.latestVersion || !selectedRobot) return

    setIsProcessing(true)
    try {
      const result = await downloadSkill(skill.latestVersion.id, selectedRobot)

      if (result.success) {
        toast.success('Skill installé avec succès !', {
          description: 'Le skill est maintenant disponible sur votre robot.',
        })
        setShowDownloadDialog(false)
        setSelectedRobot('')
      } else if (result.paymentRequired) {
        setShowDownloadDialog(false)
        setShowPaymentDialog(true)
      } else {
        toast.error(result.error || 'Erreur lors du téléchargement')
      }
    } catch {
      toast.error('Erreur lors du téléchargement')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Télécharger</span>
            <span
              className={`text-xl font-bold ${skill.isFree ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}
            >
              {formatPrice(skill.priceCents)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {skill.latestVersion ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">{skill.latestVersion.version}</span>
              </div>

              {/* Statut d'achat */}
              {!skill.isFree && (isPurchased || paymentSuccess) && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-600">Déjà acheté</AlertTitle>
                  <AlertDescription className="text-green-600/80">
                    Vous pouvez télécharger ce skill sur tous vos robots.
                  </AlertDescription>
                </Alert>
              )}

              {/* Bouton d'action */}
              {user ? (
                <Button className="w-full" size="lg" onClick={handleDownloadClick}>
                  {!skill.isFree && !isPurchased && !paymentSuccess ? (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Acheter {formatPrice(skill.priceCents)}
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Installer sur un robot
                    </>
                  )}
                </Button>
              ) : (
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/login?redirect=/skills/${skill.slug}`}>
                    Connectez-vous pour télécharger
                  </Link>
                </Button>
              )}

              {/* Info robots - Aucun robot appairé */}
              {user && pairedRobots.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Aucun robot appairé</AlertTitle>
                  <AlertDescription>
                    <Link href="/dashboard/robots/new" className="underline">
                      Ajoutez un robot
                    </Link>{' '}
                    pour pouvoir installer des skills.
                  </AlertDescription>
                </Alert>
              )}

              {/* Info robots - Compatibilité non déclarée */}
              {user && pairedRobots.length > 0 && hasNoCompatibilityDeclared && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Compatibilité non spécifiée</AlertTitle>
                  <AlertDescription>
                    Ce skill n&apos;a pas déclaré ses OEMs compatibles.
                  </AlertDescription>
                </Alert>
              )}

              {/* Info robots - Robots incompatibles */}
              {user && hasPairedButIncompatible && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Non compatible</AlertTitle>
                  <AlertDescription>
                    Ce skill n&apos;est pas compatible avec vos robots.
                    {skill.compatibleOems && skill.compatibleOems.length > 0 && (
                      <span className="block mt-1 text-xs">
                        Compatible avec : {skill.compatibleOems.map((o) => o.brandName).join(', ')}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Compatibilité */}
              {user && hasCompatibleRobots && (
                <div className="text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bot className="h-4 w-4" />
                    {compatibleRobots.length} robot{compatibleRobots.length > 1 ? 's' : ''} compatible
                    {compatibleRobots.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune version disponible</p>
          )}
        </CardContent>
      </Card>

      {/* Dialog de paiement */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l&apos;achat</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d&apos;acheter <strong>{skill.name}</strong> pour{' '}
              <strong>{formatPrice(skill.priceCents)}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span>{skill.name}</span>
                <span className="font-medium">{formatPrice(skill.priceCents)}</span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(skill.priceCents)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Ceci est une simulation de paiement. Aucune transaction réelle ne sera effectuée.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)} disabled={isProcessing}>
              Annuler
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payer {formatPrice(skill.priceCents)}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de sélection de robot */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choisir un robot</DialogTitle>
            <DialogDescription>
              Sélectionnez le robot sur lequel installer <strong>{skill.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Select value={selectedRobot} onValueChange={setSelectedRobot}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un robot" />
              </SelectTrigger>
              <SelectContent>
                {compatibleRobots.map((robot) => (
                  <SelectItem key={robot.id} value={robot.id}>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span>{robot.name || robot.serialNumber}</span>
                      <span className="text-muted-foreground text-xs">
                        ({robot.oem.brandName} {robot.model.modelName})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedRobot && (
              <div className="mt-4 rounded-lg border p-3">
                {(() => {
                  const robot = compatibleRobots.find((r) => r.id === selectedRobot)
                  if (!robot) return null
                  return (
                    <div className="text-sm">
                      <div className="font-medium">{robot.name || 'Robot sans nom'}</div>
                      <div className="text-muted-foreground">
                        {robot.oem.brandName} {robot.model.modelName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        N° série: {robot.serialNumber}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDownloadDialog(false)
                setSelectedRobot('')
              }}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button onClick={handleDownload} disabled={isProcessing || !selectedRobot}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Installation...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Installer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
