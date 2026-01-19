import type { Metadata } from 'next'
import { Bot, Target, Users, Shield, Globe } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo.about' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

const team = [
  { name: 'Marie Dupont', role: 'CEO & Co-fondatrice' },
  { name: 'Thomas Martin', role: 'CTO & Co-fondateur' },
  { name: 'Sophie Bernard', role: 'Head of Product' },
  { name: 'Lucas Petit', role: 'Lead Developer' },
]

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('about')

  const values = [
    {
      icon: Shield,
      title: t('values.security.title'),
      description: t('values.security.description'),
    },
    {
      icon: Users,
      title: t('values.community.title'),
      description: t('values.community.description'),
    },
    {
      icon: Target,
      title: t('values.innovation.title'),
      description: t('values.innovation.description'),
    },
    {
      icon: Globe,
      title: t('values.accessibility.title'),
      description: t('values.accessibility.description'),
    },
  ]

  return (
    <div className="py-12 md:py-20">
      <div className="container">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Bot className="h-4 w-4" />
            {t('badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('heroTitle')}</h1>
          <p className="text-xl text-muted-foreground">{t('heroSubtitle')}</p>
        </div>

        {/* Mission */}
        <Card className="mb-16 bg-primary text-primary-foreground">
          <CardContent className="p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('missionTitle')}</h2>
              <p className="text-lg text-primary-foreground/80">{t('missionText')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">{t('valuesTitle')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">{t('teamTitle')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="text-center">
                <CardContent className="pt-6">
                  <div className="h-24 w-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-muted/40 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">2023</div>
              <div className="text-sm text-muted-foreground">{t('stats.yearCreated')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground">{t('stats.employees')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">20+</div>
              <div className="text-sm text-muted-foreground">{t('stats.oemPartners')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">3</div>
              <div className="text-sm text-muted-foreground">{t('stats.officesWorldwide')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
