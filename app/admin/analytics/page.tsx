"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, DollarSign, Target, ArrowLeft, RefreshCw, Shield } from "lucide-react"

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null)
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
      router.push('/login?redirect=/admin/analytics')
      setAuthLoading(false)
      return false
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login?redirect=/admin/analytics')
      setAuthLoading(false)
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
  }, [router])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 text-emerald-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Verifying Admin Access</h2>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

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
          
          {/* Content based on active view */}
          {activeView === 'users' ? (
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
          ) : activeView === 'recommendations' ? (
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Target className="w-6 h-6 mr-2 text-emerald-400" />
                  Business Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Insights Available</h3>
                  <p className="text-gray-400">Business insights will appear here once you have more data and user activity.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Default overview
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
                      <p className="text-green-300 text-sm font-medium">Conversations</p>
                      <p className="text-3xl font-bold text-white">{data?.summary?.total_conversations || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}