import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { supabase } = createClient(request)
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('user_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by session if provided
    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data: conversations, error } = await query

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }

    // Group conversations by session_id for chat history display
    const sessionGroups: Record<string, any[]> = {}
    conversations?.forEach(conv => {
      if (!sessionGroups[conv.session_id]) {
        sessionGroups[conv.session_id] = []
      }
      sessionGroups[conv.session_id].push(conv)
    })

    // Convert to chat format (user/assistant message pairs)
    const chatSessions = Object.entries(sessionGroups).map(([sessionId, messages]) => {
      // Sort messages within session by created_at
      const sortedMessages = messages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      // Group into conversation pairs
      const chatMessages = []
      for (let i = 0; i < sortedMessages.length; i++) {
        const msg = sortedMessages[i]
        chatMessages.push({
          id: msg.id,
          role: msg.message_role,
          content: msg.message_content,
          timestamp: msg.created_at,
          modelUsed: msg.model_used,
          tokenCount: msg.tokens_used,
          cost: msg.cost_breakdown?.totalCostUsd
        })
      }

      return {
        sessionId,
        messages: chatMessages,
        createdAt: sortedMessages[0]?.created_at,
        updatedAt: sortedMessages[sortedMessages.length - 1]?.created_at,
        messageCount: chatMessages.length,
        title: generateSessionTitle(chatMessages[0]?.content || 'Chat Session')
      }
    })

    // Sort sessions by most recent first
    chatSessions.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )

    return NextResponse.json({
      sessions: chatSessions,
      totalSessions: chatSessions.length,
      hasMore: conversations.length === limit
    })

  } catch (error) {
    console.error('Conversation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate readable session titles
function generateSessionTitle(firstMessage: string): string {
  // Clean and truncate first message for title
  const cleaned = firstMessage
    .replace(/[^\w\s]/g, '') // Remove special chars
    .trim()
    .substring(0, 50) // Limit length

  if (cleaned.length === 0) {
    return 'Chat Session'
  }

  if (cleaned.length === 50) {
    return cleaned + '...'
  }

  return cleaned
}