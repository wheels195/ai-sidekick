import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

// Initialize OpenAI client only when needed
const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000, // 60 seconds timeout
    maxRetries: 2,
  })
}

const LANDSCAPING_SYSTEM_PROMPT = `You are a specialized AI assistant for landscaping business owners. Your role is to act as a trusted digital sidekick who helps them grow, market, and operate more profitably — especially by using digital strategies like local SEO and content marketing.

You have deep expertise in:

BUSINESS GROWTH:
- Local SEO strategies specific to landscaping businesses
- Seasonal planning and cash flow optimization
- Pricing, upselling, and customer retention
- Review generation, reputation building, and Google ratings
- Conversion-optimized quoting and lead follow-up systems

MARKETING & SALES:
- Google Business Profile optimization
- High-impact content creation (blogs, service pages, homepages, social)
- Local advertising and geo-targeted lead generation
- Social proof tactics (reviews, case studies, before/after content)
- Competitive positioning and branding

CONTENT CREATION (Local SEO-Enhanced):
- Generate landscaping blog posts that follow SEO best practices:
  - Include city/state/geographic references throughout
  - Use local keywords customers search for
  - Include seasonal relevance (e.g., "Best Summer Lawn Tips in Dallas")
  - Follow SEO blog format: headline, intro, H2 outline, keywords, meta description, CTA
  - Write in a natural, helpful voice with clarity and friendliness
  - Recommend internal links to services and homepage if applicable
  - Suggest schema markup if applicable
  - Always end with a CTA to request a quote, call, or schedule a service

OPERATIONAL EXCELLENCE:
- Crew management, scheduling, seasonal preparation
- Equipment recommendations, maintenance plans
- Quality control and customer communication best practices

LANDSCAPING EXPERTISE:
- Plant selection, care tips, soil insights
- Lawn care, irrigation, seasonal maintenance
- Tree/shrub services, hardscaping suggestions
- Local pest/disease diagnosis by region or season
- Sustainable practices and regional environmental advice

INSTRUCTIONS:
1. Use markdown headers (## and ###) to organize your responses into clear sections
2. Always provide clear, specific, actionable advice
3. Ask for the user's location, business type, services offered, and challenges if not provided
4. Automatically tailor suggestions to that local market (climate, season, region, competition)
5. Focus on content and strategy that improves lead gen, customer experience, and revenue
6. Offer next steps or a checklist to implement what you suggest
7. Improve existing blog posts if asked (or offer it when relevant)
8. Be supportive, strategic, and practical — like a business-savvy friend

Remember: you're not just answering questions. You are the marketing and growth brain for a busy landscaping company that wants more local business — and they trust you to help them compete and grow.`

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

    // Call OpenAI API with streaming
    const openai = getOpenAIClient()
    let stream
    
    try {
      stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency
        messages: chatMessages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,
      })
    } catch (error) {
      console.error('OpenAI API call failed:', error)
      return NextResponse.json(
        { error: 'OpenAI API is currently unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }

    // Set up streaming response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        let fullResponse = ''
        let tokenCount = 0
        
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              tokenCount += 1
              
              // Debug: Log content that contains newlines or headers
              if (content.includes('\n') || content.includes('#')) {
                console.log('Backend streaming content:', JSON.stringify(content))
              }
              
              // Send the token as Server-Sent Event
              controller.enqueue(encoder.encode(`data: ${content}\n\n`))
            }
          }

          const responseTime = Date.now() - startTime

          // Debug: Log final response
          console.log('Backend final response preview:', fullResponse.substring(0, 200) + '...')
          console.log('Backend has newlines:', fullResponse.includes('\n'))
          console.log('Backend has headers:', fullResponse.includes('#'))

          // Store assistant response if authenticated and Supabase is available
          if (user && fullResponse && process.env.NEXT_PUBLIC_SUPABASE_URL) {
            try {
              const { supabase } = createClient(request)
              
              const { data } = await supabase
                .from('user_conversations')
                .insert({
                  user_id: user.id,
                  session_id: sessionId || crypto.randomUUID(),
                  message_role: 'assistant',
                  message_content: fullResponse,
                  context_used: userProfile ? {
                    business_name: userProfile.business_name,
                    location: userProfile.location,
                    services: userProfile.services,
                    team_size: userProfile.team_size
                  } : null,
                  response_time_ms: responseTime,
                  tokens_used: tokenCount
                })
                .select('id')
                .single()

              // Store anonymized data for global learning
              await supabase
                .from('global_conversations')
                .insert({
                  business_type: 'landscaping',
                  message_category: extractMessageCategory(currentUserMessage?.content || ''),
                  user_message_hash: await hashMessage(currentUserMessage?.content || ''),
                  response_pattern: extractResponsePattern(fullResponse),
                  context_factors: {
                    has_location: !!userProfile?.location,
                    team_size_range: getTeamSizeRange(userProfile?.team_size),
                    years_in_business_range: getYearsRange(userProfile?.years_in_business),
                    services_count: userProfile?.services?.length || 0
                  }
                })

              // Send completion signal with metadata
              controller.enqueue(encoder.encode(`data: [DONE:${data?.id || 'null'}:${sessionId || crypto.randomUUID()}]\n\n`))
            } catch (error) {
              console.log('Could not store conversation data:', error.message)
              controller.enqueue(encoder.encode(`data: [DONE:null:${sessionId || crypto.randomUUID()}]\n\n`))
            }
          } else {
            // Send completion signal without storage
            controller.enqueue(encoder.encode(`data: [DONE:null:${sessionId || crypto.randomUUID()}]\n\n`))
          }

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      }
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
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