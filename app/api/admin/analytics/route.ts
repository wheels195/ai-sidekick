import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Admin API key verification
function verifyAdminAccess(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  const expectedKey = process.env.ADMIN_API_KEY
  
  // SECURITY: Always require admin key, even in development
  if (!expectedKey) {
    console.error('ADMIN_API_KEY environment variable is not set')
    return false
  }
  
  if (!adminKey) {
    console.warn('Admin access attempted without API key')
    return false
  }
  
  return adminKey === expectedKey
}

// Define admin user emails to exclude from regular analytics
const ADMIN_EMAILS = [
  'admin@ai-sidekick.io', // Your email
  // Add other admin emails here if needed
]

// Helper function to check if user is admin
function isAdminUser(email: string) {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// Get API usage tracking data for complete analytics
async function getApiUsageData(supabase: any, dates: any, excludeAdminUsers: boolean = true) {
  try {
    let query = supabase
      .from('api_usage_tracking')
      .select('*')
      .gte('created_at', dates.monthAgo)
    
    if (excludeAdminUsers) {
      // Get admin user IDs to exclude
      const { data: adminUsers } = await supabase
        .from('user_profiles')
        .select('id')
        .in('email', ADMIN_EMAILS) || []
      
      const adminUserIds = adminUsers?.map(u => u.id) || []
      if (adminUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${adminUserIds.join(',')})`)
      }
    }
    
    const { data: apiUsageData } = await query || []
    return apiUsageData || []
  } catch (error) {
    console.error('Error fetching API usage data:', error)
    return []
  }
}

// Get detailed admin usage statistics
async function getAdminUsageAnalytics(supabase: any, dates: any) {
  try {
    // Get admin user IDs
    const { data: adminUsers } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, tokens_used_trial, total_cost_trial')
      .in('email', ADMIN_EMAILS) || []
    
    if (!adminUsers || adminUsers.length === 0) {
      return {
        total_cost_today: 0,
        total_cost_week: 0,
        total_cost_month: 0,
        model_breakdown: [],
        api_breakdown: [],
        conversation_count: 0,
        token_usage: 0
      }
    }
    
    const adminUserIds = adminUsers.map(u => u.id)
    
    // Get admin conversations with full data
    const { data: adminConversations } = await supabase
      .from('user_conversations')
      .select('*')
      .in('user_id', adminUserIds)
      .gte('created_at', dates.monthAgo) || []
    
    // Filter by time periods
    const todayConversations = adminConversations.filter(c => new Date(c.created_at) >= new Date(dates.today))
    const weekConversations = adminConversations.filter(c => new Date(c.created_at) >= new Date(dates.weekAgo))
    const monthConversations = adminConversations
    
    // Calculate costs and breakdowns
    const calculateDetailedBreakdown = (conversations: any[]) => {
      const modelBreakdown: any = {}
      const apiBreakdown = {
        gpt_tokens: 0,
        gpt_cost: 0,
        google_places_calls: 0,
        google_places_cost: 0,
        google_search_calls: 0,
        google_search_cost: 0,
        dalle_images: 0,
        dalle_cost: 0,
        whisper_minutes: 0,
        whisper_cost: 0,
        file_processing_cost: 0,
        total_cost: 0
      }
      
      conversations.forEach(conv => {
        const model = conv.model_used || 'unknown'
        const tokens = conv.tokens_used || 0
        const cost = conv.cost_breakdown?.totalCostUsd || 0
        
        // Model breakdown
        if (!modelBreakdown[model]) {
          modelBreakdown[model] = {
            model: model,
            conversations: 0,
            tokens: 0,
            cost: 0
          }
        }
        modelBreakdown[model].conversations += 1
        modelBreakdown[model].tokens += tokens
        modelBreakdown[model].cost += conv.cost_breakdown?.gptCostUsd || 0
        
        // API breakdown
        apiBreakdown.gpt_tokens += tokens
        apiBreakdown.gpt_cost += conv.cost_breakdown?.gptCostUsd || 0
        apiBreakdown.google_places_calls += conv.cost_breakdown?.googlePlacesCalls || 0
        apiBreakdown.google_places_cost += conv.cost_breakdown?.placesCostUsd || 0
        apiBreakdown.google_search_calls += conv.cost_breakdown?.googleSearchCalls || 0
        apiBreakdown.google_search_cost += conv.cost_breakdown?.googleSearchCostUsd || 0
        apiBreakdown.dalle_images += conv.cost_breakdown?.dalleImages || 0
        apiBreakdown.dalle_cost += conv.cost_breakdown?.dalleCostUsd || 0
        apiBreakdown.whisper_minutes += conv.cost_breakdown?.whisperMinutes || 0
        apiBreakdown.whisper_cost += conv.cost_breakdown?.whisperCostUsd || 0
        apiBreakdown.file_processing_cost += conv.cost_breakdown?.filesCostUsd || 0
        apiBreakdown.total_cost += cost
      })
      
      return {
        modelBreakdown: Object.values(modelBreakdown),
        apiBreakdown
      }
    }
    
    const todayBreakdown = calculateDetailedBreakdown(todayConversations)
    const weekBreakdown = calculateDetailedBreakdown(weekConversations)
    const monthBreakdown = calculateDetailedBreakdown(monthConversations)
    
    return {
      admin_users: adminUsers.map(u => ({
        email: u.email,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
        total_tokens: u.tokens_used_trial || 0,
        total_cost: u.total_cost_trial || 0
      })),
      today: {
        total_cost: todayBreakdown.apiBreakdown.total_cost,
        conversation_count: todayConversations.length,
        model_breakdown: todayBreakdown.modelBreakdown,
        api_breakdown: todayBreakdown.apiBreakdown
      },
      week: {
        total_cost: weekBreakdown.apiBreakdown.total_cost,
        conversation_count: weekConversations.length,
        model_breakdown: weekBreakdown.modelBreakdown,
        api_breakdown: weekBreakdown.apiBreakdown
      },
      month: {
        total_cost: monthBreakdown.apiBreakdown.total_cost,
        conversation_count: monthConversations.length,
        model_breakdown: monthBreakdown.modelBreakdown,
        api_breakdown: monthBreakdown.apiBreakdown
      }
    }
  } catch (error) {
    console.error('Admin usage analytics error:', error)
    return {
      admin_users: [],
      today: { total_cost: 0, conversation_count: 0, model_breakdown: [], api_breakdown: {} },
      week: { total_cost: 0, conversation_count: 0, model_breakdown: [], api_breakdown: {} },
      month: { total_cost: 0, conversation_count: 0, model_breakdown: [], api_breakdown: {} }
    }
  }
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

    // Use service client for admin analytics to bypass RLS
    const supabase = createServiceClient()

    switch (view) {
      case 'costs':
        return await getCostAnalytics(supabase, dates)
      case 'users':
        return await getUserAnalytics(supabase, dates)
      case 'recommendations':
        return await getRecommendations(supabase, dates)
      case 'admin':
        return await getAdminAnalytics(supabase, dates)
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
    // Get admin user IDs to exclude
    const { data: adminUsers } = await supabase
      .from('user_profiles')
      .select('id')
      .in('email', ADMIN_EMAILS) || []
    
    const adminUserIds = adminUsers?.map(u => u.id) || []

    // Get cost breakdown by time period - excluding admin users
    const { data: todayCosts } = await supabase
      .from('user_conversations')
      .select('cost_breakdown, model_used, created_at, tokens_used, user_id')
      .gte('created_at', dates.today)
      .not('user_id', 'in', `(${adminUserIds.join(',')})`) || []

    const { data: weekCosts } = await supabase
      .from('user_conversations')
      .select('cost_breakdown, model_used, created_at, tokens_used, user_id')
      .gte('created_at', dates.weekAgo)
      .not('user_id', 'in', `(${adminUserIds.join(',')})`) || []

    const { data: monthCosts } = await supabase
      .from('user_conversations')
      .select('cost_breakdown, model_used, created_at, tokens_used, user_id')
      .gte('created_at', dates.monthAgo)
      .not('user_id', 'in', `(${adminUserIds.join(',')})`) || []

    // Get API usage data for DALL-E and Whisper - excluding admin users
    const apiUsageData = await getApiUsageData(supabase, dates, true)
    
    // Filter API usage by time periods
    const todayApiUsage = apiUsageData.filter(a => new Date(a.created_at) >= new Date(dates.today))
    const weekApiUsage = apiUsageData.filter(a => new Date(a.created_at) >= new Date(dates.weekAgo))
    const monthApiUsage = apiUsageData

    // Get user cost ranking - excluding admin users
    const { data: userCosts } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, business_name, total_cost_trial, tokens_used_trial, created_at, email')
      .not('email', 'in', `(${ADMIN_EMAILS.map(e => `"${e}"`).join(',')})`)
      .order('tokens_used_trial', { ascending: false })
      .limit(50) || []

  // Calculate aggregated costs - with fallback for missing cost_breakdown
  const calculatePeriodCosts = (costs: any[], apiUsage: any[] = []) => {
    return costs?.reduce((acc, conv) => {
      const breakdown = conv.cost_breakdown
      
      // If we have cost breakdown, use it
      if (breakdown && breakdown.totalCostUsd) {
        return {
          total_cost_usd: acc.total_cost_usd + (breakdown.totalCostUsd || 0),
          gpt4o_cost: acc.gpt4o_cost + (breakdown.model === 'gpt-4o' ? breakdown.gptCostUsd : 0),
          gpt4o_mini_cost: acc.gpt4o_mini_cost + (breakdown.model === 'gpt-4o-mini' ? breakdown.gptCostUsd : 0),
          google_places_cost: acc.google_places_cost + (breakdown.placesCostUsd || 0),
          google_search_cost: acc.google_search_cost + (breakdown.googleSearchCostUsd || 0),
          dalle_cost: acc.dalle_cost + (breakdown.dalleCostUsd || 0),
          whisper_cost: acc.whisper_cost + (breakdown.whisperCostUsd || 0),
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
        google_search_cost: acc.google_search_cost,
        dalle_cost: acc.dalle_cost,
        whisper_cost: acc.whisper_cost,
        files_cost: acc.files_cost,
        conversation_count: acc.conversation_count + 1
      }
    }, {
      total_cost_usd: 0,
      gpt4o_cost: 0,
      gpt4o_mini_cost: 0,
      google_places_cost: 0,
      google_search_cost: 0,
      dalle_cost: 0,
      whisper_cost: 0,
      files_cost: 0,
      conversation_count: 0
    }) || {
      total_cost_usd: 0,
      gpt4o_cost: 0,
      gpt4o_mini_cost: 0,
      google_places_cost: 0,
      google_search_cost: 0,
      dalle_cost: 0,
      whisper_cost: 0,
      files_cost: 0,
      conversation_count: 0
    }
    
    // Add API usage costs from separate tracking table
    const convResult = costs?.reduce((acc, conv) => {
      const breakdown = conv.cost_breakdown
      
      // If we have cost breakdown, use it
      if (breakdown && breakdown.totalCostUsd) {
        return {
          total_cost_usd: acc.total_cost_usd + (breakdown.totalCostUsd || 0),
          gpt4o_cost: acc.gpt4o_cost + (breakdown.model === 'gpt-4o' ? breakdown.gptCostUsd : 0),
          gpt4o_mini_cost: acc.gpt4o_mini_cost + (breakdown.model === 'gpt-4o-mini' ? breakdown.gptCostUsd : 0),
          google_places_cost: acc.google_places_cost + (breakdown.placesCostUsd || 0),
          google_search_cost: acc.google_search_cost + (breakdown.googleSearchCostUsd || 0),
          dalle_cost: acc.dalle_cost + (breakdown.dalleCostUsd || 0),
          whisper_cost: acc.whisper_cost + (breakdown.whisperCostUsd || 0),
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
        google_search_cost: acc.google_search_cost,
        dalle_cost: acc.dalle_cost,
        whisper_cost: acc.whisper_cost,
        files_cost: acc.files_cost,
        conversation_count: acc.conversation_count + 1
      }
    }, {
      total_cost_usd: 0,
      gpt4o_cost: 0,
      gpt4o_mini_cost: 0,
      google_places_cost: 0,
      google_search_cost: 0,
      dalle_cost: 0,
      whisper_cost: 0,
      files_cost: 0,
      conversation_count: 0
    }) || {
      total_cost_usd: 0,
      gpt4o_cost: 0,
      gpt4o_mini_cost: 0,
      google_places_cost: 0,
      google_search_cost: 0,
      dalle_cost: 0,
      whisper_cost: 0,
      files_cost: 0,
      conversation_count: 0
    }
    
    // Add API usage costs from separate tracking table  
    return apiUsage?.reduce((acc, usage) => {
      const cost = usage.cost_usd || 0
      
      // Add to total cost
      acc.total_cost_usd += cost
      
      // Categorize by API type
      if (usage.api_type === 'dall-e') {
        acc.dalle_cost += cost
      } else if (usage.api_type === 'whisper') {
        acc.whisper_cost += cost
      }
      
      return acc
    }, convResult) || convResult
  }

  const todayStats = calculatePeriodCosts(todayCosts, todayApiUsage)
  const weekStats = calculatePeriodCosts(weekCosts, weekApiUsage)
  const monthStats = calculatePeriodCosts(monthCosts, monthApiUsage)

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
      today: { total_cost_usd: 0, conversation_count: 0, cost_per_conversation: 0, gpt4o_cost: 0, gpt4o_mini_cost: 0, google_places_cost: 0, google_search_cost: 0, dalle_cost: 0, whisper_cost: 0, files_cost: 0 },
      week: { total_cost_usd: 0, conversation_count: 0, cost_per_conversation: 0, gpt4o_cost: 0, gpt4o_mini_cost: 0, google_places_cost: 0, google_search_cost: 0, dalle_cost: 0, whisper_cost: 0, files_cost: 0 },
      month: { total_cost_usd: 0, conversation_count: 0, cost_per_conversation: 0, gpt4o_cost: 0, gpt4o_mini_cost: 0, google_places_cost: 0, google_search_cost: 0, dalle_cost: 0, whisper_cost: 0, files_cost: 0 },
      top_users_by_cost: [],
      alerts: { high_cost_users: 0, daily_cost_high: false, unusual_usage: false }
    })
  }
}

async function getUserAnalytics(supabase: any, dates: any) {
  try {
    // Get user engagement metrics - excluding admin users
    const { data: users } = await supabase
      .from('user_profiles')
      .select(`
        id, first_name, last_name, business_name, created_at, 
        tokens_used_trial, total_cost_trial, last_activity_at,
        trade, team_size, target_customers, email
      `)
      .not('email', 'in', `(${ADMIN_EMAILS.map(e => `"${e}"`).join(',')})`)
      .order('created_at', { ascending: false }) || []

    // Get admin user IDs to exclude from conversations
    const { data: adminUsers } = await supabase
      .from('user_profiles')
      .select('id')
      .in('email', ADMIN_EMAILS) || []
    
    const adminUserIds = adminUsers?.map(u => u.id) || []

    // Get conversation counts per user - excluding admin users
    const { data: conversationCounts } = await supabase
      .from('user_conversations')
      .select('user_id')
      .gte('created_at', dates.monthAgo)
      .not('user_id', 'in', `(${adminUserIds.join(',')})`) || []

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
    // Get admin user IDs to exclude
    const { data: adminUsers } = await supabase
      .from('user_profiles')
      .select('id')
      .in('email', ADMIN_EMAILS) || []
    
    const adminUserIds = adminUsers?.map(u => u.id) || []

    // Get comprehensive user data EXCLUDING ADMINS
    const { data: allUsers } = await supabase
      .from('user_profiles')
      .select('*')
      .not('email', 'in', `(${ADMIN_EMAILS.map(e => `"${e}"`).join(',')})`) || []

    const { data: recentUsers } = await supabase
      .from('user_profiles')
      .select('id, last_activity_at')
      .gte('last_activity_at', dates.weekAgo)
      .not('email', 'in', `(${ADMIN_EMAILS.map(e => `"${e}"`).join(',')})`) || []

    // Get all conversations with full data EXCLUDING ADMINS
    let conversationQuery = supabase
      .from('user_conversations')
      .select('*')
    
    if (adminUserIds.length > 0) {
      conversationQuery = conversationQuery.not('user_id', 'in', `(${adminUserIds.join(',')})`)
    }
    
    const { data: allConversations } = await conversationQuery || []

    // Apply same filtering for time-based queries
    const getFilteredConversations = async (startDate: string) => {
      let query = supabase
        .from('user_conversations')
        .select('*')
        .gte('created_at', startDate)
      
      if (adminUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${adminUserIds.join(',')})`)
      }
      
      const { data } = await query || []
      return data || []
    }

    const todayConversations = await getFilteredConversations(dates.today)
    const weekConversations = await getFilteredConversations(dates.weekAgo)
    const monthConversations = await getFilteredConversations(dates.monthAgo)

    // Get API usage data for comprehensive cost tracking
    const apiUsageData = await getApiUsageData(supabase, dates, true)
    
    // Filter API usage by time periods
    const todayApiUsage = apiUsageData.filter(a => new Date(a.created_at) >= new Date(dates.today))
    const weekApiUsage = apiUsageData.filter(a => new Date(a.created_at) >= new Date(dates.weekAgo))
    const monthApiUsage = apiUsageData

    // Enhanced calculations
    const totalUsers = allUsers?.length || 0
    const activeUsersWeek = recentUsers?.length || 0
    const totalConversations = allConversations?.length || 0
    const todayConversationsCount = todayConversations?.length || 0
    const weekConversationsCount = weekConversations?.length || 0
    const monthConversationsCount = monthConversations?.length || 0

    // Enhanced cost calculations with API usage integration
    const calculateDetailedCosts = (conversations: any[], apiUsage: any[] = []) => {
      // First get conversation costs
      const convCosts = conversations?.reduce((sum, conv) => {
        if (conv.cost_breakdown?.totalCostUsd) {
          return sum + conv.cost_breakdown.totalCostUsd
        }
        // Fallback: estimate from tokens
        const tokens = conv.tokens_used || 0
        const model = conv.model_used || 'gpt-4o-mini'
        const rate = model === 'gpt-4o' ? 0.0001 : 0.00001
        return sum + (tokens * rate)
      }, 0) || 0
      
      // Add API usage costs
      const apiCosts = apiUsage?.reduce((sum, usage) => {
        return sum + (usage.cost_usd || 0)
      }, 0) || 0
      
      return convCosts + apiCosts
    }

    const totalCostToday = calculateDetailedCosts(todayConversations, todayApiUsage)
    const totalCostWeek = calculateDetailedCosts(weekConversations, weekApiUsage)
    const totalCostMonth = calculateDetailedCosts(monthConversations, monthApiUsage)

    // Token usage analysis
    const totalTokensUsed = allConversations?.reduce((sum, conv) => sum + (conv.tokens_used || 0), 0) || 0
    const avgTokensPerConversation = totalConversations > 0 ? totalTokensUsed / totalConversations : 0

    // Model usage distribution
    const modelStats = allConversations?.reduce((acc, conv) => {
      const model = conv.model_used || 'unknown'
      acc[model] = (acc[model] || 0) + 1
      return acc
    }, {}) || {}

    const totalModelUsage = Object.values(modelStats).reduce((sum: number, count: number) => sum + count, 0)
    const gpt4oPercentage = totalModelUsage > 0 ? ((modelStats['gpt-4o'] || 0) / totalModelUsage) * 100 : 0
    const gpt4oMiniPercentage = totalModelUsage > 0 ? ((modelStats['gpt-4o-mini'] || 0) / totalModelUsage) * 100 : 0

    // Advanced user analytics with engagement scoring (already filtered for non-admin users)
    const userEngagementScores = allUsers?.map(user => {
      const userConversations = allConversations?.filter(conv => conv.user_id === user.id) || []
      const conversationCount = userConversations.length
      const tokensUsed = user.tokens_used_trial || 0
      const daysSinceSignup = user.created_at ? 
        Math.max(1, Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))) : 1
      const lastActivity = user.last_activity_at ? 
        Math.floor((Date.now() - new Date(user.last_activity_at).getTime()) / (1000 * 60 * 60 * 24)) : 999

      // Enhanced engagement score calculation
      const conversationsPerDay = conversationCount / daysSinceSignup
      const recentActivityScore = Math.max(0, 100 - lastActivity * 5) // Decay over days
      const tokenUsageScore = Math.min(100, (tokensUsed / 250000) * 100) // Max trial tokens
      const frequencyScore = Math.min(100, conversationsPerDay * 50) // Conversations per day bonus
      
      const engagementScore = Math.round(
        (tokenUsageScore * 0.3) + (recentActivityScore * 0.3) + (frequencyScore * 0.4)
      )

      return {
        id: user.id,
        first_name: user.first_name || 'Anonymous',
        last_name: user.last_name || '',
        business_name: user.business_name || 'Unknown Business',
        location: user.location || 'Unknown',
        engagementScore: Math.min(100, engagementScore),
        conversationCount,
        conversationsPerDay,
        daysSinceSignup,
        daysSinceActivity: lastActivity,
        tokensUsed,
        totalCost: userConversations.reduce((sum, conv) => {
          return sum + (conv.cost_breakdown?.totalCostUsd || 0)
        }, 0)
      }
    }) || []

    // Sort by engagement score for top users
    userEngagementScores.sort((a, b) => b.engagementScore - a.engagementScore)

    const avgEngagementScore = userEngagementScores.length > 0 
      ? userEngagementScores.reduce((sum, user) => sum + user.engagementScore, 0) / userEngagementScores.length
      : 0

    // Upgrade candidates: high engagement + high usage
    const upgradeCandidates = userEngagementScores.filter(user => 
      user.engagementScore > 60 || 
      user.tokensUsed > 200000 || 
      user.conversationCount > 10 ||
      user.totalCost > 2.0
    )

    // Feature usage analysis - will be populated with real usage tracking data
    const featureUsage = [
      { 
        feature: 'Chat Assistant', 
        usage_count: totalConversations, 
        unique_users: totalUsers, 
        percentage: totalConversations > 0 ? 100 : 0 
      }
      // Additional features will be tracked with real usage data
    ].filter(f => f.usage_count > 0)

    // Geographic distribution (from user locations)
    const locationStats = userEngagementScores.reduce((acc, user) => {
      const location = user.location || 'Unknown'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const geographicData = Object.entries(locationStats)
      .map(([location, count]) => ({
        location,
        users: count,
        percentage: totalUsers > 0 ? (count / totalUsers) * 100 : 0
      }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 10) // Top 10 locations

    // Enhanced Daily/Weekly/Monthly Analytics with Real Data
    const dailyAnalytics = {
      users_active: activeUsersWeek, // Users active in last 7 days (closest to daily active)
      conversations: todayConversationsCount,
      total_cost: totalCostToday,
      new_signups: allUsers?.filter(user => {
        const signupDate = new Date(user.created_at)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return signupDate >= today
      }).length || 0
    }

    const weeklyAnalytics = {
      users_active: activeUsersWeek,
      conversations: weekConversationsCount,
      total_cost: totalCostWeek,
      new_signups: allUsers?.filter(user => {
        const signupDate = new Date(user.created_at)
        const weekAgo = new Date(dates.weekAgo)
        return signupDate >= weekAgo
      }).length || 0
    }

    const monthlyAnalytics = {
      users_active: allUsers?.filter(user => {
        const lastActivity = user.last_activity_at ? new Date(user.last_activity_at) : null
        const monthAgo = new Date(dates.monthAgo)
        return lastActivity && lastActivity >= monthAgo
      }).length || 0,
      conversations: monthConversationsCount,
      total_cost: totalCostMonth,
      new_signups: allUsers?.filter(user => {
        const signupDate = new Date(user.created_at)
        const monthAgo = new Date(dates.monthAgo)
        return signupDate >= monthAgo
      }).length || 0
    }

    // App conversion funnel (based on real user data)
    const conversionFunnel = {
      signupToActive: totalUsers > 0 ? (activeUsersWeek / totalUsers) * 100 : 0,
      activeToPaid: activeUsersWeek > 0 ? (upgradeCandidates.length / activeUsersWeek) * 100 : 0,
      newUserRetention: dailyAnalytics.new_signups > 0 ? (dailyAnalytics.users_active / Math.max(1, totalUsers)) * 100 : 0
    }

    // Business insights generation
    const insights = []

    // Growth insights
    if (totalUsers > 0) {
      const retentionRate = (activeUsersWeek / totalUsers) * 100
      if (retentionRate < 20) {
        insights.push({
          type: 'retention',
          priority: 'high',
          title: 'Low User Retention Alert',
          description: `Only ${retentionRate.toFixed(1)}% of users were active this week. Consider improving onboarding and engagement.`,
          action: 'Review user journey and add engagement features'
        })
      }
    }

    // Cost optimization insights
    if (totalCostMonth > 50) {
      const costPerUser = totalCostMonth / totalUsers
      if (costPerUser > 2) {
        insights.push({
          type: 'cost',
          priority: 'medium',
          title: 'High Cost Per User',
          description: `Average cost per user is $${costPerUser.toFixed(2)}/month. Consider optimizing model usage.`,
          action: 'Implement smarter model routing and caching'
        })
      }
    }

    // Model usage insights
    if (gpt4oPercentage > 70) {
      insights.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Heavy GPT-4o Usage',
        description: `${gpt4oPercentage.toFixed(1)}% of queries use GPT-4o. Consider routing simpler queries to GPT-4o-mini.`,
        action: 'Enhance query complexity detection'
      })
    }

    // Growth opportunities
    if (upgradeCandidates.length > 0) {
      insights.push({
        type: 'growth',
        priority: 'high',
        title: 'Upgrade Opportunities',
        description: `${upgradeCandidates.length} users show high engagement and may be ready for premium features.`,
        action: 'Reach out with upgrade offers and premium feature previews'
      })
    }

    // Usage pattern insights
    const avgConversationsPerUser = totalUsers > 0 ? totalConversations / totalUsers : 0
    if (avgConversationsPerUser < 2 && totalUsers > 0) {
      insights.push({
        type: 'engagement',
        priority: 'medium',
        title: 'Low User Engagement',
        description: `Users average only ${avgConversationsPerUser.toFixed(1)} conversations. Improve onboarding and value demonstration.`,
        action: 'Add guided tutorials and example use cases'
      })
    }

    return NextResponse.json({
      view: 'overview',
      summary: {
        total_users: totalUsers,
        active_users_week: activeUsersWeek,
        total_cost_today: totalCostToday,
        total_cost_week: totalCostWeek,
        total_cost_month: totalCostMonth,
        upgrade_candidates: upgradeCandidates.length,
        high_priority_alerts: insights.filter(i => i.priority === 'high').length,
        total_conversations: totalConversations,
        conversations_today: todayConversationsCount,
        conversations_week: weekConversationsCount,
        conversations_month: monthConversationsCount
      },
      quick_metrics: {
        cost_per_user_today: totalUsers > 0 ? totalCostToday / totalUsers : 0,
        cost_per_user_month: totalUsers > 0 ? totalCostMonth / totalUsers : 0,
        avg_engagement_score: avgEngagementScore,
        avg_conversations_per_user: avgConversationsPerUser,
        avg_tokens_per_conversation: avgTokensPerConversation,
        retention_rate_week: totalUsers > 0 ? (activeUsersWeek / totalUsers) * 100 : 0,
        model_usage: {
          gpt4o_percentage: gpt4oPercentage,
          gpt4o_mini_percentage: gpt4oMiniPercentage,
          total_model_calls: totalModelUsage
        }
      },
      detailed_metrics: {
        user_engagement_scores: userEngagementScores.slice(0, 10), // Top 10 users
        cost_breakdown: {
          today: totalCostToday,
          week: totalCostWeek,
          month: totalCostMonth
        },
        token_usage: {
          total: totalTokensUsed,
          average_per_conversation: avgTokensPerConversation,
          average_per_user: totalUsers > 0 ? totalTokensUsed / totalUsers : 0
        },
        model_distribution: modelStats
      },
      daily_analytics: dailyAnalytics,
      weekly_analytics: weeklyAnalytics,
      monthly_analytics: monthlyAnalytics,
      conversion_funnel: conversionFunnel,
      feature_usage: featureUsage,
      geographic_data: geographicData,
      top_insights: insights
    })

  } catch (error) {
    console.error('Overview analytics error:', error)
    // Return comprehensive empty state with error info
    return NextResponse.json({
      view: 'overview',
      error: error.message,
      summary: {
        total_users: 0,
        active_users_week: 0,
        total_cost_today: 0,
        total_cost_week: 0,
        total_cost_month: 0,
        upgrade_candidates: 0,
        high_priority_alerts: 1,
        total_conversations: 0,
        conversations_today: 0,
        conversations_week: 0,
        conversations_month: 0
      },
      quick_metrics: {
        cost_per_user_today: 0,
        cost_per_user_month: 0,
        avg_engagement_score: 0,
        avg_conversations_per_user: 0,
        avg_tokens_per_conversation: 0,
        retention_rate_week: 0,
        model_usage: {
          gpt4o_percentage: 0,
          gpt4o_mini_percentage: 0,
          total_model_calls: 0
        }
      },
      detailed_metrics: {
        user_engagement_scores: [],
        cost_breakdown: { today: 0, week: 0, month: 0 },
        token_usage: { total: 0, average_per_conversation: 0, average_per_user: 0 },
        model_distribution: {}
      },
      website_analytics: {
        sessions: 0,
        users: 0,
        pageviews: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
        conversionRate: 0
      },
      conversion_funnel: {
        visitorToSignup: 0,
        signupToActive: 0,
        activeToPaid: 0,
        overallConversion: 0
      },
      feature_usage: [],
      geographic_data: [],
      top_insights: [{
        type: 'error',
        priority: 'high',
        title: 'Analytics Error',
        description: 'Unable to load analytics data. Check database connection.',
        action: 'Contact technical support'
      }]
    })
  }
}

