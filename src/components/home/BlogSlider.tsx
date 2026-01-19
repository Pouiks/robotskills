'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Loader2, Newspaper } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BlogImage } from '@/components/blog/BlogImage'
import type { NotionPost } from '@/lib/notion/notionClient'

interface BlogSliderProps {
  initialPosts?: NotionPost[]
}

export function BlogSlider({ initialPosts }: BlogSliderProps) {
  const [posts, setPosts] = useState<NotionPost[]>(initialPosts || [])
  const [loading, setLoading] = useState(!initialPosts)
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' } // Start loading 100px before visible
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Load posts when visible (if not already loaded)
  useEffect(() => {
    if (isVisible && !initialPosts && posts.length === 0) {
      loadPosts()
    }
  }, [isVisible, initialPosts, posts.length])

  async function loadPosts() {
    setLoading(true)
    try {
      const response = await fetch('/api/blog/posts?limit=6')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error loading blog posts:', error)
    }
    setLoading(false)
  }

  const visiblePosts = posts.slice(0, 6)
  const maxIndex = Math.max(0, visiblePosts.length - getVisibleCount())

  function getVisibleCount() {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth < 640) return 1
    if (window.innerWidth < 1024) return 2
    return 3
  }

  function next() {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  function prev() {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <section ref={containerRef} className="py-20 md:py-28 bg-muted/40">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Newspaper className="h-5 w-5" />
              <span className="text-sm font-medium">Blog</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Actualités & Ressources
            </h2>
            <p className="text-muted-foreground mt-2">
              Restez informé des dernières nouveautés de l'écosystème robotique
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link href="/blog">
              Voir tous les articles
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!loading && visiblePosts.length === 0 && (
          <div className="text-center py-16">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun article disponible pour le moment</p>
          </div>
        )}

        {/* Slider */}
        {!loading && visiblePosts.length > 0 && (
          <div className="relative">
            {/* Navigation Buttons */}
            {visiblePosts.length > getVisibleCount() && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-background shadow-lg"
                  onClick={prev}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-background shadow-lg"
                  onClick={next}
                  disabled={currentIndex >= maxIndex}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Cards Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out gap-6"
                style={{
                  transform: `translateX(-${currentIndex * (100 / getVisibleCount() + 2)}%)`,
                }}
              >
                {visiblePosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0"
                  >
                    <Card className="h-full overflow-hidden card-hover group">
                      {/* Image */}
                      <div className="relative h-48 bg-muted">
                        {post.coverUrl ? (
                          <BlogImage
                            src={post.coverUrl}
                            alt={post.coverAlt}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Newspaper className="h-12 w-12 text-primary/40" />
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-5">
                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Title */}
                        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        
                        {/* Excerpt */}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                        
                        {/* Date */}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(post.publishedAt)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Dots */}
            {visiblePosts.length > 1 && (
              <div className="flex justify-center gap-2 mt-6 md:hidden">
                {visiblePosts.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
