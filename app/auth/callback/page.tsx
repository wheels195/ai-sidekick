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
        
        // Detailed debugging for PKCE flow
        console.log('=== DEBUGGING OAUTH CALLBACK ===')
        console.log('URL search params:', window.location.search)
        console.log('URL hash:', window.location.hash)
        
        // Check localStorage for PKCE verifier
        const pkceVerifier = localStorage.getItem('supabase.auth.verifier') || localStorage.getItem('sb-tgrwtbtyfznebqrwenji-auth-token')
        console.log('PKCE verifier in localStorage:', pkceVerifier ? 'EXISTS' : 'MISSING')
        
        // Check all localStorage keys
        const storageKeys = Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('sb-'))
        console.log('Supabase localStorage keys:', storageKeys)
        
        // Get URL params
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error_param = urlParams.get('error')
        
        console.log('OAuth code received:', code ? code.substring(0, 10) + '...' : 'NONE')
        console.log('OAuth error:', error_param || 'NONE')
        
        if (error_param) {
          setError(error_param)
          setStatus('error')
          setTimeout(() => router.push('/login?error=oauth_error'), 2000)
          return
        }

        // Manual exchange using the code verifier we found in localStorage
        console.log('Performing manual exchange with found verifier...')
        
        if (!code) {
          setError('No OAuth code received')
          setStatus('error')
          setTimeout(() => router.push('/login?error=no_code'), 2000)
          return
        }
        
        // Get the code verifier from localStorage (we confirmed it exists)
        const codeVerifier = localStorage.getItem('sb-tgrwtbtyfznebqrwenji-auth-token-code-verifier') || 
                            localStorage.getItem('supabase.auth.verifier') ||
                            localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token-code-verifier')
        
        console.log('Code verifier found:', codeVerifier ? 'YES' : 'NO')
        
        if (!codeVerifier) {
          setError('Code verifier missing from localStorage')
          setStatus('error')
          setTimeout(() => router.push('/login?error=no_verifier'), 2000)
          return
        }
        
        const { data, error } = await supabase.auth.exchangeCodeForSession({
          authCode: code,
          codeVerifier: codeVerifier
        })
        
        console.log('Exchange result:', { 
          hasSession: !!data.session, 
          error: error?.message,
          user: data.session?.user?.email 
        })
        
        if (error) {
          console.error('OAuth session error:', error)
          setError(error.message)
          setStatus('error')
          setTimeout(() => router.push('/login?error=exchange_failed'), 2000)
          return
        }
        
        const sessionData = data
        
        // Handle final result
        if (sessionData?.session) {
          console.log('=== SUCCESS: Session established ===')
          console.log('User:', sessionData.session.user.email)
          
          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile check error:', profileError)
          }

          setStatus('success')
          
          // Immediate redirect
          if (!profile) {
            console.log('No profile found, redirecting to profile completion')
            setTimeout(() => {
              window.location.href = `/signup/complete?email=${sessionData.session.user.email}`
            }, 100)
          } else {
            console.log('Profile found, doing immediate redirect to:', redirect)
            setTimeout(() => {
              window.location.href = redirect
            }, 100)
          }
        } else {
          console.log('=== FAILURE: No session after all attempts ===')
          setError('Could not establish session')
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