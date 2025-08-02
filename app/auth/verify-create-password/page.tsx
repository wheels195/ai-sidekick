"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Eye, EyeOff, Shield, CheckCircle, Key } from "lucide-react"

function VerifyCreatePasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Password requirements
  const passwordRequirements = [
    { test: (p: string) => p.length >= 8, text: "At least 8 characters" },
    { test: (p: string) => /[A-Z]/.test(p), text: "One uppercase letter" },
    { test: (p: string) => /[a-z]/.test(p), text: "One lowercase letter" },
    { test: (p: string) => /\d/.test(p), text: "One number" },
    { test: (p: string) => /[!@#$%^&*(),.?\":{}|<>]/.test(p), text: "One special character" }
  ]

  useEffect(() => {
    const verifyToken = async () => {
      const tokenParam = searchParams.get('token')
      
      if (!tokenParam) {
        setErrors({ token: 'Invalid verification link. Please request a new one.' })
        setIsVerifying(false)
        return
      }

      setToken(tokenParam)

      try {
        const response = await fetch('/api/auth/create-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'verify',
            token: tokenParam
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setEmail(data.email)
          setIsVerifying(false)
        } else {
          setErrors({ token: data.error || 'Invalid or expired verification link' })
          setIsVerifying(false)
        }
      } catch (error) {
        setErrors({ token: 'Network error. Please try again.' })
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [searchParams])

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

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      // Check password requirements
      const failedRequirements = passwordRequirements.filter(req => !req.test(formData.password))
      if (failedRequirements.length > 0) {
        newErrors.password = 'Password does not meet requirements'
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/create-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          token: token,
          password: formData.password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login?message=password-created')
        }, 3000)
      } else {
        setErrors({ submit: data.error || 'Failed to create password' })
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Verifying your link...</h2>
          <p className="text-gray-300">Please wait while we validate your verification token.</p>
        </div>
      </div>
    )
  }

  // Show error state if token verification failed
  if (errors.token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✗</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Invalid Link</h2>
          <p className="text-gray-300 mb-4">{errors.token}</p>
          <Button
            onClick={() => router.push('/auth/create-password')}
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white"
          >
            Request New Link
          </Button>
        </div>
      </div>
    )
  }

  // Show success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Password Created Successfully!</h2>
          <p className="text-gray-300 mb-4">
            You can now sign in with either Google or your new password.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Redirecting to login page...
          </p>
          <Button
            onClick={() => router.push('/login?message=password-created')}
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white"
          >
            Go to Login Now
          </Button>
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
                onClick={() => router.push('/login')}
                className="text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300 px-3 py-2"
              >
                <ArrowLeft className="w-5 h-5 mr-2 md:hidden" />
                <span className="md:hidden">Login</span>
                <span className="hidden md:inline">Back to Login</span>
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

            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-full px-6 py-3 mb-6 hover:scale-105 transition-all duration-300">
              <Key className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Create Password</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                Set Your Password
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              Create a secure password for {email}
            </p>
          </div>

          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white text-center">Create Your Password</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="text-emerald-300 text-sm">
                    <p className="font-medium mb-1">Almost done!</p>
                    <p>Create a strong password and you'll be able to sign in with either Google or email/password on any device.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                </div>

                {/* Password Requirements */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-300">Password Requirements:</p>
                  <div className="grid grid-cols-1 gap-1">
                    {passwordRequirements.map((req, index) => {
                      const isValid = formData.password && req.test(formData.password)
                      return (
                        <div key={index} className={`flex items-center space-x-2 text-xs ${
                          isValid ? 'text-emerald-400' : 'text-gray-400'
                        }`}>
                          <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                            isValid ? 'bg-emerald-500' : 'bg-gray-600'
                          }`}>
                            {isValid && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span>{req.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                {errors.submit && (
                  <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-4">
                    {errors.submit}
                  </div>
                )}

                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 py-3"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Creating Password...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Key className="w-4 h-4" />
                        <span>Create Password</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              After creating your password, you can sign in with either Google or email/password
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function VerifyCreatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <VerifyCreatePasswordContent />
    </Suspense>
  )
}