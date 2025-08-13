"use client"

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
          // Redirect to complete profile after 3 seconds
          const redirectUrl = data.redirectTo || `/signup/complete?email=${encodeURIComponent(data.email || '')}&verified=true`
          setTimeout(() => {
            router.push(redirectUrl)
          }, 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.2),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.2),transparent_50%)]"></div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
          <CardContent className="p-8 text-center">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Verifying your email...</h1>
                <p className="text-gray-300">Please wait while we confirm your email address.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
                <p className="text-gray-300 mb-6">{message}</p>
                <p className="text-sm text-gray-400 mb-6">
                  Redirecting you to complete your profile in 3 seconds...
                </p>
                <Button 
                  onClick={() => {
                    const urlParams = new URLSearchParams(window.location.search)
                    const token = urlParams.get('token')
                    router.push(`/signup/complete?verified=true`)
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white"
                >
                  Continue to Profile Setup
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="space-y-3">
                  <Button 
                    onClick={() => router.push('/signup')}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white"
                  >
                    Try Signing Up Again
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => router.push('/')}
                    className="w-full text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}