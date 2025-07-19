import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Admin API key verification
function verifyAdminAccess(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  const expectedKey = process.env.ADMIN_API_KEY
  
  // In development, allow access without key for testing
  if (process.env.NODE_ENV === 'development' && !expectedKey) {
    return true
  }
  
  return adminKey === expectedKey
}

// Calculate date ranges
function getDateRanges() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  return {
    today: today.toISOString(),
    yesterday: yesterday.toISOString(),
    weekAgo: weekAgo.toISOString(),
    monthAgo: monthAgo.toISOString()
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    if (!verifyAdminAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'overview'
    const dates = getDateRanges()

    const { supabase } = createClient(request)

    switch (view) {
      case 'costs':
        return await getCostAnalytics(supabase, dates)
      case 'users':
        return await getUserAnalytics(supabase, dates)
      case 'recommendations':
        return await getRecommendations(supabase, dates)
      default:
        return await getOverviewAnalytics(supabase, dates)
    }

  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Analytics unavailable' },
      { status: 500 }
    )
  }
}

async function getCostAnalytics(supabase: any, dates: any) {
  try {
    // Get cost breakdown by time period - gracefully handle errors
    const { data: todayCosts } = await supabase
      .from('user_conversations')
      .select('cost_breakdown, model_used, created_at, tokens_used')
      .gte('created_at', dates.today) || []

    const { data: weekCosts } = await supabase
      .from('user_conversations')
      .select('cost_breakdown, model_used, created_at, tokens_used')
      .gte('created_at', dates.weekAgo) || []

    const { data: monthCosts } = await supabase
      .from('user_conversations')
      .select('cost_breakdown, model_used, created_at, tokens_used')
      .gte('created_at', dates.monthAgo) || []

    // Get user cost ranking - gracefully handle errors
    const { data: userCosts } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, business_name, total_cost_trial, tokens_used_trial, created_at')
      .order('tokens_used_trial', { ascending: false })
      .limit(50) || []

  // Calculate aggregated costs - with fallback for missing cost_breakdown
  const calculatePeriodCosts = (costs: any[]) => {
    return costs?.reduce((acc, conv) => {
      const breakdown = conv.cost_breakdown
      
      // If we have cost breakdown, use it
      if (breakdown && breakdown.totalCostUsd) {
        return {
          total_cost_usd: acc.total_cost_usd + (breakdown.totalCostUsd || 0),
          gpt4o_cost: acc.gpt4o_cost + (breakdown.model === 'gpt-4o' ? breakdown.gptCostUsd : 0),
          gpt4o_mini_cost: acc.gpt4o_mini_cost + (breakdown.model === 'gpt-4o-mini' ? breakdown.gptCostUsd : 0),
          google_places_cost: acc.google_places_cost + (breakdown.placesCostUsd || 0),
          files_cost: acc.files_cost + (breakdown.filesCostUsd || 0),
          conversation_count: acc.conversation_count + 1
        }
      }
      
      // Fallback: estimate cost from tokens (if no cost breakdown yet)
      const tokens = conv.tokens_used || 0
      const estimatedCost = tokens * 0.0001 // Rough estimate $0.0001 per token
      
      return {
        total_cost_usd: acc.total_cost_usd + estimatedCost,
        gpt4o_cost: acc.gpt4o_cost + (conv.model_used === 'gpt-4o' ? estimatedCost : 0),
        gpt4o_mini_cost: acc.gpt4o_mini_cost + (conv.model_used === 'gpt-4o-mini' ? estimatedCost : 0),
        google_places_cost: acc.google_places_cost,
        files_cost: acc.files_cost,
        conversation_count: acc.conversation_count + 1
      }
    }, {
      total_cost_usd: 0,
      gpt4o_cost: 0,
      gpt4o_mini_cost: 0,
      google_places_cost: 0,
      files_cost: 0,
      conversation_count: 0
    }) || {
      total_cost_usd: 0,
      gpt4o_cost: 0,
      gpt4o_mini_cost: 0,
      google_places_cost: 0,
      files_cost: 0,
      conversation_count: 0
    }
  }

  const todayStats = calculatePeriodCosts(todayCosts)
  const weekStats = calculatePeriodCosts(weekCosts)
  const monthStats = calculatePeriodCosts(monthCosts)

  // Calculate cost per user averages
  todayStats.cost_per_conversation = todayStats.conversation_count > 0 
    ? todayStats.total_cost_usd / todayStats.conversation_count : 0
  weekStats.cost_per_conversation = weekStats.conversation_count > 0 
    ? weekStats.total_cost_usd / weekStats.conversation_count : 0
  monthStats.cost_per_conversation = monthStats.conversation_count > 0 
    ? monthStats.total_cost_usd / monthStats.conversation_count : 0

    return NextResponse.json({
      view: 'costs',
      today: todayStats,
      week: weekStats,
      month: monthStats,
      top_users_by_cost: userCosts?.map(user => ({
        user_id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Anonymous',
        business: user.business_name,
        total_cost: user.total_cost_trial || 0,
        total_tokens: user.tokens_used_trial || 0,
        cost_per_token: (user.tokens_used_trial > 0 && user.total_cost_trial > 0) ? user.total_cost_trial / user.tokens_used_trial : 0,
        account_age_days: Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        tier_recommended: (user.total_cost_trial || 0) > 2.0 ? 'Business' : (user.total_cost_trial || 0) > 0.5 ? 'Pro' : 'Starter'
      })) || [],
      alerts: {
        high_cost_users: userCosts?.filter(u => (u.total_cost_trial || 0) > 2.0).length || 0,
        daily_cost_high: todayStats.total_cost_usd > 50,
        unusual_usage: false
      }
    })
  } catch (error) {
    console.error('Cost analytics error:', error)
    // Return empty data structure instead of error
    return NextResponse.json({
      view: 'costs',
      today: { total_cost_usd: 0, conversation_count: 0, cost_per_conversation: 0, gpt4o_cost: 0, gpt4o_mini_cost: 0, google_places_cost: 0, files_cost: 0 },
      week: { total_cost_usd: 0, conversation_count: 0, cost_per_conversation: 0, gpt4o_cost: 0, gpt4o_mini_cost: 0, google_places_cost: 0, files_cost: 0 },
      month: { total_cost_usd: 0, conversation_count: 0, cost_per_conversation: 0, gpt4o_cost: 0, gpt4o_mini_cost: 0, google_places_cost: 0, files_cost: 0 },
      top_users_by_cost: [],
      alerts: { high_cost_users: 0, daily_cost_high: false, unusual_usage: false }
    })
  }
}

