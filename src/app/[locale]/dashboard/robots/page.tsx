import { redirect } from 'next/navigation'
import { Plus, Cpu, Wifi, WifiOff, AlertCircle, Clock } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/navigation'
import { getMe } from '@/server/auth'
import { getUserRobots } from '@/server/robots'
import { RobotActions } from './robot-actions'

export async function generateMetadata() {
  const t = await getTranslations('robots')
  return {
    title: t('title'),
  }
}

export default async function RobotsPage() {
  const user = await getMe()
  const locale = await getLocale()
  const t = await getTranslations('robots')

  if (!user) {
    redirect(`/${locale}/login?redirect=/dashboard/robots`)
  }

  const robots = await getUserRobots()

  const statusConfig = {
    paired: { labelKey: 'status.paired', icon: Wifi, variant: 'default' as const, color: 'text-green-600' },
    pending: { labelKey: 'status.pending', icon: Clock, variant: 'secondary' as const, color: 'text-yellow-600' },
    unpaired: { labelKey: 'status.unpaired', icon: WifiOff, variant: 'outline' as const, color: 'text-gray-500' },
    revoked: { labelKey: 'status.revoked', icon: AlertCircle, variant: 'destructive' as const, color: 'text-red-600' },
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/robots/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('addRobot')}
            </Link>
          </Button>
        </div>

        {/* Robots List */}
        {robots.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Cpu className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('noRobot')}</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{t('noRobotDesc')}</p>
                <Button asChild>
                  <Link href="/dashboard/robots/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addFirstRobot')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {robots.map((robot) => {
              const status = statusConfig[robot.status]
              const StatusIcon = status.icon
              return (
                <Card key={robot.id} className="card-hover">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          <Cpu className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{robot.name || robot.serialNumber}</CardTitle>
                          <CardDescription>
                            {robot.oem.brandName} - {robot.model.modelName}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={status.variant}>
                        <StatusIcon className={`h-3 w-3 mr-1 ${status.color}`} />
                        {t(status.labelKey)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      <div className="flex justify-between">
                        <span>{t('serialNumber')}:</span>
                        <span className="font-mono text-xs">{robot.serialNumber}</span>
                      </div>
                      {robot.pairedAt && (
                        <div className="flex justify-between mt-1">
                          <span>{t('pairedOn')}:</span>
                          <span>
                            {new Date(robot.pairedAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>
                    <RobotActions robotId={robot.id} robotName={robot.name || robot.serialNumber} />
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
