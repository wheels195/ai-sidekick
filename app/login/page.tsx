"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react"
import { supabase } from '@/lib/supabase/client'

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  // supabase is imported from our configured client
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    // Check for existing session first, but not if there's an OAuth error or if we're on mobile
    const checkExistingSession = async () => {
      try {
        // If there's an OAuth error, don't redirect - show the error instead
        const hasOAuthError = searchParams.get('error')
        const isFromCallback = searchParams.get('from') === 'callback'
        
        if (hasOAuthError || isFromCallback) {
          console.log('OAuth error or callback redirect detected, staying on login page')
          setIsCheckingSession(false)
          return
        }
        
        // Add a small delay to prevent race conditions with OAuth callback processing
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.warn('Session check error:', sessionError)
          setIsCheckingSession(false)
          return
        }
        
        if (session && session.user) {
          console.log('Valid session found, redirecting to:', searchParams.get('redirect') || '/landscaping')
          // User is already authenticated, redirect to intended page
          const redirectUrl = searchParams.get('redirect') || '/landscaping'
          router.push(redirectUrl)
          return
        }
        
        console.log('No valid session found, staying on login page')
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsCheckingSession(false)
      }
    }
    
    checkExistingSession()
    
    // Check if user just verified their email
    if (searchParams.get('verified') === 'true') {
      setSuccessMessage('Email verified successfully! You can now log in.')
    }
    
    // Check if user just created a password
    if (searchParams.get('message') === 'password-created') {
      setSuccessMessage('Password created successfully! You can now sign in with Google or your new password.')
    }

    // Check for OAuth errors with mobile-specific handling
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    const isMobile = searchParams.get('mobile') === 'true'
    
    if (error) {
      const errorMessages = {
        'auth_failed': isMobile 
          ? 'Mobile authentication timed out. Try the "Retry Google Sign In" button below.'
          : 'Authentication failed. Please try again.',
        'oauth_error': message || 'OAuth authentication failed.',
        'session_exchange_failed': `Session creation failed: ${message || 'Unknown error'}`,
        'no_auth_code': 'No authentication code received from Google.',
        'callback_exception': `Authentication error: ${message || 'Unknown error'}`
      }
      setErrors({ submit: errorMessages[error as keyof typeof errorMessages] || `Authentication error: ${error}` })
    }

    // Load remembered email if available
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    const isRemembered = localStorage.getItem('rememberMe') === 'true'
    
    if (rememberedEmail && isRemembered) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }))
      setRememberMe(true)
    }

    // No need for manual OAuth callback handling - using proper API route
  }, [searchParams, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'

    if (!formData.password) newErrors.password = 'Password is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('rememberedEmail', formData.email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('rememberedEmail')
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: rememberMe
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success - redirect to the intended page or default to landscaping
        const redirectUrl = searchParams.get('redirect') || '/landscaping'
        router.push(redirectUrl)
      } else {
        setErrors({ submit: data.error || 'Failed to sign in' })
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setErrors({})

    // Store remember me preference for OAuth flow
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true')
    }

    try {
      // Use hybrid client-side OAuth callback with PKCE support
      const intendedRedirect = searchParams.get('redirect') || '/landscaping'
      const redirectUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(intendedRedirect)}`
      console.log('Starting Google OAuth with hybrid PKCE callback:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      console.log('OAuth response:', { data, error })

      if (error) {
        console.error('OAuth error:', error)
        setErrors({ submit: error.message })
        setIsGoogleLoading(false)
      }
    } catch (error) {
      console.error('OAuth catch error:', error)
      setErrors({ submit: 'Failed to sign in with Google' })
      setIsGoogleLoading(false)
    }
  }

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Checking authentication...</h2>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/35 to-indigo-500/35 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-2xl bg-black/80 border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/")}
                className="text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 px-3 py-2"
              >
                <ArrowLeft className="w-5 h-5 mr-2 md:hidden" />
                <span className="md:hidden">Home</span>
                <span className="hidden md:inline">Back to Home</span>
              </Button>
            </div>

            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => (window.location.href = "/")}>
              <div className="w-10 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-white font-cursive">AI Sidekick</h1>
                <p className="text-xs text-gray-300">Specialized AI for Local Trades</p>
              </div>
              <div className="md:hidden">
                <h1 className="text-lg font-bold text-white font-cursive">AI Sidekick</h1>
              </div>
            </div>

            <div className="w-20"></div> {/* Spacer for center alignment */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-full px-6 py-3 mb-6 hover:scale-105 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Welcome Back</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                Sign In
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              Continue your business growth journey
            </p>
          </div>

          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white text-center">Access Your Account</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {successMessage && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-emerald-300 text-sm text-center">{successMessage}</p>
                </div>
              )}
              {/* Google Sign In */}
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 shadow-lg transition-all duration-300 hover:scale-105 py-3 flex items-center justify-center space-x-3"
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-600/20 border-t-gray-600 rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600/30" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-800/40 px-2 text-gray-400">Or continue with email</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                    disabled={isLoading || isGoogleLoading}
                    suppressHydrationWarning
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25 pr-10"
                    disabled={isLoading || isGoogleLoading}
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <label 
                    htmlFor="remember-me" 
                    className="text-sm text-gray-300 cursor-pointer select-none"
                  >
                    Keep me signed in for 30 days
                  </label>
                </div>

                {errors.submit && (
                  <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                    <p className="mb-3">{errors.submit}</p>
                    {(searchParams.get('error') === 'auth_failed' || searchParams.get('error') === 'oauth_error') && (
                      <Button
                        type="button"
                        onClick={() => {
                          setErrors({})
                          handleGoogleSignIn()
                        }}
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-400 text-white"
                      >
                        🔄 Retry Google Sign In
                      </Button>
                    )}
                  </div>
                )}

                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 py-3"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Sign In to Your Account</span>
                        <LogIn className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => window.location.href = '/signup'}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                    >
                      Create one here
                    </button>
                  </p>
                </div>

                <div className="text-center space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center">
                    <button
                      type="button"
                      onClick={() => window.location.href = '/auth/forgot-password'}
                      className="text-gray-400 hover:text-gray-300 text-sm transition-colors duration-300"
                    >
                      Forgot Password?
                    </button>
                    <span className="hidden sm:inline text-gray-600 text-sm">•</span>
                    <button
                      type="button"
                      onClick={() => window.location.href = '/auth/create-password'}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-300"
                    >
                      Create Password
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use "Create Password" if you signed up with Google and want to add email/password login
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              Secure login with encrypted sessions
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  )
}