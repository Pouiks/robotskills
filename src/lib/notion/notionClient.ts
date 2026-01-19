/**
 * Notion API Client - Server Only
 * 
 * Ce module fournit un wrapper pour l'API Notion pour alimenter le blog.
 * IMPORTANT: Ce code ne doit jamais être exécuté côté client.
 */

// ============================================
// TYPES
// ============================================

export interface NotionPost {
  id: string
  title: string
  slug: string
  excerpt: string
  coverUrl: string | null
  coverAlt: string
  tags: string[]
  publishedAt: string | null
  lastEditedTime: string
  featured: boolean
  locale: string
  seoTitle: string
  seoDescription: string
  canonicalUrl: string | null
}

export interface NotionRichText {
  type: 'text'
  text: {
    content: string
    link: { url: string } | null
  }
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  plain_text: string
  href: string | null
}

export interface NotionBlock {
  id: string
  type: string
  has_children: boolean
  [key: string]: unknown
}

interface NotionPageProperties {
  Title: { title: NotionRichText[] }
  Slug: { rich_text: NotionRichText[] }
  Status: { select: { name: string } | null }
  PublishedAt: { date: { start: string } | null }
  Excerpt: { rich_text: NotionRichText[] }
  Tags: { multi_select: { name: string; color: string }[] }
  Cover: { files: Array<{ file?: { url: string }; external?: { url: string } }> }
  cover_alt: { rich_text: NotionRichText[] }
  seo_title: { rich_text: NotionRichText[] }
  seo_description: { rich_text: NotionRichText[] }
  canonical_url: { rich_text: NotionRichText[] }
  featured: { checkbox: boolean }
  local: { select: { name: string } | null }
}

interface NotionPage {
  id: string
  last_edited_time: string
  properties: NotionPageProperties
}

interface NotionQueryResponse {
  results: NotionPage[]
  has_more: boolean
  next_cursor: string | null
}

interface NotionBlocksResponse {
  results: NotionBlock[]
  has_more: boolean
  next_cursor: string | null
}

// ============================================
// CONFIGURATION
// ============================================

const NOTION_API_VERSION = '2022-06-28'
const NOTION_BASE_URL = 'https://api.notion.com/v1'

function getNotionToken(): string {
  const token = process.env.NOTION_TOKEN
  if (!token) {
    throw new Error('NOTION_TOKEN is not configured')
  }
  return token
}

function getNotionDatabaseId(): string {
  const dbId = process.env.NOTION_DATABASE_ID
  if (!dbId) {
    throw new Error('NOTION_DATABASE_ID is not configured')
  }
  return dbId
}

// ============================================
// HELPERS
// ============================================

/**
 * Extrait le texte brut d'un champ rich_text Notion
 */
export function getPlainText(richText: NotionRichText[] | undefined): string {
  if (!richText || richText.length === 0) return ''
  return richText.map((rt) => rt.plain_text).join('')
}

/**
 * Extrait l'URL de la cover (files[0])
 */
function getCoverUrl(files: NotionPageProperties['Cover']['files']): string | null {
  if (!files || files.length === 0) return null
  const first = files[0]
  return first.file?.url || first.external?.url || null
}

/**
 * Formate une date ISO en français
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Transforme une page Notion en NotionPost
 */
function pageToPost(page: NotionPage): NotionPost {
  const props = page.properties
  
  const title = getPlainText(props.Title?.title)
  const seoTitle = getPlainText(props.seo_title?.rich_text)
  
  return {
    id: page.id,
    title,
    slug: getPlainText(props.Slug?.rich_text),
    excerpt: getPlainText(props.Excerpt?.rich_text),
    coverUrl: getCoverUrl(props.Cover?.files),
    coverAlt: getPlainText(props.cover_alt?.rich_text) || seoTitle || title,
    tags: props.Tags?.multi_select?.map((t) => t.name) || [],
    publishedAt: props.PublishedAt?.date?.start || null,
    lastEditedTime: page.last_edited_time,
    featured: props.featured?.checkbox || false,
    locale: props.local?.select?.name || 'fr',
    seoTitle: seoTitle || title,
    seoDescription: getPlainText(props.seo_description?.rich_text) || getPlainText(props.Excerpt?.rich_text),
    canonicalUrl: getPlainText(props.canonical_url?.rich_text) || null,
  }
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch wrapper avec headers Notion
 */
async function notionFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${NOTION_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${getNotionToken()}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'force-cache',
    next: { revalidate: 60 }, // Revalider toutes les 60 secondes
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Notion API error:', response.status, error)
    throw new Error(`Notion API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Récupère tous les articles publiés, triés par date
 */
export async function queryPublishedPosts(): Promise<NotionPost[]> {
  const allPosts: NotionPost[] = []
  let hasMore = true
  let cursor: string | undefined = undefined

  while (hasMore) {
    const response: NotionQueryResponse = await notionFetch<NotionQueryResponse>(
      `/databases/${getNotionDatabaseId()}/query`,
      {
        method: 'POST',
        body: JSON.stringify({
          filter: {
            property: 'Status',
            select: {
              equals: 'Published',
            },
          },
          sorts: [
            {
              property: 'PublishedAt',
              direction: 'descending',
            },
            {
              timestamp: 'last_edited_time',
              direction: 'descending',
            },
          ],
          start_cursor: cursor,
          page_size: 100,
        }),
      }
    )

    const posts = response.results.map(pageToPost)
    allPosts.push(...posts)

    hasMore = response.has_more
    cursor = response.next_cursor || undefined
  }

  // Tri supplémentaire: PublishedAt desc (null last), puis lastEditedTime desc
  return allPosts.sort((a, b) => {
    // Si les deux ont une date de publication
    if (a.publishedAt && b.publishedAt) {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    }
    // Null dates go last
    if (a.publishedAt && !b.publishedAt) return -1
    if (!a.publishedAt && b.publishedAt) return 1
    // Fallback sur lastEditedTime
    return new Date(b.lastEditedTime).getTime() - new Date(a.lastEditedTime).getTime()
  })
}

/**
 * Récupère un article publié par son slug
 */
export async function getPublishedPostBySlug(slug: string): Promise<NotionPost | null> {
  const response = await notionFetch<NotionQueryResponse>(
    `/databases/${getNotionDatabaseId()}/query`,
    {
      method: 'POST',
      body: JSON.stringify({
        filter: {
          and: [
            {
              property: 'Status',
              select: {
                equals: 'Published',
              },
            },
            {
              property: 'Slug',
              rich_text: {
                equals: slug,
              },
            },
          ],
        },
        page_size: 1,
      }),
    }
  )

  if (response.results.length === 0) {
    return null
  }

  return pageToPost(response.results[0])
}

/**
 * Récupère tous les blocks d'une page (avec pagination)
 */
export async function getAllBlocks(pageId: string): Promise<NotionBlock[]> {
  const allBlocks: NotionBlock[] = []
  let hasMore = true
  let cursor: string | undefined = undefined

  while (hasMore) {
    const response: NotionBlocksResponse = await notionFetch<NotionBlocksResponse>(
      `/blocks/${pageId}/children${cursor ? `?start_cursor=${cursor}` : ''}`,
      {
        method: 'GET',
      }
    )

    allBlocks.push(...response.results)

    hasMore = response.has_more
    cursor = response.next_cursor || undefined
  }

  return allBlocks
}

/**
 * Vérifie si la configuration Notion est présente
 */
export function isNotionConfigured(): boolean {
  return !!(process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID)
}
