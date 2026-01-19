'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BlogTagFilterProps {
  tags: string[]
}

export function BlogTagFilter({ tags }: BlogTagFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedTag = searchParams.get('tag')

  const handleTagClick = (tag: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (tag === null || tag === selectedTag) {
      // Deselect: remove tag filter
      params.delete('tag')
    } else {
      // Select new tag
      params.set('tag', tag)
    }

    const queryString = params.toString()
    router.push(queryString ? `/blog?${queryString}` : '/blog', { scroll: false })
  }

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {/* "Tous" button */}
      <Badge
        variant={!selectedTag ? 'default' : 'outline'}
        className={cn(
          'cursor-pointer transition-colors',
          !selectedTag 
            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
            : 'hover:bg-muted'
        )}
        onClick={() => handleTagClick(null)}
      >
        Tous
      </Badge>
      
      {/* Tag buttons */}
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTag === tag ? 'default' : 'outline'}
          className={cn(
            'cursor-pointer transition-colors',
            selectedTag === tag 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'hover:bg-muted'
          )}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}
