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

const LANDSCAPING_SYSTEM_PROMPT = `You are Dirt.i, a specialized AI assistant for landscaping business owners. Your role is to act as a trusted digital sidekick who helps them grow, market, and operate more profitably — especially by using digital strategies like local SEO and content marketing.

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
- Suggested blog lengths for SEO:
  - Standard/local blog: **600–900 words**
  - Seasonal or how-to content: **1,000–1,300 words**
  - Quick updates/news: **400–600 words**
  - If no length is specified, default to 600–900 words.

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

IMAGE ANALYSIS CAPABILITIES:
When users upload images, analyze them in the context of landscaping business needs:

PLANT/LAWN PROBLEMS:
- Identify plant diseases, pest damage, or lawn issues
- Provide specific treatment recommendations
- Suggest prevention strategies
- Recommend local suppliers for treatment products (if web search enabled)

LANDSCAPE DESIGN:
- Analyze existing landscapes for improvement opportunities
- Suggest plant selections based on visible conditions
- Identify maintenance needs or seasonal care requirements

BUSINESS DOCUMENTATION:
- Review contracts, estimates, or proposals for improvement suggestions
- Analyze competitor marketing materials for strategic insights
- Help optimize pricing sheets or service descriptions

BEFORE/AFTER OPPORTUNITIES:
- Suggest marketing angles for project photos
- Recommend additional services based on visible needs
- Help create compelling social media content from project images

Always provide specific, actionable advice based on what you see in the image, and relate it back to their business growth opportunities.

GOOGLE PLACES BUSINESS SEARCH:
When web search is enabled, you have access to current local business data from Google Places with verified ratings, reviews, contact information, and pricing levels.

BUSINESS SEARCH CAPABILITIES:
- Real-time business listings with star ratings and review counts
- Verified phone numbers and addresses
- Current business hours and operational status
- Price level indicators ($ to $$$$)
- Business categories and service offerings
- Customer reviews and business summaries

COMPETITIVE ANALYSIS MODE:
When users ask about competitors, top companies, or market research:
- Format results as professional analysis tables
- Include strategic business insights and market gap analysis
- Provide pricing opportunities and differentiation strategies
- Compare ratings, reviews, and service offerings
- Identify competitive advantages and market positioning

SUPPLIER/VENDOR SEARCH:
When users ask about suppliers, nurseries, or equipment dealers:
- Provide verified contact information and locations
- Include business hours and availability
- Show price levels and customer ratings
- Reference actual business websites when available

FORMATTING GUIDELINES:
- Use green check marks (✅) for standard business listings
- Create professional tables for competitive analysis
- Include verified data only - never fabricate contact information
- Reference "local business data" rather than mentioning Google Places specifically
- Always end with actionable next steps for business growth

INSTRUCTIONS:
- Use markdown headers (## and ###) to organize your responses into clear sections
- Always provide clear, specific, actionable advice
- Ask for the user's location, business type, services offered, and challenges if not provided
- Automatically tailor suggestions to that local market (climate, season, region, competition)
- Focus on content and strategy that improves lead gen, customer experience, and revenue
- Offer next steps or a checklist to implement what you suggest
- Improve existing blog posts if asked (or offer it when relevant)
- Be supportive, strategic, and practical — like a business-savvy friend
- ALWAYS end your response with an engaging follow-up question that encourages the user to think deeper or provide more details for a better response. This question should help you understand their specific situation, goals, or challenges better.
- When listing information, use bullet points (-) or natural paragraph breaks instead of numbered lists to avoid formatting issues

TAGGING (Internal Use Only):
For internal classification and response pattern recognition, categorize user questions into:
pricing, SEO, services, customer communication, competitor research, content writing, equipment, reviews, ads, website, team ops.

Remember: you're not just answering questions. You are Dirt.i, the marketing and growth brain for a busy landscaping company that wants more local business — and they trust you to help them compete and grow.`


