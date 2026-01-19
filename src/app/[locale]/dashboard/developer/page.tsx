'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Code, 
  CheckCircle, 
  Copy, 
  AlertTriangle, 
  ArrowRight, 
  Loader2,
  Shield,
  Package,
  Sparkles,
  Key
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getDeveloperLicense, activateDeveloperProgram, type DeveloperLicense } from '@/server/developer'

const benefits = [
  {
    icon: Package,
    title: 'Publication Facile',
    description: 'Publiez vos skills et gérez vos versions en quelques clics.',
  },
  {
    icon: Code,
    title: 'Multi-constructeurs',
    description: 'Soumettez vers plusieurs marques depuis une seule plateforme.',
  },
  {
    icon: Shield,
    title: 'Review Transparent',
    description: 'Processus de validation clair avec feedback détaillé.',
  },
  {
    icon: Sparkles,
    title: 'Support Prioritaire',
    description: 'Accès au support dédié développeurs.',
  },
]

export default function DeveloperProgramPage() {
  const [license, setLicense] = useState<DeveloperLicense | null>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [tokenCopied, setTokenCopied] = useState(false)

  useEffect(() => {
    loadLicense()
  }, [])

  async function loadLicense() {
    setLoading(true)
    const data = await getDeveloperLicense()
    setLicense(data)
    setLoading(false)
  }

  async function handleActivate() {
    setActivating(true)
    const result = await activateDeveloperProgram()
    setActivating(false)

    if (!result.success) {
      toast.error(result.error || 'Erreur lors de l\'activation')
      return
    }

    // Show token ONCE
    if (result.token) {
      setNewToken(result.token)
    }

    if (result.license) {
      setLicense(result.license)
    }

    toast.success('Programme développeur activé !')
  }

  function copyToken() {
    if (newToken) {
      navigator.clipboard.writeText(newToken)
      setTokenCopied(true)
      toast.success('Token copié dans le presse-papier')
      setTimeout(() => setTokenCopied(false), 2000)
    }
  }

  function dismissTokenAlert() {
    setNewToken(null)
  }

  if (loading) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  // User just activated - show token
  if (newToken) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-2xl">
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-800 dark:text-green-200">
                Programme Développeur Activé !
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Votre licence développeur a été créée avec succès.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive" className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800 dark:text-orange-200">
                  Token à sauvegarder
                </AlertTitle>
                <AlertDescription className="text-orange-700 dark:text-orange-300">
                  Ce token ne sera <strong>plus jamais affiché</strong>. Sauvegardez-le dans un endroit sûr.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium text-green-800 dark:text-green-200">
                  Votre Token Développeur
                </label>
                <div className="flex gap-2">
                  <code className="flex-1 p-3 bg-white dark:bg-gray-900 rounded-md border text-sm font-mono break-all">
                    {newToken}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToken}
                    className="shrink-0"
                  >
                    {tokenCopied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={dismissTokenAlert} variant="outline" className="flex-1">
                  J&apos;ai sauvegardé mon token
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/dev">
                    Accéder au portail
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

  // User has a license
  if (license) {
    return (
      <div className="py-8 md:py-12">
        <div className="container max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Programme Développeur</h1>
            <p className="text-muted-foreground">
              Gérez votre licence et accédez au portail développeur.
            </p>
          </div>

          <div className="grid gap-6">
            {/* License Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Licence Développeur</CardTitle>
                      <CardDescription>
                        Activée le {new Date(license.issuedAt).toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={license.isValid ? 'default' : 'destructive'}>
                    {license.isValid ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID Licence</span>
                    <p className="font-mono text-xs mt-1">{license.id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <p className="mt-1">{license.lifetime ? 'À vie' : 'Temporaire'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Accès Rapide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Button asChild size="lg" className="w-full">
                    <Link href="/dev">
                      <Code className="h-4 w-4 mr-2" />
                      Portail Développeur
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href="/dev/skills/new">
                      <Package className="h-4 w-4 mr-2" />
                      Créer un Skill
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Token Info */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Token sécurisé</AlertTitle>
              <AlertDescription>
                Votre token développeur a été affiché une seule fois lors de l&apos;activation. 
                Si vous l&apos;avez perdu, contactez le support pour une réinitialisation.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  // User doesn't have a license - show activation page
  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Programme Développeur
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rejoignez notre programme développeur et publiez vos skills sur la marketplace RobotSkills.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit) => (
            <Card key={benefit.title}>
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activation Card */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Licence Développeur à Vie
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">
              Obtenez votre licence développeur et accédez à toutes les fonctionnalités du portail.
              Paiement unique, accès illimité.
            </p>
            <div className="text-4xl font-bold mb-2">99€</div>
            <p className="text-sm text-primary-foreground/60 mb-6">
              (Simulation POC - Activation gratuite)
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={handleActivate}
              disabled={activating}
            >
              {activating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Activation en cours...
                </>
              ) : (
                <>
                  Activer ma licence (Simulation)
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Terms */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          En activant, vous acceptez les{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            conditions d&apos;utilisation
          </Link>{' '}
          et les{' '}
          <Link href="/docs/developer-terms" className="underline hover:text-foreground">
            conditions du programme développeur
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
