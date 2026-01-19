'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Loader2, Code, Package, DollarSign, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

const benefits = [
  {
    icon: Package,
    title: 'Distribution mondiale',
    description: 'Publiez vos skills sur notre marketplace et atteignez des milliers d\'utilisateurs.',
  },
  {
    icon: Code,
    title: 'Multi-constructeurs',
    description: 'Soumettez vers plusieurs marques de robots depuis une seule plateforme.',
  },
  {
    icon: DollarSign,
    title: 'Revenus',
    description: 'Gagnez de l\'argent sur chaque installation de vos skills premium.',
  },
  {
    icon: Users,
    title: 'Communauté',
    description: 'Rejoignez une communauté active de développeurs passionnés par la robotique.',
  },
]

const requirements = [
  'Avoir un compte RobotSkills vérifié',
  'Accepter les conditions du programme développeur',
  'Fournir des informations de contact valides',
  'S\'engager à respecter les standards de qualité',
]

export default function JoinDevProgramPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!accepted) {
      toast.error('Veuillez accepter les conditions du programme')
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    toast.success('Demande envoyée ! Nous vous contacterons sous 48h.')
    setIsSubmitting(false)
  }

  return (
    <div className="py-12 md:py-20">
      <div className="container">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Rejoignez le Programme Développeur
          </h1>
          <p className="text-xl text-muted-foreground">
            Créez des skills innovants, atteignez des milliers d'utilisateurs et 
            participez à la révolution robotique.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit) => (
            <Card key={benefit.title}>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Requirements */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Prérequis</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="mt-6 bg-muted/40">
              <CardHeader>
                <CardTitle className="text-lg">Déjà développeur ?</CardTitle>
                <CardDescription>
                  Accédez directement à votre portail développeur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild>
                  <Link href="/dev">
                    Portail Développeur
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Demande d'adhésion</h2>
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" placeholder="Jean" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" placeholder="Dupont" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jean@example.com" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise (optionnel)</Label>
                    <Input id="company" placeholder="Ma Startup" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Expérience en développement robotique</Label>
                    <Textarea
                      id="experience"
                      placeholder="Décrivez brièvement votre expérience..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project">Projet de skill envisagé</Label>
                    <Textarea
                      id="project"
                      placeholder="Quel type de skill souhaitez-vous développer ?"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={accepted}
                      onCheckedChange={(checked) => setAccepted(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      J'accepte les{' '}
                      <Link href="/terms" className="text-primary hover:underline">
                        conditions d'utilisation
                      </Link>{' '}
                      et les{' '}
                      <Link href="/docs/developer-terms" className="text-primary hover:underline">
                        conditions du programme développeur
                      </Link>
                    </label>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Soumettre ma demande
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
