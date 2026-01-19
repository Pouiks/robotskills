import { Bot, Target, Users, Shield, Globe } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'À propos',
  description: 'Découvrez RobotSkills, la marketplace de référence pour les skills robotiques',
}

const values = [
  {
    icon: Shield,
    title: 'Sécurité',
    description: 'La sécurité est notre priorité absolue. Chaque skill est vérifié et validé avant publication.',
  },
  {
    icon: Users,
    title: 'Communauté',
    description: 'Nous construisons une communauté ouverte de développeurs et d\'utilisateurs passionnés.',
  },
  {
    icon: Target,
    title: 'Innovation',
    description: 'Nous repoussons les limites de ce que les robots peuvent accomplir au quotidien.',
  },
  {
    icon: Globe,
    title: 'Accessibilité',
    description: 'Rendre la robotique accessible à tous, particuliers comme professionnels.',
  },
]

const team = [
  { name: 'Marie Dupont', role: 'CEO & Co-fondatrice', image: '/team/marie.jpg' },
  { name: 'Thomas Martin', role: 'CTO & Co-fondateur', image: '/team/thomas.jpg' },
  { name: 'Sophie Bernard', role: 'Head of Product', image: '/team/sophie.jpg' },
  { name: 'Lucas Petit', role: 'Lead Developer', image: '/team/lucas.jpg' },
]

export default function AboutPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Bot className="h-4 w-4" />
            Notre histoire
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nous croyons au potentiel infini de la robotique
          </h1>
          <p className="text-xl text-muted-foreground">
            RobotSkills est née de la conviction que les robots peuvent devenir de véritables 
            compagnons du quotidien, à condition de leur donner les bonnes capacités.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-16 bg-primary text-primary-foreground">
          <CardContent className="p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Notre mission</h2>
              <p className="text-lg text-primary-foreground/80">
                Créer un écosystème où développeurs et utilisateurs peuvent collaborer pour 
                étendre les capacités des robots, en toute sécurité et simplicité. 
                Nous voulons démocratiser l'accès à la robotique avancée.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Nos valeurs</h2>
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
          <h2 className="text-3xl font-bold text-center mb-12">Notre équipe</h2>
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
              <div className="text-sm text-muted-foreground">Année de création</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Employés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">20+</div>
              <div className="text-sm text-muted-foreground">Partenaires OEM</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">3</div>
              <div className="text-sm text-muted-foreground">Bureaux dans le monde</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
