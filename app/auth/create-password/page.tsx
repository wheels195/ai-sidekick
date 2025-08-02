"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowLeft, Mail, Shield, Key } from "lucide-react"

export default function CreatePasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateForm = () => {
    if (!email) {
      setError('Email is required')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/create-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request',
          email: email
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
      } else {
        setError(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
  }

  if (isSuccess) {
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
                  onClick={() => (window.location.href = "/login")}
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

        {/* Main Content - Success State */}
        <main className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-full px-6 py-3 mb-6 hover:scale-105 transition-all duration-300">
                <Mail className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Email Sent</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                  Check Your Email
                </span>
              </h1>
              <p className="text-lg text-gray-300">
                We've sent a verification link to create your password
              </p>
            </div>

            <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-emerald-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-white">Verification Email Sent</h2>
                    <p className="text-gray-300">
                      We've sent a secure verification link to:
                    </p>
                    <p className="text-emerald-400 font-medium text-lg">{email}</p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-left space-y-3">
                    <h3 className="text-blue-300 font-medium flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Next Steps:
                    </h3>
                    <ol className="text-sm text-gray-300 space-y-2">
                      <li className="flex items-start">
                        <span className="text-blue-400 font-bold mr-2">1.</span>
                        Check your email inbox (and spam folder)
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 font-bold mr-2">2.</span>
                        Click the verification link in the email
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 font-bold mr-2">3.</span>
                        Create your new password on the secure page
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 font-bold mr-2">4.</span>
                        Sign in with either Google or your new password!
                      </li>
                    </ol>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => window.location.href = '/login'}
                      className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 py-3"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <p className="text-gray-400 text-sm">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
            </div>
          </div>
        </main>
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
                onClick={() => (window.location.href = "/login")}
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
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/20 rounded-full px-6 py-3 mb-6 hover:scale-105 transition-all duration-300">
              <Key className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">Create Password</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                Add Password to Your Account
              </span>
            </h1>
            <p className="text-lg text-gray-300">
              Enable email/password login for easy mobile access
            </p>
          </div>

          <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl text-white text-center">Add Password Authentication</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="text-emerald-300 text-sm">
                    <p className="font-medium mb-1">Perfect for mobile access!</p>
                    <p>Add a password to your Google account so you can sign in on any device, even when your Google Workspace isn't available.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Enter your account email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your-email@company.com"
                    value={email}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/25"
                    disabled={isLoading}
                  />
                  {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-blue-300 font-medium mb-2">How it works:</h3>
                  <ol className="text-sm text-gray-300 space-y-1">
                    <li>1. We'll send a verification email to confirm your identity</li>
                    <li>2. Click the secure link in the email</li>
                    <li>3. Create your new password on a secure page</li>
                    <li>4. You can then sign in with Google OR your new password!</li>
                  </ol>
                </div>

                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 py-3"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Sending Verification Email...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Send Verification Email</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              <div className="text-center mt-6">
                <p className="text-gray-400 text-sm">
                  Already have a password?{" "}
                  <button
                    type="button"
                    onClick={() => window.location.href = '/login'}
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              This will link a password to your existing Google account
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}