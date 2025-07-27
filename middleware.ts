import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  // Protect the /landscaping route
  if (request.nextUrl.pathname.startsWith('/landscaping')) {
    const response = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res: response })
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Redirect to login with a return URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/landscaping/:path*']
}