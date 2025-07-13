"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, DollarSign, Clock, Target, ArrowLeft, RefreshCw } from "lucide-react"

interface AnalyticsData {
  success: boolean
  generatedAt: string
  overview: {
    totalConversions: number
    totalTrialSignups: number
    conversionRate: number
    projectedMRR: number
  }
  conversions: {
    today: number
    thisWeek: number
    thisMonth: number
    total: number
  }
  userBehavior: {
    avgTokensUsedBeforeUpgrade: number
    avgDaysToConvert: number
    tokenUtilization: number
  }
  revenue: {
    starterPlanConversions: number
    advancedPlanConversions: number
    projectedMRR: number
    averageRevenuePerUser: number
  }
  insights: {
    conversionGoal: number
    progressToGoal: number
    estimatedTimeToGoal: string
  }
  recentConversions: Array<{
    date: string
    plan: string
    tokensUsed: number
    daysInTrial: number
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
                    <p className="text-blue-300 text-sm font-medium">Total Conversions</p>
                    <p className="text-3xl font-bold text-white">{data.overview.totalConversions}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-2xl bg-emerald-900/40 border-emerald-500/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-300 text-sm font-medium">Trial Signups</p>
                    <p className="text-3xl font-bold text-white">{data.overview.totalTrialSignups}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-2xl bg-purple-900/40 border-purple-500/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Conversion Rate</p>
                    <p className="text-3xl font-bold text-white">{data.overview.conversionRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-2xl bg-green-900/40 border-green-500/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Projected MRR</p>
                    <p className="text-3xl font-bold text-white">${data.overview.projectedMRR}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Conversion Breakdown */}
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Conversion Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Today</span>
                  <span className="text-white font-semibold">{data.conversions.today}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">This Week</span>
                  <span className="text-white font-semibold">{data.conversions.thisWeek}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">This Month</span>
                  <span className="text-white font-semibold">{data.conversions.thisMonth}</span>
                </div>
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Total</span>
                    <span className="text-emerald-400 font-bold text-lg">{data.conversions.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Behavior */}
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  User Behavior
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg. Tokens Used</span>
                  <span className="text-white font-semibold">{data.userBehavior.avgTokensUsedBeforeUpgrade.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg. Days to Convert</span>
                  <span className="text-white font-semibold">{data.userBehavior.avgDaysToConvert}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Token Utilization</span>
                  <span className="text-white font-semibold">{data.userBehavior.tokenUtilization}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Metrics */}
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Starter Plan</span>
                  <span className="text-white font-semibold">{data.revenue.starterPlanConversions} users</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Advanced Plan</span>
                  <span className="text-white font-semibold">{data.revenue.advancedPlanConversions} users</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Avg. Revenue/User</span>
                  <span className="text-white font-semibold">${data.revenue.averageRevenuePerUser}</span>
                </div>
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Total MRR</span>
                    <span className="text-green-400 font-bold text-lg">${data.revenue.projectedMRR}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Testing Progress */}
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Market Testing Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Goal</span>
                  <span className="text-white font-semibold">{data.insights.conversionGoal} conversions</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Progress</span>
                    <span className="text-white font-semibold">{data.insights.progressToGoal}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${data.insights.progressToGoal}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Est. Time to Goal</span>
                  <span className="text-white font-semibold">{data.insights.estimatedTimeToGoal}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Conversions */}
          {data.recentConversions.length > 0 && (
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Recent Conversions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-4 text-gray-300">Date</th>
                        <th className="text-left py-3 px-4 text-gray-300">Plan</th>
                        <th className="text-left py-3 px-4 text-gray-300">Tokens Used</th>
                        <th className="text-left py-3 px-4 text-gray-300">Days in Trial</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentConversions.map((conversion, index) => (
                        <tr key={index} className="border-b border-gray-700/50">
                          <td className="py-3 px-4 text-white">
                            {new Date(conversion.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-white">{conversion.plan}</td>
                          <td className="py-3 px-4 text-white">{conversion.tokensUsed?.toLocaleString() || 'N/A'}</td>
                          <td className="py-3 px-4 text-white">{conversion.daysInTrial || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </div>
  )
}