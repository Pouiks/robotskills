import Link from 'next/link'
import { Book, Upload, Building2, FileText, Rocket, HelpCircle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Documentation',
  description: 'Guide complet pour publier vos skills sur le Robot Store',
}

const sections = [
  {
    title: 'Guide de soumission',
    description: 'Étapes pour publier votre skill sur la plateforme',
    icon: Rocket,
    href: '/docs/getting-started',
    items: ['Licence développeur', 'Préparer son dossier', 'Processus de validation'],
  },
  {
    title: 'Ressources constructeurs',
    description: 'Liens vers les outils de développement de chaque marque',
    icon: Building2,
    href: '/docs/oem-resources',
    items: ['RoboHome', 'NexGen Robotics', 'Autres constructeurs'],
  },
  {
    title: 'Guidelines',
    description: 'Exigences techniques et qualité pour la soumission',
    icon: FileText,
    href: '/docs/submission-guidelines',
    items: ['Format du package', 'Manifest requis', 'Bonnes pratiques'],
  },
  {
    title: 'FAQ',
    description: 'Réponses aux questions fréquentes des développeurs',
    icon: HelpCircle,
    href: '/docs/faq',
    items: ['Tarifs', 'Délais de validation', 'Mises à jour'],
  },
]

export default function DocsPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground">
            Tout ce dont vous avez besoin pour soumettre et publier vos skills sur le Robot Store.
          </p>
        </div>

        {/* Quick Start */}
        <Card className="mb-12 bg-primary text-primary-foreground">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Prêt à publier ?</h2>
                <p className="text-primary-foreground/80">
                  Suivez notre guide de soumission pour publier votre premier skill sur le Robot Store.
                </p>
              </div>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/docs/getting-started">
                  Commencer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Important Note */}
        <Card className="mb-8 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Le Robot Store est une plateforme de distribution.</strong> Le développement 
              de skills se fait avec les outils fournis par chaque constructeur de robots. 
              Consultez la section "Ressources constructeurs" pour accéder à leurs documentations.
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sections.map((section) => (
            <Card key={section.title} className="card-hover">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" asChild>
                  <Link href={section.href}>Consulter</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resources */}
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold mb-6">Ressources additionnelles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Espace développeur</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Gérez vos skills, suivez vos soumissions et consultez vos statistiques.
                </p>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link href="/dev">
                    Accéder à l'espace dev →
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Communauté Discord</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Rejoignez notre communauté pour échanger avec d'autres développeurs.
                </p>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link href="https://discord.gg/robotskills" target="_blank">
                    Rejoindre Discord →
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Besoin d'aide ? Notre équipe est là pour vous.
                </p>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link href="/contact">
                    Contacter le support →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
