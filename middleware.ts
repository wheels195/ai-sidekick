import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // TEMPORARILY DISABLED FOR TESTING
  // Only protect the /landscaping route for now
  if (request.nextUrl.pathname.startsWith('/landscaping')) {
    // AUTHENTICATION DISABLED FOR TESTING
    return NextResponse.next()
    
    /* 
    const user = await getUser(request)
    
    if (!user) {
      // Redirect to login with a return URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    */
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/landscaping/:path*']
}