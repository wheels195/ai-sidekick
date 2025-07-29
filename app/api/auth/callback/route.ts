import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/landscaping'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_auth_code`)
  }

  // Create response object to handle cookies
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    console.log('Attempting PKCE code exchange with code:', code.substring(0, 10) + '...')
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('PKCE exchange error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed&message=${encodeURIComponent(error.message)}`)
    }

    if (data?.session) {
      console.log('PKCE exchange successful, user:', data.session.user.email)
      
      // Create redirect response and copy all cookies
      const redirectResponse = NextResponse.redirect(`${origin}${redirect}`)
      
      // Copy all cookies from our response
      response.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, {
          httpOnly: cookie.httpOnly,
          secure: true,
          sameSite: 'lax',
          path: '/'
        })
      })
      
      return redirectResponse
    } else {
      console.error('No session returned from exchange')
      return NextResponse.redirect(`${origin}/login?error=no_session_returned`)
    }
  } catch (error) {
    console.error('PKCE exchange exception:', error)
    return NextResponse.redirect(`${origin}/login?error=auth_exception&message=${encodeURIComponent(String(error))}`)
  }
}