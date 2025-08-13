'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function CheckEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResendEmail = async () => {
    if (!email) return
    
    setResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (response.ok) {
        setResent(true)
        setTimeout(() => setResent(false), 5000)
      }
    } catch (error) {
      console.error('Failed to resend email:', error)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-white" />
              </div>
              
              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
                <p className="text-gray-300">
                  We've sent a verification link to:
                </p>
                <p className="text-emerald-400 font-medium mt-1">
                  {email || 'your email address'}
                </p>
              </div>
              
              {/* Instructions */}
              <div className="bg-black/20 rounded-lg p-4 text-left space-y-2">
                <p className="text-sm text-gray-300">
                  <span className="text-white font-medium">Next steps:</span>
                </p>
                <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Open your email inbox</li>
                  <li>Find the email from AI Sidekick</li>
                  <li>Click the verification link</li>
                  <li>Complete your business profile</li>
                </ol>
              </div>
              
              {/* Resend Button */}
              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={resending || !email}
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  {resending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Resending...</span>
                    </div>
                  ) : resent ? (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Email resent!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>Resend verification email</span>
                    </div>
                  )}
                </Button>
                
                <Button
                  onClick={() => router.push('/login')}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Button>
              </div>
              
              {/* Help text */}
              <p className="text-xs text-gray-500">
                Can't find the email? Check your spam folder or click resend above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}