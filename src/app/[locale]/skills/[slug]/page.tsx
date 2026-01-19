import { notFound } from 'next/navigation'
import Image from 'next/image'
import {
  Download,
  Star,
  Shield,
  Calendar,
  User,
  Tag,
  ChevronLeft,
  AlertTriangle,
  Euro,
} from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'
import { getSkillBySlug } from '@/server/skills'
import { getMe } from '@/server/auth'
import { getUserRobots } from '@/server/robots'
import { checkPurchase } from '@/server/downloads'
import { SkillDownloadCard } from '@/components/skills/skill-download-card'
import { CompatibilityBadge } from '@/components/skills/compatibility-badge'

interface SkillPageProps {
  params: Promise<{
    slug: string
    locale: string
  }>
}

export async function generateMetadata({ params }: SkillPageProps) {
  const { slug } = await params
  const locale = await getLocale()
  const skill = await getSkillBySlug(slug)

  if (!skill) {
    return { title: locale === 'en' ? 'Skill not found' : 'Skill non trouvé' }
  }

  // Utiliser le nom traduit pour les métadonnées
  const name = locale === 'en' && skill.nameEn ? skill.nameEn : skill.name
  const description =
    locale === 'en' && skill.shortDescriptionEn
      ? skill.shortDescriptionEn
      : skill.shortDescription

  return {
    title: name,
    description:
      description ?? (locale === 'en' ? `Discover ${name} on RobotSkills` : `Découvrez ${name} sur RobotSkills`),
  }
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { slug } = await params
  const locale = await getLocale()
  const t = await getTranslations('skills')
  const tStore = await getTranslations('store')

  const [skill, user] = await Promise.all([getSkillBySlug(slug), getMe()])

  if (!skill) {
    notFound()
  }

  // Récupérer les robots et l'état d'achat de l'utilisateur
  const [userRobots, purchaseState] = await Promise.all([
    user ? getUserRobots() : Promise.resolve([]),
    user ? checkPurchase(skill.id) : Promise.resolve({ purchased: false, downloadedVersions: [] }),
  ])

  // Sélectionner le contenu selon la locale
  const name = locale === 'en' && skill.nameEn ? skill.nameEn : skill.name
  const shortDescription =
    locale === 'en' && skill.shortDescriptionEn ? skill.shortDescriptionEn : skill.shortDescription
  const descriptionMd =
    locale === 'en' && skill.descriptionMdEn ? skill.descriptionMdEn : skill.descriptionMd

  const screenshots = skill.assets.filter((a) => a.type === 'screenshot')
  const riskColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  }

  const riskLabels = {
    low: locale === 'en' ? 'Low risk' : 'Risque faible',
    medium: locale === 'en' ? 'Medium risk' : 'Risque moyen',
    high: locale === 'en' ? 'High risk' : 'Risque élevé',
  }

  function formatPrice(priceCents: number): string {
    if (priceCents === 0) return t('free')
    return `${(priceCents / 100).toFixed(2).replace('.', ',')} €`
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Back button */}
        <Link
          href="/store"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {locale === 'en' ? 'Back to Store' : 'Retour au Store'}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {skill.iconPath ? (
                  <Image
                    src={skill.iconPath}
                    alt={name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <div className="text-4xl font-bold text-muted-foreground">{name.charAt(0)}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl font-bold mb-2">{name}</h1>
                  <span
                    className={`text-2xl font-bold shrink-0 ${skill.isFree ? 'text-green-600 dark:text-green-400' : 'text-primary'}`}
                  >
                    {formatPrice(skill.priceCents)}
                  </span>
                </div>
                <p className="text-muted-foreground mb-3">{shortDescription}</p>
                <div className="flex flex-wrap items-center gap-3">
                  {skill.category && (
                    <Badge variant="secondary" className="capitalize">
                      <Tag className="h-3 w-3 mr-1" />
                      {skill.category}
                    </Badge>
                  )}
                  {skill.isFree ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    >
                      {t('free')}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                    >
                      <Euro className="h-3 w-3 mr-1" />
                      {locale === 'en' ? 'Paid' : 'Payant'}
                    </Badge>
                  )}
                  {skill.latestVersion && (
                    <Badge variant="outline" className={riskColors[skill.latestVersion.riskLevel]}>
                      <Shield className="h-3 w-3 mr-1" />
                      {riskLabels[skill.latestVersion.riskLevel]}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Screenshots */}
            {screenshots.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">
                  {locale === 'en' ? 'Screenshots' : "Captures d'écran"}
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {screenshots.map((screenshot) => (
                    <div
                      key={screenshot.id}
                      className="shrink-0 w-64 h-40 rounded-lg bg-muted overflow-hidden"
                    >
                      <Image
                        src={screenshot.path}
                        alt="Screenshot"
                        width={256}
                        height={160}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="description">
              <TabsList>
                <TabsTrigger value="description">{t('description')}</TabsTrigger>
                <TabsTrigger value="changelog">{t('changelog')}</TabsTrigger>
                <TabsTrigger value="permissions">
                  {locale === 'en' ? 'Permissions' : 'Permissions'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="prose dark:prose-invert max-w-none mt-6">
                {descriptionMd ? (
                  <div dangerouslySetInnerHTML={{ __html: descriptionMd }} />
                ) : (
                  <p className="text-muted-foreground">
                    {locale === 'en' ? 'No description available.' : 'Aucune description disponible.'}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="changelog" className="mt-6">
                {skill.latestVersion?.releaseNotes ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge>v{skill.latestVersion.version}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {locale === 'en' ? 'Latest version' : 'Dernière version'}
                      </span>
                    </div>
                    <p className="text-sm">{skill.latestVersion.releaseNotes}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {locale === 'en' ? 'No changelog available.' : 'Aucun changelog disponible.'}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="permissions" className="mt-6">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium mb-1">
                        {locale === 'en' ? 'Required permissions' : 'Permissions requises'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {locale === 'en'
                          ? 'Detailed permissions will be displayed here once the manifest is loaded.'
                          : 'Les permissions détaillées seront affichées ici une fois le manifest chargé.'}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <SkillDownloadCard
              skill={skill}
              user={user}
              userRobots={userRobots}
              isPurchased={purchaseState.purchased}
            />

            {/* Compatibility Card */}
            {userRobots.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <CompatibilityBadge
                    compatibleOems={skill.compatibleOems}
                    userRobots={userRobots}
                    showDetails
                  />
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {locale === 'en' ? 'Information' : 'Informations'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {locale === 'en' ? 'Developer' : 'Développeur'}
                  </span>
                  <span className="font-medium">
                    {skill.ownerName ?? (locale === 'en' ? 'Anonymous' : 'Anonyme')}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {t('downloads')}
                  </span>
                  <span className="font-medium">{skill.downloadCount}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {locale === 'en' ? 'Published on' : 'Publié le'}
                  </span>
                  <span className="font-medium">
                    {new Date(skill.createdAt).toLocaleDateString(
                      locale === 'en' ? 'en-US' : 'fr-FR'
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    {t('rating')}
                  </span>
                  <span className="font-medium">- / 5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
