import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for auth callback
  if (request.nextUrl.pathname === '/auth/callback') {
    return NextResponse.next()
  }
  
  // Update session for all requests (this handles token refresh)
  const response = await updateSession(request)
  
  // Protect the /landscaping route
  if (request.nextUrl.pathname.startsWith('/landscaping')) {
    // Import here to avoid build issues
    const { createServerClient } = await import('@supabase/ssr')
    
    // Create supabase client with the response from updateSession
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
    
    const { data: { user } } = await supabase.auth.getUser()
    
    console.log('Middleware auth check:', { 
      path: request.nextUrl.pathname,
      hasUser: !!user,
      cookies: request.cookies.getAll().map(c => c.name)
    })
    
    if (!user) {
      // Redirect to login with a return URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}