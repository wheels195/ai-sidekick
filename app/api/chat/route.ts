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

WEB SEARCH CAPABILITIES:
When web search is enabled, use these decision rules to provide current, local information:

DECISION LOGIC:
- Before triggering a search, assess whether local or up-to-date web information is essential.
- If you're 80%+ confident it would improve the answer, proceed with the search.
- If you're between 50–79% sure, ask the user for permission to search.
- If you're under 50% sure, answer normally using your built-in expertise.
- If the user has not provided a location and a search seems useful, ask for their location first.

HIGH CONFIDENCE - Search immediately (80%+ sure):
- Current pricing for landscaping services in user's location
- Local landscaping suppliers, nurseries, or equipment dealers
- Location-specific landscaping regulations, permits, or lawn care restrictions
- Seasonal timing for landscaping work in their climate zone
- "Best landscaping suppliers near me" or "in [location]"
- Market rates: "what should I charge for [landscaping service]"
- Local landscaping competition analysis
- Current grass seed, plant, or material availability in their area
- Local weather conditions affecting landscaping work

MEDIUM CONFIDENCE - Ask ONE casual, friendly clarifying question (50–79% sure):
- Generic landscaping questions that could benefit from local context
- Example: "How do I market my landscaping business?" → "Want me to look up what's working right now for landscaping marketing in your area?"
- Example: "What equipment should I buy?" → "I can check what's trending near you — want me to look that up?"
- Keep the language human and helpful, like you're offering to help, not asking permission robotically.

NO SEARCH - Answer normally (<50% confidence):
- General landscaping techniques and best practices
- Universal business strategies for landscaping companies
- Basic operational advice for lawn care businesses
- Landscaping design principles and plant care
- Questions you can answer well without current market data

WHEN YOU RECEIVE SEARCH RESULTS:
- Synthesize information from multiple sources
- Prioritize local and recent information relevant to landscaping
- Filter for landscaping, lawn care, and outdoor maintenance relevance
- Focus on actionable recommendations for landscaping businesses
- Reference local suppliers, contractors, or services when helpful
- If the results are vague or unhelpful, acknowledge that and offer best practices or experience-based guidance instead
- Never mention the name of the search API or how the search was performed — just refer to it as "recent listings," "local options," or "what's trending"
- Use natural formatting with bullet points, not numbered lists that may render incorrectly

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

