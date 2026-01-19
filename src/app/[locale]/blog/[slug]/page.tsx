import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { getPublishedPostBySlug, getAllBlocks, formatDate, isNotionConfigured } from '@/lib/notion/notionClient'
import { NotionRenderer } from '@/components/notion/NotionRenderer'
import { BlogImage } from '@/components/blog/BlogImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

// ============================================
// METADATA
// ============================================

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  
  if (!isNotionConfigured()) {
    return {
      title: 'Article non trouvé',
      robots: { index: false, follow: false },
    }
  }

  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    return {
      title: 'Article non trouvé',
      robots: { index: false, follow: false },
    }
  }

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt
  const canonicalUrl = post.canonicalUrl || `${SITE_URL}/blog/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.lastEditedTime,
      images: post.coverUrl
        ? [
            {
              url: post.coverUrl,
              alt: post.coverAlt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params

  // Check configuration
  if (!isNotionConfigured()) {
    notFound()
  }

  // Fetch post and blocks
  const post = await getPublishedPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const blocks = await getAllBlocks(post.id)
  const displayDate = post.publishedAt || post.lastEditedTime

  return (
    <article className="py-12 md:py-20">
      <div className="container">
        {/* Back Link */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
              Retour au blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <header className="max-w-3xl mx-auto mb-12">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Title - H1 unique */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(displayDate)}
            </span>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverUrl && (
          <div className="relative w-full max-w-4xl mx-auto aspect-[2/1] rounded-xl overflow-hidden mb-12">
            <BlogImage
              src={post.coverUrl}
              alt={post.coverAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-3xl mx-auto">
          <NotionRenderer blocks={blocks} />
        </div>

        {/* Footer */}
        <footer className="max-w-3xl mx-auto mt-16 pt-8 border-t">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4" />
                Retour au blog
              </Link>
            </Button>
            
            {post.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tags:</span>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </footer>
      </div>
    </article>
  )
}
