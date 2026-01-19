import Link from 'next/link'
import { ChevronLeft, Rocket, CheckCircle, ArrowRight, FileText, Upload, Building2, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Guide de soumission',
  description: 'Apprenez à soumettre votre skill sur le Robot Store',
}

const steps = [
  {
    icon: CreditCard,
    title: 'Obtenir une licence développeur',
    description: 'Inscrivez-vous au programme développeur et activez votre licence annuelle pour accéder à la plateforme de soumission.',
    details: [
      'Créez votre compte sur le Robot Store',
      'Accédez à l\'espace développeur',
      'Souscrivez à la licence développeur (99€/an)',
    ],
  },
  {
    icon: FileText,
    title: 'Préparer votre dossier',
    description: 'Constituez le dossier complet de votre skill avec tous les éléments requis.',
    details: [
      'Package ZIP de votre skill (code source ou binaire)',
      'Fichier manifest.json avec métadonnées',
      'Icône (256x256) et captures d\'écran (min. 3)',
      'Description et notes de version',
    ],
  },
  {
    icon: Building2,
    title: 'Choisir les constructeurs cibles',
    description: 'Sélectionnez les marques de robots compatibles avec votre skill.',
    details: [
      'Consultez les ressources de chaque constructeur',
      'Vérifiez la compatibilité de votre skill',
      'Déclarez les permissions requises',
    ],
  },
  {
    icon: Upload,
    title: 'Soumettre pour validation',
    description: 'Envoyez votre dossier pour examen par la plateforme et les OEMs.',
    details: [
      'Vérification automatique (format, sécurité)',
      'Revue par chaque constructeur ciblé',
      'Feedback et ajustements si nécessaire',
    ],
  },
]

export default function GettingStartedPage() {
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
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Guide de soumission</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Publiez votre skill sur le Robot Store en 4 étapes.
          </p>
        </div>

        {/* Important Note */}
        <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note :</strong> Le Robot Store est une plateforme de distribution. 
              Le développement de skills se fait avec les outils fournis par chaque constructeur. 
              Consultez leurs ressources pour créer votre skill avant de le soumettre ici.
            </p>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Étape {index + 1}</div>
                    <CardTitle>{step.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success */}
        <Card className="mt-8 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Après validation
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Une fois approuvé par les constructeurs ciblés, votre skill sera publié 
                  sur le store et disponible pour les utilisateurs possédant des robots compatibles.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/dev/join">
                    Devenir développeur
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Ressources utiles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="card-hover">
              <CardContent className="p-4">
                <Link href="/docs/submission-guidelines" className="flex items-center justify-between">
                  <span className="font-medium">Guidelines de soumission</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <Link href="/docs/oem-resources" className="flex items-center justify-between">
                  <span className="font-medium">Ressources constructeurs</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <Link href="/docs/faq" className="flex items-center justify-between">
                  <span className="font-medium">FAQ développeurs</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <Link href="/dev" className="flex items-center justify-between">
                  <span className="font-medium">Espace développeur</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