// Tavily search function
async function performWebSearch(query: string, location?: string): Promise<string> {
  console.log('🔍 performWebSearch called with:', { query, location, hasApiKey: !!process.env.TAVILY_API_KEY })
  
  if (!process.env.TAVILY_API_KEY) {
    console.log('❌ No Tavily API key found')
    return "Web search is not available at the moment - API key not configured."
  }

  try {
    const { TavilyClient } = await import('tavily')
    const tavilyClient = new TavilyClient({ apiKey: process.env.TAVILY_API_KEY })
    
    // Query is already enhanced by smart search logic, use as-is
    console.log('🔍 Using smart-enhanced search query:', query)
    
    const results = await tavilyClient.search({
      query: query,
      search_depth: "advanced",
      max_results: 8,
      include_answer: true,
      include_raw_content: true,
      exclude_domains: ["facebook.com", "instagram.com", "twitter.com", "pinterest.com", "youtube.com"]
    })
    
    console.log('🔍 Tavily results:', { resultCount: results.results?.length, hasResults: !!results.results })
    
    if (results.results && results.results.length > 0) {
      console.log('🔍 Raw Tavily results sample:', JSON.stringify(results.results[0], null, 2))
      
      // Format results for AI consumption with more detail
      const formattedResults = results.results
        .slice(0, 5) // Increase to top 5 results for better coverage
        .map((result: any) => {
          let formatted = `**${result.title}**\n`
          formatted += `URL: ${result.url}\n`
          formatted += `Content: ${result.content}\n`
          if (result.raw_content) {
            // Try to extract phone, address, hours from raw content
            const phoneMatch = result.raw_content.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
            const addressMatch = result.raw_content.match(/\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln)[^,]*,?\s*[A-Za-z\s]+,?\s*[A-Z]{2}\s*\d{5}/);
            
            if (phoneMatch) formatted += `Phone: ${phoneMatch[1]}\n`
            if (addressMatch) formatted += `Address: ${addressMatch[0]}\n`
          }
          return formatted
        })
        .join('\n---\n\n')
      
      console.log('✅ Returning enhanced formatted results with business details. Length:', formattedResults.length)
      return `Recent web search results with business details:\n\n${formattedResults}`
    }
    
    console.log('⚠️ No results found')
    return "No relevant current information found for this query."
  } catch (error) {
    console.error('❌ Tavily search error:', error)
    return `Web search encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Providing general guidance instead.`
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

    // Handle web search if enabled and needed
    let searchResults = ''
    if (webSearchEnabled && currentUserMessage?.role === 'user') {
      // Enhanced search trigger detection with smart query logic
      const userQuery = currentUserMessage.content.toLowerCase()
      
      // Smart search triggers categorized by query type
      const highConfidenceTriggers = {
        pricing: ['price', 'cost', 'charge', 'rate', 'what should i charge', 'how much', 'pricing'],
        suppliers: ['supplier', 'vendor', 'near me', 'where to buy', 'store', 'nursery', 'equipment dealer'],
        regulations: ['regulation', 'permit', 'law', 'legal', 'code', 'requirement', 'restriction'],
        competition: ['competition', 'competitor', 'market rate', 'going rate', 'what others charge'],
        current: ['current', 'latest', 'now', 'today', 'recent', 'this year', '2025'],
        availability: ['available', 'in stock', 'find', 'source', 'buy'],
        weather: ['weather', 'rain', 'temperature', 'forecast', 'climate', 'cold', 'heat', 'freeze'],
        best_top: ['best', 'top', 'most popular', 'most effective', 'leading']
      }
      
      // Check for high confidence triggers
      const matchedCategories = []
      for (const [category, triggers] of Object.entries(highConfidenceTriggers)) {
        if (triggers.some(trigger => userQuery.includes(trigger))) {
          matchedCategories.push(category)
        }
      }
      
      const shouldSearch = matchedCategories.length > 0
      
      console.log('🔍 Web search check:', { 
        webSearchEnabled, 
        userQuery: userQuery.substring(0, 50), 
        matchedCategories, 
        shouldSearch,
        userLocation: userProfile?.location,
        userZipCode: userProfile?.zip_code 
      })
      
      if (shouldSearch) {
        // Smart query enhancement based on detected categories and user context
        let enhancedQuery = currentUserMessage.content
        const location = userProfile?.location || ''
        const zipCode = userProfile?.zip_code || ''
        
        // Enhance query based on category and add hyper-local context (zip code preferred)
        const localContext = zipCode || location
        
        if (matchedCategories.includes('suppliers') || matchedCategories.includes('availability')) {
          enhancedQuery += ` near ${localContext} address phone hours pricing`
        } else if (matchedCategories.includes('pricing') || matchedCategories.includes('competition')) {
          enhancedQuery += ` ${localContext} landscaping market rates pricing cost`
        } else if (matchedCategories.includes('regulations')) {
          enhancedQuery += ` ${localContext} landscaping permits regulations lawn care rules requirements`
        } else if (matchedCategories.includes('weather')) {
          enhancedQuery += ` weather forecast for ${localContext} and landscaping impact today tomorrow`
        } else if (matchedCategories.includes('best_top')) {
          enhancedQuery += ` ${localContext} address phone hours pricing reviews`
        } else {
          enhancedQuery += ` ${localContext} landscaping lawn care`
        }
        
        console.log('🔍 Triggering smart web search...', { 
          originalQuery: currentUserMessage.content, 
          enhancedQuery, 
          categories: matchedCategories,
          localContext 
        })
        
        try {
          console.log('🔍 About to call performWebSearch with enhanced query:', enhancedQuery)
          searchResults = await performWebSearch(enhancedQuery, location)
          console.log('🔍 performWebSearch returned:', { 
            searchResults: searchResults.substring(0, 200), 
            length: searchResults.length,
            hasError: searchResults.includes('error'),
            hasNotAvailable: searchResults.includes('not available'),
            hasNotConfigured: searchResults.includes('not configured')
          })
          
          // Add search results to the conversation context
          if (searchResults && !searchResults.includes('error') && !searchResults.includes('not available') && !searchResults.includes('not configured')) {
            console.log('✅ Adding search results to context')
            chatMessages.push({
              role: 'system' as const,
              content: `CURRENT WEB SEARCH RESULTS for query "${currentUserMessage.content}" in ${localContext} (Categories: ${matchedCategories.join(', ')}):

${searchResults}

Structure your response with local context like "Here's what I found locally in ${localContext}:" and reference the specific search categories when relevant.`
            })
          } else {
            console.log('⚠️ Search results not added to context. Reason:', {
              hasError: searchResults.includes('error'),
              hasNotAvailable: searchResults.includes('not available'), 
              hasNotConfigured: searchResults.includes('not configured'),
              searchResults: searchResults.substring(0, 200)
            })
          }
        } catch (searchError) {
          console.error('❌ Web search failed with exception:', searchError)
          console.error('❌ Search error details:', {
            message: searchError instanceof Error ? searchError.message : 'Unknown error',
            stack: searchError instanceof Error ? searchError.stack : undefined
          })
          // Continue without search results rather than crashing the entire API
        }
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