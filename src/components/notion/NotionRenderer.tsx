import { AlertCircle, Info, AlertTriangle, CheckCircle, Flame } from 'lucide-react'
import { BlogImage } from '@/components/blog/BlogImage'
import type { NotionBlock, NotionRichText } from '@/lib/notion/notionClient'

// ============================================
// TYPES
// ============================================

interface RichTextItem {
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

interface BlockContent {
  rich_text?: RichTextItem[]
  caption?: RichTextItem[]
  language?: string
  icon?: { type: string; emoji?: string }
  color?: string
  url?: string
  type?: string
  file?: { url: string }
  external?: { url: string }
}

// ============================================
// RICH TEXT RENDERER
// ============================================

function renderRichText(richText: RichTextItem[] | NotionRichText[] | undefined): React.ReactNode {
  if (!richText || richText.length === 0) return null

  return richText.map((item, index) => {
    const { annotations, plain_text, href } = item as RichTextItem
    let content: React.ReactNode = plain_text

    // Apply annotations
    if (annotations?.code) {
      content = (
        <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm">
          {content}
        </code>
      )
    }
    if (annotations?.bold) {
      content = <strong className="font-semibold">{content}</strong>
    }
    if (annotations?.italic) {
      content = <em>{content}</em>
    }
    if (annotations?.strikethrough) {
      content = <s>{content}</s>
    }
    if (annotations?.underline) {
      content = <u>{content}</u>
    }

    // Handle links
    if (href) {
      content = (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:no-underline"
        >
          {content}
        </a>
      )
    }

    return <span key={index}>{content}</span>
  })
}

// ============================================
// BLOCK RENDERERS
// ============================================

function ParagraphBlock({ block }: { block: NotionBlock }) {
  const content = block.paragraph as BlockContent
  const text = renderRichText(content?.rich_text)
  
  if (!text) return null
  
  return (
    <p className="text-base leading-relaxed mb-4">
      {text}
    </p>
  )
}

function Heading2Block({ block }: { block: NotionBlock }) {
  const content = block.heading_2 as BlockContent
  return (
    <h2 className="text-2xl font-bold mt-8 mb-4">
      {renderRichText(content?.rich_text)}
    </h2>
  )
}

function Heading3Block({ block }: { block: NotionBlock }) {
  const content = block.heading_3 as BlockContent
  return (
    <h3 className="text-xl font-semibold mt-6 mb-3">
      {renderRichText(content?.rich_text)}
    </h3>
  )
}

function BulletedListItemBlock({ block }: { block: NotionBlock }) {
  const content = block.bulleted_list_item as BlockContent
  return (
    <li className="ml-6 list-disc">
      {renderRichText(content?.rich_text)}
    </li>
  )
}

function NumberedListItemBlock({ block }: { block: NotionBlock }) {
  const content = block.numbered_list_item as BlockContent
  return (
    <li className="ml-6 list-decimal">
      {renderRichText(content?.rich_text)}
    </li>
  )
}

function ImageBlock({ block }: { block: NotionBlock }) {
  const content = block.image as BlockContent
  const url = content?.file?.url || content?.external?.url
  const caption = content?.caption
  const altText = caption && caption.length > 0 
    ? caption.map((c) => c.plain_text).join('') 
    : ''

  if (!url) return null

  return (
    <figure className="my-6">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
        <BlogImage
          src={url}
          alt={altText}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>
      {altText && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2">
          {altText}
        </figcaption>
      )}
    </figure>
  )
}

function QuoteBlock({ block }: { block: NotionBlock }) {
  const content = block.quote as BlockContent
  return (
    <blockquote className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground">
      {renderRichText(content?.rich_text)}
    </blockquote>
  )
}

