import Link from 'next/link'
import { ChevronLeft, Code, Lock, Server, Webhook } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'API Reference',
  description: 'Documentation de l\'API RobotSkills',
}

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/skills',
    description: 'Liste tous les skills publics',
    auth: false,
  },
  {
    method: 'GET',
    path: '/api/v1/skills/:slug',
    description: 'Récupère les détails d\'un skill',
    auth: false,
  },
  {
    method: 'POST',
    path: '/api/v1/skills',
    description: 'Crée un nouveau skill (développeurs)',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/robots',
    description: 'Liste les robots de l\'utilisateur',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/v1/robots/:id/pair',
    description: 'Initie le pairing d\'un robot',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/v1/installations',
    description: 'Installe un skill sur un robot',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/v1/downloads/:id',
    description: 'Génère une URL de téléchargement signée',
    auth: true,
  },
]

export default function ApiReferencePage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-4xl">
        {/* Back */}
        <Link
          href="/docs"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à la documentation
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">API Reference</h1>
          <p className="text-xl text-muted-foreground">
            Documentation complète de l'API REST RobotSkills.
          </p>
        </div>

        {/* Base URL */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Base URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <code className="block bg-muted p-4 rounded-lg text-sm">
              https://api.robotskills.io/v1
            </code>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Authentification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              L'API utilise des tokens Bearer pour l'authentification. Incluez votre token dans le header Authorization :
            </p>
            <code className="block bg-muted p-4 rounded-lg text-sm">
              Authorization: Bearer YOUR_API_TOKEN
            </code>
            <p className="text-sm text-muted-foreground">
              Vous pouvez générer un token API depuis votre{' '}
              <Link href="/dashboard/profile" className="text-primary hover:underline">
                profil développeur
              </Link>.
            </p>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Code className="h-6 w-6" />
            Endpoints
          </h2>
          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={endpoint.method === 'GET' ? 'secondary' : 'default'}
                        className="font-mono"
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                    </div>
                    {endpoint.auth && (
                      <Badge variant="outline" className="shrink-0">
                        <Lock className="h-3 w-3 mr-1" />
                        Auth requise
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{endpoint.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Configurez des webhooks pour recevoir des notifications en temps réel sur les événements :
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Badge variant="outline">skill.installed</Badge>
                <span className="text-muted-foreground">Un utilisateur a installé votre skill</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline">skill.uninstalled</Badge>
                <span className="text-muted-foreground">Un utilisateur a désinstallé votre skill</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline">submission.reviewed</Badge>
                <span className="text-muted-foreground">Votre soumission a été examinée</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
