import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/landscaping'

  if (code) {
    const { supabase, response } = createClient(request)
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Server-side auth exchange error:', error)
        return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed&message=${encodeURIComponent(error.message)}`)
      }

      if (data.session) {
        console.log('Server-side auth exchange successful')
        // Use the response from createClient to ensure cookies are set
        const redirectResponse = NextResponse.redirect(`${origin}${redirect}`)
        
        // Copy cookies from the supabase response to our redirect response
        response.cookies.getAll().forEach(cookie => {
          redirectResponse.cookies.set(cookie.name, cookie.value)
        })
        
        return redirectResponse
      }
    } catch (error) {
      console.error('Server-side auth exchange exception:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_exception`)
    }
  }

  // No code parameter, redirect to login
  return NextResponse.redirect(`${origin}/login?error=no_auth_code`)
}