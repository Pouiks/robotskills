import Link from 'next/link'
import { MapPin, Clock, ArrowRight, Heart, Zap, Users, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Carrières',
  description: 'Rejoignez l\'équipe RobotSkills et construisez le futur de la robotique',
}

const benefits = [
  { icon: Heart, title: 'Santé', description: 'Mutuelle premium pour vous et votre famille' },
  { icon: Zap, title: 'Flexibilité', description: 'Télétravail flexible, horaires aménagés' },
  { icon: Users, title: 'Équipe', description: 'Collègues passionnés et bienveillants' },
  { icon: Globe, title: 'Impact', description: 'Contribuez à l\'avenir de la robotique' },
]

const jobs = [
  {
    title: 'Senior Full-Stack Developer',
    department: 'Engineering',
    location: 'Paris, France',
    type: 'CDI',
    remote: true,
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Paris, France',
    type: 'CDI',
    remote: true,
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Paris, France',
    type: 'CDI',
    remote: true,
  },
  {
    title: 'Customer Success Manager',
    department: 'Operations',
    location: 'Lyon, France',
    type: 'CDI',
    remote: false,
  },
  {
    title: 'Robotics Engineer',
    department: 'R&D',
    location: 'Paris, France',
    type: 'CDI',
    remote: false,
  },
]

export default function CareersPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Construisez le futur de la robotique avec nous
          </h1>
          <p className="text-xl text-muted-foreground">
            Rejoignez une équipe passionnée qui repousse les limites de ce que 
            les robots peuvent accomplir au quotidien.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Pourquoi nous rejoindre ?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Postes ouverts</h2>
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="secondary">{job.department}</Badge>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.type}
                        </span>
                        {job.remote && (
                          <Badge variant="outline">Remote OK</Badge>
                        )}
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/careers/${job.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        Postuler
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* No matching position */}
        <Card className="mt-12 bg-muted/40">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">
              Vous ne trouvez pas le poste idéal ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Envoyez-nous une candidature spontanée, nous sommes toujours à la recherche de talents.
            </p>
            <Button variant="outline" asChild>
              <Link href="/contact">
                Candidature spontanée
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
