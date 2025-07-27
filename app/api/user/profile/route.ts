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
      .select('id, first_name, last_name, email, business_name, trade, selected_plan, user_role, created_at, location, zip_code, services, team_size, target_customers, years_in_business, business_priorities, tokens_used_trial, trial_token_limit, trial_started_at, trial_expires_at')
      .eq('id', user.userId)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if user has any previous conversations to determine if they're a returning user
    const { data: conversations, error: convError } = await supabase
      .from('user_conversations')
      .select('id')
      .eq('user_id', user.userId)
      .limit(1)

    const hasConversationHistory = conversations && conversations.length > 0

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
        userRole: profile.user_role,
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
        trialTokenLimit: profile.trial_token_limit,
        trialStartedAt: profile.trial_started_at,
        trialExpiresAt: profile.trial_expires_at,
        // Conversation history for welcome message logic
        hasConversationHistory: hasConversationHistory
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

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()

    // Check if this is an admin email
    const isAdmin = profileData.email === 'admin@ai-sidekick.io'
    
    // Create a new user profile (OAuth users)
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: profileData.id,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        business_name: profileData.business_name,
        location: `${profileData.city}, ${profileData.state}`,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zip_code,
        trade: profileData.trade,
        selected_plan: isAdmin ? 'Admin' : 'Free Trial',
        user_role: isAdmin ? 'admin' : 'user',
        services: profileData.services,
        team_size: profileData.team_size,
        target_customers: profileData.target_customers,
        years_in_business: profileData.years_in_business,
        business_priorities: profileData.business_priorities,
        trial_started_at: new Date().toISOString(),
        trial_expires_at: isAdmin ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        trial_token_limit: isAdmin ? null : 250000,
        tokens_used_trial: 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create profile' },
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
      message: 'Profile created successfully'
    })

  } catch (error) {
    console.error('Profile creation error:', error)
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