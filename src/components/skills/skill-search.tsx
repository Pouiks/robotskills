'use client'

import { useState, useMemo } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SkillCard } from './skill-card'
import type { SkillWithDetails } from '@/types'
import { SKILL_CATEGORIES } from '@/types'
import type { UserRobot } from '@/server/robots'

interface SkillSearchProps {
  skills: SkillWithDetails[]
  initialCategory?: string
  initialSearch?: string
  userRobots?: UserRobot[]
}

type SortOption = 'recent' | 'popular' | 'price-asc' | 'price-desc' | 'name'
type PriceFilter = 'all' | 'free' | 'paid'

export function SkillSearch({ skills, initialCategory, initialSearch, userRobots = [] }: SkillSearchProps) {
  const t = useTranslations('store')
  const [search, setSearch] = useState(initialSearch || '')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all')
  const [compatibleOnly, setCompatibleOnly] = useState(false)

  // Extraire les OEM IDs des robots de l'utilisateur
  const userOemIds = useMemo(() => userRobots.map((robot) => robot.oem.id), [userRobots])

  const filteredSkills = useMemo(() => {
    let result = [...skills]

    // Filtre par recherche
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchLower) ||
          skill.shortDescription?.toLowerCase().includes(searchLower) ||
          skill.category?.toLowerCase().includes(searchLower)
      )
    }

    // Filtre par catégorie
    if (selectedCategory) {
      result = result.filter((skill) => skill.category === selectedCategory)
    }

    // Filtre par prix
    if (priceFilter === 'free') {
      result = result.filter((skill) => skill.isFree)
    } else if (priceFilter === 'paid') {
      result = result.filter((skill) => !skill.isFree)
    }

    // Filtre par compatibilité avec les robots de l'utilisateur
    if (compatibleOnly && userOemIds.length > 0) {
      result = result.filter((skill) => {
        const skillOemIds = (skill.compatibleOems ?? []).map((oem) => oem.id)
        return skillOemIds.some((oemId) => userOemIds.includes(oemId))
      })
    }

    // Tri
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.downloadCount - a.downloadCount)
        break
      case 'price-asc':
        result.sort((a, b) => a.priceCents - b.priceCents)
        break
      case 'price-desc':
        result.sort((a, b) => b.priceCents - a.priceCents)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return result
  }, [skills, search, selectedCategory, sortBy, priceFilter, compatibleOnly, userOemIds])

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category === selectedCategory ? null : category)
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory(null)
    setSortBy('recent')
    setPriceFilter('all')
    setCompatibleOnly(false)
  }

  const hasActiveFilters =
    search || selectedCategory || sortBy !== 'recent' || priceFilter !== 'all' || compatibleOnly

  return (
    <div>
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {/* Sort & Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="default">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {t('filters')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t('search.sortBy')}</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'recent'}
                onCheckedChange={() => setSortBy('recent')}
              >
                {t('search.mostRecent')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'popular'}
                onCheckedChange={() => setSortBy('popular')}
              >
                {t('search.mostPopular')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'name'}
                onCheckedChange={() => setSortBy('name')}
              >
                {t('search.nameAZ')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'price-asc'}
                onCheckedChange={() => setSortBy('price-asc')}
              >
                {t('search.priceAsc')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === 'price-desc'}
                onCheckedChange={() => setSortBy('price-desc')}
              >
                {t('search.priceDesc')}
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t('search.price')}</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={priceFilter === 'all'}
                onCheckedChange={() => setPriceFilter('all')}
              >
                {t('search.all')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={priceFilter === 'free'}
                onCheckedChange={() => setPriceFilter('free')}
              >
                {t('search.freeOnly')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={priceFilter === 'paid'}
                onCheckedChange={() => setPriceFilter('paid')}
              >
                {t('search.paidOnly')}
              </DropdownMenuCheckboxItem>

              {userRobots.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{t('search.compatibility')}</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={compatibleOnly}
                    onCheckedChange={(checked) => setCompatibleOnly(checked === true)}
                  >
                    {t('search.myRobotsOnly')}
                  </DropdownMenuCheckboxItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button variant="ghost" size="default" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              {t('search.clear')}
            </Button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge
          variant={!selectedCategory ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => handleCategoryClick(null)}
        >
          {t('search.all')}
        </Badge>
        {SKILL_CATEGORIES.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            className="cursor-pointer capitalize"
            onClick={() => handleCategoryClick(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground mb-4">
        {filteredSkills.length} skill{filteredSkills.length > 1 ? 's' : ''}{' '}
        {filteredSkills.length > 1 ? t('search.resultsCount', { count: filteredSkills.length, plural: 's' }).split(' ').slice(-1) : t('search.resultsCount', { count: filteredSkills.length, plural: '' }).split(' ').slice(-1)}
        {search && ` ${t('search.resultsFor', { search })}`}
        {selectedCategory && ` ${t('search.resultsIn', { category: selectedCategory })}`}
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">{t('search.noResults')}</div>
          <Button variant="outline" onClick={clearFilters}>
            {t('search.resetFilters')}
          </Button>
        </div>
      ) : (
        <div className="skill-grid">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} userRobots={userRobots} />
          ))}
        </div>
      )}
    </div>
  )
}
