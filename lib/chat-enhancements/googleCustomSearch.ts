import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

interface CachedSearchData {
  results: string
  created_at: string
}

export async function getCachedSearchResult(
  query: string, 
  searchType: string,
  request: NextRequest
): Promise<string | null> {
  try {
    const { supabase } = createClient(request)
    
    // Check for cached results within 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    
    const { data: cachedResult, error } = await supabase
      .from('web_search_cache')
      .select('results')
      .eq('query', query)
      .eq('search_type', searchType)
      .gte('created_at', twentyFourHoursAgo)
      .single()

    if (error) {
      console.log('No cached Web Search result found:', error.message)
      return null
    }

    if (cachedResult?.results) {
      console.log('✅ Using cached Google Custom Search result for:', query)
      return cachedResult.results
    }

    return null
  } catch (error) {
    console.error('Error checking Web Search cache:', error)
    return null
  }
}

export async function cacheSearchResult(
  query: string,
  searchType: string,
  results: string,
  request: NextRequest
): Promise<void> {
  try {
    const { supabase } = createClient(request)
    
    const { error } = await supabase
      .from('web_search_cache')
      .insert({
        query,
        search_type: searchType,
        results,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error caching Web Search result:', error)
    } else {
      console.log('✅ Cached Google Custom Search result for:', query)
    }
  } catch (error) {
    console.error('Error storing Web Search cache:', error)
  }
}

// Enhanced Google Custom Search with caching
export async function performCachedGoogleCustomSearch(
  query: string, 
  userProfile: any,
  request: NextRequest
): Promise<string> {
  const searchType = detectSearchType(query)
  
  // Check cache first
  const cachedResult = await getCachedSearchResult(query, searchType, request)
  if (cachedResult) {
    return cachedResult
  }

  // If no cache, perform fresh search
  const searchResults = await performGoogleCustomSearch(query, searchType, userProfile)
  
  // Cache the results if successful
  if (searchResults && !searchResults.includes('error') && !searchResults.includes('not available')) {
    await cacheSearchResult(query, searchType, searchResults, request)
  }

  return searchResults
}

// Detect what type of search this is for domain filtering
function detectSearchType(query: string): string {
  const queryLower = query.toLowerCase()
  
  if (queryLower.includes('trend') || queryLower.includes('2024') || queryLower.includes('2025') || queryLower.includes('latest')) {
    return 'trends'
  }
  
  if (queryLower.includes('price') || queryLower.includes('cost') || queryLower.includes('rate')) {
    return 'pricing'
  }
  
  if (queryLower.includes('regulation') || queryLower.includes('permit') || queryLower.includes('license')) {
    return 'regulatory'
  }
  
  if (queryLower.includes('equipment') || queryLower.includes('tool') || queryLower.includes('software')) {
    return 'equipment'
  }
  
  if (queryLower.includes('marketing') || queryLower.includes('seo') || queryLower.includes('google')) {
    return 'marketing'
  }
  
  return 'general'
}

// Get domain filters based on search type
function getDomainFilters(searchType: string, userProfile: any): string[] {
  const landscapingDomains = [
    'landscapenetwork.com',
    'turfmagazine.com', 
    'lawnandlandscape.com',
    'pro.lawncare.net',
    'lawncarebusinessowner.com',
    'landscapemanagement.net',
    'groundstradespro.com'
  ]
  
  const businessDomains = [
    'sba.gov',
    'score.org',
    'entrepreneur.com',
    'inc.com',
    'smallbiztrends.com',
    'businessnewsdaily.com'
  ]
  
  const marketingDomains = [
    'searchengineland.com',
    'moz.com',
    'marketingland.com',
    'wordstream.com',
    'hubspot.com',
    'localiq.com'
  ]
  
  switch (searchType) {
    case 'trends':
    case 'equipment':
      return [...landscapingDomains, ...businessDomains]
    case 'marketing':
      return [...marketingDomains, ...businessDomains]
    case 'regulatory':
      return ['sba.gov', 'irs.gov', ...landscapingDomains]
    case 'pricing':
      return [...landscapingDomains, ...businessDomains]
    default:
      return [...landscapingDomains, ...businessDomains, ...marketingDomains]
  }
}

// Google Custom Search implementation
async function performGoogleCustomSearch(
  query: string, 
  searchType: string,
  userProfile: any
): Promise<string> {
  console.log('🔍 performGoogleCustomSearch called with:', { 
    query, 
    searchType, 
    hasApiKey: !!process.env.GOOGLE_CUSTOM_SEARCH_API_KEY,
    hasEngineId: !!process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID
  })
  
  if (!process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || !process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID) {
    console.log('❌ No valid Google Custom Search API key or Engine ID found')
    return "Web search is not available at the moment - API credentials not configured."
  }

  try {
    // Add location context if available
    const locationContext = userProfile?.location || userProfile?.zip_code
    const enhancedQuery = locationContext && locationContext !== 'Your ZIP' 
      ? `${query} ${locationContext}` 
      : query
    
    console.log('🔍 Google Custom Search query:', enhancedQuery)
    
    const searchUrl = new URL('https://www.googleapis.com/customsearch/v1')
    searchUrl.searchParams.set('key', process.env.GOOGLE_CUSTOM_SEARCH_API_KEY)
    searchUrl.searchParams.set('cx', process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID)
    searchUrl.searchParams.set('q', enhancedQuery)
    searchUrl.searchParams.set('num', '8') // Get top 8 results
    searchUrl.searchParams.set('dateRestrict', 'y1') // Results from last year only
    
    // Add domain filtering for quality results
    const domainFilters = getDomainFilters(searchType, userProfile)
    if (domainFilters.length > 0) {
      const siteQuery = domainFilters.map(domain => `site:${domain}`).join(' OR ')
      searchUrl.searchParams.set('q', `(${siteQuery}) ${enhancedQuery}`)
    }
    
    const response = await fetch(searchUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('❌ Google Custom Search API error:', response.status, response.statusText)
      return `Web search encountered an error: ${response.statusText}. Providing general guidance instead.`
    }

    const data = await response.json()
    console.log('🔍 Google Custom Search API response:', { 
      resultCount: data.items?.length, 
      hasResults: !!data.items,
      query: enhancedQuery,
      actualResults: data.items?.length || 0 
    })
    
    if (data.items && data.items.length > 0) {      
      console.log('🔍 Processing', data.items.length, 'results from Google Custom Search API')
      
      const formattedResults = data.items
        .slice(0, 6) // Top 6 results for quality
        .map((item: any, index: number) => {
          const title = item.title || 'Title Not Available'
          const link = item.link || ''
          const snippet = item.snippet || 'No description available'
          const displayLink = item.displayLink || ''
          
          let formatted = `**RESULT ${index + 1}: ${title}**\n`
          formatted += `SOURCE: ${displayLink}\n`
          formatted += `SUMMARY: ${snippet}\n`
          formatted += `URL: ${link}\n`
          
          return formatted
        })
        .join('\n---\n\n')
      
      const searchSummary = `**Search Query:** ${enhancedQuery}\n**Search Type:** ${searchType}\n**Results Found:** ${data.items.length}\n**Domain Focus:** ${getDomainFilters(searchType, userProfile).slice(0, 3).join(', ')}\n\n`
      
      console.log('✅ Google Custom Search completed successfully')
      return `${searchSummary}Current web search results:\n\n${formattedResults}\n\n**Note:** Results are filtered to show the most relevant and up-to-date information from trusted landscaping and business sources.`
    }
    
    console.log('⚠️ No Google Custom Search results found')
    return "No relevant web results found for this query."
  } catch (error) {
    console.error('❌ Google Custom Search error:', error)
    return `Web search encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Providing general guidance instead.`
  }
}

// Smart query analysis to determine if web search should be triggered
export function shouldTriggerWebSearch(query: string): boolean {
  const queryLower = query.toLowerCase()
  
  // Keywords that indicate need for current/up-to-date information
  const webSearchTriggers = [
    // Time-sensitive queries
    'latest', 'recent', 'current', 'new', 'trend', '2024', '2025', 'this year',
    
    // Market research queries  
    'market', 'industry report', 'statistics', 'data', 'study', 'research',
    
    // Regulatory and compliance
    'regulation', 'law', 'permit', 'license', 'requirement', 'compliance',
    
    // Technology and tools
    'software', 'app', 'tool', 'equipment', 'technology', 'platform',
    
    // Business trends
    'best practice', 'strategy', 'case study', 'success story', 'example',
    
    // Pricing and rates
    'going rate', 'market rate', 'average price', 'pricing trend', 'cost analysis'
  ]
  
  // Check if query contains any web search trigger keywords
  return webSearchTriggers.some(trigger => queryLower.includes(trigger))
}