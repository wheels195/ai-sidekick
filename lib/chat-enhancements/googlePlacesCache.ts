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
  request: NextRequest,
  latitude?: number,
  longitude?: number,
  radius?: number
): Promise<string | null> {
  try {
    const { supabase } = createClient(request)
    
    // Check for cached results within 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    
    // Build cache key with coordinates and radius if available
    const cacheKey = latitude && longitude ? 
      `${query}|${zipCode}|${latitude.toFixed(4)}|${longitude.toFixed(4)}|${radius || 50000}` : 
      `${query}|${zipCode}`
    
    const { data: cachedResult, error } = await supabase
      .from('places_cache')
      .select('results')
      .eq('query', cacheKey)
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
  request: NextRequest,
  latitude?: number,
  longitude?: number,
  radius?: number
): Promise<void> {
  try {
    // Use service role for cache writes to bypass RLS
    const supabase = createServiceClient()
    
    // Build cache key with coordinates and radius if available
    const cacheKey = latitude && longitude ? 
      `${query}|${zipCode}|${latitude.toFixed(4)}|${longitude.toFixed(4)}|${radius || 50000}` : 
      `${query}|${zipCode}`
    
    const { error } = await supabase
      .from('places_cache')
      .insert({
        query: cacheKey,
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

  // Get coordinates for improved caching and accuracy
  const coordinates = location ? await getLocationCoordinates(location) : null
  const radius = 50000 // 50km radius
  
  // Check cache first
  const cachedResult = await getCachedPlacesResult(
    query, 
    zipCode, 
    request, 
    coordinates?.latitude, 
    coordinates?.longitude, 
    radius
  )
  if (cachedResult) {
    return cachedResult
  }

  // If no cache, perform fresh search
  const searchResults = await performGooglePlacesSearch(query, location)
  
  // Cache the results if successful
  if (searchResults && !searchResults.includes('error') && !searchResults.includes('not available')) {
    await cachePlacesResult(
      query, 
      zipCode, 
      searchResults, 
      request, 
      coordinates?.latitude, 
      coordinates?.longitude, 
      radius
    )
  }

  return searchResults
}

// Helper function to use Google's geocoding for dynamic location bias (nationwide support)
async function getLocationCoordinates(location: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    if (!process.env.GOOGLE_PLACES_API_KEY || !location || location === 'Your ZIP') {
      return null
    }

    const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    geocodeUrl.searchParams.set('address', location)
    geocodeUrl.searchParams.set('key', process.env.GOOGLE_PLACES_API_KEY)
    geocodeUrl.searchParams.set('region', 'us')

    const response = await fetch(geocodeUrl.toString())
    
    if (!response.ok) {
      console.error('❌ Geocoding API error:', response.status)
      return null
    }

    const data = await response.json()
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location
      console.log('✅ Geocoded coordinates for', location, ':', { lat, lng })
      return { latitude: lat, longitude: lng }
    }
    
    return null
  } catch (error) {
    console.error('❌ Geocoding error:', error)
    return null
  }
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
    
    // Get coordinates for location bias (more accurate targeting)
    const coordinates = location ? await getLocationCoordinates(location) : null
    
    const textSearchUrl = `https://places.googleapis.com/v1/places:searchText`
    
    // Build request body with optional location bias
    const requestBody: any = {
      textQuery: `${query} near ${location}`,
      maxResultCount: 15,
      languageCode: 'en',
      regionCode: 'US'
    }
    
    // Add location bias if coordinates are available
    if (coordinates) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          },
          radius: 50000 // 50km radius
        }
      }
      console.log('✅ Using location bias with coordinates:', coordinates)
    }
    
    const response = await fetch(textSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.businessStatus'
      },
      body: JSON.stringify(requestBody)
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
      
      // De-duplicate by business name and sort by rating (highest first)
      const uniquePlaces = data.places
        .filter((place: any, index: number, arr: any[]) => {
          const name = place.displayName?.text || ''
          return arr.findIndex(p => p.displayName?.text === name) === index
        })
        .sort((a: any, b: any) => {
          // Sort by rating (highest first), then by review count
          const ratingA = a.rating || 0
          const ratingB = b.rating || 0
          if (ratingA !== ratingB) return ratingB - ratingA
          
          const reviewsA = a.userRatingCount || 0
          const reviewsB = b.userRatingCount || 0
          return reviewsB - reviewsA
        })
        .slice(0, 10) // Top 10 unique, highest-rated results
      
      const formattedResults = uniquePlaces
        .map((place: any, index: number) => {
          const name = place.displayName?.text || 'Business Name Not Available'
          const address = place.formattedAddress || 'Address not available'
          const phone = place.nationalPhoneNumber || 'Phone not available'
          const rating = place.rating ? `${place.rating}⭐` : 'No rating'
          const reviewCount = place.userRatingCount ? `${place.userRatingCount} reviews` : 'No reviews'
          const website = place.websiteUri || 'Website not available'
          const status = place.businessStatus || 'Status unknown'
          
          let formatted = `BUSINESS ${index + 1}: **${name}**\n`
          formatted += `ADDRESS: ${address}\n`
          formatted += `PHONE: ${phone}\n`
          formatted += `RATING: ${rating} (${reviewCount})\n`
          formatted += `WEBSITE: ${website}\n`
          formatted += `BUSINESS_STATUS: ${status}\n`
          
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