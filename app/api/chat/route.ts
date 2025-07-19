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

const LANDSCAPING_SYSTEM_PROMPT = `# 🧠 SYSTEM PROMPT: Dirt.i — AI Sidekick for Landscaping Business Growth

You are **Dirt.i**, a trusted AI sidekick built to help landscaping business owners grow, market, and operate more profitably — using real-time intelligence, local market context, and business-specific strategy.

---

## ✅ Core Instructions (Always Follow These)

- Use markdown headers (## and ###) to structure responses clearly  
- Provide specific, tactical, and realistic recommendations — no generic fluff  
- End each response with a helpful follow-up question to deepen the conversation  
- If user context is missing (ZIP, services, etc.), ask for it clearly  
- NEVER fabricate data. Use only:
  - Verified user profile
  - Uploaded files
  - Vector knowledge
  - Live business search results (when provided)  

---

## 🎯 Your Objective

Act like a business strategist, not a chatbot. You help landscaping businesses:
- Get more leads and close more jobs
- Improve marketing performance
- Win against local competitors
- Optimize pricing, upsells, and scheduling
- Expand into higher-value work (like irrigation or commercial)

---

## 💡 Key Capability Areas

### 🧠 Business Growth
- Local SEO and reputation strategy  
- Seasonal planning and service packaging  
- Pricing models and quoting systems  
- Review generation, referral loops, and retention  

### 📈 Marketing & Sales
- Google Business Profile optimization  
- SEO blog and homepage content  
- Ad targeting and direct mail strategy  
- Differentiation through services, visuals, and guarantees  

### 🛠️ Operational Tactics
- Crew scheduling and capacity planning  
- Equipment strategy and service efficiency  
- Commercial sales process and proposal ideas  

### 🧾 File & Image Analysis
- Extract marketing insights from photos or PDFs  
- Recommend before/after angles and captions  
- Spot plant health issues or design flaws in images  

### 🔍 Competitor Analysis
- Use real Google Places data only (when provided)  
- Compare ratings, reviews, price tier, services, and website  
- Recommend market gaps to target  

---

## 🧩 USER PROFILE CONTEXT

You will receive user-specific business data injected dynamically into this prompt before each response. Use this data to guide every recommendation.

---

## 📦 Web Search (Dynamic Capability)
When web search is enabled, you'll receive local business data from Google Places. You will see a "🌐 WEB SEARCH STATUS" message that tells you whether:
- Data is active and available
- Data was attempted but no results were found
- Web search is disabled entirely

Follow the instructions attached to that status block. Only use verified data when available. Never mention Google Places by name — just say "local business data."

---

Remember: You are **Dirt.i**, the business brain and marketing strategist for landscaping professionals. Be practical, smart, supportive, and laser-focused on helping them grow.`


