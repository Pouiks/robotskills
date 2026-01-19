import Link from 'next/link'
import { Bot, Shield, Zap, Users, Package, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BlogSlider } from '@/components/home/BlogSlider'
import { DynamicStats } from '@/components/home/DynamicStats'
import { InterestCTAButton } from '@/components/home/InterestCTAButton'
import { VisitorTracker } from '@/components/home/VisitorTracker'
import { FAQ } from '@/components/home/FAQ'
import { SkillsBackground } from '@/components/background/SkillsBackground'
import { getSiteStats } from '@/server/stats'
import { queryPublishedPosts, isNotionConfigured } from '@/lib/notion/notionClient'

const features = [
  {
    icon: Shield,
    title: 'Sécurité Maximale',
    description:
      'Chaque skill est vérifié et validé par notre équipe et les constructeurs. Votre robot est entre de bonnes mains.',
  },
  {
    icon: Zap,
    title: 'Installation Simple',
    description:
      'Installez de nouveaux skills en quelques clics. Gérez vos addons facilement depuis votre espace personnel.',
  },
  {
    icon: Users,
    title: 'Communauté Active',
    description:
      'Rejoignez une communauté de développeurs passionnés. Partagez, collaborez, et innovez ensemble.',
  },
  {
    icon: Package,
    title: 'Catalogue Riche',
    description:
      'Des centaines de skills pour tous les usages : navigation, manipulation, communication, et plus encore.',
  },
]

export default async function HomePage() {
  // Récupérer les stats dynamiques
  const siteStats = await getSiteStats()
  
  // Compter les articles de blog
  let blogPostsCount = 0
  if (isNotionConfigured()) {
    try {
      const posts = await queryPublishedPosts()
      blogPostsCount = posts.length
    } catch (error) {
      console.error('Error fetching blog posts count:', error)
    }
  }
  
  const stats = {
    visitors: siteStats.visitors,
    interestClicks: siteStats.interestClicks,
    blogPosts: blogPostsCount,
    contactedOems: siteStats.contactedOems,
  }
  return (
    <div className="flex flex-col">
      {/* Tracker de visites (invisible) */}
      <VisitorTracker />
      
      {/* Hero Section */}
      <section className="gradient-hero py-20 md:py-32 relative overflow-hidden">
        {/* Fond avec colonnes de skills - limité au hero */}
        <SkillsBackground />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Bot className="h-4 w-4" />
              <span>La marketplace robotique de référence</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Donnez de nouveaux{' '}
              <span className="text-primary">super-pouvoirs</span> à vos robots
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Découvrez des centaines de skills et addons pour étendre les capacités de vos robots.
              Installation sécurisée, validée par les constructeurs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <InterestCTAButton href="/store">
                Explorer le Store
              </InterestCTAButton>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dev">Devenir Développeur</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Dynamic */}
      <DynamicStats initialStats={stats} />

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pourquoi choisir RobotSkills ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une plateforme pensée pour les utilisateurs et les développeurs, avec la sécurité comme priorité.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="card-hover">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Slider - Lazy loaded */}
      <BlogSlider />

      {/* How it works */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Installez un nouveau skill en 3 étapes simples
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Trouvez votre skill',
                description: 'Parcourez notre catalogue et trouvez le skill parfait pour votre robot.',
              },
              {
                step: '2',
                title: 'Appairez votre robot',
                description: 'Connectez votre robot en toute sécurité via notre système de pairing.',
              },
              {
                step: '3',
                title: 'Installez et profitez',
                description: "Installez le skill d'un clic et profitez des nouvelles capacités.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Vous êtes développeur ?
                  </h2>
                  <p className="text-primary-foreground/80 mb-6">
                    Rejoignez notre programme développeur et publiez vos skills sur la marketplace.
                    Accédez à une documentation complète, des outils de test, et une communauté active.
                  </p>
                  <ul className="space-y-2 mb-6">
                    {[
                      'Plateforme de distribution sécurisée',
                      'Processus de validation transparent',
                      'Revenus sur chaque installation',
                      'Support technique dédié',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="secondary" size="lg" asChild>
                    <Link href="/dev">
                      Commencer maintenant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="hidden md:flex justify-center">
                  <div className="relative h-64 w-64">
                    <div className="absolute inset-0 rounded-full bg-primary-foreground/10 animate-pulse-slow" />
                    <div className="absolute inset-8 rounded-full bg-primary-foreground/20" />
                    <div className="absolute inset-16 rounded-full bg-primary-foreground/30 flex items-center justify-center">
                      <Bot className="h-16 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />
    </div>
  )
}
