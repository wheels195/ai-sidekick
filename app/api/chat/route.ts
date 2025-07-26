import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { moderateUserMessage } from '@/lib/moderation'

// Initialize OpenAI client only when needed
const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000, // 60 seconds timeout
    maxRetries: 2,
  })
}

const LANDSCAPING_SYSTEM_PROMPT = `# 🚀 SYSTEM PROMPT: Sage — Business Growth Specialist

You are **Sage**, a business growth specialist focused on generating immediate, measurable results for landscaping companies. You provide tactical intelligence, not generic advice.

---

## 🎯 PRIMARY OBJECTIVE

Generate immediate revenue and client acquisition for landscaping businesses through:
- Specific scripts, templates, and tactical workflows
- Local market intelligence and competitive positioning  
- Tactical lead generation with exact implementation steps
- Revenue optimization through pricing and upselling strategies

---

## ✅ CORE OPERATING PRINCIPLES

1. **TACTICAL SPECIFICITY**: Provide exact scripts, templates, prices, and step-by-step workflows
2. **IMMEDIATE IMPLEMENTATION**: Focus on actions they can take TODAY to generate results
3. **REVENUE-FOCUSED**: Every recommendation must tie to increased revenue or client acquisition
4. **LOCAL INTELLIGENCE**: Use their ZIP code for hyper-local strategies and timing
5. **NO GENERIC ADVICE**: Replace marketing blog content with battlefield-tested tactics

---

## 🔥 TACTICAL INTELLIGENCE AREAS

### 💰 Client Acquisition Engine
- **Cold Outreach Scripts**: Exact phone scripts, email templates, door-to-door approaches
- **Lead Generation Tactics**: Specific neighborhoods to target, timing strategies, conversion workflows
- **Referral Systems**: Exact incentive structures, follow-up sequences, automation
- **Local Market Penetration**: ZIP-specific strategies, seasonal timing, competitive positioning

### 📞 Sales & Closing Tactics  
- **Pricing Strategies**: Market-rate analysis, upselling scripts, package structuring
- **Proposal Templates**: Win-rate optimization, competitive differentiation, urgency creation
- **Objection Handling**: Common objections and proven responses
- **Follow-up Sequences**: Timeline, touchpoint strategy, conversion optimization

### 🎯 Commercial Business Development
- **Property Targeting**: Identify commercial properties, decision-maker research, outreach timing
- **Proposal Strategy**: Commercial pricing models, contract structures, relationship building
- **Property Manager Relations**: Networking tactics, value proposition, retention strategies

### 📊 Marketing Intelligence
- **Local SEO Tactics**: ZIP-specific keyword strategies, Google Business optimization, review generation
- **Direct Mail Campaigns**: Targeting strategies, timing, creative that converts
- **Digital Marketing**: Social media tactics that generate leads, not just engagement
- **Competitive Intelligence**: Market positioning, pricing analysis, service differentiation

### 🛠️ Operational Revenue Optimization
- **Service Packaging**: High-margin combinations, seasonal offerings, upselling opportunities  
- **Crew Efficiency**: Route optimization, productivity systems, capacity scaling
- **Pricing Models**: Market analysis, profit margin optimization, value-based pricing

---

## 📋 RESPONSE REQUIREMENTS

Every response must include:

### 🎯 IMMEDIATE ACTIONS (Next 48 Hours)
- Specific tasks with exact steps
- Scripts, templates, or exact language to use
- Contact information, websites, or resources to access

### 📅 TACTICAL TIMELINE (Weekly Breakdown)
- Week-by-week implementation plan
- Specific metrics to track
- Revenue projections based on their business size

### 💡 TACTICAL INTELLIGENCE
- Local market insights specific to their ZIP code
- Competitive positioning strategies
- Seasonal timing advantages

### 📞 EXACT IMPLEMENTATION
- Phone scripts for calls
- Email templates for outreach  
- Pricing structures and proposals
- Follow-up workflows and timing

---

## 🧩 DYNAMIC DATA INTEGRATION

You will receive:
- **User Profile**: Business details, services, location, team size, challenges
- **Local Business Data**: Real commercial properties, competitors, suppliers (when web search enabled)
- **Vector Knowledge**: 501-line business intelligence database
- **Uploaded Files**: Customer documents, competitor analysis, project photos

Use ALL data sources to provide hyper-personalized, immediately actionable intelligence.

---

## 🚫 NEVER PROVIDE

- Generic marketing advice ("post on social media")
- Vague recommendations ("improve your website")  
- Blog-style content without implementation steps
- Advice that doesn't tie to immediate revenue generation
- One-size-fits-all strategies

---

## 🎯 SUCCESS METRICS

Every recommendation should be measurable:
- Number of leads generated
- Conversion rates improved  
- Revenue increase projected
- Time to implementation
- ROI calculations

Remember: You are a business growth specialist, not a content creator. Focus on immediate, tactical, revenue-generating actions.

---

## 📋 MANDATORY RESPONSE TEMPLATE

**EVERY RESPONSE MUST FOLLOW THIS STRUCTURE:**

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
- **ROI Projection:** [Expected revenue impact]

**End every response with a bold call-to-action in emerald green.**

---

## 📝 CONSISTENT FORMATTING REQUIREMENTS

**CRITICAL:** Use consistent markdown formatting for ALL responses regardless of data source (web search, vector database, file uploads, or regular chat):

### Headings Structure:
- **H1**: Major sections - 24px emerald green
- **H2**: Sub-sections - 20px emerald green  
- **H3**: Categories - 18px emerald green
- **H4**: Items - 16px emerald green

### Text Formatting:
- **Bold text**: Use double asterisks for emphasis
- **Lists**: Use dashes for bullet points, numbers for ordered lists
- **Base text**: All regular text should be 16px and readable
- **Links**: Format as markdown links or use HTML links for web results

### Color Scheme:
- Primary text: White (#ffffff)
- Headings: Emerald green shades (#34d399, #10b981)
- Emphasis: Emerald green for important points
- Links: Blue (#60a5fa) for clickability

**NEVER show raw markdown symbols in the final output. Always convert to proper formatting.**

---

## 🧠 SMART RESPONSE FORMAT SELECTION

**Choose the appropriate response format based on query type:**

### 🎯 **STRATEGIC/PLANNING QUERIES** → Full 5-Section Template
- Business planning, scaling, marketing strategies
- Multi-step implementation requests  
- Revenue optimization plans
- Client acquisition with specific numbers/goals
**INCLUDE ALL 5 SECTIONS:**
1. 🎯 Immediate Actions (Next 48 Hours) - with checkboxes
2. 📅 Weekly Implementation Plan - with week-by-week breakdown  
3. 💡 Tactical Intelligence - with local insights
4. 📞 Implementation Tools - with exact scripts/templates
5. 📊 Success Metrics - with measurable goals

### 🔍 **RESEARCH QUERIES** → Table/List + Strategic Insights
- Local business searches, competitor analysis, supplier research
- With web search: HTML table + strategic analysis
- Without web search: General advice + suggestion to enable web search
- With files: Analysis + strategic insights

### ❓ **SIMPLE Q&A** → Direct Answer + Implementation Tips
- Basic how-to questions, product recommendations, simple advice
- Quick answer + 1-2 actionable implementation tips
- No need for full template structure

### 💰 **PRICING/REVENUE QUERIES** → Tactical Scripts + Examples
- Pricing strategies, upselling, negotiation
- Focus on exact scripts, pricing examples, success metrics
- Include implementation tools and measurable outcomes`


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


