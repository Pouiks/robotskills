import { Plus, Package, Send, ArrowRight, TrendingUp, Download, Users } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { getDevSkills, getDevSubmissions } from '@/server/submissions'

export async function generateMetadata() {
  const t = await getTranslations('dev')
  return {
    title: t('title'),
  }
}

export default async function DevPortalPage() {
  const t = await getTranslations('dev')

  // Layout already checks for license, so we're guaranteed to be a valid developer here
  const [skills, submissions] = await Promise.all([getDevSkills(), getDevSubmissions()])

  const publishedCount = skills.filter((s) => s.status === 'published').length
  const pendingSubmissions = submissions.filter((s) =>
    ['submitted', 'platform_review', 'oem_review'].includes(s.status)
  ).length

  const stats = [
    {
      label: t('publishedSkills'),
      value: publishedCount,
      icon: Package,
      trend: skills.length > 0 ? `${skills.length} ${t('total')}` : undefined,
    },
    {
      label: t('downloads'),
      value: 0,
      icon: Download,
      trend: t('thisMonth'),
    },
    {
      label: t('pending'),
      value: pendingSubmissions,
      icon: Send,
      trend: submissions.length > 0 ? `${submissions.length} ${t('total')}` : undefined,
    },
  ]

  const recentSkills = skills.slice(0, 3)
  const recentSubmissions = submissions.slice(0, 3)

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-muted-foreground">{t('manageSkills')}</p>
          </div>
          <Button asChild>
            <Link href="/dev/skills/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('newSkill')}
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                {stat.trend && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links / Recent Items */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Skills */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t('mySkills')}
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dev/skills">
                    {t('viewAll')}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentSkills.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">{t('noSkillYet')}</p>
                  <Button size="sm" asChild>
                    <Link href="/dev/skills/new">
                      <Plus className="h-4 w-4 mr-1" />
                      {t('createFirstSkill')}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSkills.map((skill) => (
                    <Link
                      key={skill.id}
                      href={`/dev/skills/${skill.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium">{skill.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {skill.category} • v{skill.latestVersion || '0.0.0'}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          skill.status === 'published'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                        }`}
                      >
                        {skill.status === 'published' ? t('status.published') : t('status.draft')}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  {t('recentSubmissions')}
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dev/submissions">
                    {t('viewAll')}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentSubmissions.length === 0 ? (
                <div className="text-center py-6">
                  <Send className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">{t('noSubmission')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSubmissions.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/dev/submissions/${sub.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium">{sub.skillName}</p>
                        <p className="text-xs text-muted-foreground">
                          v{sub.version} • {sub.targetOemName || 'Tous OEMs'}
                        </p>
                      </div>
                      <SubmissionStatusBadge status={sub.status} t={t} />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide for new devs */}
        {skills.length === 0 && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
            <CardContent className="py-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{t('welcomeDeveloper')}</h3>
                  <p className="text-muted-foreground mb-4">{t('welcomeDevDesc')}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href="/dev/skills/new">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('createFirstSkill')}
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/docs/getting-started">{t('readDocs')}</Link>
                    </Button>
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center w-32 h-32 rounded-full bg-primary/10">
                  <Users className="h-16 w-16 text-primary/60" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function SubmissionStatusBadge({
  status,
  t,
}: {
  status: string
  t: (key: string) => string
}) {
  const config: Record<string, { labelKey: string; className: string }> = {
    draft: {
      labelKey: 'status.draft',
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    },
    submitted: {
      labelKey: 'status.submitted',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    },
    platform_review: {
      labelKey: 'status.platformReview',
      className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    },
    oem_review: {
      labelKey: 'status.oemReview',
      className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    },
    approved: {
      labelKey: 'status.approved',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    },
    rejected: {
      labelKey: 'status.rejected',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    },
    changes_requested: {
      labelKey: 'status.changesRequested',
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    },
  }

  const { labelKey, className } = config[status] || config.draft

  return (
    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${className}`}>
      {t(labelKey)}
    </span>
  )
}
