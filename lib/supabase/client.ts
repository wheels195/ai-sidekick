import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    // Set cookie options for 30-day persistence
    get: (name: string) => {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        const cookie = cookies.find(c => c.trim().startsWith(`${name}=`))
        return cookie?.split('=')[1]
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
        
        if (options.path) cookieStr += `; path=${options.path}`
        if (options.domain) cookieStr += `; domain=${options.domain}`
        if (options.sameSite) cookieStr += `; samesite=${options.sameSite}`
        if (options.secure) cookieStr += `; secure`
        
        document.cookie = cookieStr
      }
    },
    remove: (name: string, options: any) => {
      if (typeof document !== 'undefined') {
        let cookieStr = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`
        if (options.path) cookieStr += `; path=${options.path}`
        if (options.domain) cookieStr += `; domain=${options.domain}`
        document.cookie = cookieStr
      }
    }
  }
})