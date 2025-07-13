import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('ADMIN_API_KEY exists:', !!process.env.ADMIN_API_KEY)
    
    // TODO: Re-enable auth after testing
    // if (process.env.NODE_ENV === 'production') {
    //   const apiKey = request.headers.get('x-admin-key')
    //   if (apiKey !== process.env.ADMIN_API_KEY) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    //   }
    // }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000))
    const monthAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000))

    // Check if upgrade_conversions table exists, create if needed
    try {
      await supabase.from('upgrade_conversions').select('id').limit(1)
    } catch (tableError) {
      // Table might not exist, try to create it
      console.log('Creating upgrade_conversions table...')
      const { error: createError } = await supabase.rpc('create_upgrade_conversions_table')
      if (createError) {
        console.log('Table creation failed, it may already exist:', createError)
      }
    }

    // Get conversion data
    const { data: conversions, error: conversionError } = await supabase
      .from('upgrade_conversions')
      .select('*')
      .order('converted_at', { ascending: false })

    if (conversionError) {
      console.error('Conversion query error:', conversionError)
      // Continue with empty array if table doesn't exist yet
    }

    // Get trial signup data for conversion rate calculation
    const { data: trialSignups, error: signupError } = await supabase
      .from('user_profiles')
      .select('id, created_at, selected_plan, trial_started_at')
      .eq('selected_plan', 'Free Trial')

    if (signupError) {
      console.error('Trial signup query error:', signupError)
    }

    // Calculate metrics
    const totalConversions = conversions?.length || 0
    const totalTrialSignups = trialSignups?.length || 0
    const conversionRate = totalTrialSignups > 0 ? (totalConversions / totalTrialSignups * 100) : 0

    // Conversions by time period
    const todayConversions = conversions?.filter(c =>
      new Date(c.converted_at) >= today
    ).length || 0

    const weekConversions = conversions?.filter(c =>
      new Date(c.converted_at) >= weekAgo
    ).length || 0

    const monthConversions = conversions?.filter(c =>
      new Date(c.converted_at) >= monthAgo
    ).length || 0

    // Average metrics
    const avgTokensUsed = conversions?.length > 0
      ? Math.round(conversions.reduce((sum, c) => sum + (c.trial_tokens_used || 0), 0) / conversions.length)
      : 0

    const avgDaysToConvert = conversions?.length > 0
      ? Math.round(conversions.reduce((sum, c) => sum + (c.trial_duration_days || 0), 0) / conversions.length * 10) / 10
      : 0

    // Plan distribution
    const planBreakdown = conversions?.reduce((acc, c) => {
      acc[c.to_plan] = (acc[c.to_plan] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Revenue projections (assuming plans)
    const starterRevenue = (planBreakdown['Starter Plan'] || 0) * 29
    const advancedRevenue = (planBreakdown['Advanced Plan'] || 0) * 59
    const projectedMRR = starterRevenue + advancedRevenue

    // Recent conversions for debugging
    const recentConversions = conversions?.slice(0, 10).map(c => ({
      date: c.converted_at,
      plan: c.to_plan,
      tokensUsed: c.trial_tokens_used,
      daysInTrial: c.trial_duration_days
    })) || []

    return NextResponse.json({
      success: true,
      generatedAt: now.toISOString(),

      // Key metrics for market testing
      overview: {
        totalConversions,
        totalTrialSignups,
        conversionRate: Math.round(conversionRate * 100) / 100,
        projectedMRR
      },

      // Time-based breakdowns
      conversions: {
        today: todayConversions,
        thisWeek: weekConversions,
        thisMonth: monthConversions,
        total: totalConversions
      },

      // User behavior insights
      userBehavior: {
        avgTokensUsedBeforeUpgrade: avgTokensUsed,
        avgDaysToConvert,
        tokenUtilization: avgTokensUsed > 0 ? Math.round((avgTokensUsed / 250000) * 100) : 0
      },

      // Business metrics
      revenue: {
        starterPlanConversions: planBreakdown['Starter Plan'] || 0,
        advancedPlanConversions: planBreakdown['Advanced Plan'] || 0,
        projectedMRR,
        averageRevenuePerUser: totalConversions > 0 ? Math.round(projectedMRR / totalConversions) : 0
      },

      // Recent activity for debugging
      recentConversions,

      // Market testing insights
      insights: {
        conversionGoal: 100,
        progressToGoal: Math.min(100, Math.round((totalConversions / 100) * 100)),
        estimatedTimeToGoal: totalConversions > 0 ? Math.ceil((100 - totalConversions) / (weekConversions / 7)) + ' days' : 'Unknown'
      }
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}