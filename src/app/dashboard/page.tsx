import Link from 'next/link'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Bot, Package, Download, Cpu, ArrowRight, Plus, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getMe } from '@/server/auth'

export const metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const user = await getMe()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  const quickActions = [
    {
      title: 'Mes Robots',
      description: 'Gérez vos robots appairés',
      icon: Cpu,
      href: '/dashboard/robots',
      count: 0, // TODO: fetch real count
    },
    {
      title: 'Ma Bibliothèque',
      description: 'Vos skills installés',
      icon: Package,
      href: '/dashboard/library',
      count: 0,
    },
    {
      title: 'Téléchargements',
      description: 'Historique des téléchargements',
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
                Bonjour, {user.displayName || 'utilisateur'} 👋
              </h1>
              <p className="text-muted-foreground">
                Bienvenue sur votre espace personnel RobotSkills
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/profile">
              <Settings className="h-4 w-4 mr-2" />
              Mon profil
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
                    Voir tout
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
                Ajouter un robot
              </CardTitle>
              <CardDescription>
                Appairez votre premier robot pour commencer à installer des skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/robots/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un robot
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Explore Store CTA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Explorer le Store
              </CardTitle>
              <CardDescription>
                Découvrez des centaines de skills pour étendre les capacités de vos robots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href="/store">
                  Parcourir le Store
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
                  {user.isDeveloper ? 'Portail Développeur' : 'Vous êtes développeur ?'}
                </h3>
                <p className="text-muted-foreground">
                  {user.isDeveloper 
                    ? 'Accédez à votre portail pour gérer vos skills et soumissions.'
                    : 'Rejoignez notre programme développeur et publiez vos propres skills sur la marketplace.'}
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href={user.isDeveloper ? '/dev' : '/dashboard/developer'}>
                  {user.isDeveloper ? 'Accéder au portail' : 'Rejoindre le programme'}
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
