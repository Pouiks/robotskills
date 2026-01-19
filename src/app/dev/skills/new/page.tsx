import { redirect } from 'next/navigation'
import { getMe } from '@/server/auth'
import { SkillWizard } from './skill-wizard'

export const metadata = {
  title: 'Nouveau Skill - Portail Développeur',
}

export default async function NewSkillPage() {
  const user = await getMe()

  if (!user) {
    redirect('/login?redirect=/dev/skills/new')
  }

  if (!user.isDeveloper) {
    redirect('/dev')
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Créer un nouveau Skill</h1>
          <p className="text-muted-foreground">
            Suivez les étapes pour soumettre votre skill à la validation
          </p>
        </div>

        <SkillWizard />
      </div>
    </div>
  )
}
