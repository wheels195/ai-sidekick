import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest } from 'next/server'

interface CachedPlacesData {
  results: string
  created_at: string
}

export async function getCachedPlacesResult(
  query: string, 
  zipCode: string, 
  request: NextRequest
): Promise<string | null> {
  try {
    const { supabase } = createClient(request)
    
    // Check for cached results within 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    
    const { data: cachedResult, error } = await supabase
      .from('places_cache')
      .select('results')
      .eq('query', query)
      .eq('zip', zipCode)
      .gte('created_at', twentyFourHoursAgo)
      .single()

    if (error) {
      console.log('No cached Places result found:', error.message)
      return null
    }

    if (cachedResult?.results) {
      console.log('✅ Using cached Google Places result for:', query)
      return cachedResult.results
    }

    return null
  } catch (error) {
    console.error('Error checking Places cache:', error)
    return null
  }
}

export async function cachePlacesResult(
  query: string,
  zipCode: string,
  results: string,
  request: NextRequest
): Promise<void> {
  try {
    // Use service role for cache writes to bypass RLS
    const supabase = createServiceClient()
    
    const { error } = await supabase
      .from('places_cache')
      .insert({
        query,
        zip: zipCode,
        results,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error caching Places result:', error)
    } else {
      console.log('✅ Cached Google Places result for:', query)
    }
  } catch (error) {
    console.error('Error storing Places cache:', error)
  }
}

// Enhanced Google Places search with caching
export async function performCachedGooglePlacesSearch(
  query: string, 
  location: string,
  userProfile: any,
  request: NextRequest
): Promise<string> {
  const zipCode = userProfile?.zip_code || location

  // Check cache first
  const cachedResult = await getCachedPlacesResult(query, zipCode, request)
  if (cachedResult) {
    return cachedResult
  }

  // If no cache, perform fresh search
  const searchResults = await performGooglePlacesSearch(query, location)
  
  // Cache the results if successful
  if (searchResults && !searchResults.includes('error') && !searchResults.includes('not available')) {
    await cachePlacesResult(query, zipCode, searchResults, request)
  }

  return searchResults
}

// Helper function to use Google's geocoding for dynamic location bias (nationwide support)
async function getLocationCoordinates(location: string): Promise<{ latitude: number; longitude: number } | null> {
  // For now, we'll rely on Google Places API's built-in location handling
  // The textQuery "near [location]" should provide sufficient geographic targeting
  // without needing explicit lat/lng coordinates
  
  // Future enhancement: Could integrate with Google Geocoding API for precise coordinates
  // But Google Places API already handles location targeting well with "near [location]"
  
  return null
}

// Original Google Places search function (preserved from your existing code)
async function performGooglePlacesSearch(query: string, location?: string): Promise<string> {
  console.log('🔍 performGooglePlacesSearch called with:', { query, location, hasApiKey: !!process.env.GOOGLE_PLACES_API_KEY })
  
  if (!process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACES_API_KEY === 'your-google-places-api-key-here' || process.env.GOOGLE_PLACES_API_KEY === 'PLACEHOLDER_FOR_REAL_KEY') {
    console.log('❌ No valid Google Places API key found')
    return "Business search is not available at the moment - API key not configured."
  }

  try {
    const searchQuery = location ? `${query} in ${location}` : query
    console.log('🔍 Google Places search query:', searchQuery)
    
    const textSearchUrl = `https://places.googleapis.com/v1/places:searchText`
    
    const response = await fetch(textSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.priceLevel,places.websiteUri,places.businessStatus,places.types,places.editorialSummary'
      },
      body: JSON.stringify({
        textQuery: `${query} near ${location}`,
        maxResultCount: 15, // Increased from 8 to get more results
        languageCode: 'en',
        regionCode: 'US'
        // Note: Google Places API handles location targeting automatically with "near [location]"
        // This works nationwide for any city, ZIP code, or address without hardcoded coordinates
      })
    })

    if (!response.ok) {
      console.error('❌ Google Places API error:', response.status, response.statusText)
      return `Business search encountered an error: ${response.statusText}. Providing general guidance instead.`
    }

    const data = await response.json()
    console.log('🔍 Google Places API response:', { 
      resultCount: data.places?.length, 
      hasResults: !!data.places,
      query: `${query} near ${location}`,
      actualResults: data.places?.length || 0 
    })
    
    if (data.places && data.places.length > 0) {      
      console.log('🔍 Processing', data.places.length, 'results from Google Places API')
      const formattedResults = data.places
        .slice(0, 10) // Increased from 6 to 10 results for more comprehensive analysis
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
      
      console.log('✅ Google Places search completed successfully')
      return `Current local business data from Google Places:\n\n${formattedResults}`
    }
    
    console.log('⚠️ No Google Places results found for:', query, 'near', location)
    return "IMPORTANT: No local business data was returned from Google Places API for this search. DO NOT create fake or hypothetical competitors. Instead, explain to the user that no local competitors were found in their area and suggest they try a broader search or check if their location information is correct."
  } catch (error) {
    console.error('❌ Google Places search error:', error)
    return `IMPORTANT: Google Places API encountered an error and returned no real business data. DO NOT create fake competitors or hallucinate business information. Instead, inform the user that the business search failed due to: ${error instanceof Error ? error.message : 'Unknown error'}. Suggest they try again later or contact support if the issue persists.`
  }
}