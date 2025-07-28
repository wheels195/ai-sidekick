"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Mail, ArrowLeft } from "lucide-react"

function UnsubscribeForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const emailParam = searchParams.get('email')
    const successParam = searchParams.get('success')
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
    if (successParam === 'true') {
      setIsSuccess(true)
    }
  }, [searchParams])

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSuccess(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to unsubscribe')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-emerald-900/20 via-emerald-800/10 to-emerald-900/20 border border-emerald-500/30 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">You're unsubscribed</h1>
            <p className="text-gray-300 mb-6">
              {email} has been removed from our mailing list. You won't receive marketing emails from us anymore.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              You'll still receive important account-related emails like password resets and billing notifications.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to <span className="font-cursive">AI Sidekick</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="backdrop-blur-2xl bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-900/60 border border-gray-600/30 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500/30 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Unsubscribe from <span className="font-cursive text-emerald-400">AI Sidekick</span></h1>
            <p className="text-gray-300">
              We're sorry to see you go. Enter your email to unsubscribe from our mailing list.
            </p>
          </div>

          <form onSubmit={handleUnsubscribe} className="space-y-6">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 border border-white/20"
            >
              {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
              className="text-gray-400 hover:text-emerald-400 transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Never mind, take me back to <span className="font-cursive">AI Sidekick</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
        <div className="text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mr-3"></div>
          Loading...
        </div>
      </div>
    }>
      <UnsubscribeForm />
    </Suspense>
  )
}