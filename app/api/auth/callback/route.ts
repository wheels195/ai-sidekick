import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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
    origin: requestUrl.origin
  })

  // Check for OAuth errors first
  if (error) {
    console.error('OAuth error received:', { error, errorDescription })
    return NextResponse.redirect(new URL(`/login?error=oauth_error&message=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin))
  }

  if (code) {
    const cookieStore = cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Session exchange failed:', exchangeError)
      return NextResponse.redirect(new URL(`/login?error=session_exchange_failed&message=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin))
    }

    if (data.session) {
      console.log('Session created successfully for user:', data.session.user.email)
      
      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single()

      console.log('Profile check:', { hasProfile: !!profile, profileError: profileError?.message })

      // If no profile exists, redirect to profile completion
      if (!profile) {
        console.log('No profile found, redirecting to profile completion')
        return NextResponse.redirect(new URL(`/signup/complete?email=${data.session.user.email}`, requestUrl.origin))
      }

      // If profile exists, redirect to intended destination
      console.log('Profile found, redirecting to:', redirect)
      return NextResponse.redirect(new URL(redirect, requestUrl.origin))
    }
  }

  console.log('OAuth callback failed - no code or session')
  return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
}