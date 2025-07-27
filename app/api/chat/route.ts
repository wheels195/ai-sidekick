import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { moderateUserMessage } from '@/lib/moderation'
import {
  getImageAnalysisPrompt,
  performCachedGooglePlacesSearch,
  performCachedGoogleCustomSearch,
  shouldTriggerWebSearch,
  enhanceSystemPromptWithEnforcement,
  createFileContextConfirmation,
  enhanceFileContext,
  detectHighValueQuery,
  detectQuestionIntent,
  extractMessageCategory
} from '@/lib/chat-enhancements'

// Initialize OpenAI client only when needed
const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000, // 60 seconds timeout
    maxRetries: 2,
  })
}

// Core modular prompt components
const CORE_IDENTITY = `# 🚀 Sage — Landscaping Business Growth Specialist

You are **Sage**, focused on generating immediate, measurable revenue for landscaping companies. You provide tactical intelligence, not generic advice.

## 🎯 PRIMARY OBJECTIVE
Generate immediate revenue through: specific scripts/templates, local market intelligence, tactical lead generation, revenue optimization strategies.

## ✅ CORE PRINCIPLES
1. **TACTICAL SPECIFICITY**: Exact scripts, templates, prices, step-by-step workflows
2. **IMMEDIATE IMPLEMENTATION**: Actions they can take TODAY
3. **REVENUE-FOCUSED**: Every recommendation ties to revenue/client acquisition
4. **LOCAL INTELLIGENCE**: Use ZIP code for hyper-local strategies
5. **NO GENERIC ADVICE**: Battlefield-tested tactics only`

const RESPONSE_RULES = `## 📋 Response Rules

### Format Selection by Query Type:
- **Strategic/Planning** → Full 5-section template with metrics
- **Research/Competitive** → Table + strategic insights  
- **Simple Q&A** → Direct answer + implementation tips
- **Pricing/Revenue** → Scripts + examples + ROI projections

### Engagement Requirements:
- End every response with 1-2 specific follow-up questions
- Reference specific details from your analysis (competitors, services, opportunities)
- Make questions actionable and decision-focused
- Avoid generic obstacles - focus on implementation choices

### Quality Standards:
- All recommendations must be measurable (leads, conversions, revenue, timeline, ROI)
- Include exact implementation steps, not vague suggestions
- Use emerald green formatting for emphasis and calls-to-action`

const CONTEXT_RULES = `## 🔒 Context Usage Rules

### User Profile Integration:
- Reference specific ZIP code (not "your area") for local strategies
- Only recommend tactics for services they actually offer
- Scale recommendations to their team size
- Address common landscaping challenges proactively

### Data Source Priorities:
1. **Live Search Data** → Use real business names, addresses, ratings for competitive analysis
2. **User Profile** → ZIP, services, team size, years in business, priorities
3. **Vector Knowledge** → 501-line landscaping business database
4. **File Uploads** → Customer docs, competitor analysis, project photos

### Critical Enforcement:
- Never guess or generalize - use actual data provided
- No recommendations for services they don't offer
- No generic advice that applies to any landscaper
- Always tie strategies to user's specific business context`

const QUALITY_CONTROL = `## 🚫 Quality Control

### Never Provide:
- Generic marketing advice ("post on social media")
- Vague recommendations ("improve your website")
- Blog-style content without implementation steps
- One-size-fits-all strategies
- Advice not tied to immediate revenue generation

### Always Include:
- Specific next-step actions (48-hour timeline)
- Exact scripts, templates, or language to use
- Contact information, websites, or resources
- Measurable success metrics and ROI projections
- Local market insights specific to their ZIP code`

// Dynamic template components (injected based on query type)
const STRATEGIC_TEMPLATE = `
### 🎯 Immediate Actions (Next 48 Hours)
- [ ] **Specific task with exact steps**
- [ ] **Scripts/templates to use**  
- [ ] **Contact info/resources to access**

### 📅 Weekly Implementation Plan
**Week 1:** [Specific actions with metrics]
**Week 2:** [Specific actions with metrics]
**Week 3:** [Specific actions with metrics] 
**Week 4:** [Revenue projections/outcomes]

### 💡 Tactical Intelligence
- **Local Market Insight:** [ZIP-specific data]
- **Competitive Edge:** [Differentiation strategy]
- **Seasonal Advantage:** [Timing optimization]

### 📞 Implementation Tools
**Phone Script:** [Exact language for calls]
**Email Template:** [Copy-paste ready text]
**Pricing Structure:** [Specific numbers/packages]

### 📊 Success Metrics
- **Target:** [Specific measurable goal]
- **Timeline:** [Realistic deadline]
- **ROI Projection:** [Expected revenue impact]`

