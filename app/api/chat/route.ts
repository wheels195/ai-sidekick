import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

// Initialize OpenAI client only when needed
const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

const LANDSCAPING_SYSTEM_PROMPT = `You are a specialized AI assistant for landscaping business owners. You have deep expertise in:

BUSINESS GROWTH:
- Local SEO strategies specific to landscaping businesses
- Seasonal business planning and cash flow management
- Pricing strategies for landscaping services
- Upselling and cross-selling landscaping services
- Customer retention strategies
- Review management and reputation building

MARKETING & SALES:
- Google My Business optimization for landscapers
- Content creation (blogs, social media, website copy)
- Local advertising strategies
- Lead generation techniques
- Customer communication and follow-up systems
- Competitive analysis and differentiation

OPERATIONAL EXCELLENCE:
- Seasonal service planning and preparation
- Equipment recommendations and maintenance
- Crew management and training
- Quality control and customer satisfaction
- Estimating and quoting best practices

LANDSCAPING EXPERTISE:
- Plant selection and care advice
- Lawn care best practices
- Tree and shrub maintenance
- Seasonal landscaping trends
- Problem diagnosis and solutions
- Sustainable landscaping practices

INSTRUCTIONS:
1. Always provide actionable, specific advice tailored to landscaping businesses
2. Ask clarifying questions about location, business size, services offered, and specific challenges
3. Provide local market insights when location is mentioned
4. Suggest concrete next steps the business owner can implement
5. Focus on profitable growth strategies and customer value
6. Be encouraging and supportive while maintaining professional expertise
7. If asked about non-landscaping topics, relate them back to landscaping business context when possible

Remember: You're not just an AI assistant - you're a trusted business advisor who understands the unique challenges and opportunities in the landscaping industry.`

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { messages, sessionId } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Only try Supabase if URL is configured
    let user = null
    let userProfile = null
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { supabase } = createClient(request)
        
        // Get authenticated user (optional - chat works without auth but no storage)
        const { data: authData, error: userError } = await supabase.auth.getUser()
        user = authData?.user
        
        // Get user profile for context if authenticated
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          userProfile = profile
        }
      } catch (error) {
        console.log('Supabase not available, continuing without user context')
      }
    }

    // Enhance system prompt with user context
    let enhancedSystemPrompt = LANDSCAPING_SYSTEM_PROMPT
    if (userProfile) {
      enhancedSystemPrompt += `\n\nUSER BUSINESS CONTEXT:
- Business: ${userProfile.business_name || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}
- Services: ${userProfile.services?.join(', ') || 'Not specified'}
- Team Size: ${userProfile.team_size || 'Not specified'}
- Target Customers: ${userProfile.target_customers || 'Not specified'}
- Years in Business: ${userProfile.years_in_business || 'Not specified'}
- Main Challenges: ${userProfile.main_challenges?.join(', ') || 'Not specified'}

Use this context to provide more personalized and relevant advice.`
    }

    // Prepare messages with enhanced system prompt
    const systemMessage = {
      role: 'system' as const,
      content: enhancedSystemPrompt
    }

    const chatMessages = [systemMessage, ...messages]

    // Store user message if authenticated and Supabase is available
    const currentUserMessage = messages[messages.length - 1]
    let userMessageId = null
    
    if (user && currentUserMessage?.role === 'user' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { supabase } = createClient(request)
        const { data: storedMessage } = await supabase
          .from('user_conversations')
          .insert({
            user_id: user.id,
            session_id: sessionId || crypto.randomUUID(),
            message_role: 'user',
            message_content: currentUserMessage.content,
            context_used: userProfile ? {
              business_name: userProfile.business_name,
              location: userProfile.location,
              services: userProfile.services,
              team_size: userProfile.team_size
            } : null
          })
          .select('id')
          .single()
        
        userMessageId = storedMessage?.id
      } catch (error) {
        console.log('Could not store user message:', error.message)
      }
    }

    // Call OpenAI API
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency
      messages: chatMessages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: false,
    })

    const assistantMessage = completion.choices[0]?.message

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      )
    }

    const responseTime = Date.now() - startTime

    // Store assistant response if authenticated and Supabase is available
    if (user && assistantMessage.content && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { supabase } = createClient(request)
        
        await supabase
          .from('user_conversations')
          .insert({
            user_id: user.id,
            session_id: sessionId || crypto.randomUUID(),
            message_role: 'assistant',
            message_content: assistantMessage.content,
            context_used: userProfile ? {
              business_name: userProfile.business_name,
              location: userProfile.location,
              services: userProfile.services,
              team_size: userProfile.team_size
            } : null,
            response_time_ms: responseTime,
            tokens_used: completion.usage?.total_tokens
          })

        // Store anonymized data for global learning
        await supabase
          .from('global_conversations')
          .insert({
            business_type: 'landscaping',
            message_category: extractMessageCategory(currentUserMessage?.content || ''),
            user_message_hash: await hashMessage(currentUserMessage?.content || ''),
            response_pattern: extractResponsePattern(assistantMessage.content),
            context_factors: {
              has_location: !!userProfile?.location,
              team_size_range: getTeamSizeRange(userProfile?.team_size),
              years_in_business_range: getYearsRange(userProfile?.years_in_business),
              services_count: userProfile?.services?.length || 0
            }
          })
      } catch (error) {
        console.log('Could not store conversation data:', error.message)
      }
    }

    return NextResponse.json({
      message: {
        role: assistantMessage.role,
        content: assistantMessage.content,
      },
      usage: completion.usage,
      sessionId: sessionId || crypto.randomUUID()
    })

  } catch (error) {
    console.error('OpenAI API Error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions for learning system
function extractMessageCategory(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('seo') || lowerMessage.includes('google') || lowerMessage.includes('rank')) {
    return 'seo'
  } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('charge')) {
    return 'pricing'
  } else if (lowerMessage.includes('market') || lowerMessage.includes('advertis') || lowerMessage.includes('social media')) {
    return 'marketing'
  } else if (lowerMessage.includes('upsell') || lowerMessage.includes('service') || lowerMessage.includes('offer')) {
    return 'services'
  } else if (lowerMessage.includes('customer') || lowerMessage.includes('client') || lowerMessage.includes('review')) {
    return 'customer_relations'
  } else if (lowerMessage.includes('season') || lowerMessage.includes('winter') || lowerMessage.includes('spring') || lowerMessage.includes('summer') || lowerMessage.includes('fall')) {
    return 'seasonal'
  } else {
    return 'general'
  }
}

function extractResponsePattern(response: string): string {
  // Extract key patterns from successful responses for learning
  const patterns = []
  
  if (response.includes('Here are') || response.includes('Here\'s')) patterns.push('structured_list')
  if (response.includes('1.') && response.includes('2.')) patterns.push('numbered_steps')
  if (response.includes('Consider') || response.includes('Try')) patterns.push('actionable_suggestions')
  if (response.includes('$') || response.includes('price')) patterns.push('pricing_specific')
  if (response.includes('location') || response.includes('local')) patterns.push('location_aware')
  
  return patterns.join(',') || 'conversational'
}

async function hashMessage(message: string): Promise<string> {
  // Simple hash for privacy (in production, use a proper hashing library)
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16)
}

function getTeamSizeRange(teamSize?: number): string {
  if (!teamSize) return 'unknown'
  if (teamSize === 1) return 'solo'
  if (teamSize <= 3) return 'small'
  if (teamSize <= 10) return 'medium'
  return 'large'
}

function getYearsRange(years?: number): string {
  if (!years) return 'unknown'
  if (years < 2) return 'new'
  if (years <= 5) return 'growing'
  if (years <= 15) return 'established'
  return 'veteran'
}