import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Bot, Package, Download, Cpu, ArrowRight, Plus, User, Settings } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { getMe } from '@/server/auth'

export async function generateMetadata() {
  const t = await getTranslations('dashboard')
  return {
    title: t('title'),
  }
}

export default async function DashboardPage() {
  const user = await getMe()
  const locale = await getLocale()
  const t = await getTranslations('dashboard')

  if (!user) {
    redirect(`/${locale}/login?redirect=/dashboard`)
  }

  const quickActions = [
    {
      title: t('myRobots'),
      description: t('manageRobots'),
      icon: Cpu,
      href: '/dashboard/robots',
      count: 0,
    },
    {
      title: t('myLibrary'),
      description: t('installedSkills'),
      icon: Package,
      href: '/dashboard/library',
      count: 0,
    },
    {
      title: t('downloads'),
      description: t('downloadHistory'),
      icon: Download,
      href: '/dashboard/downloads',
      count: 0,
    },
  ]

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Welcome Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">
                {t('hello', { name: user.displayName || t('user') })} 👋
              </h1>
              <p className="text-muted-foreground">{t('welcomeMessage')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/profile">
              <Settings className="h-4 w-4 mr-2" />
              {t('myProfile')}
            </Link>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => (
            <Card key={action.title} className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{action.title}</CardTitle>
                <action.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{action.count}</div>
                <CardDescription className="mb-4">{action.description}</CardDescription>
                <Button variant="outline" size="sm" asChild>
                  <Link href={action.href}>
                    {t('viewAll')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Get Started Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Robot CTA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {t('addRobot')}
              </CardTitle>
              <CardDescription>{t('addRobotDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/robots/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addRobot')}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Explore Store CTA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t('exploreStore')}
              </CardTitle>
              <CardDescription>{t('exploreStoreDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href="/store">
                  {t('browseStore')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Developer Program CTA */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {user.isDeveloper ? t('developerPortal') : t('areYouDeveloper')}
                </h3>
                <p className="text-muted-foreground">
                  {user.isDeveloper ? t('developerAccessDesc') : t('joinDeveloperDesc')}
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href={user.isDeveloper ? '/dev' : '/dashboard/developer'}>
                  {user.isDeveloper ? t('accessPortal') : t('joinProgram')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
