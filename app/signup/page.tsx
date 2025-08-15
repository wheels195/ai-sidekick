"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { supabase } from '@/lib/supabase/client'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null)

  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(null)
      return
    }
    
    // Check password strength
    const hasMinLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    const strength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length
    
    if (strength <= 2) setPasswordStrength('weak')
    else if (strength <= 4) setPasswordStrength('medium')
    else setPasswordStrength('strong')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Check password strength when password changes
    if (name === 'password') {
      checkPasswordStrength(value)
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'

    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent('/signup/complete')}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account consent'
          }
        }
      })

      if (error) {
        setErrors({ submit: error.message })
        setIsGoogleLoading(false)
      }
    } catch (error) {
      setErrors({ submit: 'Failed to sign up with Google' })
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success - redirect to check email page
        window.location.href = `/check-email?email=${encodeURIComponent(formData.email)}`
      } else {
        setErrors({ submit: data.error || 'Failed to create account' })
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-full px-6 py-3 mb-6 hover:scale-105 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Get Started</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                Create Your Account
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              Start your 7-day free trial for landscaping business growth
            </p>
          </div>

          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white text-center">Sign Up</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Google Sign Up */}
              <div className="space-y-4 mb-6">
                <Button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 shadow-xl border-2 border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:scale-105 py-4 flex items-center justify-center space-x-3 font-medium"
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-600/20 border-t-gray-600 rounded-full animate-spin"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-base">Continue with Google</span>
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600/30" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-800/40 px-2 text-gray-400">Or sign up with email</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Credentials */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                        disabled={isLoading || isGoogleLoading}
                      />
                      {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Input
                        type="text"
                        name="lastName"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                        disabled={isLoading || isGoogleLoading}
                      />
                      {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                      disabled={isLoading || isGoogleLoading}
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password (8+ characters)"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25 pr-10"
                        disabled={isLoading || isGoogleLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">Password strength:</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength === 'weak' ? 'text-red-400' : 
                            passwordStrength === 'medium' ? 'text-yellow-400' : 
                            passwordStrength === 'strong' ? 'text-green-400' : ''
                          }`}>
                            {passwordStrength === 'weak' && 'Weak'}
                            {passwordStrength === 'medium' && 'Medium'}
                            {passwordStrength === 'strong' && 'Strong'}
                          </span>
                        </div>
                        <div className="flex space-x-1 mt-1">
                          <div className={`h-1 flex-1 rounded-full ${
                            passwordStrength ? 'bg-gradient-to-r' : 'bg-gray-700'
                          } ${
                            passwordStrength === 'weak' ? 'from-red-500 to-red-400' : 
                            passwordStrength === 'medium' ? 'from-yellow-500 to-yellow-400' : 
                            passwordStrength === 'strong' ? 'from-green-500 to-green-400' : ''
                          }`}></div>
                          <div className={`h-1 flex-1 rounded-full ${
                            passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-gradient-to-r' : 'bg-gray-700'
                          } ${
                            passwordStrength === 'medium' ? 'from-yellow-500 to-yellow-400' : 
                            passwordStrength === 'strong' ? 'from-green-500 to-green-400' : ''
                          }`}></div>
                          <div className={`h-1 flex-1 rounded-full ${
                            passwordStrength === 'strong' ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gray-700'
                          }`}></div>
                        </div>
                      </div>
                    )}
                    
                    {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                  </div>
                </div>

                {errors.submit && (
                  <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                    {errors.submit}
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
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Create Account</span>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                  
                  {/* Email consent disclaimer */}
                  <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                    By creating an account, you agree to receive occasional product updates, tips, and newsletters. 
                    You can <button 
                      type="button" 
                      onClick={() => window.open('/unsubscribe', '_blank')} 
                      className="text-emerald-400 hover:text-emerald-300 underline"
                    >
                      unsubscribe anytime
                    </button>.
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => window.location.href = '/login'}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              By creating an account, you agree to our{" "}
              <a href="/terms" className="text-emerald-400 hover:text-emerald-300 underline">
                terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">
                privacy policy
              </a>.
              <br />
              Your business information helps us provide personalized advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}