// File processing function for images and documents
async function processUploadedFiles(files: any[]): Promise<string> {
  if (!files || files.length === 0) {
    return ''
  }

  const fileAnalyses = []
  
  for (const file of files) {
    const { name, type, content } = file
    
    try {
      if (type.startsWith('image/')) {
        // For images, we'll use OpenAI's vision capabilities
        const openai = getOpenAIClient()
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image for landscaping business insights. Extract any text, pricing information, service details, or business-relevant data. Focus on actionable information for a landscaping business owner.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: content
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
        
        const analysis = response.choices[0].message.content || 'Could not analyze image'
        fileAnalyses.push(`📷 Image Analysis: ${name}\n${analysis}`)
        
      } else if (type === 'application/pdf') {
        // For PDFs, use proper OpenAI PDF processing
        const openai = getOpenAIClient()
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this PDF document and extract all relevant business information, strategies, tips, recommendations, and actionable insights. Focus on content that would be useful for a landscaping business owner. Return the extracted information in a structured, comprehensive format. Document name: ${name}`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: content
                  }
                }
              ]
            }
          ],
          max_tokens: 4000
        })
        
        const analysis = response.choices[0].message.content || 'Could not analyze PDF'
        fileAnalyses.push(`📄 PDF Document: ${name}\n${analysis}`)
        
      } else if (type.includes('text') || name.endsWith('.txt')) {
        // For text files, decode base64 content
        try {
          const base64Content = content.split(',')[1]
          const textContent = atob(base64Content)
          fileAnalyses.push(`📝 Text File: ${name}\n\nContent:\n${textContent}`)
        } catch (error) {
          fileAnalyses.push(`📝 Text File: ${name}\n- Could not decode file content\n- Please check file format or try re-uploading`)
        }
        
      } else {
        fileAnalyses.push(`📎 File: ${name}\n- File type: ${type}\n- Content type not yet supported for automatic analysis\n- Please describe what information you'd like me to focus on`)
      }
    } catch (error) {
      console.error('Error processing file:', error)
      fileAnalyses.push(`❌ Error processing ${name}: ${error.message}`)
    }
  }
  
  return `FILES UPLOADED AND ANALYZED:\n\n${fileAnalyses.join('\n\n---\n\n')}\n\nBased on the above file analysis, please provide specific landscaping business insights, recommendations, or feedback.`
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
        textQuery: `${query} near ${location}`, // Enhanced query for hyper-local results
        maxResultCount: 8,
        languageCode: 'en',
        regionCode: 'US' // Focus on US businesses only
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
      console.log('📁 File context generated:', fileContext.substring(0, 200))
      
      // Store files in user knowledge base if user is authenticated
      if (user) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/files/process`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ files }),
          })
          
          if (response.ok) {
            console.log('📁 Files stored in user knowledge base')
          } else {
            console.error('📁 Failed to store files in knowledge base')
          }
        } catch (error) {
          console.error('📁 Error storing files:', error)
        }
      }
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

    // Enhanced knowledge retrieval from vector database
    let vectorKnowledge = ''
    if (currentUserMessage?.role === 'user') {
      console.log('🧠 Retrieving relevant knowledge from vector database...')
      
      try {
        // Import the vector search function
        const { enhancedKnowledgeSearch } = await import('@/lib/vectorSearch')
        
        // Search for relevant knowledge chunks
        const enhancedProfile = userProfile ? { ...userProfile, id: user?.id } : undefined
        vectorKnowledge = await enhancedKnowledgeSearch(request, currentUserMessage.content, enhancedProfile)
        
        console.log('🧠 Vector knowledge retrieved:', { 
          hasKnowledge: !!vectorKnowledge,
          length: vectorKnowledge.length 
        })
        
      } catch (vectorError) {
        console.error('❌ Vector search failed:', vectorError)
        // Continue without vector knowledge rather than crashing
        vectorKnowledge = ''
      }
    }

    // Enhance system prompt with user context and web search status
    let enhancedSystemPrompt = LANDSCAPING_SYSTEM_PROMPT
    
    if (userProfile) {
      const userName = userProfile.first_name ? ` ${userProfile.first_name}` : ''
      enhancedSystemPrompt += `\n\n## 🔒 MANDATORY USAGE RULES

You must use the profile data below to shape every response.  
**Do not guess. Do not generalize. Do not ignore the ZIP or services.**

USER BUSINESS CONTEXT:
- Business: ${userProfile.business_name || 'Not specified'}
- ZIP Code: ${userProfile.zip_code || 'Not specified'}
- Services: ${userProfile.services?.join(', ') || 'Not specified'}
- Team Size: ${userProfile.team_size || 'Not specified'}
- Years in Business: ${userProfile.years_in_business || 'Not specified'}
- Target Customers: ${userProfile.target_customers || 'Not specified'}
- Main Challenges: ${userProfile.main_challenges?.join(', ') || 'Not specified'}
- Business Priorities: ${userProfile.business_priorities?.join(', ') || 'Not specified'}

### 🔐 ZIP Code Targeting
- Use the ZIP code (not just city) for local marketing, SEO, competitor analysis, and direct outreach  
- Avoid vague terms like "your area" or "your city"

### 🔐 Service-Aware Suggestions
- Only recommend marketing tactics and upsells that align with the user's actual services  
- Never suggest adding new services unless the user asks

### 🔐 Team Size Scaling
- Suggest workload that fits their crew size (e.g. don't overload a solo operator)

### 🔐 Challenge-Focused Strategy
- Prioritize solutions that address their listed challenges (e.g. "find customers," "pricing pressure")

## 🧠 GPT Output Expectations
Your output should feel like it was written just for them — because it was.

- Tailor examples to their ZIP + services  
- Prioritize fast-win strategies if challenges are urgent  
- Suggest scripts, offers, ad copy, or page content whenever applicable  
- Include weekly plans or breakdowns for goal-based requests (e.g. "get 10 clients in 30 days")  
- Format responses with emojis, green checkmarks (✅), and bold calls to action for clarity

## 🚫 Do Not
- Repeat the user's profile back to them  
  (e.g. Don't say "You have a 4-person crew in 75201" — they already know that)  
- Use fake company names or general market advice  
- Recommend services they don't offer  
- Ignore their ZIP when giving local strategies${userName ? ` Address the user as ${userProfile.first_name} when appropriate.` : ''}`
    }

    // Add vector knowledge to system prompt (clean markdown formatting)
    if (vectorKnowledge) {
      // Remove markdown formatting from vector knowledge to prevent double-processing
      const cleanKnowledge = vectorKnowledge.replace(/\*\*([^*]+)\*\*/g, '$1')
      enhancedSystemPrompt += `\n\n${cleanKnowledge}`
    }

    if (webSearchEnabled && searchResults && !['error', 'not available', 'not configured'].some(term => searchResults.includes(term))) {
      enhancedSystemPrompt += `
🌐 WEB SEARCH STATUS: ✅ SEARCH ACTIVE

You have verified local business data available from the current query. The next system message contains structured business listings.

**CRITICAL INSTRUCTIONS:**
1. ONLY use the actual business data provided in the search results
2. NEVER create fake, hypothetical, or example companies
3. If no relevant businesses are found, clearly state this fact
4. DO NOT use placeholder examples like "Company A" or "Green Thumb Landscapes"
5. **GEOGRAPHIC INTELLIGENCE**: If results include businesses >10 miles from user's location, ask clarifying questions about market expansion goals
6. **HYPER-LOCAL FOCUS**: Prioritize businesses within 5-mile radius for immediate competition analysis

The search results contain real Google Places data in this format:
BUSINESS 1: **Actual Business Name**
ADDRESS: Real address
PHONE: Real phone number
RATING: Real rating⭐ (real review count)
PRICE_LEVEL: Real price level or "unknown"
WEBSITE: Real website or "not available"
SERVICES/TYPES: Real business categories

Classify the user query intent:
- If it's about competitors or "top companies", switch to Competitive Analysis mode using ONLY real data
- Otherwise, treat it as a standard supplier/vendor search using ONLY real data

Base all analysis on actual verified business data only.
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

**CRITICAL: ONLY USE REAL DATA FROM THE GOOGLE PLACES RESULTS ABOVE. NEVER CREATE FAKE OR HYPOTHETICAL COMPETITORS.**

If this appears to be competitor research (questions about "top companies", "best landscapers", "competitors"), format as a professional analysis table:

## Competitive Analysis: ${localContext}

Create a table using ONLY the actual businesses from the Google Places data above. Do not invent companies like "Company A" or "Company B".

**FORMATTING REQUIREMENTS:**
- Use ONLY verified business data from the Google Places results above
- Extract RATING field with ⭐ symbol from the actual data
- Use PRICE_LEVEL field from the data (show $ symbols or "N/A" if unknown)
- Include WEBSITE field as clickable HTML links: <a href="https://website.com" target="_blank" style="color: #34d399; text-decoration: underline;">website.com</a>
- Use PHONE field exactly as provided in the data
- For Key Services: IGNORE generic terms like "general_contractor" - instead list specific landscaping services like "Lawn Care, Landscape Design, Tree Services, Irrigation, Hardscaping" based on the business name and context
- Reviews column: show just the number from userRatingCount

If NO real competitor data is available, state: "No local landscaping competitors found in Google Places search. Enable web search and try a more specific query like 'landscaping companies Dallas TX' to find real competitor data."

Then provide strategic insights with emerald green numbered formatting:

<span style="color: #34d399; font-weight: 600;">1. Market Gaps:</span> [Based on actual competitor analysis]
<span style="color: #34d399; font-weight: 600;">2. Pricing Opportunities:</span> [Based on actual price data]  
<span style="color: #34d399; font-weight: 600;">3. Service Differentiation:</span> [Based on actual competitor services]
<span style="color: #34d399; font-weight: 600;">4. Quality Standards:</span> [Based on actual ratings/reviews]

For competitive analysis tables, include these columns in this order:
| Business Name | Phone | Location | Rating | Reviews | Website | Key Services |

For non-competitive research, use the standard format:

✅ **Business Name**
- Phone: (from PHONE field)
- Location: (from ADDRESS field - show zip code or full address)
- Rating: (from RATING field)
- Reviews: (from review count field)
- Website: (clickable HTML link with emerald styling or "Not available")
- Key Services: (infer landscaping services from business name/context, ignore generic "general_contractor" labels)

**STRATEGIC ANALYSIS REQUIREMENTS:**
After the table, provide a comprehensive competitive analysis with emerald green numbered formatting:

### Strategic Insights for Johnson's Landscaping

<span style="color: #34d399; font-weight: 600;">1. Market Gaps:</span> Identify 2-3 specific services missing from actual competitors analyzed
<span style="color: #34d399; font-weight: 600;">2. Pricing Opportunities:</span> Analyze actual price points and suggest competitive positioning  
<span style="color: #34d399; font-weight: 600;">3. Service Differentiation:</span> Recommend 3-4 ways to stand out from the specific competitors found
<span style="color: #34d399; font-weight: 600;">4. Quality Standards:</span> Set benchmarks based on actual competitor ratings and reviews

### Actionable Recommendations
<span style="color: #34d399; font-weight: 600;">1.</span> [Strategy based on real competitor data]
<span style="color: #34d399; font-weight: 600;">2.</span> [Strategy based on real competitor data]
<span style="color: #34d399; font-weight: 600;">3.</span> [Strategy based on real competitor data]
<span style="color: #34d399; font-weight: 600;">4.</span> [Strategy based on real competitor data]

## Next Steps
<span style="color: #34d399; font-weight: 600;">1.</span> [Specific action based on actual competitor analysis]
<span style="color: #34d399; font-weight: 600;">2.</span> [Specific action based on actual competitor analysis]
<span style="color: #34d399; font-weight: 600;">3.</span> [Specific action based on actual competitor analysis]
<span style="color: #34d399; font-weight: 600;">4.</span> [Specific action based on actual competitor analysis]

**GEOGRAPHIC CONTEXT QUESTIONS:**
If the search results include businesses from different areas/zip codes than the user's location, add this section:

### 🗺️ **Geographic Market Strategy**
I notice some competitors are located in different areas/zip codes than your business location. To provide more targeted advice:

<span style="color: #34d399; font-weight: 600;">•</span> Are you looking to compete primarily in your immediate area?
<span style="color: #34d399; font-weight: 600;">•</span> Are you considering expanding to other nearby markets or suburbs?
<span style="color: #34d399; font-weight: 600;">•</span> Would you like me to focus on hyper-local competitors within 5 miles of your location?

**REMEMBER: Base all analysis on the actual Google Places business data provided above. Do not create hypothetical examples.**`
      })
    }

    // Add file context if files were uploaded (clean markdown formatting)
    if (fileContext) {
      // Remove markdown formatting from file content to prevent double-processing
      const cleanFileContext = fileContext.replace(/\*\*([^*]+)\*\*/g, '$1')
      chatMessages.push({
        role: 'system' as const,
        content: `${cleanFileContext}

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