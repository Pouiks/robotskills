import Link from 'next/link'
import { Calendar, Star } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BlogImage } from '@/components/blog/BlogImage'
import type { NotionPost } from '@/lib/notion/notionClient'
import { formatDate } from '@/lib/notion/notionClient'

interface PostCardProps {
  post: NotionPost
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const displayDate = post.publishedAt || post.lastEditedTime
  
  if (featured) {
    return (
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Cover Image */}
          <div className="relative h-64 md:h-auto min-h-[250px]">
            {post.coverUrl ? (
              <BlogImage
                src={post.coverUrl}
                alt={post.coverAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
            )}
            {post.featured && (
              <Badge className="absolute top-4 left-4 gap-1 z-10">
                <Star className="h-3 w-3" />
                À la une
              </Badge>
            )}
          </div>
          
          {/* Content */}
          <CardContent className="p-8 flex flex-col justify-center">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Title */}
            <Link href={`/blog/${post.slug}`}>
              <h2 className="text-2xl font-bold mb-4 hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>
            </Link>
            
            {/* Excerpt */}
            <p className="text-muted-foreground mb-6 line-clamp-3">
              {post.excerpt}
            </p>
            
            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(displayDate)}
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  // Standard card
  return (
    <Card className="card-hover overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-40">
        {post.coverUrl ? (
          <BlogImage
            src={post.coverUrl}
            alt={post.coverAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
        )}
        {post.featured && (
          <Badge className="absolute top-3 left-3 gap-1 text-xs z-10">
            <Star className="h-3 w-3" />
            À la une
          </Badge>
        )}
      </div>
      
      <CardHeader>
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>
      </CardHeader>
      
      <CardContent>
        {/* Excerpt */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {post.excerpt}
        </p>
        
        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(displayDate)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-40 bg-muted animate-pulse" />
      <CardHeader>
        <div className="flex gap-2 mb-2">
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          <div className="h-5 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-6 w-full bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}