// Conditional formatting components (injected only when needed)
const COMPETITIVE_ANALYSIS_FORMAT = `
**COMPETITIVE ANALYSIS FORMATTING:**

For 3+ businesses, use HTML table format:
<table style="width: 100%; border-collapse: collapse; font-family: Inter, system-ui, sans-serif; background-color: #1a1a1a; font-size: 14px;">
<thead>
<tr style="background-color: #111111;">
<th style="border-bottom: 2px solid #34d399; padding: 8px 12px; text-align: left; font-weight: 600; color: #34d399;">Business Name</th>
<th style="border-bottom: 2px solid #34d399; padding: 8px 12px; text-align: left; font-weight: 600; color: #34d399;">Phone</th>
<th style="border-bottom: 2px solid #34d399; padding: 8px 12px; text-align: left; font-weight: 600; color: #34d399;">Rating</th>
<th style="border-bottom: 2px solid #34d399; padding: 8px 12px; text-align: left; font-weight: 600; color: #34d399;">Website</th>
<th style="border-bottom: 2px solid #34d399; padding: 8px 12px; text-align: left; font-weight: 600; color: #34d399;">Services</th>
</tr>
</thead>
<tbody>[Table rows with actual business data]</tbody>
</table>

**Strategic Analysis Required:**
1. **Market Gaps:** Specific services missing (with revenue estimates)
2. **Pricing Opportunities:** Rating vs pricing analysis  
3. **Service Differentiation:** Tactics to outperform highest-rated competitors
4. **Competitive Threats:** Biggest threat identification
5. **Quick Wins:** Immediate actions vs lower-rated competitors

**30-Day Action Plan:**
- Week 1: [Specific competitor research task]
- Week 2: [Service/pricing adjustment based on gaps]
- Week 3: [Marketing campaign targeting competitor weakness]
- Week 4: [Direct competitive response with measurable goal]`

const BASIC_FORMATTING = `
**FORMATTING GUIDELINES:**
- Use emerald green (#34d399) for headings and emphasis
- Bold text with ** for important points
- Lists with - for bullets, numbers for sequences
- Never show raw markdown symbols
- End responses with actionable follow-up questions`

// Build base prompt from modular components  
const BASE_LANDSCAPING_SYSTEM_PROMPT = `${CORE_IDENTITY}

${RESPONSE_RULES}

${CONTEXT_RULES}

${QUALITY_CONTROL}

${BASIC_FORMATTING}`


