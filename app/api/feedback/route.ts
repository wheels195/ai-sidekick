import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { conversationId, rating, feedback, messageId } = await request.json()

    if (!conversationId || (!rating && !feedback)) {
      return NextResponse.json(
        { error: 'Conversation ID and either rating or feedback is required' },
        { status: 400 }
      )
    }

    const { supabase } = createClient(request)

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Update the conversation with feedback
    const { error: updateError } = await supabase
      .from('user_conversations')
      .update({
        feedback_score: rating,
        feedback_text: feedback,
      })
      .eq('id', conversationId)
      .eq('user_id', user.id) // Ensure user can only update their own conversations

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    // If this is positive feedback, learn from it
    if (rating && rating >= 4) {
      const { data: conversation } = await supabase
        .from('user_conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (conversation && conversation.message_role === 'assistant') {
        // Store this as a successful pattern in global learning
        await supabase
          .from('global_conversations')
          .update({
            feedback_score: rating,
            effectiveness_rating: rating / 5.0
          })
          .eq('user_message_hash', await hashMessage(conversation.message_content))
      }
    }

    return NextResponse.json({
      message: 'Feedback saved successfully',
    })

  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function (duplicate from chat route - could be moved to utils)
async function hashMessage(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}