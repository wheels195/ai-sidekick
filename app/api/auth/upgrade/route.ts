import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/lib/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, selectedPlan, businessProfile } = await request.json()

    // Get authenticated user
    const user = await getUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required for upgrade' },
        { status: 401 }
      )
    }

    // Verify user exists and get current profile
    const { data: currentProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.userId)
      .single()

    if (profileError || !currentProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Update user profile to paid plan with unlimited tokens
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        selected_plan: selectedPlan,
        // Update personal info if provided
        first_name: firstName || currentProfile.first_name,
        last_name: lastName || currentProfile.last_name,
        // Update business profile if provided (user may have refined their info)
        business_name: businessProfile?.business_name || currentProfile.business_name,
        location: businessProfile?.location || currentProfile.location,
        zip_code: businessProfile?.zip_code || currentProfile.zip_code,
        trade: businessProfile?.trade || currentProfile.trade,
        services: businessProfile?.services || currentProfile.services,
        team_size: businessProfile?.team_size || currentProfile.team_size,
        target_customers: businessProfile?.target_customers || currentProfile.target_customers,
        years_in_business: businessProfile?.years_in_business || currentProfile.years_in_business,
        business_priorities: businessProfile?.business_priorities || currentProfile.business_priorities,
        // Grant unlimited access until payment system is implemented
        tokens_used_trial: currentProfile.tokens_used_trial, // Preserve trial usage history
        trial_token_limit: 999999999, // Essentially unlimited for market testing
        upgraded_at: new Date().toISOString(),
        upgrade_plan: selectedPlan,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.userId)

    if (updateError) {
      console.error('Profile upgrade error:', updateError)
      return NextResponse.json(
        { error: 'Failed to upgrade account' },
        { status: 500 }
      )
    }

    // Track upgrade conversion for market testing
    try {
      await supabase
        .from('upgrade_conversions')
        .insert({
          user_id: user.userId,
          from_plan: currentProfile.selected_plan,
          to_plan: selectedPlan,
          trial_tokens_used: currentProfile.tokens_used_trial,
          trial_duration_days: Math.ceil((new Date().getTime() - new Date(currentProfile.trial_started_at).getTime()) / (1000 * 60 * 60 * 24)),
          converted_at: new Date().toISOString()
        })
    } catch (conversionError) {
      console.log('Conversion tracking failed (table may not exist):', conversionError)
      // Don't fail the upgrade if tracking fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${selectedPlan}! You now have unlimited access while we set up payment processing.`,
      plan: selectedPlan,
      unlimitedAccess: true,
      preservedData: {
        conversationHistory: true,
        businessProfile: true,
        trialUsageStats: true
      }
    })

  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.json(
      { error: 'Internal server error during upgrade' },
      { status: 500 }
    )
  }
}