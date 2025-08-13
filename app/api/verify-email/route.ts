import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email'

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

    // Also update the auth user to confirm their email
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirmed_at: new Date().toISOString() }
    )

    if (authUpdateError) {
      console.error('Error updating auth user:', authUpdateError)
      // Don't fail the verification if this fails
    }

    // Send welcome email after successful verification
    const welcomeEmailResult = await sendWelcomeEmail(
      user.email, 
      user.first_name, 
      user.business_name || 'Your Business', 
      user.trade || 'landscaping'
    )
    
    if (!welcomeEmailResult.success) {
      console.error('Failed to send welcome email:', welcomeEmailResult.error)
      // Don't fail verification if welcome email fails
    }

    // Return success with user data - frontend will redirect to profile completion
    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully',
      redirectTo: `/signup/complete?email=${encodeURIComponent(user.email)}&verified=true`,
      email: user.email
    })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}