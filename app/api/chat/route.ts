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

const LANDSCAPING_SYSTEM_PROMPT = `You are Dirt.i — a trusted AI sidekick built to help landscaping business owners grow, market, and operate more profitably.

## ✅ Core Instructions (Always Follow These)
- Use markdown headers (## and ###) to structure your responses
- Provide clear, specific, actionable advice
- End every response with a helpful follow-up question that deepens the conversation
- Ask for the user's location, business type, services offered, or challenges if not provided
- Tailor all answers to the user's region, season, and goals
- Never fabricate information — only reference what's in your training or provided data
- When listing businesses, only use **verified** Google Places info (if available)
- Use green check marks (✅) for business listings and professional tables for comparisons

---

## 🧠 Business Growth Support
- Local SEO strategies specific to landscaping
- Seasonal planning and cash flow optimization
- Pricing, upselling, and customer retention
- Reputation building and Google reviews
- Lead follow-up and quoting systems

## 📈 Marketing & Sales Expertise
- Google Business Profile optimization
- Blog, homepage, and service page content strategy
- Local advertising and geo-targeted campaigns
- Review generation and social proof tactics
- Branding and competitive differentiation

## ✍️ Content Creation (SEO-Enhanced)
- Write blogs using SEO best practices:
  - Use city/state references and local keywords
  - Include seasonal relevance (e.g., "Best Summer Lawn Tips in Dallas")
  - Follow SEO blog format: headline, intro, H2s, keywords, meta description, CTA
  - Write in a natural, helpful, clear tone
  - Suggest internal links and schema markup (if applicable)
- Suggested blog lengths:
  - Local blog: 600–900 words
  - Seasonal/how-to: 1,000–1,300 words
  - Quick update/news: 400–600 words
  - Default: 600–900 words

## ⚙️ Operational Excellence
- Crew management and seasonal scheduling
- Equipment selection and maintenance planning
- Quality control and customer communication tips

## 🌿 Landscaping Expertise
- Plant selection, soil care, and lawn health
- Irrigation, tree/shrub care, and seasonal prep
- Hardscaping and regional pest/disease identification
- Sustainable practices and climate-specific strategies

## 🖼️ Image Analysis Capabilities

### 🌱 Plant / Lawn Problems
- Detect disease, pests, or turf damage
- Recommend treatments and prevention steps
- Suggest local product sources (if web search is enabled)

### 🌳 Landscape Design Feedback
- Spot maintenance or improvement opportunities
- Suggest plants suited to the visible conditions

### 📄 Business Docs & Before/After Photos
- Review proposals, estimates, or pricing sheets for improvements
- Extract marketing insights from competitor flyers or pages
- Recommend angles and captions for before/after project photos

## 📊 Competitive Analysis Mode
When users ask about "top companies", "competitors", or "market leaders":
- Format responses using professional comparison tables
- Compare rating, reviews, price, phone, services
- Provide market insights: gaps, pricing differences, brand opportunities
- Only use verified data — no assumptions

## 🏪 Supplier & Vendor Lookup
When users ask about nurseries, vendors, or dealers:
- List verified businesses with:
  - Name, phone, address, hours, price level
  - Services or product categories
  - Website (if available)
- Never fabricate contact details

---

## 📦 Web Search (Dynamic Capability)
When web search is enabled, you'll receive local business data from Google Places. You will see a "🌐 WEB SEARCH STATUS" message that tells you whether:
- Data is active and available
- Data was attempted but no results were found
- Web search is disabled entirely

Follow the instructions attached to that status block. Only use verified data when available. Never mention Google Places by name — just say "local business data."

---

## 🧠 Internal Tagging (for reference only)
Classify questions into: pricing, SEO, services, customer communication, competitor research, content writing, equipment, reviews, ads, website, team ops.

---

Remember: You are **Dirt.i**, the business brain and marketing strategist for landscaping professionals. Be practical, smart, supportive, and laser-focused on helping them grow.`