function CalloutBlock({ block }: { block: NotionBlock }) {
  const content = block.callout as BlockContent
  const emoji = content?.icon?.emoji
  const color = content?.color || 'gray'
  
  // Map colors to Tailwind classes
  const colorClasses: Record<string, string> = {
    gray: 'bg-muted border-muted-foreground/20',
    gray_background: 'bg-muted border-muted-foreground/20',
    blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    blue_background: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    green_background: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
    yellow_background: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
    red: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    red_background: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    purple: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
    purple_background: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
  }

  // Icon based on color/emoji
  const IconComponent = () => {
    if (emoji) {
      return <span className="text-lg">{emoji}</span>
    }
    
    switch (color) {
      case 'blue':
      case 'blue_background':
        return <Info className="h-5 w-5 text-blue-500" />
      case 'green':
      case 'green_background':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'yellow':
      case 'yellow_background':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'red':
      case 'red_background':
        return <Flame className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <aside className={`flex gap-3 p-4 my-4 rounded-lg border ${colorClasses[color] || colorClasses.gray}`}>
      <div className="flex-shrink-0 mt-0.5">
        <IconComponent />
      </div>
      <div className="flex-1 text-sm">
        {renderRichText(content?.rich_text)}
      </div>
    </aside>
  )
}

function CodeBlock({ block }: { block: NotionBlock }) {
  const content = block.code as BlockContent
  const language = content?.language || 'text'
  const code = content?.rich_text?.map((rt) => rt.plain_text).join('') || ''

  return (
    <div className="my-4">
      <div className="bg-muted/50 px-3 py-1 rounded-t-lg border border-b-0 text-xs text-muted-foreground">
        {language}
      </div>
      <pre className="bg-muted rounded-b-lg border p-4 overflow-x-auto">
        <code className="text-sm font-mono">{code}</code>
      </pre>
    </div>
  )
}

function DividerBlock() {
  return <hr className="my-8 border-muted-foreground/20" />
}

// ============================================
// MAIN RENDERER
// ============================================

interface NotionRendererProps {
  blocks: NotionBlock[]
}

export function NotionRenderer({ blocks }: NotionRendererProps) {
  // Group consecutive list items
  const groupedBlocks: (NotionBlock | NotionBlock[])[] = []
  let currentListType: string | null = null
  let currentList: NotionBlock[] = []

  for (const block of blocks) {
    if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
      if (currentListType === block.type) {
        currentList.push(block)
      } else {
        if (currentList.length > 0) {
          groupedBlocks.push([...currentList])
        }
        currentListType = block.type
        currentList = [block]
      }
    } else {
      if (currentList.length > 0) {
        groupedBlocks.push([...currentList])
        currentList = []
        currentListType = null
      }
      groupedBlocks.push(block)
    }
  }

  // Don't forget the last list
  if (currentList.length > 0) {
    groupedBlocks.push(currentList)
  }

  return (
    <div className="notion-content">
      {groupedBlocks.map((item, index) => {
        // Handle grouped lists
        if (Array.isArray(item)) {
          const listType = item[0].type
          const ListTag = listType === 'bulleted_list_item' ? 'ul' : 'ol'
          
          return (
            <ListTag key={index} className="mb-4 space-y-1">
              {item.map((block) => {
                if (block.type === 'bulleted_list_item') {
                  return <BulletedListItemBlock key={block.id} block={block} />
                }
                return <NumberedListItemBlock key={block.id} block={block} />
              })}
            </ListTag>
          )
        }

        // Handle individual blocks
        const block = item
        switch (block.type) {
          case 'paragraph':
            return <ParagraphBlock key={block.id} block={block} />
          case 'heading_2':
            return <Heading2Block key={block.id} block={block} />
          case 'heading_3':
            return <Heading3Block key={block.id} block={block} />
          case 'image':
            return <ImageBlock key={block.id} block={block} />
          case 'quote':
            return <QuoteBlock key={block.id} block={block} />
          case 'callout':
            return <CalloutBlock key={block.id} block={block} />
          case 'code':
            return <CodeBlock key={block.id} block={block} />
          case 'divider':
            return <DividerBlock key={block.id} />
          default:
            // Log unknown blocks in development
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Unknown Notion block type: ${block.type}`)
            }
            return null
        }
      })}
    </div>
  )
}
