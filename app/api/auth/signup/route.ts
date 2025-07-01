import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, businessData } = await request.json()

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

    // If user was created and business data provided, create profile
    if (authData.user && businessData) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          business_name: businessData.businessName,
          location: businessData.location,
          services: businessData.services || [],
          team_size: businessData.teamSize,
          price_range: businessData.priceRange,
          target_customers: businessData.targetCustomers,
          years_in_business: businessData.yearsInBusiness,
          monthly_revenue_range: businessData.monthlyRevenueRange,
          main_challenges: businessData.mainChallenges || [],
          marketing_budget: businessData.marketingBudget,
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