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
        console.log('Auth callback page - handling OAuth callback')
        console.log('Current URL:', window.location.href)
        
        // Get the redirect parameter
        const redirect = searchParams.get('redirect') || '/landscaping'
        
        // Handle the OAuth callback - let Supabase automatically process the URL
        // This will detect and process any auth tokens/codes in the URL
        const { data, error } = await supabase.auth.getSession()
        
        console.log('Session retrieval result:', { hasSession: !!data.session, error: error?.message })
        
        // If no session yet, wait a moment and try again
        if (!data.session && !error) {
          console.log('No session yet, waiting for Supabase to process callback...')
          await new Promise(resolve => setTimeout(resolve, 1000))
          const { data: retryData, error: retryError } = await supabase.auth.getSession()
          console.log('Retry session result:', { hasSession: !!retryData.session, error: retryError?.message })
          
          if (retryError) {
            setError(retryError.message)
            setStatus('error')
            setTimeout(() => router.push('/login?error=auth_retry_failed'), 2000)
            return
          }
          
          if (retryData.session) {
            data.session = retryData.session
          }
        }
        
        if (error) {
          console.error('Session retrieval error:', error)
          setError(error.message)
          setStatus('error')
          setTimeout(() => router.push('/login?error=auth_callback_failed'), 2000)
          return
        }

        if (data.session) {
          console.log('Session found, checking user profile')
          
          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile check error:', profileError)
          }

          setStatus('success')
          
          // Redirect based on profile existence
          if (!profile) {
            console.log('No profile found, redirecting to profile completion')
            router.push(`/signup/complete?email=${data.session.user.email}`)
          } else {
            console.log('Profile found, redirecting to:', redirect)
            router.push(redirect)
          }
        } else {
          console.log('No session found after callback')
          setError('No session found')
          setStatus('error')
          setTimeout(() => router.push('/login?error=no_session'), 2000)
        }
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
            <p className="text-gray-300">Please wait while we finish setting up your account...</p>
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