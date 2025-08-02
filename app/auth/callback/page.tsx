"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('=== HYBRID OAUTH CALLBACK ===')
        console.log('Current URL:', window.location.href)
        console.log('Search params:', Object.fromEntries(searchParams.entries()))
        
        // Get the redirect parameter
        const redirect = searchParams.get('redirect') || '/landscaping'
        console.log('Intended redirect:', redirect)
        
        // Method 1: Let Supabase auto-detect and handle session from URL (PKCE compatible)
        console.log('Attempting Method 1: Auto-detection via getSession()')
        let session = null
        let sessionError = null
        
        // Wait a moment for auto-detection to process
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: sessionData, error: getSessionError } = await supabase.auth.getSession()
        
        if (getSessionError) {
          console.warn('Method 1 error:', getSessionError)
          sessionError = getSessionError
        } else if (sessionData.session) {
          console.log('Method 1 SUCCESS: Auto-detection found session:', sessionData.session.user.email)
          session = sessionData.session
        }
        
        // Method 2: Manual session extraction from URL (PKCE compatible)
        if (!session) {
          console.log('Attempting Method 2: Manual getSessionFromUrl()')
          const { data: urlData, error: urlError } = await supabase.auth.getSessionFromUrl()
          
          if (urlError) {
            console.warn('Method 2 error:', urlError)
            sessionError = urlError
          } else if (urlData.session) {
            console.log('Method 2 SUCCESS: Manual extraction found session:', urlData.session.user.email)
            session = urlData.session
          }
        }
        
        // Method 3: Server-side fallback (for non-PKCE or edge cases)
        if (!session) {
          console.log('Attempting Method 3: Server-side fallback')
          const code = searchParams.get('code')
          
          if (code) {
            try {
              const response = await fetch(`/api/auth/callback?${searchParams.toString()}`)
              if (response.ok && response.redirected) {
                console.log('Method 3 SUCCESS: Server-side callback handled it')
                window.location.href = response.url
                return
              } else {
                console.warn('Method 3 failed: Server callback unsuccessful')
              }
            } catch (serverError) {
              console.warn('Method 3 error:', serverError)
            }
          }
        }
        
        // Success path
        if (session) {
          console.log('OAuth success with session:', session.user.email)
          
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setStatus('success')
          
          // Redirect to appropriate page
          if (!profile) {
            console.log('No profile, redirecting to signup completion')
            window.location.href = `/signup/complete?email=${session.user.email}`
          } else {
            console.log('Profile found, redirecting to:', redirect)
            window.location.href = redirect
          }
          return
        }
        
        // All methods failed
        console.error('All OAuth methods failed')
        console.error('Last error:', sessionError?.message || 'Unknown error')
        
        // Mobile-specific retry logic
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        const currentAttempts = attempts + 1
        setAttempts(currentAttempts)
        
        if (isMobile && currentAttempts < 3) {
          console.log(`Mobile retry attempt ${currentAttempts}/3`)
          setError(`Retrying authentication (${currentAttempts}/3)...`)
          setTimeout(() => handleAuthCallback(), 2000)
          return
        }
        
        // Final failure
        setError(sessionError?.message || 'Authentication failed. Please try again.')
        setStatus('error')
        
        // Clear any invalid session
        try {
          await supabase.auth.signOut()
        } catch (e) {
          console.warn('Failed to clear session:', e)
        }
        
        setTimeout(() => {
          router.push(`/login?error=oauth_error&from=callback&message=${encodeURIComponent(sessionError?.message || 'OAuth failed')}`)
        }, 3000)
        
      } catch (error) {
        console.error('Auth callback exception:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
        setStatus('error')
        
        try {
          await supabase.auth.signOut()
        } catch (e) {
          console.warn('Failed to clear session:', e)
        }
        
        setTimeout(() => router.push('/login?error=callback_exception&from=callback'), 3000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams, attempts])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
      <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Completing Sign In</h2>
            <p className="text-gray-300">
              {attempts > 0 
                ? `Retrying authentication... (${attempts}/3)`
                : 'Processing your Google authentication...'
              }
            </p>
            {attempts > 0 && (
              <p className="text-emerald-400 text-sm mt-2">
                Mobile devices may need extra time for secure authentication
              </p>
            )}
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Sign In Successful</h2>
            <p className="text-gray-300">Redirecting you now...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✗</span>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Sign In Failed</h2>
            <p className="text-gray-300 mb-4">{error || 'An error occurred during sign in'}</p>
            <p className="text-sm text-gray-400">Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}