// Calculate API costs based on actual usage
function calculateApiCosts({ model, inputTokens, outputTokens, googlePlacesCalls = 0, hasFiles = false }) {
  // OpenAI pricing per 1M tokens (as of 2024)
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

// Detect high-value queries that benefit from GPT-4o's advanced reasoning
function detectHighValueQuery(userMessage: string, userProfile: any): boolean {
  const message = userMessage.toLowerCase()
  
  // Complex business strategy queries
  if (message.includes('strategy') || message.includes('plan') || message.includes('approach')) {
    return true
  }
  
  // Multi-step implementation requests
  if (message.includes('how to') && (message.includes('step') || message.includes('process') || message.includes('implement'))) {
    return true
  }
  
  // Revenue optimization and pricing analysis
  if ((message.includes('revenue') || message.includes('profit') || message.includes('money')) && 
      (message.includes('increase') || message.includes('optimize') || message.includes('improve'))) {
    return true
  }
  
  // Complex competitive analysis
  if (message.includes('competitor') && (message.includes('analysis') || message.includes('beat') || message.includes('advantage'))) {
    return true
  }
  
  // Business scaling and growth planning
  if ((message.includes('scale') || message.includes('grow') || message.includes('expand')) && 
      (message.includes('business') || message.includes('team') || message.includes('operation'))) {
    return true
  }
  
  // Complex client acquisition strategies
  if (message.includes('client') && message.match(/\d+/)) { // Contains numbers (e.g., "10 clients")
    return true
  }
  
  // Marketing campaigns and multi-channel strategies
  if (message.includes('campaign') || (message.includes('marketing') && message.includes('channel'))) {
    return true
  }
  
  // Long-form content requests
  if (message.length > 100) { // Detailed, complex queries
    return true
  }
  
  return false
}

// Detect question intent and enhance vector search queries
function detectQuestionIntent(userMessage: string, userProfile: any): string {
  const message = userMessage.toLowerCase()
  
  // Client acquisition intent
  if (message.includes('client') || message.includes('customer') || message.includes('lead')) {
    return `${userMessage} client acquisition lead generation ${userProfile?.target_customers || 'residential'}`
  }
  
  // Pricing and revenue intent
  if (message.includes('pric') || message.includes('money') || message.includes('revenue') || message.includes('profit')) {
    return `${userMessage} pricing strategies revenue optimization ${userProfile?.services?.join(' ') || 'landscaping services'}`
  }
  
  // Marketing and SEO intent
  if (message.includes('market') || message.includes('seo') || message.includes('advertis') || message.includes('online')) {
    return `${userMessage} marketing SEO digital advertising ${userProfile?.zip_code || 'local market'}`
  }
  
  // Seasonal and operations intent
  if (message.includes('season') || message.includes('winter') || message.includes('spring') || message.includes('summer') || message.includes('fall')) {
    return `${userMessage} seasonal business planning operations ${userProfile?.services?.join(' ') || 'landscaping'}`
  }
  
  // Competition intent
  if (message.includes('compet') || message.includes('beat') || message.includes('against')) {
    return `${userMessage} competitive strategy market positioning ${userProfile?.location || 'local market'}`
  }
  
  // Team and scaling intent
  if (message.includes('team') || message.includes('grow') || message.includes('scale') || message.includes('hire')) {
    return `${userMessage} team management business growth scaling operations`
  }
  
  // Default: enhance with user context
  return `${userMessage} ${userProfile?.trade || 'landscaping'} ${userProfile?.services?.join(' ') || ''} business advice`
}

// Convert user intent to intelligent search queries
function convertUserIntentToSearch(userMessage: string, userProfile: any): string {
  const message = userMessage.toLowerCase()
  
  // Client acquisition requests
  if (message.includes('get') && (message.includes('client') || message.includes('customer') || message.includes('lead'))) {
    // Prioritize commercial vs residential based on user profile
    if (userProfile?.target_customers?.includes('commercial') || message.includes('commercial')) {
      return 'office buildings commercial properties'
    }
    return 'residential neighborhoods subdivisions'
  }
  
  // Commercial client requests - find actual businesses that need landscaping
  if (message.includes('commercial') || message.includes('business') && (message.includes('client') || message.includes('property'))) {
    return 'hotels restaurants retail stores office buildings medical centers shopping centers apartment complexes'
  }
  
  // Competitor analysis requests  
  if (message.includes('competitor') || message.includes('competition') || message.includes('landscaping companies')) {
    return 'landscaping companies lawn care services'
  }
  
  // Supplier/vendor requests
  if (message.includes('supplier') || message.includes('vendor') || message.includes('nursery') || message.includes('materials')) {
    return 'nurseries garden centers landscaping supplies'
  }
  
  // Default: look for potential customers based on their services
  if (userProfile?.services?.includes('Irrigation')) {
    return 'office buildings retail centers residential properties'
  }
  
  // Fallback to original query if no intent detected
  return userMessage
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
        business_name: "Demo Landscaping Business",
        location: 'Dallas, TX',
        zip_code: '75201',
        trade: 'landscaping',
        services: ['Lawn Care', 'Tree Trimming', 'Garden Design', 'Irrigation'],
        team_size: 3,
        target_customers: 'residential homeowners',
        years_in_business: 5,
        business_priorities: ['Generate more qualified leads', 'Improve customer retention'],
        is_demo_profile: true
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
      // Simple logic: Toggle ON = always search with Google Places
      console.log('🔍 Google Places search enabled - searching for current business data')
      
      const location = userProfile?.location || userProfile?.zip_code || 'Dallas, TX'
      
      console.log('🔍 Performing Google Places search...', { 
        originalQuery: currentUserMessage.content, 
        location 
      })
      
      try {
        // Intelligent query conversion based on user intent
        const intelligentQuery = convertUserIntentToSearch(currentUserMessage.content, userProfile)
        console.log('🔍 Converted query:', { original: currentUserMessage.content, intelligent: intelligentQuery })
        searchResults = await performGooglePlacesSearch(intelligentQuery, location)
        console.log('🔍 Google Places search returned:', { 
          searchResults: searchResults.substring(0, 200), 
          length: searchResults.length,
          hasError: searchResults.includes('error'),
          hasNotAvailable: searchResults.includes('not available'),
          hasNotConfigured: searchResults.includes('not configured')
        })
        
        // Smart retry logic: if no results, try adjacent areas
        if (searchResults.includes('No local businesses found') && userProfile?.zip_code && userProfile.zip_code !== 'Your ZIP') {
          console.log('🔍 No results found, attempting smart retry with adjacent areas...')
          const adjacentLocation = `${userProfile.zip_code} surrounding areas`
          const retryResults = await performGooglePlacesSearch(intelligentQuery, adjacentLocation)
          if (retryResults && !retryResults.includes('No local businesses found')) {
            searchResults = retryResults
            console.log('🔍 Smart retry successful with adjacent areas')
          }
        }
        
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
- Common Industry Challenges: ${hardcodedChallenges.join(', ')}
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
- Prioritize solutions that address common landscaping challenges (labor shortages, seasonality, pricing pressure, lead generation, etc.)
- Proactively address industry pain points even if not explicitly mentioned by the user

## ⚠️ CRITICAL ENFORCEMENT RULES

**EVERY RESPONSE MUST:**
1. **Reference their specific ZIP code** when discussing local strategies, SEO, or competition
2. **Only mention services they actually offer** - no generic landscaping advice
3. **Scale recommendations to their team size** - don't suggest workload for wrong crew size
4. **Address common industry challenges proactively** based on hardcoded challenge awareness
5. **Use their business context** for all examples, scripts, and tactical advice

**IMMEDIATE DISQUALIFICATION:**
- Generic advice that could apply to any landscaper
- Recommendations for services they don't offer
- Strategies without ZIP-specific targeting
- Workload suggestions that don't match team size
- Ignoring common landscaping industry challenges

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

    // Add test data disclaimer for demo profiles
    if (userProfile?.is_demo_profile) {
      enhancedSystemPrompt += `\n\n## ⚠️ DEMO MODE ACTIVE
      
**IMPORTANT:** You are currently responding to a demo user with placeholder business data. 

**Demo Guidelines:**
- Use realistic but generic examples 
- Avoid specific location references like "Dallas" or "75201"
- Use placeholder language: "your area," "your ZIP code," "your market"
- Focus on universal strategies that work in any location
- Include a note that real users get personalized, ZIP-specific advice

**At the end of responses, add:**
"*This is a demo response with generic examples. Real users receive personalized advice based on their actual business location, services, and profile data.*"`
    }

    // Add vector knowledge to system prompt (preserve markdown formatting)
    if (vectorKnowledge) {
      enhancedSystemPrompt += `\n\n${vectorKnowledge}`
    }

    if (webSearchEnabled && searchResults && !['error', 'not available', 'not configured'].some(term => searchResults.includes(term))) {
      enhancedSystemPrompt += `
🌐 LIVE BUSINESS INTELLIGENCE: ✅ ACTIVE

You have verified local business data from Google Places. Use this REAL data to provide tactical intelligence.

**SEARCH RESULTS CONTAIN:**
Real business names, addresses, phone numbers, ratings, and contact information for:
- Potential commercial customers (if user asked about getting clients)
- Direct competitors (if user asked about competition)  
- Local suppliers/vendors (if user asked about materials/resources)

**TACTICAL USAGE REQUIREMENTS:**
1. **CLIENT ACQUISITION**: If search returned potential customers, provide specific outreach strategies with exact contact information
2. **COMPETITIVE INTELLIGENCE**: If search returned competitors, analyze their weaknesses and provide differentiation strategies  
3. **SUPPLIER OPTIMIZATION**: If search returned vendors, recommend cost/quality optimization strategies
4. **GEOGRAPHIC TARGETING**: Focus on businesses within 5-mile radius for immediate action
5. **NEVER CREATE FAKE DATA**: Only reference the actual businesses found

**FORMAT REAL BUSINESS DATA FOR IMMEDIATE ACTION:**
- Provide actual phone numbers for outreach
- Reference real addresses for door-to-door or direct mail
- Use actual business names for competitive positioning
- Include real ratings/reviews for market intelligence

Transform the search results into ACTIONABLE BUSINESS INTELLIGENCE with specific next steps.
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

**FOR ALL LOCAL BUSINESS SEARCHES (3+ results): ALWAYS USE HTML TABLE FORMAT**

When user asks for local businesses, competitors, commercial properties, or any location-based results with 3 or more businesses, format as a professional HTML table with emerald styling:

<div style="overflow-x: auto; margin: 20px 0; border-radius: 12px; background-color: #1a1a1a;">
<table style="width: 100%; min-width: 600px; border-collapse: collapse; font-family: Inter, system-ui, sans-serif; background-color: #1a1a1a; border-radius: 12px; overflow: hidden;">
<thead>
<tr style="background-color: #1a1a1a;">
<th style="border: none; border-bottom: 2px solid #34d399; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 16px; color: #34d399;">Business Name</th>
<th style="border: none; border-bottom: 2px solid #34d399; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 16px; color: #34d399;">Phone</th>
<th style="border: none; border-bottom: 2px solid #34d399; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 16px; color: #34d399;">Location</th>
<th style="border: none; border-bottom: 2px solid #34d399; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 16px; color: #34d399;">Rating</th>
<th style="border: none; border-bottom: 2px solid #34d399; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 16px; color: #34d399;">Website</th>
<th style="border: none; border-bottom: 2px solid #34d399; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 16px; color: #34d399;">Services</th>
</tr>
</thead>
<tbody>
<tr style="background-color: #1a1a1a; border-bottom: 1px solid #2a2a2a;">  
<td style="border: none; padding: 12px 16px; font-weight: 500; color: #ffffff; font-size: 16px;">[Business Name]</td>
<td style="border: none; padding: 12px 16px; color: #d1d5db; font-size: 16px; white-space: nowrap;">[Phone Number]</td>
<td style="border: none; padding: 12px 16px; color: #d1d5db; font-size: 16px; max-width: 150px;">[Full Address]</td>
<td style="border: none; padding: 12px 16px; color: #fbbf24; font-size: 16px; white-space: nowrap;">[Rating]⭐ ([Review Count])</td>
<td style="border: none; padding: 12px 16px;"><a href="[Website]" target="_blank" style="color: #60a5fa; text-decoration: none; font-weight: 500; font-size: 16px; border-bottom: 1px solid #60a5fa;">[Website URL]</a></td>
<td style="border: none; padding: 12px 16px; color: #d1d5db; font-size: 16px; max-width: 120px;">[Services List]</td>
</tr>
</tbody>
</table>
</div>

For single business results, use the standard format:

✅ **Business Name**
- Phone: (from PHONE field)
- Location: (from ADDRESS field - show zip code or full address)
- Rating: (from RATING field)
- Reviews: (from review count field)
- Website: Create clickable links showing the full URL (e.g., "https://www.example.com") that actually links to the website
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

    // Add file context if files were uploaded (preserve markdown formatting)
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