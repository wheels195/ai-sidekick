import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user profile from database
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, business_name, trade, selected_plan, created_at, location, zip_code, services, team_size, target_customers, years_in_business, business_priorities, tokens_used_trial, trial_token_limit, trial_started_at, trial_expires_at')
      .eq('id', user.userId)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        businessName: profile.business_name,
        trade: profile.trade,
        selectedPlan: profile.selected_plan,
        createdAt: profile.created_at,
        location: profile.location,
        zipCode: profile.zip_code,
        services: profile.services || [],
        teamSize: profile.team_size,
        targetCustomers: profile.target_customers,
        yearsInBusiness: profile.years_in_business,
        businessPriorities: profile.business_priorities || [],
        // Trial token information
        tokensUsedTrial: profile.tokens_used_trial || 0,
        trialTokenLimit: profile.trial_token_limit || 250000,
        trialStartedAt: profile.trial_started_at,
        trialExpiresAt: profile.trial_expires_at
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser(request)
    const profileData = await request.json()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Map frontend field names to database column names
    if (profileData.firstName !== undefined) updateData.first_name = profileData.firstName
    if (profileData.lastName !== undefined) updateData.last_name = profileData.lastName
    if (profileData.businessName !== undefined) updateData.business_name = profileData.businessName
    if (profileData.trade !== undefined) updateData.trade = profileData.trade
    if (profileData.selectedPlan !== undefined) updateData.selected_plan = profileData.selectedPlan
    if (profileData.location !== undefined) updateData.location = profileData.location
    if (profileData.zipCode !== undefined) updateData.zip_code = profileData.zipCode
    if (profileData.services !== undefined) updateData.services = profileData.services
    if (profileData.teamSize !== undefined) updateData.team_size = profileData.teamSize
    if (profileData.targetCustomers !== undefined) updateData.target_customers = profileData.targetCustomers
    if (profileData.yearsInBusiness !== undefined) updateData.years_in_business = profileData.yearsInBusiness
    if (profileData.businessPriorities !== undefined) updateData.business_priorities = profileData.businessPriorities

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.userId)
      .select('id, first_name, last_name, email, business_name, trade, selected_plan, location, zip_code, services, team_size, target_customers, years_in_business, business_priorities')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        businessName: data.business_name,
        trade: data.trade,
        selectedPlan: data.selected_plan,
        location: data.location,
        zipCode: data.zip_code,
        services: data.services || [],
        teamSize: data.team_size,
        targetCustomers: data.target_customers,
        yearsInBusiness: data.years_in_business,
        businessPriorities: data.business_priorities || []
      },
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}