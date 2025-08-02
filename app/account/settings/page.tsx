"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Key, Mail, CheckCircle, AlertCircle, Shield } from "lucide-react"
import { supabase } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  business_name: string
  user_role: string
  created_at: string
}

export default function AccountSettings() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordSetupLoading, setPasswordSetupLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [hasPassword, setHasPassword] = useState(false)

  useEffect(() => {
    loadProfile()
    checkPasswordStatus()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      } else {
        setError('Failed to load profile')
      }
    } catch (error) {
      setError('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const checkPasswordStatus = async () => {
    try {
      // Check if user has a password by attempting to get user from auth
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Check if this is an OAuth-only user by looking at user metadata
        // OAuth users typically have app_metadata or user_metadata indicating provider
        const hasOAuthProvider = user.app_metadata?.provider === 'google' || user.user_metadata?.iss
        const hasEmailProvider = user.app_metadata?.providers?.includes('email')
        
        setHasPassword(hasEmailProvider || !hasOAuthProvider)
      }
    } catch (error) {
      console.error('Error checking password status:', error)
    }
  }

  const handleRequestPasswordSetup = async () => {
    setPasswordSetupLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
      } else {
        setError(data.error || 'Failed to send password setup email')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setPasswordSetupLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/landscaping')}
                className="text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 px-3 py-2"
              >
                <ArrowLeft className="w-5 h-5 mr-2 md:hidden" />
                <span className="md:hidden">Chat</span>
                <span className="hidden md:inline">Back to Chat</span>
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-white font-cursive">AI Sidekick</h1>
                <p className="text-xs text-gray-300">Account Settings</p>
              </div>
              <div className="md:hidden">
                <h1 className="text-lg font-bold text-white font-cursive">AI Sidekick</h1>
              </div>
            </div>

            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-full px-6 py-3 mb-6">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Account Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                Account Settings
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              Manage your account security and authentication methods
            </p>
          </div>

          {/* Profile Information */}
          {profile && (
            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <p className="text-white">{profile.first_name} {profile.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Business</label>
                    <p className="text-white">{profile.business_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Account Type</label>
                    <p className="text-white capitalize">{profile.user_role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Authentication Methods */}
          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>Authentication Methods</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {message && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <p className="text-emerald-300 text-sm">{message}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Google OAuth */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">Google Account</p>
                      <p className="text-gray-400 text-sm">Sign in with your Google account</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300 text-sm">Connected</span>
                  </div>
                </div>

                {/* Email & Password */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Email & Password</p>
                      <p className="text-gray-400 text-sm">Sign in with your email and password</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasPassword ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-300 text-sm">Available</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-300 text-sm">Not Set</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Set Password Action */}
                {!hasPassword && (
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Add Password to Your Account</h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Set a password to access your account on any device, even without your Google account.
                    </p>
                    <ul className="text-sm text-gray-400 mb-4 space-y-1">
                      <li>• Access your account from any device</li>
                      <li>• Sign in without Google workspace restrictions</li>
                      <li>• Backup authentication method</li>
                    </ul>
                    <Button
                      onClick={handleRequestPasswordSetup}
                      disabled={passwordSetupLoading}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      {passwordSetupLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Sending Email...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Key className="w-4 h-4" />
                          <span>Set Password</span>
                        </div>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}