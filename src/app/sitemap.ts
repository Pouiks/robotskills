import { MetadataRoute } from 'next'
import { queryPublishedPosts, isNotionConfigured } from '@/lib/notion/notionClient'
import { locales, defaultLocale } from '@/i18n/config'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://robotskills.io'

// Helper to generate alternates for each locale
function generateAlternates(path: string): { [key: string]: string } {
  const alternates: { [key: string]: string } = {}
  for (const locale of locales) {
    alternates[locale] = `${BASE_URL}/${locale}${path}`
  }
  return alternates
}

// Helper to generate sitemap entries for all locales
function generateMultiLangEntry(
  path: string,
  lastModified: Date,
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
  priority: number
): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    lastModified,
    changeFrequency,
    priority: locale === defaultLocale ? priority : priority * 0.9,
    alternates: {
      languages: generateAlternates(path),
    },
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Pages statiques avec toutes les langues
  const staticPages: MetadataRoute.Sitemap = [
    ...generateMultiLangEntry('', now, 'weekly', 1),
    ...generateMultiLangEntry('/store', now, 'daily', 0.9),
    ...generateMultiLangEntry('/blog', now, 'weekly', 0.8),
    ...generateMultiLangEntry('/about', now, 'monthly', 0.6),
    ...generateMultiLangEntry('/contact', now, 'monthly', 0.5),
    ...generateMultiLangEntry('/careers', now, 'monthly', 0.5),
    ...generateMultiLangEntry('/dev', now, 'monthly', 0.7),
    ...generateMultiLangEntry('/dev/join', now, 'monthly', 0.6),
    ...generateMultiLangEntry('/docs', now, 'monthly', 0.6),
    ...generateMultiLangEntry('/docs/getting-started', now, 'monthly', 0.5),
    ...generateMultiLangEntry('/login', now, 'yearly', 0.3),
    ...generateMultiLangEntry('/terms', now, 'yearly', 0.2),
    ...generateMultiLangEntry('/privacy', now, 'yearly', 0.2),
    ...generateMultiLangEntry('/cookies', now, 'yearly', 0.2),
  ]

  // Articles de blog dynamiques
  let blogPages: MetadataRoute.Sitemap = []

  if (isNotionConfigured()) {
    try {
      const posts = await queryPublishedPosts()
      for (const post of posts) {
        const postDate = post.publishedAt ? new Date(post.publishedAt) : now
        // Blog posts are only in French for now (content from Notion)
        blogPages.push({
          url: `${BASE_URL}/fr/blog/${post.slug}`,
          lastModified: postDate,
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    } catch (error) {
      console.error('Error fetching blog posts for sitemap:', error)
    }
  }

  return [...staticPages, ...blogPages]
}
