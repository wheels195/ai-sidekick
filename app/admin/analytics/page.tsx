"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, DollarSign, Clock, Target, ArrowLeft, RefreshCw, Globe, MapPin, Zap, Eye, MousePointer, Calendar, PieChart, Activity, Shield } from "lucide-react"

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
  daily_analytics?: {
    users_active: number
    conversations: number
    total_cost: number
    new_signups: number
  }
  weekly_analytics?: {
    users_active: number
    conversations: number
    total_cost: number
    new_signups: number
  }
  monthly_analytics?: {
    users_active: number
    conversations: number
    total_cost: number
    new_signups: number
  }
  conversion_funnel?: {
    signupToActive: number
    activeToPaid: number
    newUserRetention: number
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
  const [activeView, setActiveView] = useState<string>('overview')
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  // Check if user is authenticated and is admin
  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const userData = await response.json()
        if (userData.success && userData.user.email === 'admin@ai-sidekick.io') {
          setUser(userData.user)
          setAuthLoading(false)
          return true
        }
      }
      // Not admin or not authenticated - redirect to login
      router.push('/login?redirect=/admin/analytics')
      return false
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login?redirect=/admin/analytics')
      return false
    }
  }

  const fetchAnalytics = async (view: string = 'overview') => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/analytics?view=${view}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || 'a8f3d2c9b7e4f1a6d8c2e9f3b5a7d4c1e6f8a2b9c5d7e3f1a8b4c6d9e2f5a8b1'
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

  const handleViewChange = (view: string) => {
    setActiveView(view)
    fetchAnalytics(view)
  }

  useEffect(() => {
    const initializeAdmin = async () => {
      const isAuthorized = await checkAdminAccess()
      if (isAuthorized) {
        fetchAnalytics()
      }
    }
    initializeAdmin()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading analytics...</p>
          <p className="text-emerald-400 text-sm mt-2">Welcome, {user?.firstName || 'Admin'}</p>
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
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm">Admin: {user?.firstName || 'User'}</span>
              </div>
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
          
          {/* View Navigation Tabs */}
          <div className="flex flex-wrap gap-2 bg-gray-800/40 backdrop-blur-xl border border-gray-600/30 rounded-xl p-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'costs', label: 'Costs', icon: DollarSign },
              { id: 'admin', label: 'Admin Usage', icon: Eye },
              { id: 'recommendations', label: 'Insights', icon: Target }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleViewChange(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeView === id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
          
          {/* Render content based on active view */}
          {activeView === 'admin' ? (
            // Admin Usage View
            <div className="space-y-8">
              {data?.admin_summary && (
                <>
                  {/* Admin Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="backdrop-blur-2xl bg-emerald-900/40 border-emerald-500/30 shadow-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-emerald-300 text-sm font-medium">Admin Cost Today</p>
                            <p className="text-3xl font-bold text-white">${data.admin_summary.total_cost_today.toFixed(4)}</p>
                          </div>
                          <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="backdrop-blur-2xl bg-blue-900/40 border-blue-500/30 shadow-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-300 text-sm font-medium">Admin Cost Week</p>
                            <p className="text-3xl font-bold text-white">${data.admin_summary.total_cost_week.toFixed(4)}</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="backdrop-blur-2xl bg-purple-900/40 border-purple-500/30 shadow-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-300 text-sm font-medium">Admin Cost Month</p>
                            <p className="text-3xl font-bold text-white">${data.admin_summary.total_cost_month.toFixed(4)}</p>
                          </div>
                          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-purple-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="backdrop-blur-2xl bg-orange-900/40 border-orange-500/30 shadow-2xl">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-300 text-sm font-medium">Conversations Month</p>
                            <p className="text-3xl font-bold text-white">{(data.admin_summary.conversations_month || 0).toLocaleString()}</p>
                          </div>
                          <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                            <Zap className="w-6 h-6 text-orange-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Admin Users Table */}
                  <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Eye className="w-5 h-5 mr-2" />
                        Admin Users ({data.admin_users?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-600/30">
                              <th className="text-left py-3 px-4 font-medium text-emerald-300">User</th>
                              <th className="text-left py-3 px-4 font-medium text-emerald-300">Email</th>
                              <th className="text-left py-3 px-4 font-medium text-emerald-300">Total Cost</th>
                              <th className="text-left py-3 px-4 font-medium text-emerald-300">Tokens Used</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.admin_users?.map((user: any, index: number) => (
                              <tr key={user.email} className={index % 2 === 0 ? 'bg-gray-700/20' : ''}>
                                <td className="py-3 px-4 text-white">{user.name || 'Admin'}</td>
                                <td className="py-3 px-4 text-gray-300">{user.email}</td>
                                <td className="py-3 px-4 text-emerald-400 font-mono">${(user.total_cost || 0).toFixed(4)}</td>
                                <td className="py-3 px-4 text-blue-400 font-mono">{(user.total_tokens || 0).toLocaleString()}</td>
                              </tr>
                            )) || (
                              <tr>
                                <td colSpan={4} className="py-8 px-4 text-center text-gray-400">
                                  No admin users found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed API Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Breakdown */}
                    <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">Today's Usage</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Model Breakdown */}
                        <div>
                          <h4 className="text-sm font-medium text-emerald-300 mb-2">Model Usage</h4>
                          {data.today?.model_breakdown?.map((model: any) => (
                            <div key={model.model} className="flex justify-between items-center py-1">
                              <span className="text-gray-300 text-sm">{model.model}</span>
                              <div className="text-right">
                                <span className="text-white text-sm font-mono">${(model.cost || 0).toFixed(4)}</span>
                                <span className="text-gray-400 text-xs ml-2">({model.conversations} calls)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* API Breakdown */}
                        <div className="border-t border-gray-600/30 pt-3">
                          <h4 className="text-sm font-medium text-blue-300 mb-2">API Costs</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">GPT API</span>
                              <span className="text-white font-mono">${(data.today?.api_breakdown?.gpt_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Google Places</span>
                              <span className="text-white font-mono">${(data.today?.api_breakdown?.google_places_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Google Search</span>
                              <span className="text-white font-mono">${(data.today?.api_breakdown?.google_search_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">DALL-E Images</span>
                              <span className="text-white font-mono">${(data.today?.api_breakdown?.dalle_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Whisper Audio</span>
                              <span className="text-white font-mono">${(data.today?.api_breakdown?.whisper_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">File Processing</span>
                              <span className="text-white font-mono">${(data.today?.api_breakdown?.file_processing_cost || 0).toFixed(4)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Week's Breakdown */}
                    <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">This Week's Usage</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Model Breakdown */}
                        <div>
                          <h4 className="text-sm font-medium text-emerald-300 mb-2">Model Usage</h4>
                          {data.week?.model_breakdown?.map((model: any) => (
                            <div key={model.model} className="flex justify-between items-center py-1">
                              <span className="text-gray-300 text-sm">{model.model}</span>
                              <div className="text-right">
                                <span className="text-white text-sm font-mono">${(model.cost || 0).toFixed(4)}</span>
                                <span className="text-gray-400 text-xs ml-2">({model.conversations} calls)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* API Breakdown */}
                        <div className="border-t border-gray-600/30 pt-3">
                          <h4 className="text-sm font-medium text-blue-300 mb-2">API Costs</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">GPT API</span>
                              <span className="text-white font-mono">${(data.week?.api_breakdown?.gpt_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Google Places</span>
                              <span className="text-white font-mono">${(data.week?.api_breakdown?.google_places_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Google Search</span>
                              <span className="text-white font-mono">${(data.week?.api_breakdown?.google_search_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">DALL-E Images</span>
                              <span className="text-white font-mono">${(data.week?.api_breakdown?.dalle_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Whisper Audio</span>
                              <span className="text-white font-mono">${(data.week?.api_breakdown?.whisper_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">File Processing</span>
                              <span className="text-white font-mono">${(data.week?.api_breakdown?.file_processing_cost || 0).toFixed(4)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Month's Breakdown */}
                    <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">This Month's Usage</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Model Breakdown */}
                        <div>
                          <h4 className="text-sm font-medium text-emerald-300 mb-2">Model Usage</h4>
                          {data.month?.model_breakdown?.map((model: any) => (
                            <div key={model.model} className="flex justify-between items-center py-1">
                              <span className="text-gray-300 text-sm">{model.model}</span>
                              <div className="text-right">
                                <span className="text-white text-sm font-mono">${(model.cost || 0).toFixed(4)}</span>
                                <span className="text-gray-400 text-xs ml-2">({model.conversations} calls)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* API Breakdown */}
                        <div className="border-t border-gray-600/30 pt-3">
                          <h4 className="text-sm font-medium text-blue-300 mb-2">API Costs</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">GPT API</span>
                              <span className="text-white font-mono">${(data.month?.api_breakdown?.gpt_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Google Places</span>
                              <span className="text-white font-mono">${(data.month?.api_breakdown?.google_places_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Google Search</span>
                              <span className="text-white font-mono">${(data.month?.api_breakdown?.google_search_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">DALL-E Images</span>
                              <span className="text-white font-mono">${(data.month?.api_breakdown?.dalle_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Whisper Audio</span>
                              <span className="text-white font-mono">${(data.month?.api_breakdown?.whisper_cost || 0).toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">File Processing</span>
                              <span className="text-white font-mono">${(data.month?.api_breakdown?.file_processing_cost || 0).toFixed(4)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          ) : activeView === 'costs' && data?.view === 'costs' ? (
            // Costs View
            <div className="space-y-8">
              {/* Cost Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="backdrop-blur-2xl bg-emerald-900/40 border-emerald-500/30 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-300 text-sm font-medium">Total Cost Today</p>
                        <p className="text-3xl font-bold text-white">${((data as any)?.today?.total_cost_usd || 0).toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-2xl bg-blue-900/40 border-blue-500/30 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-300 text-sm font-medium">Total Cost This Week</p>
                        <p className="text-3xl font-bold text-white">${((data as any)?.week?.total_cost_usd || 0).toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-2xl bg-purple-900/40 border-purple-500/30 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-300 text-sm font-medium">Total Cost This Month</p>
                        <p className="text-3xl font-bold text-white">${((data as any)?.month?.total_cost_usd || 0).toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-2xl bg-orange-900/40 border-orange-500/30 shadow-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-300 text-sm font-medium">Cost per Conversation</p>
                        <p className="text-3xl font-bold text-white">${((data as any)?.month?.cost_per_conversation || 0).toFixed(4)}</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-orange-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Cost Breakdown */}
              <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl">API Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Today */}
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-300 mb-4">Today</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">GPT-4o</span>
                          <span className="text-white font-mono">${((data as any)?.today?.gpt4o_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">GPT-4o-mini</span>
                          <span className="text-white font-mono">${((data as any)?.today?.gpt4o_mini_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Google Places</span>
                          <span className="text-white font-mono">${((data as any)?.today?.google_places_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Google Search</span>
                          <span className="text-white font-mono">${((data as any)?.today?.google_search_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">DALL-E Images</span>
                          <span className="text-white font-mono">${((data as any)?.today?.dalle_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Whisper Audio</span>
                          <span className="text-white font-mono">${((data as any)?.today?.whisper_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">File Processing</span>
                          <span className="text-white font-mono">${((data as any)?.today?.files_cost || 0).toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Week */}
                    <div>
                      <h3 className="text-lg font-semibold text-blue-300 mb-4">This Week</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">GPT-4o</span>
                          <span className="text-white font-mono">${((data as any)?.week?.gpt4o_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">GPT-4o-mini</span>
                          <span className="text-white font-mono">${((data as any)?.week?.gpt4o_mini_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Google Places</span>
                          <span className="text-white font-mono">${((data as any)?.week?.google_places_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Google Search</span>
                          <span className="text-white font-mono">${((data as any)?.week?.google_search_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">DALL-E Images</span>
                          <span className="text-white font-mono">${((data as any)?.week?.dalle_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Whisper Audio</span>
                          <span className="text-white font-mono">${((data as any)?.week?.whisper_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">File Processing</span>
                          <span className="text-white font-mono">${((data as any)?.week?.files_cost || 0).toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Month */}
                    <div>
                      <h3 className="text-lg font-semibold text-purple-300 mb-4">This Month</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">GPT-4o</span>
                          <span className="text-white font-mono">${((data as any)?.month?.gpt4o_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">GPT-4o-mini</span>
                          <span className="text-white font-mono">${((data as any)?.month?.gpt4o_mini_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Google Places</span>
                          <span className="text-white font-mono">${((data as any)?.month?.google_places_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Google Search</span>
                          <span className="text-white font-mono">${((data as any)?.month?.google_search_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">DALL-E Images</span>
                          <span className="text-white font-mono">${((data as any)?.month?.dalle_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Whisper Audio</span>
                          <span className="text-white font-mono">${((data as any)?.month?.whisper_cost || 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">File Processing</span>
                          <span className="text-white font-mono">${((data as any)?.month?.files_cost || 0).toFixed(4)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Users by Cost */}
              {(data as any)?.top_users_by_cost && (
                <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Top Users by Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-600/30">
                            <th className="text-left py-3 px-4 font-medium text-emerald-300">User</th>
                            <th className="text-left py-3 px-4 font-medium text-emerald-300">Business</th>
                            <th className="text-left py-3 px-4 font-medium text-emerald-300">Total Cost</th>
                            <th className="text-left py-3 px-4 font-medium text-emerald-300">Tokens</th>
                            <th className="text-left py-3 px-4 font-medium text-emerald-300">Recommended Tier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data as any).top_users_by_cost.slice(0, 10).map((user: any, index: number) => (
                            <tr key={user.user_id} className={index % 2 === 0 ? 'bg-gray-700/20' : ''}>
                              <td className="py-3 px-4 text-white">{user.name}</td>
                              <td className="py-3 px-4 text-gray-300">{user.business || 'N/A'}</td>
                              <td className="py-3 px-4 text-emerald-400 font-mono">${user.total_cost.toFixed(4)}</td>
                              <td className="py-3 px-4 text-blue-400 font-mono">{user.total_tokens.toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  user.tier_recommended === 'Business' ? 'bg-purple-500/20 text-purple-300' :
                                  user.tier_recommended === 'Pro' ? 'bg-blue-500/20 text-blue-300' :
                                  'bg-gray-500/20 text-gray-300'
                                }`}>
                                  {user.tier_recommended}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : activeView === 'overview' || !activeView || activeView === 'costs' ? (
            // Default to Overview for overview, costs, and undefined views
            <div className="space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="backdrop-blur-2xl bg-blue-900/40 border-blue-500/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Total Users</p>
                    <p className="text-3xl font-bold text-white">{data?.summary?.total_users || 0}</p>
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
                    <p className="text-3xl font-bold text-white">{data?.summary?.active_users_week || 0}</p>
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
                    <p className="text-3xl font-bold text-white">${(data.summary?.total_cost_today || 0).toFixed(2)}</p>
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
                    <p className="text-3xl font-bold text-white">{data?.summary?.upgrade_candidates || 0}</p>
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
                    <p className="text-3xl font-bold text-white">{data?.summary?.total_conversations || 0}</p>
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
                    <p className="text-3xl font-bold text-white">{(data.quick_metrics?.retention_rate_week || 0).toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily/Weekly/Monthly Analytics Trackers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Analytics */}
            {data.daily_analytics && (
              <Card className="backdrop-blur-2xl bg-blue-900/40 border-blue-500/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Daily Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300">Active Users</span>
                    <span className="text-white font-semibold">{data.daily_analytics?.users_active || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300">Conversations</span>
                    <span className="text-white font-semibold">{data.daily_analytics?.conversations || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300">Total Cost</span>
                    <span className="text-white font-semibold">${(data.daily_analytics?.total_cost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300">New Signups</span>
                    <span className="text-white font-semibold">{data.daily_analytics?.new_signups || 0}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weekly Analytics */}
            {data.weekly_analytics && (
              <Card className="backdrop-blur-2xl bg-emerald-900/40 border-emerald-500/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Weekly Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-300">Active Users</span>
                    <span className="text-white font-semibold">{data.weekly_analytics?.users_active || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-300">Conversations</span>
                    <span className="text-white font-semibold">{data.weekly_analytics?.conversations || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-300">Total Cost</span>
                    <span className="text-white font-semibold">${(data.weekly_analytics?.total_cost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-300">New Signups</span>
                    <span className="text-white font-semibold">{data.weekly_analytics.new_signups}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Monthly Analytics */}
            {data.monthly_analytics && (
              <Card className="backdrop-blur-2xl bg-purple-900/40 border-purple-500/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Monthly Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Active Users</span>
                    <span className="text-white font-semibold">{data.monthly_analytics?.users_active || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Conversations</span>
                    <span className="text-white font-semibold">{data.monthly_analytics?.conversations || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Total Cost</span>
                    <span className="text-white font-semibold">${(data.monthly_analytics?.total_cost || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">New Signups</span>
                    <span className="text-white font-semibold">{data.monthly_analytics.new_signups}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{(data.conversion_funnel?.signupToActive || 0).toFixed(1)}%</div>
                    <div className="text-sm text-gray-300">Signup → Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{(data.conversion_funnel?.activeToPaid || 0).toFixed(1)}%</div>
                    <div className="text-sm text-gray-300">Active → Upgrade Candidate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400">{(data.conversion_funnel?.newUserRetention || 0).toFixed(1)}%</div>
                    <div className="text-sm text-gray-300">New User Retention</div>
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
                  <span className="text-white font-semibold">${(data.quick_metrics?.cost_per_user_today || 0).toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Cost Per User Month</span>
                  <span className="text-white font-semibold">${(data.quick_metrics?.cost_per_user_month || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Weekly Total</span>
                  <span className="text-white font-semibold">${(data.summary?.total_cost_week || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Monthly Total</span>
                  <span className="text-white font-semibold">${(data.summary?.total_cost_month || 0).toFixed(2)}</span>
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
                  <span className="text-white font-semibold">{(data.quick_metrics?.model_usage?.gpt4o_percentage || 0).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">GPT-4o-mini Usage</span>
                  <span className="text-white font-semibold">{(data.quick_metrics?.model_usage?.gpt4o_mini_percentage || 0).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Model Calls</span>
                  <span className="text-white font-semibold">{data.quick_metrics.model_usage.total_model_calls}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg Engagement Score</span>
                  <span className="text-white font-semibold">{(data.quick_metrics?.avg_engagement_score || 0).toFixed(0)}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Conversations/User</span>
                  <span className="text-white font-semibold">{(data.quick_metrics?.avg_conversations_per_user || 0).toFixed(1)}</span>
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
                  <span className="text-white font-semibold">{(data.detailed_metrics?.token_usage?.total || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg Per Conversation</span>
                  <span className="text-white font-semibold">{Math.round(data.detailed_metrics?.token_usage?.average_per_conversation || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg Per User</span>
                  <span className="text-white font-semibold">{Math.round(data.detailed_metrics?.token_usage?.average_per_user || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Weekly Retention</span>
                  <span className="text-white font-semibold">{(data.quick_metrics?.retention_rate_week || 0).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">High Priority Alerts</span>
                  <span className="text-white font-semibold">{data.summary.high_priority_alerts}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Usage Analysis */}
          {data?.feature_usage && data.feature_usage.length > 0 && (
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
                        <span className="text-emerald-400 font-semibold">{(feature.percentage || 0).toFixed(1)}%</span>
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
                          {user.conversationCount} conversations • {(user.conversationsPerDay || 0).toFixed(1)}/day • 
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
          {data?.geographic_data && data.geographic_data.length > 0 && (
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
                        {(location.percentage || 0).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Insights */}
          {data?.top_insights && data.top_insights.length > 0 && (
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
          ) : activeView === 'users' ? (
            // Users View - Show empty state immediately since we don't have user data yet
            <div className="space-y-8">
              <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center">
                    <Users className="w-6 h-6 mr-2 text-emerald-400" />
                    User Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Users Yet</h3>
                    <p className="text-gray-400">User analytics will appear here once you have registered users.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : activeView === 'recommendations' ? (
            // Recommendations/Insights View - Show empty state immediately
            <div className="space-y-8">
              <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center">
                    <Target className="w-6 h-6 mr-2 text-emerald-400" />
                    Business Insights & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Insights Available</h3>
                    <p className="text-gray-400">Business insights and recommendations will appear here once you have more data and user activity.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Default fallback for unknown views
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">View Coming Soon</h3>
              <p className="text-gray-400">This analytics view is being developed. Please use Overview or Admin Usage for now.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}