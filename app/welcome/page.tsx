'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, CheckCircle, TreePine } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()

  useEffect(() => {
    // Track successful signup with Meta Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'CompleteRegistration', {
        status: 'free_trial',
        value: 0.00,
        currency: 'USD'
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
      <div className="text-center space-y-8 p-8 max-w-2xl">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white">Congratulations!</h1>
          
          <p className="text-2xl text-gray-300">
            You've successfully completed your profile and activated your free trial.
          </p>
          
          <p className="text-lg text-gray-400">
            Your 7-day free trial includes 250,000 AI tokens to help grow your landscaping business.
          </p>
        </div>
        
        <div className="pt-4">
          <button
            onClick={() => router.push('/landscaping')}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <TreePine className="w-5 h-5 mr-2" />
            Get Started with Landscaping AI
            <Sparkles className="w-5 h-5 ml-2 animate-pulse" />
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Click the button above to start using AI Sidekick for your landscaping business
        </p>
      </div>
    </div>
  )
}