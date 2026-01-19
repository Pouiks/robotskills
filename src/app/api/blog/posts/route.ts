import { NextRequest, NextResponse } from 'next/server'
import { queryPublishedPosts, isNotionConfigured } from '@/lib/notion/notionClient'

export async function GET(request: NextRequest) {
  // Check if Notion is configured
  if (!isNotionConfigured()) {
    return NextResponse.json({ posts: [], error: 'Blog not configured' }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    
    const allPosts = await queryPublishedPosts()
    const posts = allPosts.slice(0, limit)
    
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ posts: [], error: 'Failed to fetch posts' }, { status: 500 })
  }
}