// File processing function for images and documents
async function processUploadedFiles(files: any[], userMessage = ''): Promise<string> {
  if (!files || files.length === 0) {
    return ''
  }

  const fileAnalyses = []
  
  for (const file of files) {
    const { name, type, content } = file
    
    try {
      if (type.startsWith('image/')) {
        // For images, we'll use OpenAI's vision capabilities with dynamic prompts
        const openai = getOpenAIClient()
        const dynamicPrompt = getImageAnalysisPrompt({ name, type, content }, userMessage)
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: dynamicPrompt
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


// Calculate API costs based on actual usage
function calculateApiCosts({ model, inputTokens, outputTokens, googlePlacesCalls = 0, hasFiles = false }) {
  // OpenAI pricing per 1M tokens (as of 2025)
  const pricing = {
    'gpt-4o': { input: 2.50, output: 10.00 },           // $2.50/$10.00 per 1M tokens
    'gpt-4o-mini': { input: 0.15, output: 0.60 }        // $0.15/$0.60 per 1M tokens
  }
  
  const modelPricing = pricing[model] || pricing['gpt-4o-mini']
  
  // Calculate GPT costs
  const inputCostUsd = (inputTokens / 1000000) * modelPricing.input
  const outputCostUsd = (outputTokens / 1000000) * modelPricing.output
  const gptCostUsd = inputCostUsd + outputCostUsd
  
  // Google Places API cost ($0.017 per Text Search request)
  const placesCostUsd = googlePlacesCalls * 0.017
  
  // File processing cost (estimate additional 20% for vision/PDF processing)
  const filesCostUsd = hasFiles ? gptCostUsd * 0.20 : 0
  
  const totalCostUsd = gptCostUsd + placesCostUsd + filesCostUsd
  
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    model,
    gptCostUsd,
    placesCostUsd,
    filesCostUsd,
    totalCostUsd,
    breakdown: {
      inputCostUsd,
      outputCostUsd,
      googlePlacesCalls,
      hasFiles
    }
  }
}

// These functions are now imported from @/lib/chat-enhancements

// Convert user intent to intelligent search queries
function convertUserIntentToSearch(userMessage: string, userProfile: any): string {
  const message = userMessage.toLowerCase()
  
  // CRITICAL FIX: Market positioning and competitive analysis should ALWAYS search for landscaping competitors
  const competitorKeywords = ['position', 'leader', 'market', 'competitor', 'competition', 'beat', 'against', 'vs', 'stand out', 'differentiate']
  const landscapingKeywords = ['landscaping', 'lawn', 'irrigation', 'garden', 'yard', 'grass', 'tree', 'landscape']
  
  // Check if it's about positioning or competitors - ALWAYS return landscaping competitors
  if (competitorKeywords.some(keyword => message.includes(keyword))) {
    return 'landscaping companies lawn care services landscape contractors near me'
  }
  
  // If message mentions landscaping-related terms, search for landscaping businesses
  if (landscapingKeywords.some(keyword => message.includes(keyword))) {
    return 'landscaping companies lawn care services'
  }
  
  // Client acquisition requests - search for POTENTIAL CLIENTS not competitors
  if (message.includes('get') && (message.includes('client') || message.includes('customer') || message.includes('lead'))) {
    // For commercial clients, find businesses that NEED landscaping services
    if (userProfile?.target_customers?.includes('commercial') || message.includes('commercial')) {
      return 'office buildings hotels restaurants shopping centers medical facilities property management companies'
    }
    // For residential, find neighborhoods/communities
    return 'residential neighborhoods HOA homeowners associations property developments'
  }
  
  // Supplier/vendor/materials requests
  if (message.includes('supplier') || message.includes('vendor') || message.includes('nursery') || message.includes('material') || message.includes('equipment')) {
    return 'landscaping supplies nurseries garden centers mulch stone equipment dealers'
  }
  
  // Networking and partnerships
  if (message.includes('partner') || message.includes('network') || message.includes('referral')) {
    return 'real estate agents home builders property managers general contractors'
  }
  
  // Default fallback: ALWAYS search for landscaping competitors if no other clear intent
  return 'landscaping companies lawn care services landscape contractors'
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
        const supabase = createRouteHandlerClient({ cookies })
        
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
          
          // Check trial limits for authenticated users (skip for admin)
          if (profile && profile.user_role !== 'admin') {
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
            if (tokenLimit && tokensUsed >= tokenLimit) {
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

    // Require authenticated user
    if (!userProfile) {
      console.log('No authenticated user found - authentication required')
      return new Response('Authentication required', { status: 401 })
    }

    // Handle file processing if files are uploaded
    let fileContext = ''
    if (files && files.length > 0) {
      console.log('📁 Processing uploaded files:', files.length)
      fileContext = await processUploadedFiles(files, currentUserMessage.content)
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
    
    // Moderate user message for safety and policy compliance
    if (currentUserMessage?.role === 'user' && user) {
      try {
        console.log('🛡️ Moderating user message...')
        const moderationResult = await moderateUserMessage(
          currentUserMessage.content,
          user.id,
          undefined, // session ID - we could add this later
          request
        )
        
        if (!moderationResult.allowed) {
          console.log('🚫 User message blocked by moderation:', moderationResult.reason)
          return NextResponse.json(
            { 
              error: moderationResult.userMessage || 'Your message cannot be processed due to content policy.',
              errorType: 'CONTENT_MODERATION_BLOCKED',
              categories: moderationResult.categories
            },
            { status: 400 }
          )
        }
        
        console.log('✅ User message passed moderation')
      } catch (moderationError) {
        console.error('❌ Moderation check failed:', moderationError)
        // Continue processing - don't block users if moderation fails
      }
    }
    
    if (currentUserMessage?.role === 'user' && webSearchEnabled) {
      // Enhanced search: Google Places for local businesses + Google Custom Search for general web data
      console.log('🔍 Web search enabled - performing intelligent search routing')
      
      const location = userProfile?.location || userProfile?.zip_code || 'Dallas, TX'
      let placesResults = ''
      let webResults = ''
      
      // Check if query should trigger web search for current information
      const needsWebSearch = shouldTriggerWebSearch(currentUserMessage.content)
      
      console.log('🔍 Search analysis:', { 
        originalQuery: currentUserMessage.content,
        needsWebSearch,
        location 
      })
      
      try {
        // 1. Google Places search for local business data (existing functionality)
        console.log('🔍 Performing Google Places search...')
        const intelligentQuery = convertUserIntentToSearch(currentUserMessage.content, userProfile)
        console.log('🔍 Converted Places query:', { original: currentUserMessage.content, intelligent: intelligentQuery })
        
        placesResults = await performCachedGooglePlacesSearch(intelligentQuery, location, userProfile, request)
        console.log('🔍 Google Places search returned:', { 
          length: placesResults.length,
          hasError: placesResults.includes('error'),
          hasNotAvailable: placesResults.includes('not available'),
          hasNotConfigured: placesResults.includes('not configured')
        })
        
        // Smart retry logic for Places: if no results, try adjacent areas
        if (placesResults.includes('No local businesses found') && userProfile?.zip_code && userProfile.zip_code !== 'Your ZIP') {
          console.log('🔍 No Places results found, attempting smart retry with adjacent areas...')
          const adjacentLocation = `${userProfile.zip_code} surrounding areas`
          const retryResults = await performCachedGooglePlacesSearch(intelligentQuery, adjacentLocation, userProfile, request)
          if (retryResults && !retryResults.includes('No local businesses found')) {
            placesResults = retryResults
            console.log('🔍 Smart retry successful with adjacent areas')
          }
        }
        
        // 2. Google Custom Search for up-to-date web information (NEW)
        if (needsWebSearch) {
          console.log('🔍 Performing Google Custom Search for current information...')
          webResults = await performCachedGoogleCustomSearch(currentUserMessage.content, userProfile, request)
          console.log('🔍 Google Custom Search returned:', { 
            length: webResults.length,
            hasError: webResults.includes('error'),
            hasNotAvailable: webResults.includes('not available')
          })
        }
        
        // Combine search results
        const searchParts = []
        if (placesResults && !['error', 'not available', 'not configured'].some(term => placesResults.includes(term))) {
          searchParts.push(placesResults)
        }
        if (webResults && !['error', 'not available', 'not configured'].some(term => webResults.includes(term))) {
          searchParts.push(webResults)
        }
        
        searchResults = searchParts.join('\n\n---\n\n')
        
        console.log('🔍 Combined search results:', {
          hasPlaces: !!placesResults && !placesResults.includes('error'),
          hasWeb: !!webResults && !webResults.includes('error'),
          totalLength: searchResults.length
        })
        
      } catch (searchError) {
        console.error('❌ Search failed with exception:', searchError)
        console.error('❌ Search error details:', {
          message: searchError instanceof Error ? searchError.message : 'Unknown error',
          stack: searchError instanceof Error ? searchError.stack : undefined,
          placesApiKey: process.env.GOOGLE_PLACES_API_KEY ? 'Present' : 'Missing',
          customSearchApiKey: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY ? 'Present' : 'Missing',
          query: currentUserMessage.content,
          location
        })
        // Continue without search results rather than crashing the entire API
        searchResults = ''
      }
    }

    // Enhanced knowledge retrieval from vector database - AUTO-TRIGGERED ON ALL QUESTIONS
    let vectorKnowledge = ''
    if (currentUserMessage?.role === 'user') {
      console.log('🧠 Auto-triggering vector database knowledge retrieval...')
      
      try {
        // Import the vector search function
        const { enhancedKnowledgeSearch } = await import('@/lib/vectorSearch')
        
        // Search for relevant knowledge chunks - enhanced with user context
        const enhancedProfile = userProfile ? { ...userProfile, id: user?.id } : undefined
        
        // Detect question intent and enhance search query
        const searchQuery = detectQuestionIntent(currentUserMessage.content, userProfile)
        vectorKnowledge = await enhancedKnowledgeSearch(request, searchQuery, enhancedProfile)
        
        console.log('🧠 Vector knowledge auto-retrieved:', { 
          hasKnowledge: !!vectorKnowledge,
          length: vectorKnowledge.length,
          originalQuery: currentUserMessage.content,
          enhancedQuery: searchQuery
        })
        
      } catch (vectorError) {
        console.error('❌ Vector search failed:', vectorError)
        // Continue without vector knowledge rather than crashing
        vectorKnowledge = ''
      }
    }

    // Hardcoded landscaping industry challenges (comprehensive coverage for all users)
    const hardcodedChallenges = [
      "Labor shortages and retention",
      "Seasonality and inconsistent demand", 
      "Rising labor and material costs",
      "Underpricing and margin pressure",
      "Scheduling and routing inefficiencies",
      "Inventory and equipment management",
      "Lack of operational planning",
      "Inconsistent service quality",
      "Ineffective marketing and lead generation",
      "Weak brand identity",
      "Poor marketing ROI tracking",
      "Economic and recession uncertainty",
      "Labor management for seasonal peaks",
      "Regulatory and visa constraints (e.g., H-2B caps)",
      "Technology adoption gaps",
      "Environmental and pesticide regulations",
      "Competition from DIY and gig platforms",
      "Overexpansion without systems",
      "Lack of business/financial expertise",
      "Owner burnout and overwork"
    ]

    // Smart prompt assembly with conditional components
    let enhancedSystemPrompt = BASE_LANDSCAPING_SYSTEM_PROMPT
    
    // Add user profile context (high priority)
    if (userProfile) {
      const userName = userProfile.first_name ? ` ${userProfile.first_name}` : ''
      enhancedSystemPrompt += `

## 📊 Business Context
**Business:** ${userProfile.business_name || 'Not specified'}
**ZIP Code:** ${userProfile.zip_code || 'Not specified'} (use for all local strategies)
**Services:** ${userProfile.services?.join(', ') || 'Not specified'} (only recommend these)
**Team Size:** ${userProfile.team_size || 'Not specified'} (scale recommendations accordingly)
**Years in Business:** ${userProfile.years_in_business || 'Not specified'}
**Target Customers:** ${userProfile.target_customers || 'Not specified'}
**Business Priorities:** ${userProfile.business_priorities?.join(', ') || 'Not specified'}${userName ? `
**Address as:** ${userProfile.first_name}` : ''}`
    }

    // Detect query type for conditional template injection
    const queryContent = currentUserMessage?.content?.toLowerCase() || ''
    
    const isStrategicQuery = queryContent.includes('plan') || queryContent.includes('strategy') || 
                           queryContent.includes('grow') || queryContent.includes('scale') ||
                           /\d+\s*(day|week|month)/.test(queryContent)
    
    const isCompetitiveQuery = queryContent.includes('competitor') || queryContent.includes('competition') ||
                              queryContent.includes('landscaping companies') || queryContent.includes('vs')
    
    // Add strategic template only for strategic queries
    if (isStrategicQuery) {
      enhancedSystemPrompt += `

## 📋 Strategic Response Template Required
Use this 5-section structure for planning/strategic queries:
${STRATEGIC_TEMPLATE}`
    }
    
    // Add competitive analysis formatting only when needed
    if (isCompetitiveQuery && webSearchEnabled && searchResults) {
      enhancedSystemPrompt += `

${COMPETITIVE_ANALYSIS_FORMAT}`
    }

    // Add vector knowledge (medium priority - summarized)
    if (vectorKnowledge) {
      enhancedSystemPrompt += `

## 🧠 Knowledge Database
${vectorKnowledge.substring(0, 800)}${vectorKnowledge.length > 800 ? '...' : ''}`
    }

    // Add web search context (conditional based on results)
    if (webSearchEnabled && searchResults && !['error', 'not available', 'not configured'].some(term => searchResults.includes(term))) {
      const hasPlacesData = searchResults.includes('Google Places')
      const hasWebData = searchResults.includes('Google Custom Search') || searchResults.includes('web search results')
      
      let searchInstructions = '## 🌐 Live Data Available\n'
      
      if (hasPlacesData && hasWebData) {
        searchInstructions += 'You have access to both local business data (Google Places) and current web information (Google Custom Search). Use the business data for specific competitive intelligence and the web data for industry trends, best practices, and current information.'
      } else if (hasPlacesData) {
        searchInstructions += 'Use the Google Places search results to provide specific business intelligence with real names, addresses, phone numbers, and ratings. Transform this data into actionable competitive strategies.'
      } else if (hasWebData) {
        searchInstructions += 'Use the current web search results to provide up-to-date information, industry trends, and best practices. Reference specific sources and dates when available.'
      }
      
      enhancedSystemPrompt += `

${searchInstructions}`
    } else if (webSearchEnabled) {
      enhancedSystemPrompt += `

## 🌐 Search Enabled - No Results
Provide expert advice based on your training. Do not mention the failed search attempt.`
    } else {
      enhancedSystemPrompt += `

## 🌐 Search Disabled  
If user asks about competitors, suggest enabling Web Search for live business data.`
    }

    // Replace business name placeholder in system prompt
    enhancedSystemPrompt = enhancedSystemPrompt.replace(/\{businessName\}/g, userProfile.business_name || 'Your Business')

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

    // Add search results to context if available and valid (simplified)
    if (hasSearchResults) {
      const localContext = userProfile?.zip_code || userProfile?.location || ''
      chatMessages.push({
        role: 'system' as const,
        content: `## 🌐 Google Places Business Data
Query: "${currentUserMessage.content}" in ${localContext}

${searchResults}

**Instructions:** Use ONLY the real business data above. Never create fake competitors. Format competitive analysis as tables when 3+ businesses are found.`
      })
    }

    // Add file context if files were uploaded (preserve markdown formatting)
    if (fileContext) {
      const enhancedFileContext = enhanceFileContext(fileContext, currentUserMessage.content)
      chatMessages.push({
        role: 'system' as const,
        content: enhancedFileContext
      })
      
      // Add file context confirmation message
      const confirmationMessage = createFileContextConfirmation(true)
      if (confirmationMessage) {
        chatMessages.push(confirmationMessage)
      }
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

    // Call OpenAI API with streaming - SMART MODEL ROUTING for optimal quality/cost balance
    const openai = getOpenAIClient()
    let stream
    
    // Smart model selection based on query complexity and value
    const isHighValueQuery = detectHighValueQuery(currentUserMessage.content, userProfile)
    const modelToUse = hasSearchResults || hasFiles || isHighValueQuery ? 'gpt-4o' : 'gpt-4o-mini'
    const maxTokens = hasSearchResults || hasFiles || isHighValueQuery ? 6000 : 4000
    
    console.log(`🧠 Smart routing: ${modelToUse} (web search: ${webSearchEnabled}, files: ${files?.length || 0}, high-value: ${isHighValueQuery})`)
    console.log(`🧠 Query analysis: "${currentUserMessage.content.substring(0, 100)}..."`)
    
    // Log model usage for user awareness
    const modelIndicator = modelToUse === 'gpt-4o' ? '💪 GPT-4o' : '⚡ GPT-4o-mini'
    
    try {
      stream = await openai.chat.completions.create({
        model: modelToUse,
        messages: chatMessages,
        max_tokens: maxTokens,
        temperature: 0.7,
        stream: true,
        stream_options: { include_usage: true }  // Get actual token usage
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
        let actualTokenUsage = null
        
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content !== undefined && content !== null) {
              fullResponse += content
              
              // Send the token as Server-Sent Event - preserve exact content including empty strings
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(content)}\n\n`))
            }
            
            // Capture actual token usage from OpenAI
            if (chunk.usage) {
              actualTokenUsage = chunk.usage
              console.log('🎯 OpenAI actual token usage:', actualTokenUsage)
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
                  tokens_used: totalTokens,
                  cost_breakdown: costs,
                  model_used: modelToUse
                })
                .select('id')
                .single()

              // Calculate accurate token usage and costs
              const currentUserMessage = messages[messages.length - 1]
              
              // Use actual OpenAI token counts if available, otherwise estimate
              const inputTokens = actualTokenUsage?.prompt_tokens || Math.ceil((currentUserMessage?.content?.length || 0) / 4)
              const outputTokens = actualTokenUsage?.completion_tokens || Math.ceil(fullResponse.length / 4)
              const totalTokens = actualTokenUsage?.total_tokens || (inputTokens + outputTokens)
              
              // Calculate costs based on model and actual usage
              const costs = calculateApiCosts({
                model: modelToUse,
                inputTokens,
                outputTokens,
                googlePlacesCalls: webSearchEnabled && searchResults ? 1 : 0,
                hasFiles: files?.length > 0
              })
              
              console.log(`💰 Actual token usage: Input: ${inputTokens}, Output: ${outputTokens}, Total: ${totalTokens}`)
              console.log(`💰 Estimated cost: $${costs.totalCostUsd.toFixed(4)} (${modelToUse})`)
              console.log(`💰 Breakdown: GPT: $${costs.gptCostUsd.toFixed(4)}, Places: $${costs.placesCostUsd.toFixed(4)}, Files: $${costs.filesCostUsd.toFixed(4)}`)
              
              // Update user profile with token usage and cost tracking
              await supabase
                .from('user_profiles')
                .update({
                  tokens_used_trial: (userProfile?.tokens_used_trial || 0) + totalTokens,
                  total_cost_trial: (userProfile?.total_cost_trial || 0) + costs.totalCostUsd,
                  last_activity_at: new Date().toISOString()
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
// extractMessageCategory function now imported from @/lib/chat-enhancements

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