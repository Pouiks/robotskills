import { Suspense } from 'react'
import { SkillCardSkeleton } from '@/components/skills/skill-card-skeleton'
import { SkillSearch } from '@/components/skills/skill-search'
import { RobotEvolutionRoadmap } from '@/components/store/RobotEvolutionRoadmap'
import { getPublishedSkills } from '@/server/skills'
import { getUserRobots } from '@/server/robots'
import { getMe } from '@/server/auth'

interface StorePageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    page?: string
  }>
}

export const metadata = {
  title: 'Store',
  description: 'Découvrez des centaines de skills pour vos robots',
}

async function SkillList({
  category,
  search,
}: {
  category?: string
  search?: string
}) {
  const [{ skills }, user] = await Promise.all([
    getPublishedSkills({ limit: 100 }),
    getMe(),
  ])

  // Récupérer les robots de l'utilisateur s'il est connecté
  const userRobots = user ? await getUserRobots() : []

  return <SkillSearch skills={skills} initialCategory={category} initialSearch={search} userRobots={userRobots} />
}

function SkillListSkeleton() {
  return (
    <div className="skill-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkillCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams
  const { category, search } = params

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Store</h1>
          <p className="text-muted-foreground">
            Découvrez des centaines de skills pour étendre les capacités de vos robots
          </p>
        </div>

        {/* Evolution Roadmap */}
        <RobotEvolutionRoadmap />

        {/* Skills with Search */}
        <Suspense fallback={<SkillListSkeleton />}>
          <SkillList category={category} search={search} />
        </Suspense>
      </div>
    </div>
  )
}
