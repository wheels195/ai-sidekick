import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/server'


interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  businessName: string
  trade: string
  selectedPlan: string
  location: string
  zipCode: string
  services: string[]
  teamSize: number
  targetCustomers: string
  yearsInBusiness: number
  businessPriorities: string[]
  tokensUsedTrial: number
  trialTokenLimit: number
  hasConversationHistory: boolean
}

export async function getServerUserProfile(): Promise<UserProfile | null> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Get the current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }

    // Fetch user profile from database
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, business_name, trade, selected_plan, created_at, location, zip_code, services, team_size, target_customers, years_in_business, business_priorities, tokens_used_trial, trial_token_limit, trial_started_at, trial_expires_at')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      // If OAuth user has no profile, create a basic one
      if (user && !profile) {
        console.log('🔧 Creating basic profile for OAuth user server-side:', user.email)
        const now = new Date()
        const trialExpiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 days
        
        try {
          const { data: newProfile } = await createServiceClient()
            .from('user_profiles')
            .insert({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || 'User',
              last_name: user.user_metadata?.last_name || '',
              business_name: 'My Business',
              selected_plan: 'Free Trial',
              user_role: user.email === 'admin@ai-sidekick.io' ? 'admin' : 'user',
              tokens_used_trial: 0,
              trial_token_limit: 250000,
              trial_started_at: now.toISOString(),
              trial_expires_at: trialExpiresAt.toISOString(),
              created_at: now.toISOString()
            })
            .select('*')
            .single()
          
          if (newProfile) {
            console.log('✅ Basic profile created server-side')
            // Return the newly created profile data
            return {
              id: newProfile.id,
              firstName: newProfile.first_name || '',
              lastName: newProfile.last_name || '',
              email: newProfile.email,
              businessName: newProfile.business_name || 'Your Business',
              trade: newProfile.trade || 'landscaping',
              selectedPlan: newProfile.selected_plan || '',
              location: newProfile.location || '',
              zipCode: newProfile.zip_code || '',
              services: newProfile.services || [],
              teamSize: newProfile.team_size || 0,
              targetCustomers: newProfile.target_customers || '',
              yearsInBusiness: newProfile.years_in_business || 0,
              businessPriorities: newProfile.business_priorities || [],
              tokensUsedTrial: newProfile.tokens_used_trial || 0,
              trialTokenLimit: newProfile.trial_token_limit || 250000,
              hasConversationHistory: false
            }
          }
        } catch (createError) {
          console.error('Failed to create profile server-side:', createError)
        }
      }
      return null
    }

    // Check if user has any previous conversations
    const { data: conversations, error: convError } = await supabase
      .from('user_conversations')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    const hasConversationHistory = conversations && conversations.length > 0

    return {
      id: profile.id,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      email: profile.email,
      businessName: profile.business_name || 'Your Business',
      trade: profile.trade || 'landscaping',
      selectedPlan: profile.selected_plan || '',
      location: profile.location || '',
      zipCode: profile.zip_code || '',
      services: profile.services || [],
      teamSize: profile.team_size || 0,
      targetCustomers: profile.target_customers || '',
      yearsInBusiness: profile.years_in_business || 0,
      businessPriorities: profile.business_priorities || [],
      tokensUsedTrial: profile.tokens_used_trial || 0,
      trialTokenLimit: profile.trial_token_limit || 250000,
      hasConversationHistory: hasConversationHistory
    }

  } catch (error) {
    console.error('Server-side user profile fetch error:', error)
    return null
  }
}