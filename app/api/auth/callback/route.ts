import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/landscaping'

  console.log('=== SERVER OAUTH CALLBACK ===')
  console.log('Server callback received code:', code ? 'YES' : 'NO')
  console.log('Redirect parameter:', redirect)
  console.log('Full URL:', requestUrl.href)

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      console.log('Attempting server-side code exchange...')
      // Modern Supabase handles PKCE automatically
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('OAuth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_error&message=${encodeURIComponent(error.message)}`)
      }

      if (data.session) {
        console.log('Server-side OAuth success:', data.session.user.email)
        
        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile check error:', profileError)
        }

        // Redirect to appropriate page
        if (!profile) {
          console.log('No profile, redirecting to signup completion')
          return NextResponse.redirect(`${requestUrl.origin}/signup/complete?email=${data.session.user.email}`)
        } else {
          console.log('Profile found, redirecting to:', redirect)
          return NextResponse.redirect(`${requestUrl.origin}${redirect}`)
        }
      } else {
        console.error('No session returned from code exchange')
        return NextResponse.redirect(`${requestUrl.origin}/login?error=no_session`)
      }
    } catch (error) {
      console.error('OAuth callback exception:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=callback_exception&message=${encodeURIComponent(String(error))}`)
    }
  }

  // No code parameter
  console.error('No OAuth code received')
  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_auth_code`)
}