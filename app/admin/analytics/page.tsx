"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, DollarSign, Clock, Target, ArrowLeft, RefreshCw, Globe, MapPin, Zap, Eye, MousePointer, Calendar, PieChart, Activity } from "lucide-react"

interface AnalyticsData {
  view: string
  summary: {
    total_users: number
    active_users_week: number
    total_cost_today: number
    total_cost_week: number
    total_cost_month: number
    upgrade_candidates: number
    high_priority_alerts: number
    total_conversations: number
    conversations_today: number
    conversations_week: number
    conversations_month: number
  }
  quick_metrics: {
    cost_per_user_today: number
    cost_per_user_month: number
    avg_engagement_score: number
    avg_conversations_per_user: number
    avg_tokens_per_conversation: number
    retention_rate_week: number
    model_usage: {
      gpt4o_percentage: number
      gpt4o_mini_percentage: number
      total_model_calls: number
    }
  }
  detailed_metrics: {
    user_engagement_scores: Array<{
      id: string
      first_name: string
      business_name: string
      engagementScore: number
      conversationCount: number
      conversationsPerDay: number
      daysSinceSignup: number
      daysSinceActivity: number
    }>
    cost_breakdown: {
      today: number
      week: number
      month: number
    }
    token_usage: {
      total: number
      average_per_conversation: number
      average_per_user: number
    }
    model_distribution: Record<string, number>
  }
  website_analytics?: {
    sessions: number
    users: number
    pageviews: number
    bounceRate: number
    avgSessionDuration: number
    conversionRate: number
  }
  conversion_funnel?: {
    visitorToSignup: number
    signupToActive: number
    activeToPaid: number
    overallConversion: number
  }
  feature_usage?: Array<{
    feature: string
    usage_count: number
    unique_users: number
    percentage: number
  }>
  geographic_data?: Array<{
    location: string
    users: number
    percentage: number
  }>
  top_insights: Array<{
    type: string
    priority: string
    title: string
    description: string
    action: string
  }>
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'a8f3d2c9b7e4f1a6d8c2e9f3b5a7d4c1e6f8a2b9c5d7e3f1a8b4c6d9e2f5a8b1'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`)
      }
      
      const analyticsData = await response.json()
      setData(analyticsData)
      setLastUpdated(new Date().toLocaleString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <Card className="backdrop-blur-2xl bg-red-900/40 border-red-500/30 shadow-2xl max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Analytics</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <Button onClick={fetchAnalytics} className="bg-red-500 hover:bg-red-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <p className="text-white text-lg">No data available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.15),transparent_50%)] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-xl font-bold text-white">Admin Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              {lastUpdated && (
                <span className="text-sm text-gray-400">
                  Last updated: {lastUpdated}
                </span>
              )}
              <Button
                onClick={fetchAnalytics}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="backdrop-blur-2xl bg-blue-900/40 border-blue-500/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-white">{data.summary.total_users}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-2xl bg-emerald-900/40 border-emerald-500/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-300 text-sm font-medium">Active This Week</p>
                    <p className="text-3xl font-bold text-white">{data.summary.active_users_week}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-2xl bg-purple-900/40 border-purple-500/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Cost Today</p>
                    <p className="text-3xl font-bold text-white">${data.summary.total_cost_today.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-2xl bg-green-900/40 border-green-500/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Upgrade Candidates</p>
                    <p className="text-3xl font-bold text-white">{data.summary.upgrade_candidates}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-2xl bg-amber-900/40 border-amber-500/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-300 text-sm font-medium">Total Conversations</p>
                    <p className="text-3xl font-bold text-white">{data.summary.total_conversations}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-2xl bg-cyan-900/40 border-cyan-500/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-300 text-sm font-medium">Retention Rate</p>
                    <p className="text-3xl font-bold text-white">{data.quick_metrics.retention_rate_week.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Website Analytics Section */}
          {data.website_analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <Card className="backdrop-blur-2xl bg-indigo-900/40 border-indigo-500/30 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-300 text-sm font-medium">Website Sessions</p>
                      <p className="text-2xl font-bold text-white">{data.website_analytics.sessions.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-indigo-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-2xl bg-pink-900/40 border-pink-500/30 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-300 text-sm font-medium">Website Users</p>
                      <p className="text-2xl font-bold text-white">{data.website_analytics.users.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-pink-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-2xl bg-orange-900/40 border-orange-500/30 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-300 text-sm font-medium">Page Views</p>
                      <p className="text-2xl font-bold text-white">{data.website_analytics.pageviews.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-2xl bg-teal-900/40 border-teal-500/30 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-300 text-sm font-medium">Bounce Rate</p>
                      <p className="text-2xl font-bold text-white">{data.website_analytics.bounceRate.toFixed(1)}%</p>
                    </div>
                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                      <MousePointer className="w-5 h-5 text-teal-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-2xl bg-lime-900/40 border-lime-500/30 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lime-300 text-sm font-medium">Avg Session</p>
                      <p className="text-2xl font-bold text-white">{Math.round(data.website_analytics.avgSessionDuration / 60)}m</p>
                    </div>
                    <div className="w-10 h-10 bg-lime-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-lime-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-2xl bg-rose-900/40 border-rose-500/30 shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-rose-300 text-sm font-medium">Conversion Rate</p>
                      <p className="text-2xl font-bold text-white">{data.website_analytics.conversionRate.toFixed(2)}%</p>
                    </div>
                    <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-rose-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Conversion Funnel */}
          {data.conversion_funnel && (
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{data.conversion_funnel.visitorToSignup.toFixed(1)}%</div>
                    <div className="text-sm text-gray-300">Visitor → Signup</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{data.conversion_funnel.signupToActive.toFixed(1)}%</div>
                    <div className="text-sm text-gray-300">Signup → Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{data.conversion_funnel.activeToPaid.toFixed(1)}%</div>
                    <div className="text-sm text-gray-300">Active → Paid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">{data.conversion_funnel.overallConversion.toFixed(2)}%</div>
                    <div className="text-sm text-gray-300">Overall Conversion</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Enhanced Cost Metrics */}
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Cost Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Cost Per User Today</span>
                  <span className="text-white font-semibold">${data.quick_metrics.cost_per_user_today.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Cost Per User Month</span>
                  <span className="text-white font-semibold">${data.quick_metrics.cost_per_user_month.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Weekly Total</span>
                  <span className="text-white font-semibold">${data.summary.total_cost_week.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Monthly Total</span>
                  <span className="text-white font-semibold">${data.summary.total_cost_month.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg Tokens/Conv</span>
                  <span className="text-white font-semibold">{Math.round(data.quick_metrics.avg_tokens_per_conversation)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Model Usage */}
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Model & Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">GPT-4o Usage</span>
                  <span className="text-white font-semibold">{data.quick_metrics.model_usage.gpt4o_percentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">GPT-4o-mini Usage</span>
                  <span className="text-white font-semibold">{data.quick_metrics.model_usage.gpt4o_mini_percentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Model Calls</span>
                  <span className="text-white font-semibold">{data.quick_metrics.model_usage.total_model_calls}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg Engagement Score</span>
                  <span className="text-white font-semibold">{data.quick_metrics.avg_engagement_score.toFixed(0)}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Conversations/User</span>
                  <span className="text-white font-semibold">{data.quick_metrics.avg_conversations_per_user.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Token Usage Details */}
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Token Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Tokens Used</span>
                  <span className="text-white font-semibold">{data.detailed_metrics.token_usage.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg Per Conversation</span>
                  <span className="text-white font-semibold">{Math.round(data.detailed_metrics.token_usage.average_per_conversation).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg Per User</span>
                  <span className="text-white font-semibold">{Math.round(data.detailed_metrics.token_usage.average_per_user).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Weekly Retention</span>
                  <span className="text-white font-semibold">{data.quick_metrics.retention_rate_week.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">High Priority Alerts</span>
                  <span className="text-white font-semibold">{data.summary.high_priority_alerts}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Usage Analysis */}
          {data.feature_usage && data.feature_usage.length > 0 && (
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Feature Usage Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.feature_usage.map((feature, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-700/50 border border-gray-600/30">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{feature.feature}</span>
                        <span className="text-emerald-400 font-semibold">{feature.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {feature.usage_count} uses by {feature.unique_users} users
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                        <div 
                          className="bg-emerald-400 h-2 rounded-full" 
                          style={{ width: `${feature.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top User Engagement Scores */}
          {data.detailed_metrics.user_engagement_scores.length > 0 && (
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Top User Engagement (Top 10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.detailed_metrics.user_engagement_scores.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 border border-gray-600/30">
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {user.first_name} - {user.business_name}
                        </div>
                        <div className="text-sm text-gray-300">
                          {user.conversationCount} conversations • {user.conversationsPerDay.toFixed(1)}/day • 
                          {user.daysSinceActivity === 0 ? ' Active today' : ` ${user.daysSinceActivity}d ago`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          user.engagementScore >= 80 ? 'text-emerald-400' :
                          user.engagementScore >= 60 ? 'text-amber-400' :
                          user.engagementScore >= 40 ? 'text-orange-400' : 'text-red-400'
                        }`}>
                          {user.engagementScore}/100
                        </div>
                        <div className="text-xs text-gray-400">
                          {user.daysSinceSignup}d user
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Geographic Distribution */}
          {data.geographic_data && data.geographic_data.length > 0 && (
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.geographic_data.map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 border border-gray-600/30">
                      <div>
                        <div className="text-white font-medium">{location.location}</div>
                        <div className="text-sm text-gray-300">{location.users} users</div>
                      </div>
                      <div className="text-emerald-400 font-semibold">
                        {location.percentage.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Insights */}
          {data.top_insights.length > 0 && (
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Business Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.top_insights.map((insight, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      insight.priority === 'high' ? 'bg-red-900/20 border-red-500/30' :
                      insight.priority === 'medium' ? 'bg-yellow-900/20 border-yellow-500/30' :
                      'bg-blue-900/20 border-blue-500/30'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          insight.priority === 'high' ? 'bg-red-500' :
                          insight.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{insight.title}</h4>
                          <p className="text-gray-300 mt-1">{insight.description}</p>
                          <p className="text-gray-400 text-sm mt-2 italic">{insight.action}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </div>
  )
}