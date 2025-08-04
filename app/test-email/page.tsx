"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react"

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [emailType, setEmailType] = useState<'welcome' | 'verification'>('welcome')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const sendTestEmail = async () => {
    if (!email) {
      setResult({ error: 'Please enter an email address' })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test/send-test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: emailType
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ error: data.error || 'Failed to send email' })
      }
    } catch (error) {
      setResult({ error: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Email Template Tester</h1>
          <p className="text-gray-400">Test the new professional email templates</p>
        </div>

        <Card className="backdrop-blur-2xl bg-gray-800/40 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Test Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Your Email Address</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">Email Type</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={emailType === 'welcome' ? 'default' : 'outline'}
                  onClick={() => setEmailType('welcome')}
                  className={emailType === 'welcome' 
                    ? 'bg-emerald-500 hover:bg-emerald-600' 
                    : 'border-gray-600 text-gray-300 hover:bg-white/10'
                  }
                >
                  Welcome Email
                </Button>
                <Button
                  type="button"
                  variant={emailType === 'verification' ? 'default' : 'outline'}
                  onClick={() => setEmailType('verification')}
                  className={emailType === 'verification' 
                    ? 'bg-emerald-500 hover:bg-emerald-600' 
                    : 'border-gray-600 text-gray-300 hover:bg-white/10'
                  }
                >
                  Verification Email
                </Button>
              </div>
            </div>

            <Button
              onClick={sendTestEmail}
              disabled={isLoading || !email}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Send Test Email</span>
                </div>
              )}
            </Button>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20' 
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  )}
                  <div>
                    <p className={result.success ? 'text-emerald-300' : 'text-red-300'}>
                      {result.success ? result.message : result.error}
                    </p>
                    {result.success && (
                      <p className="text-gray-400 text-sm mt-1">
                        Check your spam folder if you don't see it in your inbox
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-white font-semibold mb-2">What's in each email:</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div>
                  <strong className="text-emerald-400">Welcome Email:</strong>
                  <ul className="mt-1 ml-4 list-disc">
                    <li>Professional greeting with business name</li>
                    <li>Feature list (6 growth tools)</li>
                    <li>Pro tip for getting started</li>
                    <li>Clear CTA button</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-emerald-400">Verification Email:</strong>
                  <ul className="mt-1 ml-4 list-disc">
                    <li>Simple verification request</li>
                    <li>One-click verification button</li>
                    <li>Fallback link for email clients</li>
                    <li>24-hour expiry notice</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-gray-500 pt-2">
              <p>Or use the API directly:</p>
              <code className="bg-black/50 px-2 py-1 rounded text-emerald-400">
                /api/test/send-test-email?email=your@email.com&type=welcome
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}