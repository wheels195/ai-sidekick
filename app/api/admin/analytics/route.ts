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
    // Get comprehensive user data
    const { data: allUsers } = await supabase
      .from('user_profiles')
      .select('*') || []

    const { data: recentUsers } = await supabase
      .from('user_profiles')
      .select('id, last_activity_at')
      .gte('last_activity_at', dates.weekAgo) || []

    // Get all conversations with full data
    const { data: allConversations } = await supabase
      .from('user_conversations')
      .select('*') || []

    const { data: todayConversations } = await supabase
      .from('user_conversations')
      .select('*')
      .gte('created_at', dates.today) || []

    const { data: weekConversations } = await supabase
      .from('user_conversations')
      .select('*')
      .gte('created_at', dates.weekAgo) || []

    const { data: monthConversations } = await supabase
      .from('user_conversations')
      .select('*')
      .gte('created_at', dates.monthAgo) || []

    // Enhanced calculations
    const totalUsers = allUsers?.length || 0
    const activeUsersWeek = recentUsers?.length || 0
    const totalConversations = allConversations?.length || 0
    const todayConversationsCount = todayConversations?.length || 0
    const weekConversationsCount = weekConversations?.length || 0
    const monthConversationsCount = monthConversations?.length || 0

    // Cost calculations with fallbacks
    const calculateCosts = (conversations: any[]) => {
      return conversations?.reduce((sum, conv) => {
        if (conv.cost_breakdown?.totalCostUsd) {
          return sum + conv.cost_breakdown.totalCostUsd
        }
        // Fallback: estimate from tokens
        const tokens = conv.tokens_used || 0
        const model = conv.model_used || 'gpt-4o-mini'
        const rate = model === 'gpt-4o' ? 0.0001 : 0.00001
        return sum + (tokens * rate)
      }, 0) || 0
    }

    const totalCostToday = calculateCosts(todayConversations)
    const totalCostWeek = calculateCosts(weekConversations)
    const totalCostMonth = calculateCosts(monthConversations)

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

    // Advanced user analytics with engagement scoring
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

    // Feature usage analysis (mock data for now - would track actual feature usage)
    const featureUsage = [
      { feature: 'Chat Assistant', usage_count: totalConversations, unique_users: totalUsers, percentage: 100 },
      { feature: 'Google Places', usage_count: Math.floor(totalConversations * 0.3), unique_users: Math.floor(totalUsers * 0.6), percentage: 30 },
      { feature: 'Web Search', usage_count: Math.floor(totalConversations * 0.1), unique_users: Math.floor(totalUsers * 0.2), percentage: 10 },
      { feature: 'Image Generation', usage_count: Math.floor(totalConversations * 0.05), unique_users: Math.floor(totalUsers * 0.1), percentage: 5 },
      { feature: 'File Upload', usage_count: Math.floor(totalConversations * 0.02), unique_users: Math.floor(totalUsers * 0.05), percentage: 2 }
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

    // Website analytics (placeholder - real data comes from Google Analytics)
    // Note: These are placeholder values. Real GA data requires server-side GA API integration
    const websiteAnalytics = {
      sessions: 0, // Will be populated from Google Analytics Reporting API
      users: 0,    // Will be populated from Google Analytics Reporting API
      pageviews: 0, // Will be populated from Google Analytics Reporting API
      bounceRate: 0, // Will be populated from Google Analytics Reporting API
      avgSessionDuration: 0, // Will be populated from Google Analytics Reporting API
      conversionRate: 0 // Will be calculated from real GA data
    }

    // Conversion funnel (using app data until GA API is integrated)
    const conversionFunnel = {
      visitorToSignup: 0, // Will calculate from GA data: (totalUsers / GA_users) * 100
      signupToActive: totalUsers > 0 ? (activeUsersWeek / totalUsers) * 100 : 0,
      activeToPaid: activeUsersWeek > 0 ? (upgradeCandidates.length / activeUsersWeek) * 100 : 0,
      overallConversion: 0 // Will calculate from GA data: (upgradeCandidates / GA_users) * 100
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
      website_analytics: websiteAnalytics,
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