// File processing function for images and documents
async function processUploadedFiles(files: any[]): Promise<string> {
  if (!files || files.length === 0) {
    return ''
  }

  const fileDescriptions = []
  
  for (const file of files) {
    const { name, type, content } = file
    
    if (type.startsWith('image/')) {
      // For images, we'll use OpenAI's vision capabilities
      fileDescriptions.push(`📷 **Image Upload: ${name}**
- File type: ${type}
- Ready for AI analysis (plant diseases, landscape photos, competitor materials, etc.)
- The AI can analyze this image and provide specific landscaping insights`)
    } else if (type === 'application/pdf') {
      fileDescriptions.push(`📄 **PDF Document: ${name}**
- File type: PDF document
- Content available for AI analysis (proposals, estimates, marketing materials)
- The AI can review and provide feedback on business documents`)
    } else if (type.includes('text') || name.endsWith('.txt')) {
      fileDescriptions.push(`📝 **Text Document: ${name}**
- File type: Text document
- Content ready for AI analysis and feedback
- The AI can review and improve written content`)
    } else {
      fileDescriptions.push(`📎 **File: ${name}**
- File type: ${type}
- File uploaded and available for AI review`)
    }
  }
  
  return `FILES UPLOADED:\n${fileDescriptions.join('\n\n')}\n\nPlease analyze these files and provide specific landscaping business insights, recommendations, or feedback based on the content.`
}

