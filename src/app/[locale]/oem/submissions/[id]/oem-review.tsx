'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Package,
  Shield,
  FileCode,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Clock,
  User,
  Calendar,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { SubmissionDetail } from '@/server/submissions'
import { makeOemDecision } from '@/server/submissions'

interface OemSubmissionReviewProps {
  submission: SubmissionDetail
  canReview: boolean
}

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800', icon: Clock },
  submitted: { label: 'Soumis', color: 'bg-blue-100 text-blue-800', icon: Clock },
  platform_review: { label: 'Validation auto', color: 'bg-purple-100 text-purple-800', icon: Clock },
  oem_review: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approuvé', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800', icon: XCircle },
  changes_requested: { label: 'Modifications', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
}

const riskLevelConfig = {
  low: { label: 'Faible', color: 'text-green-600 bg-green-100' },
  medium: { label: 'Moyen', color: 'text-yellow-600 bg-yellow-100' },
  high: { label: 'Élevé', color: 'text-red-600 bg-red-100' },
}

export function OemSubmissionReview({ submission, canReview }: OemSubmissionReviewProps) {
  const router = useRouter()
  const [showDecisionDialog, setShowDecisionDialog] = useState(false)
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'changes_requested' | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const status = statusConfig[submission.status]
  const StatusIcon = status.icon
  const riskLevel = riskLevelConfig[submission.riskLevel as keyof typeof riskLevelConfig]

  const handleDecision = async () => {
    if (!decision) return

    if (decision !== 'approved' && notes.length < 10) {
      toast.error('Veuillez fournir un commentaire (min 10 caractères)')
      return
    }

    setIsSubmitting(true)
    
    // Type-safe decision object based on decision type
    let decisionPayload: Parameters<typeof makeOemDecision>[0]
    if (decision === 'approved') {
      decisionPayload = { submissionId: submission.id, decision: 'approved', notes: notes || undefined }
    } else if (decision === 'rejected') {
      decisionPayload = { submissionId: submission.id, decision: 'rejected', notes }
    } else {
      decisionPayload = { submissionId: submission.id, decision: 'changes_requested', notes }
    }
    
    const result = await makeOemDecision(decisionPayload)
    setIsSubmitting(false)

    if (result.success) {
      toast.success(
        decision === 'approved'
          ? 'Skill approuvé ! Il sera bientôt disponible dans le store.'
          : decision === 'rejected'
            ? 'Skill rejeté.'
            : 'Modifications demandées au développeur.'
      )
      setShowDecisionDialog(false)
      router.push('/oem')
      router.refresh()
    } else {
      toast.error(result.error || 'Erreur lors de la décision')
    }
  }

  const openDecisionDialog = (type: 'approved' | 'rejected' | 'changes_requested') => {
    setDecision(type)
    setNotes('')
    setShowDecisionDialog(true)
  }

  return (
    <>
      {/* Back button */}
      <Link
        href="/oem"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Retour au portail OEM
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center">
            {submission.iconPath ? (
              <img
                src={submission.iconPath}
                alt={submission.skillName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Package className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{submission.skillName}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline">v{submission.version}</Badge>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
              <Badge className={riskLevel.color}>Risque {riskLevel.label}</Badge>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {canReview && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => openDecisionDialog('changes_requested')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Demander modifs
            </Button>
            <Button
              variant="destructive"
              onClick={() => openDecisionDialog('rejected')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button onClick={() => openDecisionDialog('approved')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approuver
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{submission.shortDescription}</p>
              {submission.descriptionMd && (
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <div dangerouslySetInnerHTML={{ __html: submission.descriptionMd }} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissions demandées ({submission.permissionsRequested.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submission.permissionsRequested.length === 0 ? (
                <p className="text-muted-foreground">Aucune permission requise</p>
              ) : (
                <div className="space-y-4">
                  {submission.permissionsRequested.map((perm) => (
                    <div key={perm} className="p-3 rounded-lg bg-muted">
                      <div className="font-medium capitalize">{perm}</div>
                      {submission.permissionsJustification[perm] && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {submission.permissionsJustification[perm]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Utilisation des données
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Collecte de données</span>
                  <Badge variant={(submission.dataUsage as { collects_data?: boolean })?.collects_data ? 'destructive' : 'secondary'}>
                    {(submission.dataUsage as { collects_data?: boolean })?.collects_data ? 'Oui' : 'Non'}
                  </Badge>
                </div>
                {(submission.dataUsage as { collects_data?: boolean })?.collects_data && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Types de données</span>
                      <span className="text-sm">
                        {Array.isArray((submission.dataUsage as { data_types?: string[] })?.data_types) 
                          ? ((submission.dataUsage as { data_types: string[] }).data_types).join(', ') 
                          : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rétention</span>
                      <span className="text-sm">
                        {(submission.dataUsage as { retention_days?: number })?.retention_days
                          ? `${(submission.dataUsage as { retention_days: number }).retention_days} jours`
                          : 'Non spécifié'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Partage avec tiers</span>
                      <Badge
                        variant={(submission.dataUsage as { shares_with_third_parties?: boolean })?.shares_with_third_parties ? 'destructive' : 'secondary'}
                      >
                        {(submission.dataUsage as { shares_with_third_parties?: boolean })?.shares_with_third_parties ? 'Oui' : 'Non'}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Manifest */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                Manifest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-sm font-mono">
                {JSON.stringify(submission.manifest, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Platform Review Result */}
          {submission.platformReviewResult && (
            <Card>
              <CardHeader>
                <CardTitle>Résultat validation automatique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {submission.platformReviewResult.checks.map((check, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {check.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-muted-foreground">{check.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Développeur
                </span>
                <span className="font-medium">{submission.submitterName || 'Anonyme'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Soumis le
                </span>
                <span className="font-medium">
                  {new Date(submission.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Taille package
                </span>
                <span className="font-medium">
                  {submission.packageSize
                    ? `${(submission.packageSize / 1024 / 1024).toFixed(2)} MB`
                    : '-'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Download Package */}
          <Card>
            <CardHeader>
              <CardTitle>Package</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Télécharger le package
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Téléchargez pour tester sur vos robots
              </p>
            </CardContent>
          </Card>

          {/* Release Notes */}
          {submission.releaseNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes de version</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{submission.releaseNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision === 'approved' && 'Approuver ce skill'}
              {decision === 'rejected' && 'Rejeter ce skill'}
              {decision === 'changes_requested' && 'Demander des modifications'}
            </DialogTitle>
            <DialogDescription>
              {decision === 'approved' &&
                'Le skill sera publié dans le store après approbation.'}
              {decision === 'rejected' &&
                'Le développeur sera notifié du rejet. Un commentaire est obligatoire.'}
              {decision === 'changes_requested' &&
                'Le développeur pourra modifier et resoumettre. Un commentaire est obligatoire.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="notes">
              Commentaire{decision !== 'approved' && ' (obligatoire)'}
            </Label>
            <Textarea
              id="notes"
              placeholder={
                decision === 'approved'
                  ? 'Commentaire optionnel...'
                  : 'Expliquez les raisons de votre décision...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-2"
            />
            {decision !== 'approved' && notes.length > 0 && notes.length < 10 && (
              <p className="text-sm text-red-500 mt-1">Minimum 10 caractères requis</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDecisionDialog(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              variant={decision === 'rejected' ? 'destructive' : 'default'}
              onClick={handleDecision}
              disabled={isSubmitting || (decision !== 'approved' && notes.length < 10)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  {decision === 'approved' && <CheckCircle className="h-4 w-4 mr-2" />}
                  {decision === 'rejected' && <XCircle className="h-4 w-4 mr-2" />}
                  {decision === 'changes_requested' && <AlertTriangle className="h-4 w-4 mr-2" />}
                  Confirmer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
