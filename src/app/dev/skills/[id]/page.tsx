import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  Package, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Edit,
  Plus,
  Image as ImageIcon,
  FileText,
  Send,
  Settings,
  Globe,
  Shield,
  FileCode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSkillDetail } from '@/server/submissions'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const skill = await getSkillDetail(id)
  return {
    title: skill ? `${skill.name} - Portail Développeur` : 'Skill non trouvé',
  }
}

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock },
  published: { label: 'Publié', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200', icon: CheckCircle },
  suspended: { label: 'Suspendu', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200', icon: XCircle },
}

const submissionStatusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  submitted: { label: 'Soumis', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
  platform_review: { label: 'Validation', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' },
  oem_review: { label: 'Review OEM', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
  approved: { label: 'Approuvé', className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
  rejected: { label: 'Rejeté', className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
  changes_requested: { label: 'Modifications', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' },
}

export default async function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const skill = await getSkillDetail(id)

  if (!skill) {
    notFound()
  }

  const status = statusConfig[skill.status]
  const StatusIcon = status.icon
  const screenshots = skill.assets.filter((a) => a.type === 'screenshot')

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-6xl">
        {/* Back Link */}
        <Link 
          href="/dev/skills" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour à mes skills
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
          {/* Icon */}
          <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {skill.iconPath ? (
              <img
                src={skill.iconPath}
                alt={skill.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="h-12 w-12 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{skill.name}</h1>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-3">
              {skill.shortDescription || 'Aucune description'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {skill.category && (
                <Badge variant="outline" className="capitalize">{skill.category}</Badge>
              )}
              <span>{skill.versions.length} version{skill.versions.length !== 1 ? 's' : ''}</span>
              <span>Créé le {new Date(skill.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" asChild>
              <Link href={`/skills/${skill.slug}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir public
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dev/skills/new?skillId=${skill.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle version
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <FileText className="h-4 w-4 hidden sm:block" />
              Vue d&apos;ensemble
            </TabsTrigger>
            <TabsTrigger value="listing" className="gap-2">
              <ImageIcon className="h-4 w-4 hidden sm:block" />
              Store Listing
            </TabsTrigger>
            <TabsTrigger value="versions" className="gap-2">
              <FileCode className="h-4 w-4 hidden sm:block" />
              Versions
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <Send className="h-4 w-4 hidden sm:block" />
              Soumissions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistiques</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">{skill.versions.length}</p>
                    <p className="text-sm text-muted-foreground">Versions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{skill.submissions.length}</p>
                    <p className="text-sm text-muted-foreground">Soumissions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{screenshots.length}</p>
                    <p className="text-sm text-muted-foreground">Screenshots</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Téléchargements</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Slug</span>
                    <code className="bg-muted px-2 py-0.5 rounded text-xs">{skill.slug}</code>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Éditeur</span>
                    <span>{skill.publisherName || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dernière version</span>
                    <span>{skill.versions[0]?.version || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mis à jour</span>
                    <span>{new Date(skill.updatedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                {skill.submissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Aucune activité récente
                  </p>
                ) : (
                  <div className="space-y-3">
                    {skill.submissions.slice(0, 5).map((sub) => {
                      const subStatus = submissionStatusConfig[sub.status] || submissionStatusConfig.draft
                      return (
                        <Link
                          key={sub.id}
                          href={`/dev/submissions/${sub.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <div>
                            <p className="font-medium">Soumission v{sub.version}</p>
                            <p className="text-xs text-muted-foreground">
                              {sub.targetOemName || 'Tous OEMs'} • {new Date(sub.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <Badge className={subStatus.className}>{subStatus.label}</Badge>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Store Listing Tab */}
          <TabsContent value="listing" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Description</CardTitle>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {skill.descriptionMd ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {skill.descriptionMd}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune description</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Screenshots ({screenshots.length})</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {screenshots.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Aucun screenshot. Ajoutez au moins 3 screenshots pour soumettre.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {screenshots.map((asset) => (
                      <div
                        key={asset.id}
                        className="aspect-video rounded-lg bg-muted overflow-hidden"
                      >
                        <img
                          src={asset.path}
                          alt={`Screenshot ${asset.sortOrder + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">URLs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>Support</span>
                  </div>
                  {skill.supportUrl ? (
                    <a href={skill.supportUrl} target="_blank" rel="noopener" className="text-primary hover:underline">
                      {skill.supportUrl}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Non défini</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Confidentialité</span>
                  </div>
                  {skill.privacyUrl ? (
                    <a href={skill.privacyUrl} target="_blank" rel="noopener" className="text-primary hover:underline">
                      {skill.privacyUrl}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Non défini</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Conditions</span>
                  </div>
                  {skill.termsUrl ? (
                    <a href={skill.termsUrl} target="_blank" rel="noopener" className="text-primary hover:underline">
                      {skill.termsUrl}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Non défini</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Versions Tab */}
          <TabsContent value="versions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Versions ({skill.versions.length})</h2>
              <Button asChild>
                <Link href={`/dev/skills/new?skillId=${skill.id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle version
                </Link>
              </Button>
            </div>

            {skill.versions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Aucune version</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Créez votre première version pour soumettre votre skill.
                  </p>
                  <Button asChild>
                    <Link href={`/dev/skills/new?skillId=${skill.id}`}>
                      Créer une version
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {skill.versions.map((version, index) => (
                  <Card key={version.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">v{version.version}</span>
                            {index === 0 && (
                              <Badge variant="outline" className="text-xs">Dernière</Badge>
                            )}
                            <Badge variant="outline" className="text-xs capitalize">
                              {version.visibility}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                version.riskLevel === 'high' 
                                  ? 'border-red-500 text-red-500' 
                                  : version.riskLevel === 'medium'
                                    ? 'border-orange-500 text-orange-500'
                                    : 'border-green-500 text-green-500'
                              }`}
                            >
                              Risque {version.riskLevel}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {version.releaseNotes || 'Pas de notes de version'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Créée le {new Date(version.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Détails
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Soumissions ({skill.submissions.length})</h2>
              {skill.versions.length > 0 && (
                <Button asChild>
                  <Link href={`/dev/skills/new?skillId=${skill.id}`}>
                    <Send className="h-4 w-4 mr-2" />
                    Nouvelle soumission
                  </Link>
                </Button>
              )}
            </div>

            {skill.submissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Aucune soumission</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Soumettez une version pour validation OEM.
                  </p>
                  {skill.versions.length > 0 ? (
                    <Button asChild>
                      <Link href={`/dev/skills/new?skillId=${skill.id}`}>
                        Soumettre une version
                      </Link>
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Créez d&apos;abord une version.
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {skill.submissions.map((sub) => {
                  const subStatus = submissionStatusConfig[sub.status] || submissionStatusConfig.draft
                  return (
                    <Card key={sub.id}>
                      <CardContent className="p-4">
                        <Link 
                          href={`/dev/submissions/${sub.id}`}
                          className="flex items-center justify-between hover:bg-accent -m-4 p-4 rounded-lg transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">v{sub.version}</span>
                              <Badge className={subStatus.className}>{subStatus.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {sub.targetOemName || 'Tous OEMs'} • Soumis le {new Date(sub.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