// Google Places API search function
async function performGooglePlacesSearch(query: string, location?: string): Promise<string> {
  console.log('🔍 performGooglePlacesSearch called with:', { query, location, hasApiKey: !!process.env.GOOGLE_PLACES_API_KEY })
  console.log('🔍 API Key first 10 chars:', process.env.GOOGLE_PLACES_API_KEY?.substring(0, 10))
  
  if (!process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACES_API_KEY === 'your-google-places-api-key-here' || process.env.GOOGLE_PLACES_API_KEY === 'PLACEHOLDER_FOR_REAL_KEY') {
    console.log('❌ No valid Google Places API key found')
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
    console.log('🔥 Chat API called - parsing request...')
    const { messages, sessionId, webSearchEnabled = false, files = [] } = await request.json()
    console.log('🔥 Request parsed successfully:', { messagesCount: messages?.length, webSearchEnabled, filesCount: files?.length })

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
          
          // Check trial limits for authenticated users
          if (profile) {
            const now = new Date()
            const trialExpires = profile.trial_expires_at ? new Date(profile.trial_expires_at) : null
            const tokensUsed = profile.tokens_used_trial || 0
            const tokenLimit = profile.trial_token_limit || 250000
            
            // Check if trial has expired
            if (trialExpires && now > trialExpires) {
              return NextResponse.json(
                { 
                  error: 'Your 7-day free trial has expired. Please upgrade to continue using AI Sidekick.',
                  errorType: 'TRIAL_EXPIRED'
                },
                { status: 403 }
              )
            }
            
            // Check if token limit exceeded
            if (tokensUsed >= tokenLimit) {
              return NextResponse.json(
                { 
                  error: `You've reached your trial limit of ${(tokenLimit/1000)}k tokens. Please upgrade to continue using AI Sidekick.`,
                  errorType: 'TOKEN_LIMIT_EXCEEDED',
                  tokensUsed,
                  tokenLimit
                },
                { status: 403 }
              )
            }
          }
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

    // Handle file processing if files are uploaded
    let fileContext = ''
    if (files && files.length > 0) {
      console.log('📁 Processing uploaded files:', files.length)
      fileContext = await processUploadedFiles(files)
      useGPT4o = true // Use GPT-4o for file analysis
      console.log('📁 File context generated:', fileContext.substring(0, 200))
    }

    // Handle web search if enabled and needed
    let searchResults = ''
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
          stack: searchError instanceof Error ? searchError.stack : undefined,
          apiKey: process.env.GOOGLE_PLACES_API_KEY ? 'Present' : 'Missing',
          query: currentUserMessage.content,
          location
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
- Business Priorities: ${userProfile.business_priorities?.join(', ') || 'Not specified'}

Use this context to provide more personalized and relevant advice.`
    }

    if (webSearchEnabled && searchResults && !['error', 'not available', 'not configured'].some(term => searchResults.includes(term))) {
      enhancedSystemPrompt += `
🌐 WEB SEARCH STATUS: ✅ SEARCH ACTIVE

You have verified local business data available from the current query. The next system message contains structured business listings in the following format:

BUSINESS 1: **Business Name**
ADDRESS: Full address
PHONE: Phone number
RATING: X.X⭐ (XX reviews)
PRICE_LEVEL: $ to $$
WEBSITE: URL or "Website not available"
SERVICES/TYPES: Business categories

Classify the user query intent:
- If it's about competitors or "top companies", switch to Competitive Analysis mode
- Otherwise, treat it as a standard supplier/vendor search

Only reference verified data and do not fabricate missing details.
`;
    } else if (webSearchEnabled) {
      enhancedSystemPrompt += `
🌐 WEB SEARCH STATUS: ⚠️ ENABLED BUT NO RESULTS

A search was attempted, but no relevant business listings were returned. Provide useful advice based on your training and business expertise. Do not mention that a search was attempted.`;
    } else {
      enhancedSystemPrompt += `
🌐 WEB SEARCH STATUS: ❌ SEARCH DISABLED

For this conversation, focus on general business strategy and expertise. 

**IMPORTANT**: If the user asks about competitors, market research, or "top companies" in their area, proactively suggest they enable Web Search for live business data:

"💡 **Want live competitor data?** Turn on **Web Search** in the chat controls below to get real ratings, reviews, phone numbers, and current business information for landscaping companies in your area. This will give you much more accurate competitive analysis!"

Then provide SPECIFIC, ACTIONABLE competitive strategies based on common Dallas landscaping market patterns. Use concrete examples, real pricing insights, and tactical advice. Avoid generic lists - give professional business intelligence.`;
    }

    // Prepare messages with enhanced system prompt and message trimming for cost optimization
    const systemMessage = {
      role: 'system' as const,
      content: enhancedSystemPrompt
    }

    // Implement message trimming to reduce token costs
    // Keep only the most recent 6 messages (3 user + 3 assistant pairs) for context
    // This reduces token usage by ~75% while maintaining conversation quality
    const maxMessagesToKeep = 6
    let processedMessages = messages
    let conversationSummary = ''

    // For very long conversations (10+ messages), create a summary of older messages
    if (messages.length > 10) {
      const oldMessages = messages.slice(0, messages.length - maxMessagesToKeep)
      const recentMessages = messages.slice(-maxMessagesToKeep)
      
      // Create a brief summary of the older conversation for context
      const topicsDiscussed = []
      for (const msg of oldMessages) {
        if (msg.role === 'user' && msg.content.length > 10) {
          // Extract key topics from user messages
          if (msg.content.toLowerCase().includes('seo') || msg.content.toLowerCase().includes('google')) topicsDiscussed.push('SEO/Google ranking')
          if (msg.content.toLowerCase().includes('price') || msg.content.toLowerCase().includes('cost')) topicsDiscussed.push('pricing strategies')
          if (msg.content.toLowerCase().includes('customer') || msg.content.toLowerCase().includes('client')) topicsDiscussed.push('customer acquisition')
          if (msg.content.toLowerCase().includes('competitor') || msg.content.toLowerCase().includes('competition')) topicsDiscussed.push('competitive analysis')
          if (msg.content.toLowerCase().includes('content') || msg.content.toLowerCase().includes('website')) topicsDiscussed.push('content/website')
        }
      }
      
      if (topicsDiscussed.length > 0) {
        const uniqueTopics = [...new Set(topicsDiscussed)]
        conversationSummary = `\n\nPREVIOUS CONVERSATION CONTEXT: Earlier in this conversation, we discussed ${uniqueTopics.join(', ')}. Continue building on this context.`
      }
      
      processedMessages = recentMessages
      console.log(`💰 Long conversation optimization: Summarized ${oldMessages.length} older messages, keeping ${recentMessages.length} recent messages`)
    } else {
      const trimmedMessages = messages.length > maxMessagesToKeep 
        ? messages.slice(-maxMessagesToKeep)
        : messages
      processedMessages = trimmedMessages
      console.log(`💰 Token optimization: Using ${processedMessages.length} of ${messages.length} messages (saved ${Math.max(0, messages.length - maxMessagesToKeep)} messages)`)
    }

    // Add conversation summary to system prompt if available
    const finalSystemPrompt = enhancedSystemPrompt + conversationSummary

    const systemMessageWithSummary = {
      role: 'system' as const,
      content: finalSystemPrompt
    }

    const chatMessages = [systemMessageWithSummary, ...processedMessages]

    // Check if we have valid search results and files
    const hasSearchResults = searchResults && searchResults.length > 0 && !searchResults.includes('error') && !searchResults.includes('not available')
    const hasFiles = files && files.length > 0

    // Add search results to context if available and valid
    if (hasSearchResults) {
      const localContext = userProfile?.zip_code || userProfile?.location || ''
      chatMessages.push({
        role: 'system' as const,
        content: `CURRENT GOOGLE PLACES BUSINESS DATA for query "${currentUserMessage.content}" in ${localContext}:

${searchResults}

COMPETITIVE ANALYSIS FORMATTING:

If this appears to be competitor research (questions about "top companies", "best landscapers", "competitors"), format as a professional analysis table:

## Competitive Analysis: ${localContext}

| Business Name | Rating | Reviews | Price | Phone | Website | Key Services | Competitive Insight |
|---------------|--------|---------|-------|-------|---------|--------------|-------------------|
| Company A | 4.8⭐ | 127 | $$$ | (555) 123-4567 | company-a.com | Full service landscaping | High ratings, premium pricing - opportunity to undercut |
| Company B | 4.2⭐ | 43 | $$ | (555) 234-5678 | company-b.com | Lawn care, tree trimming | Limited services - upsell opportunity |

**IMPORTANT FORMATTING REQUIREMENTS:**
- Use the exact RATING field with ⭐ symbol
- Use PRICE_LEVEL field (show $ symbols if available, or "N/A" if price level unknown)
- Include WEBSITE field (show domain only, remove https://, or "No website" if not available)
- Use PHONE field exactly as provided
- For Key Services: Extract specific landscaping services from SERVICES/TYPES and SUMMARY fields, avoid generic terms like "general contracting"
- Reviews column should show just the number (without "reviews" text)

Then provide detailed strategic insights with specific actionable advice:
- **Market Gaps:** What specific landscaping services are missing or underserved?
- **Pricing Opportunities:** Where can you compete on price or value based on the price levels shown?
- **Service Differentiation:** How can you stand out from these specific competitors?
- **Quality Standards:** What service quality is expected based on competitor ratings?

If this is NOT competitor research, use the standard format:

✅ **Business Name**
- Phone: (from PHONE field)
- Address: (from ADDRESS field)
- Rating: (from RATING field)
- Website: (from WEBSITE field or "Not available")
- Services: (from SERVICES/TYPES field)

**STRATEGIC ANALYSIS REQUIREMENTS:**
After the table, provide a comprehensive competitive analysis with:

### Strategic Insights for Johnson's Landscaping
- **Market Gaps:** Identify 2-3 specific services missing from competitors
- **Pricing Opportunities:** Analyze price points and suggest competitive positioning  
- **Service Differentiation:** Recommend 3-4 ways to stand out from these competitors
- **Quality Standards:** Set benchmarks based on competitor ratings and reviews

### Actionable Recommendations
Provide 4-6 specific, immediately actionable strategies Johnson's Landscaping can implement.

ALWAYS end with ## Next Steps containing 3-4 specific actionable items for Johnson's Landscaping business growth.`
      })
    }

    // Add file context if files were uploaded
    if (fileContext) {
      chatMessages.push({
        role: 'system' as const,
        content: `${fileContext}

IMPORTANT FILE ANALYSIS INSTRUCTIONS:
- Focus on landscaping business applications and insights
- Provide specific, actionable recommendations
- If analyzing images: Look for plant health, landscape design opportunities, maintenance needs
- If analyzing documents: Review for business improvement opportunities, pricing strategies, marketing effectiveness
- Always end with concrete next steps the business owner can implement immediately`
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
    
    const modelToUse = hasSearchResults || hasFiles ? 'gpt-4o' : 'gpt-4o-mini'
    const maxTokens = hasSearchResults || hasFiles ? 6000 : 4000 // Increased token limits for better responses
    
    console.log(`🧠 Using model: ${modelToUse} (web search: ${webSearchEnabled}, has results: ${!!searchResults}, files: ${files?.length || 0})`)
    
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

              // Update user's token usage in profile
              const currentUserMessage = messages[messages.length - 1]
              const estimatedTokens = Math.ceil((currentUserMessage?.content?.length || 0 + fullResponse.length) / 4)
              
              await supabase
                .from('user_profiles')
                .update({
                  tokens_used_trial: (userProfile?.tokens_used_trial || 0) + estimatedTokens
                })
                .eq('id', user.id)

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
    console.error('❌ Chat API Error:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasGooglePlacesKey: !!process.env.GOOGLE_PLACES_API_KEY
    })
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Chat API Error: ${error.message}` },
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