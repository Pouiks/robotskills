import { Metadata } from 'next'
import { FileText } from 'lucide-react'
import { queryPublishedPosts, isNotionConfigured } from '@/lib/notion/notionClient'
import { PostCard } from '@/components/blog/PostCard'
import { BlogTagFilter } from '@/components/blog/BlogTagFilter'
import { EmptyState } from '@/components/common/empty-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Actualités, tutoriels et insights sur RobotSkills et la robotique. Découvrez nos articles pour rester informé des dernières nouveautés.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: 'Blog - RobotSkills',
    description: 'Actualités, tutoriels et insights sur RobotSkills et la robotique.',
    url: `${SITE_URL}/blog`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Blog - RobotSkills',
    description: 'Actualités, tutoriels et insights sur RobotSkills et la robotique.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

interface BlogPageProps {
  searchParams: Promise<{
    tag?: string
  }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const selectedTag = params.tag

  // Check if Notion is configured
  if (!isNotionConfigured()) {
    return (
      <div className="py-12 md:py-20">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground">
              Actualités, tutoriels et insights sur RobotSkills et l&apos;univers de la robotique.
            </p>
          </div>
          
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertTitle>Configuration requise</AlertTitle>
            <AlertDescription>
              Le blog n&apos;est pas configuré. Veuillez ajouter les variables d&apos;environnement NOTION_TOKEN et NOTION_DATABASE_ID.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Fetch posts from Notion
  let posts: Awaited<ReturnType<typeof queryPublishedPosts>> = []
  let error: string | null = null

  try {
    posts = await queryPublishedPosts()
  } catch (e) {
    console.error('Error fetching blog posts:', e)
    error = 'Impossible de charger les articles. Veuillez réessayer plus tard.'
  }

  // Extract unique tags for filtering (before filtering posts)
  const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort()

  // Filter posts by selected tag
  const filteredPosts = selectedTag 
    ? posts.filter((p) => p.tags.includes(selectedTag))
    : posts

  // Find featured post (first featured or first post) from filtered posts
  const featuredPost = filteredPosts.find((p) => p.featured) || filteredPosts[0]
  const otherPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id)

  return (
    <div className="py-12 md:py-20">
      <div className="container">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground">
            Actualités, tutoriels et insights sur RobotSkills et l&apos;univers de la robotique.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <FileText className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tags Filter */}
        {!error && allTags.length > 0 && (
          <BlogTagFilter tags={allTags} />
        )}

        {/* Filter info */}
        {selectedTag && filteredPosts.length > 0 && (
          <p className="text-sm text-muted-foreground mb-6">
            {filteredPosts.length} article{filteredPosts.length > 1 ? 's' : ''} avec le tag &quot;{selectedTag}&quot;
          </p>
        )}

        {/* Empty State */}
        {!error && posts.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Aucun article publié"
            description="Revenez bientôt pour découvrir nos premiers articles sur la robotique et RobotSkills."
          />
        )}

        {/* No results for filter */}
        {!error && posts.length > 0 && filteredPosts.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Aucun article trouvé"
            description={`Aucun article avec le tag "${selectedTag}". Essayez un autre filtre.`}
          />
        )}

        {/* Content */}
        {!error && filteredPosts.length > 0 && (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <div className="mb-12">
                <PostCard post={featuredPost} featured />
              </div>
            )}

            {/* Posts Grid */}
            {otherPosts.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
