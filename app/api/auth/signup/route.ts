import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, selectedPlan, businessProfile } = await request.json()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'First name, last name, email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')

    // Create user profile with verification token and trial setup
    const userId = crypto.randomUUID()
    const now = new Date()
    const trialExpiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 days from now
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        password_hash: hashedPassword,
        email_verified: false,
        email_verification_token: verificationToken,
        email_verification_token_created_at: new Date().toISOString(),
        selected_plan: selectedPlan || 'Free Trial',
        business_name: businessProfile?.business_name,
        location: businessProfile?.location,
        zip_code: businessProfile?.zip_code,
        trade: businessProfile?.trade,
        services: businessProfile?.services || [],
        team_size: businessProfile?.team_size,
        target_customers: businessProfile?.target_customers,
        years_in_business: businessProfile?.years_in_business,
        business_priorities: businessProfile?.business_priorities || [],
        // Initialize 7-day trial with 250k tokens
        tokens_used_trial: 0,
        trial_token_limit: 250000,
        trial_started_at: now.toISOString(),
        trial_expires_at: trialExpiresAt.toISOString(),
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken)
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      // Don't fail signup if email fails, user can request another
    }

    return NextResponse.json({
      message: 'Account created successfully! Please check your email to verify your account.',
      userId: userId,
      emailSent: emailResult.success
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}