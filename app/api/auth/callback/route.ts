import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')
    const redirect = requestUrl.searchParams.get('redirect') || '/landscaping'

    console.log('OAuth callback received:', { 
      code: !!code, 
      error,
      errorDescription,
      redirect,
      allParams: Object.fromEntries(requestUrl.searchParams.entries()),
      fullUrl: request.url,
      timestamp: new Date().toISOString(),
      origin: requestUrl.origin,
      hasSupabaseConfig: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    })

    // Check for OAuth errors first
    if (error) {
      console.error('OAuth error received:', { error, errorDescription })
      return NextResponse.redirect(new URL(`/login?error=oauth_error&message=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin))
    }

    if (code) {
      console.log('Code parameter found, attempting to exchange for session')
      const { supabase, response } = createClient(request)
      
      // Handle PKCE code exchange properly  
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('OAuth exchange result:', { hasSession: !!session, error: error?.message, errorDetails: error })
      
      if (!error && session) {
        console.log('Session created successfully for user:', session.user.email)
        
        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        console.log('Profile check:', { hasProfile: !!profile, profileError: profileError?.message })

        // If no profile exists, redirect to profile completion
        if (!profile) {
          console.log('No profile found, redirecting to profile completion')
          return NextResponse.redirect(new URL(`/signup/complete?email=${session.user.email}`, requestUrl.origin))
        }

        // If profile exists, redirect to intended destination  
        console.log('Profile found, redirecting to:', redirect)
        
        // Return the response with proper cookies
        const redirectResponse = NextResponse.redirect(new URL(redirect, requestUrl.origin))
        return redirectResponse
      } else {
        console.error('Session exchange failed:', error)
        return NextResponse.redirect(new URL(`/login?error=session_exchange_failed&message=${encodeURIComponent(error?.message || 'Unknown error')}`, requestUrl.origin))
      }
    } else {
      console.log('No code parameter found in callback')
      return NextResponse.redirect(new URL('/login?error=no_auth_code', requestUrl.origin))
    }

  } catch (catchError) {
    console.error('OAuth callback exception:', catchError)
    return NextResponse.redirect(new URL(`/login?error=callback_exception&message=${encodeURIComponent(catchError instanceof Error ? catchError.message : 'Unknown error')}`, new URL(request.url).origin))
  }
}