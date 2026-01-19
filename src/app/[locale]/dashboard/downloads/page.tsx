import { redirect } from 'next/navigation'
import { Download, Calendar, ExternalLink, Package } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/navigation'
import { getMe } from '@/server/auth'

export async function generateMetadata() {
  const t = await getTranslations('downloadsPage')
  return {
    title: t('title'),
  }
}

// TODO: Fetch real downloads from database
const mockDownloads: {
  id: string
  skillName: string
  skillSlug: string
  version: string
  downloadedAt: string
  size: string
}[] = []

export default async function DownloadsPage() {
  const user = await getMe()
  const locale = await getLocale()
  const t = await getTranslations('downloadsPage')

  if (!user) {
    redirect(`/${locale}/login?redirect=/dashboard/downloads`)
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Downloads List */}
        {mockDownloads.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Download className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('noDownloads')}</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{t('noDownloadsDesc')}</p>
                <Button asChild>
                  <Link href="/store">
                    <Package className="h-4 w-4 mr-2" />
                    {t('exploreStore')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockDownloads.map((download) => (
              <Card key={download.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <Link
                          href={`/skills/${download.skillSlug}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {download.skillName}
                        </Link>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Badge variant="outline">v{download.version}</Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(download.downloadedAt).toLocaleDateString(
                              locale === 'en' ? 'en-US' : 'fr-FR'
                            )}
                          </span>
                          <span>{download.size}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/skills/${download.skillSlug}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t('viewSkill')}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
