import { Plus, Package, ChevronRight, Clock, CheckCircle, XCircle, Search } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/navigation'
import { getDevSkills } from '@/server/submissions'

export async function generateMetadata() {
  const t = await getTranslations('devSkillsPage')
  return {
    title: t('title'),
  }
}

export default async function DevSkillsPage() {
  const t = await getTranslations('devSkillsPage')
  const locale = await getLocale()

  // Layout already handles auth/license check
  const skills = await getDevSkills()
  const publishedCount = skills.filter((s) => s.status === 'published').length

  const statusConfig = {
    draft: {
      labelKey: 'status.draft',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      icon: Clock,
    },
    published: {
      labelKey: 'status.published',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
      icon: CheckCircle,
    },
    suspended: {
      labelKey: 'status.suspended',
      color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
      icon: XCircle,
    },
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('skillCount', { count: skills.length, plural: skills.length !== 1 ? 's' : '' })} •{' '}
              {t('publishedCount', { count: publishedCount, plural: publishedCount !== 1 ? 's' : '' })}
            </p>
          </div>
          <Button asChild>
            <Link href="/dev/skills/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('newSkill')}
            </Link>
          </Button>
        </div>

        {/* Search/Filter - only show if has skills */}
        {skills.length > 0 && (
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('search')} className="pl-9" />
            </div>
          </div>
        )}

        {/* Skills List */}
        {skills.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('noSkill')}</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{t('noSkillDesc')}</p>
                <Button asChild>
                  <Link href="/dev/skills/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('createFirstSkill')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {skills.map((skill) => {
              const status = statusConfig[skill.status]
              const StatusIcon = status.icon

              return (
                <Card key={skill.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      {/* Icon */}
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        {skill.iconPath ? (
                          <img
                            src={skill.iconPath}
                            alt={skill.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">{skill.name}</h3>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {t(status.labelKey)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {skill.shortDescription || t('noDescription')}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {skill.versionsCount} {skill.versionsCount > 1 ? t('versions') : t('version')}
                          </span>
                          {skill.latestVersion && <span>v{skill.latestVersion}</span>}
                          {skill.category && (
                            <Badge variant="outline" className="capitalize">
                              {skill.category}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dev/skills/${skill.id}`}>
                            {t('manage')}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                        {skill.status === 'draft' && (
                          <Button size="sm" asChild>
                            <Link href={`/dev/skills/new?skillId=${skill.id}`}>{t('continue')}</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
