import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    // Enhanced cookie handling with localStorage backup
    get: (name: string) => {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        const cookie = cookies.find(c => c.trim().startsWith(`${name}=`))
        const cookieValue = cookie?.split('=')[1]
        
        // If cookie not found, try localStorage backup
        if (!cookieValue && typeof window !== 'undefined') {
          const backupKey = `sb_backup_${name}`
          return localStorage.getItem(backupKey) || undefined
        }
        
        return cookieValue
      }
      return undefined
    },
    set: (name: string, value: string, options: any) => {
      if (typeof document !== 'undefined') {
        let cookieStr = `${name}=${value}`
        
        // Force 30-day expiry for auth cookies if "remember me" is set
        const rememberMe = localStorage.getItem('rememberMe') === 'true'
        if (name.includes('auth-token') && rememberMe) {
          const expires = new Date()
          expires.setDate(expires.getDate() + 30)
          cookieStr += `; expires=${expires.toUTCString()}`
        } else if (options.maxAge) {
          cookieStr += `; max-age=${options.maxAge}`
        }
        
        // Standard cookie options
        if (options.path) cookieStr += `; path=${options.path}`
        if (options.domain) cookieStr += `; domain=${options.domain}`
        if (options.sameSite) cookieStr += `; samesite=${options.sameSite}`
        if (options.secure) cookieStr += `; secure`
        
        document.cookie = cookieStr
        
        // Store backup in localStorage for cases where cookies are blocked
        if (typeof window !== 'undefined') {
          const backupKey = `sb_backup_${name}`
          try {
            localStorage.setItem(backupKey, value)
          } catch (e) {
            console.warn('localStorage backup failed:', e)
          }
        }
      }
    },
    remove: (name: string, options: any) => {
      if (typeof document !== 'undefined') {
        let cookieStr = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`
        if (options.path) cookieStr += `; path=${options.path}`
        if (options.domain) cookieStr += `; domain=${options.domain}`
        document.cookie = cookieStr
        
        // Remove localStorage backup too
        if (typeof window !== 'undefined') {
          const backupKey = `sb_backup_${name}`
          try {
            localStorage.removeItem(backupKey)
          } catch (e) {
            console.warn('localStorage backup removal failed:', e)
          }
        }
      }
    }
  }
})

// Set up auth state change listener for proper session rehydration
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event, session?.user?.email)
    
    // Store session info in localStorage for rehydration
    if (session) {
      try {
        localStorage.setItem('sb_session_user', JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          timestamp: Date.now()
        }))
      } catch (e) {
        console.warn('Session backup failed:', e)
      }
    } else {
      // Clear session backup on logout
      try {
        localStorage.removeItem('sb_session_user')
        // Clear all sb backup keys
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb_backup_')) {
            localStorage.removeItem(key)
          }
        })
      } catch (e) {
        console.warn('Session cleanup failed:', e)
      }
    }
  })
}