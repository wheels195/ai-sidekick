"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('=== CLIENT OAUTH CALLBACK ===')
        console.log('Current URL:', window.location.href)
        console.log('Search params:', Object.fromEntries(searchParams.entries()))
        
        // Get the redirect parameter
        const redirect = searchParams.get('redirect') || '/landscaping'
        console.log('Intended redirect:', redirect)
        
        // Use Supabase's built-in method to handle OAuth callback with PKCE
        const { data, error } = await supabase.auth.getSessionFromUrl()
        
        if (error) {
          console.error('OAuth callback error:', error)
          setError(error.message)
          setStatus('error')
          
          // Clear any invalid session before redirecting
          try {
            await supabase.auth.signOut()
          } catch (e) {
            console.warn('Failed to clear invalid session:', e)
          }
          
          setTimeout(() => router.push(`/login?error=oauth_error&message=${encodeURIComponent(error.message)}`), 3000)
          return
        }
        
        if (data.session) {
          console.log('OAuth success:', data.session.user.email)
          
          // Check if user has a profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          setStatus('success')
          
          // Redirect to appropriate page
          if (!profile) {
            console.log('No profile, redirecting to signup completion')
            window.location.href = `/signup/complete?email=${data.session.user.email}`
          } else {
            console.log('Profile found, redirecting to:', redirect)
            window.location.href = redirect
          }
          return
        }
        
        // If no session from URL, try getting current session
        const { data: currentSession } = await supabase.auth.getSession()
        if (currentSession.session) {
          console.log('Found existing session:', currentSession.session.user.email)
          setStatus('success')
          window.location.href = redirect
          return
        }
        
        // No session found
        console.error('No session found after OAuth callback')
        setError('Authentication failed. No session was created.')
        setStatus('error')
        
        // Clear any invalid session before redirecting
        try {
          await supabase.auth.signOut()
        } catch (e) {
          console.warn('Failed to clear invalid session:', e)
        }
        
        setTimeout(() => router.push('/login?error=no_session'), 3000)
        
      } catch (error) {
        console.error('Auth callback exception:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
        setStatus('error')
        
        // Clear any invalid session before redirecting
        try {
          await supabase.auth.signOut()
        } catch (e) {
          console.warn('Failed to clear invalid session:', e)
        }
        
        setTimeout(() => router.push('/login?error=callback_exception'), 3000)
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
              Processing your Google authentication...
            </p>
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