async function getUserAnalytics(supabase: any, dates: any) {
  try {
    // Get user engagement metrics - with fallback for missing columns
    const { data: users } = await supabase
      .from('user_profiles')
      .select(`
        id, first_name, last_name, business_name, created_at, 
        tokens_used_trial, total_cost_trial, last_activity_at,
        trade, team_size, target_customers
      `)
      .order('created_at', { ascending: false }) || []

    // Get conversation counts per user
    const { data: conversationCounts } = await supabase
      .from('user_conversations')
      .select('user_id')
      .gte('created_at', dates.monthAgo) || []

  const userConversationMap = conversationCounts?.reduce((acc: any, conv: any) => {
    acc[conv.user_id] = (acc[conv.user_id] || 0) + 1
    return acc
  }, {}) || {}

  // Calculate user value metrics
  const userAnalytics = users?.map((user: any) => {
    const conversationCount = userConversationMap[user.id] || 0
    const accountAgeDays = Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    const lastActivityDays = user.last_activity_at 
      ? Math.floor((new Date().getTime() - new Date(user.last_activity_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, 
      (conversationCount * 10) + 
      (accountAgeDays > 0 ? Math.min(30, (conversationCount / accountAgeDays) * 100) : 0) +
      (lastActivityDays < 7 ? 20 : 0) +
      (user.total_cost_trial > 0.5 ? 20 : 0)
    )

    // Calculate upgrade likelihood (0-100)
    const upgradeLikelihood = Math.min(100,
      (user.total_cost_trial > 1.0 ? 40 : 0) +
      (conversationCount > 10 ? 30 : 0) +
      (engagementScore > 50 ? 20 : 0) +
      (lastActivityDays < 3 ? 10 : 0)
    )

    return {
      user_id: user.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Anonymous',
      business: user.business_name,
      trade: user.trade,
      team_size: user.team_size,
      target_customers: user.target_customers,
      account_age_days: accountAgeDays,
      conversation_count: conversationCount,
      total_cost: user.total_cost_trial || 0,
      total_tokens: user.tokens_used_trial || 0,
      last_activity_days: lastActivityDays,
      engagement_score: Math.round(engagementScore),
      upgrade_likelihood: Math.round(upgradeLikelihood),
      value_segment: getValueSegment(engagementScore, user.total_cost_trial || 0)
    }
  }) || []

    return NextResponse.json({
      view: 'users',
      total_users: users?.length || 0,
      active_users_week: userAnalytics.filter(u => u.last_activity_days < 7).length,
      high_engagement: userAnalytics.filter(u => u.engagement_score > 70).length,
      upgrade_candidates: userAnalytics.filter(u => u.upgrade_likelihood > 60).length,
      users: userAnalytics.sort((a, b) => b.upgrade_likelihood - a.upgrade_likelihood)
    })
  } catch (error) {
    console.error('User analytics error:', error)
    return NextResponse.json({
      view: 'users',
      total_users: 0,
      active_users_week: 0,
      high_engagement: 0,
      upgrade_candidates: 0,
      users: []
    })
  }
}

async function getRecommendations(supabase: any, dates: any) {
  try {
    // Get cost and user data for recommendations
    const [costData, userData] = await Promise.all([
      getCostAnalytics(supabase, dates),
      getUserAnalytics(supabase, dates)
    ])

    const costJson = await costData.json()
    const userJson = await userData.json()

    const recommendations = []

    // Cost optimization recommendations
    if (costJson.today.total_cost_usd > 50) {
      recommendations.push({
        type: 'cost_alert',
        priority: 'high',
        title: 'Daily Cost Threshold Exceeded',
        description: `Today's costs ($${costJson.today.total_cost_usd.toFixed(2)}) exceed $50 threshold`,
        action: 'Consider implementing usage limits or upgrading pricing tiers'
      })
    }

    // Upgrade opportunity recommendations
    const highValueUsers = userJson.users.filter((u: any) => u.upgrade_likelihood > 70)
    if (highValueUsers.length > 0) {
      recommendations.push({
        type: 'upgrade_opportunity',
        priority: 'medium',
        title: `${highValueUsers.length} High-Value Upgrade Candidates`,
        description: 'Users showing strong engagement and usage patterns',
        action: 'Send targeted upgrade campaigns to these users'
      })
    }

    // Pricing optimization
    const avgCostPerUser = costJson.month.total_cost_usd / (userJson.total_users || 1)
    if (avgCostPerUser > 1.0) {
      recommendations.push({
        type: 'pricing_optimization',
        priority: 'high',
        title: 'High Cost Per User Detected',
        description: `Average monthly cost per user: $${avgCostPerUser.toFixed(2)}`,
        action: 'Consider raising trial limits or adjusting pricing tiers'
      })
    }

    return NextResponse.json({
      view: 'recommendations',
      recommendations,
      summary: {
        total_recommendations: recommendations.length,
        high_priority: recommendations.filter(r => r.priority === 'high').length,
        medium_priority: recommendations.filter(r => r.priority === 'medium').length
      }
    })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json({
      view: 'recommendations',
      recommendations: [],
      summary: {
        total_recommendations: 0,
        high_priority: 0,
        medium_priority: 0
      }
    })
  }
}

async function getOverviewAnalytics(supabase: any, dates: any) {
  try {
    // Combine key metrics from all views
    const [costData, userData, recData] = await Promise.all([
      getCostAnalytics(supabase, dates),
      getUserAnalytics(supabase, dates),
      getRecommendations(supabase, dates)
    ])

    const costJson = await costData.json()
    const userJson = await userData.json()
    const recJson = await recData.json()

    return NextResponse.json({
      view: 'overview',
      summary: {
        total_users: userJson.total_users || 0,
        active_users_week: userJson.active_users_week || 0,
        total_cost_today: costJson.today?.total_cost_usd || 0,
        total_cost_month: costJson.month?.total_cost_usd || 0,
        upgrade_candidates: userJson.upgrade_candidates || 0,
        high_priority_alerts: recJson.summary?.high_priority || 0
      },
      quick_metrics: {
        cost_per_user_today: userJson.total_users > 0 ? (costJson.today?.total_cost_usd || 0) / userJson.total_users : 0,
        avg_engagement_score: userJson.users?.length > 0 ? userJson.users.reduce((acc: number, u: any) => acc + u.engagement_score, 0) / userJson.users.length : 0,
        model_usage: {
          gpt4o_percentage: (costJson.today?.total_cost_usd || 0) > 0 ? ((costJson.today?.gpt4o_cost || 0) / costJson.today.total_cost_usd) * 100 : 0,
          gpt4o_mini_percentage: (costJson.today?.total_cost_usd || 0) > 0 ? ((costJson.today?.gpt4o_mini_cost || 0) / costJson.today.total_cost_usd) * 100 : 0
        }
      },
      top_insights: recJson.recommendations?.slice(0, 3) || []
    })
  } catch (error) {
    console.error('Overview analytics error:', error)
    return NextResponse.json({
      view: 'overview',
      summary: {
        total_users: 0,
        active_users_week: 0,
        total_cost_today: 0,
        total_cost_month: 0,
        upgrade_candidates: 0,
        high_priority_alerts: 0
      },
      quick_metrics: {
        cost_per_user_today: 0,
        avg_engagement_score: 0,
        model_usage: {
          gpt4o_percentage: 0,
          gpt4o_mini_percentage: 0
        }
      },
      top_insights: []
    })
  }
}

function getValueSegment(engagementScore: number, totalCost: number) {
  if (engagementScore > 70 && totalCost > 1.0) return 'High Value / High Cost'
  if (engagementScore > 70 && totalCost <= 1.0) return 'High Value / Low Cost'
  if (engagementScore <= 70 && totalCost > 1.0) return 'Low Value / High Cost'
  return 'Low Value / Low Cost'
}