import { redirect } from 'next/navigation'
import { Shield, Users, Package, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getMe } from '@/server/auth'

export const metadata = {
  title: 'Administration',
}

export default async function AdminPage() {
  const user = await getMe()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  if (!user.isAdmin) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Accès Refusé</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Vous n&apos;avez pas les permissions nécessaires pour accéder à cette section.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Utilisateurs', value: 0, icon: Users },
    { label: 'Skills', value: 0, icon: Package },
    { label: 'Alertes', value: 0, icon: AlertTriangle },
  ]

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Administration</h1>
          <p className="text-muted-foreground">
            Gestion de la plateforme RobotSkills
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{stat.label}</CardDescription>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin sections placeholder */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Kill Switch</CardTitle>
              <CardDescription>
                Désactiver un skill ou une version en urgence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fonctionnalité disponible en Phase 5
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Historique des événements de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fonctionnalité disponible en Phase 5
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
