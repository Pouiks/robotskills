import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getMe } from '@/server/auth'
import { getOemSubmissions } from '@/server/submissions'

export const metadata = {
  title: 'Portail OEM',
}

const statusConfig = {
  oem_review: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: Clock,
  },
  approved: {
    label: 'Approuvé',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Rejeté',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: XCircle,
  },
  changes_requested: {
    label: 'Modifications',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    icon: AlertTriangle,
  },
}

export default async function OemPortalPage() {
  const user = await getMe()

  if (!user) {
    redirect('/login?redirect=/oem')
  }

  // Vérifier si l'utilisateur est membre d'une organisation OEM
  const oemOrg = user.organizations.find((o) => o.orgType === 'oem')

  if (!oemOrg) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Accès Restreint</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Cette section est réservée aux partenaires constructeurs (OEM).
                  Si vous êtes un constructeur, contactez-nous pour créer votre
                  compte partenaire.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contact">Nous contacter</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Get real submissions
  const submissions = await getOemSubmissions(oemOrg.orgId)

  // Calculate stats
  const pendingCount = submissions.filter((s) => s.status === 'oem_review').length
  const approvedCount = submissions.filter((s) => s.status === 'approved').length
  const rejectedCount = submissions.filter(
    (s) => s.status === 'rejected' || s.status === 'changes_requested'
  ).length

  const stats = [
    { label: 'En attente de review', value: pendingCount, icon: Clock, color: 'text-yellow-500' },
    { label: 'Approuvés', value: approvedCount, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Rejetés/Modifications', value: rejectedCount, icon: XCircle, color: 'text-red-500' },
  ]

  const pendingSubmissions = submissions.filter((s) => s.status === 'oem_review')

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{oemOrg.orgName}</h1>
              <p className="text-muted-foreground">Portail Partenaire OEM</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Submissions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Soumissions à Reviewer ({pendingCount})
            </CardTitle>
            <CardDescription>
              Les skills en attente de votre validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune soumission en attente de review.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{submission.skillName}</h4>
                        <Badge variant="outline">v{submission.version}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Soumis le{' '}
                        {new Date(submission.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Button asChild>
                      <Link href={`/oem/submissions/${submission.id}`}>
                        Reviewer
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* History */}
        {submissions.filter((s) => s.status !== 'oem_review').length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
              <CardDescription>
                Soumissions traitées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions
                  .filter((s) => s.status !== 'oem_review')
                  .map((submission) => {
                    const config = statusConfig[submission.status as keyof typeof statusConfig]
                    if (!config) return null
                    const StatusIcon = config.icon

                    return (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${config.color}`}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="font-medium">{submission.skillName}</h4>
                              <Badge variant="outline">v{submission.version}</Badge>
                              <Badge className={config.color}>{config.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(submission.updatedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/oem/submissions/${submission.id}`}>
                            Voir
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
