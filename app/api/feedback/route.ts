import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      conversationId, 
      rating, 
      feedback, 
      messageId, 
      reaction, 
      type, 
      conversationLength, 
      conversationDuration 
    } = await request.json()

    // Handle different types of feedback
    if (type === 'emoji_reaction' && messageId && reaction) {
      // Handle emoji reaction feedback
      return await handleEmojiReaction(request, {
        messageId,
        reaction,
        conversationLength,
        conversationDuration
      })
    }

    if (type === 'conversation_rating' && rating) {
      // Handle conversation rating feedback
      return await handleConversationRating(request, {
        rating,
        conversationLength,
        conversationDuration
      })
    }

    // Handle traditional rating/feedback
    if (!conversationId || (!rating && !feedback)) {
      return NextResponse.json(
        { error: 'Invalid feedback data provided' },
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

// Handle emoji reaction feedback
async function handleEmojiReaction(
  request: NextRequest, 
  data: {
    messageId: string
    reaction: string
    conversationLength?: number
    conversationDuration?: number
  }
) {
  const { supabase } = createClient(request)
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    // Allow anonymous feedback for now
    console.log('Anonymous emoji reaction:', data)
    return NextResponse.json({ message: 'Reaction recorded' })
  }

  try {
    // Find the assistant message this reaction is for
    const { data: message } = await supabase
      .from('user_conversations')
      .select('*')
      .eq('id', data.messageId)
      .eq('message_role', 'assistant')
      .single()

    if (message) {
      // Update the message with reaction
      await supabase
        .from('user_conversations')
        .update({
          feedback_score: getScoreFromEmoji(data.reaction),
          feedback_text: `emoji_reaction:${data.reaction}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.messageId)
        .eq('user_id', user.id)

      // Store engagement metrics
      await supabase
        .from('user_sessions')
        .upsert({
          user_id: user.id,
          session_id: message.session_id || 'anonymous',
          last_activity: new Date().toISOString(),
          message_count: data.conversationLength || 1,
          session_duration_ms: data.conversationDuration || 0,
          engagement_score: getEngagementScore(data.reaction, data.conversationLength || 1)
        }, {
          onConflict: 'user_id,session_id'
        })

      // Update global learning if positive reaction
      if (isPositiveReaction(data.reaction)) {
        await supabase
          .from('global_conversations')
          .update({
            feedback_score: getScoreFromEmoji(data.reaction),
            effectiveness_rating: getScoreFromEmoji(data.reaction) / 5.0
          })
          .eq('user_message_hash', await hashMessage(message.message_content))
      }
    }

    return NextResponse.json({ message: 'Emoji reaction saved' })

  } catch (error) {
    console.error('Error saving emoji reaction:', error)
    return NextResponse.json({ message: 'Reaction noted' }) // Fail gracefully
  }
}

// Helper functions for emoji reactions
function getScoreFromEmoji(emoji: string): number {
  const emojiScores: Record<string, number> = {
    '🔥': 5, // Fire - Excellent
    '💡': 4, // Lightbulb - Very helpful
    '👍': 3, // Thumbs up - Good
    '😕': 1  // Confused - Not helpful
  }
  return emojiScores[emoji] || 3
}

function isPositiveReaction(emoji: string): boolean {
  return ['🔥', '💡', '👍'].includes(emoji)
}

function getEngagementScore(reaction: string, messageCount: number): number {
  const baseScore = getScoreFromEmoji(reaction)
  const lengthBonus = Math.min(messageCount * 0.1, 1) // Up to 1 point for long conversations
  return Math.min(baseScore + lengthBonus, 5)
}

// Handle conversation rating feedback
async function handleConversationRating(
  request: NextRequest,
  data: {
    rating: number
    conversationLength?: number
    conversationDuration?: number
  }
) {
  const { supabase } = createClient(request)
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    // Allow anonymous feedback
    console.log('Anonymous conversation rating:', data)
    return NextResponse.json({ message: 'Rating recorded' })
  }

  try {
    // Store engagement metrics
    const sessionId = crypto.randomUUID() // For now, generate a session ID
    await supabase
      .from('user_sessions')
      .upsert({
        user_id: user.id,
        session_id: sessionId,
        last_activity: new Date().toISOString(),
        message_count: data.conversationLength || 1,
        session_duration_ms: data.conversationDuration || 0,
        engagement_score: data.rating,
        conversation_rating: data.rating
      }, {
        onConflict: 'user_id,session_id'
      })

    // Store in user learning if this is a positive rating
    if (data.rating >= 4) {
      await supabase
        .from('user_learning')
        .upsert({
          user_id: user.id,
          category: 'conversation_quality',
          learned_preference: `positive_conversation_pattern:${data.rating}`,
          confidence_score: data.rating / 5.0,
          context_factors: {
            conversation_length: data.conversationLength,
            conversation_duration: data.conversationDuration,
            rating: data.rating
          }
        }, {
          onConflict: 'user_id,category'
        })
    }

    return NextResponse.json({ message: 'Conversation rating saved' })

  } catch (error) {
    console.error('Error saving conversation rating:', error)
    return NextResponse.json({ message: 'Rating noted' }) // Fail gracefully
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