function getValueSegment(engagementScore: number, totalCost: number) {
  if (engagementScore > 70 && totalCost > 1.0) return 'High Value / High Cost'
  if (engagementScore > 70 && totalCost <= 1.0) return 'High Value / Low Cost'
  if (engagementScore <= 70 && totalCost > 1.0) return 'Low Value / High Cost'
  return 'Low Value / Low Cost'
}

async function getAdminAnalytics(supabase: any, dates: any) {
  try {
    const adminUsage = await getAdminUsageAnalytics(supabase, dates)
    
    return NextResponse.json({
      view: 'admin',
      admin_summary: {
        admin_users: adminUsage.admin_users.length,
        total_cost_today: adminUsage.today.total_cost,
        total_cost_week: adminUsage.week.total_cost,
        total_cost_month: adminUsage.month.total_cost,
        conversations_today: adminUsage.today.conversation_count,
        conversations_week: adminUsage.week.conversation_count,
        conversations_month: adminUsage.month.conversation_count
      },
      admin_users: adminUsage.admin_users,
      today: adminUsage.today,
      week: adminUsage.week,
      month: adminUsage.month
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({
      view: 'admin',
      admin_summary: {
        admin_users: 0,
        total_cost_today: 0,
        total_cost_week: 0,
        total_cost_month: 0,
        conversations_today: 0,
        conversations_week: 0,
        conversations_month: 0
      },
      admin_users: [],
      today: { total_cost: 0, conversation_count: 0, model_breakdown: [], api_breakdown: {} },
      week: { total_cost: 0, conversation_count: 0, model_breakdown: [], api_breakdown: {} },
      month: { total_cost: 0, conversation_count: 0, model_breakdown: [], api_breakdown: {} },
      error: 'Failed to load admin analytics'
    })
  }
}