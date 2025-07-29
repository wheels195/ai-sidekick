import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/landscaping'

  console.log('Server callback received code:', code ? 'YES' : 'NO')
  console.log('Redirect parameter:', redirect)

  // Since server can't access localStorage for PKCE verifier,
  // redirect to client-side page that can handle the exchange
  const clientCallbackUrl = `${origin}/auth/callback?code=${code}&redirect=${encodeURIComponent(redirect)}`
  
  console.log('Redirecting to client callback:', clientCallbackUrl)
  
  return NextResponse.redirect(clientCallbackUrl)
}