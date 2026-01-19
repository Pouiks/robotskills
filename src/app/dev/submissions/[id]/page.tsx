import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  ExternalLink,
  FileText,
  Shield,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { getSubmissionDetail, submitForReview } from '@/server/submissions'
import { SubmissionTimeline } from '@/components/submissions/submission-timeline'
import { SubmitButton } from './submit-button'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const submission = await getSubmissionDetail(id)
  return {
    title: submission ? `${submission.skillName} - Soumission` : 'Soumission non trouvée',
  }
}

const statusConfig: Record<string, { label: string; color: string; description: string }> = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800', description: 'En attente de soumission' },
  submitted: { label: 'Soumis', color: 'bg-blue-100 text-blue-800', description: 'En cours de validation' },
  platform_review: { label: 'Validation', color: 'bg-purple-100 text-purple-800', description: 'Vérification automatique' },
  oem_review: { label: 'Review OEM', color: 'bg-yellow-100 text-yellow-800', description: 'En attente de décision OEM' },
  approved: { label: 'Approuvé', color: 'bg-green-100 text-green-800', description: 'Publié dans le store' },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800', description: 'Non approuvé' },
  changes_requested: { label: 'Modifications', color: 'bg-orange-100 text-orange-800', description: 'Corrections requises' },
}

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const submission = await getSubmissionDetail(id)

  if (!submission) {
    notFound()
  }

  const status = statusConfig[submission.status] || statusConfig.draft
  const canResubmit = submission.status === 'changes_requested'
  const canSubmit = submission.status === 'draft'
  const platformReviewResult = submission.platformReviewResult as {
    passed: boolean
    checks: { name: string; passed: boolean; message: string }[]
    timestamp: string
  } | null

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-5xl">
        {/* Back Link */}
        <Link 
          href="/dev/submissions" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour aux soumissions
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {submission.iconPath ? (
                <img
                  src={submission.iconPath}
                  alt={submission.skillName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{submission.skillName}</h1>
                <Badge variant="outline">v{submission.version}</Badge>
              </div>
              <Badge className={status.color}>{status.label}</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                {status.description}
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {canSubmit && (
              <SubmitButton submissionId={submission.id} action="submit" />
            )}
            {canResubmit && (
              <SubmitButton submissionId={submission.id} action="resubmit" />
            )}
            <Button variant="outline" asChild>
              <Link href={`/dev/skills/${submission.skillId}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir le skill
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Action Required Alert */}
            {submission.status === 'changes_requested' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Modifications requises</AlertTitle>
                <AlertDescription>
                  La validation automatique a échoué. Veuillez corriger les erreurs et soumettre à nouveau.
                </AlertDescription>
              </Alert>
            )}

            {/* Platform Review Results */}
            {platformReviewResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Résultat de la validation automatique
                  </CardTitle>
                  <CardDescription>
                    {platformReviewResult.passed 
                      ? 'Toutes les vérifications ont réussi' 
                      : `${platformReviewResult.checks.filter(c => !c.passed).length} problème(s) détecté(s)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {platformReviewResult.checks.map((check, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          check.passed 
                            ? 'bg-green-50 dark:bg-green-950/30' 
                            : 'bg-red-50 dark:bg-red-950/30'
                        }`}
                      >
                        {check.passed ? (
                          <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={`font-medium ${
                            check.passed ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                          }`}>
                            {check.name}
                          </p>
                          <p className={`text-sm ${
                            check.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                          }`}>
                            {check.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Validé le {new Date(platformReviewResult.timestamp).toLocaleString('fr-FR')}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Platform Notes */}
            {submission.platformReviewNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes de validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm font-sans bg-muted p-4 rounded-lg">
                    {submission.platformReviewNotes}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* OEM Notes */}
            {submission.oemReviewNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Notes de l&apos;OEM
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{submission.oemReviewNotes}</p>
                  {submission.oemReviewedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Examiné le {new Date(submission.oemReviewedAt).toLocaleString('fr-FR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Version Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails de la version</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-medium">v{submission.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Niveau de risque</p>
                    <Badge 
                      variant="outline"
                      className={`capitalize ${
                        submission.riskLevel === 'high' 
                          ? 'border-red-500 text-red-600'
                          : submission.riskLevel === 'medium'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-green-500 text-green-600'
                      }`}
                    >
                      {submission.riskLevel}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Permissions</p>
                    <p className="font-medium">
                      {submission.permissionsRequested?.length || 0} permission(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">OEM cible</p>
                    <p className="font-medium">{submission.targetOemName || 'Tous'}</p>
                  </div>
                </div>

                {submission.releaseNotes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Notes de version</p>
                      <p className="text-sm whitespace-pre-wrap">{submission.releaseNotes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Timeline */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <SubmissionTimeline
                  currentStatus={submission.status}
                  createdAt={submission.createdAt}
                  platformReviewAt={submission.platformReviewAt ?? undefined}
                  oemReviewedAt={submission.oemReviewedAt ?? undefined}
                />
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Soumis par</span>
                  <span>{submission.submitterName || 'Vous'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Créé le</span>
                  <span>{new Date(submission.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mis à jour</span>
                  <span>{new Date(submission.updatedAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{submission.id.slice(0, 8)}</code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
