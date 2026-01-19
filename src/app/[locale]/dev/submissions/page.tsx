import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Send,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/navigation'
import { getDevSubmissions } from '@/server/submissions'

export async function generateMetadata() {
  const t = await getTranslations('devSubmissionsPage')
  return {
    title: t('title'),
  }
}

type StatusFilter = 'all' | 'pending' | 'completed' | 'action_required'

export default async function DevSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: StatusFilter }>
}) {
  const t = await getTranslations('devSubmissionsPage')
  const locale = await getLocale()

  // Layout handles auth check
  const submissions = await getDevSubmissions()
  const params = await searchParams
  const filter = params.filter || 'all'

  const statusConfig = {
    draft: {
      labelKey: 'status.draft',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      icon: Clock,
    },
    submitted: {
      labelKey: 'status.submitted',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      icon: Send,
    },
    platform_review: {
      labelKey: 'status.platformReview',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      icon: Eye,
    },
    oem_review: {
      labelKey: 'status.oemReview',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      icon: Clock,
    },
    approved: {
      labelKey: 'status.approved',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      icon: CheckCircle,
    },
    rejected: {
      labelKey: 'status.rejected',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      icon: XCircle,
    },
    changes_requested: {
      labelKey: 'status.changesRequested',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      icon: AlertTriangle,
    },
  }

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === 'all') return true
    if (filter === 'pending') {
      return ['submitted', 'platform_review', 'oem_review'].includes(sub.status)
    }
    if (filter === 'completed') {
      return ['approved', 'rejected'].includes(sub.status)
    }
    if (filter === 'action_required') {
      return ['draft', 'changes_requested'].includes(sub.status)
    }
    return true
  })

  // Count by filter
  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => ['submitted', 'platform_review', 'oem_review'].includes(s.status))
      .length,
    completed: submissions.filter((s) => ['approved', 'rejected'].includes(s.status)).length,
    action_required: submissions.filter((s) => ['draft', 'changes_requested'].includes(s.status)).length,
  }

  const filterOptions = [
    { value: 'all', labelKey: 'filters.all', count: counts.all },
    { value: 'pending', labelKey: 'filters.pending', count: counts.pending },
    { value: 'action_required', labelKey: 'filters.actionRequired', count: counts.action_required },
    { value: 'completed', labelKey: 'filters.completed', count: counts.completed },
  ]

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">{t('title')}</h1>
            <p className="text-muted-foreground">
              {t('totalCount', {
                count: submissions.length,
                plural: submissions.length !== 1 ? 's' : '',
              })}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map((option) => (
            <Link
              key={option.value}
              href={option.value === 'all' ? '/dev/submissions' : `/dev/submissions?filter=${option.value}`}
            >
              <Badge
                variant={filter === option.value ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1.5"
              >
                {t(option.labelKey)}
                {option.count > 0 && (
                  <span className="ml-1.5 bg-background/20 px-1.5 rounded-full text-xs">
                    {option.count}
                  </span>
                )}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {filter === 'all' ? t('noSubmission') : t('noSubmissionInCategory')}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  {filter === 'all' ? t('noSubmissionDesc') : t('tryOtherFilter')}
                </p>
                <Button asChild>
                  <Link href="/dev/skills/new">{t('createSkill')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => {
              const status = statusConfig[submission.status]
              const StatusIcon = status.icon
              const needsAction = ['draft', 'changes_requested'].includes(submission.status)

              return (
                <Card
                  key={submission.id}
                  className={`card-hover ${needsAction ? 'border-orange-300 dark:border-orange-800' : ''}`}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Status Icon */}
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${status.color}`}
                      >
                        <StatusIcon className="h-6 w-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold">{submission.skillName}</h3>
                          <Badge variant="outline" className="text-xs">
                            v{submission.version}
                          </Badge>
                          <Badge className={status.color}>{t(status.labelKey)}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          {submission.targetOemName && <span>OEM: {submission.targetOemName}</span>}
                          <span>•</span>
                          <span>
                            {new Date(submission.createdAt).toLocaleDateString(
                              locale === 'en' ? 'en-US' : 'fr-FR'
                            )}
                          </span>
                        </div>

                        {/* Quick Feedback Preview */}
                        {submission.platformReviewNotes && submission.status === 'changes_requested' && (
                          <div className="mt-2 p-2 rounded bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                            <p className="text-sm text-orange-800 dark:text-orange-200 line-clamp-2">
                              {submission.platformReviewNotes.substring(0, 150)}...
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        {needsAction && (
                          <Button size="sm" asChild>
                            <Link href={`/dev/submissions/${submission.id}`}>
                              {submission.status === 'draft' ? t('submit') : t('fix')}
                            </Link>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dev/submissions/${submission.id}`}>
                            {t('details')}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('statusLegend')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(statusConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <Badge className={config.color} variant="secondary">
                  <config.icon className="h-3 w-3 mr-1" />
                  {t(config.labelKey)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
