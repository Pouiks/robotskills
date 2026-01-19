import { Package, Cpu, ArrowRight } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/i18n/navigation'

export async function generateMetadata() {
  const t = await getTranslations('libraryPage')
  return {
    title: t('title'),
  }
}

// TODO: Fetch real data
const mockInstallations: {
  id: string
  skillName: string
  skillSlug: string
  version: string
  robotName: string
  robotId: string
  status: 'installed' | 'removed' | 'disabled'
  installedAt: string
}[] = []

const mockDownloads: {
  id: string
  skillName: string
  skillSlug: string
  version: string
  downloadedAt: string
}[] = []

export default async function LibraryPage() {
  const t = await getTranslations('libraryPage')
  const locale = await getLocale()

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="installed">
          <TabsList>
            <TabsTrigger value="installed">
              {t('installed')} ({mockInstallations.filter((i) => i.status === 'installed').length})
            </TabsTrigger>
            <TabsTrigger value="downloads">
              {t('downloads')} ({mockDownloads.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installed" className="mt-6">
            {mockInstallations.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t('noSkillInstalled')}</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      {t('noSkillInstalledDesc')}
                    </p>
                    <Button asChild>
                      <Link href="/store">
                        {t('exploreStore')}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {mockInstallations
                  .filter((i) => i.status === 'installed')
                  .map((installation) => (
                    <Card key={installation.id} className="card-hover">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="h-6 w-6" />
                            </div>
                            <div>
                              <Link
                                href={`/skills/${installation.skillSlug}`}
                                className="font-medium hover:underline"
                              >
                                {installation.skillName}
                              </Link>
                              <div className="text-sm text-muted-foreground">
                                v{installation.version} • {t('on')}{' '}
                                <Link
                                  href={`/dashboard/robots/${installation.robotId}`}
                                  className="hover:underline"
                                >
                                  {installation.robotName}
                                </Link>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            {t('uninstall')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="downloads" className="mt-6">
            {mockDownloads.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Cpu className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t('noDownloads')}</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      {t('noDownloadsDesc')}
                    </p>
                    <Button asChild>
                      <Link href="/store">
                        {t('exploreStore')}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {mockDownloads.map((download) => (
                  <Card key={download.id} className="card-hover">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6" />
                          </div>
                          <div>
                            <Link
                              href={`/skills/${download.skillSlug}`}
                              className="font-medium hover:underline"
                            >
                              {download.skillName}
                            </Link>
                            <div className="text-sm text-muted-foreground">
                              v{download.version} • {t('downloadedOn')}{' '}
                              {new Date(download.downloadedAt).toLocaleDateString(
                                locale === 'en' ? 'en-US' : 'fr-FR'
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/skills/${download.skillSlug}`}>{t('install')}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
