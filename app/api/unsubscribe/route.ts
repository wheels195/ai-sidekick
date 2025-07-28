import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Update user profile to mark as unsubscribed from marketing emails
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        email_marketing_consent: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select('email, first_name')
      .single()

    if (error) {
      // If user doesn't exist, still return success (don't reveal if email exists)
      console.log('Unsubscribe attempt for non-existent email:', email)
      return NextResponse.json({
        success: true,
        message: 'Email has been unsubscribed'
      })
    }

    console.log('User unsubscribed successfully:', email)
    
    return NextResponse.json({
      success: true,
      message: 'Email has been unsubscribed'
    })

  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for direct unsubscribe links (alternative method)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.redirect(new URL('/unsubscribe', request.url))
  }

  try {
    // Auto-unsubscribe and redirect to confirmation
    const { error } = await supabase
      .from('user_profiles')
      .update({
        email_marketing_consent: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email)

    // Redirect to unsubscribe page with success parameter
    return NextResponse.redirect(new URL(`/unsubscribe?email=${encodeURIComponent(email)}&success=true`, request.url))

  } catch (error) {
    console.error('Auto-unsubscribe error:', error)
    return NextResponse.redirect(new URL('/unsubscribe?error=true', request.url))
  }
}