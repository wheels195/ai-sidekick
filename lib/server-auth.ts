import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET!
    const decoded = jwt.verify(token, jwtSecret) as { userId: string, email: string }

    // Fetch user profile from database
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, email, business_name, trade, selected_plan, created_at, location, zip_code, services, team_size, target_customers, years_in_business, business_priorities, tokens_used_trial, trial_token_limit, trial_started_at, trial_expires_at')
      .eq('id', decoded.userId)
      .single()

    if (error || !profile) {
      return null
    }

    // Check if user has any previous conversations
    const { data: conversations, error: convError } = await supabase
      .from('user_conversations')
      .select('id')
      .eq('user_id', decoded.userId)
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