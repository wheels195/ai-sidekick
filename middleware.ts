import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for auth callback
  if (request.nextUrl.pathname === '/auth/callback') {
    return NextResponse.next()
  }
  
  // Create a single supabase client instance for this request
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { createServerClient } = await import('@supabase/ssr')
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // This call handles token refresh automatically
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // Protect the /landscaping route
  if (request.nextUrl.pathname.startsWith('/landscaping')) {
    console.log('=== MIDDLEWARE AUTH CHECK ===')
    console.log('Path:', request.nextUrl.pathname)
    console.log('User:', user ? user.email : 'NONE')
    console.log('Auth Error:', error?.message || 'NONE')
    console.log('All cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 30)}...`))
    console.log('Supabase cookies:', request.cookies.getAll().filter(c => c.name.startsWith('sb-')).map(c => `${c.name}=${c.value.substring(0, 50)}...`))
    console.log('Auth token cookies:', request.cookies.getAll().filter(c => c.name.includes('auth-token')).map(c => `${c.name}=${c.value.substring(0, 50)}...`))
    
    if (!user) {
      console.log('❌ No user found, redirecting to login')
      // Redirect to login with a return URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    } else {
      console.log('✅ User authenticated, allowing access')
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}