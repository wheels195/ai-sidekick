import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, businessProfile } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const { supabase } = createClient(request)

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // If user was created and business profile provided, create profile
    if (authData.user && businessProfile) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          business_name: businessProfile.business_name,
          location: businessProfile.location,
          trade: businessProfile.trade,
          services: businessProfile.services || [],
          team_size: businessProfile.team_size,
          target_customers: businessProfile.target_customers,
          years_in_business: businessProfile.years_in_business,
          main_challenges: businessProfile.main_challenges || [],
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail the signup if profile creation fails
      }
    }

    return NextResponse.json({
      user: authData.user,
      message: 'Signup successful. Please check your email to confirm your account.',
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}