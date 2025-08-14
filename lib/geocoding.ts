// Google Geocoding API integration for dynamic location coordinates
// Converts ZIP codes, cities, and addresses to lat/lng for location bias

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

export async function geocodeLocation(location: string): Promise<GeocodeResult | null> {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('❌ Google API key not available for geocoding')
    return null
  }

  // Clean the location input
  const cleanLocation = location.trim()
  if (!cleanLocation || cleanLocation === 'Your ZIP' || cleanLocation.length < 3) {
    return null
  }

  try {
    const geocodeUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    geocodeUrl.searchParams.set('address', cleanLocation)
    geocodeUrl.searchParams.set('key', process.env.GOOGLE_PLACES_API_KEY)
    geocodeUrl.searchParams.set('region', 'us') // Bias results to US

    const response = await fetch(geocodeUrl.toString())
    
    if (!response.ok) {
      console.error('❌ Geocoding API error:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0]
      const { lat, lng } = result.geometry.location
      
      console.log('✅ Geocoded location:', {
        input: cleanLocation,
        output: result.formatted_address,
        coordinates: { lat, lng }
      })
      
      return {
        latitude: lat,
        longitude: lng,
        formatted_address: result.formatted_address
      }
    } else {
      console.log('⚠️ No geocoding results for:', cleanLocation, 'Status:', data.status)
      return null
    }
  } catch (error) {
    console.error('❌ Geocoding error:', error)
    return null
  }
}

// Get user coordinates from profile or geocode and persist
export async function getUserCoordinates(
  supabase: any, 
  userId: string, 
  location: string
): Promise<GeocodeResult | null> {
  // First check if user already has coordinates for this location
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('latitude, longitude, location')
      .eq('id', userId)
      .single()
    
    if (profile?.latitude && profile?.longitude && profile?.location === location) {
      console.log('✅ Using existing coordinates for user:', userId)
      return {
        latitude: profile.latitude,
        longitude: profile.longitude,
        formatted_address: profile.location
      }
    }
  } catch (error) {
    console.log('No existing coordinates found, will geocode')
  }
  
  // If no existing coordinates, geocode and persist
  const geocoded = await geocodeLocation(location)
  
  if (geocoded) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          location: geocoded.formatted_address // Update with standardized address
        })
        .eq('id', userId)
      
      if (error) {
        console.error('❌ Error updating user coordinates:', error)
        return geocoded // Still return coordinates even if save failed
      }
      
      console.log('✅ Geocoded and saved coordinates for user:', userId)
      return geocoded
    } catch (error) {
      console.error('❌ Error saving coordinates:', error)
      return geocoded // Still return coordinates even if save failed
    }
  }
  
  return null
}

// Update user profile with geocoded coordinates (legacy function)
export async function updateUserLocationCoordinates(
  supabase: any, 
  userId: string, 
  location: string
): Promise<GeocodeResult | null> {
  return getUserCoordinates(supabase, userId, location)
}