// Google Places API search function
async function performGooglePlacesSearch(query: string, location?: string): Promise<string> {
  console.log('🔍 performGooglePlacesSearch called with:', { query, location, hasApiKey: !!process.env.GOOGLE_PLACES_API_KEY })
  
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.log('❌ No Google Places API key found')
    return "Business search is not available at the moment - API key not configured."
  }

  try {
    // Construct search query for Google Places
    const searchQuery = location ? `${query} in ${location}` : query
    console.log('🔍 Google Places search query:', searchQuery)
    
    // Text Search (New) - for finding businesses by query
    const textSearchUrl = `https://places.googleapis.com/v1/places:searchText`
    
    const response = await fetch(textSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.priceLevel,places.websiteUri,places.businessStatus,places.types,places.editorialSummary'
      },
      body: JSON.stringify({
        textQuery: searchQuery,
        maxResultCount: 8,
        languageCode: 'en'
      })
    })

    if (!response.ok) {
      console.error('❌ Google Places API error:', response.status, response.statusText)
      return `Business search encountered an error: ${response.statusText}. Providing general guidance instead.`
    }

    const data = await response.json()
    console.log('🔍 Google Places results:', { resultCount: data.places?.length, hasResults: !!data.places })
    
    if (data.places && data.places.length > 0) {
      console.log('🔍 Raw Google Places results sample:', JSON.stringify(data.places[0], null, 2))
      
      // Format results for AI consumption with rich business data
      const formattedResults = data.places
        .slice(0, 6) // Top 6 results for comprehensive analysis
        .map((place: any, index: number) => {
          const name = place.displayName?.text || 'Business Name Not Available'
          const address = place.formattedAddress || 'Address not available'
          const phone = place.nationalPhoneNumber || 'Phone not available'
          const rating = place.rating ? `${place.rating}⭐` : 'No rating'
          const reviewCount = place.userRatingCount ? `${place.userRatingCount} reviews` : 'No reviews'
          const priceLevel = place.priceLevel ? '$'.repeat(place.priceLevel) : 'Price level unknown'
          const website = place.websiteUri || 'Website not available'
          const businessTypes = place.types ? place.types.join(', ') : 'Services not specified'
          const summary = place.editorialSummary?.text || 'No summary available'
          const status = place.businessStatus || 'Status unknown'
          
          let formatted = `BUSINESS ${index + 1}: **${name}**\n`
          formatted += `ADDRESS: ${address}\n`
          formatted += `PHONE: ${phone}\n`
          formatted += `RATING: ${rating} (${reviewCount})\n`
          formatted += `PRICE_LEVEL: ${priceLevel}\n`
          formatted += `WEBSITE: ${website}\n`
          formatted += `BUSINESS_STATUS: ${status}\n`
          formatted += `SERVICES/TYPES: ${businessTypes}\n`
          formatted += `SUMMARY: ${summary}\n`
          
          return formatted
        })
        .join('\n---\n\n')
      
      console.log('✅ Returning Google Places formatted results with business details. Length:', formattedResults.length)
      return `Current local business data from Google Places:\n\n${formattedResults}`
    }
    
    console.log('⚠️ No Google Places results found')
    return "No local businesses found for this query."
  } catch (error) {
    console.error('❌ Google Places search error:', error)
    return `Business search encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Providing general guidance instead.`
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { messages, sessionId, webSearchEnabled = false } = await request.json()

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

    // If no authenticated user, use mock profile for testing
    if (!userProfile) {
      console.log('No authenticated user, using mock test profile for web search context')
      userProfile = {
        business_name: "Johnson's Landscaping",
        location: 'Dallas, TX',
        zip_code: '75201',
        trade: 'landscaping',
        services: ['Lawn Care', 'Tree Trimming', 'Garden Design', 'Irrigation'],
        team_size: 4,
        target_customers: 'residential homeowners',
        years_in_business: 8,
        main_challenges: ['finding new customers', 'pricing competition', 'seasonal cash flow']
      }
    }

    // Handle web search if enabled and needed
    let searchResults = ''
    let useGPT4o = false
    const currentUserMessage = messages[messages.length - 1]
    
    if (currentUserMessage?.role === 'user' && webSearchEnabled) {
      // Simple logic: Toggle ON = always search with Google Places
      console.log('🔍 Google Places search enabled - searching for current business data')
      
      const location = userProfile?.location || userProfile?.zip_code || 'Dallas, TX'
      
      console.log('🔍 Performing Google Places search...', { 
        originalQuery: currentUserMessage.content, 
        location 
      })
      
      try {
        searchResults = await performGooglePlacesSearch(currentUserMessage.content, location)
        console.log('🔍 Google Places search returned:', { 
          searchResults: searchResults.substring(0, 200), 
          length: searchResults.length,
          hasError: searchResults.includes('error'),
          hasNotAvailable: searchResults.includes('not available'),
          hasNotConfigured: searchResults.includes('not configured')
        })
        
      } catch (searchError) {
        console.error('❌ Google Places search failed with exception:', searchError)
        console.error('❌ Search error details:', {
          message: searchError instanceof Error ? searchError.message : 'Unknown error',
          stack: searchError instanceof Error ? searchError.stack : undefined
        })
        // Continue without search results rather than crashing the entire API
        searchResults = ''
      }
    }

    // Enhance system prompt with user context and web search status
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

    if (webSearchEnabled) {
      enhancedSystemPrompt += `\n\nWEB SEARCH STATUS: ENABLED
You have access to current web information. Use the search capabilities as outlined in your instructions to provide up-to-date, location-specific information when appropriate.`
      
      // Add enhanced instructions for GPT-4o when using web search
      if (useGPT4o) {
        enhancedSystemPrompt += `\n\nENHANCED FORMATTING (GPT-4o Mode):
- Use sophisticated visual hierarchy with icons and emojis for sections
- Include detailed business intelligence: exact distances, pricing ranges, minimum orders
- Add competitive analysis and recommendations tables when multiple suppliers found
- Include local testimonials or reviews when available in search results
- Provide specific actionable tips with measured calculations
- Use professional formatting similar to premium business intelligence reports
- Include both immediate suppliers AND alternative online options with pricing when relevant`
      }
    } else {
      enhancedSystemPrompt += `\n\nWEB SEARCH STATUS: DISABLED
Provide advice based on your training knowledge. Do not mention web search capabilities.`
    }

    // Prepare messages with enhanced system prompt
    const systemMessage = {
      role: 'system' as const,
      content: enhancedSystemPrompt
    }

    const chatMessages = [systemMessage, ...messages]

    // Add search results to context if available
    if (searchResults && !searchResults.includes('error') && !searchResults.includes('not available') && !searchResults.includes('not configured')) {
      // Use GPT-4o for web search queries to match ChatGPT quality
      useGPT4o = true
      const localContext = userProfile?.zip_code || userProfile?.location || ''
      chatMessages.push({
        role: 'system' as const,
        content: `CURRENT GOOGLE PLACES BUSINESS DATA for query "${currentUserMessage.content}" in ${localContext}:

${searchResults}

COMPETITIVE ANALYSIS FORMATTING:

If this appears to be competitor research (questions about "top companies", "best landscapers", "competitors"), format as a professional analysis table:

## Competitive Analysis: ${localContext}

| Business Name | Rating | Reviews | Price | Phone | Key Services | Competitive Insight |
|---------------|--------|---------|-------|-------|--------------|-------------------|
| Company A | 4.8⭐ | 127 reviews | $$$ | (555) 123-4567 | Full service | High ratings, premium pricing - opportunity to undercut |
| Company B | 4.2⭐ | 43 reviews | $$ | (555) 234-5678 | Basic lawn care | Limited services - upsell opportunity |

Then provide strategic insights:
- **Market Gaps:** What services are missing or underserved?
- **Pricing Opportunities:** Where can you compete on price or value?
- **Service Differentiation:** How can you stand out?
- **Quality Standards:** What level of service is expected?

If this is NOT competitor research, use the standard format:

✅ **Business Name**
- Phone: (from PHONE field)
- Address: (from ADDRESS field)
- Rating: (from RATING field)
- Website: (from WEBSITE field or "Not available")
- Services: (from SERVICES/TYPES field)

ALWAYS end with ## Next Steps containing specific actionable advice for Johnson's Landscaping business growth.`
      })
    }

    // Store user message if authenticated and Supabase is available
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

    // Call OpenAI API with streaming - use GPT-4o for web search, GPT-4o-mini for general advice
    const openai = getOpenAIClient()
    let stream
    
    const modelToUse = (searchResults && searchResults.length > 0) ? 'gpt-4o' : 'gpt-4o-mini'
    const maxTokens = (searchResults && searchResults.length > 0) ? 2000 : 1000 // Higher token limit for GPT-4o detailed responses
    
    console.log(`🧠 Using model: ${modelToUse} (web search: ${webSearchEnabled}, has results: ${!!searchResults}, useGPT4o: ${useGPT4o})`)
    
    try {
      stream = await openai.chat.completions.create({
        model: modelToUse,
        messages: chatMessages,
        max_tokens: maxTokens,
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
            if (content !== undefined && content !== null) {
              fullResponse += content
              tokenCount += 1
              
              
              // Send the token as Server-Sent Event - preserve exact content including empty strings
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(content)}\n\n`))
            }
          }

          const responseTime = Date.now() - startTime


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