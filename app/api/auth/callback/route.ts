import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/landscaping'

  console.log('OAuth callback received:', { 
    code: !!code, 
    redirect,
    allParams: Object.fromEntries(requestUrl.searchParams.entries()),
    fullUrl: request.url
  })

  if (code) {
    console.log('Code parameter found, attempting to exchange for session')
    const supabase = createRouteHandlerClient({ cookies })
    
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
      return NextResponse.redirect(new URL(redirect, requestUrl.origin))
    } else {
      console.log('Session exchange failed:', error)
    }
  } else {
    console.log('No code parameter found in callback')
  }

  // Return to login with error
  console.log('OAuth callback failed, redirecting to login')
  return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
}