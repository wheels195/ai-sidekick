"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Create a simple client for this callback only
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  
  // Mobile detection for longer timeouts
  const isMobile = () => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      const mobile = isMobile()
      const retryTimeout = mobile ? 8000 : 2000 // 8s for mobile, 2s for desktop
      
      try {
        console.log('=== ENHANCED OAUTH CALLBACK ===')
        console.log('Device type:', mobile ? 'MOBILE' : 'DESKTOP')
        console.log('User agent:', navigator.userAgent)
        console.log('Current URL:', window.location.href)
        console.log('Search params:', Object.fromEntries(searchParams.entries()))
        
        // Get the redirect parameter
        const redirect = searchParams.get('redirect') || '/landscaping'
        console.log('Intended redirect:', redirect)
        
        // Let Supabase handle the URL automatically
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setError(error.message)
          setStatus('error')
          setTimeout(() => router.push('/login?error=session_error'), 2000)
          return
        }
        
        if (data.session) {
          console.log('Session found:', data.session.user.email)
          
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          setStatus('success')
          
          // Force page reload to ensure session cookies are set
          if (!profile) {
            window.location.href = `/signup/complete?email=${data.session.user.email}`
          } else {
            window.location.href = redirect
          }
          return
        }
        
        // No session yet, wait and try again with device-specific timeout
        console.log(`No session found, waiting ${retryTimeout}ms for Supabase to process...`)
        console.log('This is normal on mobile devices due to slower OAuth processing')
        
        setTimeout(async () => {
          console.log('Attempting retry after timeout...')
          const { data: retryData, error: retryError } = await supabase.auth.getSession()
          
          if (retryError || !retryData.session) {
            console.error('=== RETRY FAILED ===')
            console.error('Retry error:', retryError)
            console.error('Device type:', mobile ? 'MOBILE' : 'DESKTOP')
            console.error('Timeout used:', retryTimeout)
            console.error('Current URL state:', window.location.href)
            
            const errorMsg = mobile 
              ? 'Mobile authentication timed out. Please try again or use email login.'
              : 'Authentication failed. Please try again.'
            
            setError(errorMsg)
            setStatus('error')
            
            // Longer delay before redirect on mobile for user to read error
            const redirectDelay = mobile ? 5000 : 2000
            setTimeout(() => router.push('/login?error=auth_failed&mobile=' + mobile), redirectDelay)
            return
          }
          
          console.log('=== RETRY SUCCESSFUL ===')
          console.log('Retry successful for user:', retryData.session.user.email)
          console.log('Device type:', mobile ? 'MOBILE' : 'DESKTOP')
          
          // Check profile and redirect
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', retryData.session.user.id)
            .single()

          setStatus('success')
          
          if (!profile) {
            console.log('No profile found, redirecting to signup completion')
            window.location.href = `/signup/complete?email=${retryData.session.user.email}`
          } else {
            console.log('Profile found, redirecting to:', redirect)
            window.location.href = redirect
          }
        }, retryTimeout)
        
      } catch (error) {
        console.error('Auth callback error:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
        setStatus('error')
        setTimeout(() => router.push('/login?error=callback_failed'), 2000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center">
      <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Completing Sign In</h2>
            <p className="text-gray-300">
              {isMobile() 
                ? "Mobile authentication may take a few extra seconds. Please wait..." 
                : "Please wait while we finish setting up your account..."
              }
            </p>
            {isMobile() && (
              <p className="text-emerald-400 text-sm mt-2">
                ⏱️ Mobile devices need extra time for secure authentication
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