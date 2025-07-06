import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
    }

    // Find user with this verification token
    const { data: user, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email_verification_token', token)
      .single()

    if (fetchError || !user) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 })
    }

    // Check if token is expired (24 hours)
    const tokenCreatedAt = new Date(user.email_verification_token_created_at)
    const now = new Date()
    const hoursDiff = (now.getTime() - tokenCreatedAt.getTime()) / (1000 * 60 * 60)

    if (hoursDiff > 24) {
      return NextResponse.json({ error: 'Verification token has expired' }, { status: 400 })
    }

    // Update user as verified
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_token_created_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user verification status:', updateError)
      return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
    }

    // Return success - frontend will redirect
    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully',
      redirectTo: '/login?verified=true'
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}