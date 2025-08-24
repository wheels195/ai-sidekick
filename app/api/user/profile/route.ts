import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'
import { scheduleTrialEmailSequence } from '@/lib/email-scheduler'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Use Supabase auth instead of JWT
    const { supabase } = createServerClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user profile from database using service role for full access
    const { data: profile, error } = await serviceSupabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, business_name, trade, selected_plan, user_role, created_at, location, zip_code, services, team_size, target_customers, years_in_business, business_priorities, tokens_used_trial, trial_token_limit, trial_started_at, trial_expires_at')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Check if user has any previous conversations to determine if they're a returning user
    const { data: conversations, error: convError } = await serviceSupabase
      .from('user_conversations')
      .select('id')
      .eq('user_id', user.id)
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
    console.log('Profile creation request:', { 
      email: profileData.email, 
      id: profileData.id,
      hasId: !!profileData.id,
      fields: Object.keys(profileData)
    })

    // Check if this is an admin email
    const isAdmin = profileData.email === 'admin@ai-sidekick.io'
    
    // Create or update user profile (OAuth users)
    const { data, error } = await serviceSupabase
      .from('user_profiles')
      .upsert({
        id: profileData.id,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        business_name: profileData.business_name,
        location: `${profileData.city}, ${profileData.state}`,
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
      console.error('Profile creation error:', { 
        error, 
        code: error.code, 
        message: error.message, 
        details: error.details,
        hint: error.hint 
      })
      return NextResponse.json(
        { error: 'Failed to create profile', details: error.message },
        { status: 500 }
      )
    }

    // Send welcome email after successful profile creation (OAuth flow)
    if (!isAdmin) { // Don't send welcome email to admin accounts
      const welcomeEmailResult = await sendWelcomeEmail(
        data.email,
        data.first_name,
        data.business_name || 'Your Business',
        data.trade || 'landscaping'
      )
      
      if (!welcomeEmailResult.success) {
        console.error('Failed to send welcome email to OAuth user:', welcomeEmailResult.error)
        // Don't fail profile creation if welcome email fails
      } else {
        console.log('Welcome email sent successfully to OAuth user:', data.email)
      }
    }

    // Schedule 7-day trial email sequence for ALL users (OAuth + email/password)
    if (!isAdmin) { // Don't schedule trial emails for admin accounts
      const scheduleResult = await scheduleTrialEmailSequence({
        email: data.email,
        firstName: data.first_name,
        signupDate: new Date().toISOString()
      })
      
      if (scheduleResult.success) {
        console.log(`Trial email sequence scheduled for ${data.first_name} (${data.email})`)
      } else {
        console.error('Failed to schedule trial emails:', scheduleResult.error)
      }
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
    // Use Supabase auth instead of JWT
    const { supabase } = createServerClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const profileData = await request.json()

    if (!user || authError) {
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

    const { data, error } = await serviceSupabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
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