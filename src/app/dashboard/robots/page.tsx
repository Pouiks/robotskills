import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Cpu, Wifi, WifiOff, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getMe } from '@/server/auth'
import { getUserRobots } from '@/server/robots'
import { RobotActions } from './robot-actions'

export const metadata = {
  title: 'Mes Robots',
}

const statusConfig = {
  paired: { label: 'Appairé', icon: Wifi, variant: 'default' as const, color: 'text-green-600' },
  pending: { label: 'En attente', icon: Clock, variant: 'secondary' as const, color: 'text-yellow-600' },
  unpaired: { label: 'Non appairé', icon: WifiOff, variant: 'outline' as const, color: 'text-gray-500' },
  revoked: { label: 'Révoqué', icon: AlertCircle, variant: 'destructive' as const, color: 'text-red-600' },
}

export default async function RobotsPage() {
  const user = await getMe()

  if (!user) {
    redirect('/login?redirect=/dashboard/robots')
  }

  const robots = await getUserRobots()

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mes Robots</h1>
            <p className="text-muted-foreground">
              Gérez vos robots et leurs appairages
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/robots/new">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un robot
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
                <h3 className="text-lg font-semibold mb-2">Aucun robot</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Vous n&apos;avez pas encore ajouté de robot. Ajoutez votre premier robot pour commencer à installer des skills.
                </p>
                <Button asChild>
                  <Link href="/dashboard/robots/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter mon premier robot
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
                          <CardTitle className="text-lg">
                            {robot.name || robot.serialNumber}
                          </CardTitle>
                          <CardDescription>
                            {robot.oem.brandName} - {robot.model.modelName}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={status.variant}>
                        <StatusIcon className={`h-3 w-3 mr-1 ${status.color}`} />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      <div className="flex justify-between">
                        <span>N° série:</span>
                        <span className="font-mono text-xs">{robot.serialNumber}</span>
                      </div>
                      {robot.pairedAt && (
                        <div className="flex justify-between mt-1">
                          <span>Appairé le:</span>
                          <span>{new Date(robot.pairedAt).toLocaleDateString('fr-FR')}</span>
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
