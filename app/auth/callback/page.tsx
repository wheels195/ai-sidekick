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
        
        // Check all localStorage keys and log their values
        const storageKeys = Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('sb-'))
        console.log('Supabase localStorage keys:', storageKeys)
        
        // Log all localStorage values to find the exact verifier key
        storageKeys.forEach(key => {
          const value = localStorage.getItem(key)
          console.log(`localStorage[${key}]:`, value ? value.substring(0, 50) + '...' : 'null')
        })
        
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
        
        if (!code) {
          setError('No OAuth code received')
          setStatus('error')
          setTimeout(() => router.push('/login?error=no_code'), 2000)
          return
        }
        
        // Get the PKCE code verifier from localStorage - try all possible locations
        console.log('=== SEARCHING FOR CODE VERIFIER ===')
        
        // Check all localStorage keys to find where the verifier might be stored
        const allKeys = Object.keys(localStorage)
        console.log('All localStorage keys:', allKeys)
        
        // Try multiple possible verifier locations
        let codeVerifier = localStorage.getItem('sb-tgrwtbtyfznebqrwenji-auth-token-code-verifier') || 
                          localStorage.getItem('supabase.auth.verifier') ||
                          localStorage.getItem('supabase.auth.code_verifier') ||
                          localStorage.getItem('sb-code-verifier')
        
        // If not found, check if it might be inside the auth token object
        if (!codeVerifier) {
          const authToken = localStorage.getItem('sb-tgrwtbtyfznebqrwenji-auth-token')
          if (authToken) {
            try {
              const tokenData = JSON.parse(authToken)
              console.log('Auth token object keys:', Object.keys(tokenData))
              codeVerifier = tokenData.code_verifier || tokenData.codeVerifier || tokenData.verifier
            } catch (e) {
              console.error('Failed to parse auth token:', e)
            }
          }
        }
        
        console.log('Code verifier found:', codeVerifier ? 'YES' : 'NO')
        console.log('Code verifier source:', codeVerifier ? 'Found in storage' : 'NOT FOUND')
        
        if (!codeVerifier) {
          console.error('No PKCE code verifier found, falling back to client-side exchange...')
          
          try {
            // Try client-side exchange as fallback
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)
            
            if (error) {
              console.error('Client-side exchange failed:', error)
              setError('Authentication failed')
              setStatus('error')
              setTimeout(() => router.push('/login?error=exchange_failed'), 2000)
              return
            }
            
            if (data.session) {
              console.log('Client-side exchange successful, making server request to set cookies...')
              
              // Make a server request to ensure cookies are set
              try {
                const response = await fetch('/api/auth/verify-session', {
                  method: 'POST',
                  credentials: 'include'
                })
                const result = await response.json()
                console.log('Server session verification after client exchange:', result)
              } catch (e) {
                console.error('Failed to verify server session:', e)
              }
              
              // Check profile and redirect
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', data.session.user.id)
                .single()

              setStatus('success')
              
              if (!profile) {
                router.push(`/signup/complete?email=${data.session.user.email}`)
              } else {
                router.push(redirect)
              }
              return
            }
          } catch (error) {
            console.error('Fallback exchange failed:', error)
            setError('Authentication setup error')
            setStatus('error')
            setTimeout(() => router.push('/login?error=no_verifier'), 2000)
            return
          }
        }
        
        // Redirect to server-side handler with code verifier
        console.log('Redirecting to server-side callback with code verifier...')
        
        const serverCallbackUrl = `/api/auth/callback?code=${code}&redirect=${encodeURIComponent(redirect)}&codeVerifier=${encodeURIComponent(codeVerifier)}`
        window.location.href = serverCallbackUrl
        return
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