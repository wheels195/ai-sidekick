import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: any) {
          cookieStore.delete(name)
        },
      },
    }
  )
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    console.log('=== SESSION VERIFICATION ===')
    console.log('User:', user ? user.email : 'NONE')
    console.log('Error:', error?.message || 'NONE')
    console.log('Cookies present:', cookieStore.getAll().filter(c => c.name.startsWith('sb-')).map(c => c.name))
    
    return NextResponse.json({
      authenticated: !!user,
      user: user ? { id: user.id, email: user.email } : null,
      error: error?.message || null
    })
  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: String(error)
    }, { status: 500 })
  }
}